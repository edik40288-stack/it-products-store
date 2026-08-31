'use client';
import { useLocale } from 'next-intl';
import styles from './Footer.module.css';

export default function Footer() {
  const year = new Date().getFullYear();
  const locale = useLocale();
  const isRu = locale === 'ru';

  return (
    <footer className={styles.footer}>
      {/* Background video */}
      <div className={styles.videoBg} aria-hidden="true">
        <div className={styles.videoOverlay} />
        <video
          className={styles.video}
          autoPlay
          muted
          loop
          playsInline
          poster="/video/footer-poster.jpg"
        >
          <source src="/video/footer-bg.mp4" type="video/mp4" />
        </video>
      </div>

      <div className={styles.content}>
        {/* Main slogan */}
        <div className={styles.sloganWrap}>
          <h2 className={styles.slogan}>
            {isRu 
              ? 'Ракета-носитель для команд цифровых продуктов' 
              : 'A booster rocket for digital product teams'}
          </h2>
          <a href="#contact" className={styles.emailCta}>
            {isRu ? 'Обсудить проект →' : 'Discuss a project →'}
          </a>
        </div>

        {/* Bottom bar */}
        <div className={styles.bottomBar}>
          <div className={styles.bottomLeft}>
            <span className={styles.brand}>MINDCORE<span className={styles.brandDot}>.</span></span>
            <span className={styles.copyright}>© {year} All rights reserved.</span>
          </div>

          <div className={styles.offices}>
            <div className={styles.office}>
              <span className={styles.officeCity}>{isRu ? 'Весь мир' : 'Worldwide'}</span>
              <span className={styles.officeCountry}>{isRu ? 'Удаленно' : 'Remote'}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
