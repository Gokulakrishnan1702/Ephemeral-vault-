import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  CheckCircle,
  KeyRound,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Cpu,
  Flame,
  User
} from 'lucide-react';
import { api, getRememberedEmail, setRememberedEmail } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';

interface LoginPageProps {
  initialMode?: 'login' | 'signup';
  onSuccess: () => void;
  onNavigateToForgotPassword?: () => void;
  onNavigateHome?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  initialMode = 'login',
  onSuccess,
  onNavigateToForgotPassword,
  onNavigateHome
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Field-specific inline validation errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  // Loading and success animation states
  const [loading, setLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();

  // Load remembered email on mount
  useEffect(() => {
    const remembered = getRememberedEmail();
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  // Validation functions
  const validateEmailFormat = (val: string): string => {
    if (!val.trim()) {
      return 'Please enter your email.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) {
      return 'Please enter a valid email address.';
    }
    return '';
  };

  const validatePasswordFormat = (val: string): string => {
    if (!val) {
      return 'Please enter your password.';
    }
    if (val.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    return '';
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (emailError) setEmailError('');
    if (generalError) setGeneralError('');
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (passwordError) setPasswordError('');
    if (generalError) setGeneralError('');
  };

  // Quick autofill demo account
  const handleUseDemoAccount = () => {
    setEmail('user@example.com');
    setPassword('password');
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
    addToast('info', 'Demo credentials loaded: user@example.com / password', 'Quick Test');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    // Run client-side validations
    const emailErr = validateEmailFormat(email);
    const passErr = validatePasswordFormat(password);

    let hasErrors = false;
    if (emailErr) {
      setEmailError(emailErr);
      hasErrors = true;
    }
    if (passErr) {
      setPasswordError(passErr);
      hasErrors = true;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setNameError('Please enter your full name.');
        hasErrors = true;
      }
      if (password !== confirmPassword) {
        setConfirmPasswordError('Passwords do not match.');
        hasErrors = true;
      }
    }

    if (hasErrors) return;

    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login(email.trim(), password);
        
        // Handle Remember Me (stores only email address, NEVER passwords)
        setRememberedEmail(email, rememberMe);

        // Update auth context state
        login(res.token, res.user);

        // Trigger visual success state
        setAuthSuccess(true);
        addToast('success', `Welcome back, ${res.user.name || res.user.email}!`, 'Authenticated');

        // Smooth redirect after visual confirmation
        setTimeout(() => {
          onSuccess();
        }, 650);
      } else {
        const res = await api.register(name.trim(), email.trim(), password);
        setRememberedEmail(email, rememberMe);
        login(res.token, res.user);
        setAuthSuccess(true);
        addToast('success', 'Account registered successfully!', 'Welcome');

        setTimeout(() => {
          onSuccess();
        }, 650);
      }
    } catch (err: any) {
      setGeneralError(err.message || 'Authentication failed. Please verify credentials.');
      addToast('error', err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center relative overflow-hidden bg-[#050711] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Background cyber ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute inset-0 cyber-grid-bg opacity-30 pointer-events-none -z-10" />

      {/* Main Container - Split Screen on Desktop */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* ========================================================================= */}
        {/* LEFT SIDE: BRANDING, FUTURISTIC VAULT GRAPHIC & SECURITY INDICATORS      */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="lg:col-span-6 flex flex-col justify-center space-y-6 lg:space-y-8 py-2"
        >
          {/* Logo & Headline */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono tracking-wide shadow-glow-cyan">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>🔐 Ephemeral Secret Vault</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Secure access to your{' '}
              <span className="cyber-gradient-text drop-shadow-[0_0_25px_rgba(6,182,212,0.35)]">
                secret vault.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-lg">
              Create, manage and securely share self-destructing secrets with confidence.
            </p>
          </div>

          {/* Futuristic Animated Security Illustration Graphic */}
          <div className="relative w-full max-w-md aspect-[4/3] rounded-3xl bg-gradient-to-b from-[#0b1126]/90 to-[#070b1a]/95 border border-cyan-500/25 p-6 flex flex-col items-center justify-center shadow-2xl backdrop-blur-xl overflow-hidden group">
            
            {/* Ambient inner glow */}
            <div className="absolute inset-0 bg-radial from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

            {/* Orbiting concentric cryptographic rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
              className="absolute w-64 h-64 border border-cyan-500/20 rounded-full border-dashed"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-cyan-400 rounded-full shadow-glow-cyan flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
              <div className="absolute bottom-6 right-8 w-2.5 h-2.5 bg-purple-400 rounded-full shadow-glow-purple" />
            </motion.div>

            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute w-44 h-44 border border-purple-500/25 rounded-full"
            >
              <div className="absolute top-1/3 left-0 -translate-x-1/2 w-2.5 h-2.5 bg-sky-400 rounded-full shadow-glow-cyan" />
              <div className="absolute bottom-1/4 right-0 translate-x-1/2 w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-glow-green" />
            </motion.div>

            {/* Central Vault Shield Core */}
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10 w-24 h-24 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-sky-500/15 to-purple-600/30 border border-cyan-400/50 flex flex-col items-center justify-center shadow-[0_0_35px_-5px_rgba(6,182,212,0.45)] backdrop-blur-md"
            >
              <Shield className="w-10 h-10 text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]" />
              <Lock className="w-4 h-4 text-purple-300 -mt-2 drop-shadow" />
            </motion.div>

            {/* Live Cryptographic Status Badge */}
            <div className="relative z-10 mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>AES-256-GCM Hardware Encrypted</span>
            </div>

            {/* Floating telemetry pills */}
            <div className="absolute top-3 left-4 text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              ZERO PLAINTEXT CACHED
            </div>
            <div className="absolute bottom-3 right-4 text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
              <Flame className="w-3 h-3 text-rose-400" />
              ATOMIC HARDWARE WIPE
            </div>
          </div>

          {/* Security Checklist Indicators (Required by Section 2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {[
              { text: 'AES-256-GCM Encryption', detail: 'Hardware-grade symmetric cipher' },
              { text: 'Zero Plaintext Storage', detail: 'Never written to disk or logs' },
              { text: 'Secure Secret Sharing', detail: 'Protected against crawlers' },
              { text: 'Automatic Destruction', detail: 'Physical SQLite hard wipe on read' }
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-cyan-500/30 transition-colors"
              >
                <div className="w-5 h-5 rounded-md bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1">
                    <span>✓</span> {item.text}
                  </div>
                  <div className="text-[10px] text-slate-400">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>

        </motion.div>

        {/* ========================================================================= */}
        {/* RIGHT SIDE: CENTERED GLASSMORPHISM LOGIN CARD                             */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          className="lg:col-span-6 flex justify-center w-full"
        >
          <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-slate-900/85 border border-cyan-500/20 shadow-[0_0_50px_-10px_rgba(6,182,212,0.18)] backdrop-blur-2xl relative space-y-6">
            
            {/* Top decorative gradient rim */}
            <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent rounded-full" />

            {/* Card Header (Required by Section 3) */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-600/30 border border-cyan-400/30 text-cyan-300 mx-auto flex items-center justify-center shadow-glow-cyan mb-2">
                <Lock className="w-6 h-6 text-cyan-300" />
              </div>

              <h2 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                <span>{mode === 'login' ? 'Welcome Back' : 'Create Vault Account'}</span>
                <span>👋</span>
              </h2>

              <p className="text-xs text-slate-400">
                {mode === 'login'
                  ? 'Sign in to access your secure vault.'
                  : 'Establish cryptographic identity to manage secrets.'}
              </p>
            </div>

            {/* General error alert if any */}
            {generalError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{generalError}</span>
              </motion.div>
            )}

            {/* Quick Demo Account Helper Pill */}
            {mode === 'login' && (
              <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-between text-[11px] text-cyan-300/90">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Demo: <strong className="text-white">user@example.com</strong></span>
                </span>
                <button
                  type="button"
                  onClick={handleUseDemoAccount}
                  className="px-2 py-0.5 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 text-[10px] font-semibold transition-colors"
                >
                  Auto-fill
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              
              {/* Full Name field (for signup) */}
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="login-name"
                      placeholder="Security Operator"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (nameError) setNameError('');
                      }}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border text-xs text-white placeholder-slate-500 transition-all focus:outline-none ${
                        nameError
                          ? 'border-rose-500/80 focus:border-rose-400'
                          : 'border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40'
                      }`}
                    />
                  </div>
                  {nameError && (
                    <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      <span>{nameError}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Email Field (Required by Section 3) */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    id="login-email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border text-xs text-white placeholder-slate-500 transition-all focus:outline-none ${
                      emailError
                        ? 'border-rose-500/80 focus:border-rose-400'
                        : 'border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40'
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span>{emailError}</span>
                  </p>
                )}
              </div>

              {/* Password Field (Required by Section 3) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">
                    Password
                  </label>
                  {mode === 'login' && onNavigateToForgotPassword && (
                    <button
                      type="button"
                      onClick={onNavigateToForgotPassword}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/90 border text-xs text-white placeholder-slate-500 transition-all focus:outline-none ${
                      passwordError
                        ? 'border-rose-500/80 focus:border-rose-400'
                        : 'border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40'
                    }`}
                  />
                  {/* Show/Hide password toggle (Required by Section 3) */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="p-1.5 text-slate-400 hover:text-slate-200 absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors rounded-lg"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span>{passwordError}</span>
                  </p>
                )}
              </div>

              {/* Confirm Password (for signup) */}
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (confirmPasswordError) setConfirmPasswordError('');
                      }}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border text-xs text-white placeholder-slate-500 transition-all focus:outline-none ${
                        confirmPasswordError
                          ? 'border-rose-500/80 focus:border-rose-400'
                          : 'border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40'
                      }`}
                    />
                  </div>
                  {confirmPasswordError && (
                    <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      <span>{confirmPasswordError}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Remember Me Checkbox (Required by Section 3 & 12) */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-400 focus:ring-offset-0 focus:ring-1 cursor-pointer accent-cyan-500"
                  />
                  <span>Remember me</span>
                </label>
              </div>

              {/* Sign In Button with loading & success state (Required by Section 3 & 5 & 13) */}
              <motion.button
                type="submit"
                disabled={loading || authSuccess}
                whileHover={{ scale: loading || authSuccess ? 1 : 1.01 }}
                whileTap={{ scale: loading || authSuccess ? 1 : 0.99 }}
                className={`w-full py-3 rounded-xl font-bold text-xs shadow-glow-cyan transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-75 ${
                  authSuccess
                    ? 'bg-emerald-500 text-slate-950 shadow-glow-green'
                    : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-sky-400 text-slate-950'
                }`}
              >
                {authSuccess ? (
                  <span className="flex items-center gap-2 text-slate-950 font-bold">
                    <CheckCircle className="w-4 h-4" />
                    <span>✓ Authentication successful</span>
                  </span>
                ) : loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                    <span>Authenticating...</span>
                  </span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{mode === 'login' ? 'Sign In' : 'Create Vault Account'}</span>
                  </>
                )}
              </motion.button>
            </form>

            {/* Switch Mode Footer */}
            <div className="text-center pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex flex-col gap-2">
              {mode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setEmailError('');
                      setPasswordError('');
                      setGeneralError('');
                    }}
                    className="text-cyan-400 font-semibold hover:text-cyan-300 hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              ) : (
                <p>
                  Already have a vault account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setEmailError('');
                      setPasswordError('');
                      setGeneralError('');
                    }}
                    className="text-cyan-400 font-semibold hover:text-cyan-300 hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              )}

              {onNavigateHome && (
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="text-[11px] text-slate-500 hover:text-slate-400 transition-colors"
                >
                  ← Return to Ephemeral Vault Home
                </button>
              )}
            </div>

          </div>
        </motion.div>

      </div>
    </div>
  );
};
