import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Scissors, Calendar, Gift, User, Star } from 'lucide-react';
import { GloLogo } from '@/components/GloLogo';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api-client';
import type { Manicurist } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
const featureVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.5,
    },
  }),
};
const fetchManicurists = async (): Promise<Manicurist[]> => {
  return api<Manicurist[]>('/api/admin/manicurists');
};
const getDashboardLink = (role: string | null) => {
  switch (role) {
    case 'manicurist': return '/dashboard';
    case 'client': return '/client-dashboard';
    case 'admin': return '/admin/dashboard';
    default: return '/login';
  }
};
export function HomePage() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const userRole = useAuthStore(s => s.userRole);
  const { data: manicurists, isLoading: isLoadingManicurists } = useQuery<Manicurist[]>({
    queryKey: ['manicurists'],
    queryFn: fetchManicurists,
  });
  const features = [
    { icon: <Scissors className="h-8 w-8 text-brand-rose" />, title: t('landing.features.list.services.title'), description: t('landing.features.list.services.description') },
    { icon: <Calendar className="h-8 w-8 text-brand-rose" />, title: t('landing.features.list.scheduling.title'), description: t('landing.features.list.scheduling.description') },
    { icon: <Gift className="h-8 w-8 text-brand-rose" />, title: t('landing.features.list.loyalty.title'), description: t('landing.features.list.loyalty.description') },
  ];
  return (
    <div className="min-h-screen bg-brand-cream text-brand-charcoal font-sans">
      <header className="sticky top-0 z-50 bg-brand-cream/80 backdrop-blur-lg border-b border-brand-charcoal/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-2">
              <GloLogo className="h-8 w-8 text-brand-rose" />
              <span className="text-2xl font-bold tracking-tight">Glo</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="font-medium hover:text-brand-rose transition-colors">{t('landing.nav.features')}</a>
              <a href="#artisans" className="font-medium hover:text-brand-rose transition-colors">{t('landing.nav.artisans')}</a>
              <a href="#pricing" className="font-medium hover:text-brand-rose transition-colors">{t('landing.nav.pricing')}</a>
            </nav>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              {isAuthenticated ? (
                <Button className="bg-brand-charcoal hover:bg-brand-charcoal/90 text-white" asChild>
                  <Link to={getDashboardLink(userRole)}>Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/login">{t('landing.nav.login')}</Link>
                  </Button>
                  <Button className="bg-brand-charcoal hover:bg-brand-charcoal/90 text-white" asChild>
                    <Link to="/login">{t('landing.nav.getStarted')}</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      <main>
        <section className="py-24 md:py-32 lg:py-40 text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">{t('landing.hero.title')}</motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-2xl mx-auto text-lg md:text-xl text-brand-charcoal/70 mb-8">{t('landing.hero.subtitle')}</motion.p>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
              <Button size="lg" className="bg-brand-rose hover:bg-brand-rose/90 text-brand-charcoal text-lg px-8 py-6" asChild>
                <Link to="/login">{t('landing.hero.cta')}</Link>
              </Button>
            </motion.div>
          </div>
        </section>
        <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">{t('landing.features.title')}</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-brand-charcoal/70">{t('landing.features.subtitle')}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <motion.div key={feature.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={featureVariants}>
                  <Card className="text-center h-full shadow-sm hover:shadow-lg transition-shadow">
                    <CardHeader><div className="mx-auto bg-brand-rose/10 p-4 rounded-full w-fit mb-4">{feature.icon}</div><CardTitle>{feature.title}</CardTitle></CardHeader>
                    <CardContent><p className="text-brand-charcoal/70">{feature.description}</p></CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        <section id="artisans" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">{t('landing.artisans.title')}</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-brand-charcoal/70">{t('landing.artisans.subtitle')}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {isLoadingManicurists ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)
              ) : (
                manicurists?.slice(0, 3).map((artisan, i) => (
                  <motion.div key={artisan.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={featureVariants}>
                    <Card className="text-center h-full shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                      <div className="bg-brand-rose/20 h-24 flex items-center justify-center">
                        <User className="h-12 w-12 text-brand-rose" />
                      </div>
                      <CardHeader><CardTitle>{artisan.name}</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-center items-center text-sm text-brand-charcoal/70">
                          <Star className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500" /> 5.0 {t('landing.artisans.reviews', { count: 24 })}
                        </div>
                        <Button asChild variant="outline">
                          <Link to={`/book/${artisan.id}`}>{t('landing.artisans.cta')}</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>
        <section id="pricing" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">{t('landing.pricing.title')}</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-brand-charcoal/70">{t('landing.pricing.subtitle')}</p>
            </div>
            <div className="flex justify-center">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                <Card className="w-full max-w-sm shadow-lg border-2 border-brand-rose">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{t('landing.pricing.plans.solo.title')}</CardTitle>
                    <p className="text-4xl font-bold pt-4">{t('landing.pricing.plans.solo.price')}<span className="text-lg font-normal text-brand-charcoal/70">{t('landing.pricing.plans.solo.period')}</span></p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {(t('landing.pricing.plans.solo.features', { returnObjects: true }) as string[]).map((item: string) => (
                        <li key={item} className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /><span>{item}</span></li>
                      ))}
                    </ul>
                    <Button className="w-full bg-brand-charcoal hover:bg-brand-charcoal/90 text-white" asChild><Link to="/login">{t('landing.pricing.plans.solo.cta')}</Link></Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-8 border-t border-brand-charcoal/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-brand-charcoal/60">
          <p>&copy; {new Date().getFullYear()} Glo. All rights reserved.</p>
          <p className="mt-2 text-sm">{t('landing.footer.builtWith')}</p>
        </div>
      </footer>
    </div>
  );
}