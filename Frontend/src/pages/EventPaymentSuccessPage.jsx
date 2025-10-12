import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faDownload, faEnvelope, faCalendar, faMapMarkerAlt, faClock, faTicketAlt } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';

const EventPaymentSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventData, registrationData, paymentId, returnToEvents } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // Redirect if no data
  useEffect(() => {
    if (!eventData || !registrationData) {
      navigate('/events');
    }
  }, [eventData, registrationData, navigate]);

  const handleDownloadReceipt = () => {
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
Registration Fee: Rs. ${eventData?.registrationFee || 200}.00
Total: Rs. ${eventData?.registrationFee || 200}.00

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

  const downloadAsPDF = () => {
    setLoading(true);
    try {
      const doc = new jsPDF();

      // Header
      doc.setFillColor(76, 175, 80);
      doc.rect(0, 0, 210, 35, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("SportNest E-TICKET", 105, 22, { align: "center" });
      doc.setFontSize(12);
      doc.text("Event Registration Confirmation", 105, 30, { align: "center" });

      // Event name
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.text(eventData.name, 20, 50);

      // Participant info
      doc.setFontSize(12);
      doc.text(`Name: ${registrationData.name}`, 25, 70);
      doc.text(`Email: ${registrationData.email}`, 25, 80);
      doc.text(`Phone: ${registrationData.phone}`, 25, 90);

      // Event details
      doc.text(`Venue: ${eventData.venue}`, 25, 110);
      doc.text(`Date: ${new Date(eventData.date).toLocaleDateString()}`, 25, 120);
      doc.text(`Time: ${eventData.startTime} - ${eventData.endTime}`, 25, 130);

      // Fee section
      doc.setFontSize(14);
      doc.setTextColor(0, 100, 0);
      doc.text(
        `Registration Fee: Rs. ${eventData.registrationFee || 200}.00`,
        105,
        150,
        { align: "center" }
      );

      // Confirmation box
      doc.setFillColor(76, 175, 80);
      doc.setTextColor(255, 255, 255);
      doc.rect(15, 170, 180, 20, "F");
      doc.setFontSize(16);
      doc.text("REGISTRATION CONFIRMED", 105, 182, { align: "center" });

      // Footer
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.text(`Payment ID: ${paymentId}`, 20, 210);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 220);
      doc.text("SportNest - Your Sports Community", 105, 230, { align: "center" });

      doc.save(`E-Ticket_${eventData.name.replace(/[^a-zA-Z0-9]/g, "_")}_${paymentId}.pdf`);

      setSuccess("E-ticket downloaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("PDF generation error:", error);
      setSuccess("Error generating PDF. Please try again.");
      setTimeout(() => setSuccess(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (!eventData || !registrationData) return null;

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 text-center">
          {success}
        </div>
      )}

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
            <h3 className="font-bold text-xl text-gray-800 mb-2">{eventData.name}</h3>
            <p className="text-gray-600 mb-4">{eventData.description}</p>
            <div className="space-y-3">
              <p><strong>Date:</strong> {new Date(eventData.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {eventData.startTime} - {eventData.endTime}</p>
              <p><strong>Venue:</strong> {eventData.venue || 'TBD'}</p>
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
            <div className="space-y-2">
              <p><strong>Name:</strong> {registrationData.name}</p>
              <p><strong>Email:</strong> {registrationData.email}</p>
              <p><strong>Phone:</strong> {registrationData.phone}</p>
              <p><strong>Payment ID:</strong> {paymentId}</p>
              <p><strong>Registration Fee:</strong> Rs. {eventData.registrationFee || 200}.00</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={downloadAsPDF}
          disabled={loading}
          className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faTicketAlt} className="h-4 w-4 mr-2" />
          {loading ? "Preparing E-Ticket..." : "Download E-Ticket (PDF)"}
        </Button>

        <Button
          onClick={handleDownloadReceipt}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md"
        >
          <FontAwesomeIcon icon={faDownload} className="h-4 w-4 mr-2" />
          Download Receipt
        </Button>

        <Button
          onClick={() => navigate('/events', {
            state: returnToEvents ? {
              shouldRefreshEvents: true,
              registrationSuccess: true,
              eventName: eventData?.name
            } : {}
          })}
          variant="outline"
          className="px-8 py-3 border-blue-300 text-blue-700 hover:bg-blue-50 font-medium rounded-lg shadow-md"
        >
          View More Events
        </Button>

        <Link to="/">
          <Button
            variant="outline"
            className="px-8 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg shadow-md"
          >
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default EventPaymentSuccessPage;