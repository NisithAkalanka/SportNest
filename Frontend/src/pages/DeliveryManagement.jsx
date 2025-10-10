import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faPlus, faEdit, faTrash, faDownload, faCalendarAlt, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import api from '@/api';
import jsPDF from 'jspdf';

// Utility functions for datetime handling
const toDatetimeLocal = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  // Format as YYYY-MM-DDTHH:MM for datetime-local input
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const getSuggestedDeliveryDate = () => {
  const now = new Date();
  const currentHour = now.getHours();
  
  // If it's before 7 PM, suggest 3 hours from now
  if (currentHour < 19) {
    const suggested = new Date(now.getTime() + (3 * 60 * 60 * 1000)); // 3 hours from now
    return suggested;
  } else {
    // If it's after 7 PM, suggest tomorrow at 10 AM
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    return tomorrow;
  }
};

const DeliveryManagement = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  
  // Form states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    orderId: '',
    customer: '',
    address: '',
    deliveryDate: '',
    status: 'Pending',
    notes: '',
    driverId: ''
  });

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({});

  const statusOptions = ['Pending', 'Assigned', 'In Transit', 'Delivered', 'Cancelled'];

  const fetchDeliveries = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.get('/deliveries');
      setDeliveries(res.data);
    } catch (err) {
      console.error('Failed to load deliveries', err);
      setError('Failed to load deliveries');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      console.log('Fetching drivers from /deliveries/available-drivers...');
      const res = await api.get('/deliveries/available-drivers');
      console.log('Drivers response:', res.data);
      setDrivers(res.data || []);
      
      if (!res.data || res.data.length === 0) {
        console.log('No drivers found, trying alternative endpoint...');
        
        // Try alternative endpoint - fetch from driver management
        try {
          const altRes = await api.get('/drivers');
          console.log('Alternative drivers response:', altRes.data);
          
          // Handle different response formats
          let driversData = [];
          if (altRes.data && Array.isArray(altRes.data)) {
            // Direct array format
            driversData = altRes.data;
          } else if (altRes.data && altRes.data.drivers && Array.isArray(altRes.data.drivers)) {
            // Object with drivers property
            driversData = altRes.data.drivers;
          }
          
          console.log('Extracted drivers data:', driversData);
          
          if (driversData && driversData.length > 0) {
            // Filter only active drivers
            const activeDrivers = driversData.filter(driver => driver.status === 'Active');
            console.log('Active drivers from alternative endpoint:', activeDrivers);
            setDrivers(activeDrivers);
            
            if (activeDrivers.length === 0) {
              setToast({ 
                type: 'info', 
                msg: 'No active drivers available. You can still create deliveries without assigning a driver.' 
              });
              setTimeout(() => setToast(null), 3000);
            } else {
              setToast({ 
                type: 'success', 
                msg: `Loaded ${activeDrivers.length} active drivers from driver management.` 
              });
              setTimeout(() => setToast(null), 3000);
            }
          } else {
            setToast({ 
              type: 'info', 
              msg: 'No drivers available. You can still create deliveries without assigning a driver.' 
            });
            setTimeout(() => setToast(null), 3000);
          }
        } catch (altErr) {
          console.error('Alternative driver fetch failed:', altErr);
          setToast({ 
            type: 'info', 
            msg: 'No drivers available. You can still create deliveries without assigning a driver.' 
          });
          setTimeout(() => setToast(null), 3000);
        }
      }
    } catch (err) {
      console.error('Failed to load drivers', err);
      
      // Try alternative endpoint as fallback
      try {
        console.log('Trying alternative driver endpoint...');
        const altRes = await api.get('/drivers');
        console.log('Alternative drivers response:', altRes.data);
        
        // Handle different response formats
        let driversData = [];
        if (altRes.data && Array.isArray(altRes.data)) {
          // Direct array format
          driversData = altRes.data;
        } else if (altRes.data && altRes.data.drivers && Array.isArray(altRes.data.drivers)) {
          // Object with drivers property
          driversData = altRes.data.drivers;
        }
        
        console.log('Extracted drivers data from fallback:', driversData);
        
        if (driversData && driversData.length > 0) {
          const activeDrivers = driversData.filter(driver => driver.status === 'Active');
          setDrivers(activeDrivers);
          console.log('Loaded drivers from alternative endpoint:', activeDrivers);
          
          setToast({ 
            type: 'success', 
            msg: `Loaded ${activeDrivers.length} active drivers from driver management.` 
          });
          setTimeout(() => setToast(null), 3000);
        } else {
          setDrivers([]);
        }
      } catch (altErr) {
        console.error('Alternative driver fetch also failed:', altErr);
        setDrivers([]);
      }
      
      setToast({ 
        type: 'warning', 
        msg: 'Could not load drivers. You can still create deliveries without assigning a driver.' 
      });
      setTimeout(() => setToast(null), 5000);
    }
  };

  const fetchAvailableOrders = async () => {
    try {
      const res = await api.get('/deliveries/available-orders');
      setAvailableOrders(res.data);
    } catch (err) {
      console.error('Failed to load available orders', err);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    fetchDrivers();
    fetchAvailableOrders();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validate customer name to only allow letters and spaces
    if (name === 'customer') {
      // Allow only letters, spaces, and common name characters
      const lettersOnlyRegex = /^[a-zA-Z\s.'-]*$/;
      if (!lettersOnlyRegex.test(value)) {
        setValidationErrors(prev => ({
          ...prev,
          customer: 'Customer name can only contain letters, spaces, periods, apostrophes, and hyphens'
        }));
        return; // Don't update if invalid characters are entered
      } else {
        // Clear validation error if input is valid
        setValidationErrors(prev => ({
          ...prev,
          customer: ''
        }));
      }
    }
    
    // Handle delivery date validation and auto-correction
    if (name === 'deliveryDate') {
      const selectedDate = new Date(value);
      const now = new Date();
      
      // If the selected date is in the past, auto-correct to a future time
      if (selectedDate < now) {
        const correctedDate = getSuggestedDeliveryDate();
        setFormData(prev => ({
          ...prev,
          [name]: toDatetimeLocal(correctedDate)
        }));
        setToast({ 
          type: 'info', 
          msg: 'Date was in the past. Auto-corrected to a future time.' 
        });
        setTimeout(() => setToast(null), 3000);
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = (value) => {
    setFormData(prev => ({
      ...prev,
      status: value
    }));
  };

  const handleDriverChange = (value) => {
    setFormData(prev => ({
      ...prev,
      driverId: value === 'none' ? '' : value
    }));
  };

  const handleOrderSelect = (order) => {
    setFormData(prev => ({
      ...prev,
      orderId: order.orderId,
      customer: order.userId ? `${order.userId.firstName} ${order.userId.lastName}` : 'Customer',
      address: order.shippingAddress ? 
        `${order.shippingAddress.address}, ${order.shippingAddress.city}` : 
        'Address not provided'
    }));
  };

  const resetForm = () => {
    setFormData({
      orderId: '',
      customer: '',
      address: '',
      deliveryDate: '',
      status: 'Pending',
      notes: '',
      driverId: ''
    });
    setValidationErrors({});
  };

  const handleAddDelivery = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Debug: Log form data before sending
      console.log('Form data being sent:', formData);
      
      // Validate required fields on frontend
      if (!formData.orderId || !formData.customer || !formData.address || !formData.deliveryDate) {
        setToast({ type: 'error', msg: 'Please fill in all required fields' });
        setIsSubmitting(false);
        return;
      }

      // Validate customer name format
      const lettersOnlyRegex = /^[a-zA-Z\s.'-]+$/;
      if (!lettersOnlyRegex.test(formData.customer)) {
        setToast({ type: 'error', msg: 'Customer name can only contain letters, spaces, periods, apostrophes, and hyphens' });
        setIsSubmitting(false);
        return;
      }
      
      // Clean up driverId if it's "none" or empty
      const cleanedFormData = {
        ...formData,
        driverId: formData.driverId === 'none' || formData.driverId === '' ? undefined : formData.driverId
      };
      
      console.log('Cleaned form data:', cleanedFormData);
      
      await api.post('/deliveries', cleanedFormData);
      
      // Check if driver was assigned
      const selectedDriver = drivers.find(d => d._id === formData.driverId);
      if (selectedDriver) {
        setToast({ 
          type: 'success', 
          msg: `Delivery added successfully! Email sent to ${selectedDriver.fullName} (${selectedDriver.email})` 
        });
      } else {
        setToast({ type: 'success', msg: 'Delivery added successfully!' });
      }
      
      fetchDeliveries();
      setIsAddDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error('Add delivery error:', err.response?.data);
      const msg = err.response?.data?.msg || err.response?.data?.errors?.join(', ') || 'Failed to add delivery';
      setToast({ type: 'error', msg });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  const handleEditDelivery = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Debug: Log form data before sending
      console.log('Edit form data being sent:', formData);
      
      // Validate required fields on frontend
      if (!formData.orderId || !formData.customer || !formData.address || !formData.deliveryDate) {
        setToast({ type: 'error', msg: 'Please fill in all required fields' });
        setIsSubmitting(false);
        return;
      }

      // Validate customer name format
      const lettersOnlyRegex = /^[a-zA-Z\s.'-]+$/;
      if (!lettersOnlyRegex.test(formData.customer)) {
        setToast({ type: 'error', msg: 'Customer name can only contain letters, spaces, periods, apostrophes, and hyphens' });
        setIsSubmitting(false);
        return;
      }
      
      // Clean up driverId if it's "none" or empty
      const cleanedFormData = {
        ...formData,
        driverId: formData.driverId === 'none' || formData.driverId === '' ? undefined : formData.driverId
      };
      
      console.log('Cleaned edit form data:', cleanedFormData);
      
      await api.put(`/deliveries/${selectedDelivery._id}`, cleanedFormData);
      
      // Check if driver was assigned or changed
      const selectedDriver = drivers.find(d => d._id === formData.driverId);
      const originalDriver = selectedDelivery.driver;
      
      if (selectedDriver && selectedDriver._id !== originalDriver) {
        setToast({ 
          type: 'success', 
          msg: `Delivery updated successfully! Email sent to ${selectedDriver.fullName} (${selectedDriver.email})` 
        });
      } else {
        setToast({ type: 'success', msg: 'Delivery updated successfully!' });
      }
      
      fetchDeliveries();
      setIsEditDialogOpen(false);
      setSelectedDelivery(null);
      resetForm();
    } catch (err) {
      console.error('Edit delivery error:', err.response?.data);
      const msg = err.response?.data?.msg || err.response?.data?.errors?.join(', ') || 'Failed to update delivery';
      setToast({ type: 'error', msg });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  const handleDeleteDelivery = async (id) => {
    if (!window.confirm('Are you sure you want to delete this delivery?')) return;
    
    try {
      await api.delete(`/deliveries/${id}`);
      setToast({ type: 'success', msg: 'Delivery deleted successfully!' });
      fetchDeliveries();
    } catch (err) {
      const msg = err.response?.data?.msg || 'Failed to delete delivery';
      setToast({ type: 'error', msg });
    } finally {
      setTimeout(() => setToast(null), 3000);
    }
  };

  const openEditDialog = (delivery) => {
    setSelectedDelivery(delivery);
    
    // Properly format the delivery date for datetime-local input
    let formattedDate = '';
    if (delivery.deliveryDate) {
      try {
        const date = new Date(delivery.deliveryDate);
        if (!isNaN(date.getTime())) {
          formattedDate = toDatetimeLocal(date);
        }
      } catch (error) {
        console.warn('Error formatting delivery date:', error);
        formattedDate = '';
      }
    }
    
    setFormData({
      orderId: delivery.orderId,
      customer: delivery.customer,
      address: delivery.address,
      deliveryDate: formattedDate,
      status: delivery.status,
      notes: delivery.notes || '',
      driverId: delivery.driver || 'none'
    });
    setIsEditDialogOpen(true);
  };

  const handleDownloadReport = async () => {
    try {
      const response = await api.get('/deliveries/report/csv', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `deliveries-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setToast({ type: 'success', msg: 'Report downloaded successfully!' });
    } catch (err) {
      const msg = err.response?.data?.msg || 'Failed to download report';
      setToast({ type: 'error', msg });
    } finally {
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleDownloadPDF = () => {
    try {
      // Check if deliveries data exists
      if (!deliveries || !Array.isArray(deliveries)) {
        setToast({ type: 'error', msg: 'No delivery data available for PDF generation' });
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Set font
      doc.setFont('helvetica');
      
      // Title
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('SportNest', pageWidth / 2, 30, { align: 'center' });
      
      // Subtitle
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text('Delivery Management Report', pageWidth / 2, 45, { align: 'center' });
      
      // Report generation date and time
      const currentDate = new Date();
      const dateTime = currentDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      doc.setFontSize(10);
      doc.text(`Generated on: ${dateTime}`, pageWidth / 2, 55, { align: 'center' });
      
      // Summary statistics
      const totalDeliveries = deliveries.length;
      const pendingDeliveries = deliveries.filter(d => d.status === 'Pending').length;
      const inTransitDeliveries = deliveries.filter(d => d.status === 'In Transit').length;
      const deliveredDeliveries = deliveries.filter(d => d.status === 'Delivered').length;
      const cancelledDeliveries = deliveries.filter(d => d.status === 'Cancelled').length;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary Statistics', 20, 75);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Deliveries: ${totalDeliveries}`, 20, 85);
      doc.text(`Pending: ${pendingDeliveries}`, 20, 95);
      doc.text(`In Transit: ${inTransitDeliveries}`, 20, 105);
      doc.text(`Delivered: ${deliveredDeliveries}`, 20, 115);
      doc.text(`Cancelled: ${cancelledDeliveries}`, 20, 125);
      
      // Delivery details table
      if (deliveries.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Delivery Details', 20, 145);
        
        // Table headers
        const tableStartY = 155;
        const colWidths = [25, 30, 40, 25, 30, 20];
        const colPositions = [20, 45, 75, 115, 140, 170];
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Order ID', colPositions[0], tableStartY);
        doc.text('Customer', colPositions[1], tableStartY);
        doc.text('Address', colPositions[2], tableStartY);
        doc.text('Driver', colPositions[3], tableStartY);
        doc.text('Date & Time', colPositions[4], tableStartY);
        doc.text('Status', colPositions[5], tableStartY);
        
        // Draw table lines
        doc.line(20, tableStartY + 2, 190, tableStartY + 2);
        
        let currentY = tableStartY + 8;
        let pageNumber = 1;
        
        deliveries.forEach((delivery, index) => {
          try {
            // Check if we need a new page
            if (currentY > pageHeight - 30) {
              doc.addPage();
              pageNumber++;
              currentY = 20;
              
              // Add page header
              doc.setFontSize(10);
              doc.setFont('helvetica', 'normal');
              doc.text(`Page ${pageNumber}`, pageWidth - 20, 15, { align: 'right' });
              doc.text('SportNest - Delivery Management Report', 20, 15);
            }
          
          // Format delivery date
          let formattedDate = 'N/A';
          let formattedTime = 'N/A';
          
          if (delivery.deliveryDate) {
            try {
              const deliveryDate = new Date(delivery.deliveryDate);
              if (!isNaN(deliveryDate.getTime())) {
                formattedDate = deliveryDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                formattedTime = deliveryDate.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                });
              }
            } catch (error) {
              console.warn('Error formatting delivery date:', error);
            }
          }
          
          // Truncate long text
          const truncateText = (text, maxLength) => {
            if (!text || text === null || text === undefined) {
              return 'N/A';
            }
            const textStr = String(text);
            return textStr.length > maxLength ? textStr.substring(0, maxLength) + '...' : textStr;
          };
          
          doc.setFontSize(7);
          doc.setFont('helvetica', 'normal');
          
          // Order ID
          doc.text(truncateText(delivery.orderId || 'N/A', 8), colPositions[0], currentY);
          
          // Customer
          doc.text(truncateText(delivery.customer || 'N/A', 12), colPositions[1], currentY);
          
          // Address
          doc.text(truncateText(delivery.address || 'N/A', 18), colPositions[2], currentY);
          
          // Driver
          let driverName = 'Not Assigned';
          if (delivery.driver && delivery.driver.fullName) {
            driverName = delivery.driver.fullName;
          } else if (delivery.driver && typeof delivery.driver === 'string') {
            driverName = delivery.driver;
          }
          doc.text(truncateText(driverName, 10), colPositions[3], currentY);
          
          // Date & Time
          doc.text(`${formattedDate}`, colPositions[4], currentY);
          doc.text(`${formattedTime}`, colPositions[4], currentY + 3);
          
          // Status
          doc.text(delivery.status || 'N/A', colPositions[5], currentY);
          
          currentY += 12;
          } catch (deliveryError) {
            console.warn(`Error processing delivery ${index}:`, deliveryError);
            // Skip this delivery and continue with the next one
            currentY += 12;
          }
        });
      } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('No deliveries found.', 20, 155);
      }
      
      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text('SportNest Delivery Management System', pageWidth / 2, pageHeight - 5, { align: 'center' });
      }
      
      // Save the PDF
      const fileName = `SportNest-Delivery-Report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      setToast({ type: 'success', msg: 'PDF report downloaded successfully!' });
    } catch (err) {
      console.error('PDF generation error:', err);
      setToast({ type: 'error', msg: 'Failed to generate PDF report' });
    } finally {
      setTimeout(() => setToast(null), 3000);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Assigned': return 'bg-purple-100 text-purple-800';
      case 'In Transit': return 'bg-blue-100 text-blue-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) return <div className="p-10">Loading deliveries...</div>;
  if (error) return <div className="p-10 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 p-3 rounded shadow-lg text-sm ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faTruck} className="text-2xl text-orange-600" />
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Delivery Management</h1>
            <p className="text-lg text-gray-500 mt-1">Track and manage all deliveries.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownloadReport} variant="outline">
            <FontAwesomeIcon icon={faDownload} className="mr-2" />
            Download CSV
          </Button>
          <Button onClick={handleDownloadPDF} variant="outline" className="bg-red-100 hover:bg-red-200 text-red-800">
            <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
            Download PDF
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add Delivery
          </Button>
        </div>
      </div>


      {/* Deliveries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery List</CardTitle>
          <CardDescription>All delivery entries and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          {deliveries.length === 0 ? (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faTruck} className="text-4xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No deliveries yet.</p>
              <p className="text-gray-400">Add your first delivery to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((delivery) => (
                    <TableRow key={delivery._id}>
                      <TableCell className="font-medium">{delivery.orderId}</TableCell>
                      <TableCell>{delivery.customer}</TableCell>
                      <TableCell className="max-w-xs truncate">{delivery.address}</TableCell>
                      <TableCell>
                        {delivery.driver ? (
                          <div className="text-sm">
                            <div className="font-medium">{delivery.driver.fullName}</div>
                            <div className="text-gray-500 text-xs">{delivery.driver.email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No driver assigned</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(delivery.deliveryDate)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                          {delivery.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(delivery)}
                          >
                            <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteDelivery(delivery._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Delivery Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-white shadow-2xl border-0 rounded-xl">
          <DialogHeader className="pb-6 border-b border-gray-100">
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faPlus} className="text-orange-600 text-lg" />
              </div>
              Add New Delivery
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAddDelivery} className="space-y-6 pt-6">
            {/* Available Orders Section */}
            {availableOrders.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-xs font-bold">!</span>
                  </div>
                  Available Orders (Click to Auto-fill)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableOrders.slice(0, 6).map((order) => (
                    <div
                      key={order._id}
                      onClick={() => handleOrderSelect(order)}
                      className="p-4 bg-white rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <div className="font-semibold text-sm text-gray-800 mb-1">Order: {order.orderId}</div>
                      <div className="text-sm text-gray-600 mb-1">
                        {order.userId ? `${order.userId.firstName} ${order.userId.lastName}` : 'Customer'}
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        Total: Rs. {order.totalAmount?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-6">
              {/* First Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="add-orderId" className="text-sm font-semibold text-gray-700">Order ID</Label>
                  <Input
                    id="add-orderId"
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleInputChange}
                    placeholder="Enter Order ID"
                    required
                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-customer" className="text-sm font-semibold text-gray-700">Customer</Label>
                  <Input
                    id="add-customer"
                    name="customer"
                    value={formData.customer}
                    onChange={handleInputChange}
                    placeholder="Customer Name"
                    required
                    className={`h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg ${validationErrors.customer ? 'border-red-500' : ''}`}
                  />
                  {validationErrors.customer && (
                    <p className="text-red-500 text-sm">{validationErrors.customer}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-address" className="text-sm font-semibold text-gray-700">Address</Label>
                  <Input
                    id="add-address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Delivery Address"
                    required
                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                </div>
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="add-deliveryDate" className="text-sm font-semibold text-gray-700">Delivery Date</Label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        id="add-deliveryDate"
                        name="deliveryDate"
                        type="datetime-local"
                        value={formData.deliveryDate}
                        onChange={handleInputChange}
                        required
                        min={toDatetimeLocal(new Date())}
                        className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg pr-10"
                      />
                      <FontAwesomeIcon icon={faCalendarAlt} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setFormData(prev => ({
                          ...prev,
                          deliveryDate: toDatetimeLocal(getSuggestedDeliveryDate()),
                        }))
                      }
                      title="Auto suggest a suitable time"
                      className="h-11 px-4 border-gray-300 hover:bg-gray-50 rounded-lg"
                    >
                      Auto
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Auto suggests now + 3h (or tomorrow 10:00 AM if after 7 PM).
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="add-status" className="text-sm font-semibold text-gray-700">Status</Label>
                  <Select value={formData.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-xl">
                      {statusOptions.map(status => (
                        <SelectItem 
                          key={status} 
                          value={status}
                          className="px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer transition-colors duration-150"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              status === 'Pending' ? 'bg-yellow-400' :
                              status === 'Assigned' ? 'bg-purple-400' :
                              status === 'In Transit' ? 'bg-blue-400' :
                              status === 'Delivered' ? 'bg-green-400' :
                              status === 'Cancelled' ? 'bg-red-400' : 'bg-gray-400'
                            }`}></div>
                            <span className="font-medium text-gray-800">{status}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="add-driverId" className="text-sm font-semibold text-gray-700">Driver (Optional)</Label>
                  <Select value={formData.driverId} onValueChange={handleDriverChange}>
                    <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                      <SelectValue placeholder="Select Driver" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                      <SelectItem 
                        value="none"
                        className="px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 cursor-pointer transition-colors duration-150"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          <span className="font-medium text-gray-600">No Driver Assigned</span>
                        </div>
                      </SelectItem>
                      {drivers.length > 0 ? (
                        drivers.map(driver => (
                          <SelectItem 
                            key={driver._id} 
                            value={driver._id}
                            className="px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer transition-colors duration-150"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-sm">
                                  {driver.fullName?.charAt(0) || 'D'}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">{driver.fullName}</span>
                                <span className="text-xs text-gray-500">{driver.email}</span>
                              </div>
                              <div className="ml-auto">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  driver.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {driver.status}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem 
                          value="no-drivers" 
                          disabled
                          className="px-4 py-3 text-gray-400 cursor-not-allowed"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                            <span>No drivers available</span>
                          </div>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes Section */}
              <div className="space-y-2">
                <Label htmlFor="add-notes" className="text-sm font-semibold text-gray-700">Notes (Optional)</Label>
                <Textarea
                  id="add-notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes for this delivery"
                  rows={3}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <DialogFooter className="pt-6 border-t border-gray-100">
              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                  }}
                  className="h-11 px-6 border-gray-300 hover:bg-gray-50 rounded-lg"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  {isSubmitting ? 'Adding...' : 'Add Delivery'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Delivery Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-white shadow-2xl border-0 rounded-xl">
          <DialogHeader className="pb-6 border-b border-gray-100">
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faEdit} className="text-blue-600 text-lg" />
              </div>
              Edit Delivery
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditDelivery} className="space-y-6 pt-6">
            {/* Form Fields */}
            <div className="space-y-6">
              {/* First Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-orderId" className="text-sm font-semibold text-gray-700">Order ID</Label>
                  <Input
                    id="edit-orderId"
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleInputChange}
                    required
                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-customer" className="text-sm font-semibold text-gray-700">Customer</Label>
                  <Input
                    id="edit-customer"
                    name="customer"
                    value={formData.customer}
                    onChange={handleInputChange}
                    required
                    className={`h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg ${validationErrors.customer ? 'border-red-500' : ''}`}
                  />
                  {validationErrors.customer && (
                    <p className="text-red-500 text-sm">{validationErrors.customer}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-address" className="text-sm font-semibold text-gray-700">Address</Label>
                  <Input
                    id="edit-address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                </div>
              </div>
              {/* Second Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-deliveryDate" className="text-sm font-semibold text-gray-700">Delivery Date</Label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        id="edit-deliveryDate"
                        name="deliveryDate"
                        type="datetime-local"
                        value={formData.deliveryDate}
                        onChange={handleInputChange}
                        required
                        min={toDatetimeLocal(new Date())}
                        className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg pr-10"
                      />
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setFormData(prev => ({
                          ...prev,
                          deliveryDate: toDatetimeLocal(getSuggestedDeliveryDate()),
                        }))
                      }
                      title="Auto suggest a suitable time"
                      className="h-11 px-4 border-gray-300 hover:bg-gray-50 rounded-lg"
                    >
                      Auto
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Auto suggests now + 3h (or tomorrow 10:00 AM if after 7 PM).
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-status" className="text-sm font-semibold text-gray-700">Status</Label>
                  <Select value={formData.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-xl">
                      {statusOptions.map(status => (
                        <SelectItem 
                          key={status} 
                          value={status}
                          className="px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer transition-colors duration-150"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              status === 'Pending' ? 'bg-yellow-400' :
                              status === 'Assigned' ? 'bg-purple-400' :
                              status === 'In Transit' ? 'bg-blue-400' :
                              status === 'Delivered' ? 'bg-green-400' :
                              status === 'Cancelled' ? 'bg-red-400' : 'bg-gray-400'
                            }`}></div>
                            <span className="font-medium text-gray-800">{status}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-driverId" className="text-sm font-semibold text-gray-700">Driver (Optional)</Label>
                  <Select value={formData.driverId} onValueChange={handleDriverChange}>
                    <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                      <SelectValue placeholder="Select Driver" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                      <SelectItem 
                        value="none"
                        className="px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 cursor-pointer transition-colors duration-150"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          <span className="font-medium text-gray-600">No Driver Assigned</span>
                        </div>
                      </SelectItem>
                      {drivers.length > 0 ? (
                        drivers.map(driver => (
                          <SelectItem 
                            key={driver._id} 
                            value={driver._id}
                            className="px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer transition-colors duration-150"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-sm">
                                  {driver.fullName?.charAt(0) || 'D'}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">{driver.fullName}</span>
                                <span className="text-xs text-gray-500">{driver.email}</span>
                              </div>
                              <div className="ml-auto">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  driver.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {driver.status}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem 
                          value="no-drivers" 
                          disabled
                          className="px-4 py-3 text-gray-400 cursor-not-allowed"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                            <span>No drivers available</span>
                          </div>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {formData.driverId && formData.driverId !== 'none' && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-blue-600 text-xs">i</span>
                        </div>
                        <div className="text-sm">
                          <div className="font-semibold text-blue-800 mb-1">Selected Driver Information</div>
                          <div className="text-blue-700">
                            <span className="font-medium">Name:</span> {drivers.find(d => d._id === formData.driverId)?.fullName}
                          </div>
                          <div className="text-blue-700">
                            <span className="font-medium">Email:</span> {drivers.find(d => d._id === formData.driverId)?.email}
                          </div>
                          <div className="text-xs text-blue-600 mt-2">
                            An email will be sent to this driver when delivery is updated.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes Section */}
              <div className="space-y-2">
                <Label htmlFor="edit-notes" className="text-sm font-semibold text-gray-700">Notes (Optional)</Label>
                <Textarea
                  id="edit-notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes for this delivery"
                  rows={3}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg resize-none"
                />
              </div>
            </div>
            {/* Action Buttons */}
            <DialogFooter className="pt-6 border-t border-gray-100">
              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedDelivery(null);
                    resetForm();
                  }}
                  className="h-11 px-6 border-gray-300 hover:bg-gray-50 rounded-lg"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-2" />
                  {isSubmitting ? 'Updating...' : 'Update Delivery'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryManagement;
