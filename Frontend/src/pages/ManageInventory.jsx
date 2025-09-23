import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faEdit, faFilePdf } from '@fortawesome/free-solid-svg-icons';

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
    price: '', reorderPoint: '', expiryDate: '', imageUrl: ''
  });
  const [isReportGenerating, setIsReportGenerating] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});

  const today = new Date();
  const twoYearsFromNow = new Date();
  twoYearsFromNow.setFullYear(today.getFullYear() + 2);
  const minDate = today.toISOString().split('T')[0];
  const maxDate = twoYearsFromNow.toISOString().split('T')[0];

  const resetForm = () => {
    setFormData({ _id: null, name: '', category: '', quantity: '', supplier: '', price: '', reorderPoint: '', expiryDate: '', imageUrl: '' });
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
        // The problematic line `else if (Number(formData.quantity) ...)` has been removed.
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

  const totalItemsCount = items.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
  const lowStockCount = items.filter(it => Number(it.quantity) < (Number(it.reorderPoint) || 0)).length;
  const totalInventoryValue = items.reduce((s, it) => s + ((Number(it.price) || 0) * (Number(it.quantity) || 0)), 0);

  if (isLoading) return <div className="p-6">Loading inventory...</div>;
 
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border"><div className="text-sm text-gray-500">Total Units</div><div className="text-2xl font-semibold">{totalItemsCount}</div></div>
        <div className="bg-white p-4 rounded-lg shadow-sm border"><div className="text-sm text-gray-500">Low Stock Items</div><div className="text-2xl font-semibold text-amber-600">{lowStockCount}</div></div>
        <div className="bg-white p-4 rounded-lg shadow-sm border"><div className="text-sm text-gray-500">Total Inventory Value</div><div className="text-2xl font-semibold">Rs. {totalInventoryValue.toFixed(2)}</div></div>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <div className="flex items-center gap-2">
           <Button onClick={handleDownloadPdfReport} disabled={isReportGenerating} variant="outline" className="bg-white">
              <FontAwesomeIcon icon={faFilePdf} className="mr-2 text-red-600"/>
              {isReportGenerating ? "Generating..." : "Download Report"}
           </Button>
           <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsDialogOpen(isOpen); }}>
             <DialogTrigger asChild>
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />Add New Item
                </Button>
            </DialogTrigger>
             <DialogContent className="bg-white text-gray-900 sm:max-w-[480px]">
              <DialogHeader><DialogTitle className="text-lg font-bold">{formData._id ? "Edit Item" : "Add New Item"}</DialogTitle></DialogHeader>
               <form onSubmit={handleSubmit} className="pt-4">
                 <div className="grid gap-3">
                   <div>
                     <Label htmlFor="name">Item Name</Label>
                     <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className={errors.name ? 'border-red-500' : ''}/>
                     {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                   </div>
                   <div className="grid grid-cols-2 gap-4 items-end">
                     <div>
                       <Label htmlFor="image-upload">Item Image</Label>
                       <Input id="image-upload" name="image" type="file" accept="image/png, image/jpeg" onChange={handleImageChange} className={`text-xs ${errors.image ? 'border-red-500 ring-1 ring-red-500 rounded-md' : ''}`}/>
                       {errors.image && <p className="text-red-600 text-xs mt-1">{errors.image}</p>}
                     </div>
                     <img src={imagePreview || 'https://via.placeholder.com/150.png?text=Preview'} alt="Preview" className="w-20 h-20 object-cover rounded-md border-2"/>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div><Label>Category</Label><Select name="category" onValueChange={(v)=>handleSelectChange('category', v)} value={formData.category}><SelectTrigger className={errors.category?'border-red-500':''}><SelectValue placeholder="Select..."/></SelectTrigger><SelectContent>{CATEGORIES.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>{errors.category&&<p className="text-red-600 text-xs mt-1">{errors.category}</p>}</div>
                      <div><Label>Supplier</Label><Select name="supplier" onValueChange={(v)=>handleSelectChange('supplier', v)} value={formData.supplier}><SelectTrigger className={errors.supplier?'border-red-500':''}><SelectValue placeholder="Select..."/></SelectTrigger><SelectContent>{suppliers.map(s=><SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent></Select>{errors.supplier&&<p className="text-red-600 text-xs mt-1">{errors.supplier}</p>}</div>
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
                         className={errors.price ? 'border-red-500' : ''}
                         onKeyDown={e => {
                           // Allow: backspace, tab, left, right, delete, enter, dot, numbers
                           const allowed = [
                             'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'
                           ];
                           if (
                             allowed.includes(e.key) ||
                             // Only allow one dot
                             (e.key === '.' && !e.target.value.includes('.')) ||
                             // Allow numbers
                             (e.key >= '0' && e.key <= '9')
                           ) {
                             // allow
                           } else {
                             e.preventDefault();
                           }
                         }}
                         onPaste={e => {
                           const pasted = e.clipboardData.getData('text');
                           if (!/^\d*\.?\d*$/.test(pasted)) {
                             e.preventDefault();
                           }
                         }}
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
                         className={errors.quantity ? 'border-red-500' : ''}
                         onKeyDown={e => {
                           const allowed = [
                             'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'
                           ];
                           if (
                             allowed.includes(e.key) ||
                             (e.key >= '0' && e.key <= '9')
                           ) {
                             // allow
                           } else {
                             e.preventDefault();
                           }
                         }}
                         onPaste={e => {
                           const pasted = e.clipboardData.getData('text');
                           if (!/^\d*$/.test(pasted)) {
                             e.preventDefault();
                           }
                         }}
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
                      className={errors.reorderPoint ? 'border-red-500' : ''}
                      onKeyDown={e => {
                        const allowed = [
                          'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'
                        ];
                        if (
                          allowed.includes(e.key) ||
                          (e.key >= '0' && e.key <= '9')
                        ) {
                          // allow
                        } else {
                          e.preventDefault();
                        }
                      }}
                      onPaste={e => {
                        const pasted = e.clipboardData.getData('text');
                        if (!/^\d*$/.test(pasted)) {
                          e.preventDefault();
                        }
                      }}
                    />
                    {errors.reorderPoint && <p className="text-red-600 text-xs mt-1">{errors.reorderPoint}</p>}
                  </div>
                  {formData.category === 'Supplements' && (<div><Label>Expiry Date</Label><Input name="expiryDate" type="date" value={formData.expiryDate} onChange={handleInputChange} min={minDate} max={maxDate} className={errors.expiryDate?'border-red-500':''}/>{errors.expiryDate&&<p className="text-red-600 text-xs mt-1">{errors.expiryDate}</p>}</div>)}
                 </div>
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">{formData._id ? 'Update Item' : 'Save Item'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
           </Dialog>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Image</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => (
                <TableRow key={item._id}>
                  <TableCell><img src={item.imageUrl||'https://via.placeholder.com/100.png?text=N/A'} alt={item.name} className="w-12 h-12 object-cover rounded-md"/></TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>Rs. {(Number(item.price)||0).toFixed(2)}</TableCell>
                  <TableCell>{item.supplier?.name||'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={()=>handleEdit(item)}><FontAwesomeIcon icon={faEdit}/></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-600"><FontAwesomeIcon icon={faTrash}/></Button></AlertDialogTrigger>
                      <AlertDialogContent className="bg-white text-gray-900">
                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action is permanent.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={()=>handleDelete(item._id)} className="bg-red-600">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
            ))}
            {items.length === 0 && !isLoading && (
              <TableRow><TableCell colSpan={7} className="text-center h-24">No items found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
export default ManageInventory;