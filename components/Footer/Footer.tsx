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

          <div className={styles.statusIndicator}>
            <span className={styles.statusDot} />
            <span className={styles.statusText}>
              {locale === 'ru' 
                ? 'Все системы работают стабильно' 
                : locale === 'ro' 
                ? 'Toate sistemele operaționale' 
                : 'All systems operational'}
            </span>
          </div>

          <div className={styles.bottomRight}>
            <a href="#services" className={styles.footerLink}>
              {locale === 'ru' ? 'Услуги' : locale === 'ro' ? 'Servicii' : 'Services'}
            </a>
            <span className={styles.footerDivider}>/</span>
            <a href="#contact" className={styles.footerLink}>
              {locale === 'ru' ? 'Контакты' : locale === 'ro' ? 'Contact' : 'Contact'}
            </a>
            <span className={styles.footerDivider}>/</span>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              className={styles.backToTop}
            >
              {locale === 'ru' ? 'Наверх ↑' : locale === 'ro' ? 'Sus ↑' : 'Top ↑'}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
