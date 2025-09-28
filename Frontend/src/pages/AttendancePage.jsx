// File: frontend/src/pages/AttendancePage.jsx (With Hover Animation)

import React, { useState, useEffect, useMemo } from 'react';
import { getCoaches, getAttendance, markAttendance, deleteAttendance } from '../api/attendanceService';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const AttendancePage = () => {
    const getTodayString = () => new Date().toISOString().slice(0, 10);
    
    const [selectedDate, setSelectedDate] = useState(getTodayString);
    const [coaches, setCoaches] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [selectedCoach, setSelectedCoach] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    
    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [coachesData, attendanceData] = await Promise.all([getCoaches(), getAttendance()]);
            setCoaches(coachesData);
            setAttendanceRecords(attendanceData);
            setError('');
        } catch (err) {
            setError('Failed to fetch initial data.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const todayStr = getTodayString();
        if (selectedDate !== todayStr) {
            setSelectedDate(todayStr);
        }
    }, []);


    useEffect(() => {
        if (selectedCoach && selectedDate) {
            const dayOfWeek = new Date(selectedDate + 'T00:00:00Z').getUTCDay();
            if (dayOfWeek === 0) return;
            const existingRecord = attendanceRecords.find(record => 
                record.memberId?._id === selectedCoach && record.date === selectedDate
            );
            if (existingRecord) {
                setSelectedStatus(existingRecord.status);
                setIsEditing(true);
            } else {
                setSelectedStatus('');
                setIsEditing(false);
            }
        } else {
            setIsEditing(false);
        }
    }, [selectedCoach, selectedDate, attendanceRecords]);
    
    const groupedAttendance = useMemo(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().slice(0, 10);
        const groups = attendanceRecords.reduce((acc, record) => {
            const coachId = record.memberId?._id;
            if (!coachId) return acc;
            if (!acc[coachId]) {
                acc[coachId] = { coachName: `${record.memberId.firstName} ${record.memberId.lastName || ''}`, records: [], summary: { 'Work Full-Day': 0, 'Work Half-Day': 0, 'Absent': 0, 'Duty-Leave': 0, 'Leave': 0 }};
            }
            acc[coachId].records.push(record);
            if (record.date && record.date >= thirtyDaysAgoStr) {
                if (acc[coachId].summary[record.status] !== undefined) acc[coachId].summary[record.status]++;
            }
            return acc;
        }, {});
        Object.values(groups).forEach(group => group.records.sort((a, b) => (b.date || '').localeCompare(a.date || '')));
        return groups;
    }, [attendanceRecords]);

    const resetForm = () => {
        setSelectedCoach('');
        setSelectedStatus('');
        setSelectedDate(getTodayString());
        setIsEditing(false);
    };

    const handleMarkOrUpdate = async (e) => {
        e.preventDefault();
        if (!selectedCoach || !selectedDate || !selectedStatus) {
            alert('Please fill all fields'); return;
        }
        try {
            const result = await markAttendance({ memberId: selectedCoach, date: selectedDate, status: selectedStatus });
            alert(result.message);
            resetForm();
            await fetchData();
        } catch (err) {
            alert(`Failed to save attendance: ${err.response?.data?.message || 'Error'}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await deleteAttendance(id);
                alert('Record deleted successfully');
                await fetchData();
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete record.');
            }
        }
    };

    const handleEditClick = (record) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setSelectedCoach(record.memberId._id);
        setSelectedDate(record.date);
    };

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        const dayOfWeek = new Date(newDate + 'T00:00:00Z').getUTCDay();

        if (dayOfWeek === 0) { 
            alert("Sundays are holidays and cannot be selected.");
        } else {
            setSelectedDate(newDate);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) { case 'Work Full-Day': return 'bg-green-100 text-green-800'; case 'Work Half-Day': return 'bg-yellow-100 text-yellow-800'; case 'Absent': return 'bg-red-100 text-red-800'; case 'Duty-Leave': return 'bg-blue-100 text-blue-800'; case 'Leave': return 'bg-purple-100 text-purple-800'; default: return 'bg-gray-100 text-gray-800';}
    };
    
    const filteredCoachIds = useMemo(() => {
        if (!searchQuery) {
            return Object.keys(groupedAttendance);
        }
        return Object.keys(groupedAttendance).filter(coachId =>
            groupedAttendance[coachId].coachName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, groupedAttendance]);

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">Coach Attendance Management</h1>
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-4 z-40">
                <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Update Attendance Record' : 'Mark New Attendance'}</h2>
                <form onSubmit={handleMarkOrUpdate} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="flex flex-col"><label className="mb-1 font-medium">Coach</label><Select onValueChange={setSelectedCoach} value={selectedCoach}><SelectTrigger><SelectValue placeholder="Select Coach" /></SelectTrigger><SelectContent className="z-50 bg-white border shadow-lg">{coaches.map((coach) => (<SelectItem key={coach._id} value={coach._id}>{coach.firstName} {coach.lastName}</SelectItem>))}</SelectContent></Select></div>
                    <div className="flex flex-col"><label className="mb-1 font-medium">Date</label>
                    <Input type="date" value={selectedDate} onChange={handleDateChange} max={getTodayString()} /></div>
                    <div className="flex flex-col"><label className="mb-1 font-medium">Status</label>
                        <Select onValueChange={setSelectedStatus} value={selectedStatus}>
                            <SelectTrigger><SelectValue placeholder={isEditing ? "Update status..." : "Select Status"} /></SelectTrigger>
                            <SelectContent className="z-50 bg-white border shadow-lg">
                                <SelectItem value="Work Full-Day">Work Full-Day</SelectItem>
                                <SelectItem value="Work Half-Day">Work Half-Day</SelectItem>
                                <SelectItem value="Absent">Absent</SelectItem>
                                <SelectItem value="Duty-Leave">Duty-Leave</SelectItem>
                                <SelectItem value="Leave">Leave</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='flex gap-2 md:col-start-5'>
                        <Button
                            type="submit"
                            disabled={!selectedCoach || !selectedStatus}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            {isEditing ? 'Update' : 'Mark'}
                        </Button>
                        {isEditing && (<Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>)}
                    </div>
                </form>
            </div>
            <div>
                 <h2 className="text-xl font-semibold mb-4">Attendance History & 30-Day Summary</h2>
                 
                <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
                     <Input
                        type="text"
                        placeholder="Search by coach name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-1/3"
                    />
                </div>

                {isLoading ? <p>Loading...</p> : error ? <p className="text-red-500">{error}</p> :
                <div className="space-y-6">
                    {filteredCoachIds.length > 0 ? (filteredCoachIds.map(coachId => { 
                        const { coachName, records, summary } = groupedAttendance[coachId]; 
                        return (
                        // ★★★★★★★★★★★★★★★★★★★★★★★ මෙන්න වෙනස් කළ කොටස ★★★★★★★★★★★★★★★★★★★★★★★
                        <div 
                            key={coachId} 
                            className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2 cursor-pointer"
                        >
                        {/* ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★ */}
                            <h3 className="text-lg font-bold text-gray-800 mb-4">{coachName}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 border-b pb-4">
                                <div className="text-center p-2 rounded-lg bg-green-50"><p className="text-2xl font-bold text-green-700">{summary['Work Full-Day']}</p><p className="text-sm text-gray-600">Full Days</p></div>
                                <div className="text-center p-2 rounded-lg bg-yellow-50"><p className="text-2xl font-bold text-yellow-700">{summary['Work Half-Day']}</p><p className="text-sm text-gray-600">Half Days</p></div>
                                <div className="text-center p-2 rounded-lg bg-red-50"><p className="text-2xl font-bold text-red-700">{summary['Absent']}</p><p className="text-sm text-gray-600">Absences</p></div>
                                <div className="text-center p-2 rounded-lg bg-blue-50"><p className="text-2xl font-bold text-blue-700">{summary['Duty-Leave']}</p><p className="text-sm text-gray-600">Duty Leaves</p></div>
                                <div className="text-center p-2 rounded-lg bg-purple-50"><p className="text-2xl font-bold text-purple-700">{summary['Leave']}</p><p className="text-sm text-gray-600">Leaves</p></div>
                            </div>
                            <details open={records.length < 5 && records.length > 0}>
                                <summary className="font-medium text-indigo-600 hover:underline">View All Records ({records.length})</summary>
                                <div className="overflow-x-auto mt-4">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
                                        <tbody className="bg-white divide-y divide-gray-200">{records.map((record) => (<tr key={record._id}><td className="px-6 py-4 whitespace-nowrap">{record.date}</td><td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(record.status)}`}>{record.status}</span></td><td className="px-6 py-4 whitespace-nowrap flex gap-4"><button onClick={() => handleEditClick(record)} className="text-indigo-600 hover:text-indigo-900 font-medium">Update</button><button onClick={() => handleDelete(record._id)} className="text-red-600 hover:text-red-900 font-medium">Delete</button></td></tr>))}</tbody>
                                    </table>
                                </div>
                            </details>
                        </div>
                    )})) : (
                         <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
                            <p>No coach found for "{searchQuery}". Clear the search to see all coaches.</p>
                         </div>
                    )}
                </div>}
            </div>
        </div>
    );
};
export default AttendancePage;