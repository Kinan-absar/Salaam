import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/firebase/AuthContext';
import { db } from '@/firebase/config';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import { Notification } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { formatDistanceToNow } from 'date-fns';
import { Bell, BellOff, Check, Heart, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export const NotificationsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, `users/${user.uid}/notifications`),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/notifications`);
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (id: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, `users/${user.uid}/notifications`, id), { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/notifications/${id}`);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const unread = notifications.filter(n => !n.read);
    try {
      await Promise.all(unread.map(n => markAsRead(n.id)));
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  const isRtl = i18n.language === 'ar';

  if (loading) return <div className="text-center py-24 italic font-black text-slate-400 animate-pulse">Checking for updates...</div>;

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_offer': return <Heart className="h-6 w-6 text-primary fill-primary/20" />;
      case 'request_resolved': return <Check className="h-6 w-6 text-emerald-500" />;
      default: return <Bell className="h-6 w-6 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto pb-12 px-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-800">{t('notifications')}</h1>
          <p className="text-slate-500 font-medium italic opacity-80">
            {t('notifications_desc')}
          </p>
        </div>
        {notifications.some(n => !n.read) && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead} className="font-black text-[10px] uppercase tracking-widest gap-2 bg-white border border-slate-100 h-10 rounded-full px-6 shadow-xl transition-all hover:-translate-y-1">
            <Check className="h-4 w-4" />
            {t('mark_all_read')}
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <Card 
              key={notification.id} 
              className={`border-none transition-all duration-300 cursor-pointer overflow-hidden rounded-3xl shadow-sm ${notification.read ? 'bg-white opacity-60 grayscale-[0.5]' : 'bg-white shadow-xl shadow-primary/5 hover:translate-x-1'}`}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <CardContent className={`flex items-center gap-5 p-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className={`p-3 rounded-2xl ${notification.read ? 'bg-slate-50' : 'bg-primary/5 shadow-inner'}`}>
                  {getIcon(notification.type)}
                </div>
                <div className={`flex-1 space-y-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                  <p className={`text-sm leading-snug text-slate-700 ${notification.read ? 'font-medium' : 'font-black'}`}>
                    {notification.data?.message || (isRtl ? 'تلقيت تنبيهاً جديداً' : 'New notification received')}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold italic opacity-80">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!notification.read && <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(85,107,47,0.8)]" />}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-32 text-center text-slate-400 font-black italic flex flex-col items-center gap-6 border-4 border-dashed border-slate-100 rounded-[2.5rem] opacity-30 shadow-inner">
            <BellOff className="h-16 w-16" />
            {t('no_notifications')}
          </div>
        )}
      </div>
    </div>
  );
};
