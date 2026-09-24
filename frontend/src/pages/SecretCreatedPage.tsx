import React, { useEffect, useState } from 'react';
import {
  CheckCircle,
  Copy,
  ExternalLink,
  PlusCircle,
  QrCode,
  Share2,
  Mail,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Flame,
  Check,
  Globe,
  Wifi,
  Laptop
} from 'lucide-react';
import QRCodeLib from 'qrcode';
import { SecretCreatedResponse } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';

interface SecretCreatedPageProps {
  data: SecretCreatedResponse;
  onReset: () => void;
  onNavigateToView: (id: string) => void;
}

export const SecretCreatedPage: React.FC<SecretCreatedPageProps> = ({
  data,
  onReset,
  onNavigateToView,
}) => {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState(false);

  // Link type selection: 'public' | 'lan' | 'local'
  const [linkType, setLinkType] = useState<'public' | 'lan' | 'local'>('public');

  const publicUrl = data.public_url || (data.view_url.startsWith('http') ? data.view_url : `https://photographs-nevertheless-forest-inline.trycloudflare.com/view/${data.id}`);
  const lanUrl = data.lan_url || `http://10.90.134.102:3000/view/${data.id}`;
  const localUrl = data.local_url || `http://localhost:5173/view/${data.id}`;

  const currentShareUrl = linkType === 'public' ? publicUrl : linkType === 'lan' ? lanUrl : localUrl;

  useEffect(() => {
    QRCodeLib.toDataURL(currentShareUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: '#050711',
        light: '#38bdf8',
      },
    })
      .then(setQrDataUrl)
      .catch((err) => console.error('QR code generation failed', err));
  }, [currentShareUrl]);

  const handleCopy = async (textToCopy?: string) => {
    const text = textToCopy || currentShareUrl;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      addToast('success', 'Link copied to clipboard!', 'Copied');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      addToast('error', 'Failed to copy URL');
    }
  };

  const handleShareWhatsApp = () => {
    // Send the GLOBAL PUBLIC URL so any phone or system can open it!
    const text = encodeURIComponent(`Here is a secure self-destructing secret link:\n${publicUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent('Secure Encrypted Secret Link');
    const body = encodeURIComponent(
      `You have been sent a secure, self-destructing secret. Click the public link below to safely reveal and burn it:\n\n${publicUrl}\n\nNote: Opening the GET link is safe; clicking Reveal burns it permanently.`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleGenericShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Secure Secret Link',
          text: 'Here is an ephemeral, self-destructing secret link:',
          url: currentShareUrl,
        });
      } catch {
        // Share cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      
      {/* Success Badge & Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 mx-auto mb-4 flex items-center justify-center shadow-glow-green animate-bounce">
          <CheckCircle className="w-9 h-9" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Secret Created Successfully
        </h1>
        <p className="mt-2 text-slate-400 text-sm">
          Encrypted with AES-256-GCM. Share this unique link with your recipient.
        </p>
      </div>

      {/* Main Secure URL Box with Public / LAN / Local tabs */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-cyan-500/40 shadow-2xl backdrop-blur-md space-y-5">
        
        {/* Network Reach Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-cyan-300 uppercase tracking-wider font-bold">
              Select Link Network Scope:
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Secret ID: {data.id}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setLinkType('public')}
              className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                linkType === 'public'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-glow-cyan'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <div className="text-xs font-bold leading-none">Global Public Link</div>
                <div className="text-[10px] text-slate-400 mt-1">WhatsApp & Any System</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setLinkType('lan')}
              className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                linkType === 'lan'
                  ? 'bg-purple-500/20 border-purple-400 text-purple-200 shadow-glow-purple'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wifi className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <div className="text-xs font-bold leading-none">Wi-Fi LAN Link</div>
                <div className="text-[10px] text-slate-400 mt-1">Same Local Wi-Fi</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setLinkType('local')}
              className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                linkType === 'local'
                  ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Laptop className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <div className="text-xs font-bold leading-none">Localhost</div>
                <div className="text-[10px] text-slate-400 mt-1">This Device Only</div>
              </div>
            </button>
          </div>
        </div>

        {/* Current Active URL Input & Copy Button */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-700 font-mono text-xs sm:text-sm text-cyan-300 truncate select-all">
              {currentShareUrl}
            </div>
            <button
              onClick={() => handleCopy()}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white shadow-glow-green'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-glow-cyan'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>

          <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-1">
            <Check className="w-3.5 h-3.5" />
            <span>
              {linkType === 'public'
                ? '🌐 This public link is accessible from WhatsApp on mobile phones, any app, any website, and any computer worldwide!'
                : linkType === 'lan'
                ? '🏠 Accessible from any phone, laptop, or tablet connected to the same Wi-Fi router (10.90.134.102).'
                : '💻 Accessible only on this local computer.'}
            </span>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Opening this link is safe and will not consume views. Clicking "Reveal & Show Password" burns the view and decrypts the secret.
          </span>
        </div>
      </div>

      {/* Security Information Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400 uppercase font-mono flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Expires At
          </div>
          <div className="text-xs font-bold text-white truncate">
            {new Date(data.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400 uppercase font-mono flex items-center gap-1.5 mb-1">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            Views Allowed
          </div>
          <div className="text-xs font-bold text-rose-400">
            {data.max_views} View{data.max_views > 1 ? 's' : ''} (Burn on Reveal)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400 uppercase font-mono flex items-center gap-1.5 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Encryption
          </div>
          <div className="text-xs font-bold text-emerald-400">
            AES-256-GCM
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400 uppercase font-mono flex items-center gap-1.5 mb-1">
            <Share2 className="w-3.5 h-3.5 text-purple-400" />
            Secret Type
          </div>
          <div className="text-xs font-bold text-purple-300 truncate">
            {data.secret_type}
          </div>
        </div>
      </div>

      {/* Share Actions Grid */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300">
          Instant Share Options (Sends Public Link — Never Sends Plaintext)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setShowQrModal(true)}
            className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 flex items-center justify-center gap-2 transition-colors"
          >
            <QrCode className="w-4 h-4 text-cyan-400" />
            <span>QR Code</span>
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="p-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-xs font-medium text-emerald-300 flex items-center justify-center gap-2 transition-colors"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp Share</span>
          </button>
          <button
            onClick={handleShareEmail}
            className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 flex items-center justify-center gap-2 transition-colors"
          >
            <Mail className="w-4 h-4 text-sky-400" />
            <span>Email Link</span>
          </button>
          <button
            onClick={handleGenericShare}
            className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 flex items-center justify-center gap-2 transition-colors"
          >
            <Share2 className="w-4 h-4 text-purple-400" />
            <span>System Share</span>
          </button>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          onClick={onReset}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <PlusCircle className="w-4 h-4 text-cyan-400" />
          Create Another Secret
        </button>

        <button
          onClick={() => onNavigateToView(data.id)}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all"
        >
          <span>Open Safe Landing Page</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="p-6 rounded-2xl bg-slate-900 border border-cyan-500/40 max-w-sm w-full text-center space-y-4">
            <h3 className="text-base font-bold text-white">Scan Secret QR Code</h3>
            <p className="text-xs text-slate-400">
              Scan with your phone camera to open the public link on mobile.
            </p>
            {qrDataUrl && (
              <div className="p-4 bg-slate-950 rounded-xl inline-block border border-slate-800">
                <img src={qrDataUrl} alt="Secret QR Code" className="w-56 h-56 mx-auto rounded-lg" />
              </div>
            )}
            <div className="text-[11px] font-mono text-cyan-300 truncate max-w-xs mx-auto">
              {currentShareUrl}
            </div>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
