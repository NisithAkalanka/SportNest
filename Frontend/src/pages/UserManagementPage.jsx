// File: Frontend/src/pages/UserManagementPage.jsx (NEW PROFESSIONAL DESIGN)

import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AdminAuthContext } from '@/context/AdminAuthContext'; // ඔබගේ context path එකට අනුව සකසන්න
import { FaUsers, FaUserCheck, FaUserTimes, FaIdCard, FaFutbol, FaChild } from 'react-icons/fa'; // Icons
import DetailsPopup from '@/components/DetailsPopup';

// ★★★ Reusable Sub-Statistic Component for clean UI ★★★
const DetailRow = ({ icon, label, value, onClick }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center text-gray-600">
      <div className="mr-4 text-lg text-gray-400">{icon}</div>
      <span>{label}</span>
    </div>
    <div className="flex items-center">
      <span className="font-bold text-lg mr-6">{value}</span>
      <button
        onClick={onClick}
        className="text-sm font-semibold text-orange-500 hover:text-orange-600 hover:underline"
      >
        View Details
      </button>
    </div>
  </div>
);

const UserManagementPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const { admin } = useContext(AdminAuthContext);
  
  // Popup states
  const [allMembersPopup, setAllMembersPopup] = useState(false);
  const [activeMembersPopup, setActiveMembersPopup] = useState(false);
  const [inactiveMembersPopup, setInactiveMembersPopup] = useState(false);
  const [studentPlanPopup, setStudentPlanPopup] = useState(false);
  const [ordinaryPlanPopup, setOrdinaryPlanPopup] = useState(false);
  const [lifetimePlanPopup, setLifetimePlanPopup] = useState(false);
  const [allPlayersPopup, setAllPlayersPopup] = useState(false);
  const [cricketPlayersPopup, setCricketPlayersPopup] = useState(false);
  const [netballPlayersPopup, setNetballPlayersPopup] = useState(false);
  const [tennisPlayersPopup, setTennisPlayersPopup] = useState(false);
  const [badmintonPlayersPopup, setBadmintonPlayersPopup] = useState(false);
  const [swimmingPlayersPopup, setSwimmingPlayersPopup] = useState(false);
  
  // Data states
  const [allMembersData, setAllMembersData] = useState([]);
  const [activeMembersData, setActiveMembersData] = useState([]);
  const [inactiveMembersData, setInactiveMembersData] = useState([]);
  const [studentPlanData, setStudentPlanData] = useState([]);
  const [ordinaryPlanData, setOrdinaryPlanData] = useState([]);
  const [lifetimePlanData, setLifetimePlanData] = useState([]);
  const [allPlayersData, setAllPlayersData] = useState([]);
  const [cricketPlayersData, setCricketPlayersData] = useState([]);
  const [netballPlayersData, setNetballPlayersData] = useState([]);
  const [tennisPlayersData, setTennisPlayersData] = useState([]);
  const [badmintonPlayersData, setBadmintonPlayersData] = useState([]);
  const [swimmingPlayersData, setSwimmingPlayersData] = useState([]);
  
  // Loading states for each popup
  const [popupLoading, setPopupLoading] = useState({});

  // Data fetching functions
  const fetchData = async (endpoint, setData, setLoadingState) => {
    if (!admin?.token) return;
    
    setLoadingState(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${admin.token}` },
      };
      const { data } = await axios.get(endpoint, config);
      setData(data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoadingState(false);
    }
  };

  // Popup handlers
  const handleAllMembersClick = () => {
    setAllMembersPopup(true);
    if (allMembersData.length === 0) {
      fetchData('/api/admin/users/all', setAllMembersData, (loading) => 
        setPopupLoading(prev => ({ ...prev, allMembers: loading }))
      );
    }
  };

  const handleActiveMembersClick = () => {
    setActiveMembersPopup(true);
    if (activeMembersData.length === 0) {
      fetchData('/api/admin/users/status/active', setActiveMembersData, (loading) => 
        setPopupLoading(prev => ({ ...prev, activeMembers: loading }))
      );
    }
  };

  const handleInactiveMembersClick = () => {
    setInactiveMembersPopup(true);
    if (inactiveMembersData.length === 0) {
      fetchData('/api/admin/users/status/inactive', setInactiveMembersData, (loading) => 
        setPopupLoading(prev => ({ ...prev, inactiveMembers: loading }))
      );
    }
  };

  const handleStudentPlanClick = () => {
    setStudentPlanPopup(true);
    if (studentPlanData.length === 0) {
      fetchData('/api/admin/users/plan/Student Membership', setStudentPlanData, (loading) => 
        setPopupLoading(prev => ({ ...prev, studentPlan: loading }))
      );
    }
  };

  const handleOrdinaryPlanClick = () => {
    setOrdinaryPlanPopup(true);
    if (ordinaryPlanData.length === 0) {
      fetchData('/api/admin/users/plan/Ordinary Membership', setOrdinaryPlanData, (loading) => 
        setPopupLoading(prev => ({ ...prev, ordinaryPlan: loading }))
      );
    }
  };

  const handleLifetimePlanClick = () => {
    setLifetimePlanPopup(true);
    if (lifetimePlanData.length === 0) {
      fetchData('/api/admin/users/plan/Life Time Membership', setLifetimePlanData, (loading) => 
        setPopupLoading(prev => ({ ...prev, lifetimePlan: loading }))
      );
    }
  };

  const handleAllPlayersClick = () => {
    setAllPlayersPopup(true);
    if (allPlayersData.length === 0) {
      fetchData('/api/admin/players/all', setAllPlayersData, (loading) => 
        setPopupLoading(prev => ({ ...prev, allPlayers: loading }))
      );
    }
  };

  const handleCricketPlayersClick = () => {
    setCricketPlayersPopup(true);
    if (cricketPlayersData.length === 0) {
      fetchData('/api/admin/players/sport/Cricket', setCricketPlayersData, (loading) => 
        setPopupLoading(prev => ({ ...prev, cricketPlayers: loading }))
      );
    }
  };

  const handleNetballPlayersClick = () => {
    setNetballPlayersPopup(true);
    if (netballPlayersData.length === 0) {
      fetchData('/api/admin/players/sport/Netball', setNetballPlayersData, (loading) => 
        setPopupLoading(prev => ({ ...prev, netballPlayers: loading }))
      );
    }
  };

  const handleTennisPlayersClick = () => {
    setTennisPlayersPopup(true);
    if (tennisPlayersData.length === 0) {
      fetchData('/api/admin/players/sport/Tennis', setTennisPlayersData, (loading) => 
        setPopupLoading(prev => ({ ...prev, tennisPlayers: loading }))
      );
    }
  };

  const handleBadmintonPlayersClick = () => {
    setBadmintonPlayersPopup(true);
    if (badmintonPlayersData.length === 0) {
      fetchData('/api/admin/players/sport/Badminton', setBadmintonPlayersData, (loading) => 
        setPopupLoading(prev => ({ ...prev, badmintonPlayers: loading }))
      );
    }
  };

  const handleSwimmingPlayersClick = () => {
    setSwimmingPlayersPopup(true);
    if (swimmingPlayersData.length === 0) {
      fetchData('/api/admin/players/sport/Swimming', setSwimmingPlayersData, (loading) => 
        setPopupLoading(prev => ({ ...prev, swimmingPlayers: loading }))
      );
    }
  };

  // Delete member function
  const handleDeleteMember = async (memberId) => {
    if (!admin?.token) return;
    
    if (window.confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${admin.token}` },
        };
        await axios.delete(`/api/admin/users/${memberId}`, config);
        
        // Refresh the data
        const currentPopup = getCurrentPopup();
        if (currentPopup) {
          fetchData(currentPopup.endpoint, currentPopup.setData, (loading) => 
            setPopupLoading(prev => ({ ...prev, [currentPopup.key]: loading }))
          );
        }
        
        alert('Member deleted successfully');
      } catch (error) {
        console.error('Failed to delete member:', error);
        alert('Failed to delete member');
      }
    }
  };

  // Helper function to get current popup info
  const getCurrentPopup = () => {
    if (allMembersPopup) return { endpoint: '/api/admin/users/all', setData: setAllMembersData, key: 'allMembers' };
    if (activeMembersPopup) return { endpoint: '/api/admin/users/status/active', setData: setActiveMembersData, key: 'activeMembers' };
    if (inactiveMembersPopup) return { endpoint: '/api/admin/users/status/inactive', setData: setInactiveMembersData, key: 'inactiveMembers' };
    if (studentPlanPopup) return { endpoint: '/api/admin/users/plan/Student Membership', setData: setStudentPlanData, key: 'studentPlan' };
    if (ordinaryPlanPopup) return { endpoint: '/api/admin/users/plan/Ordinary Membership', setData: setOrdinaryPlanData, key: 'ordinaryPlan' };
    if (lifetimePlanPopup) return { endpoint: '/api/admin/users/plan/Life Time Membership', setData: setLifetimePlanData, key: 'lifetimePlan' };
    return null;
  };

  useEffect(() => {
    const fetchSummary = async () => {
      if (admin && admin.token) {
        try {
          const config = {
            headers: { Authorization: `Bearer ${admin.token}` },
          };
          const { data } = await axios.get('/api/admin/user-summary', config);
          setSummary(data);
        } catch (error) {
          console.error('Failed to fetch user summary:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false); // No admin token found
      }
    };
    fetchSummary();
  }, [admin]);

  if (loading) {
    return <div className="p-8">Loading dashboard statistics...</div>;
  }

  if (!summary) {
    return <div className="p-8">Failed to load data. Please refresh the page.</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">User & Player Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* === MEMBERSHIP OVERVIEW CARD === */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Membership Overview</h2>

          {/* Main Stat */}
          <div className="flex items-center justify-between text-gray-800 p-4 bg-gray-50 rounded-lg mb-4">
            <div className="flex items-center">
              <FaUsers className="text-5xl text-indigo-400 mr-6" />
              <div>
                <div className="text-sm text-gray-500">Total Club Members</div>
                <div className="text-4xl font-bold">{summary.totalMembers}</div>
              </div>
            </div>
            <button
              onClick={handleAllMembersClick}
              className="text-sm font-semibold text-orange-500 hover:text-orange-600 hover:underline"
            >
              View Details
            </button>
          </div>

          {/* Sub Stats */}
          <div className="space-y-2">
            <DetailRow
              icon={<FaUserCheck />}
              label="Active Memberships"
              value={summary.membersWithPlan}
              onClick={handleActiveMembersClick}
            />
            <DetailRow
              icon={<FaUserTimes />}
              label="No Membership Plan"
              value={summary.membersWithoutPlan}
              onClick={handleInactiveMembersClick}
            />
            <hr className="my-2" />
            <DetailRow
              icon={<FaChild />}
              label="Student Plans"
              value={summary.planCounts.student || 0}
              onClick={handleStudentPlanClick}
            />
            <DetailRow
              icon={<FaIdCard />}
              label="Ordinary Plans"
              value={summary.planCounts.ordinary || 0}
              onClick={handleOrdinaryPlanClick}
            />
            <DetailRow
              icon={<FaIdCard />}
              label="Life Time Plans"
              value={summary.planCounts.lifeTime || 0}
              onClick={handleLifetimePlanClick}
            />
          </div>
        </div>

        {/* === PLAYER OVERVIEW CARD === */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Player Overview</h2>

          {/* Main Stat */}
          <div className="flex items-center justify-between text-gray-800 p-4 bg-gray-50 rounded-lg mb-4">
            <div className="flex items-center">
              <FaFutbol className="text-5xl text-teal-400 mr-6" />
              <div>
                <div className="text-sm text-gray-500">Total Registered Players</div>
                <div className="text-4xl font-bold">{summary.totalPlayers}</div>
              </div>
            </div>
            <button
              onClick={handleAllPlayersClick}
              className="text-sm font-semibold text-orange-500 hover:text-orange-600 hover:underline"
            >
              View Details
            </button>
          </div>

          {/* Sub Stats */}
          <div className="space-y-2">
            <DetailRow
              label="Cricket Players"
              value={summary.sportCounts.cricket || 0}
              onClick={handleCricketPlayersClick}
            />
            <DetailRow
              label="Netball Players"
              value={summary.sportCounts.netball || 0}
              onClick={handleNetballPlayersClick}
            />
            <DetailRow
              label="Tennis Players"
              value={summary.sportCounts.tennis || 0}
              onClick={handleTennisPlayersClick}
            />
            <DetailRow
              label="Badminton Players"
              value={summary.sportCounts.badminton || 0}
              onClick={handleBadmintonPlayersClick}
            />
            <DetailRow
              label="Swimming Players"
              value={summary.sportCounts.swimming || 0}
              onClick={handleSwimmingPlayersClick}
            />
          </div>
        </div>
      </div>

      {/* Popup Components */}
      <DetailsPopup
        isOpen={allMembersPopup}
        onClose={() => setAllMembersPopup(false)}
        title="All Club Members"
        data={allMembersData}
        loading={popupLoading.allMembers}
        columns={[
          { key: 'fullName', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'contactNumber', label: 'Contact' },
          { key: 'clubId', label: 'Club ID' },
          { key: 'membershipId', label: 'Membership ID' },
          { key: 'membershipPlan', label: 'Plan' },
          { key: 'createdAt', label: 'Joined' },
          { key: 'actions', label: 'Actions' }
        ]}
        type="members"
        onDelete={handleDeleteMember}
      />

      <DetailsPopup
        isOpen={allPlayersPopup}
        onClose={() => setAllPlayersPopup(false)}
        title="All Registered Players"
        data={allPlayersData}
        loading={popupLoading.allPlayers}
        columns={[
          { key: 'fullName', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'contactNumber', label: 'Contact' },
          { key: 'sportName', label: 'Sport' },
          { key: 'skillLevel', label: 'Skill Level' },
          { key: 'clubId', label: 'Club ID' },
          { key: 'createdAt', label: 'Registered' }
        ]}
        type="players"
      />

      <DetailsPopup
        isOpen={activeMembersPopup}
        onClose={() => setActiveMembersPopup(false)}
        title="Active Members"
        data={activeMembersData}
        loading={popupLoading.activeMembers}
        columns={[
          { key: 'fullName', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'contactNumber', label: 'Contact' },
          { key: 'clubId', label: 'Club ID' },
          { key: 'membershipId', label: 'Membership ID' },
          { key: 'membershipPlan', label: 'Plan' },
          { key: 'createdAt', label: 'Joined' },
          { key: 'actions', label: 'Actions' }
        ]}
        type="members"
        onDelete={handleDeleteMember}
      />

      <DetailsPopup
        isOpen={inactiveMembersPopup}
        onClose={() => setInactiveMembersPopup(false)}
        title="Inactive Members"
        data={inactiveMembersData}
        loading={popupLoading.inactiveMembers}
        columns={[
          { key: 'fullName', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'contactNumber', label: 'Contact' },
          { key: 'clubId', label: 'Club ID' },
          { key: 'membershipId', label: 'Membership ID' },
          { key: 'membershipPlan', label: 'Plan' },
          { key: 'createdAt', label: 'Joined' },
          { key: 'actions', label: 'Actions' }
        ]}
        type="members"
        onDelete={handleDeleteMember}
      />

      <DetailsPopup
        isOpen={studentPlanPopup}
        onClose={() => setStudentPlanPopup(false)}
        title="Student Plan Members"
        data={studentPlanData}
        loading={popupLoading.studentPlan}
        columns={[
          { key: 'fullName', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'contactNumber', label: 'Contact' },
          { key: 'clubId', label: 'Club ID' },
          { key: 'membershipId', label: 'Membership ID' },
          { key: 'membershipPlan', label: 'Plan' },
          { key: 'createdAt', label: 'Joined' },
          { key: 'actions', label: 'Actions' }
        ]}
        type="members"
        onDelete={handleDeleteMember}
      />

      <DetailsPopup
        isOpen={ordinaryPlanPopup}
        onClose={() => setOrdinaryPlanPopup(false)}
        title="Ordinary Plan Members"
        data={ordinaryPlanData}
        loading={popupLoading.ordinaryPlan}
        columns={[
          { key: 'fullName', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'contactNumber', label: 'Contact' },
          { key: 'clubId', label: 'Club ID' },
          { key: 'membershipId', label: 'Membership ID' },
          { key: 'membershipPlan', label: 'Plan' },
          { key: 'createdAt', label: 'Joined' },
          { key: 'actions', label: 'Actions' }
        ]}
        type="members"
        onDelete={handleDeleteMember}
      />

      <DetailsPopup
        isOpen={lifetimePlanPopup}
        onClose={() => setLifetimePlanPopup(false)}
        title="Lifetime Plan Members"
        data={lifetimePlanData}
        loading={popupLoading.lifetimePlan}
        columns={[
          { key: 'fullName', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'contactNumber', label: 'Contact' },
          { key: 'clubId', label: 'Club ID' },
          { key: 'membershipId', label: 'Membership ID' },
          { key: 'membershipPlan', label: 'Plan' },
          { key: 'createdAt', label: 'Joined' },
          { key: 'actions', label: 'Actions' }
        ]}
        type="members"
        onDelete={handleDeleteMember}
      />

      <DetailsPopup
        isOpen={cricketPlayersPopup}
        onClose={() => setCricketPlayersPopup(false)}
        title="Cricket Players"
        data={cricketPlayersData}
        loading={popupLoading.cricketPlayers}
        columns={[
          { key: 'fullName', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'contactNumber', label: 'Contact' },
          { key: 'skillLevel', label: 'Skill Level' },
          { key: 'clubId', label: 'Club ID' },
          { key: 'createdAt', label: 'Registered' }
        ]}
        type="players"
      />

      <DetailsPopup
        isOpen={netballPlayersPopup}
        onClose={() => setNetballPlayersPopup(false)}
        title="Netball Players"
        data={netballPlayersData}
        loading={popupLoading.netballPlayers}
        columns={[
          { key: 'fullName', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'contactNumber', label: 'Contact' },
          { key: 'skillLevel', label: 'Skill Level' },
          { key: 'clubId', label: 'Club ID' },
          { key: 'createdAt', label: 'Registered' }
        ]}
        type="players"
      />

      <DetailsPopup
        isOpen={tennisPlayersPopup}
        onClose={() => setTennisPlayersPopup(false)}
        title="Tennis Players"
        data={tennisPlayersData}
        loading={popupLoading.tennisPlayers}
        columns={[
          { key: 'fullName', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'contactNumber', label: 'Contact' },
          { key: 'skillLevel', label: 'Skill Level' },
          { key: 'clubId', label: 'Club ID' },
          { key: 'createdAt', label: 'Registered' }
        ]}
        type="players"
      />

      <DetailsPopup
        isOpen={badmintonPlayersPopup}
        onClose={() => setBadmintonPlayersPopup(false)}
        title="Badminton Players"
        data={badmintonPlayersData}
        loading={popupLoading.badmintonPlayers}
        columns={[
          { key: 'fullName', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'contactNumber', label: 'Contact' },
          { key: 'skillLevel', label: 'Skill Level' },
          { key: 'clubId', label: 'Club ID' },
          { key: 'createdAt', label: 'Registered' }
        ]}
        type="players"
      />

      <DetailsPopup
        isOpen={swimmingPlayersPopup}
        onClose={() => setSwimmingPlayersPopup(false)}
        title="Swimming Players"
        data={swimmingPlayersData}
        loading={popupLoading.swimmingPlayers}
        columns={[
          { key: 'fullName', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'contactNumber', label: 'Contact' },
          { key: 'skillLevel', label: 'Skill Level' },
          { key: 'clubId', label: 'Club ID' },
          { key: 'createdAt', label: 'Registered' }
        ]}
        type="players"
      />
    </div>
  );
};

export default UserManagementPage;
