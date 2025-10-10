import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTruck, FaUser, FaMapMarkerAlt, FaCalendarAlt, FaClock } from 'react-icons/fa';
import api from '@/api';

const DriverConfirmationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchDeliveryDetails();
  }, [token]);

  const fetchDeliveryDetails = async () => {
    try {
      const response = await api.get(`/deliveries/confirmation-status/${token}`);
      setDelivery(response.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load delivery details');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    setConfirming(true);
    try {
      const response = await api.get(`/deliveries/confirm/${token}`);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to confirm delivery');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading delivery details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <FaTruck className="text-6xl text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Delivery Confirmed!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for confirming the delivery. The customer has been notified.
          </p>
          <p className="text-sm text-gray-500">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <FaTruck className="text-6xl text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Delivery Not Found</h1>
          <p className="text-gray-600 mb-6">The delivery details could not be found.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6">
            <div className="flex items-center">
              <FaTruck className="text-3xl mr-4" />
              <div>
                <h1 className="text-2xl font-bold">Delivery Confirmation</h1>
                <p className="text-blue-100">Order ID: {delivery.orderId}</p>
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <FaUser className="mr-2 text-blue-600" />
                  Customer Information
                </h3>
                <p className="text-gray-700"><strong>Name:</strong> {delivery.customer}</p>
                <p className="text-gray-700"><strong>Address:</strong> {delivery.address}</p>
              </div>

              {/* Delivery Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <FaCalendarAlt className="mr-2 text-green-600" />
                  Delivery Information
                </h3>
                <p className="text-gray-700">
                  <strong>Date:</strong> {new Date(delivery.deliveryDate).toLocaleDateString()}
                </p>
                <p className="text-gray-700">
                  <strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    delivery.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                    delivery.status === 'Assigned' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {delivery.status}
                  </span>
                </p>
              </div>
            </div>

            {/* Driver Information */}
            {delivery.driver && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <FaUser className="mr-2 text-blue-600" />
                  Driver Information
                </h3>
                <p className="text-gray-700"><strong>Name:</strong> {delivery.driver.fullName}</p>
                <p className="text-gray-700"><strong>Email:</strong> {delivery.driver.email}</p>
              </div>
            )}

            {/* Confirmation Status */}
            {delivery.driverConfirmed ? (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-500 text-xl mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">Delivery Already Confirmed</h3>
                    <p className="text-green-700">
                      This delivery was confirmed on {new Date(delivery.confirmationDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <FaClock className="text-yellow-500 text-xl mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-800">Pending Confirmation</h3>
                    <p className="text-yellow-700">
                      Please confirm that you have completed this delivery.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            {!delivery.driverConfirmed && (
              <div className="text-center">
                <button
                  onClick={handleConfirmDelivery}
                  disabled={confirming}
                  className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
                    confirming
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {confirming ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Confirming...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <FaCheckCircle className="mr-2" />
                      Confirm Delivery
                    </div>
                  )}
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  By clicking this button, you confirm that the delivery has been completed successfully.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverConfirmationPage;
