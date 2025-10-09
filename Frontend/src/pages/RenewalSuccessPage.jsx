import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faDownload, faHome, faUser } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';

const RenewalSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { membershipData, paymentData, paymentCompleted } = location.state || {};

  // Redirect if no data
  if (!membershipData || !paymentCompleted) {
    navigate('/');
    return null;
  }

  const downloadReceipt = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Set font
      doc.setFont('helvetica');
      
      // Title
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('SportNest', pageWidth / 2, 30, { align: 'center' });
      
      // Subtitle
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text('Membership Renewal Receipt', pageWidth / 2, 45, { align: 'center' });
      
      // Receipt generation date and time
      const currentDate = new Date();
      const dateTime = currentDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      doc.setFontSize(10);
      doc.text(`Generated on: ${dateTime}`, pageWidth / 2, 55, { align: 'center' });
      
      // Member details
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Member Information', 20, 75);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Membership ID: ${membershipData.membershipId}`, 20, 85);
      doc.text(`Name: ${membershipData.fullName}`, 20, 95);
      doc.text(`Email: ${membershipData.email}`, 20, 105);
      
      // Renewal details
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Renewal Details', 20, 125);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Previous Plan: ${membershipData.currentPlan}`, 20, 135);
      doc.text(`New Plan: ${membershipData.newPlan}`, 20, 145);
      
      // Payment details
      if (paymentData) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Payment Information', 20, 165);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Amount Paid: Rs. ${paymentData.amount || 'N/A'}`, 20, 175);
        doc.text(`Payment ID: ${paymentData.paymentId || 'N/A'}`, 20, 185);
        doc.text(`Payment Date: ${paymentData.paymentDate || new Date().toLocaleDateString()}`, 20, 195);
      }
      
      // Confirmation box
      doc.setFillColor(76, 175, 80);
      doc.setTextColor(255, 255, 255);
      doc.rect(15, 210, 180, 20, "F");
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text("RENEWAL CONFIRMED", pageWidth / 2, 222, { align: 'center' });
      
      // Footer
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text("SportNest - Your Sports Community", pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Add border
      doc.setDrawColor(76, 175, 80);
      doc.setLineWidth(2);
      doc.rect(10, 10, 190, 270);
      
      // Save the PDF
      const fileName = `Membership-Renewal-Receipt-${membershipData.membershipId}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF receipt. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-5xl text-green-600"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Renewal Successful!
          </h1>
          <p className="text-xl text-gray-600">
            Your membership has been successfully renewed.
          </p>
        </div>

        {/* Receipt Card */}
        <Card className="shadow-lg border-2 border-green-100 mb-8">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faUser}
                className="mr-3 text-green-600"
              />
              Renewal Receipt
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="max-w-2xl mx-auto bg-white border-2 border-green-200 rounded-lg overflow-hidden shadow-md">
              <div className="bg-green-600 text-white p-6 text-center">
                <h2 className="text-2xl font-bold mb-2">✅ RENEWAL CONFIRMED</h2>
                <p className="text-green-100">SportNest Membership Renewal</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Member Information</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-semibold text-green-600">Membership ID:</span> {membershipData.membershipId}
                      </div>
                      <div>
                        <span className="font-semibold text-green-600">Name:</span> {membershipData.fullName}
                      </div>
                      <div>
                        <span className="font-semibold text-green-600">Email:</span> {membershipData.email}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Renewal Details</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-semibold text-green-600">Previous Plan:</span> {membershipData.currentPlan}
                      </div>
                      <div>
                        <span className="font-semibold text-green-600">New Plan:</span> {membershipData.newPlan}
                      </div>
                      {paymentData && (
                        <div>
                          <span className="font-semibold text-green-600">Amount Paid:</span> Rs. {paymentData.amount || 'N/A'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {paymentData && (
                  <div className="bg-green-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-green-600 mb-2">Payment Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>Payment ID: {paymentData.paymentId || 'N/A'}</div>
                      <div>Payment Date: {paymentData.paymentDate || new Date().toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
                
                <div className="text-center text-sm text-gray-500 border-t pt-4">
                  <div>Generated: {new Date().toLocaleString()}</div>
                  <div>SportNest - Your Sports Community</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <Button
            onClick={downloadReceipt}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg"
          >
            <FontAwesomeIcon icon={faDownload} className="mr-2" />
            Download Receipt (PDF)
          </Button>

          <div className="text-sm text-gray-600">
            <Button
              variant="outline"
              onClick={() => navigate('/membership')}
              className="mr-4"
            >
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              My Membership
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              <FontAwesomeIcon icon={faHome} className="mr-2" />
              Go Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenewalSuccessPage;