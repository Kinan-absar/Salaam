import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { auth, googleProvider } from '@/firebase/config';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign in with Google');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const isRtl = i18n.language === 'ar';

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <Card className="w-full max-w-sm border-none shadow-2xl bg-white/90 backdrop-blur-lg rounded-[2.5rem] p-6 overflow-hidden">
        <CardHeader className="space-y-4 pb-10 text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-primary/20 transform rotate-3 hover:rotate-0 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <CardTitle className="text-3xl font-black tracking-tight text-slate-800">{t('login')}</CardTitle>
            <CardDescription className="font-bold italic text-slate-400 opacity-80 mt-1">{t('slogan')}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-8">
          <Button variant="outline" onClick={handleGoogleLogin} className={`flex items-center gap-4 h-14 rounded-2xl border-slate-100 bg-white font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:-translate-y-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {isRtl ? 'تسجيل الدخول باستخدام جوجل' : 'Sign in with Google'}
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-white px-4 text-slate-300 italic">{isRtl ? 'أو' : 'Or'}</span></div>
          </div>
          <form onSubmit={handleEmailLogin} className="grid gap-5">
            <div className="grid gap-2">
              <Input id="email" placeholder={isRtl ? 'البريد الإلكتروني' : 'email@example.com'} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} className={`h-14 rounded-2xl border-slate-100 bg-white shadow-inner focus-visible:ring-primary font-medium ${isRtl ? 'text-right' : 'text-left'}`} />
            </div>
            <div className="grid gap-2">
              <Input id="password" placeholder={isRtl ? 'كلمة المرور' : '••••••••'} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} className={`h-14 rounded-2xl border-slate-100 bg-white shadow-inner focus-visible:ring-primary font-medium ${isRtl ? 'text-right' : 'text-left'}`} />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs bg-primary shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 active:scale-95">
              {loading ? (isRtl ? 'جاري الدخول...' : 'Signing in...') : t('login')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 mt-6">
          <p className="text-sm text-center text-slate-400 font-medium italic">
            {isRtl ? (
              <>ليس لديك حساب؟ <Link to="/signup" className="text-primary hover:underline font-black not-italic">اشترك الآن</Link></>
            ) : (
              <>Don't have an account? <Link to="/signup" className="text-primary hover:underline font-black not-italic">Sign up</Link></>
            )}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
