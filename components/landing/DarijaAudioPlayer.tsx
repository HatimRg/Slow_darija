'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Play, Pause, Sparkles, Sliders, Snail, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Phrase {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  context: string;
}

const PHRASES: Phrase[] = [
  {
    id: '1',
    arabic: 'السّلام عليكم',
    transliteration: 'Salam 3likoum',
    translation: 'Peace be upon you / Hello',
    context: 'Everyday universal Moroccan greeting',
  },
  {
    id: '2',
    arabic: 'لاباس عليك؟',
    transliteration: 'Labas 3lik?',
    translation: 'How are you doing?',
    context: 'Friendly informal inquiry',
  },
  {
    id: '3',
    arabic: 'كلشي بخير، الحمد لله',
    transliteration: 'Koulchi bikhir, l-hamdullah',
    translation: 'Everything is great, thank God',
    context: 'Natural positive response',
  },
  {
    id: '4',
    arabic: 'بشوية بشوية',
    transliteration: 'B chwiya b chwiya',
    translation: 'Slowly, step by step',
    context: 'The Slow Darija philosophy',
  },
  {
    id: '5',
    arabic: 'شكراً بزاف',
    transliteration: 'Choukran bzaf',
    translation: 'Thank you very much',
    context: 'Warm Moroccan gratitude',
  },
];

export function DarijaAudioPlayer() {
  const [selectedPhrase, setSelectedPhrase] = React.useState<Phrase>(PHRASES[0]);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isSlowMode, setIsSlowMode] = React.useState(true);

  const playAudio = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    // Use Web Speech Synthesis if available for natural pronunciation
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(selectedPhrase.arabic);
      utterance.lang = 'ar-MA'; // Moroccan Arabic locale
      utterance.rate = isSlowMode ? 0.75 : 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlaying(false), 2000);
    }
  };

  return (
    <section className="py-20 bg-primary/5 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Audio Preview
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Listen to Real Spoken Darija
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Click any phrase to hear natural Moroccan pronunciation. Toggle Slow Mode to absorb each syllable at your own pace.
          </p>
        </div>

        {/* Phrase Selector Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {PHRASES.map((phrase) => {
            const isSelected = selectedPhrase.id === phrase.id;
            return (
              <button
                key={phrase.id}
                onClick={() => {
                  setSelectedPhrase(phrase);
                  setIsPlaying(false);
                }}
                className={cn(
                  'px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-2',
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-md scale-105'
                    : 'bg-card border border-border/80 hover:bg-muted text-foreground'
                )}
              >
                <span className="font-arabic text-sm">{phrase.arabic}</span>
                <span className="opacity-80">({phrase.transliteration})</span>
              </button>
            );
          })}
        </div>

        {/* Active Phrase Player Card */}
        <div className="bg-card border border-border/80 rounded-3xl p-8 sm:p-12 shadow-lg max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <div className="text-4xl sm:text-5xl font-bold text-foreground tracking-wide font-arabic leading-relaxed">
              {selectedPhrase.arabic}
            </div>
            <div className="text-xl sm:text-2xl font-semibold text-primary">
              {selectedPhrase.transliteration}
            </div>
            <div className="text-base text-muted-foreground">
              "{selectedPhrase.translation}"
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs">
              Context: {selectedPhrase.context}
            </div>
          </div>

          {/* Animated Waveform Visualizer */}
          <div className="flex items-center justify-center gap-1.5 h-12">
            {[40, 70, 90, 60, 100, 80, 50, 95, 75, 45, 85, 60].map((h, i) => (
              <span
                key={i}
                style={{
                  height: isPlaying ? `${h}%` : '20%',
                  transition: 'height 0.2s ease-in-out',
                }}
                className={cn(
                  'w-1.5 rounded-full bg-primary/40',
                  isPlaying && 'bg-primary animate-pulse'
                )}
              />
            ))}
          </div>

          {/* Player Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-border/60">
            <Button
              size="lg"
              onClick={playAudio}
              className="gap-2.5 px-8 text-base shadow-md w-full sm:w-auto cursor-pointer"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              <span>{isPlaying ? 'Playing...' : 'Listen Phrase'}</span>
            </Button>

            <button
              onClick={() => setIsSlowMode(!isSlowMode)}
              className={cn(
                'px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center',
                isSlowMode
                  ? 'bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300'
                  : 'bg-muted border-border text-muted-foreground'
              )}
            >
              {isSlowMode ? <Snail className="w-4 h-4 text-orange-600" /> : <Zap className="w-4 h-4" />}
              <span>{isSlowMode ? 'Slow Darija (0.75x)' : 'Normal Speed (1.0x)'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}