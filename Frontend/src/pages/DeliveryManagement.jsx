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
    setFormData({
      orderId: delivery.orderId,
      customer: delivery.customer,
      address: delivery.address,
      deliveryDate: new Date(delivery.deliveryDate).toISOString().slice(0, 16),
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
          <Button 
            onClick={() => {
              console.log('Testing driver loading...');
              fetchDrivers();
            }}
            variant="outline"
            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
          >
            Test Drivers
          </Button>
          <Button 
            onClick={async () => {
              try {
                console.log('Testing email functionality...');
                const res = await api.post('/deliveries/test-email', {
                  to: 'test@example.com'
                });
                console.log('Email test result:', res.data);
                setToast({ 
                  type: 'success', 
                  msg: 'Test email sent successfully! Check console for details.' 
                });
                setTimeout(() => setToast(null), 5000);
              } catch (err) {
                console.error('Email test failed:', err);
                setToast({ 
                  type: 'error', 
                  msg: 'Email test failed. Check console for details.' 
                });
                setTimeout(() => setToast(null), 5000);
              }
            }}
            variant="outline"
            className="bg-purple-100 hover:bg-purple-200 text-purple-800"
          >
            Test Email
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add Delivery
          </Button>
        </div>
      </div>

      {/* Add Delivery Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FontAwesomeIcon icon={faPlus} className="text-orange-600" />
            Add New Delivery
          </CardTitle>
          <CardDescription>Fill in the details to create a new delivery entry</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Available Orders Section */}
          {availableOrders.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Available Orders (Click to Auto-fill)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableOrders.slice(0, 6).map((order) => (
                  <div
                    key={order._id}
                    onClick={() => handleOrderSelect(order)}
                    className="p-3 bg-white rounded border cursor-pointer hover:bg-blue-100 transition-colors"
                  >
                    <div className="font-medium text-sm">Order: {order.orderId}</div>
                    <div className="text-xs text-gray-600">
                      {order.userId ? `${order.userId.firstName} ${order.userId.lastName}` : 'Customer'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Total: Rs. {order.totalAmount?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleAddDelivery} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                name="orderId"
                value={formData.orderId}
                onChange={handleInputChange}
                placeholder="Enter Order ID"
                required
              />
            </div>
            <div>
              <Label htmlFor="customer">Customer</Label>
              <Input
                id="customer"
                name="customer"
                value={formData.customer}
                onChange={handleInputChange}
                placeholder="Customer Name"
                required
                className={validationErrors.customer ? 'border-red-500' : ''}
              />
              {validationErrors.customer && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.customer}</p>
              )}
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Delivery Address"
                required
              />
            </div>
            <div>
              <Label htmlFor="deliveryDate">Delivery Date</Label>
              <div className="relative">
                <Input
                  id="deliveryDate"
                  name="deliveryDate"
                  type="datetime-local"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                  required
                />
                <FontAwesomeIcon icon={faCalendarAlt} className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="driverId">Driver (Optional)</Label>
              <Select value={formData.driverId} onValueChange={handleDriverChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Driver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Driver Assigned</SelectItem>
                  {drivers.length > 0 ? (
                    drivers.map(driver => (
                      <SelectItem key={driver._id} value={driver._id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{driver.fullName}</span>
                          <span className="text-xs text-gray-500">{driver.email}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-drivers" disabled>
                      No drivers available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {formData.driverId && formData.driverId !== 'none' && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                  <span className="text-blue-600">Selected Driver: </span>
                  <span className="font-medium">
                    {drivers.find(d => d._id === formData.driverId)?.fullName}
                  </span>
                  <br />
                  <span className="text-blue-600">Email: </span>
                  <span className="font-medium">
                    {drivers.find(d => d._id === formData.driverId)?.email}
                  </span>
                  <br />
                  <span className="text-xs text-gray-500">
                    An email will be sent to this driver when delivery is created.
                  </span>
                </div>
              )}
              
              {/* Debug info */}
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                <span className="text-gray-600">Debug: </span>
                <span className="font-medium">
                  {drivers.length} drivers loaded
                </span>
                {drivers.length > 0 && (
                  <div className="mt-1">
                    <span className="text-gray-500">Available drivers: </span>
                    {drivers.map(driver => (
                      <div key={driver._id} className="text-blue-600 mr-2 mb-1">
                        <span className="font-medium">{driver.fullName}</span>
                        <span className="text-gray-500"> ({driver.email})</span>
                        <span className="text-green-600"> - {driver.status}</span>
                      </div>
                    ))}
                  </div>
                )}
                {drivers.length === 0 && (
                  <div className="mt-1 text-red-500">
                    No drivers available. Check console for details.
                  </div>
                )}
              </div>
            </div>
            <div className="md:col-span-2 lg:col-span-5">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes for this delivery"
                rows={2}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-5 flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                {isSubmitting ? 'Adding...' : 'Add Delivery'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

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

      {/* Edit Delivery Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Delivery</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditDelivery} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-orderId">Order ID</Label>
                <Input
                  id="edit-orderId"
                  name="orderId"
                  value={formData.orderId}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-customer">Customer</Label>
                <Input
                  id="edit-customer"
                  name="customer"
                  value={formData.customer}
                  onChange={handleInputChange}
                  required
                  className={validationErrors.customer ? 'border-red-500' : ''}
                />
                {validationErrors.customer && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.customer}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-deliveryDate">Delivery Date</Label>
                <Input
                  id="edit-deliveryDate"
                  name="deliveryDate"
                  type="datetime-local"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-driverId">Driver</Label>
                <Select value={formData.driverId} onValueChange={handleDriverChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Driver Assigned</SelectItem>
                    {drivers.length > 0 ? (
                      drivers.map(driver => (
                        <SelectItem key={driver._id} value={driver._id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{driver.fullName}</span>
                            <span className="text-xs text-gray-500">{driver.email}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-drivers" disabled>
                        No drivers available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {formData.driverId && formData.driverId !== 'none' && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                    <span className="text-blue-600">Selected Driver: </span>
                    <span className="font-medium">
                      {drivers.find(d => d._id === formData.driverId)?.fullName}
                    </span>
                    <br />
                    <span className="text-blue-600">Email: </span>
                    <span className="font-medium">
                      {drivers.find(d => d._id === formData.driverId)?.email}
                    </span>
                    <br />
                    <span className="text-xs text-gray-500">
                      An email will be sent to this driver when delivery is updated.
                    </span>
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Delivery'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryManagement;
