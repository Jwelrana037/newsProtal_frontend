import { createContext,useContext ,useState } from 'react';

const LanguageContext = createContext(null);

const translations = {
  bn: {
    home: 'হোম',
    national: 'জাতীয়',
    politics: 'রাজনীতি',
    international: 'আন্তর্জাতিক',
    sports: 'খেলাধুলা',
    technology: 'প্রযুক্তি',
    entertainment: 'বিনোদন',
    videos: 'ভিডিও',
    search: 'খুঁজুন',
    searchPlaceholder: 'সংবাদ খুঁজুন...',
    breakingNews: 'ব্রেকিং নিউজ',
    latestNews: 'সর্বশেষ সংবাদ',
    moreNews: 'আরও খবর',
    latestDescription: 'বিভিন্ন বিভাগের সর্বশেষ সংবাদ',
    readMore: 'বিস্তারিত পড়ুন',
    allNews: 'সকল সংবাদ',
    noNews: 'কোনো সংবাদ পাওয়া যায়নি।',
    searchResults: 'অনুসন্ধানের ফলাফল',
    searchFor: 'আপনার অনুসন্ধান:',
    newsNotFound: 'সংবাদটি পাওয়া যায়নি।',
    author: 'প্রকাশক',
    relatedNews: 'সম্পর্কিত সংবাদ',
    allVideos: 'সকল ভিডিও',
    videoDescription: 'সর্বশেষ সংবাদ ও ভিডিও দেখুন',
    noSearchResults: 'আপনার অনুসন্ধানের সঙ্গে মিল পাওয়া যায়নি।',
  },

  en: {
    home: 'Home',
    national: 'National',
    politics: 'Politics',
    international: 'International',
    sports: 'Sports',
    technology: 'Technology',
    entertainment: 'Entertainment',
    videos: 'Videos',
    search: 'Search',
    searchPlaceholder: 'Search news...',
    breakingNews: 'Breaking News',
    latestNews: 'Latest News',
    moreNews: 'More News',
    latestDescription: 'Latest news from different categories',
    readMore: 'Read More',
    allNews: 'All News',
    noNews: 'No news found.',
    searchResults: 'Search Results',
    searchFor: 'Your search:',
    newsNotFound: 'News article not found.',
    author: 'Author',
    relatedNews: 'Related News',
    allVideos: 'All Videos',
    videoDescription: 'Watch the latest news and videos',
    noSearchResults: 'No results matched your search.',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('bn');

  function toggleLanguage() {
    setLanguage((currentLanguage) => (currentLanguage === 'bn' ? 'en' : 'bn'));
  }

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      'useLanguage অবশ্যই LanguageProvider-এর ভিতরে ব্যবহার করতে হবে।'
    );
  }

  return context;
}
