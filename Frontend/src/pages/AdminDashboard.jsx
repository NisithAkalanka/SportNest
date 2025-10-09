import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList, faDollarSign, faExclamationTriangle, faRedo, faBoxOpen, faShoppingCart, faUsers, faWarehouse, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  
  const [preorderOpen, setPreorderOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [preQty, setPreQty] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ★★★ Payment modal states ★★★
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    preorder: null, // to hold created preorder
  });

  const navigate = useNavigate();


  const fetchStats = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
      setError('Failed to load stats');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // --- Inventory pie data (safe fallbacks) ---
  const lowCount = stats?.lowStockItems?.length || 0;
  const expCount = stats?.expiringSoonItems?.length || 0;
  const totalItems = (stats?.totalItems ?? stats?.totalActiveItems ?? stats?.totalUniqueItems);
  const healthyCount = typeof totalItems === 'number' ? Math.max(0, totalItems - lowCount - expCount) : null;

  const inventoryPieData = [
    ...(healthyCount !== null ? [{ name: 'Healthy', value: healthyCount }] : []),
    { name: 'Low Stock', value: lowCount },
    { name: 'Expiring Soon', value: expCount },
  ].filter(d => d.value > 0);

  const PIE_COLORS = ['#10B981', '#F59E0B', '#EF4444']; // emerald, amber, red

  // --- Top Selling (safe gather from multiple possible shapes) ---
  const rawTop = Array.isArray(stats?.topSellingItems)
    ? stats.topSellingItems
    : Array.isArray(stats?.salesByItem)
      ? stats.salesByItem
      : Array.isArray(stats?.popularItems)
        ? stats.popularItems
        : [];

  const topDataAll = rawTop
    .map((it) => ({
      name: it.name || it.itemName || it?.item?.name || it?.itemNameText || 'Item',
      value: Number(it.sold ?? it.totalSold ?? it.count ?? it.quantity ?? it.units ?? 0)
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const top5Data = topDataAll.slice(0, 5);
  const otherSum = topDataAll.slice(5).reduce((sum, d) => sum + d.value, 0);
  const sharePieData = [
    ...top5Data.length ? [{ name: 'Top 5', value: top5Data.reduce((s, d) => s + d.value, 0) }] : [],
    ...(otherSum > 0 ? [{ name: 'Others', value: otherSum }] : []),
  ];

  const BAR_COLOR = '#10B981';

  const openPreorder = (item) => {
    setSelectedItem(item);
    setPreQty(Math.max(10, Number(item.reorderPoint || 10)));
    setPreorderOpen(true);
  };
  
  const handlePreorderSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem || preQty <= 0) {
      setToast({ type: 'error', msg: 'Invalid item or quantity.' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setIsSubmitting(true);
    const payload = {
        itemId: selectedItem._id, quantity: Number(preQty),
        supplierEmail: selectedItem.supplier?.email,
        supplierName: selectedItem.supplier?.name,
        itemName: selectedItem.name,
    };
    try {
      const res = await api.post('/preorders', payload);
      setToast({ type: 'success', msg: 'Pre-order created successfully! Please log the payment.' });
      localStorage.setItem('preorderUpdated', String(Date.now()));
      fetchStats();
      setPreorderOpen(false);

      // ★★★ Open Payment modal with created preorder ★★★
      setPaymentData({
        amount: '',
        preorder: res?.data?.preorder ?? res?.data ?? null
      });
      setPaymentModalOpen(true);

      setSelectedItem(null);
    } catch (err) {
      const msg = err.response?.data?.msg || 'Pre-order failed. Check server logs.';
      setToast({ type: 'error', msg });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  // ★★★ Log Payment handler ★★★
  const handlePaymentLogSubmit = async (e) => {
    e.preventDefault();
    if (!paymentData.preorder || !paymentData.amount || Number(paymentData.amount) <= 0) {
      setToast({ type: 'error', msg: 'Please enter a valid amount.' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const payload = {
      description: `Payment for Pre-order: ${paymentData.preorder?.item?.name ?? 'Item'} (Qty: ${paymentData.preorder?.quantity ?? 'N/A'})`,
      amount: Number(paymentData.amount),
      supplierId: paymentData.preorder?.supplier?._id,
      preorderId: paymentData.preorder?._id,
      category: 'Supplier Payment'
    };

    setIsSubmitting(true);
    try {
      await api.post('/expenses/log', payload);
      setToast({ type: 'success', msg: 'Payment logged successfully as an expense!' });
      setPaymentModalOpen(false);
      setSelectedItem(null);
    } catch (err) {
      const msg = err.response?.data?.msg || 'Failed to log payment.';
      setToast({ type: 'error', msg });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setToast(null), 4000);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-CA');
  };

  if (isLoading) return <div className="p-10">Loading Dashboard...</div>;
  if (error) return <div className="p-10 text-red-600">{error}</div>;
  if (!stats) return <div className="p-10">No statistics available.</div>;
  
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 p-3 rounded shadow-lg text-sm ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-lg text-gray-500 mt-1">A quick overview of your shop's performance and status.</p>
        </div>
        <Button onClick={fetchStats} disabled={isLoading}>
          <FontAwesomeIcon icon={faRedo} className={isLoading ? 'animate-spin mr-2' : 'mr-2'}/>
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Revenue</CardTitle><FontAwesomeIcon icon={faDollarSign} className="h-4 w-4 text-gray-400" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">Rs. {stats.totalRevenue.toFixed(2)}</div></CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Items Sold</CardTitle><FontAwesomeIcon icon={faShoppingCart} className="h-4 w-4 text-gray-400" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">+{stats.totalItemsSold}</div></CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Orders</CardTitle><FontAwesomeIcon icon={faClipboardList} className="h-4 w-4 text-gray-400" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalOrders}</div></CardContent>
        </Card>
         <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Suppliers</CardTitle><FontAwesomeIcon icon={faUsers} className="h-4 w-4 text-gray-400" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalSuppliers}</div></CardContent>
        </Card>
      </div>

      {/* Inventory Overview (Pie) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Inventory Overview</CardTitle>
            <CardDescription>Current stock status</CardDescription>
          </CardHeader>
          <CardContent>
            {inventoryPieData.length > 0 ? (
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inventoryPieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={100}
                      paddingAngle={2}
                      label
                    >
                      {inventoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No inventory data to display.</div>
            )}
          </CardContent>
        </Card>

        {/* Top Selling Items */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
            <CardDescription>Best performers (bar) & overall share</CardDescription>
          </CardHeader>
          <CardContent>
            {top5Data.length > 0 ? (
              <>
                {/* Bar chart: Top 5 items */}
                <div className="w-full h-64 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={top5Data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-10} textAnchor="end" height={50} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill={BAR_COLOR} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Donut: Share Top 5 vs Others (optional if others>0) */}
                {sharePieData.length > 0 && (
                  <div className="w-full h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={sharePieData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} label>
                          {sharePieData.map((entry, idx) => (
                            <Cell key={`share-${idx}`} fill={idx === 0 ? '#059669' : '#93C5FD'} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-gray-500">No sales breakdown available.</div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Action Center</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="flex flex-col border-yellow-400 shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader className="text-yellow-800 bg-yellow-50 p-4 rounded-t-lg border-b border-yellow-200">
            <CardTitle className="flex items-center"><FontAwesomeIcon icon={faWarehouse} className="mr-3" />Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-4">
            <div className="overflow-auto max-h-52 pr-2">
              <Table>
                <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Qty Left</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {stats.lowStockItems.length > 0 ? (stats.lowStockItems.map(it => (
                    <TableRow key={it._id}>
                      <TableCell className="font-medium">{it.name}</TableCell>
                      <TableCell className="font-bold text-yellow-600">{it.quantity}</TableCell>
                      <TableCell className="text-right"><Button variant="link" size="sm" className="h-auto p-0 text-blue-600 font-semibold" onClick={() => openPreorder(it)}>Pre-order</Button></TableCell>
                    </TableRow>
                  ))) : <TableRow><TableCell colSpan={3} className="text-center h-24">No low stock items.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        <Card className="flex flex-col border-red-400 shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader className="text-red-800 bg-red-50 p-4 rounded-t-lg border-b border-red-200">
            <CardTitle className="flex items-center"><FontAwesomeIcon icon={faExclamationTriangle} className="mr-3" />Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-4">
            <div className="overflow-auto max-h-52 pr-2">
              <Table>
                <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Expires On</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {stats.expiringSoonItems.length > 0 ? (stats.expiringSoonItems.map(it => (
                    <TableRow key={it._id}>
                      <TableCell className="font-medium">{it.name} <span className="text-xs text-gray-500">({it.quantity} units)</span></TableCell>
                      <TableCell className="font-mono text-red-600 font-semibold">{formatDate(it.expiryDate)}</TableCell>
                      <TableCell className="text-right"><Button variant="link" size="sm" className="h-auto p-0 text-blue-600 font-semibold" onClick={() => openPreorder(it)}>Pre-order</Button></TableCell>
                    </TableRow>
                  ))) : <TableRow><TableCell colSpan={3} className="text-center h-24">No items are expiring soon.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={preorderOpen} onOpenChange={setPreorderOpen}>
        <DialogContent className="bg-white">
          <DialogHeader><DialogTitle>Create Pre-order for: {selectedItem?.name}</DialogTitle></DialogHeader>
          <form onSubmit={handlePreorderSubmit} className="mt-4 grid gap-4">
            <div><Label>Supplier</Label><div className="text-sm font-semibold">{selectedItem?.supplier?.name ?? 'Not specified'}</div><div className="text-xs text-gray-500">{selectedItem?.supplier?.email ?? 'An email is required to pre-order'}</div></div>
            <div><Label htmlFor="preQty">Quantity</Label><Input id="preQty" type="number" min={1} value={preQty} onChange={(e) => setPreQty(Number(e.target.value))} required /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPreorderOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting || !selectedItem?.supplier?.email}>{isSubmitting ? 'Submitting...' : 'Submit Pre-order'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ★★★ Payment Dialog – Log Supplier Payment ★★★ */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCreditCard} /> Log Payment for Pre-order
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePaymentLogSubmit} className="mt-4 grid gap-4">
            <div className="p-3 border rounded-md bg-gray-50 text-sm">
              <h4 className="font-semibold mb-2">Supplier Bank Details</h4>
              <p><strong>Bank:</strong> {paymentData.preorder?.supplier?.bankName || 'N/A'}</p>
              <p><strong>Account Name:</strong> {paymentData.preorder?.supplier?.accountName || 'N/A'}</p>
              <p><strong>Account No:</strong> {paymentData.preorder?.supplier?.accountNumber || 'N/A'}</p>
            </div>

            <div>
              <Label htmlFor="paymentAmount">Amount Paid (LKR)</Label>
              <Input
                id="paymentAmount"
                type="number"
                min="0"
                value={paymentData.amount}
                onChange={(e) => setPaymentData((p) => ({ ...p, amount: e.target.value }))}
                placeholder="e.g., 25000"
                required
                className="mt-1"
              />
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setPaymentModalOpen(false)}>
                Skip for now
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Logging...' : 'Log Payment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;