// src/viewer.ts
var state = {
  model: null,
  selectedFamilyId: "hgns",
  selectedModelTab: "overview",
  selectedContractorId: "palmetto"
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
function familyIdForTreatmentId(treatmentId) {
  return treatmentId === "cpap" ? "pap-therapy" : treatmentId;
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
function renderJsonPreview(value) {
  return `<pre class="json-browser-pre">${escapeHtml(JSON.stringify(value, null, 2))}</pre>`;
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
function renderHero(model) {
  return `
    <section class="hero hero-single panel">
      <div class="hero-copy">
        <div class="eyebrow">Interactive Tutorial</div>
        <h1>How Medicare Coverage Policy Gets Structured</h1>
        <p class="hero-subtitle">Obstructive sleep apnea (OSA) coverage spans national policy, local contractor policy, and billing guidance. These public documents form a layered stack that can be turned into structured, comparable data.</p>
      </div>
    </section>

    <div class="hero-stats tutorial-stats">
      ${renderStat("CMS docs reviewed", String(model.sourceDocuments.length), "public source records in scope")}
      ${renderStat("Treatment paths", String(list(model.treatmentModels).length), "therapy options modeled")}
      ${renderStat("Requirement entities", String(list(ruleMetamodel(model)?.requirementCatalog).length), "canonical reusable policy concepts")}
      ${renderStat("Contractor jurisdictions", String(model.crossMacComparison?.criteriaMatrix.contractors.length ?? 0), "MAC regions compared")}
    </div>
  `;
}
function renderDiseaseLandscape(model) {
  const disease = model.disease;
  const pathway = model.treatmentPathway;
  const treatments = list(model.treatmentModels);
  if (!disease) {
    return "";
  }
  const clinicalDefs = disease.clinicalDefinitions ?? {};
  const clinicalTerms = [
    { term: "AHI", definition: clinicalDefs["ahi"] },
    { term: "RDI", definition: clinicalDefs["rdi"] },
    { term: "BMI", definition: clinicalDefs["bmi"] },
    { term: "PSG", definition: clinicalDefs["psg"] }
  ];
  const treatmentRows = ["cpap", "hgns", "oral-appliance", "surgery"].map((id) => treatmentModelMap(model).get(id)).filter((t) => Boolean(t));
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Clinical Context</div>
          <h2>The Disease And The Treatment Landscape</h2>
          <p class="section-copy">Obstructive sleep apnea (OSA) is a common sleep disorder measured by a single severity index. Multiple treatments exist because patients fail or cannot tolerate the first-line option, and each alternative has its own coverage rules.</p>
        </div>
      </div>

      <p class="section-copy">${escapeHtml(disease.definition)}</p>

      <div class="section-head secondary">
        <div><h3>Four Clinical Terms Used In Coverage Rules</h3></div>
      </div>

      <div class="clinical-terms">
        ${clinicalTerms.map((item) => `
          <div class="clinical-term">
            <strong>${escapeHtml(item.term)}</strong>
            <span>${escapeHtml(item.definition)}</span>
          </div>
        `).join("")}
      </div>

      <div class="section-head secondary">
        <div>
          <h3>Severity Scale</h3>
          <p class="section-copy">AHI thresholds define mild, moderate, and severe OSA and drive most eligibility gates.</p>
        </div>
      </div>

      <div class="severity-bar">
        ${disease.severityScale.map((segment) => `
          <div class="severity-segment" style="background: ${escapeHtml(segment.color)}">
            <span class="severity-segment-label">${escapeHtml(segment.label)}</span>
            <span class="severity-segment-ahi">${escapeHtml(segment.ahi)}</span>
          </div>
        `).join("")}
      </div>

      ${pathway ? `
        <div class="section-head secondary">
          <div>
            <h3>Treatment Pathway</h3>
            <p class="section-copy">${escapeHtml(pathway.description)}</p>
          </div>
        </div>

        <div class="pathway-steps">
          ${pathway.steps.map((step, index) => {
    const isLast = index === pathway.steps.length - 1;
    if (isLast && step.branches?.length) {
      return `
                ${index > 0 ? `<div class="pathway-arrow"><div><div>&#8594;</div><div class="pathway-arrow-label">CPAP failure or intolerance</div></div></div>` : ""}
                <div class="pathway-step">
                  <div class="pathway-step-number">${step.order}</div>
                  <h4>${escapeHtml(step.label)}</h4>
                  <p>${escapeHtml(step.description)}</p>
                  <div class="pathway-branches">
                    ${step.branches.map((branch) => {
        const branchLabels = {};
        for (const t of list(model.treatmentModels)) {
          branchLabels[t.id] = t.label;
          branchLabels[familyIdForTreatmentId(t.id)] = t.label;
        }
        return `
                        <div class="pathway-branch">
                          <strong>${escapeHtml(branchLabels[branch] ?? branch)}</strong>
                        </div>
                      `;
      }).join("")}
                  </div>
                </div>
              `;
    }
    return `
              ${index > 0 ? `<div class="pathway-arrow"><div>&#8594;</div></div>` : ""}
              <div class="pathway-step">
                <div class="pathway-step-number">${step.order}</div>
                <h4>${escapeHtml(step.label)}</h4>
                <p>${escapeHtml(step.description)}</p>
              </div>
            `;
  }).join("")}
        </div>

        <p class="section-copy">${escapeHtml(treatmentModelMap(model).get("hgns")?.description ?? "")}</p>
      ` : ""}

      ${(() => {
    const cpap = treatmentRows.find((t) => t.id === "cpap");
    if (!cpap)
      return "";
    return `
          <div class="section-head secondary">
            <div>
              <h3>What The National Policy Requires For CPAP</h3>
              <p class="section-copy">CPAP is the only OSA treatment with a national coverage rule. These are the eligibility gates set at the federal level.</p>
            </div>
          </div>

          <div class="matrix-wrap">
            <table class="snapshot-table">
              <thead>
                <tr>
                  <th>Requirement</th>
                  <th>National rule</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Patient population</td><td>Adult patients with obstructive sleep apnea</td></tr>
                <tr><td>Diagnosis</td><td>Positive PSG or home sleep test (Type II-IV)</td></tr>
                <tr><td>AHI / RDI &ge; 15</td><td>Qualifies directly</td></tr>
                <tr><td>AHI / RDI 5&ndash;14</td><td>Qualifies only with symptoms or comorbidities (e.g., hypertension, heart disease, stroke)</td></tr>
                <tr><td>Initial coverage</td><td>Limited to a 12-week trial period</td></tr>
                <tr><td>BMI ceiling</td><td>None</td></tr>
                <tr><td>Minimum age</td><td>Adult (no numeric floor specified)</td></tr>
              </tbody>
            </table>
          </div>
        `;
  })()}
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
      description: "The top-level JSON organizes source documents, policy families, treatment models, comparisons, and rule abstractions.",
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
          <h2>The Underlying JSON</h2>
          <p class="section-copy">The visual sections above render from a single JSON model. Below are the actual JSON slices, showing how a machine-readable representation makes comparison straightforward.</p>
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
function renderCpapLayering(model) {
  const rules = ruleMetamodel(model);
  const requirements = requirementMap(model);
  const ncdProfile = rules.documentProfiles.find((p) => p.documentId === "ncd-cpap");
  const lcdProfile = rules.documentProfiles.find((p) => p.documentId === "lcd-pap-dme");
  const ncdStatementMap = new Map(ncdProfile.statements.map((s) => [s.requirementId, s]));
  const rows = lcdProfile.statements.map((lcdStatement) => {
    const ncdStatement = ncdStatementMap.get(lcdStatement.requirementId);
    const req = requirements.get(lcdStatement.requirementId);
    const label = req?.label ?? req?.shortLabel ?? lcdStatement.requirementId;
    return {
      label,
      ncdValue: ncdStatement?.valueSummary ?? "—",
      lcdValue: lcdStatement.valueSummary,
      relation: lcdStatement.relation
    };
  });
  for (const ncdStatement of ncdProfile.statements) {
    if (!lcdProfile.statements.some((s) => s.requirementId === ncdStatement.requirementId)) {
      const req = requirements.get(ncdStatement.requirementId);
      const label = req?.label ?? req?.shortLabel ?? ncdStatement.requirementId;
      rows.push({
        label,
        ncdValue: ncdStatement.valueSummary,
        lcdValue: "—",
        relation: ncdStatement.relation
      });
    }
  }
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Layering</div>
          <h2>How CPAP Coverage Layers: NCD vs LCD</h2>
        </div>
      </div>

      <p class="section-copy">Medicare coverage works as a stack. A National Coverage Determination (NCD) sets the baseline rule that applies everywhere. A Local Coverage Determination (LCD), written by a regional Medicare Administrative Contractor (MAC), can reuse, narrow, or operationalize that baseline for a specific region. A companion billing Article translates the result into diagnosis and procedure codes.</p>
      <p class="section-copy">NCD 240.4 is the national CPAP rule. LCD L33718 is the local PAP device policy written by the DME MACs (the contractors that handle durable medical equipment claims nationally). The table below shows how the LCD builds on the NCD requirement by requirement.</p>

      <div class="matrix-wrap">
        <table class="matrix-table">
          <thead>
            <tr>
              <th>Requirement</th>
              <th><div class="table-col-stack"><div class="table-col-head">National baseline</div><div class="table-col-subtle">NCD ${escapeHtml(ncdProfile.displayId)}</div></div></th>
              <th><div class="table-col-stack"><div class="table-col-head">Local PAP policy</div><div class="table-col-subtle">DME MAC &middot; LCD ${escapeHtml(lcdProfile.displayId)}</div></div></th>
              <th>Relation</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((row) => `
              <tr>
                <td class="variation-label">${escapeHtml(row.label)}</td>
                <td>${escapeHtml(row.ncdValue)}</td>
                <td>${escapeHtml(row.lcdValue)}</td>
                <td>${relationChip(row.relation, row.relation)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <p class="section-copy" style="margin-top: 14px;">Cells marked &lsquo;operationalizes&rsquo; are where the LCD turns a broad NCD concept into specific auditable thresholds. &lsquo;Narrows&rsquo; means the LCD adds a stricter gate.</p>
    </section>
  `;
}
function renderHgnsVariation(model) {
  const comparison = model.crossMacComparison;
  const rules = ruleMetamodel(model);
  const contractors = comparison.criteriaMatrix.contractors;
  const contractorVariance = rules.contractorVariance;
  const clinicalVarianceRows = list(contractorVariance?.rows).filter((row) => row.dimensionId !== "billing");
  const varianceDimensions = new Map(list(contractorVariance?.dimensions).map((item) => [item.id, item.label]));
  const renderContractorHeader = (contractor) => {
    const parts = contractorDisplayParts(contractor);
    return `
      <div class="table-col-stack">
        <div class="table-col-head">${escapeHtml(parts.name)}</div>
        <div class="table-col-subtle">${escapeHtml(contractor.lcd)}</div>
      </div>
    `;
  };
  const summarizeValues = (values) => {
    const counts = new Map;
    values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
    return [...counts.entries()].sort((left, right) => right[1] - left[1]);
  };
  const hgnsCommonCriteria = model.hgns.commonEligibility;
  const bmiDriftRows = list(model.perMacCodeTables?.hgns).filter((entry) => !entry.status || entry.status !== "Retired").filter((entry) => entry.bmiMaxValue != null).map((entry) => {
    const lcd = contractors.find((c) => entry.mac.toLowerCase().includes(c.name.toLowerCase().split(" ")[0].toLowerCase()));
    return {
      contractor: entry.mac,
      article: entry.article,
      lcd: lcd?.lcd ?? "",
      lcdText: "BMI < 35",
      billingCodes: `Z68.1–${entry.bmiMaxCode} (up to BMI ${entry.bmiMaxValue.toFixed(1)})`,
      drifts: entry.bmiMaxValue > 34.9
    };
  });
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Contractor Variation</div>
          <h2>HGNS: LCD-Only Coverage Across Contractors</h2>
        </div>
      </div>

      <p class="section-copy">${escapeHtml(treatmentModelMap(model).get("hgns")?.description ?? "")}</p>

      <div class="section-head secondary">
        <div><h3>Common HGNS Eligibility Criteria</h3></div>
      </div>

      <div class="matrix-wrap">
        <table class="snapshot-table">
          <thead>
            <tr><th>Eligibility criterion (all 8 HGNS LCDs agree on these)</th></tr>
          </thead>
          <tbody>
            ${hgnsCommonCriteria.map((item) => `
              <tr><td>${escapeHtml(item.label)}</td></tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      ${clinicalVarianceRows.length ? `
        <div class="section-head secondary">
          <div>
            <h3>Where Contractor Wording Diverges</h3>
          </div>
        </div>

        <div class="family-select-row" style="margin-bottom: 12px;">
          <label class="family-select-label" for="contractor-select">Focus on contractor</label>
          <select class="family-select" id="contractor-select" aria-label="Select contractor to highlight">
            ${contractors.map((c) => `<option value="${c.id}" ${c.id === state.selectedContractorId ? "selected" : ""}>${escapeHtml(contractorDisplayParts(c).name)} &middot; ${escapeHtml(c.lcd)}</option>`).join("")}
          </select>
        </div>

        <div class="matrix-wrap">
          <table class="matrix-table">
            <thead>
              <tr>
                <th>Clinical or provider difference</th>
                ${contractors.map((contractor) => `<th class="${contractor.id === state.selectedContractorId ? "is-current" : ""}">${renderContractorHeader(contractor)}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${clinicalVarianceRows.map((row) => {
    const byContractor = new Map(row.contractorValues.map((item) => [item.contractorId, item]));
    return `
                  <tr>
                    <td>
                      <div class="variation-label">${escapeHtml(row.label)}</div>
                      <div class="variation-note">${escapeHtml(varianceDimensions.get(row.dimensionId) ?? row.dimensionId)}. ${escapeHtml(row.takeaway)}</div>
                    </td>
                    ${contractors.map((contractor) => {
      const value = byContractor.get(contractor.id);
      return `
                        <td class="variance-value-cell ${value?.relation === "differs" ? "is-different" : ""} ${contractor.id === state.selectedContractorId ? "is-current" : ""}">
                          <div class="variance-value-main">${escapeHtml(value?.valueSummary ?? "Not modeled")}</div>
                        </td>
                      `;
    }).join("")}
                  </tr>
                `;
  }).join("")}
            </tbody>
          </table>
        </div>
      ` : ""}

      <div class="section-head secondary">
        <div>
          <h3>BMI Code Drift: LCD vs Billing Article</h3>
        </div>
      </div>

      <div class="matrix-wrap">
        <table class="matrix-table">
          <thead>
            <tr><th>Contractor</th><th>LCD clinical text</th><th>Billing article BMI codes</th><th>Aligned?</th></tr>
          </thead>
          <tbody>
            ${bmiDriftRows.map((row) => `
              <tr>
                <td>
                  <div class="variation-label">${escapeHtml(row.contractor)}</div>
                  <div class="source-row" style="margin-top:6px">${docChip(model, row.lcd, row.lcd, "lcd")} ${docChip(model, row.article, row.article, "article")}</div>
                </td>
                <td>${escapeHtml(row.lcdText)}</td>
                <td class="${row.drifts ? "is-different" : ""}">${escapeHtml(row.billingCodes)}</td>
                <td>${row.drifts ? `<span class="mini-doc-chip is-rose">Drift</span>` : `<span class="mini-doc-chip is-teal">Aligned</span>`}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <p class="section-copy" style="margin-top: 14px;">Noridian's billing article accepts BMI diagnosis codes beyond the clinical threshold in the LCD text. This is where the billing layer diverges from the clinical rule.</p>

      <div class="section-head secondary">
        <div>
          <h3>Requirement Lineage: NCD Baseline vs Selected Treatment Path</h3>
          <p class="section-copy">Each row is one coverage requirement. The left column shows the national NCD baseline. The right column shows what the selected treatment path does with that requirement. Relation labels: <strong>baseline</strong> = national rule; <strong>reuses</strong> = carried forward unchanged; <strong>narrows</strong> = made stricter; <strong>operationalizes</strong> = turned into auditable thresholds; <strong>adds</strong> = new local logic; <strong>differs</strong> = materially different rule.</p>
        </div>
      </div>

      ${renderLineageFocused(model)}
    </section>
  `;
}
function renderLineageFocused(model) {
  const rules = ruleMetamodel(model);
  const requirements = requirementMap(model);
  const groups = groupMap(model);
  const columns = rules.familyLineage.columns;
  const selectedColumn = columns.find((c) => c.familyId === state.selectedFamilyId) ?? columns[0];
  const baselineId = "sleep-testing";
  const filteredRows = rules.familyLineage.rows.filter((row) => {
    const baselineCell = row.cells.find((c) => c.familyId === baselineId);
    const selectedCell = row.cells.find((c) => c.familyId === state.selectedFamilyId);
    const baselineEmpty = !baselineCell || baselineCell.relation === "baseline" && baselineCell.valueSummary === "Not applicable";
    const selectedEmpty = !selectedCell || selectedCell.relation === "baseline" && selectedCell.valueSummary === "Not applicable";
    return !(baselineEmpty && selectedEmpty);
  });
  return `
    <div class="family-select-row" style="margin-bottom: 12px;">
      <label class="family-select-label" for="family-select">Compare NCD baseline against:</label>
      <select class="family-select" id="family-select" aria-label="Select treatment path to compare">
        ${columns.filter((c) => c.familyId !== baselineId).map((column) => `
              <option value="${column.familyId}" ${column.familyId === state.selectedFamilyId ? "selected" : ""}>
                ${escapeHtml(column.label)}
              </option>
            `).join("")}
      </select>
    </div>

    <div class="matrix-wrap">
      <table class="matrix-table lineage-table">
        <thead>
          <tr>
            <th>Requirement</th>
            <th><div class="table-col-head">NCD Baseline</div></th>
            <th class="is-current"><div class="table-col-head">${escapeHtml(selectedColumn.label)}</div></th>
            <th>Relation</th>
          </tr>
        </thead>
        <tbody>
          ${filteredRows.map((row) => {
    const requirement = requirements.get(row.requirementId);
    const group = requirement ? groups.get(requirement.groupId) : null;
    const baselineCell = row.cells.find((c) => c.familyId === baselineId);
    const selectedCell = row.cells.find((c) => c.familyId === state.selectedFamilyId);
    return `
                <tr>
                  <td class="lineage-requirement-cell">
                    <div class="variation-label">${escapeHtml(requirement?.label ?? row.requirementId)}</div>
                    ${group ? `<div class="table-col-subtle">${escapeHtml(group.label)}</div>` : ""}
                    <div class="variation-note">${escapeHtml(row.whyItMatters)}</div>
                  </td>
                  <td class="lineage-cell">
                    ${baselineCell ? `
                      <div class="lineage-value">${escapeHtml(baselineCell.valueSummary)}</div>
                      <div class="source-row">${sourceLinks(model, baselineCell.sourceDocumentIds.slice(0, 2))}${baselineCell.sourceDocumentIds.length > 2 ? `<span class="mini-doc-chip is-neutral">+${baselineCell.sourceDocumentIds.length - 2}</span>` : ""}</div>
                    ` : `<div class="variation-note">—</div>`}
                  </td>
                  <td class="lineage-cell is-current">
                    ${selectedCell ? `
                      <div class="lineage-value">${escapeHtml(selectedCell.valueSummary)}</div>
                      <div class="source-row">${sourceLinks(model, selectedCell.sourceDocumentIds.slice(0, 2))}${selectedCell.sourceDocumentIds.length > 2 ? `<span class="mini-doc-chip is-neutral">+${selectedCell.sourceDocumentIds.length - 2}</span>` : ""}</div>
                    ` : `<div class="variation-note">—</div>`}
                  </td>
                  <td>
                    ${selectedCell ? relationChip(selectedCell.relation, selectedCell.relation) : `<div class="variation-note">—</div>`}
                  </td>
                </tr>
              `;
  }).join("")}
        </tbody>
      </table>
    </div>
  `;
}
function renderStructuredPayoff(model) {
  const rules = ruleMetamodel(model);
  const treatments = ["cpap", "hgns", "oral-appliance", "surgery"].map((id) => treatmentModelMap(model).get(id)).filter((item) => Boolean(item));
  const maxAhi = 80;
  const toneByTreatment = new Map(model.policyFamilies.map((family) => [treatmentIdForFamilyId(family.id), family.tone]));
  const rangeBars = (treatment) => {
    return list(treatment.ahiRangeBars).map((bar) => ({
      ...bar,
      color: `var(--${toneByTreatment.get(treatment.id) ?? "blue"})`
    }));
  };
  const selectedTreatmentId = treatmentIdForFamilyId(state.selectedFamilyId);
  const selectedTreatment = treatmentModelMap(model).get(selectedTreatmentId);
  const selectedLabel = selectedTreatment?.shortLabel ?? state.selectedFamilyId;
  const lineageRows = rules.familyLineage.rows;
  const requirements = requirementMap(model);
  const baselineFamilyId = "sleep-testing";
  const selectedFamilyId = state.selectedFamilyId;
  return `
    <section class="panel panel-eligibility">
      <div class="section-head">
        <div>
          <div class="eyebrow">Comparison</div>
          <h2>Eligibility Landscape: NCD Baseline vs Selected Treatment</h2>
        </div>
      </div>

      <div class="range-ladder">
        ${treatments.map((treatment) => {
    const bars = rangeBars(treatment);
    const isCurrent = treatment.id === selectedTreatmentId;
    return `
              <div class="range-row ${isCurrent ? "is-current" : ""}">
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
              <th><div class="table-col-head">NCD baseline</div><div class="table-col-subtle">Sleep testing + CPAP national floor</div></th>
              <th class="is-current"><div class="table-col-head">${escapeHtml(selectedLabel)}</div></th>
              <th>Relation</th>
            </tr>
          </thead>
          <tbody>
            ${lineageRows.map((row) => {
    const req = requirements.get(row.requirementId);
    const baselineCell = row.cells.find((c) => c.familyId === baselineFamilyId) ?? row.cells.find((c) => c.familyId === "pap-therapy");
    const selectedCell = row.cells.find((c) => c.familyId === selectedFamilyId);
    if (!baselineCell && !selectedCell)
      return "";
    return `
                <tr>
                  <td class="variation-label">${escapeHtml(req?.label ?? row.requirementId)}</td>
                  <td class="eligibility-cell"><div class="eligibility-value">${escapeHtml(baselineCell?.valueSummary ?? "—")}</div></td>
                  <td class="eligibility-cell is-current"><div class="eligibility-value">${escapeHtml(selectedCell?.valueSummary ?? "—")}</div></td>
                  <td>${selectedCell ? relationChip(selectedCell.relation, selectedCell.relation) : "—"}</td>
                </tr>
              `;
  }).join("")}
          </tbody>
        </table>
      </div>
    </section>

    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Scope</div>
          <h2>What Structure Enables</h2>
        </div>
      </div>

      <div class="hero-stats tutorial-stats">
        ${renderStat("Documents reviewed", String(model.sourceDocuments.length), "public CMS source records")}
        ${renderStat("Requirements", String(rules.requirementCatalog.length), "canonical policy concepts")}
        ${renderStat("Document profiles", String(rules.documentProfiles.length), "structured document extracts")}
        ${renderStat("Contractor regions", String(model.crossMacComparison?.criteriaMatrix.contractors.length ?? 0), "MAC jurisdictions compared")}
      </div>

      ${(() => {
    const ctx = model.meta.institutionalContext;
    return ctx ? `<p class="section-copy">${escapeHtml(String(ctx.totalNCDs))} NCDs, ${escapeHtml(String(ctx.totalLCDs))} LCDs, and ${escapeHtml(String(ctx.totalArticles.toLocaleString()))} Articles exist in the CMS Medicare Coverage Database. ${escapeHtml(ctx.interoperabilityNote)}</p>` : "";
  })()}
    </section>

    ${renderStructuredModelBrowser(model)}
  `;
}
function render(model) {
  app.innerHTML = `
    <div class="codex-shell">
      <header class="masthead">
        <div>
          <div class="eyebrow">Curated Coverage Model</div>
          <div class="masthead-title">CMS Coverage Structure Through Obstructive Sleep Apnea</div>
        </div>
        <div class="masthead-note">Reviewed ${escapeHtml(formatDate(model.meta.reviewedOn))}</div>
      </header>

      <!-- Section 1: Hero + Disease Landscape -->
      ${renderHero(model)}
      ${renderDiseaseLandscape(model)}

      <!-- Section 2: CPAP layering (NCD vs LCD) -->
      ${renderCpapLayering(model)}

      <!-- Section 3: HGNS variation -->
      ${renderHgnsVariation(model)}

      <!-- Section 4: Structured payoff -->
      ${renderStructuredPayoff(model)}

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
  const contractorSelect = document.querySelector("#contractor-select");
  contractorSelect?.addEventListener("change", () => {
    const contractorId = contractorSelect.value;
    if (!contractorId || !state.model || contractorId === state.selectedContractorId) {
      return;
    }
    state.selectedContractorId = contractorId;
    render(state.model);
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
