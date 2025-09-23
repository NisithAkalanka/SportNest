import React, { useEffect, useState } from 'react';
import api from '@/api';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// ★★★ CSV Download Icon එක අලුතින් import කරගන්නවා ★★★
import { faPlus, faTrash, faEdit, faFileCsv } from '@fortawesome/free-solid-svg-icons';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const ManageSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ _id: null, name: '', contactPerson: '', email: '', phone: '', address: '' });
  const [errors, setErrors] = useState({});
  const [selectedPreorders, setSelectedPreorders] = useState(null);
  
  // ★★★ Report එක generate වන වෙලාවට state එකක් ★★★
  const [isReportDownloading, setIsReportDownloading] = useState(false);

  const resetForm = () => {
    setFormData({ _id: null, name: '', contactPerson: '', email: '', phone: '', address: '' });
    setErrors({});
  };

  const fetchData = async () => {
    try {
     
      setIsLoading(true);
      const res = await api.get('/suppliers');
      setSuppliers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch suppliers', err);
      alert('Failed to load suppliers');
    } finally {
      // Data fetching مکمل ہونے پر setIsLoading کو false کریں گے
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const onStorage = (e) => { if (e.key === 'preorderUpdated') fetchData(); };
    const onFocus = () => { if (localStorage.getItem('preorderUpdated')) fetchData(); };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    return () => { window.removeEventListener('storage', onStorage); window.removeEventListener('focus', onFocus); };
  }, []);
  
  const validateField = (name, value, allSuppliers) => {
    let errorMsg = '';
    const hasSpecialChars = (s) => /[^a-zA-Z\s]/.test(s);
    const isValidPhone = (s) => /^\d{10}$/.test(s.replace(/[\s()-+]/g, ''));
    const hasAddressSpecialChars = (s) => /[@$%&*!]/.test(s);
    
    switch (name) {
      case 'name':
        if (!value.trim()) errorMsg = 'Supplier Name is required.';
        else if (/\d/.test(value)) errorMsg = 'Name cannot contain numbers.';
        else if (hasSpecialChars(value)) errorMsg = 'Name cannot contain special characters.';
        else if (allSuppliers.some(s => s.name.toLowerCase() === value.trim().toLowerCase() && s._id !== formData._id)) {
            errorMsg = 'This supplier name already exists.';
        }
        break;
      case 'contactPerson':
        if (value && hasSpecialChars(value)) errorMsg = 'Contact Person name cannot contain special characters.';
        break;
      case 'email':
        if (!value.trim()) errorMsg = 'Email is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errorMsg = 'Please enter a valid email format.';
        else if (allSuppliers.some(s => s.email.toLowerCase() === value.trim().toLowerCase() && s._id !== formData._id)) {
            errorMsg = 'This email is already registered.';
        }
        break;
      case 'phone':
        if (!value.trim()) errorMsg = 'Phone number is required.';
        else if (!isValidPhone(value)) errorMsg = 'Phone number must be exactly 10 digits.';
        break;
      case 'address':
        if (value && hasAddressSpecialChars(value)) errorMsg = 'Address cannot contain special characters like @$%&*!';
        break;
      default:
        break;
    }
    setErrors(prevErrors => ({ ...prevErrors, [name]: errorMsg }));
    return errorMsg === '';
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    validateField(name, value, suppliers);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isNameValid = validateField('name', formData.name, suppliers);
    const isContactPersonValid = validateField('contactPerson', formData.contactPerson, suppliers);
    const isEmailValid = validateField('email', formData.email, suppliers);
    const isPhoneValid = validateField('phone', formData.phone, suppliers);
    const isAddressValid = validateField('address', formData.address, suppliers);
    
    if (!isNameValid || !isContactPersonValid || !isEmailValid || !isPhoneValid || !isAddressValid) {
        alert('Please fix the errors before submitting.');
        return;
    }

    const payload = {
      name: formData.name.trim(),
      contactPerson: formData.contactPerson.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
    };
    
    try {
      if (formData._id) {
        await api.put(`/suppliers/${formData._id}`, payload);
        alert('Supplier updated successfully!');
      } else {
        await api.post('/suppliers', payload);
        alert('Supplier added successfully!');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Failed to save supplier:", error);
      const errorMessage = error.response?.data?.msg || 'An unknown error occurred.';
      alert(`Failed to save supplier: ${errorMessage}`);
    }
  };
  
  const handleEdit = (supplier) => {
    setErrors({});
    const { preorders, ...supplierData } = supplier; // preorders අයින් කරලා data ටික set කරනවා
    setFormData({
      _id: supplierData._id || null,
      name: supplierData.name || '',
      contactPerson: supplierData.contactPerson || '',
      email: supplierData.email || '',
      phone: supplierData.phone || '',
      address: supplierData.address || ''
    });
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (supplierId) => {
    try {
      await api.delete(`/suppliers/${supplierId}`);
      alert('Supplier deleted successfully!');
      fetchData();
    } catch (error) {
      console.error("Failed to delete supplier:", error);
    }
  };

  // ★★★ CSV Report එක Download කරන අලුත් Function එක ★★★
  const handleDownloadCsvReport = async () => {
    setIsReportDownloading(true);
    alert("Generating supplier CSV report. The download will start automatically.");
    try {
      const response = await api.get('/suppliers/report/csv', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `suppliers-report-${date}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV Report download failed', err);
      alert(err.response?.data?.msg || 'Could not generate the report.');
    } finally {
      setIsReportDownloading(false);
    }
  };

  if (isLoading) return <div className="p-4">Loading suppliers...</div>;

  return (
    <div className="text-gray-900 bg-gray-50 min-h-screen p-6">
      {/* ★★★ Header එකට අලුත් Button එක එකතු කිරීම ★★★ */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Suppliers</h1>
        <div className="flex items-center gap-2">
           <Button onClick={handleDownloadCsvReport} disabled={isReportDownloading} variant="outline" className="bg-white">
              <FontAwesomeIcon icon={faFileCsv} className={isReportDownloading ? "animate-pulse mr-2" : "mr-2"} />
              {isReportDownloading ? "Generating..." : "Download Report"}
           </Button>
           <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsDialogOpen(open); }}>
             <DialogTrigger asChild>
               <Button className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 flex items-center">
                 <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add New Supplier
               </Button>
             </DialogTrigger>
             <DialogContent className="bg-white text-gray-900 sm:max-w-[520px] rounded-lg shadow p-5 border">
               <DialogHeader>
                 <DialogTitle className="text-lg font-semibold">{formData._id ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
               </DialogHeader>
               <form onSubmit={handleSubmit}>
                 <div className="grid gap-3 py-4">
                   <div>
                     <Label htmlFor="name" className="text-gray-700">Name</Label>
                     <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Supplier name" className={errors.name ? 'border-red-500' : ''}/>
                     {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                   </div>
                   <div>
                     <Label htmlFor="contactPerson" className="text-gray-700">Contact Person</Label>
                     <Input id="contactPerson" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} placeholder="Optional" className={errors.contactPerson ? 'border-red-500' : ''}/>
                     {errors.contactPerson && <p className="text-red-600 text-xs mt-1">{errors.contactPerson}</p>}
                   </div>
                   <div>
                     <Label htmlFor="email" className="text-gray-700">Email</Label>
                     <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder="supplier@example.com" className={errors.email ? 'border-red-500' : ''}/>
                     {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                   </div>
                   <div>
                     <Label htmlFor="phone" className="text-gray-700">Phone</Label>
                     <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="07XXXXXXXX" className={errors.phone ? 'border-red-500' : ''}/>
                     {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
                   </div>
                   <div>
                     <Label htmlFor="address" className="text-gray-700">Address</Label>
                     <Input id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Optional address" className={errors.address ? 'border-red-500' : ''}/>
                     {errors.address && <p className="text-red-600 text-xs mt-1">{errors.address}</p>}
                   </div>
                 </div>
                 <DialogFooter>
                   <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancel</Button>
                   <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">Save</Button>
                 </DialogFooter>
               </form>
             </DialogContent>
           </Dialog>
        </div>
      </div>
      <Card className="bg-white text-gray-900 rounded-lg shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-gray-700">Name</TableHead>
              <TableHead className="text-gray-700">Contact</TableHead>
              <TableHead className="text-gray-700">Email</TableHead>
              <TableHead className="text-gray-700">Phone</TableHead>
              {/* Pre-order column එක Table Header එකෙන් ඉවත් කරනවා. ඒක පේළි වල විතරක් පෙන්වමු */}
              <TableHead className="text-right text-gray-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((sup) => (
              <TableRow key={sup._id} className="hover:bg-gray-50">
                <TableCell className="py-3 font-medium">{sup.name}</TableCell>
                <TableCell className="py-3">{sup.contactPerson || 'N/A'}</TableCell>
                <TableCell className="py-3">{sup.email}</TableCell>
                <TableCell className="py-3">{sup.phone}</TableCell>
                <TableCell className="text-right py-3">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(sup)} className="mr-2"><FontAwesomeIcon icon={faEdit} /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-600"><FontAwesomeIcon icon={faTrash} /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the supplier.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(sup._id)} className="bg-red-600 text-white">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
            {suppliers.length === 0 && <TableRow><TableCell colSpan={5} className="text-center h-24">No suppliers found.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      {selectedPreorders && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded w-full max-w-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Pre-orders</h3>
              <button onClick={() => setSelectedPreorders(null)}>Close</button>
            </div>
            <div className="space-y-2 max-h-64 overflow-auto">
              {selectedPreorders.map(p => (
                <div key={p._id} className="border p-2 rounded">
                  <div><strong>Item:</strong> {p.item?.name || p.item}</div>
                  <div><strong>Qty:</strong> {p.quantity}</div>
                  <div><strong>Status:</strong> {p.status}</div>
                  <div className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSuppliers;