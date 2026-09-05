'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import styles from '../AIChat.module.css';

interface LeadCardProps {
  initialQuery?: string;
  currentInput?: string;
  messages: Array<{ role: string; content: string }>;
  locale: string;
  onSuccess: (messenger: string) => void;
  setLeadContext: (data: any) => void;
}

export function LeadCard({
  initialQuery,
  currentInput,
  messages,
  locale,
  onSuccess,
  setLeadContext
}: LeadCardProps) {
  const t = useTranslations('leadCard');

  const [messenger, setMessenger] = useState<'tg' | 'wa' | 'viber'>('tg');
  const [cardName, setCardName] = useState('');
  const [cardCompany, setCardCompany] = useState('');
  const [cardContact, setCardContact] = useState('');
  const [cardDescription, setCardDescription] = useState('');
  const [cardError, setCardError] = useState<string | null>(null);
  const [isCardSubmitted, setIsCardSubmitted] = useState(false);
  const [isSubmittingCard, setIsSubmittingCard] = useState(false);

  // Sync description with initial query if present
  useEffect(() => {
    if (initialQuery && !cardDescription) {
      setCardDescription(initialQuery);
    }
  }, [initialQuery]);

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim() || !cardContact.trim() || isSubmittingCard) return;

    setCardError(null);
    setIsSubmittingCard(true);

    // Validate real contact existence & format
    try {
      const valRes = await fetch('/api/validate-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cardName.trim(),
          contact: cardContact.trim(),
          messenger,
          locale
        }),
      });
      const valData = await valRes.json();
      if (!valData.valid) {
        setCardError(valData.error || t('defaultError'));
        setIsSubmittingCard(false);
        return;
      }
    } catch (err) {
      console.warn('Validation error:', err);
    }

    const fallbackDesc = t('descPlaceholder');
    const finalDescription = cardDescription.trim() || initialQuery || currentInput || fallbackDesc;
    const mName = messenger === 'tg' ? 'Telegram' : messenger === 'wa' ? 'WhatsApp' : 'Viber';

    const cardData = {
      clientName: cardName.trim(),
      company: cardCompany.trim(),
      description: finalDescription,
      messenger: mName,
      contactHandle: cardContact.trim(),
      clientInput: finalDescription,
      conversationHistory: messages.map(m => ({ role: m.role, text: m.content }))
    };

    setLeadContext(cardData);

    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'lead_card', cardData, locale }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingCard(false);
      setIsCardSubmitted(true);
      setCardError(null);
      onSuccess(mName);
    }
  };

  if (isCardSubmitted) {
    return (
      <div className={styles.submittedPill}>
        <span className={styles.submittedCheck}>✓</span>
        <div className={styles.submittedContent}>
          <p className={styles.submittedTitle}>{t('submittedTitle')}</p>
          <p className={styles.submittedSubtitle}>
            {t('submittedSubtitle', { messenger: messenger.toUpperCase() })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.leadCard}>
      <div className={styles.leadCardHeader}>
        <span className={styles.leadCardBadge}>{t('badge')}</span>
        <span className={styles.leadCardDot}>● {t('dot')}</span>
      </div>

      <form onSubmit={handleCardSubmit} className={styles.leadCardForm}>
        <div>
          <label className={styles.leadCardLabel}>{t('channelPrompt')}</label>
          <div className={styles.leadCardTabs}>
            {[
              { id: 'tg', label: 'Telegram' },
              { id: 'wa', label: 'WhatsApp' },
              { id: 'viber', label: 'Viber' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setMessenger(item.id as 'tg' | 'wa' | 'viber');
                  if (cardError) setCardError(null);
                }}
                className={`${styles.leadCardTab} ${messenger === item.id ? styles.leadCardTabActive : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className={styles.leadCardFieldsRow}>
            <input
              type="text"
              required
              value={cardName}
              onChange={(e) => {
                setCardName(e.target.value);
                if (cardError) setCardError(null);
              }}
              placeholder={t('namePlaceholder')}
              className={styles.leadCardInput}
            />
            <input
              type="text"
              value={cardCompany}
              onChange={(e) => setCardCompany(e.target.value)}
              placeholder={t('companyPlaceholder')}
              className={styles.leadCardInput}
            />
          </div>
          <input
            type="text"
            required
            value={cardContact}
            onChange={(e) => {
              setCardContact(e.target.value);
              if (cardError) setCardError(null);
            }}
            placeholder={
              messenger === 'tg'
                ? t('contactTgPlaceholder')
                : messenger === 'wa'
                ? t('contactWaPlaceholder')
                : t('contactViberPlaceholder')
            }
            className={styles.leadCardInput}
          />
          <textarea
            rows={2}
            value={cardDescription}
            onChange={(e) => setCardDescription(e.target.value)}
            placeholder={t('descPlaceholder')}
            className={styles.leadCardTextarea}
          />
        </div>

        <div>
          {cardError && (
            <div className={styles.cardErrorAlert}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{cardError}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmittingCard || !cardName.trim() || !cardContact.trim()}
            className={styles.leadCardSubmitBtn}
          >
            {isSubmittingCard ? t('submittingBtn') : t('submitBtn')}
          </button>
          <div className={styles.leadCardDisclaimer}>{t('disclaimer')}</div>
        </div>
      </form>
    </div>
  );
}
