# Vernacular Legal-Rights Agent — Build Spec
**Team:** Vexlora | **Theme:** Agents for Bharat – AI for Social Impact

---

## 1. Free Tool Stack (zero cost, hackathon-ready)

| Layer | Tool | Why |
|---|---|---|
| LLM (primary) | **Groq API** (free tier) — Llama 3.3 70B or Llama 3.1 8B | Free, insanely fast (great for live demo), supports tool/function calling |
| LLM (backup/offline) | **Ollama** local on your RTX 4060 (Qwen2.5 7B or Llama3.1 8B) | Works with no internet — safety net if venue wifi dies during demo |
| Embeddings | **sentence-transformers `all-MiniLM-L6-v2`** (runs locally, free, no API) | No cost, fast enough for a few hundred docs |
| Vector DB | **ChromaDB** (local, free) | Zero setup cost, persists to disk |
| Backend | Node/Express (you already know this from Vexlora) | Reuse your stack |
| Frontend | React + Tailwind | Reuse your stack |
| Translation (if doing vernacular input) | **Google Translate free tier** or **Groq itself** (LLM can translate directly, skip extra API) | Simplest: let the LLM handle Hindi/Hinglish input directly, no separate translation step needed |
| Hosting (if needed for demo) | **Vercel** (frontend) + **Render free tier** (backend) | Free, fast deploy |

**Get Groq API key (free):** https://console.groq.com — sign up, generate key, no card required.

---

## 2. Agent System Prompt

```
You are Nyaya Sahayak, a legal-rights assistant for Indian citizens who
may not know their legal rights or which authority to approach.

Your job, for every user message, is to:

1. CLASSIFY the issue into exactly one category:
   - landlord_tenant
   - workplace
   - consumer
   - unclear (if it doesn't fit the above three, or you need more info)

2. If category is "unclear", ask ONE short clarifying question and stop.
   Do not guess — ask.

3. If category is known, call the `retrieve_legal_info` tool with the
   category and a short summary of the user's situation.

4. Using the retrieved legal info, call the `draft_document` tool to
   generate the appropriate document:
   - landlord_tenant -> complaint letter to Rent Controller / legal notice to landlord
   - workplace -> complaint to Labour Commissioner / HR grievance letter
   - consumer -> complaint to Consumer Forum (District Consumer Disputes
     Redressal Commission)

5. Respond to the user with THREE things, in plain simple language
   (mirror the language/register the user wrote in — Hindi, Hinglish,
   or English):
   a) A short (3-5 line) explanation of their rights in this situation
   b) The name of the correct authority/forum to approach, with what
      documents they'll typically need to carry
   c) The drafted document text (from draft_document), clearly labeled

Rules:
- Never invent specific law section numbers you are not confident about;
  if unsure, say "consult a local advocate to confirm the exact section"
  rather than stating a wrong section number.
- Keep tone reassuring and non-alarming — many users will be stressed.
- Never ask for or store sensitive identifiers (Aadhaar number, bank
  details) — only ask for name, address, and situation details needed
  to fill the document template.
- If the situation involves immediate physical danger (violence,
  threats), tell the user to contact police (100) or a women's/child
  helpline immediately, before anything else.
```

---

## 3. Tool Schemas (function calling)

```json
[
  {
    "name": "retrieve_legal_info",
    "description": "Retrieve relevant Indian law sections and rights information for a given issue category and situation.",
    "input_schema": {
      "type": "object",
      "properties": {
        "category": {
          "type": "string",
          "enum": ["landlord_tenant", "workplace", "consumer"]
        },
        "situation_summary": {
          "type": "string",
          "description": "One or two sentence summary of the user's specific situation"
        }
      },
      "required": ["category", "situation_summary"]
    }
  },
  {
    "name": "draft_document",
    "description": "Generate a filled legal document template (complaint letter, RTI, or notice) based on category and user details.",
    "input_schema": {
      "type": "object",
      "properties": {
        "category": {
          "type": "string",
          "enum": ["landlord_tenant", "workplace", "consumer"]
        },
        "document_type": {
          "type": "string",
          "description": "e.g. 'complaint_letter', 'legal_notice', 'consumer_forum_complaint'"
        },
        "user_details": {
          "type": "object",
          "description": "Name, address, dates, and situation-specific facts to fill into the template"
        }
      },
      "required": ["category", "document_type", "user_details"]
    }
  }
]
```

`retrieve_legal_info` is your RAG call under the hood (query ChromaDB with `situation_summary`, return top 3-5 chunks). `draft_document` fills a pre-written template (see section 4) with the LLM's extracted details — this can literally just be a second LLM call with the template + details as context, no need for a separate templating engine.

---

## 4. RAG Knowledge Base — what to put in it

Don't try to cover all of Indian law. For the 3 MVP categories, curate ~15-20 short entries each (45-60 total), sourced from public government sites (indiacode.nic.in, consumerhelpline.gov.in, labour ministry site). Each entry: issue keyword, plain-language right, relevant act/section (only if you're confident it's accurate), which authority handles it.

Example entry (landlord_tenant):
```
Issue: Landlord refuses to return security deposit
Right: Tenant is entitled to full deposit return minus documented
  damages, within a reasonable period after vacating (varies by state
  Rent Control Act)
Authority: Rent Controller / Small Causes Court (state-specific) or
  send a legal notice first
Documents needed: Rent agreement, deposit receipt, vacate notice copy
```

Load these into ChromaDB with `all-MiniLM-L6-v2` embeddings — takes ~20 lines of Python, one-time script.

---

## 5. Build Order (suggested for hackathon time budget)

1. Curate the 45-60 knowledge entries (this is the highest-leverage, do it first) — 2-3 hrs
2. Set up ChromaDB + embed entries — 30 min
3. Backend: Express route that takes user message → calls Groq with system prompt + tools → handles tool calls (retrieve from Chroma, then draft via second LLM call) → returns final response — 3-4 hrs
4. Frontend: simple chat UI + a document preview panel — 3-4 hrs
5. Test 3-5 example scenarios per category, fix classification edge cases — 2 hrs
6. Pitch deck + demo script — 1-2 hrs

Want me to write the actual Express backend code (Groq integration + tool-calling loop + Chroma retrieval) next?
