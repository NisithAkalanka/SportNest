import React from 'react';
import { useNavigate } from 'react-router-dom'; // 1. useNavigate import කරගන්න
import { FaArrowLeft } from 'react-icons/fa';   // 2. Icon එකක් import කරගන්න

// ★ ඔබගේ کلب එකේ සැබෑ ජයග්‍රහණ වල දත්ත මෙහි ඇතුළත් කළ හැක
const achievementsData = [
    {
        title: "National Champions 2024 - Cricket",
        description: "Our Under-19 cricket team clinched the National Championship title in a thrilling final, showcasing exceptional talent and teamwork throughout the tournament.",
        imageUrl: "https://images.unsplash.com/photo-1629285483773-635c159a35e2?q=80&w=1770&auto=format&fit=crop",
        year: "2024",
    },
    {
        title: "Regional Tennis Tournament Winners",
        description: "Bringing home the trophy! Our tennis squad dominated the regional finals with stellar performances in both singles and doubles categories.",
        imageUrl: "https://images.unsplash.com/photo-1543180404-58e925c4b4fb?q=80&w=1852&auto=format&fit=crop",
        year: "2023",
    },
    {
        title: "Youth Swimming Gala - 10 Gold Medals",
        description: "Our young swimmers made a huge splash at the annual Youth Swimming Gala, securing a record-breaking 10 gold medals across various events.",
        imageUrl: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1907&auto=format&fit=crop",
        year: "2023",
    },
];

const AchievementsPage = () => {
    const navigate = useNavigate(); // 3. useNavigate initialize කරගන්න

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="container mx-auto px-4 py-16">

                {/* ★★★ 4. Back Button එක මෙතැන එකතු කර ඇත ★★★ */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold"
                    >
                        <FaArrowLeft />
                        Back
                    </button>
                </div>

                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Our Achievements</h1>
                    <p className="text-lg text-gray-600 mt-2 max-w-3xl mx-auto">
                        Celebrating the hard work, dedication, and victories of our talented athletes and teams.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {achievementsData.map((achievement, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
                            <div className="h-56 w-full">
                                <img src={achievement.imageUrl} alt={achievement.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-6">
                                <p className="text-sm font-semibold text-blue-600 mb-1">{achievement.year}</p>
                                <h3 className="text-xl font-bold text-gray-800 mb-3">{achievement.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{achievement.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AchievementsPage;