# DataIngestionV4 Adaptive UI Plan

**Project:** Apex Data Ingestion Platform  
**Document:** Adaptive UI Architecture & Design Plan  
**Created:** December 2025  
**Status:** Planning Phase → Framework Extraction Build

---

## Executive Vision

Building a **truly adaptive financial data ingestion system** that represents where UI will be in 50 years — but implemented with today's technology. The core philosophy inverts the traditional paradigm: instead of users adapting to software, the software adapts to the user, context, and intent.

**Strategic Direction:** This project serves dual purpose:
1. Deliver DataIngestionV4 as a production-ready adaptive UI
2. Extract patterns into a reusable framework: **Phased — Intent-first interfaces**

---

## Framework Identity

**Name:** Phased  
**Tagline:** Intent-first interfaces  
**Full statement:** "Phased: Intent-first interfaces"

**Why "Phased":**
- Scientific grounding — phase transitions in physics (solid → liquid → gas)
- Describes the core mechanic — components exist in different phases of visibility
- Brandable — single word, works as noun and adjective
- Natural terminology — components "phase in" (surface) and "phase out" (dissolve)

**Component Phases:**
```
DORMANT → WARMING → SURFACED → FOCUSED → DISSOLVING → DORMANT
```

**Usage:**
- "Built with Phased"
- "A Phased application"
- "Phased components"
- "The Phased framework"

---

## Part 1: The 50-Year Trajectory

### Core Shift

**Today:** User clicks "Upload" → selects file → configures options → clicks "Process" → reviews results

**Future:** User expresses intent → system already knows the files (streaming continuously), knows preferences, knows compliance requirements → UI only surfaces when there's genuine ambiguity or a decision requiring human judgment.

The interface becomes **exception-based** rather than workflow-based.

---

### Key Principles

#### 1. Intent-First, Not Action-First

The system infers what you want to accomplish rather than requiring explicit step-by-step commands. Natural language and context drive the interaction.

#### 2. Contextual Morphing

The same system presents radically different interfaces based on:

| Factor | Adaptation |
|--------|------------|
| **Who** | Fund accountant sees validation details; portfolio manager sees summary insights; compliance officer sees risk flags |
| **When** | End-of-quarter crunch = minimal, fast, decisive UI. Training mode = explanatory, educational |
| **How** | Voice while walking, spatial/AR at desk, neural shortcuts for power users |
| **Confidence** | High-confidence results = background notifications; low-confidence = demands attention |

#### 3. Conversational + Spatial Hybrid

The "dashboard" becomes a **dialogue**. Tables and charts materialize on demand, in context, then dissolve. You're not navigating screens — you're having a conversation with a system that can summon any visualization instantly.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   "Three holdings files came in overnight. I processed them    │
│    with 99.2% confidence. Two fields on row 847 need your      │
│    judgment — the security type is ambiguous."                  │
│                                                                 │
│         [Show me]    [Trust your judgment]    [Explain more]   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 4. Predictive & Proactive

The system notices patterns and anticipates needs:
- "You always exclude dividend transactions for this client — should I make that default?"
- "This file structure changed from last quarter. Here's what's different."
- "Based on the holdings, you'll probably need the P&S report too — I've already requested it."

#### 5. Trust Through Transparency

Financial systems demand explainability:

```
Confidence: 94.2%
├── Field mapping certainty: 98%
├── Data quality score: 91%  
├── Consistency with historical: 96%
└── Regulatory alignment: 92%

[Expand reasoning chain] [Challenge this] [Accept]
```

#### 6. Continuous, Not Batch

Data streams continuously from custodians, prime brokers, market feeds. The system maintains a living, validated data state. UI becomes about **monitoring, querying, and exception handling** rather than triggering batch jobs.

---

### Mapping Future to Present

| Future Principle | Today's Implementation |
|------------------|------------------------|
| Intent-first | Smart defaults, minimal required config |
| Exception-based | Results UI emphasizes anomalies, not raw data |
| Contextual | Role-based views, collapsible detail levels |
| Conversational | Human-in-the-Loop chat feature |
| Predictive | Report recommendations panel |
| Transparent | Confidence scores, mapping strategy badges |

---

## Part 2: Forensic Mode — The "Explode View"

### Purpose

The adaptive UI optimizes for flow — but financial systems have non-negotiable audit requirements. The solution: a **parallel forensic dimension** that's always accessible.

### Concept

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ADAPTIVE MODE (Default)                    [🔬 Forensic Mode]         │
│                                                                         │
│  "Processed 3 files for ABC Corp. All clear."                          │
│                                                                         │
│  [View Summary]                                                         │
└─────────────────────────────────────────────────────────────────────────┘

        ↓ Toggle Forensic Mode ↓

┌─────────────────────────────────────────────────────────────────────────┐
│  FORENSIC MODE                              [✨ Adaptive Mode]         │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ TIMELINE: Every decision, every millisecond                     │   │
│  │ ──●────●────●────●────●────●────●────●────●────●──────────────▶ │   │
│  │   │    │    │    │    │    │    │    │    │    │                │   │
│  │  File  Sheet Column  AI   Map   Val  Enrich... Export           │   │
│  │  Parse Match Profile Query Decision                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                    │
│  │ RAW INPUTS   │ │ DECISIONS    │ │ OUTPUTS      │                    │
│  │ Source bytes │ │ AI reasoning │ │ Final state  │                    │
│  │ Headers      │ │ Confidence   │ │ Audit hash   │                    │
│  │ Checksums    │ │ Alternatives │ │ Lineage      │                    │
│  └──────────────┘ └──────────────┘ └──────────────┘                    │
│                                                                         │
│  [Export Full Audit Package]  [Replay Processing]  [Compare Runs]      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Forensic Capabilities

| Need | Solution |
|------|----------|
| "What exactly happened?" | Complete timeline with every micro-decision |
| "Why this mapping?" | AI reasoning chain, confidence breakdown, alternatives considered |
| "Prove compliance" | Immutable audit log, cryptographic hashes, timestamps |
| "Debug anomaly" | Replay processing with breakpoints, diff against previous runs |
| "Train new user" | Step-through mode showing full UI at each stage |

**Key insight:** Forensic mode isn't a separate system — it's the **full-fidelity version** that the adaptive mode intelligently compresses.

---

## Part 3: Dissolved Component Architecture

### Philosophy

Build all components the user could possibly need, render them attached to the right datastores/tooling, and dissolve them as needed once user input is gathered.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         COMPONENT SUBSTRATE                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                 │   │
│  │   ○ FileUpload     ○ SheetMatcher    ○ ColumnProfiler          │   │
│  │   ○ FieldMapper    ○ ValidationGrid  ○ MetricsCards            │   │
│  │   ○ FilterPanel    ○ ExportActions   ○ ConfigModal             │   │
│  │   ○ ChatSidebar    ○ TimelineView    ○ AuditLog                │   │
│  │   ○ ConfidenceViz  ○ ReasoningTree   ○ DiffViewer              │   │
│  │                                                                 │   │
│  │   All components pre-instantiated, connected to reactive        │   │
│  │   data stores, running in background — but INVISIBLE            │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│                              ▼                                          │
│                    ADAPTIVE RENDER LAYER                                │
│                              ▼                                          │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  VISIBLE UI: Only what's relevant NOW                           │   │
│  │                                                                 │   │
│  │  Components materialize based on:                               │   │
│  │  • User intent (detected or explicit)                           │   │
│  │  • System confidence (low = surface component)                  │   │
│  │  • Context (role, time pressure, device)                        │   │
│  │  • Anomalies (errors/warnings surface related tools)            │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Why Pre-Build Everything?

1. **Zero latency on summon** — Components are already hot, data-bound, and ready
2. **Background intelligence** — Components can be "thinking" even when invisible
3. **Predictive surfacing** — System promotes components based on patterns
4. **State persistence** — Dissolved doesn't mean destroyed; state survives transitions
5. **Forensic instant-access** — Every component is always queryable

### Component Lifecycle

```
DORMANT → WARMING → MATERIALIZED → FOCUSED → DISSOLVING → DORMANT
   │         │           │            │           │           │
   ▼         ▼           ▼            ▼           ▼           ▼
Hidden,   Loading     Visible,     Primary    Fading,     Hidden,
but       data,       available    user       but still   state
subscribed preparing  for          attention  interactive preserved
to events render      interaction
```

### Implementation Interface

```typescript
interface AdaptiveComponent {
  id: string;
  component: React.FC;
  
  // Data binding
  dataSubscriptions: DataSource[];
  
  // Visibility rules
  surfaceWhen: Condition[];      // When to materialize
  dissolveWhen: Condition[];     // When to fade
  forceShowWhen: Condition[];    // Override (forensic, errors)
  
  // Render state
  visibility: 'dormant' | 'warming' | 'materialized' | 'focused' | 'dissolving';
  opacity: number;               // For smooth transitions
  
  // Intelligence
  precompute: () => void;        // Background work
  relevanceScore: number;        // Dynamic priority
}

class AdaptiveOrchestrator {
  components: Map<string, AdaptiveComponent>;
  
  evaluate(context: UserContext, systemState: SystemState) {
    // Score each component's relevance
    // Materialize high-relevance
    // Dissolve low-relevance
    // Always allow forensic override
  }
}
```

---

## Part 4: Morphing Status Indicator

### Purpose

A **living presence** that communicates system state through form, motion, and color. Always visible but unobtrusive. Not a progress bar — a shape that morphs.

### Visual States

```
IDLE                    THINKING                PROCESSING              COMPLETE
                                                                        
    ◯                    ◎~~~                   ⟨◈⟩                      ◆
                          
Calm, subtle           Rippling,               Geometric,              Solid,
breathing pulse        considering             active transformation   confident
                                                                        
"Ready"                "Analyzing..."          "Mapping 47%"           "Done"
```

### State Definitions

| State | Form | Motion | Color | Accompaniment |
|-------|------|--------|-------|---------------|
| Idle/Ready | Soft circle | Gentle pulse | Ambient blue | "Ready" or silent |
| Listening | Opening form | Responsive ripples | Warmer blue | "Listening..." |
| Thinking | Fluid organic | Slow morphing | Purple shift | "Analyzing structure..." |
| Processing | Geometric facets | Rotation + pulse | Active cyan | "Mapping fields — 47%" |
| Waiting on User | Open/incomplete | Gentle beckon | Amber warmth | "Need your input" |
| Success | Crystallized solid | Settle + glow | Green | "Complete ✓" |
| Warning | Angular edges | Subtle vibration | Amber | "3 items need attention" |
| Error | Fractured form | Unstable | Red | "Issue detected" |

### Key Insight

The indicator is both **ambient** (you can ignore it) and **informative** (glance and know state). The percentage/step text appears near it, but the *form itself* communicates before you read.

---

## Part 5: Dissolvable Futuristic Dropzone

### Philosophy

The dropzone follows the adaptive philosophy — **prominent when needed, dissolved when not**.

### Lifecycle Stages

#### Stage 1: Invitation (No files yet)

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐

│      ○  ○  ○                                  │
          ◡                                      
│                                               │
      Drop files or click to select              
│                                               │

└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘

Dashed border pulses gently. Particles drift upward.
Expands on hover/drag-over.
```

#### Stage 2: Active Drop (Dragging over)

```
╔═══════════════════════════════════════════════╗
║                                               ║
║            ↓  ↓  ↓                            ║
║              ◉                                ║
║         Release to upload                     ║
║                                               ║
╚═══════════════════════════════════════════════╝

Solid border. Magnetic pull animation. Glowing ready state.
```

#### Stage 3: Absorption (File dropped)

```
                Holdings_Q4.xlsx
                     ↓
                  ╭─────╮
                  │ ◈◈◈ │  ← File being "absorbed"
                  ╰─────╯
                     ↓
                  ░░░░░

File visually enters the system. Particles scatter then coalesce.
```

#### Stage 4: Dissolved (Files loaded, ready)

```
┌──────────────────────────────────────────────────────────────┐
│  📄 Holdings_Q4.xlsx  ·  📄 Transactions_Q4.xlsx    [+ Add]  │
└──────────────────────────────────────────────────────────────┘

Minimal file chips. Dropzone dissolved but [+ Add] can resurrect it.
Chips glow subtly indicating "ready for processing"
```

#### Stage 5: Fully Dissolved (Processing complete)

```
Files: ABC Corp Q4 (2 files)                              [◊]

Just text reference. Diamond icon expands to show file details
or add more. Maximum dissolution.
```

### Resurrection Gestures

When dissolved, the dropzone can be summoned back via:
- **Click [+ Add]** — Explicit action
- **Drag files anywhere** — System detects drag event, dropzone materializes
- **Voice/type** — "Add more files" causes dropzone to surface
- **Keyboard shortcut** — Power user quick access

---

## Part 6: Entity & Report Selection Patterns

### The Problem

Files belong to pre-configured clients. Free text is risky for financial systems — typos create data integrity nightmares. But traditional dropdowns feel dated and don't fit our adaptive philosophy.

### Solution: Surfacing Selector (Hybrid Pattern)

Uses the same dissolve/surface lifecycle as other components. Grounded in real physics/engineering metaphors — no magic terminology.

**Terminology Note:** We deliberately avoid "magical" terms like "conjure" or "summon." Our metaphors are grounded in science: **surface** (like data surfacing, submarines rising), **phase** (state transitions in physics), **resolve** (optical clarity), **emerge** (complexity theory).

---

### Client/Entity Selector Lifecycle

#### Stage 1: Dissolved (Nothing selected)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│     Client: _____________________________ [◊]                          │
│              Start typing or click to browse                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

Minimal footprint. Placeholder text guides action.
[◊] icon indicates expandable/surfaceable content.
```

#### Stage 2: Surfaced (User focused / typing)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│     Client: [ ABC ________________________]                             │
│             ┌─────────────────────────────────────────────┐             │
│             │  ★ ABC Corporation          ← Recent        │             │
│             │    ABC Holdings Ltd                         │             │
│             │    ABC Partners LP                          │             │
│             │ ─────────────────────────────────────────── │             │
│             │  + Add "ABC" as new client                  │             │
│             └─────────────────────────────────────────────┘             │
│                                                                         │
│  Searches as you type. Recent/frequent clients starred.                 │
│  Option to add new if no match (triggers setup flow).                   │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Stage 3: Dissolved (Selected)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│     Client: ABC Corporation                                [✓] [◊]     │
│             ↳ Finance sector · 47 previous reports                      │
│                                                                         │
│  Minimal footprint. Shows contextual metadata.                          │
│  [◊] expands to change selection.                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Features

| Feature | Why |
|---------|-----|
| Type-to-search | Fast for power users who know client names |
| Recent/frequent prioritized | 80% of use is probably 20% of clients |
| Rich preview on hover | See client metadata before selecting |
| Add new option | Escape hatch, but clearly secondary |
| Dissolved when selected | Doesn't waste space once decided |
| Contextual hint | "47 previous reports" builds confidence |

---

### Report Type Multi-Selector

Similar pattern, optimized for multi-select with intelligent suggestions.

#### Dissolved State (Reports selected)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│     Reports: [Holdings] [P&S] [NAV]                        [+ ◊]       │
│              ↳ Complete set for standard reconciliation                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

Chips show selected reports. System confirms completeness.
```

#### Surfaced State (Adding/browsing)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│     Reports: [Holdings ×] [P&S ×] [NAV ×]  [+ Add more...]             │
│              ┌─────────────────────────────────────────────┐            │
│              │  SUGGESTED FOR YOU                          │            │
│              │  ☐ Cash Reconciliation    ← Often paired    │            │
│              │  ☐ Corporate Actions                        │            │
│              │ ─────────────────────────────────────────── │            │
│              │  ALL REPORT TYPES                           │            │
│              │  ☐ Dividend Schedule                        │            │
│              │  ☐ Tax Lot Report                           │            │
│              │  ...                                        │            │
│              └─────────────────────────────────────────────┘            │
│                                                                         │
│  AI suggests complementary reports based on patterns.                   │
│  Warns if typical companion reports missing.                            │
└─────────────────────────────────────────────────────────────────────────┘
```

### Smart Behaviors

- System suggests report combinations based on historical patterns
- Warns if typical companion reports are missing ("Holdings usually paired with P&S")
- "Auto-detect" option lets AI determine report types from file contents
- Shows which CDM fields each report type enables

---

## Part 7: Combined Interface Concept

### During Processing

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   APEX                                              ◎~~  Analyzing...  │
│   ───────                                           Detecting sheets   │
│                                                     Step 2 of 8 · 24%  │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                                                                 │  │
│   │  "I'm analyzing the structure of Holdings_Q4.xlsx. Found 3      │  │
│   │   sheets — matching them to known report types..."              │  │
│   │                                                                 │  │
│   │   ┌─────────────────────────────────────────────────────────┐  │  │
│   │   │  Sheet 1: "Holdings"     → Holdings Report      ████░░  │  │  │
│   │   │  Sheet 2: "Transactions" → Detecting...         ██░░░░  │  │  │
│   │   │  Sheet 3: "Summary"      → Queued               ░░░░░░  │  │  │
│   │   └─────────────────────────────────────────────────────────┘  │  │
│   │                                                                 │  │
│   │   [Pause]  [Show Details]                                      │  │
│   │                                                                 │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│     Files: ABC Corp Q4 (2)  ·  Entity: ABC Corporation         [◊]    │
│                                                                         │
│   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│   ░ ValidationGrid · FieldMapper · ExportActions — ready on demand ░  │
│   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                                                         │
│                                                        [🔬 Forensic]   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Adaptive Mode — Awaiting Decision

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   APEX INTELLIGENT DATA PLATFORM                    [🔬] [⚙️] [?]      │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                                                                 │  │
│   │  "I noticed 3 new files from Northern Trust. ABC Corp's Q4     │  │
│   │   holdings look complete — 99.4% confidence. Ready to process, │  │
│   │   or would you like to review first?"                          │  │
│   │                                                                 │  │
│   │   [Process Now]  [Review Files]  [Configure]  [Ask Something]  │  │
│   │                                                                 │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ┌─ SURFACED BECAUSE: Low confidence on 2 mappings ───────────────┐  │
│   │                                                                 │  │
│   │  ⚠️ "Security_Desc" → CDM field uncertain                       │  │
│   │     Best guess: SecurityDescription (72%)                       │  │
│   │     Alternative: SecurityName (68%)                             │  │
│   │                                                                 │  │
│   │     [Accept Best Guess]  [It's SecurityName]  [Show Me]        │  │
│   │                                                                 │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│   ░  15 other components dissolved — available on demand or        ░  │
│   ░  will surface if relevant                                      ░  │
│   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 8: Framework Architecture — Phased

### What We've Actually Designed

Step back and look at what this is — not just a UI for data ingestion, but a **paradigm for building intent-first interfaces**:

| Concept | What It Really Is |
|---------|-------------------|
| Dissolved Components | Declarative component visibility orchestration |
| Adaptive Surfacing | Intent-based UI rendering engine |
| Forensic Mode | Built-in observability/audit layer |
| Morphing Indicator | Universal system state communication |
| Conversational Core | Natural language UI control plane |

---

### Framework Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PHASED FRAMEWORK                              │
│                      Intent-first interfaces                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 1: COMPONENT SUBSTRATE                                   │   │
│  │  • Pre-registered components with metadata                      │   │
│  │  • Declarative visibility rules (surface/dissolve conditions)   │   │
│  │  • Data binding definitions                                     │   │
│  │  • Lifecycle hooks (warming, materialized, dissolving)          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 2: ADAPTIVE ORCHESTRATOR                                 │   │
│  │  • Context engine (who, when, how, confidence)                  │   │
│  │  • Intent detection (NLP, gesture, pattern)                     │   │
│  │  • Relevance scoring algorithm                                  │   │
│  │  • Transition choreographer (animations, timing)                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 3: RENDER SURFACE                                        │   │
│  │  • Platform adapters (Web, iOS, Android, Desktop, AR/VR)        │   │
│  │  • Input handlers (touch, voice, keyboard, gesture, gaze)       │   │
│  │  • Responsive component variants                                │   │
│  │  • Accessibility transformers                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 4: INTELLIGENCE & INTEGRATION                            │   │
│  │  • AI Control Plane (for AI-to-AI interaction)                  │   │
│  │  • MCP Server (expose components as tools)                      │   │
│  │  • Forensic/Audit API                                           │   │
│  │  • Event streaming (for external systems)                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Core Framework Interfaces

```typescript
// Component Definition
interface AdaptiveComponent {
  id: string;
  component: React.FC | VueComponent | NativeComponent;
  
  // Metadata
  displayName: string;
  category: string;
  description: string;
  
  // Data binding
  dataSubscriptions: DataSource[];
  requiredContext: string[];
  
  // Visibility rules (declarative)
  surfaceWhen: Condition[];      // When to materialize
  dissolveWhen: Condition[];     // When to fade
  forceShowWhen: Condition[];    // Override (forensic, errors, user request)
  
  // Render state
  phase: 'dormant' | 'warming' | 'surfaced' | 'focused' | 'dissolving';
  opacity: number;
  priority: number;
  
  // Intelligence
  precompute?: () => void;       // Background work while dissolved
  relevanceScore: number;        // Dynamic priority calculation
  
  // Platform variants
  variants: {
    desktop?: ComponentVariant;
    mobile?: ComponentVariant;
    voice?: ComponentVariant;
    ar?: ComponentVariant;
  };
}

// Condition DSL
interface Condition {
  type: 'context' | 'data' | 'intent' | 'time' | 'confidence' | 'user';
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'exists' | 'changed';
  field: string;
  value: any;
  weight?: number;  // For relevance scoring
}

// Orchestrator
interface AdaptiveOrchestrator {
  components: Map<string, AdaptiveComponent>;
  context: UserContext;
  state: SystemState;
  
  // Core methods
  evaluate(): void;                                    // Recalculate all visibilities
  surface(componentId: string, reason?: string): void; // Force surface
  dissolve(componentId: string): void;                 // Force dissolve
  setContext(context: Partial<UserContext>): void;     // Update context
  
  // AI integration
  handleIntent(intent: ParsedIntent): void;            // NLP result
  exposeTools(): MCPToolDefinition[];                  // For AI-to-AI
}

// User Context
interface UserContext {
  userId: string;
  role: 'analyst' | 'manager' | 'compliance' | 'admin';
  urgency: 'low' | 'normal' | 'high' | 'critical';
  device: 'desktop' | 'tablet' | 'mobile' | 'voice' | 'ar';
  preferences: UserPreferences;
  sessionHistory: InteractionEvent[];
}
```

---

### Cross-Platform Rendering

The framework abstracts the render surface — write once, adapt everywhere:

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  WEB            │  │  MOBILE         │  │  AR/SPATIAL     │
│  ─────────────  │  │  ─────────────  │  │  ─────────────  │
│  React/Vue/etc  │  │  React Native   │  │  Unity/Vision   │
│  Full component │  │  Compact cards  │  │  Floating panels│
│  Mouse/keyboard │  │  Touch/swipe    │  │  Gaze/gesture   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                   │                    │
         └───────────────────┼────────────────────┘
                             ▼
              ┌─────────────────────────┐
              │  PHASED CORE            │
              │  (Platform agnostic)    │
              │  Same component defs    │
              │  Same orchestration     │
              │  Same state             │
              └─────────────────────────┘
```

**Developer writes:**
- Component logic once
- Visibility rules once  
- Data bindings once

**Framework handles:**
- Platform-specific rendering
- Input modality adaptation
- Responsive transformations
- Accessibility requirements

---

## Part 9: AI-to-AI Integration

### The Killer Feature

AI agents can interact with Adaptive UI applications programmatically. The framework exposes components as tools via MCP (Model Context Protocol) or similar standards.

### MCP Tool Exposure

```typescript
// Auto-generated from component registrations
{
  "name": "phased",
  "description": "Control and interact with a Phased application",
  "tools": [
    {
      "name": "list_components",
      "description": "List all components in the substrate with current phase and relevance",
      "parameters": {}
    },
    {
      "name": "get_component_state", 
      "description": "Read current state/data from a specific component",
      "parameters": {
        "component_id": { "type": "string", "required": true }
      }
    },
    {
      "name": "surface_component",
      "description": "Materialize a component for the user with optional context",
      "parameters": {
        "component_id": { "type": "string", "required": true },
        "reason": { "type": "string" },
        "focus": { "type": "boolean", "default": false }
      }
    },
    {
      "name": "invoke_action",
      "description": "Trigger an action within a component",
      "parameters": {
        "component_id": { "type": "string", "required": true },
        "action": { "type": "string", "required": true },
        "params": { "type": "object" }
      }
    },
    {
      "name": "set_context",
      "description": "Update user context to affect adaptive behavior",
      "parameters": {
        "role": { "type": "string", "enum": ["analyst", "manager", "compliance", "admin"] },
        "urgency": { "type": "string", "enum": ["low", "normal", "high", "critical"] }
      }
    },
    {
      "name": "enter_forensic_mode",
      "description": "Switch to full-fidelity forensic view for audit/debug",
      "parameters": {}
    },
    {
      "name": "get_audit_log",
      "description": "Retrieve the forensic audit log for compliance",
      "parameters": {
        "from": { "type": "datetime" },
        "to": { "type": "datetime" }
      }
    }
  ]
}
```

### Use Cases

| Scenario | How It Works |
|----------|--------------|
| AI Assistant | Surfaces the right component at the right time based on conversation |
| Backend-to-Frontend | Processing AI decides frontend should show validation errors |
| Automated Workflows | UI manifests only for human checkpoints in otherwise automated process |
| Testing/QA Bots | Automated testing navigates adaptive interfaces programmatically |
| Multi-Agent Orchestration | Specialized AI agents collaborate through shared UI state |
| Accessibility | Voice AI can navigate and interact with any component |

### Event Streaming

External systems can subscribe to UI events:

```typescript
interface PhasedEvent {
  timestamp: string;
  eventType: 'component_phased_in' | 'component_phased_out' | 'action_invoked' | 
             'context_changed' | 'user_interaction' | 'ai_decision';
  componentId?: string;
  userId: string;
  details: Record<string, any>;
  auditHash: string;  // For compliance
}

// Subscribe to events
phased.events.subscribe('*', (event: PhasedEvent) => {
  // Stream to analytics, audit log, external systems
});
```

---

## Part 10: Monetization Strategy

### Business Models

| Model | Description | Target |
|-------|-------------|--------|
| **Open Core** | Free framework, paid enterprise features | Developers, startups |
| **Cloud Hosted** | Managed orchestration, analytics, AI services | Mid-market |
| **Enterprise License** | On-prem, SLA, custom integrations, support | Large enterprises |
| **Component Marketplace** | Pre-built adaptive components (financial, healthcare, etc.) | Vertical markets |
| **AI API Credits** | AI-powered intent detection, auto-surfacing, smart suggestions | All tiers |

### Feature Tiers

```
┌─────────────────────────────────────────────────────────────────────────┐
│  COMMUNITY (Free/OSS)                                                   │
│  • Core framework                                                       │
│  • Basic component substrate                                            │
│  • Simple orchestrator                                                  │
│  • Web platform adapter                                                 │
│  • Community support                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  PRO ($X/month)                                                         │
│  • Everything in Community                                              │
│  • AI-powered intent detection                                          │
│  • Advanced analytics dashboard                                         │
│  • Mobile platform adapters                                             │
│  • Priority support                                                     │
│  • Component marketplace access                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  ENTERPRISE (Custom pricing)                                            │
│  • Everything in Pro                                                    │
│  • Forensic/audit module with compliance exports                        │
│  • AI-to-AI integration (MCP server)                                    │
│  • SSO/SAML integration                                                 │
│  • On-premise deployment option                                         │
│  • Custom platform adapters (AR/VR, voice)                              │
│  • SLA with dedicated support                                           │
│  • White-labeling                                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

### Revenue Streams

1. **Subscriptions** — Monthly/annual SaaS fees for Pro/Enterprise
2. **Usage-Based** — AI API calls, event streaming volume
3. **Marketplace** — Revenue share on component sales (30/70 split)
4. **Professional Services** — Custom integrations, training, consulting
5. **Certification** — Developer certification program

### Competitive Positioning

| Competitor Category | Our Differentiation |
|--------------------|---------------------|
| Traditional UI frameworks (React, Vue) | We're not replacing them — we orchestrate on top |
| Low-code platforms (Retool, Appsmith) | We're code-first, developer-focused, more sophisticated |
| Design systems (Material, Ant) | We're about behavior/adaptation, not just styling |
| AI UI tools (v0, Vercel) | We're runtime adaptive, not just generation-time |

**Tagline concepts:**
- ~~"UI that adapts to humans, not humans to UI"~~
- ~~"The last interface framework you'll need"~~
- ~~"Where AI meets adaptive experience"~~

**Final:** "Phased: Intent-first interfaces"

---

## Part 11: Implementation Roadmap

### Phase 1: Prove the Pattern (Current)

**Goal:** Build DataIngestionV4 as the reference implementation

- Build working prototype with framework-extraction mindset
- Validate core concepts: dissolution, surfacing, forensic mode
- Document patterns as they emerge
- Identify what's truly reusable vs. application-specific

**Deliverable:** Production DataIngestionV4 + extracted pattern library

---

### Phase 2: Extract the Core

**Goal:** Separate Phased framework from application

Core modules to extract:
- `@phased/core` — Orchestrator, component registry, context engine
- `@phased/react` — React bindings and hooks
- `@phased/transitions` — Animation/transition library
- `@phased/forensic` — Audit/debug layer

**Deliverable:** NPM packages, documentation site, example apps

---

### Phase 3: Validate Portability

**Goal:** Build second application on Phased framework

Candidate: AEOI Compliance Workflow (leverages existing Apex domain knowledge)

**Success criteria:**
- 80%+ code reuse from Phased framework
- Faster development than DataIngestionV4
- Patterns hold across different use case

**Deliverable:** Second production app + refined Phased framework

---

### Phase 4: Platform Expansion

**Goal:** Multi-platform support

- React Native adapter (mobile)
- Electron adapter (desktop)
- Voice interface adapter
- AR/VR experimental adapter

**Deliverable:** Cross-platform framework

---

### Phase 5: AI Integration & Commercialization

**Goal:** Full AI-to-AI capabilities + go-to-market

- MCP server implementation
- AI intent detection service
- Cloud hosting infrastructure
- Marketplace foundation
- Marketing site, docs, community

**Deliverable:** Commercial product launch

---

## Part 12: Build Plan — DataIngestionV4 Prototype

### Prototype Scope

Build a working React prototype demonstrating all core patterns:

1. **Morphing status indicator** — Animated form that shifts between states with percentage/step text
2. **Dissolvable dropzone** — Full lifecycle: invitation → absorption → dissolved → resurrection
3. **Surfacing selectors** — Client/entity and report type selection with adaptive behavior
4. **Adaptive conversational core** — The primary interaction surface
5. **Dissolved component substrate** — Visual indication of available-but-hidden components
6. **Forensic toggle** — Switch to exploded view with full timeline

### Technical Stack

- React 18+ with hooks
- Tailwind CSS for styling
- CSS animations (framework-extractable, no heavy dependencies)
- TypeScript for type safety
- Simulated data flow for demonstration

### Architecture Mindset

While building, continuously ask:
- "What part of this is DataIngestionV4-specific vs. framework-generic?"
- "How would this component be configured declaratively?"
- "What would the orchestrator API look like for this behavior?"

### Interaction Features

- Drag-and-drop file upload with visual absorption
- Type-to-search entity/report selection
- State transitions (idle → processing → complete → error)
- Toggle between Adaptive and Forensic modes
- Component materialization/dissolution animations
- Responsive behavior hints

---

## Appendix A: Terminology Guide

We use scientific/engineering metaphors, avoiding magical/fantasy terminology:

| Concept | Preferred Terms | Avoid |
|---------|-----------------|-------|
| Component appears | Surface, emerge, materialize, resolve, phase in | Conjure, summon, spawn, magic |
| Component disappears | Dissolve, phase out, recede, fade | Vanish, disappear, banish |
| Hidden state | Dormant, substrate, background | Invisible, hidden realm |
| Showing state | Surfaced, materialized, active, focused | Conjured, summoned |
| Transition | Phase transition, state change | Transformation, morphing (ok for indicator) |

---

## Appendix B: Original Design Brief Reference

The original design brief (`DataIngestionV4-UI-Design-Brief.md`) contains:
- Detailed section-by-section specifications
- Component inventory  
- Color palette and design tokens
- Responsive breakpoints
- Accessibility requirements

This adaptive UI plan builds upon and extends that foundation toward the visionary future state.

---

**Document Version:** 2.1  
**Last Updated:** December 2025  
**Framework Name:** Phased — Intent-first interfaces  
**Status:** Ready for prototype build with framework-extraction mindset  
**Next Steps:** Build interactive React prototype, then extract Phased core
