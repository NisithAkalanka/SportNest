import { useNavigate } from 'react-router-dom';
import { FaUserShield, FaUserGraduate, FaCrown } from 'react-icons/fa';

// 'plans' array එකේ කිසිදු වෙනසක් නැත
const plans = [
    {
        name: 'Student Membership',
        price: '500 LKR',
        period: '/ year',
        details: 'For students under 23. Access to all basic facilities and events.',
        icon: <FaUserGraduate size={40} />,
        color: 'bg-blue-500'
    },
    {
        name: 'Ordinary Membership',
        price: '1500 LKR',
        period: '/ year',
        details: 'Full access to club facilities, voting rights, and member discounts.',
        icon: <FaUserShield size={40} />,
        color: 'bg-green-500'
    },
    {
        name: 'Life Membership',
        price: '10,000 LKR',
        period: '/ lifetime',
        details: 'One-time payment for lifelong access, premium benefits, and special invitations.',
        icon: <FaCrown size={40} />,
        color: 'bg-yellow-500'
    }
];

const MembershipPlansPage = () => {
    // ★ 2. 'useState' hook එක (selectedPlan) සහ Modal එකට අදාළ functions (handleCloseModal, handleSubmitMembership) ඉවත් කර ඇත.
    // ඒ වෙනුවට 'useNavigate' hook එක පමණක් භාවිතා වේ.
    const navigate = useNavigate();

    // ★ 3. 'handleSelectPlan' function එක නව පිටුවට යොමු වන ලෙස සම්පූර්ණයෙන්ම වෙනස් කර ඇත.
    const handleSelectPlan = (plan) => {
        // URL එකේ space වැනි අක්ෂර නිවැරදිව යැවීමට plan name එක encode කරමු.
        const encodedPlanName = encodeURIComponent(plan.name);
        navigate(`/confirm-membership/${encodedPlanName}`);
    };

    return (
        // JSX ව්‍යුහයේ දෘශ්‍ය කොටස් වල කිසිදු වෙනසක් කර නැත.
        <div className="bg-gray-100 min-h-screen p-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Choose Your Plan</h1>
                <p className="text-lg text-gray-600 mt-2">Become a part of the SportNest family today!</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
                {plans.map((plan) => (
                    <div key={plan.name} className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300">
                        <div className={`p-4 rounded-full text-white mb-4 ${plan.color}`}>
                            {plan.icon}
                        </div>
                        <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                        <p className="text-4xl font-extrabold text-gray-800">{plan.price}<span className="text-lg font-normal text-gray-500">{plan.period}</span></p>
                        <p className="text-gray-600 my-4 h-20">{plan.details}</p>
                        <button 
                            // onClick එක දැන් අපගේ නව 'handleSelectPlan' function එක call කරයි
                            onClick={() => handleSelectPlan(plan)}
                            className={`w-full py-3 mt-4 text-white font-bold rounded-lg ${plan.color} hover:opacity-90 transition-opacity`}>
                            Select Plan
                        </button>
                    </div>
                ))}
            </div>

            {/* ★ 4. Modal එක පෙන්වීමට අදාළ JSX කේතය මෙතැනින් සම්පූර්ණයෙන්ම ඉවත් කර ඇත. */}
            
        </div>
    );
};

export default MembershipPlansPage;