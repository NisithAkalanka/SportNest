import React, { useState, useEffect } from 'react';
import axios from 'axios';
// ... (ඔබගේ අනෙකුත් සියලුම UI component imports එලෙසම තබාගන්න)
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';

// ★★★★★ නිවැරදි කරන ලද, සම්පූර්ණ Axios Interceptor එක ★★★★★
const api = axios.create({
  baseURL: 'http://localhost:5002/api' // Backend port එකට අනුව සකසන්න
});

api.interceptors.request.use((config) => {
  // 1. 'adminInfo' key එකෙන් සම්පූර්ණ object එකම ගන්නවා
  const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
  // 2. 'adminInfo' object එකේ token එක තියෙනවද බලනවා
  if (adminInfo && adminInfo.token) {
    // 3. 'Authorization' header එකට, 'Bearer' සමග token එක යවනවා
    config.headers['Authorization'] = `Bearer ${adminInfo.token}`;
  }
  return config;
}, (error) => Promise.reject(error));
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★


const ManageSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    _id: null, name: '', contactPerson: '', email: '', phone: '', address: ''
  });

  const resetForm = () => { /* ... no changes ... */ };
  const fetchData = async () => { /* ... no changes ... */ };
  useEffect(() => { fetchData(); }, []);
  const handleInputChange = (e) => { /* ... no changes ... */ };
  const handleSubmit = async (e) => { /* ... no changes ... */ };
  const handleEdit = (supplier) => { /* ... no changes ... */ };
  const handleDelete = async (supplierId) => { /* ... no changes ... */ };

  if (isLoading) return <p>Loading suppliers...</p>;

  return (
    // ★★★★★ ඔබගේ JSX (UI) කේතය ඉතාම විශිෂ්ටයි! කිසිදු වෙනසක් අවශ්‍ය නැහැ ★★★★★
    <div className="text-white">
      {/* --- Header --- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Suppliers</h1>
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsDialogOpen(isOpen); }}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add New Supplier
            </Button>
          </DialogTrigger>
           {/* ... ඔබගේ සම්පූර්ණ Dialog Content සහ Form එක මෙතැන ... */}
        </Dialog>
      </div>
      
      {/* --- Suppliers Table --- */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        {/* ... ඔබගේ සම්පූර්ණ Table එක මෙතැන ... */}
      </div>
    </div>
  );
};
export default ManageSuppliers;