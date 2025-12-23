import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FloatingParticles } from '@/components/FloatingParticles';
import { GemIcon } from '@/components/GemIcon';
import { TasteMapVisual } from '@/components/TasteMapVisual';
import { MapVisual } from '@/components/MapVisual';
import { PaginationDots } from '@/components/PaginationDots';
import { completeOnboarding } from '@/lib/storage';

interface Slide {
  id: string;
  headline: string;
  highlightWord: string;
  subtitle: string;
  cta: string;
  visual: React.ReactNode;
}

const slides: Slide[] = [
  {
    id: 'collect',
    headline: 'Collect Gems',
    highlightWord: 'Gems',
    subtitle: 'Attend a set, collect a gem, remember it forever.',
    cta: 'Start Your Collection',
    visual: (
      <div className="flex justify-center items-center py-8">
        <div className="relative">
          <GemIcon className="w-32 h-32" glowing />
          <div className="absolute -top-4 -right-4">
            <GemIcon className="w-12 h-12 opacity-60" variant="purple" />
          </div>
          <div className="absolute -bottom-2 -left-6">
            <GemIcon className="w-10 h-10 opacity-50" variant="pink" />
          </div>
          <div className="absolute top-1/2 -right-8">
            <GemIcon className="w-8 h-8 opacity-40" variant="blue" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'taste',
    headline: 'Discover Your Vibe',
    highlightWord: 'Vibe',
    subtitle: 'Map your musical taste and find your sonic identity.',
    cta: 'Find My Taste',
    visual: <TasteMapVisual />,
  },
  {
    id: 'explore',
    headline: 'Explore the Scene',
    highlightWord: 'Scene',
    subtitle: 'Find events, venues, and DJs that match your vibe.',
    cta: 'Explore Events Now',
    visual: (
      <div className="py-4">
        <MapVisual />
      </div>
    ),
  },
];

const Onboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleSkip = useCallback(() => {
    completeOnboarding();
    navigate('/auth');
  }, [navigate]);

  const handleNext = useCallback(() => {
    if (currentSlide === slides.length - 1) {
      completeOnboarding();
      navigate('/auth');
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  }, [currentSlide, navigate]);

  const handlePrev = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide]);

  const slide = slides[currentSlide];

  // Split headline to highlight the keyword
  const headlineParts = slide.headline.split(slide.highlightWord);

  return (
    <div className="min-h-screen flex flex-col bg-cosmic">
      <FloatingParticles />
      
      <div className="w-full max-w-[420px] mx-auto flex flex-col min-h-screen px-6 py-8 relative z-10">
        {/* Skip button */}
        <div className="flex justify-end mb-4">
          <Button variant="skip" onClick={handleSkip}>
            Skip
          </Button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Headline */}
          <h1 className="text-4xl font-bold text-center mb-4 animate-fade-in">
            {headlineParts[0]}
            <span className="text-primary neon-text">{slide.highlightWord}</span>
            {headlineParts[1]}
          </h1>

          {/* Subtitle */}
          <p className="text-muted-foreground text-center text-lg mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {slide.subtitle}
          </p>

          {/* Visual */}
          <div className="flex-1 flex items-center justify-center min-h-[280px] animate-scale-in" style={{ animationDelay: '0.2s' }}>
            {slide.visual}
          </div>
        </div>

        {/* Bottom controls */}
        <div className="space-y-6 pb-4">
          {/* Pagination */}
          <PaginationDots
            total={slides.length}
            current={currentSlide}
            onDotClick={setCurrentSlide}
          />

          {/* Navigation */}
          <div className="flex items-center gap-4">
            {currentSlide > 0 && (
              <Button
                variant="glass"
                size="icon"
                onClick={handlePrev}
                className="shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
            
            <Button
              variant="neon"
              size="lg"
              onClick={handleNext}
              className="flex-1"
            >
              {slide.cta}
              {currentSlide < slides.length - 1 && (
                <ChevronRight className="w-5 h-5 ml-1" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
