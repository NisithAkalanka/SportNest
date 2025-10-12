import React, { useState, useEffect } from 'react';
import { Search, Download, Plus, Edit, Trash2, Calendar, Copy, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { driverApi } from '@/api/driverApi';
import jsPDF from 'jspdf';

const DriverManagement = () => {
  // State management
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [emailFilter, setEmailFilter] = useState('');
  const [toast, setToast] = useState(null);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    licenseNumber: '',
    phone: '',
    email: '',
    address: '',
    hireDate: '',
    salary: '',
    status: 'Active'
  });

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status options
  const statusOptions = [
    'All Status',
    'Active',
    'Inactive', 
    'Suspended',
    'Terminated'
  ];

  // Validation functions
  const validateFullName = (name) => {
    const englishLettersOnlyRegex = /^[a-zA-Z\s]+$/;
    if (!name || name.trim() === '') {
      return 'Full name is required';
    }
    if (!englishLettersOnlyRegex.test(name)) {
      return 'Full name can only contain English letters and spaces';
    }
    return '';
  };

  const validatePhone = (phone) => {
    const numbersOnlyRegex = /^[0-9]+$/;
    if (!phone || phone.trim() === '') {
      return 'Phone number is required';
    }
    if (!numbersOnlyRegex.test(phone)) {
      return 'Phone number can only contain numbers';
    }
    if (phone.length !== 10) {
      return 'Phone number must be exactly 10 digits';
    }
    return '';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9.@]+$/;
    if (!email || email.trim() === '') {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Email can only contain letters, numbers, periods, and @ sign';
    }
    // Basic email format check
    if (!email.includes('@') || email.split('@').length !== 2) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validateHireDate = (date) => {
    if (!date) {
      return 'Hire date is required';
    }
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    // Allow only today and past dates for new drivers
    if (!selectedDriver && selectedDate > today) {
      return 'Hire date must be today or a past date';
    }
    return '';
  };

  const validateSalary = (salary) => {
    if (!salary || salary === '' || (typeof salary === 'string' && salary.trim() === '')) {
      return 'Salary is required';
    }
    const salaryNum = parseFloat(salary);
    if (isNaN(salaryNum) || salaryNum <= 0) {
      return 'Salary must be a positive number';
    }
    return '';
  };

  // Handle input changes with validation
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Validate all fields
  const validateForm = () => {
    const errors = {};
    
    errors.fullName = validateFullName(formData.fullName);
    errors.phone = validatePhone(formData.phone);
    errors.email = validateEmail(formData.email);
    errors.hireDate = validateHireDate(formData.hireDate);
    errors.salary = validateSalary(formData.salary);
    
    setValidationErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  // Copy email to clipboard
  const copyEmail = async (email) => {
    try {
      await navigator.clipboard.writeText(email);
      setToast({ type: 'success', msg: `Email copied: ${email}` });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error('Failed to copy email:', err);
      setToast({ type: 'error', msg: 'Failed to copy email' });
      setTimeout(() => setToast(null), 3000);
    }
  };


  // Load drivers
  const loadDrivers = async () => {
    setLoading(true);
    try {
      console.log('Loading drivers with params:', { search: searchTerm, status: statusFilter });
      const response = await driverApi.getDrivers({
        search: searchTerm,
        status: statusFilter
      });
      console.log('Drivers response:', response);
      setDrivers(response.drivers || []);
    } catch (error) {
      console.error('Error loading drivers:', error);
      setToast({ type: 'error', msg: 'Failed to load drivers. Check console for details.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  // Handle status filter
  const handleStatusFilter = (value) => {
    setStatusFilter(value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }
    
    // Validate form before submission
    if (!validateForm()) {
      setToast({ type: 'error', msg: 'Please fix all validation errors before submitting' });
      setTimeout(() => setToast(null), 5000);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare data for backend
      const driverData = {
        ...formData,
        salary: parseFloat(formData.salary) || 0,
        hireDate: formData.hireDate ? new Date(formData.hireDate).toISOString() : null
      };
      
      if (selectedDriver) {
        // Update existing driver
        console.log('Updating driver with data:', driverData);
        const response = await driverApi.updateDriver(selectedDriver._id, driverData);
        console.log('Update response:', response);
        setToast({ type: 'success', msg: 'Driver updated successfully' });
        setIsEditModalOpen(false);
      } else {
        // Create new driver
        console.log('Creating driver with data:', driverData);
        const response = await driverApi.createDriver(driverData);
        console.log('Create response:', response);
        setToast({ type: 'success', msg: 'Driver added successfully' });
      }
      resetForm();
      loadDrivers();
    } catch (error) {
      console.error('Error saving driver:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Failed to save driver';
      if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Invalid data provided';
      } else if (error.response?.status === 404) {
        errorMessage = 'Driver not found';
      } else if (error.response?.status === 409) {
        errorMessage = 'Driver with this email or license number already exists';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later';
      }
      
      setToast({ type: 'error', msg: errorMessage });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  // Handle edit
  const handleEdit = (driver) => {
    console.log('Editing driver:', driver);
    setSelectedDriver(driver);
    setFormData({
      fullName: driver.fullName || '',
      licenseNumber: driver.licenseNumber || '',
      phone: driver.phone || '',
      email: driver.email || '',
      address: driver.address || '',
      hireDate: driver.hireDate ? new Date(driver.hireDate).toISOString().split('T')[0] : '',
      salary: driver.salary || '',
      status: driver.status || 'Active'
    });
    // Clear any existing validation errors
    setValidationErrors({});
    setIsEditModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (driverId) => {
    try {
      await driverApi.deleteDriver(driverId);
      alert('Driver deleted successfully');
      loadDrivers();
    } catch (error) {
      console.error('Error deleting driver:', error);
      alert('Failed to delete driver');
    }
  };


  // Reset form
  const resetForm = () => {
    setFormData({
      fullName: '',
      licenseNumber: '',
      phone: '',
      email: '',
      address: '',
      hireDate: '',
      salary: '',
      status: 'Active'
    });
    setValidationErrors({});
    setSelectedDriver(null);
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
  };

  // Handle PDF export
  const handleExportPDF = () => {
    try {
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
      doc.text('Driver Management Report', pageWidth / 2, 45, { align: 'center' });
      
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
      const totalDrivers = filteredDrivers.length;
      const activeDrivers = filteredDrivers.filter(d => d.status === 'Active').length;
      const inactiveDrivers = filteredDrivers.filter(d => d.status === 'Inactive').length;
      const suspendedDrivers = filteredDrivers.filter(d => d.status === 'Suspended').length;
      const terminatedDrivers = filteredDrivers.filter(d => d.status === 'Terminated').length;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary Statistics', 20, 75);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Drivers: ${totalDrivers}`, 20, 85);
      doc.text(`Active: ${activeDrivers}`, 20, 95);
      doc.text(`Inactive: ${inactiveDrivers}`, 20, 105);
      doc.text(`Suspended: ${suspendedDrivers}`, 20, 115);
      doc.text(`Terminated: ${terminatedDrivers}`, 20, 125);
      
      // Driver details table
      if (filteredDrivers.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Driver Details', 20, 145);
        
        // Table headers
        const tableStartY = 155;
        const colWidths = [30, 25, 20, 35, 20, 15, 15];
        const colPositions = [20, 50, 75, 95, 130, 150, 165];
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Name', colPositions[0], tableStartY);
        doc.text('License', colPositions[1], tableStartY);
        doc.text('Phone', colPositions[2], tableStartY);
        doc.text('Email', colPositions[3], tableStartY);
        doc.text('Hire Date', colPositions[4], tableStartY);
        doc.text('Salary', colPositions[5], tableStartY);
        doc.text('Status', colPositions[6], tableStartY);
        
        // Draw table lines
        doc.line(20, tableStartY + 2, 180, tableStartY + 2);
        
        let currentY = tableStartY + 8;
        let pageNumber = 1;
        
        filteredDrivers.forEach((driver, index) => {
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
              doc.text('SportNest - Driver Management Report', 20, 15);
            }
            
            // Format hire date
            let formattedHireDate = 'N/A';
            if (driver.hireDate) {
              try {
                const hireDate = new Date(driver.hireDate);
                if (!isNaN(hireDate.getTime())) {
                  formattedHireDate = hireDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });
                }
              } catch (error) {
                console.warn('Error formatting hire date:', error);
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
            
            // Name
            doc.text(truncateText(driver.fullName || 'N/A', 15), colPositions[0], currentY);
            
            // License
            doc.text(truncateText(driver.licenseNumber || 'N/A', 10), colPositions[1], currentY);
            
            // Phone
            doc.text(truncateText(driver.phone || 'N/A', 8), colPositions[2], currentY);
            
            // Email
            doc.text(truncateText(driver.email || 'N/A', 18), colPositions[3], currentY);
            
            // Hire Date
            doc.text(formattedHireDate, colPositions[4], currentY);
            
            // Salary
            const salaryText = driver.salary ? `Rs. ${parseFloat(driver.salary).toLocaleString()}` : 'N/A';
            doc.text(truncateText(salaryText, 8), colPositions[5], currentY);
            
            // Status
            doc.text(driver.status || 'N/A', colPositions[6], currentY);
            
            currentY += 12;
          } catch (driverError) {
            console.warn(`Error processing driver ${index}:`, driverError);
            // Skip this driver and continue with the next one
            currentY += 12;
          }
        });
      } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('No drivers found.', 20, 155);
      }
      
      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text('SportNest Driver Management System', pageWidth / 2, pageHeight - 5, { align: 'center' });
      }
      
      // Save the PDF
      const fileName = `SportNest-Driver-Report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      setToast({ type: 'success', msg: 'PDF report downloaded successfully!' });
    } catch (err) {
      console.error('PDF generation error:', err);
      setToast({ type: 'error', msg: 'Failed to generate PDF report' });
    } finally {
      setTimeout(() => setToast(null), 3000);
    }
  };

  // Filter drivers based on search term, status, and email
  const filteredDrivers = drivers.filter(driver => {
    // Filter by first letter of driver's name when search term is provided
    const matchesSearch = !searchTerm || 
      driver.fullName?.toLowerCase().startsWith(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All Status' || driver.status === statusFilter;
    
    const matchesEmail = !emailFilter || 
      driver.email?.toLowerCase().includes(emailFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesEmail;
  });

  // Load data on component mount and when filters change
  useEffect(() => {
    loadDrivers();
  }, [searchTerm, statusFilter, emailFilter]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Driver Management</h1>
          <p className="text-gray-600">Manage your company drivers</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Salary Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-500">Total Drivers</p>
              <p className="text-2xl font-bold text-emerald-800">{filteredDrivers.length}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center">
              <span className="text-emerald-500 font-bold text-lg">👥</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-500">Active Drivers</p>
              <p className="text-2xl font-bold text-emerald-800">
                {filteredDrivers.filter(driver => driver.status === 'Active').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center">
              <span className="text-emerald-500 font-bold text-lg">✓</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-500">Inactive Drivers</p>
              <p className="text-2xl font-bold text-emerald-800">
                {filteredDrivers.filter(driver => driver.status === 'Inactive').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center">
              <span className="text-emerald-500 font-bold text-lg">⏸</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-500">Total Salary</p>
              <p className="text-2xl font-bold text-emerald-800">
                Rs. {filteredDrivers.reduce((total, driver) => total + (parseFloat(driver.salary) || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center">
              <span className="text-emerald-500 font-bold text-lg">💰</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Driver Information Form */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Driver</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <Input
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter full name"
                required
                className={validationErrors.fullName ? 'border-red-500' : ''}
                onKeyPress={(e) => {
                  if (!/^[a-zA-Z\s]$/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
              {validationErrors.fullName && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.fullName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
              <Input
                value={formData.licenseNumber}
                onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                placeholder="Enter license number"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter 10-digit phone number"
                required
                maxLength={10}
                className={validationErrors.phone ? 'border-red-500' : ''}
                onKeyPress={(e) => {
                  if (!/^[0-9]$/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
              {validationErrors.phone && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                required
                className={validationErrors.email ? 'border-red-500' : ''}
                onKeyPress={(e) => {
                  if (!/^[a-zA-Z0-9.@]$/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
              {validationErrors.email && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
              )}
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Enter address"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hire Date
                <span className="text-xs text-gray-500 ml-1">(Today or past)</span>
              </label>
              <div className="relative group">
                <Input
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => handleInputChange('hireDate', e.target.value)}
                  className={`pr-10 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    validationErrors.hireDate 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  max={new Date().toISOString().split('T')[0]}
                  placeholder="Select hire date"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400 group-hover:text-emerald-500 transition-colors duration-200" />
                </div>
              </div>
              {validationErrors.hireDate && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="text-red-500">⚠</span>
                  {validationErrors.hireDate}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary (Rs)</label>
              <Input
                type="number"
                value={formData.salary}
                onChange={(e) => handleInputChange('salary', e.target.value)}
                placeholder="Enter salary in Rs"
                required
                min="0"
                step="0.01"
                className={validationErrors.salary ? 'border-red-500' : ''}
              />
              {validationErrors.salary && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.salary}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                  <SelectItem value="Terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Add Driver Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Add Driver'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Search and Filter */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by first letter of name..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Filter by email..."
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Drivers Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Driver</TableHead>
              <TableHead>License</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Hire Date</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading drivers...
                </TableCell>
              </TableRow>
            ) : filteredDrivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No drivers found
                </TableCell>
              </TableRow>
            ) : (
              filteredDrivers.map((driver) => (
                <TableRow key={driver._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {driver.fullName?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{driver.fullName}</div>
                        <div className="text-sm text-gray-500">{driver.address}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{driver.licenseNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{driver.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <span className="font-medium text-emerald-500">{driver.email}</span>
                        <span className="text-xs text-gray-500">Driver Email</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyEmail(driver.email)}
                        className="h-8 w-8 p-0 hover:bg-emerald-50"
                        title="Copy email"
                      >
                        <Copy className="h-4 w-4 text-emerald-500" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(driver.hireDate).toLocaleDateString()}</TableCell>
                  <TableCell>Rs. {driver.salary?.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={driver.status === 'Active' ? 'default' : 'secondary'}>
                      {driver.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(driver)}
                        title="Edit driver"
                        className="hover:bg-emerald-50"
                      >
                        <Edit className="h-4 w-4 text-emerald-500" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Delete driver"
                            className="hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Driver</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {driver.fullName}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(driver._id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-white to-emerald-50 border-0 shadow-2xl">
          <DialogHeader className="pb-6 border-b border-emerald-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <Edit className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-800">Edit Driver Information</DialogTitle>
                <p className="text-gray-600 mt-1">Update driver details and save changes</p>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 pt-6">
            {/* First Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Full Name
                </label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter full name"
                  required
                  className={`h-12 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    validationErrors.fullName 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 hover:border-emerald-300'
                  }`}
                  onKeyPress={(e) => {
                    if (!/^[a-zA-Z\s]$/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
                {validationErrors.fullName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="text-red-500">⚠</span>
                    {validationErrors.fullName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  License Number
                </label>
                <Input
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                  placeholder="Enter license number"
                  required
                  className="h-12 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 hover:border-emerald-300"
                />
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Phone Number
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter 10-digit phone number"
                  required
                  maxLength={10}
                  className={`h-12 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    validationErrors.phone 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 hover:border-emerald-300'
                  }`}
                  onKeyPress={(e) => {
                    if (!/^[0-9]$/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
                {validationErrors.phone && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="text-red-500">⚠</span>
                    {validationErrors.phone}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Email Address
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  required
                  className={`h-12 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    validationErrors.email 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 hover:border-emerald-300'
                  }`}
                  onKeyPress={(e) => {
                    if (!/^[a-zA-Z0-9.@]$/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="text-red-500">⚠</span>
                    {validationErrors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Third Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Address
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Enter address"
                  required
                  className="h-12 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 hover:border-emerald-300"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Hire Date
                  <span className="text-xs text-gray-500 ml-1">(Today or past)</span>
                </label>
                <div className="relative group">
                  <Input
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => handleInputChange('hireDate', e.target.value)}
                    className={`h-12 pr-10 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      validationErrors.hireDate 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 hover:border-emerald-300'
                    }`}
                    max={new Date().toISOString().split('T')[0]}
                    placeholder="Select hire date"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400 group-hover:text-emerald-500 transition-colors duration-200" />
                  </div>
                </div>
                {validationErrors.hireDate && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="text-red-500">⚠</span>
                    {validationErrors.hireDate}
                  </p>
                )}
              </div>
            </div>

            {/* Fourth Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Salary (Rs)
                </label>
                <Input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                  placeholder="Enter salary in Rs"
                  required
                  min="0"
                  step="0.01"
                  className={`h-12 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    validationErrors.salary 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 hover:border-emerald-300'
                  }`}
                />
                {validationErrors.salary && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="text-red-500">⚠</span>
                    {validationErrors.salary}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Status
                </label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger className="h-12 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 hover:border-emerald-300">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                    <SelectItem value="Terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-emerald-100">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditModalOpen(false);
                  resetForm();
                }}
                className="px-8 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Update Driver
                  </div>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>


      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <span>{toast.msg}</span>
            <button 
              onClick={() => setToast(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverManagement;