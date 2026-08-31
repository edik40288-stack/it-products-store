import Header from '@/components/Header/Header';
import Hero from '@/components/Hero/Hero';
import ServicesGrid from '@/components/ServicesGrid/ServicesGrid';
import Contact from '@/components/Contact/Contact';
import Footer from '@/components/Footer/Footer';

import { WebGLBackground, AIChat } from '@/components/DynamicImports';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <>
      {/* Fixed WebGL background */}
      <WebGLBackground />

      {/* Navigation */}
      <Header locale={locale} />

      {/* Main content */}
      <main>
        <Hero />
        <ServicesGrid />
        <Contact />
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating AI chat widget */}
      <AIChat />
    </>
  );
}
