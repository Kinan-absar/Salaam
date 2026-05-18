import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/firebase/AuthContext';
import { db } from '@/firebase/config';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import { HelpRequest, UserProfile } from '@/types';
import { HelpRequestCard } from '@/components/features/HelpRequestCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { User, MapPin, Calendar, Edit3, Save, X, Settings } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, profile, refreshProfile } = useAuth();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    setEditName(profile?.name || user.displayName || '');
    setEditBio(profile?.bio || '');
    setEditLocation(profile?.location || '');

    const q = query(
      collection(db, 'requests'),
      where('authorUid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HelpRequest)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'requests');
    });

    return () => unsubscribe();
  }, [user, profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: editName,
        bio: editBio,
        location: editLocation
      });
      await refreshProfile();
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setSaving(false);
    }
  };

  const isRtl = i18n.language === 'ar';

  if (!user) return <div className="text-center py-20 italic font-bold text-slate-400">Please log in to view your profile.</div>;

  return (
    <div className="space-y-12 pb-12 px-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="relative">
        <div className="h-40 w-full rounded-[2.5rem] bg-linear-to-r from-primary/20 to-primary/5 border border-primary/10 overflow-hidden shadow-inner">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
        </div>
        <div className={`absolute -bottom-8 ${isRtl ? 'right-8' : 'left-8'} flex items-end gap-6`}>
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 border-white shadow-[0_15px_30px_-10px_rgba(85,107,47,0.4)] rounded-[2rem] overflow-hidden p-0">
              <AvatarImage src={profile?.avatar || user.photoURL || undefined} />
              <AvatarFallback className="bg-primary text-white text-4xl font-black">
                {(profile?.name || user.displayName || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 p-2 bg-white rounded-xl shadow-lg border border-slate-100 ${isRtl ? 'left-auto right-[-10px]' : 'right-auto left-[-10px] hidden'}`}>
               {/* This is a placeholder for an olive branch icon or similar decoration if needed */}
            </div>
          </div>
          <div className="mb-4 space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-800">{profile?.name || user.displayName}</h1>
            <p className="text-sm text-slate-400 font-bold italic opacity-80">{user.email}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsEditing(true)} 
          className={`absolute bottom-[-2rem] ${isRtl ? 'left-8' : 'right-8'} font-black uppercase text-[10px] tracking-widest gap-2 h-11 rounded-full px-6 border-slate-100 bg-white shadow-xl hover:-translate-y-1 transition-all`}
        >
          <Edit3 className="h-4 w-4" />
          {t('edit_profile')}
        </Button>
      </div>

      <div className="grid gap-12 md:grid-cols-3 pt-8">
        <div className="space-y-8 md:col-span-1">
          <Card className="border-none bg-white/60 backdrop-blur shadow-2xl rounded-[2rem] overflow-hidden border-t-4 border-primary/20">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
                {t('about_me')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8 pt-0">
              {isEditing ? (
                <div className="space-y-4">
                  <Input placeholder={t('full_name')} value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-white rounded-xl h-12 font-medium" />
                  <Input placeholder={t('location')} value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="bg-white rounded-xl h-12 font-medium" />
                  <Textarea placeholder={t('bio')} value={editBio} onChange={(e) => setEditBio(e.target.value)} className="bg-white rounded-xl min-h-[120px] font-medium resize-none" />
                  <div className="flex gap-3 pt-2">
                    <Button onClick={handleSave} disabled={saving} className="flex-1 font-black rounded-xl h-12 bg-primary shadow-lg shadow-primary/20 uppercase text-[10px] tracking-widest">
                      <Save className={`${isRtl ? 'ml-2' : 'mr-2'} h-4 w-4`} /> {t('save')}
                    </Button>
                    <Button onClick={() => setIsEditing(false)} variant="ghost" className="font-black rounded-xl h-12 w-12 p-0 text-slate-400">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-slate-600 leading-relaxed italic font-medium">"{profile?.bio || (isRtl ? 'لا يوجد نبذة بعد.' : 'No bio provided yet.')}"</p>
                  <div className="flex flex-col gap-3 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-bold">
                      <MapPin className="h-4 w-4 text-primary" />
                      {profile?.location || (isRtl ? 'الأرض' : 'Earth')}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-bold">
                      <Calendar className="h-4 w-4 text-primary" />
                      {t('joined')} {new Date(profile?.joinedAt || user.metadata.creationTime || '').toLocaleDateString()}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8 md:col-span-2">
          <h2 className={`text-2xl font-black tracking-tight text-slate-800 flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
            {t('my_requests')}
            <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-black">{requests.length}</span>
          </h2>
          <div className="grid gap-6">
            {requests.length > 0 ? (
              requests.map(req => (
                <HelpRequestCard key={req.id} request={req} authorName={profile?.name} authorAvatar={profile?.avatar} />
              ))
            ) : (
              <div className="py-24 text-center text-slate-400 font-bold italic border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center gap-4 bg-white/30 backdrop-blur">
                <Settings className="h-12 w-12 opacity-10" />
                {isRtl ? 'لم تقم بنشر أي طلبات مساعدة بعد.' : 'You haven\'t posted any help requests yet.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
