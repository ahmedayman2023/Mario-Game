import React from 'react';
import { Toaster } from "@/src/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/src/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const RouteAny = Route as any;

import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/src/lib/AuthContext';
import UserNotRegisteredError from '@/src/components/UserNotRegisteredError';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? (Pages as any)[mainPageKey] : () => <></>;

const LayoutWrapper = ({ children, currentPageName }: { children: React.ReactNode, currentPageName: string }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { user, isLoadingAuth, login } = useAuth();

  if (isLoadingAuth) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">جاري التحميل...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
        <h1 className="text-4xl font-black mb-6 text-broadcast-yellow">وقود المباراة</h1>
        <p className="text-slate-400 mb-8 text-center max-w-md">سجل دخولك لحفظ بياناتك ومتابعة تكتيكات الطاقة الخاصة بك.</p>
        <button 
          onClick={login}
          className="bg-mario-emerald text-black px-8 py-3 rounded-xl font-bold hover:bg-emerald-400 transition-colors"
        >
          تسجيل الدخول باستخدام Google
        </button>
      </div>
    );
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => {
        const PageComponent = Page as any;
        return (
          <RouteAny
            key={path}
            path={`/${path}`}
            element={
              <LayoutWrapper currentPageName={path}>
                <PageComponent />
              </LayoutWrapper>
            }
          />
        );
      })}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
