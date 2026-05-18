import React from 'react';
import { useTranslation } from 'react-i18next';
import { HelpRequest, RequestStatus } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, CheckCircle2, Clock, MessageSquare, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RequestCardProps {
  request: HelpRequest;
  authorName?: string;
  authorAvatar?: string;
}

export const HelpRequestCard: React.FC<RequestCardProps> = ({ request, authorName, authorAvatar }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const getStatusIcon = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.OPEN: return <Clock className="h-4 w-4 text-primary" />;
      case RequestStatus.RESOLVED: return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case RequestStatus.CLOSED: return <AlertCircle className="h-4 w-4 text-slate-400" />;
    }
  };

  const displayName = request.anonymous ? (isRtl ? 'مجهول' : 'Anonymous') : (authorName || 'User');

  return (
    <Card 
      className={`group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-primary/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${isRtl ? 'text-right' : 'text-left'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
        <div className={`flex gap-5 w-full ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
            request.category === 'money' ? 'bg-orange-50 text-orange-600' :
            request.category === 'skills' ? 'bg-primary/10 text-primary' :
            request.category === 'goods' ? 'bg-emerald-50 text-emerald-600' :
            'bg-slate-50 text-slate-600'
          }`}>
            {request.category === 'money' ? <Heart className="h-7 w-7" /> : 
             request.category === 'skills' ? <MessageSquare className="h-7 w-7" /> :
             <AlertCircle className="h-7 w-7" />}
          </div>
          <div className="flex-1 space-y-1">
            <div className={`flex flex-wrap items-center gap-2 mb-1 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
              {request.urgent && (
                <span className="bg-destructive text-white text-[8px] uppercase font-black px-2 py-0.5 rounded-full animate-pulse tracking-widest shadow-lg shadow-destructive/20">
                  {t('urgent')}
                </span>
              )}
              <Link to={`/request/${request.id}`} className="block">
                <h3 className="font-black text-lg text-slate-800 group-hover:text-primary transition-colors leading-tight">
                  {request.title}
                </h3>
              </Link>
            </div>
            <p className="text-sm text-slate-500 line-clamp-2 italic font-medium leading-relaxed opacity-80">
              "{request.body}"
            </p>
          </div>
        </div>
        <div className={`shrink-0 flex flex-col ${isRtl ? 'items-start text-left' : 'items-end text-right'} hidden sm:flex`}>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
            {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
          </p>
          <Badge variant="outline" className={`mt-2 font-black uppercase text-[8px] tracking-[0.1em] border-primary/20 text-primary px-3 ${
            request.category === 'money' ? 'border-orange-200 text-orange-600' :
            request.category === 'skills' ? 'border-primary/20 text-primary' :
            'border-emerald-200 text-emerald-600'
          }`}>
            {t(`categories.${request.category}`)}
          </Badge>
        </div>
      </div>

      <div className={`mt-6 flex flex-col sm:flex-row items-center justify-between border-t border-slate-50 pt-5 gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <Avatar className="h-8 w-8 border-2 border-white shadow-sm overflow-hidden p-0">
            <AvatarImage src={authorAvatar} />
            <AvatarFallback className="text-[10px] font-black bg-primary/10 text-primary">{displayName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className={`flex flex-col ${isRtl ? 'items-end' : 'items-start'}`}>
            <span className="text-[11px] text-slate-800 font-black uppercase tracking-tight">
              {displayName}
            </span>
            <div className={`flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
              {getStatusIcon(request.status)}
              <span className="text-[10px] text-slate-400 font-bold uppercase transition-colors">
                {t(request.status)}
              </span>
            </div>
          </div>
        </div>
        
        <Button variant="link" asChild className="text-primary text-xs font-black uppercase tracking-widest hover:no-underline p-0 h-auto group/btn">
          <Link to={`/request/${request.id}`} className="flex items-center gap-1.5">
            {t('offer_help')}
            <span className={`block transition-transform ${isRtl ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`}>
               {isRtl ? '←' : '→'}
            </span>
          </Link>
        </Button>
      </div>
    </Card>
  );
};
