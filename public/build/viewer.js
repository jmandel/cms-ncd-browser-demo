// src/viewer.ts
var state = {
  model: null,
  selectedFamilyId: "pap-therapy"
};
var app = document.querySelector("#app");
if (!app) {
  throw new Error("Missing #app root");
}
function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function formatDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function list(value) {
  return Array.isArray(value) ? value : [];
}
async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return await response.json();
}
async function fetchModel() {
  return await fetchJson(new URL("../data/model.json", import.meta.url).toString());
}
function sourceMap(model) {
  return new Map(model.sourceDocuments.map((source) => [source.id, source]));
}
function sourceDisplayMap(model) {
  return new Map(model.sourceDocuments.map((source) => [source.displayId, source]));
}
function familyMap(model) {
  return new Map(model.policyFamilies.map((family) => [family.id, family]));
}
function layeringMap(model) {
  return new Map(model.layeringModels.map((item) => [item.familyId, item]));
}
function codeCatalogMap(model) {
  return new Map(model.codeCatalog.families.map((item) => [item.familyId, item]));
}
function ruleMetamodel(model) {
  return model.ruleMetamodel ?? null;
}
function requirementMap(model) {
  return new Map(list(ruleMetamodel(model)?.requirementCatalog).map((item) => [item.id, item]));
}
function groupMap(model) {
  return new Map(list(ruleMetamodel(model)?.requirementGroups).map((item) => [item.id, item]));
}
function familyDeltaMap(model) {
  return new Map(list(ruleMetamodel(model)?.familyDeltaSummaries).map((item) => [item.familyId, item]));
}
function treatmentIdForFamilyId(familyId) {
  return familyId === "pap-therapy" ? "cpap" : familyId;
}
function treatmentModelMap(model) {
  return new Map(list(model.treatmentModels).map((treatment) => [treatment.id, treatment]));
}
function currentFamily(model) {
  return familyMap(model).get(state.selectedFamilyId) ?? model.policyFamilies[0];
}
function currentCodeCatalog(model) {
  return codeCatalogMap(model).get(state.selectedFamilyId) ?? null;
}
function currentTreatmentModel(model) {
  return treatmentModelMap(model).get(treatmentIdForFamilyId(state.selectedFamilyId)) ?? null;
}
function toneClass(tone) {
  return `tone-${tone}`;
}
function sourceLinks(model, sourceIds) {
  const byId = sourceMap(model);
  return sourceIds.map((id) => {
    const source = byId.get(id);
    if (!source) {
      return "";
    }
    return `
        <a class="source-chip" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">
          <span>${escapeHtml(source.displayId)}</span>
          <small>${escapeHtml(source.type)}</small>
        </a>
      `;
  }).join("");
}
function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function formatAhiWindow(eligibility, treatmentId) {
  if (treatmentId === "sleep-testing") {
    return "Diagnostic only";
  }
  if (eligibility.ahiMin != null && eligibility.ahiMax != null) {
    return `${eligibility.ahiMin}-${eligibility.ahiMax}`;
  }
  if (eligibility.ahiMin != null) {
    return `>= ${eligibility.ahiMin}`;
  }
  return "Not fixed";
}
function formatAgeWindow(eligibility, treatmentId) {
  if (eligibility.ageMin != null) {
    return `>= ${eligibility.ageMin}`;
  }
  if (treatmentId === "cpap") {
    return "Adult";
  }
  return "Not fixed";
}
function formatBmiWindow(eligibility) {
  if (eligibility.bmiMax != null) {
    return `< ${eligibility.bmiMax}`;
  }
  return "No ceiling";
}
function formatStepRequirement(treatment) {
  if (treatment.id === "cpap") {
    return "First-line";
  }
  if (treatment.id === "oral-appliance") {
    return "Conditional";
  }
  return treatment.eligibility.requiresCpapFailure ? "Required" : "Not required";
}
function docChip(model, displayId, label = displayId, variant = "neutral", title) {
  const source = sourceDisplayMap(model).get(displayId);
  const className = `mini-doc-chip is-${variant}`;
  if (source) {
    return `<a class="${className}" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer" title="${escapeHtml(title ?? source.title)}">${escapeHtml(label)}</a>`;
  }
  return `<span class="${className}" title="${escapeHtml(title ?? label)}">${escapeHtml(label)}</span>`;
}
function noteChip(label, variant = "neutral", title) {
  return `<span class="mini-doc-chip is-${variant}"${title ? ` title="${escapeHtml(title)}"` : ""}>${escapeHtml(label)}</span>`;
}
function relationVariant(relation) {
  if (relation === "baseline")
    return "neutral";
  if (relation === "reuses")
    return "teal";
  if (relation === "narrows")
    return "amber";
  if (relation === "operationalizes")
    return "blue";
  if (relation === "adds")
    return "plum";
  if (relation === "differs")
    return "rose";
  if (relation === "governs")
    return "ink";
  if (relation === "codes")
    return "ink";
  return "neutral";
}
function relationChip(label, relation, title) {
  return noteChip(label, relationVariant(relation), title);
}
function basisChip(model, ref) {
  const displayLabel = ref.variant === "ncd" && !ref.label.startsWith("NCD ") ? `NCD ${ref.label}` : ref.variant === "lcd" && !ref.label.startsWith("LCD ") ? `LCD ${ref.label}` : ref.label;
  if (ref.displayId) {
    return docChip(model, ref.displayId, displayLabel, ref.variant, ref.title);
  }
  return noteChip(displayLabel, ref.variant, ref.title);
}
function renderHero(model) {
  return `
    <section class="hero panel">
      <div class="hero-copy">
        <div class="eyebrow">Interactive Tutorial</div>
        <h1>How Medicare Coverage Policy Gets Structured</h1>
        <p class="hero-subtitle">This tutorial uses obstructive sleep apnea as a concrete example. The goal is to show, in plain language, how national coverage policy, local contractor policy, and billing guidance fit together and how those public documents can be turned into structured data.</p>
        <p class="hero-note">You do not need prior CMS or billing expertise to read this page. Start with the glossary and the key ideas below, then move into the national baseline, local policy branches, and contractor-level comparison views.</p>
      </div>

      <aside class="hero-guide">
        <div class="eyebrow">Start Here</div>
        <h2>Read this as a guided tour</h2>
        <div class="typed-list hero-guide-list">
          <div class="typed-list-item"><strong>First:</strong> learn the small set of CMS terms that matter.</div>
          <div class="typed-list-item"><strong>Then:</strong> see what the national OSA policy already says before local policy enters the picture.</div>
          <div class="typed-list-item"><strong>Next:</strong> watch how LCDs reuse, narrow, or replace that baseline for specific therapies.</div>
          <div class="typed-list-item"><strong>Finally:</strong> see where coding articles and contractor differences become computable.</div>
        </div>
      </aside>
    </section>
  `;
}
function renderStat(label, value, note) {
  return `
    <div class="stat-card">
      <div class="stat-value">${escapeHtml(value)}</div>
      <div class="stat-label">${escapeHtml(label)}</div>
      <div class="stat-note">${escapeHtml(note)}</div>
    </div>
  `;
}
function renderChapterIntro(step, eyebrow, title, copy) {
  return `
    <section class="panel chapter-panel">
      <div class="chapter-topline">
        <span class="chapter-step">Step ${step}</span>
        <span class="chapter-eyebrow">${escapeHtml(eyebrow)}</span>
      </div>
      <h2 class="chapter-title">${escapeHtml(title)}</h2>
      <p class="chapter-copy">${escapeHtml(copy)}</p>
    </section>
  `;
}
function renderMethodology(model) {
  const rules = ruleMetamodel(model);
  if (!rules) {
    return "";
  }
  const sourceCount = model.sourceDocuments.length;
  const responseCount = model.sourceDocuments.filter((source) => source.title.startsWith("Response to Comments")).length;
  const articleCount = model.sourceDocuments.filter((source) => source.type === "Article" && !source.title.startsWith("Response to Comments")).length;
  const ncdCount = model.sourceDocuments.filter((source) => source.type === "NCD").length;
  const lcdCount = model.sourceDocuments.filter((source) => source.type === "LCD").length;
  const modeledDocs = rules.coverageAudit?.modeledDocuments ?? rules.documentProfiles.length;
  const totalDocs = rules.coverageAudit?.totalCuratedDocuments ?? model.sourceDocuments.length;
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">What Was Curated</div>
          <h2>This Tutorial Demonstrates A Target Shape For Automation</h2>
          <p class="section-copy">The point is not that OSA should be hand-entered forever. The point is that public CMS documents already expose enough regularity for AI agents to recover high-value structure: indications, thresholds, exclusions, provider roles, coding layers, document lineage, and policy lifecycle context.</p>
        </div>
      </div>

      <div class="hero-stats tutorial-stats">
        ${renderStat("CMS docs reviewed", String(totalDocs), "public source records in scope")}
        ${renderStat("Docs modeled", `${modeledDocs}/${totalDocs}`, "documents decomposed into rule packs")}
        ${renderStat("Requirement entities", String(rules.requirementCatalog.length), "canonical reusable policy concepts")}
        ${renderStat("Rule packs", String(rules.documentProfiles.length), "structured document extracts")}
      </div>

      <div class="tutorial-grid tutorial-grid-3">
        <article class="tutorial-card">
          <div class="eyebrow">Source Material</div>
          <h3>What Was Reviewed</h3>
          <p>${sourceCount} public CMS records were reviewed: ${ncdCount} NCDs, ${lcdCount} LCDs, ${articleCount} companion articles, and ${responseCount} response-to-comments records. This is the public policy stack a clinician or informaticist can already inspect today.</p>
        </article>
        <article class="tutorial-card">
          <div class="eyebrow">Structured Output</div>
          <h3>What The Tutorial Makes Computable</h3>
          <p>${rules.requirementCatalog.length} canonical requirements and ${rules.documentProfiles.length} document rule packs now let the app compare OSA policies without reading each document side by side by hand.</p>
        </article>
        <article class="tutorial-card">
          <div class="eyebrow">Automation Potential</div>
          <h3>What AI Agents Can Help Extract Today</h3>
          <p>Good extraction today can recover thresholds, exclusions, provider roles, code tables, related-document topology, and cross-document deltas. Manual review is still useful where wording conflicts, legacy variants, or revision histories need adjudication.</p>
        </article>
      </div>
    </section>
  `;
}
function renderTutorialOrientation() {
  const ideas = [
    {
      eyebrow: "Key Idea 1",
      title: "One disease can have multiple policy layers",
      body: "OSA is not governed by one document. National policy defines a baseline, while local contractor policies add therapy-specific branches, workflow gates, and exclusions."
    },
    {
      eyebrow: "Key Idea 2",
      title: "Different CMS pages do different jobs",
      body: "Some pages define clinical coverage, some operationalize it, and some translate it into billing and coding instructions. The tutorial separates those roles instead of blending them together."
    },
    {
      eyebrow: "Key Idea 3",
      title: "Structure is what makes comparison easy",
      body: "Once thresholds, exclusions, provider requirements, and code tables are normalized into the same vocabulary, differences stop being something you hunt for by eye."
    }
  ];
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Before The Details</div>
          <h2>Three Ideas To Keep In Mind</h2>
          <p class="section-copy">This page is meant to teach a way of seeing policy structure. These three ideas are the mental model for everything that follows.</p>
        </div>
      </div>

      <div class="tutorial-grid tutorial-grid-3">
        ${ideas.map((idea) => `
              <article class="tutorial-card">
                <div class="eyebrow">${escapeHtml(idea.eyebrow)}</div>
                <h3>${escapeHtml(idea.title)}</h3>
                <p>${escapeHtml(idea.body)}</p>
              </article>
            `).join("")}
      </div>
    </section>
  `;
}
function renderCmsGlossary() {
  const entries = [
    {
      term: "NCD",
      title: "National coverage floor",
      body: "A National Coverage Determination is the Medicare-wide baseline. For OSA, the NCDs define the covered sleep-test pathways and the first-line CPAP framework."
    },
    {
      term: "LCD",
      title: "Local contractor coverage rule",
      body: "A Local Coverage Determination is written by a Medicare Administrative Contractor, or MAC. LCDs can reuse the NCD, narrow it, operationalize it, or create a therapy-specific branch."
    },
    {
      term: "Article",
      title: "Claim execution layer",
      body: "Companion billing articles translate clinical coverage into ICD-10, HCPCS/CPT, modifiers, and documentation instructions. This is often where claim logic becomes most computable."
    },
    {
      term: "MAC",
      title: "Regional Medicare contractor",
      body: "MACs administer Medicare claims in defined jurisdictions. In OSA, MAC-specific HGNS LCDs look similar clinically but still differ in rollout history and coding details."
    },
    {
      term: "Response record",
      title: "Revision and governance context",
      body: "Response-to-comments documents explain why a policy changed, which objections were answered, and whether a branch is current, retired, or consolidated into another LCD."
    }
  ];
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">CMS Vocabulary</div>
          <h2>The Policy Stack In Plain Language</h2>
          <p class="section-copy">If you know the medicine but not CMS policy mechanics, this is the translation layer. Think of these as different record types in one policy stack rather than unrelated pages.</p>
        </div>
      </div>

      <div class="tutorial-grid tutorial-grid-3">
        ${entries.map((entry) => `
              <article class="tutorial-card tutorial-card-glossary">
                <div class="tutorial-card-top">
                  <span class="tutorial-term">${escapeHtml(entry.term)}</span>
                  <span class="tutorial-label">${escapeHtml(entry.title)}</span>
                </div>
                <p>${escapeHtml(entry.body)}</p>
              </article>
            `).join("")}
      </div>
    </section>
  `;
}
function renderSourceLandscape(model) {
  const rules = ruleMetamodel(model);
  if (!rules) {
    return "";
  }
  const docGroups = [
    {
      label: "NCDs",
      count: model.sourceDocuments.filter((source) => source.type === "NCD").length,
      body: "National baseline documents define the Medicare-wide diagnostic or first-line treatment floor.",
      examples: ["240.4.1", "240.4"]
    },
    {
      label: "LCDs",
      count: model.sourceDocuments.filter((source) => source.type === "LCD").length,
      body: "Local documents narrow, operationalize, or create therapy-specific branches on top of that floor.",
      examples: ["L33718", "L33611", "L34526", "L38310"]
    },
    {
      label: "Billing Articles",
      count: model.sourceDocuments.filter((source) => source.type === "Article" && !source.title.startsWith("Response to Comments")).length,
      body: "Articles convert narrative coverage logic into code tables, modifiers, diagnosis lanes, and documentation expectations.",
      examples: ["A57948", "A58075", "A56953"]
    },
    {
      label: "Response Records",
      count: model.sourceDocuments.filter((source) => source.title.startsWith("Response to Comments")).length,
      body: "Response-to-comments records expose rollout rationale, revisions, and lifecycle context that matter for policy governance and change tracking.",
      examples: ["A57930", "A57938", "A58070"]
    }
  ];
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Latent Structure</div>
          <h2>What Already Exists In The Public Documents</h2>
          <p class="section-copy">CMS pages do not arrive as a neat API for clinical policy logic, but the patterns are already there. Different record types play different roles, and those roles can be normalized into reusable requirement entities and document packs.</p>
        </div>
      </div>

      <div class="tutorial-grid tutorial-grid-4">
        ${docGroups.map((group) => `
              <article class="tutorial-card">
                <div class="tutorial-card-top">
                  <span class="tutorial-count">${group.count}</span>
                  <span class="tutorial-label">${escapeHtml(group.label)}</span>
                </div>
                <p>${escapeHtml(group.body)}</p>
                <div class="delta-counts">${group.examples.map((example) => noteChip(example, "neutral")).join("")}</div>
              </article>
            `).join("")}
      </div>

      <div class="tutorial-grid tutorial-grid-4">
        ${rules.requirementGroups.map((group) => {
    const count = rules.requirementCatalog.filter((item) => item.groupId === group.id).length;
    return `
              <article class="tutorial-card">
                <div class="tutorial-card-top">
                  <span class="tutorial-count">${count}</span>
                  <span class="tutorial-label">${escapeHtml(group.label)}</span>
                </div>
                <p>${escapeHtml(group.description)}</p>
              </article>
            `;
  }).join("")}
      </div>
    </section>
  `;
}
function renderDocumentRuleCard(model, profile) {
  const requirements = requirementMap(model);
  return `
    <article class="doc-rule-card">
      <div class="doc-rule-head">
        <div>
          <div class="delta-counts">
            ${noteChip(profile.scopeLevel, profile.scopeLevel === "national" ? "ncd" : profile.scopeLevel === "local" ? "lcd" : "article")}
            ${noteChip(profile.roleInPathway, "neutral")}
          </div>
          <h3>${docChip(model, profile.displayId, profile.displayId, profile.type === "NCD" ? "ncd" : profile.type === "LCD" ? "lcd" : "article", profile.title)}</h3>
        </div>
      </div>

      <p class="doc-rule-focus">${escapeHtml(profile.focus)}</p>

      ${profile.baselineDocumentIds.length ? `
            <div class="requirement-subhead">Compared against</div>
            <div class="delta-counts">
              ${profile.baselineDocumentIds.map((documentId) => {
    const source = sourceMap(model).get(documentId);
    return source ? docChip(model, source.displayId, source.displayId, "neutral", source.title) : "";
  }).join("")}
            </div>
          ` : ""}

      <div class="rule-statement-stack">
        ${profile.statements.map((item) => {
    const requirement = requirements.get(item.requirementId);
    return `
              <div class="rule-statement-card">
                <div class="rule-statement-top">
                  ${relationChip(item.relation, item.relation)}
                  ${noteChip(requirement?.shortLabel ?? item.requirementId, "neutral")}
                  ${noteChip(item.polarity, "muted")}
                </div>
                <div class="rule-statement-value">${escapeHtml(item.valueSummary)}</div>
                ${item.note ? `<div class="variation-note">${escapeHtml(item.note)}</div>` : ""}
              </div>
            `;
  }).join("")}
      </div>
    </article>
  `;
}
function renderNcdTutorial(model) {
  const rules = ruleMetamodel(model);
  if (!rules) {
    return "";
  }
  const ncdProfiles = ["ncd-sleep-testing", "ncd-cpap"].map((id) => rules.documentProfiles.find((profile) => profile.documentId === id)).filter((profile) => Boolean(profile));
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">National Layer</div>
          <h2>What The NCDs Already Contain</h2>
          <p class="section-copy">Before comparing local policy, the tutorial extracts the national baseline. In OSA, the two key NCDs already encode a real decision grammar: valid sleep-test modalities, severity thresholds, mild-disease branches, and the initial CPAP trial concept.</p>
        </div>
      </div>

      <div class="tutorial-grid tutorial-grid-2">
        ${ncdProfiles.map((profile) => renderDocumentRuleCard(model, profile)).join("")}
      </div>
    </section>
  `;
}
function renderFamilyRail(model) {
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Downstream Branches</div>
          <h2>Choose A Therapy Lens</h2>
          <p class="section-copy">After the NCD baseline, every downstream branch changes the logic differently. Select a therapy family and the next sections will show how local policy reuses, narrows, operationalizes, or replaces the national layer.</p>
        </div>
      </div>

      <div class="family-rail">
        ${model.policyFamilies.map((family) => {
    const selected = family.id === state.selectedFamilyId;
    return `
              <button class="family-card ${toneClass(family.tone)} ${selected ? "is-active" : ""}" data-family="${family.id}" aria-pressed="${selected ? "true" : "false"}" title="${selected ? "Current focus" : `Focus ${family.label}`}">
                <div class="family-stage">${escapeHtml(family.stage)}</div>
                <div class="family-title">${escapeHtml(family.label)}</div>
                <p class="family-summary">${escapeHtml(family.summary)}</p>
                <div class="family-footer">
                  <span class="family-hint ${selected ? "is-active" : ""}">${selected ? "Current focus" : "Click to focus"}</span>
                </div>
              </button>
            `;
  }).join("")}
      </div>
    </section>
  `;
}
function renderFamilyFocus(model) {
  const family = currentFamily(model);
  const layering = layeringMap(model).get(family.id);
  const codeCatalog = codeCatalogMap(model).get(family.id);
  const treatment = currentTreatmentModel(model);
  const docCount = Number(Boolean(treatment?.ncd)) + list(treatment?.lcds).length + list(treatment?.articles).length;
  const keyRequirements = treatment ? [
    ...list(treatment.eligibility.criteria?.flatMap((criterion) => criterion.requirements ?? [])),
    ...list(treatment.eligibility.otherRequirements)
  ].slice(0, 5) : [];
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Selected Branch</div>
          <h2>${escapeHtml(family.label)}</h2>
        </div>
        <div class="focus-stage ${toneClass(family.tone)}">${escapeHtml(family.stage)}</div>
      </div>

      <div class="focus-grid">
        <div class="focus-column">
          <h3>Normalized Questions</h3>
          <div class="question-stack">
            ${family.normalizedQuestions.map((question, index) => `
                  <div class="question-card">
                    <span class="question-index">${index + 1}</span>
                    <span>${escapeHtml(question)}</span>
                  </div>
                `).join("")}
          </div>
        </div>

        <div class="focus-column">
          <h3>Typed Profile</h3>
          ${treatment ? `
                <div class="focus-metric-grid">
                  <div class="focus-metric-card">
                    <span>Age</span>
                    <strong>${escapeHtml(formatAgeWindow(treatment.eligibility, treatment.id))}</strong>
                  </div>
                  <div class="focus-metric-card">
                    <span>AHI / RDI</span>
                    <strong>${escapeHtml(formatAhiWindow(treatment.eligibility, treatment.id))}</strong>
                  </div>
                  <div class="focus-metric-card">
                    <span>BMI</span>
                    <strong>${escapeHtml(formatBmiWindow(treatment.eligibility))}</strong>
                  </div>
                  <div class="focus-metric-card">
                    <span>CPAP prerequisite</span>
                    <strong>${escapeHtml(formatStepRequirement(treatment))}</strong>
                  </div>
                </div>

                <div class="focus-doc-row">
                  ${treatment.ncd ? docChip(model, treatment.ncd.displayId, treatment.ncd.displayId, "ncd", treatment.ncd.title) : noteChip("No NCD", "muted", "Coverage is LCD-driven or uses national analogs.")}
                  ${list(treatment.lcds).slice(0, 3).map((lcd) => docChip(model, lcd.displayId, lcd.displayId, "lcd", lcd.title)).join("")}
                  ${list(treatment.lcds).length > 3 ? noteChip(`+${list(treatment.lcds).length - 3} LCDs`, "lcd", "Additional local variants are present in this family.") : ""}
                  ${list(treatment.articles).slice(0, 2).map((article) => docChip(model, article.displayId, article.displayId, article.type === "response-to-comments" ? "article" : "article", article.type === "response-to-comments" ? "Response to comments" : article.type ?? article.title)).join("")}
                  ${docCount ? noteChip(`${docCount} records`, "neutral", "NCD + LCD + Article records used in the integrated model.") : ""}
                </div>

                ${keyRequirements.length ? `
                      <div class="focus-typed-list">
                        ${keyRequirements.map((item) => `<div class="typed-list-item">${escapeHtml(item)}</div>`).join("")}
                      </div>
                    ` : ""}
              ` : ""}

          <h3>Machine Payoff</h3>
          <p class="focus-payoff">${escapeHtml(family.machinePayoff)}</p>
          <div class="focus-meta-grid">
            <div class="focus-meta-card">
              <span>Layer model</span>
              <strong>${layering ? "Explicit baseline + local delta" : "Shared family only"}</strong>
            </div>
            <div class="focus-meta-card">
              <span>Code atlas</span>
              <strong>${codeCatalog ? `${codeCatalog.groups.length} structured groups` : "No dedicated code table"}</strong>
            </div>
          </div>
          <div class="source-row">${sourceLinks(model, family.sourceIds)}</div>
        </div>
      </div>
    </section>
  `;
}
function renderRuleSemantics(model) {
  const rules = ruleMetamodel(model);
  if (!rules) {
    return "";
  }
  const selectedSummary = familyDeltaMap(model).get(state.selectedFamilyId);
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">How The Tutorial Thinks</div>
          <h2>Coverage Semantics</h2>
          <p class="section-copy">This abstraction layer is the bridge from unstructured CMS narrative to computable comparison. It lets the tutorial ask whether a local policy is truly new logic, a stricter version of the NCD, a local workflow translation, or just a billing-layer implementation detail.</p>
        </div>
      </div>

      <div class="rule-layer-grid">
        ${rules.abstractionLayers.map((layer) => `
              <article class="rule-layer-card">
                <div class="eyebrow">${escapeHtml(layer.id)}</div>
                <h3>${escapeHtml(layer.label)}</h3>
                <p>${escapeHtml(layer.description)}</p>
              </article>
            `).join("")}
      </div>

      <div class="rule-legend-grid">
        ${rules.relationLegend.map((item) => `
              <article class="rule-legend-card">
                <div class="rule-legend-top">
                  ${relationChip(item.label, item.id)}
                </div>
                <p>${escapeHtml(item.meaning)}</p>
              </article>
            `).join("")}
      </div>

      <div class="section-head secondary">
        <div>
          <h3>Family Delta Overview</h3>
          <p class="section-copy">Every family is summarized as a mix of national baseline, reuse, narrowing, operationalization, and genuinely new local branch logic.</p>
        </div>
      </div>

      <div class="delta-grid">
        ${rules.familyDeltaSummaries.map((summary) => {
    const family = familyMap(model).get(summary.familyId);
    const active = summary.familyId === state.selectedFamilyId;
    const countEntries = Object.entries(summary.counts).filter(([, value]) => value > 0);
    const relationLegend = new Map(rules.relationLegend.map((item) => [item.id, item]));
    return `
              <article class="delta-card ${active ? "is-active" : ""}">
                <div class="delta-card-head">
                  <div>
                    <div class="eyebrow">${escapeHtml(family?.stage ?? "Family")}</div>
                    <h3>${escapeHtml(family?.label ?? summary.familyId)}</h3>
                  </div>
                  <button class="layer-family-chip ${active ? "is-active" : ""}" data-family="${summary.familyId}">
                    ${active ? "Current focus" : "Focus"}
                  </button>
                </div>
                <p>${escapeHtml(summary.takeaway)}</p>
                <div class="delta-counts">
                  ${countEntries.map(([relation, value]) => {
      const relationInfo = relationLegend.get(relation);
      const label = relationInfo ? `${value} ${relationInfo.label}` : `${value} ${relation}`;
      const title = relationInfo ? `${value} structured statements classified as ${relationInfo.label.toLowerCase()}.` : `${value} structured statements classified as ${relation}.`;
      return relationChip(label, relation, title);
    }).join("")}
                </div>
                <div class="delta-sources">
                  <div class="source-row">${sourceLinks(model, [...summary.baselineDocumentIds, ...summary.localDocumentIds])}</div>
                </div>
              </article>
            `;
  }).join("")}
      </div>

      <div class="section-head secondary">
        <div>
          <h3>Analytic Questions This Model Supports</h3>
        </div>
      </div>

      <div class="question-grid">
        ${rules.analyticQuestions.map((question) => `
              <article class="insight-card">
                <h3>${escapeHtml(question.prompt)}</h3>
                <p>${escapeHtml(question.answer)}</p>
                <div class="delta-counts">
                  ${question.viewIds.map((viewId) => noteChip(viewId, "neutral")).join("")}
                </div>
              </article>
            `).join("")}
      </div>
    </section>
  `;
}
function renderRequirementDictionary(model) {
  const rules = ruleMetamodel(model);
  if (!rules) {
    return "";
  }
  const selectedFamilyId = state.selectedFamilyId;
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Requirement Dictionary</div>
          <h2>Canonical Requirement Entities</h2>
          <p class="section-copy">Each reusable requirement becomes a first-class entity with a definition, evidence payload, and known reusers across the OSA policy graph.</p>
        </div>
      </div>

      <div class="dictionary-group-stack">
        ${rules.requirementGroups.map((group) => {
    const entries = rules.requirementCatalog.filter((entry) => entry.groupId === group.id);
    return `
              <section class="dictionary-group">
                <div class="section-head secondary">
                  <div>
                    <h3>${escapeHtml(group.label)}</h3>
                    <p class="section-copy">${escapeHtml(group.description)}</p>
                  </div>
                </div>

                <div class="requirement-grid">
                  ${entries.map((item) => {
      const active = item.usedByFamilies.includes(selectedFamilyId);
      return `
                        <article class="requirement-card ${active ? "is-active" : ""}">
                          <div class="requirement-head">
                            <div class="requirement-title">${escapeHtml(item.label)}</div>
                            ${noteChip(item.valueType, "neutral")}
                          </div>
                          <div class="requirement-question">${escapeHtml(item.canonicalQuestion)}</div>
                          <p class="requirement-definition">${escapeHtml(item.definition)}</p>
                          <div class="requirement-subhead">Typical evidence</div>
                          <div class="typed-list">
                            ${item.typicalEvidence.map((evidence) => `<div class="typed-list-item">${escapeHtml(evidence)}</div>`).join("")}
                          </div>
                          ${item.relatedVariableIds.length ? `
                                <div class="requirement-subhead">Related variables</div>
                                <div class="delta-counts">
                                  ${item.relatedVariableIds.map((id) => noteChip(id, "muted")).join("")}
                                </div>
                              ` : ""}
                          <div class="requirement-subhead">Used by families</div>
                          <div class="used-by-row">
                            ${item.usedByFamilies.map((familyId) => {
        const family = familyMap(model).get(familyId);
        return family ? `<span class="family-pill ${familyId === selectedFamilyId ? "is-current" : ""}">${escapeHtml(family.label)}</span>` : "";
      }).join("")}
                          </div>
                        </article>
                      `;
    }).join("")}
                </div>
              </section>
            `;
  }).join("")}
      </div>
    </section>
  `;
}
function renderFamilyLineage(model) {
  const rules = ruleMetamodel(model);
  if (!rules) {
    return "";
  }
  const requirements = requirementMap(model);
  const groups = groupMap(model);
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Comparative Surface</div>
          <h2>Requirement Lineage Matrix</h2>
          <p class="section-copy">Rows are canonical requirements. Columns are policy families. Each cell says whether that family reuses the national rule, narrows it, operationalizes it, or introduces a genuinely different branch of logic.</p>
        </div>
      </div>

      <div class="matrix-wrap">
        <table class="matrix-table lineage-table">
          <thead>
            <tr>
              <th>Requirement</th>
              ${rules.familyLineage.columns.map((column) => `
                    <th class="${column.familyId === state.selectedFamilyId ? "is-current" : ""}">
                      <div class="table-col-head">${escapeHtml(column.label)}</div>
                    </th>
                  `).join("")}
            </tr>
          </thead>
          <tbody>
            ${rules.familyLineage.rows.map((row) => {
    const requirement = requirements.get(row.requirementId);
    const group = requirement ? groups.get(requirement.groupId) : null;
    return `
                  <tr>
                    <td class="lineage-requirement-cell">
                      <div class="variation-label">${escapeHtml(requirement?.label ?? row.requirementId)}</div>
                      ${group ? `<div class="table-col-subtle">${escapeHtml(group.label)}</div>` : ""}
                      <div class="variation-note">${escapeHtml(row.whyItMatters)}</div>
                    </td>
                    ${rules.familyLineage.columns.map((column) => {
      const cell = row.cells.find((item) => item.familyId === column.familyId);
      if (!cell) {
        return `<td class="lineage-cell"><div class="variation-note">—</div></td>`;
      }
      return `
                          <td class="lineage-cell ${column.familyId === state.selectedFamilyId ? "is-current" : ""}">
                            <div class="delta-counts">
                              ${relationChip(cell.relation, cell.relation)}
                            </div>
                            <div class="lineage-value">${escapeHtml(cell.valueSummary)}</div>
                            <div class="source-row">${sourceLinks(model, cell.sourceDocumentIds)}</div>
                          </td>
                        `;
    }).join("")}
                  </tr>
                `;
  }).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}
function renderSelectedFamilyRuleLedger(model) {
  const rules = ruleMetamodel(model);
  if (!rules) {
    return "";
  }
  const selectedFamily = currentFamily(model);
  const summary = familyDeltaMap(model).get(state.selectedFamilyId);
  const profileIds = new Set([
    ...summary?.baselineDocumentIds ?? [],
    ...summary?.localDocumentIds ?? []
  ]);
  const profiles = list(rules.documentProfiles).filter((profile) => profile.familyId === state.selectedFamilyId || profileIds.has(profile.documentId)).sort((left, right) => {
    const scopeOrder = new Map([
      ["national", 0],
      ["local", 1],
      ["billing", 2]
    ]);
    return (scopeOrder.get(left.scopeLevel) ?? 9) - (scopeOrder.get(right.scopeLevel) ?? 9) || left.displayId.localeCompare(right.displayId);
  });
  const requirements = requirementMap(model);
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Document Rule Packs</div>
          <h2>${escapeHtml(selectedFamily.label)} Rule Ledger</h2>
          <p class="section-copy">The selected family now resolves to structured document packs. Each card shows which canonical requirements the document touches and whether it is baseline, narrowing, operationalization, a new therapy branch, or a coding article.</p>
        </div>
      </div>

      <div class="doc-ledger-grid">
        ${profiles.map((profile) => `
            <article class="doc-rule-card">
              <div class="doc-rule-head">
                <div>
                  <div class="delta-counts">
                    ${noteChip(profile.scopeLevel, profile.scopeLevel === "national" ? "ncd" : profile.scopeLevel === "local" ? "lcd" : "article")}
                    ${noteChip(profile.roleInPathway, "neutral")}
                  </div>
                  <h3>${docChip(model, profile.displayId, profile.displayId, profile.type === "NCD" ? "ncd" : profile.type === "LCD" ? "lcd" : "article", profile.title)}</h3>
                </div>
              </div>

              <p class="doc-rule-focus">${escapeHtml(profile.focus)}</p>

              ${profile.baselineDocumentIds.length ? `
                    <div class="requirement-subhead">Compared against</div>
                    <div class="delta-counts">
                      ${profile.baselineDocumentIds.map((documentId) => {
    const source = sourceMap(model).get(documentId);
    return source ? docChip(model, source.displayId, source.displayId, "neutral", source.title) : "";
  }).join("")}
                    </div>
                  ` : ""}

              <div class="rule-statement-stack">
                ${profile.statements.map((item) => {
    const requirement = requirements.get(item.requirementId);
    return `
                      <div class="rule-statement-card">
                        <div class="rule-statement-top">
                          ${relationChip(item.relation, item.relation)}
                          ${noteChip(requirement?.shortLabel ?? item.requirementId, "neutral")}
                          ${noteChip(item.polarity, "muted")}
                        </div>
                        <div class="rule-statement-value">${escapeHtml(item.valueSummary)}</div>
                        ${item.note ? `<div class="variation-note">${escapeHtml(item.note)}</div>` : ""}
                      </div>
                    `;
  }).join("")}
              </div>
            </article>
          `).join("")}
      </div>
    </section>
  `;
}
function renderEligibilityLandscape(model) {
  const treatments = ["cpap", "hgns", "oral-appliance", "surgery"].map((id) => treatmentModelMap(model).get(id)).filter((item) => Boolean(item));
  const currentTreatmentId = treatmentIdForFamilyId(state.selectedFamilyId);
  const maxAhi = 80;
  const hgnsFamilyTitle = "Normalized from the aligned HGNS LCD family: L38528, L38307, L38310, L38312, L38276, L38387, L38398, and L38385.";
  const toneByTreatment = new Map(model.policyFamilies.map((family) => [treatmentIdForFamilyId(family.id), family.tone]));
  const rangeBars = (treatment) => {
    if (treatment.id === "cpap") {
      return [
        { min: 5, max: 14, label: "Mild + comorbidities", color: "var(--amber)" },
        { min: 15, max: maxAhi, label: "Moderate-severe", color: "var(--teal)" }
      ];
    }
    if (treatment.id === "hgns") {
      return [{ min: 15, max: 65, label: "AHI 15-65 only", color: "var(--blue)" }];
    }
    if (treatment.id === "oral-appliance") {
      return [
        { min: 5, max: 14, label: "Mild + comorbidities", color: "var(--amber)" },
        { min: 15, max: 30, label: "Moderate", color: "var(--teal)" },
        { min: 30, max: maxAhi, label: "Severe + PAP branch", color: "var(--plum)" }
      ];
    }
    if (treatment.id === "surgery") {
      return [{ min: 15, max: maxAhi, label: "RDI >= 15", color: "var(--rose)" }];
    }
    return [];
  };
  const cell = (treatmentId, value, refs) => `
    <td class="eligibility-cell ${currentTreatmentId === treatmentId ? "is-current" : ""}">
      <div class="eligibility-value">${value}</div>
      <div class="eligibility-sources">${refs.map((ref) => basisChip(model, ref)).join("")}</div>
    </td>
  `;
  return `
    <section class="panel panel-eligibility">
      <div class="section-head">
        <div>
          <div class="eyebrow">Typed Comparison</div>
          <h2>Eligibility Landscape</h2>
          <p class="section-copy">Integrated treatment thresholds, prerequisites, and coverage gates derived from the richer typed model. The current family stays highlighted so the disease browser and comparison view remain connected.</p>
        </div>
      </div>

      <div class="comparison-chips">
        ${basisChip(model, { label: "NCD 240.4", variant: "ncd", displayId: "240.4", title: "National CPAP baseline" })}
        ${basisChip(model, { label: "LCD L33718", variant: "lcd", displayId: "L33718", title: "PAP Devices LCD" })}
        ${basisChip(model, { label: "HGNS LCD family", variant: "group", title: hgnsFamilyTitle })}
        ${basisChip(model, { label: "Mixed basis", variant: "neutral", title: "Some cells combine a national floor with local operational narrowing." })}
      </div>

      <div class="eligibility-basis-note">
        <strong>How to read the source pills</strong>
        <span>Pills are source attribution, not extra criteria. NCD pills mean the value comes from the national floor. LCD pills mean the value is defined or operationalized at the local policy layer. If both appear in one cell, the displayed rule is synthesized from both layers.</span>
      </div>

      <div class="range-ladder">
        ${treatments.map((treatment) => {
    const bars = rangeBars(treatment);
    return `
              <div class="range-row ${currentTreatmentId === treatment.id ? "is-current" : ""}">
                <div class="range-label">${escapeHtml(treatment.shortLabel)}</div>
                <div class="range-track">
                  ${bars.map((bar) => {
      const left = bar.min / maxAhi * 100;
      const width = (Math.min(bar.max, maxAhi) - bar.min) / maxAhi * 100;
      return `<div class="range-bar tone-${escapeHtml(toneByTreatment.get(treatment.id) ?? "blue")}" style="left:${left}%;width:${width}%;background:${bar.color}">${escapeHtml(bar.label)}</div>`;
    }).join("")}
                </div>
              </div>
            `;
  }).join("")}
        <div class="range-axis">
          <span>0</span>
          <span>5</span>
          <span>15</span>
          <span>30</span>
          <span>65</span>
          <span>80+</span>
        </div>
        <div class="range-axis-caption">AHI or RDI events per hour</div>
      </div>

      <div class="matrix-wrap">
        <table class="matrix-table eligibility-table">
          <thead>
            <tr>
              <th>Requirement</th>
              ${treatments.map((treatment) => `
                    <th class="${currentTreatmentId === treatment.id ? "is-current" : ""}">
                      <div class="table-col-head">${escapeHtml(treatment.shortLabel)}</div>
                      <div class="table-col-subtle">${escapeHtml(treatment.category)}</div>
                    </th>
                  `).join("")}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Minimum AHI</td>
              ${cell("cpap", "5", [{ label: "240.4", variant: "ncd", displayId: "240.4", title: "AHI 5-14 branch requires symptoms or comorbidities." }])}
              ${cell("hgns", "15", [{ label: "HGNS family", variant: "group", title: hgnsFamilyTitle }])}
              ${cell("oral-appliance", "5", [{ label: "L33611", variant: "lcd", displayId: "L33611", title: "Oral Appliances for Obstructive Sleep Apnea" }])}
              ${cell("surgery", "15 (RDI)", [{ label: "L34526", variant: "lcd", displayId: "L34526", title: "Surgical Treatment of OSA" }])}
            </tr>
            <tr>
              <td>Maximum AHI</td>
              ${cell("cpap", "None", [{ label: "240.4", variant: "ncd", displayId: "240.4", title: "No upper AHI ceiling in the CPAP NCD." }])}
              ${cell("hgns", "65", [{ label: "HGNS family", variant: "group", title: hgnsFamilyTitle }])}
              ${cell("oral-appliance", "None", [{ label: "L33611", variant: "lcd", displayId: "L33611", title: "No explicit upper AHI ceiling; severe disease branches on PAP status." }])}
              ${cell("surgery", "None", [{ label: "L34526", variant: "lcd", displayId: "L34526", title: "No explicit upper RDI ceiling in the surgery LCD." }])}
            </tr>
            <tr>
              <td>Minimum age</td>
              ${cell("cpap", "Adult", [{ label: "240.4", variant: "ncd", displayId: "240.4", title: "The CPAP NCD addresses adult OSA." }])}
              ${cell("hgns", "22", [{ label: "HGNS family", variant: "group", title: hgnsFamilyTitle }])}
              ${cell("oral-appliance", "Not fixed", [{ label: "L33611", variant: "lcd", displayId: "L33611" }])}
              ${cell("surgery", "Not fixed", [{ label: "L34526", variant: "lcd", displayId: "L34526" }])}
            </tr>
            <tr>
              <td>Maximum BMI</td>
              ${cell("cpap", "No ceiling", [{ label: "240.4", variant: "ncd", displayId: "240.4", title: "No CPAP BMI ceiling in the NCD." }])}
              ${cell("hgns", "< 35", [{ label: "HGNS family", variant: "group", title: hgnsFamilyTitle }])}
              ${cell("oral-appliance", "No ceiling", [{ label: "L33611", variant: "lcd", displayId: "L33611" }])}
              ${cell("surgery", "No ceiling", [{ label: "L34526", variant: "lcd", displayId: "L34526" }])}
            </tr>
            <tr>
              <td>CPAP failure required</td>
              ${cell("cpap", "N/A first-line", [{ label: "240.4", variant: "ncd", displayId: "240.4", title: "CPAP is itself the national first-line therapy." }])}
              ${cell("hgns", "Required", [{ label: "HGNS family", variant: "group", title: hgnsFamilyTitle }])}
              ${cell("oral-appliance", "Conditional", [{ label: "L33611", variant: "lcd", displayId: "L33611", title: "Required only for the severe AHI branch or contraindication path." }])}
              ${cell("surgery", "Required", [{ label: "L34526", variant: "lcd", displayId: "L34526" }])}
            </tr>
            <tr>
              <td>Sleep-test rule</td>
              ${cell("cpap", "Qualifying PSG or HST", [
    { label: "240.4.1", variant: "ncd", displayId: "240.4.1", title: "National sleep-testing floor" },
    { label: "240.4", variant: "ncd", displayId: "240.4", title: "CPAP qualification uses those covered testing pathways." }
  ])}
              ${cell("hgns", "PSG within 24 months", [{ label: "HGNS family", variant: "group", title: hgnsFamilyTitle }])}
              ${cell("oral-appliance", "Medicare-covered sleep test", [{ label: "L33611", variant: "lcd", displayId: "L33611" }])}
              ${cell("surgery", "AASM-certified lab", [{ label: "L34526", variant: "lcd", displayId: "L34526" }])}
            </tr>
            <tr>
              <td>Trial period</td>
              ${cell("cpap", "90-day continuation window", [
    { label: "240.4", variant: "ncd", displayId: "240.4", title: "National 12-week trial period." },
    { label: "L33718", variant: "lcd", displayId: "L33718", title: "Operationalized as a 90-day adherence window." }
  ])}
              ${cell("hgns", "None", [{ label: "HGNS family", variant: "group", title: hgnsFamilyTitle }])}
              ${cell("oral-appliance", "None", [{ label: "L33611", variant: "lcd", displayId: "L33611" }])}
              ${cell("surgery", "None", [{ label: "L34526", variant: "lcd", displayId: "L34526" }])}
            </tr>
            <tr>
              <td>Adherence monitoring</td>
              ${cell("cpap", ">=4h/night, 70%", [{ label: "L33718", variant: "lcd", displayId: "L33718", title: "Objective adherence rule from the PAP LCD." }])}
              ${cell("hgns", "N/A", [{ label: "HGNS family", variant: "group", title: hgnsFamilyTitle }])}
              ${cell("oral-appliance", "N/A", [{ label: "L33611", variant: "lcd", displayId: "L33611" }])}
              ${cell("surgery", "N/A", [{ label: "L34526", variant: "lcd", displayId: "L34526" }])}
            </tr>
            <tr>
              <td>Anatomy assessment</td>
              ${cell("cpap", "Not primary", [{ label: "240.4", variant: "ncd", displayId: "240.4" }])}
              ${cell("hgns", "DISE required", [{ label: "HGNS family", variant: "group", title: hgnsFamilyTitle }])}
              ${cell("oral-appliance", "Not primary", [{ label: "L33611", variant: "lcd", displayId: "L33611" }])}
              ${cell("surgery", "Obstruction site required", [{ label: "L34526", variant: "lcd", displayId: "L34526" }])}
            </tr>
            <tr>
              <td>Specialist requirement</td>
              ${cell("cpap", "Treating practitioner", [{ label: "240.4", variant: "ncd", displayId: "240.4" }])}
              ${cell("hgns", "Otolaryngologist + sleep physician", [{ label: "HGNS family", variant: "group", title: hgnsFamilyTitle }])}
              ${cell("oral-appliance", "Licensed dentist", [{ label: "L33611", variant: "lcd", displayId: "L33611" }])}
              ${cell("surgery", "Qualified surgeon", [{ label: "L34526", variant: "lcd", displayId: "L34526" }])}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `;
}
function renderMacVariation(model) {
  const comparison = model.crossMacComparison;
  const macTables = model.perMacCodeTables;
  if (!comparison || !macTables?.hgns?.length) {
    return "";
  }
  const contractors = comparison.criteriaMatrix.contractors;
  const criteria = comparison.criteriaMatrix.criteria;
  const currentFamilyIsHgns = state.selectedFamilyId === "hgns";
  const codeRows = list(macTables.hgns);
  const realDifferences = list(comparison.realDifferences);
  const articleByMac = new Map(codeRows.map((row) => [row.mac, row]));
  const contractorKeyFromArticle = (displayId) => {
    if (displayId === "A57949") {
      return "noridian-jf";
    }
    if (displayId === "A57948") {
      return "noridian-je";
    }
    const lower = displayId.toLowerCase();
    if (lower.includes("58075"))
      return "palmetto";
    if (lower.includes("56953"))
      return "first-coast";
    if (lower.includes("56938"))
      return "novitas";
    return "";
  };
  const billingArticles = list(treatmentModelMap(model).get("hgns")?.articles).filter((article) => article.type === "billing");
  const billingByContractor = new Map(billingArticles.map((article) => {
    const key = contractorKeyFromArticle(article.displayId);
    if (key) {
      return [key, article];
    }
    if (article.contractor?.includes("Noridian")) {
      return ["noridian-je", article];
    }
    if (article.contractor?.includes("Palmetto")) {
      return ["palmetto", article];
    }
    if (article.contractor?.includes("First Coast")) {
      return ["first-coast", article];
    }
    if (article.contractor?.includes("Novitas")) {
      return ["novitas", article];
    }
    return ["", article];
  }).filter(([key]) => key));
  const contractorCodeRow = new Map;
  codeRows.forEach((row) => {
    const name = row.mac.toLowerCase();
    if (name.includes("noridian") && name.includes("legacy")) {
      contractorCodeRow.set("noridian-jf", row);
      return;
    }
    if (name.includes("noridian")) {
      contractorCodeRow.set("noridian-je", row);
      return;
    }
    if (name.includes("palmetto"))
      contractorCodeRow.set("palmetto", row);
    if (name.includes("first coast"))
      contractorCodeRow.set("first-coast", row);
    if (name.includes("novitas"))
      contractorCodeRow.set("novitas", row);
  });
  const spreadCell = (criterion) => {
    const presentCount = contractors.filter((contractor) => criterion.values[contractor.id]).length;
    const pct = presentCount / contractors.length * 100;
    return `
      <td class="spread-cell">
        <div class="spread-label-row">
          <strong>${presentCount}/${contractors.length} LCDs</strong>
          <span>${presentCount === contractors.length ? "Uniform" : "Split"}</span>
        </div>
        <div class="spread-bar-track"><div class="spread-bar-fill" style="width:${pct}%"></div></div>
      </td>
    `;
  };
  const summarizeValues = (values) => {
    const counts = new Map;
    values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
    return [...counts.entries()].sort((left, right) => right[1] - left[1]);
  };
  const valuePill = (value) => {
    const tone = value === "Current article" ? "teal" : value === "Retired legacy article" ? "rose" : value === "Aligned" ? "teal" : value === "Above clinical cap" ? "amber" : value === "Yes" ? "blue" : value === "No" ? "muted" : "muted";
    return `<span class="value-pill is-${tone}">${escapeHtml(value)}</span>`;
  };
  const variationRows = [
    {
      label: "Billing article modeled",
      description: "Whether the integrated dataset includes a billing article for that contractor.",
      values: contractors.map((contractor) => billingByContractor.get(contractor.id) ? "Yes" : "No")
    },
    {
      label: "Article record used here",
      description: "Whether the modeled article is the current billing article or a retired legacy record retained for comparison.",
      values: contractors.map((contractor) => {
        const article = billingByContractor.get(contractor.id);
        if (!article) {
          return "Not modeled";
        }
        return article.status === "Retired" ? "Retired legacy article" : "Current article";
      })
    },
    {
      label: "Billing BMI ceiling",
      description: "Maximum BMI represented in the coded BMI diagnosis range for HGNS billing.",
      values: contractors.map((contractor) => {
        const row = contractorCodeRow.get(contractor.id);
        return row?.bmiMaxValue != null ? row.bmiMaxValue.toFixed(1) : "Not modeled";
      })
    },
    {
      label: "BMI coding aligned to LCD clinical rule",
      description: "Whether the coded BMI ceiling stays inside the clinical BMI < 35 LCD rule.",
      values: contractors.map((contractor) => {
        const row = contractorCodeRow.get(contractor.id);
        if (row?.bmiMaxValue == null) {
          return "Unknown";
        }
        return row.bmiMaxValue <= 34.9 ? "Aligned" : "Above clinical cap";
      })
    },
    {
      label: "Legacy CPT 64568 present",
      description: "Flags legacy article variants that still carry CPT 64568.",
      values: contractors.map((contractor) => {
        const row = contractorCodeRow.get(contractor.id);
        if (!row) {
          return "Unknown";
        }
        return list(row.cptCodes).includes("64568") ? "Yes" : "No";
      })
    }
  ];
  const literalClinicalDiffCount = realDifferences.filter((item) => item.category.startsWith("LCD:")).length;
  const billingDiffCount = realDifferences.filter((item) => item.category.startsWith("Billing:")).length;
  const structureDiffCount = realDifferences.filter((item) => item.category.startsWith("LCD Structure")).length;
  return `
    <section class="panel panel-hgns-variation">
      <div class="section-head">
        <div>
          <div class="eyebrow">Variation Surface</div>
          <h2>HGNS Cross-MAC Variation</h2>
          <p class="section-copy">The integrated model now separates the aligned clinical core from the article and coding spread. ${currentFamilyIsHgns ? "This family is in focus." : "The view stays visible because HGNS is the only multi-MAC branch in this prototype."}</p>
        </div>
      </div>

      <div class="comparison-chips">
        ${noteChip(`${criteria.length} clinical criteria`, "neutral")}
        ${noteChip(`${contractors.length} contractor variants`, "neutral")}
        ${noteChip(`${comparison.bmiCodeVariation ? Object.keys(comparison.bmiCodeVariation.macBmiMaxCode).length : 0} BMI code lanes`, "neutral")}
        ${realDifferences.length ? noteChip(`${realDifferences.length} material differences captured`, "amber", "The normalized checkmark grid is aligned, but the integrated model still captures real cross-MAC differences.") : ""}
        ${literalClinicalDiffCount ? noteChip(`${literalClinicalDiffCount} literal clinical criterion variant`, "rose", "At least one LCD uses materially different wording or a different measurement window even though the normalized core remains aligned.") : ""}
        ${billingDiffCount ? noteChip(`${billingDiffCount} billing / coding differences`, "blue") : ""}
        ${structureDiffCount ? noteChip(`${structureDiffCount} structure / wording differences`, "neutral") : ""}
      </div>

      <div class="variation-summary-callout">
        <strong>${escapeHtml(comparison.verdictSummary ?? "Clinical-core presence is aligned, but the integrated model still captures real contractor variation.")}</strong>
        <span>The checkmarks below answer only whether each normalized core requirement is present in a contractor LCD. They do not encode wording changes, measurement-window changes, or billing-article differences.</span>
      </div>

      <div class="matrix-wrap">
        <table class="matrix-table">
          <thead>
            <tr>
              <th>Clinical-core criterion</th>
              ${contractors.map((contractor) => `
                    <th>
                      <div class="table-col-head">${escapeHtml(contractor.name)}</div>
                      <div class="table-col-subtle">${docChip(model, contractor.lcd, contractor.lcd, "lcd", contractor.region)}</div>
                    </th>
                  `).join("")}
              <th>Spread</th>
            </tr>
          </thead>
          <tbody>
            ${criteria.map((criterion) => `
                  <tr>
                    <td>${escapeHtml(criterion.label)}</td>
                    ${contractors.map((contractor) => `<td class="boolean-cell">${criterion.values[contractor.id] ? "✓" : "—"}</td>`).join("")}
                    ${spreadCell(criterion)}
                  </tr>
                `).join("")}
          </tbody>
        </table>
      </div>

      ${realDifferences.length ? `
            <div class="matrix-wrap difference-ledger">
              <table class="matrix-table">
                <thead>
                  <tr>
                    <th>Material difference captured</th>
                    <th>Severity</th>
                    <th>Affected MACs</th>
                    <th>What differs</th>
                  </tr>
                </thead>
                <tbody>
                  ${realDifferences.map((difference) => `
                        <tr>
                          <td>
                            <div class="variation-label">${escapeHtml(difference.category)}</div>
                          </td>
                          <td><span class="value-pill is-${difference.severity === "high" ? "rose" : difference.severity === "medium" ? "amber" : "muted"}">${escapeHtml(difference.severity)}</span></td>
                          <td>
                            <div class="difference-mac-list">
                              ${difference.affectedMacs.map((item) => `<span class="mini-doc-chip is-neutral">${escapeHtml(item)}</span>`).join("")}
                            </div>
                          </td>
                          <td>
                            <div class="variation-label">${escapeHtml(difference.description)}</div>
                            <div class="variation-note">${escapeHtml(difference.detail)}</div>
                          </td>
                        </tr>
                      `).join("")}
                </tbody>
              </table>
            </div>
          ` : ""}

      <div class="matrix-wrap variation-matrix">
        <table class="matrix-table">
          <thead>
            <tr>
              <th>Operational / coding variation</th>
              ${contractors.map((contractor) => `
                    <th>
                      <div class="table-col-head">${escapeHtml(contractor.name)}</div>
                      <div class="table-col-subtle">${docChip(model, contractor.lcd, contractor.lcd, "lcd", contractor.region)}</div>
                    </th>
                  `).join("")}
              <th>Distribution</th>
            </tr>
          </thead>
          <tbody>
            ${variationRows.map((row) => {
    const summary = summarizeValues(row.values);
    return `
                  <tr>
                    <td>
                      <div class="variation-label">${escapeHtml(row.label)}</div>
                      <div class="variation-note">${escapeHtml(row.description)}</div>
                    </td>
                    ${row.values.map((value) => `<td>${valuePill(value)}</td>`).join("")}
                    <td class="distribution-cell">
                      ${summary.map(([label, count]) => `
                            <div class="distribution-row">
                              <span>${escapeHtml(label)}</span>
                              <strong>${count}</strong>
                            </div>
                          `).join("")}
                    </td>
                  </tr>
                `;
  }).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}
function renderCoveragePill(value) {
  return `<span class="coverage-pill coverage-${slugify(value)}">${escapeHtml(value)}</span>`;
}
function renderCodeAtlas(model) {
  const current = currentCodeCatalog(model);
  const families = familyMap(model);
  return `
    <section class="panel panel-code-atlas">
      <div class="section-head">
        <div>
          <div class="eyebrow">Structured Coding</div>
          <h2>Code Atlas</h2>
          <p class="section-copy">The selected family now gets a true structured code view instead of a vague coding note. This is the strongest bridge between coverage criteria and claim execution.</p>
        </div>
      </div>

      <div class="catalog-rail">
        ${model.codeCatalog.families.map((catalog) => {
    const family = families.get(catalog.familyId);
    const active = catalog.familyId === current?.familyId;
    const rowCount = catalog.groups.reduce((total, group) => total + group.rows.length, 0);
    return `
              <button class="catalog-chip ${active ? "is-active" : ""}" data-family="${catalog.familyId}">
                <strong>${escapeHtml(family?.label ?? catalog.title)}</strong>
                <span>${catalog.groups.length} groups · ${rowCount} rows</span>
              </button>
            `;
  }).join("")}
      </div>

      <article class="catalog-card">
        <div class="catalog-card-head">
          <div>
            <div class="eyebrow">Selected Atlas</div>
            <h3>${escapeHtml(current?.title ?? "No direct code table for this family")}</h3>
          </div>
          <div class="catalog-family-tag">${escapeHtml(current ? families.get(current.familyId)?.label ?? current.familyId : families.get(state.selectedFamilyId)?.label ?? state.selectedFamilyId)}</div>
        </div>

        <p class="section-copy">${escapeHtml(current?.summary ?? "Sleep testing and other baseline-only branches do not carry their own claim tables. Their structured coding burden appears in the downstream therapy families that inherit the diagnostic floor.")}</p>

        ${current ? `
              <div class="catalog-group-stack">
                ${current.groups.map((group) => `
                      <section class="catalog-group">
                        <div class="catalog-group-head">
                          <div>
                            <h4>${escapeHtml(group.label)}</h4>
                            <p>${escapeHtml(group.note)}</p>
                          </div>
                        </div>

                        <div class="code-table-wrap">
                          <table class="code-table">
                            <thead>
                              <tr>
                                <th>Code</th>
                                <th>System</th>
                                <th>Status</th>
                                <th>Description</th>
                                <th>Notes</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${group.rows.map((row) => `
                                    <tr>
                                      <td class="code-cell">${escapeHtml(row.code)}</td>
                                      <td>${escapeHtml(row.system)}</td>
                                      <td>${renderCoveragePill(row.coverage)}</td>
                                      <td>${escapeHtml(row.description)}</td>
                                      <td>${row.notes ? escapeHtml(row.notes) : "—"}</td>
                                    </tr>
                                  `).join("")}
                            </tbody>
                          </table>
                        </div>

                        <div class="source-row">${sourceLinks(model, group.sourceIds)}</div>
                      </section>
                    `).join("")}
              </div>

              <div class="source-row">${sourceLinks(model, current.sourceIds)}</div>
            ` : `
              <div class="catalog-empty">
                <div class="catalog-empty-card">
                  <strong>No direct code atlas on this branch.</strong>
                  <span>The value here is the diagnostic floor; the structured claim tables appear once a therapy branch is selected.</span>
                </div>
              </div>
            `}
      </article>

      <div class="section-head secondary">
        <div>
          <h3>${escapeHtml(model.codeCatalog.hgnsMacVariation.title)}</h3>
          <p class="section-copy">${escapeHtml(model.codeCatalog.hgnsMacVariation.summary)}</p>
        </div>
      </div>

      <div class="code-table-wrap">
        <table class="code-table">
          <thead>
            <tr>
              <th>MAC</th>
              <th>Article</th>
              <th>Secondary BMI codes</th>
              <th>Clinical rule</th>
              <th>Why it matters</th>
            </tr>
          </thead>
          <tbody>
            ${model.codeCatalog.hgnsMacVariation.rows.map((row) => `
                  <tr>
                    <td class="code-cell">${escapeHtml(row.mac)}</td>
                    <td>${escapeHtml(row.articleDisplayId)}</td>
                    <td>${escapeHtml(row.secondaryBmiCodes)}</td>
                    <td>${escapeHtml(row.clinicalRule)}</td>
                    <td>
                      ${escapeHtml(row.implication)}
                      <div class="source-row">${sourceLinks(model, row.sourceIds)}</div>
                    </td>
                  </tr>
                `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}
function renderSourceLedger(model) {
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Traceability</div>
          <h2>Source Ledger</h2>
          <p class="section-copy">Every abstraction in this codex prototype is tied back to the underlying CMS records used in the manual review.</p>
        </div>
      </div>

      <div class="ledger-wrap">
        <table class="ledger-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Family</th>
              <th>Scope</th>
              <th>Effective</th>
              <th>Why it matters</th>
            </tr>
          </thead>
          <tbody>
            ${model.sourceDocuments.map((source) => {
    const family = familyMap(model).get(source.familyId);
    return `
                  <tr>
                    <td>
                      <a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.displayId)}</a>
                      <div class="ledger-title">${escapeHtml(source.title)}</div>
                      ${source.contractor ? `<div class="ledger-subtle">${escapeHtml(source.contractor)}</div>` : ""}
                    </td>
                    <td>${escapeHtml(family?.label ?? source.familyId)}</td>
                    <td>${escapeHtml(source.scope)}</td>
                    <td>${escapeHtml(formatDate(source.effectiveDate))}</td>
                    <td>${escapeHtml(source.reviewUse)}</td>
                  </tr>
                `;
  }).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}
function render(model) {
  app.innerHTML = `
    <div class="codex-shell">
      <header class="masthead">
        <div>
          <div class="eyebrow">Hand-Curated Tutorial</div>
          <div class="masthead-title">CMS Coverage Structure Through Obstructive Sleep Apnea</div>
        </div>
        <div class="masthead-note">Reviewed ${escapeHtml(formatDate(model.meta.reviewedOn))}</div>
      </header>

      ${renderHero(model)}
      ${renderTutorialOrientation()}
      ${renderCmsGlossary()}
      ${renderChapterIntro(1, "Public Policy Material", "What Structure Is Already Present In The Source Documents?", "Only after the orientation do we pivot to the source material itself. OSA is the lens, but the lesson is about the underlying structure already present in CMS policy documents.")}
      ${renderMethodology(model)}
      ${renderSourceLandscape(model)}
      ${renderRuleSemantics(model)}

      ${renderChapterIntro(2, "National Baseline", "The NCDs Already Encode A Policy Grammar", "The OSA NCDs are not just prose. Once extracted, they define valid diagnostic modalities, severity thresholds, mild-disease exceptions, and the first-line CPAP pathway.")}
      ${renderNcdTutorial(model)}
      ${renderEligibilityLandscape(model)}

      ${renderChapterIntro(3, "Local Interaction", "How LCDs Constrain, Operationalize, Or Replace The NCD", "Next the tutorial pivots from the national floor to local therapy branches. This is where the same OSA domain becomes different policy depending on device, procedure, and contractor context.")}
      ${renderFamilyRail(model)}
      ${renderFamilyFocus(model)}
      ${renderFamilyLineage(model)}
      ${renderSelectedFamilyRuleLedger(model)}

      ${renderChapterIntro(4, "Consistency Vs Conflict", "Where Local Policies Align And Where They Really Diverge", "The HGNS family is the best OSA stress test. On the surface the LCDs look nearly identical. Once structured, the real differences become explicit in wording, provider rules, lifecycle status, and billing articles.")}
      ${renderCodeAtlas(model)}
      ${renderMacVariation(model)}

      ${renderChapterIntro(5, "Automation Layer", "What AI Agents Can Structure Today", "Finally, the tutorial exposes the canonical requirement dictionary and the source ledger. These are the data products that make policy comparison, visualization, and downstream decision support straightforward.")}
      ${renderRequirementDictionary(model)}
      ${renderSourceLedger(model)}

      <footer class="codex-footer">
        <div>${escapeHtml(model.meta.reviewMethod)}</div>
      </footer>
    </div>
  `;
  document.querySelectorAll("[data-family]").forEach((element) => {
    element.addEventListener("click", () => {
      const familyId = element.dataset.family;
      if (!familyId || !state.model || familyId === state.selectedFamilyId) {
        return;
      }
      state.selectedFamilyId = familyId;
      render(state.model);
    });
  });
}
async function bootstrap() {
  app.innerHTML = `<div class="loading">Loading codex prototype…</div>`;
  state.model = await fetchModel();
  render(state.model);
}
bootstrap().catch((error) => {
  console.error(error);
  app.innerHTML = `<div class="loading">Failed to load prototype.</div>`;
});
