import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { auth, db, serverTimestamp } from '@/firebase/config';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export const SignupPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      // Create user profile in Firestore
      try {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: name,
          email: email,
          joinedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      }

      toast.success('Account created successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const isRtl = i18n.language === 'ar';

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <Card className="w-full max-w-sm border-none shadow-2xl bg-white/90 backdrop-blur-lg rounded-[2.5rem] p-6 overflow-hidden">
        <CardHeader className="space-y-4 pb-10 text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-primary/20 transform -rotate-3 hover:rotate-0 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <div>
            <CardTitle className="text-3xl font-black tracking-tight text-slate-800">{t('signup')}</CardTitle>
            <CardDescription className="font-bold italic text-slate-400 opacity-80 mt-1">{t('slogan')}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5">
          <form onSubmit={handleSignup} className="grid gap-5">
            <div className="grid gap-2">
              <Input id="name" placeholder={isRtl ? 'الاسم بالكامل' : 'Full Name'} type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} className={`h-14 rounded-2xl border-slate-100 bg-white shadow-inner focus-visible:ring-primary font-medium ${isRtl ? 'text-right' : 'text-left'}`} />
            </div>
            <div className="grid gap-2">
              <Input id="email" placeholder={isRtl ? 'البريد الإلكتروني' : 'email@example.com'} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} className={`h-14 rounded-2xl border-slate-100 bg-white shadow-inner focus-visible:ring-primary font-medium ${isRtl ? 'text-right' : 'text-left'}`} />
            </div>
            <div className="grid gap-2">
              <Input id="password" placeholder={isRtl ? 'كلمة المرور' : '••••••••'} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} className={`h-14 rounded-2xl border-slate-100 bg-white shadow-inner focus-visible:ring-primary font-medium ${isRtl ? 'text-right' : 'text-left'}`} />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs bg-primary shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 active:scale-95 mt-2">
              {loading ? (isRtl ? 'جاري إنشاء الحساب...' : 'Creating account...') : t('signup')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 mt-6">
          <p className="text-sm text-center text-slate-400 font-medium italic">
            {isRtl ? (
              <>لديك حساب بالفعل؟ <Link to="/login" className="text-primary hover:underline font-black not-italic">تسجيل الدخول</Link></>
            ) : (
              <>Already have an account? <Link to="/login" className="text-primary hover:underline font-black not-italic">Log in</Link></>
            )}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
