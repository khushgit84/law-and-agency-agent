import { useState } from 'react';
import { FileText, Download, Copy, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';
import IndianEmblem from './IndianEmblem';

export default function DocumentViewer({ documentContent }) {
  const [copied, setCopied] = useState(false);
  const [useOfficialLetterhead, setUseOfficialLetterhead] = useState(true);

  if (!documentContent) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 shadow-sm">
        <div className="bg-gray-50 p-4 rounded-full mb-4">
          <FileText className="w-12 h-12 text-gray-300" />
        </div>
        <h3 className="text-base font-bold text-gray-700">No Document Drafted Yet</h3>
        <p className="text-xs text-center mt-1 text-gray-500 max-w-xs leading-relaxed">
          Ask Nyaya Sahayak in the chat to draft a Legal Notice, Cyber Crime Complaint, or Rent Notice. It will appear here ready to copy or print.
        </p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(documentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([documentContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = "legal_complaint_notice.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Legal Notice / Complaint Document</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; padding: 40px; line-height: 1.6; color: #111; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 25px; }
            .motto { font-size: 13px; font-weight: bold; letter-spacing: 2px; }
            pre { font-family: 'Times New Roman', Times, serif; white-space: pre-wrap; font-size: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>FORMAL LEGAL NOTICE / COMPLAINT</h2>
            <div class="motto">सत्यमेव जयते • न्याय सहायक (NYAYA SAHAYAK)</div>
          </div>
          <pre>${documentContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-4 text-white flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-1.5 rounded-lg border border-white/20">
            <FileText className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h2 className="font-bold text-base">Drafted Legal Document</h2>
            <p className="text-emerald-200 text-xs">Ready for printing, dispatch, or digital submission</p>
          </div>
        </div>

        {/* Actions Toolbar */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setUseOfficialLetterhead(!useOfficialLetterhead)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              useOfficialLetterhead 
                ? 'bg-emerald-600/80 text-white' 
                : 'bg-white/10 text-emerald-200 hover:bg-white/20'
            }`}
            title="Toggle Letterhead Format"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Letterhead</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-2 bg-emerald-700/60 hover:bg-emerald-700 text-white rounded-lg transition active:scale-95 flex items-center gap-1 text-xs"
            title="Copy Text to Clipboard"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-2 bg-emerald-700/60 hover:bg-emerald-700 text-white rounded-lg transition active:scale-95 flex items-center gap-1 text-xs"
            title="Print Document"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button 
            onClick={handleDownload}
            className="p-2 bg-white text-emerald-900 hover:bg-emerald-50 rounded-lg transition active:scale-95 flex items-center gap-1 text-xs font-bold shadow-xs"
            title="Download Document"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>
      
      {/* Document Sheet */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center">
        <div className="bg-white max-w-3xl w-full p-8 md:p-12 rounded-xl shadow-md border border-gray-300 min-h-full font-serif text-gray-900 text-sm md:text-base leading-relaxed whitespace-pre-wrap relative">
          
          {/* Official Letterhead Header if enabled */}
          {useOfficialLetterhead && (
            <div className="border-b-2 border-gray-800 pb-4 mb-6 text-center select-none">
              <div className="flex justify-center mb-1">
                <IndianEmblem className="w-12 h-12" showMotto={true} />
              </div>
              <div className="text-[10px] uppercase font-sans tracking-widest text-gray-500 font-bold mt-1">
                Formal Citizen Legal Redressal Communication
              </div>
            </div>
          )}

          {documentContent}

          {/* Verification Footer */}
          <div className="mt-8 pt-4 border-t border-gray-200 text-[11px] font-sans text-gray-400 flex items-center justify-between">
            <span>Generated via Nyaya Sahayak (न्याय सहायक)</span>
            <span>Verify with an advocate before formal judicial filing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
