// File: backend/controllers/playerController.js (FINAL MERGED & CLEAN)

const Player = require('../models/PlayerModel');
const Member = require('../models/memberModel');

// ================== Register Player (compatible with memberId / member) ==================
const registerPlayer = async (req, res) => {
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

  const memberObjectId = req.user._id; // from protect middleware

  try {
    // Prevent duplicate registration for the same sport (supports both schemas)
    const existingPlayer = await Player.findOne({
      sportName,
      $or: [
        { memberId: memberObjectId },
        { member: memberObjectId },
      ],
    });

    if (existingPlayer) {
      return res
        .status(400)
        .json({ message: `You are already registered for ${sportName}.` });
    }

    // Payload supports both schemas; if schema is strict, unknown field will be ignored safely
    const payload = {
      memberId: memberObjectId,
      member: memberObjectId,
      clubId,
      fullName,
      membershipId,
      sportName,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      contactNumber,
      emergencyContactName,
      emergencyContactNumber,
      skillLevel,
      healthHistory,
    };

    const player = await Player.create(payload);

    return res
      .status(201)
      .json({ message: `Successfully registered for ${sportName}!`, player });
  } catch (error) {
    console.error('Player Registration Error:', error);
    return res
      .status(500)
      .json({ message: `Server error during player registration: ${error.message}` });
  }
};

// ================== Get My Profiles (supports memberId / member) ==================
const getMyProfiles = async (req, res) => {
  try {
    const myId = req.user._id;
    const playerProfiles = await Player.find({
      $or: [
        { memberId: myId },
        { member: myId },
      ],
    });
    return res.status(200).json(playerProfiles);
  } catch (error) {
    console.error('Get My Profiles Error:', error);
    return res.status(500).json({ message: 'Server error while fetching profiles.' });
  }
};

// ================== Update My Profile (by ID) ==================
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
    const isOwner =
      (player.memberId && player.memberId.toString() === req.user._id.toString()) ||
      (player.member && player.member.toString() === req.user._id.toString());

    if (!isOwner) {
      return res
        .status(403)
        .json({ message: 'User not authorized to update this profile.' });
    }

    // Field updates (only if provided)
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

// ================== Delete My Profile (by ID; owner or admin) ==================
const deleteMyProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await Player.findById(id);

    if (!profile) {
      return res.status(404).json({ message: 'Player profile not found.' });
    }

    const isOwner =
      (profile.memberId && profile.memberId.toString() === req.user._id.toString()) ||
      (profile.member && profile.member.toString() === req.user._id.toString());
    const isAdmin = (req.user.role || '').toLowerCase() === 'admin';

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this profile.' });
    }

    await Player.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Profile (registration) deleted successfully.' });
  } catch (error) {
    console.error('Delete My Profile Error:', error);
    return res.status(500).json({ message: 'Server error while deleting profile.' });
  }
};

// ================== Get Simple Player List (Coach/Admin) ==================
// Combines MAIN2 (populate Member for names/clubId) + Ayuni (fallback to Player.fullName)
const getSimplePlayerList = async (req, res) => {
  try {
    const role = (req.user?.role || '').toLowerCase();
    if (role !== 'coach' && role !== 'admin') {
      return res
        .status(403)
        .json({ message: 'Forbidden: You do not have permission to access this list.' });
    }

    // Try to populate Member details if schema supports `member` ref; otherwise still returns docs
    const registrations = await Player.find({})
      .populate({ path: 'member', select: 'firstName lastName clubId' })
      .lean();

    if (!registrations || registrations.length === 0) {
      return res.status(404).json({ message: 'No players have registered for any sport yet.' });
    }

    const unique = new Map();

    for (const reg of registrations) {
      const key = (reg.memberId?.toString?.() || reg.member?._id?.toString?.() || reg._id.toString());

      if (!unique.has(key)) {
        const displayName = reg.member && (reg.member.firstName || reg.member.lastName)
          ? `${reg.member.firstName || ''} ${reg.member.lastName || ''}`.trim()
          : (reg.fullName || 'Unknown');

        unique.set(key, {
          _id: key,
          displayName,
          clubId: (reg.member && reg.member.clubId) || reg.clubId || '',
        });
      }
    }

    const playerList = Array.from(unique.values());
    return res.status(200).json(playerList);
  } catch (error) {
    console.error('Error in getSimplePlayerList:', error);
    return res.status(500).json({ message: 'Server error while fetching player list.' });
  }
};

// --- EXPORTS ---
module.exports = {
  registerPlayer,
  getMyProfiles,
  updateMyProfile,
  deleteMyProfile,
  getSimplePlayerList,
};
