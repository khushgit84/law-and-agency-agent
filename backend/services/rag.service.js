import { pipeline } from '@xenova/transformers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let extractor = null;
let embeddedDocs = null;
let initPromise = null;

function dotProduct(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

function magnitude(a) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * a[i];
  }
  return Math.sqrt(sum);
}

function cosineSimilarity(a, b) {
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA === 0 || magB === 0) return 0;
  return dotProduct(a, b) / (magA * magB);
}

export async function initKnowledgeBase() {
  if (embeddedDocs) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      console.log("Loading all-MiniLM-L6-v2 embedding model locally (zero API cost)...");
      extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

      const kbPath = path.join(__dirname, '../data/knowledge_base.json');
      const rawData = JSON.parse(fs.readFileSync(kbPath, 'utf-8'));

      console.log(`Indexing ${rawData.length} legal knowledge base entries...`);
      embeddedDocs = [];

      for (const item of rawData) {
        const textToEmbed = `Issue: ${item.issue}\nRight: ${item.right}`;
        const output = await extractor(textToEmbed, { pooling: 'mean', normalize: true });
        const embedding = Array.from(output.data);
        embeddedDocs.push({
          ...item,
          embedding
        });
      }

      console.log("Local vector knowledge base ready for instant retrieval!");
    } catch (err) {
      console.error("Failed to initialize embedding model:", err);
      throw err;
    }
  })();

  return initPromise;
}

export async function retrieveLegalInfo(category, situation_summary) {
  try {
    // Ensure the knowledge base is loaded
    await initKnowledgeBase();

    // Embed the incoming situation summary
    const queryOutput = await extractor(situation_summary, { pooling: 'mean', normalize: true });
    const queryEmbedding = Array.from(queryOutput.data);

    // Filter documents by category if matches exist
    let candidates = embeddedDocs;
    if (category && category !== 'unclear') {
      const filtered = embeddedDocs.filter(d => d.category === category);
      if (filtered.length > 0) {
        candidates = filtered;
      }
    }

    // Rank candidates by cosine similarity
    const scored = candidates.map(doc => ({
      ...doc,
      score: cosineSimilarity(queryEmbedding, doc.embedding)
    }));

    scored.sort((a, b) => b.score - a.score);

    // Return top 3 matches
    const topMatches = scored.slice(0, 3).map(match => ({
      issue: match.issue,
      right: match.right,
      authority: match.authority,
      documents_needed: match.documents_needed,
      relevance_score: match.score.toFixed(3)
    }));

    console.log(`Retrieved ${topMatches.length} legal entries for category [${category}]. Top score: ${topMatches[0]?.relevance_score}`);
    return topMatches;
  } catch (error) {
    console.error("Error in semantic retrieval:", error);
    return [{
      error: "Could not retrieve specific local laws at this moment. Please consult a local advocate."
    }];
  }
}
