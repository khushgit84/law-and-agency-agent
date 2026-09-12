import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Scale, AlertOctagon, Sparkles, Phone, Shield, Mic, MicOff } from 'lucide-react';
import IndianEmblem from './IndianEmblem';
import { useAuth } from '../contexts/AuthContext';

export default function ChatBox({ onDocumentDrafted, onSwitchToDirectory }) {
  const { getAuthHeader } = useAuth();
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'नमस्ते! मैं **न्याय सहायक (Nyaya Sahayak)** हूँ — आपका कानूनी अधिकार व पुलिस सहायता मार्गदर्शक।\n\nआप मुझसे किसी भी समस्या पर पूछ सकते हैं (हिंदी, Hinglish, or English):\n• **मकान मालिक / किराया विवाद** (Security Deposit, बेदखली)\n• **नौकरी व वेतन समस्या** (Unpaid salary, wrongful termination)\n• **उपभोक्ता शिकायत** (Defective product, refund issues)\n• **साइबर फ्रॉड व पुलिस अपराध** (UPI Scam, FIR, Police harassment)\n\nनीचे दिए गए सुझाव पर क्लिक करें या अपनी समस्या लिखें:' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const quickPrompts = [
    { label: '🚨 UPI / Cyber Scam (1930)', text: 'Mere saath UPI fraud hua hai, account se paise kat gaye. Mujhe kya karna chahiye?' },
    { label: '🏠 Landlord Deposit Notice', text: 'Mera landlord security deposit wapas nahi de raha hai. Mujhe legal notice bhejna hai.' },
    { label: '💼 Unpaid Salary Grievance', text: 'Company pichle do mahine se meri salary nahi de rahi hai. Labour commissioner ko complaint karni hai.' },
    { label: '🛍️ Consumer Refund Refusal', text: 'Maine online product khareeda jo defective nikla aur seller refund nahi de raha.' },
    { label: '👮 Zero FIR & Police Complaint', text: 'Police complaint kaise darj karein agar police station FIR lene se mana kare?' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    // Initialize SpeechRecognition if available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'hi-IN'; // Defaulting to Hindi for Indian users, but it can pick up English/Hinglish often

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        // Use functional state update to safely append or set the text
        if (finalTranscript) {
           setInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.error("Error starting recognition", e);
        }
      } else {
        alert("Your browser does not support Voice Input. Please try using Google Chrome or Edge.");
      }
    }
  };

  const sendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMessage = { role: 'user', content: query };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const authHeaders = await getAuthHeader();
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          messages: newMessages.filter(m => m.role !== 'assistant' || m.content !== messages[0].content)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      
      if (data.document) {
        onDocumentDrafted(data.document);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Kshama karein, server se connect karne mein samasya aayi. Kripya punah prayas karein.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-4 text-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-1.5 rounded-xl border border-white/20 backdrop-blur-sm">
            <IndianEmblem className="w-8 h-8" showMotto={false} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base md:text-lg">न्याय सहायक • Nyaya Sahayak</h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-400/30">
                Live AI
              </span>
            </div>
            <p className="text-blue-200 text-xs">Vernacular Legal Rights & Police Grievance Assistant</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <a
            href="tel:1930"
            className="flex items-center gap-1 bg-red-600/80 hover:bg-red-600 px-2.5 py-1.5 rounded-lg font-bold text-white transition text-[11px]"
            title="Cyber Financial Fraud Helpline"
          >
            <Phone className="w-3.5 h-3.5" /> 1930 Cyber
          </a>
          <a
            href="tel:112"
            className="flex items-center gap-1 bg-amber-600/80 hover:bg-amber-600 px-2.5 py-1.5 rounded-lg font-bold text-white transition text-[11px]"
            title="Police Emergency SOS"
          >
            <Shield className="w-3.5 h-3.5" /> 112 Police
          </a>
        </div>
      </div>

      {/* Emergency Mini Notice */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-1.5">
          <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="truncate">
            Immediate cyber fraud? Report within <strong>2 hours (Golden Hour)</strong> on <strong>1930</strong>.
          </span>
        </div>
        {onSwitchToDirectory && (
          <button
            onClick={onSwitchToDirectory}
            className="text-indigo-600 hover:text-indigo-800 font-bold underline shrink-0 ml-2 text-[11px]"
          >
            Find Local Police / Thana →
          </button>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[88%] md:max-w-[82%] rounded-2xl p-4 shadow-sm leading-relaxed text-sm whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 mb-2 pb-1 border-b border-gray-100">
                  <Scale className="w-3.5 h-3.5" /> Nyaya Sahayak Guidance
                </div>
              )}
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 rounded-2xl rounded-bl-none p-4 border border-gray-200 shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span className="text-xs text-gray-500 font-medium">Analyzing rights & drafting documentation...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 overflow-x-auto">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium whitespace-nowrap mb-1.5">
          <Sparkles className="w-3 h-3 text-amber-500" /> Suggested queries:
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => sendMessage(p.text)}
              disabled={isLoading}
              className="shrink-0 bg-white hover:bg-indigo-50 hover:border-indigo-300 text-gray-700 text-xs px-3 py-1.5 rounded-full border border-gray-300 shadow-xs transition active:scale-95 disabled:opacity-50"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 bg-white">
        <div className="flex gap-2 relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening... Speak now..." : "Type your issue in Hindi, English, or Hinglish..."}
            className={`flex-1 rounded-xl border px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm transition-colors ${isListening ? 'bg-red-50 border-red-300 placeholder-red-400' : 'border-gray-300 bg-gray-50 focus:bg-white focus:border-indigo-600'}`}
          />
          <button
            type="button"
            onClick={toggleListening}
            className={`absolute left-3 top-3.5 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-indigo-600'}`}
            title="Voice Input (Hindi/English)"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <button 
            type="submit" 
            disabled={isLoading || (!input.trim() && !isListening)}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white p-3 rounded-xl transition-all shadow flex items-center justify-center min-w-[50px] active:scale-95"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  );
}
