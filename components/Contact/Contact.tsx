import { useTranslations } from 'next-intl';
import styles from './Contact.module.css';

export default function Contact() {
  const t = useTranslations('Contact');

  return (
    <section className={styles.section} id="contact">
      <div className={styles.container}>
        <div className={styles.content}>
          <h2 className={styles.title}>
            Ready to <span className={styles.highlight}>ignite</span> your next project?
          </h2>
          <p className={styles.subtitle}>
            Let's discuss how we can help you build digital products that scale.
            Reach out via Telegram for a quick chat or drop us an email.
          </p>
          
          <div className={styles.actions}>
            <a href="https://t.me/mindcore_studio" target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
              Chat on Telegram
            </a>
            <a href="mailto:newbusiness@mindcore.studio" className={styles.btnSecondary}>
              newbusiness@mindcore.studio
            </a>
          </div>
        </div>
        
        <div className={styles.footer}>
          <div className={styles.branding}>
            <span className={styles.logo}>MINDCORE</span>
            <span className={styles.slogan}>A booster rocket for digital product teams</span>
          </div>
          <div className={styles.copyright}>
            © {new Date().getFullYear()} Mindcore Studio. All rights reserved.
          </div>
        </div>
      </div>
    </section>
  );
}
