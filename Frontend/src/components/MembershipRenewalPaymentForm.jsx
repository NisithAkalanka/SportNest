import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faLock, faCheckCircle, faExclamationTriangle, faPlus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const MembershipRenewalPaymentForm = ({ 
  membershipData, 
  onPaymentSuccess, 
  onPaymentError,
  onCancel 
}) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isAddingNewCard, setIsAddingNewCard] = useState(false);
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

  // Plan prices
  const planPrices = {
    'Student Membership': 20000,
    'Ordinary Membership': 60000,
    'Life Membership': 100000
  };

  const selectedPlanPrice = planPrices[membershipData?.newPlan] || 0;

  // Load saved payment methods
  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('userInfo') ? 
        JSON.parse(localStorage.getItem('userInfo')).token : 
        JSON.parse(localStorage.getItem('adminInfo'))?.token;

      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const api = axios.create({
        baseURL: 'http://localhost:5002/api',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await api.get('/payment-methods');
      setPaymentMethods(response.data.paymentMethods || []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  // Validation functions
  const validateCardNumber = (cardNumber) => {
    const cleaned = cardNumber.replace(/\D/g, '');
    return cleaned.length >= 13 && cleaned.length <= 19;
  };

  const validateExpiry = (month, year) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    const expiryYear = parseInt(year);
    const expiryMonth = parseInt(month);
    
    if (expiryYear < currentYear) return false;
    if (expiryYear === currentYear && expiryMonth < currentMonth) return false;
    return true;
  };

  const validateCVC = (cvc) => {
    return /^\d{3,4}$/.test(cvc);
  };

  const validateForm = () => {
    const errors = {};

    if (isAddingNewCard) {
      if (!paymentForm.cardName.trim()) {
        errors.cardName = 'Cardholder name is required';
      }
      if (!validateCardNumber(paymentForm.cardNumber)) {
        errors.cardNumber = 'Please enter a valid card number';
      }
      if (!paymentForm.expiryMonth || !paymentForm.expiryYear) {
        errors.expiry = 'Please select expiry date';
      } else if (!validateExpiry(paymentForm.expiryMonth, paymentForm.expiryYear)) {
        errors.expiry = 'Card has expired';
      }
      if (!validateCVC(paymentForm.cvc)) {
        errors.cvc = 'Please enter a valid CVC';
      }
    } else {
      if (!selectedPaymentMethod) {
        errors.paymentMethod = 'Please select a payment method';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
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

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.slice(0, 19); // Max 16 digits + 3 spaces
  };

  const handleCardNumberChange = (value) => {
    const formatted = formatCardNumber(value);
    handleInputChange('cardNumber', formatted);
  };

  const addNewPaymentMethod = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('userInfo') ? 
        JSON.parse(localStorage.getItem('userInfo')).token : 
        JSON.parse(localStorage.getItem('adminInfo'))?.token;

      const api = axios.create({
        baseURL: 'http://localhost:5002/api',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const paymentData = {
        cardName: paymentForm.cardName,
        cardNumber: paymentForm.cardNumber.replace(/\s/g, ''),
        expiryMonth: paymentForm.expiryMonth,
        expiryYear: paymentForm.expiryYear,
        cvc: paymentForm.cvc,
        saveCard: paymentForm.saveCard
      };

      const response = await api.post('/payment-methods', paymentData);
      
      if (paymentForm.saveCard) {
        setPaymentMethods(prev => [...prev, response.data.paymentMethod]);
        setSelectedPaymentMethod(response.data.paymentMethod.id);
      }
      
      setIsAddingNewCard(false);
      setPaymentForm({
        cardName: '',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvc: '',
        saveCard: false
      });
      
    } catch (error) {
      console.error('Error adding payment method:', error);
      onPaymentError?.('Failed to add payment method. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('userInfo') ? 
        JSON.parse(localStorage.getItem('userInfo')).token : 
        JSON.parse(localStorage.getItem('adminInfo'))?.token;

      const api = axios.create({
        baseURL: 'http://localhost:5002/api',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let paymentMethodData;
      
      if (isAddingNewCard) {
        // Use new card data
        paymentMethodData = {
          cardName: paymentForm.cardName,
          cardNumber: paymentForm.cardNumber.replace(/\s/g, ''),
          expiryMonth: paymentForm.expiryMonth,
          expiryYear: paymentForm.expiryYear,
          cvc: paymentForm.cvc
        };
      } else {
        // Use selected saved payment method
        const selectedMethod = paymentMethods.find(pm => pm.id === selectedPaymentMethod);
        paymentMethodData = selectedMethod;
      }

      const paymentData = {
        membershipId: membershipData.membershipId,
        currentPlan: membershipData.currentPlan,
        newPlan: membershipData.newPlan,
        amount: selectedPlanPrice,
        paymentMethod: paymentMethodData,
        memberDetails: {
          fullName: membershipData.fullName,
          email: membershipData.email
        }
      };

      console.log('Sending payment data:', paymentData);
      const response = await api.post('/members/process-renewal-payment', paymentData);
      console.log('Payment response:', response.data);
      
      onPaymentSuccess?.(response.data);
      
    } catch (error) {
      console.error('Payment processing failed:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        onPaymentError?.('Session expired. Please log in again.');
      } else if (error.response?.status === 400) {
        onPaymentError?.(error.response?.data?.message || 'Invalid payment data. Please check your information.');
      } else if (error.response?.status === 404) {
        onPaymentError?.('Member not found. Please contact support.');
      } else if (error.response?.status === 500) {
        onPaymentError?.('Server error. Please try again later.');
      } else {
        onPaymentError?.(error.response?.data?.message || 'Payment failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return { value: month.toString().padStart(2, '0'), label: month.toString().padStart(2, '0') };
  });

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() + i;
    return { value: year.toString(), label: year.toString() };
  });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Membership Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
            Membership Renewal Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-600">Membership ID</Label>
                <p className="text-lg font-semibold">{membershipData?.membershipId}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Member Name</Label>
                <p className="text-lg">{membershipData?.fullName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Email</Label>
                <p className="text-lg">{membershipData?.email}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-600">Current Plan</Label>
                <p className="text-lg">{membershipData?.currentPlan}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">New Plan</Label>
                <p className="text-lg font-semibold text-green-600">{membershipData?.newPlan}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Amount to Pay</Label>
                <p className="text-2xl font-bold text-green-600">Rs. {selectedPlanPrice.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FontAwesomeIcon icon={faCreditCard} className="text-blue-600" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Saved Payment Methods */}
          {paymentMethods.length > 0 && !isAddingNewCard && (
            <div className="space-y-4">
              <Label className="text-sm font-medium">Select Payment Method</Label>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPaymentMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faCreditCard} className="text-gray-400" />
                        <div>
                          <p className="font-medium">**** **** **** {method.lastFourDigits}</p>
                          <p className="text-sm text-gray-600">{method.cardName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{method.expiryMonth}/{method.expiryYear}</span>
                        {selectedPaymentMethod === method.id && (
                          <FontAwesomeIcon icon={faCheckCircle} className="text-blue-600" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {validationErrors.paymentMethod && (
                <p className="text-red-500 text-sm">{validationErrors.paymentMethod}</p>
              )}
            </div>
          )}

          {/* Add New Card Option */}
          {!isAddingNewCard && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddingNewCard(true)}
              className="w-full"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add New Payment Method
            </Button>
          )}

          {/* New Card Form */}
          {isAddingNewCard && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Add New Card</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAddingNewCard(false);
                    setPaymentForm({
                      cardName: '',
                      cardNumber: '',
                      expiryMonth: '',
                      expiryYear: '',
                      cvc: '',
                      saveCard: false
                    });
                    setValidationErrors({});
                  }}
                >
                  Cancel
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    value={paymentForm.cardName}
                    onChange={(e) => handleInputChange('cardName', e.target.value)}
                    placeholder="Enter cardholder name"
                    className={validationErrors.cardName ? 'border-red-500' : ''}
                  />
                  {validationErrors.cardName && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.cardName}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={paymentForm.cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className={validationErrors.cardNumber ? 'border-red-500' : ''}
                  />
                  {validationErrors.cardNumber && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.cardNumber}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="expiryMonth">Expiry Month</Label>
                  <Select
                    value={paymentForm.expiryMonth}
                    onValueChange={(value) => handleInputChange('expiryMonth', value)}
                  >
                    <SelectTrigger className={validationErrors.expiry ? 'border-red-500' : ''}>
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="expiryYear">Expiry Year</Label>
                  <Select
                    value={paymentForm.expiryYear}
                    onValueChange={(value) => handleInputChange('expiryYear', value)}
                  >
                    <SelectTrigger className={validationErrors.expiry ? 'border-red-500' : ''}>
                      <SelectValue placeholder="YYYY" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    value={paymentForm.cvc}
                    onChange={(e) => handleInputChange('cvc', e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    maxLength={4}
                    className={validationErrors.cvc ? 'border-red-500' : ''}
                  />
                  {validationErrors.cvc && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.cvc}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="saveCard"
                      checked={paymentForm.saveCard}
                      onChange={(e) => handleInputChange('saveCard', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="saveCard" className="text-sm">
                      Save this card for future payments
                    </Label>
                  </div>
                </div>
              </div>

            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faLock} className="text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">Secure Payment</p>
              <p className="text-xs text-green-600">
                Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={processPayment}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing Payment...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
              Pay Rs. {selectedPlanPrice.toLocaleString()}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default MembershipRenewalPaymentForm;
