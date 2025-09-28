const Player = require('../models/PlayerModel');

// ================== Register Player (Schema-safe) ==================
const registerPlayer = async (req, res) => {
  const {
    sportName, fullName, clubId, membershipId, dateOfBirth, contactNumber,
    emergencyContactName, emergencyContactNumber, skillLevel, healthHistory,
  } = req.body;

  const sport = req.body.sport || req.body.selectedSport || req.body.sportName || req.body.game || req.body.discipline;

  // req.user._id comes from your authentication middleware (e.g., 'protect')
  const memberObjectId = req.user?._id; 

  try {
    if (!memberObjectId) {
      return res.status(401).json({ message: 'Unauthorized. You must be logged in to register as a player.' });
    }
      
    // ★★★ නිවැරදි කරන ලදී: Check if a Player Profile for this member already exists ★★★
    const existingProfile = await Player.findOne({ member: memberObjectId, sportName: sport });

    if (existingProfile) {
      return res.status(409).json({ message: 'You are already registered for this sport.' });
    }

    // Create the new player profile document
    const player = await Player.create({
      member: memberObjectId, // ★★★ නිවැරදි කරන ලදී: Using the corrected 'member' field name ★★★
      clubId,
      fullName,
      membershipId,
      sportName: sport,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      contactNumber,
      emergencyContactName,
      emergencyContactNumber,
      skillLevel,
      healthHistory,
    });

    return res.status(201).json({ message: `Successfully registered for ${sport || sportName}!`, player });

  } catch (error) {
    console.error('Player Registration Error:', error);
    // Handle potential duplicate key error on 'member' field gracefully
    if (error.code === 11000) {
        return res.status(400).json({ message: 'A player profile for this member already exists.' });
    }
    return res.status(500).json({ message: `Server error during player registration: ${error.message}` });
  }
};

// ================== Get My Profiles (Schema-safe) ==================
const getMyProfiles = async (req, res) => {
  try {
    const myId = req.user?._id;
    if (!myId) return res.status(401).json({ message: 'Unauthorized' });

    // ★★★ නිවැරදි කරන ලදී: Querying using the 'member' field ★★★
    const playerProfiles = await Player.find({ member: myId });

    return res.status(200).json(playerProfiles);
  } catch (error) {
    console.error('Get My Profiles Error:', error);
    return res.status(500).json({ message: 'Server error while fetching profiles.' });
  }
};


// ================== Update My Profile (by profile ID) ==================
const updateMyProfile = async (req, res) => {
    try {
        const { contactNumber, emergencyContactName, emergencyContactNumber, skillLevel, healthHistory } = req.body;
        const player = await Player.findById(req.params.id);

        if (!player) {
            return res.status(404).json({ message: 'Player profile not found.' });
        }
        
        // ★★★ නිවැරදි කරන ලදී: Authorization check using the 'member' field ★★★
        const isOwner = player.member && player.member.toString() === req.user?._id?.toString();

        if (!isOwner) {
            return res.status(403).json({ message: 'User not authorized to update this profile.' });
        }

        player.contactNumber = contactNumber ?? player.contactNumber;
        player.emergencyContactName = emergencyContactName ?? player.emergencyContactName;
        player.emergencyContactNumber = emergencyContactNumber ?? player.emergencyContactNumber;
        player.skillLevel = skillLevel ?? player.skillLevel;
        player.healthHistory = healthHistory ?? player.healthHistory;

        const updatedPlayer = await player.save();
        return res.status(200).json(updatedPlayer);
    } catch (error) {
        console.error('Player Profile Update Error:', error);
        return res.status(500).json({ message: 'Server error while updating player profile.' });
    }
};

// ================== Delete My Profile (by profile ID) ==================
const deleteMyProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await Player.findById(id);

    if (!profile) {
      return res.status(404).json({ message: 'Player profile not found.' });
    }

    // ★★★ නිවැරදි කරන ලදී: Authorization check using the 'member' field ★★★
    const isOwner = profile.member && profile.member.toString() === req.user?._id?.toString();
    const isAdmin = (req.user?.role || '').toLowerCase() === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this profile.' });
    }

    await Player.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Profile (registration) deleted successfully.' });
  } catch (error) {
    console.error('Delete My Profile Error:', error);
    return res.status(500).json({ message: 'Server error while deleting profile.' });
  }
};

// ================== Get Simple Player List (For Coach/Admin) ==================
const getSimplePlayerList = async (req, res) => {
    try {
        const role = (req.user?.role || '').toLowerCase();
        if (role !== 'coach' && role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: You do not have permission.' });
        }

        // ★★★ නිවැරදි කරන ලදී: Populate works correctly now with the 'member' path ★★★
        const registrations = await Player.find({}).populate({
            path: 'member',
            select: 'firstName lastName clubId'
        }).lean();

        if (!registrations || registrations.length === 0) {
            return res.status(200).json([]);
        }

        // The logic to create a unique list is still good
        const playerList = registrations
            .filter(reg => reg.member) // Only include profiles that have a linked member
            .map(reg => ({
                _id: reg.member._id, // Send the MEMBER's ID to the frontend
                displayName: `${reg.member.firstName || ''} ${reg.member.lastName || ''}`.trim(),
                clubId: reg.member.clubId || '',
            }));
            
        return res.status(200).json(playerList);

    } catch (error) {
        console.error('Error in getSimplePlayerList:', error);
        return res.status(500).json({ message: 'Server error while fetching player list.' });
    }
};

module.exports = {
  registerPlayer,
  getMyProfiles,
  updateMyProfile,
  deleteMyProfile,
  getSimplePlayerList,//nethmi
};