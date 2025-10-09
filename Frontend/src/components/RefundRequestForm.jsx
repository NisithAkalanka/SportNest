import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faExclamationTriangle, faUndo } from '@fortawesome/free-solid-svg-icons';
import api from '@/api';

const RefundRequestForm = ({ order, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    orderId: order?._id || '',
    items: [],
    reason: '',
    description: '',
    refundMethod: 'original_payment'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const refundReasons = [
    { value: 'defective_item', label: 'Defective Item' },
    { value: 'wrong_item', label: 'Wrong Item Received' },
    { value: 'not_as_described', label: 'Not as Described' },
    { value: 'damaged_during_shipping', label: 'Damaged During Shipping' },
    { value: 'changed_mind', label: 'Changed Mind' },
    { value: 'duplicate_order', label: 'Duplicate Order' },
    { value: 'other', label: 'Other' }
  ];

  const refundMethods = [
    { value: 'original_payment', label: 'Original Payment Method' },
    { value: 'store_credit', label: 'Store Credit' },
    { value: 'bank_transfer', label: 'Bank Transfer' }
  ];

  useEffect(() => {
    if (order && order.items) {
      // Initialize items with default quantities - select all items by default
      const initialItems = order.items.map(item => ({
        itemId: item.item._id,
        itemName: item.item.name,
        maxQuantity: item.quantity,
        quantity: item.quantity,
        price: item.price,
        selected: true
      }));
      setFormData(prev => ({ ...prev, items: initialItems }));
    }
  }, [order]);

  const handleItemQuantityChange = (itemId, newQuantity) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.itemId === itemId
          ? { ...item, quantity: Math.min(Math.max(1, newQuantity), item.maxQuantity) }
          : item
      )
    }));
  };

  const handleItemSelection = (itemId, selected) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.itemId === itemId ? { ...item, selected } : item
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (!formData.reason) {
      setError('Please select a reason for the refund');
      return;
    }

    if (!formData.description.trim()) {
      setError('Please provide a description of the issue');
      return;
    }

    const selectedItems = formData.items.filter(item => item.selected);
    if (selectedItems.length === 0) {
      setError('Please select at least one item to refund');
      return;
    }

    setIsSubmitting(true);

    try {
      const refundData = {
        orderId: formData.orderId,
        items: selectedItems.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity
        })),
        reason: formData.reason,
        description: formData.description,
        refundMethod: formData.refundMethod
      };

      console.log('Submitting refund request:', refundData);
      const response = await api.post('/refunds/request', refundData);
      
      setSuccess('Refund request submitted successfully! Admin will review your request shortly.');
      setShowSuccessMessage(true);
      
      // Call success callback after a short delay
      setTimeout(() => {
        if (onSuccess) onSuccess(response.data.refund);
      }, 3000);

    } catch (err) {
      console.error('Refund request error:', err);
      setError(err.response?.data?.msg || 'Failed to submit refund request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotalRefund = () => {
    return formData.items
      .filter(item => item.selected)
      .reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (!order) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No order selected for refund</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FontAwesomeIcon icon={faUndo} className="text-orange-600" />
          Request Refund from Admin
        </CardTitle>
        <CardDescription>
          Submit a refund request for your order. All orders are eligible for refund requests. Admin will review your request and approve or decline it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Order Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Order ID:</span> {order.orderId}
              </div>
              <div>
                <span className="font-medium">Order Date:</span> {new Date(order.orderDate).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Total Amount:</span> Rs. {order.totalAmount?.toFixed(2)}
              </div>
              <div>
                <span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Items Selection */}
          <div>
            <Label className="text-base font-semibold">Select Items to Refund</Label>
            <div className="mt-3 space-y-3">
              {formData.items.map((item) => (
                <div key={item.itemId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={(e) => handleItemSelection(item.itemId, e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <div>
                        <h4 className="font-medium">{item.itemName}</h4>
                        <p className="text-sm text-gray-500">Price: Rs. {item.price.toFixed(2)}</p>
                      </div>
                    </div>
                    {item.selected && (
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`qty-${item.itemId}`} className="text-sm">Quantity:</Label>
                        <Input
                          id={`qty-${item.itemId}`}
                          type="number"
                          min="1"
                          max={item.maxQuantity}
                          value={item.quantity}
                          onChange={(e) => handleItemQuantityChange(item.itemId, parseInt(e.target.value))}
                          className="w-20"
                        />
                        <span className="text-sm text-gray-500">/ {item.maxQuantity}</span>
                      </div>
                    )}
                  </div>
                  {item.selected && (
                    <div className="mt-2 text-sm text-gray-600">
                      Refund Amount: Rs. {(item.price * item.quantity).toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Refund Reason */}
          <div>
            <Label htmlFor="reason" className="text-base font-semibold">Reason for Refund *</Label>
            <Select value={formData.reason} onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {refundReasons.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-base font-semibold">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Please provide detailed information about the issue..."
              className="mt-2"
              rows={4}
              maxLength={500}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Refund Method */}
          <div>
            <Label htmlFor="refundMethod" className="text-base font-semibold">Preferred Refund Method</Label>
            <Select value={formData.refundMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, refundMethod: value }))}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {refundMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Total Refund Amount */}
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Refund Amount:</span>
              <span className="text-2xl font-bold text-orange-600">
                Rs. {calculateTotalRefund().toFixed(2)}
              </span>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200 flex items-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
              {error}
            </div>
          )}

          {success && showSuccessMessage && (
            <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                <span className="font-semibold">Refund Request Submitted!</span>
              </div>
              <p className="text-sm">{success}</p>
                <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>What happens next?</strong><br />
                  • Admin will review your request in the refund management section<br />
                  • You will receive an email notification about the decision<br />
                  • If approved, refund will be processed within 3-5 business days<br />
                  • All orders are eligible for refund requests
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || showSuccessMessage}
            >
              {showSuccessMessage ? 'Close' : 'Cancel'}
            </Button>
            {!showSuccessMessage && (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {isSubmitting && <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />}
                {isSubmitting ? 'Submitting...' : 'Submit Refund Request'}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RefundRequestForm;
