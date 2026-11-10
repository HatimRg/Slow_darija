'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Video, Calendar, TrendingUp, Globe } from 'lucide-react';

export function BenefitsSection() {
  const t = useTranslations('landing.benefits');

  const benefits = [
    {
      icon: Video,
      title: t('benefit1_title'),
      desc: t('benefit1_desc'),
    },
    {
      icon: Calendar,
      title: t('benefit2_title'),
      desc: t('benefit2_desc'),
    },
    {
      icon: TrendingUp,
      title: t('benefit3_title'),
      desc: t('benefit3_desc'),
    },
    {
      icon: Globe,
      title: t('benefit4_title'),
      desc: t('benefit4_desc'),
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  return (
    <section className="py-24 sm:py-32">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            {t('title')}
          </motion.h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto grid max-w-5xl grid-cols-1 gap-12 sm:grid-cols-2"
        >
          {benefits.map((benefit, index) => (
            <motion.div key={index} variants={itemVariants} className="flex flex-col sm:flex-row gap-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
                <benefit.icon className="h-8 w-8" />
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
