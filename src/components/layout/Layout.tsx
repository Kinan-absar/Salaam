import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from './Navbar';
import { Toaster } from '@/components/ui/sonner';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      <Navbar />
      <main className="container mx-auto px-6 py-8 max-w-6xl">
        {children}
      </main>
      <Toaster />
    </div>
  );
};
