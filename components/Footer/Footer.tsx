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
            {locale === 'ru' 
              ? 'Создаем надежные веб-продукты и внедряем AI-системы'
              : locale === 'ro'
              ? 'Construim produse web scalabile și integrăm sisteme AI'
              : 'Engineering high-impact web products and autonomous AI systems'}
          </h2>
          <a href="#contact" className={styles.emailCta}>
            {locale === 'ru' 
              ? 'Обсудить проект →' 
              : locale === 'ro'
              ? 'Discută proiectul →'
              : 'Start a Project →'}
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
