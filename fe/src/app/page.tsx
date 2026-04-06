import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { ArrowRight, Clock, Star, Truck } from 'lucide-react';
import styles from './home.module.scss';

const FEATURES = [
  { Icon: Clock, title: 'Real-Time Tracking', desc: 'Follow your order from kitchen to your table with live updates' },
  { Icon: Star,  title: 'Quality Food',       desc: 'Fresh ingredients, expertly prepared by our culinary team' },
  { Icon: Truck, title: 'Fast Service',        desc: 'Efficient kitchen management ensures minimal wait times' },
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <h1 className={styles.headline}>
          Delicious Food, <span className={styles.accent}>Delivered Fast</span>
        </h1>
        <p className={styles.subline}>
          Browse our curated menu, customize your order, and track it in real-time from kitchen to table.
        </p>
        <Link href="/menu" className={styles.ctaBtn}>
          Explore Menu <ArrowRight />
        </Link>

        <div className={styles.features}>
          {FEATURES.map(({ Icon, title, desc }) => (
            <div key={title} className={styles.featureCard}>
              <div className={styles.featureIcon}><Icon /></div>
              <h3 className={styles.featureTitle}>{title}</h3>
              <p className={styles.featureDesc}>{desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
