import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '@/firebase/AuthContext';
import { auth } from '@/firebase/config';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Globe, LogOut, User as UserIcon, Bell, Mountain } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, profile } = useAuth();
  const isRtl = i18n.language === 'ar';

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en');
  };

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-indigo-glow transform rotate-3">
              <Mountain className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-slate-800 leading-tight">
                {t('app_name')}
              </span>
              <span className="text-[9px] font-black text-primary italic leading-none tracking-[0.2em]">
                {isRtl ? 'السويداء' : 'SWEIDA'}
              </span>
            </div>
          </Link>
        </div>

        <div className={`flex items-center gap-2 sm:gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleLanguage} 
            className="rounded-full hover:bg-primary/5 text-[10px] font-black uppercase tracking-widest gap-2 h-10 px-4"
          >
            <Globe className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">{isRtl ? 'EN' : 'AR'}</span>
          </Button>

          {user ? (
            <div className={`flex items-center gap-2 sm:gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <Button variant="ghost" size="icon" asChild className="rounded-full w-10 h-10 hover:bg-primary/5 text-slate-500">
                <Link to="/notifications">
                  <Bell className="h-5 w-5" />
                </Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-11 w-11 rounded-full border-2 border-white shadow-xl overflow-hidden p-0 ring-4 ring-primary/5">
                    <Avatar className="h-full w-full rounded-full">
                      <AvatarImage src={profile?.avatar || user.photoURL || undefined} alt={user.displayName || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary font-black">{ (user.displayName || user.email || 'U').charAt(0).toUpperCase() }</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRtl ? 'start' : 'end'} className="rounded-2xl p-2 border-slate-100 shadow-2xl">
                  <DropdownMenuItem asChild className="rounded-xl h-11 cursor-pointer">
                    <Link to="/profile" className={`flex w-full items-center font-black text-[10px] uppercase tracking-widest ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                      <UserIcon className={`${isRtl ? 'ml-3' : 'mr-3'} h-4 w-4`} />
                      <span>{t('profile')}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className={`rounded-xl h-11 text-destructive hover:bg-destructive/5 font-black text-[10px] uppercase tracking-widest cursor-pointer mt-1 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                    <LogOut className={`${isRtl ? 'ml-3' : 'mr-3'} h-4 w-4`} />
                    <span>{t('logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className={`flex items-center gap-2 sm:gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <Button variant="ghost" asChild className="font-black text-[10px] uppercase tracking-widest h-10 px-6 rounded-full hidden sm:flex">
                <Link to="/login">{t('login')}</Link>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/90 font-black text-[10px] uppercase tracking-widest h-10 px-8 rounded-full shadow-lg shadow-primary/20 transition-all hover:-translate-y-1">
                <Link to="/signup">{t('signup')}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
