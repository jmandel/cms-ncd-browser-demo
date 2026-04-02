# Tutorial Outline v2: Radically Shorter

## Principle
Every screen must yield a concrete insight or comparison that the reader
couldn't get without the structured data. If a section is just context-setting
without a payoff visualization, it gets folded into a sentence.

## Treatment focus
**CPAP** (has NCD + LCD → shows national-to-local layering)
**HGNS** (no NCD, 8 LCDs → shows cross-contractor variation)

Other treatments (oral appliance, surgery) are mentioned once in the pathway
diagram and appear as rows in the lineage matrix. They do not get their own
profiles, criteria cards, or code tables.

---

## Section 1: OSA and two treatments (~1 screen)

**Content:**
- One sentence defining OSA
- Severity color bar (AHI scale)
- Four clinical term definitions (AHI, RDI, BMI, PSG) as compact cards
- Pathway diagram: Diagnosis → CPAP → second-line (HGNS, oral appliance, surgery)
- National CPAP requirements table (the one we already have — what the NCD says)
- One sentence: "HGNS (hypoglossal nerve stimulation) is an implanted device
  for patients who fail CPAP. It has no national rule — coverage is set by
  regional contractors."

**No separate CMS glossary section.** Instead, define NCD, LCD, and Article
inline as they first appear (in section 2).

---

## Section 2: How CPAP coverage layers (~1.5 screens)

**Message:** Medicare coverage is a stack. The national NCD sets a floor.
The local LCD operationalizes and narrows it. The billing article translates
it into codes.

**Content:**
- Brief inline definitions: NCD (national rule), LCD (regional contractor
  rule), Article (billing/coding companion). Three sentences, not a stacked
  diagram.
- **CPAP layering table** — the key visualization. One table, three columns:

  | Requirement | NCD 240.4 (national) | LCD L33718 (local) |
  |---|---|---|
  | Patient population | Adult patients with OSA | Same |
  | Valid sleep test | PSG or Type II-IV HST | Same, plus in-person eval required first |
  | AHI ≥ 15 | Qualifies directly | Same |
  | AHI 5-14 | Only with symptoms/comorbidities | Same |
  | Trial period | 12-week initial coverage | Operationalized: 90-day window |
  | Adherence | Not specified | ≥ 4 hrs/night on ≥ 70% of nights |
  | Follow-up | Not specified | Re-evaluation between days 31 and 91 |
  | Device escalation | Not specified | E0601 first; E0470 only after failure |
  | BMI ceiling | None | None |
  | Age | Adult | Adult |

  Color or mark cells where the LCD adds/narrows/operationalizes.

- This single table replaces: the NCD rule cards, the relation vocabulary
  section, the worked example, and the family focus for CPAP. The reader
  sees the layering directly.

**Data source:** Generated from `layeringModels[pap-therapy]` baseline +
overlay criteria, and from `ruleMetamodel.documentProfiles` for ncd-cpap
and lcd-pap-dme.

---

## Section 3: HGNS — LCD-only coverage across contractors (~2 screens)

**Message:** When there is no NCD, regional contractors write their own LCDs.
For HGNS, 8 contractors did this in a coordinated rollout. The clinical core
is aligned, but the wording, provider rules, and billing articles diverge.

**Content:**
- One sentence: HGNS has no national coverage rule. All coverage comes from
  LCDs written by regional Medicare contractors (MACs).
- **HGNS criteria table** — what the LCDs require (generated from the common
  HGNS eligibility in `treatmentModels[hgns].eligibility`):

  | Requirement | HGNS rule |
  |---|---|
  | Age | ≥ 22 |
  | BMI | < 35 |
  | AHI | 15-65 |
  | Central/mixed events | < 25% of total AHI |
  | CPAP failure | Required |
  | Anatomy | DISE: no complete concentric collapse |
  | PSG recency | Within 24 months |

- **Where they diverge** — the 3 wording differences table (from
  `contractorVariance`): CPAP intolerance definition, SDM definition, board
  credentialing. This is already compact and effective.

- **The billing-layer punchline** — the BMI code drift table. Noridian's
  billing article accepts BMI codes through Z68.39 while the LCD says < 35.
  Four-row table. This is the single sharpest example of why structure matters.

- **Lineage matrix** (from `ruleMetamodel.familyLineage`) — 10 requirements
  × 5 treatment paths showing baseline/reuses/narrows/adds/differs with
  colored chips. This replaces all the per-family profile cards, delta
  summaries, and eligibility landscape tables. It IS the comparison.

  Introduce the relation labels (baseline, reuses, narrows, operationalizes,
  adds, differs) as a brief legend above the matrix, not as a standalone
  section. The labels are self-explanatory when you see them in context.

---

## Section 4: What structure enables (~1 screen)

**Message:** Once the data is structured, comparisons that required reading
27 documents side by side become automatic.

**Content:**
- Eligibility comparison table (the AHI range ladder + the 4-treatment
  comparison table from `renderEligibilityLandscape`). This is the payoff —
  all treatments side by side with source attribution.
- Scope stats: 27 documents → 43 requirements → 27 document profiles →
  structured comparison.
- Institutional context (one paragraph): 344 NCDs, 961 LCDs, 2,157 Articles.
  CMS-0057-F mandates electronic prior auth by 2027. No computable LCD
  format exists. This demonstrates the target shape.
- JSON browser (compact, one tab shown by default).

---

## What is cut

| Cut | Reason |
|---|---|
| CMS glossary as standalone section | Terms defined inline where they appear |
| Relation vocabulary as standalone section | Legend shown inline above lineage matrix |
| Worked example (CPAP trial) | The CPAP layering table IS the worked example |
| Delta summary cards | Lineage matrix replaces them |
| Family focus per-path profiles | Cut; eligibility table shows the data |
| Oral appliance / surgery profiles | Mentioned in pathway, visible in lineage matrix only |
| Before/after raw extraction panel | Cut for now; can revisit |
| Code atlas as standalone section | BMI drift example folded into HGNS section |
| Timeline | Mentioned in one sentence in section 3 |
| Source ledger | Available in JSON browser |
| Three key ideas cards | Cut — the tutorial demonstrates them rather than stating them |
| Institutional callout as prominent box | Folded into section 4 as closing paragraph |

## Estimated length
~6 screens total. Each screen yields a table or comparison.

## Implementation status
- [x] renderHero — simplified to single column + stat cards
- [x] renderDiseaseLandscape — severity bar, pathway, national CPAP table
- [x] renderCpapLayering — NEW: NCD vs LCD layering table with relation chips
- [x] renderHgnsVariation — NEW: criteria, wording diffs, BMI drift, lineage matrix
- [x] renderStructuredPayoff — NEW: eligibility landscape, scope stats, JSON browser
- [x] render() rewired to 5 sections only
- [x] Lineage matrix source chips capped at 2 per cell
- [x] Build passes (40KB, down from 89KB)
- [x] Visual QA: page height 10,890px (down from 28,399px)
