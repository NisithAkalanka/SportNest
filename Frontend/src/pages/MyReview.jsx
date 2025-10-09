import React, { useState, useEffect, useCallback } from 'react';
import { getMyReview, createOrUpdateMyReview, deleteMyReview } from '../api/reviewService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaStar } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const MyReview = ({ onReviewUpdate }) => {
    const [review, setReview] = useState(null);
    const [formData, setFormData] = useState({ rating: 0, title: '', category: '', message: '' });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    const MESSAGE_MAX_LENGTH = 1500;

    const fetchReview = useCallback(async () => {
        setIsLoading(true);
        setStatusMessage({ type: '', text: '' });
        try {
            const data = await getMyReview();
            if (data) {
                setReview(data);
                setFormData({ rating: data.rating, title: data.title, category: data.category, message: data.message });
            } else {
                setReview(null);
                setFormData({ rating: 0, title: '', category: '', message: '' });
            }
        } catch (error) {
            console.error("Failed to fetch review", error);
            setStatusMessage({ type: 'error', text: 'Could not load your review details.' });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReview();
    }, [fetchReview]);

    const validate = () => {
        const tempErrors = {};
        if (!formData.rating || formData.rating === 0) tempErrors.rating = "Please select a rating from 1 to 5.";
        if (!formData.title.trim()) tempErrors.title = "Review title is required.";
        if (!formData.category) tempErrors.category = "Please select a category for your review.";
        if (!formData.message.trim()) tempErrors.message = "Review message cannot be empty.";
        if (formData.message.length > MESSAGE_MAX_LENGTH) {
            tempErrors.message = `Review cannot exceed ${MESSAGE_MAX_LENGTH} characters.`;
        }
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage({ type: '', text: '' });
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            const response = await createOrUpdateMyReview(formData);
            setStatusMessage({ type: 'success', text: response.message || 'Your review has been saved successfully!' });
            if (response && response.review) {
                setReview(response.review);
                setFormData({ rating: response.review.rating, title: response.review.title, category: response.review.category, message: response.review.message });
                if (onReviewUpdate) {
                    onReviewUpdate();
                }
            }
        } catch (error) {
            setStatusMessage({ type: 'error', text: error.response?.data?.message || 'Failed to submit review. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to permanently delete your review?')) {
            setIsSubmitting(true);
            try {
                const response = await deleteMyReview();
                setStatusMessage({ type: 'success', text: response.message || 'Your review has been deleted.' });
                setReview(null);
                setFormData({ rating: 0, title: '', category: '', message: '' });
                if (onReviewUpdate) {
                    onReviewUpdate();
                }
            } catch (error) {
                setStatusMessage({ type: 'error', text: 'Failed to delete review.' });
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    if (isLoading) {
        return (
            <Card className="mt-8 bg-transparent border-none shadow-none">
                <CardContent><p className="p-6 text-center text-white/80">Loading your review...</p></CardContent>
            </Card>
        );
    }
    
    return (
        <Card className="bg-slate-800/20 backdrop-blur-md border border-white/10 text-white">
            <CardHeader>
                <CardTitle className="text-white">{review ? 'Edit Your Review' : 'Write a Review'}</CardTitle>
                <CardDescription className="text-gray-300">Share your experience with the club. Your feedback helps us improve.</CardDescription>
            </CardHeader>
            <CardContent>
                {statusMessage.text && (
                    <div className={`p-3 rounded mb-4 text-center text-sm ${statusMessage.type === 'success' ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                        {statusMessage.text}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block mb-2 font-medium text-sm text-gray-200">Your Rating *</label>
                        <div className="flex items-center gap-2">
                             {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar key={star} size={28}
                                    className={`cursor-pointer transition-colors ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-300'}`}
                                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                                />
                            ))}
                        </div>
                        {errors.rating && <p className="text-sm text-red-400 mt-1">{errors.rating}</p>}
                    </div>
                    
                    <div>
                        <label htmlFor="reviewTitle" className="block mb-1 font-medium text-sm text-gray-200">Review Title *</label>
                        <Input 
                            id="reviewTitle" 
                            className="text-zinc-900 placeholder:text-gray-400" 
                            value={formData.title} 
                            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} 
                            placeholder="e.g., Best Tennis Coaching!" 
                            maxLength={100} 
                        />
                        <p className="text-xs text-gray-400 mt-1">A short, catchy title for your review.</p>
                        {errors.title && <p className="text-sm text-red-400 mt-1">{errors.title}</p>}
                    </div>

                    <div>
                        <label htmlFor="reviewCategory" className="block mb-1 font-medium text-sm text-gray-200">Category *</label>
                        <Select onValueChange={value => setFormData(prev => ({ ...prev, category: value }))} value={formData.category}>
                            {/* solution 1: Category text eka penima sadha text color class eka */}
                            <SelectTrigger id="reviewCategory" className="text-zinc-900">
                                <SelectValue placeholder="Select a category..." />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-zinc-900 border shadow-lg">
                                <SelectItem value="Coaching">Coaching</SelectItem>
                                <SelectItem value="Club Facilities">Club Facilities</SelectItem>
                                <SelectItem value="Customer Service">Customer Service</SelectItem>
                                <SelectItem value="Events">Events</SelectItem>
                                <SelectItem value="Overall Experience">Overall Experience</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.category && <p className="text-sm text-red-400 mt-1">{errors.category}</p>}
                    </div>

                    <div>
                        <label htmlFor="reviewMessage" className="block mb-1 font-medium text-sm text-gray-200">Your Review *</label>
                        <Textarea 
                            id="reviewMessage" 
                            className="text-zinc-900 placeholder:text-gray-400" 
                            value={formData.message} 
                            onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))} 
                            placeholder="Share details of your experience..." 
                            rows={5} 
                            maxLength={MESSAGE_MAX_LENGTH}
                        />
                        <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-gray-400">Describe your experience in detail.</p>
                            <p className={`text-xs ${formData.message.length > MESSAGE_MAX_LENGTH ? 'text-red-400' : 'text-gray-400'}`}>
                                {formData.message.length}/{MESSAGE_MAX_LENGTH}
                            </p>
                        </div>
                        {errors.message && <p className="text-sm text-red-400 mt-1">{errors.message}</p>}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
                            {isSubmitting ? 'Saving...' : (review ? 'Update Review' : 'Submit Review')}
                        </Button>
                        {review && 
                            // solution 2: Delete button ekata rathu pata damima
                            <Button 
                                type="button" 
                                variant="destructive" 
                                onClick={handleDelete} 
                                disabled={isSubmitting} 
                                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
                            >
                                Delete My Review
                            </Button>
                        }
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default MyReview;