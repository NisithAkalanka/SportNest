import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const ShippingPage = () => {
  const navigate = useNavigate();
  
  // Add error boundary for cart context
  let cartItems = [];
  let cartItemCount = 0;
  let isLoading = true;
  let fetchCart = () => {};
  
  try {
    const cartContext = useCart();
    cartItems = cartContext.cartItems || [];
    cartItemCount = cartContext.cartItemCount || 0;
    isLoading = cartContext.isLoading || false;
    fetchCart = cartContext.fetchCart || (() => {});
  } catch (error) {
    console.error("Error accessing cart context:", error);
    // Fallback values
  }
  
  const [formData, setFormData] = useState({
    // Billing Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    province: 'Western Province',
    country: 'Sri Lanka',
    
    // Shipping Information
    shipToDifferentAddress: false,
    shippingFirstName: '',
    shippingLastName: '',
    shippingAddress: '',
    shippingCity: '',
    shippingPostalCode: '',
    shippingProvince: 'Western Province',
    shippingCountry: 'Sri Lanka',
    
    // Account Creation
    createAccount: false
  });

  const [loading, setLoading] = useState(false);
  const [savedBillingData, setSavedBillingData] = useState(null);
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Calculate total amount
  const totalAmount = cartItems.reduce((total, item) => {
    return total + (item.item?.price || 0) * item.quantity;
  }, 0);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItemCount === 0) {
      navigate('/cart');
    }
  }, [cartItemCount, navigate]);

  // Validation functions
  const validateFirstName = (name) => {
    const lettersOnlyRegex = /^[a-zA-Z\s]+$/;
    if (!name || name.trim() === '') {
      return 'First name is required';
    }
    if (!lettersOnlyRegex.test(name)) {
      return 'First name can only contain letters and spaces';
    }
    return '';
  };

  const validateLastName = (name) => {
    const lettersOnlyRegex = /^[a-zA-Z\s]+$/;
    if (!name || name.trim() === '') {
      return 'Last name is required';
    }
    if (!lettersOnlyRegex.test(name)) {
      return 'Last name can only contain letters and spaces';
    }
    return '';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9.@]+$/;
    if (!email || email.trim() === '') {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Email can only contain letters, numbers, @ and .';
    }
    if (!email.includes('@') || !email.includes('.')) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validateAddress = (address) => {
    if (!address || address.trim() === '') {
      return 'Address is required';
    }
    if (address.length > 150) {
      return 'Address must be 150 characters or less';
    }
    return '';
  };

  const validateCity = (city) => {
    const lettersOnlyRegex = /^[a-zA-Z\s]+$/;
    if (!city || city.trim() === '') {
      return 'City is required';
    }
    if (!lettersOnlyRegex.test(city)) {
      return 'City can only contain letters and spaces';
    }
    return '';
  };

  const validatePostalCode = (postalCode) => {
    if (!postalCode || postalCode.trim() === '') {
      return 'Postal code is required';
    }
    if (!/^[0-9]+$/.test(postalCode)) {
      return 'Postal code can only contain numbers';
    }
    if (postalCode.length !== 4) {
      return 'Postal code must be exactly 4 digits';
    }
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone || phone.trim() === '') {
      return 'Phone number is required';
    }
    if (!/^[0-9]+$/.test(phone)) {
      return 'Phone number can only contain numbers';
    }
    if (phone.length !== 10) {
      return 'Phone number must be exactly 10 digits';
    }
    return '';
  };

  // Validate all billing fields
  const validateBillingForm = () => {
    const errors = {};
    
    errors.firstName = validateFirstName(formData.firstName);
    errors.lastName = validateLastName(formData.lastName);
    errors.email = validateEmail(formData.email);
    errors.address = validateAddress(formData.address);
    errors.city = validateCity(formData.city);
    errors.postalCode = validatePostalCode(formData.postalCode);
    errors.phone = validatePhone(formData.phone);
    
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

  const handleSaveBillingData = () => {
    // Validate form before saving
    if (!validateBillingForm()) {
      alert('Please fix all validation errors before saving');
      return;
    }

    const billingData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      postalCode: formData.postalCode,
      province: formData.province,
      country: formData.country
    };
    
    setSavedBillingData(billingData);
    setIsEditingBilling(false);
    setValidationErrors({});
    alert('Billing information saved successfully!');
  };

  const handleEditBillingData = () => {
    setIsEditingBilling(true);
    if (savedBillingData) {
      setFormData(prev => ({
        ...prev,
        firstName: savedBillingData.firstName,
        lastName: savedBillingData.lastName,
        email: savedBillingData.email,
        phone: savedBillingData.phone,
        address: savedBillingData.address,
        city: savedBillingData.city,
        postalCode: savedBillingData.postalCode,
        province: savedBillingData.province,
        country: savedBillingData.country
      }));
    }
  };

  const handleDeleteBillingData = () => {
    if (window.confirm("Are you sure you want to delete the saved billing information?")) {
      setSavedBillingData(null);
      setIsEditingBilling(false);
      // Reset form data
      setFormData(prev => ({
        ...prev,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        province: 'Western Province',
        country: 'Sri Lanka'
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Navigate to payment page with billing data
      navigate('/payment', { 
        state: { 
          billingData: savedBillingData || {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            province: formData.province,
            country: formData.country
          }
        } 
      });
      
    } catch (error) {
      console.error('Navigation failed:', error);
      alert('Failed to proceed to payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const provinces = [
    'Western Province',
    'Central Province', 
    'Southern Province',
    'Northern Province',
    'Eastern Province',
    'North Western Province',
    'North Central Province',
    'Uva Province',
    'Sabaragamuwa Province'
  ];

  // Show loading state while cart is being fetched
  if (isLoading) {
    return (
      <div className="container mx-auto p-8 max-w-6xl">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  // Debug information (remove in production)
  console.log('ShippingPage Debug:', { cartItems, cartItemCount, isLoading });

  if (cartItemCount === 0) {
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
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <span className="ml-3 text-sm font-bold text-blue-600">Shipping</span>
          </div>
          <div className="w-20 h-1 bg-gray-300 rounded-full"></div>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-500">3</div>
            <span className="ml-3 text-sm text-gray-500">Payment</span>
          </div>
        </div>
      </div>

      <h1 className="text-4xl font-bold text-center mb-10">Shipping Information</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Billing Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Billing Information */}
          <Card className="shadow-lg border-2 border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    Billing Details
                  </CardTitle>
                  <p className="text-gray-600 mt-1">Enter your billing information</p>
                </div>
                {savedBillingData && !isEditingBilling && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleEditBillingData}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <FontAwesomeIcon icon={faEdit} className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleDeleteBillingData}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <FontAwesomeIcon icon={faTrashAlt} className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {savedBillingData && !isEditingBilling ? (
                // Show saved billing data
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center mb-4">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <h3 className="font-semibold text-green-800 text-lg">Billing Information Saved</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white p-3 rounded border">
                      <span className="text-gray-500 block text-xs uppercase tracking-wide">Full Name</span>
                      <span className="font-medium text-gray-800">{savedBillingData.firstName} {savedBillingData.lastName}</span>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <span className="text-gray-500 block text-xs uppercase tracking-wide">Email</span>
                      <span className="font-medium text-gray-800">{savedBillingData.email}</span>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <span className="text-gray-500 block text-xs uppercase tracking-wide">Phone</span>
                      <span className="font-medium text-gray-800">{savedBillingData.phone}</span>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <span className="text-gray-500 block text-xs uppercase tracking-wide">Country</span>
                      <span className="font-medium text-gray-800">{savedBillingData.country}</span>
                    </div>
                    <div className="bg-white p-3 rounded border md:col-span-2">
                      <span className="text-gray-500 block text-xs uppercase tracking-wide">Address</span>
                      <span className="font-medium text-gray-800">{savedBillingData.address}</span>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <span className="text-gray-500 block text-xs uppercase tracking-wide">City</span>
                      <span className="font-medium text-gray-800">{savedBillingData.city}</span>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <span className="text-gray-500 block text-xs uppercase tracking-wide">Province</span>
                      <span className="font-medium text-gray-800">{savedBillingData.province}</span>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <span className="text-gray-500 block text-xs uppercase tracking-wide">Postal Code</span>
                      <span className="font-medium text-gray-800">{savedBillingData.postalCode}</span>
                    </div>
                  </div>
                </div>
              ) : (
                // Show billing form
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                        First name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                        className={`h-12 focus:border-blue-500 focus:ring-blue-500 ${
                          validationErrors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your first name (letters only)"
                        onKeyPress={(e) => {
                          if (!/^[a-zA-Z\s]$/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                      {validationErrors.firstName && (
                        <p className="text-red-500 text-sm">{validationErrors.firstName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                        Last name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        required
                        className={`h-12 focus:border-blue-500 focus:ring-blue-500 ${
                          validationErrors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your last name (letters only)"
                        onKeyPress={(e) => {
                          if (!/^[a-zA-Z\s]$/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                      {validationErrors.lastName && (
                        <p className="text-red-500 text-sm">{validationErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className={`h-12 focus:border-blue-500 focus:ring-blue-500 ${
                        validationErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email address (letters, @ and . only)"
                      onKeyPress={(e) => {
                        if (!/^[a-zA-Z0-9.@]$/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                    {validationErrors.email && (
                      <p className="text-red-500 text-sm">{validationErrors.email}</p>
                    )}
                  </div>


                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                      Country <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      required
                      className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter your country"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                      Street address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="address"
                      placeholder="House number and street name (max 150 characters)"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value.slice(0, 150))}
                      required
                      className={`h-12 focus:border-blue-500 focus:ring-blue-500 ${
                        validationErrors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      maxLength="150"
                    />
                    {validationErrors.address && (
                      <p className="text-red-500 text-sm">{validationErrors.address}</p>
                    )}
                    <p className="text-xs text-gray-500">{formData.address.length}/150 characters</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                        Town / City <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        required
                        className={`h-12 focus:border-blue-500 focus:ring-blue-500 ${
                          validationErrors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your city (letters only)"
                        onKeyPress={(e) => {
                          if (!/^[a-zA-Z\s]$/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                      {validationErrors.city && (
                        <p className="text-red-500 text-sm">{validationErrors.city}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="province" className="text-sm font-medium text-gray-700">
                        Province <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.province} onValueChange={(value) => handleInputChange('province', value)}>
                        <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {provinces.map(province => (
                            <SelectItem key={province} value={province}>{province}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">
                        Postcode / ZIP <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value.replace(/\D/g, '').slice(0, 4))}
                        required
                        className={`h-12 focus:border-blue-500 focus:ring-blue-500 ${
                          validationErrors.postalCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter postal code (4 digits)"
                        maxLength="4"
                        onKeyPress={(e) => {
                          if (!/^[0-9]$/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                      {validationErrors.postalCode && (
                        <p className="text-red-500 text-sm">{validationErrors.postalCode}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      required
                      className={`h-12 focus:border-blue-500 focus:ring-blue-500 ${
                        validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your phone number (10 digits)"
                      maxLength="10"
                      onKeyPress={(e) => {
                        if (!/^[0-9]$/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                    {validationErrors.phone && (
                      <p className="text-red-500 text-sm">{validationErrors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-4">
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
                        id="shipToDifferentAddress"
                        checked={formData.shipToDifferentAddress}
                        onCheckedChange={(checked) => handleInputChange('shipToDifferentAddress', checked)}
                        className="border-gray-400"
                      />
                      <Label htmlFor="shipToDifferentAddress" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Ship to a different address
                      </Label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    {isEditingBilling && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditingBilling(false);
                          setValidationErrors({});
                        }}
                        className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={handleSaveBillingData}
                      disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.postalCode}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isEditingBilling ? 'Update Billing Info' : 'Save Billing Info'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Information (Conditional) */}
          {formData.shipToDifferentAddress && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shippingFirstName">First name *</Label>
                    <Input
                      id="shippingFirstName"
                      value={formData.shippingFirstName}
                      onChange={(e) => handleInputChange('shippingFirstName', e.target.value)}
                      required={formData.shipToDifferentAddress}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shippingLastName">Last name *</Label>
                    <Input
                      id="shippingLastName"
                      value={formData.shippingLastName}
                      onChange={(e) => handleInputChange('shippingLastName', e.target.value)}
                      required={formData.shipToDifferentAddress}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="shippingAddress">Street address *</Label>
                  <Input
                    id="shippingAddress"
                    placeholder="House number and street name"
                    value={formData.shippingAddress}
                    onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                    required={formData.shipToDifferentAddress}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="shippingCity">Town / City *</Label>
                    <Input
                      id="shippingCity"
                      value={formData.shippingCity}
                      onChange={(e) => handleInputChange('shippingCity', e.target.value)}
                      required={formData.shipToDifferentAddress}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shippingProvince">Province *</Label>
                    <Select value={formData.shippingProvince} onValueChange={(value) => handleInputChange('shippingProvince', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map(province => (
                          <SelectItem key={province} value={province}>{province}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="shippingPostalCode">Postcode / ZIP *</Label>
                    <Input
                      id="shippingPostalCode"
                      value={formData.shippingPostalCode}
                      onChange={(e) => handleInputChange('shippingPostalCode', e.target.value)}
                      required={formData.shipToDifferentAddress}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="shippingCountry">Country *</Label>
                  <Input
                    id="shippingCountry"
                    value={formData.shippingCountry}
                    onChange={(e) => handleInputChange('shippingCountry', e.target.value)}
                    required={formData.shipToDifferentAddress}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg border-2 border-green-100 sticky top-4">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                Your Order
              </CardTitle>
              <p className="text-gray-600 mt-1">Review your items</p>
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
                    <span className="font-semibold text-gray-800">Rs. {totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-blue-50 rounded-lg px-4">
                    <span className="font-bold text-xl text-gray-800">Total</span>
                    <span className="font-bold text-2xl text-blue-600">Rs. {totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" 
                    disabled={loading || !savedBillingData}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing Order...
                      </div>
                    ) : (
                      'Place Order'
                    )}
                  </Button>
                  {!savedBillingData && (
                    <p className="text-sm text-red-500 mt-2 text-center">
                      Please save your billing information first
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

export default ShippingPage;
