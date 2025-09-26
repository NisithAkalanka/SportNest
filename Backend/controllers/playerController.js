// File: backend/controllers/playerController.js (UPDATED & COMPLETE)

const Player = require('../models/PlayerModel');

const registerPlayer = async (req, res) => {
    // ★ 1. Frontend
    const { 
        sportName, 
        fullName, 
        clubId, // ★ clubId 
        membershipId,
        dateOfBirth, 
        contactNumber,
        emergencyContactName, 
        emergencyContactNumber, 
        skillLevel, 
        healthHistory 
    } = req.body;
    
    // middleware
    const memberId = req.user._id;

    try {
        const existingPlayer = await Player.findOne({ member: memberId, sportName: sportName });
        
        if (existingPlayer) {
            return res.status(400).json({ message: `You are already registered for ${sportName}.` });
        }
        
        
        const player = await Player.create({
            member: memberId,
            clubId, 
            fullName,
            membershipId,
            sportName,
            dateOfBirth: new Date(dateOfBirth), 
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

// ★★★ 1. ADD THE NEW FUNCTION BELOW ★★★
/**
 * @desc    Get a simplified list of players (ID and fullName) for dropdowns
 * @route   GET /api/players/simple
 * @access  Private (Coach/Admin)
 */
const getSimplePlayerList = async (req, res) => {
  try {
    // Only allow users with 'coach' or 'admin' role to access this list.
    const role = req.user?.role?.toLowerCase();
    if (role !== 'coach' && role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to access this list.' });
    }

    // Find all player profiles and select only their ID, fullName, and clubId.
    const players = await Player.find().select('_id fullName clubId').lean();

    if (!players || players.length === 0) {
        return res.status(404).json({ message: 'No player profiles have been created yet.' });
    }

    // Format the data to create a 'displayName' field for the frontend.
    const playerList = players.map(player => ({
        _id: player._id,
        displayName: player.fullName, // Using the 'fullName' field which exists in your database
        clubId: player.clubId || '',
    }));
    
    res.status(200).json(playerList);

  } catch (error) {
    console.error('Error in getSimplePlayerList:', error);
    res.status(500).json({ message: 'Server error while fetching player list.' });
  }
};


// ★★★ 2. UPDATE THE EXPORTS OBJECT ★★★
module.exports = {
    registerPlayer,
    getMyProfiles,
    updateMyProfile,
    deleteMyProfile,
    getSimplePlayerList // Add the new function name here
};