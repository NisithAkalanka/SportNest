// File: Frontend/src/pages/ManageCoachesPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { getCoachesData, updateSalary, deleteSalary } from '../api/coachService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Edit, Check, X, Trash2, PlusCircle } from 'lucide-react'; // අවශ්‍ය icons import කිරීම

const ManageCoachesPage = () => {
    const [coaches, setCoaches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [editingCoachId, setEditingCoachId] = useState(null);
    const [newSalary, setNewSalary] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchCoaches = async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await getCoachesData();
            setCoaches(data);
        } catch (err) {
            setError('Failed to fetch coaches data.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCoaches();
    }, []);

    const filteredCoaches = useMemo(() => {
        if (!searchQuery) return coaches;
        return coaches.filter(coach =>
            `${coach.firstName} ${coach.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            coach.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, coaches]);

    const handleUpdateOrAddClick = (coach) => {
        setEditingCoachId(coach._id);
        setNewSalary(coach.baseSalary ? coach.baseSalary.toString() : '');
    };
    
    const handleCancelClick = () => {
        setEditingCoachId(null);
        setNewSalary('');
    };

    const handleSaveSalary = async (coachId) => {
        if (newSalary.trim() === '' || isNaN(newSalary) || Number(newSalary) < 0) {
            alert('Please enter a valid, non-negative salary.');
            return;
        }
        try {
            await updateSalary(coachId, Number(newSalary));
            alert('Salary updated successfully!');
            handleCancelClick();
            fetchCoaches(); // දත්ත නැවත ලබා ගැනීම
        } catch (err) {
            alert('Failed to update salary.');
        }
    };

    // ★★★ Salary එක delete කිරීමට අදාළ function එක ★★★
    const handleDeleteSalary = async (coachId) => {
        if (window.confirm('Are you sure you want to delete this salary? The coach will have no basic salary.')) {
            try {
                await deleteSalary(coachId);
                alert('Salary deleted successfully!');
                fetchCoaches(); // දත්ත නැවත ලබා ගැනීම
            } catch (err) {
                alert('Failed to delete salary.');
            }
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Coaches & Salaries</h1>
            <div className="bg-white p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl border-t-4 border-orange-500">
                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-1/2 lg:w-1/3 pl-10 focus:ring-2 focus:ring-orange-500"
                    />
                </div>
                {isLoading && <p className="text-center p-4 text-blue-600 font-semibold">Loading coaches...</p>}
                {error && <p className="text-red-600 bg-red-100 p-4 rounded-lg text-center font-medium">{error}</p>}
                {!isLoading && !error && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Base Salary (LKR)</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCoaches.length > 0 ? (
                                    filteredCoaches.map((coach) => (
                                        <tr key={coach._id} className="hover:bg-orange-50 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{coach.firstName} {coach.lastName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">{coach.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {editingCoachId === coach._id ? (
                                                    <Input 
                                                        type="number" 
                                                        value={newSalary}
                                                        onChange={(e) => setNewSalary(e.target.value)}
                                                        className="max-w-xs focus:ring-2 focus:ring-green-500"
                                                        placeholder="Enter salary"
                                                    />
                                                ) : (
                                                    // ★★★ Salary එකක් ඇත්නම් එයත්, නැත්නම් පණිවිඩයත් පෙන්වීම ★★★
                                                    (coach.baseSalary !== undefined && coach.baseSalary !== null) ? (
                                                        <span className="font-semibold text-gray-800">{parseFloat(coach.baseSalary).toFixed(2)}</span>
                                                    ) : (
                                                        <span className="text-gray-500 italic">No basic salary</span>
                                                    )
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {editingCoachId === coach._id ? (
                                                    <div className="flex justify-center gap-2">
                                                        <Button onClick={() => handleSaveSalary(coach._id)} size="sm" className="bg-green-600 text-white hover:bg-green-700">
                                                            <Check className="h-4 w-4 mr-1" /> Save
                                                        </Button>
                                                        <Button onClick={handleCancelClick} variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-200">
                                                            <X className="h-4 w-4 mr-1" /> Cancel
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    // ★★★ Salary එකේ පැවැත්ම මත බොත්තම් වෙනස් කර පෙන්වීම ★★★
                                                    <div className="flex justify-center gap-2">
                                                        {(coach.baseSalary !== undefined && coach.baseSalary !== null) ? (
                                                            <>
                                                                <Button onClick={() => handleUpdateOrAddClick(coach)} variant="outline" size="sm" className="text-blue-600 border-blue-500 hover:bg-blue-50 hover:text-blue-700">
                                                                    <Edit className="h-4 w-4 mr-2" /> Update
                                                                </Button>
                                                                <Button onClick={() => handleDeleteSalary(coach._id)} variant="outline" size="sm" className="text-red-600 border-red-500 hover:bg-red-50 hover:text-red-700">
                                                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <Button onClick={() => handleUpdateOrAddClick(coach)} size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                                                                <PlusCircle className="h-4 w-4 mr-2" /> Add Salary
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-8 text-gray-500">
                                            {searchQuery ? `No coaches found for "${searchQuery}".` : "No coaches available."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageCoachesPage;