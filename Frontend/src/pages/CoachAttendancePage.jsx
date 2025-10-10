// ===============================================
// File: Frontend/src/pages/CoachAttendancePage.jsx
// ===============================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  submitCoachAttendance,
  getMyAttendance,
  updateMyAttendance,
  deleteMyAttendance
} from '../api/attendanceService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label'; // Label component import

const CoachAttendancePage = () => {

  // --- Timezone Safe Today ---
  const getTodayString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const todayLocal = new Date(today.getTime() - offset * 60 * 1000);
    return todayLocal.toISOString().split('T')[0];
  };

  // --- Form States ---
  const [date, setDate] = useState(getTodayString());
  const [inTime, setInTime] = useState('');
  const [outTime, setOutTime] = useState('');
  const [attendanceType, setAttendanceType] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  // --- Page States ---
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);

  // --- Memoized Record Check for Selected Date ---
  const recordForSelectedDate = useMemo(() => {
    return history.find(record => record.date === date);
  }, [date, history]);

  // --- Fetch Attendance History ---
  const fetchHistory = async () => {
    setLoading(true);
    try {
      setError('');
      const data = await getMyAttendance();
      setHistory(data);
    } catch (err) {
      console.error('COACH PAGE - FETCH HISTORY FAILED:', err.response || err);
      setError(err.response?.data?.message || 'Failed to fetch history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // --- Reset Form ---
  const resetForm = () => {
    setDate(getTodayString());
    setInTime('');
    setOutTime('');
    setAttendanceType('');
    setLeaveReason('');
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  // --- Date Change with Sunday Validation ---
  const handleDateChange = e => {
    const newDate = e.target.value;
    const selectedDay = new Date(newDate + 'T00:00:00Z').getUTCDay();
    if (selectedDay === 0) {
      alert('Sundays are holidays and cannot be selected for attendance.');
      return;
    }
    setDate(newDate);
  };

  // --- Edit Record Handler ---
  const handleEditClick = record => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setEditingId(record._id);
    setDate(record.date);
    setAttendanceType(record.attendanceType);
    setInTime(record.inTime || '');
    setOutTime(record.outTime || '');
    setLeaveReason(record.leaveReason || '');
    setError('');
    setSuccess('');
  };

  // --- Delete Record Handler ---
  const handleDeleteClick = async id => {
    if (window.confirm('Are you sure you want to delete this pending record?')) {
      try {
        const result = await deleteMyAttendance(id);
        setSuccess(result.message);
        fetchHistory();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete record.');
      }
    }
  };

  // --- Status Badge Colors ---
  const getStatusBadge = status => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // --- Submit Handler (Create / Update) ---
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // --- All Validations in order ---

    // 1️⃣ Attendance Type selected?
    if (!attendanceType) {
      setError('Please select an attendance type.');
      return;
    }

    // 2️⃣ Duplicate entry check
    if (!editingId && recordForSelectedDate) {
      alert(`You have already marked attendance for ${date}.`);
      return;
    }

    // 3️⃣ In-Time & Out-Time required for Full/Half Day
    if (['Full-Day', 'Half-Day'].includes(attendanceType)) {
      if (!inTime || !outTime) {
        setError('For Full/Half-Day, both In-Time and Out-Time are required.');
        return;
      }
    }

    // 4️⃣ Out-Time must be after In-Time
    if (inTime && outTime && outTime <= inTime) {
      setError('Out-Time must be after In-Time.');
      return;
    }

    // 5️⃣ Duration validation
    if (inTime && outTime) {
      const inDate = new Date(`1970-01-01T${inTime}`);
      const outDate = new Date(`1970-01-01T${outTime}`);
      const durationInHours = (outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60);

      if (attendanceType === 'Full-Day' && durationInHours < 5) {
        setError('A Full-Day session must be at least 5 hours long.');
        return;
      }
      if (attendanceType === 'Half-Day' && durationInHours < 3) {
        setError('A Half-Day session must be at least 3 hours long.');
        return;
      }
    }

    // --- API submission ---
    const attendanceData = { date, attendanceType, inTime, outTime, leaveReason };

    try {
      let result;
      if (editingId) {
        result = await updateMyAttendance(editingId, attendanceData);
      } else {
        result = await submitCoachAttendance(attendanceData);
      }
      setSuccess(result.message);
      resetForm();
      fetchHistory();
    } catch (err) {
      console.error('COACH PAGE - SUBMIT ERROR:', err.response || err);
      setError(err.response?.data?.message || 'An unexpected error occurred.');
      setSuccess('');
    }
  };

  // --------------------------------------------------
  // --- RENDER UI ---
  // --------------------------------------------------
  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">My Attendance</h1>

      {/* --- Attendance Form --- */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Update Attendance Record' : 'Mark Attendance'}
        </h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {!error && success && <p className="text-green-500 mb-4">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1 font-medium block">Date</Label>
              <Input
                type="date"
                value={date}
                onChange={handleDateChange}
                min={getTodayString()}
                max={getTodayString()}
                disabled={editingId !== null}
              />
            </div>
            <div>
              <Label className="mb-1 font-medium block">Attendance Type</Label>
              <Select onValueChange={setAttendanceType} value={attendanceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select attendance type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-Day">Full-Day</SelectItem>
                  <SelectItem value="Half-Day">Half-Day</SelectItem>
                  <SelectItem value="Leave">Leave</SelectItem>
                  <SelectItem value="Duty-Leave">Duty-Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {attendanceType && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1 font-medium block">
                  In Time
                  {['Full-Day', 'Half-Day'].includes(attendanceType) && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </Label>
                <Input
                  type="time"
                  value={inTime}
                  onChange={e => setInTime(e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1 font-medium block">
                  Out Time
                  {['Full-Day', 'Half-Day'].includes(attendanceType) && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </Label>
                <Input
                  type="time"
                  value={outTime}
                  onChange={e => setOutTime(e.target.value)}
                />
              </div>
            </div>
          )}

          {attendanceType === 'Leave' && (
            <div>
              <Label className="mb-1 font-medium block">Reason for Leave</Label>
              <Textarea
                placeholder="Please enter the reason..."
                value={leaveReason}
                onChange={e => setLeaveReason(e.target.value)}
                required
              />
            </div>
          )}

          <div className="flex gap-4 pt-2">
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
              {editingId ? 'Update Record' : 'Submit Attendance'}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel Edit
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* --- Attendance History --- */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Attendance History</h2>
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time (In/Out)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.length > 0 ? (
                history.map(record => (
                  <tr key={record._id}>
                    <td className="px-6 py-4">{record.date}</td>
                    <td className="px-6 py-4">{record.attendanceType}</td>
                    <td className="px-6 py-4">{`${record.inTime || '--:--'} - ${record.outTime || '--:--'}`}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                          record.status
                        )}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {record.status === 'Pending' ? (
                        <div className="flex gap-4">
                          <button
                            onClick={() => handleEditClick(record)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(record._id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400">Locked</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CoachAttendancePage;
