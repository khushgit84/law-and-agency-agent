import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let directoryCache = null;

function loadDirectoryData() {
  if (directoryCache) return directoryCache;
  const filePath = path.join(__dirname, '../data/police_directory.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  directoryCache = JSON.parse(rawData);
  return directoryCache;
}

export function getNationalHelplines() {
  const data = loadDirectoryData();
  return data.national_helplines || [];
}

export function searchDirectory({ query = '', state = '', category = '' }) {
  const data = loadDirectoryData();
  const q = query.trim().toLowerCase();
  const st = state.trim().toLowerCase();
  const cat = category.trim().toLowerCase();

  let results = data.authorities || [];

  if (cat && cat !== 'all') {
    results = results.filter(item => item.category.toLowerCase() === cat);
  }

  if (st && st !== 'all' && st !== 'all india') {
    results = results.filter(item => 
      item.state.toLowerCase().includes(st) || 
      item.state.toLowerCase().includes('national')
    );
  }

  if (q) {
    results = results.filter(item => {
      const matchName = item.name.toLowerCase().includes(q);
      const matchCity = item.city.toLowerCase().includes(q);
      const matchArea = item.area_coverage.toLowerCase().includes(q);
      const matchDistrict = item.district ? item.district.toLowerCase().includes(q) : false;
      const matchPhone = item.phone.toLowerCase().includes(q);
      const matchEmail = item.email.toLowerCase().includes(q);
      const matchCrimes = item.crime_types ? item.crime_types.some(c => c.toLowerCase().includes(q)) : false;
      const matchState = item.state.toLowerCase().includes(q);
      const matchInstructions = item.filing_instructions ? item.filing_instructions.toLowerCase().includes(q) : false;

      return matchName || matchCity || matchArea || matchDistrict || matchPhone || matchEmail || matchCrimes || matchState || matchInstructions;
    });
  }

  return {
    helplines: getNationalHelplines(),
    authorities: results,
    total: results.length
  };
}

export function lookupAuthorityForAI({ state = '', city = '', crime_or_issue = '' }) {
  const { authorities, helplines } = searchDirectory({
    query: `${city} ${crime_or_issue}`.trim(),
    state: state
  });

  // Pick top 2 most relevant authorities + key emergency helpline
  const selectedAuthorities = authorities.slice(0, 2);
  
  let keyHelpline = helplines.find(h => h.number === '112');
  if (crime_or_issue.toLowerCase().includes('cyber') || crime_or_issue.toLowerCase().includes('upi') || crime_or_issue.toLowerCase().includes('fraud') || crime_or_issue.toLowerCase().includes('scam')) {
    keyHelpline = helplines.find(h => h.number === '1930') || keyHelpline;
  } else if (crime_or_issue.toLowerCase().includes('women') || crime_or_issue.toLowerCase().includes('harassment') || crime_or_issue.toLowerCase().includes('domestic')) {
    keyHelpline = helplines.find(h => h.number === '1091') || keyHelpline;
  }

  return {
    emergency_helpline: keyHelpline,
    matched_authorities: selectedAuthorities.map(a => ({
      name: a.name,
      phone: a.phone,
      email: a.email,
      jurisdiction: a.area_coverage,
      filing_guideline: a.filing_instructions,
      portal: a.portal_url
    }))
  };
}
