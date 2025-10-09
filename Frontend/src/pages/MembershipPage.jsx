import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/MemberAuthContext';
import { FaCheck, FaCrown, FaGraduationCap, FaUser, FaInfinity } from 'react-icons/fa';

const MembershipPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const membershipPlans = [
    {
      id: 'student',
      name: 'Student Membership',
      price: 20000,
      duration: '1 Year',
      icon: FaGraduationCap,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: [
        'Access to all sports facilities',
        'Student discount rates',
        'Priority booking for training sessions',
        'Free equipment rental',
        'Monthly fitness assessment',
        'Access to student events'
      ],
      popular: false
    },
    {
      id: 'ordinary',
      name: 'Ordinary Membership',
      price: 60000,
      duration: '1 Year',
      icon: FaUser,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      features: [
        'Full access to all facilities',
        'Unlimited training sessions',
        'Personal trainer consultation',
        'Nutrition guidance',
        'Monthly progress tracking',
        'Access to all club events',
        'Guest pass privileges'
      ],
      popular: true
    },
    {
      id: 'life',
      name: 'Life Membership',
      price: 100000,
      duration: 'Lifetime',
      icon: FaInfinity,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      features: [
        'Lifetime access to all facilities',
        'Unlimited everything',
        'VIP treatment and services',
        'Exclusive member events',
        'Priority support',
        'Family member discounts',
        'Annual health checkup',
        'Locker rental included'
      ],
      popular: false
    }
  ];

  const handleSelectPlan = async (plan) => {
    if (!user) {
      navigate('/member-login');
      return;
    }

    setLoading(true);
    try {
      // Navigate to payment page with plan details
      navigate('/membership-payment', {
        state: {
          planName: plan.name,
          membershipId: user.membershipId || 'NEW',
          planPrice: plan.price
        }
      });
    } catch (error) {
      console.error('Error selecting plan:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Choose Your Membership Plan</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join SportNest and unlock unlimited access to world-class sports facilities, 
            expert training, and a vibrant community of athletes.
          </p>
        </div>

        {/* Membership Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {membershipPlans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-xl border-2 ${plan.borderColor} overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                  plan.popular ? 'ring-4 ring-green-200 ring-opacity-50' : ''
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-bl-2xl">
                    <div className="flex items-center">
                      <FaCrown className="w-4 h-4 mr-1" />
                      <span className="text-sm font-bold">Most Popular</span>
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className={`${plan.bgColor} p-8 text-center`}>
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">Rs. {plan.price.toLocaleString()}</span>
                    <span className="text-gray-600 ml-2">/{plan.duration}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="p-8">
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <FaCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Select Button */}
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={loading}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl'
                        : `bg-gradient-to-r ${plan.color} hover:opacity-90 text-white shadow-lg hover:shadow-xl`
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      'Select Plan'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose SportNest?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaCheck className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Premium Facilities</h4>
                <p className="text-gray-600 text-sm">State-of-the-art equipment and world-class facilities</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaCheck className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Expert Training</h4>
                <p className="text-gray-600 text-sm">Professional coaches and personalized training programs</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaCheck className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Community</h4>
                <p className="text-gray-600 text-sm">Join a vibrant community of sports enthusiasts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipPage;