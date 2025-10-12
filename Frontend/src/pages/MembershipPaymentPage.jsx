import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt, faPlus, faLock, faCreditCard, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
//neth
const MembershipPaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { planName, membershipId, planPrice } = location.state || {};

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [paymentForm, setPaymentForm] = useState({
    cardName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    saveCard: false
  });

  // Redirect if no membership data
  useEffect(() => {
    if (!planName || !membershipId) {
      navigate('/membership-plans');
    }
  }, [planName, membershipId, navigate]);

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
    
    errors.cardName = validateCardholderName(paymentForm.cardName);
    errors.cardNumber = validateCardNumber(paymentForm.cardNumber);
    errors.cvc = validateCVV(paymentForm.cvc);
    
    setValidationErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const handleInputChange = (field, value) => {
    setPaymentForm(prev => ({
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

  const handleAddPaymentMethod = () => {
    // Validate form before adding
    if (!validatePaymentForm()) {
      alert('Please fix all validation errors before adding payment method');
      return;
    }

    const newPaymentMethod = {
      id: Date.now().toString(),
      cardName: paymentForm.cardName,
      cardNumber: paymentForm.cardNumber.replace(/\d(?=\d{4})/g, "*"),
      expiryMonth: paymentForm.expiryMonth,
      expiryYear: paymentForm.expiryYear,
      cvc: paymentForm.cvc,
      isDefault: paymentMethods.length === 0
    };

    setPaymentMethods(prev => [...prev, newPaymentMethod]);
    setSelectedPaymentMethod(newPaymentMethod.id);
    setIsAddingPayment(false);
    setPaymentForm({
      cardName: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvc: '',
      saveCard: false
    });
    setValidationErrors({});
    alert('Payment method added successfully!');
  };

  const handleEditPaymentMethod = (paymentId) => {
    const payment = paymentMethods.find(p => p.id === paymentId);
    if (payment) {
      setPaymentForm({
        cardName: payment.cardName,
        cardNumber: payment.cardNumber,
        expiryMonth: payment.expiryMonth,
        expiryYear: payment.expiryYear,
        cvc: payment.cvc,
        saveCard: true
      });
      setIsEditingPayment(true);
      setEditingPaymentId(paymentId);
    }
  };

  const handleUpdatePaymentMethod = () => {
    // Validate form before updating
    if (!validatePaymentForm()) {
      alert('Please fix all validation errors before updating payment method');
      return;
    }

    setPaymentMethods(prev => prev.map(p => 
      p.id === editingPaymentId 
        ? { ...p, cardName: paymentForm.cardName, cardNumber: paymentForm.cardNumber.replace(/\d(?=\d{4})/g, "*"), expiryMonth: paymentForm.expiryMonth, expiryYear: paymentForm.expiryYear, cvc: paymentForm.cvc }
        : p
    ));
    
    setIsEditingPayment(false);
    setEditingPaymentId(null);
    setPaymentForm({
      cardName: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvc: '',
      saveCard: false
    });
    setValidationErrors({});
    alert('Payment method updated successfully!');
  };

  const handleDeletePaymentMethod = (paymentId) => {
    if (window.confirm("Are you sure you want to delete this payment method?")) {
      setPaymentMethods(prev => prev.filter(p => p.id !== paymentId));
      if (selectedPaymentMethod === paymentId) {
        setSelectedPaymentMethod(null);
      }
    }
  };

  const handleProcessPayment = async () => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }

    setLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to continue');
        navigate('/member-login');
        return;
      }

      const api = axios.create({ 
        baseURL: 'http://localhost:5002/api',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Process membership payment
      const response = await api.post('/members/process-membership-payment', {
        membershipId,
        planName,
        planPrice: planPrice || getPlanPrice(planName),
        paymentMethod: paymentMethods.find(p => p.id === selectedPaymentMethod)
      });
      
      alert('Membership payment processed successfully!');
      navigate('/subscription-success', { 
        state: { 
          planName, 
          membershipId,
          paymentCompleted: true 
        } 
      });
      
    } catch (error) {
      console.error('Payment processing failed:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/member-login');
      } else {
        alert(`Payment failed: ${error.response?.data?.msg || 'Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getPlanPrice = (planName) => {
    const prices = {
      'Student Membership': 20000,
      'Ordinary Membership': 60000,
      'Life Membership': 100000,
      'Life Time Membership': 100000
    };
    return prices[planName] || 0;
  };

  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return { value: month.toString().padStart(2, '0'), label: month.toString().padStart(2, '0') };
  });

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() + i;
    return { value: year.toString(), label: year.toString() };
  });

  if (!planName || !membershipId) {
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
            <span className="ml-3 text-sm font-medium text-green-600">Plan Selected</span>
          </div>
          <div className="w-20 h-1 bg-green-500 rounded-full"></div>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
              <span className="text-xs">✓</span>
            </div>
            <span className="ml-3 text-sm font-medium text-green-600">Confirmed</span>
          </div>
          <div className="w-20 h-1 bg-green-500 rounded-full"></div>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <span className="ml-3 text-sm font-bold text-emerald-500">Payment</span>
          </div>
        </div>
      </div>

      <h1 className="text-4xl font-bold text-center mb-10">Membership Payment</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Payment Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Payment Methods */}
          <Card className="shadow-lg border-2 border-emerald-100">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mr-3">
                      <FontAwesomeIcon icon={faCreditCard} className="text-white text-sm" />
                    </div>
                    Payment Methods
                  </CardTitle>
                  <p className="text-gray-600 mt-1">Manage your payment methods</p>
                </div>
                <Button
                  onClick={() => setIsAddingPayment(true)}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  <FontAwesomeIcon icon={faPlus} className="h-3 w-3 mr-1" />
                  Add Payment Method
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {paymentMethods.length === 0 ? (
                <div className="text-center py-8">
                  <FontAwesomeIcon icon={faCreditCard} className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No payment methods added yet</p>
                  <p className="text-sm text-gray-400">Click "Add Payment Method" to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentMethods.map((payment) => (
                    <div key={payment.id} className={`p-4 rounded-lg border-2 ${selectedPaymentMethod === payment.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={selectedPaymentMethod === payment.id}
                              onChange={() => setSelectedPaymentMethod(payment.id)}
                              className="text-emerald-500"
                            />
                            <span className="font-semibold text-gray-800">{payment.cardName}</span>
                            {payment.isDefault && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Default</span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm">**** **** **** {payment.cardNumber.slice(-4)}</p>
                          <p className="text-gray-500 text-xs">Expires: {payment.expiryMonth}/{payment.expiryYear}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditPaymentMethod(payment.id)}
                            className="h-8 w-8 p-0"
                          >
                            <FontAwesomeIcon icon={faEdit} className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeletePaymentMethod(payment.id)}
                            className="h-8 w-8 p-0"
                          >
                            <FontAwesomeIcon icon={faTrashAlt} className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add/Edit Payment Form */}
              {(isAddingPayment || isEditingPayment) && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                  <h3 className="font-semibold mb-4">
                    {isEditingPayment ? 'Edit Payment Method' : 'Add New Payment Method'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardName">Name on Card *</Label>
                      <Input
                        id="cardName"
                        value={paymentForm.cardName}
                        onChange={(e) => handleInputChange('cardName', e.target.value)}
                        placeholder="As shown on the card (letters and dots only)"
                        className={`h-12 ${
                          validationErrors.cardName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        onKeyPress={(e) => {
                          if (!/^[a-zA-Z\s.]$/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                      {validationErrors.cardName && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.cardName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="cardNumber">Card Number *</Label>
                      <Input
                        id="cardNumber"
                        value={paymentForm.cardNumber}
                        onChange={(e) => handleInputChange('cardNumber', e.target.value.replace(/\D/g, '').slice(0, 16))}
                        placeholder="1234567890123456 (16 digits)"
                        className={`h-12 ${
                          validationErrors.cardNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        maxLength="16"
                        onKeyPress={(e) => {
                          if (!/^[0-9]$/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                      {validationErrors.cardNumber && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.cardNumber}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="expiryMonth">Month *</Label>
                        <Select value={paymentForm.expiryMonth} onValueChange={(value) => handleInputChange('expiryMonth', value)}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="MM" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map(month => (
                              <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="expiryYear">Year *</Label>
                        <Select value={paymentForm.expiryYear} onValueChange={(value) => handleInputChange('expiryYear', value)}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="YYYY" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map(year => (
                              <SelectItem key={year.value} value={year.value}>{year.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="cvc">CVV *</Label>
                        <Input
                          id="cvc"
                          value={paymentForm.cvc}
                          onChange={(e) => handleInputChange('cvc', e.target.value.replace(/\D/g, '').slice(0, 3))}
                          placeholder="123 (3 digits only)"
                          className={`h-12 ${
                            validationErrors.cvc ? 'border-red-500' : 'border-gray-300'
                          }`}
                          maxLength="3"
                          onKeyPress={(e) => {
                            if (!/^[0-9]$/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
                        {validationErrors.cvc && (
                          <p className="text-red-500 text-sm mt-1">{validationErrors.cvc}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="saveCard"
                        checked={paymentForm.saveCard}
                        onCheckedChange={(checked) => handleInputChange('saveCard', checked)}
                      />
                      <Label htmlFor="saveCard">Save credit card information for next time</Label>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddingPayment(false);
                          setIsEditingPayment(false);
                          setEditingPaymentId(null);
                          setValidationErrors({});
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={isEditingPayment ? handleUpdatePaymentMethod : handleAddPaymentMethod}
                        className="bg-emerald-500 hover:bg-emerald-600"
                      >
                        {isEditingPayment ? 'Update Payment Method' : 'Add Payment Method'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Membership Summary */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg border-2 border-green-100 sticky top-4">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-white text-sm" />
                </div>
                Membership Summary
              </CardTitle>
              <p className="text-gray-600 mt-1">Review your membership details</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{planName}</h3>
                  <p className="text-sm text-gray-600 mb-2">Membership ID: {membershipId}</p>
                  <p className="text-2xl font-bold text-green-600">
                    Rs. {getPlanPrice(planName).toFixed(2)}
                  </p>
                </div>
                
                <div className="border-t-2 border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Membership Fee</span>
                    <span className="font-semibold text-gray-800">Rs. {getPlanPrice(planName).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Processing Fee</span>
                    <span className="font-semibold text-gray-800">Rs. 0.00</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-emerald-50 rounded-lg px-4">
                    <span className="font-bold text-xl text-gray-800">Total</span>
                    <span className="font-bold text-2xl text-emerald-500">Rs. {getPlanPrice(planName).toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleProcessPayment}
                    className="w-full h-14 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-lg rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" 
                    disabled={loading || !selectedPaymentMethod}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing Payment...
                      </div>
                    ) : (
                      'Complete Payment'
                    )}
                  </Button>
                  {!selectedPaymentMethod && (
                    <p className="text-sm text-red-500 mt-2 text-center">
                      Please select a payment method
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MembershipPaymentPage;
