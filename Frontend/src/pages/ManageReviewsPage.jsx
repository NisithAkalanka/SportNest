import React, { useState, useEffect, useCallback } from 'react';
import { getAllReviewsForAdmin, toggleFeaturedStatus } from '../api/reviewService';
import { Button } from '@/components/ui/button';
import { FaStar } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const ManageReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAllReviews = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAllReviewsForAdmin();
            setReviews(data);
        } catch (err) {
            setError('Failed to fetch reviews. Please make sure you are logged in as an admin.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllReviews();
    }, [fetchAllReviews]);

    const handleToggleFeatured = async (reviewId) => {
        // Optimistic UI update for instant feedback
        setReviews(prevReviews => 
            prevReviews.map(review => 
                review._id === reviewId ? { ...review, isFeatured: !review.isFeatured } : review
            )
        );

        try {
            await toggleFeaturedStatus(reviewId);
        } catch (err) {
            alert('Failed to update status. Reverting changes.');
            fetchAllReviews(); // Re-fetch from server to ensure consistency
        }
    };

    if (loading) return <p className="text-center p-4">Loading all member reviews...</p>;
    if (error) return <p className="text-red-500 text-center p-4">{error}</p>;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Manage Member Reviews</CardTitle>
                    <CardDescription>
                        Here you can see all submitted reviews. Feature the best ones to display them on the homepage.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Review Content</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Featured</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reviews.length > 0 ? (
                                    reviews.map(review => (
                                        <tr key={review._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{review.memberId?.firstName} {review.memberId?.lastName}</div>
                                                <div className="text-sm text-gray-500">{review.memberId?.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <FaStar key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"} />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-800">{review.title}</div>
                                                <p className="text-sm text-gray-600 mt-1 max-w-md" title={review.message}>{review.message}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <Button 
                                                    onClick={() => handleToggleFeatured(review._id)}
                                                    variant={review.isFeatured ? "default" : "outline"}
                                                    size="sm"
                                                    className={review.isFeatured ? "bg-green-600 hover:bg-green-700" : ""}
                                                >
                                                    {review.isFeatured ? 'Featured' : 'Set as Feature'}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-8 text-gray-500">
                                            No member reviews have been submitted yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ManageReviewsPage;