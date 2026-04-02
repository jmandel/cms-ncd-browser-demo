# Tutorial Outline: How Medicare Coverage Policy Gets Structured

## Implementation status

- [x] Section 1: Hero + scope stats — `renderHero()` modified with stat cards
- [x] Section 2: Disease + treatment landscape — NEW `renderDiseaseLandscape()`
- [x] Section 3: CMS vocabulary + institutional context + three key ideas — `renderCmsGlossary()` modified
- [x] Section 4: Source examples + before/after — `renderSourceLandscape()` + NEW `renderBeforeAfterPanel()`
- [x] Section 5: National baseline — `renderNcdTutorial()` kept as-is
- [x] Section 6: Relation vocabulary + worked example — NEW `renderRelationVocabulary()`
- [x] Section 7: Family rail + eligibility landscape — `renderFamilyRail()` + `renderEligibilityLandscape()` (now called)
- [x] Section 8: Selected path + lineage matrix — `renderFamilyFocus()` trimmed + `renderFamilyLineage()` (now called)
- [x] Section 9: MAC variation (selective) — `renderMacVariation()` trimmed
- [x] Section 10: Codes and claims — `renderCodeAtlas()` trimmed (hgnsMacVariation removed)
- [x] Section 11: Timeline + insights — `renderTimeline()` + `renderInsights()` (now called)
- [x] Section 12: Structured model + source ledger — `renderStructuredModelBrowser()` + `renderSourceLedger()` (now called)
- [x] CSS: severity bar, pathway diagram, clinical terms, before/after panel, institutional callout, snapshot table
- [x] Build passes cleanly
- [x] Visual QA in browser — all 16 sections rendering correctly
- [x] Fix: HGNS delta card source chips capped at 4 + overflow count
- [x] Fix: Code atlas group tables capped at 8 rows + overflow note

## Governing principles

1. **Show, don't just tell.** Every claim about structure should be backed by a
   visualization generated from the abstracted data model, or by a real excerpt
   from the CMS source documents. No invented examples.

2. **Shorter is better.** Each section earns its place by delivering one message
   the reader cannot get from the previous section. Deep tables and exhaustive
   ledgers are available in the data browser at the end, not inline.

3. **The tutorial is itself the proof.** The structured data model powers the
   comparisons and visualizations. By the end, the reader should understand
   that those comparisons would be impossible without the abstraction step.

4. **Audience order of priority:** health IT / informaticists, policy analysts,
   clinical informaticists, then AI/ML engineers and generalists. Every section
   should be legible to all five but optimized for the first three.

---

## Data provenance (for the outline, not shown to the reader yet)

- **CMS Coverage API** at `api.coverage.cms.gov` publishes bulk listings (344
  NCDs, 961 LCDs, 2,157 articles as of March 2026) and per-document detail
  endpoints with full HTML text, code tables, contractor lists, and related
  documents.
- **Raw per-document JSON** lives in `claude/raw-*.json` (26 OSA documents
  fetched from the CMS detail API). Each file has a shared schema: `type`,
  `documentId`, `displayId`, `criteriaGroups` (semi-structured plain-text
  bullets), `codeTables` (machine-readable code rows), `sections` (escaped
  HTML narrative), `contractors`, `relatedDocuments`.
- **The codex data model** in `codex/data/obstructive-sleep-apnea.json` is the
  hand-curated abstraction: 27 source documents decomposed into 5 policy
  families, 15 evidence variables, 5 treatment models, 5 layering models, a
  rule metamodel with 43 canonical requirements, 27 document profiles, a
  10-row lineage matrix, and contractor variance tables.

---

## Section 1: Hero and scope

### Message
This is a guided tutorial that uses one disease to show how Medicare coverage
policy works as a layered system and how public CMS documents can be turned
into structured, comparable data.

### Content
- Title, subtitle, one-paragraph scope statement
- "Read this as a guided tour" sidebar (4 steps: learn the terms, see the
  national baseline, watch how local policy changes it, see where contractors
  diverge)
- Scope stats bar generated from the data model:
  - **27** public CMS documents reviewed
  - **5** treatment paths modeled
  - **43** canonical requirement entities
  - **8** contractor jurisdictions compared

### Why this section exists
Sets expectations immediately. The stats bar tells the reader this is not a
one-document summary but a cross-document synthesis, and it establishes the
scale before any detail arrives.

### Visualization
Four stat cards. Already supported by the data model (`sourceDocuments.length`,
`policyFamilies.length`, `ruleMetamodel.requirementCatalog.length`,
`crossMacComparison.criteriaMatrix.contractors.length`).

---

## Section 2: The disease and the treatment landscape

### Message
OSA is a common sleep disorder measured by a single severity index (AHI).
Multiple treatments exist because patients fail or cannot tolerate the
first-line option. This clinical reality is why coverage policy branches.

### Content

**Clinical primer (brief, not a textbook):**
- One sentence: OSA is repeated upper-airway collapse during sleep, causing
  oxygen drops and fragmented sleep.
- Define the four terms that recur throughout the tutorial:
  - **AHI** — apnea-hypopnea index, events per hour of sleep (from
    `disease.clinicalDefinitions.ahi`)
  - **RDI** — respiratory disturbance index (from
    `disease.clinicalDefinitions.rdi`)
  - **BMI** — body mass index, used as a ceiling for one treatment
  - **PSG** — polysomnography, the formal overnight sleep study

**Severity scale visualization:**
- Horizontal color bar from the data model (`disease.severityScale`):
  Normal (<5) → Mild (5-14) → Moderate (15-29) → Severe (30-65) → Very Severe (>65)
- Annotation: "These AHI thresholds reappear in every coverage comparison that
  follows."

**Treatment pathway diagram:**
- Three-step visual from `treatmentPathway.steps`:
  1. Sleep Testing & Diagnosis (NCD 240.4.1)
  2. CPAP / PAP Therapy — first-line (NCD 240.4)
  3. Second-line branches: HGNS, Oral Appliance, Surgery
- Arrow from step 2 to step 3 labeled "CPAP failure or intolerance"
- One sentence per treatment:
  - **CPAP**: a mask worn during sleep that keeps the airway open with air pressure
  - **Oral appliance**: a custom dental device that advances the jaw
  - **HGNS**: an implanted nerve stimulator (Inspire device) for the tongue muscle
  - **Surgery**: procedures that reshape the airway (UPPP, jaw advancement, etc.)

**Eligibility snapshot table:**
Generated from `treatmentModels` — one row per treatment, columns for AHI
range, BMI ceiling, age floor, and whether CPAP failure is required:

| Treatment | AHI | BMI | Age | CPAP failure? |
|-----------|-----|-----|-----|---------------|
| CPAP | ≥5 | No ceiling | Adult | N/A (first-line) |
| HGNS | 15–65 | <35 | ≥22 | Required |
| Oral appliance | ≥5 | No ceiling | Not fixed | Conditional |
| Surgery | ≥15 (RDI) | No ceiling | Not fixed | Required |

- Annotation: "Notice that HGNS is the only treatment with both an upper AHI
  cap and a BMI ceiling. These differences are why each treatment needs its own
  coverage logic."

### Why this section exists
Without this, the reader encounters AHI thresholds, BMI gates, and treatment
branches as abstract policy concepts with no clinical grounding. Every audience
segment benefits: policy analysts see why the branches exist, health IT
builders see the decision inputs, clinical informaticists confirm their mental
model, AI engineers see the extraction targets.

### Visualizations
1. Severity color bar (generated from `disease.severityScale`)
2. Treatment pathway step diagram (generated from `treatmentPathway.steps`)
3. Eligibility snapshot table (generated from `treatmentModels[].eligibility`)

---

## Section 3: How Medicare organizes coverage policy

### Message
Medicare coverage is not one document per disease. It is a layered stack:
national baseline (NCD) → local contractor policy (LCD) → billing/coding
execution (Article) → revision history (Response records). Different document
types do different jobs, and the same disease can involve dozens of documents.

### Content

**The policy stack visual:**
Four stacked layers, each with term, role, and one-sentence explanation:

1. **NCD** — National Coverage Determination. The Medicare-wide baseline. For
   OSA, the NCDs define the covered sleep-test pathways and the first-line
   CPAP framework.
2. **LCD** — Local Coverage Determination. Written by a Medicare Administrative
   Contractor (MAC) for its jurisdiction. LCDs can reuse the NCD, narrow it,
   operationalize it, or create a therapy-specific treatment path.
3. **Article** — CMS's own record type for companion billing and coding
   instructions. Not a journal article. This layer translates coverage into
   ICD-10, CPT/HCPCS codes, modifiers, and documentation instructions.
4. **Response record** — Explains why a policy changed, which objections were
   answered, and whether a treatment path is current, retired, or consolidated.

**MAC sidecar:**
One paragraph: a MAC is the regional contractor that writes LCDs and Articles
for its jurisdictions. CMS organizes these as geographic jurisdictions (12
Part A/B, 4 DME) rather than state-by-state policies.

**Institutional scale (one short callout box):**
- 344 NCDs, 961 LCDs, and 2,157 Articles in the CMS Medicare Coverage
  Database as of March 2026 (from `data/raw/manifest.json` counts).
- 7 contractor organizations operate across all MAC jurisdictions (from
  `data/raw/contractors.json`).
- CMS's 2024 interoperability rule (CMS-0057-F) mandates electronic prior
  authorization APIs by 2027. The HL7 Da Vinci Implementation Guides (CRD,
  DTR, PAS) create the transport layer for electronic prior auth, but there
  is no standard format for a "computable LCD." Each vendor must independently
  interpret prose policy into rules engines. This tutorial demonstrates what
  that missing structured layer could look like.

**Three key ideas (compact cards):**
1. One disease can have multiple policy layers
2. Different CMS documents do different jobs
3. Structure is what makes comparison possible

### Why this section exists
The CMS vocabulary is prerequisite to everything that follows. The
institutional scale callout is the "why should I care?" framing — it connects
to the reader's world (prior auth burden, interoperability mandates, coverage
decision tools). The three key ideas set the mental model.

### Visualizations
1. Stacked layer diagram (NCD → LCD → Article → Response, color-coded)
2. Stat callout (344 / 961 / 2,157 counts)

---

## Section 4: What the source documents actually look like

### Message
CMS publishes these documents through a public API. They are neither pure
prose nor pure structure — they are somewhere in between, and different
document types are structured to different degrees. This is what a modeling
pipeline starts from.

### Content

**Four example cards** (one per document type), each showing:
- Document chip linking to the real CMS URL
- The document type label
- A paraphrased key rule from that document
- "What this means" annotation

The four examples, drawn from the actual source documents:

1. **NCD 240.4.1** (Sleep Testing) — "Type I PSG, Type II, Type III, Type IV,
   and PAT-based multi-channel pathways can all qualify when the technical
   criteria are met." *This is a baseline evidence rule that defines what
   kinds of sleep studies Medicare will accept.*

2. **LCD L33718** (PAP Devices) — "Objective adherence is defined as at least
   4 hours per night on at least 70% of nights in a consecutive 30-day period,
   with follow-up between days 31 and 91." *This is a local workflow rule that
   turns the national CPAP trial concept into auditable thresholds.*

3. **Article A57948** (HGNS Billing, Noridian) — "Claims anchor on G47.33 with
   companion BMI diagnosis-code lanes that extend beyond the clinical BMI
   ceiling stated in the LCD text." *This is a claim-execution rule. It shows
   why the billing article matters: claim logic can diverge from the clinical
   LCD wording.*

4. **Article A58070** (HGNS Response to Comments, Palmetto) — "Stakeholder
   feedback and the contractor's rationale for the final wording are preserved
   as part of the rollout history." *This is a governance record that explains
   why a policy looks the way it does.*

**Before/after panel — "From CMS source to structured data":**

This is the most important new didactic element. Show two real excerpts
side by side with the structured output.

*Example 1: Semi-structured criteria*

Left side — raw `criteriaGroups` from the Palmetto HGNS LCD
(`claude/raw-lcd-38276.json`), verbatim:

> - Beneficiary is 22 years of age or older; and
> - Body mass index (BMI) is less than 35 kg/m2; and
> - A polysomnography (PSG) demonstrating an apnea-hypopnea index (AHI) of 15
>   to 65 events per hour within 24 months of initial consultation for HNS
>   implant; and
> - Beneficiary has predominantly obstructive events (defined as central and
>   mixed apneas less than 25% of the total AHI); and
> - Shared Decision-Making (SDM) between the Beneficiary, Sleep physician, AND
>   qualified otolaryngologist ...

Right side — the structured requirement statements extracted from this text
(from the data model's `ruleMetamodel.documentProfiles` for `lcd-hgns-palmetto`):

| Requirement | Relation | Value |
|-------------|----------|-------|
| Age gate | Adds | ≥ 22 years |
| BMI gate | Adds | < 35 kg/m² |
| Severity gate | Differs | AHI 15–65 events/hour |
| Central-event ceiling | Adds | Central + mixed < 25% of total |
| CPAP intolerance | Differs | <4 hrs/night for 70% of nights in 1 month |

Annotation: "The left side is what CMS publishes. The right side is the
structured abstraction. The 'Relation' column — adds, differs — tells you how
this local rule connects to the national baseline. That vocabulary is
introduced in the next section."

*Example 2: Already-structured code tables*

Left side — raw `codeTables` from the Noridian HGNS billing article
(`claude/raw-article-57948.json`), showing 3 procedure rows:

| Code | Description |
|------|-------------|
| 64582 | Open implantation of hypoglossal nerve neurostimulator array... |
| 64583 | Revision or replacement of hypoglossal nerve neurostimulator... |
| 64584 | Removal of hypoglossal nerve neurostimulator array... |

Right side — the same codes in the data model's code catalog.

Annotation: "Billing articles are already semi-structured. The harder
extraction problem is in the clinical LCD prose, not the code tables."

### Why this section exists
This is where the extraction/AI thesis becomes concrete. Instead of claiming
"AI can extract structure," we show what the source looks like and what the
output looks like. The two examples demonstrate the spectrum: clinical criteria
need real extraction; code tables are already mostly machine-readable.

### Visualizations
1. Four example document cards (existing pattern, tightened)
2. Before/after two-column panel (new, driven by raw source data + data model)

---

## Section 5: The national baseline (NCDs)

### Message
Two NCDs define a national floor for OSA: which sleep tests count, and how
CPAP coverage works. Everything downstream inherits or modifies this floor.

### Content

**Brief chapter intro:**
"The OSA NCDs are not just prose. Once extracted, they define valid diagnostic
modalities, severity thresholds, mild-disease exceptions, and the initial CPAP
trial pathway."

**Two NCD rule cards** (generated from `ruleMetamodel.documentProfiles` for
`ncd-sleep-testing` and `ncd-cpap`):

*Card 1: NCD 240.4.1 — Sleep Testing (Diagnostic floor)*
- Scope: National
- Key statements:
  - Clinical signs and symptoms required before testing
  - Type I PSG, Type II-IV, and PAT-based pathways all qualify
  - Ordered by treating physician under appropriate supervision

*Card 2: NCD 240.4 — CPAP Therapy (First-line PAP rule)*
- Scope: National
- Compared against: NCD 240.4.1 (inherits the diagnostic floor)
- Key statements:
  - AHI/RDI ≥15 qualifies directly
  - AHI/RDI 5–14 qualifies only with symptoms or comorbidities
  - Initial coverage limited to 12-week trial
  - Beneficiary education required

**Callout:**
"These two documents are the foundation. The AHI thresholds, the trial period,
and the valid test modalities reappear in every treatment path that follows.
The question is always: does the local policy reuse this floor, narrow it, or
replace it?"

### Why this section exists
The national baseline must be established before local variation makes sense.
The reader needs to see the concrete rules (AHI ≥15, 12-week trial, valid test
types) so they can recognize when a local policy changes them.

### Visualizations
1. Two document rule cards with structured statement lists (generated from
   `ruleMetamodel.documentProfiles[].statements`)
2. Source chips linking to CMS URLs

---

## Section 6: How local policies relate to the national baseline

### Message
To compare policies systematically, you need a vocabulary for how local rules
relate to the national floor. This section introduces that vocabulary and
makes it concrete with one worked example.

### Content

**The relation vocabulary:**
Eight labeled chips with one-line meanings, generated from
`ruleMetamodel.relationLegend`:

| Relation | Meaning |
|----------|---------|
| **Baseline** | The NCD establishes the canonical Medicare rule |
| **Reuses** | The LCD inherits the rule without changing it |
| **Narrows** | The local policy adds a stricter gate |
| **Operationalizes** | The local policy turns a broad concept into auditable thresholds |
| **Adds** | The local policy creates a requirement with no national counterpart |
| **Differs** | Two documents treat the same requirement differently enough to matter |
| **Codes** | The rule lives in billing/article logic, not the clinical text |
| **Governs** | The record governs lifecycle/revision context, not a clinical criterion |

Annotation: "These eight labels are the bridge from document reading to
structured comparison. Once every rule is tagged with a relation, you can ask
questions like 'show me everything that narrows the national baseline' or
'which requirements are genuinely different across contractors.'"

**Worked example — CPAP trial operationalization:**

Two-column layout:

*Left: In the source documents*
- NCD 240.4 says: "Initial coverage is limited to a 12-week trial period."
- LCD L33718 says: "Continued PAP coverage depends on a 90-day continuation
  window, objective adherence of at least 4 hours per night on 70% of nights,
  and follow-up between days 31 and 91."

*Right: In the structured model*
- Requirement: "Trial and continuation window"
- NCD relation: **baseline** (12-week trial)
- LCD relation: **operationalizes** (90-day window + adherence thresholds)
- Also new: **objective adherence threshold** — operationalizes (≥4 hrs/night
  on ≥70% of nights)

Annotation: "Instead of reading both documents and inferring the connection,
the structured model records it explicitly: the NCD defines the concept, the
LCD operationalizes it into auditable numbers."

**Treatment-path summary cards:**
One compact card per treatment path (generated from
`ruleMetamodel.familyDeltaSummaries`), showing the distribution of relations:

- **Sleep testing** — pure national baseline (4 baseline statements)
- **PAP / CPAP** — mostly operationalizes and narrows (4 operationalizes,
  3 narrows, 3 reuses)
- **Oral appliance** — reuses diagnostic logic but adds a device lane and
  PAP step-therapy path (4 narrows, 2 adds, 1 differs)
- **Surgery** — genuinely narrower, explicit non-covered procedures
  (4 adds, 3 narrows, 1 differs)
- **HGNS** — mostly new local logic layered on the national floor (122 adds,
  29 codes, 27 differs, 20 governs, 8 narrows)

Annotation: "HGNS has the most 'adds' because it is an LCD-only implant
pathway with no NCD of its own. Surgery has the most 'narrows' because it
restricts the diagnostic floor to AASM-certified labs."

### Why this section exists
This is the intellectual core. The relation vocabulary is what makes the
comparison computable rather than narrative. It must come after the NCD
baseline (so the reader has something concrete to compare against) and before
the eligibility landscape (which uses these labels). The worked example is
essential — it is the "aha" moment.

### Visualizations
1. Relation legend chips (generated from `ruleMetamodel.relationLegend`)
2. Two-column worked example
3. Five summary cards with relation-count distributions (generated from
   `ruleMetamodel.familyDeltaSummaries[].counts`)

---

## Section 7: Comparing treatment paths side by side

### Message
Once the criteria are normalized, you can compare all treatment paths in one
view. This is what the structured data buys you.

### Content

**Treatment path selector:**
Interactive cards or dropdown (generated from `policyFamilies`), letting the
reader choose a treatment path that stays highlighted in subsequent views.

**AHI range ladder:**
Visual bar chart showing the AHI coverage windows for each treatment,
generated from `treatmentModels[].eligibility`:
- CPAP: 5 → open (two bands: mild+comorbidities, moderate-severe)
- HGNS: 15 → 65 (single band, unique upper cap)
- Oral appliance: 5 → open (three bands by severity)
- Surgery: 15 → open (single band, RDI-based)

Axis labeled 0 → 5 → 15 → 30 → 65 → 80+ (events/hour).

**Full eligibility comparison table:**
Generated from `treatmentModels` and `layeringModels`, with source attribution
pills (NCD vs. LCD) on every cell:

| Requirement | CPAP | HGNS | Oral Appliance | Surgery |
|-------------|------|------|----------------|---------|
| Minimum AHI | 5 (NCD) | 15 (LCD) | 5 (LCD) | 15 RDI (LCD) |
| Maximum AHI | None (NCD) | 65 (LCD) | None (LCD) | None (LCD) |
| Minimum age | Adult (NCD) | 22 (LCD) | Not fixed | Not fixed |
| Maximum BMI | No ceiling (NCD) | <35 (LCD) | No ceiling | No ceiling |
| CPAP failure required | N/A first-line | Required (LCD) | Conditional (LCD) | Required (LCD) |
| Sleep-test rule | Qualifying PSG or HST (NCD) | PSG within 24 mo (LCD) | Medicare-covered test (LCD) | AASM-certified lab (LCD) |
| Trial period | 90-day window (NCD+LCD) | None | None | None |
| Adherence monitoring | ≥4h/night, 70% (LCD) | N/A | N/A | N/A |
| Anatomy assessment | Not primary | DISE required (LCD) | Not primary | Obstruction site (LCD) |
| Specialist | Treating practitioner (NCD) | Otolaryngologist + sleep physician (LCD) | Licensed dentist (LCD) | Qualified surgeon (LCD) |

Source pills: NCD pills = national floor value; LCD pills = local layer value.

Annotation: "Each cell tells you two things: what the rule is, and where it
comes from. NCD pills mean this threshold was set nationally. LCD pills mean
it was set or changed locally. If both appear, the rule synthesizes both
layers."

### Why this section exists
This is the single most valuable view for all audience segments. It is the
payoff of the abstraction: ten dimensions, four treatments, one table. Without
the structured data model, producing this table requires reading 10+ documents
side by side.

### Visualizations
1. Treatment path selector cards (generated from `policyFamilies`)
2. AHI range ladder bar chart (generated from `treatmentModels[].eligibility`)
3. Full eligibility comparison table with source pills (generated from
   `treatmentModels` + `layeringModels`)

---

## Section 8: The selected treatment path in detail

### Message
Drill into one treatment path to see how the national baseline, local
criteria, and the relation vocabulary come together for a single therapy.

### Content

**Typed profile card:**
Four metric tiles for the selected treatment (generated from
`treatmentModels[treatmentId].eligibility`):
- Age, AHI/RDI, BMI, CPAP prerequisite

**Key local criteria list:**
The concrete local rules for this path (generated from
`layeringModels[familyId].overlayCriteria`), each tagged with a relation chip
(narrows, adds, etc.) and linked to source documents.

**Requirement lineage matrix:**
The rows of `ruleMetamodel.familyLineage` rendered as a table:

| Requirement | Sleep testing | PAP | Oral appliance | Surgery | HGNS |
|-------------|---------------|-----|----------------|---------|------|
| Valid sleep-test modality | baseline | reuses | reuses | narrows | narrows |
| AHI/RDI threshold | baseline | baseline | differs | differs | differs |
| CPAP intolerance | — | — | adds | adds | differs |
| Adherence threshold | — | operationalizes | — | — | differs |
| Anatomy assessment | — | — | — | adds | adds |
| Provider role | baseline | operationalizes | adds | adds | adds |
| BMI code ceiling | — | — | — | — | differs |
| Device lane | — | narrows | narrows | adds | adds |
| Contraindication bundle | — | — | — | narrows | adds |
| Response-to-comments | — | — | — | — | governs |

Each cell is a colored relation chip. The selected treatment column is
highlighted. Source pills appear on hover or tap.

Annotation: "Read across a row to see how one requirement changes from path
to path. Read down a column to see the full fingerprint of one treatment
path."

### Why this section exists
The lineage matrix is the deepest expression of the abstraction. It shows
that the same requirement concept can be baseline in one path, narrowed in
another, operationalized in a third, and genuinely different in a fourth.
This view is only possible because of the requirement dictionary and the
relation vocabulary.

### Visualizations
1. Typed profile metric tiles (generated from `treatmentModels`)
2. Local criteria list with relation chips (generated from `layeringModels`)
3. Requirement lineage matrix with colored relation chips (generated from
   `ruleMetamodel.familyLineage`)

---

## Section 9: Where "aligned" policies actually diverge

### Message
HGNS is the stress test. Eight LCDs from seven contractors look nearly
identical. Once structured, the real differences become explicit — and most
of them live in billing articles, not clinical criteria.

### Content

**Chapter intro:**
"Hypoglossal nerve stimulation (HGNS) is the best OSA test case for
contractor comparison. On the surface, the LCDs share an identical clinical
core — all eight check the same boxes. Once structured, the real differences
become explicit in wording, provider rules, lifecycle status, and billing
articles."

**Three explanatory cards:**
1. What HGNS is (brief clinical recap)
2. What JE, JF, JJ mean (jurisdiction labels, not states)
3. Why an LCD and billing article can part ways

**Verdict callout:**
"Clinical criteria: aligned across all MACs. Real differences: billing code
ranges, coding guidance, documentation requirements, and LCD structure."

**Clinical-core presence grid:**
Generated from `crossMacComparison.criteriaMatrix` — 8 criteria × 8
contractors. All checkmarks.

Annotation: "A checkmark means the criterion appears somewhere in that LCD.
It does not mean the exact wording or measurement window is identical."

**The three sharpest clinical wording differences:**
Generated from `ruleMetamodel.contractorVariance.rows` (filtered to
`dimensionId !== "billing"`), led by narrative rather than raw table:

1. **CPAP intolerance wording** — Palmetto uses "<4 hours/night for 70% of
   nights in 1 month." Every other MAC uses "<4 hours/night, 5 nights/week."
   This is a materially different measurement window despite the shared
   4-hour threshold. (Source: `lcd-hgns-palmetto` vs. all others)

2. **Shared decision-making** — WPS requires documentation by both the
   referring and implanting physician. Every other MAC defines SDM as a
   patient-provider conversation. (Source: `lcd-hgns-wps` vs. all others)

3. **Board credentialing** — Noridian, NGS, and First Coast accept
   "board-eligible" otolaryngologists. WPS, CGS, Palmetto, and Novitas
   require "board-certified." (Source: contractor variance table)

**The billing-layer divergence:**
The single sharpest example: Noridian's billing article accepts BMI codes
through Z68.39 (BMI 39.9) even though the Noridian LCD text still says
BMI < 35. Other MACs stop at Z68.34 (BMI 34.9), aligned with the clinical
text. This is a local LCD-vs-article mismatch, not a national-vs-local one.

Generated from `crossMacComparison.realDifferences` (the entry with id
`billing-bmi-code-range`) and `ruleMetamodel.contractorVariance.rows` (the
`secondary-bmi-code-ceiling` row).

Compact comparison:

| Contractor | LCD clinical text | Billing article BMI codes |
|------------|-------------------|---------------------------|
| Noridian | BMI < 35 | Z68.1–Z68.39 (up to 39.9) |
| Palmetto | BMI < 35 | Z68.1–Z68.34 (up to 34.9) |
| First Coast | BMI < 35 | Z68.1–Z68.34 (up to 34.9) |
| Novitas | BMI < 35 | Z68.1–Z68.34 (up to 34.9) |

Annotation: "This is the clearest example in the prototype where
claim-execution logic is broader than the local clinical text. It is
exactly the kind of discrepancy that becomes visible once the billing
layer is modeled alongside the clinical layer."

**Summary stats:**
- X clinical-rule differences
- Y billing/coding differences
- Z lifecycle/governance differences

(Generated from counts of `crossMacComparison.realDifferences` grouped by
`kind`.)

### Why this section exists
This is the showpiece. The all-checkmarks grid followed by "but here's
where the wording actually differs" is a powerful rhetorical structure.
Leading with 3 specific, well-told differences rather than a 16-row ledger
makes the point faster. The BMI code drift is the single best illustration
of why the article layer matters.

### Visualizations
1. Clinical-core presence grid (generated from `crossMacComparison.criteriaMatrix`)
2. Three narrative difference callouts with source citations
3. BMI code comparison table (generated from `ruleMetamodel.contractorVariance`
   + `crossMacComparison.realDifferences`)
4. Summary stats by difference category

---

## Section 10: Codes and claim execution

### Message
The coding layer is where clinical policy becomes operational. Code tables
are the most structured part of the source data, but the mapping from
clinical rules to claim logic is where discrepancies arise.

### Content

**Brief orientation (3 sentences):**
"ICD-10 is the diagnosis coding system. CPT and HCPCS are procedure and
device coding systems. A modifier is a short suffix that changes how a code
is interpreted on the claim."

**HGNS procedure trio:**
Generated from `codeCatalog.families[hgns].groups[0]`:

| Code | System | Description |
|------|--------|-------------|
| 64582 | CPT | Open implantation of HGNS array, pulse generator, and sensor |
| 64583 | CPT | Revision or replacement |
| 64584 | CPT | Removal |

**HGNS diagnosis pattern:**
Generated from `codeCatalog.families[hgns].groups[1]`:
- Primary: G47.33 (obstructive sleep apnea)
- Secondary: Z68.1–Z68.34 (common BMI range) or Z68.35–Z68.39 (Noridian extension)

**Code atlas for selected treatment path:**
If the reader has selected a different path (PAP, oral appliance, surgery),
show the core equipment codes only — not the full accessory stack. Generated
from `codeCatalog.families[selectedFamilyId].groups`.

For PAP: E0601 (CPAP), E0470 (bi-level, conditional), E0471 (not covered).
For oral appliance: E0486 (custom, covered), E0485 (prefab, denied).
For surgery: top 5 covered CPT codes + the 4 explicitly non-covered procedures.

### Why this section exists
Health IT builders need to see the code-level output. But the full PAP
accessory stack (18 supply codes) and exhaustive HGNS ICD-10 tables belong
in the data browser, not inline. This section keeps only what illustrates
the structure: the procedure trio, the diagnosis pattern, and the key
coverage/non-coverage split.

### Visualizations
1. Procedure code table (generated from `codeCatalog`)
2. Diagnosis pattern with coverage pills (generated from `codeCatalog`)
3. Compact code atlas for selected path (generated from `codeCatalog`)

---

## Section 11: Policy timeline and closing

### Message
The layered structure accumulated over decades. Understanding the timeline
explains why the stack looks the way it does. And structuring this data is
not just an academic exercise — it fills a gap in the current infrastructure.

### Content

**Compact timeline:**
Generated from `policyTimeline`, showing major events only (filter to
`significance === "major"` or show all but compact):
- 1987: Initial CPAP NCD
- 2008: Home sleep testing expansion
- 2009: Sleep testing NCD
- 2020: Coordinated HGNS LCD rollout across 7+ MACs
- 2025–2026: Ongoing revisions

Annotation: "The 2020 cluster is visible in the data. All HGNS MACs held
Contractor Advisory Committee meetings in June 2019 and published LCDs
within a 4-month window. That coordination explains why the clinical core
is aligned even though the LCDs are technically independent."

**Four insight cards:**
Generated from `insights`, tightened:
1. OSA coverage is layered, not document-centric
2. The same evidence variables recur across therapies
3. HGNS is mostly a stable core plus a few meaningful local deltas
4. Articles are where claim logic becomes computable

**Closing statement:**
"This tutorial is hand-curated, but the source material is public and the
structure is recoverable. Good extraction can already recover thresholds,
exclusions, provider roles, code tables, document topology, and
cross-document differences. The same approach applies to any disease area
in the Medicare Coverage Database. The 344 NCDs, 961 LCDs, and 2,157
Articles are waiting."

### Why this section exists
The timeline provides historical context without requiring a dedicated
deep-dive section. The closing connects back to the institutional framing
from Section 3: this is a real gap, and the tutorial demonstrates the target
shape.

### Visualizations
1. Timeline cards (generated from `policyTimeline`)
2. Insight cards (generated from `insights`)

---

## Section 12: The structured model (data browser)

### Message
Everything you have seen is driven by one JSON data model. Here is the
machine-readable layer, plus the full source ledger for traceability.

### Content

**JSON browser with tabs:**
- Root model (meta, source counts, policy families)
- Selected path (treatment model + layering model)
- Document packs (rule statements for the selected path's documents)
- Cross-MAC variance (criteria matrix + contractor variance)

**Source ledger table:**
Generated from `sourceDocuments` — all 27 documents with display ID, family,
scope, contractor, effective date, and review use. Links to CMS URLs.

### Why this section exists
Proof, not pedagogy. The JSON browser shows that the visualizations are not
hand-drawn — they are generated from structure. The source ledger provides
full traceability. This section is last because it serves the reader who
wants to verify, not the reader who wants to learn.

### Visualizations
1. Tabbed JSON preview panels (generated from the full data model)
2. Source document ledger table (generated from `sourceDocuments`)

---

## What is NOT in the tutorial (and why)

These sections exist in the codebase but are intentionally excluded from the
main flow to keep the tutorial focused:

| Excluded section | Reason |
|------------------|--------|
| Evidence variables grid | The lineage matrix (Section 8) does this job better — it shows variable reuse across paths without a separate metamodel section |
| Evidence axes matrix | Superseded by the eligibility comparison table (Section 7) which is more specific |
| HGNS deep dive (MAC profiles, coding bundle) | The MAC variation section (Section 9) already covers HGNS. The separate deep dive is redundant |
| Full 16-difference ledger | Available in the JSON browser. The tutorial leads with 3 key differences + BMI drift |
| Layering cards for all families | Absorbed into the selected-path detail (Section 8) |
| Individual document rule packs | Available in the JSON browser. Too granular for the tutorial flow |
| PAP accessory codes (18 supply HCPCS) | In the data browser. The tutorial shows only the 3 core equipment codes |
| Requirement dictionary (full catalog of 43 entries) | The lineage matrix and relation vocabulary convey the key concepts. The full dictionary is reference material |
| Per-MAC code tables (exhaustive ICD-10 rows) | The BMI drift example in Section 9 tells the story. Full tables are in the data browser |

---

## Scroll budget estimate

| Section | Approximate screens |
|---------|---------------------|
| 1. Hero + scope | 0.75 |
| 2. Disease + treatments | 1.25 |
| 3. CMS vocabulary | 1.25 |
| 4. Source examples + before/after | 1.5 |
| 5. National baseline | 1.0 |
| 6. Relation vocabulary + worked example | 1.0 |
| 7. Eligibility landscape | 1.5 |
| 8. Selected path + lineage matrix | 1.5 |
| 9. MAC variation (selective) | 1.5 |
| 10. Codes and claims | 0.75 |
| 11. Timeline + closing | 0.75 |
| 12. Data browser | 0.5 |
| **Total** | **~13 screens** |

This is comparable to or slightly shorter than the current tutorial, but the
first 6 screens now include clinical context, institutional framing, the
relation vocabulary, and a before/after extraction example — none of which
are in the current rendering.
