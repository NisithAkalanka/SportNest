import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faShoppingBag, 
  faUndo, 
  faEye, 
  faCalendarAlt,
  faDollarSign,
  faTruck,
  faCheckCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import api from '@/api';
import RefundRequestForm from './RefundRequestForm';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch orders and refunds in parallel
      const [ordersResponse, refundsResponse] = await Promise.all([
        api.get('/orders/my-orders').catch(() => ({ data: [] })),
        api.get('/refunds/my-refunds').catch(() => ({ data: { refunds: [] } }))
      ]);

      setOrders(ordersResponse.data || []);
      setRefunds(refundsResponse.data?.refunds || []);
    } catch (err) {
      setError('Failed to load order history');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRefund = (order) => {
    setSelectedOrder(order);
    setShowRefundForm(true);
  };


  const handleRefundSuccess = (refund) => {
    setShowRefundForm(false);
    setSelectedOrder(null);
    // Refresh refunds list
    fetchData();
  };

  const handleRefundCancel = () => {
    setShowRefundForm(false);
    setSelectedOrder(null);
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRefundStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 text-orange-600 animate-spin" />
        <span className="ml-2 text-gray-600">Loading order history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <FontAwesomeIcon icon={faExclamationTriangle} className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchData} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'orders'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <FontAwesomeIcon icon={faShoppingBag} className="mr-2" />
          My Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('refunds')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'refunds'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <FontAwesomeIcon icon={faUndo} className="mr-2" />
          Refund Requests ({refunds.length})
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FontAwesomeIcon icon={faShoppingBag} className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Orders Found</h3>
                <p className="text-gray-500">You haven't placed any orders yet.</p>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.orderId}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-400" />
                        {new Date(order.orderDate).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Items Ordered:</h4>
                      <div className="space-y-2">
                        {order.items?.map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                            <div>
                              <span className="font-medium">{item.item?.name || 'Item'}</span>
                              <span className="text-gray-500 ml-2">x{item.quantity}</span>
                            </div>
                            <span className="font-semibold">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Total */}
                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className="text-lg font-semibold">Total Amount:</span>
                      <span className="text-xl font-bold text-orange-600">
                        Rs. {order.totalAmount?.toFixed(2)}
                      </span>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-1">Shipping Address:</h4>
                        <p className="text-sm text-gray-600">
                          {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                          {order.shippingAddress.address}<br />
                          {order.shippingAddress.city}, {order.shippingAddress.province}<br />
                          {order.shippingAddress.country} - {order.shippingAddress.postalCode}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        onClick={() => handleRequestRefund(order)}
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <FontAwesomeIcon icon={faUndo} className="mr-2" />
                        Refund Request
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Refunds Tab */}
      {activeTab === 'refunds' && (
        <div className="space-y-4">
          {refunds.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FontAwesomeIcon icon={faUndo} className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Refund Requests</h3>
                <p className="text-gray-500">You haven't submitted any refund requests yet.</p>
              </CardContent>
            </Card>
          ) : (
            refunds.map((refund) => (
              <Card key={refund._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Refund #{refund.refundId}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-400" />
                        Requested: {new Date(refund.requestedDate).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge className={getRefundStatusColor(refund.status)}>
                      {refund.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Refund Items */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Items for Refund:</h4>
                      <div className="space-y-2">
                        {refund.items?.map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                            <div>
                              <span className="font-medium">{item.item?.name || 'Item'}</span>
                              <span className="text-gray-500 ml-2">x{item.quantity}</span>
                            </div>
                            <span className="font-semibold">Rs. {item.refundAmount?.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Refund Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Reason:</h4>
                        <p className="text-sm text-gray-600 capitalize">
                          {refund.reason?.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Refund Method:</h4>
                        <p className="text-sm text-gray-600 capitalize">
                          {refund.refundMethod?.replace('_', ' ')}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    {refund.description && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Description:</h4>
                        <p className="text-sm text-gray-600">{refund.description}</p>
                      </div>
                    )}

                    {/* Admin Notes */}
                    {refund.adminNotes && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-1">Admin Notes:</h4>
                        <p className="text-sm text-blue-700">{refund.adminNotes}</p>
                      </div>
                    )}

                    {/* Refund Total */}
                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className="text-lg font-semibold">Total Refund Amount:</span>
                      <span className="text-xl font-bold text-green-600">
                        Rs. {refund.totalRefundAmount?.toFixed(2)}
                      </span>
                    </div>

                    {/* Processed Date */}
                    {refund.processedDate && (
                      <div className="text-sm text-gray-500">
                        Processed: {new Date(refund.processedDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Refund Request Form Modal */}
      {showRefundForm && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <RefundRequestForm
              order={selectedOrder}
              onSuccess={handleRefundSuccess}
              onCancel={handleRefundCancel}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderHistory;
