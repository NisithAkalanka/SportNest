const RenewedMembership = require('../models/RenewedMembership');

// renew membership function
exports.createRenewal = async (req, res) => {
    try {
        const { membershipId, name, email, previousPlan, newPlan } = req.body;

        //  create renewal object 
        const newRenewal = new RenewedMembership({
            membershipId,
            name,
            email,
            previousPlan,
            newPlan
        });

        // Database  save 
        await newRenewal.save();

        res.status(201).json({ success: true, message: 'Membership renewal successful!', data: newRenewal });

    } catch (error) {
        console.error('Error renewing membership:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};