import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faCheckCircle, faArrowLeft, faBuilding, faUser, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import api from '@/api';

const PreOrderPaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { supplierData, preOrderData, amount } = location.state || {};

  const [formData, setFormData] = useState({
    // Supplier Details (Auto-filled)
    supplierName: '',
    bankName: '',
    accountName: '',
    accountNumber: '',
    
    // Payment Details
    amount: '',
    paymentMethod: 'online',
    paymentAccountNumber: '',
    cvv: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Auto-fill supplier details when component mounts
  useEffect(() => {
    if (supplierData) {
      setFormData(prev => ({
        ...prev,
        supplierName: supplierData.name || '',
        bankName: supplierData.bankName || '',
        accountName: supplierData.accountName || '',
        accountNumber: supplierData.accountNumber || '',
        amount: amount || ''
      }));
    }
  }, [supplierData, amount]);

  // Redirect if no supplier data or admin not authenticated
  useEffect(() => {
    if (!supplierData) {
      navigate('/admin-dashboard');
      return;
    }

    // Check if admin is authenticated
    const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
    if (!adminInfo || !adminInfo.token) {
      setError('Session expired. Please log in again.');
      // Redirect to login after showing error
      setTimeout(() => {
        navigate('/admin-login');
      }, 2000);
    }
  }, [supplierData, navigate]);

  // Validation functions
  const validateAmount = (amount) => {
    if (!amount || amount.toString().trim() === '') {
      return 'Amount is required';
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      return 'Amount must be a valid number';
    }
    if (numAmount <= 0) {
      return 'Amount must be greater than 0';
    }
    if (numAmount > 10000000) {
      return 'Amount cannot exceed 10,000,000 LKR';
    }
    if (numAmount < 1) {
      return 'Amount must be at least 1 LKR';
    }
    return '';
  };

  const validateAccountNumber = (accountNumber) => {
    if (!accountNumber || accountNumber.trim() === '') {
      return 'Account number is required';
    }
    if (accountNumber.length !== 16) {
      return 'Account number must be exactly 16 digits';
    }
    if (!/^[0-9]+$/.test(accountNumber)) {
      return 'Account number must contain only numbers';
    }
    return '';
  };

  const validateCVV = (cvv) => {
    if (!cvv || cvv.trim() === '') {
      return 'CVV is required';
    }
    if (cvv.length !== 3) {
      return 'CVV must be exactly 3 digits';
    }
    if (!/^[0-9]+$/.test(cvv)) {
      return 'CVV must contain only numbers';
    }
    return '';
  };

  const validatePaymentDate = (date) => {
    if (!date) {
      return 'Payment date is required';
    }
    const paymentDate = new Date(date);
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    if (paymentDate > today) {
      return 'Payment date cannot be in the future';
    }
    if (paymentDate < oneYearAgo) {
      return 'Payment date cannot be more than 1 year ago';
    }
    return '';
  };

  const validateNotes = (notes) => {
    if (notes && notes.length > 150) {
      return 'Notes cannot exceed 150 characters';
    }
    return '';
  };

  const validateForm = () => {
    const errors = {};
    
    errors.amount = validateAmount(formData.amount);
    errors.paymentAccountNumber = validateAccountNumber(formData.paymentAccountNumber);
    errors.cvv = validateCVV(formData.cvv);
    errors.paymentDate = validatePaymentDate(formData.paymentDate);
    errors.notes = validateNotes(formData.notes);
    
    setValidationErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setValidationErrors({});

    // Validate form before submission
    if (!validateForm()) {
      setError('Please fix all validation errors before submitting.');
      setLoading(false);
      return;
    }

    try {
      // Check if admin is authenticated
      const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
      if (!adminInfo || !adminInfo.token) {
        setError('Admin authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      const paymentData = {
        supplierId: supplierData._id,
        supplierName: formData.supplierName,
        bank: formData.bankName,
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        paymentAccountNumber: formData.paymentAccountNumber,
        cvv: formData.cvv,
        paymentDate: formData.paymentDate,
        notes: formData.notes,
        preOrderId: preOrderData?._id,
        status: 'completed'
      };

      console.log('Submitting payment data:', paymentData);
      console.log('Admin info available:', !!adminInfo);
      console.log('Token available:', !!adminInfo?.token);
      console.log('Supplier data from location.state:', supplierData);
      console.log('PreOrder data from location.state:', preOrderData);

      // Use the api instance which automatically handles authentication
      const response = await api.post('/admin/pre-order-payments', paymentData);

      console.log('Payment response:', response.data);
      setSuccess('Payment logged successfully!');
      
      // Redirect back to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/admin-dashboard');
      }, 2000);

    } catch (error) {
      console.error('Payment logging failed:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else if (error.response?.status === 400) {
        setError(error.response?.data?.message || 'Invalid payment data. Please check your information.');
      } else if (error.response?.status === 404) {
        setError('Supplier not found. Please contact support.');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(error.response?.data?.message || 'Failed to log payment. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!supplierData) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate('/admin-dashboard')}
            variant="outline"
            className="mb-6 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Dashboard
          </Button>
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <h1 className="text-3xl font-bold mb-2">Pre-Order Payment</h1>
            <p className="text-emerald-100 text-lg">Record payment details for supplier pre-order</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 text-green-700 px-6 py-4 rounded-lg mb-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center mr-3">
                <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xs" />
              </div>
              <p className="font-medium">{success}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Supplier Details Card */}
          <Card className="shadow-xl border-0 rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
              <CardTitle className="text-xl font-bold flex items-center">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                  <FontAwesomeIcon icon={faBuilding} className="text-white text-lg" />
                </div>
                Supplier Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplierName" className="text-sm font-medium text-gray-700">
                    Supplier Name
                  </Label>
                  <Input
                    id="supplierName"
                    value={formData.supplierName}
                    onChange={(e) => handleInputChange('supplierName', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="bankName" className="text-sm font-medium text-gray-700">
                    Bank
                  </Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="accountName" className="text-sm font-medium text-gray-700">
                    Account Name
                  </Label>
                  <Input
                    id="accountName"
                    value={formData.accountName}
                    onChange={(e) => handleInputChange('accountName', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="accountNumber" className="text-sm font-medium text-gray-700">
                    Account Number
                  </Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details Card */}
          <Card className="shadow-xl border-0 rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
              <CardTitle className="text-xl font-bold flex items-center">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="text-white text-lg" />
                </div>
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                    Amount (LKR) *
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className={`mt-1 ${validationErrors.amount ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="e.g., 25000"
                    step="0.01"
                    min="1"
                    max="10000000"
                    required
                    onKeyPress={(e) => {
                      if (!/[0-9.]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                  {validationErrors.amount && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.amount}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="paymentMethod" className="text-sm font-medium text-gray-700">
                    Payment Method
                  </Label>
                  <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="online">Online Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="paymentAccountNumber" className="text-sm font-medium text-gray-700">
                    Account Number *
                  </Label>
                  <Input
                    id="paymentAccountNumber"
                    value={formData.paymentAccountNumber}
                    onChange={(e) => handleInputChange('paymentAccountNumber', e.target.value)}
                    className={`mt-1 ${validationErrors.paymentAccountNumber ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter 16-digit account number"
                    maxLength="16"
                    required
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                  {validationErrors.paymentAccountNumber && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.paymentAccountNumber}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="cvv" className="text-sm font-medium text-gray-700">
                    CVV *
                  </Label>
                  <Input
                    id="cvv"
                    value={formData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    className={`mt-1 ${validationErrors.cvv ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter 3-digit CVV"
                    maxLength="3"
                    required
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                  {validationErrors.cvv && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.cvv}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="paymentDate" className="text-sm font-medium text-gray-700">
                    Payment Date *
                  </Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                    className={`mt-1 ${validationErrors.paymentDate ? 'border-red-500' : 'border-gray-300'}`}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                  {validationErrors.paymentDate && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.paymentDate}</p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                  Notes (Optional)
                </Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className={`mt-1 ${validationErrors.notes ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Additional payment notes or comments (max 150 characters)"
                  maxLength="150"
                />
                {validationErrors.notes && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.notes}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  {formData.notes.length}/150 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin-dashboard')}
              disabled={loading}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.amount || !formData.paymentAccountNumber || !formData.cvv || !formData.paymentDate}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                  Payment
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PreOrderPaymentPage;
