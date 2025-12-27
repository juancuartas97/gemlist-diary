import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Sparkles, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuestCompleteAnimationProps {
  open: boolean;
  onClose: () => void;
  questName: string;
  questType: 'holy_grail_artist' | 'holy_grail_venue' | 'target_event';
  gemColor: string;
}

export const QuestCompleteAnimation = ({
  open,
  onClose,
  questName,
  questType,
  gemColor,
}: QuestCompleteAnimationProps) => {
  const [stage, setStage] = useState<'intro' | 'reveal' | 'complete'>('intro');
  
  useEffect(() => {
    if (open) {
      setStage('intro');
      
      const timer1 = setTimeout(() => setStage('reveal'), 800);
      const timer2 = setTimeout(() => setStage('complete'), 2000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [open]);
  
  const getQuestTypeLabel = () => {
    switch (questType) {
      case 'holy_grail_artist': return 'Holy Grail Artist';
      case 'holy_grail_venue': return 'Holy Grail Venue';
      case 'target_event': return 'Target Event';
      default: return 'Quest';
    }
  };
  
  const getQuestEmoji = () => {
    switch (questType) {
      case 'holy_grail_artist': return '🏆';
      case 'holy_grail_venue': return '🏛️';
      case 'target_event': return '🎯';
      default: return '⭐';
    }
  };
  
  if (!open) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
      >
        {/* Backdrop */}
        <motion.div 
          className="absolute inset-0 bg-black/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        
        {/* Radial glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: stage === 'reveal' || stage === 'complete' ? 0.6 : 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: `radial-gradient(circle at center, ${gemColor}40 0%, transparent 60%)`,
          }}
        />
        
        {/* Particle effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {stage !== 'intro' && Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: gemColor }}
              initial={{ 
                opacity: 0,
                x: '50vw',
                y: '50vh',
                scale: 0,
              }}
              animate={{ 
                opacity: [0, 1, 0],
                x: `${Math.random() * 100}vw`,
                y: `${Math.random() * 100}vh`,
                scale: [0, 1, 0],
              }}
              transition={{ 
                duration: 2,
                delay: i * 0.05,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-6 p-8">
          {/* Quest icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: stage === 'intro' ? 0 : 1,
              rotate: 0,
            }}
            transition={{ 
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
            className="relative"
          >
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, ${gemColor}40, ${gemColor})`,
                boxShadow: `0 0 60px ${gemColor}80, 0 0 120px ${gemColor}40`,
              }}
            >
              <Target className="w-12 h-12 text-white" />
            </div>
            
            {/* Sparkle effects */}
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{ 
                rotate: [0, 15, -15, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
              }}
            >
              <Sparkles className="w-8 h-8 text-amber-400" />
            </motion.div>
          </motion.div>
          
          {/* Mission Complete text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: stage !== 'intro' ? 1 : 0,
              y: stage !== 'intro' ? 0 : 20,
            }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-2">
              QUEST COMPLETE!
            </h2>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <span>{getQuestEmoji()}</span>
              <span>{getQuestTypeLabel()}</span>
            </div>
          </motion.div>
          
          {/* Quest name */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: stage === 'complete' ? 1 : 0,
              scale: stage === 'complete' ? 1 : 0.8,
            }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div 
              className="text-2xl font-bold"
              style={{ color: gemColor }}
            >
              {questName}
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 font-semibold">+Q Modifier Unlocked!</span>
            </div>
          </motion.div>
          
          {/* Continue button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: stage === 'complete' ? 1 : 0,
              y: stage === 'complete' ? 0 : 20,
            }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={onClose}
              variant="neon"
              size="lg"
              className="min-w-[200px]"
            >
              Claim Gem
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
