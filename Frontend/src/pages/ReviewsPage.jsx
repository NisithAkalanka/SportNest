import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedReviews } from '../api/reviewService';
import { AuthContext } from '../context/MemberAuthContext'; 
import MyReview from './MyReview';
import { FaStar } from 'react-icons/fa';
import { Button } from '@/components/ui/button';

const ReviewCard = ({ review }) => (
    <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm p-6 rounded-lg shadow-lg flex flex-col h-full border border-gray-200 dark:border-zinc-800">
        <div className="flex items-center mb-4">
            {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"} />
            ))}
        </div>
        <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-2">{review.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-base mb-4 flex-grow">"{review.message}"</p>
        <p className="font-semibold text-right mt-auto text-gray-700 dark:text-gray-400">- {review.memberId?.firstName || 'A Member'}</p>
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
            console.error("Failed to fetch featured reviews", error);
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchFeaturedReviews().finally(() => setLoading(false));
    }, [fetchFeaturedReviews]);
    
    // ★★★ ගැටලුවට විසඳුම මෙතන: image එකේ නියම නම යෙදීම ★★★
    const backgroundImageUrl = '/review-bg.jpg.jpg'; 

    return (
        <div 
            className="min-h-screen bg-cover bg-center bg-fixed"
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        >
            <div className="min-h-screen w-full bg-slate-950/70 backdrop-blur-sm">
                
                <div className="container mx-auto px-4 py-12 md:py-16">
                    <div className="mb-12">
                        {user ? (
                            <MyReview onReviewUpdate={fetchFeaturedReviews} />
                        ) : (
                            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-md text-center">
                                <h2 className="text-xl font-bold mb-4 text-gray-800">Share Your Experience</h2>
                                <p className="text-gray-600 mb-4">You must be logged in as a member to write a review.</p>
                                <Link to="/login">
                                    <Button>Login to Write a Review</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold text-center mb-8 text-white">Member Testimonials</h2>
                        {loading ? (
                            <p className="text-center text-white/80">Loading reviews...</p>
                        ) : reviews.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {reviews.map(review => (
                                    <ReviewCard key={review._id} review={review} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-300 bg-black/30 p-6 rounded-lg">No reviews have been featured yet. Be the first to share your story!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewsPage;