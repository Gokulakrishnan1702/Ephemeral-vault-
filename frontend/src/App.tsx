import React, { useState, useEffect } from 'react';
import { Menu, Lock, PlusCircle } from 'lucide-react';
import { ToastProvider } from './context/ToastContext.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Sidebar } from './components/Sidebar.js';
import { Footer } from './components/Footer.js';

// Pages
import { HomePage } from './pages/HomePage.js';
import { CreateSecretPage } from './pages/CreateSecretPage.js';
import { SecretCreatedPage } from './pages/SecretCreatedPage.js';
import { ViewSecretPage } from './pages/ViewSecretPage.js';
import { MySecretsPage } from './pages/MySecretsPage.js';
import { SecurityCenterPage } from './pages/SecurityCenterPage.js';
import { CliHelperPage } from './pages/CliHelperPage.js';
import { DocumentationPage } from './pages/DocumentationPage.js';
import { ArchitecturePage } from './pages/ArchitecturePage.js';
import { LoginPage } from './pages/LoginPage.js';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { AboutPage } from './pages/AboutPage.js';

const getInitialRoute = () => {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  if (path.startsWith('/view/')) {
    const id = path.replace('/view/', '').trim();
    return { view: 'view-secret', id };
  }
  if (path === '/create') return { view: 'create', id: '' };
  if (path === '/my-secrets' || path === '/dashboard') return { view: 'my-secrets', id: '' };
  if (path === '/security' || path === '/security-test') return { view: 'security', id: '' };
  if (path === '/cli') return { view: 'cli', id: '' };
  if (path === '/docs') return { view: 'docs', id: '' };
  if (path === '/architecture') return { view: 'architecture', id: '' };
  if (path === '/login') return { view: 'login', id: '' };
  if (path === '/signup') return { view: 'signup', id: '' };
  if (path === '/forgot-password') return { view: 'forgot-password', id: '' };
  if (path === '/settings') return { view: 'settings', id: '' };
  if (path === '/about') return { view: 'about', id: '' };
  return { view: 'home', id: '' };
};

export const AppContent: React.FC = () => {
  const initial = getInitialRoute();
  const [currentView, setCurrentView] = useState<string>(initial.view);
  const [viewSecretId, setViewSecretId] = useState<string>(initial.id);
  const [createdSecretData, setCreatedSecretData] = useState<any>(null);
  const [returnUrl, setReturnUrl] = useState<string>('home');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const { user, loading: authLoading } = useAuth();

  // Parse path on initial load & handle browser navigation
  useEffect(() => {
    const handleLocation = () => {
      const path = window.location.pathname;
      if (path.startsWith('/view/')) {
        const id = path.replace('/view/', '').trim();
        if (id) {
          setViewSecretId(id);
          setCurrentView('view-secret');
          return;
        }
      } else if (path === '/create') {
        setCurrentView('create');
      } else if (path === '/my-secrets' || path === '/dashboard') {
        setCurrentView('my-secrets');
      } else if (path === '/security' || path === '/security-test') {
        setCurrentView('security');
      } else if (path === '/cli') {
        setCurrentView('cli');
      } else if (path === '/docs') {
        setCurrentView('docs');
      } else if (path === '/architecture') {
        setCurrentView('architecture');
      } else if (path === '/login') {
        setCurrentView('login');
      } else if (path === '/signup') {
        setCurrentView('signup');
      } else if (path === '/forgot-password') {
        setCurrentView('forgot-password');
      } else if (path === '/settings') {
        setCurrentView('settings');
      } else if (path === '/about') {
        setCurrentView('about');
      } else {
        setCurrentView('home');
      }
    };

    handleLocation();
    window.addEventListener('popstate', handleLocation);
    return () => window.removeEventListener('popstate', handleLocation);
  }, []);

  // Check if a view is publicly accessible without prior authentication
  const isPublicView = (view: string) => {
    return (
      view === 'view-secret' ||
      view === 'login' ||
      view === 'signup' ||
      view === 'forgot-password'
    );
  };

  // Route protection: gate the app behind login; require auth for all vault tasks/pages
  // Direct secret view links (/view/:id) remain accessible for recipients
  useEffect(() => {
    if (!authLoading) {
      if (!user && !isPublicView(currentView)) {
        setReturnUrl(currentView === 'login' ? 'home' : currentView);
        setCurrentView('login');
        window.history.replaceState({}, '', '/login');
      }
    }
  }, [currentView, user, authLoading]);

  const navigateTo = (view: string, params?: any) => {
    const target = view === 'dashboard' ? 'my-secrets' : view;

    // Route protection check: require login for all vault tasks and pages
    if (!isPublicView(target) && !user && !authLoading) {
      setReturnUrl(target === 'home' ? 'home' : target);
      setCurrentView('login');
      window.history.pushState({}, '', '/login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentView(target);
    if (target === 'home') {
      window.history.pushState({}, '', '/');
    } else if (target === 'view-secret' && params?.id) {
      setViewSecretId(params.id);
      window.history.pushState({}, '', `/view/${params.id}`);
    } else {
      window.history.pushState({}, '', `/${target}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050711] text-cyan-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-slate-400 tracking-wider">INITIALIZING VAULT...</span>
        </div>
      </div>
    );
  }

  // Check if current view is an auth page (login, signup, forgot-password)
  const isAuthView =
    currentView === 'login' ||
    currentView === 'signup' ||
    currentView === 'forgot-password';

  if (isAuthView) {
    return (
      <div className="min-h-screen flex flex-col bg-[#050711] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
        <main className="flex-1">
          {currentView === 'login' && (
            <LoginPage
              initialMode="login"
              onSuccess={() => navigateTo(returnUrl || 'home')}
              onNavigateToForgotPassword={() => navigateTo('forgot-password')}
              onNavigateHome={user ? () => navigateTo('home') : undefined}
            />
          )}

          {currentView === 'signup' && (
            <LoginPage
              initialMode="signup"
              onSuccess={() => navigateTo(returnUrl || 'home')}
              onNavigateToForgotPassword={() => navigateTo('forgot-password')}
              onNavigateHome={user ? () => navigateTo('home') : undefined}
            />
          )}

          {currentView === 'forgot-password' && (
            <ForgotPasswordPage
              onNavigateToLogin={() => navigateTo('login')}
              onNavigateToHome={() => navigateTo('home')}
            />
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#050711] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Left Sidebar Navigation (Desktop Fixed & Mobile Slide-in Drawer) */}
      <Sidebar
        currentView={currentView}
        onNavigate={navigateTo}
        mobileOpen={sidebarOpen}
        setMobileOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 xl:pl-72">
        {/* Mobile Top Header (< lg) */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-[#050711]/90 backdrop-blur-xl border-b border-cyan-500/15">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 px-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-2"
            aria-label="Open navigation menu"
          >
            <Menu className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-medium text-slate-300">Menu</span>
          </button>

          <div
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 p-[1px] flex items-center justify-center">
              <div className="w-full h-full bg-[#070b19] rounded-[7px] flex items-center justify-center">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
              </div>
            </div>
            <span className="font-bold text-sm text-white whitespace-nowrap">Ephemeral Vault</span>
          </div>

          <button
            onClick={() => navigateTo('create')}
            className="p-1.5 px-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold text-xs shadow-glow-cyan flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Secret</span>
          </button>
        </header>

        {/* Primary Page Content */}
        <main className="flex-1">
          {currentView === 'home' && (
            <HomePage onNavigate={navigateTo} />
          )}

          {currentView === 'create' && (
            <CreateSecretPage
              onSuccess={(data) => {
                setCreatedSecretData(data);
                setCurrentView('secret-created');
              }}
            />
          )}

          {currentView === 'secret-created' && createdSecretData && (
            <SecretCreatedPage
              data={createdSecretData}
              onReset={() => navigateTo('create')}
              onNavigateToView={(id) => navigateTo('view-secret', { id })}
            />
          )}

          {currentView === 'view-secret' && (
            <ViewSecretPage
              secretId={viewSecretId}
              onNavigateHome={() => navigateTo('home')}
            />
          )}

          {currentView === 'my-secrets' && (
            <MySecretsPage
              onNavigateToCreate={() => navigateTo('create')}
              onNavigateToView={(id) => navigateTo('view-secret', { id })}
            />
          )}

          {currentView === 'security' && (
            <SecurityCenterPage />
          )}

          {currentView === 'cli' && (
            <CliHelperPage />
          )}

          {currentView === 'docs' && (
            <DocumentationPage />
          )}

          {currentView === 'architecture' && (
            <ArchitecturePage />
          )}

          {currentView === 'settings' && (
            <SettingsPage />
          )}

          {currentView === 'about' && (
            <AboutPage />
          )}
        </main>

        <Footer onNavigate={navigateTo} />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
