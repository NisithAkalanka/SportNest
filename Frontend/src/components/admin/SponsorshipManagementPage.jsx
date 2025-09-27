import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFilePdf, FaCheckCircle, FaPaperPlane } from 'react-icons/fa';

const SponsorshipManagementPage = () => {
  // States for data, loading, error handling, and selections
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null); // Currently selected application
  const [isSending, setIsSending] = useState(false); // Tracks if an email is being sent

  // Fetch all sponsorship data from backend
  useEffect(() => {
    const fetchSponsorships = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) {
          setError('Authentication error. Please log in again.');
          setLoading(false);
          return;
        }
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get('/api/sponsorships/admin/all', config);
        setApplications(data);
      } catch (err) {
        setError('Failed to load applications.');
      } finally {
        setLoading(false);
      }
    };
    fetchSponsorships();
  }, []);

  // Send invitation email
  const handleSendInvitation = async () => {
    if (!selectedApp) return;

    if (!window.confirm(
      `Do you want to send an invitation email to ${selectedApp.contactPerson} from ${selectedApp.organizationName}?`
    )) {
      return;
    }

    setIsSending(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.post(
        `/api/sponsorships/admin/send-invitation/${selectedApp._id}`,
        {},
        config
      );

      alert(data.message);

      const updatedApplication = data.updatedApplication;
      // Update UI instantly
      setApplications(prev =>
        prev.map(app => app._id === updatedApplication._id ? updatedApplication : app)
      );
      setSelectedApp(updatedApplication);

    } catch (err) {
      alert(err.response?.data?.message || 'Could not send the email.');
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <>
      {/* Embedded CSS styles */}
      <style>
        {`
          .sponsorship-page-container {
            padding: 20px 30px;
            font-family: Arial, sans-serif;
          }
          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
          }
          .page-header h1 {
            font-size: 28px;
            color: #1a202c;
          }
          .download-pdf-btn {
            background-color: #dc3545;
            color: white;
            padding: 10px 18px;
            border-radius: 6px;
            border: none;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: background-color 0.2s;
          }
          .download-pdf-btn:hover {
            background-color: #c82333;
          }
          .page-description {
            color: #4a5568;
            margin-bottom: 25px;
          }
          .table-card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            overflow: hidden;
          }
          .table-card table {
            width: 100%;
            border-collapse: collapse;
          }
          .table-card th, .table-card td {
            padding: 16px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
          }
          .table-card th {
            background-color: #f8fafc;
            font-size: 12px;
            text-transform: uppercase;
            color: #64748b;
          }
          .table-card tr.selected-row {
            background-color: #eff6ff !important;
          }
          .select-btn {
            background-color: #3b82f6;
            color: white;
            border: none;
            border-radius: 5px;
            padding: 8px 16px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          .select-btn:hover {
            background-color: #2563eb;
          }
          .details-card {
            margin-top: 30px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            padding: 25px;
          }
          .details-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 15px;
            border-bottom: 1px solid #e2e8f0;
            margin-bottom: 20px;
          }
          .details-header h2 {
            margin: 0;
            font-size: 22px;
          }
          .contact-status-chip {
            background-color: #d1fae5;
            color: #065f46;
            padding: 6px 12px;
            border-radius: 16px;
            font-weight: bold;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .details-grid-view {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
          .details-grid-view p {
            margin: 0;
            color: #4a5568;
          }
          .details-grid-view p strong {
            color: #1a202c;
            display: block;
            margin-bottom: 4px;
          }
          .action-footer {
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: right;
          }
          .send-email-btn {
            background-color: #10b981;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            border: none;
            font-weight: bold;
            font-size: 16px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            transition: background-color 0.2s;
          }
          .send-email-btn:hover:not(:disabled) {
            background-color: #059669;
          }
          .send-email-btn:disabled {
            background-color: #d1d5db;
            cursor: not-allowed;
          }
          .error-message {
            color: #dc3545;
            font-weight: bold;
            padding: 15px;
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 6px;
          }
        `}
      </style>

      <div className="sponsorship-page-container">
        {/* Page header */}
        <div className="page-header">
          <h1>Sponsorship Management</h1>
        
        </div>

        <p className="page-description">
          The most recent applications are displayed at the top. Select a row to view details and send an invitation.
        </p>

        {/* Applications table */}
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>APPLIED DATE & TIME</th>
                <th>ORGANIZATION</th>
                <th>CONTACT PERSON</th>
                <th>EMAIL</th>
                <th>PLAN</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr
                  key={app._id}
                  className={selectedApp?._id === app._id ? 'selected-row' : ''}
                >
                  <td>{new Date(app.createdAt).toLocaleString('en-GB')}</td>
                  <td>{app.organizationName}</td>
                  <td>{app.contactPerson}</td>
                  <td>{app.email}</td>
                  <td>{app.sponsorshipPlan}</td>
                  <td>
                    <button className="select-btn" onClick={() => setSelectedApp(app)}>
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Selected application details */}
        {selectedApp && (
          <div className="details-card">
            <div className="details-header">
              <h2>Application Details: {selectedApp.organizationName}</h2>
              {selectedApp.contactStatus === 'Contacted' && (
                <span className="contact-status-chip">
                  <FaCheckCircle /> Contacted
                </span>
              )}
            </div>
            <div className="details-grid-view">
              <p><strong>Contact Person:</strong> {selectedApp.contactPerson}</p>
              <p><strong>Phone:</strong> {selectedApp.phoneNumber}</p>
              <p><strong>Email:</strong> {selectedApp.email}</p>
              <p><strong>Website:</strong> 
                <a href={selectedApp.website} target="_blank" rel="noopener noreferrer">
                  {selectedApp.website || 'N/A'}
                </a>
              </p>
              <p><strong>Sponsorship Plan:</strong> {selectedApp.sponsorshipPlan}</p>
              <p><strong>Amount (LKR):</strong> {selectedApp.sponsorshipAmount?.toLocaleString()}</p>
              <p><strong>Start Date:</strong> {new Date(selectedApp.startDate).toLocaleDateString()}</p>
              <p><strong>End Date:</strong> {new Date(selectedApp.endDate).toLocaleDateString()}</p>
            </div>
            <div className="action-footer">
              <button
                className="send-email-btn"
                onClick={handleSendInvitation}
                disabled={isSending || selectedApp.contactStatus === 'Contacted'}
              >
                <FaPaperPlane />
                {isSending ? 'Sending...' : (
                  selectedApp.contactStatus === 'Contacted'
                    ? 'Invitation Already Sent'
                    : 'Send Invitation Email'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SponsorshipManagementPage;
