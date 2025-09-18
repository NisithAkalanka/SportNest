

import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/MemberAuthContext';
import PlayerRegistrationModal from '../components/PlayerRegistrationModal';

// Sports data
const sportsData = [
    { name: 'Tennis', description: 'A classic racket sport for singles or doubles. Improve your serve and volley with us!', detailsLink: '/sports/tennis' },
    { name: 'Cricket', description: 'The gentleman\'s game. Join our teams and practice in our top-notch facilities.', detailsLink: '/sports/cricket' },
    { name: 'Badminton', description: 'A fast-paced indoor sport that builds incredible reflexes and agility.', detailsLink: '/sports/badminton' },
    { name: 'Netball', description: 'A popular team sport that requires skill, teamwork, and energy.', detailsLink: '/sports/netball' },
    { name: 'Swimming', description: 'Build endurance and strength in our state-of-the-art swimming your complexes.', detailsLink: '/sports/swimming' },
];

const SportsHomePage = () => {
    const { user } = useContext(AuthContext); // AuthContext get user data
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSport, setSelectedSport] = useState('');

    const handleRegisterClick = (sportName) => {
       
        
        // 1.check user login 

        if (!user) {
            
            alert('Please log in or register with the club to join a sport.');
            navigate('/login');
        } else {
            
            setSelectedSport(sportName);
            setIsModalOpen(true);
        }
    };

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">Explore Our Sports</h1>
                <p className="text-lg text-gray-600 mt-4">Find the perfect sport that fits your passion and energy.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sportsData.map(sport => (
                    <div key={sport.name} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                        <div className="p-6 flex flex-col flex-grow">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{sport.name}</h3>
                            <p className="text-gray-700 flex-grow">{sport.description}</p>
                            <div className="mt-6 flex items-center justify-between space-x-4">
                                <Link to={sport.detailsLink} className="w-full text-center bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700">View Details</Link>
                                <button onClick={() => handleRegisterClick(sport.name)} className="w-full text-center bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600">
                                    Register
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {isModalOpen && <PlayerRegistrationModal sportName={selectedSport} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default SportsHomePage;