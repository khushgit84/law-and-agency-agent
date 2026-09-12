import { useState, useEffect } from 'react';
import { 
  Search, Phone, Mail, Shield, AlertTriangle, ExternalLink, 
  MapPin, CheckCircle2, Copy, Filter, Building2, Laptop, Scale, Clock
} from 'lucide-react';

export default function AuthorityDirectory() {
  const [data, setData] = useState({ helplines: [], authorities: [], total: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  const states = [
    'All', 'Delhi', 'Maharashtra', 'Karnataka', 'Telangana', 
    'Uttar Pradesh', 'Gujarat', 'West Bengal', 'Tamil Nadu'
  ];

  const categories = [
    { id: 'all', label: 'All Authorities (सभी)', icon: Building2 },
    { id: 'cyber_crime', label: 'Cyber Crime (साइबर अपराध)', icon: Laptop },
    { id: 'police_station', label: 'Police Stations (पुलिस थाना)', icon: Shield },
    { id: 'consumer_labour', label: 'Courts & Labour (न्यायालय व श्रम)', icon: Scale },
  ];

  useEffect(() => {
    fetchDirectory();
  }, [searchQuery, selectedState, selectedCategory]);

  const fetchDirectory = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (selectedState !== 'All') params.append('state', selectedState);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/directory?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load directory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner: Emergency Helplines (Golden Hour & Police) */}
      <div className="bg-gradient-to-r from-red-600 via-amber-600 to-emerald-700 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Immediate Action • आपातकालीन सेवाएं
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold">National Police & Cyber Crime Quick Response</h2>
            <p className="text-white/90 text-sm mt-1 max-w-2xl">
              For online financial fraud, dial <strong className="underline">1930</strong> immediately within the 2-hour Golden Hour to freeze bank accounts. For physical danger or emergency, dial <strong className="underline">112</strong>.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <a 
              href="tel:1930"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-red-700 font-bold px-5 py-3 rounded-xl shadow hover:bg-red-50 transition active:scale-95"
            >
              <Phone className="w-5 h-5 text-red-600" />
              <span>Dial 1930 (Cyber)</span>
            </a>
            <a 
              href="tel:112"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-950 text-white font-bold px-5 py-3 rounded-xl shadow hover:bg-black transition active:scale-95 border border-red-400/40"
            >
              <Shield className="w-5 h-5 text-amber-400" />
              <span>Dial 112 (Police SOS)</span>
            </a>
          </div>
        </div>

        {/* National Helpline Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-5 pt-4 border-t border-white/20">
          {data.helplines?.map((hl) => (
            <a
              key={hl.id}
              href={`tel:${hl.number.split(' ')[0]}`}
              className="bg-black/20 hover:bg-black/30 p-2.5 rounded-lg border border-white/10 text-xs transition flex flex-col justify-between"
            >
              <div className="font-bold text-white flex items-center justify-between">
                <span>{hl.number}</span>
                <Phone className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <div className="text-white/80 line-clamp-1 mt-1 text-[11px] font-medium">{hl.name}</div>
            </a>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Main Search Bar */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-gray-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Area, City, Pin, Police Station, Crime (e.g. BKC, Dwarka, UPI Scam, Deposit, Unpaid Salary)..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-xs text-gray-400 hover:text-gray-600 bg-gray-200 px-2 py-1 rounded"
              >
                Clear
              </button>
            )}
          </div>

          {/* State Dropdown */}
          <div className="w-full md:w-56">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-medium text-gray-700"
            >
              {states.map((st) => (
                <option key={st} value={st}>
                  {st === 'All' ? 'All States (सभी राज्य)' : st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
          <span className="text-xs font-semibold text-gray-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isSelected 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
          <span className="ml-auto text-xs text-gray-500">
            Found <strong>{data.authorities?.length || 0}</strong> verified offices
          </span>
        </div>
      </div>

      {/* Authority Cards Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : data.authorities?.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
          <Shield className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-bold text-gray-800">No police or authority matches found</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
            Try searching with broader terms like "Cyber", "Police", your state name, or dial <strong>112</strong> for any emergency assistance.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.authorities.map((item) => {
            const isCyber = item.category === 'cyber_crime';
            const isPolice = item.category === 'police_station';

            return (
              <div 
                key={item.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-200 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl ${
                        isCyber 
                          ? 'bg-purple-100 text-purple-700' 
                          : isPolice 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {isCyber ? <Laptop className="w-6 h-6" /> : isPolice ? <Shield className="w-6 h-6" /> : <Scale className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            isCyber 
                              ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                              : isPolice 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {item.category.replace('_', ' ')}
                          </span>
                          <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {item.city}, {item.state}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-base mt-1 line-clamp-2">
                          {item.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Jurisdiction / Area */}
                  <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg mb-4 border border-gray-100">
                    <strong className="text-gray-900">Jurisdiction & Covered Area:</strong> {item.area_coverage}
                  </div>

                  {/* Contact Methods */}
                  <div className="space-y-2 mb-4">
                    {/* Phone */}
                    <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-indigo-50/50 border border-indigo-100/80">
                      <div className="flex items-center gap-2 font-medium text-gray-800 truncate">
                        <Phone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate">{item.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <button
                          onClick={() => copyToClipboard(item.phone, `phone_${item.id}`)}
                          className="text-gray-400 hover:text-indigo-600 p-1"
                          title="Copy phone"
                        >
                          {copiedId === `phone_${item.id}` ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <a
                          href={`tel:${item.phone.split('/')[0].trim()}`}
                          className="bg-indigo-600 text-white font-semibold px-2.5 py-1 rounded-md text-[11px] hover:bg-indigo-700 transition"
                        >
                          Call
                        </a>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-emerald-50/50 border border-emerald-100/80">
                      <div className="flex items-center gap-2 font-medium text-gray-800 truncate">
                        <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{item.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <button
                          onClick={() => copyToClipboard(item.email, `email_${item.id}`)}
                          className="text-gray-400 hover:text-emerald-600 p-1"
                          title="Copy email"
                        >
                          {copiedId === `email_${item.id}` ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <a
                          href={`mailto:${item.email.split(',')[0].trim()}`}
                          className="bg-emerald-600 text-white font-semibold px-2.5 py-1 rounded-md text-[11px] hover:bg-emerald-700 transition"
                        >
                          Email
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Crime Types Covered Tags */}
                  {item.crime_types && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {item.crime_types.map((crime, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
                          {crime}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Filing Instructions */}
                  <div className="text-xs bg-amber-50/60 border border-amber-200/60 p-3 rounded-lg text-amber-950 mb-4">
                    <div className="font-bold flex items-center gap-1 mb-1 text-amber-900">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      How to file / क्या करें:
                    </div>
                    <p className="leading-relaxed">{item.filing_instructions}</p>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500 truncate max-w-[65%]">
                    📍 {item.address}
                  </span>
                  {item.portal_url && (
                    <a
                      href={item.portal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      Official Portal <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
