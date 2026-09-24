import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowLeft, Send, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigateToLogin: () => void;
  onNavigateToHome?: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onNavigateToLogin,
  onNavigateToHome
}) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (val: string) => {
    if (!val.trim()) {
      return 'Please enter your email.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) {
      return 'Please enter a valid email address.';
    }
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }
    setEmailError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-[#050711]">
      {/* Background cyber ambiance */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl relative z-10"
      >
        {/* Header Icon */}
        <div className="text-center space-y-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-sky-500/15 to-purple-600/25 border border-cyan-500/40 text-cyan-300 mx-auto flex items-center justify-center shadow-glow-cyan">
            <Lock className="w-7 h-7 text-cyan-300" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Enter your email to receive recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-200">Reset instructions requested</p>
                <p className="text-emerald-300/80 text-[11px] mt-0.5">
                  If an account exists for <span className="font-mono text-emerald-200">{email}</span>, password reset instructions will be processed.
                </p>
              </div>
            </div>

            {/* Note required by Section 11 */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>
                Password reset functionality can be connected to an email provider.
              </span>
            </div>

            <button
              onClick={onNavigateToLogin}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-glow-cyan transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  id="forgot-email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border text-xs text-white placeholder-slate-500 transition-all focus:outline-none ${
                    emailError
                      ? 'border-rose-500/80 focus:border-rose-400'
                      : 'border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40'
                  }`}
                />
              </div>
              {emailError && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1.5 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{emailError}</span>
                </p>
              )}
            </div>

            {/* Note required by Section 11 */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>
                Password reset functionality can be connected to an email provider.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold text-xs shadow-glow-cyan transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Reset Instructions</span>
                </>
              )}
            </button>

            <div className="text-center pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1.5 hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
