import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt, faPlus, faLock, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, cartItemCount, fetchCart } = useCart();
  
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [savedBillingData, setSavedBillingData] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    cardName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    saveCard: false
  });

  const [validationErrors, setValidationErrors] = useState({
    cardName: '',
    cardNumber: '',
    cvc: ''
  });

  // Calculate total amount
  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.item?.price || 0) * item.quantity;
  }, 0);
  
  // Shipping cost calculation
  const shippingCost = subtotal > 5000 ? 0 : 500; // Free shipping over Rs. 5000, otherwise Rs. 500
  const totalAmount = subtotal + shippingCost;

  // Redirect if cart is empty or no billing data
  useEffect(() => {
    if (cartItemCount === 0) {
      navigate('/cart');
    }
    if (location.state?.billingData) {
      setSavedBillingData(location.state.billingData);
    }
  }, [cartItemCount, navigate, location.state]);

  const handleInputChange = (field, value) => {
    let processedValue = value;
    let error = '';

    // Validate card name - only letters, spaces, and common name characters
    if (field === 'cardName') {
      const lettersOnlyRegex = /^[a-zA-Z\s.'-]*$/;
      if (value && !lettersOnlyRegex.test(value)) {
        error = 'Name can only contain letters, spaces, periods, apostrophes, and hyphens';
      } else {
        error = '';
      }
    }

    // Validate card number - only digits, max 16 digits
    if (field === 'cardNumber') {
      const digitsOnly = value.replace(/\D/g, ''); // Remove non-digits
      if (digitsOnly.length > 16) {
        processedValue = digitsOnly.slice(0, 16);
      } else {
        processedValue = digitsOnly;
      }
      
      if (processedValue && processedValue.length !== 16) {
        error = 'Card number must be exactly 16 digits';
      } else {
        error = '';
      }
    }

    // Validate CVC - only digits, max 3 digits
    if (field === 'cvc') {
      const digitsOnly = value.replace(/\D/g, ''); // Remove non-digits
      if (digitsOnly.length > 3) {
        processedValue = digitsOnly.slice(0, 3);
      } else {
        processedValue = digitsOnly;
      }
      
      if (processedValue && processedValue.length !== 3) {
        error = 'CVC must be exactly 3 digits';
      } else {
        error = '';
      }
    }

    // Update validation errors
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));

    // Update form data
    setPaymentForm(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };

  const handleAddPaymentMethod = () => {
    // Check for validation errors
    if (validationErrors.cardName || validationErrors.cardNumber || validationErrors.cvc) {
      alert('Please fix the validation errors before proceeding');
      return;
    }

    if (!paymentForm.cardName || !paymentForm.cardNumber || !paymentForm.expiryMonth || !paymentForm.expiryYear || !paymentForm.cvc) {
      alert('Please fill in all required fields');
      return;
    }

    // Additional validation for exact lengths
    if (paymentForm.cardNumber.length !== 16) {
      alert('Card number must be exactly 16 digits');
      return;
    }

    if (paymentForm.cvc.length !== 3) {
      alert('CVC must be exactly 3 digits');
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
    setValidationErrors({
      cardName: '',
      cardNumber: '',
      cvc: ''
    });
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
    // Check for validation errors
    if (validationErrors.cardName || validationErrors.cardNumber || validationErrors.cvc) {
      alert('Please fix the validation errors before proceeding');
      return;
    }

    if (!paymentForm.cardName || !paymentForm.cardNumber || !paymentForm.expiryMonth || !paymentForm.expiryYear || !paymentForm.cvc) {
      alert('Please fill in all required fields');
      return;
    }

    // Additional validation for exact lengths
    if (paymentForm.cardNumber.length !== 16) {
      alert('Card number must be exactly 16 digits');
      return;
    }

    if (paymentForm.cvc.length !== 3) {
      alert('CVC must be exactly 3 digits');
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
    setValidationErrors({
      cardName: '',
      cardNumber: '',
      cvc: ''
    });
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

  const handleSetDefaultPayment = (paymentId) => {
    setPaymentMethods(prev => prev.map(p => ({
      ...p,
      isDefault: p.id === paymentId
    })));
    setSelectedPaymentMethod(paymentId);
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
      
      const response = await api.post('/shipping/process', {
        ...savedBillingData,
        paymentMethod: paymentMethods.find(p => p.id === selectedPaymentMethod)
      });
      
      alert('Payment processed successfully!');
      fetchCart();
      navigate('/order-success', { state: { orderId: response.data.orderId } });
      
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

  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return { value: month.toString().padStart(2, '0'), label: month.toString().padStart(2, '0') };
  });

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() + i;
    return { value: year.toString(), label: year.toString() };
  });

  if (cartItemCount === 0 || !savedBillingData) {
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
            <span className="ml-3 text-sm font-medium text-green-600">Cart</span>
          </div>
          <div className="w-20 h-1 bg-green-500 rounded-full"></div>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
              <span className="text-xs">✓</span>
            </div>
            <span className="ml-3 text-sm font-medium text-green-600">Shipping</span>
          </div>
          <div className="w-20 h-1 bg-green-500 rounded-full"></div>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <span className="ml-3 text-sm font-bold text-purple-600">Payment</span>
          </div>
        </div>
      </div>

      <h1 className="text-4xl font-bold text-center mb-10">Payment Information</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Payment Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Payment Methods */}
          <Card className="shadow-lg border-2 border-purple-100">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                      <FontAwesomeIcon icon={faCreditCard} className="text-white text-sm" />
                    </div>
                    Payment Methods
                  </CardTitle>
                  <p className="text-gray-600 mt-1">Manage your payment methods</p>
                </div>
                <Button
                  onClick={() => setIsAddingPayment(true)}
                  className="bg-purple-600 hover:bg-purple-700"
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
                    <div key={payment.id} className={`p-4 rounded-lg border-2 ${selectedPaymentMethod === payment.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={selectedPaymentMethod === payment.id}
                              onChange={() => setSelectedPaymentMethod(payment.id)}
                              className="text-purple-600"
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
                        placeholder="As shown on the card"
                        className={`h-12 ${validationErrors.cardName ? 'border-red-500' : ''}`}
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
                        onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                        placeholder="1234567890123456"
                        className={`h-12 ${validationErrors.cardNumber ? 'border-red-500' : ''}`}
                        maxLength={16}
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
                        <Label htmlFor="cvc">CVC *</Label>
                        <Input
                          id="cvc"
                          value={paymentForm.cvc}
                          onChange={(e) => handleInputChange('cvc', e.target.value)}
                          placeholder="123"
                          className={`h-12 ${validationErrors.cvc ? 'border-red-500' : ''}`}
                          maxLength={3}
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
                          setValidationErrors({
                            cardName: '',
                            cardNumber: '',
                            cvc: ''
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={isEditingPayment ? handleUpdatePaymentMethod : handleAddPaymentMethod}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {isEditingPayment ? 'Update Payment Method' : 'Add Payment Method'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card className="shadow-lg border-2 border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                <FontAwesomeIcon icon={faLock} className="text-blue-600 mr-2" />
                Billing Address
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Name:</strong> {savedBillingData.firstName} {savedBillingData.lastName}</div>
                  <div><strong>Email:</strong> {savedBillingData.email}</div>
                  <div><strong>Phone:</strong> {savedBillingData.phone}</div>
                  <div><strong>Country:</strong> {savedBillingData.country}</div>
                  <div className="md:col-span-2"><strong>Address:</strong> {savedBillingData.address}</div>
                  <div><strong>City:</strong> {savedBillingData.city}</div>
                  <div><strong>Province:</strong> {savedBillingData.province}</div>
                  <div><strong>Postal Code:</strong> {savedBillingData.postalCode}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg border-2 border-green-100 sticky top-4">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                Order Summary
              </CardTitle>
              <p className="text-gray-600 mt-1">Review your order</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{item.item?.name || 'Unknown Item'}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-xs text-gray-500">Rs. {(item.item?.price || 0).toFixed(2)} each</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-800">
                        Rs. {((item.item?.price || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                
                <div className="border-t-2 border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Subtotal ({cartItemCount} items)</span>
                    <span className="font-semibold text-gray-800">Rs. {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-gray-800">
                      {shippingCost === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `Rs. ${shippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  {shippingCost === 0 && (
                    <div className="text-xs text-green-600 text-center py-1">
                      🎉 Free shipping on orders over Rs. 5,000!
                    </div>
                  )}
                  <div className="flex justify-between items-center py-3 bg-purple-50 rounded-lg px-4">
                    <span className="font-bold text-xl text-gray-800">Total</span>
                    <span className="font-bold text-2xl text-purple-600">Rs. {totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleProcessPayment}
                    className="w-full h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-lg rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" 
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

export default PaymentPage;//ori