const Driver = require('../models/Driver');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Helper function to generate driver ID
const generateDriverId = async () => {
    let driverId;
    let isUnique = false;
    while (!isUnique) {
        const randomNumber = Math.floor(1000 + Math.random() * 9000);
        driverId = `DRV-${randomNumber}`;
        const existingDriver = await Driver.findOne({ driverId });
        if (!existingDriver) {
            isUnique = true;
        }
    }
    return driverId;
};

// =================================================================================
// 0. TEST database connection and model
const testDriverModel = async (req, res) => {
    try {
        console.log('Testing driver model...');
        const driverCount = await Driver.countDocuments();
        console.log('Total drivers in database:', driverCount);
        
        // Try to find one driver
        const sampleDriver = await Driver.findOne();
        console.log('Sample driver found:', sampleDriver ? 'Yes' : 'No');
        
        res.json({
            message: 'Driver model test successful',
            totalDrivers: driverCount,
            sampleDriver: sampleDriver ? 'Found' : 'None'
        });
    } catch (error) {
        console.error('Driver model test failed:', error);
        res.status(500).json({
            message: 'Driver model test failed',
            error: error.message
        });
    }
};

// =================================================================================
// 1. CREATE a new driver
const createDriver = async (req, res) => {
    const { 
        fullName, licenseNumber, phone, email, address, hireDate, salary, status, 
        emergencyContact, notes 
    } = req.body;

    // Validation
    if (!fullName || !licenseNumber || !phone || !email || !address || !salary) {
        return res.status(400).json({ 
            message: 'Please fill all required fields: fullName, licenseNumber, phone, email, address, salary' 
        });
    }

    try {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                message: 'Please provide a valid email address' 
            });
        }

        // Validate phone number (should be 10 digits)
        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ 
                message: 'Phone number must be exactly 10 digits' 
            });
        }

        // Validate full name (only letters and spaces)
        if (!/^[a-zA-Z\s]+$/.test(fullName)) {
            return res.status(400).json({ 
                message: 'Full name can only contain letters and spaces' 
            });
        }

        // Validate salary is a positive number
        const salaryNum = parseFloat(salary);
        if (isNaN(salaryNum) || salaryNum < 0) {
            return res.status(400).json({ 
                message: 'Salary must be a positive number' 
            });
        }

        // Check if driver already exists
        const existingDriver = await Driver.findOne({ 
            $or: [{ email }, { licenseNumber }] 
        });
        
        if (existingDriver) {
            return res.status(400).json({ 
                message: 'Driver with this email or license number already exists' 
            });
        }

        const driverData = {
            fullName: fullName.trim(),
            licenseNumber: licenseNumber.trim(),
            phone: phone.trim(),
            email: email.trim().toLowerCase(),
            address: address.trim(),
            hireDate: hireDate ? new Date(hireDate) : new Date(),
            salary: salaryNum,
            status: status || 'Active',
            emergencyContact,
            notes
        };

        // Add profile image if uploaded
        if (req.file) {
            driverData.profileImage = `/uploads/drivers/${req.file.filename}`;
        }

        console.log('Creating driver with data:', driverData);

        const newDriver = new Driver(driverData);
        const savedDriver = await newDriver.save();

        console.log('Driver created successfully:', savedDriver);

        res.status(201).json({
            message: 'Driver created successfully',
            driver: savedDriver
        });
    } catch (error) {
        console.error("Driver Creation Error:", error);
        
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Validation error',
                errors: validationErrors
            });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: 'Driver with this email or license number already exists' 
            });
        }
        
        res.status(500).json({ 
            message: 'Server error during driver creation.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// =================================================================================
// 2. GET all drivers with search and filter
const getAllDrivers = async (req, res) => {
    try {
        const { search, status, sortBy = 'hireDate', sortOrder = 'desc', page = 1, limit = 10 } = req.query;
        
        // Build query
        let query = {};
        
        // Search functionality
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { licenseNumber: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Filter by status
        if (status && status !== 'All Status') {
            query.status = status;
        }

        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const drivers = await Driver.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .select('-__v');

        const totalDrivers = await Driver.countDocuments(query);
        const totalPages = Math.ceil(totalDrivers / parseInt(limit));

        res.status(200).json({
            drivers,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalDrivers,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            }
        });
    } catch (error) {
        console.error("Get Drivers Error:", error);
        res.status(500).json({ message: 'Server error while fetching drivers.' });
    }
};

// =================================================================================
// 3. GET driver by ID
const getDriverById = async (req, res) => {
    const { id } = req.params;
    
    try {
        const driver = await Driver.findById(id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }
        res.status(200).json(driver);
    } catch (error) {
        console.error("Get Driver Error:", error);
        res.status(500).json({ message: 'Server error while fetching driver.' });
    }
};

// =================================================================================
// 4. UPDATE driver
const updateDriver = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        // Validate required fields
        if (!id) {
            return res.status(400).json({ message: 'Driver ID is required' });
        }

        // Check if driver exists
        const existingDriver = await Driver.findById(id);
        if (!existingDriver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        // Validate required fields for update
        const { fullName, licenseNumber, phone, email, address, salary } = updateData;
        if (!fullName || !licenseNumber || !phone || !email || !address || !salary) {
            return res.status(400).json({ 
                message: 'Please provide all required fields: fullName, licenseNumber, phone, email, address, salary' 
            });
        }

        // Check for duplicate email or license number (excluding current driver)
        const duplicateDriver = await Driver.findOne({
            _id: { $ne: id },
            $or: [
                { email: email },
                { licenseNumber: licenseNumber }
            ]
        });

        if (duplicateDriver) {
            return res.status(400).json({ 
                message: 'Driver with this email or license number already exists' 
            });
        }

        // Handle profile image update
        if (req.file) {
            updateData.profileImage = `/uploads/drivers/${req.file.filename}`;
        }

        // Convert hireDate to Date object if provided
        if (updateData.hireDate) {
            updateData.hireDate = new Date(updateData.hireDate);
        }

        // Convert salary to number if provided
        if (updateData.salary) {
            updateData.salary = parseFloat(updateData.salary);
        }

        // Validate salary is a positive number
        if (updateData.salary && (isNaN(updateData.salary) || updateData.salary < 0)) {
            return res.status(400).json({ 
                message: 'Salary must be a positive number' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (updateData.email && !emailRegex.test(updateData.email)) {
            return res.status(400).json({ 
                message: 'Please provide a valid email address' 
            });
        }

        // Validate phone number (should be 10 digits)
        if (updateData.phone && (!/^\d{10}$/.test(updateData.phone))) {
            return res.status(400).json({ 
                message: 'Phone number must be exactly 10 digits' 
            });
        }

        // Validate full name (only letters and spaces)
        if (updateData.fullName && !/^[a-zA-Z\s]+$/.test(updateData.fullName)) {
            return res.status(400).json({ 
                message: 'Full name can only contain letters and spaces' 
            });
        }

        console.log('Updating driver with data:', updateData);
        console.log('Driver ID to update:', id);

        const updatedDriver = await Driver.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );

        console.log('Update result:', updatedDriver);

        if (!updatedDriver) {
            console.log('Driver not found after update - this should not happen');
            return res.status(404).json({ message: 'Driver not found after update' });
        }

        console.log('Driver updated successfully:', updatedDriver);

        res.status(200).json({
            message: 'Driver updated successfully',
            driver: updatedDriver
        });
    } catch (error) {
        console.error("Update Driver Error:", error);
        
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Validation error',
                errors: validationErrors
            });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: 'Driver with this email or license number already exists' 
            });
        }
        
        res.status(500).json({ 
            message: 'Server error while updating driver.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// =================================================================================
// 5. DELETE driver
const deleteDriver = async (req, res) => {
    const { id } = req.params;
    
    try {
        const driver = await Driver.findById(id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        await Driver.findByIdAndDelete(id);
        res.status(200).json({ message: 'Driver deleted successfully' });
    } catch (error) {
        console.error("Delete Driver Error:", error);
        res.status(500).json({ message: 'Server error while deleting driver.' });
    }
};

// =================================================================================
// 6. GET driver statistics
const getDriverStats = async (req, res) => {
    try {
        const totalDrivers = await Driver.countDocuments();
        const activeDrivers = await Driver.countDocuments({ status: 'Active' });
        const inactiveDrivers = await Driver.countDocuments({ status: 'Inactive' });
        const suspendedDrivers = await Driver.countDocuments({ status: 'Suspended' });
        const terminatedDrivers = await Driver.countDocuments({ status: 'Terminated' });

        // Calculate average salary
        const salaryStats = await Driver.aggregate([
            { $group: { _id: null, avgSalary: { $avg: '$salary' }, totalSalary: { $sum: '$salary' } } }
        ]);

        const stats = {
            totalDrivers,
            activeDrivers,
            inactiveDrivers,
            suspendedDrivers,
            terminatedDrivers,
            averageSalary: salaryStats.length > 0 ? Math.round(salaryStats[0].avgSalary) : 0,
            totalSalary: salaryStats.length > 0 ? salaryStats[0].totalSalary : 0
        };

        res.status(200).json(stats);
    } catch (error) {
        console.error("Get Driver Stats Error:", error);
        res.status(500).json({ message: 'Server error while fetching driver statistics.' });
    }
};

// =================================================================================
// 7. EXPORT drivers to PDF
const exportDriversToPDF = async (req, res) => {
    try {
        const { status, search } = req.query;
        
        // Build query
        let query = {};
        if (status && status !== 'All Status') {
            query.status = status;
        }
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { licenseNumber: { $regex: search, $options: 'i' } }
            ];
        }

        const drivers = await Driver.find(query).sort({ fullName: 1 });

        // Create PDF
        const doc = new PDFDocument({ margin: 50 });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=drivers-report.pdf');
        
        // Pipe PDF to response
        doc.pipe(res);

        // Add title
        doc.fontSize(20).text('Driver Management Report', { align: 'center' });
        doc.moveDown();
        
        // Add generation date
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
        doc.moveDown(2);

        // Add driver details
        drivers.forEach((driver, index) => {
            doc.fontSize(14).text(`${index + 1}. ${driver.fullName}`, { underline: true });
            doc.fontSize(10);
            doc.text(`License Number: ${driver.licenseNumber}`);
            doc.text(`Email: ${driver.email}`);
            doc.text(`Phone: ${driver.phone}`);
            doc.text(`Address: ${driver.address}`);
            doc.text(`Hire Date: ${driver.formattedHireDate}`);
            doc.text(`Salary: $${driver.salary.toLocaleString()}`);
            doc.text(`Status: ${driver.status}`);
            
            if (driver.emergencyContact && driver.emergencyContact.name) {
                doc.text(`Emergency Contact: ${driver.emergencyContact.name} (${driver.emergencyContact.phone})`);
            }
            
            if (driver.notes) {
                doc.text(`Notes: ${driver.notes}`);
            }
            
            doc.moveDown();
            
            // Add page break if needed
            if (index < drivers.length - 1 && (index + 1) % 3 === 0) {
                doc.addPage();
            }
        });

        // Finalize PDF
        doc.end();
    } catch (error) {
        console.error("PDF Export Error:", error);
        res.status(500).json({ message: 'Server error while generating PDF report.' });
    }
};

// =================================================================================
// 8. BULK operations
const bulkUpdateStatus = async (req, res) => {
    const { driverIds, status } = req.body;
    
    if (!driverIds || !Array.isArray(driverIds) || !status) {
        return res.status(400).json({ 
            message: 'Please provide driver IDs array and status' 
        });
    }

    try {
        const result = await Driver.updateMany(
            { _id: { $in: driverIds } },
            { status }
        );

        res.status(200).json({
            message: `${result.modifiedCount} drivers updated successfully`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error("Bulk Update Error:", error);
        res.status(500).json({ message: 'Server error during bulk update.' });
    }
};

const bulkDeleteDrivers = async (req, res) => {
    const { driverIds } = req.body;
    
    if (!driverIds || !Array.isArray(driverIds)) {
        return res.status(400).json({ 
            message: 'Please provide driver IDs array' 
        });
    }

    try {
        const result = await Driver.deleteMany({ _id: { $in: driverIds } });
        
        res.status(200).json({
            message: `${result.deletedCount} drivers deleted successfully`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error("Bulk Delete Error:", error);
        res.status(500).json({ message: 'Server error during bulk delete.' });
    }
};

module.exports = {
    testDriverModel,
    createDriver,
    getAllDrivers,
    getDriverById,
    updateDriver,
    deleteDriver,
    getDriverStats,
    exportDriversToPDF,
    bulkUpdateStatus,
    bulkDeleteDrivers
};
