const RenewedMembership = require('../models/RenewedMembership');

// සාමාජිකත්වය අලුත් කිරීමේ function එක
exports.createRenewal = async (req, res) => {
    try {
        const { membershipId, name, email, previousPlan, newPlan } = req.body;

        // අලුත් renewal object එකක් සාදනවා
        const newRenewal = new RenewedMembership({
            membershipId,
            name,
            email,
            previousPlan,
            newPlan
        });

        // Database එකේ save කරනවා
        await newRenewal.save();

        res.status(201).json({ success: true, message: 'Membership renewal successful!', data: newRenewal });

    } catch (error) {
        console.error('Error renewing membership:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};