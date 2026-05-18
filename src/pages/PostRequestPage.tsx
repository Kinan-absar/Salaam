import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db, serverTimestamp } from '@/firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import { useAuth } from '@/firebase/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { HelpCategory, RequestStatus } from '@/types';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';

export const PostRequestPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<HelpCategory>(HelpCategory.OTHER);
  const [anonymous, setAnonymous] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'requests'), {
        authorUid: user.uid,
        title,
        body,
        category,
        anonymous,
        urgent,
        status: RequestStatus.OPEN,
        createdAt: serverTimestamp(),
      });
      toast.success('Help request posted successfully');
      navigate('/');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'requests');
    } finally {
      setLoading(false);
    }
  };

  const isRtl = i18n.language === 'ar';

  return (
    <div className="max-w-2xl mx-auto space-y-8 px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-black tracking-tight text-slate-800">{t('post_request')}</h1>
        <p className="text-slate-500 font-medium italic opacity-80">
          {isRtl ? 'كن واضحاً فيما تحتاجه. مجتمعنا هنا لأجلك.' : 'Be clear about what you need. Our community is here for you.'}
        </p>
      </div>

      <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-lg rounded-[2.5rem] overflow-hidden">
        <form onSubmit={handleSubmit}>
          <CardHeader className="bg-primary/5 pb-8">
            <CardTitle className="flex items-center justify-between font-black text-xl text-slate-800">
              {t('help_needed')}
            </CardTitle>
            <CardDescription className="italic font-medium text-slate-500">
              {isRtl ? 'اختر الفئة المناسبة لمساعدة المتطوعين في العثور عليك.' : 'Choose the right category to help volunteers find you.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-black uppercase text-[10px] tracking-widest text-primary/70">
                {t('title')}
              </Label>
              <Input 
                id="title" 
                placeholder={t('placeholders.request_title')} 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
                className={`h-12 border-slate-100 bg-slate-50/50 rounded-2xl focus-visible:ring-primary font-medium ${isRtl ? 'text-right' : 'text-left'}`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body" className="font-black uppercase text-[10px] tracking-widest text-primary/70">
                {t('description')}
              </Label>
              <Textarea 
                id="body" 
                placeholder={t('placeholders.request_body')} 
                value={body} 
                onChange={(e) => setBody(e.target.value)} 
                required 
                className={`min-h-[160px] border-slate-100 bg-slate-50/50 rounded-2xl focus-visible:ring-primary resize-none p-4 font-medium ${isRtl ? 'text-right' : 'text-left'}`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="font-black uppercase text-[10px] tracking-widest text-primary/70">
                  {isRtl ? 'الفئة' : 'Category'}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(HelpCategory).map((cat) => (
                    <Button
                      key={cat}
                      type="button"
                      variant={category === cat ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCategory(cat)}
                      className={`h-10 rounded-xl px-4 text-[10px] font-black uppercase tracking-wider transition-all ${
                        category === cat 
                          ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                          : 'border-slate-100 text-slate-500 hover:border-primary/30 hover:text-primary'
                      }`}
                    >
                      {t(`categories.${cat}`)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-black text-slate-800 tracking-tight">{t('anonymous')}</Label>
                    <p className="text-[10px] text-slate-500 font-medium italic">
                      {isRtl ? 'إخفاء ملفك الشخصي عن العلن' : 'Hide your profile from public view'}
                    </p>
                  </div>
                  <Switch checked={anonymous} onCheckedChange={setAnonymous} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-black text-slate-800 tracking-tight">{t('urgent')}</Label>
                    <p className="text-[10px] text-slate-500 font-medium italic">
                      {isRtl ? 'تمييز طلبك كأولوية قصوى' : 'Highlight your request for faster help'}
                    </p>
                  </div>
                  <Switch checked={urgent} onCheckedChange={setUrgent} className="data-[state=checked]:bg-destructive" />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-8 pt-0">
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-xs bg-primary shadow-xl shadow-primary/20 hover:-translate-y-1 active:scale-95 transition-all group"
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Send className={`h-5 w-5 ${isRtl ? 'ml-2 rotate-180 transition-transform group-hover:-translate-x-1' : 'mr-2 transition-transform group-hover:translate-x-1'}`} />
              )}
              {t('post_request')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
