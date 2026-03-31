import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

type JsonRecord = Record<string, unknown>;

const dataPath = resolve(import.meta.dir, "..", "data", "obstructive-sleep-apnea.json");

const raw = JSON.parse(await readFile(dataPath, "utf8")) as JsonRecord & {
  sourceDocuments: Array<{
    id: string;
    displayId: string;
    type: string;
    familyId: string;
    title: string;
  }>;
  policyFamilies: Array<{
    id: string;
    label: string;
  }>;
};

const sourceById = new Map(raw.sourceDocuments.map((source) => [source.id, source]));
const familyById = new Map(raw.policyFamilies.map((family) => [family.id, family]));

function assertSource(id: string) {
  if (!sourceById.has(id)) {
    throw new Error(`Missing source document: ${id}`);
  }
}

function assertFamily(id: string) {
  if (!familyById.has(id)) {
    throw new Error(`Missing family: ${id}`);
  }
}

const relationLegend = [
  {
    id: "baseline",
    label: "National baseline",
    meaning: "The NCD establishes the canonical Medicare rule for this requirement.",
    tone: "neutral",
  },
  {
    id: "reuses",
    label: "Reuses baseline",
    meaning: "The LCD inherits the same underlying requirement without changing the disease concept.",
    tone: "teal",
  },
  {
    id: "narrows",
    label: "Narrows",
    meaning: "The local policy constrains an inherited rule with a stricter test, site, timing, or patient-selection gate.",
    tone: "amber",
  },
  {
    id: "operationalizes",
    label: "Operationalizes",
    meaning: "The local policy turns a broad national concept into auditable workflow or documentation thresholds.",
    tone: "blue",
  },
  {
    id: "adds",
    label: "Adds branch logic",
    meaning: "The local policy adds a therapy-specific requirement that has no direct national counterpart.",
    tone: "plum",
  },
  {
    id: "differs",
    label: "Literal difference",
    meaning: "Two local documents treat the same requirement differently enough to matter analytically.",
    tone: "rose",
  },
  {
    id: "codes",
    label: "Coding layer",
    meaning: "The rule appears in billing/article logic rather than in the main coverage criteria text.",
    tone: "ink",
  },
  {
    id: "governs",
    label: "Governance layer",
    meaning: "The record governs lifecycle, revision rationale, topology, or response-to-comments context rather than a bedside criterion alone.",
    tone: "ink",
  },
];

const requirementGroups = [
  {
    id: "diagnosis",
    label: "Diagnosis And Severity",
    description: "How OSA is established, how severe it must be, and how measurements are interpreted.",
  },
  {
    id: "step-therapy",
    label: "Pathway And Step Therapy",
    description: "When prior treatment failure, intolerance, or escalation becomes part of coverage logic.",
  },
  {
    id: "workflow",
    label: "Workflow And Documentation",
    description: "Operational rules that turn broad coverage concepts into auditable steps.",
  },
  {
    id: "provider-site",
    label: "Provider And Site",
    description: "Which clinicians, facilities, or special studies are required.",
  },
  {
    id: "device-procedure",
    label: "Device And Procedure",
    description: "What hardware, procedure lanes, and exclusions the policy recognizes.",
  },
  {
    id: "exclusions",
    label: "Exclusions And Contraindications",
    description: "Explicit denial logic, contraindication bundles, and non-covered states that sit alongside the affirmative criteria.",
  },
  {
    id: "coding",
    label: "Coding And Adjudication",
    description: "What articles, code ranges, modifiers, and billing constraints operationalize the decision.",
  },
  {
    id: "governance",
    label: "Governance And Document Topology",
    description: "How the policy is structured, revised, cross-linked, retired, and defended through response-to-comment records.",
  },
];

function entry(
  id: string,
  groupId: string,
  label: string,
  valueType: string,
  definition: string,
  typicalEvidence: string[],
  options: {
    shortLabel?: string;
    canonicalQuestion?: string;
    relatedVariableIds?: string[];
    usedByFamilies?: string[];
  } = {},
) {
  assertFamilyList(options.usedByFamilies ?? []);

  return {
    id,
    groupId,
    label,
    shortLabel: options.shortLabel ?? label,
    valueType,
    definition,
    canonicalQuestion:
      options.canonicalQuestion ??
      `What does the policy require for ${label.toLowerCase()}?`,
    typicalEvidence,
    relatedVariableIds: options.relatedVariableIds ?? [],
    usedByFamilies: options.usedByFamilies ?? [],
  };
}

function assertFamilyList(ids: string[]) {
  ids.forEach(assertFamily);
}

const requirementCatalog = [
  entry(
    "clinical-signs-symptoms",
    "diagnosis",
    "Clinical signs and symptoms",
    "boolean",
    "Whether the beneficiary has clinical signs, symptoms, or findings that justify OSA testing or treatment coverage.",
    ["Clinic note", "Sleep medicine consultation", "History and review of symptoms"],
    {
      relatedVariableIds: ["clinical-symptoms"],
      usedByFamilies: ["sleep-testing", "pap-therapy"],
    },
  ),
  entry(
    "treating-practitioner-order",
    "diagnosis",
    "Treating practitioner order",
    "boolean",
    "Whether a qualified treating practitioner ordered the sleep study or downstream therapy.",
    ["Signed order", "Visit note", "Standard written order"],
    {
      relatedVariableIds: ["treating-practitioner-eval"],
      usedByFamilies: ["sleep-testing", "pap-therapy", "oral-appliance"],
    },
  ),
  entry(
    "valid-sleep-test-modality",
    "diagnosis",
    "Valid sleep-test modality",
    "enum-set",
    "Which sleep-study modalities qualify as valid Medicare diagnostic evidence for OSA coverage decisions.",
    ["PSG report", "Home sleep test report", "Channel configuration report"],
    {
      shortLabel: "Valid test modality",
      relatedVariableIds: ["sleep-test-type"],
      usedByFamilies: ["sleep-testing", "pap-therapy", "oral-appliance", "surgery", "hgns"],
    },
  ),
  entry(
    "sleep-test-site-restriction",
    "diagnosis",
    "Sleep-test site restriction",
    "enum",
    "Whether the policy accepts any qualifying Medicare sleep test or narrows to lab-only or PSG-only pathways.",
    ["Facility accreditation record", "Sleep study report"],
    {
      shortLabel: "Test site restriction",
      relatedVariableIds: ["sleep-test-type"],
      usedByFamilies: ["surgery", "hgns"],
    },
  ),
  entry(
    "sleep-study-recency",
    "diagnosis",
    "Sleep-study recency",
    "time-window",
    "How recent the diagnostic study must be relative to the treatment decision.",
    ["Sleep study date", "Consultation date"],
    {
      shortLabel: "Study recency",
      relatedVariableIds: ["psg-recency"],
      usedByFamilies: ["hgns"],
    },
  ),
  entry(
    "adult-age-threshold",
    "diagnosis",
    "Adult age threshold",
    "numeric-threshold",
    "Age requirement for treatment eligibility, including adult-only coverage or explicit minimum age.",
    ["Demographics", "Date of birth"],
    {
      shortLabel: "Age gate",
      usedByFamilies: ["pap-therapy", "hgns"],
    },
  ),
  entry(
    "ahi-rdi-threshold",
    "diagnosis",
    "AHI/RDI severity threshold",
    "numeric-range",
    "Apnea-hypopnea or respiratory disturbance thresholds that determine whether the disease is severe enough for a branch of coverage.",
    ["Sleep study AHI", "Sleep study RDI"],
    {
      shortLabel: "Severity gate",
      relatedVariableIds: ["ahi-rdi"],
      usedByFamilies: ["pap-therapy", "oral-appliance", "surgery", "hgns"],
    },
  ),
  entry(
    "mild-comorbidity-branch",
    "diagnosis",
    "Mild OSA comorbidity branch",
    "enum-set",
    "Whether mild OSA can qualify only when paired with symptoms or qualifying comorbidities.",
    ["Problem list", "Symptom documentation", "Sleep medicine assessment"],
    {
      shortLabel: "Mild branch",
      relatedVariableIds: ["symptoms-comorbidities"],
      usedByFamilies: ["pap-therapy", "oral-appliance"],
    },
  ),
  entry(
    "obstructive-predominance-limit",
    "diagnosis",
    "Obstructive predominance limit",
    "numeric-threshold",
    "Upper bound on central or mixed apneas as a share of total AHI when selecting patients for implant therapy.",
    ["Sleep study event breakdown"],
    {
      shortLabel: "Central-event ceiling",
      usedByFamilies: ["hgns"],
    },
  ),
  entry(
    "bmi-upper-limit",
    "diagnosis",
    "BMI upper limit",
    "numeric-threshold",
    "Maximum body-mass index permitted by the coverage rule.",
    ["Height and weight", "BMI calculation"],
    {
      shortLabel: "BMI gate",
      relatedVariableIds: ["body-mass-index"],
      usedByFamilies: ["hgns"],
    },
  ),
  entry(
    "pretest-in-person-evaluation",
    "workflow",
    "Pre-test in-person evaluation",
    "boolean",
    "Whether the beneficiary must have an in-person clinical evaluation before the qualifying sleep study.",
    ["Visit note"],
    {
      shortLabel: "Pre-test eval",
      relatedVariableIds: ["treating-practitioner-eval"],
      usedByFamilies: ["pap-therapy", "oral-appliance"],
    },
  ),
  entry(
    "cpap-failure-definition",
    "step-therapy",
    "CPAP failure definition",
    "structured-text",
    "How the policy defines failed CPAP therapy when a downstream treatment requires prior PAP failure.",
    ["Compliance download", "PAP efficacy note", "Sleep specialist note"],
    {
      shortLabel: "CPAP failure",
      relatedVariableIds: ["pap-failure"],
      usedByFamilies: ["hgns", "oral-appliance", "surgery"],
    },
  ),
  entry(
    "cpap-intolerance-definition",
    "step-therapy",
    "CPAP intolerance definition",
    "structured-text",
    "How the policy defines intolerance to CPAP when alternative therapy becomes coverable.",
    ["Compliance report", "Mask/interface trial note", "Returned-device documentation"],
    {
      shortLabel: "CPAP intolerance",
      relatedVariableIds: ["pap-failure"],
      usedByFamilies: ["oral-appliance", "surgery", "hgns"],
    },
  ),
  entry(
    "shared-decision-making",
    "step-therapy",
    "Shared decision-making",
    "structured-text",
    "How the policy defines and documents the patient-provider decision process before implant therapy.",
    ["Visit documentation", "Referral note", "Implant consult note"],
    {
      shortLabel: "SDM",
      usedByFamilies: ["hgns"],
    },
  ),
  entry(
    "cpap-trial-window",
    "workflow",
    "Trial and continuation window",
    "time-window",
    "The coverage window used to establish initial benefit and continuation of PAP coverage.",
    ["Usage history", "Initial setup date", "Coverage determination date"],
    {
      shortLabel: "Trial window",
      usedByFamilies: ["pap-therapy"],
    },
  ),
  entry(
    "objective-adherence-threshold",
    "workflow",
    "Objective adherence threshold",
    "numeric-threshold",
    "The machine-derived use threshold that the beneficiary must meet for continued PAP coverage or for some local alternative-treatment definitions.",
    ["PAP compliance download"],
    {
      shortLabel: "Adherence threshold",
      usedByFamilies: ["pap-therapy", "hgns"],
    },
  ),
  entry(
    "followup-reevaluation-window",
    "workflow",
    "Clinical re-evaluation window",
    "time-window",
    "When the treating practitioner must re-evaluate the beneficiary to continue coverage.",
    ["Visit date", "Clinic note"],
    {
      shortLabel: "Re-evaluation window",
      usedByFamilies: ["pap-therapy"],
    },
  ),
  entry(
    "ordering-refill-replacement-rules",
    "workflow",
    "Ordering, refill, and replacement rules",
    "structured-text",
    "Supplier-side ordering, refill, replacement, and proof-of-delivery requirements that operationalize continued device coverage.",
    ["Standard written order", "Refill request", "Proof of delivery", "Replacement justification"],
    {
      shortLabel: "Supply operations",
      usedByFamilies: ["pap-therapy"],
    },
  ),
  entry(
    "anatomic-assessment",
    "provider-site",
    "Anatomic assessment",
    "structured-text",
    "Procedure or clinical assessment that must confirm suitable upper-airway anatomy.",
    ["DISE report", "ENT evaluation", "Operative note"],
    {
      shortLabel: "Anatomic screen",
      usedByFamilies: ["surgery", "hgns"],
    },
  ),
  entry(
    "provider-role",
    "provider-site",
    "Provider role",
    "enum-set",
    "Which clinician roles must evaluate, order, supply, or perform the covered service.",
    ["Provider specialty", "Ordering clinician documentation"],
    {
      shortLabel: "Provider role",
      usedByFamilies: ["pap-therapy", "oral-appliance", "surgery", "hgns"],
    },
  ),
  entry(
    "board-credentialing",
    "provider-site",
    "Board credentialing language",
    "enum",
    "Whether the policy requires board-certified specialists only or accepts board-eligible clinicians.",
    ["Board certification", "Residency/fellowship credentials"],
    {
      shortLabel: "Credentialing",
      usedByFamilies: ["hgns"],
    },
  ),
  entry(
    "sleep-lab-accreditation",
    "provider-site",
    "Sleep lab accreditation",
    "boolean",
    "Whether the qualifying study or downstream titration must occur in an accredited sleep facility.",
    ["AASM accreditation", "Sleep facility credentials"],
    {
      shortLabel: "Lab accreditation",
      usedByFamilies: ["surgery", "hgns"],
    },
  ),
  entry(
    "facility-appropriateness",
    "provider-site",
    "Facility appropriateness",
    "structured-text",
    "Requirement that the service be furnished in a setting appropriate to the beneficiary’s medical risk and procedural needs.",
    ["Facility credentialing", "Place of service", "Operative setting documentation"],
    {
      shortLabel: "Facility setting",
      usedByFamilies: ["surgery", "hgns"],
    },
  ),
  entry(
    "dise-validation",
    "provider-site",
    "DISE validation requirement",
    "structured-text",
    "Special certification or validation rules that govern the DISE interpretation used for HGNS selection.",
    ["DISE interpretation record", "Manufacturer validation certificate"],
    {
      shortLabel: "DISE validation",
      usedByFamilies: ["hgns"],
    },
  ),
  entry(
    "device-lane",
    "device-procedure",
    "Device lane",
    "enum-set",
    "Which device types are covered, escalated, or excluded for a therapy branch.",
    ["HCPCS device code", "Detailed written order", "Supplier claim"],
    {
      shortLabel: "Device lane",
      relatedVariableIds: ["claim-code-bundle"],
      usedByFamilies: ["pap-therapy", "oral-appliance", "hgns"],
    },
  ),
  entry(
    "custom-fabrication-requirement",
    "device-procedure",
    "Custom fabrication requirement",
    "boolean",
    "Whether the covered device must be custom fabricated rather than prefabricated or generic.",
    ["Dental device order", "Laboratory fabrication record", "HCPCS device code"],
    {
      shortLabel: "Custom-only",
      usedByFamilies: ["oral-appliance"],
    },
  ),
  entry(
    "noncovered-procedures",
    "device-procedure",
    "Explicit non-covered procedures",
    "enum-set",
    "Named procedures or device categories the policy specifically excludes from coverage.",
    ["Procedure code", "Operative note"],
    {
      shortLabel: "Not-covered lane",
      relatedVariableIds: ["claim-code-bundle"],
      usedByFamilies: ["oral-appliance", "surgery", "pap-therapy"],
    },
  ),
  entry(
    "procedure-coverage-lane",
    "device-procedure",
    "Covered procedure lane",
    "enum-set",
    "Which CPT/HCPCS procedure lanes are recognized as the covered procedural implementation of the policy.",
    ["CPT code", "Operative note", "Claim line"],
    {
      shortLabel: "Procedure lane",
      relatedVariableIds: ["claim-code-bundle"],
      usedByFamilies: ["surgery", "hgns"],
    },
  ),
  entry(
    "contraindication-bundle",
    "exclusions",
    "Contraindication bundle",
    "enum-set",
    "Named clinical states that independently make the therapy not reasonable and necessary even if inclusion criteria are met.",
    ["Problem list", "Specialist evaluation", "Contraindication assessment"],
    {
      shortLabel: "Contraindications",
      usedByFamilies: ["hgns"],
    },
  ),
  entry(
    "non-fda-approval-exclusion",
    "exclusions",
    "Non-FDA-approved device exclusion",
    "boolean",
    "Whether coverage is restricted to FDA-approved devices and explicitly denies non-approved device use.",
    ["Device model", "Implant system documentation"],
    {
      shortLabel: "FDA-only lane",
      usedByFamilies: ["hgns"],
    },
  ),
  entry(
    "device-compatibility-exclusion",
    "exclusions",
    "Device compatibility exclusion",
    "structured-text",
    "Compatibility exclusions tied to MRI rules or to other implanted devices that could interfere with therapy.",
    ["Implant inventory", "MRI need assessment", "Manufacturer compatibility guidance"],
    {
      shortLabel: "Compatibility exclusion",
      usedByFamilies: ["hgns"],
    },
  ),
  entry(
    "primary-diagnosis-code",
    "coding",
    "Primary diagnosis code requirement",
    "code-set",
    "Which primary diagnosis code anchors claim submission for the covered treatment.",
    ["ICD-10 code on claim"],
    {
      shortLabel: "Primary diagnosis",
      relatedVariableIds: ["claim-code-bundle"],
      usedByFamilies: ["hgns"],
    },
  ),
  entry(
    "secondary-bmi-code-ceiling",
    "coding",
    "Secondary BMI code ceiling",
    "code-range",
    "How far the coding article extends the BMI-related ICD code range, and whether it stays aligned to the clinical BMI rule.",
    ["Secondary ICD-10 code on claim"],
    {
      shortLabel: "BMI code ceiling",
      relatedVariableIds: ["claim-code-bundle", "body-mass-index"],
      usedByFamilies: ["hgns"],
    },
  ),
  entry(
    "modifier-guidance",
    "coding",
    "Modifier guidance",
    "enum-set",
    "Modifier rules or special billing instructions attached to the therapy.",
    ["Claim modifier", "Billing article"],
    {
      shortLabel: "Modifier rules",
      relatedVariableIds: ["claim-code-bundle"],
      usedByFamilies: ["hgns"],
    },
  ),
  entry(
    "mutual-exclusion-code-rules",
    "coding",
    "Mutual exclusion code rules",
    "enum-set",
    "Do-not-bill-together guidance or mutually exclusive code-pair constraints.",
    ["Claim lines", "Billing article"],
    {
      shortLabel: "Code exclusion rules",
      relatedVariableIds: ["claim-code-bundle"],
      usedByFamilies: ["hgns"],
    },
  ),
  entry(
    "legacy-code-reference",
    "coding",
    "Legacy code reference",
    "enum-set",
    "References to legacy or transitional procedure codes that survive in older articles or special MAC language.",
    ["Legacy CPT code", "Archived billing article"],
    {
      shortLabel: "Legacy code",
      relatedVariableIds: ["claim-code-bundle"],
      usedByFamilies: ["hgns"],
    },
  ),
  entry(
    "article-documentation-specificity",
    "coding",
    "Article documentation specificity",
    "structured-text",
    "Whether the billing article just says 'maintain records' or enumerates specific evidence artifacts that must be present.",
    ["Billing article", "Medical record packet"],
    {
      shortLabel: "Article specificity",
      usedByFamilies: ["hgns", "surgery"],
    },
  ),
  entry(
    "cross-reference-local-sleep-policy",
    "coding",
    "Cross-reference to local sleep-study policy",
    "enum",
    "Which local sleep-testing LCD or article the downstream therapy cross-references for diagnostic validity.",
    ["Related document section", "Cross-referenced LCD/article"],
    {
      shortLabel: "Related sleep policy",
      usedByFamilies: ["hgns"],
    },
  ),
  entry(
    "policy-status-lifecycle",
    "governance",
    "Policy status and lifecycle",
    "enum",
    "Whether the record is current, retired, consolidated, or otherwise part of the policy lifecycle rather than the live coverage rule alone.",
    ["Status field", "Revision history", "Retirement notice"],
    {
      shortLabel: "Lifecycle",
      usedByFamilies: ["hgns"],
    },
  ),
  entry(
    "response-to-comments-rationale",
    "governance",
    "Response-to-comments rationale",
    "structured-text",
    "How the contractor records stakeholder feedback, implementation rationale, and reasons for final policy wording.",
    ["Response-to-comments article", "Comment disposition record"],
    {
      shortLabel: "Comment response",
      usedByFamilies: ["hgns"],
    },
  ),
  entry(
    "document-structure-variation",
    "governance",
    "Document structure variation",
    "structured-text",
    "Differences in section availability, narrative shape, or page architecture that can matter for extraction and comparison.",
    ["LCD section layout", "Associated info section", "History section"],
    {
      shortLabel: "Structure variation",
      usedByFamilies: ["hgns"],
    },
  ),
  entry(
    "evidence-summary-style",
    "governance",
    "Evidence summary style",
    "structured-text",
    "How the LCD frames its evidence discussion, citations, or summary of supporting literature.",
    ["Summary of evidence section", "Bibliography", "Citation style"],
    {
      shortLabel: "Evidence style",
      usedByFamilies: ["hgns"],
    },
  ),
  entry(
    "related-document-topology",
    "governance",
    "Related-document topology",
    "structured-text",
    "How many related LCDs, articles, and companion records the policy links to, and what those links imply for navigation and operational use.",
    ["Related documents section", "Associated documents"],
    {
      shortLabel: "Related-doc topology",
      usedByFamilies: ["hgns"],
    },
  ),
];

const requirementIdSet = new Set(requirementCatalog.map((item) => item.id));

function statement(
  requirementId: string,
  relation: string,
  polarity: string,
  valueSummary: string,
  options: {
    significance?: string;
    note?: string;
    structuredValue?: JsonRecord;
  } = {},
) {
  if (!requirementIdSet.has(requirementId)) {
    throw new Error(`Missing requirement entry: ${requirementId}`);
  }

  return {
    requirementId,
    relation,
    polarity,
    valueSummary,
    significance: options.significance ?? "medium",
    note: options.note,
    structuredValue: options.structuredValue,
  };
}

function documentProfile(
  documentId: string,
  options: {
    scopeLevel: string;
    roleInPathway: string;
    focus: string;
    baselineDocumentIds?: string[];
    statements: ReturnType<typeof statement>[];
  },
) {
  assertSource(documentId);
  const source = sourceById.get(documentId)!;

  return {
    documentId,
    displayId: source.displayId,
    title: source.title,
    type: source.type,
    familyId: source.familyId,
    familyLabel: familyById.get(source.familyId)?.label ?? source.familyId,
    scopeLevel: options.scopeLevel,
    roleInPathway: options.roleInPathway,
    focus: options.focus,
    baselineDocumentIds: options.baselineDocumentIds ?? [],
    statements: options.statements,
  };
}

const hgnsCoreStatements = [
  statement("adult-age-threshold", "adds", "requires", "Age ≥ 22 years", {
    significance: "high",
    structuredValue: { min: 22, unit: "years" },
  }),
  statement("bmi-upper-limit", "adds", "requires", "BMI < 35 kg/m²", {
    significance: "high",
    structuredValue: { maxExclusive: 35, unit: "kg/m²" },
  }),
  statement("sleep-study-recency", "narrows", "requires", "PSG within 24 months of implant consultation", {
    significance: "high",
    structuredValue: { windowMonths: 24, modality: "PSG" },
  }),
  statement("obstructive-predominance-limit", "adds", "requires", "Central + mixed apneas < 25% of total AHI", {
    significance: "high",
    structuredValue: { maxPercent: 25 },
  }),
  statement("ahi-rdi-threshold", "differs", "requires", "AHI 15-65 events/hour", {
    significance: "high",
    structuredValue: { min: 15, max: 65, unit: "events/hour", metric: "AHI" },
    note: "This is not the same severity branch used in the PAP NCD; HGNS creates its own implant-selection window.",
  }),
  statement("contraindication-bundle", "adds", "denies", "Coverage is denied when the HGNS contraindication bundle is present.", {
    significance: "high",
    note: "The bundle spans cardiopulmonary disease, neurologic impairment, pregnancy, incompatible implanted devices, psychiatric/functional limits, and other exclusions.",
  }),
  statement("non-fda-approval-exclusion", "adds", "denies", "Non-FDA-approved HGNS devices are not reasonable and necessary.", {
    significance: "high",
  }),
  statement("device-compatibility-exclusion", "adds", "denies", "MRI incompatibility and interfering implanted devices can independently deny coverage.", {
    significance: "medium",
  }),
  statement("anatomic-assessment", "adds", "requires", "DISE must show no complete concentric collapse and no other anatomic compromise", {
    significance: "high",
  }),
  statement("sleep-lab-accreditation", "adds", "requires", "Sleep studies and downstream sleep evaluation are tied to accredited sleep-facility standards through local sleep-policy references.", {
    significance: "medium",
  }),
  statement("facility-appropriateness", "adds", "requires", "Implantation must occur in facilities appropriate to the beneficiary's procedural risk and medical needs.", {
    significance: "medium",
  }),
  statement("provider-role", "adds", "requires", "Sleep physician plus implanting otolaryngologist participate in selection and treatment pathway", {
    significance: "medium",
  }),
  statement("device-lane", "adds", "requires", "FDA-approved HGNS device lane only, currently represented by the Inspire platform family.", {
    significance: "medium",
  }),
  statement("primary-diagnosis-code", "codes", "codes", "Primary diagnosis anchored to G47.33 in billing articles", {
    significance: "medium",
  }),
  statement("cross-reference-local-sleep-policy", "adds", "references", "Each MAC cross-references a different local sleep-study LCD/article", {
    significance: "low",
  }),
];

const documentProfiles = [
  documentProfile("ncd-sleep-testing", {
    scopeLevel: "national",
    roleInPathway: "Diagnostic floor",
    focus: "Defines which sleep studies count as valid Medicare evidence for OSA diagnosis.",
    statements: [
      statement("clinical-signs-symptoms", "baseline", "requires", "Clinical signs and symptoms suggestive of OSA are required before testing.", {
        significance: "high",
      }),
      statement("treating-practitioner-order", "baseline", "requires", "Testing must be ordered by the treating physician or qualified treating practitioner.", {
        significance: "high",
      }),
      statement("valid-sleep-test-modality", "baseline", "allows", "Type I PSG, Type II, Type III, Type IV, and PAT-based multi-channel pathways qualify when technical criteria are met.", {
        significance: "high",
      }),
      statement("sleep-test-site-restriction", "baseline", "allows", "Type II-IV pathways may occur attended or unattended outside the lab; Type I PSG is lab-based.", {
        significance: "medium",
      }),
    ],
  }),
  documentProfile("ncd-cpap", {
    scopeLevel: "national",
    roleInPathway: "National first-line PAP rule",
    focus: "Defines national CPAP entry thresholds and the initial trial concept.",
    baselineDocumentIds: ["ncd-sleep-testing"],
    statements: [
      statement("adult-age-threshold", "baseline", "requires", "Adult OSA coverage only.", {
        significance: "medium",
        structuredValue: { min: 18, unit: "years" },
      }),
      statement("valid-sleep-test-modality", "reuses", "requires", "Coverage uses Medicare-valid PSG or Type II-IV testing from the sleep-testing NCD.", {
        significance: "high",
      }),
      statement("ahi-rdi-threshold", "baseline", "requires", "AHI/RDI ≥ 15 qualifies directly; AHI/RDI 5-14 qualifies only with symptoms or comorbidities.", {
        significance: "high",
      }),
      statement("mild-comorbidity-branch", "baseline", "requires", "Mild OSA requires symptoms or listed comorbidities such as hypertension, ischemic heart disease, or stroke.", {
        significance: "high",
      }),
      statement("cpap-trial-window", "baseline", "requires", "Initial coverage limited to a 12-week trial period.", {
        significance: "high",
        structuredValue: { trialWeeks: 12 },
      }),
      statement("provider-role", "baseline", "requires", "Beneficiary education on device use is part of the covered CPAP pathway.", {
        significance: "medium",
      }),
    ],
  }),
  documentProfile("lcd-pap-dme", {
    scopeLevel: "local",
    roleInPathway: "PAP operational layer",
    focus: "Turns the CPAP NCD into auditable continuation, adherence, and device-escalation logic.",
    baselineDocumentIds: ["ncd-cpap", "ncd-sleep-testing"],
    statements: [
      statement("pretest-in-person-evaluation", "narrows", "requires", "In-person treating-practitioner evaluation must occur before the qualifying sleep study.", {
        significance: "high",
      }),
      statement("valid-sleep-test-modality", "reuses", "requires", "Diagnostic validity still depends on Medicare-covered sleep-testing pathways.", {
        significance: "medium",
      }),
      statement("ahi-rdi-threshold", "reuses", "requires", "Retains the NCD severity thresholds rather than redefining OSA severity.", {
        significance: "medium",
      }),
      statement("cpap-trial-window", "operationalizes", "requires", "Operationalized as a 90-day continuation window instead of a general 12-week concept.", {
        significance: "high",
        structuredValue: { initialDays: 90 },
      }),
      statement("objective-adherence-threshold", "operationalizes", "requires", "Objective adherence: ≥4 hours/night on ≥70% of nights in a consecutive 30-day period.", {
        significance: "high",
      }),
      statement("followup-reevaluation-window", "operationalizes", "requires", "Treating practitioner must re-evaluate between days 31 and 91.", {
        significance: "high",
      }),
      statement("device-lane", "narrows", "requires", "E0470 is only reachable after documented E0601 failure; E0601 remains the base device.", {
        significance: "high",
      }),
      statement("noncovered-procedures", "narrows", "denies", "E0471 with backup rate is not covered for OSA.", {
        significance: "high",
      }),
    ],
  }),
  documentProfile("lcd-oral-appliance", {
    scopeLevel: "local",
    roleInPathway: "Alternative device branch",
    focus: "Creates an oral-appliance branch that reuses the national diagnostic floor but adds device- and supplier-specific rules.",
    baselineDocumentIds: ["ncd-sleep-testing", "ncd-cpap"],
    statements: [
      statement("pretest-in-person-evaluation", "narrows", "requires", "In-person evaluation required before the qualifying sleep study.", {
        significance: "medium",
      }),
      statement("valid-sleep-test-modality", "reuses", "requires", "Diagnosis still depends on a Medicare-valid sleep test.", {
        significance: "high",
      }),
      statement("ahi-rdi-threshold", "differs", "requires", "AHI 5-30 can qualify directly depending on severity branch; AHI >30 triggers a PAP-failure path.", {
        significance: "high",
      }),
      statement("mild-comorbidity-branch", "reuses", "requires", "For mild disease, the same symptom/comorbidity branch from PAP logic remains in play.", {
        significance: "medium",
      }),
      statement("cpap-intolerance-definition", "adds", "requires", "Severe OSA branch requires PAP intolerance or documented PAP contraindication.", {
        significance: "high",
      }),
      statement("device-lane", "narrows", "requires", "Covered device lane is custom-fabricated mandibular advancement only (E0486).", {
        significance: "high",
      }),
      statement("noncovered-procedures", "narrows", "denies", "Prefabricated oral appliances and tongue-positioning devices are excluded.", {
        significance: "high",
      }),
      statement("provider-role", "adds", "requires", "Device must be supplied and billed by a licensed dentist (DDS or DMD).", {
        significance: "high",
      }),
    ],
  }),
  documentProfile("lcd-surgery-wps", {
    scopeLevel: "local",
    roleInPathway: "Escalation pathway",
    focus: "Uses a stricter, surgery-oriented coverage model than the national PAP NCDs.",
    baselineDocumentIds: ["ncd-sleep-testing", "ncd-cpap"],
    statements: [
      statement("sleep-test-site-restriction", "narrows", "requires", "Diagnosis must be established in an AASM-recognized certified sleep lab.", {
        significance: "high",
      }),
      statement("sleep-lab-accreditation", "narrows", "requires", "AASM-certified facility is explicitly required for the diagnostic work-up.", {
        significance: "high",
      }),
      statement("ahi-rdi-threshold", "differs", "requires", "RDI of 15 or higher required; no mild-comorbidity branch.", {
        significance: "high",
      }),
      statement("cpap-failure-definition", "adds", "requires", "Coverage depends on failed CPAP or other appropriate non-invasive treatment.", {
        significance: "high",
      }),
      statement("anatomic-assessment", "adds", "requires", "Procedure selection depends on evidence of retropalatal or combined obstruction site.", {
        significance: "medium",
      }),
      statement("provider-role", "adds", "requires", "Procedure must be performed by a qualified surgeon in an appropriate setting.", {
        significance: "medium",
      }),
      statement("noncovered-procedures", "narrows", "denies", "Explicitly excludes LAUP, palatal implants, somnoplasty, and tongue-base radiofrequency ablation.", {
        significance: "high",
      }),
    ],
  }),
  documentProfile("article-surgery-wps", {
    scopeLevel: "billing",
    roleInPathway: "Surgery coding article",
    focus: "Translates the surgical LCD into code tables and diagnosis alignment.",
    baselineDocumentIds: ["lcd-surgery-wps"],
    statements: [
      statement("procedure-coverage-lane", "codes", "codes", "Defines covered surgical procedure code lanes and diagnosis alignment for the WPS surgery branch.", {
        significance: "medium",
      }),
      statement("article-documentation-specificity", "codes", "documents", "Billing article expects records sufficient to support procedure choice and OSA diagnosis.", {
        significance: "low",
      }),
    ],
  }),
  documentProfile("lcd-hgns-wps", {
    scopeLevel: "local",
    roleInPathway: "HGNS contractor variant",
    focus: "One of the current HGNS local policies; clinically aligned with the common implant core but with WPS-specific SDM wording.",
    baselineDocumentIds: ["ncd-sleep-testing", "ncd-cpap"],
    statements: [
      ...hgnsCoreStatements,
      statement("cpap-failure-definition", "adds", "requires", "CPAP failure defined as AHI > 15 despite CPAP usage.", {
        significance: "high",
      }),
      statement("cpap-intolerance-definition", "adds", "requires", "CPAP intolerance uses the <4 hours/night and 5 nights/week style definition.", {
        significance: "high",
      }),
      statement("shared-decision-making", "differs", "requires", "SDM must be documented by both the referring physician and implanting physician.", {
        significance: "high",
      }),
      statement("board-credentialing", "adds", "requires", "Implanting surgeon described as board-certified otolaryngologist.", {
        significance: "low",
      }),
    ],
  }),
  documentProfile("lcd-hgns-cgs", {
    scopeLevel: "local",
    roleInPathway: "HGNS contractor variant",
    focus: "Clinically aligned HGNS LCD using the common LCD family language.",
    baselineDocumentIds: ["ncd-sleep-testing", "ncd-cpap"],
    statements: [
      ...hgnsCoreStatements,
      statement("cpap-failure-definition", "adds", "requires", "CPAP failure defined as AHI > 15 despite CPAP usage.", {
        significance: "high",
      }),
      statement("cpap-intolerance-definition", "adds", "requires", "CPAP intolerance uses the <4 hours/night and 5 nights/week style definition.", {
        significance: "high",
      }),
      statement("shared-decision-making", "adds", "requires", "SDM is documented as a patient-provider conversation, not a multi-provider attestation.", {
        significance: "medium",
      }),
      statement("board-credentialing", "adds", "requires", "Implanting surgeon described as board-certified otolaryngologist.", {
        significance: "low",
      }),
    ],
  }),
  documentProfile("lcd-hgns-noridian", {
    scopeLevel: "local",
    roleInPathway: "HGNS contractor variant",
    focus: "Current Noridian JE LCD; clinically aligned core with Noridian-specific credentialing and DISE validation language.",
    baselineDocumentIds: ["ncd-sleep-testing", "ncd-cpap"],
    statements: [
      ...hgnsCoreStatements,
      statement("cpap-failure-definition", "adds", "requires", "CPAP failure defined as AHI > 15 despite CPAP usage.", {
        significance: "high",
      }),
      statement("cpap-intolerance-definition", "adds", "requires", "CPAP intolerance is <4 hours/night, 5 nights/week, or returned CPAP.", {
        significance: "high",
      }),
      statement("shared-decision-making", "adds", "requires", "SDM is any documented conversation between attending provider and patient.", {
        significance: "medium",
      }),
      statement("dise-validation", "adds", "requires", "DISE interpreter must meet manufacturer second-opinion validation threshold (80% agreement in 15 consecutive studies).", {
        significance: "medium",
      }),
      statement("board-credentialing", "differs", "requires", "Board-certified or board-eligible otolaryngologist accepted.", {
        significance: "low",
      }),
    ],
  }),
  documentProfile("lcd-hgns-noridian-jf-legacy", {
    scopeLevel: "local",
    roleInPathway: "HGNS legacy contractor variant",
    focus: "Retired JF LCD retained because it exposes legacy wording and retirement/consolidation behavior.",
    baselineDocumentIds: ["ncd-sleep-testing", "ncd-cpap"],
    statements: [
      ...hgnsCoreStatements,
      statement("cpap-failure-definition", "adds", "requires", "CPAP failure defined as AHI > 15 despite CPAP usage.", {
        significance: "high",
      }),
      statement("cpap-intolerance-definition", "adds", "requires", "CPAP intolerance is <4 hours/night, 5 nights/week, or returned CPAP.", {
        significance: "high",
      }),
      statement("board-credentialing", "differs", "requires", "Board-certified or board-eligible otolaryngologist accepted.", {
        significance: "low",
      }),
      statement("cross-reference-local-sleep-policy", "differs", "references", "Legacy JF version points to a different local sleep-study policy than the consolidated JE version.", {
        significance: "low",
      }),
    ],
  }),
  documentProfile("lcd-hgns-palmetto", {
    scopeLevel: "local",
    roleInPathway: "HGNS contractor variant",
    focus: "Clinically aligned HGNS LCD with the main literal criterion difference in CPAP intolerance wording.",
    baselineDocumentIds: ["ncd-sleep-testing", "ncd-cpap"],
    statements: [
      ...hgnsCoreStatements,
      statement("cpap-failure-definition", "adds", "requires", "CPAP failure defined as AHI > 15 despite CPAP usage.", {
        significance: "high",
      }),
      statement("cpap-intolerance-definition", "differs", "requires", "CPAP intolerance uses <4 hours/night for at least 70% of nights in 1 month, or returned CPAP.", {
        significance: "high",
      }),
      statement("shared-decision-making", "adds", "requires", "SDM is documented as a patient-provider conversation, not a multi-provider attestation.", {
        significance: "medium",
      }),
      statement("board-credentialing", "adds", "requires", "Implanting surgeon described as board-certified otolaryngologist.", {
        significance: "low",
      }),
      statement("article-documentation-specificity", "codes", "documents", "Palmetto article expects specific documentation categories instead of generic record retention language.", {
        significance: "medium",
      }),
    ],
  }),
  documentProfile("lcd-hgns-ngs", {
    scopeLevel: "local",
    roleInPathway: "HGNS contractor variant",
    focus: "Clinically aligned HGNS LCD with some unique limitation wording.",
    baselineDocumentIds: ["ncd-sleep-testing", "ncd-cpap"],
    statements: [
      ...hgnsCoreStatements,
      statement("cpap-failure-definition", "adds", "requires", "CPAP failure defined as AHI > 15 despite CPAP usage.", {
        significance: "high",
      }),
      statement("cpap-intolerance-definition", "adds", "requires", "CPAP intolerance is <4 hours/night, 5 nights/week, or returned CPAP.", {
        significance: "high",
      }),
      statement("shared-decision-making", "adds", "requires", "SDM is documented as a patient-provider conversation.", {
        significance: "medium",
      }),
      statement("board-credentialing", "differs", "requires", "Board-certified or board-eligible otolaryngologist accepted.", {
        significance: "low",
      }),
      statement("provider-role", "differs", "requires", "Contraindication wording uniquely narrows neuromuscular disease to conditions affecting the respiratory system.", {
        significance: "low",
      }),
    ],
  }),
  documentProfile("lcd-hgns-fcso", {
    scopeLevel: "local",
    roleInPathway: "HGNS contractor variant",
    focus: "Clinically aligned HGNS LCD with board-eligible wording similar to Noridian and NGS.",
    baselineDocumentIds: ["ncd-sleep-testing", "ncd-cpap"],
    statements: [
      ...hgnsCoreStatements,
      statement("cpap-failure-definition", "adds", "requires", "CPAP failure defined as AHI > 15 despite CPAP usage.", {
        significance: "high",
      }),
      statement("cpap-intolerance-definition", "adds", "requires", "CPAP intolerance is <4 hours/night, 5 nights/week, or returned CPAP.", {
        significance: "high",
      }),
      statement("shared-decision-making", "adds", "requires", "SDM is documented as a patient-provider conversation.", {
        significance: "medium",
      }),
      statement("board-credentialing", "differs", "requires", "Board-certified or board-eligible otolaryngologist accepted.", {
        significance: "low",
      }),
    ],
  }),
  documentProfile("lcd-hgns-novitas", {
    scopeLevel: "local",
    roleInPathway: "HGNS contractor variant",
    focus: "Clinically aligned HGNS LCD with common family language and no special CPAP-intolerance deviation.",
    baselineDocumentIds: ["ncd-sleep-testing", "ncd-cpap"],
    statements: [
      ...hgnsCoreStatements,
      statement("cpap-failure-definition", "adds", "requires", "CPAP failure defined as AHI > 15 despite CPAP usage.", {
        significance: "high",
      }),
      statement("cpap-intolerance-definition", "adds", "requires", "CPAP intolerance is <4 hours/night, 5 nights/week, or returned CPAP.", {
        significance: "high",
      }),
      statement("shared-decision-making", "adds", "requires", "SDM is documented as a patient-provider conversation.", {
        significance: "medium",
      }),
      statement("board-credentialing", "adds", "requires", "Implanting surgeon described as board-certified otolaryngologist.", {
        significance: "low",
      }),
    ],
  }),
  documentProfile("article-hgns-wps", {
    scopeLevel: "billing",
    roleInPathway: "HGNS billing article",
    focus: "WPS claim implementation for HGNS.",
    baselineDocumentIds: ["lcd-hgns-wps"],
    statements: [
      statement("procedure-coverage-lane", "codes", "codes", "CPT 64582/64583/64584 are the live procedure lane.", {
        significance: "medium",
      }),
      statement("primary-diagnosis-code", "codes", "codes", "Claims anchor on G47.33.", {
        significance: "medium",
      }),
      statement("secondary-bmi-code-ceiling", "codes", "codes", "BMI code lane aligns to BMI < 35.", {
        significance: "medium",
      }),
      statement("article-documentation-specificity", "codes", "documents", "Generic article record-retention language.", {
        significance: "low",
      }),
    ],
  }),
  documentProfile("article-hgns-cgs", {
    scopeLevel: "billing",
    roleInPathway: "HGNS billing article",
    focus: "CGS claim implementation for HGNS.",
    baselineDocumentIds: ["lcd-hgns-cgs"],
    statements: [
      statement("procedure-coverage-lane", "codes", "codes", "CPT 64582/64583/64584 are the live procedure lane.", {
        significance: "medium",
      }),
      statement("primary-diagnosis-code", "codes", "codes", "Claims anchor on G47.33.", {
        significance: "medium",
      }),
      statement("secondary-bmi-code-ceiling", "codes", "codes", "BMI code lane aligns to BMI < 35.", {
        significance: "medium",
      }),
      statement("article-documentation-specificity", "codes", "documents", "Generic article record-retention language.", {
        significance: "low",
      }),
    ],
  }),
  documentProfile("article-hgns-noridian", {
    scopeLevel: "billing",
    roleInPathway: "HGNS billing article",
    focus: "Current Noridian JE claim implementation with the largest BMI-coding spread.",
    baselineDocumentIds: ["lcd-hgns-noridian"],
    statements: [
      statement("procedure-coverage-lane", "codes", "codes", "CPT 64582/64583/64584 are the live procedure lane.", {
        significance: "medium",
      }),
      statement("primary-diagnosis-code", "codes", "codes", "Claims anchor on G47.33.", {
        significance: "medium",
      }),
      statement("secondary-bmi-code-ceiling", "differs", "codes", "BMI code lane extends through Z68.39, beyond the clinical BMI < 35 gate.", {
        significance: "high",
      }),
      statement("mutual-exclusion-code-rules", "differs", "codes", "Explicit do-not-bill-together rules for 64582/64583/64584 combinations.", {
        significance: "medium",
      }),
      statement("modifier-guidance", "differs", "codes", "Modifier 52 guidance for partial revision/removal.", {
        significance: "medium",
      }),
    ],
  }),
  documentProfile("article-hgns-noridian-jf-legacy", {
    scopeLevel: "billing",
    roleInPathway: "HGNS billing legacy article",
    focus: "Retired Noridian JF billing article retained because it exposes the legacy implant code lane.",
    baselineDocumentIds: ["lcd-hgns-noridian-jf-legacy"],
    statements: [
      statement("procedure-coverage-lane", "codes", "codes", "CPT 64582/64583/64584 are present.", {
        significance: "medium",
      }),
      statement("legacy-code-reference", "differs", "codes", "Legacy CPT 64568 appears in the retired article only.", {
        significance: "high",
      }),
      statement("secondary-bmi-code-ceiling", "differs", "codes", "BMI code lane extends through Z68.39, beyond the clinical BMI < 35 gate.", {
        significance: "high",
      }),
      statement("mutual-exclusion-code-rules", "differs", "codes", "Explicit do-not-bill-together rules present.", {
        significance: "medium",
      }),
    ],
  }),
  documentProfile("article-hgns-palmetto", {
    scopeLevel: "billing",
    roleInPathway: "HGNS billing article",
    focus: "Palmetto billing article with the most specific documentation instructions.",
    baselineDocumentIds: ["lcd-hgns-palmetto"],
    statements: [
      statement("procedure-coverage-lane", "codes", "codes", "CPT 64582/64583/64584 are the live procedure lane.", {
        significance: "medium",
      }),
      statement("primary-diagnosis-code", "codes", "codes", "Claims anchor on G47.33.", {
        significance: "medium",
      }),
      statement("secondary-bmi-code-ceiling", "codes", "codes", "BMI code lane stops at Z68.34 and stays aligned to BMI < 35.", {
        significance: "medium",
      }),
      statement("modifier-guidance", "differs", "codes", "Modifier 52 guidance present for partial revision/removal.", {
        significance: "medium",
      }),
      statement("article-documentation-specificity", "differs", "documents", "Explicit documentation categories: symptoms, polysomnography, DISE, BMI, and related evidence.", {
        significance: "high",
      }),
    ],
  }),
  documentProfile("article-hgns-fcso", {
    scopeLevel: "billing",
    roleInPathway: "HGNS billing article",
    focus: "First Coast claim implementation with an additional text reference to CPT 61886.",
    baselineDocumentIds: ["lcd-hgns-fcso"],
    statements: [
      statement("procedure-coverage-lane", "codes", "codes", "CPT 64582/64583/64584 are the live procedure lane.", {
        significance: "medium",
      }),
      statement("primary-diagnosis-code", "codes", "codes", "Claims anchor on G47.33.", {
        significance: "medium",
      }),
      statement("secondary-bmi-code-ceiling", "codes", "codes", "BMI code lane stops at Z68.34 and stays aligned to BMI < 35.", {
        significance: "medium",
      }),
      statement("legacy-code-reference", "differs", "codes", "Text mentions CPT 61886 for pulse-generator replacement even though it is not in the main code table.", {
        significance: "low",
      }),
    ],
  }),
  documentProfile("article-hgns-novitas", {
    scopeLevel: "billing",
    roleInPathway: "HGNS billing article",
    focus: "Novitas claim implementation with a similar 61886 text reference.",
    baselineDocumentIds: ["lcd-hgns-novitas"],
    statements: [
      statement("procedure-coverage-lane", "codes", "codes", "CPT 64582/64583/64584 are the live procedure lane.", {
        significance: "medium",
      }),
      statement("primary-diagnosis-code", "codes", "codes", "Claims anchor on G47.33.", {
        significance: "medium",
      }),
      statement("secondary-bmi-code-ceiling", "codes", "codes", "BMI code lane stops at Z68.34 and stays aligned to BMI < 35.", {
        significance: "medium",
      }),
      statement("legacy-code-reference", "differs", "codes", "Text mentions CPT 61886 for pulse-generator replacement even though it is not in the main code table.", {
        significance: "low",
      }),
    ],
  }),
];

const familyDeltaSummaries = [
  {
    familyId: "sleep-testing",
    baselineDocumentIds: ["ncd-sleep-testing"],
    localDocumentIds: [],
    counts: {
      baseline: 4,
      reuses: 0,
      narrows: 0,
      operationalizes: 0,
      adds: 0,
      differs: 0,
      codes: 0,
    },
    takeaway: "Pure national baseline. Downstream therapies inherit this diagnostic floor and then narrow it.",
  },
  {
    familyId: "pap-therapy",
    baselineDocumentIds: ["ncd-cpap", "ncd-sleep-testing"],
    localDocumentIds: ["lcd-pap-dme"],
    counts: {
      baseline: 5,
      reuses: 2,
      narrows: 3,
      operationalizes: 3,
      adds: 0,
      differs: 0,
      codes: 0,
    },
    takeaway: "PAP LCD does not reinvent OSA; it mostly operationalizes and narrows the national CPAP rule.",
  },
  {
    familyId: "oral-appliance",
    baselineDocumentIds: ["ncd-sleep-testing", "ncd-cpap"],
    localDocumentIds: ["lcd-oral-appliance"],
    counts: {
      baseline: 0,
      reuses: 2,
      narrows: 3,
      operationalizes: 0,
      adds: 2,
      differs: 1,
      codes: 0,
    },
    takeaway: "Local branch reuses the national diagnostic logic but adds a new device lane and severe-disease PAP step-therapy path.",
  },
  {
    familyId: "surgery",
    baselineDocumentIds: ["ncd-sleep-testing", "ncd-cpap"],
    localDocumentIds: ["lcd-surgery-wps", "article-surgery-wps"],
    counts: {
      baseline: 0,
      reuses: 0,
      narrows: 3,
      operationalizes: 0,
      adds: 3,
      differs: 1,
      codes: 1,
    },
    takeaway: "Surgery is genuinely narrower than the national OSA floor and carries explicit non-covered procedures.",
  },
  {
    familyId: "hgns",
    baselineDocumentIds: ["ncd-sleep-testing", "ncd-cpap"],
    localDocumentIds: [
      "lcd-hgns-wps",
      "lcd-hgns-cgs",
      "lcd-hgns-noridian",
      "lcd-hgns-noridian-jf-legacy",
      "lcd-hgns-palmetto",
      "lcd-hgns-ngs",
      "lcd-hgns-fcso",
      "lcd-hgns-novitas",
    ],
    counts: {
      baseline: 0,
      reuses: 0,
      narrows: 1,
      operationalizes: 0,
      adds: 6,
      differs: 4,
      codes: 5,
    },
    takeaway: "HGNS is mostly a new local implant-selection framework layered on top of the older national OSA diagnostic floor, with some real MAC-level wording and billing variation.",
  },
];

const familyLineage = {
  columns: raw.policyFamilies.map((family) => ({
    familyId: family.id,
    label: family.label,
  })),
  rows: [
    {
      requirementId: "valid-sleep-test-modality",
      whyItMatters: "Defines what counts as valid diagnostic evidence before any therapy branch is even considered.",
      cells: [
        {
          familyId: "sleep-testing",
          relation: "baseline",
          valueSummary: "Type I-IV and PAT-capable multi-channel pathways are the diagnostic floor.",
          sourceDocumentIds: ["ncd-sleep-testing"],
        },
        {
          familyId: "pap-therapy",
          relation: "reuses",
          valueSummary: "Uses the national Medicare-valid sleep-testing floor.",
          sourceDocumentIds: ["ncd-cpap", "ncd-sleep-testing"],
        },
        {
          familyId: "oral-appliance",
          relation: "reuses",
          valueSummary: "Uses a Medicare-covered sleep test without redefining the test taxonomy.",
          sourceDocumentIds: ["lcd-oral-appliance", "ncd-sleep-testing"],
        },
        {
          familyId: "surgery",
          relation: "narrows",
          valueSummary: "Requires lab-based AASM-certified sleep evaluation rather than any qualifying home-study path.",
          sourceDocumentIds: ["lcd-surgery-wps"],
        },
        {
          familyId: "hgns",
          relation: "narrows",
          valueSummary: "Requires PSG and adds a recency gate, collapsing the broader national test menu.",
          sourceDocumentIds: ["lcd-hgns-wps", "lcd-hgns-palmetto"],
        },
      ],
    },
    {
      requirementId: "ahi-rdi-threshold",
      whyItMatters: "Shows where local policies truly diverge from the national severity logic.",
      cells: [
        {
          familyId: "sleep-testing",
          relation: "baseline",
          valueSummary: "Diagnostic NCD itself does not set treatment severity gates.",
          sourceDocumentIds: ["ncd-sleep-testing"],
        },
        {
          familyId: "pap-therapy",
          relation: "baseline",
          valueSummary: "AHI/RDI ≥15 direct, or 5-14 with symptoms/comorbidities.",
          sourceDocumentIds: ["ncd-cpap"],
        },
        {
          familyId: "oral-appliance",
          relation: "differs",
          valueSummary: "5-30 can qualify directly; >30 pushes into PAP failure/intolerance logic.",
          sourceDocumentIds: ["lcd-oral-appliance"],
        },
        {
          familyId: "surgery",
          relation: "differs",
          valueSummary: "RDI ≥15 only; no mild-comorbidity branch.",
          sourceDocumentIds: ["lcd-surgery-wps"],
        },
        {
          familyId: "hgns",
          relation: "differs",
          valueSummary: "AHI 15-65 plus obstructive-event predominance.",
          sourceDocumentIds: ["lcd-hgns-noridian", "lcd-hgns-palmetto"],
        },
      ],
    },
    {
      requirementId: "cpap-intolerance-definition",
      whyItMatters: "The downstream pathways use CPAP intolerance differently, and HGNS contractors do not define it identically.",
      cells: [
        {
          familyId: "sleep-testing",
          relation: "baseline",
          valueSummary: "Not part of the diagnostic floor.",
          sourceDocumentIds: [],
        },
        {
          familyId: "pap-therapy",
          relation: "baseline",
          valueSummary: "Not applicable because PAP is the first-line therapy.",
          sourceDocumentIds: [],
        },
        {
          familyId: "oral-appliance",
          relation: "adds",
          valueSummary: "Only matters on the severe-OAS branch or when PAP is contraindicated.",
          sourceDocumentIds: ["lcd-oral-appliance"],
        },
        {
          familyId: "surgery",
          relation: "adds",
          valueSummary: "Used as part of failed CPAP/non-invasive treatment pathway.",
          sourceDocumentIds: ["lcd-surgery-wps"],
        },
        {
          familyId: "hgns",
          relation: "differs",
          valueSummary: "Core rule exists in every HGNS LCD, but Palmetto uses a 70%-of-nights metric while others use 5 nights/week language.",
          sourceDocumentIds: ["lcd-hgns-palmetto", "lcd-hgns-noridian", "lcd-hgns-wps"],
        },
      ],
    },
    {
      requirementId: "objective-adherence-threshold",
      whyItMatters: "A good example of local operationalization versus a different therapy-selection definition.",
      cells: [
        {
          familyId: "sleep-testing",
          relation: "baseline",
          valueSummary: "Not applicable.",
          sourceDocumentIds: [],
        },
        {
          familyId: "pap-therapy",
          relation: "operationalizes",
          valueSummary: "Continuation requires ≥4 hours/night on ≥70% of nights plus clinical re-evaluation.",
          sourceDocumentIds: ["lcd-pap-dme"],
        },
        {
          familyId: "oral-appliance",
          relation: "baseline",
          valueSummary: "No machine-derived adherence threshold.",
          sourceDocumentIds: [],
        },
        {
          familyId: "surgery",
          relation: "baseline",
          valueSummary: "No machine-derived adherence threshold.",
          sourceDocumentIds: [],
        },
        {
          familyId: "hgns",
          relation: "differs",
          valueSummary: "Appears inside some MACs’ CPAP-intolerance definition rather than as a continuation rule.",
          sourceDocumentIds: ["lcd-hgns-palmetto", "lcd-hgns-noridian"],
        },
      ],
    },
    {
      requirementId: "anatomic-assessment",
      whyItMatters: "Downstream OSA therapies diverge sharply once anatomy becomes a selection gate.",
      cells: [
        {
          familyId: "sleep-testing",
          relation: "baseline",
          valueSummary: "No anatomy gate.",
          sourceDocumentIds: [],
        },
        {
          familyId: "pap-therapy",
          relation: "baseline",
          valueSummary: "No anatomy gate.",
          sourceDocumentIds: [],
        },
        {
          familyId: "oral-appliance",
          relation: "baseline",
          valueSummary: "No formal anatomy gate in the LCD.",
          sourceDocumentIds: ["lcd-oral-appliance"],
        },
        {
          familyId: "surgery",
          relation: "adds",
          valueSummary: "Obstruction site identification is required to match the operation to the anatomy.",
          sourceDocumentIds: ["lcd-surgery-wps"],
        },
        {
          familyId: "hgns",
          relation: "adds",
          valueSummary: "DISE with no complete concentric collapse plus no other anatomy compromise.",
          sourceDocumentIds: ["lcd-hgns-wps", "lcd-hgns-palmetto"],
        },
      ],
    },
    {
      requirementId: "provider-role",
      whyItMatters: "Much of the real local coverage spread lives in who is allowed to furnish or support the therapy.",
      cells: [
        {
          familyId: "sleep-testing",
          relation: "baseline",
          valueSummary: "Treating practitioner order governs entry.",
          sourceDocumentIds: ["ncd-sleep-testing"],
        },
        {
          familyId: "pap-therapy",
          relation: "operationalizes",
          valueSummary: "Treating practitioner handles evaluation, re-evaluation, and DME ordering.",
          sourceDocumentIds: ["lcd-pap-dme"],
        },
        {
          familyId: "oral-appliance",
          relation: "adds",
          valueSummary: "Treating practitioner orders; licensed dentist supplies and bills the device.",
          sourceDocumentIds: ["lcd-oral-appliance"],
        },
        {
          familyId: "surgery",
          relation: "adds",
          valueSummary: "Qualified surgeon in an appropriate operative setting.",
          sourceDocumentIds: ["lcd-surgery-wps"],
        },
        {
          familyId: "hgns",
          relation: "adds",
          valueSummary: "Sleep physician, implanting otolaryngologist, and DISE-capable surgeon all become relevant actors.",
          sourceDocumentIds: ["lcd-hgns-noridian", "lcd-hgns-wps"],
        },
      ],
    },
    {
      requirementId: "secondary-bmi-code-ceiling",
      whyItMatters: "Shows where billing articles can diverge from the clinical text and create adjudication ambiguity.",
      cells: [
        {
          familyId: "sleep-testing",
          relation: "baseline",
          valueSummary: "No therapy-specific BMI code lane.",
          sourceDocumentIds: [],
        },
        {
          familyId: "pap-therapy",
          relation: "baseline",
          valueSummary: "No BMI code ceiling in the CPAP NCD/LCD pair.",
          sourceDocumentIds: [],
        },
        {
          familyId: "oral-appliance",
          relation: "baseline",
          valueSummary: "No BMI coding rule.",
          sourceDocumentIds: [],
        },
        {
          familyId: "surgery",
          relation: "baseline",
          valueSummary: "No central BMI coding lane in this curated surgery slice.",
          sourceDocumentIds: ["article-surgery-wps"],
        },
        {
          familyId: "hgns",
          relation: "differs",
          valueSummary: "Noridian billing extends to Z68.39 while other MACs stop at Z68.34.",
          sourceDocumentIds: ["article-hgns-noridian", "article-hgns-palmetto", "article-hgns-fcso", "article-hgns-novitas"],
        },
      ],
    },
  ],
};

const contractorVariance = {
  familyId: "hgns",
  dimensions: [
    { id: "clinical-text", label: "Clinical text deltas" },
    { id: "provider-wording", label: "Provider wording" },
    { id: "billing", label: "Billing / article deltas" },
  ],
  rows: [
    {
      requirementId: "cpap-intolerance-definition",
      label: "CPAP intolerance wording",
      dimensionId: "clinical-text",
      takeaway: "Every HGNS LCD requires CPAP failure/intolerance, but Palmetto uses a different measurement window than the other MACs.",
      contractorValues: [
        { contractorId: "wps", relation: "adds", valueSummary: "<4 h/night, 5 nights/week", sourceDocumentId: "lcd-hgns-wps" },
        { contractorId: "cgs", relation: "adds", valueSummary: "<4 h/night, 5 nights/week", sourceDocumentId: "lcd-hgns-cgs" },
        { contractorId: "noridian-je", relation: "adds", valueSummary: "<4 h/night, 5 nights/week or returned CPAP", sourceDocumentId: "lcd-hgns-noridian" },
        { contractorId: "noridian-jf", relation: "adds", valueSummary: "<4 h/night, 5 nights/week or returned CPAP", sourceDocumentId: "lcd-hgns-noridian-jf-legacy" },
        { contractorId: "palmetto", relation: "differs", valueSummary: "<4 h/night for 70% of nights in 1 month", sourceDocumentId: "lcd-hgns-palmetto" },
        { contractorId: "ngs", relation: "adds", valueSummary: "<4 h/night, 5 nights/week or returned CPAP", sourceDocumentId: "lcd-hgns-ngs" },
        { contractorId: "first-coast", relation: "adds", valueSummary: "<4 h/night, 5 nights/week or returned CPAP", sourceDocumentId: "lcd-hgns-fcso" },
        { contractorId: "novitas", relation: "adds", valueSummary: "<4 h/night, 5 nights/week or returned CPAP", sourceDocumentId: "lcd-hgns-novitas" },
      ],
    },
    {
      requirementId: "shared-decision-making",
      label: "SDM definition",
      dimensionId: "clinical-text",
      takeaway: "WPS is the outlier; most HGNS LCDs define SDM as a patient-provider conversation, not a dual-physician attestation.",
      contractorValues: [
        { contractorId: "wps", relation: "differs", valueSummary: "Referring + implanting physician documentation", sourceDocumentId: "lcd-hgns-wps" },
        { contractorId: "cgs", relation: "adds", valueSummary: "Patient-provider documented conversation", sourceDocumentId: "lcd-hgns-cgs" },
        { contractorId: "noridian-je", relation: "adds", valueSummary: "Patient-provider documented conversation", sourceDocumentId: "lcd-hgns-noridian" },
        { contractorId: "noridian-jf", relation: "adds", valueSummary: "Patient-provider documented conversation", sourceDocumentId: "lcd-hgns-noridian-jf-legacy" },
        { contractorId: "palmetto", relation: "adds", valueSummary: "Patient-provider documented conversation", sourceDocumentId: "lcd-hgns-palmetto" },
        { contractorId: "ngs", relation: "adds", valueSummary: "Patient-provider documented conversation", sourceDocumentId: "lcd-hgns-ngs" },
        { contractorId: "first-coast", relation: "adds", valueSummary: "Patient-provider documented conversation", sourceDocumentId: "lcd-hgns-fcso" },
        { contractorId: "novitas", relation: "adds", valueSummary: "Patient-provider documented conversation", sourceDocumentId: "lcd-hgns-novitas" },
      ],
    },
    {
      requirementId: "board-credentialing",
      label: "Board-eligible wording",
      dimensionId: "provider-wording",
      takeaway: "Some MACs accept board-eligible surgeons while others say board-certified only.",
      contractorValues: [
        { contractorId: "wps", relation: "adds", valueSummary: "Board-certified", sourceDocumentId: "lcd-hgns-wps" },
        { contractorId: "cgs", relation: "adds", valueSummary: "Board-certified", sourceDocumentId: "lcd-hgns-cgs" },
        { contractorId: "noridian-je", relation: "differs", valueSummary: "Board-certified or board-eligible", sourceDocumentId: "lcd-hgns-noridian" },
        { contractorId: "noridian-jf", relation: "differs", valueSummary: "Board-certified or board-eligible", sourceDocumentId: "lcd-hgns-noridian-jf-legacy" },
        { contractorId: "palmetto", relation: "adds", valueSummary: "Board-certified", sourceDocumentId: "lcd-hgns-palmetto" },
        { contractorId: "ngs", relation: "differs", valueSummary: "Board-certified or board-eligible", sourceDocumentId: "lcd-hgns-ngs" },
        { contractorId: "first-coast", relation: "differs", valueSummary: "Board-certified or board-eligible", sourceDocumentId: "lcd-hgns-fcso" },
        { contractorId: "novitas", relation: "adds", valueSummary: "Board-certified", sourceDocumentId: "lcd-hgns-novitas" },
      ],
    },
    {
      requirementId: "secondary-bmi-code-ceiling",
      label: "BMI coding ceiling",
      dimensionId: "billing",
      takeaway: "The real adjudication spread is in the billing articles: Noridian goes beyond the clinical BMI text.",
      contractorValues: [
        { contractorId: "wps", relation: "codes", valueSummary: "Aligned to BMI < 35", sourceDocumentId: "article-hgns-wps" },
        { contractorId: "cgs", relation: "codes", valueSummary: "Aligned to BMI < 35", sourceDocumentId: "article-hgns-cgs" },
        { contractorId: "noridian-je", relation: "differs", valueSummary: "Extends to Z68.39", sourceDocumentId: "article-hgns-noridian" },
        { contractorId: "noridian-jf", relation: "differs", valueSummary: "Extends to Z68.39", sourceDocumentId: "article-hgns-noridian-jf-legacy" },
        { contractorId: "palmetto", relation: "codes", valueSummary: "Stops at Z68.34", sourceDocumentId: "article-hgns-palmetto" },
        { contractorId: "ngs", relation: "codes", valueSummary: "Article not curated separately; family follows common coding bundle", sourceDocumentId: "lcd-hgns-ngs" },
        { contractorId: "first-coast", relation: "codes", valueSummary: "Stops at Z68.34", sourceDocumentId: "article-hgns-fcso" },
        { contractorId: "novitas", relation: "codes", valueSummary: "Stops at Z68.34", sourceDocumentId: "article-hgns-novitas" },
      ],
    },
    {
      requirementId: "legacy-code-reference",
      label: "Legacy procedure code",
      dimensionId: "billing",
      takeaway: "Only the retired Noridian JF article still carries CPT 64568.",
      contractorValues: [
        { contractorId: "wps", relation: "codes", valueSummary: "None", sourceDocumentId: "article-hgns-wps" },
        { contractorId: "cgs", relation: "codes", valueSummary: "None", sourceDocumentId: "article-hgns-cgs" },
        { contractorId: "noridian-je", relation: "codes", valueSummary: "None", sourceDocumentId: "article-hgns-noridian" },
        { contractorId: "noridian-jf", relation: "differs", valueSummary: "CPT 64568 retained", sourceDocumentId: "article-hgns-noridian-jf-legacy" },
        { contractorId: "palmetto", relation: "codes", valueSummary: "None", sourceDocumentId: "article-hgns-palmetto" },
        { contractorId: "ngs", relation: "codes", valueSummary: "None curated", sourceDocumentId: "lcd-hgns-ngs" },
        { contractorId: "first-coast", relation: "codes", valueSummary: "Text mentions 61886, not 64568", sourceDocumentId: "article-hgns-fcso" },
        { contractorId: "novitas", relation: "codes", valueSummary: "Text mentions 61886, not 64568", sourceDocumentId: "article-hgns-novitas" },
      ],
    },
  ],
};

const ruleMetamodel = {
  abstractionLayers: [
    {
      id: "requirements",
      label: "Requirement dictionary",
      description: "Canonical requirement entities with definitions, evidence payloads, and reuse across policy families.",
    },
    {
      id: "documents",
      label: "Document rule packs",
      description: "Each NCD/LCD/article decomposed into typed requirement statements with semantic relations to the baseline.",
    },
    {
      id: "lineage",
      label: "Lineage matrix",
      description: "Family-by-family comparison showing whether the policy baseline is reused, narrowed, operationalized, added to, or genuinely different.",
    },
    {
      id: "variance",
      label: "Contractor variance",
      description: "Fine-grained contractor differences where nominally similar LCDs diverge in wording, provider rules, or billing articles.",
    },
  ],
  relationLegend,
  requirementGroups,
  requirementCatalog,
  documentProfiles,
  familyDeltaSummaries,
  familyLineage,
  contractorVariance,
  analyticQuestions: [
    {
      id: "lcd-vs-ncd-meaningful-difference",
      prompt: "Does this LCD say anything meaningfully different from the NCD?",
      answer: "Answer by separating literal restatement, local operationalization, local narrowing, and truly new therapy-specific rules.",
      viewIds: ["familyLineage", "familyDeltaSummaries", "documentProfiles"],
    },
    {
      id: "where-do-billing-articles-matter",
      prompt: "Where does the real operational spread live when LCD core criteria look aligned?",
      answer: "Answer by moving from the clinical-core matrix to billing/article-specific requirement entries such as BMI code ceilings, modifier guidance, and legacy code references.",
      viewIds: ["contractorVariance", "documentProfiles"],
    },
    {
      id: "what-evidence-does-a-rule-need",
      prompt: "What patient-side evidence or claim artifact satisfies this requirement?",
      answer: "Answer from the requirement dictionary, which binds each requirement to typical evidence payloads and related variables.",
      viewIds: ["requirementCatalog"],
    },
  ],
};

raw.ruleMetamodel = ruleMetamodel;

for (const profile of documentProfiles) {
  assertSource(profile.documentId);
  profile.baselineDocumentIds.forEach(assertSource);
}

await writeFile(dataPath, `${JSON.stringify(raw, null, 2)}\n`);

console.log(
  `Wrote rule metamodel with ${requirementCatalog.length} requirements, ${documentProfiles.length} document rule packs, and ${familyLineage.rows.length} lineage rows.`,
);
