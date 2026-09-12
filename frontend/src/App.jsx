import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import ChatBox from './components/ChatBox';
import DocumentViewer from './components/DocumentViewer';
import AuthorityDirectory from './components/AuthorityDirectory';
import AdminDashboard from './components/AdminDashboard';
import IndianEmblem from './components/IndianEmblem';
import UserMenu from './components/UserMenu';
import { MessageSquare, Shield, Phone, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';

function App() {
  const { user, loading, isAdmin } = useAuth();
  const [draftedDoc, setDraftedDoc] = useState(null);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'directory' | 'admin'

  // Show loading spinner while Firebase checks auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Loading Nyaya Sahayak...</p>
        </div>
      </div>
    );
  }

  // Show login page if user is not authenticated
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Tricolor Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Brand & Emblem */}
          <div className="flex items-center gap-3">
            <IndianEmblem className="w-10 h-10" showMotto={true} />
            <div className="border-l border-gray-300 pl-3">
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                  न्याय सहायक <span className="text-indigo-600 font-extrabold">• Nyaya Sahayak</span>
                </h1>
                <span className="hidden md:inline-block bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-300">
                  Z-RAKSAK
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Agents for Bharat — AI for Social Impact & Citizen Legal Rights
              </p>
            </div>
          </div>

          {/* Right Side: SOS, Tabs, User Menu */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            
            {/* Quick SOS Buttons */}
            <div className="flex items-center gap-1.5">
              <a
                href="tel:1930"
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition active:scale-95"
                title="Dial 1930 for Financial Cyber Fraud"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>1930 Cyber</span>
              </a>

              <a
                href="tel:112"
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-black text-amber-400 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition active:scale-95 border border-slate-700"
                title="Dial 112 for All Emergencies"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>112 Police</span>
              </a>
            </div>

            {/* Navigation Tabs Pill */}
            <div className="bg-gray-100 p-1 rounded-xl flex items-center border border-gray-200">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'chat'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Legal Assistant</span>
              </button>

              <button
                onClick={() => setActiveTab('directory')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'directory'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-red-600" />
                <span>Police Directory</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeTab === 'admin'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Admin</span>
                </button>
              )}
            </div>

            {/* User Menu */}
            <UserMenu />

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6">
        {activeTab === 'chat' ? (
          <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-160px)] min-h-[580px]">
            {/* Chat Panel */}
            <div className="flex-1 min-w-[320px] lg:max-w-xl h-full">
              <ChatBox 
                onDocumentDrafted={setDraftedDoc} 
                onSwitchToDirectory={() => setActiveTab('directory')}
              />
            </div>

            {/* Document Panel */}
            <div className="flex-[1.4] min-w-[320px] h-full hidden lg:block">
              <DocumentViewer documentContent={draftedDoc} />
            </div>

            {/* Mobile Document Drawer / Preview if document exists */}
            {draftedDoc && (
              <div className="block lg:hidden mt-4">
                <DocumentViewer documentContent={draftedDoc} />
              </div>
            )}
          </div>
        ) : activeTab === 'directory' ? (
          <AuthorityDirectory />
        ) : activeTab === 'admin' && isAdmin ? (
          <AdminDashboard onBack={() => setActiveTab('chat')} />
        ) : null}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-3 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Team <strong>Vexlora</strong> • Nyaya Sahayak (न्याय सहायक) — Free Civic Tech for Bharat
          </span>
          <div className="flex items-center gap-4">
            <a 
              href="https://cybercrime.gov.in" 
              target="_blank" 
              rel="noreferrer" 
              className="text-indigo-600 hover:underline flex items-center gap-1"
            >
              National Cyber Crime Portal <ExternalLink className="w-3 h-3" />
            </a>
            <a 
              href="https://edaakhil.nic.in" 
              target="_blank" 
              rel="noreferrer" 
              className="text-indigo-600 hover:underline flex items-center gap-1"
            >
              e-Daakhil Consumer Portal <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
