// Backend/controllers/sponsorshipController.js

const Sponsorship = require('../models/SponsorshipModel');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

// --- 1. Register Sponsorship Application (Public) ---
const registerSponsorship = async (req, res) => {
    const {
        fullName, organizationName, contactPerson, email, phoneNumber, address,
        sponsorshipPlan, sponsorshipAmount, startDate, endDate, preferredPerks,
        website, promotionalMessage, agreedToTerms, agreedToLogoUsage
    } = req.body;

    if (!agreedToTerms || !agreedToLogoUsage) {
        return res.status(400).json({ message: 'You must agree to the terms and conditions.' });
    }

    try {
        const accessToken = crypto.randomBytes(32).toString('hex');
        const registrationId = `SP-${Date.now()}`;

        const newSponsorship = new Sponsorship({
            fullName,
            organizationName,
            contactPerson,
            email,
            phoneNumber,
            address,
            sponsorshipPlan,
            sponsorshipAmount,
            startDate,
            endDate,
            preferredPerks,
            website,
            promotionalMessage,
            agreedToTerms,
            agreedToLogoUsage,
            registrationId,
            contactStatus: 'Not Contacted',
            accessToken
        });

        const saved = await newSponsorship.save();
        res.status(201).json({
            message: 'Application submitted successfully!',
            sponsorshipId: saved._id,
            accessToken: saved.accessToken
        });
    } catch (error) {
        console.error("SPONSORSHIP SUBMISSION FAILED:", error);
        res.status(500).json({ message: 'Server error while submitting application.' });
    }
};

// --- 2. Retrieve Sponsorship for Editing (with Access Token) ---
const getSponsorshipForEditing = async (req, res) => {
    try {
        const { id } = req.params;
        const { token } = req.query;

        if (!token) return res.status(401).json({ message: "Access token is missing." });

        const sponsorship = await Sponsorship.findById(id);
        if (!sponsorship || sponsorship.accessToken !== token) {
            return res.status(404).json({ message: "Application not found or invalid token." });
        }

        const fiveHours = 5 * 60 * 60 * 1000;
        const isEditable = (Date.now() - new Date(sponsorship.createdAt).getTime()) < fiveHours;

        res.status(200).json({ sponsorship, isEditable });
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching data.' });
    }
};

// --- 3. Update Sponsorship Application (within 5 hours) ---
const updateSponsorship = async (req, res) => {
    try {
        const sponsorship = await Sponsorship.findById(req.params.id);
        if (!sponsorship || sponsorship.accessToken !== req.query.token) {
            return res.status(404).json({ message: "Application not found or invalid token." });
        }

        const fiveHours = 5 * 60 * 60 * 1000;
        if (Date.now() - new Date(sponsorship.createdAt).getTime() > fiveHours) {
            sponsorship.accessToken = undefined;
            await sponsorship.save();
            return res.status(403).json({ message: "Editing period has expired." });
        }

        const updated = await Sponsorship.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ message: "Application updated successfully!", sponsorship: updated });
    } catch (error) {
        res.status(500).json({ message: 'Server error while updating application.' });
    }
};

// --- 4. Delete Sponsorship Application (within 5 hours) ---
const deleteSponsorship = async (req, res) => {
    try {
        const sponsorship = await Sponsorship.findById(req.params.id);
        if (!sponsorship || sponsorship.accessToken !== req.query.token) {
            return res.status(404).json({ message: "Application not found or invalid token." });
        }

        const fiveHours = 5 * 60 * 60 * 1000;
        if (Date.now() - new Date(sponsorship.createdAt).getTime() > fiveHours) {
            return res.status(403).json({ message: "Deletion period has expired." });
        }

        await Sponsorship.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Application deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: 'Server error while deleting application.' });
    }
};

// --- 5. Admin: Get All Sponsorship Applications ---
const getAllSponsorships = async (req, res) => {
    try {
        const applications = await Sponsorship.find({}).sort({ createdAt: -1 }); // latest first
        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving sponsorship applications.' });
    }
};

// --- 6. Admin: Send Invitation Email (instead of approval) ---
const sendInvitationEmail = async (req, res) => {
    try {
        const sponsorship = await Sponsorship.findById(req.params.id);

        if (!sponsorship) {
            return res.status(404).json({ message: "Application not found." });
        }

        if (sponsorship.contactStatus === 'Contacted') {
            return res.status(400).json({ message: "An invitation has already been sent to this applicant." });
        }

        const emailSubject = `Invitation to Sponsor SportNest`;
        const emailMessage = `
            Dear ${sponsorship.contactPerson},

            Thank you for your application to sponsor SportNest. We appreciate your interest in supporting our club.

            We would like to invite you to discuss this partnership opportunity further. Please contact us at your earliest convenience to schedule a meeting.

            We look forward to hearing from you.

            Best Regards,
            The SportNest Team
        `;

        await sendEmail({
            email: sponsorship.email,
            subject: emailSubject,
            message: emailMessage
        });

        sponsorship.contactStatus = 'Contacted';
        await sponsorship.save();

        res.status(200).json({ 
            message: `Invitation email sent successfully to ${sponsorship.contactPerson}.`,
            updatedApplication: sponsorship
        });

    } catch (error) {
        console.error("SEND INVITATION FAILED:", error);
        res.status(500).json({ message: 'Server error while sending invitation.' });
    }
};

module.exports = {
    registerSponsorship,
    getSponsorshipForEditing,
    updateSponsorship,
    deleteSponsorship,
    getAllSponsorships,
    sendInvitationEmail
};
