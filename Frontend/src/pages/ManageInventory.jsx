import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
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


const ManageInventory = () => {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    _id: null, name: '', category: '', quantity: '', supplier: '', price: '', batchNumber: '', expiryDate: '',
  });

  const resetForm = () => {
    setFormData({ _id: null, name: '', category: '', quantity: '', supplier: '', price: '', batchNumber: '', expiryDate: '' });
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [itemsRes, suppliersRes] = await Promise.all([
        api.get('/items'),
        api.get('/suppliers'),
      ]);
      setItems(itemsRes.data);
      setSuppliers(suppliersRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
      alert('Failed to load data. You may not have the required permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSelectChange = (value) => setFormData({ ...formData, supplier: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplier) return alert('Please select a supplier.');
    
    try {
      if (formData._id) {
        await api.put(`/items/${formData._id}`, formData);
        alert('Item updated successfully!');
      } else {
        await api.post('/items', formData);
        alert('Item added successfully!');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Failed to save item:", error.response?.data?.msg || error.message);
      alert('Failed to save item. Please check the details.');
    }
  };
  
  const handleEdit = (item) => {
    setFormData({
      _id: item._id, name: item.name, category: item.category, quantity: item.quantity,
      supplier: item.supplier._id, price: item.price || '', batchNumber: item.batchNumber || '',
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
    });
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (itemId) => {
    try {
      await api.delete(`/items/${itemId}`);
      alert('Item deleted successfully!');
      fetchData();
    } catch (error) {
      console.error("Failed to delete item:", error);
      alert('Failed to delete item.');
    }
  };

  if (isLoading) return <div className="text-white p-4">Loading inventory...</div>;

  return (
    <div className="text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsDialogOpen(isOpen); }}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add New Item
            </Button>
          </DialogTrigger>

          <DialogContent className="bg-gray-800 border-gray-700 text-white sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle className="text-xl">{formData._id ? "Edit Item" : "Add New Item"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">

                <div className="col-span-2">
                  <Label htmlFor="name" className="text-gray-400">Item Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required 
                         className="bg-gray-700 border-gray-600 mt-1" />
                </div>
                <div>
                  <Label htmlFor="category" className="text-gray-400">Category</Label>
                  <Input id="category" name="category" value={formData.category} onChange={handleInputChange} required
                         className="bg-gray-700 border-gray-600 mt-1" />
                </div>
                <div>
                  <Label htmlFor="quantity" className="text-gray-400">Quantity</Label>
                  <Input id="quantity" name="quantity" type="number" value={formData.quantity} onChange={handleInputChange} required 
                         className="bg-gray-700 border-gray-600 mt-1" />
                </div>
                <div>
                  <Label htmlFor="price" className="text-gray-400">Price (LKR)</Label>
                  <Input id="price" name="price" type="number" placeholder="0.00" value={formData.price} onChange={handleInputChange} required 
                         className="bg-gray-700 border-gray-600 mt-1" />
                </div>
                <div>
                  <Label htmlFor="batchNumber" className="text-gray-400">Batch Number</Label>
                  <Input id="batchNumber" name="batchNumber" value={formData.batchNumber} onChange={handleInputChange}
                         className="bg-gray-700 border-gray-600 mt-1" />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="expiryDate" className="text-gray-400">Expiry Date</Label>
                  <Input id="expiryDate" name="expiryDate" type="date" value={formData.expiryDate} onChange={handleInputChange}
                         className="bg-gray-700 border-gray-600 mt-1" />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="supplier" className="text-gray-400">Supplier</Label>
                  <Select name="supplier" onValueChange={handleSelectChange} value={formData.supplier} required>
                    <SelectTrigger className="bg-gray-700 border-gray-600 mt-1">
                        <SelectValue placeholder="Select a supplier" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      {suppliers.map(s => (<SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>

              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-gray-700">Cancel</Button>
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-700 hover:bg-gray-800">
              <TableHead className="text-white">Item Name</TableHead>
              <TableHead className="text-white">Category</TableHead>
              <TableHead className="text-white">Price</TableHead>
              <TableHead className="text-white">Quantity</TableHead>
              <TableHead className="text-white">Supplier</TableHead>
              <TableHead className="text-right text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? ( 
              items.map((item) => ( 
                <TableRow key={item._id} className="border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50">
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-gray-400">{item.category}</TableCell>
                  <TableCell className="text-gray-400">{item.price ? `Rs. ${item.price.toFixed(2)}` : 'N/A'}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell className="text-gray-400">{item.supplier ? item.supplier.name : 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><FontAwesomeIcon icon={faEdit}/></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-500"><FontAwesomeIcon icon={faTrash}/></Button></AlertDialogTrigger>
                      <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription className="text-gray-400">This action is permanent.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(item._id)} className="bg-red-600">Delete</AlertDialogAction>
                        </AlertDialogFooter> 
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : ( 
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                  No items in inventory. Add one to get started.
                </TableCell>
              </TableRow>
             )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
export default ManageInventory;