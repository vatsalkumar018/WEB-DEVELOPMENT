import React, { useState } from 'react';
import { Star, CheckCircle, X } from 'lucide-react';
import { feedbackService } from '@/services/feedbackService';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedbackModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  orderId,
  isOpen,
  onClose,
  onSubmitted,
}) => {
  const { user } = useAuth();
  const [overallRating, setOverallRating] = useState<number>(5);
  const [foodQuality, setFoodQuality] = useState<number>(5);
  const [waitingTime, setWaitingTime] = useState<number>(4);
  const [staffBehaviour, setStaffBehaviour] = useState<number>(5);
  const [cleanliness, setCleanliness] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      await feedbackService.submitFeedback({
        orderId,
        userId: user.id,
        overallRating,
        foodQuality,
        waitingTime,
        staffBehaviour,
        cleanliness,
        comments: comment,
      });
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        onSubmitted?.();
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (val: number, setVal: (n: number) => void) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setVal(star)}
          className="p-1 text-surface-container-high hover:scale-110 active:scale-95 transition-transform"
        >
          <Star
            className={`w-6 h-6 ${
              star <= val
                ? 'text-amber-400 fill-amber-400'
                : 'text-surface-container-highest dark:text-neutral-700'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md bg-surface-container-lowest dark:bg-[#1A1A1A] rounded-3xl p-6 shadow-2xl z-10 border border-surface-container-high/80 dark:border-white/10"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container dark:bg-neutral-800 text-on-surface dark:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="w-16 h-16 text-secondary mb-3 animate-bounce" />
                <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">
                  Thank You for Your Feedback!
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-neutral-400 mt-1">
                  Your review helps our campus kitchen team improve every meal.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">
                    Rate Your Experience
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-neutral-400 mt-0.5">
                    How was your meal and counter pickup today?
                  </p>
                </div>

                {/* Overall Rating Hero */}
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-surface-container-low dark:bg-[#242424] border border-surface-container-high dark:border-white/5">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant dark:text-neutral-400 font-semibold mb-1">
                    Overall Satisfaction
                  </span>
                  {renderStars(overallRating, setOverallRating)}
                </div>

                {/* Categories */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-body-md text-on-surface dark:text-neutral-300">
                      Food Quality
                    </span>
                    {renderStars(foodQuality, setFoodQuality)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-body-md text-on-surface dark:text-neutral-300">
                      Waiting Time
                    </span>
                    {renderStars(waitingTime, setWaitingTime)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-body-md text-on-surface dark:text-neutral-300">
                      Staff Behaviour
                    </span>
                    {renderStars(staffBehaviour, setStaffBehaviour)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-body-md text-on-surface dark:text-neutral-300">
                      Cleanliness
                    </span>
                    {renderStars(cleanliness, setCleanliness)}
                  </div>
                </div>

                {/* Optional Comment */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant dark:text-neutral-400 font-semibold">
                    Comments or Suggestions (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us what you loved or how we can improve..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-3 rounded-xl bg-surface-container-low dark:bg-[#242424] text-on-surface dark:text-white border border-surface-container-high dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg font-bold shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center justify-center"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

