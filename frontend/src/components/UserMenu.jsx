import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Settings, ChevronDown, ShieldCheck } from 'lucide-react';

export default function UserMenu() {
  const { user, isAdmin, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const displayName = user.displayName || user.email?.split('@')[0] || user.phoneNumber || 'User';
  const photoURL = user.photoURL;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-xl transition border border-gray-200"
      >
        {photoURL ? (
          <img src={photoURL} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
            {initial}
          </div>
        )}
        <span className="text-xs font-semibold text-gray-700 hidden sm:inline max-w-[100px] truncate">
          {displayName}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{user.email || user.phoneNumber || ''}</p>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 mt-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Admin
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="py-1.5">
            <button
              onClick={() => { logout(); setIsOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
