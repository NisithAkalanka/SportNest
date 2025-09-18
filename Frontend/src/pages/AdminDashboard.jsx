// src/pages/AdminDashboard.jsx (සම්පූර්ණ, නිවැරදි සහ වැඩිදියුණු කරන ලද කේතය)

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // අපි කෙලින්ම axios භාවිතා කරමු
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faShoppingCart, faBoxOpen, faClipboardList } from '@fortawesome/free-solid-svg-icons';

const AdminDashboard = () => { 
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError('');
      try {
        // ★★★★★ මෙන්න නිවැරදි කරන ලද වැදගත්ම කොටස ★★★★★

        // 1. LocalStorage එකෙන් 'adminInfo' object එක ලබාගන්නවා.
        const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
        
        // 2. ඒකෙන් token එක ගන්නවා. Token එකක් නැත්නම් error එකක් පෙන්වනවා.
        if (!adminInfo || !adminInfo.token) {
          setError('Authorization failed. Please login again.');
          setIsLoading(false);
          return;
        }

        // 3. API request එක යවන්න කලින්, 'config' object එකක් හදනවා
        const config = {
          headers: {
            // 4. Authorization header එකට 'Bearer' සමග token එක එකතු කරනවා
            Authorization: `Bearer ${adminInfo.token}`
          }
        };

        // 5. Token එකත් එක්ක request එක Backend එකට යවනවා
        const response = await axios.get('/api/dashboard/stats', config);
        setStats(response.data);

      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setError('Could not load dashboard data. You may not have permission.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Loading, Error, සහ stats හිස් නම් පෙන්වන UI
  if (isLoading) return <div className="p-10"><h1 className="text-3xl font-bold">Loading Dashboard...</h1></div>;
  if (error) return <div className="p-10"><h1 className="text-3xl font-bold text-red-600">{error}</h1></div>;
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      {/* Stats තියෙනවා නම් විතරක් cards පෙන්වන්න */}
      {stats ? (
        <>
          {/* --- Quick Summary Cards --- */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <FontAwesomeIcon icon={faDollarSign} className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Rs. {stats.totalRevenue.toFixed(2)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
                    <FontAwesomeIcon icon={faShoppingCart} className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{stats.totalItemsSold}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <FontAwesomeIcon icon={faClipboardList} className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalOrders}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Items in Stock</CardTitle>
                    <FontAwesomeIcon icon={faBoxOpen} className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalInventoryItems}</div>
                </CardContent>
            </Card>
          </div>
          {/* ... අනිත් card ටික මෙතනට එනවා ... */}
        </>
      ) : (
        <p>No dashboard statistics available at the moment.</p>
      )}
    </div>
  );
};

export default AdminDashboard;