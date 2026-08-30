'use client';
import { siteConfig } from '@/config/site';
import styles from './Footer.module.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      {/* Background video */}
      <div className={styles.videoBg} aria-hidden="true">
        <div className={styles.videoOverlay} />
        {/* Placeholder for video — replace src with real backstage footage */}
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
          <h2 className={styles.slogan}>{siteConfig.tagline}</h2>
          <a href={`mailto:${siteConfig.email}`} className={styles.emailCta}>
            {siteConfig.email} →
          </a>
        </div>

        {/* Bottom bar */}
        <div className={styles.bottomBar}>
          <div className={styles.bottomLeft}>
            <span className={styles.brand}>MINDCORE<span className={styles.brandDot}>.</span></span>
            <span className={styles.copyright}>© {year} All rights reserved.</span>
          </div>

          <div className={styles.offices}>
            {siteConfig.offices.map((office) => (
              <div key={office.city} className={styles.office}>
                <span className={styles.officeCity}>{office.city}</span>
                <span className={styles.officeCountry}>{office.country}</span>
              </div>
            ))}
          </div>

          <div className={styles.links}>
            <a href={siteConfig.telegram} className={styles.link} target="_blank" rel="noopener noreferrer">
              Telegram
            </a>
            <a href={`mailto:${siteConfig.email}`} className={styles.link}>
              Email
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
