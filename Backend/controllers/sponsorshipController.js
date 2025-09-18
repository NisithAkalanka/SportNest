const Sponsorship = require('../models/SponsorshipModel');
const sendEmail = require('../utils/email'); // 
const crypto = require('crypto'); 

// --- 1.registration Function
const registerSponsorship = async (req, res) => {
    // Getting all the data sent from the frontend
    const {
        organizationName, contactPerson, email, phoneNumber, address,
        sponsorshipPlan, sponsorshipAmount, startDate, endDate, preferredPerks,
        website, promotionalMessage, agreedToTerms, agreedToLogoUsage
    } = req.body;

    // Server-side validation
    if (!agreedToTerms || !agreedToLogoUsage) {
        return res.status(400).json({ message: 'You must agree to the terms and conditions to proceed.' });
    }

    try {
        // Generating a new, secure access token
        const accessToken = crypto.randomBytes(32).toString('hex');
        const registrationId = `SP-${Date.now()}`;
        
        // Preparation of a new sponsorship object according to the model
        const newSponsorship = new Sponsorship({
            organizationName, contactPerson, email, phoneNumber, address,
            sponsorshipPlan, sponsorshipAmount, startDate, endDate, preferredPerks,
            website, promotionalMessage, agreedToTerms, agreedToLogoUsage,
            registrationId,
            approvalStatus: 'Pending',
            accessToken // Add to save the generated token to the database
        });

        // data save database 
        const savedSponsorship = await newSponsorship.save();
        console.log("Document successfully saved to DB:", savedSponsorship);
        
        // (This section can be reactivated once your email issue is resolved)
        /* 
        const message = `Dear ${contactPerson}, ...`;
        await sendEmail({ email, subject: '...', message });
        */
        
        //  Sending the ID and Access Token with a successful response to the frontend 
        res.status(201).json({ 
            message: 'Application submitted! You will be redirected shortly.',
            sponsorshipId: savedSponsorship._id,
            accessToken: savedSponsorship.accessToken 
        });

    } catch (error) {
        console.error("SPONSORSHIP SUBMISSION FAILED:", error); 
        res.status(500).json({ message: 'Server error while submitting application. Please try again later.' });
    }
};

// --- 2.Retrieve Function for Viewing and Editing an Application (Newly Added) ---
const getSponsorshipForEditing = async (req, res) => {
    try {
        const { id } = req.params;
        const { token } = req.query; // using URL get the token 

        if (!token) return res.status(401).json({ message: "Access token is missing." });

        const sponsorship = await Sponsorship.findById(id);

        if (!sponsorship || sponsorship.accessToken !== token) {
            return res.status(404).json({ message: "Application not found or invalid token." });
        }
        
        // Checking if the 5 hour period is valid
        const fiveHours = 5 * 60 * 60 * 1000;
        const timeElapsed = Date.now() - new Date(sponsorship.createdAt).getTime();
        const isEditable = timeElapsed < fiveHours;

        res.status(200).json({ sponsorship, isEditable });

    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching data.' });
    }
};

// --- 3.  Update Function 
const updateSponsorship = async (req, res) => {
    try {
        // again check Access 
        const sponsorship = await Sponsorship.findById(req.params.id);
        if (!sponsorship || sponsorship.accessToken !== req.query.token) {
            return res.status(404).json({ message: "Application not found or invalid token." });
        }
        const fiveHours = 5 * 60 * 60 * 1000;
        if (Date.now() - new Date(sponsorship.createdAt).getTime() > fiveHours) {
            sponsorship.accessToken = undefined; // Token expired and remove
            await sponsorship.save();
            return res.status(403).json({ message: "Editing period has expired." });
        }
        
        //  update 
        const updatedSponsorship = await Sponsorship.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ message: "Application updated successfully!", sponsorship: updatedSponsorship });

    } catch (error) {
        res.status(500).json({ message: 'Server error while updating data.' });
    }
};

// --- 4.  Delete  Function  (new added) ---
const deleteSponsorship = async (req, res) => {
    try {
        // again chheck Access 
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
        res.status(500).json({ message: 'Server error while deleting data.' });
    }
};


// --- 5. Functions export  
module.exports = { 
    registerSponsorship,
    getSponsorshipForEditing,
    updateSponsorship,
    deleteSponsorship
};
