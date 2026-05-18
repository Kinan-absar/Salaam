import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "app_name": "Salaam",
      "slogan": "Peace through Community Help",
      "login": "Login",
      "signup": "Sign Up",
      "logout": "Logout",
      "profile": "Profile",
      "feed": "Feed",
      "post_request": "Post a Request",
      "my_requests": "My Requests",
      "notifications": "Notifications",
      "no_notifications": "No notifications yet",
      "help_needed": "What help do you need?",
      "title": "Title",
      "description": "Description",
      "volunteer": "Volunteer",
      "offer_help": "Offer Help",
      "resolved": "Resolved",
      "open": "Open",
      "closed": "Closed",
      "urgent": "Urgent",
      "anonymous": "Post Anonymously",
      "anonymous_user": "Anonymous",
      "edit_profile": "Edit Profile",
      "about_me": "About Me",
      "save": "Save",
      "location": "Location",
      "full_name": "Full Name",
      "bio": "Bio",
      "joined": "Joined",
      "notifications_desc": "Stay updated on those who want to help.",
      "mark_all_read": "Mark all read",
      "spirit_of_sweida": "Spirit of Sweida",
      "community_provided": "Total acts of community support",
      "members": "Members",
      "categories": {
        "money": "Financial",
        "goods": "Goods / Items",
        "skills": "Skills / Service",
        "other": "Other"
      },
      "placeholders": {
        "search": "Search requests...",
        "request_title": "Short title for your request",
        "request_body": "Describe your situation in detail...",
        "offer_message": "Tell the requester how you can help..."
      }
    }
  },
  ar: {
    translation: {
      "app_name": "سلام",
      "slogan": "سلام من خلال المساعدة المجتمعية",
      "login": "تسجيل الدخول",
      "signup": "إنشاء حساب",
      "logout": "تسجيل الخروج",
      "profile": "الملف الشخصي",
      "feed": "الرئيسية",
      "post_request": "اطلب مساعدة",
      "my_requests": "طلباتي",
      "notifications": "التنبيهات",
      "no_notifications": "لا يوجد تنبيهات بعد",
      "help_needed": "ما نوع المساعدة التي تحتاجها؟",
      "title": "العنوان",
      "description": "الوصف",
      "volunteer": "تطوع",
      "offer_help": "عرض مساعدة",
      "resolved": "تم الحل",
      "open": "مفتوح",
      "closed": "مغلق",
      "urgent": "عاجل",
      "anonymous": "نشر بهوية مجهولة",
      "anonymous_user": "مجهول",
      "edit_profile": "تعديل الملف الشخصي",
      "about_me": "عني",
      "save": "حفظ",
      "location": "الموقع",
      "full_name": "الاسم بالكامل",
      "bio": "نبذة عني",
      "joined": "انضم في",
      "notifications_desc": "ابقَ على اطلاع بمن يريد المساعدة.",
      "mark_all_read": "تحديد الكل كمقروء",
      "spirit_of_sweida": "روح السويداء",
      "community_provided": "إجمالي أعمال الدعم المجتمعي",
      "members": "عضو",
      "categories": {
        "money": "مادي",
        "goods": "مواد / أغراض",
        "skills": "مهارات / خدمات",
        "other": "أخرى"
      },
      "placeholders": {
        "search": "بحث عن طلبات...",
        "request_title": "عنوان قصير لطلبك",
        "request_body": "اشرح حاجتك بالتفصيل...",
        "offer_message": "أخبر صاحب الطلب كيف يمكنك المساعدة..."
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
