interface ModelMeta {
  key: string;
  title: string;
  subtitle: string;
  reviewedOn: string;
  reviewMethod: string;
  focus: string;
}

interface SourceDocument {
  id: string;
  type: string;
  displayId: string;
  familyId: string;
  title: string;
  scope: string;
  contractor: string | null;
  effectiveDate: string;
  reviewUse: string;
  url: string;
}

interface PolicyFamily {
  id: string;
  label: string;
  stage: string;
  tone: string;
  summary: string;
  normalizedQuestions: string[];
  machinePayoff: string;
  sourceIds: string[];
}

interface MatrixAxis {
  id: string;
  label: string;
}

interface MatrixCell {
  axisId: string;
  emphasis: "strong" | "medium" | "light" | "none";
  value: string;
}

interface MatrixRow {
  familyId: string;
  cells: MatrixCell[];
}

interface EvidenceVariable {
  id: string;
  label: string;
  kind: string;
  capture: string;
  whyItMatters: string;
  usedBy: string[];
  sourceIds: string[];
}

interface SourceReferenceItem {
  label: string;
  variableId?: string;
  detail?: string;
  sourceIds?: string[];
}

interface HgnsOperation {
  label: string;
  detail: string;
  sourceIds: string[];
}

interface CodingStatBlock {
  procedureRows: number;
  icdCoveredRows: number;
  icdNotCoveredRows: number;
  billRows: number;
  revenueRows: number;
}

interface HgnsMacPolicy {
  mac: string;
  lcdDisplayId: string;
  articleDisplayId: string;
  effectiveDate: string;
  alignment: string;
  highlights: string[];
  documentationFocus: string[];
  coding: CodingStatBlock;
  sourceIds: string[];
}

interface HgnsModel {
  commonEligibility: SourceReferenceItem[];
  expandedContraindications: string[];
  operations: HgnsOperation[];
  normalizedCodingBundle: {
    procedureCodes: string[];
    primaryDiagnosisPattern: string;
    secondaryDiagnosisPattern: string;
    documentationArtifacts: string[];
    sourceIds: string[];
  };
  macPolicies: HgnsMacPolicy[];
}

interface LayerCriterion {
  id: string;
  text: string;
  kind: string;
  relation?: string;
  variableId?: string;
  sourceIds: string[];
}

interface LayeringModel {
  familyId: string;
  title: string;
  baselineLabel: string;
  baselineSummary: string;
  baselineSourceIds: string[];
  baselineCriteria: LayerCriterion[];
  overlayLabel: string;
  overlaySummary: string;
  overlaySourceIds: string[];
  overlayCriteria: LayerCriterion[];
  note: string;
}

interface CodeRow {
  code: string;
  system: string;
  coverage: string;
  description: string;
  notes?: string;
}

interface CodeGroup {
  label: string;
  note: string;
  sourceIds: string[];
  rows: CodeRow[];
}

interface CodeFamilyCatalog {
  familyId: string;
  title: string;
  summary: string;
  sourceIds: string[];
  groups: CodeGroup[];
}

interface HgnsMacVariationRow {
  mac: string;
  articleDisplayId: string;
  secondaryBmiCodes: string;
  clinicalRule: string;
  implication: string;
  sourceIds: string[];
}

interface CodeCatalog {
  families: CodeFamilyCatalog[];
  hgnsMacVariation: {
    title: string;
    summary: string;
    rows: HgnsMacVariationRow[];
  };
}

interface Insight {
  title: string;
  body: string;
  sourceIds: string[];
}

interface LinkedDocument {
  id: number;
  version: number;
  displayId: string;
  title?: string;
  contractor?: string;
  contractorType?: string;
  effectiveDate: string;
  status?: string;
  type?: string;
  contractCount?: number;
}

interface TreatmentCriteriaItem {
  label: string;
  ahiRange?: [number | null, number | null];
  additionalRequirements?: string[];
  requirements?: string[];
  requiresCpapFailure?: boolean;
  trialPeriod?: string;
}

interface TreatmentEligibility {
  ageMin: number | null;
  ageMax: number | null;
  bmiMax: number | null;
  ahiMin: number | null;
  ahiMax: number | null;
  requiresCpapFailure: boolean;
  criteria?: TreatmentCriteriaItem[];
  contraindications?: string[];
  providerRequirements?: string[];
  otherRequirements?: string[];
}

interface TreatmentDevice {
  hcpcs?: string;
  cpt?: string;
  label: string;
  covered?: boolean;
  notes?: string;
  type?: string;
}

interface TreatmentProcedure {
  label: string;
  cptCodes: string[];
  indication?: string | null;
  notes?: string;
  covered: boolean;
}

interface CoveredMethod {
  label: string;
  description: string;
  setting: string;
}

interface TrialRequirements {
  initialPeriod?: string;
  adherenceThreshold?: string;
  clinicalReEvaluation?: string;
  successCriteria?: string[];
  failureConsequence?: string;
}

interface TreatmentModel {
  id: string;
  category: string;
  label: string;
  shortLabel: string;
  ncd?: LinkedDocument | null;
  lcds?: LinkedDocument[];
  articles?: LinkedDocument[];
  eligibility: TreatmentEligibility;
  coveredMethods?: CoveredMethod[];
  devices?: TreatmentDevice[];
  procedureCodes?: TreatmentDevice[];
  procedures?: TreatmentProcedure[];
  trialRequirements?: TrialRequirements;
  notCovered?: string[];
  icd10Required?: {
    primary?: Array<{ code: string; description: string }>;
    secondary?: string;
  };
  deviceInfo?: {
    components?: string[];
    batteryLife?: string;
  };
}

interface TreatmentPathwayStep {
  order: number;
  id: string;
  label: string;
  icon?: string;
  ncdId?: string;
  description: string;
  branches?: string[];
}

interface TreatmentPathway {
  description: string;
  steps: TreatmentPathwayStep[];
}

interface DiseaseModel {
  key: string;
  label: string;
  icd10Primary: string;
  definition: string;
  clinicalDefinitions?: Record<string, string>;
  severityScale: Array<{ label: string; ahi: string; color: string }>;
}

interface PerMacCodeEntry {
  mac: string;
  article: string;
  cptCodes?: string[];
  icd10Primary?: string[];
  icd10SecondaryBmi?: string[];
  bmiMaxCode?: string;
  bmiMaxValue?: number;
  codingNotes?: string[];
  status?: string;
  icd10Covered?: Array<{ code: string; description: string; applicableProcedures?: string[]; note?: string }>;
  notCoveredProcedures?: string[];
}

interface PerMacCodeTables {
  description: string;
  hgns?: PerMacCodeEntry[];
  surgery?: PerMacCodeEntry[];
}

interface CrossMacComparison {
  description: string;
  criteriaMatrix: {
    contractors: Array<{ id: string; name: string; lcd: string; region: string }>;
    criteria: Array<{ id: string; label: string; values: Record<string, boolean> }>;
  };
  bmiCodeVariation: {
    description: string;
    macBmiMaxCode: Record<string, string>;
  };
}

interface PolicyTimelineEvent {
  date: string;
  event: string;
  type: string;
  significance: string;
}

interface CodeInventory {
  procedural: Array<{ code: string; system: string; description: string; treatment: string }>;
  device: Array<{ code: string; system: string; description: string; treatment: string; covered?: boolean }>;
  diagnostic: Array<{ code: string; system: string; description: string; role: string }>;
}

interface PrototypeModel {
  meta: ModelMeta;
  sourceDocuments: SourceDocument[];
  policyFamilies: PolicyFamily[];
  matrixAxes: MatrixAxis[];
  matrixRows: MatrixRow[];
  evidenceVariables: EvidenceVariable[];
  hgns: HgnsModel;
  layeringModels: LayeringModel[];
  codeCatalog: CodeCatalog;
  insights: Insight[];
  disease?: DiseaseModel;
  treatmentPathway?: TreatmentPathway;
  treatmentModels?: TreatmentModel[];
  perMacCodeTables?: PerMacCodeTables;
  crossMacComparison?: CrossMacComparison;
  policyTimeline?: PolicyTimelineEvent[];
  codeInventory?: CodeInventory;
}

interface AppState {
  model: PrototypeModel | null;
  selectedFamilyId: string;
}

const state: AppState = {
  model: null,
  selectedFamilyId: "hgns",
};

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Missing #app root");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function list<T>(value: T[] | null | undefined) {
  return Array.isArray(value) ? value : [];
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as T;
}

function sourceMap(model: PrototypeModel) {
  return new Map(model.sourceDocuments.map((source) => [source.id, source]));
}

function sourceDisplayMap(model: PrototypeModel) {
  return new Map(model.sourceDocuments.map((source) => [source.displayId, source]));
}

function familyMap(model: PrototypeModel) {
  return new Map(model.policyFamilies.map((family) => [family.id, family]));
}

function matrixMap(model: PrototypeModel) {
  return new Map(model.matrixRows.map((row) => [row.familyId, row]));
}

function layeringMap(model: PrototypeModel) {
  return new Map(model.layeringModels.map((item) => [item.familyId, item]));
}

function codeCatalogMap(model: PrototypeModel) {
  return new Map(model.codeCatalog.families.map((item) => [item.familyId, item]));
}

function treatmentIdForFamilyId(familyId: string) {
  return familyId === "pap-therapy" ? "cpap" : familyId;
}

function familyIdForTreatmentId(treatmentId: string) {
  return treatmentId === "cpap" ? "pap-therapy" : treatmentId;
}

function treatmentModelMap(model: PrototypeModel) {
  return new Map(list(model.treatmentModels).map((treatment) => [treatment.id, treatment]));
}

function currentFamily(model: PrototypeModel) {
  return familyMap(model).get(state.selectedFamilyId) ?? model.policyFamilies[0];
}

function currentLayeringModel(model: PrototypeModel) {
  return layeringMap(model).get(state.selectedFamilyId) ?? model.layeringModels[0];
}

function currentCodeCatalog(model: PrototypeModel) {
  return codeCatalogMap(model).get(state.selectedFamilyId) ?? null;
}

function currentTreatmentModel(model: PrototypeModel) {
  return treatmentModelMap(model).get(treatmentIdForFamilyId(state.selectedFamilyId)) ?? null;
}

function toneClass(tone: string) {
  return `tone-${tone}`;
}

function sourceLinks(model: PrototypeModel, sourceIds: string[]) {
  const byId = sourceMap(model);

  return sourceIds
    .map((id) => {
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
    })
    .join("");
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function displayValue(value: number | null | undefined, prefix = "", suffix = "") {
  if (value == null) {
    return "Not fixed";
  }

  return `${prefix}${value}${suffix}`;
}

function formatAhiWindow(eligibility: TreatmentEligibility, treatmentId: string) {
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

function formatAgeWindow(eligibility: TreatmentEligibility, treatmentId: string) {
  if (eligibility.ageMin != null) {
    return `>= ${eligibility.ageMin}`;
  }

  if (treatmentId === "cpap") {
    return "Adult";
  }

  return "Not fixed";
}

function formatBmiWindow(eligibility: TreatmentEligibility) {
  if (eligibility.bmiMax != null) {
    return `< ${eligibility.bmiMax}`;
  }

  return "No ceiling";
}

function formatStepRequirement(treatment: TreatmentModel) {
  if (treatment.id === "cpap") {
    return "First-line";
  }

  if (treatment.id === "oral-appliance") {
    return "Conditional";
  }

  return treatment.eligibility.requiresCpapFailure ? "Required" : "Not required";
}

function docChip(model: PrototypeModel, displayId: string, label = displayId, variant = "neutral", title?: string) {
  const source = sourceDisplayMap(model).get(displayId);
  const className = `mini-doc-chip is-${variant}`;

  if (source) {
    return `<a class="${className}" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer" title="${escapeHtml(title ?? source.title)}">${escapeHtml(label)}</a>`;
  }

  return `<span class="${className}" title="${escapeHtml(title ?? label)}">${escapeHtml(label)}</span>`;
}

function noteChip(label: string, variant = "neutral", title?: string) {
  return `<span class="mini-doc-chip is-${variant}"${title ? ` title="${escapeHtml(title)}"` : ""}>${escapeHtml(label)}</span>`;
}

interface BasisRef {
  label: string;
  variant: string;
  displayId?: string;
  title?: string;
}

function basisChip(model: PrototypeModel, ref: BasisRef) {
  if (ref.displayId) {
    return docChip(model, ref.displayId, ref.label, ref.variant, ref.title);
  }

  return noteChip(ref.label, ref.variant, ref.title);
}

function selectedFirst<T extends { familyId: string }>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftScore = Number(left.familyId === state.selectedFamilyId);
    const rightScore = Number(right.familyId === state.selectedFamilyId);
    return rightScore - leftScore;
  });
}

function renderHero(model: PrototypeModel) {
  const hgnsMacCount = model.crossMacComparison?.criteriaMatrix.contractors.length ?? model.hgns.macPolicies.length;
  const typedTreatmentCount = model.treatmentModels?.length ?? model.policyFamilies.length;

  return `
    <section class="hero panel">
      <div class="hero-copy">
        <div class="eyebrow">Codex Prototype</div>
        <h1>${escapeHtml(model.meta.title)}</h1>
        <p class="hero-subtitle">${escapeHtml(model.meta.subtitle)}</p>
        <p class="hero-note">${escapeHtml(model.meta.focus)}</p>
      </div>

      <div class="hero-stats">
        ${renderStat("Policy families", String(model.policyFamilies.length), "normalized lanes")}
        ${renderStat("Layer views", String(model.layeringModels.length), "baseline versus local delta")}
        ${renderStat("Evidence vars", String(model.evidenceVariables.length), "reusable data elements")}
        ${renderStat("Code atlases", String(model.codeCatalog.families.length), "family-specific structured tables")}
        ${renderStat("Typed treatments", String(typedTreatmentCount), "integrated comparison surface")}
        ${renderStat("HGNS MACs", String(hgnsMacCount), "active plus legacy contractor variants")}
        ${renderStat("Sources", String(model.sourceDocuments.length), "integrated reviewed documents")}
      </div>
    </section>
  `;
}

function renderStat(label: string, value: string, note: string) {
  return `
    <div class="stat-card">
      <div class="stat-value">${escapeHtml(value)}</div>
      <div class="stat-label">${escapeHtml(label)}</div>
      <div class="stat-note">${escapeHtml(note)}</div>
    </div>
  `;
}

function renderInsights(model: PrototypeModel) {
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Why This Model Matters</div>
          <h2>Abstraction Pays Off</h2>
        </div>
      </div>

      <div class="insight-grid">
        ${model.insights
          .map(
            (insight) => `
              <article class="insight-card">
                <h3>${escapeHtml(insight.title)}</h3>
                <p>${escapeHtml(insight.body)}</p>
                <div class="source-row">${sourceLinks(model, insight.sourceIds)}</div>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderFamilyRail(model: PrototypeModel) {
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Policy Families</div>
          <h2>Disease Pathway</h2>
          <p class="section-copy">Select a family. The layering, code atlas, evidence view, and HGNS comparison all retarget from this choice.</p>
        </div>
      </div>

      <div class="family-rail">
        ${model.policyFamilies
          .map((family) => {
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
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderFamilyFocus(model: PrototypeModel) {
  const family = currentFamily(model);
  const layering = layeringMap(model).get(family.id);
  const codeCatalog = codeCatalogMap(model).get(family.id);
  const treatment = currentTreatmentModel(model);
  const docCount =
    Number(Boolean(treatment?.ncd)) + list(treatment?.lcds).length + list(treatment?.articles).length;
  const keyRequirements = treatment
    ? [
        ...list(treatment.eligibility.criteria?.flatMap((criterion) => criterion.requirements ?? [])),
        ...list(treatment.eligibility.otherRequirements),
      ].slice(0, 5)
    : [];

  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Selected Family</div>
          <h2>${escapeHtml(family.label)}</h2>
        </div>
        <div class="focus-stage ${toneClass(family.tone)}">${escapeHtml(family.stage)}</div>
      </div>

      <div class="focus-grid">
        <div class="focus-column">
          <h3>Normalized Questions</h3>
          <div class="question-stack">
            ${family.normalizedQuestions
              .map(
                (question, index) => `
                  <div class="question-card">
                    <span class="question-index">${index + 1}</span>
                    <span>${escapeHtml(question)}</span>
                  </div>
                `,
              )
              .join("")}
          </div>
        </div>

        <div class="focus-column">
          <h3>Typed Profile</h3>
          ${
            treatment
              ? `
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
                  ${list(treatment.lcds)
                    .slice(0, 3)
                    .map((lcd) => docChip(model, lcd.displayId, lcd.displayId, "lcd", lcd.title))
                    .join("")}
                  ${list(treatment.lcds).length > 3 ? noteChip(`+${list(treatment.lcds).length - 3} LCDs`, "lcd", "Additional local variants are present in this family.") : ""}
                  ${list(treatment.articles)
                    .slice(0, 2)
                    .map((article) =>
                      docChip(model, article.displayId, article.displayId, article.type === "response-to-comments" ? "article" : "article", article.type === "response-to-comments" ? "Response to comments" : article.type ?? article.title),
                    )
                    .join("")}
                  ${docCount ? noteChip(`${docCount} records`, "neutral", "NCD + LCD + Article records used in the integrated model.") : ""}
                </div>

                ${
                  keyRequirements.length
                    ? `
                      <div class="focus-typed-list">
                        ${keyRequirements
                          .map((item) => `<div class="typed-list-item">${escapeHtml(item)}</div>`)
                          .join("")}
                      </div>
                    `
                    : ""
                }
              `
              : ""
          }

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

function renderEligibilityLandscape(model: PrototypeModel) {
  const treatments = ["cpap", "hgns", "oral-appliance", "surgery"]
    .map((id) => treatmentModelMap(model).get(id))
    .filter((item): item is TreatmentModel => Boolean(item));
  const currentTreatmentId = treatmentIdForFamilyId(state.selectedFamilyId);
  const maxAhi = 80;
  const hgnsFamilyTitle =
    "Normalized from the aligned HGNS LCD family: L38528, L38307, L38310, L38312, L38276, L38387, L38398, and L38385.";
  const toneByTreatment = new Map(
    model.policyFamilies.map((family) => [treatmentIdForFamilyId(family.id), family.tone]),
  );

  const rangeBars = (treatment: TreatmentModel) => {
    if (treatment.id === "cpap") {
      return [
        { min: 5, max: 14, label: "Mild + comorbidities", color: "var(--amber)" },
        { min: 15, max: maxAhi, label: "Moderate-severe", color: "var(--teal)" },
      ];
    }

    if (treatment.id === "hgns") {
      return [{ min: 15, max: 65, label: "AHI 15-65 only", color: "var(--blue)" }];
    }

    if (treatment.id === "oral-appliance") {
      return [
        { min: 5, max: 14, label: "Mild + comorbidities", color: "var(--amber)" },
        { min: 15, max: 30, label: "Moderate", color: "var(--teal)" },
        { min: 30, max: maxAhi, label: "Severe + PAP branch", color: "var(--plum)" },
      ];
    }

    if (treatment.id === "surgery") {
      return [{ min: 15, max: maxAhi, label: "RDI >= 15", color: "var(--rose)" }];
    }

    return [];
  };

  const cell = (treatmentId: string, value: string, refs: BasisRef[]) => `
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

      <div class="range-ladder">
        ${treatments
          .map((treatment) => {
            const bars = rangeBars(treatment);

            return `
              <div class="range-row ${currentTreatmentId === treatment.id ? "is-current" : ""}">
                <div class="range-label">${escapeHtml(treatment.shortLabel)}</div>
                <div class="range-track">
                  ${bars
                    .map((bar) => {
                      const left = (bar.min / maxAhi) * 100;
                      const width = ((Math.min(bar.max, maxAhi) - bar.min) / maxAhi) * 100;
                      return `<div class="range-bar tone-${escapeHtml(toneByTreatment.get(treatment.id) ?? "blue")}" style="left:${left}%;width:${width}%;background:${bar.color}">${escapeHtml(bar.label)}</div>`;
                    })
                    .join("")}
                </div>
              </div>
            `;
          })
          .join("")}
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
              ${treatments
                .map(
                  (treatment) => `
                    <th class="${currentTreatmentId === treatment.id ? "is-current" : ""}">
                      <div class="table-col-head">${escapeHtml(treatment.shortLabel)}</div>
                      <div class="table-col-subtle">${escapeHtml(treatment.category)}</div>
                    </th>
                  `,
                )
                .join("")}
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
                { label: "240.4", variant: "ncd", displayId: "240.4", title: "CPAP qualification uses those covered testing pathways." },
              ])}
              ${cell("hgns", "PSG within 24 months", [{ label: "HGNS family", variant: "group", title: hgnsFamilyTitle }])}
              ${cell("oral-appliance", "Medicare-covered sleep test", [{ label: "L33611", variant: "lcd", displayId: "L33611" }])}
              ${cell("surgery", "AASM-certified lab", [{ label: "L34526", variant: "lcd", displayId: "L34526" }])}
            </tr>
            <tr>
              <td>Trial period</td>
              ${cell("cpap", "90-day continuation window", [
                { label: "240.4", variant: "ncd", displayId: "240.4", title: "National 12-week trial period." },
                { label: "L33718", variant: "lcd", displayId: "L33718", title: "Operationalized as a 90-day adherence window." },
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

function renderMacVariation(model: PrototypeModel) {
  const comparison = model.crossMacComparison;
  const macTables = model.perMacCodeTables;

  if (!comparison || !macTables?.hgns?.length) {
    return "";
  }

  const contractors = comparison.criteriaMatrix.contractors;
  const criteria = comparison.criteriaMatrix.criteria;
  const currentFamilyIsHgns = state.selectedFamilyId === "hgns";
  const codeRows = list(macTables.hgns);
  const articleByMac = new Map(codeRows.map((row) => [row.mac, row]));
  const contractorKeyFromArticle = (displayId: string) => {
    if (displayId === "A57949") {
      return "noridian-jf";
    }
    if (displayId === "A57948") {
      return "noridian-je";
    }

    const lower = displayId.toLowerCase();
    if (lower.includes("58075")) return "palmetto";
    if (lower.includes("56953")) return "first-coast";
    if (lower.includes("56938")) return "novitas";
    return "";
  };
  const billingArticles = list(treatmentModelMap(model).get("hgns")?.articles).filter((article) => article.type === "billing");
  const billingByContractor = new Map(
    billingArticles.map((article) => {
      const key = contractorKeyFromArticle(article.displayId);
      if (key) {
        return [key, article] as const;
      }
      if (article.contractor?.includes("Noridian")) {
        return ["noridian-je", article] as const;
      }
      if (article.contractor?.includes("Palmetto")) {
        return ["palmetto", article] as const;
      }
      if (article.contractor?.includes("First Coast")) {
        return ["first-coast", article] as const;
      }
      if (article.contractor?.includes("Novitas")) {
        return ["novitas", article] as const;
      }
      return ["", article] as const;
    }).filter(([key]) => key),
  );

  const contractorCodeRow = new Map<string, PerMacCodeEntry>();
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
    if (name.includes("palmetto")) contractorCodeRow.set("palmetto", row);
    if (name.includes("first coast")) contractorCodeRow.set("first-coast", row);
    if (name.includes("novitas")) contractorCodeRow.set("novitas", row);
  });

  const spreadCell = (criterion: { values: Record<string, boolean> }) => {
    const presentCount = contractors.filter((contractor) => criterion.values[contractor.id]).length;
    const pct = (presentCount / contractors.length) * 100;

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

  const summarizeValues = (values: string[]) => {
    const counts = new Map<string, number>();
    values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
    return [...counts.entries()].sort((left, right) => right[1] - left[1]);
  };

  const valuePill = (value: string) => {
    const tone =
      value === "Current article"
        ? "teal"
        : value === "Retired legacy article"
          ? "rose"
          : value === "Aligned"
            ? "teal"
            : value === "Above clinical cap"
              ? "amber"
              : value === "Yes"
                ? "blue"
                : value === "No"
                  ? "muted"
                  : "muted";

    return `<span class="value-pill is-${tone}">${escapeHtml(value)}</span>`;
  };

  const variationRows = [
    {
      label: "Billing article modeled",
      description: "Whether the integrated dataset includes a billing article for that contractor.",
      values: contractors.map((contractor) => (billingByContractor.get(contractor.id) ? "Yes" : "No")),
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
      }),
    },
    {
      label: "Billing BMI ceiling",
      description: "Maximum BMI represented in the coded BMI diagnosis range for HGNS billing.",
      values: contractors.map((contractor) => {
        const row = contractorCodeRow.get(contractor.id);
        return row?.bmiMaxValue != null ? row.bmiMaxValue.toFixed(1) : "Not modeled";
      }),
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
      }),
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
      }),
    },
  ];

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
      </div>

      <div class="matrix-wrap">
        <table class="matrix-table">
          <thead>
            <tr>
              <th>Clinical-core criterion</th>
              ${contractors
                .map(
                  (contractor) => `
                    <th>
                      <div class="table-col-head">${escapeHtml(contractor.name)}</div>
                      <div class="table-col-subtle">${docChip(model, contractor.lcd, contractor.lcd, "lcd", contractor.region)}</div>
                    </th>
                  `,
                )
                .join("")}
              <th>Spread</th>
            </tr>
          </thead>
          <tbody>
            ${criteria
              .map(
                (criterion) => `
                  <tr>
                    <td>${escapeHtml(criterion.label)}</td>
                    ${contractors
                      .map((contractor) => `<td class="boolean-cell">${criterion.values[contractor.id] ? "✓" : "—"}</td>`)
                      .join("")}
                    ${spreadCell(criterion)}
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>

      <div class="matrix-wrap variation-matrix">
        <table class="matrix-table">
          <thead>
            <tr>
              <th>Operational / coding variation</th>
              ${contractors
                .map(
                  (contractor) => `
                    <th>
                      <div class="table-col-head">${escapeHtml(contractor.name)}</div>
                      <div class="table-col-subtle">${docChip(model, contractor.lcd, contractor.lcd, "lcd", contractor.region)}</div>
                    </th>
                  `,
                )
                .join("")}
              <th>Distribution</th>
            </tr>
          </thead>
          <tbody>
            ${variationRows
              .map((row) => {
                const summary = summarizeValues(row.values);
                return `
                  <tr>
                    <td>
                      <div class="variation-label">${escapeHtml(row.label)}</div>
                      <div class="variation-note">${escapeHtml(row.description)}</div>
                    </td>
                    ${row.values.map((value) => `<td>${valuePill(value)}</td>`).join("")}
                    <td class="distribution-cell">
                      ${summary
                        .map(
                          ([label, count]) => `
                            <div class="distribution-row">
                              <span>${escapeHtml(label)}</span>
                              <strong>${count}</strong>
                            </div>
                          `,
                        )
                        .join("")}
                    </td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderTimeline(model: PrototypeModel) {
  const events = list(model.policyTimeline);
  if (!events.length) {
    return "";
  }

  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Policy History</div>
          <h2>Timeline</h2>
          <p class="section-copy">This integrated timeline helps explain why the current OSA stack feels layered: national CPAP decisions came first, then coordinated local HGNS rollout, then later contractor revisions.</p>
        </div>
      </div>

      <div class="timeline-grid">
        ${events
          .map(
            (event) => `
              <article class="timeline-card is-${escapeHtml(event.type)} is-${escapeHtml(event.significance)}">
                <div class="timeline-date">${escapeHtml(formatDate(event.date))}</div>
                <div class="timeline-type">${escapeHtml(event.type.toUpperCase())}</div>
                <p>${escapeHtml(event.event)}</p>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderLayerCriterion(model: PrototypeModel, criterion: LayerCriterion) {
  return `
    <div class="layer-criterion">
      <div class="layer-criterion-top">
        <span class="criterion-kind">${escapeHtml(criterion.kind)}</span>
        ${criterion.relation ? `<span class="relation-pill relation-${slugify(criterion.relation)}">${escapeHtml(criterion.relation)}</span>` : ""}
      </div>
      <div class="layer-criterion-text">${escapeHtml(criterion.text)}</div>
      <div class="layer-criterion-sources">
        ${sourceLinks(model, criterion.sourceIds)}
      </div>
    </div>
  `;
}

function renderLayering(model: PrototypeModel) {
  const families = familyMap(model);
  const ordered = selectedFirst(model.layeringModels);

  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Coverage Stack</div>
          <h2>Baseline vs Local Delta</h2>
          <p class="section-copy">This is the missing structure in the raw CMS documents: what is inherited from the national floor, what is added locally, and where the branch is LCD-only.</p>
        </div>
      </div>

      <div class="layering-grid">
        ${ordered
          .map((item) => {
            const family = families.get(item.familyId);
            const active = item.familyId === state.selectedFamilyId;
            const narrows = item.overlayCriteria.filter((criterion) => criterion.relation === "narrows").length;
            const specifies = item.overlayCriteria.filter((criterion) => criterion.relation === "specifies").length;
            const adds = item.overlayCriteria.filter((criterion) => !criterion.relation || criterion.relation === "adds").length;

            return `
              <article class="layer-card ${active ? "is-active" : ""}">
                <div class="layer-card-head">
                  <div>
                    <div class="eyebrow">${escapeHtml(family?.stage ?? "Policy family")}</div>
                    <h3>${escapeHtml(item.title)}</h3>
                  </div>
                  <button class="layer-family-chip ${active ? "is-active" : ""}" data-family="${item.familyId}">
                    ${escapeHtml(family?.label ?? item.familyId)}
                  </button>
                </div>

                <div class="layer-chip-row">
                  ${noteChip(`${item.baselineCriteria.length} baseline`, "neutral")}
                  ${noteChip(`${item.overlayCriteria.length} local delta`, "blue")}
                  ${narrows ? noteChip(`${narrows} narrows`, "amber") : ""}
                  ${specifies ? noteChip(`${specifies} specifies`, "blue") : ""}
                  ${adds ? noteChip(`${adds} adds`, "teal") : ""}
                </div>

                <div class="layer-columns">
                  <section class="layer-block layer-block-baseline">
                    <div class="layer-block-label">${escapeHtml(item.baselineLabel)}</div>
                    <p class="layer-block-summary">${escapeHtml(item.baselineSummary)}</p>
                    <div class="layer-criterion-stack">
                      ${item.baselineCriteria.map((criterion) => renderLayerCriterion(model, criterion)).join("")}
                    </div>
                    <div class="source-row">${sourceLinks(model, item.baselineSourceIds)}</div>
                  </section>

                  <section class="layer-block layer-block-overlay">
                    <div class="layer-block-label">${escapeHtml(item.overlayLabel)}</div>
                    <p class="layer-block-summary">${escapeHtml(item.overlaySummary)}</p>
                    <div class="layer-criterion-stack">
                      ${item.overlayCriteria.map((criterion) => renderLayerCriterion(model, criterion)).join("")}
                    </div>
                    <div class="source-row">${sourceLinks(model, item.overlaySourceIds)}</div>
                  </section>
                </div>

                <div class="layer-note">${escapeHtml(item.note)}</div>
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderMatrix(model: PrototypeModel) {
  const families = familyMap(model);

  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Comparison View</div>
          <h2>Evidence Axes Matrix</h2>
          <p class="section-copy">Rows are normalized policy families. Columns are reusable decision axes.</p>
        </div>
      </div>

      <div class="matrix-wrap">
        <table class="matrix-table">
          <thead>
            <tr>
              <th>Family</th>
              ${model.matrixAxes.map((axis) => `<th>${escapeHtml(axis.label)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${model.matrixRows
              .map((row) => {
                const family = families.get(row.familyId);
                const selected = row.familyId === state.selectedFamilyId;

                return `
                  <tr class="${selected ? "is-selected" : ""}">
                    <td class="matrix-family-cell">
                      <div class="matrix-family-label">${escapeHtml(family?.label ?? row.familyId)}</div>
                      <div class="matrix-family-stage">${escapeHtml(family?.stage ?? "")}</div>
                    </td>
                    ${model.matrixAxes
                      .map((axis) => {
                        const cell = row.cells.find((item) => item.axisId === axis.id);
                        if (!cell) {
                          return `<td class="matrix-cell emphasis-none"><span>—</span></td>`;
                        }

                        return `
                          <td class="matrix-cell emphasis-${cell.emphasis}">
                            <span>${escapeHtml(cell.value)}</span>
                          </td>
                        `;
                      })
                      .join("")}
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderCoveragePill(value: string) {
  return `<span class="coverage-pill coverage-${slugify(value)}">${escapeHtml(value)}</span>`;
}

function renderEvidenceGrid(model: PrototypeModel) {
  const selectedFamilyId = state.selectedFamilyId;
  const ordered = [...model.evidenceVariables].sort((left, right) => {
    const leftScore = Number(left.usedBy.includes(selectedFamilyId));
    const rightScore = Number(right.usedBy.includes(selectedFamilyId));
    return rightScore - leftScore || left.label.localeCompare(right.label);
  });

  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Metamodel</div>
          <h2>Evidence Variables</h2>
          <p class="section-copy">These are the reusable data elements the viewer pivots on. Highlight follows the selected family.</p>
        </div>
      </div>

      <div class="evidence-grid">
        ${ordered
          .map((variable) => {
            const active = variable.usedBy.includes(selectedFamilyId);

            return `
              <article class="evidence-card ${active ? "is-active" : ""}">
                <div class="evidence-head">
                  <div class="evidence-title">${escapeHtml(variable.label)}</div>
                  <span class="kind-pill">${escapeHtml(variable.kind)}</span>
                </div>
                <div class="evidence-capture">${escapeHtml(variable.capture)}</div>
                <p class="evidence-body">${escapeHtml(variable.whyItMatters)}</p>
                <div class="used-by-row">
                  ${variable.usedBy
                    .map((familyId) => {
                      const family = familyMap(model).get(familyId);
                      return family
                        ? `<span class="family-pill ${familyId === selectedFamilyId ? "is-current" : ""}">${escapeHtml(family.label)}</span>`
                        : "";
                    })
                    .join("")}
                </div>
                <div class="source-row">${sourceLinks(model, variable.sourceIds)}</div>
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderCodeAtlas(model: PrototypeModel) {
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
        ${model.codeCatalog.families
          .map((catalog) => {
            const family = families.get(catalog.familyId);
            const active = catalog.familyId === current?.familyId;
            const rowCount = catalog.groups.reduce((total, group) => total + group.rows.length, 0);

            return `
              <button class="catalog-chip ${active ? "is-active" : ""}" data-family="${catalog.familyId}">
                <strong>${escapeHtml(family?.label ?? catalog.title)}</strong>
                <span>${catalog.groups.length} groups · ${rowCount} rows</span>
              </button>
            `;
          })
          .join("")}
      </div>

      <article class="catalog-card">
        <div class="catalog-card-head">
          <div>
            <div class="eyebrow">Selected Atlas</div>
            <h3>${escapeHtml(current?.title ?? "No direct code table for this family")}</h3>
          </div>
          <div class="catalog-family-tag">${escapeHtml(current ? (families.get(current.familyId)?.label ?? current.familyId) : (families.get(state.selectedFamilyId)?.label ?? state.selectedFamilyId))}</div>
        </div>

        <p class="section-copy">${escapeHtml(
          current?.summary ??
            "Sleep testing and other baseline-only branches do not carry their own claim tables. Their structured coding burden appears in the downstream therapy families that inherit the diagnostic floor.",
        )}</p>

        ${
          current
            ? `
              <div class="catalog-group-stack">
                ${current.groups
                  .map(
                    (group) => `
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
                              ${group.rows
                                .map(
                                  (row) => `
                                    <tr>
                                      <td class="code-cell">${escapeHtml(row.code)}</td>
                                      <td>${escapeHtml(row.system)}</td>
                                      <td>${renderCoveragePill(row.coverage)}</td>
                                      <td>${escapeHtml(row.description)}</td>
                                      <td>${row.notes ? escapeHtml(row.notes) : "—"}</td>
                                    </tr>
                                  `,
                                )
                                .join("")}
                            </tbody>
                          </table>
                        </div>

                        <div class="source-row">${sourceLinks(model, group.sourceIds)}</div>
                      </section>
                    `,
                  )
                  .join("")}
              </div>

              <div class="source-row">${sourceLinks(model, current.sourceIds)}</div>
            `
            : `
              <div class="catalog-empty">
                <div class="catalog-empty-card">
                  <strong>No direct code atlas on this branch.</strong>
                  <span>The value here is the diagnostic floor; the structured claim tables appear once a therapy branch is selected.</span>
                </div>
              </div>
            `
        }
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
            ${model.codeCatalog.hgnsMacVariation.rows
              .map(
                (row) => `
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
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderHgns(model: PrototypeModel) {
  return `
    <section class="panel panel-hgns">
      <div class="section-head">
        <div>
          <div class="eyebrow">Deep Dive</div>
          <h2>HGNS Contractor Model</h2>
          <p class="section-copy">The prototype treats HGNS as a normalized local-policy family with a stable clinical core, an expanded safety screen, and article-driven claim logic.</p>
        </div>
      </div>

      <div class="hgns-summary-grid">
        <div class="hgns-block">
          <h3>Common Clinical Core</h3>
          <div class="pill-stack">
            ${model.hgns.commonEligibility
              .map(
                (item) => `
                  <div class="logic-pill">
                    <strong>${escapeHtml(item.label)}</strong>
                  </div>
                `,
              )
              .join("")}
          </div>
        </div>

        <div class="hgns-block">
          <h3>Expanded Guardrails</h3>
          <div class="guardrail-grid">
            ${model.hgns.expandedContraindications
              .map((item) => `<div class="guardrail-pill">${escapeHtml(item)}</div>`)
              .join("")}
          </div>
        </div>
      </div>

      <div class="operation-grid">
        ${model.hgns.operations
          .map(
            (operation) => `
              <article class="operation-card">
                <h3>${escapeHtml(operation.label)}</h3>
                <p>${escapeHtml(operation.detail)}</p>
                <div class="source-row">${sourceLinks(model, operation.sourceIds)}</div>
              </article>
            `,
          )
          .join("")}
      </div>

      <div class="section-head secondary">
        <div>
          <h3>Current MAC Profiles</h3>
          <p class="section-copy">Cards below separate the stable clinical spine from the coding and documentation deltas that matter operationally.</p>
        </div>
      </div>

      <div class="mac-grid">
        ${model.hgns.macPolicies
          .map(
            (policy) => `
              <article class="mac-card">
                <div class="mac-topline">
                  <div>
                    <div class="mac-name">${escapeHtml(policy.mac)}</div>
                    <div class="mac-docs">${escapeHtml(policy.lcdDisplayId)} · ${escapeHtml(policy.articleDisplayId)}</div>
                  </div>
                  <div class="mac-date">${escapeHtml(formatDate(policy.effectiveDate))}</div>
                </div>

                <p class="mac-alignment">${escapeHtml(policy.alignment)}</p>

                <div class="mac-chip-row">
                  ${policy.highlights.map((item) => `<span class="mac-chip">${escapeHtml(item)}</span>`).join("")}
                </div>

                <div class="mac-metrics">
                  ${renderMiniMetric("PROC", policy.coding.procedureRows)}
                  ${renderMiniMetric("ICD+", policy.coding.icdCoveredRows)}
                  ${renderMiniMetric("ICD-", policy.coding.icdNotCoveredRows)}
                  ${renderMiniMetric("BILL", policy.coding.billRows)}
                  ${renderMiniMetric("REV", policy.coding.revenueRows)}
                </div>

                <div class="mac-focus">
                  <strong>Documentation focus</strong>
                  <div class="doc-focus-row">
                    ${policy.documentationFocus.map((item) => `<span class="doc-chip">${escapeHtml(item)}</span>`).join("")}
                  </div>
                </div>

                <div class="source-row">${sourceLinks(model, policy.sourceIds)}</div>
              </article>
            `,
          )
          .join("")}
      </div>

      <div class="coding-panel">
        <div class="coding-copy">
          <div class="eyebrow">Coding Logic</div>
          <h3>Normalized HGNS Claim Pattern</h3>
          <p>${escapeHtml(model.hgns.normalizedCodingBundle.primaryDiagnosisPattern)}</p>
          <p>${escapeHtml(model.hgns.normalizedCodingBundle.secondaryDiagnosisPattern)}</p>
        </div>

        <div class="coding-stack">
          <div class="stack-column">
            <div class="stack-label">Procedure</div>
            ${model.hgns.normalizedCodingBundle.procedureCodes
              .map((code) => `<div class="stack-chip">${escapeHtml(code)}</div>`)
              .join("")}
          </div>

          <div class="stack-column">
            <div class="stack-label">Documentation</div>
            ${model.hgns.normalizedCodingBundle.documentationArtifacts
              .map((item) => `<div class="stack-chip">${escapeHtml(item)}</div>`)
              .join("")}
          </div>
        </div>

        <div class="source-row">${sourceLinks(model, model.hgns.normalizedCodingBundle.sourceIds)}</div>
      </div>
    </section>
  `;
}

function renderMiniMetric(label: string, value: number) {
  return `
    <div class="mini-metric">
      <span>${escapeHtml(label)}</span>
      <strong>${value}</strong>
    </div>
  `;
}

function renderSourceLedger(model: PrototypeModel) {
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
            ${model.sourceDocuments
              .map((source) => {
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
              })
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function render(model: PrototypeModel) {
  app.innerHTML = `
    <div class="codex-shell">
      <header class="masthead">
        <div>
          <div class="eyebrow">Hand-Curated Disease Prototype</div>
          <div class="masthead-title">${escapeHtml(model.meta.title)}</div>
        </div>
        <div class="masthead-note">Reviewed ${escapeHtml(formatDate(model.meta.reviewedOn))}</div>
      </header>

      ${renderHero(model)}
      ${renderInsights(model)}
      ${renderFamilyRail(model)}
      ${renderFamilyFocus(model)}
      ${renderEligibilityLandscape(model)}
      ${renderLayering(model)}
      ${renderMatrix(model)}
      ${renderEvidenceGrid(model)}
      ${renderCodeAtlas(model)}
      ${renderMacVariation(model)}
      ${renderHgns(model)}
      ${renderTimeline(model)}
      ${renderSourceLedger(model)}

      <footer class="codex-footer">
        <div>${escapeHtml(model.meta.reviewMethod)}</div>
      </footer>
    </div>
  `;

  document.querySelectorAll<HTMLElement>("[data-family]").forEach((element) => {
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
  state.model = await fetchJson<PrototypeModel>("/api/model");
  render(state.model);
}

bootstrap().catch((error) => {
  console.error(error);
  app.innerHTML = `<div class="loading">Failed to load prototype.</div>`;
});
