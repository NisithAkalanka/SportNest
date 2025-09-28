import React, { useEffect, useState } from 'react';
import api from '@/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// ★★★ සියලුම Icons නිවැරදිව import කර ඇත ★★★
import { faSync, faFileDownload as faFileCsv, faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


const StatusBadge = ({ status }) => {
  if (status === 'received') {
    return <Badge className="capitalize bg-green-100 text-green-800 hover:bg-green-100">Received</Badge>;
  }
  if (status === 'ordered') {
    return <Badge variant='outline' className="capitalize border-blue-500 text-blue-600 bg-blue-50">Ordered</Badge>;
  }
  return <Badge variant='secondary' className="capitalize bg-gray-100 text-gray-700">Requested</Badge>;
};

const Preorders = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportDownloading, setReportDownloading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPreorder, setCurrentPreorder] = useState(null);
  const [expiryDate, setExpiryDate] = useState('');
  const [needsExpiry, setNeedsExpiry] = useState(false);

  // Edit Modal සඳහා states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ id: null, quantity: '', itemName: '' });
  
  const today = new Date();
  const twoYearsFromNow = new Date();
  twoYearsFromNow.setFullYear(today.getFullYear() + 2);
  const minDate = today.toISOString().split('T')[0];
  const maxDate = twoYearsFromNow.toISOString().split('T')[0];

  const itemRequiresExpiry = (item) => {
    const explicit = item?.requiresExpiry === true;
    const cat = (item?.category || item?.type || item?.categoryName || '').toString().toLowerCase();
    const byName = (item?.name || '').toString().toLowerCase();
    return explicit || /supplement|nutrition|consumable|food/.test(cat) || /supplement|nutrition/.test(byName);
  };

  const showToast = (message, type = 'success') => {
    let style = 'bg-green-600';
    if (type === 'error') style = 'bg-red-600';
    if (type === 'info') style = 'bg-blue-600';
    setToast({ msg: message, type, style });
    setTimeout(() => setToast(null), 4000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/preorders');
      setList(res.data.preorders || []);
    } catch (err) {
      console.error('Load preorders failed', err);
      showToast('Failed to load pre-orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    // 'ordered' සඳහා පමණක් confirm box එකක්
    if (!window.confirm(`Are you sure you want to mark this order as "${status}"?`)) return;
    try {
      await api.put(`/preorders/${id}/status`, { status });
      showToast('Status updated successfully!');
      load();
    } catch (err) {
      console.error('Update failed', err);
      showToast('Status update failed.', 'error');
    }
  };

  const handleOpenReceiveModal = (preorder) => {
    setCurrentPreorder(preorder);
    setExpiryDate('');
    setNeedsExpiry(itemRequiresExpiry(preorder?.item));
    setIsModalOpen(true);
  };

  const handleConfirmReceive = async () => {
    if (!currentPreorder) return;

    const payload = { status: 'received' };
    if (needsExpiry) {
      if (!expiryDate) {
        return showToast('Please select a valid expiry date.', 'error');
      }
      payload.expiryDate = expiryDate;
    }

    try {
      await api.put(`/preorders/${currentPreorder._id}/status`, payload);
      showToast('Order received and inventory updated!');
      setIsModalOpen(false);
      load();
    } catch (err) {
      console.error('Update failed', err);
      showToast(err.response?.data?.msg || 'Status update failed.', 'error');
    }
  };
  
  const handleDownloadReport = async () => {
    setReportDownloading(true);
    showToast('Generating your monthly report...', 'info');
    try {
      const response = await api.get('/preorders/report/monthly', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();
      link.setAttribute('download', `preorder-report-${year}-${String(month).padStart(2, '0')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Report download failed', err);
      showToast(err.response?.data?.msg || 'Could not download the report.', 'error');
    } finally {
      setReportDownloading(false);
    }
  };
  
  const handleOpenEditModal = (preorder) => {
    setEditFormData({ id: preorder._id, quantity: preorder.quantity, itemName: preorder.item?.name || 'Item' });
    setIsEditModalOpen(true);
  };

  const handleUpdateQuantity = async () => {
    const { id, quantity } = editFormData;
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
      return showToast('Please enter a valid, positive quantity.', 'error');
    }
    try {
      await api.put(`/preorders/${id}`, { quantity });
      showToast('Pre-order quantity updated successfully!');
      setIsEditModalOpen(false);
      load();
    } catch (err) {
      showToast(err.response?.data?.msg || 'Failed to update quantity.', 'error');
    }
  };

  const handleDeletePreorder = async (id) => {
    try {
        await api.delete(`/preorders/${id}`);
        showToast('Pre-order successfully deleted!');
        load();
    } catch (err) {
        showToast(err.response?.data?.msg || 'Could not delete the pre-order.', 'error');
    }
  };

  return (
    <div className="p-6 md:p-10 min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900">
      
      {toast && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-md shadow-lg text-white font-semibold ${toast.style}`}>
          {toast.msg}
        </div>
      )}

      <div className="rounded-2xl p-6 bg-[#0D1B2A] text-white border border-white/10 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Pre-orders</h1>
            <p className="text-white/80 mt-1">Manage and track all requested supplier orders.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button onClick={handleDownloadReport} disabled={reportDownloading} variant="outline" className="bg-white text-slate-800 hover:bg-slate-50">
                <FontAwesomeIcon icon={faFileCsv} className={reportDownloading ? 'animate-pulse mr-2' : 'mr-2'} />
                {reportDownloading ? 'Generating...' : 'Monthly Report'}
            </Button>
            <Button onClick={load} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <FontAwesomeIcon icon={faSync} className={loading ? 'animate-spin mr-2' : 'mr-2'} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
        </div>
      </div>
      
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>All Pre-orders</CardTitle>
          <CardDescription>
            Manage pre-orders. 'Requested' items can be edited or deleted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right w-[320px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24">
                      <div className="animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                )
                : list.length === 0 ? ( <TableRow><TableCell colSpan={5} className="text-center h-24">There are no pre-orders to display.</TableCell></TableRow> )
                : (
                  list.map(p => (
                    <TableRow key={p._id} className="hover:bg-slate-50">
                      <TableCell className="font-medium">{p.item?.name || <span className='text-gray-400'>Deleted Item</span>}</TableCell>
                      <TableCell>{p.supplier?.name || <span className='text-gray-400'>N/A</span>}</TableCell>
                      <TableCell>{p.quantity}</TableCell>
                      <TableCell><StatusBadge status={p.status} /></TableCell>
                      <TableCell className="text-right space-x-2">
                        
                        {p.status === 'requested' && (
                            <>
                               <Button size="sm" variant="outline" onClick={() => handleOpenEditModal(p)}>
                                   <FontAwesomeIcon icon={faPencilAlt} className="mr-2" /> Edit
                               </Button>
                               <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                      <Button size="sm" variant="destructive">
                                          <FontAwesomeIcon icon={faTrashAlt} className="mr-2" /> Delete
                                      </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                      <AlertDialogHeader><AlertDialogTitle>Confirm Deletion</AlertDialogTitle></AlertDialogHeader>
                                      <AlertDialogDescription>
                                          Are you sure you want to delete the pre-order for "{p.item?.name || 'this item'}"?
                                      </AlertDialogDescription>
                                      <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDeletePreorder(p._id)} className="bg-red-600 hover:bg-red-700">Confirm</AlertDialogAction>
                                      </AlertDialogFooter>
                                  </AlertDialogContent>
                               </AlertDialog>
                               <Button size="sm" onClick={() => updateStatus(p._id, 'ordered')} className="bg-emerald-600 text-white hover:bg-emerald-700">
                                 Mark as Ordered
                               </Button>
                            </>
                        )}

                        {p.status === 'ordered' && (
                          <Button size="sm" className="bg-green-600 text-white hover:bg-green-700" onClick={() => handleOpenReceiveModal(p)}>
                            Mark as Received
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Receive Stock Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Receive Stock: {currentPreorder?.item?.name}</DialogTitle>
            <DialogDescription>
              {needsExpiry
                ? 'Please enter the expiry date for the new stock.'
                : "No expiry date is required for this item."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {needsExpiry && (
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="expiry-date">Expiry Date</Label>
                <Input
                  type="date"
                  id="expiry-date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  min={minDate}
                  max={maxDate}
                  className="focus-visible:ring-emerald-500"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmReceive} className="bg-emerald-600 hover:bg-emerald-700 text-white">Confirm & Receive</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Quantity Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Quantity for: {editFormData.itemName}</DialogTitle>
            <DialogDescription>Only possible for 'requested' orders.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={editFormData.quantity}
                onChange={(e) => setEditFormData({...editFormData, quantity: e.target.value})}
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateQuantity} className="bg-emerald-600 hover:bg-emerald-700 text-white">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Preorders;