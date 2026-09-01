export interface ServiceMetric {
  title: string;
  desc: string;
  highlight?: boolean;
}

export interface ServiceFeature {
  title: string;
  desc: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  tags: string[];
  duration: string;
  description: string;
  index?: number;
  categoryBadge?: string;
  stack?: string;
  metrics?: ServiceMetric[];
  features?: ServiceFeature[];
  footerNote?: string;
  ctaText?: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

export interface Location {
  city: string;
  desc: string;
}

export interface CaseItem {
  id: number;
  title: string;
  category: string;
  color: string;
  tags: string[];
}
