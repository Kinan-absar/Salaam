import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, query, orderBy, onSnapshot, getDoc, doc, getCountFromServer, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import { HelpRequest, UserProfile, RequestStatus } from '@/types';
import { HelpRequestCard } from '@/components/features/HelpRequestCard';
import { useAuth } from '@/firebase/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const FeedPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [authors, setAuthors] = useState<Record<string, UserProfile>>({});
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  // Stats
  const [resolvedCount, setResolvedCount] = useState<number | string>('...');
  const [membersCount, setMembersCount] = useState<number | string>('...');
  const [impactCount, setImpactCount] = useState<number | string>('...');

  useEffect(() => {
    const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HelpRequest));
      setRequests(docs);
      setLoading(false);

      // Update stats based on local snapshot for better UX
      const resolved = docs.filter(r => r.status === RequestStatus.RESOLVED).length;
      setResolvedCount(resolved);

      // Fetch authors for non-anonymous requests
      docs.forEach(async (req) => {
        if (!req.anonymous && !authors[req.authorUid]) {
          try {
            const userDoc = await getDoc(doc(db, 'users', req.authorUid));
            if (userDoc.exists()) {
              setAuthors(prev => ({ ...prev, [req.authorUid]: userDoc.data() as UserProfile }));
            }
          } catch (error) {
            handleFirestoreError(error, OperationType.GET, `users/${req.authorUid}`);
          }
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'requests');
    });

    // Fetch members and impact counts
    const fetchStats = async () => {
      try {
        const statsPromises = [];
        
        // Impact count (total requests) - Publicly available
        statsPromises.push(getCountFromServer(collection(db, 'requests')));
        
        // Members count - Requires authentication
        if (user) {
          statsPromises.push(getCountFromServer(collection(db, 'users')));
        } else {
          setMembersCount('...');
        }

        const results = await Promise.all(statsPromises);
        setImpactCount(results[0].data().count);
        
        if (user && results[1]) {
          setMembersCount(results[1].data().count);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();

    return () => unsubscribe();
  }, [user]);

  const filteredRequests = requests.filter(req => {
    const matchesFilter = filter === 'all' || req.category === filter;
    const matchesSearch = req.title.toLowerCase().includes(search.toLowerCase()) || 
                          req.body.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const isRtl = i18n.language === 'ar';

  return (
    <div className="space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <div className="relative h-64 sm:h-80 rounded-[2.5rem] overflow-hidden shadow-2xl mb-12">
        <img 
          src="/src/assets/images/sweida_mountains_olives_hero_1779101608779.png" 
          alt="Sweida Mountains" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Sweida District</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none">
                {isRtl ? 'سلام' : 'Salaam'}
              </h1>
              <p className="text-lg sm:text-xl text-slate-200 font-medium italic opacity-90">
                {t('slogan')}
              </p>
            </div>
            <Button asChild className="bg-white hover:bg-slate-100 text-slate-900 rounded-full px-8 h-14 text-sm font-black uppercase tracking-widest shadow-xl transition-all hover:-translate-y-1 active:scale-95 shrink-0 mt-6 sm:mt-0">
              <Link to="/post">
                <Plus className={`${isRtl ? 'ml-2' : 'mr-2'} h-5 w-5`} />
                {t('post_request')}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-6 text-slate-700">
          <div className={`flex flex-col gap-4 sm:flex-row sm:items-center justify-between ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
            <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
              <TabsList className="bg-white border border-slate-200 p-1 h-12 rounded-full shadow-sm">
                <TabsTrigger value="all" className="rounded-full px-6 text-[10px] font-black uppercase transition-all data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap">{isRtl ? 'الكل' : 'All'}</TabsTrigger>
                <TabsTrigger value="money" className="rounded-full px-6 text-[10px] font-black uppercase transition-all data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap">{t('categories.money')}</TabsTrigger>
                <TabsTrigger value="goods" className="rounded-full px-6 text-[10px] font-black uppercase transition-all data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap">{t('categories.goods')}</TabsTrigger>
                <TabsTrigger value="skills" className="rounded-full px-6 text-[10px] font-black uppercase transition-all data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap">{t('categories.skills')}</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative shrink-0 w-full sm:w-64">
              <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400`} />
              <Input 
                placeholder={t('placeholders.search')} 
                className={`${isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4'} h-12 border-slate-200 rounded-full bg-white w-full focus-visible:ring-primary shadow-sm font-medium`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-5">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-40 rounded-2xl bg-white border border-slate-100 animate-pulse" />
              ))
            ) : filteredRequests.length > 0 ? (
              filteredRequests.map(req => (
                <HelpRequestCard 
                  key={req.id} 
                  request={req} 
                  authorName={authors[req.authorUid]?.name}
                  authorAvatar={authors[req.authorUid]?.avatar}
                />
              ))
            ) : (
              <div className="py-20 text-center text-slate-400 font-medium italic bg-white rounded-3xl border-2 border-dashed border-slate-100">
                No active help requests found.
              </div>
            )}
          </div>
        </div>

    <div className={`hidden lg:col-span-4 lg:block space-y-8 ${isRtl ? 'order-first' : ''}`}>
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl border-4 border-primary/20">
            <div className="relative z-10">
              <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                {t('spirit_of_sweida')}
              </p>
              <h2 className="text-5xl font-black mb-2 tracking-tighter">
                {impactCount}
              </h2>
              <p className="text-sm text-slate-400 font-medium italic">
                {t('community_provided')}
              </p>
              
              <div className="mt-10 flex items-center gap-8">
                <div>
                  <p className="text-3xl font-black">{resolvedCount}</p>
                  <p className="text-[10px] text-primary uppercase font-black tracking-widest">{t('resolved')}</p>
                </div>
                <div className="w-px h-12 bg-slate-800"></div>
                <div>
                  <p className="text-3xl font-black">{membersCount}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
                    {t('members')}
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
          </div>

          <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10 relative">
            <div className={`absolute -top-4 ${isRtl ? 'right-6' : 'left-6'} bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg`}>
              PRO TIP
            </div>
            <p className="text-slate-700 leading-relaxed italic font-medium pt-2">
              {isRtl 
                ? '"التحديد الدقيق لاحتياجاتك يساعد المتطوعين على تقديم الدعم المناسب بشكل أسرع."' 
                : '"Being specific about your needs helps volunteers provide the right support faster."'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
