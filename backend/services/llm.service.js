import 'dotenv/config';
import Groq from "groq-sdk";
import { retrieveLegalInfo } from "./rag.service.js";
import { fillTemplate } from "../templates/documents.js";
import { lookupAuthorityForAI } from "./directory.service.js";

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing from environment variables (.env file).");
  }
  return new Groq({ apiKey });
}

function checkImmediateDanger(messages) {
  const lastUserMessage = messages.slice().reverse().find(m => m.role === 'user')?.content?.toLowerCase() || '';
  const dangerKeywords = ['murder', 'kill', 'suicide', 'rape', 'kidnap', 'gun', 'weapon', 'attacked', 'bleeding', 'emergency', 'help me now'];
  
  for (const word of dangerKeywords) {
    if (lastUserMessage.includes(word)) {
      return true;
    }
  }
  return false;
}

async function fetchOllamaFallback(conversation, tools) {
  try {
    console.log("Attempting local Ollama fallback...");
    // Format tools for Ollama if needed, but for simplicity we'll just ask Ollama to answer directly
    // since Ollama's tool calling support varies by model. We will just do a basic chat completion.
    const response = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5:7b', // or llama3.1:8b
        messages: conversation,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama fallback failed with status: ${response.status}`);
    }

    const data = await response.json();
    return {
      message: data.message, // { role: 'assistant', content: '...' }
      tool_calls: null // Ignoring tool calls in basic fallback to ensure we get a text response
    };
  } catch (err) {
    console.error("Ollama fallback also failed:", err);
    throw err;
  }
}

const SYSTEM_PROMPT = `
You are Nyaya Sahayak (न्याय सहायक), an AI legal-rights and police assistance guide for Indian citizens.

Your role is to help citizens understand their rights, know exactly which police station or legal authority to approach, provide their verified emails and phone numbers, and draft formal complaints or legal notices.

Guidelines for handling user messages:

1. CLASSIFY the issue into:
   - landlord_tenant
   - workplace
   - consumer
   - cyber_crime (UPI fraud, account hacking, online blackmail, phishing)
   - police_crime (theft, physical threat, assault, harassment, forced eviction)
   - unclear (if not enough info is provided)

2. If category is "unclear", ask ONE short clarifying question in simple language and stop.

3. If category is known:
   a) If it's a legal issue (landlord, workplace, consumer), call \`retrieve_legal_info\`.
   b) Always call \`lookup_authority_directory\` with the user's state, city (if mentioned), and crime/issue keyword to retrieve the verified police station, cyber cell, or authority contact details.
   c) Call \`draft_document\` to generate an appropriate complaint letter, legal notice, or police grievance.

4. Respond with THREE clear sections in simple, reassuring language (mirror the user's language: Hindi, Hinglish, or English):
   a) **Aapke Adhikar / Your Legal Rights** (3-5 bullet points in plain language)
   b) **Kahan aur Kaise Complaint Karein / Authority & Contacts**:
      - Provide the official authority/police station name
      - Verified helpline/phone numbers (highlight **112** for emergency, **1930** for Cyber Fraud Golden Hour)
      - Official complaint email and portal link (e.g., cybercrime.gov.in, e-Daakhil)
      - Specific documents they must carry/attach
   c) **Drafted Document Text**: Clearly label the drafted document.

CRITICAL SAFETY RULES:
- **Cyber / Financial Scams:** Remind the user to call **1930** immediately within the 2-hour "Golden Hour" to freeze scammer bank accounts, and lodge a complaint on https://cybercrime.gov.in.
- **Physical Danger / Threats:** Instruct the user to dial **112** or **1091** (Women Helpline) immediately. Tell them any police station must register a **Zero FIR** even if outside their jurisdiction.
- Never invent inaccurate section numbers; advise consulting a local legal aid advocate if uncertain.
`;

const tools = [
  {
    type: "function",
    function: {
      name: "retrieve_legal_info",
      description: "Retrieve relevant Indian law sections and rights information for a given issue category and situation.",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: ["landlord_tenant", "workplace", "consumer"]
          },
          situation_summary: {
            type: "string",
            description: "One or two sentence summary of the user's specific situation"
          }
        },
        required: ["category", "situation_summary"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "draft_document",
      description: "Generate a filled legal document template (complaint letter, RTI, or notice) based on category and user details.",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: ["landlord_tenant", "workplace", "consumer"]
          },
          document_type: {
            type: "string",
            description: "e.g. 'complaint_letter', 'legal_notice', 'consumer_forum_complaint'"
          },
          user_details: {
            type: "object",
            properties: {
              name: { type: "string" },
              address: { type: "string" },
              issue_summary: { type: "string" },
              situation_description: { type: "string" }
            },
            description: "Name, address, dates, and situation-specific facts to fill into the template"
          }
        },
        required: ["category", "document_type", "user_details"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "lookup_authority_directory",
      description: "Look up verified police stations, cyber crime cells, helplines, emails, and filing guidelines for an Indian city, state, or specific crime.",
      parameters: {
        type: "object",
        properties: {
          state: { type: "string", description: "State or UT name (e.g. Delhi, Maharashtra, Karnataka, Uttar Pradesh, Gujarat)" },
          city: { type: "string", description: "City or district (e.g. New Delhi, Mumbai, Bengaluru, Lucknow, Noida)" },
          crime_or_issue: { type: "string", description: "Crime or issue keyword (e.g. UPI fraud, cyber crime, physical threat, unpaid salary, eviction)" }
        },
        required: ["crime_or_issue"]
      }
    }
  }
];

export async function processChat(messages) {
  let conversation = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages
  ];

  if (checkImmediateDanger(messages)) {
    return {
      text: "🚨 **EMERGENCY DETECTED** 🚨\n\nYour message indicates you might be in immediate physical danger. Please do not wait for online help.\n\n**DIAL 112 IMMEDIATELY** from your phone for police assistance. The police are required to help you and can register a Zero FIR if needed.\n\nIf this is a medical emergency, you can also dial 108 for an ambulance.",
      document: null
    };
  }

  let draftedDoc = null;
  const groq = getGroqClient();

  // We loop to allow the LLM to call multiple tools in sequence
  for (let i = 0; i < 5; i++) {
    const model = process.env.GROQ_MODEL || "qwen/qwen3.8-27b";
    
    let responseMessage;
    
    try {
      const completion = await groq.chat.completions.create({
        model: model,
        messages: conversation,
        tools: tools,
        tool_choice: "auto",
        max_tokens: 800,
      });
      responseMessage = completion.choices[0].message;
    } catch (apiError) {
      console.error("Groq API Error:", apiError.message);
      // Fallback to local Ollama model if Groq fails
      const fallbackData = await fetchOllamaFallback(conversation, tools);
      responseMessage = fallbackData.message;
    }
    conversation.push(responseMessage);

    const toolCalls = responseMessage.tool_calls;
    if (toolCalls) {
      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        
        let toolResult = "";

        if (functionName === "retrieve_legal_info") {
          const info = await retrieveLegalInfo(functionArgs.category, functionArgs.situation_summary);
          toolResult = JSON.stringify(info);
        } else if (functionName === "lookup_authority_directory") {
          const authorityInfo = lookupAuthorityForAI({
            state: functionArgs.state || '',
            city: functionArgs.city || '',
            crime_or_issue: functionArgs.crime_or_issue || ''
          });
          toolResult = JSON.stringify(authorityInfo);
        } else if (functionName === "draft_document") {
          const doc = fillTemplate(functionArgs.document_type, functionArgs.user_details);
          draftedDoc = doc; // save to return alongside chat
          toolResult = "Document drafted successfully. I have the document text ready for the user.";
        } else {
          toolResult = "Unknown function";
        }

        conversation.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: toolResult,
        });
      }
    } else {
      // No more tool calls, return final response
      return {
        text: responseMessage.content,
        document: draftedDoc
      };
    }
  }

  // Failsafe return
  return {
    text: conversation[conversation.length - 1].content || "I am unable to process this request right now.",
    document: draftedDoc
  };
}
