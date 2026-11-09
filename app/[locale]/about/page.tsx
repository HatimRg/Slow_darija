'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Sparkles, Heart, Users, MapPin, CheckCircle2, BookOpen } from 'lucide-react';

export default function AboutPage() {
  const t = useTranslations('about');

  const teachers = [
    {
      name: 'Sarah Kadiri',
      city: 'Casablanca, Morocco',
      specialty: 'Everyday Spoken Fluency & Cultural Idioms',
      experience: '7 years teaching Darija to international professionals & expats',
      languages: 'Darija, French, English, Modern Standard Arabic',
    },
    {
      name: 'Karim Benjelloun',
      city: 'Rabat, Morocco',
      specialty: 'Conversational Immersion & Embassy Prep',
      experience: '9 years university-level Moroccan language instruction',
      languages: 'Darija, English, French, Spanish',
    },
    {
      name: 'Amina Mansouri',
      city: 'Marrakech, Morocco',
      specialty: 'Pronunciation Mastery & Market/Family Dialogue',
      experience: '6 years cross-cultural communication coach',
      languages: 'Darija, Amazigh (Tashelhit), French, English',
    },
  ];

  const pillars = [
    {
      title: 'No Textbook Fatigue',
      desc: 'Standard textbooks focus on formal Arabic (MSA) which nobody speaks in Moroccan cafés or souks. We focus exclusively on authentic spoken Moroccan Darija from lesson one.',
    },
    {
      title: 'Slow, Stress-Free Cadence',
      desc: 'We break down complex phonetics and fast Moroccan speech rhythms into manageable, bite-sized conversational patterns at 0.75x speed before building to natural cadence.',
    },
    {
      title: '1-on-1 Human Immersion',
      desc: 'Language is human connection. Every lesson is a live 60-minute session with dedicated native speakers who adapt to your background, goals, and interests.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 sm:py-28 px-6 max-w-5xl mx-auto text-center space-y-6">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Our Philosophy & Story
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Learn Moroccan Darija Naturally.
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Slow Darija was founded in 2024 to solve a universal frustration: traditional Arabic courses move too fast, teach formal dialect that locals do not speak, and ignore the warm conversational nuances of Moroccan culture.
          </p>
        </section>

        {/* 3 Core Pillars */}
        <section className="py-16 bg-muted/40 border-y border-border/80 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-12">
              The Three Pillars of Slow Darija
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pillars.map((p, i) => (
                <div key={i} className="bg-card border border-border/80 rounded-3xl p-8 shadow-xs space-y-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    0{i + 1}
                  </div>
                  <h3 className="text-xl font-bold">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Certified Native Teachers */}
        <section className="py-20 px-6 max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary inline-flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Native Instructors
            </span>
            <h2 className="text-3xl font-bold tracking-tight">Meet Your Moroccan Teachers</h2>
            <p className="text-sm text-muted-foreground">
              All instructors are native Moroccan speakers with professional cross-cultural teaching backgrounds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teachers.map((t, idx) => (
              <div key={idx} className="bg-card border border-border/80 rounded-3xl p-8 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{t.name}</h3>
                    <div className="text-xs text-primary font-medium flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{t.city}</span>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-foreground">{t.specialty}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.experience}</p>
                </div>

                <div className="pt-4 border-t border-border/60 text-[11px] text-muted-foreground">
                  <strong>Languages:</strong> {t.languages}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}