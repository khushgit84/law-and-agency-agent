# Vernacular Legal-Rights Agent — Implementation Plan

**Team:** Vexlora | **Theme:** Agents for Bharat – AI for Social Impact
**Reference:** `legal-rights-agent-spec.md` (system prompt, tool schemas, tech stack)

Assumption: solo build, standard hackathon window (~24-36 hrs). Adjust hours if your slot differs.

---

## Phase 0 — Setup (30 min)

- [ ] Create Groq account, generate free API key (console.groq.com)
- [ ] `npm init` backend project, install: `express`, `groq-sdk`, `chromadb`, `dotenv`, `cors`
- [ ] `pip install sentence-transformers chromadb` for the embedding/ingest script
- [ ] Confirm Ollama is running locally with a fallback model (Qwen2.5 7B or Llama3.1 8B) pulled — this is your offline safety net if venue wifi drops

---

## Phase 1 — Knowledge Base (2.5-3 hrs) — DO THIS FIRST

This is the highest-risk part (wrong legal info looks bad in front of judges), so front-load it.

- [ ] Write 15-20 entries each for: `landlord_tenant`, `workplace`, `consumer` (45-60 total)
  - Format: issue keyword, plain-language right, relevant act (only if confident), authority, documents needed
  - Sources: indiacode.nic.in, consumerhelpline.gov.in, labour ministry site, state Rent Control Act summaries
- [ ] Save as structured JSON: `[{category, issue, right, authority, documents}]`
- [ ] Write a one-time Python ingest script: embed each entry with `all-MiniLM-L6-v2`, store in local ChromaDB collection
- [ ] Sanity check: query Chroma with 3-4 test phrases per category, confirm top results are relevant

**Checkpoint:** you should be able to query Chroma and get sensible legal snippets back before moving on.

---

## Phase 2 — Backend: Agent Loop (3-4 hrs)

- [ ] Express route `POST /chat` — accepts `{ message, conversationHistory }`
- [ ] Call Groq with system prompt (from spec doc) + tool schemas + conversation history
- [ ] Handle `retrieve_legal_info` tool call → query ChromaDB → return top 3-5 chunks to the model
- [ ] Handle `draft_document` tool call → second Groq call: template + extracted user details → filled document text
- [ ] Return final structured response: `{ rightsExplanation, authority, documentsNeeded, draftedDocument }`
- [ ] Add the "immediate danger" safety check from the system prompt as an early keyword/intent check before the main loop (don't rely on the LLM alone to catch urgent cases)
- [ ] Fallback logic: if Groq call fails/times out, retry against local Ollama endpoint

**Checkpoint:** test via curl/Postman with 3 sample messages (one per category) before building UI.

---

## Phase 3 — Frontend (3-4 hrs)

- [ ] Simple chat interface (React + Tailwind) — reuse Vexlora's existing component patterns where possible to save time
- [ ] Left/main panel: conversational back-and-forth
- [ ] Right panel (or expandable section): "Your Rights" summary + "Authority to Approach" + drafted document in a copyable/downloadable box
- [ ] Language indicator or toggle if you support Hindi/Hinglish input
- [ ] Loading states for the multi-step tool calls (classify → retrieve → draft can take a few seconds combined)

---

## Phase 4 — Testing & Hardening (1.5-2 hrs)

- [ ] Run 4-5 test scenarios per category (12-15 total), including edge cases (vague input, mixed Hindi-English, off-topic questions)
- [ ] Fix misclassification cases
- [ ] Confirm the "unclear category" clarifying-question path works
- [ ] Confirm the danger/urgent-case safety response triggers correctly
- [ ] Test with wifi disabled to confirm Ollama fallback actually works — don't skip this, it's your demo insurance

---

## Phase 5 — Pitch & Demo (1.5-2 hrs)

- [ ] 3-slide narrative: Problem (people don't know their rights / which authority to approach) → Solution (agentic flow, not just chat) → Demo
- [ ] Pick your single best live demo scenario (recommend: workplace harassment or landlord deposit — relatable, clear win)
- [ ] Have a pre-recorded backup video of the demo in case live fails
- [ ] Prepare answers for likely judge questions: "How do you ensure legal accuracy?" (answer: curated KB + explicit 'consult an advocate' fallback, not raw LLM legal advice), "How does this scale beyond 3 categories?" (answer: KB is modular, just add more categories)

---

## Time Budget Summary

| Phase              | Hours                    |
| ------------------ | ------------------------ |
| Setup              | 0.5                      |
| Knowledge base     | 2.5-3                    |
| Backend agent loop | 3-4                      |
| Frontend           | 3-4                      |
| Testing            | 1.5-2                    |
| Pitch/demo prep    | 1.5-2                    |
| **Total**    | **~12.5-16.5 hrs** |

Leaves buffer if your hackathon window is 24-36 hrs — use the slack for polish, extra test scenarios, or a 4th category if time allows.

---

## Next steps

Ready to move into: (a) knowledge base entries, (b) backend code, or (c) frontend scaffolding — say which and we'll start.
