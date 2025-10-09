import React, { useState, useEffect } from 'react';
import { FaTimes, FaSearch, FaDownload, FaUser, FaEnvelope, FaPhone, FaCalendar, FaIdCard } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DetailsPopup = ({ 
  isOpen, 
  onClose, 
  title, 
  data, 
  loading, 
  columns, 
  searchFields = ['firstName', 'lastName', 'email'],
  type = 'members', // 'members' or 'players'
  onDelete = null // New prop for delete functionality
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      const filtered = data.filter(item => {
        return searchFields.some(field => {
          const value = item[field];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
      setFilteredData(filtered);
    }
  }, [data, searchTerm, searchFields]);

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      console.log('Starting PDF generation...');
      console.log('Filtered data:', filteredData);
      console.log('Columns:', columns);
      
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text(title, 14, 22);
      
      // Add date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Prepare table data
      const tableData = filteredData.map(item => {
        return columns.map(col => {
          if (col.key === 'fullName') {
            return `${item.firstName || ''} ${item.lastName || ''}`.trim();
          }
          if (col.key === 'actions') {
            return ''; // Skip actions column in PDF
          }
          return item[col.key] || '';
        });
      });

      // Filter out actions column for PDF
      const pdfColumns = columns.filter(col => col.key !== 'actions');

      console.log('Table data prepared:', tableData);
      console.log('PDF columns:', pdfColumns);

      // Try autoTable first, fallback to simple text if it fails
      try {
        autoTable(doc, {
          head: [pdfColumns.map(col => col.label)],
          body: tableData,
          startY: 40,
          styles: {
            fontSize: 8,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [59, 130, 246], // Blue color
            textColor: 255,
            fontStyle: 'bold',
          },
          alternateRowStyles: {
            fillColor: [249, 250, 251], // Light gray
          },
        });
      } catch (autoTableError) {
        console.warn('AutoTable failed, using simple text format:', autoTableError);
        
        // Fallback: Simple text format
        let yPosition = 50;
        doc.setFontSize(12);
        
        // Add headers
        pdfColumns.forEach((col, index) => {
          doc.text(col.label, 14 + (index * 40), yPosition);
        });
        yPosition += 10;
        
        // Add data rows
        tableData.forEach(row => {
          row.forEach((cell, index) => {
            doc.text(String(cell), 14 + (index * 40), yPosition);
          });
          yPosition += 8;
        });
      }

      // Generate filename
      const filename = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      console.log('Saving PDF with filename:', filename);

      // Save the PDF
      doc.save(filename);
      
      console.log('PDF saved successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Student Membership': 'bg-green-100 text-green-800',
      'Ordinary Membership': 'bg-blue-100 text-blue-800',
      'Life Time Membership': 'bg-purple-100 text-purple-800',
      'None': 'bg-gray-100 text-gray-800',
      'Beginner': 'bg-yellow-100 text-yellow-800',
      'Intermediate': 'bg-orange-100 text-orange-800',
      'Advanced': 'bg-red-100 text-red-800',
    };
    
    const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {status}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Search and Download */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              isDownloading 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <FaDownload className="w-4 h-4 mr-2" />
            {isDownloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12">
              <FaUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No {type} found</p>
              {searchTerm && (
                <p className="text-gray-400 mt-2">Try adjusting your search terms</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    {columns.map((col, index) => (
                      <th key={index} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item, index) => (
                    <tr key={item._id || index} className="hover:bg-gray-50">
                      {columns.map((col, colIndex) => (
                        <td key={colIndex} className="px-4 py-4 whitespace-nowrap">
                          {col.key === 'fullName' ? (
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <FaUser className="w-5 h-5 text-blue-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {`${item.firstName || ''} ${item.lastName || ''}`.trim()}
                                </div>
                                <div className="text-sm text-gray-500">{item.email}</div>
                              </div>
                            </div>
                          ) : col.key === 'contactNumber' ? (
                            <div className="flex items-center text-sm text-gray-900">
                              <FaPhone className="w-4 h-4 mr-2 text-gray-400" />
                              {item.contactNumber}
                            </div>
                          ) : col.key === 'email' ? (
                            <div className="flex items-center text-sm text-gray-900">
                              <FaEnvelope className="w-4 h-4 mr-2 text-gray-400" />
                              {item.email}
                            </div>
                          ) : col.key === 'membershipPlan' ? (
                            getStatusBadge(item.membershipPlan)
                          ) : col.key === 'skillLevel' ? (
                            getStatusBadge(item.skillLevel)
                          ) : col.key === 'createdAt' ? (
                            <div className="flex items-center text-sm text-gray-900">
                              <FaCalendar className="w-4 h-4 mr-2 text-gray-400" />
                              {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                          ) : col.key === 'clubId' ? (
                            <div className="flex items-center text-sm text-gray-900">
                              <FaIdCard className="w-4 h-4 mr-2 text-gray-400" />
                              {item.clubId}
                            </div>
                          ) : col.key === 'membershipId' ? (
                            <div className="flex items-center text-sm text-gray-900">
                              <FaIdCard className="w-4 h-4 mr-2 text-gray-400" />
                              {item.membershipId || 'N/A'}
                            </div>
                          ) : col.key === 'actions' ? (
                            <div className="flex items-center space-x-2">
                              {onDelete && (
                                <button
                                  onClick={() => onDelete(item._id)}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-900">{item[col.key]}</div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-500">
            Showing {filteredData.length} of {data?.length || 0} {type}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DetailsPopup;
