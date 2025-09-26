// Frontend/src/pages/SportsHomePage.jsx

import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/MemberAuthContext';
import PlayerRegistrationModal from '../components/PlayerRegistrationModal';

// ★★★ පින්තූර URL නිවැරදිව මෙහි ඇතුළත් කර ඇත ★★★
const sportsData = [
    { 
        name: 'Tennis', 
        description: 'A classic racket sport for singles or doubles. Improve your serve and volley with us!', 
        detailsLink: '/sports/tennis',
        imageUrl: 'https://images.unsplash.com/photo-1594756543549-1111624b5d84?q=80&w=1780&auto=format&fit=crop',
        icon: <i className="fa-solid fa-table-tennis-paddle-ball text-4xl text-white"></i>
    },
    { 
        name: 'Cricket', 
        description: 'The gentleman\'s game. Join our teams and practice in our top-notch facilities.', 
        detailsLink: '/sports/cricket',
        imageUrl: 'https://images.unsplash.com/photo-1599385554308-f682881a7051?q=80&w=1770&auto=format&fit=crop',
        icon: <i className="fa-solid fa-cricket-bat-ball text-4xl text-white"></i>
    },
    { 
        name: 'Badminton', 
        description: 'A fast-paced indoor sport that builds incredible reflexes and agility.', 
        detailsLink: '/sports/badminton',
        imageUrl: 'https://images.unsplash.com/photo-1627961099142-b605a968a356?q=80&w=1770&auto=format&fit=crop',
        icon: <i className="fa-solid fa-shuttlecock text-4xl text-white"></i>
    },
    { 
        name: 'Netball', 
        description: 'A popular team sport that requires skill, teamwork, and energy.', 
        detailsLink: '/sports/netball',
        imageUrl: 'https://plus.unsplash.com/premium_photo-1661877823969-23f2f5c7c10b?q=80&w=1770&auto=format&fit=crop',
        icon: <i className="fa-solid fa-basketball text-4xl text-white"></i>
    },
    { 
        name: 'Swimming', 
        description: 'Build endurance and strength in our state-of-the-art swimming your complexes.', 
        detailsLink: '/sports/swimming',
        imageUrl: 'https://images.unsplash.com/photo-1562322199-07efd3f84f09?q=80&w=1771&auto=format&fit=crop',
        icon: <i className="fa-solid fa-person-swimming text-4xl text-white"></i>
    },
];

const SportsHomePage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSport, setSelectedSport] = useState('');
    
    const handleRegisterClick = (sportName) => {
        if (!user) {
            alert('Please log in to register');
            navigate('/login');
        } else {
            setSelectedSport(sportName);
            setIsModalOpen(true);
        }
    };

    const handleSuccessRegistration = () => {
        navigate(0);
    };

    return (
        <div className="bg-gray-50">
            <div className="container mx-auto py-16 px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Explore Our Sports</h1>
                    <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">Find the perfect sport that fits your passion and energy.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sportsData.map(sport => (
                        <div key={sport.name} className="group relative rounded-xl shadow-lg overflow-hidden text-white flex flex-col h-72">
                            {/* ★★★ Background Image එක මෙතනින් load වේ ★★★ */}
                            <img src={sport.imageUrl} alt={sport.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                            <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-all duration-300"></div>
                            
                            <div className="relative z-10 flex flex-col h-full p-6">
                                {sport.icon}
                                <h3 className="text-2xl font-bold mt-4 mb-2">{sport.name}</h3>
                                <p className="text-sm opacity-0 group-hover:opacity-100 transform -translate-y-4 group-hover:translate-y-0 transition-all duration-300 ease-in-out">{sport.description}</p>
                                
                                <div className="flex-grow"></div> 
                                
                                <div className="flex items-center justify-center space-x-4">
                                    <Link to={sport.detailsLink} className="w-full text-center bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/30 transition-colors">View Details</Link>
                                    <button onClick={() => handleRegisterClick(sport.name)} className="w-full text-center bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                                        Register
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {isModalOpen && <PlayerRegistrationModal 
                    sportName={selectedSport} 
                    onClose={() => setIsModalOpen(false)} 
                    onRegisterSuccess={handleSuccessRegistration}
                />}
            </div>
        </div>
    );
};

export default SportsHomePage;