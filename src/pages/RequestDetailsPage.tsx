import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { db, serverTimestamp } from '@/firebase/config';
import { doc, getDoc, collection, addDoc, onSnapshot, query, orderBy, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import { HelpRequest, HelpOffer, UserProfile, RequestStatus, HelpCategory } from '@/types';
import { useAuth } from '@/firebase/AuthContext';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Send, CheckCircle2, MessageCircle, Heart, ShieldAlert, ArrowLeft } from 'lucide-react';

export const RequestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [author, setAuthor] = useState<UserProfile | null>(null);
  const [offers, setOffers] = useState<HelpOffer[]>([]);
  const [offerMessage, setOfferMessage] = useState('');
  const [offerType, setOfferType] = useState<HelpCategory>(HelpCategory.GOODS);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchRequest = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'requests', id));
        if (docSnap.exists()) {
          const reqData = { id: docSnap.id, ...docSnap.data() } as HelpRequest;
          setRequest(reqData);
          
          if (!reqData.anonymous) {
            try {
              const userSnap = await getDoc(doc(db, 'users', reqData.authorUid));
              if (userSnap.exists()) setAuthor(userSnap.data() as UserProfile);
            } catch (error) {
              handleFirestoreError(error, OperationType.GET, `users/${reqData.authorUid}`);
            }
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `requests/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();

    const q = query(collection(db, `requests/${id}/offers`), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOffers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HelpOffer)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `requests/${id}/offers`);
    });

    return () => unsubscribe();
  }, [id]);

  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, `requests/${id}/offers`), {
        requestId: id,
        requestAuthorUid: request.authorUid,
        volunteerUid: user.uid,
        message: offerMessage,
        type: offerType,
        createdAt: serverTimestamp(),
      });
      setOfferMessage('');
      toast.success('Your offer has been sent to the requester!');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `requests/${id}/offers`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async () => {
    if (!id || !request) return;
    try {
      await updateDoc(doc(db, 'requests', id), { status: RequestStatus.RESOLVED });
      toast.success('Thank you! This request is now marked as resolved.');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `requests/${id}`);
    }
  };

  const isRtl = i18n.language === 'ar';

  if (loading) return <div className="flex justify-center py-20 animate-pulse font-black italic text-slate-400">{isRtl ? 'جاري التحميل...' : 'Loading...'}</div>;
  if (!request) return <div className="text-center py-20 italic font-bold text-slate-400">{isRtl ? 'الطلب غير موجود.' : 'Request not found.'}</div>;

  const isAuthor = user?.uid === request.authorUid;

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-12 px-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <Button variant="ghost" size="sm" asChild className="hover:bg-transparent -ml-2">
        <Link to="/" className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-primary transition-colors">
          <ArrowLeft className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
          {t('feed')}
        </Link>
      </Button>

      <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-lg rounded-[2.5rem] overflow-hidden">
        <CardHeader className="space-y-6 p-8">
          <div className="flex items-center justify-between">
            <Badge variant={request.status === RequestStatus.OPEN ? 'default' : 'secondary'} className="font-black uppercase text-[10px] tracking-widest h-7 px-4 rounded-full">
              {t(request.status)}
            </Badge>
            {request.urgent && <Badge variant="destructive" className="font-black uppercase text-[10px] tracking-widest h-7 px-4 rounded-full animate-pulse">{t('urgent')}</Badge>}
          </div>
          <CardTitle className="text-4xl font-black tracking-tight leading-tight text-slate-800">{request.title}</CardTitle>
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
            <Avatar className="h-12 w-12 border-2 border-white shadow-sm overflow-hidden p-0">
              <AvatarImage src={author?.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary font-black">
                {request.anonymous ? '?' : (author?.name || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-black text-slate-800">{request.anonymous ? (isRtl ? 'مجهول' : 'Anonymous') : (author?.name || 'User')}</span>
              <span className="text-xs text-slate-400 font-bold italic">{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="prose dark:prose-invert max-w-none text-slate-700 leading-relaxed font-medium">
            {request.body}
          </div>
        </CardContent>
        {isAuthor && request.status === RequestStatus.OPEN && (
          <CardFooter className="bg-primary/5 p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1 text-center sm:text-start">
              <span className="text-primary font-black block mb-1 uppercase tracking-tight">
                {isRtl ? 'هل تم حل المشكلة؟' : 'Has your problem been solved?'}
              </span>
              <p className="text-xs text-slate-500 font-medium italic">
                {isRtl ? 'ضع علامة "تم الحل" لإعلام المتطوعين بأنك بخير.' : 'Mark as resolved to let volunteers know you\'re okay.'}
              </p>
            </div>
            <Button onClick={handleResolve} className="bg-primary hover:bg-primary/90 font-black h-14 px-10 rounded-full shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 active:scale-95">
              <CheckCircle2 className={`${isRtl ? 'ml-2' : 'mr-2'} h-5 w-5`} />
              {t('resolved')}
            </Button>
          </CardFooter>
        )}
      </Card>

      {!isAuthor && request.status === RequestStatus.OPEN && (
        <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-lg rounded-[2.5rem] overflow-hidden border-t-4 border-primary/20">
          <CardHeader className="p-8">
            <CardTitle className="flex items-center gap-3 font-black text-2xl text-slate-800">
              <Heart className="h-6 w-6 text-primary fill-primary/20" />
              {t('offer_help')}
            </CardTitle>
            <CardDescription className="italic font-medium text-slate-500">
              {isRtl ? 'رسالتك ستكون مرئية لك ولصاحب الطلب فقط.' : 'Your message will only be visible to you and the requester.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-6">
            <form onSubmit={handleOfferSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label className="font-black uppercase text-[10px] tracking-widest text-primary/70">
                  {isRtl ? 'نوع المساعدة' : 'Type of Help'}
                </Label>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {['money', 'goods', 'skills'].map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={offerType === type ? 'default' : 'outline'}
                      size="sm"
                      className={`h-11 rounded-xl px-6 text-[10px] font-black uppercase tracking-widest transition-all ${
                        offerType === type 
                          ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                          : 'border-slate-100 text-slate-500 hover:border-primary/30'
                      }`}
                      onClick={() => setOfferType(type as HelpCategory)}
                    >
                      {t(`categories.${type}`)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Label className="font-black uppercase text-[10px] tracking-widest text-primary/70">
                  {isRtl ? 'رسالتك' : 'Your Message'}
                </Label>
                <Textarea 
                  placeholder={t('placeholders.offer_message')} 
                  value={offerMessage} 
                  onChange={(e) => setOfferMessage(e.target.value)} 
                  required 
                  className={`bg-slate-50/50 border-slate-100 min-h-[140px] rounded-2xl p-4 focus-visible:ring-primary font-medium resize-none ${isRtl ? 'text-right' : 'text-left'}`}
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full font-black h-14 rounded-2xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:-translate-y-1 active:scale-95">
                {submitting ? '...' : t('offer_help')}
                <Send className={`${isRtl ? 'mr-2 rotate-180' : 'ml-2'} h-5 w-5`} />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6 pt-4">
        <h2 className="text-2xl font-black flex items-center gap-3 px-2 text-slate-800">
          <MessageCircle className="h-6 w-6 text-primary" />
          {offers.length} {isRtl ? 'عرض' : (offers.length === 1 ? 'Offer' : 'Offers')}
        </h2>
        {offers.length > 0 ? (
          <div className="space-y-4">
            {offers.map(offer => (
              <Card key={offer.id} className="border-none shadow-lg bg-white/60 backdrop-blur rounded-3xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary px-3 rounded-full">{t(`categories.${offer.type}`)}</Badge>
                    <span className="text-[10px] text-slate-400 font-bold italic">{formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true })}</span>
                  </div>
                  <p className="text-slate-700 font-medium leading-relaxed italic border-l-4 border-primary/20 pl-4 py-1">{offer.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 font-bold italic flex flex-col items-center gap-4 bg-white/40 rounded-[2.5rem] border-2 border-dashed border-slate-100">
            <Heart className="h-12 w-12 opacity-10" />
            {isRtl ? 'لا توجد عروض بعد. كن أول من يساعد!' : 'No offers yet. Be the first to help!'}
          </div>
        )}
      </div>
    </div>
  );
};
