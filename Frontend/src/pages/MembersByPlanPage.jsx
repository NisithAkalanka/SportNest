import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AdminAuthContext } from '@/context/AdminAuthContext';
import DataTable from '../components/admin/DataTable';
import { generatePdf } from '../utils/pdfGenerator';
import { FaFilePdf, FaSearch } from 'react-icons/fa';

const MembersByPlanPage = () => {
  const { planName } = useParams();
  const { admin } = useContext(AdminAuthContext);

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      if (!admin || !admin.token) {
        setError("Not authorized. Please log in as an admin.");
        setLoading(false);
        return;
      }

      let apiUrl = '';
      if (planName === 'all') {
        setTitle("All Members");
        apiUrl = '/api/admin/users/all';   //  All Members
      } else if (planName === 'active') {
        setTitle("All Members with an 'Active' Plan");
        apiUrl = '/api/admin/users/status/active';
      } else if (planName === 'inactive') {
        setTitle("All Members with 'No Plan' (Inactive)");
        apiUrl = '/api/admin/users/status/inactive';
      } else {
        setTitle(`Members with '${planName}' Plan`);
        apiUrl = `/api/admin/users/plan/${planName}`;
      }

      try {
        const config = { headers: { Authorization: `Bearer ${admin.token}` } };
        const { data } = await axios.get(apiUrl, config);
        setMembers(data);
      } catch (err) {
        setError("Failed to fetch member details. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [planName, admin]);

  // === Table Columns ===
  const columns = [
    { header: 'Club ID', accessor: 'clubId' },
    { header: 'First Name', accessor: 'firstName' },
    { header: 'Last Name', accessor: 'lastName' },
    { header: 'Email Address', accessor: 'email' },
    { header: 'Membership Plan', accessor: 'membershipPlan' },
    { header: 'Status', accessor: 'membershipStatus' },
  ];

  // === Search Logic ===
  const filteredMembers = useMemo(() => {
    if (!searchTerm) return members;
    return members.filter(
      (mem) =>
        mem.clubId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mem.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mem.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mem.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mem.membershipPlan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mem.membershipStatus?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, members]);

  // === PDF Download Handler ===
  const handleDownloadPdf = () => {
    const reportTitle = title || "Membership Report";
    const headers = [['Club ID', 'First Name', 'Last Name', 'Email Address', 'Membership Plan', 'Status']];
    const data = filteredMembers.map(mem => [
      mem.clubId,
      mem.firstName,
      mem.lastName,
      mem.email,
      mem.membershipPlan,
      mem.membershipStatus
    ]);
    const fileName = `members_report_${planName.toLowerCase().replace(/\s+/g, '_')}`;
    generatePdf(reportTitle, headers, data, fileName);
  };

  if (loading) return <div className="p-8">Loading member details...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-8">
      <Link
        to="/admin-dashboard/user-management"
        className="text-blue-500 hover:underline mb-6 inline-block"
      >
        &larr; Back to Dashboard
      </Link>

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">{title}</h1>
        {filteredMembers.length > 0 && (
          <button
            onClick={handleDownloadPdf}
            className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center"
          >
            <FaFilePdf className="mr-2" />
            Download PDF
          </button>
        )}
      </div>

      {/* 🔎 Search Bar */}
      <div className="mb-6 flex items-center">
        <FaSearch className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search by Club ID, Name, Email, Plan, Status..."
          className="w-full max-w-md px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredMembers.length > 0 ? (
        <DataTable columns={columns} data={filteredMembers} />
      ) : (
        <p className="bg-yellow-100 text-yellow-800 p-4 rounded-md">
          No members found for this category.
        </p>
      )}
    </div>
  );
};

export default MembersByPlanPage;
