import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaTruck,
  FaDownload,
  FaSearch,
  FaExclamationTriangle,
  FaGasPump,
  FaCheckCircle,
  FaWrench,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [formData, setFormData] = useState({
    vehicleType: "",
    licensePlate: "",
    fuelType: "",
    capacityValue: "",
    capacityUnit: "",
    status: "Active",
  });
  const [editingId, setEditingId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get("http://localhost:5002/api/vehicles");
      setVehicles(response.data.vehicles || response.data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  // Validation functions
  const validateVehicleType = (type) => {
    const validTypes = ['Truck', 'Van', 'Bike', 'Mini Truck'];
    if (!type || type.trim() === '') {
      return 'Vehicle type is required';
    }
    if (!validTypes.includes(type)) {
      return 'Please select a valid vehicle type';
    }
    return '';
  };

  const validateLicensePlate = (plate) => {
    const alphanumericWithHyphenRegex = /^[a-zA-Z0-9-]+$/;
    if (!plate || plate.trim() === '') {
      return 'License plate is required';
    }
    if (!alphanumericWithHyphenRegex.test(plate)) {
      return 'License plate can only contain letters, numbers and hyphens';
    }
    return '';
  };

  // Validate all fields
  const validateForm = () => {
    const errors = {};
    
    errors.vehicleType = validateVehicleType(formData.vehicleType);
    errors.licensePlate = validateLicensePlate(formData.licensePlate);
    
    setValidationErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (name === "licensePlate") {
      // ✅ Only allow letters, numbers and hyphens for licensePlate
      if (/^[a-zA-Z0-9-]*$/.test(value) || value === "") {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }
    
    // Validate form before submission
    if (!validateForm()) {
      showToastMessage("Please fix all validation errors before submitting ❌");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Submitting vehicle data:", formData);
      
      if (editingId) {
        const response = await axios.put(`http://localhost:5002/api/vehicles/${editingId}`, formData);
        console.log("Update response:", response.data);
        showToastMessage("Vehicle updated successfully ✅");
      } else {
        const response = await axios.post("http://localhost:5002/api/vehicles", formData);
        console.log("Create response:", response.data);
        showToastMessage("Vehicle added successfully 🚗");
      }
      await fetchVehicles();
      resetForm();
    } catch (error) {
      console.error("Error saving vehicle:", error);
      let errorMessage = "Error saving vehicle ❌";
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 400) {
          errorMessage = "Invalid data provided ❌";
        } else if (error.response.status === 409) {
          errorMessage = "License plate already exists ❌";
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again ❌";
        } else {
          errorMessage = error.response.data?.message || "Error saving vehicle ❌";
        }
      } else if (error.request) {
        // Network error
        errorMessage = "Network error. Please check your connection ❌";
      }
      
      showToastMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleType: "",
      licensePlate: "",
      fuelType: "",
      capacityValue: "",
      capacityUnit: "",
      status: "Active",
    });
    setValidationErrors({});
    setEditingId(null);
  };

  const handleEdit = (vehicle) => {
    setFormData({
      vehicleType: vehicle.vehicleType || "",
      licensePlate: vehicle.licensePlate || "",
      fuelType: vehicle.fuelType || "",
      capacityValue: vehicle.capacityValue || "",
      capacityUnit: vehicle.capacityUnit || "",
      status: vehicle.status || "Active",
    });
    setEditingId(vehicle._id);
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5002/api/vehicles/${deleteId}`);
      await fetchVehicles();
      showToastMessage("Vehicle deleted successfully 🗑️");
    } catch (error) {
      console.error("Error deleting vehicle:", error);
    } finally {
      setShowModal(false);
      setDeleteId(null);
    }
  };

  const downloadPDF = async () => {
    if (isGeneratingPDF) return;
    
    setIsGeneratingPDF(true);
    
    try {
      // Check if vehicles data exists
      if (!vehicles || vehicles.length === 0) {
        showToastMessage("No vehicles data to export ❌");
        return;
      }

      const doc = new jsPDF();
      const companyName = "SportNest";
      const companyAddress = "No.7, Padukka, Colombo";
      const generatedAt = new Date().toLocaleString();

      // Header
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(companyName, 14, 15);
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(companyAddress, 14, 22);

      // Title
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Vehicle Management Report", 14, 34);
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated: ${generatedAt}`, 14, 40);
      doc.text(`Total Vehicles: ${vehicles.length}`, 14, 46);

      // Table data
      const head = [["Vehicle Type", "License Plate", "Fuel Type", "Capacity", "Status"]];
      const body = vehicles.map((v) => [
        v.vehicleType || "-",
        v.licensePlate || "-",
        v.fuelType || "-",
        v.capacityValue ? `${v.capacityValue} ${v.capacityUnit || ""}`.trim() : "-",
        v.status || "-",
      ]);

      // Generate table
      autoTable(doc, {
        startY: 52,
        head,
        body,
        styles: { 
          fontSize: 9,
          cellPadding: 3
        },
        headStyles: { 
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { left: 14, right: 14 },
        tableWidth: 'auto',
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 35 },
          2: { cellWidth: 25 },
          3: { cellWidth: 30 },
          4: { cellWidth: 25 }
        }
      });

      // Add page numbers
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 8, {
          align: "right",
        });
      }

      // Save the PDF
      const fileName = `sportnest_vehicles_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      showToastMessage("✅ Vehicle report exported successfully");
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToastMessage("Error generating PDF report ❌");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Active: { class: "bg-green-100 text-green-800", text: "Active", icon: FaCheckCircle },
      Maintenance: { class: "bg-yellow-100 text-yellow-800", text: "Maintenance", icon: FaWrench },
      Inactive: { class: "bg-gray-100 text-gray-800", text: "Inactive", icon: FaExclamationTriangle },
    };
    const statusInfo = statusMap[status] || statusMap.Active;
    const Icon = statusInfo.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.class}`}>
        <Icon className="w-3 h-3" /> {statusInfo.text}
      </span>
    );
  };

  const filteredVehicles = (Array.isArray(vehicles) ? vehicles : []).filter(
    (vehicle) =>
      (statusFilter === "All Status" || vehicle.status === statusFilter) &&
      ((vehicle.licensePlate || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
        (vehicle.vehicleType || "").toLowerCase().includes((searchTerm || "").toLowerCase()))
  );

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (loading) return <div className="flex justify-center items-center p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Management</h1>
          <p className="text-gray-600 mt-1">Manage your fleet vehicles and maintenance schedules</p>
        </div>
        <button 
          className={`mt-4 sm:mt-0 inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
            isGeneratingPDF 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
          } text-white`}
          onClick={downloadPDF}
          disabled={isGeneratingPDF}
        >
          <FaDownload className="mr-2" />
          {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <select
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.vehicleType ? 'border-red-500' : 'border-gray-300'
              }`}
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              required
            >
              <option value="">Vehicle Type</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
              <option value="Bike">Bike</option>
              <option value="Mini Truck">Mini Truck</option>
            </select>
            {validationErrors.vehicleType && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.vehicleType}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.licensePlate ? 'border-red-500' : 'border-gray-300'
              }`}
              name="licensePlate"
              placeholder="License Plate (letters, numbers & hyphens only)"
              value={formData.licensePlate}
              onChange={handleChange}
              onKeyPress={(e) => {
                if (!/^[a-zA-Z0-9-]$/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              required
            />
            {validationErrors.licensePlate && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.licensePlate}</p>
            )}
          </div>
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              required
            >
              <option value="">Fuel Type</option>
              <option>Petrol</option>
              <option>Diesel</option>
              <option>Electric</option>
              <option>Hybrid</option>
            </select>
          </div>
          <div>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              name="capacityValue"
              placeholder="Capacity"
              value={formData.capacityValue}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              name="capacityUnit"
              value={formData.capacityUnit}
              onChange={handleChange}
              required
            >
              <option value="">Unit</option>
              <option>Kg</option>
              <option>Ton</option>
              <option>Litre</option>
            </select>
          </div>
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option>Active</option>
              <option>Inactive</option>
              <option>Maintenance</option>
            </select>
          </div>
          <div className="md:col-span-6 flex justify-end">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-md transition-colors ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {isSubmitting ? "Saving..." : (editingId ? "Update Vehicle" : "Add Vehicle")}
            </button>
          </div>
        </form>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="sm:w-64">
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Maintenance</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <div key={vehicle._id || vehicle.licensePlate} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <FaTruck className="text-blue-600 mr-2" />
                <span className="font-bold text-lg">{vehicle.licensePlate}</span>
              </div>
              <div className="flex gap-2">
                <button
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  onClick={() => handleEdit(vehicle)}
                >
                  <FaEdit />
                </button>
                <button
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  onClick={() => confirmDelete(vehicle._id)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Type</span>
                <div className="font-medium">{vehicle.vehicleType}</div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Capacity</span>
                <div className="font-medium">
                  {vehicle.capacityValue} {vehicle.capacityUnit}
                </div>
              </div>
              <div className="flex items-center">
                <FaGasPump className="mr-2 text-gray-400" />
                <span>{vehicle.fuelType}</span>
              </div>
              <div className="pt-2">
                {getStatusBadge(vehicle.status)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredVehicles.length === 0 && (
        <div className="text-center py-12">
          <FaTruck className="mx-auto text-gray-400 text-4xl mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this vehicle?</p>
            <div className="flex gap-3 justify-end">
              <button 
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default Vehicles;