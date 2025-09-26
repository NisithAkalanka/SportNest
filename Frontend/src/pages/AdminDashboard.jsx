import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDollarSign, 
  faShoppingCart, 
  faBoxOpen, 
  faClipboardList, 
  faUsers, 
  faUserCheck, 
  faUserTimes, 
  faUserFriends 
} from '@fortawesome/free-solid-svg-icons';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError('');
      try {
        const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
        if (!adminInfo || !adminInfo.token) {
          setError('Authorization failed. Please login again.');
          setIsLoading(false);
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${adminInfo.token}`
          }
        };

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

  if (isLoading) {
    return (
      <div className="p-10">
        <h1 className="text-3xl font-bold">Loading Dashboard...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10">
        <h1 className="text-3xl font-bold text-red-600">{error}</h1>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

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
                <div className="text-2xl font-bold">{stats.totalItemsSold}</div>
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

          {/* --- Suppliers & Expiring Items --- */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Expiring Soon Items</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.expiringSoonItems && stats.expiringSoonItems.length > 0 ? (
                  <ul className="space-y-2">
                    {stats.expiringSoonItems.map((item, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span className="text-gray-500">
                          {new Date(item.expiryDate).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No items expiring soon.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Suppliers</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.recentSuppliers && stats.recentSuppliers.length > 0 ? (
                  <ul className="space-y-2">
                    {stats.recentSuppliers.map((sup, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span>{sup.name}</span>
                        <span className="text-gray-500">{sup.phone}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No recent suppliers.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <p>No dashboard statistics available at the moment.</p>
      )}
    </div>
  );
};

export default AdminDashboard;
