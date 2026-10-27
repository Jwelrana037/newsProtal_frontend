import LatestNews from './LatestNews';
import FeaturedNews from '../components/FeaturedNews';
import AdvertisementSlot from '../components/AdvertisementSlot';

import './Home.css';
import './HomeAdvertisements.css';

import { useLanguage } from '../context/LanguageContext';

function Home() {
  const { t } = useLanguage();

  return (
    <main className="home-page">
      {/* 1. Homepage-এর একদম উপরে Advertisement */}
      <AdvertisementSlot position="homepage-top" className="homepage-ad-top" />

      {/* 2. Featured News */}
      <FeaturedNews />

      {/* 3. Featured News-এর পরে Advertisement */}
      <AdvertisementSlot
        position="homepage-middle"
        className="homepage-ad-middle"
      />

      {/* 4. Latest News-এর Heading */}
      <section className="home-heading">
        <h2>{t.moreNews}</h2>
        <p>{t.latestDescription}</p>
      </section>

      {/* 5. Backend থেকে আসা Latest News */}
      <LatestNews />

      {/* 6. Homepage-এর নিচে Advertisement */}
      <AdvertisementSlot
        position="homepage-bottom"
        className="homepage-ad-bottom"
      />
    </main>
  );
}

export default Home;
