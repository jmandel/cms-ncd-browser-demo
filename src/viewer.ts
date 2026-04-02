interface ModelMeta {
  key: string;
  title: string;
  subtitle: string;
  reviewedOn: string;
  reviewMethod: string;
  focus: string;
  cmsVocabulary?: Array<{ term: string; label: string; role: string; band: string; tone: string; detail: string }>;
  macDefinition?: string;
  institutionalContext?: { totalNCDs: number; totalLCDs: number; totalArticles: number; contractorOrganizations: number; interoperabilityNote: string };
  jurisdictionLabels?: Record<string, string>;
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
  description?: string;
  ahiRangeBars?: Array<{ min: number; max: number; label: string }>;
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
  verdictSummary?: string;
  criteriaMatrix: {
    contractors: Array<{ id: string; name: string; lcd: string; region: string }>;
    criteria: Array<{ id: string; label: string; values: Record<string, boolean> }>;
  };
  bmiCodeVariation: {
    description: string;
    macBmiMaxCode: Record<string, string>;
  };
  differenceGroups?: Array<{
    id: string;
    label: string;
    intro: string;
  }>;
  realDifferences?: Array<{
    id?: string;
    kind?: string;
    label?: string;
    category: string;
    severity: string;
    description: string;
    affectedMacs: string[];
    detail: string;
  }>;
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

interface RuleLayer {
  id: string;
  label: string;
  description: string;
}

interface RuleRelationLegendItem {
  id: string;
  label: string;
  meaning: string;
  tone: string;
}

interface RuleRequirementGroup {
  id: string;
  label: string;
  description: string;
}

interface RuleRequirementEntry {
  id: string;
  groupId: string;
  label: string;
  shortLabel: string;
  valueType: string;
  definition: string;
  canonicalQuestion: string;
  typicalEvidence: string[];
  relatedVariableIds: string[];
  usedByFamilies: string[];
}

interface RuleStatement {
  requirementId: string;
  relation: string;
  polarity: string;
  valueSummary: string;
  significance: string;
  note?: string;
  structuredValue?: Record<string, string | number | boolean | null>;
}

interface RuleDocumentProfile {
  documentId: string;
  displayId: string;
  title: string;
  type: string;
  familyId: string;
  familyLabel: string;
  scopeLevel: string;
  roleInPathway: string;
  focus: string;
  baselineDocumentIds: string[];
  statements: RuleStatement[];
}

interface FamilyDeltaSummary {
  familyId: string;
  baselineDocumentIds: string[];
  localDocumentIds: string[];
  counts: Record<string, number>;
  takeaway: string;
}

interface LineageCell {
  familyId: string;
  relation: string;
  valueSummary: string;
  sourceDocumentIds: string[];
}

interface LineageRow {
  requirementId: string;
  whyItMatters: string;
  cells: LineageCell[];
}

interface ContractorVarianceValue {
  contractorId: string;
  relation: string;
  valueSummary: string;
  sourceDocumentId: string;
}

interface ContractorVarianceRow {
  requirementId: string;
  label: string;
  dimensionId: string;
  takeaway: string;
  contractorValues: ContractorVarianceValue[];
}

interface RuleMetamodel {
  abstractionLayers: RuleLayer[];
  relationLegend: RuleRelationLegendItem[];
  requirementGroups: RuleRequirementGroup[];
  requirementCatalog: RuleRequirementEntry[];
  documentProfiles: RuleDocumentProfile[];
  coverageAudit?: {
    totalCuratedDocuments: number;
    modeledDocuments: number;
    unmodeledDocuments: string[];
  };
  familyDeltaSummaries: FamilyDeltaSummary[];
  familyLineage: {
    columns: Array<{ familyId: string; label: string }>;
    rows: LineageRow[];
  };
  contractorVariance: {
    familyId: string;
    dimensions: Array<{ id: string; label: string }>;
    rows: ContractorVarianceRow[];
  };
  analyticQuestions: Array<{
    id: string;
    prompt: string;
    answer: string;
    viewIds: string[];
  }>;
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
  ruleMetamodel?: RuleMetamodel;
  sourceDocumentExamples?: Array<{ sourceId: string; snippet: string; meaning: string }>;
}

interface AppState {
  model: PrototypeModel | null;
  selectedFamilyId: string;
  selectedModelTab: string;
  selectedContractorId: string;
}

const state: AppState = {
  model: null,
  selectedFamilyId: "hgns",
  selectedModelTab: "overview",
  selectedContractorId: "palmetto",
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

async function fetchModel() {
  return await fetchJson<PrototypeModel>(new URL("../data/model.json", import.meta.url).toString());
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

function ruleMetamodel(model: PrototypeModel) {
  return model.ruleMetamodel ?? null;
}

function requirementMap(model: PrototypeModel) {
  return new Map(list(ruleMetamodel(model)?.requirementCatalog).map((item) => [item.id, item]));
}

function groupMap(model: PrototypeModel) {
  return new Map(list(ruleMetamodel(model)?.requirementGroups).map((item) => [item.id, item]));
}

function familyDeltaMap(model: PrototypeModel) {
  return new Map(list(ruleMetamodel(model)?.familyDeltaSummaries).map((item) => [item.familyId, item]));
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

const jurisdictionLabels = new Map([
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
  ["JN", "Jurisdiction N"],
]);

function expandJurisdictionCodes(region: string) {
  const codes = region
    .split("/")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!codes.length) {
    return region;
  }

  const expanded = codes.map((code) => jurisdictionLabels.get(code) ?? code);
  if (expanded.length === 1) {
    return `${expanded[0]} (${codes[0]})`;
  }

  return `${expanded.slice(0, -1).join(", ")} and ${expanded[expanded.length - 1]} (${codes.join("/")})`;
}

function contractorDisplayParts(contractor: { name: string; region: string }) {
  return {
    name: contractor.name.replace(/\s*\([^)]*\)\s*$/, ""),
    jurisdiction: expandJurisdictionCodes(contractor.region),
  };
}

function friendlyAffectedMacName(name: string) {
  const aliases = new Map([
    ["WPS Insurance", "WPS Insurance, Jurisdictions 5 and 8"],
    ["CGS Administrators", "CGS Administrators, Jurisdiction 15"],
    ["Noridian (JE)", "Noridian, Jurisdiction E"],
    ["Noridian (JF)", "Noridian, Jurisdiction F"],
    ["Palmetto GBA", "Palmetto GBA, Jurisdictions J and M"],
    ["National Government Services", "National Government Services, Jurisdictions 6 and K"],
    ["First Coast Service Options", "First Coast Service Options, Jurisdiction N"],
    ["Novitas Solutions", "Novitas Solutions, Jurisdictions H and L"],
    ["all", "All modeled HGNS contractor jurisdictions"],
  ]);

  return aliases.get(name) ?? name;
}

function describeMaterialDifference(difference: { id?: string; label?: string; description: string; detail: string }) {
  if (difference.id === "billing-bmi-code-range") {
    return {
      label: "Billing article extends beyond LCD BMI rule",
      description:
        "Noridian's companion billing article accepts BMI diagnosis codes through Z68.39 even though the Noridian LCD text still says BMI < 35. The mismatch is between that MAC's LCD text and its billing article, not between national and local policy.",
      detail:
        "Claim-execution logic is broader than the local clinical text: the billing article accepts BMI codes the LCD would exclude.",
    };
  }

  if (difference.id === "billing-modifier-52-guidance") {
    return {
      label: "Modifier 52 (reduced service) guidance",
      description:
        "Noridian and Palmetto explicitly tell billers when to append Modifier 52, the CPT/HCPCS modifier used when only part of a service is performed. First Coast and Novitas do not give the same instruction.",
      detail: difference.detail,
    };
  }

  if (difference.id === "billing-abn-modifier-guidance") {
    return {
      label: "ABN modifier guidance (-GA, -GX, -GY, -GZ)",
      description:
        "Only Palmetto explains the Advance Beneficiary Notice modifier set and related ordering/referring NPI expectations in detail.",
      detail: difference.detail,
    };
  }

  return {
    label: difference.label ?? difference.description,
    description: difference.description,
    detail: difference.detail,
  };
}

function renderJsonPreview(value: unknown) {
  return `<pre class="json-browser-pre">${escapeHtml(JSON.stringify(value, null, 2))}</pre>`;
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

function relationLeadLabel(relation?: string) {
  if (relation === "narrows") return "Narrows baseline";
  if (relation === "adds") return "Adds local rule";
  if (relation === "operationalizes") return "Operationalizes baseline";
  if (relation === "differs") return "Uses a different rule";
  if (relation === "codes") return "Moves into coding";
  if (relation === "reuses") return "Reuses baseline";
  if (relation === "baseline") return "Baseline rule";
  if (relation === "governs") return "Governance rule";
  return "Structured rule";
}

function renderProfileSourceSection(model: PrototypeModel, family: PolicyFamily, treatment: TreatmentModel | null, layering: LayeringModel | undefined) {
  const billingArticles = list(treatment?.articles).filter((article) => article.type === "billing");
  const responseArticles = list(treatment?.articles).filter((article) => article.type === "response-to-comments");
  const totalRecords =
    new Set([
      ...list(layering?.baselineSourceIds),
      ...list(layering?.overlaySourceIds),
      ...(treatment?.ncd ? [treatment.ncd.displayId] : []),
      ...list(treatment?.lcds).map((item) => item.displayId),
      ...list(treatment?.articles).map((item) => item.displayId),
    ]).size;

  const rows = [
    {
      label: "National baseline",
      body:
        treatment?.ncd
          ? "A therapy-specific national baseline document governs this path."
          : layering?.baselineSourceIds?.length
            ? "No therapy-specific NCD exists, so coverage inherits the national sleep-testing and CPAP floor."
            : "No national baseline record is modeled for this path.",
      content:
        treatment?.ncd
          ? `<div class="focus-doc-row">${docChip(model, treatment.ncd.displayId, treatment.ncd.displayId, "ncd", treatment.ncd.title)}</div>`
          : layering?.baselineSourceIds?.length
            ? `<div class="source-row">${sourceLinks(model, layering.baselineSourceIds)}</div>`
            : `<div class="profile-source-note">No national source linked for this path.</div>`,
    },
    {
      label: "Local coverage rule",
      body: list(treatment?.lcds).length
        ? "These LCDs define the local coverage logic for this treatment path."
        : "No local LCD is linked for this path.",
      content: list(treatment?.lcds).length
        ? `<div class="focus-doc-row">${list(treatment?.lcds)
            .map((lcd) => docChip(model, lcd.displayId, lcd.displayId, "lcd", lcd.title))
            .join("")}</div>`
        : `<div class="profile-source-note">No local LCD linked.</div>`,
    },
    {
      label: "Coding and governance records",
      body:
        billingArticles.length || responseArticles.length
          ? "Companion records that translate policy into coding guidance or document rollout history."
          : "No companion article is linked for this path.",
      content:
        billingArticles.length || responseArticles.length
          ? `
              <div class="focus-doc-row">
                ${billingArticles.map((article) => docChip(model, article.displayId, article.displayId, "article", article.title)).join("")}
                ${responseArticles.map((article) => docChip(model, article.displayId, article.displayId, "article", article.title)).join("")}
              </div>
            `
          : `<div class="profile-source-note">No companion article linked.</div>`,
    },
    {
      label: "Modeled scope",
      body: `${totalRecords} source record${totalRecords === 1 ? "" : "s"} are synthesized into this profile.`,
      content: `<div class="profile-source-note">${escapeHtml(family.label)} is synthesized into a single treatment-path profile from these records.</div>`,
    },
  ];

  return `
    <div class="profile-source-list">
      ${rows
        .map(
          (row) => `
            <div class="profile-source-item">
              <div class="profile-source-label">${escapeHtml(row.label)}</div>
              <div class="profile-source-content">
                <p>${escapeHtml(row.body)}</p>
                ${row.content}
              </div>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderCriterionEvidenceList(model: PrototypeModel, title: string, criteria: LayerCriterion[], emptyMessage: string) {
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
        ${criteria
          .map(
            (criterion) => `
              <article class="criteria-detail-card">
                <div class="criteria-detail-label">${escapeHtml(relationLeadLabel(criterion.relation))}</div>
                <div class="criteria-detail-text">${escapeHtml(criterion.text)}</div>
                <div class="source-row">${sourceLinks(model, criterion.sourceIds)}</div>
              </article>
            `,
          )
          .join("")}
      </div>
    </div>
  `;
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

function relationVariant(relation: string) {
  if (relation === "baseline") return "neutral";
  if (relation === "reuses") return "teal";
  if (relation === "narrows") return "amber";
  if (relation === "operationalizes") return "blue";
  if (relation === "adds") return "plum";
  if (relation === "differs") return "rose";
  if (relation === "governs") return "ink";
  if (relation === "codes") return "ink";
  return "neutral";
}

function relationChip(label: string, relation: string, title?: string) {
  return noteChip(label, relationVariant(relation), title);
}

function relationExplanation(relation: string) {
  if (relation === "baseline") return "Defines the national baseline rule.";
  if (relation === "reuses") return "Carries the same national rule forward without changing it.";
  if (relation === "narrows") return "Makes the inherited national rule stricter.";
  if (relation === "operationalizes") return "Turns a broad inherited rule into an auditable workflow step.";
  if (relation === "adds") return "Adds a therapy-specific local rule with no direct national counterpart.";
  if (relation === "differs") return "Uses a materially different local rule for the same requirement.";
  if (relation === "codes") return "Moves the logic into billing or coding instructions.";
  if (relation === "governs") return "Describes policy lifecycle or governance rather than bedside eligibility.";
  return relation;
}

function polarityExplanation(polarity: string) {
  if (polarity === "requires") return "Requires this condition.";
  if (polarity === "allows") return "Allows this path or evidence.";
  if (polarity === "denies") return "Excludes or denies this scenario.";
  if (polarity === "codes") return "Defines billing or coding handling.";
  if (polarity === "documents") return "Specifies what must be documented.";
  if (polarity === "references") return "Points to a linked policy or source.";
  if (polarity === "structures") return "Defines the document structure or packaging.";
  if (polarity === "status") return "States lifecycle status.";
  if (polarity === "summarizes") return "Summarizes the document's role.";
  if (polarity === "responds") return "Captures response-to-comments context.";
  return polarity;
}

function renderRuleStatementCard(requirements: Map<string, RuleRequirementEntry>, item: RuleStatement) {
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
      <div class="rule-statement-body-label">Structured statement</div>
      <div class="rule-statement-value">${escapeHtml(item.valueSummary)}</div>
      ${
        item.note
          ? `
            <div class="rule-statement-note">
              <div class="rule-statement-body-label">Why it matters</div>
              <div class="variation-note">${escapeHtml(item.note)}</div>
            </div>
          `
          : ""
      }
    </div>
  `;
}

interface BasisRef {
  label: string;
  variant: string;
  displayId?: string;
  title?: string;
}

function basisChip(model: PrototypeModel, ref: BasisRef) {
  const displayLabel =
    ref.variant === "ncd" && !ref.label.startsWith("NCD ")
      ? `NCD ${ref.label}`
      : ref.variant === "lcd" && !ref.label.startsWith("LCD ")
        ? `LCD ${ref.label}`
        : ref.label;

  if (ref.displayId) {
    return docChip(model, ref.displayId, displayLabel, ref.variant, ref.title);
  }

  return noteChip(displayLabel, ref.variant, ref.title);
}

function selectedFirst<T extends { familyId: string }>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftScore = Number(left.familyId === state.selectedFamilyId);
    const rightScore = Number(right.familyId === state.selectedFamilyId);
    return rightScore - leftScore;
  });
}

function renderHero(model: PrototypeModel) {
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

function renderDiseaseLandscape(model: PrototypeModel) {
  const disease = model.disease;
  const pathway = model.treatmentPathway;
  const treatments = list(model.treatmentModels);

  if (!disease) {
    return "";
  }

  const clinicalDefs = disease.clinicalDefinitions ?? {};
  const clinicalTerms = [
    { term: "AHI", definition: clinicalDefs["ahi"]! },
    { term: "RDI", definition: clinicalDefs["rdi"]! },
    { term: "BMI", definition: clinicalDefs["bmi"]! },
    { term: "PSG", definition: clinicalDefs["psg"]! },
  ];

  const treatmentRows = ["cpap", "hgns", "oral-appliance", "surgery"]
    .map((id) => treatmentModelMap(model).get(id))
    .filter((t): t is TreatmentModel => Boolean(t));

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
                      const branchLabels: Record<string, string> = {};
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
        if (!cpap) return "";
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

function renderStat(label: string, value: string, note: string) {
  return `
    <div class="stat-card">
      <div class="stat-value">${escapeHtml(value)}</div>
      <div class="stat-label">${escapeHtml(label)}</div>
      <div class="stat-note">${escapeHtml(note)}</div>
    </div>
  `;
}

function renderChapterIntro(step: number, eyebrow: string, title: string, copy: string) {
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

function renderMethodology(model: PrototypeModel) {
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
          <h2>A Target Shape For Automation</h2>
          <p class="section-copy">Public CMS documents already expose enough regularity for AI agents to recover high-value structure: indications, thresholds, exclusions, provider roles, coding layers, document lineage, and policy lifecycle context.</p>
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
          <h3>What Becomes Computable</h3>
          <p>${rules.requirementCatalog.length} canonical requirements and ${rules.documentProfiles.length} document rule packs make it possible to compare OSA policies without reading each document side by side.</p>
        </article>
        <article class="tutorial-card">
          <div class="eyebrow">Automation Potential</div>
          <h3>What AI Agents Can Extract Today</h3>
          <p>Automated extraction can recover thresholds, exclusions, provider roles, code tables, document relationships, and cross-document differences. Manual review is still useful where wording conflicts, legacy variants, or revision histories need adjudication.</p>
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
      body: "OSA is not governed by one document. National policy defines a baseline, while local contractor policies add therapy-specific treatment paths, workflow gates, and exclusions.",
    },
    {
      eyebrow: "Key Idea 2",
      title: "Different CMS documents do different jobs",
      body: "Some documents define clinical coverage, some operationalize it, and some translate it into billing and coding instructions. Separating those roles makes each one easier to understand and compare.",
    },
    {
      eyebrow: "Key Idea 3",
      title: "Structure is what makes comparison easy",
      body: "Once thresholds, exclusions, provider requirements, and code tables are normalized into the same vocabulary, differences become visible without reading every document by hand.",
    },
  ];

  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Foundations</div>
          <h2>Three Ideas That Shape Coverage Structure</h2>
          <p class="section-copy">Medicare coverage policy follows a few organizing principles. These three ideas explain why the structure looks the way it does.</p>
        </div>
      </div>

      <div class="tutorial-grid tutorial-grid-3">
        ${ideas
          .map(
            (idea) => `
              <article class="tutorial-card">
                <div class="eyebrow">${escapeHtml(idea.eyebrow)}</div>
                <h3>${escapeHtml(idea.title)}</h3>
                <p>${escapeHtml(idea.body)}</p>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderCmsGlossary(model: PrototypeModel) {
  const stackLayers = list(model.meta.cmsVocabulary);

  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">CMS Vocabulary</div>
          <h2>The Policy Stack In Plain Language</h2>
          <p class="section-copy">Medicare coverage is organized as a layered stack: national baseline first, then local policy, then billing execution, with response records explaining how the wording changed over time.</p>
        </div>
      </div>

      <div class="record-stack-panel">
        <div class="record-stack-caption">One stack, from baseline to execution</div>
        <div class="record-stack-visual">
          ${stackLayers
            .map(
              (layer) => `
                <article class="stack-layer stack-layer-${layer.tone}">
                  <div class="stack-layer-top">
                    <span class="tutorial-term">${escapeHtml(layer.term)}</span>
                    <span class="stack-layer-role">${escapeHtml(layer.band)}</span>
                  </div>
                  <h3>${escapeHtml(layer.role)}</h3>
                  <div class="stack-layer-detail">${escapeHtml(layer.detail)}</div>
                </article>
              `,
            )
            .join("")}
        </div>

        <div class="stack-sidecar">
          <span class="tutorial-term">MAC</span>
          <div class="stack-sidecar-body">${escapeHtml(model.meta.macDefinition!)}</div>
        </div>
      </div>

      ${(() => {
        const ctx = model.meta.institutionalContext!;
        return `<div class="institutional-callout">
          <strong>Institutional scale</strong>
          <p>${escapeHtml(String(ctx.totalNCDs))} NCDs (National Coverage Determinations), ${escapeHtml(String(ctx.totalLCDs))} LCDs (Local Coverage Determinations), and ${escapeHtml(String(ctx.totalArticles.toLocaleString()))} Articles in the CMS Medicare Coverage Database. ${escapeHtml(String(ctx.contractorOrganizations))} contractor organizations operate across all MAC jurisdictions. ${escapeHtml(ctx.interoperabilityNote)}</p>
        </div>`;
      })()}

      <div class="section-head secondary">
        <div>
          <h3>Three Ideas That Shape Coverage Structure</h3>
          <p class="section-copy">Medicare coverage policy follows a few organizing principles. These three ideas explain why the structure looks the way it does.</p>
        </div>
      </div>

      <div class="tutorial-grid tutorial-grid-3">
        <article class="tutorial-card">
          <div class="eyebrow">Key Idea 1</div>
          <h3>One disease can have multiple policy layers</h3>
          <p>OSA is not governed by one document. National policy defines a baseline, while local contractor policies add therapy-specific treatment paths, workflow gates, and exclusions.</p>
        </article>
        <article class="tutorial-card">
          <div class="eyebrow">Key Idea 2</div>
          <h3>Different CMS documents do different jobs</h3>
          <p>Some documents define clinical coverage, some operationalize it, and some translate it into billing and coding instructions. Separating those roles makes each one easier to understand and compare.</p>
        </article>
        <article class="tutorial-card">
          <div class="eyebrow">Key Idea 3</div>
          <h3>Structure is what makes comparison possible</h3>
          <p>Once thresholds, exclusions, provider requirements, and code tables are normalized into the same vocabulary, differences become visible without reading every document by hand.</p>
        </article>
      </div>
    </section>
  `;
}

function renderBeforeAfterPanel(model: PrototypeModel) {
  const rules = ruleMetamodel(model);
  const palmettoProfile = rules?.documentProfiles.find((p) => p.documentId === "lcd-hgns-palmetto");
  const requirements = requirementMap(model);

  const structuredRows = palmettoProfile!.statements.slice(0, 5).map((s) => {
    const req = requirements.get(s.requirementId);
    return {
      requirement: req?.label ?? req?.shortLabel ?? s.requirementId,
      value: s.valueSummary,
    };
  });

  return `
    <div class="section-head secondary">
      <div>
        <h3>From CMS Source To Structured Data</h3>
        <p class="section-copy">Two real examples show the extraction spectrum: clinical criteria need real extraction, while code tables are already mostly machine-readable.</p>
      </div>
    </div>

    <div class="before-after">
      <div class="before-after-column">
        <h4>Raw criteria from Palmetto HGNS LCD</h4>
        <div class="raw-excerpt">- Beneficiary is 22 years of age or older; and
- Body mass index (BMI) is less than 35 kg/m\u00B2; and
- A polysomnography (PSG) demonstrating an apnea-hypopnea index (AHI) of 15 to 65 events per hour within 24 months of initial consultation for HNS implant; and
- Beneficiary has predominantly obstructive events (defined as central and mixed apneas less than 25% of the total AHI); and
- Shared Decision-Making (SDM) between the Beneficiary, Sleep physician, AND qualified otolaryngologist ...</div>
      </div>
      <div class="before-after-column">
        <h4>Structured requirements extracted</h4>
        <div class="code-table-wrap">
          <table class="snapshot-table">
            <thead>
              <tr><th>Requirement</th><th>Threshold</th></tr>
            </thead>
            <tbody>
              ${structuredRows.map((row) => `
                <tr>
                  <td>${escapeHtml(row.requirement)}</td>
                  <td>${escapeHtml(row.value)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="before-after-annotation">The left column is the prose that CMS publishes. The right column shows the same information pulled into named fields with concrete values. Later sections will add a further layer showing how each requirement relates to the national baseline.</div>

    <div class="before-after" style="margin-top: 16px;">
      <div class="before-after-column">
        <h4>Raw code table from Noridian HGNS billing article</h4>
        <div class="code-table-wrap">
          <table class="snapshot-table">
            <thead><tr><th>Code</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td>64582</td><td>Open implantation of hypoglossal nerve neurostimulator array, pulse generator, and sensing lead</td></tr>
              <tr><td>64583</td><td>Revision or replacement of hypoglossal nerve neurostimulator array and/or pulse generator</td></tr>
              <tr><td>64584</td><td>Removal of hypoglossal nerve neurostimulator array, pulse generator, and sensing lead</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="before-after-column">
        <h4>Same codes in the structured code catalog</h4>
        <div class="code-table-wrap">
          <table class="snapshot-table">
            <thead><tr><th>Code</th><th>System</th><th>Status</th><th>Description</th></tr></thead>
            <tbody>
              ${(() => {
                const hgnsCatalog = codeCatalogMap(model).get("hgns")!;
                const procedureGroup = hgnsCatalog.groups.find((g) => g.rows.some((r) => r.code === "64582"))!;
                const targetCodes = ["64582", "64583", "64584"];
                const rows = procedureGroup.rows.filter((r) => targetCodes.includes(r.code));

                return rows.map((r) => `
                  <tr>
                    <td class="code-cell">${escapeHtml(r.code)}</td>
                    <td>${escapeHtml(r.system)}</td>
                    <td>${renderCoveragePill(r.coverage)}</td>
                    <td>${escapeHtml(r.description)}</td>
                  </tr>
                `).join("");
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="before-after-annotation">Billing articles are already semi-structured. The harder extraction problem is in the clinical LCD prose, not the code tables.</div>
  `;
}

function renderSourceLandscape(model: PrototypeModel) {
  const recordCounts = {
    docs: model.sourceDocuments.length,
    ncds: model.sourceDocuments.filter((source) => source.type === "NCD").length,
    lcds: model.sourceDocuments.filter((source) => source.type === "LCD").length,
    articles: model.sourceDocuments.filter((source) => source.type === "Article" && !source.title.startsWith("Response to Comments")).length,
  };
  const exampleRecords = list(model.sourceDocumentExamples).map((ex) => {
    const source = sourceMap(model).get(ex.sourceId)!;
    return {
      type: source.type,
      displayId: source.displayId,
      title: source.title,
      snippet: ex.snippet,
      meaning: ex.meaning,
      variant: source.type === "NCD" ? "ncd" : source.type === "LCD" ? "lcd" : "article",
    };
  });

  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Public Records</div>
          <h2>What Already Exists In The Public Documents</h2>
          <p class="section-copy">The source material is public. ${recordCounts.docs} CMS records were reviewed for this OSA prototype, including ${recordCounts.ncds} NCDs, ${recordCounts.lcds} LCDs, and ${recordCounts.articles} billing articles. These documents already contain extractable structure: indications, thresholds, code tables, and cross-document relationships.</p>
        </div>
      </div>

      <div class="tutorial-grid tutorial-grid-4">
        ${exampleRecords
          .map(
            (record) => `
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
            `,
          )
          .join("")}
      </div>

      ${renderBeforeAfterPanel(model)}
    </section>
  `;
}

function renderDocumentRuleCard(
  model: PrototypeModel,
  profile: RuleDocumentProfile,
  options: { marker?: string; synopsis?: string } = {},
) {
  const requirements = requirementMap(model);

  return `
    <article class="doc-rule-card">
      <div class="doc-rule-head">
        <div>
          ${
            options.marker
              ? `
                <div class="doc-rule-marker-row">
                  <span class="doc-rule-marker">${escapeHtml(options.marker)}</span>
                  ${options.synopsis ? `<span class="doc-rule-marker-copy">${escapeHtml(options.synopsis)}</span>` : ""}
                </div>
              `
              : ""
          }
          <div class="delta-counts">
            ${noteChip(profile.scopeLevel, profile.scopeLevel === "national" ? "ncd" : profile.scopeLevel === "local" ? "lcd" : "article")}
            ${noteChip(profile.roleInPathway, "neutral")}
          </div>
          <h3>${docChip(model, profile.displayId, profile.displayId, profile.type === "NCD" ? "ncd" : profile.type === "LCD" ? "lcd" : "article", profile.title)}</h3>
        </div>
      </div>

      <p class="doc-rule-focus">${escapeHtml(profile.focus)}</p>

      ${
        profile.baselineDocumentIds.length
          ? `
            <div class="requirement-subhead">Compared against</div>
            <div class="delta-counts">
              ${profile.baselineDocumentIds
                .map((documentId) => {
                  const source = sourceMap(model).get(documentId);
                  return source ? docChip(model, source.displayId, source.displayId, "neutral", source.title) : "";
                })
                .join("")}
            </div>
          `
          : ""
      }

      <div class="rule-statement-stack">
        ${profile.statements.map((item) => renderRuleStatementCard(requirements, item)).join("")}
      </div>
    </article>
  `;
}

function renderNcdTutorial(model: PrototypeModel) {
  const rules = ruleMetamodel(model);
  if (!rules) {
    return "";
  }

  const ncdProfiles = ["ncd-sleep-testing", "ncd-cpap"]
    .map((id) => rules.documentProfiles.find((profile) => profile.documentId === id))
    .filter((profile): profile is RuleDocumentProfile => Boolean(profile));
  const atGlanceItems = [
    {
      marker: "1",
      label: "Diagnosis floor",
      copy: "Which sleep tests count and what severity logic can establish OSA in coverage terms.",
    },
    {
      marker: "2",
      label: "First-line PAP rule",
      copy: "How the national CPAP pathway defines who qualifies and the basic trial concept.",
    },
  ];

  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">National Layer</div>
          <h2>What The NCDs Already Contain</h2>
          <p class="section-copy">The source NCDs are plain-language CMS documents, not pre-structured data. Extracted from them: accepted sleep-test types, severity thresholds, mild-disease exceptions, and the initial CPAP trial concept.</p>
        </div>
      </div>

      <div class="glance-row">
        ${atGlanceItems
          .map(
            (item) => `
              <div class="glance-item">
                <span class="glance-index">${escapeHtml(item.marker)}</span>
                <div class="glance-copy">
                  <strong>${escapeHtml(item.label)}</strong>
                  <span>${escapeHtml(item.copy)}</span>
                </div>
              </div>
            `,
          )
          .join("")}
      </div>

      <div class="tutorial-grid tutorial-grid-2">
        ${ncdProfiles
          .map((profile, index) =>
            renderDocumentRuleCard(model, profile, {
              marker: atGlanceItems[index]?.marker,
              synopsis: atGlanceItems[index]?.label,
            }),
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderInsights(model: PrototypeModel) {
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Practical Value</div>
          <h2>What Structured Coverage Data Enables</h2>
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
  const selectedFamily = currentFamily(model);

  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Downstream Branches</div>
          <h2>Choose A Therapy Lens</h2>
          <p class="section-copy">After the national NCD baseline, each treatment path changes the coverage logic differently. Select a treatment path to see how local policy reuses, narrows, operationalizes, or replaces that baseline.</p>
        </div>
      </div>

      <div class="family-select-row">
        <label class="family-select-label" for="family-select">Treatment path in focus</label>
        <select class="family-select" id="family-select" aria-label="Select treatment path in focus">
          ${model.policyFamilies
            .map(
              (family) => `
                <option value="${family.id}" ${family.id === state.selectedFamilyId ? "selected" : ""}>
                  ${escapeHtml(family.label)}
                </option>
              `,
            )
            .join("")}
        </select>
        <span class="family-select-note">${escapeHtml(selectedFamily.label)} is highlighted in the comparisons below.</span>
      </div>

      <div class="family-rail">
        ${model.policyFamilies
          .map((family) => {
            const selected = family.id === state.selectedFamilyId;

            return `
              <button class="family-card ${toneClass(family.tone)} ${selected ? "is-active" : ""}" data-family="${family.id}" aria-pressed="${selected ? "true" : "false"}" title="View ${escapeHtml(family.label)}">
                <div class="family-stage">${escapeHtml(family.stage)}</div>
                <div class="family-title">${escapeHtml(family.label)}</div>
                <p class="family-summary">${escapeHtml(family.summary)}</p>
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
  const treatment = currentTreatmentModel(model);
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
          <div class="eyebrow">Selected Branch</div>
          <h2>${escapeHtml(family.label)}</h2>
        </div>
        <div class="focus-stage ${toneClass(family.tone)}">${escapeHtml(family.stage)}</div>
      </div>

      ${
        treatment
          ? `
            <h3>Typed Profile</h3>
            <p class="section-copy">Normalized eligibility summary for this treatment path.</p>
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
          `
          : ""
      }

      ${renderCriterionEvidenceList(
        model,
        "Key local criteria",
        list(layering?.overlayCriteria).length
          ? list(layering?.overlayCriteria)
          : keyRequirements.map((item, index) => ({
              id: `fallback-${family.id}-${index}`,
              text: item,
              kind: "criterion",
              sourceIds: family.sourceIds,
            })),
        "No concrete local rules are listed for this path.",
      )}

      <h3>Machine Payoff</h3>
      <p class="focus-payoff">${escapeHtml(family.machinePayoff)}</p>
      <div class="source-row">${sourceLinks(model, family.sourceIds)}</div>
    </section>
  `;
}

function renderRuleSemantics(model: PrototypeModel) {
  const rules = ruleMetamodel(model);
  if (!rules) {
    return "";
  }

  const selectedSummary = familyDeltaMap(model).get(state.selectedFamilyId);

  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Coverage Semantics</div>
          <h2>Coverage Semantics</h2>
          <p class="section-copy">Each local rule relates to the national baseline in a specific way: it may reuse it unchanged, narrow it, operationalize it into workflow steps, add genuinely new logic, or translate it into billing instructions. Tagging each rule with that relationship turns unstructured narrative into computable comparison.</p>
        </div>
      </div>

      <div class="worked-example">
        <div class="section-head secondary">
          <div>
            <h3>Worked Example: Keeping PAP Coverage After The Trial</h3>
            <p class="section-copy">The national CPAP rule creates an initial trial period. The local PAP LCD turns the question of keeping coverage after that trial into measurable adherence and follow-up rules.</p>
          </div>
        </div>

        <div class="tutorial-grid tutorial-grid-2">
          <article class="tutorial-card">
            <div class="eyebrow">In The Source Documents</div>
            <div class="typed-list">
              <div class="typed-list-item">
                <strong>NCD 240.4</strong>
                <div>Initial coverage is limited to a 12-week trial period.</div>
              </div>
              <div class="typed-list-item">
                <strong>LCD L33718</strong>
                <div>Continued PAP coverage depends on a 90-day continuation window, objective adherence of at least 4 hours per night on 70% of nights, and follow-up between days 31 and 91.</div>
              </div>
            </div>
          </article>

          <article class="tutorial-card">
            <div class="eyebrow">In The Structured Model</div>
            <div class="delta-counts">
              ${noteChip("Requirement: CPAP trial window", "neutral")}
              ${relationChip("National baseline", "baseline")}
              ${relationChip("Operationalizes", "operationalizes")}
              ${noteChip("Requirement: objective adherence threshold", "neutral")}
            </div>
            <p class="section-copy">The NCD defines the baseline concept, and the LCD operationalizes it into auditable workflow thresholds. The model records that relationship explicitly rather than leaving it implicit.</p>
          </article>
        </div>
      </div>

      <div class="rule-layer-grid">
        ${rules.abstractionLayers
          .map(
            (layer) => `
              <article class="rule-layer-card">
                <div class="eyebrow">${escapeHtml(layer.id)}</div>
                <h3>${escapeHtml(layer.label)}</h3>
                <p>${escapeHtml(layer.description)}</p>
              </article>
            `,
          )
          .join("")}
      </div>

      <div class="rule-legend-grid">
        ${rules.relationLegend
          .map(
            (item) => `
              <article class="rule-legend-card">
                <div class="rule-legend-top">
                  ${relationChip(item.label, item.id)}
                </div>
                <p>${escapeHtml(item.meaning)}</p>
              </article>
            `,
          )
          .join("")}
      </div>

      <div class="section-head secondary">
        <div>
          <h3>How Each Treatment Path Changes The National Baseline</h3>
          <p class="section-copy">A treatment path is one therapy option after the national baseline: PAP, oral appliance, surgery, or HGNS. Each card summarizes whether that path mostly reuses the national rule, narrows it, operationalizes it, or adds genuinely new local logic.</p>
        </div>
      </div>

      <div class="delta-grid">
        ${rules.familyDeltaSummaries
          .map((summary) => {
            const family = familyMap(model).get(summary.familyId);
            const active = summary.familyId === state.selectedFamilyId;
            const countEntries = Object.entries(summary.counts).filter(([, value]) => value > 0);
            const relationLegend = new Map(rules.relationLegend.map((item) => [item.id, item]));
            const layering = layeringMap(model).get(summary.familyId);
            const localChanges = list(layering?.overlayCriteria).slice(0, 3);
            const inherited = list(layering?.baselineCriteria).slice(0, 1);
            const relationSummary = countEntries
              .map(([relation, value]) => {
                const relationInfo = relationLegend.get(relation);
                return `${value} ${relationInfo ? relationInfo.label.toLowerCase() : relation}`;
              })
              .join(", ");

            return `
              <article class="delta-card ${active ? "is-active" : ""}">
                <div class="delta-card-head">
                  <div>
                    <div class="eyebrow">${escapeHtml(family?.stage ?? "Branch")}</div>
                    <h3>${escapeHtml(family?.label ?? summary.familyId)}</h3>
                  </div>
                </div>
                <p>${escapeHtml(summary.takeaway)}</p>
                ${
                  inherited.length
                    ? `
                      <div class="delta-detail-label">Inherited foundation</div>
                      <div class="delta-detail-text">${escapeHtml(inherited[0].text)}</div>
                    `
                    : ""
                }
                ${
                  localChanges.length
                    ? `
                      <div class="delta-detail-label">Concrete local changes</div>
                      <div class="delta-example-list">
                        ${localChanges
                          .map(
                            (criterion) => `
                              <div class="delta-example-item">
                                <strong>${escapeHtml(relationLeadLabel(criterion.relation))}:</strong>
                                <span>${escapeHtml(criterion.text)}</span>
                              </div>
                            `,
                          )
                          .join("")}
                      </div>
                    `
                    : ""
                }
                ${relationSummary ? `<div class="delta-summary-line">Relation breakdown: ${escapeHtml(relationSummary)}.</div>` : ""}
                <div class="delta-sources">
                  <div class="source-row">${sourceLinks(model, [...summary.baselineDocumentIds, ...summary.localDocumentIds])}</div>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>

      <div class="section-head secondary">
        <div>
          <h3>Analytic Questions This Model Supports</h3>
        </div>
      </div>

      <div class="question-grid">
        ${rules.analyticQuestions
          .map(
            (question) => `
              <article class="insight-card">
                <h3>${escapeHtml(question.prompt)}</h3>
                <p>${escapeHtml(question.answer)}</p>
                <div class="delta-counts">
                  ${question.viewIds.map((viewId) => noteChip(viewId, "neutral")).join("")}
                </div>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderRelationDeltaCards(model: PrototypeModel, rules: RuleMetamodel) {
  const families = familyMap(model);

  return rules.familyDeltaSummaries
    .map((summary) => {
      const family = families.get(summary.familyId);
      const active = summary.familyId === state.selectedFamilyId;
      const countEntries = Object.entries(summary.counts).filter(([, value]) => value > 0);
      const relationLegend = new Map(rules.relationLegend.map((item) => [item.id, item]));
      const relationSummary = countEntries
        .map(([relation, value]) => {
          const relationInfo = relationLegend.get(relation);
          return `${value} ${relationInfo ? relationInfo.label.toLowerCase() : relation}`;
        })
        .join(", ");

      return `
        <article class="delta-card ${active ? "is-active" : ""}">
          <div class="delta-card-head">
            <div>
              <div class="eyebrow">${escapeHtml(family?.stage ?? "Branch")}</div>
              <h3>${escapeHtml(family?.label ?? summary.familyId)}</h3>
            </div>
          </div>
          <p>${escapeHtml(summary.takeaway)}</p>
          ${relationSummary ? `<div class="delta-summary-line">Relation breakdown: ${escapeHtml(relationSummary)}.</div>` : ""}
          <div class="delta-sources">
            <div class="source-row">${sourceLinks(model, [...summary.baselineDocumentIds, ...summary.localDocumentIds].slice(0, 4))}${
              [...summary.baselineDocumentIds, ...summary.localDocumentIds].length > 4
                ? `<span class="mini-doc-chip is-neutral">+${[...summary.baselineDocumentIds, ...summary.localDocumentIds].length - 4} more</span>`
                : ""
            }</div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderRelationVocabulary(model: PrototypeModel) {
  const rules = ruleMetamodel(model);
  if (!rules) {
    return "";
  }

  const families = familyMap(model);

  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Abstraction Layer</div>
          <h2>How Local Policies Relate To The National Baseline</h2>
          <p class="section-copy">Systematic comparison requires a vocabulary for how local rules relate to the national floor. Eight labels cover the relationships, from "reuses" through "adds" to "codes."</p>
        </div>
      </div>

      <div class="section-head secondary">
        <div><h3>The Relation Vocabulary</h3></div>
      </div>

      <div class="rule-legend-grid">
        ${rules.relationLegend
          .map(
            (item) => `
              <article class="rule-legend-card">
                <div class="rule-legend-top">
                  ${relationChip(item.label, item.id)}
                </div>
                <p>${escapeHtml(item.meaning)}</p>
              </article>
            `,
          )
          .join("")}
      </div>

      <div class="before-after-annotation" style="margin-top: 16px;">Once every rule is tagged with a relation, queries like "show me everything that narrows the national baseline" or "which requirements are genuinely different across contractors" become straightforward.</div>

      <div class="worked-example">
        <div class="section-head secondary">
          <div>
            <h3>Worked Example: CPAP Trial Operationalization</h3>
            <p class="section-copy">One concrete policy relationship shows how a national concept becomes a local workflow rule.</p>
          </div>
        </div>

        <div class="tutorial-grid tutorial-grid-2">
          <article class="tutorial-card">
            <div class="eyebrow">In The Source Documents</div>
            <div class="typed-list">
              <div class="typed-list-item">
                <strong>NCD 240.4</strong>
                <div>Initial coverage is limited to a 12-week trial period.</div>
              </div>
              <div class="typed-list-item">
                <strong>LCD L33718</strong>
                <div>Continued PAP coverage depends on a 90-day continuation window, objective adherence of at least 4 hours per night on 70% of nights, and follow-up between days 31 and 91.</div>
              </div>
            </div>
          </article>

          <article class="tutorial-card">
            <div class="eyebrow">In The Structured Model</div>
            <div class="delta-counts">
              ${noteChip("Requirement: CPAP trial window", "neutral")}
              ${relationChip("National baseline", "baseline")}
              ${relationChip("Operationalizes", "operationalizes")}
              ${noteChip("Requirement: objective adherence threshold", "neutral")}
            </div>
            <p class="section-copy">The NCD defines the baseline concept, and the LCD operationalizes it into auditable workflow thresholds. The model records that relationship explicitly rather than leaving it implicit.</p>
          </article>
        </div>
      </div>

      <div class="section-head secondary">
        <div>
          <h3>How Each Treatment Path Changes The National Baseline</h3>
          <p class="section-copy">Each card summarizes whether a treatment path mostly reuses the national rule, narrows it, operationalizes it, or adds genuinely new local logic.</p>
        </div>
      </div>

      <div class="delta-grid">
        ${renderRelationDeltaCards(model, rules)}
      </div>
    </section>
  `;
}

function renderRequirementDictionary(model: PrototypeModel) {
  const rules = ruleMetamodel(model);
  if (!rules) {
    return "";
  }

  const selectedFamilyId = state.selectedFamilyId;
  const selectedFamily = currentFamily(model);

  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Requirement Dictionary</div>
          <h2>Canonical Requirements</h2>
          <p class="section-copy">Each coverage concept (age gate, BMI ceiling, adherence threshold, etc.) has one canonical definition reused across documents. This avoids repeating the same idea in different words and makes cross-document comparison exact.</p>
        </div>
      </div>

      <div class="tutorial-grid tutorial-grid-4">
        ${rules.requirementGroups
          .map((group) => {
            const entries = rules.requirementCatalog.filter((entry) => entry.groupId === group.id);
            const activeCount = entries.filter((entry) => entry.usedByFamilies.includes(selectedFamilyId)).length;
            return `
              <article class="tutorial-card count-card ${activeCount ? "is-active" : ""}">
                <div class="count-card-head">
                  <h3>${escapeHtml(group.label)}</h3>
                  <span class="count-pill">${entries.length} entities</span>
                </div>
                <p>${escapeHtml(group.description)}</p>
                <div class="requirement-subhead">${activeCount ? `${activeCount} used by ${escapeHtml(selectedFamily.label)}` : "Representative examples"}</div>
                <div class="typed-list compact-list">
                  ${entries
                    .slice(0, 3)
                    .map(
                      (item) => `
                        <div class="typed-list-item">
                          <strong>${escapeHtml(item.label)}</strong>
                          <div class="variation-note">${escapeHtml(item.definition)}</div>
                        </div>
                      `,
                    )
                    .join("")}
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderFamilyLineage(model: PrototypeModel) {
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
          <p class="section-copy">Rows are canonical requirements; columns are treatment paths. Each cell shows whether that path reuses the national rule, narrows it, operationalizes it, or introduces genuinely different local logic.</p>
        </div>
      </div>

      <div class="matrix-wrap">
        <table class="matrix-table lineage-table">
          <thead>
            <tr>
              <th>Requirement</th>
              ${rules.familyLineage.columns
                .map(
                  (column) => `
                    <th class="${column.familyId === state.selectedFamilyId ? "is-current" : ""}">
                      <div class="table-col-head">${escapeHtml(column.label)}</div>
                    </th>
                  `,
                )
                .join("")}
            </tr>
          </thead>
          <tbody>
            ${rules.familyLineage.rows
              .map((row) => {
                const requirement = requirements.get(row.requirementId);
                const group = requirement ? groups.get(requirement.groupId) : null;

                return `
                  <tr>
                    <td class="lineage-requirement-cell">
                      <div class="variation-label">${escapeHtml(requirement?.label ?? row.requirementId)}</div>
                      ${group ? `<div class="table-col-subtle">${escapeHtml(group.label)}</div>` : ""}
                      <div class="variation-note">${escapeHtml(row.whyItMatters)}</div>
                    </td>
                    ${rules.familyLineage.columns
                      .map((column) => {
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

function renderSelectedFamilyRuleLedger(model: PrototypeModel) {
  const rules = ruleMetamodel(model);
  if (!rules) {
    return "";
  }

  const selectedFamily = currentFamily(model);
  const summary = familyDeltaMap(model).get(state.selectedFamilyId);
  const profileIds = new Set<string>([
    ...(summary?.baselineDocumentIds ?? []),
    ...(summary?.localDocumentIds ?? []),
  ]);

  const profiles = list(rules.documentProfiles)
    .filter((profile) => profile.familyId === state.selectedFamilyId || profileIds.has(profile.documentId))
    .sort((left, right) => {
      const scopeOrder = new Map([
        ["national", 0],
        ["local", 1],
        ["billing", 2],
      ]);
      return (
        (scopeOrder.get(left.scopeLevel) ?? 9) - (scopeOrder.get(right.scopeLevel) ?? 9) ||
        left.displayId.localeCompare(right.displayId)
      );
    });
  const requirements = requirementMap(model);

  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <div class="eyebrow">Document Rule Packs</div>
          <h2>${escapeHtml(selectedFamily.label)} Rule Ledger</h2>
          <p class="section-copy">Each CMS document in this treatment path is decomposed into structured statements. Each card shows which canonical requirements the document touches and whether it provides a baseline rule, narrows one, operationalizes one, adds a new therapy rule, or defines coding logic.</p>
        </div>
      </div>

      <div class="doc-ledger-grid">
        ${profiles
          .map((profile) => `
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

              ${
                profile.baselineDocumentIds.length
                  ? `
                    <div class="requirement-subhead">Compared against</div>
                    <div class="delta-counts">
                      ${profile.baselineDocumentIds
                        .map((documentId) => {
                          const source = sourceMap(model).get(documentId);
                          return source ? docChip(model, source.displayId, source.displayId, "neutral", source.title) : "";
                        })
                        .join("")}
                    </div>
                  `
                  : ""
              }

              <div class="rule-statement-stack">
                ${profile.statements.map((item) => renderRuleStatementCard(requirements, item)).join("")}
              </div>
            </article>
          `)
          .join("")}
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
    return list(treatment.ahiRangeBars).map(bar => ({
      ...bar,
      color: `var(--${toneByTreatment.get(treatment.id) ?? "blue"})`,
    }));
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
          <p class="section-copy">Treatment thresholds, prerequisites, and coverage gates side by side, with the selected treatment path highlighted.</p>
        </div>
      </div>

      <div class="comparison-chips">
        ${basisChip(model, { label: "NCD 240.4", variant: "ncd", displayId: "240.4", title: "National CPAP baseline" })}
        ${basisChip(model, { label: "LCD L33718", variant: "lcd", displayId: "L33718", title: "PAP Devices LCD" })}
        ${basisChip(model, { label: "HGNS LCD set", variant: "group", title: hgnsFamilyTitle })}
        ${basisChip(model, { label: "Mixed basis", variant: "neutral", title: "Some cells combine a national floor with local operational narrowing." })}
      </div>

      <div class="eligibility-basis-note">
        <strong>Source pills</strong>
        <span>NCD pills mean the value comes from the national floor. LCD pills mean the value is defined or operationalized at the local policy layer. If both appear in one cell, the displayed rule is synthesized from both layers.</span>
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
              ${cell("hgns", "15", [{ label: "HGNS LCD set", variant: "group", title: hgnsFamilyTitle }])}
              ${cell("oral-appliance", "5", [{ label: "L33611", variant: "lcd", displayId: "L33611", title: "Oral Appliances for Obstructive Sleep Apnea" }])}
              ${cell("surgery", "15 (RDI)", [{ label: "L34526", variant: "lcd", displayId: "L34526", title: "Surgical Treatment of OSA" }])}
            </tr>
            <tr>
              <td>Maximum AHI</td>
              ${cell("cpap", "None", [{ label: "240.4", variant: "ncd", displayId: "240.4", title: "No upper AHI ceiling in the CPAP NCD." }])}
              ${cell("hgns", "65", [{ label: "HGNS LCD set", variant: "group", title: hgnsFamilyTitle }])}
              ${cell("oral-appliance", "None", [{ label: "L33611", variant: "lcd", displayId: "L33611", title: "No explicit upper AHI ceiling; severe disease branches on PAP status." }])}
              ${cell("surgery", "None", [{ label: "L34526", variant: "lcd", displayId: "L34526", title: "No explicit upper RDI ceiling in the surgery LCD." }])}
            </tr>
            <tr>
              <td>Minimum age</td>
              ${cell("cpap", "Adult", [{ label: "240.4", variant: "ncd", displayId: "240.4", title: "The CPAP NCD addresses adult OSA." }])}
              ${cell("hgns", "22", [{ label: "HGNS LCD set", variant: "group", title: hgnsFamilyTitle }])}
              ${cell("oral-appliance", "Not fixed", [{ label: "L33611", variant: "lcd", displayId: "L33611" }])}
              ${cell("surgery", "Not fixed", [{ label: "L34526", variant: "lcd", displayId: "L34526" }])}
            </tr>
            <tr>
              <td>Maximum BMI</td>
              ${cell("cpap", "No ceiling", [{ label: "240.4", variant: "ncd", displayId: "240.4", title: "No CPAP BMI ceiling in the NCD." }])}
              ${cell("hgns", "< 35", [{ label: "HGNS LCD set", variant: "group", title: hgnsFamilyTitle }])}
              ${cell("oral-appliance", "No ceiling", [{ label: "L33611", variant: "lcd", displayId: "L33611" }])}
              ${cell("surgery", "No ceiling", [{ label: "L34526", variant: "lcd", displayId: "L34526" }])}
            </tr>
            <tr>
              <td>CPAP failure required</td>
              ${cell("cpap", "N/A first-line", [{ label: "240.4", variant: "ncd", displayId: "240.4", title: "CPAP is itself the national first-line therapy." }])}
              ${cell("hgns", "Required", [{ label: "HGNS LCD set", variant: "group", title: hgnsFamilyTitle }])}
              ${cell("oral-appliance", "Conditional", [{ label: "L33611", variant: "lcd", displayId: "L33611", title: "Required only for the severe AHI branch or contraindication path." }])}
              ${cell("surgery", "Required", [{ label: "L34526", variant: "lcd", displayId: "L34526" }])}
            </tr>
            <tr>
              <td>Sleep-test rule</td>
              ${cell("cpap", "Qualifying PSG or HST", [
                { label: "240.4.1", variant: "ncd", displayId: "240.4.1", title: "National sleep-testing floor" },
                { label: "240.4", variant: "ncd", displayId: "240.4", title: "CPAP qualification uses those covered testing pathways." },
              ])}
              ${cell("hgns", "PSG within 24 months", [{ label: "HGNS LCD set", variant: "group", title: hgnsFamilyTitle }])}
              ${cell("oral-appliance", "Medicare-covered sleep test", [{ label: "L33611", variant: "lcd", displayId: "L33611" }])}
              ${cell("surgery", "AASM-certified lab", [{ label: "L34526", variant: "lcd", displayId: "L34526" }])}
            </tr>
            <tr>
              <td>Trial period</td>
              ${cell("cpap", "90-day continuation window", [
                { label: "240.4", variant: "ncd", displayId: "240.4", title: "National 12-week trial period." },
                { label: "L33718", variant: "lcd", displayId: "L33718", title: "Operationalized as a 90-day adherence window." },
              ])}
              ${cell("hgns", "None", [{ label: "HGNS LCD set", variant: "group", title: hgnsFamilyTitle }])}
              ${cell("oral-appliance", "None", [{ label: "L33611", variant: "lcd", displayId: "L33611" }])}
              ${cell("surgery", "None", [{ label: "L34526", variant: "lcd", displayId: "L34526" }])}
            </tr>
            <tr>
              <td>Adherence monitoring</td>
              ${cell("cpap", ">=4h/night, 70%", [{ label: "L33718", variant: "lcd", displayId: "L33718", title: "Objective adherence rule from the PAP LCD." }])}
              ${cell("hgns", "N/A", [{ label: "HGNS LCD set", variant: "group", title: hgnsFamilyTitle }])}
              ${cell("oral-appliance", "N/A", [{ label: "L33611", variant: "lcd", displayId: "L33611" }])}
              ${cell("surgery", "N/A", [{ label: "L34526", variant: "lcd", displayId: "L34526" }])}
            </tr>
            <tr>
              <td>Anatomy assessment</td>
              ${cell("cpap", "Not primary", [{ label: "240.4", variant: "ncd", displayId: "240.4" }])}
              ${cell("hgns", "DISE required", [{ label: "HGNS LCD set", variant: "group", title: hgnsFamilyTitle }])}
              ${cell("oral-appliance", "Not primary", [{ label: "L33611", variant: "lcd", displayId: "L33611" }])}
              ${cell("surgery", "Obstruction site required", [{ label: "L34526", variant: "lcd", displayId: "L34526" }])}
            </tr>
            <tr>
              <td>Specialist requirement</td>
              ${cell("cpap", "Treating practitioner", [{ label: "240.4", variant: "ncd", displayId: "240.4" }])}
              ${cell("hgns", "Otolaryngologist + sleep physician", [{ label: "HGNS LCD set", variant: "group", title: hgnsFamilyTitle }])}
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
  const rules = ruleMetamodel(model);

  if (!comparison || !macTables?.hgns?.length) {
    return "";
  }

  const contractors = comparison.criteriaMatrix.contractors;
  const criteria = comparison.criteriaMatrix.criteria;
  const currentFamilyIsHgns = state.selectedFamilyId === "hgns";
  const realDifferences = list(comparison.realDifferences);
  const contractorVariance = rules?.contractorVariance;
  const varianceDimensions = new Map(list(contractorVariance?.dimensions).map((item) => [item.id, item.label]));
  const clinicalVarianceRows = list(contractorVariance?.rows).filter((row) => row.dimensionId !== "billing");
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

  const renderContractorHeader = (contractor: (typeof contractors)[number]) => {
    const parts = contractorDisplayParts(contractor);
    return `
      <div class="table-col-stack">
        <div class="table-col-head">${escapeHtml(parts.name)}</div>
        <div class="table-col-subtle">${escapeHtml(contractor.lcd)}</div>
      </div>
    `;
  };

  const fallbackClinicalDiffCount = realDifferences.filter((item) => item.category.startsWith("LCD:")).length;
  const clinicalDiffCount = realDifferences.filter((item) => item.kind === "clinical").length;
  const billingDiffCount = realDifferences.filter((item) => item.kind === "billing").length;
  const governanceDiffCount = realDifferences.filter((item) => item.kind === "governance").length;
  const retiredMacCount = new Set(
    realDifferences
      .filter((item) => item.id === "governance-retired-document")
      .flatMap((item) => item.affectedMacs),
  ).size;
  const currentMacCount = contractors.length - retiredMacCount;

  return `
    <section class="panel panel-hgns-variation">
      <div class="section-head">
        <div>
          <div class="eyebrow">Variation Surface</div>
          <h2>HGNS LCDs Mostly Align Clinically. Here Is Where They Diverge.</h2>
          <p class="section-copy">All eight modeled hypoglossal nerve stimulation (HGNS) LCDs share the same core clinical requirements. The real variation is narrower: a few clinical wording or provider-rule differences, a larger set of billing-article differences, and some lifecycle or document-structure differences. Columns are contractor jurisdictions (multi-state regional claims areas), not individual states. ${currentMacCount} current HGNS LCDs plus ${retiredMacCount} retired legacy LCD are shown for comparison.</p>
        </div>
      </div>

      <div class="tutorial-grid tutorial-grid-3">
        <article class="tutorial-card">
          <div class="eyebrow">Key Term</div>
          <h3>HGNS: Hypoglossal nerve stimulation</h3>
          <p>An implanted device (Inspire) that stimulates the hypoglossal nerve to keep the upper airway open during sleep, used for selected OSA patients after CPAP failure or intolerance.</p>
        </article>
        <article class="tutorial-card">
          <div class="eyebrow">Column Labels</div>
          <h3>JE, JF, JJ, and similar labels are contractor jurisdictions</h3>
          <p>Medicare Administrative Contractors (MACs) operate by jurisdiction, not by state. Each contractor LCD governs a multi-state regional claims area, so the comparison is across contractor regions rather than 50 separate state policies.</p>
        </article>
        <article class="tutorial-card">
          <div class="eyebrow">LCD vs. Billing Article</div>
          <h3>When an LCD and billing article part ways</h3>
          <p>Noridian's BMI handling illustrates the gap: the LCD text says BMI under 35, while the companion billing article accepts diagnosis codes up through BMI 39.9. That local LCD-versus-article mismatch is the kind of discrepancy that structured comparison makes visible.</p>
        </article>
      </div>

      <div class="variation-summary-callout">
        <strong>${escapeHtml(comparison.verdictSummary ?? "Clinical-core presence is aligned, but the integrated model still captures real contractor variation.")}</strong>
        <span>The all-checkmark grid below is only a presence test. The clinical wording table above is where actual differences in phrasing, measurement windows, and provider requirements appear.</span>
      </div>

      ${
        clinicalVarianceRows.length
          ? `
            <div class="section-head secondary">
              <div>
                <h3>Actual clinical wording or provider differences</h3>
                <p class="section-copy">These rows are in the clinical or provider layer. They vary across contractors even though the normalized clinical-core presence grid below remains all checkmarks.</p>
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
                  ${clinicalVarianceRows
                    .map((row) => {
                      const byContractor = new Map(row.contractorValues.map((item) => [item.contractorId, item]));
                      const values = contractors.map((contractor) => byContractor.get(contractor.id)?.valueSummary ?? "Not modeled");
                      const summary = summarizeValues(values);

                      return `
                        <tr>
                          <td>
                            <div class="variation-label">${escapeHtml(row.label)}</div>
                            <div class="variation-note">${escapeHtml(varianceDimensions.get(row.dimensionId) ?? row.dimensionId)}. ${escapeHtml(row.takeaway)}</div>
                          </td>
                          ${contractors
                            .map((contractor) => {
                              const value = byContractor.get(contractor.id);
                              return `
                                <td class="variance-value-cell ${value?.relation === "differs" ? "is-different" : ""}">
                                  <div class="variance-value-main">${escapeHtml(value?.valueSummary ?? "Not modeled")}</div>
                                </td>
                              `;
                            })
                            .join("")}
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
          `
          : ""
      }

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

      ${(() => {
        const bmiDrift = realDifferences.find((d) => d.id === "billing-bmi-code-range");
        if (!bmiDrift) return "";

        const bmiContractors = [
          { name: "Noridian", lcdText: "BMI < 35", billingCodes: "Z68.1\u2013Z68.39 (up to 39.9)" },
          { name: "Palmetto", lcdText: "BMI < 35", billingCodes: "Z68.1\u2013Z68.34 (up to 34.9)" },
          { name: "First Coast", lcdText: "BMI < 35", billingCodes: "Z68.1\u2013Z68.34 (up to 34.9)" },
          { name: "Novitas", lcdText: "BMI < 35", billingCodes: "Z68.1\u2013Z68.34 (up to 34.9)" },
        ];

        return `
          <div class="section-head secondary">
            <div>
              <h3>The billing-layer divergence: BMI code drift</h3>
              <p class="section-copy">Claim-execution logic can be broader than the clinical text. Modeling the billing layer alongside the clinical layer makes these discrepancies visible.</p>
            </div>
          </div>

          <div class="matrix-wrap">
            <table class="snapshot-table">
              <thead>
                <tr><th>Contractor</th><th>LCD clinical text</th><th>Billing article BMI codes</th></tr>
              </thead>
              <tbody>
                ${bmiContractors.map((c) => `
                  <tr>
                    <td>${escapeHtml(c.name)}</td>
                    <td>${escapeHtml(c.lcdText)}</td>
                    <td>${escapeHtml(c.billingCodes)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        `;
      })()}

      <div class="variation-summary-callout" style="margin-top: 18px;">
        <strong>Summary</strong>
        <span>${clinicalDiffCount || fallbackClinicalDiffCount} clinical-rule difference${(clinicalDiffCount || fallbackClinicalDiffCount) === 1 ? "" : "s"}, ${billingDiffCount} billing/coding difference${billingDiffCount === 1 ? "" : "s"}, ${governanceDiffCount} lifecycle/governance difference${governanceDiffCount === 1 ? "" : "s"}.</span>
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
          <p class="section-copy">National CPAP decisions came first, then coordinated local HGNS rollout, then later contractor revisions. That sequence explains why the current OSA policy stack is layered.</p>
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
          <p class="section-copy">For each treatment path: what is inherited from the national floor, what is added locally, and where the branch is LCD-only.</p>
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
          <p class="section-copy">Reusable data elements that drive coverage decisions. Variables used by the selected treatment path are highlighted.</p>
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
          <p class="section-copy">Procedure codes, diagnosis codes, and modifiers for the selected treatment path. A modifier is the short billing suffix that changes how a procedure code is interpreted on the claim (e.g., Modifier 52 signals a reduced service).</p>
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
            "Sleep testing and other baseline-only paths do not carry their own claim tables. Their structured coding burden appears in later treatment paths that inherit the diagnostic floor.",
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
                                .slice(0, 8)
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
                              ${group.rows.length > 8 ? `<tr><td colspan="5" class="code-table-overflow">+${group.rows.length - 8} more rows in the full data model</td></tr>` : ""}
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
                  <span>The diagnostic floor applies to all treatment paths; structured claim tables appear under each specific therapy branch.</span>
                </div>
              </div>
            `
        }
      </article>
    </section>
  `;
}

function renderStructuredModelBrowser(model: PrototypeModel) {
  const rules = ruleMetamodel(model);
  const family = currentFamily(model);
  const treatment = currentTreatmentModel(model);
  const layering = currentLayeringModel(model);
  const summary = familyDeltaMap(model).get(state.selectedFamilyId);
  const profileIds = new Set<string>([
    ...(summary?.baselineDocumentIds ?? []),
    ...(summary?.localDocumentIds ?? []),
  ]);
  const selectedProfiles = list(rules?.documentProfiles).filter(
    (profile) => profile.familyId === state.selectedFamilyId || profileIds.has(profile.documentId),
  );

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
          articles: model.sourceDocuments.filter((source) => source.type === "Article").length,
        },
        policyFamilies: model.policyFamilies.map((item) => ({
          id: item.id,
          label: item.label,
          stage: item.stage,
          tone: item.tone,
        })),
      },
    },
    {
      id: "selected-path",
      label: "Selected path",
      description: "A treatment path combines a human-friendly summary, typed eligibility fields, layered baseline-vs-local logic, and linked source records.",
      payload: {
        selectedFamily: family,
        treatmentModel: treatment,
        layeringModel: layering,
      },
    },
    {
      id: "document-packs",
      label: "Document packs",
      description: "Each NCD, LCD, or companion billing article is decomposed into structured statements tied to canonical requirements.",
      payload: selectedProfiles,
    },
    {
      id: "cross-mac",
      label: "Cross-MAC variance",
      description: "The cross-MAC slice separates normalized clinical-core presence from contractor-specific wording, billing, and lifecycle differences.",
      payload: {
        criteriaMatrix: model.crossMacComparison?.criteriaMatrix,
        realDifferences: model.crossMacComparison?.realDifferences,
        contractorVariance: rules?.contractorVariance,
      },
    },
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
        ${tabs
          .map(
            (tab) => `
              <button class="json-tab ${tab.id === activeTab.id ? "is-active" : ""}" data-model-tab="${tab.id}" aria-pressed="${tab.id === activeTab.id ? "true" : "false"}">
                ${escapeHtml(tab.label)}
              </button>
            `,
          )
          .join("")}
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

function renderHgns(model: PrototypeModel) {
  return `
    <section class="panel panel-hgns">
      <div class="section-head">
        <div>
          <div class="eyebrow">Deep Dive</div>
          <h2>HGNS Contractor Model</h2>
          <p class="section-copy">HGNS (hypoglossal nerve stimulation) is a normalized local-policy family with a stable clinical core, an expanded safety screen, and article-driven claim logic.</p>
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
          <p class="section-copy">Each card separates the stable clinical spine from contractor-specific coding and documentation differences.</p>
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
          <p class="section-copy">Every abstraction traces back to a specific CMS record. These are the underlying source documents.</p>
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

function renderCpapLayering(model: PrototypeModel) {
  const rules = ruleMetamodel(model)!;
  const requirements = requirementMap(model);

  const ncdProfile = rules.documentProfiles.find((p) => p.documentId === "ncd-cpap")!;
  const lcdProfile = rules.documentProfiles.find((p) => p.documentId === "lcd-pap-dme")!;

  const ncdStatementMap = new Map(ncdProfile.statements.map((s) => [s.requirementId, s]));

  const rows = lcdProfile.statements.map((lcdStatement) => {
    const ncdStatement = ncdStatementMap.get(lcdStatement.requirementId);
    const req = requirements.get(lcdStatement.requirementId);
    const label = req?.label ?? req?.shortLabel ?? lcdStatement.requirementId;
    return {
      label,
      ncdValue: ncdStatement?.valueSummary ?? "\u2014",
      lcdValue: lcdStatement.valueSummary,
      relation: lcdStatement.relation,
    };
  });

  // Also add NCD-only statements not in the LCD
  for (const ncdStatement of ncdProfile.statements) {
    if (!lcdProfile.statements.some((s) => s.requirementId === ncdStatement.requirementId)) {
      const req = requirements.get(ncdStatement.requirementId);
      const label = req?.label ?? req?.shortLabel ?? ncdStatement.requirementId;
      rows.push({
        label,
        ncdValue: ncdStatement.valueSummary,
        lcdValue: "\u2014",
        relation: ncdStatement.relation,
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

function renderHgnsVariation(model: PrototypeModel) {
  const comparison = model.crossMacComparison!;
  const rules = ruleMetamodel(model)!;
  const contractors = comparison.criteriaMatrix.contractors;
  const contractorVariance = rules.contractorVariance;
  const clinicalVarianceRows = list(contractorVariance?.rows).filter((row) => row.dimensionId !== "billing");
  const varianceDimensions = new Map(list(contractorVariance?.dimensions).map((item) => [item.id, item.label]));

  const renderContractorHeader = (contractor: (typeof contractors)[number]) => {
    const parts = contractorDisplayParts(contractor);
    return `
      <div class="table-col-stack">
        <div class="table-col-head">${escapeHtml(parts.name)}</div>
        <div class="table-col-subtle">${escapeHtml(contractor.lcd)}</div>
      </div>
    `;
  };

  const summarizeValues = (values: string[]) => {
    const counts = new Map<string, number>();
    values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
    return [...counts.entries()].sort((left, right) => right[1] - left[1]);
  };

  // HGNS common criteria: driven from the model's hgns.commonEligibility array
  const hgnsCommonCriteria = model.hgns.commonEligibility;

  // BMI drift: driven from perMacCodeTables.hgns — compare bmiMaxValue against clinical threshold of 35
  const bmiDriftRows = list(model.perMacCodeTables?.hgns)
    .filter((entry) => !entry.status || entry.status !== "Retired")
    .filter((entry) => entry.bmiMaxValue != null)
    .map((entry) => {
      const lcd = contractors.find((c) => entry.mac.toLowerCase().includes(c.name.toLowerCase().split(" ")[0].toLowerCase()));
      return {
        contractor: entry.mac,
        article: entry.article,
        lcd: lcd?.lcd ?? "",
        lcdText: "BMI < 35",
        billingCodes: `Z68.1\u2013${entry.bmiMaxCode} (up to BMI ${entry.bmiMaxValue!.toFixed(1)})`,
        drifts: entry.bmiMaxValue! > 34.9,
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

function renderLineageFocused(model: PrototypeModel) {
  const rules = ruleMetamodel(model)!;
  const requirements = requirementMap(model);
  const groups = groupMap(model);
  const columns = rules.familyLineage.columns;
  const selectedColumn = columns.find((c) => c.familyId === state.selectedFamilyId) ?? columns[0];
  const baselineId = "sleep-testing";

  const filteredRows = rules.familyLineage.rows.filter((row) => {
    const baselineCell = row.cells.find((c) => c.familyId === baselineId);
    const selectedCell = row.cells.find((c) => c.familyId === state.selectedFamilyId);
    const baselineEmpty =
      !baselineCell ||
      baselineCell.relation === "baseline" && baselineCell.valueSummary === "Not applicable";
    const selectedEmpty =
      !selectedCell ||
      selectedCell.relation === "baseline" && selectedCell.valueSummary === "Not applicable";
    return !(baselineEmpty && selectedEmpty);
  });

  return `
    <div class="family-select-row" style="margin-bottom: 12px;">
      <label class="family-select-label" for="family-select">Compare NCD baseline against:</label>
      <select class="family-select" id="family-select" aria-label="Select treatment path to compare">
        ${columns
          .filter((c) => c.familyId !== baselineId)
          .map(
            (column) => `
              <option value="${column.familyId}" ${column.familyId === state.selectedFamilyId ? "selected" : ""}>
                ${escapeHtml(column.label)}
              </option>
            `,
          )
          .join("")}
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
          ${filteredRows
            .map((row) => {
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
                    ` : `<div class="variation-note">\u2014</div>`}
                  </td>
                  <td class="lineage-cell is-current">
                    ${selectedCell ? `
                      <div class="lineage-value">${escapeHtml(selectedCell.valueSummary)}</div>
                      <div class="source-row">${sourceLinks(model, selectedCell.sourceDocumentIds.slice(0, 2))}${selectedCell.sourceDocumentIds.length > 2 ? `<span class="mini-doc-chip is-neutral">+${selectedCell.sourceDocumentIds.length - 2}</span>` : ""}</div>
                    ` : `<div class="variation-note">\u2014</div>`}
                  </td>
                  <td>
                    ${selectedCell ? relationChip(selectedCell.relation, selectedCell.relation) : `<div class="variation-note">\u2014</div>`}
                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderStructuredPayoff(model: PrototypeModel) {
  const rules = ruleMetamodel(model)!;
  const treatments = ["cpap", "hgns", "oral-appliance", "surgery"]
    .map((id) => treatmentModelMap(model).get(id))
    .filter((item): item is TreatmentModel => Boolean(item));
  const maxAhi = 80;
  const toneByTreatment = new Map(
    model.policyFamilies.map((family) => [treatmentIdForFamilyId(family.id), family.tone]),
  );

  const rangeBars = (treatment: TreatmentModel) => {
    return list(treatment.ahiRangeBars).map(bar => ({
      ...bar,
      color: `var(--${toneByTreatment.get(treatment.id) ?? "blue"})`,
    }));
  };

  const selectedTreatmentId = treatmentIdForFamilyId(state.selectedFamilyId);
  const selectedTreatment = treatmentModelMap(model).get(selectedTreatmentId);
  const selectedLabel = selectedTreatment?.shortLabel ?? state.selectedFamilyId;

  // Drive eligibility table from the lineage matrix — same data that powers the lineage view
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
        ${treatments
          .map((treatment) => {
            const bars = rangeBars(treatment);
            const isCurrent = treatment.id === selectedTreatmentId;
            return `
              <div class="range-row ${isCurrent ? "is-current" : ""}">
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
              if (!baselineCell && !selectedCell) return "";
              return `
                <tr>
                  <td class="variation-label">${escapeHtml(req?.label ?? row.requirementId)}</td>
                  <td class="eligibility-cell"><div class="eligibility-value">${escapeHtml(baselineCell?.valueSummary ?? "\u2014")}</div></td>
                  <td class="eligibility-cell is-current"><div class="eligibility-value">${escapeHtml(selectedCell?.valueSummary ?? "\u2014")}</div></td>
                  <td>${selectedCell ? relationChip(selectedCell.relation, selectedCell.relation) : "\u2014"}</td>
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
        return ctx
          ? `<p class="section-copy">${escapeHtml(String(ctx.totalNCDs))} NCDs, ${escapeHtml(String(ctx.totalLCDs))} LCDs, and ${escapeHtml(String(ctx.totalArticles.toLocaleString()))} Articles exist in the CMS Medicare Coverage Database. ${escapeHtml(ctx.interoperabilityNote)}</p>`
          : "";
      })()}
    </section>

    ${renderStructuredModelBrowser(model)}
  `;
}

function render(model: PrototypeModel) {
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

  const familySelect = document.querySelector<HTMLSelectElement>("#family-select");
  familySelect?.addEventListener("change", () => {
    const familyId = familySelect.value;
    if (!familyId || !state.model || familyId === state.selectedFamilyId) {
      return;
    }

    state.selectedFamilyId = familyId;
    render(state.model);
  });

  document.querySelectorAll<HTMLElement>("[data-model-tab]").forEach((element) => {
    element.addEventListener("click", () => {
      const tabId = element.dataset.modelTab;
      if (!tabId || !state.model || tabId === state.selectedModelTab) {
        return;
      }

      state.selectedModelTab = tabId;
      render(state.model);
    });
  });

  const contractorSelect = document.querySelector<HTMLSelectElement>("#contractor-select");
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
