import React, { useEffect, useState, useCallback } from "react";
import moment from "moment";
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaSearch } from "react-icons/fa";
import trainingApi from "@/services/trainingApi";

const locationImages = {
  Ground: "/assets/ground.jpeg",
  Pool: "/assets/pool.jpeg",
  "Netball Court": "/assets/netball.jpeg",
  "Indoor Court": "/assets/indoor.jpeg",
  "Tennis Court": "/assets/tennis.jpeg",
  Default: "/assets/ground.jpeg",
};

const TrainingsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");

  // filters
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const userId = userInfo?._id || userInfo?.id;
  const userRole = (userInfo?.role || "").toLowerCase();
  const canRegister = userRole === "player";

  // all coaches training sessions
  const fetchSessions = useCallback(async () => {
    try {
      setError("");
      const res = await trainingApi.getAllSessions();
      setSessions(res);
    } catch (err) {
      console.error(err);
      setError("Could not fetch training sessions.");
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // --- Register / Unregister
  const handleRegister = async (id) => {
    if (!canRegister) {
      alert("Only players can register for training sessions.");
      return;
    }
    try {
      await trainingApi.registerSession(id);
      fetchSessions();
    } catch (err) {
      alert(err.response?.data?.message || "Could not register.");
    }
  };

  const handleUnregister = async (id) => {
    try {
      await trainingApi.unregisterSession(id);
      fetchSessions();
    } catch (err) {
      alert(err.response?.data?.message || "Could not unregister.");
    }
  };

  // --- filter logic
  const filteredSessions = sessions.filter((s) => {
    const sessionMonth = moment(s.date).month() + 1;
    const monthMatch = selectedMonth ? sessionMonth === parseInt(selectedMonth) : true;
    const venueMatch = selectedVenue ? s.location === selectedVenue : true;

    const searchMatch = searchTerm
      ? s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.location.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    return monthMatch && venueMatch && searchMatch;
  });

  return (
    <div className="trainings-page px-6 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-gray-800 mb-3">
          Upcoming Training Sessions
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore and register for sessions organized by our experienced coaches. 
          Choose the right training to improve your skills and stay active. 
          Don’t miss out on upcoming opportunities to train with the best!
        </p>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        {/* Month Filter */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="">All Months</option>
          {moment.months().map((m, i) => (
            <option key={i} value={i + 1}>
              {m}
            </option>
          ))}
        </select>

        {/* Venue Filter */}
        <select
          value={selectedVenue}
          onChange={(e) => setSelectedVenue(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="">All Venues</option>
          <option value="Ground">Ground</option>
          <option value="Pool">Pool</option>
          <option value="Netball Court">Netball Court</option>
          <option value="Indoor Court">Indoor Court</option>
          <option value="Tennis Court">Tennis Court</option>
        </select>

        {/* Search Bar */}
        <div className="flex items-center border rounded-lg px-3 py-2 bg-white w-full sm:w-72">
          <FaSearch className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search by title or venue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-none outline-none text-gray-700"
          />
        </div>
      </div>

      {/* Sessions List */}
      <div>
        {error && <p className="text-red-600">{error}</p>}

        {!error && filteredSessions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session) => {
              const bgImage = locationImages[session.location] || locationImages["Default"];
              const isRegistered = session.participants?.some((p) => p._id === userId);

              return (
                <div
                  key={session._id}
                  className="relative text-white rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition-transform duration-300"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.65)), url(${bgImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    minHeight: "260px",
                  }}
                >
                  <div className="p-6 flex flex-col justify-between h-full">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{session.title}</h3>
                      <p className="text-sm flex items-center mb-1">
                        <FaCalendarAlt className="mr-2" />
                        {moment(session.date).format("dddd, MMMM Do YYYY")} at {session.startTime}
                      </p>
                      <p className="text-sm flex items-center mb-1">
                        <FaMapMarkerAlt className="mr-2" />
                        {session.location}
                      </p>
                      <p className="text-sm flex items-center">
                        <FaUsers className="mr-2" />
                        {session.participants?.length || 0} Registered Players
                      </p>
                    </div>

                    <div>
                      {isRegistered ? (
                        <button
                          onClick={() => handleUnregister(session._id)}
                          className="mt-4 w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold"
                        >
                          Cancel Registration
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRegister(session._id)}
                          disabled={!canRegister}
                          title={canRegister ? "Register for this session" : "Only players can register"}
                          className={`mt-4 w-full px-4 py-2 rounded-lg font-semibold ${
                            canRegister ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'
                          }`}
                        >
                          {canRegister ? 'Register' : 'Players Only'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          !error && <p className="text-gray-600 text-center">No sessions available.</p>
        )}
      </div>
    </div>
  );
};

export default TrainingsPage;
