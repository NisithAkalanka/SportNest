// ===============================================
// File: Frontend/src/pages/AttendancePage.jsx
// ===============================================
//yoma
import React, { useState, useEffect, useMemo } from 'react';
import { 
    getPendingForAdmin, 
    updateStatusByAdmin, 
    getAllAttendanceForAdmin, 
    deleteAttendanceByAdmin, 
    updateRecordByAdmin 
} from '../api/attendanceService';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const AttendancePage = () => {
    const [pending, setPending] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('pending');

    const [editingRecord, setEditingRecord] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch data
    const fetchData = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            if (activeTab === 'pending') {
                const pendingData = await getPendingForAdmin();
                setPending(pendingData);
            } else {
                const historyData = await getAllAttendanceForAdmin();
                setHistory(historyData);
            }
        } catch (err) {
            console.error("Fetch Error:", err.response || err);
            setError(`Failed to fetch ${activeTab} data.`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    // Status & Delete
    const handleUpdateStatus = async (id, newStatus) => {
        if (!window.confirm(`Are you sure you want to ${newStatus.toLowerCase()} this request?`)) return;
        setError(''); setSuccess('');
        try {
            const result = await updateStatusByAdmin(id, newStatus);
            setSuccess(result.message);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${newStatus.toLowerCase()} attendance.`);
        }
    };

    const handleDeleteByAdmin = async (id) => {
        if (window.confirm('ADMIN ACTION: Are you sure you want to permanently delete this record? This cannot be undone.')) {
            setError(''); setSuccess('');
            try {
                const result = await deleteAttendanceByAdmin(id);
                setSuccess(result.message);
                fetchData();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete record.');
            }
        }
    };

    // Modal logic (only status editable)
    const handleEditClick = (record) => {
        setEditingRecord({
            ...record,
            date: record.date.includes('T') ? record.date.split('T')[0] : record.date
        });
        setIsModalOpen(true);
    };

    const handleModalSelectChange = (value) => {
        setEditingRecord(prev => ({ ...prev, status: value }));
    };

    const handleSaveChanges = async () => {
        setError(''); setSuccess('');
        try {
            const result = await updateRecordByAdmin(editingRecord._id, { status: editingRecord.status });
            setSuccess(result.message);
            fetchData();
            setIsModalOpen(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update status.');
        }
    };

    // Helpers
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const groupedHistory = useMemo(() => {
        return history.reduce((acc, record) => {
            const coachId = record.memberId?._id;
            if (!coachId) return acc;
            if (!acc[coachId]) {
                acc[coachId] = {
                    coachName: `${record.memberId.firstName || ''} ${record.memberId.lastName || ''}`.trim() || 'Unnamed Coach',
                    records: [],
                    summary: { Approved: 0, Pending: 0, Rejected: 0 }
                };
            }
            acc[coachId].records.push(record);
            if (acc[coachId].summary[record.status] !== undefined) {
                acc[coachId].summary[record.status]++;
            }
            return acc;
        }, {});
    }, [history]);

    // Pending table
    const renderPendingTable = () => (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md mt-4">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coach</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {pending.length > 0 ? pending.map(rec => (
                        <tr key={rec._id}>
                            <td className="px-6 py-4">{`${rec.memberId?.firstName || 'N/A'} ${rec.memberId?.lastName || ''}`}</td>
                            <td className="px-6 py-4">{rec.date}</td>
                            <td className="px-6 py-4">{rec.attendanceType}</td>
                            <td className="px-6 py-4 max-w-xs whitespace-pre-wrap">{rec.leaveReason || '-'}</td>
                            <td className="px-6 py-4">{`${rec.inTime || '--:--'} - ${rec.outTime || '--:--'}`}</td>
                            <td className="px-6 py-4 flex gap-2">
                                <Button onClick={() => handleUpdateStatus(rec._id, 'Approved')} size="sm" className="bg-green-600 hover:bg-green-700">Approve</Button>
                                <Button onClick={() => handleUpdateStatus(rec._id, 'Rejected')} size="sm" variant="destructive">Reject</Button>
                            </td>
                        </tr>
                    )) : <tr><td colSpan="6" className="text-center p-4 text-gray-500">No pending requests.</td></tr>}
                </tbody>
            </table>
        </div>
    );

    // History view
    const renderHistoryView = () => (
        <div className="space-y-6 mt-4">
            {Object.keys(groupedHistory).length > 0 ? 
                Object.values(groupedHistory).map(coachData => (
                    <div key={coachData.coachName} className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">{coachData.coachName}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 border-b pb-4">
                            <div className="text-center p-2 rounded-lg bg-green-50">
                                <p className="text-2xl font-bold text-green-700">{coachData.summary.Approved}</p>
                                <p className="text-sm text-gray-600">Approved</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-yellow-50">
                                <p className="text-2xl font-bold text-yellow-700">{coachData.summary.Pending}</p>
                                <p className="text-sm text-gray-600">Pending</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-red-50">
                                <p className="text-2xl font-bold text-red-700">{coachData.summary.Rejected}</p>
                                <p className="text-sm text-gray-600">Rejected</p>
                            </div>
                        </div>
                        <details>
                            <summary className="font-medium text-indigo-600 hover:underline cursor-pointer">View All Records ({coachData.records.length})</summary>
                            <div className="overflow-x-auto mt-4">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {coachData.records.sort((a, b) => new Date(b.date) - new Date(a.date)).map(record => (
                                            <tr key={record._id}>
                                                <td className="px-6 py-4">{record.date}</td>
                                                <td className="px-6 py-4">{record.attendanceType}</td>
                                                <td className="px-6 py-4 max-w-xs whitespace-pre-wrap">{record.leaveReason || '-'}</td>
                                                <td className="px-6 py-4">{`${record.inTime || '--:--'} - ${record.outTime || '--:--'}`}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(record.status)}`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 flex gap-4">
                                                    <button onClick={() => handleEditClick(record)} className="text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>
                                                    <button onClick={() => handleDeleteByAdmin(record._id)} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </details>
                    </div>
                ))
             : (
                <div className="text-center p-6 bg-white rounded-lg shadow-md">
                    <p className="text-gray-500">No historical records found.</p>
                </div>
             )}
        </div>
    );

    // Render
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Coach Attendance Approval</h1>
            {error && <p className="text-red-500 bg-red-50 p-3 rounded-md">{error}</p>}
            {success && <p className="text-green-500 bg-green-50 p-3 rounded-md">{success}</p>}

            <div className="flex border-b">
                <button onClick={() => setActiveTab('pending')} className={`py-2 px-4 ${activeTab === 'pending' ? 'border-b-2 border-blue-600 font-semibold' : ''}`}>
                    Pending Requests ({loading && activeTab === 'pending' ? '...' : pending.length})
                </button>
                <button onClick={() => setActiveTab('history')} className={`py-2 px-4 ${activeTab === 'history' ? 'border-b-2 border-blue-600 font-semibold' : ''}`}>
                    Full History
                </button>
            </div>

            {loading ? <p className="text-center mt-4">Loading...</p> : (
                activeTab === 'pending' ? renderPendingTable() : renderHistoryView()
            )}

            {/* 🟦 Admin Status Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[450px] rounded-2xl shadow-xl bg-gradient-to-b from-white to-gray-50 p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-gray-800 mb-1">🛠 Edit Attendance Status</DialogTitle>
                        <p className="text-sm text-gray-500 mb-3">Only the status field can be modified by the admin.</p>
                    </DialogHeader>

                    <div className="grid gap-4">
                        <div>
                            <Label>Date</Label>
                            <Input value={editingRecord?.date || ''} disabled className="bg-gray-100 text-gray-600" />
                        </div>
                        <div>
                            <Label>Attendance Type</Label>
                            <Input value={editingRecord?.attendanceType || ''} disabled className="bg-gray-100 text-gray-600" />
                        </div>
                        <div>
                            <Label>Status</Label>
                            <Select onValueChange={handleModalSelectChange} value={editingRecord?.status || ''}>
                                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Approved">Approved</SelectItem>
                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="mt-5 flex justify-end gap-3">
                        <DialogClose asChild>
                            <Button variant="outline" className="rounded-lg">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleSaveChanges} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow">
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AttendancePage;
