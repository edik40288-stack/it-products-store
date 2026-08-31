'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { siteConfig } from '@/config/site';
import styles from './Header.module.css';

const LOCALES = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'ro', label: 'RO' },
];

interface HeaderProps {
  locale: string;
}

export default function Header({ locale }: HeaderProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuHovered, setMenuHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  const navLinks = [
    { href: `/${locale}#services`, label: t('services') },
    { href: `/${locale}#contact`, label: t('contact') },
  ];

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        {/* Logo */}
        <Link href={`/${locale}`} className={styles.logo} onClick={() => setMenuOpen(false)}>
          <span className={styles.logoText}>MINDCORE</span>
          <span className={styles.logoDot}>.</span>
        </Link>

        <div className={styles.right}>

          {/* Language switcher */}
          <div className={styles.langSwitcher}>
            {LOCALES.map((l) => (
              <button
                key={l.code}
                className={`${styles.langBtn} ${locale === l.code ? styles.langActive : ''}`}
                onClick={() => switchLocale(l.code)}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Hamburger menu button */}
          <button
            className={`${styles.menuBtn} ${menuOpen ? styles.menuBtnOpen : ''} ${menuHovered ? styles.menuBtnHovered : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            onMouseEnter={() => setMenuHovered(true)}
            onMouseLeave={() => setMenuHovered(false)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <span className={styles.menuLine} />
            <span className={styles.menuLine} />
            <span className={styles.menuLine} />
            {/* Dots overlay on hover */}
            <div className={styles.menuDots} aria-hidden="true">
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i} className={styles.menuDot} style={{ '--i': i } as React.CSSProperties} />
              ))}
            </div>
          </button>
        </div>
      </header>

      {/* Fullscreen navigation overlay */}
      <nav className={`${styles.navOverlay} ${menuOpen ? styles.navOverlayOpen : ''}`} aria-hidden={!menuOpen}>
        <ul className={styles.navList}>
          {navLinks.map((link, idx) => (
            <li key={link.href} className={styles.navItem} style={{ '--delay': `${idx * 0.08}s` } as React.CSSProperties}>
              <Link
                href={link.href}
                className={styles.navLink}
                onClick={() => setMenuOpen(false)}
              >
                <span className={styles.navNumber}>0{idx + 1}</span>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.navFooter}>
          <a href={`mailto:${siteConfig.email}`} className={styles.navEmail}>{siteConfig.email}</a>
          <p className={styles.navOffices}>
            {siteConfig.offices.map(o => o.city).join(' · ')}
          </p>
        </div>
      </nav>
    </>
  );
}
