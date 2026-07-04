export const translations: Record<string, Record<string, string>> = {
  ar: {
    // Navbar
    'nav.home': 'الرئيسية',
    'nav.ads': 'الإعلانات',
    'nav.post': 'انشر إعلانك',
    'nav.login': 'تسجيل الدخول',
    'nav.register': 'إنشاء حساب',
    'nav.myads': 'إعلاناتي',
    'nav.logout': 'خروج',
    'nav.profile': 'الملف الشخصي',
    'nav.messages': 'الرسائل',
    'nav.transactions': 'السجل المالي',

    // Home Page
    'home.hero.title_part1': 'مكانك الأفضل',
    'home.hero.title_part2': 'للبيع، الشراء، والترويج',
    'home.hero.subtitle': 'انضم لآلاف المستخدمين في 12+ قسم متخصص، من العقارات إلى قنوات السوشيال ميديا',
    'home.hero.explore': 'اكتشف عالماً من الفرص ✨',
    'home.hero.search_btn': 'بحث سريع',
    'home.hero.search_placeholder': 'ابحث عن سيارة، منزل، أو قناة تليجرام...',
    
    'home.categories.title': 'تصفح الأقسام',
    
    'home.promoted.title': 'إعلانات مميزة',
    'home.promoted.view_all': 'عرض الكل ←',
    
    'home.recent.title': 'أحدث الإعلانات',
    'home.recent.view_all': 'عرض الكل ←',
    
    'home.stats.ads': 'إعلان نشط',
    'home.stats.users': 'مستخدم موثوق',
    'home.stats.countries': 'دولة مدعومة',
    'home.stats.deals': 'صفقة ناجحة',
    
    'home.features.title': 'لماذا إعلاني؟',
    'home.features.speed': 'سرعة وسهولة',
    'home.features.speed_desc': 'انشر إعلانك في أقل من دقيقة وبكل بساطة',
    'home.features.reach': 'وصول واسع',
    'home.features.reach_desc': 'آلاف الزوار يومياً يشاهدون إعلانك',
    'home.features.trust': 'موثوقية وأمان',
    'home.features.trust_desc': 'نظام تقييم وحماية لجميع الأطراف',

    // My Ads Page
    'myads.title': 'إعلاناتي',
    'myads.subtitle': 'إدارة ومتابعة إعلاناتك المنشورة',
    'myads.dashboard': 'لوحة التحكم',
    'myads.rewards': 'نظام المكافآت 🎁',
    'myads.rewards_desc': 'ادعُ 5 أشخاص واحصل على إعلان مجاني إضافي فوراً!',
    'myads.invites_completed': 'دعوة مكتملة',
    'myads.invite_link': 'رابط الدعوة الخاص بك:',
    'myads.copy_link': 'نسخ الرابط 🔗',
    'myads.post_new': 'نشر إعلان جديد ➕',
    'myads.loading': 'جاري التحميل...',
    'myads.no_ads': 'لا توجد لديك إعلانات حالياً',
    'myads.ad.views': 'مشاهدة',
    'myads.ad.clicks': 'نقرة',
    'myads.ad.delete': 'حذف 🗑️',
    'myads.ad.edit': 'تعديل ✏️',
    'myads.ad.active': 'نشط ✅',
    'myads.ad.pending': 'بانتظار المراجعة ⏳',
    'myads.ad.rejected': 'مرفوض ❌',

    // Post Ad Page
    'post.title': 'أضف إعلاناً جديداً',
    'post.subtitle': 'اختر الباقة المناسبة للوصول إلى آلاف المشترين المحتملين.',
    'post.packages.title': 'باقات الإعلانات المتاحة',
    'post.packages.featured': 'إعلان مميز',
    'post.packages.duration': 'المدة',
    'post.packages.days': 'يوم',
    'post.packages.images': 'صورة',
    'post.packages.price': 'السعر',
    'post.packages.free': 'مجاناً',
    'post.packages.select': 'اختيار هذه الباقة',
    'post.packages.selected': 'الباقة المحددة ✅',
    'post.form.title': 'تفاصيل الإعلان',
    'post.form.ad_title': 'عنوان الإعلان',
    'post.form.category': 'القسم الرئيسي',
    'post.form.select_category': 'اختر القسم',
    'post.form.description': 'وصف الإعلان',
    'post.form.ai_help': '✨ دع الذكاء الاصطناعي يكتبه لك',
    'post.form.ai_loading': 'جاري الكتابة...',
    'post.form.link': 'رابط (اختياري)',
    'post.form.images': 'صور الإعلان (بحد أقصى {limit})',
    'post.form.images_desc': 'يمكنك تحديد عدة صور دفعة واحدة أو إضافتها صورة تلو الأخرى. تم اختيار {count} من أصل {limit} صور.',
    'post.form.video': 'فيديو قصير (اختياري)',
    'post.form.video_desc': 'يجب ألا يتجاوز حجم الفيديو 50 ميجابايت',
    'post.form.submit': 'نشر الإعلان 🚀',
    'post.form.submitting': 'جاري النشر...',

    // Ad Details
    'ad.details.view_details': 'عرض التفاصيل ←',
    'ad.details.owner': 'المعلن',
    'ad.details.package': 'الباقة',
    'ad.details.expires': 'ينتهي في',
    'ad.details.views': 'المشاهدات',
    'ad.details.message': '💬 مراسلة المعلن',
    'ad.details.whatsapp': '🟢 واتساب',
    'ad.details.call': '📞 اتصال هاتفي',
    'ad.details.visit_link': '🔗 زيارة الرابط',
    'ad.details.post_similar': '➕ انشر إعلانك مثله',
    'ad.details.video': '🎬 فيديو الإعلان',
    'ad.details.stats_title': 'إحصائيات إعلانك',
    'ad.details.stats_desc': 'نظرة عامة على أداء هذا الإعلان',
    'ad.details.stats_views': 'عدد المشاهدات 👁️',
    'ad.details.stats_clicks': 'النقرات والاهتمام 🖱️',
    'ad.details.stats_status': 'حالة الإعلان',
    'ad.details.back_myads': 'العودة لإعلاناتي',
    'ad.details.back': '← رجوع',
    'ad.details.not_found': 'الإعلان غير موجود أو غير متاح',
    
    // Ad Card
    'card.featured': 'مميز',
    'card.unspecified': 'غير محدد',
    
    // Profile
    'profile.title': 'الملف الشخصي',
    'profile.info': 'المعلومات الشخصية',
    'profile.name': 'الاسم',
    'profile.email': 'البريد الإلكتروني',
    'profile.phone': 'رقم الهاتف',
    'profile.whatsapp': 'رقم الواتساب',
    'profile.save': 'حفظ التعديلات',
    'profile.saving': 'جاري الحفظ...',
  },
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.ads': 'Ads',
    'nav.post': 'Post Ad',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.myads': 'My Ads',
    'nav.logout': 'Logout',
    'nav.profile': 'Profile',
    'nav.messages': 'Messages',
    'nav.transactions': 'Transactions',

    // Home Page
    'home.hero.title_part1': 'Your Best Place',
    'home.hero.title_part2': 'To Buy, Sell, & Promote',
    'home.hero.subtitle': 'Join thousands of users across 12+ categories, from Real Estate to Social Media channels',
    'home.hero.explore': 'Explore Opportunities ✨',
    'home.hero.search_btn': 'Quick Search',
    'home.hero.search_placeholder': 'Search for a car, house, or telegram channel...',
    
    'home.categories.title': 'Browse Categories',
    
    'home.promoted.title': 'Featured Ads',
    'home.promoted.view_all': 'View All →',
    
    'home.recent.title': 'Latest Ads',
    'home.recent.view_all': 'View All →',
    
    'home.stats.ads': 'Active Ads',
    'home.stats.users': 'Trusted Users',
    'home.stats.countries': 'Supported Countries',
    'home.stats.deals': 'Successful Deals',
    
    'home.features.title': 'Why Choose Us?',
    'home.features.speed': 'Fast & Easy',
    'home.features.speed_desc': 'Post your ad in less than a minute simply',
    'home.features.reach': 'Wide Reach',
    'home.features.reach_desc': 'Thousands of visitors view your ad daily',
    'home.features.trust': 'Trust & Safety',
    'home.features.trust_desc': 'Rating and protection system for all parties',

    // My Ads Page
    'myads.title': 'My Ads',
    'myads.subtitle': 'Manage and track your published ads',
    'myads.dashboard': 'Dashboard',
    'myads.rewards': 'Rewards System 🎁',
    'myads.rewards_desc': 'Invite 5 people and get a free ad instantly!',
    'myads.invites_completed': 'Invites Completed',
    'myads.invite_link': 'Your Invite Link:',
    'myads.copy_link': 'Copy Link 🔗',
    'myads.post_new': 'Post New Ad ➕',
    'myads.loading': 'Loading...',
    'myads.no_ads': 'You have no ads currently',
    'myads.ad.views': 'Views',
    'myads.ad.clicks': 'Clicks',
    'myads.ad.delete': 'Delete 🗑️',
    'myads.ad.edit': 'Edit ✏️',
    'myads.ad.active': 'Active ✅',
    'myads.ad.pending': 'Pending ⏳',
    'myads.ad.rejected': 'Rejected ❌',

    // Post Ad Page
    'post.title': 'Post a New Ad',
    'post.subtitle': 'Choose the right package to reach thousands of potential buyers.',
    'post.packages.title': 'Available Ad Packages',
    'post.packages.featured': 'Featured Ad',
    'post.packages.duration': 'Duration',
    'post.packages.days': 'Days',
    'post.packages.images': 'Images',
    'post.packages.price': 'Price',
    'post.packages.free': 'Free',
    'post.packages.select': 'Select Package',
    'post.packages.selected': 'Selected ✅',
    'post.form.title': 'Ad Details',
    'post.form.ad_title': 'Ad Title',
    'post.form.category': 'Main Category',
    'post.form.select_category': 'Select Category',
    'post.form.description': 'Ad Description',
    'post.form.ai_help': '✨ Let AI Write It',
    'post.form.ai_loading': 'Writing...',
    'post.form.link': 'Link (Optional)',
    'post.form.images': 'Ad Images (Max {limit})',
    'post.form.images_desc': 'Select multiple images at once or add them one by one. {count} of {limit} images selected.',
    'post.form.video': 'Short Video (Optional)',
    'post.form.video_desc': 'Video size must not exceed 50MB',
    'post.form.submit': 'Publish Ad 🚀',
    'post.form.submitting': 'Publishing...',

    // Ad Details
    'ad.details.view_details': 'View Details →',
    'ad.details.owner': 'Advertiser',
    'ad.details.package': 'Package',
    'ad.details.expires': 'Expires In',
    'ad.details.views': 'Views',
    'ad.details.message': '💬 Send Message',
    'ad.details.whatsapp': '🟢 WhatsApp',
    'ad.details.call': '📞 Call',
    'ad.details.visit_link': '🔗 Visit Link',
    'ad.details.post_similar': '➕ Post Similar Ad',
    'ad.details.video': '🎬 Ad Video',
    'ad.details.stats_title': 'Your Ad Stats',
    'ad.details.stats_desc': 'Overview of this ad performance',
    'ad.details.stats_views': 'Total Views 👁️',
    'ad.details.stats_clicks': 'Clicks & Interest 🖱️',
    'ad.details.stats_status': 'Ad Status',
    'ad.details.back_myads': 'Back to My Ads',
    'ad.details.back': '← Back',
    'ad.details.not_found': 'Ad not found or unavailable',

    // Ad Card
    'card.featured': 'Featured',
    'card.unspecified': 'Unspecified',
    
    // Profile
    'profile.title': 'Profile',
    'profile.info': 'Personal Information',
    'profile.name': 'Name',
    'profile.email': 'Email',
    'profile.phone': 'Phone Number',
    'profile.whatsapp': 'WhatsApp Number',
    'profile.save': 'Save Changes',
    'profile.saving': 'Saving...',
  }
};

export const t = (lang: string, key: string): string => {
  return translations[lang]?.[key] || translations['ar']?.[key] || key;
};

export const translateDB = (lang: string, text: string): string => {
  if (lang === 'ar' || !text) return text;
  const map: Record<string, string> = {
    'عقارات': 'Real Estate',
    'سيارات': 'Cars',
    'إلكترونيات': 'Electronics',
    'وظائف': 'Jobs',
    'خدمات': 'Services',
    'أثاث': 'Furniture',
    'هواتف': 'Phones',
    'تليجرام': 'Telegram',
    'واتساب': 'WhatsApp',
    'فيسبوك': 'Facebook',
    'انستقرام': 'Instagram',
    'تيك توك': 'TikTok',
    'يوتيوب': 'YouTube',
    'اكس (تويتر)': 'X (Twitter)',
    'أزياء': 'Fashion',
    'ألعاب': 'Games',
    'الباقة المجانية': 'Free Package',
    'الباقة الأساسية': 'Basic Package',
    'الباقة الذهبية': 'Gold Package',
    'الباقة البلاتينية': 'Platinum Package',
    'غير محدد': 'Unspecified',
  };
  
  // Handle strings like 'الباقة الأساسية'
  for (const [ar, en] of Object.entries(map)) {
    if (text.includes(ar)) {
       text = text.replace(ar, en);
    }
  }
  return text;
};
