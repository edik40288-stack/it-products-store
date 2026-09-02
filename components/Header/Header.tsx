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
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  const navLinks = [
    {
      num: '01',
      href: `/${locale}#services`,
      title: locale === 'ru' ? 'Услуги & Экспертиза' : locale === 'ro' ? 'Servicii & Expertiză' : 'Services & Expertise',
      desc: locale === 'ru' ? 'Веб-сервисы, автономные AI-агенты, CRM и автоматизация' : locale === 'ro' ? 'Servicii web, agenți AI, CRM și automatizări' : 'Full-stack web products, AI agents, CRM & automation'
    },
    {
      num: '02',
      href: `/${locale}#contact`,
      title: locale === 'ru' ? 'Прямые контакты' : locale === 'ro' ? 'Canale directe' : 'Direct Channels',
      desc: locale === 'ru' ? 'Связь с ведущими архитекторами и обсуждение задач' : locale === 'ro' ? 'Discută direct cu arhitecții noștri' : 'Direct contact with lead engineers'
    },
    {
      num: '03',
      href: '#',
      title: locale === 'ru' ? 'AI-Консультант 24/7' : locale === 'ro' ? 'Consultant AI 24/7' : '24/7 AI Architect',
      desc: locale === 'ru' ? 'Интерактивный расчет стоимости и персональный аудит' : locale === 'ro' ? 'Estimare instantanee și audit personalizat' : 'Instant scoping and live digital audit',
      isChat: true
    }
  ];

  const handleLinkClick = (isChat?: boolean) => {
    setMenuOpen(false);
    if (isChat) {
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('open-ai-chat'));
      }, 300);
    }
  };

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

          {/* Clean minimal hamburger / close button */}
          <button
            className={`${styles.menuBtn} ${menuOpen ? styles.menuBtnOpen : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <span className={styles.menuLine} />
            <span className={styles.menuLine} />
          </button>
        </div>
      </header>

      {/* Fullscreen navigation overlay */}
      <nav 
        className={`${styles.navOverlay} ${menuOpen ? styles.navOverlayOpen : ''}`} 
        aria-hidden={!menuOpen}
        onWheel={(e) => e.stopPropagation()}
      >
        <div className={styles.navContainer}>
          {/* Top meta inside menu */}
          <div className={styles.navHeader}>
            <div className={styles.navBadge}>
              <span className={styles.navBadgeDot} />
              <span>MINDCORE // STUDIO NAVIGATION</span>
            </div>
            <button className={styles.navCloseBtn} onClick={() => setMenuOpen(false)} aria-label="Close menu">
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <div className={styles.navList}>
            {navLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className={styles.navCard}
                onClick={(e) => {
                  if (link.isChat) e.preventDefault();
                  handleLinkClick(link.isChat);
                }}
              >
                <div className={styles.navCardLeft}>
                  <div className={styles.navCardTop}>
                    <span className={styles.navNumber}>{link.num} //</span>
                    <h3 className={styles.navTitle}>{link.title}</h3>
                  </div>
                  <p className={styles.navDesc}>{link.desc}</p>
                </div>
                <div className={styles.navCardArrow}>→</div>
              </Link>
            ))}
          </div>

          {/* Bottom direct channels */}
          <div className={styles.navFooter}>
            <div className={styles.navFooterChannels}>
              <a href="https://t.me/kraeved111" target="_blank" rel="noopener noreferrer" className={styles.channelPill}>
                Telegram
              </a>
              <a href="https://wa.me/4207278671129" target="_blank" rel="noopener noreferrer" className={styles.channelPill}>
                WhatsApp
              </a>
              <a href="mailto:edik40288@gmail.com" className={styles.channelPill}>
                Email
              </a>
              <a href="viber://chat?number=%2B4207278671129" className={styles.channelPill}>
                Viber
              </a>
            </div>
            <span className={styles.navFooterCopyright}>
              © {new Date().getFullYear()} MINDCORE. All rights reserved.
            </span>
          </div>
        </div>
      </nav>
    </>
  );
}
