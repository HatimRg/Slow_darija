'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Headphones, Users, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MethodSection() {
  const t = useTranslations('landing.method');

  const steps = [
    {
      icon: Headphones,
      title: t('step1_title'),
      desc: t('step1_desc'),
      number: '01',
    },
    {
      icon: Users,
      title: t('step2_title'),
      desc: t('step2_desc'),
      number: '02',
    },
    {
      icon: Sparkles,
      title: t('step3_title'),
      desc: t('step3_desc'),
      number: '03',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="bg-secondary/30 py-24 sm:py-32">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            {t('title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            {t('subtitle')}
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="relative flex flex-col rounded-2xl bg-card p-8 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <step.icon className="h-6 w-6" />
                </div>
                <span className="flex h-8 items-center rounded-full bg-orange-100 px-3 text-sm font-medium text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                  {step.number}
                </span>
              </div>
              <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
