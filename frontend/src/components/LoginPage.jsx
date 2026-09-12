import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import IndianEmblem from './IndianEmblem';
import { 
  Mail, Lock, Phone, User, ArrowRight, Loader2, 
  Globe, Smartphone, ShieldCheck, AlertTriangle
} from 'lucide-react';

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, signupWithEmail, loginWithPhone } = useAuth();
  
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+91');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || 'Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (mode === 'signup') {
        await signupWithEmail(email, password, displayName);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err) {
      const msg = err.code === 'auth/user-not-found' ? 'No account found with this email. Please sign up.'
        : err.code === 'auth/wrong-password' ? 'Incorrect password. Please try again.'
        : err.code === 'auth/email-already-in-use' ? 'This email is already registered. Please login.'
        : err.code === 'auth/weak-password' ? 'Password must be at least 6 characters.'
        : err.message || 'Authentication failed.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const result = await loginWithPhone(phoneNumber, 'recaptcha-container');
      setConfirmationResult(result);
      setOtpSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
      // Reset recaptcha on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await confirmationResult.confirm(otp);
    } catch (err) {
      setError('Invalid OTP. Please check and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col">
      {/* Tricolor Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo & Title Card */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-2xl">
                <IndianEmblem className="w-14 h-14" showMotto={true} />
              </div>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              न्याय सहायक
            </h1>
            <p className="text-indigo-300 text-sm font-medium mt-1">
              Nyaya Sahayak • Z-RAKSAK
            </p>
            <p className="text-slate-400 text-xs mt-2 max-w-xs mx-auto">
              Your AI-powered Legal Rights &amp; Police Assistance Guide for Indian Citizens
            </p>
          </div>

          {/* Main Auth Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            
            {/* Google Sign In */}
            <div className="p-6 border-b border-white/10">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-bold py-3 px-4 rounded-xl shadow-lg transition active:scale-[0.98] disabled:opacity-60"
              >
                <Globe className="w-5 h-5 text-blue-500" />
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-white/10">
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-3 text-sm font-bold transition ${
                  mode === 'login' 
                    ? 'text-indigo-400 border-b-2 border-indigo-400 bg-white/5' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mail className="w-4 h-4 inline mr-1.5" />
                Email Login
              </button>
              <button
                onClick={() => { setMode('signup'); setError(''); }}
                className={`flex-1 py-3 text-sm font-bold transition ${
                  mode === 'signup' 
                    ? 'text-emerald-400 border-b-2 border-emerald-400 bg-white/5' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4 inline mr-1.5" />
                Sign Up
              </button>
              <button
                onClick={() => { setMode('phone'); setError(''); setOtpSent(false); }}
                className={`flex-1 py-3 text-sm font-bold transition ${
                  mode === 'phone' 
                    ? 'text-amber-400 border-b-2 border-amber-400 bg-white/5' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4 inline mr-1.5" />
                Phone OTP
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-6 mt-4 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-2.5 rounded-lg text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Login / Signup Forms */}
            {(mode === 'login' || mode === 'signup') && (
              <form onSubmit={handleEmailSubmit} className="p-6 space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Rahul Sharma"
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl shadow-lg transition active:scale-[0.98] disabled:opacity-60 text-sm ${
                    mode === 'signup'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {mode === 'signup' ? 'Create Account' : 'Login'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Phone OTP Form */}
            {mode === 'phone' && (
              <div className="p-6 space-y-4">
                {!otpSent ? (
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        Mobile Number (with +91 country code)
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+919876543210"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition active:scale-[0.98] disabled:opacity-60 text-sm"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Smartphone className="w-4 h-4" />
                          Send OTP
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div className="text-center">
                      <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-2.5 rounded-lg text-xs mb-4">
                        <ShieldCheck className="w-4 h-4 inline mr-1" />
                        OTP sent to <strong>{phoneNumber}</strong>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Enter 6-digit OTP</label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        required
                        maxLength={6}
                        className="w-full text-center tracking-[0.5em] text-lg px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || otp.length < 6}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition active:scale-[0.98] disabled:opacity-60 text-sm"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          Verify &amp; Login
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setOtp(''); }}
                      className="w-full text-xs text-slate-400 hover:text-white transition"
                    >
                      ← Change phone number
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="px-6 pb-5 pt-2 text-center">
              <p className="text-[11px] text-slate-500">
                By continuing, you agree that this is a free civic-tech tool.
                <br />
                Your data is used only to track usage and improve the platform.
              </p>
            </div>
          </div>

          {/* Emergency Numbers */}
          <div className="mt-6 flex justify-center gap-3 text-xs">
            <a
              href="tel:112"
              className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 px-3 py-2 rounded-lg font-bold transition"
            >
              <Phone className="w-3.5 h-3.5" /> 112 Police SOS
            </a>
            <a
              href="tel:1930"
              className="flex items-center gap-1.5 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-300 px-3 py-2 rounded-lg font-bold transition"
            >
              <Phone className="w-3.5 h-3.5" /> 1930 Cyber Fraud
            </a>
          </div>
        </div>
      </div>

      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container"></div>
    </div>
  );
}
