// backend/Controllers/playerController.js

const Player = require('../models/PlayerModel');


const registerPlayer = async (req, res) => {
    
    const { 
        sportName, 
        fullName, 
        clubId, 
        dateOfBirth, 
        contactNumber,
        emergencyContactName, 
        emergencyContactNumber, 
        skillLevel, 
        healthHistory 
    } = req.body;
    
    const memberId = req.user._id;

    try {
        // ★★★ නිවැරදි කරන ලද කොටස ★★★
        // Frontend එකෙන් එන "DD/MM/YYYY" ආකෘතියේ දිනය,
        // JavaScript වලට නිසැකවම තේරුම්ගත හැකි YYYY-MM-DD ආකෘතියට හරවා Date object එක සෑදීම.
        const dateParts = dateOfBirth.split('/'); // -> ["DD", "MM", "YYYY"]
        const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; // -> "YYYY-MM-DD"
        const finalDateOfBirth = new Date(formattedDate);
        // ★★★ නිවැරදි කිරීම අවසන් ★★★


        const existingPlayer = await Player.findOne({ member: memberId, sportName: sportName });
        
        if (existingPlayer) {
            return res.status(400).json({ message: `You are already registered for ${sportName}.` });
        }
        
        // Player.create() is a convenient way to build and save in one step
        const player = await Player.create({
            member: memberId,
            clubId,
            fullName,
            sportName,
            dateOfBirth: finalDateOfBirth, // නිවැරදිව format කළ දිනය යෙදීම
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

        if (!profile || profile.member.toString() !== req.user._id.toString()) {
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