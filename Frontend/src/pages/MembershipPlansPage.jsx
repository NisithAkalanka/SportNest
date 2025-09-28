

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/MemberAuthContext";

//  Single Plan Card Component
const PlanCard = ({ plan, onSelect }) => (
  <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-orange-500 flex flex-col hover:shadow-xl transition duration-300">
    <h2 className="text-2xl font-bold text-gray-800">{plan.name}</h2>
    <p className="text-4xl font-extrabold text-gray-900 my-4">
      LKR {plan.price.toLocaleString()}
      <span className="text-base font-medium text-gray-500"> / {plan.duration}</span>
    </p>

    <ul className="space-y-3 text-gray-600 mb-8 flex-grow">
      {plan.features.map((feature, index) => (
        <li key={index} className="flex items-center">
          <svg
            className="w-5 h-5 text-green-500 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          {feature}
        </li>
      ))}
    </ul>

    <button
      onClick={() => onSelect(plan)}
      className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition duration-300"
    >
      Select Plan
    </button>
  </div>
);

const MembershipPlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  //  Fetch Plans (Public)
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await axios.get("/api/members/membership-plans");

        //  Override prices manually
        const updatedPlans = data.map((plan) => {
          if (plan.name === "Student Membership") return { ...plan, price: 20000 };
          if (plan.name === "Ordinary Membership") return { ...plan, price: 60000 };
          if (plan.name === "Life Time Membership") return { ...plan, price: 100000 };
          return plan;
        });

        setPlans(updatedPlans);
      } catch (err) {
        setError("Could not load membership plans. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  //  Handle Plan Selection
  const handleSelectPlan = (selectedPlan) => {
    if (!user) {
      navigate("/login", {
        state: { from: `/confirm-membership/${selectedPlan.name}` },
      });
    } else {
      navigate(`/confirm-membership/${selectedPlan.name}`);
    }
  };

  if (loading) return <div className="text-center p-8">Loading plans...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="bg-gray-100 min-h-screen py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            Select the perfect membership plan to start your journey with SportNest.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} onSelect={handleSelectPlan} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MembershipPlansPage;
