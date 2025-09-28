import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faDownload, faEnvelope, faCalendar, faMapMarkerAlt, faClock } from '@fortawesome/free-solid-svg-icons';

const EventPaymentSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventData, registrationData, paymentId } = location.state || {};

  const [countdown, setCountdown] = useState(10);

  // Redirect if no data
  useEffect(() => {
    if (!eventData || !registrationData) {
      navigate('/events');
    }
  }, [eventData, registrationData, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate('/events');
    }
  }, [countdown, navigate]);

  const handleDownloadReceipt = () => {
    // Create a simple receipt
    const receiptContent = `
EVENT REGISTRATION RECEIPT
========================

Event: ${eventData?.name}
Participant: ${registrationData?.name}
Email: ${registrationData?.email}
Phone: ${registrationData?.phone}
Date: ${eventData?.date ? new Date(eventData.date).toLocaleDateString() : 'TBD'}
Time: ${eventData?.startTime} - ${eventData?.endTime}
Venue: ${eventData?.venue || 'TBD'}

Payment ID: ${paymentId}
Registration Fee: Rs. 0.00
Total: Rs. 0.00

Thank you for registering!
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-receipt-${paymentId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!eventData || !registrationData) {
    return null; // Will redirect
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <FontAwesomeIcon icon={faCheckCircle} className="text-white text-4xl" />
        </div>
        <h1 className="text-4xl font-bold text-green-600 mb-4">Payment Successful!</h1>
        <p className="text-xl text-gray-600">Your event registration has been confirmed</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Event Details */}
        <Card className="shadow-lg border-2 border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
              <FontAwesomeIcon icon={faCalendar} className="text-blue-600 mr-3" />
              Event Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-xl text-gray-800 mb-2">{eventData.name}</h3>
                <p className="text-gray-600 mb-4">{eventData.description}</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faCalendar} className="text-blue-600 w-5 h-5 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Date</p>
                    <p className="text-gray-600">{new Date(eventData.date).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faClock} className="text-blue-600 w-5 h-5 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Time</p>
                    <p className="text-gray-600">{eventData.startTime} - {eventData.endTime}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-600 w-5 h-5 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Venue</p>
                    <p className="text-gray-600">{eventData.venue || 'TBD'}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registration Details */}
        <Card className="shadow-lg border-2 border-green-100">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
              <FontAwesomeIcon icon={faEnvelope} className="text-green-600 mr-3" />
              Registration Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                <h4 className="font-bold text-lg text-gray-800 mb-3">Participant Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-gray-800">{registrationData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-800">{registrationData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium text-gray-800">{registrationData.phone}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                <h4 className="font-bold text-lg text-gray-800 mb-3">Payment Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-medium text-gray-800">{paymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Registration Fee:</span>
                    <span className="font-medium text-gray-800">Rs. 0.00</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-bold text-gray-800">Total:</span>
                    <span className="font-bold text-green-600">Rs. 0.00</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={handleDownloadReceipt}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md"
        >
          <FontAwesomeIcon icon={faDownload} className="h-4 w-4 mr-2" />
          Download Receipt
        </Button>
        
        <Link to="/events">
          <Button
            variant="outline"
            className="px-8 py-3 border-blue-300 text-blue-700 hover:bg-blue-50 font-medium rounded-lg shadow-md"
          >
            View More Events
          </Button>
        </Link>
        
        <Link to="/">
          <Button
            variant="outline"
            className="px-8 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg shadow-md"
          >
            Go Home
          </Button>
        </Link>
      </div>

      {/* Auto-redirect notice */}
      <div className="mt-8 text-center">
        <p className="text-gray-600">
          You will be automatically redirected to the events page in {countdown} seconds
        </p>
      </div>
    </div>
  );
};

export default EventPaymentSuccessPage;


