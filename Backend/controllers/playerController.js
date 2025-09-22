// Backend/controllers/playerController.js

const Player = require('../models/PlayerModel');

const registerPlayer = async (req, res) => {
    // ★ 1. Frontend-இலிருந்து அனுப்பப்படும் அனைத்துத் தரவுகளையும் இங்குப் பெறுதல்
    const { 
        sportName, 
        fullName, 
        clubId, // ★ clubId இங்கே சேர்க்கப்பட்டுள்ளது
        membershipId,
        dateOfBirth, 
        contactNumber,
        emergencyContactName, 
        emergencyContactNumber, 
        skillLevel, 
        healthHistory 
    } = req.body;
    
    // middleware-இலிருந்து பயனரின் member ID-யைப் பெறுதல்
    const memberId = req.user._id;

    try {
        const existingPlayer = await Player.findOne({ member: memberId, sportName: sportName });
        
        if (existingPlayer) {
            return res.status(400).json({ message: `You are already registered for ${sportName}.` });
        }
        
        // ★ 2. தரவுத்தளத்தில் புதிய விளையாட்டுப் பதிவை உருவாக்குதல்
        const player = await Player.create({
            member: memberId,
            clubId, // ★ clubId தரவுத்தளத்தில் சேமிக்கப்படும்
            fullName,
            membershipId,
            sportName,
            dateOfBirth: new Date(dateOfBirth), // Frontend-இலிருந்து வரும் தேதி வடிவம் சரியாக இருக்க வேண்டும்
            contactNumber,
            emergencyContactName,
            emergencyContactNumber,
            skillLevel,
            healthHistory
        });

        res.status(201).json({ message: `Successfully registered for ${sportName}!`, player });

    } catch (error) {
        console.error("Player Registration Error:", error);
        res.status(500).json({ message: `Server error during player registration: ${error.message}` });
    }
};

const getMyProfiles = async (req, res) => {
    try {
        const playerProfiles = await Player.find({ member: req.user._id });
        res.status(200).json(playerProfiles);
    } catch (error) {
        console.error("Get My Profiles Error:", error);
        res.status(500).json({ message: 'Server error while fetching profiles.' });
    }
};

const updateMyProfile = async (req, res) => {
    try {
        const {
            contactNumber,
            emergencyContactName,
            emergencyContactNumber,
            skillLevel,
            healthHistory
        } = req.body;

        const player = await Player.findById(req.params.id);

        if (!player) {
            return res.status(404).json({ message: "Player profile not found." });
        }

        if (player.member.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "User not authorized to update this profile." });
        }
        
        player.contactNumber = contactNumber || player.contactNumber;
        player.emergencyContactName = emergencyContactName || player.emergencyContactName;
        player.emergencyContactNumber = emergencyContactNumber || player.emergencyContactNumber;
        player.skillLevel = skillLevel || player.skillLevel;
        player.healthHistory = healthHistory;

        const updatedPlayer = await player.save();
        res.status(200).json(updatedPlayer);

    } catch (error) {
        console.error("Player Profile Update Error:", error);
        res.status(500).json({ message: "Server error while updating player profile." });
    }
};

const deleteMyProfile = async (req, res) => {
    try {
        const profile = await Player.findById(req.params.id);

        if (!profile) {
             return res.status(404).json({ message: "Player profile not found." });
        }

        if (profile.member.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this profile." });
        }

        await Player.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Profile (registration) deleted successfully.' });
    } catch (error) {
        console.error("Delete My Profile Error:", error);
        res.status(500).json({ message: 'Server error while deleting profile.' });
    }
};

module.exports = {
    registerPlayer,
    getMyProfiles,
    updateMyProfile,
    deleteMyProfile
};