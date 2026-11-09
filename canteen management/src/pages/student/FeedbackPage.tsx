import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useOrders } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import { feedbackService } from '@/services/feedbackService';
import { Star, CheckCircle, ArrowLeft, MessageSquare, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';

export const FeedbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || 'ord-142';
  const { getOrderById, orders } = useOrders();
  const { user } = useAuth();
  const navigate = useNavigate();

  const order = getOrderById(orderId) || orders[0];

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
        orderId: order?.id || orderId,
        userId: user.id,
        overallRating,
        foodQuality,
        waitingTime,
        staffBehaviour,
        cleanliness,
        comments: comment,
      });
      setIsSubmitted(true);
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
          className="p-1 hover:scale-110 active:scale-95 transition-transform"
        >
          <Star
            className={`w-7 h-7 ${
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
    <div className="flex flex-col w-full pb-32 max-w-xl mx-auto px-gutter pt-space-sm gap-space-md">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-surface-container-high dark:bg-[#242424] text-on-surface dark:text-white flex items-center justify-center hover:bg-surface-container-highest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface dark:text-white">
            Order Feedback
          </h1>
          <p className="font-body-sm text-xs text-on-surface-variant dark:text-neutral-400">
            Token #{order?.tokenNumber || 'A-142'} • Campus Block 4 Canteen
          </p>
        </div>
      </div>

      {isSubmitted ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-8 text-center bg-surface-container-lowest dark:bg-[#1A1A1A] rounded-3xl border border-surface-container-high dark:border-white/5 flex flex-col items-center shadow-lg"
        >
          <div className="w-16 h-16 rounded-full bg-secondary-container dark:bg-emerald-950/60 text-secondary dark:text-emerald-300 flex items-center justify-center mb-4">
            <ThumbsUp className="w-8 h-8" />
          </div>
          <h2 className="font-headline-sm text-2xl font-bold text-on-surface dark:text-white">
            Review Submitted!
          </h2>
          <p className="font-body-md text-sm text-on-surface-variant dark:text-neutral-300 mt-2 max-w-sm">
            Thank you for helping our campus dining team maintain high food quality and fast counter service.
          </p>
          <div className="flex gap-3 mt-6">
            <Link
              to="/student"
              className="px-6 py-3 rounded-full bg-primary-container text-on-primary-container font-bold text-sm shadow-md"
            >
              Return to Home
            </Link>
            <Link
              to="/menu"
              className="px-6 py-3 rounded-full bg-surface-container dark:bg-[#242424] text-on-surface dark:text-white font-bold text-sm"
            >
              Explore Menu
            </Link>
          </div>
        </motion.div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-3xl bg-surface-container-lowest dark:bg-[#1A1A1A] border border-surface-container-high/80 dark:border-white/5 shadow-sm flex flex-col gap-5"
        >
          {/* Order Snapshot */}
          {order && (
            <div className="p-3.5 rounded-2xl bg-surface-container-low dark:bg-[#242424] border border-surface-container-high dark:border-white/5 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-on-surface dark:text-white block">
                  Token #{order.tokenNumber} ({order.orderNumber})
                </span>
                <span className="text-tertiary dark:text-neutral-400">
                  {order.items.map((i) => i.name).join(', ')}
                </span>
              </div>
              <span className="font-numeric-data font-bold text-primary dark:text-[#f08344]">
                ₹{order.totalAmount}
              </span>
            </div>
          )}

          {/* Overall Satisfaction */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-surface-container-low dark:bg-[#242424] border border-surface-container-high dark:border-white/5">
            <span className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant dark:text-neutral-400 font-bold mb-2">
              Overall Experience
            </span>
            {renderStars(overallRating, setOverallRating)}
          </div>

          {/* Sub Categories */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-on-surface dark:text-neutral-200">
                Food Quality &amp; Taste
              </span>
              {renderStars(foodQuality, setFoodQuality)}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-on-surface dark:text-neutral-200">
                Waiting Time &amp; Lead Speed
              </span>
              {renderStars(waitingTime, setWaitingTime)}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-on-surface dark:text-neutral-200">
                Staff Behaviour &amp; Dispatch
              </span>
              {renderStars(staffBehaviour, setStaffBehaviour)}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-on-surface dark:text-neutral-200">
                Cleanliness &amp; Hygiene
              </span>
              {renderStars(cleanliness, setCleanliness)}
            </div>
          </div>

          {/* Comment */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-sm text-xs font-semibold text-on-surface-variant dark:text-neutral-300">
              Suggestions or Feedback (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like? What can our chefs do better?"
              className="w-full p-3.5 rounded-xl bg-surface-container-low dark:bg-[#242424] text-on-surface dark:text-white border border-surface-container-high dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-primary-container text-on-primary-container font-label-lg font-bold shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 mt-1"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}
    </div>
  );
};
