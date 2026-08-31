'use client';

import { useTranslations, useLocale } from 'next-intl';
import styles from './Contact.module.css';

export default function Contact() {
  const t = useTranslations('Contact');
  const locale = useLocale();
  const isRu = locale === 'ru';

  return (
    <section className={styles.section} id="contact">
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            <span>{isRu ? 'Прямая связь с нами' : 'Direct Contact'}</span>
          </div>

          <h2 className={styles.title}>
            {isRu ? 'Обсудить ' : 'Discuss '}
            <span className={styles.highlight}>{isRu ? 'ваш проект' : 'your project'}</span>
          </h2>

          <p className={styles.subtitle}>
            {isRu 
              ? 'Выберите удобный мессенджер или напишите на почту. Отвечаем быстро, консультируем и рассчитываем окупаемость без навязывания.'
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
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.716-.962 4.084-1.362 5.752-.169.706-.432.943-.685.966-.55.05-.967-.364-1.5-.713-.834-.546-1.305-.886-2.115-1.42-.936-.617-.329-.955.204-1.51.14-.145 2.56-2.348 2.607-2.548.006-.025.011-.12-.046-.17-.057-.05-.14-.033-.2-.02-.086.02-1.458.928-4.116 2.723-.39.268-.742.399-1.058.392-.347-.008-1.015-.197-1.512-.358-.61-.198-1.094-.302-1.052-.638.022-.175.263-.354.723-.538 2.83-1.232 4.718-2.045 5.663-2.438 2.697-1.124 3.257-1.32 3.623-1.326.08 0 .26.02.376.115.098.08.125.187.137.262.012.076.027.248.016.385z"/>
                </svg>
              </div>
              <div className={styles.channelInfo}>
                <span className={styles.channelName}>Telegram</span>
                <span className={styles.channelDetail}>{isRu ? 'Написать в Telegram' : 'Open Telegram'}</span>
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
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </div>
              <div className={styles.channelInfo}>
                <span className={styles.channelName}>WhatsApp</span>
                <span className={styles.channelDetail}>{isRu ? 'Написать в WhatsApp' : 'Open WhatsApp'}</span>
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
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div className={styles.channelInfo}>
                <span className={styles.channelName}>{isRu ? 'Почта' : 'Email'}</span>
                <span className={styles.channelDetail}>{isRu ? 'Отправить письмо' : 'Send an Email'}</span>
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
                  <path d="M17.5 2C10.6 2 5 7.4 5 14.1c0 2.4.7 4.7 2 6.6L5.5 25l4.5-1.5c2.1 1.2 4.7 1.8 7.5 1.8 6.9 0 12.5-5.4 12.5-12.1S24.4 2 17.5 2zm5.7 15.6c-.3.8-1.5 1.5-2.2 1.6-.6.1-1.3.1-4.2-1.1-3.6-1.5-5.9-5.1-6-5.3-.1-.2-1.5-2-1.5-3.8 0-1.8.9-2.7 1.3-3.1.3-.3.8-.5 1.2-.5.1 0 .3 0 .4.1.4 0 .6.1.8.6.3.8 1.1 2.6 1.2 2.8.1.2.1.4 0 .6-.1.2-.2.4-.4.6-.2.2-.3.4-.5.6-.2.2-.4.4-.2.8.3.5 1.2 2 2.6 3.2 1.8 1.6 3.3 2.1 3.8 2.3.4.2.7.1.9-.1.3-.3.9-1.1 1.2-1.4.3-.4.6-.3.9-.2.4.1 2.3 1.1 2.7 1.3.4.2.7.3.8.5.1.2.1 1.1-.2 1.9z" transform="scale(0.8) translate(3, 3)"/>
                </svg>
              </div>
              <div className={styles.channelInfo}>
                <span className={styles.channelName}>Viber</span>
                <span className={styles.channelDetail}>{isRu ? 'Написать в Viber' : 'Open Viber'}</span>
              </div>
              <span className={styles.channelArrow}>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
