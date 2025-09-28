import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/MemberAuthContext';
import PlayerRegistrationModal from '@/components/PlayerRegistrationModal';

// Sports data (merged: main2 local assets + Ayuni improvements) 
const sportsData = [
  {
    name: 'Tennis',
    description: 'A classic racket sport for singles or doubles. Improve your serve and volley with us!',
    detailsLink: '/sports/tennis',
    // main2 local asset + Ayuni remote fallback (kept via onError handler)
    imageUrl: '/assets/tennis.jpg',
    fallbackImageUrl:
      'https://images.unsplash.com/photo-1594756543549-1111624b5d84?q=80&w=1780&auto=format&fit=crop',
    icon: (
      // As an example, using FontAwesome icon class
      <i className="fa-solid fa-table-tennis-paddle-ball text-4xl text-white"></i>
    ),
  },
  {
    name: 'Cricket',
    description: "The gentleman's game. Join our teams and practice in our top-notch facilities.",
    detailsLink: '/sports/cricket',
    imageUrl: '/assets/cricket.jpg',
    icon: <i className="fa-solid fa-cricket-bat-ball text-4xl text-white"></i>,
  },
  {
    name: 'Badminton',
    description: 'A fast-paced indoor sport that builds incredible reflexes and agility.',
    detailsLink: '/sports/badminton',
    imageUrl: '/assets/batminton.jpg',
    icon: <i className="fa-solid fa-shuttlecock text-4xl text-white"></i>,
  },
  {
    name: 'Netball',
    description: 'A popular team sport that requires skill, teamwork, and energy.',
    detailsLink: '/sports/netball',
    imageUrl: '/assets/netball.jpg',
    icon: <i className="fa-solid fa-basketball text-4xl text-white"></i>,
  },
  {
    name: 'Swimming',
    description: 'Build endurance and strength in our state-of-the-art swimming your complexes.',
    detailsLink: '/sports/swimming',
    imageUrl: '/assets/swimming.jpg',
    icon: <i className="fa-solid fa-person-swimming text-4xl text-white"></i>,
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-2xl p-6 bg-[#0D1B2A] text-white border border-white/10 mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Explore Our Sports</h1>
            <p className="text-white/80 mt-2 max-w-2xl mx-auto">
              Find the perfect sport that fits your passion and energy.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sportsData.map((sport) => (
            <div
              key={sport.name}
              className="group relative rounded-2xl overflow-hidden text-white flex flex-col h-72 border border-slate-200/80 bg-slate-900 shadow-lg hover:shadow-lg hover:ring-2 hover:ring-emerald-500/40 transition"
            >
              {/* Background Image & Overlay (Ayuni note: image loads here) */}
              <img
                src={sport.imageUrl}
                alt={sport.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  if (sport.fallbackImageUrl) e.currentTarget.src = sport.fallbackImageUrl;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent group-hover:from-black/80 group-hover:via-black/60 transition-all duration-300"></div>

              {/* Card Content */}
              <div className="relative z-10 flex flex-col h-full p-6">
                {sport.icon}
                <h3 className="text-2xl font-bold mt-4 mb-2">{sport.name}</h3>
                <p className="text-sm opacity-0 group-hover:opacity-100 transform -translate-y-4 group-hover:translate-y-0 transition-all duration-300 ease-in-out">
                  {sport.description}
                </p>

                <div className="flex-grow" />

                <div className="flex items-center justify-center space-x-4">
                  <Link
                    to={sport.detailsLink}
                    className="w-full text-center text-white/90 border border-white/30 bg-white/0 hover:bg-white/10 font-semibold py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleRegisterClick(sport.name)}
                    className="w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Register
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {isModalOpen && (
          <PlayerRegistrationModal
            sportName={selectedSport}
            onClose={() => setIsModalOpen(false)}
            onRegisterSuccess={handleSuccessRegistration}
          />
        )}
      </div>
    </div>
  );
};

export default SportsHomePage;