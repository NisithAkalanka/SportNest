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
            fullName,
            licenseNumber,
            phone,
            email,
            address,
            hireDate: hireDate ? new Date(hireDate) : new Date(),
            salary: parseFloat(salary),
            status: status || 'Active',
            emergencyContact,
            notes
        };

        // Add profile image if uploaded
        if (req.file) {
            driverData.profileImage = `/uploads/drivers/${req.file.filename}`;
        }

        const newDriver = new Driver(driverData);
        const savedDriver = await newDriver.save();

        res.status(201).json({
            message: 'Driver created successfully',
            driver: savedDriver
        });
    } catch (error) {
        console.error("Driver Creation Error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: 'Driver with this email or license number already exists' 
            });
        }
        res.status(500).json({ message: 'Server error during driver creation.' });
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
        const driver = await Driver.findById(id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
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

        const updatedDriver = await Driver.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: 'Driver updated successfully',
            driver: updatedDriver
        });
    } catch (error) {
        console.error("Update Driver Error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: 'Driver with this email or license number already exists' 
            });
        }
        res.status(500).json({ message: 'Server error while updating driver.' });
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
