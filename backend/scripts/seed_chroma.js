import { ChromaClient } from 'chromadb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  console.log("Connecting to local ChromaDB...");
  // Assuming a local Chroma server is running on port 8000, 
  // or we can use the persistent client if chromadb JS supports it.
  // Actually, chromadb JS client currently requires a running python server 
  // unless we use specific local adapters, but for simplicity let's assume `chroma run --path ./chroma_data` is running,
  // OR the newer JS client can run embedded. Let's use standard HTTP client.
  const client = new ChromaClient({ path: "http://localhost:8000" });

  try {
    // Delete existing collection if it exists to start fresh
    await client.deleteCollection({ name: "legal_rights" }).catch(() => {});
    
    console.log("Creating collection 'legal_rights'...");
    const collection = await client.createCollection({ name: "legal_rights" });

    console.log("Reading knowledge base...");
    const kbPath = path.join(__dirname, '../data/knowledge_base.json');
    const data = JSON.parse(fs.readFileSync(kbPath, 'utf-8'));

    const ids = [];
    const documents = [];
    const metadatas = [];

    data.forEach(item => {
      ids.push(item.id);
      // We embed the issue and right text for search
      documents.push(`Issue: ${item.issue}\nRight: ${item.right}`);
      metadatas.push({
        category: item.category,
        authority: item.authority,
        documents_needed: item.documents_needed,
        issue: item.issue,
        right: item.right
      });
    });

    console.log(`Adding ${documents.length} documents to ChromaDB...`);
    await collection.add({
      ids,
      documents,
      metadatas
    });

    console.log("Seeding complete! You can now query ChromaDB.");
  } catch (err) {
    console.error("Error seeding ChromaDB:", err);
    console.log("\nMake sure ChromaDB is running locally: `npx chromadb run` or `chroma run --path ./chroma_data`");
  }
}

seed();
