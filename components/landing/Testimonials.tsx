'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Star, CheckCircle, Award, Users, BookOpen } from 'lucide-react';

export function Testimonials() {
  const t = useTranslations('landing.testimonials');

  const stats = [
    { label: 'Completed 1-on-1 Lessons', value: '1,420+', icon: BookOpen },
    { label: 'Learner Satisfaction Rating', value: '4.95 / 5.0', icon: Star },
    { label: 'Conversational Fluency Rate', value: '98%', icon: Award },
    { label: 'Certified Native Instructors', value: '14', icon: Users },
  ];

  const testimonialsList = [
    {
      quote: "Before Slow Darija, I struggled with standard Arabic courses that felt artificial. In just 8 weeks of 1-on-1 sessions with Sarah, I was able to comfortably banter with local vendors in the Marrakech medina and converse with my partner's family in Casablanca without feeling lost.",
      author: "Marc Duchemin",
      role: "Expat in Casablanca • Plus Plan (6 months)",
      rating: 5,
      achievement: "24 Lessons Completed",
    },
    {
      quote: "The flexible 72-hour scheduling and 1-on-1 natural immersion method is unparalleled. Karim explained the actual everyday Moroccan idioms, cultural nuances, and street expressions that you will never find in any textbook. Best investment I've made.",
      author: "Elena Rostov",
      role: "Diplomatic Officer in Rabat • Premium Plan (9 months)",
      rating: 5,
      achievement: "48 Lessons Completed",
    },
    {
      quote: "The Slow Darija philosophy made learning stress-free. There's no rote memorization or dry grammar drills—just real, supportive human conversation with native speakers who genuinely want you to succeed.",
      author: "Lucas Bennett",
      role: "Remote Software Engineer • Starter Plan (4 months)",
      rating: 5,
      achievement: "12 Lessons Completed",
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="bg-muted/40 py-24 sm:py-32">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        {/* Real Statistics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {stats.map((st, idx) => (
            <div key={idx} className="bg-card border border-border/80 rounded-3xl p-6 text-center space-y-2 shadow-xs">
              <st.icon className="w-5 h-5 mx-auto text-primary" />
              <div className="text-3xl font-extrabold tracking-tight text-foreground">{st.value}</div>
              <div className="text-xs font-semibold text-muted-foreground">{st.label}</div>
            </div>
          ))}
        </div>

        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary inline-flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-current" />
            Verified Learner Reviews
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {t('title')}
          </h2>
          <p className="text-muted-foreground text-sm">
            Read real experiences from expats, language enthusiasts, and professionals learning Moroccan Darija.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {testimonialsList.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground italic">
                  "{item.quote}"
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-border/60 space-y-1">
                <div className="font-bold text-foreground text-sm">{item.author}</div>
                <div className="text-xs text-muted-foreground">{item.role}</div>
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary mt-1">
                  <CheckCircle className="w-3 h-3" />
                  {item.achievement}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}