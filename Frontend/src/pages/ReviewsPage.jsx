import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedReviews } from '../api/reviewService';
import { AuthContext } from '../context/MemberAuthContext';
import MyReview from './MyReview';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';
import { Button } from '@/components/ui/button';

// --- Emerald/Glass Review Card ---
const ReviewCard = ({ review }) => (
  <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-6 rounded-2xl shadow-lg flex flex-col h-full border border-white/30 dark:border-zinc-800 transition-transform hover:-translate-y-1 hover:shadow-2xl">
    <div className="flex items-center justify-between mb-3">
      <FaQuoteLeft className="text-emerald-300 text-xl" />
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'} />
        ))}
      </div>
    </div>
    <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-2">{review.title}</h3>
    <p className="text-gray-600 dark:text-gray-300 text-base mb-4 flex-grow">“{review.message}”</p>
    <p className="font-semibold text-right mt-auto text-gray-700 dark:text-gray-400">— {review.memberId?.firstName || 'A Member'}</p>
  </div>
);

const ReviewsPage = () => {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeaturedReviews = useCallback(async () => {
    try {
      const data = await getFeaturedReviews();
      setReviews(data);
    } catch (error) {
      console.error('Failed to fetch featured reviews', error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchFeaturedReviews().finally(() => setLoading(false));
  }, [fetchFeaturedReviews]);

  // Use existing asset from /public/assets for consistency with other pages
  const backgroundImageUrl = '/assets/review-bg.jpg.jpg';

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      aria-label="Members sharing testimonials backdrop"
    >
      {/* Dark overlay */}
      <div className="min-h-screen w-full bg-slate-950/60 backdrop-blur-sm">
        {/* Page header */}
        <header className="container mx-auto px-4 pt-16 md:pt-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              What Our <span className="text-emerald-300">Members</span> Say
            </h1>
            <p className="text-white/80 mt-3">
              Real experiences from the SportNest community. Share yours and inspire others.
            </p>
          </div>
        </header>

        <main className="container mx-auto px-4 pb-16 md:pb-24">
          <style>{`
    /* Scoped overrides for MyReview form to match emerald glass UI */
    .myreview input[type="text"],
    .myreview input[type="email"],
    .myreview input[type="number"],
    .myreview select,
    .myreview textarea {
      background: rgba(255,255,255,0.92) !important;
      color: #111827 !important; /* gray-900 */
      border: 1px solid rgba(15,23,42,0.12) !important; /* slate-900 alpha */
      border-radius: 0.75rem !important; /* rounded-xl */
    }
    .myreview input::placeholder,
    .myreview textarea::placeholder {
      color: #9CA3AF !important; /* gray-400 */
    }
    .myreview button[type="submit"],
    .myreview .btn-primary {
      background: #059669 !important; /* emerald-600 */
      color: #ffffff !important;
      border-color: transparent !important;
    }
  `}</style>
          {/* Create / My Review area */}
          <section className="mt-10 md:mt-12 mb-10">
            {user ? (
              <div className="myreview bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border border-white/30 dark:border-zinc-800 rounded-2xl shadow-lg p-6">
                <MyReview onReviewUpdate={fetchFeaturedReviews} />
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-lg text-center border border-white/30">
                <h2 className="text-xl font-bold mb-2 text-gray-900">Share Your Experience</h2>
                <p className="text-gray-600 mb-4">You must be logged in as a member to write a review.</p>
                <Link to="/login">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Login to Write a Review</Button>
                </Link>
              </div>
            )}
          </section>

          {/* Featured reviews grid */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-white">Member Testimonials</h2>
            {loading ? (
              <p className="text-center text-white/80">Loading reviews...</p>
            ) : reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {reviews.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-200 bg-black/30 p-6 rounded-2xl border border-white/10">
                No reviews have been featured yet. Be the first to share your story!
              </p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default ReviewsPage;