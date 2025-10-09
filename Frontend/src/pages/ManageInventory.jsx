import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faEdit, faFilePdf, faSearch, faBoxOpen, faExclamationTriangle, faMoneyBillWave, faWarehouse } from '@fortawesome/free-solid-svg-icons';

const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use((config) => {
  const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
  if (adminInfo && adminInfo.token) config.headers['Authorization'] = `Bearer ${adminInfo.token}`;
  return config;
});

const CATEGORIES = ['Sports Items', 'Supplements'];

const ManageInventory = () => {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    _id: null, name: '', category: '', quantity: '', supplier: '',
    price: '', reorderPoint: '', description: '', expiryDate: '', imageUrl: ''
  });
  const [isReportGenerating, setIsReportGenerating] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});

  // Toolbar UI state
  const [q, setQ] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc'); // name-asc | qty-asc | qty-desc | price-asc | price-desc
  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  // ★★★ Direct Stock Management states ★★★
  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [stockFormData, setStockFormData] = useState({
    itemId: '',
    actionType: 'add',
    quantity: '',
    cost: '',
    reason: 'Expired'
  });
  const [stockErrors, setStockErrors] = useState({});
  const [isStockSubmitting, setIsStockSubmitting] = useState(false);

  const today = new Date();
  const twoYearsFromNow = new Date();
  twoYearsFromNow.setFullYear(today.getFullYear() + 2);
  const minDate = today.toISOString().split('T')[0];
  const maxDate = twoYearsFromNow.toISOString().split('T')[0];

  const resetForm = () => {
    setFormData({ _id: null, name: '', category: '', quantity: '', supplier: '', price: '', reorderPoint: '', description: '', expiryDate: '', imageUrl: '' });
    setImageFile(null);
    setImagePreview('');
    setErrors({});
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [itemsRes, suppliersRes] = await Promise.all([api.get('/items'), api.get('/suppliers')]);
      setItems(itemsRes.data);
      setSuppliers(suppliersRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
      alert('Failed to load data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const validateField = (name, value) => {
    let errorMsg = '';
    switch (name) {
      case 'name':
        if (!value.trim()) errorMsg = 'Item Name is required.';
        else if (value.length < 3) errorMsg = 'Name must be at least 3 characters.';
        else if (value.length > 50) errorMsg = 'Name cannot exceed 50 characters.';
        else if (/\d/.test(value)) errorMsg = 'Name cannot contain numbers.';
        else if (/[@#$%^&*!]/.test(value)) errorMsg = 'Name cannot contain special characters like @#$%^&*!.';
        break;
      case 'description':
        if (value && value.length > 120) errorMsg = 'Description must be 120 characters or fewer (max 120).';
        break;
      case 'quantity':
        if (value === '' || value === null) errorMsg = 'Quantity is required.';
        else if (isNaN(value) || !Number.isInteger(Number(value))) errorMsg = 'Must be a whole number.';
        else if (Number(value) < 0 || Number(value) > 100) errorMsg = 'Quantity must be between 0 and 100.';
        break;
      case 'price':
        if (value === '' || value === null) errorMsg = 'Price is required.';
        else if (isNaN(value) || Number(value) < 0) errorMsg = 'Price must be a non-negative number.';
        else if (Number(value) > 100000) errorMsg = 'Price cannot exceed 100000.';
        break;
      case 'reorderPoint':
        if (value === '' || value === null) errorMsg = 'Reorder Point is required.';
        else if (isNaN(value) || !Number.isInteger(Number(value))) errorMsg = 'Must be a whole number.';
        else if (Number(value) < 0) errorMsg = 'Must be a non-negative number.';
        break;
      case 'expiryDate':
        if (formData.category === 'Supplements' && !value) {
          errorMsg = 'Expiry date is required for supplements.';
        }
        break;
      case 'image':
        if (imageFile) {
          const validTypes = ['image/jpeg', 'image/png'];
          if (!validTypes.includes(imageFile.type)) {
            errorMsg = 'Only JPG or PNG files are allowed.';
          } else if (imageFile.size > 2 * 1024 * 1024) {
            errorMsg = 'Image size must be less than 2MB.';
          }
        }
        break;
      default: break;
    }
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
    return errorMsg === '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'category' && value !== 'Supplements') {
      setFormData(prev => ({ ...prev, expiryDate: '' }));
      setErrors(prev => ({ ...prev, expiryDate: '' }));
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      validateField('image', file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let isFormValid = true;
    const fieldsToValidate = ['name', 'category', 'quantity', 'price', 'reorderPoint', 'supplier'];
    if (formData.category === 'Supplements') fieldsToValidate.push('expiryDate');

    fieldsToValidate.forEach(field => {
      if (!formData[field]) {
        setErrors(prev => ({ ...prev, [field]: `This field is required.` }));
        isFormValid = false;
      } else {
        if (!validateField(field, formData[field])) {
          isFormValid = false;
        }
      }
    });

    // Optional description length guard
    if (formData.description && !validateField('description', formData.description)) {
      isFormValid = false;
    }

    if (!formData._id && !imageFile) {
      setErrors(prev => ({ ...prev, image: 'An image is required for new items.' }));
      isFormValid = false;
    } else {
      if (!validateField('image', imageFile)) isFormValid = false;
    }

    if (!isFormValid) {
      alert("Please fix the validation errors before submitting.");
      return;
    }

    const dataToSubmit = new FormData();
    Object.keys(formData).forEach(key => { if (formData[key] !== null) dataToSubmit.append(key, formData[key]); });
    if (imageFile) dataToSubmit.append('image', imageFile);

    try {
      if (formData._id) await api.put(`/items/${formData._id}`, dataToSubmit, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await api.post('/items', dataToSubmit, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert(formData._id ? 'Item updated successfully!' : 'Item added successfully!');
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error("Save item error:", err);
      alert(`Failed to save item: ${err.response?.data?.msg || 'An error occurred.'}`);
    }
  };

  const handleEdit = (item) => {
    resetForm();
    setFormData({ ...item, supplier: item.supplier?._id || '', expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '' });
    if (item.imageUrl) setImagePreview(item.imageUrl);
    setIsDialogOpen(true);
  };

  const handleDelete = async (itemId) => {
    try {
      await api.delete(`/items/${itemId}`);
      alert('Item deleted successfully!');
      fetchData();
    } catch (err) {
      console.error("Delete error:", err);
      alert('Failed to delete item.');
    }
  };

  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  // ★★★ Direct Stock Management handlers ★★★
  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  const resetStockForm = () => {
    setStockFormData({ itemId: '', actionType: 'add', quantity: '', cost: '', reason: 'Expired' });
    setStockErrors({});
  };

  const handleStockFormChange = (e) => {
    const { name, value } = e.target;
    setStockFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    let errors = {};
    if (!stockFormData.itemId) errors.itemId = "Please select an item.";
    if (!stockFormData.quantity || Number(stockFormData.quantity) <= 0) errors.quantity = "Quantity must be a positive number.";
    if (stockFormData.actionType === 'add' && stockFormData.cost && Number(stockFormData.cost) < 0) {
      errors.cost = "Cost cannot be negative.";
    }

    if (Object.keys(errors).length > 0) {
      setStockErrors(errors);
      return;
    }

    setIsStockSubmitting(true);
    setStockErrors({});
    try {
      await api.post('/items/managestock', stockFormData);
      alert('Stock has been successfully updated!');
      setIsStockDialogOpen(false);
      resetStockForm();
      fetchData(); // Refresh the main table
    } catch (err) {
      alert(`Error: ${err.response?.data?.msg || 'Could not update stock.'}`);
    } finally {
      setIsStockSubmitting(false);
    }
  };

  const handleDownloadPdfReport = async () => {
    setIsReportGenerating(true);
    alert("Generating your PDF report. This may take a moment...");
    try {
      const response = await api.get('/items/report/pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `inventory-report-${date}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF Report download failed', err);
      alert(err.response?.data?.msg || 'Could not generate report.');
    } finally {
      setIsReportGenerating(false);
    }
  };

  // Derived stats
  const totalItemsCount = items.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
  const lowStockCount = items.filter(it => Number(it.quantity) < (Number(it.reorderPoint) || 0)).length;
  const totalInventoryValue = items.reduce((s, it) => s + ((Number(it.price) || 0) * (Number(it.quantity) || 0)), 0);

  // Filter + Sort
  const filtered = items.filter(it => {
    const matchCat = catFilter === 'All' || it.category === catFilter;
    const needle = q.trim().toLowerCase();
    const matchText = !needle
      ? true
      : (it.name || '').toLowerCase().includes(needle) ||
        (it.supplier?.name || '').toLowerCase().includes(needle);
    return matchCat && matchText;
  });

  const sorted = [...filtered].sort((a, b) => {
    const pa = Number(a.price) || 0;
    const pb = Number(b.price) || 0;
    const qa = Number(a.quantity) || 0;
    const qb = Number(b.quantity) || 0;
    switch (sortBy) {
      case 'price-asc': return pa - pb;
      case 'price-desc': return pb - pa;
      case 'qty-asc': return qa - qb;
      case 'qty-desc': return qb - qa;
      default:
      case 'name-asc': return (a.name || '').localeCompare(b.name || '');
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] grid place-content-center">
        <FontAwesomeIcon icon={faBoxOpen} className="h-10 w-10 text-emerald-600 animate-bounce" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header band */}
      <div className="rounded-2xl p-6 bg-[#0D1B2A] text-white border border-white/10 mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Inventory Management</h1>
        <p className="text-white/80 mt-1">Track stock, suppliers and values in one place.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <FontAwesomeIcon icon={faBoxOpen} className="text-emerald-600" /> Total Units
          </div>
          <div className="text-2xl font-semibold">{totalItemsCount}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-600" /> Low Stock Items
          </div>
          <div className="text-2xl font-semibold text-amber-600">{lowStockCount}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <FontAwesomeIcon icon={faMoneyBillWave} className="text-emerald-600" /> Total Inventory Value
          </div>
          <div className="text-2xl font-semibold">Rs. {totalInventoryValue.toFixed(2)}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between mb-6">
        {/* Search */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-2 pl-3 focus-within:ring-2 focus-within:ring-emerald-500 flex items-center">
          <FontAwesomeIcon icon={faSearch} className="text-slate-500 mr-2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by item or supplier…"
            className="flex-1 outline-none text-sm bg-transparent"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ('')}
              className="px-2 text-slate-500 hover:text-slate-700"
              aria-label="Clear"
              title="Clear"
            >
              ×
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="min-w-[180px]">
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="rounded-2xl border-slate-200">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          title="Sort items"
        >
          <option value="name-asc">Name: A–Z</option>
          <option value="qty-desc">Qty: High → Low</option>
          <option value="qty-asc">Qty: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="price-asc">Price: Low → High</option>
        </select>

        <div className="flex items-center gap-2">
          <Button onClick={handleDownloadPdfReport} disabled={isReportGenerating} variant="outline" className="bg-white">
            <FontAwesomeIcon icon={faFilePdf} className="mr-2 text-red-600"/>
            {isReportGenerating ? "Generating..." : "Download Report"}
          </Button>
          {/* ★★★ Manage Stock button + dialog ★★★ */}
          <Dialog open={isStockDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetStockForm(); setIsStockDialogOpen(isOpen); }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-white">
                <FontAwesomeIcon icon={faWarehouse} className="mr-2 text-blue-600"/>
                Manage Stock
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white text-gray-900 sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">Direct Stock Management</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleStockSubmit} className="pt-4">
                <div className="grid gap-4">
                  <div>
                    <Label>Select Item</Label>
                    <Select name="itemId" onValueChange={(v) => setStockFormData(p => ({...p, itemId: v}))} value={stockFormData.itemId}>
                      <SelectTrigger className={`${stockErrors.itemId ? 'border-red-500' : ''} focus:ring-emerald-500 focus:ring-1`}>
                        <SelectValue placeholder="Choose an item..." />
                      </SelectTrigger>
                      <SelectContent>
                        {items.map(it => <SelectItem key={it._id} value={it._id}>{it.name} ({it.quantity} in stock)</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {stockErrors.itemId && <p className="text-red-600 text-xs mt-1">{stockErrors.itemId}</p>}
                  </div>

                  <div>
                    <Label>Action</Label>
                    <RadioGroup defaultValue="add" value={stockFormData.actionType} onValueChange={(v) => setStockFormData(p => ({...p, actionType: v}))} className="flex gap-4 pt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="add" id="r-add" />
                        <Label htmlFor="r-add">Add New Stock</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="remove" id="r-remove" />
                        <Label htmlFor="r-remove">Remove Stock</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="s-quantity">Quantity to Change</Label>
                      <Input id="s-quantity" name="quantity" type="number" min="1" value={stockFormData.quantity} onChange={handleStockFormChange} className={`${stockErrors.quantity ? 'border-red-500' : ''}`}/>
                      {stockErrors.quantity && <p className="text-red-600 text-xs mt-1">{stockErrors.quantity}</p>}
                    </div>
                    {stockFormData.actionType === 'add' && (
                      <div>
                        <Label htmlFor="s-cost">Total Cost (LKR)</Label>
                        <Input id="s-cost" name="cost" type="number" min="0" placeholder="Optional for expenses" value={stockFormData.cost} onChange={handleStockFormChange} className={`${stockErrors.cost ? 'border-red-500' : ''}`}/>
                        {stockErrors.cost && <p className="text-red-600 text-xs mt-1">{stockErrors.cost}</p>}
                      </div>
                    )}
                  </div>

                  {stockFormData.actionType === 'remove' && (
                    <div>
                      <Label>Reason for Removal</Label>
                      <Select name="reason" onValueChange={(v) => setStockFormData(p => ({...p, reason: v}))} value={stockFormData.reason}>
                        <SelectTrigger className="focus:ring-emerald-500 focus:ring-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Expired">Expired Stock</SelectItem>
                          <SelectItem value="Damaged">Damaged Stock</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsStockDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isStockSubmitting}>
                    {isStockSubmitting ? 'Submitting...' : 'Confirm Update'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsDialogOpen(isOpen); }}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
                <FontAwesomeIcon icon={faPlus} className="mr-2" />Add New Item
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white text-gray-900 sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">{formData._id ? "Edit Item" : "Add New Item"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="pt-4">
                <div className="grid gap-3 max-h-[70vh] overflow-y-auto pr-1">
                  <div>
                    <Label htmlFor="name">Item Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className={`${errors.name ? 'border-red-500' : ''} focus-visible:ring-emerald-500`}/>
                    {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Provide a brief description for the shop page..."
                      className="h-24 focus-visible:ring-emerald-500"
                      maxLength={120}
                    />
                    {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4 items-end">
                    <div>
                      <Label htmlFor="image-upload">Item Image</Label>
                      <Input id="image-upload" name="image" type="file" accept="image/png, image/jpeg" onChange={handleImageChange} className={`text-xs ${errors.image ? 'border-red-500 ring-1 ring-red-500 rounded-md' : ''}`}/>
                      {errors.image && <p className="text-red-600 text-xs mt-1">{errors.image}</p>}
                    </div>
                    <div className="group">
                      <img src={imagePreview || 'https://via.placeholder.com/150.png?text=Preview'} alt="Preview" className="w-20 h-20 object-cover rounded-md border-2 group-hover:scale-105 transition"/>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Category</Label>
                      <Select name="category" onValueChange={(v)=>handleSelectChange('category', v)} value={formData.category}>
                        <SelectTrigger className={`${errors.category?'border-red-500':''} focus:ring-emerald-500 focus:ring-1`}>
                          <SelectValue placeholder="Select..."/>
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {errors.category&&<p className="text-red-600 text-xs mt-1">{errors.category}</p>}
                    </div>
                    <div>
                      <Label>Supplier</Label>
                      <Select name="supplier" onValueChange={(v)=>handleSelectChange('supplier', v)} value={formData.supplier}>
                        <SelectTrigger className={`${errors.supplier?'border-red-500':''} focus:ring-emerald-500 focus:ring-1`}>
                          <SelectValue placeholder="Select..."/>
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map(s=><SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {errors.supplier&&<p className="text-red-600 text-xs mt-1">{errors.supplier}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Price (LKR)</Label>
                      <Input
                        name="price"
                        type="text"
                        inputMode="decimal"
                        value={formData.price}
                        onChange={handleInputChange}
                        className={`${errors.price ? 'border-red-500' : ''} focus-visible:ring-emerald-500`}
                        onKeyDown={e => {
                          const allowed = ['Backspace','Tab','ArrowLeft','ArrowRight','Delete','Enter'];
                          if (allowed.includes(e.key) || (e.key === '.' && !e.target.value.includes('.')) || (e.key >= '0' && e.key <= '9')) {} else { e.preventDefault(); }
                        }}
                        onPaste={e => { const pasted = e.clipboardData.getData('text'); if (!/^\d*\.?\d*$/.test(pasted)) e.preventDefault(); }}
                      />
                      {errors.price && <p className="text-red-600 text-xs mt-1">{errors.price}</p>}
                    </div>
                    <div>
                      <Label>Quantity (0-100)</Label>
                      <Input
                        name="quantity"
                        type="text"
                        inputMode="numeric"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        className={`${errors.quantity ? 'border-red-500' : ''} focus-visible:ring-emerald-500`}
                        onKeyDown={e => {
                          const allowed = ['Backspace','Tab','ArrowLeft','ArrowRight','Delete','Enter'];
                          if (allowed.includes(e.key) || (e.key >= '0' && e.key <= '9')) {} else { e.preventDefault(); }
                        }}
                        onPaste={e => { const pasted = e.clipboardData.getData('text'); if (!/^\d*$/.test(pasted)) e.preventDefault(); }}
                      />
                      {errors.quantity && <p className="text-red-600 text-xs mt-1">{errors.quantity}</p>}
                    </div>
                  </div>

                  <div>
                    <Label>Reorder Point</Label>
                    <Input
                      name="reorderPoint"
                      type="text"
                      inputMode="numeric"
                      value={formData.reorderPoint}
                      onChange={handleInputChange}
                      className={`${errors.reorderPoint ? 'border-red-500' : ''} focus-visible:ring-emerald-500`}
                      onKeyDown={e => {
                        const allowed = ['Backspace','Tab','ArrowLeft','ArrowRight','Delete','Enter'];
                        if (allowed.includes(e.key) || (e.key >= '0' && e.key <= '9')) {} else { e.preventDefault(); }
                      }}
                      onPaste={e => { const pasted = e.clipboardData.getData('text'); if (!/^\d*$/.test(pasted)) e.preventDefault(); }}
                    />
                    {errors.reorderPoint && <p className="text-red-600 text-xs mt-1">{errors.reorderPoint}</p>}
                  </div>

                  {formData.category === 'Supplements' && (
                    <div>
                      <Label>Expiry Date</Label>
                      <Input name="expiryDate" type="date" value={formData.expiryDate} onChange={handleInputChange} min={minDate} max={maxDate} className={`${errors.expiryDate?'border-red-500':''} focus-visible:ring-emerald-500`}/>
                      {errors.expiryDate&&<p className="text-red-600 text-xs mt-1">{errors.expiryDate}</p>}
                    </div>
                  )}
                </div>

                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">{formData._id ? 'Update Item' : 'Save Item'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[70px]">Image</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map(item => {
              const qty = Number(item.quantity) || 0;
              const rp = Number(item.reorderPoint) || 0;
              const low = qty < rp;
              return (
                <TableRow key={item._id} className="group">
                  <TableCell>
                    <img src={item.imageUrl||'https://via.placeholder.com/100.png?text=N/A'} alt={item.name} className="w-12 h-12 object-cover rounded-md border"/>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="font-medium max-w-[260px] truncate">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-slate-500 max-w-[320px] truncate" title={item.description}>{item.description}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs">
                      {item.category}
                    </span>
                  </TableCell>
                  <TableCell className={low ? 'text-amber-600 font-semibold' : ''}>
                    {qty}
                    {low && <span className="ml-2 inline-flex items-center text-[10px] rounded-full bg-amber-100 text-amber-700 px-2 py-0.5">Low</span>}
                  </TableCell>
                  <TableCell>Rs. {(Number(item.price)||0).toFixed(2)}</TableCell>
                  <TableCell>{item.supplier?.name||'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={()=>handleEdit(item)} className="hover:bg-emerald-50 hover:text-emerald-700">
                      <FontAwesomeIcon icon={faEdit}/>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50">
                          <FontAwesomeIcon icon={faTrash}/>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white text-gray-900">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>This action is permanent.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={()=>handleDelete(item._id)} className="bg-red-600">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              );
            })}
            {sorted.length === 0 && !isLoading && (
              <TableRow><TableCell colSpan={7} className="text-center h-24">No items found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
export default ManageInventory;