import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFutbol, FaTrophy, FaUsers, FaShieldAlt, FaBolt, FaStar, FaQuoteLeft } from 'react-icons/fa';
import { getFeaturedReviews } from '../api/reviewService';
import { Button } from '@/components/ui/button';

// --- Features Section Data ---
const features = [
  {
    icon: <FaFutbol className="text-4xl text-white" />,
    title: "Explore Our Sports",
    description:
      "From tennis to swimming, find the perfect sport that fits your passion. We offer programs for all skill levels.",
    link: "/sports",
    linkText: "View Sports",
  },
  {
    icon: <FaUsers className="text-4xl text-white" />,
    title: "Join The Club",
    description:
      "Become a part of our vibrant community. Discover our membership plans and enjoy exclusive benefits.",
    link: "/club",
    linkText: "view club",
  },
  {
    icon: <FaTrophy className="text-4xl text-white" />,
    title: "Events & Tournaments",
    description:
      "Stay updated with our latest events, tournaments, and training sessions. There's always something happening!",
    link: "/events",
    linkText: "See Events",
  },
];

// --- Hero background image (easy to change) ---
const HERO_BG_URL = "/assets/home-hero.jpg";

// --- Review Card Component (Reusable) ---
const ReviewCard = ({ review }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col h-full border border-gray-100 text-left">
    <FaQuoteLeft className="text-3xl text-cyan-200 mb-4" />
    <h4 className="font-bold text-xl text-gray-800 mb-2">{review.title}</h4>
    <div className="flex items-center mb-4">
      {[...Array(5)].map((_, i) => (
        <FaStar key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'} />
      ))}
    </div>
    <p className="text-gray-600 text-base mb-4 flex-grow">
      "{review.message.substring(0, 120)}{review.message.length > 120 && '...'}"
    </p>
    <p className="font-semibold text-right mt-auto text-gray-700">
      - {review.memberId?.firstName || 'A Member'}
    </p>
  </div>
);

const HomePage = () => {
  const [featuredReviews, setFeaturedReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        const data = await getFeaturedReviews();
        setFeaturedReviews(data);
      } catch (error) {
        console.error('API Error: Could not fetch featured reviews', error);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, []);

  return (
    <div className="text-gray-800">
      {/*  1. Hero Section (Configurable background + overlay + right-side glass card)  */}
      <section className="relative min-h-[80vh] md:h-screen grid md:grid-cols-2 items-center overflow-hidden">
        {/* Background image for best LCP handling */}
        <img
          src={HERO_BG_URL}
          alt="Athletes training at SportNest"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          fetchpriority="high"
        />
        {/* Readability overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20" />

        {/* Left: Headline + CTAs */}
        <div className="relative z-10 px-4 md:px-10 py-16 md:py-0 text-white">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-4 animate-fade-in-down">
            Welcome to <span className="text-emerald-300">SportNest</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-200 mb-8 max-w-3xl animate-fade-in-up">
            Your all-in-one club management solution. Join a community of athletes and enthusiasts to achieve greatness together.
          </p>
          <div className="space-x-4">
            <Link
              to="/register"
              className="bg-emerald-500 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-emerald-600 transition-transform transform hover:scale-105"
            >
              Get Started
            </Link>
            <Link
              to="/club"
              className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-white hover:text-black transition-all"
            >
              The Club
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/90">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1 border border-white/20">
              <FaShieldAlt /> Secure & verified coaches
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1 border border-white/20">
              <FaBolt /> Fast booking & payments
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1 border border-white/20">
              <FaStar /> 4.8/5 member rating
            </span>
          </div>
        </div>

        {/* Right: Glassmorphism promo card (hidden on small screens) */}
        <div className="relative z-10 hidden md:block px-4 md:px-10">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl text-white max-w-md ml-auto">
            <p className="text-sm uppercase tracking-wider text-white/80">This week at SportNest</p>
            <h3 className="text-2xl font-bold mt-1">Train smarter. Play harder.</h3>
            <p className="text-white/90 mt-2">
              Book coaching sessions, explore membership perks, and grab exclusive merch deals.
            </p>

            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="mt-1 size-2 rounded-full bg-emerald-400"></span>
                <span><strong>New:</strong> Beginner Tennis Program opens <em>Monday</em></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 size-2 rounded-full bg-emerald-400"></span>
                <span><strong>Deal:</strong> 15% off on memberships (Student & Family)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 size-2 rounded-full bg-emerald-400"></span>
                <span><strong>Event:</strong> Weekend 3v3 Football Mini-Cup</span>
              </li>
            </ul>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow"
              >
                Shop Now
              </Link>
              <Link
                to="/membership-plans"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold border border-white/30 bg-white/10 hover:bg-white/20 text-white"
              >
                View Memberships
              </Link>
            </div>
          </div>
        </div>

        {/* Subtle scroll hint (desktop only) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 text-white/80 text-sm">
          <span className="inline-block h-4 w-4 rounded-full border border-white/60 animate-bounce"></span>
          <span>Scroll</span>
        </div>
      </section>

      {/* --- Features Section --- */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Why Choose SportNest?</h2>
            <p className="text-gray-600 mt-2">We provide the best platform for your sporting journey.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-gray-800 text-white p-8 rounded-xl shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="bg-gray-700 w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-300 mb-6">{feature.description}</p>
                <Link to={feature.link} className="text-green-400 font-semibold hover:text-green-300 transition-colors">
                  {feature.linkText} &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ★★★ What Our Members Say ★★★ */}
      <div className="bg-slate-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">What Our Members Say</h2>
            <p className="text-gray-600 mt-2">Real stories from our passionate community.</p>
          </div>

          {loadingReviews ? (
            <p className="text-center text-gray-500">Loading reviews...</p>
          ) : featuredReviews.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredReviews.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}
              </div>
              <div className="text-center mt-12">
                <Link to="/reviews">
                  <Button size="lg" style={{ backgroundColor: '#FF6700' }}>
                    Read All Reviews
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 bg-white p-8 rounded-lg shadow">
              <p>No featured reviews available at the moment. Check back soon!</p>
              <p className="text-xs mt-2">(If you are an admin, please make sure to "feature" some reviews in the admin panel).</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;