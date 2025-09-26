<<<<<<< Updated upstream
// Backend/controllers/playerController.js
=======
// File: backend/controllers/playerController.js (FINAL MERGED VERSION)
>>>>>>> Stashed changes

const Player = require('../models/PlayerModel');

// ================== Register Player ==================
const registerPlayer = async (req, res) => {
<<<<<<< Updated upstream
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
=======
  const {
    sportName,
    fullName,
    clubId,
    membershipId,
    dateOfBirth,
    contactNumber,
    emergencyContactName,
    emergencyContactNumber,
    skillLevel,
    healthHistory,
  } = req.body;

  const memberId = req.user._id; // from protect middleware
>>>>>>> Stashed changes

  try {
    // Prevent duplicate registration for the same sport
    const existingPlayer = await Player.findOne({ memberId, sportName });
    if (existingPlayer) {
      return res
        .status(400)
        .json({ message: `You are already registered for ${sportName}.` });
    }

    const player = await Player.create({
      memberId,
      clubId,
      fullName,
      membershipId,
      sportName,
      dateOfBirth: new Date(dateOfBirth),
      contactNumber,
      emergencyContactName,
      emergencyContactNumber,
      skillLevel,
      healthHistory,
    });

    res
      .status(201)
      .json({ message: `Successfully registered for ${sportName}!`, player });
  } catch (error) {
    console.error('Player Registration Error:', error);
    res
      .status(500)
      .json({ message: `Server error during player registration: ${error.message}` });
  }
};

// ================== Get My Profiles ==================
const getMyProfiles = async (req, res) => {
  try {
    const playerProfiles = await Player.find({ memberId: req.user._id });
    res.status(200).json(playerProfiles);
  } catch (error) {
    console.error('Get My Profiles Error:', error);
    res.status(500).json({ message: 'Server error while fetching profiles.' });
  }
};

// ================== Update My Profile ==================
const updateMyProfile = async (req, res) => {
  try {
    const {
      contactNumber,
      emergencyContactName,
      emergencyContactNumber,
      skillLevel,
      healthHistory,
    } = req.body;

    const player = await Player.findById(req.params.id);

    if (!player) {
      return res.status(404).json({ message: 'Player profile not found.' });
    }

    // Authorization: must be owner
    if (player.memberId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'User not authorized to update this profile.' });
    }

    // Field updates (only if provided)
    player.contactNumber = contactNumber || player.contactNumber;
    player.emergencyContactName = emergencyContactName || player.emergencyContactName;
    player.emergencyContactNumber =
      emergencyContactNumber || player.emergencyContactNumber;
    player.skillLevel = skillLevel || player.skillLevel;
    player.healthHistory = healthHistory ?? player.healthHistory;

    const updatedPlayer = await player.save();
    res.status(200).json(updatedPlayer);
  } catch (error) {
    console.error('Player Profile Update Error:', error);
    res.status(500).json({ message: 'Server error while updating player profile.' });
  }
};

// ================== Delete My Profile (by ID) ==================
const deleteMyProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await Player.findById(id);

    if (!profile) {
      return res.status(404).json({ message: 'Player profile not found.' });
    }

    // Permission check (Owner OR Admin)
    const isOwner = profile.memberId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this profile.' });
    }

    await Player.findByIdAndDelete(id);
    res.status(200).json({ message: 'Profile (registration) deleted successfully.' });
  } catch (error) {
    console.error('Delete My Profile Error:', error);
    res.status(500).json({ message: 'Server error while deleting profile.' });
  }
};

<<<<<<< Updated upstream
module.exports = {
    registerPlayer,
    getMyProfiles,
    updateMyProfile,
    deleteMyProfile
};
=======
// ================== Get Simple Player List ==================
const getSimplePlayerList = async (req, res) => {
  try {
    const role = req.user?.role?.toLowerCase();
    if (role !== 'coach' && role !== 'admin') {
      return res
        .status(403)
        .json({ message: 'Forbidden: You do not have permission to access this list.' });
    }

    const players = await Player.find().select('_id fullName clubId').lean();

    if (!players || players.length === 0) {
      return res
        .status(404)
        .json({ message: 'No player profiles have been created yet.' });
    }

    const playerList = players.map((player) => ({
      _id: player._id,
      displayName: player.fullName,
      clubId: player.clubId || '',
    }));

    res.status(200).json(playerList);
  } catch (error) {
    console.error('Error in getSimplePlayerList:', error);
    res.status(500).json({ message: 'Server error while fetching player list.' });
  }
};

module.exports = {
  registerPlayer,
  getMyProfiles,
  updateMyProfile,
  deleteMyProfile,
  getSimplePlayerList,
};
>>>>>>> Stashed changes
