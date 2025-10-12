import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faUndo, 
  faEye, 
  faCheck, 
  faTimes, 
  faCalendarAlt,
  faDollarSign,
  faUser,
  faExclamationTriangle,
  faFilter,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import api from '@/api';

const RefundManagement = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [processingRefund, setProcessingRefund] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });
  const [stats, setStats] = useState({
    totalRefunds: 0,
    totalRefundAmount: 0,
    statusBreakdown: []
  });

  useEffect(() => {
    fetchRefunds();
    fetchStats();
  }, [filters]);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/refunds?${params.toString()}`);
      setRefunds(response.data.refunds || []);
    } catch (err) {
      setError('Failed to load refund requests');
      console.error('Error fetching refunds:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/refunds/stats/summary');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleApproveRefund = async (refundId) => {
    if (!adminNotes.trim()) {
      alert('Please provide admin notes before approving the refund');
      return;
    }

    if (window.confirm('Are you sure you want to approve this refund request?')) {
      try {
        setProcessingRefund(refundId);
        await api.put(`/refunds/${refundId}/approve`, { adminNotes });
        setShowDetailsModal(false);
        setSelectedRefund(null);
        setAdminNotes('');
        fetchRefunds();
        fetchStats();
        alert('Refund request approved successfully');
      } catch (err) {
        alert(err.response?.data?.msg || 'Failed to approve refund request');
      } finally {
        setProcessingRefund(null);
      }
    }
  };

  const handleRejectRefund = async (refundId) => {
    if (!adminNotes.trim()) {
      alert('Please provide admin notes before rejecting the refund');
      return;
    }

    if (window.confirm('Are you sure you want to reject this refund request?')) {
      try {
        setProcessingRefund(refundId);
        await api.put(`/refunds/${refundId}/reject`, { adminNotes });
        setShowDetailsModal(false);
        setSelectedRefund(null);
        setAdminNotes('');
        fetchRefunds();
        fetchStats();
        alert('Refund request rejected');
      } catch (err) {
        alert(err.response?.data?.msg || 'Failed to reject refund request');
      } finally {
        setProcessingRefund(null);
      }
    }
  };

  const handleCompleteRefund = async (refundId) => {
    if (window.confirm('Are you sure you want to mark this refund as approved?')) {
      try {
        setProcessingRefund(refundId);
        await api.put(`/refunds/${refundId}/complete`);
        setShowDetailsModal(false);
        setSelectedRefund(null);
        fetchRefunds();
        fetchStats();
        alert('Refund marked as approved successfully');
      } catch (err) {
        alert(err.response?.data?.msg || 'Failed to approve refund');
      } finally {
        setProcessingRefund(null);
      }
    }
  };

  const handleViewDetails = (refund) => {
    setSelectedRefund(refund);
    setAdminNotes(refund.adminNotes || '');
    setShowDetailsModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return faCheck;
      case 'rejected':
        return faTimes;
      case 'pending':
        return faExclamationTriangle;
      case 'processing':
        return faSpinner;
      default:
        return faUndo;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 text-orange-600 animate-spin" />
        <span className="ml-2 text-gray-600">Loading refund requests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Refund Management</h1>
          <p className="text-gray-600 mt-1">Manage and process refund requests from customers</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FontAwesomeIcon icon={faUndo} className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Refunds</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRefunds}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FontAwesomeIcon icon={faDollarSign} className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">Rs. {stats.totalRefundAmount?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FontAwesomeIcon icon={faExclamationTriangle} className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.statusBreakdown?.find(s => s._id === 'pending')?.count || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FontAwesomeIcon icon={faCheck} className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.statusBreakdown?.find(s => s._id === 'approved')?.count || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative mt-1">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by refund ID, customer name, or order ID..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refunds List */}
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
            {error}
          </div>
        )}

        {refunds.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FontAwesomeIcon icon={faUndo} className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Refund Requests</h3>
              <p className="text-gray-500">No refund requests found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          refunds.map((refund) => (
            <Card key={refund._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">Refund #{refund.refundId}</h3>
                      <Badge className={getStatusColor(refund.status)}>
                        <FontAwesomeIcon icon={getStatusIcon(refund.status)} className="mr-1" />
                        {refund.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <FontAwesomeIcon icon={faUser} className="mr-2" />
                        {refund.userId?.firstName} {refund.userId?.lastName}
                      </div>
                      <div>
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                        {new Date(refund.requestedDate).toLocaleDateString()}
                      </div>
                      <div>
                        <FontAwesomeIcon icon={faDollarSign} className="mr-2" />
                        Rs. {refund.totalRefundAmount?.toFixed(2)}
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm text-gray-600">
                        <strong>Reason:</strong> {refund.reason?.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Order ID:</strong> {refund.orderId?.orderId}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(refund)}
                    >
                      <FontAwesomeIcon icon={faEye} className="mr-2" />
                      View Details
                    </Button>
                    
                    {refund.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleApproveRefund(refund._id)}
                          disabled={processingRefund === refund._id}
                        >
                          {processingRefund === refund._id ? (
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                          ) : (
                            <FontAwesomeIcon icon={faCheck} className="mr-2" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectRefund(refund._id)}
                          disabled={processingRefund === refund._id}
                        >
                          <FontAwesomeIcon icon={faTimes} className="mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {refund.status === 'approved' && (
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handleCompleteRefund(refund._id)}
                        disabled={processingRefund === refund._id}
                      >
                        {processingRefund === refund._id ? (
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                        ) : (
                          <FontAwesomeIcon icon={faCheck} className="mr-2" />
                        )}
                        Mark Approved
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRefund && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Refund Details - #{selectedRefund.refundId}</CardTitle>
                    <CardDescription>
                      Review the refund request and take appropriate action
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Customer Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Name:</span> {selectedRefund.userId?.firstName} {selectedRefund.userId?.lastName}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {selectedRefund.userId?.email}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {selectedRefund.userId?.phone || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Requested Date:</span> {new Date(selectedRefund.requestedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Information */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Order Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Order ID:</span> {selectedRefund.orderId?.orderId}
                      </div>
                      <div>
                        <span className="font-medium">Order Date:</span> {new Date(selectedRefund.orderId?.orderDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Order Status:</span> {selectedRefund.orderId?.status}
                      </div>
                      <div>
                        <span className="font-medium">Total Amount:</span> Rs. {selectedRefund.orderId?.totalAmount?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Refund Items */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Items for Refund</h3>
                  <div className="space-y-2">
                    {selectedRefund.items?.map((item, index) => (
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
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Refund Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Reason:</span> {selectedRefund.reason?.replace('_', ' ')}
                    </div>
                    <div>
                      <span className="font-medium">Refund Method:</span> {selectedRefund.refundMethod?.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="font-medium">Description:</span>
                    <p className="text-sm text-gray-600 mt-1">{selectedRefund.description}</p>
                  </div>
                </div>

                {/* Total Refund Amount */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Refund Amount:</span>
                    <span className="text-2xl font-bold text-orange-600">
                      Rs. {selectedRefund.totalRefundAmount?.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Admin Notes */}
                <div>
                  <Label htmlFor="adminNotes" className="text-base font-semibold">Admin Notes</Label>
                  <Textarea
                    id="adminNotes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add your notes about this refund request..."
                    className="mt-2"
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                {selectedRefund.status === 'pending' && (
                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <Button
                      variant="destructive"
                      onClick={() => handleRejectRefund(selectedRefund._id)}
                      disabled={processingRefund === selectedRefund._id}
                    >
                      {processingRefund === selectedRefund._id ? (
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                      ) : (
                        <FontAwesomeIcon icon={faTimes} className="mr-2" />
                      )}
                      Reject Refund
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleApproveRefund(selectedRefund._id)}
                      disabled={processingRefund === selectedRefund._id}
                    >
                      {processingRefund === selectedRefund._id ? (
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                      ) : (
                        <FontAwesomeIcon icon={faCheck} className="mr-2" />
                      )}
                      Approve Refund
                    </Button>
                  </div>
                )}

                {selectedRefund.status === 'approved' && (
                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleCompleteRefund(selectedRefund._id)}
                      disabled={processingRefund === selectedRefund._id}
                    >
                      {processingRefund === selectedRefund._id ? (
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                      ) : (
                        <FontAwesomeIcon icon={faCheck} className="mr-2" />
                      )}
                      Mark as Approved
                    </Button>
                  </div>
                )}

                {!['pending', 'approved'].includes(selectedRefund.status) && (
                  <div className="flex justify-end pt-4 border-t">
                    {/* No action buttons for approved/rejected refunds */}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundManagement;
