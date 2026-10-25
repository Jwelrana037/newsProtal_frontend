import LatestNews from './LatestNews';
import FeaturedNews from '../components/FeaturedNews';
import AdvertisementSlot from '../components/AdvertisementSlot';

import './Home.css';

import { useLanguage } from '../context/LanguageContext';

function Home() {
  const { t } = useLanguage();

  return (
    <main className="home-page">
      {/* Homepage-এর একদম উপরে বিজ্ঞাপন */}
      <AdvertisementSlot position="homepage-top" className="homepage-ad-top" />

      {/* Featured News */}
      <FeaturedNews />

      {/* Featured News-এর পরে এবং Latest News-এর আগে বিজ্ঞাপন */}
      <AdvertisementSlot
        position="homepage-middle"
        className="homepage-ad-middle"
      />

      {/* আরও সংবাদ */}
      <section className="home-heading">
        <h2>{t.moreNews}</h2>
        <p>{t.latestDescription}</p>
      </section>

      {/* Backend থেকে আসা সংবাদ */}
      <LatestNews />

      {/* Homepage-এর নিচে বিজ্ঞাপন */}
      <AdvertisementSlot
        position="homepage-bottom"
        className="homepage-ad-bottom"
      />
    </main>
  );
}

export default Home;
