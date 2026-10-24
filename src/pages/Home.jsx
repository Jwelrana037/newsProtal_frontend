// import Navbar from '../components/Navbar';
// import BreakingNews from '../components/BreakingNews';

import LatestNews from './LatestNews';
import FeaturedNews from '../components/FeaturedNews';
import './Home.css';
import { useLanguage } from '../context/LanguageContext';

function Home() {
  const { t } = useLanguage();

  return (
    <main className="home-page">
      {/* Home Page Heading */}
      <FeaturedNews />

      <section className="home-heading">
        <h2>{t.moreNews}</h2>
        <p>{t.latestDescription}</p>
      </section>

      {/* Backend থেকে আসা সংবাদ */}
      <LatestNews />
    </main>
  );
}

export default Home;
