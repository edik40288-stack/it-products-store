'use client';

import { useTranslations, useLocale } from 'next-intl';
import styles from './Contact.module.css';

export default function Contact() {
  const t = useTranslations('Contact');
  const locale = useLocale();
  const isRu = locale === 'ru';
  const isRo = locale === 'ro';

  const badgeText = isRu 
    ? 'MINDCORE // ПРЯМЫЕ КОНТАКТЫ' 
    : isRo 
    ? 'MINDCORE // CANALE DIRECTE' 
    : 'MINDCORE // DIRECT CHANNELS';

  return (
    <section className={styles.section} id="contact">
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            <span>{badgeText}</span>
          </div>

          <h2 className={styles.title}>
            {isRu ? 'Обсудить ' : isRo ? 'Discută ' : 'Discuss '}
            <span className={styles.highlight}>{isRu ? 'ваш проект' : isRo ? 'proiectul tău' : 'your project'}</span>
          </h2>

          <p className={styles.subtitle}>
            {isRu 
              ? 'Выберите удобный мессенджер или напишите на почту. Отвечаем быстро, консультируем и рассчитываем окупаемость без навязывания.'
              : isRo
              ? 'Alegeți canalul preferat. Răspundem prompt, oferim consultanță clară și estimări reale.'
              : 'Choose your preferred channel. We respond promptly with clear estimates and zero hard sales.'}
          </p>

          {/* 4 Contact Channels: Telegram, WhatsApp, Email, Viber */}
          <div className={styles.channelsGrid}>
            {/* Telegram */}
            <a 
              href="https://t.me/kraeved111" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`${styles.channelCard} ${styles.channelTelegram}`}
            >
              <div className={styles.channelIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.37.74-.56 2.92-1.27 4.86-2.11 5.83-2.52 2.78-1.16 3.35-1.36 3.73-1.37.08 0 .27.02.39.12.1.08.13.19.14.27-.01.07.01.22 0 .37z"/>
                </svg>
              </div>
              <div className={styles.channelInfo}>
                <span className={styles.channelName}>Telegram</span>
                <span className={styles.channelDetail}>{isRu ? 'Написать в Telegram' : isRo ? 'Scrie pe Telegram' : 'Open Telegram'}</span>
              </div>
              <span className={styles.channelArrow}>→</span>
            </a>

            {/* WhatsApp */}
            <a 
              href="https://wa.me/4207278671129" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`${styles.channelCard} ${styles.channelWhatsapp}`}
            >
              <div className={styles.channelIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.8 14.3c-.24.68-1.39 1.31-1.92 1.39-.49.08-1.12.11-3.23-.76-2.69-1.12-4.43-3.87-4.57-4.05-.13-.18-1.1-1.46-1.1-2.79 0-1.33.7-1.98.95-2.25.25-.27.55-.34.73-.34.18 0 .37 0 .53.01.17.01.4.06.61.56.23.55.77 1.88.84 2.02.07.14.12.31.02.5-.09.19-.14.31-.28.47-.14.16-.3.35-.42.47-.14.13-.28.28-.12.56.16.27.71 1.17 1.53 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.61-.07.17-.19.73-.85.92-1.14.2-.29.39-.24.66-.14.27.1 1.73.81 2.03.96.3.15.5.22.57.34.07.13.07.76-.17 1.44z"/>
                </svg>
              </div>
              <div className={styles.channelInfo}>
                <span className={styles.channelName}>WhatsApp</span>
                <span className={styles.channelDetail}>{isRu ? 'Написать в WhatsApp' : isRo ? 'Scrie pe WhatsApp' : 'Open WhatsApp'}</span>
              </div>
              <span className={styles.channelArrow}>→</span>
            </a>

            {/* Email */}
            <a 
              href="mailto:edik40288@gmail.com" 
              className={`${styles.channelCard} ${styles.channelEmail}`}
            >
              <div className={styles.channelIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>
              <div className={styles.channelInfo}>
                <span className={styles.channelName}>{isRu ? 'Почта' : isRo ? 'Email' : 'Email'}</span>
                <span className={styles.channelDetail}>{isRu ? 'Отправить письмо' : isRo ? 'Trimite un email' : 'Send an Email'}</span>
              </div>
              <span className={styles.channelArrow}>→</span>
            </a>

            {/* Viber */}
            <a 
              href="viber://chat?number=%2B4207278671129" 
              className={`${styles.channelCard} ${styles.channelViber}`}
            >
              <div className={styles.channelIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.02 1.5C6.01 1.5 1.5 5.58 1.5 10.96c0 3.02 1.49 5.72 3.84 7.43v3.48c0 .41.44.66.8.48l3.7-1.74c.72.15 1.46.23 2.18.23 6 0 10.52-4.08 10.52-9.46S18.02 1.5 12.02 1.5zm4.26 13.38c-.24.6-.98 1.16-1.58 1.28-.36.07-.83.07-2.76-.69-2.31-.93-3.8-3.03-3.92-3.15-.1-.12-.96-1.16-.96-2.21 0-1.05.54-1.56.77-1.77.21-.21.46-.25.63-.25.15 0 .3 0 .43.01.14.02.32.05.48.42.2.45.66 1.62.72 1.74.06.12.09.26.02.41-.08.15-.12.24-.23.37-.1.13-.22.27-.31.36-.11.11-.23.23-.09.45.13.23.6 1.01 1.3 1.62.92.81 1.68 1.07 1.92 1.19.24.12.38.1.51-.06.14-.17.6-.71.77-.95.16-.24.31-.19.54-.1.22.09 1.42.67 1.66.79.24.12.41.18.47.29.06.1.06.57-.18 1.17zm-.5-5.91c-.08-.13-.25-.17-.38-.09-.13.08-.17.25-.09.38.35.58.35 1.3-.01 1.88-.08.13-.04.3.09.38.13.08.3.04.38-.09.48-.75.48-1.71.01-2.46zm1.48-1.48c-.08-.13-.25-.17-.38-.09-.13.08-.17.25-.09.38.74 1.22.74 2.76 0 3.98-.08.13-.04.3.09.38.13.08.3.04.38-.09.89-1.46.89-3.3 0-4.76z"/>
                </svg>
              </div>
              <div className={styles.channelInfo}>
                <span className={styles.channelName}>Viber</span>
                <span className={styles.channelDetail}>{isRu ? 'Написать в Viber' : isRo ? 'Scrie pe Viber' : 'Open Viber'}</span>
              </div>
              <span className={styles.channelArrow}>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
