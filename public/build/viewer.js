// src/viewer.ts
var state = {
  model: null,
  selectedFamilyId: "pap-therapy",
  selectedModelTab: "overview"
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
function currentLayeringModel(model) {
  return layeringMap(model).get(state.selectedFamilyId) ?? model.layeringModels[0];
}
function currentCodeCatalog(model) {
  return codeCatalogMap(model).get(state.selectedFamilyId) ?? null;
}
function currentTreatmentModel(model) {
  return treatmentModelMap(model).get(treatmentIdForFamilyId(state.selectedFamilyId)) ?? null;
}
var jurisdictionLabels = new Map([
  ["J5", "Jurisdiction 5"],
  ["J6", "Jurisdiction 6"],
  ["J8", "Jurisdiction 8"],
  ["J15", "Jurisdiction 15"],
  ["JE", "Jurisdiction E"],
  ["JF", "Jurisdiction F"],
  ["JH", "Jurisdiction H"],
  ["JJ", "Jurisdiction J"],
  ["JK", "Jurisdiction K"],
  ["JL", "Jurisdiction L"],
  ["JM", "Jurisdiction M"],
  ["JN", "Jurisdiction N"]
]);
function expandJurisdictionCodes(region) {
  const codes = region.split("/").map((item) => item.trim()).filter(Boolean);
  if (!codes.length) {
    return region;
  }
  const expanded = codes.map((code) => jurisdictionLabels.get(code) ?? code);
  if (expanded.length === 1) {
    return `${expanded[0]} (${codes[0]})`;
  }
  return `${expanded.slice(0, -1).join(", ")} and ${expanded[expanded.length - 1]} (${codes.join("/")})`;
}
function contractorDisplayParts(contractor) {
  return {
    name: contractor.name.replace(/\s*\([^)]*\)\s*$/, ""),
    jurisdiction: expandJurisdictionCodes(contractor.region)
  };
}
function friendlyAffectedMacName(name) {
  const aliases = new Map([
    ["WPS Insurance", "WPS Insurance, Jurisdictions 5 and 8"],
    ["CGS Administrators", "CGS Administrators, Jurisdiction 15"],
    ["Noridian (JE)", "Noridian, Jurisdiction E"],
    ["Noridian (JF)", "Noridian, Jurisdiction F"],
    ["Palmetto GBA", "Palmetto GBA, Jurisdictions J and M"],
    ["National Government Services", "National Government Services, Jurisdictions 6 and K"],
    ["First Coast Service Options", "First Coast Service Options, Jurisdiction N"],
    ["Novitas Solutions", "Novitas Solutions, Jurisdictions H and L"],
    ["all", "All modeled HGNS contractor jurisdictions"]
  ]);
  return aliases.get(name) ?? name;
}
function describeMaterialDifference(difference) {
  if (difference.id === "billing-bmi-code-range") {
    return {
      label: "Billing article extends beyond LCD BMI rule",
      description: "Noridian's companion billing article accepts BMI diagnosis codes through Z68.39 even though the Noridian LCD text still says BMI < 35. The mismatch is between that MAC's LCD text and its billing article, not between national and local policy.",
      detail: "This is the clearest example in the prototype where claim-execution logic is broader than the local clinical text."
    };
  }
  if (difference.id === "billing-modifier-52-guidance") {
    return {
      label: "Modifier 52 (reduced service) guidance",
      description: "Noridian and Palmetto explicitly tell billers when to append Modifier 52, the CPT/HCPCS modifier used when only part of a service is performed. First Coast and Novitas do not give the same instruction.",
      detail: difference.detail
    };
  }
  if (difference.id === "billing-abn-modifier-guidance") {
    return {
      label: "ABN modifier guidance (-GA, -GX, -GY, -GZ)",
      description: "Only Palmetto explains the Advance Beneficiary Notice modifier set and related ordering/referring NPI expectations in detail.",
      detail: difference.detail
    };
  }
  return {
    label: difference.label ?? difference.description,
    description: difference.description,
    detail: difference.detail
  };
}
function renderJsonPreview(value) {
  return `<pre class="json-browser-pre">${escapeHtml(JSON.stringify(value, null, 2))}</pre>`;
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
function relationLeadLabel(relation) {
  if (relation === "narrows")
    return "Narrows baseline";
  if (relation === "adds")
    return "Adds local rule";
  if (relation === "operationalizes")
    return "Operationalizes baseline";
  if (relation === "differs")
    return "Uses a different rule";
  if (relation === "codes")
    return "Moves into coding";
  if (relation === "reuses")
    return "Reuses baseline";
  if (relation === "baseline")
    return "Baseline rule";
  if (relation === "governs")
    return "Governance rule";
  return "Structured rule";
}
function renderProfileSourceSection(model, family, treatment, layering) {
  const billingArticles = list(treatment?.articles).filter((article) => article.type === "billing");
  const responseArticles = list(treatment?.articles).filter((article) => article.type === "response-to-comments");
  const totalRecords = new Set([
    ...list(layering?.baselineSourceIds),
    ...list(layering?.overlaySourceIds),
    ...treatment?.ncd ? [treatment.ncd.displayId] : [],
    ...list(treatment?.lcds).map((item) => item.displayId),
    ...list(treatment?.articles).map((item) => item.displayId)
  ]).size;
  const rows = [
    {
      label: "National baseline",
      body: treatment?.ncd ? "This path has a therapy-specific national baseline document." : layering?.baselineSourceIds?.length ? "This path has no therapy-specific NCD, so the profile inherits the national sleep-testing and CPAP floor instead." : "No national baseline record is modeled for this path.",
      content: treatment?.ncd ? `<div class="focus-doc-row">${docChip(model, treatment.ncd.displayId, treatment.ncd.displayId, "ncd", treatment.ncd.title)}</div>` : layering?.baselineSourceIds?.length ? `<div class="source-row">${sourceLinks(model, layering.baselineSourceIds)}</div>` : `<div class="profile-source-note">No national source linked for this path.</div>`
    },
    {
      label: "Local coverage rule",
      body: list(treatment?.lcds).length ? "These LCDs supply the actual local coverage logic for this treatment path." : "No local LCD is linked in the current model.",
      content: list(treatment?.lcds).length ? `<div class="focus-doc-row">${list(treatment?.lcds).map((lcd) => docChip(model, lcd.displayId, lcd.displayId, "lcd", lcd.title)).join("")}</div>` : `<div class="profile-source-note">No local LCD linked.</div>`
    },
    {
      label: "Coding and governance records",
      body: billingArticles.length || responseArticles.length ? "These companion records turn the policy into coding guidance or explain rollout history." : "No companion article is linked for this path.",
      content: billingArticles.length || responseArticles.length ? `
              <div class="focus-doc-row">
                ${billingArticles.map((article) => docChip(model, article.displayId, article.displayId, "article", article.title)).join("")}
                ${responseArticles.map((article) => docChip(model, article.displayId, article.displayId, "article", article.title)).join("")}
              </div>
            ` : `<div class="profile-source-note">No companion article linked.</div>`
    },
    {
      label: "Modeled scope",
      body: `${totalRecords} source record${totalRecords === 1 ? "" : "s"} are synthesized into this profile.`,
      content: `<div class="profile-source-note">${escapeHtml(family.label)} is summarized here as a single treatment-path profile so you do not have to read those records side by side.</div>`
    }
  ];
  return `
    <div class="profile-source-list">
      ${rows.map((row) => `
            <div class="profile-source-item">
              <div class="profile-source-label">${escapeHtml(row.label)}</div>
              <div class="profile-source-content">
                <p>${escapeHtml(row.body)}</p>
                ${row.content}
              </div>
            </div>
          `).join("")}
    </div>
  `;
}
function renderCriterionEvidenceList(model, title, criteria, emptyMessage) {
  if (!criteria.length) {
    return `
      <div class="criteria-block">
        <div class="requirement-subhead">${escapeHtml(title)}</div>
        <div class="profile-source-note">${escapeHtml(emptyMessage)}</div>
      </div>
    `;
  }
  return `
    <div class="criteria-block">
      <div class="requirement-subhead">${escapeHtml(title)}</div>
      <div class="criteria-detail-list">
        ${criteria.map((criterion) => `
              <article class="criteria-detail-card">
                <div class="criteria-detail-label">${escapeHtml(relationLeadLabel(criterion.relation))}</div>
                <div class="criteria-detail-text">${escapeHtml(criterion.text)}</div>
                <div class="source-row">${sourceLinks(model, criterion.sourceIds)}</div>
              </article>
            `).join("")}
      </div>
    </div>
  `;
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
function relationExplanation(relation) {
  if (relation === "baseline")
    return "Defines the national baseline rule.";
  if (relation === "reuses")
    return "Carries the same national rule forward without changing it.";
  if (relation === "narrows")
    return "Makes the inherited national rule stricter.";
  if (relation === "operationalizes")
    return "Turns a broad inherited rule into an auditable workflow step.";
  if (relation === "adds")
    return "Adds a therapy-specific local rule with no direct national counterpart.";
  if (relation === "differs")
    return "Uses a materially different local rule for the same requirement.";
  if (relation === "codes")
    return "Moves the logic into billing or coding instructions.";
  if (relation === "governs")
    return "Describes policy lifecycle or governance rather than bedside eligibility.";
  return relation;
}
function polarityExplanation(polarity) {
  if (polarity === "requires")
    return "Requires this condition.";
  if (polarity === "allows")
    return "Allows this path or evidence.";
  if (polarity === "denies")
    return "Excludes or denies this scenario.";
  if (polarity === "codes")
    return "Defines billing or coding handling.";
  if (polarity === "documents")
    return "Specifies what must be documented.";
  if (polarity === "references")
    return "Points to a linked policy or source.";
  if (polarity === "structures")
    return "Defines the document structure or packaging.";
  if (polarity === "status")
    return "States lifecycle status.";
  if (polarity === "summarizes")
    return "Summarizes the document's role.";
  if (polarity === "responds")
    return "Captures response-to-comments context.";
  return polarity;
}
function renderRuleStatementCard(requirements, item) {
  const requirement = requirements.get(item.requirementId);
  const requirementLabel = requirement?.label ?? requirement?.shortLabel ?? item.requirementId;
  return `
    <div class="rule-statement-card">
      <dl class="rule-statement-meta">
        <div class="rule-statement-meta-row">
          <dt class="rule-statement-meta-label">Requirement</dt>
          <dd class="rule-statement-meta-value">${escapeHtml(requirementLabel)}</dd>
        </div>
        <div class="rule-statement-meta-row">
          <dt class="rule-statement-meta-label">Relation to national baseline</dt>
          <dd class="rule-statement-meta-value">${escapeHtml(relationExplanation(item.relation))}</dd>
        </div>
        <div class="rule-statement-meta-row">
          <dt class="rule-statement-meta-label">What this document does</dt>
          <dd class="rule-statement-meta-value">${escapeHtml(polarityExplanation(item.polarity))}</dd>
        </div>
      </dl>
      <div class="rule-statement-body-label">Structured statement captured here</div>
      <div class="rule-statement-value">${escapeHtml(item.valueSummary)}</div>
      ${item.note ? `
            <div class="rule-statement-note">
              <div class="rule-statement-body-label">Why it matters</div>
              <div class="variation-note">${escapeHtml(item.note)}</div>
            </div>
          ` : ""}
    </div>
  `;
}
function renderHero(model) {
  return `
    <section class="hero panel">
      <div class="hero-copy">
        <div class="eyebrow">Interactive Tutorial</div>
        <h1>How Medicare Coverage Policy Gets Structured</h1>
        <p class="hero-subtitle">This tutorial uses obstructive sleep apnea (OSA) as a concrete example. The goal is to show, in plain language, how national coverage policy, local contractor policy, and billing guidance fit together and how those public documents can be turned into structured data.</p>
        <p class="hero-note">You do not need prior CMS or billing expertise to read this page. Start with the glossary and the key ideas below, then move into the national baseline, local treatment paths, and contractor-level comparison views.</p>
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
function renderCmsGlossary() {
  const stackLayers = [
    {
      term: "NCD",
      role: "National coverage floor",
      detail: "A National Coverage Determination is the Medicare-wide baseline. For OSA, the NCDs define the covered sleep-test pathways and the first-line CPAP framework.",
      band: "Foundation",
      tone: "ncd"
    },
    {
      term: "LCD",
      role: "Local contractor coverage rule",
      detail: "A Local Coverage Determination is written by a Medicare Administrative Contractor, or MAC, for one contractor jurisdiction rather than one state. In practice, that means an LCD usually applies to a multi-state regional claims area. LCDs can reuse the NCD, narrow it, operationalize it, or create a therapy-specific treatment path.",
      band: "Local overlay",
      tone: "lcd"
    },
    {
      term: "CMS Article",
      role: "Companion billing/coding record",
      detail: "In the Medicare Coverage Database, an Article is CMS's own record type for companion billing and coding instructions. It is not a journal article. This is the layer that translates coverage into ICD-10, HCPCS/CPT, modifiers, and documentation instructions.",
      band: "Execution layer",
      tone: "article"
    },
    {
      term: "Response record",
      role: "Revision and governance context",
      detail: "Response-to-comments documents explain why a policy changed, which objections were answered, and whether a treatment path is current, retired, or consolidated into another LCD.",
      band: "Change history",
      tone: "response"
    }
  ];
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">CMS Vocabulary</div>
          <h2>The Policy Stack In Plain Language</h2>
          <p class="section-copy">If you know the medicine but not CMS policy mechanics, this is the translation layer. Read these records as one layered stack: national baseline first, then local policy, then billing execution, with response records explaining how the wording changed over time.</p>
        </div>
      </div>

      <div class="record-stack-panel">
        <div class="record-stack-caption">One stack, from baseline to execution</div>
        <div class="record-stack-visual">
          ${stackLayers.map((layer) => `
                <article class="stack-layer stack-layer-${layer.tone}">
                  <div class="stack-layer-top">
                    <span class="tutorial-term">${escapeHtml(layer.term)}</span>
                    <span class="stack-layer-role">${escapeHtml(layer.band)}</span>
                  </div>
                  <h3>${escapeHtml(layer.role)}</h3>
                  <div class="stack-layer-detail">${escapeHtml(layer.detail)}</div>
                </article>
              `).join("")}
        </div>

        <div class="stack-sidecar">
          <span class="tutorial-term">MAC</span>
          <div class="stack-sidecar-body">Medicare Administrative Contractor. This is the regional payer entity that writes LCDs and associated CMS Articles for its jurisdictions. CMS organizes these as geographic jurisdictions rather than state-by-state policies; the current CMS MAC pages describe 12 Part A/B MAC jurisdictions and 4 DME MAC jurisdictions.</div>
        </div>
      </div>
    </section>
  `;
}
function renderSourceLandscape(model) {
  const recordCounts = {
    docs: model.sourceDocuments.length,
    ncds: model.sourceDocuments.filter((source) => source.type === "NCD").length,
    lcds: model.sourceDocuments.filter((source) => source.type === "LCD").length,
    articles: model.sourceDocuments.filter((source) => source.type === "Article" && !source.title.startsWith("Response to Comments")).length
  };
  const exampleRecords = [
    {
      type: "NCD",
      displayId: "240.4.1",
      title: "Sleep Testing for OSA",
      snippet: "Type I PSG, Type II, Type III, Type IV, and PAT-based multi-channel pathways can all qualify when the technical criteria are met.",
      meaning: "This is a baseline evidence rule. It tells you what kinds of sleep studies Medicare will accept as establishing the diagnosis.",
      variant: "ncd"
    },
    {
      type: "LCD",
      displayId: "L33718",
      title: "PAP Devices for OSA",
      snippet: "Objective adherence is defined as at least 4 hours per night on at least 70% of nights in a consecutive 30-day period, with follow-up between days 31 and 91.",
      meaning: "This is a local workflow rule. The national CPAP policy creates the treatment concept, and the LCD turns it into an auditable continuation rule.",
      variant: "lcd"
    },
    {
      type: "Article",
      displayId: "A57948",
      title: "Billing and Coding for Hypoglossal Nerve Stimulation (HGNS)",
      snippet: "Claims for hypoglossal nerve stimulation (HGNS) anchor on G47.33 and use companion BMI diagnosis-code lanes that can extend beyond the clinical BMI ceiling stated in the LCD text.",
      meaning: "This is a claim-execution rule. Hypoglossal nerve stimulation, or HGNS, is the implanted upper-airway stimulation therapy used later in the tutorial. This example shows why the billing article matters: claim logic can diverge from the clinical LCD wording.",
      variant: "article"
    },
    {
      type: "Response record",
      displayId: "A58070",
      title: "Hypoglossal Nerve Stimulation (HGNS) Response to Comments",
      snippet: "Stakeholder feedback and the contractor’s rationale for the final wording are preserved as part of the rollout history.",
      meaning: "This is a governance record. It helps explain why a policy looks the way it does and whether a variant is current or historical.",
      variant: "article"
    }
  ];
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Public Records</div>
          <h2>What Already Exists In The Public Documents</h2>
          <p class="section-copy">This tutorial is hand-curated, but the source material is public. In this OSA prototype, ${recordCounts.docs} CMS records were reviewed, including ${recordCounts.ncds} NCDs, ${recordCounts.lcds} LCDs, and ${recordCounts.articles} billing articles. The point of the page is to show the structure those documents already contain and the kinds of extraction an AI-assisted pipeline can recover.</p>
        </div>
      </div>

      <div class="tutorial-grid tutorial-grid-4">
        ${exampleRecords.map((record) => `
              <article class="tutorial-card example-card">
                <div class="tutorial-card-top">
                  ${docChip(model, record.displayId, record.displayId, record.variant, record.title)}
                  <span class="tutorial-label">${escapeHtml(record.type)}</span>
                </div>
                <h3>${escapeHtml(record.title)}</h3>
                <div class="example-snippet-label">Paraphrased rule from this document</div>
                <div class="example-snippet">${escapeHtml(record.snippet)}</div>
                <div class="example-meaning-label">What this means</div>
                <p>${escapeHtml(record.meaning)}</p>
              </article>
            `).join("")}
      </div>
    </section>
  `;
}
function renderDocumentRuleCard(model, profile, options = {}) {
  const requirements = requirementMap(model);
  return `
    <article class="doc-rule-card">
      <div class="doc-rule-head">
        <div>
          ${options.marker ? `
                <div class="doc-rule-marker-row">
                  <span class="doc-rule-marker">${escapeHtml(options.marker)}</span>
                  ${options.synopsis ? `<span class="doc-rule-marker-copy">${escapeHtml(options.synopsis)}</span>` : ""}
                </div>
              ` : ""}
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
        ${profile.statements.map((item) => renderRuleStatementCard(requirements, item)).join("")}
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
  const atGlanceItems = [
    {
      marker: "1",
      label: "Diagnosis floor",
      copy: "Which sleep tests count and what severity logic can establish OSA in coverage terms."
    },
    {
      marker: "2",
      label: "First-line PAP rule",
      copy: "How the national CPAP pathway defines who qualifies and the basic trial concept."
    }
  ];
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">National Layer</div>
          <h2>What The NCDs Already Contain</h2>
          <p class="section-copy">The source NCDs are plain-language CMS documents, not pre-structured data. This section shows what the tutorial extracted from those documents: accepted sleep-test types, severity thresholds, mild-disease exceptions, and the initial CPAP trial concept.</p>
        </div>
      </div>

      <div class="glance-row">
        ${atGlanceItems.map((item) => `
              <div class="glance-item">
                <span class="glance-index">${escapeHtml(item.marker)}</span>
                <div class="glance-copy">
                  <strong>${escapeHtml(item.label)}</strong>
                  <span>${escapeHtml(item.copy)}</span>
                </div>
              </div>
            `).join("")}
      </div>

      <div class="tutorial-grid tutorial-grid-2">
        ${ncdProfiles.map((profile, index) => renderDocumentRuleCard(model, profile, {
    marker: atGlanceItems[index]?.marker,
    synopsis: atGlanceItems[index]?.label
  })).join("")}
      </div>
    </section>
  `;
}
function renderInsights(model) {
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Why This Model Matters</div>
          <h2>Abstraction Pays Off</h2>
        </div>
      </div>

      <div class="insight-grid">
        ${model.insights.map((insight) => `
              <article class="insight-card">
                <h3>${escapeHtml(insight.title)}</h3>
                <p>${escapeHtml(insight.body)}</p>
                <div class="source-row">${sourceLinks(model, insight.sourceIds)}</div>
              </article>
            `).join("")}
      </div>
    </section>
  `;
}
function renderFamilyRail(model) {
  const selectedFamily = currentFamily(model);
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Downstream Branches</div>
          <h2>Choose A Therapy Lens</h2>
          <p class="section-copy">After the national NCD baseline is established, each treatment path changes the logic differently. Select a treatment path and the next sections will show how local policy reuses, narrows, operationalizes, or replaces that baseline.</p>
        </div>
      </div>

      <div class="family-select-row">
        <label class="family-select-label" for="family-select">Treatment path in focus</label>
        <select class="family-select" id="family-select" aria-label="Select treatment path in focus">
          ${model.policyFamilies.map((family) => `
                <option value="${family.id}" ${family.id === state.selectedFamilyId ? "selected" : ""}>
                  ${escapeHtml(family.label)}
                </option>
              `).join("")}
        </select>
        <span class="family-select-note">${escapeHtml(selectedFamily.label)} is highlighted in the comparisons below.</span>
      </div>

      <div class="family-rail">
        ${model.policyFamilies.map((family) => {
    const selected = family.id === state.selectedFamilyId;
    return `
              <button class="family-card ${toneClass(family.tone)} ${selected ? "is-active" : ""}" data-family="${family.id}" aria-pressed="${selected ? "true" : "false"}" title="View ${escapeHtml(family.label)}">
                <div class="family-stage">${escapeHtml(family.stage)}</div>
                <div class="family-title">${escapeHtml(family.label)}</div>
                <p class="family-summary">${escapeHtml(family.summary)}</p>
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
          <p class="section-copy">These four fields are the normalized summary. The exact source records and the concrete criteria used to build that summary are listed directly underneath.</p>
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
                ${renderProfileSourceSection(model, family, treatment, layering)}
                ${renderCriterionEvidenceList(model, "Inherited baseline rules", list(layering?.baselineCriteria), "No inherited baseline rules are listed for this path.")}
                ${renderCriterionEvidenceList(model, "Concrete local rules for this path", list(layering?.overlayCriteria).length ? list(layering?.overlayCriteria) : keyRequirements.map((item, index) => ({
    id: `fallback-${family.id}-${index}`,
    text: item,
    kind: "criterion",
    sourceIds: family.sourceIds
  })), "No concrete local rules are listed for this path.")}
              ` : ""}

          <h3>Machine Payoff</h3>
          <p class="focus-payoff">${escapeHtml(family.machinePayoff)}</p>
          <div class="focus-meta-grid">
            <div class="focus-meta-card">
              <span>Layer model</span>
              <strong>${layering ? "Explicit baseline + local change" : "Shared path only"}</strong>
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
function renderMacVariation(model) {
  const comparison = model.crossMacComparison;
  const macTables = model.perMacCodeTables;
  const rules = ruleMetamodel(model);
  if (!comparison || !macTables?.hgns?.length) {
    return "";
  }
  const contractors = comparison.criteriaMatrix.contractors;
  const criteria = comparison.criteriaMatrix.criteria;
  const currentFamilyIsHgns = state.selectedFamilyId === "hgns";
  const codeRows = list(macTables.hgns);
  const realDifferences = list(comparison.realDifferences);
  const contractorVariance = rules?.contractorVariance;
  const varianceDimensions = new Map(list(contractorVariance?.dimensions).map((item) => [item.id, item.label]));
  const clinicalVarianceRows = list(contractorVariance?.rows).filter((row) => row.dimensionId !== "billing");
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
  const renderContractorHeader = (contractor) => {
    const parts = contractorDisplayParts(contractor);
    return `
      <div class="table-col-stack">
        <div class="table-col-head">${escapeHtml(parts.name)}</div>
        <div class="table-col-subtle">${escapeHtml(parts.jurisdiction)}</div>
        <div class="table-col-doc">${docChip(model, contractor.lcd, contractor.lcd, "lcd", `${parts.name} LCD`)}</div>
      </div>
    `;
  };
  const valuePill = (value) => {
    const tone = value === "Current article" ? "teal" : value === "Retired legacy article" ? "rose" : value === "Aligned" ? "teal" : value === "Above clinical cap" ? "amber" : value === "Yes" ? "blue" : value === "No" ? "muted" : "muted";
    return `<span class="value-pill is-${tone}">${escapeHtml(value)}</span>`;
  };
  const variationRows = [
    {
      label: "Companion billing article curated",
      description: "Whether the integrated dataset includes a companion billing article for that contractor jurisdiction.",
      values: contractors.map((contractor) => billingByContractor.get(contractor.id) ? "Yes" : "No")
    },
    {
      label: "Billing article status",
      description: "Whether the record shown here is the current billing article or an older retired article kept only for comparison.",
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
      description: "Maximum BMI represented in the coded BMI diagnosis range for hypoglossal nerve stimulation billing.",
      values: contractors.map((contractor) => {
        const row = contractorCodeRow.get(contractor.id);
        return row?.bmiMaxValue != null ? row.bmiMaxValue.toFixed(1) : "Not modeled";
      })
    },
    {
      label: "Billing article aligned with LCD text",
      description: "Whether the coded BMI ceiling stays inside the LCD's clinical BMI < 35 rule.",
      values: contractors.map((contractor) => {
        const row = contractorCodeRow.get(contractor.id);
        if (row?.bmiMaxValue == null) {
          return "Unknown";
        }
        return row.bmiMaxValue <= 34.9 ? "Aligned" : "Above clinical cap";
      })
    },
    {
      label: "Legacy CPT 64568 reference",
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
  const fallbackClinicalDiffCount = realDifferences.filter((item) => item.category.startsWith("LCD:")).length;
  const differenceGroupDefs = list(comparison.differenceGroups).length > 0 ? list(comparison.differenceGroups) : [
    {
      id: "clinical",
      label: "Clinical rule differences",
      intro: "The normalized HGNS core is mostly shared. The clinical spread comes from a few contractor-specific wording or measurement choices."
    },
    {
      id: "billing",
      label: "Billing and coding differences",
      intro: "Most contractor spread lives in the companion billing articles rather than in the LCD eligibility core."
    },
    {
      id: "governance",
      label: "Lifecycle and document-structure differences",
      intro: "Some differences are about retired records, shorter or longer LCD formats, and how much supporting context each contractor publishes."
    }
  ];
  const differenceGroupLabels = new Map(differenceGroupDefs.map((group) => [group.id, group.label]));
  const clinicalDiffCount = realDifferences.filter((item) => item.kind === "clinical").length;
  const billingDiffCount = realDifferences.filter((item) => item.kind === "billing").length;
  const governanceDiffCount = realDifferences.filter((item) => item.kind === "governance").length;
  const retiredMacCount = new Set(realDifferences.filter((item) => item.id === "governance-retired-document").flatMap((item) => item.affectedMacs)).size;
  const currentMacCount = contractors.length - retiredMacCount;
  return `
    <section class="panel panel-hgns-variation">
      <div class="section-head">
        <div>
          <div class="eyebrow">Variation Surface</div>
          <h2>Hypoglossal Nerve Stimulation (HGNS) LCDs Mostly Align Clinically. Here Is Where They Actually Diverge.</h2>
          <p class="section-copy">At the normalized clinical-core level, all eight modeled hypoglossal nerve stimulation LCDs include the same main requirements. The meaningful spread is narrower and easier to name: a few clinical wording or provider-rule differences, a larger set of billing-article differences, and some lifecycle or document-structure differences. These columns are contractor jurisdictions, not states. This prototype shows ${currentMacCount} current HGNS LCDs plus ${retiredMacCount} retired legacy LCD retained for comparison. ${currentFamilyIsHgns ? "This treatment path is in focus." : "The view stays visible because HGNS is the only multi-jurisdiction treatment path in this prototype."}</p>
        </div>
      </div>

      <div class="comparison-chips">
        ${noteChip(`${criteria.length} clinical criteria`, "neutral")}
        ${noteChip(`${contractors.length} contractor variants`, "neutral")}
        ${noteChip(`${comparison.bmiCodeVariation ? Object.keys(comparison.bmiCodeVariation.macBmiMaxCode).length : 0} BMI code lanes`, "neutral")}
        ${realDifferences.length ? noteChip(`${realDifferences.length} material differences captured`, "amber", "The normalized checkmark grid is aligned, but the integrated model still captures real cross-MAC differences.") : ""}
        ${clinicalDiffCount || fallbackClinicalDiffCount ? noteChip(`${clinicalDiffCount || fallbackClinicalDiffCount} clinical-rule differences`, "rose", "At least one LCD uses materially different wording, measurement windows, or provider rules even though the normalized core remains aligned.") : ""}
        ${billingDiffCount ? noteChip(`${billingDiffCount} billing / coding differences`, "blue") : ""}
        ${governanceDiffCount ? noteChip(`${governanceDiffCount} lifecycle / structure differences`, "neutral") : ""}
      </div>

      <div class="tutorial-grid tutorial-grid-3">
        <article class="tutorial-card">
          <div class="eyebrow">Term That Matters Here</div>
          <h3>What HGNS means</h3>
          <p>HGNS stands for hypoglossal nerve stimulation, the implanted upper-airway stimulation therapy used for selected patients with obstructive sleep apnea after CPAP failure or intolerance.</p>
        </article>
        <article class="tutorial-card">
          <div class="eyebrow">How To Read The Columns</div>
          <h3>What JE, JF, JJ, and similar labels mean</h3>
          <p>Those labels are Medicare contractor jurisdictions, not states. Each contractor LCD usually governs a multi-state regional claims area, so the comparison is across contractor regions rather than 50 separate state policies.</p>
        </article>
        <article class="tutorial-card">
          <div class="eyebrow">Why This Becomes Analytic</div>
          <h3>When an LCD and billing article part ways</h3>
          <p>The clearest mismatch in this prototype is Noridian's BMI handling: the LCD text still says BMI under 35, while the companion billing article accepts diagnosis codes up through BMI 39.9. That is a local LCD-versus-article mismatch.</p>
        </article>
      </div>

      <div class="variation-summary-callout">
        <strong>${escapeHtml(comparison.verdictSummary ?? "Clinical-core presence is aligned, but the integrated model still captures real contractor variation.")}</strong>
        <span>The all-checkmark grid later in this section is only a presence test. The clinical wording table below is where the actual differences in phrasing, measurement windows, and provider requirements are made explicit.</span>
      </div>

      ${clinicalVarianceRows.length ? `
            <div class="section-head secondary">
              <div>
                <h3>Actual clinical wording or provider differences</h3>
                <p class="section-copy">These rows are still part of the clinical or provider layer. They matter even though the normalized clinical-core presence grid below remains all checkmarks.</p>
              </div>
            </div>

            <div class="matrix-wrap">
              <table class="matrix-table">
                <thead>
                  <tr>
                    <th>Clinical or provider difference</th>
                    ${contractors.map((contractor) => `<th>${renderContractorHeader(contractor)}</th>`).join("")}
                    <th>Spread</th>
                  </tr>
                </thead>
                <tbody>
                  ${clinicalVarianceRows.map((row) => {
    const byContractor = new Map(row.contractorValues.map((item) => [item.contractorId, item]));
    const values = contractors.map((contractor) => byContractor.get(contractor.id)?.valueSummary ?? "Not modeled");
    const summary = summarizeValues(values);
    return `
                        <tr>
                          <td>
                            <div class="variation-label">${escapeHtml(row.label)}</div>
                            <div class="variation-note">${escapeHtml(varianceDimensions.get(row.dimensionId) ?? row.dimensionId)}. ${escapeHtml(row.takeaway)}</div>
                          </td>
                          ${contractors.map((contractor) => {
      const value = byContractor.get(contractor.id);
      return `
                                <td class="variance-value-cell ${value?.relation === "differs" ? "is-different" : ""}">
                                  <div class="variance-value-main">${escapeHtml(value?.valueSummary ?? "Not modeled")}</div>
                                </td>
                              `;
    }).join("")}
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
          ` : ""}

      <div class="section-head secondary">
        <div>
          <h3>Presence of normalized clinical-core criteria</h3>
          <p class="section-copy">A checkmark here means only that the criterion appears somewhere in that LCD. It does not claim the exact wording, measurement window, or provider definition is identical.</p>
        </div>
      </div>

      <div class="matrix-wrap">
        <table class="matrix-table">
          <thead>
            <tr>
              <th>Clinical-core criterion</th>
              ${contractors.map((contractor) => `<th>${renderContractorHeader(contractor)}</th>`).join("")}
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
            <div class="section-head secondary">
              <div>
                <h3>Material differences captured from the documents</h3>
                <p class="section-copy">This ledger spells out the narrative differences the model extracted, including whether they live in clinical wording, billing articles, or governance history.</p>
              </div>
            </div>

            <div class="matrix-wrap difference-ledger">
              <table class="matrix-table">
                <thead>
                  <tr>
                    <th>Material difference captured</th>
                    <th>Impact</th>
                    <th>Affected contractor jurisdictions</th>
                    <th>What the model says</th>
                  </tr>
                </thead>
                <tbody>
                  ${realDifferences.map((difference) => {
    const described = describeMaterialDifference(difference);
    return `
                        <tr>
                          <td>
                            <div class="variation-label">${escapeHtml(described.label)}</div>
                            ${difference.kind ? `<div class="variation-note">${escapeHtml(differenceGroupLabels.get(difference.kind) ?? difference.kind)}</div>` : ""}
                          </td>
                          <td><span class="value-pill is-${difference.severity === "high" ? "rose" : difference.severity === "medium" ? "amber" : "muted"}">${escapeHtml(difference.severity)}</span></td>
                          <td>
                            <div class="difference-mac-list">
                              ${difference.affectedMacs.map((item) => `<span class="mini-doc-chip is-neutral">${escapeHtml(friendlyAffectedMacName(item))}</span>`).join("")}
                            </div>
                          </td>
                          <td>
                            <div class="variation-label">${escapeHtml(described.description)}</div>
                            <div class="variation-note">${escapeHtml(described.detail)}</div>
                          </td>
                        </tr>
                      `;
  }).join("")}
                </tbody>
              </table>
            </div>
          ` : ""}

      <div class="section-head secondary">
        <div>
          <h3>Billing and article variation by contractor jurisdiction</h3>
          <p class="section-copy">This is the claim-execution layer. If a row differs here, the divergence usually lives in the companion billing article rather than in the main LCD eligibility text.</p>
        </div>
      </div>

      <div class="matrix-wrap variation-matrix">
        <table class="matrix-table">
          <thead>
            <tr>
              <th>Billing or article variation</th>
              ${contractors.map((contractor) => `<th>${renderContractorHeader(contractor)}</th>`).join("")}
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
          <p class="section-copy">The selected family now gets a true structured code view instead of a vague coding note. This is the strongest bridge between coverage criteria and claim execution. If you do not work in claims, a modifier is simply the short billing suffix that changes how a procedure code is interpreted on the claim.</p>
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

        <p class="section-copy">${escapeHtml(current?.summary ?? "Sleep testing and other baseline-only paths do not carry their own claim tables. Their structured coding burden appears in later treatment paths that inherit the diagnostic floor.")}</p>

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
function renderStructuredModelBrowser(model) {
  const rules = ruleMetamodel(model);
  const family = currentFamily(model);
  const treatment = currentTreatmentModel(model);
  const layering = currentLayeringModel(model);
  const summary = familyDeltaMap(model).get(state.selectedFamilyId);
  const profileIds = new Set([
    ...summary?.baselineDocumentIds ?? [],
    ...summary?.localDocumentIds ?? []
  ]);
  const selectedProfiles = list(rules?.documentProfiles).filter((profile) => profile.familyId === state.selectedFamilyId || profileIds.has(profile.documentId));
  const tabs = [
    {
      id: "overview",
      label: "Root model",
      description: "The top-level JSON organizes the tutorial into source documents, policy families, treatment models, comparisons, and rule abstractions.",
      payload: {
        meta: model.meta,
        sourceCounts: {
          total: model.sourceDocuments.length,
          ncds: model.sourceDocuments.filter((source) => source.type === "NCD").length,
          lcds: model.sourceDocuments.filter((source) => source.type === "LCD").length,
          articles: model.sourceDocuments.filter((source) => source.type === "Article").length
        },
        policyFamilies: model.policyFamilies.map((item) => ({
          id: item.id,
          label: item.label,
          stage: item.stage,
          tone: item.tone
        }))
      }
    },
    {
      id: "selected-path",
      label: "Selected path",
      description: "A treatment path combines a human-friendly summary, typed eligibility fields, layered baseline-vs-local logic, and linked source records.",
      payload: {
        selectedFamily: family,
        treatmentModel: treatment,
        layeringModel: layering
      }
    },
    {
      id: "document-packs",
      label: "Document packs",
      description: "Each NCD, LCD, or companion billing article is decomposed into structured statements tied to canonical requirements.",
      payload: selectedProfiles
    },
    {
      id: "cross-mac",
      label: "Cross-MAC variance",
      description: "The cross-MAC slice separates normalized clinical-core presence from contractor-specific wording, billing, and lifecycle differences.",
      payload: {
        criteriaMatrix: model.crossMacComparison?.criteriaMatrix,
        realDifferences: model.crossMacComparison?.realDifferences,
        contractorVariance: rules?.contractorVariance
      }
    }
  ];
  const activeTab = tabs.find((tab) => tab.id === state.selectedModelTab) ?? tabs[0];
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Structured Output</div>
          <h2>What The Underlying JSON Actually Looks Like</h2>
          <p class="section-copy">The visuals above are just one rendering of the curated structure. This browser shows the actual JSON slices that drive the tutorial, so you can see how a machine-readable model makes the comparisons straightforward.</p>
        </div>
      </div>

      <div class="json-browser-tabs">
        ${tabs.map((tab) => `
              <button class="json-tab ${tab.id === activeTab.id ? "is-active" : ""}" data-model-tab="${tab.id}" aria-pressed="${tab.id === activeTab.id ? "true" : "false"}">
                ${escapeHtml(tab.label)}
              </button>
            `).join("")}
      </div>

      <article class="json-browser-card">
        <div class="json-browser-copy">
          <div class="eyebrow">Current slice</div>
          <h3>${escapeHtml(activeTab.label)}</h3>
          <p>${escapeHtml(activeTab.description)}</p>
        </div>
        ${renderJsonPreview(activeTab.payload)}
      </article>
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
      ${renderCmsGlossary()}
      ${renderChapterIntro(1, "Public Policy Material", "What Structure Is Already Present In The Source Documents?", "Only after the orientation do we pivot to the source material itself. OSA is the lens, but the lesson is about the underlying structure already present in CMS policy documents.")}
      ${renderSourceLandscape(model)}

      ${renderChapterIntro(2, "National Baseline", "The NCDs Already Encode A Policy Grammar", "The OSA NCDs are not just prose. Once extracted, they define valid diagnostic modalities, severity thresholds, mild-disease exceptions, and the first-line CPAP pathway.")}
      ${renderNcdTutorial(model)}

      ${renderChapterIntro(3, "Local Interaction", "How LCDs Constrain, Operationalize, Or Replace The NCD", "Next the tutorial pivots from the national floor to local therapy branches. This is where the same OSA domain becomes different policy depending on device, procedure, and contractor context.")}
      ${renderFamilyRail(model)}
      ${renderFamilyFocus(model)}

      ${renderChapterIntro(4, "Consistency Vs Conflict", "Where Local Policies Align And Where They Really Diverge", "Hypoglossal nerve stimulation (HGNS) is the best OSA stress test. On the surface the LCDs look nearly identical. Once structured, the real differences become explicit in wording, provider rules, lifecycle status, and billing articles.")}
      ${renderMacVariation(model)}

      ${renderChapterIntro(5, "Why It Matters", "Why Articles And Structure Matter", "The last step is to show why the article layer matters at all: it is where the clinical policy turns into code ranges, modifiers, and adjudication logic that can diverge across contractors even when the LCD text looks aligned.")}
      ${renderCodeAtlas(model)}
      ${renderInsights(model)}
      ${renderChapterIntro(6, "Structured Output", "The Tutorial Is Backed By Explicit JSON, Not Hidden Glue Code", "The last view drops below the polished cards and tables and shows the structured slices directly. This is the machine-readable layer that lets an agent compare NCDs, LCDs, and articles without starting over from raw prose each time.")}
      ${renderStructuredModelBrowser(model)}

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
  const familySelect = document.querySelector("#family-select");
  familySelect?.addEventListener("change", () => {
    const familyId = familySelect.value;
    if (!familyId || !state.model || familyId === state.selectedFamilyId) {
      return;
    }
    state.selectedFamilyId = familyId;
    render(state.model);
  });
  document.querySelectorAll("[data-model-tab]").forEach((element) => {
    element.addEventListener("click", () => {
      const tabId = element.dataset.modelTab;
      if (!tabId || !state.model || tabId === state.selectedModelTab) {
        return;
      }
      state.selectedModelTab = tabId;
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
