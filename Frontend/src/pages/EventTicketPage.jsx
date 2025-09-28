// src/pages/EventTicketPage.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faCheckCircle, faTicketAlt } from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf";
// Event Ticket Page Component
const EventTicketPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { eventData, registrationData, paymentId } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // Redirect if no data
  useEffect(() => {
    if (!eventData || !registrationData || !paymentId) {
      navigate("/events");
    }
  }, [eventData, registrationData, paymentId, navigate]);

  const downloadAsPDF = () => {
    setLoading(true);

    try {
      const doc = new jsPDF();

      // Header with green background
      doc.setFillColor(76, 175, 80);
      doc.rect(0, 0, 210, 35, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("SportNest E-TICKET", 105, 22, { align: "center" });
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Event Registration Confirmation", 105, 30, { align: "center" });

      // Event name
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(eventData.name, 20, 50);

      // Participant details
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Participant Information:", 20, 65);
      doc.text(`Name: ${registrationData.name}`, 25, 75);
      doc.text(`Email: ${registrationData.email}`, 25, 85);
      doc.text(`Phone: ${registrationData.phone}`, 25, 95);

      // Event details
      doc.text("Event Details:", 20, 110);
      doc.text(`Venue: ${eventData.venue}`, 25, 120);
      doc.text(`Date: ${new Date(eventData.date).toLocaleDateString()}`, 25, 130);
      doc.text(`Time: ${eventData.startTime} - ${eventData.endTime}`, 25, 140);

      // Registration fee box
      doc.setFillColor(232, 245, 232);
      doc.rect(15, 150, 180, 20, "F");
      doc.setTextColor(0, 100, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Registration Fee: Rs. ${eventData.registrationFee || 200}.00`,
        105,
        162,
        { align: "center" }
      );

      // Confirmation box
      doc.setFillColor(76, 175, 80);
      doc.setTextColor(255, 255, 255);
      doc.rect(15, 180, 180, 20, "F");
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("REGISTRATION CONFIRMED", 105, 192, { align: "center" });

      // Footer
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Payment ID: ${paymentId}`, 20, 220);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 230);
      doc.text("SportNest - Your Sports Community", 105, 230, { align: "center" });

      // Add border
      doc.setDrawColor(76, 175, 80);
      doc.setLineWidth(2);
      doc.rect(10, 10, 190, 270);

      // Save file
      doc.save(
        `E-Ticket_${eventData.name.replace(/[^a-zA-Z0-9]/g, "_")}_${paymentId}.pdf`
      );

      setLoading(false);
      setSuccess("E-ticket downloaded successfully!");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error("PDF generation error:", error);
      setLoading(false);
      setSuccess("Error generating PDF. Please try again.");
      
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    }
  };

  if (!eventData || !registrationData || !paymentId) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Message */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 text-center">
            {success}
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-4xl text-green-600"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Registration Successful!
          </h1>
          <p className="text-gray-600">
            Your event registration has been confirmed. Download your e-ticket
            below.
          </p>
        </div>

        {/* Ticket Preview */}
        <Card className="shadow-lg border-2 border-green-100 mb-8">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faTicketAlt}
                className="mr-3 text-green-600"
              />
              Your E-Ticket
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="max-w-md mx-auto bg-white border-2 border-green-200 rounded-lg overflow-hidden shadow-md">
              <div className="bg-green-600 text-white p-6 text-center">
                <h2 className="text-2xl font-bold mb-2">🎫 E-TICKET</h2>
                <p className="text-green-100">SportNest Event Registration</p>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {eventData.name}
                </h3>
                <div className="space-y-2 mb-4">
                  <div>
                    <span className="font-semibold text-green-600">
                      Participant:
                    </span>{" "}
                    {registrationData.name}
                  </div>
                  <div>
                    <span className="font-semibold text-green-600">
                      Email:
                    </span>{" "}
                    {registrationData.email}
                  </div>
                  <div>
                    <span className="font-semibold text-green-600">
                      Phone:
                    </span>{" "}
                    {registrationData.phone}
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="font-semibold text-green-600">
                    Event Details:
                  </div>
                  <div>📍 Venue: {eventData.venue}</div>
                  <div>
                    📅 Date: {new Date(eventData.date).toLocaleDateString()}
                  </div>
                  <div>
                    ⏰ Time: {eventData.startTime} - {eventData.endTime}
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg mb-4">
                  <span className="font-semibold text-green-600">
                    Registration Fee:
                  </span>{" "}
                  Rs. {eventData.registrationFee || 200}.00
                </div>
                <div className="bg-green-600 text-white p-3 rounded-lg text-center font-bold mb-4">
                  ✅ REGISTRATION CONFIRMED
                </div>
                <div className="text-center text-sm text-gray-500 border-t pt-3">
                  <div>Payment ID: {paymentId}</div>
                  <div>Generated: {new Date().toLocaleString()}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <div className="text-center space-y-4">
          <Button
            onClick={downloadAsPDF}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faDownload} className="mr-2" />
            {loading ? "Preparing Download..." : "Download E-Ticket (PDF)"}
          </Button>

          <div className="text-sm text-gray-600">
            <Button
              variant="outline"
              onClick={() => navigate("/events")}
              className="mr-4"
            >
              Back to Events
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Go Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventTicketPage;
