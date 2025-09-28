import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faEdit, faTrashAlt, faCheck, faTimes, faPlus, faSave } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
// Event Payment Page Component
const EventPaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventData, registrationData } = location.state || {};

  const [formData, setFormData] = useState({
    // Payment Information
    paymentMethod: 'credit_card',
    cardName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    
    // Additional Options
    savePaymentInfo: false,
    createAccount: false,
    agreeToTerms: false
  });

  const [loading, setLoading] = useState(false);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Redirect if no event data
  useEffect(() => {
    if (!eventData || !registrationData) {
      navigate('/events');
    }
  }, [eventData, registrationData, navigate]);

  // Load saved payment methods
  useEffect(() => {
    loadSavedPaymentMethods();
  }, []);

  const loadSavedPaymentMethods = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      if (token) {
        const response = await axios.get('/api/payments/methods', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedPaymentMethods(response.data || []);
      } else {
        setSavedPaymentMethods([]);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      setSavedPaymentMethods([]);
    }
  };

  // Validation functions
  const validateCardNumber = (cardNumber) => {
    if (!cardNumber || cardNumber.trim() === '') {
      return 'Card number is required';
    }
    if (!/^[0-9]+$/.test(cardNumber)) {
      return 'Card number can only contain numbers';
    }
    if (cardNumber.length !== 16) {
      return 'Card number must be exactly 16 digits';
    }
    return '';
  };

  const validateCardholderName = (name) => {
    const lettersAndDotsRegex = /^[a-zA-Z\s.]+$/;
    if (!name || name.trim() === '') {
      return 'Cardholder name is required';
    }
    if (!lettersAndDotsRegex.test(name)) {
      return 'Cardholder name can only contain letters, spaces, and dots';
    }
    return '';
  };

  const validateCVV = (cvv) => {
    if (!cvv || cvv.trim() === '') {
      return 'CVV is required';
    }
    if (!/^[0-9]+$/.test(cvv)) {
      return 'CVV can only contain numbers';
    }
    if (cvv.length !== 3) {
      return 'CVV must be exactly 3 digits';
    }
    return '';
  };

  // Validate all payment fields
  const validatePaymentForm = () => {
    const errors = {};
    
    if (formData.cardName) {
      errors.cardName = validateCardholderName(formData.cardName);
    }
    if (formData.cardNumber) {
      errors.cardNumber = validateCardNumber(formData.cardNumber);
    }
    if (formData.cvv) {
      errors.cvv = validateCVV(formData.cvv);
    }
    
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

  const handleSavePaymentMethod = async () => {
    // Validate form before saving
    if (!validatePaymentForm()) {
      setError('Please fix all validation errors before saving');
      return;
    }

    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      if (!token) {
        setError('You must be logged in to save payment methods');
        return;
      }

      const paymentData = {
        type: formData.paymentMethod,
        cardName: formData.cardName,
        cardNumber: formData.cardNumber,
        expiryMonth: formData.expiryMonth,
        expiryYear: formData.expiryYear,
        isDefault: savedPaymentMethods.length === 0
      };

      const response = await axios.post('/api/payments/methods', paymentData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSavedPaymentMethods(prev => [...prev, response.data]);
      setSuccess('Payment method saved successfully!');
      resetPaymentForm();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save payment method');
    }
  };

  const handleUpdatePaymentMethod = async () => {
    // Validate form before updating
    if (!validatePaymentForm()) {
      setError('Please fix all validation errors before updating');
      return;
    }

    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      if (!token) {
        setError('You must be logged in to update payment methods');
        return;
      }

      const paymentData = {
        type: formData.paymentMethod,
        cardName: formData.cardName,
        cardNumber: formData.cardNumber,
        expiryMonth: formData.expiryMonth,
        expiryYear: formData.expiryYear
      };

      await axios.put(`/api/payments/methods/${editingPaymentId}`, paymentData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSavedPaymentMethods(prev => 
        prev.map(pm => pm._id === editingPaymentId ? { ...pm, ...paymentData } : pm)
      );
      setSuccess('Payment method updated successfully!');
      resetPaymentForm();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update payment method');
    }
  };

  const handleDeletePaymentMethod = async (paymentId) => {
    if (!paymentId) {
      setError('Invalid payment method ID');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      if (!token) {
        setError('You must be logged in to delete payment methods');
        return;
      }

      await axios.delete(`/api/payments/methods/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSavedPaymentMethods(prev => prev.filter(pm => pm._id !== paymentId));
      setSuccess('Payment method deleted successfully!');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete payment method');
    }
  };

  const handleSetDefaultPayment = async (paymentId) => {
    if (!paymentId) {
      setError('Invalid payment method ID');
      return;
    }
    
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      if (!token) {
        setError('You must be logged in to set default payment method');
        return;
      }

      await axios.put(`/api/payments/methods/${paymentId}/default`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSavedPaymentMethods(prev => 
        prev.map(pm => ({ ...pm, isDefault: pm._id === paymentId }))
      );
      setSuccess('Default payment method updated!');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to set default payment method');
    }
  };

  const handleEditPaymentMethod = (paymentMethod) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: paymentMethod.type,
      cardName: paymentMethod.cardName,
      cardNumber: paymentMethod.cardNumber,
      expiryMonth: paymentMethod.expiryMonth,
      expiryYear: paymentMethod.expiryYear
    }));
    setIsEditingPayment(true);
    setEditingPaymentId(paymentMethod._id);
  };

  const resetPaymentForm = () => {
    setFormData(prev => ({
      ...prev,
      cardName: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: ''
    }));
    setValidationErrors({});
    setIsEditingPayment(false);
    setEditingPaymentId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      
      // Check if payment details are provided (optional)
      const hasPaymentDetails = formData.cardName && formData.cardNumber && formData.expiryMonth && formData.expiryYear && formData.cvv;
      
      const paymentData = {
        eventId: eventData._id,
        amount: eventData.registrationFee || 200,
        registrationData: {
          name: registrationData.name,
          email: registrationData.email,
          phone: registrationData.phone
        },
        paymentInfo: hasPaymentDetails ? {
          method: formData.paymentMethod,
          cardName: formData.cardName,
          cardNumber: formData.cardNumber,
          expiryMonth: formData.expiryMonth,
          expiryYear: formData.expiryYear,
          cvv: formData.cvv
        } : null,
        savePaymentInfo: formData.savePaymentInfo && hasPaymentDetails,
        createAccount: formData.createAccount
      };

      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.post('/api/events/payment', paymentData, config);

      setSuccess('Payment successful! Redirecting to your ticket...');
      
      // Redirect to ticket page
      setTimeout(() => {
        navigate('/events/ticket', {
          state: {
            eventData,
            registrationData,
            paymentId: response.data.paymentId
          }
        });
      }, 1500);

    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => String(currentYear + i));

  if (!eventData || !registrationData) {
    return null; // Will redirect
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center space-x-6 bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
              <span className="text-xs">✓</span>
            </div>
            <span className="ml-3 text-sm font-medium text-green-600">Event Selection</span>
          </div>
          <div className="w-20 h-1 bg-green-500 rounded-full"></div>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
              <span className="text-xs">✓</span>
            </div>
            <span className="ml-3 text-sm font-medium text-green-600">Registration</span>
          </div>
          <div className="w-20 h-1 bg-green-500 rounded-full"></div>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <span className="ml-3 text-sm font-bold text-blue-600">Payment</span>
          </div>
        </div>
      </div>

      <h1 className="text-4xl font-bold text-center mb-10">Event Payment</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Payment Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Event Summary */}
          <Card className="shadow-lg border-2 border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                <h3 className="font-bold text-lg text-gray-800 mb-2">{eventData.name}</h3>
                <p className="text-gray-600 mb-2">{eventData.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Venue:</strong> {eventData.venue || 'TBD'}</div>
                  <div><strong>Date:</strong> {new Date(eventData.date).toLocaleDateString()}</div>
                  <div><strong>Time:</strong> {eventData.startTime} - {eventData.endTime}</div>
                  <div><strong>Capacity:</strong> {eventData.capacity}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods Management */}
          <Card className="shadow-lg border-2 border-green-100">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Saved Payment Methods */}
              {savedPaymentMethods && savedPaymentMethods.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-lg mb-4">Saved Payment Methods</h4>
                  <div className="space-y-3">
                    {savedPaymentMethods.map((method) => (
                      <div key={method._id || Math.random()} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faCreditCard} className="text-blue-600 mr-3" />
                          <div>
                            <p className="font-medium">{method.cardName}</p>
                            <p className="text-sm text-gray-600">
                              **** **** **** {method.cardNumber ? method.cardNumber.slice(-4) : '****'} • {method.expiryMonth}/{method.expiryYear}
                            </p>
                            {method.isDefault && (
                              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {!method.isDefault && method._id && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSetDefaultPayment(method._id)}
                              className="text-green-600 border-green-300 hover:bg-green-50"
                            >
                              <FontAwesomeIcon icon={faCheck} className="h-3 w-3 mr-1" />
                              Set Default
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditPaymentMethod(method)}
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            <FontAwesomeIcon icon={faEdit} className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          {method._id && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeletePaymentMethod(method._id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              <FontAwesomeIcon icon={faTrashAlt} className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add/Edit Payment Method Form */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-lg">
                    {isEditingPayment ? 'Edit Payment Method' : 'Add New Payment Method'}
                  </h4>
                  {isEditingPayment && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetPaymentForm}
                      className="text-gray-600 border-gray-300 hover:bg-gray-50"
                    >
                      <FontAwesomeIcon icon={faTimes} className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardName" className="text-sm font-medium text-gray-700">
                        Cardholder Name <span className="text-gray-500">(Optional)</span>
                      </Label>
                      <Input
                        id="cardName"
                        value={formData.cardName}
                        onChange={(e) => handleInputChange('cardName', e.target.value)}
                        className={`h-12 focus:border-blue-500 focus:ring-blue-500 ${
                          validationErrors.cardName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter cardholder name (letters and dots only)"
                        onKeyPress={(e) => {
                          if (!/^[a-zA-Z\s.]$/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                      {validationErrors.cardName && (
                        <p className="text-red-500 text-sm">{validationErrors.cardName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber" className="text-sm font-medium text-gray-700">
                        Card Number <span className="text-gray-500">(Optional)</span>
                      </Label>
                      <Input
                        id="cardNumber"
                        value={formData.cardNumber}
                        onChange={(e) => handleInputChange('cardNumber', e.target.value.replace(/\D/g, '').slice(0, 16))}
                        className={`h-12 focus:border-blue-500 focus:ring-blue-500 ${
                          validationErrors.cardNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="1234567890123456 (16 digits)"
                        maxLength="16"
                        onKeyPress={(e) => {
                          if (!/^[0-9]$/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                      {validationErrors.cardNumber && (
                        <p className="text-red-500 text-sm">{validationErrors.cardNumber}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryMonth" className="text-sm font-medium text-gray-700">
                        Month <span className="text-gray-500">(Optional)</span>
                      </Label>
                      <Select value={formData.expiryMonth} onValueChange={(value) => handleInputChange('expiryMonth', value)}>
                        <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="MM" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map(month => (
                            <SelectItem key={month} value={month}>{month}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiryYear" className="text-sm font-medium text-gray-700">
                        Year <span className="text-gray-500">(Optional)</span>
                      </Label>
                      <Select value={formData.expiryYear} onValueChange={(value) => handleInputChange('expiryYear', value)}>
                        <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="YYYY" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv" className="text-sm font-medium text-gray-700">
                        CVV <span className="text-gray-500">(Optional)</span>
                      </Label>
                      <Input
                        id="cvv"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 3))}
                        className={`h-12 focus:border-blue-500 focus:ring-blue-500 ${
                          validationErrors.cvv ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="123 (3 digits)"
                        maxLength="3"
                        onKeyPress={(e) => {
                          if (!/^[0-9]$/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                      {validationErrors.cvv && (
                        <p className="text-red-500 text-sm">{validationErrors.cvv}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <p className="text-sm text-gray-600">
                      💡 <strong>Note:</strong> Payment details are optional. You can register without filling this form.
                    </p>
                    <Button
                      type="button"
                      onClick={isEditingPayment ? handleUpdatePaymentMethod : handleSavePaymentMethod}
                      disabled={!formData.cardName || !formData.cardNumber || !formData.expiryMonth || !formData.expiryYear}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FontAwesomeIcon icon={isEditingPayment ? faSave : faPlus} className="h-4 w-4 mr-2" />
                      {isEditingPayment ? 'Update Payment Method' : 'Save Payment Method'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card className="shadow-lg border-2 border-purple-100">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                Additional Options
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border">
                  <Checkbox
                    id="savePaymentInfo"
                    checked={formData.savePaymentInfo}
                    onCheckedChange={(checked) => handleInputChange('savePaymentInfo', checked)}
                    className="border-gray-400"
                  />
                  <Label htmlFor="savePaymentInfo" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Save payment information for future use
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border">
                  <Checkbox
                    id="createAccount"
                    checked={formData.createAccount}
                    onCheckedChange={(checked) => handleInputChange('createAccount', checked)}
                    className="border-gray-400"
                  />
                  <Label htmlFor="createAccount" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Create an account for faster checkout next time
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked)}
                    className="border-gray-400"
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm font-medium text-gray-700 cursor-pointer">
                    I agree to the terms and conditions <span className="text-red-500">*</span>
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg border-2 border-orange-100 sticky top-4">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">4</span>
                </div>
                Event Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{eventData.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Participant:</span>
                      <span className="font-medium">{registrationData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{registrationData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{registrationData.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{new Date(eventData.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{eventData.startTime} - {eventData.endTime}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t-2 border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Registration Fee</span>
                    <span className="font-semibold text-gray-800">
                      Rs. {eventData?.registrationFee ? eventData.registrationFee.toFixed(2) : '200.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-green-50 rounded-lg px-4">
                    <span className="font-bold text-xl text-gray-800">Total</span>
                    <span className="font-bold text-2xl text-green-600">
                      Rs. {eventData?.registrationFee ? eventData.registrationFee.toFixed(2) : '200.00'}
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-lg rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" 
                    disabled={loading || !formData.agreeToTerms}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing Payment...
                      </div>
                    ) : (
                      'Complete Registration'
                    )}
                  </Button>
                  {!formData.agreeToTerms && (
                    <p className="text-sm text-red-500 mt-2 text-center">
                      Please agree to the terms and conditions
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default EventPaymentPage;
