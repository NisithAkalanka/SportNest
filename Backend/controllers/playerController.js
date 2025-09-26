// File: backend/controllers/playerController.js (Updated with the new logic)

const Player = require('../models/PlayerModel');
const Member = require('../models/memberModel');

/**
 * @desc    Register the logged-in member for a specific sport.
 * @note    This function is now simpler. It NO LONGER changes the member's main role.
 */
const registerPlayer = async (req, res) => {
    const { 
        sportName, fullName, clubId, membershipId, dateOfBirth, 
        contactNumber, emergencyContactName, emergencyContactNumber, skillLevel, healthHistory 
    } = req.body;
    
    const memberId = req.user._id;

    try {
        const existingPlayer = await Player.findOne({ member: memberId, sportName: sportName });
        
        if (existingPlayer) {
            return res.status(400).json({ message: `You are already registered for ${sportName}.` });
        }
        
        // Just create the player profile. No need to update the Member role anymore.
        const player = await Player.create({
            member: memberId, clubId, fullName, membershipId, sportName,
            dateOfBirth: new Date(dateOfBirth), contactNumber, emergencyContactName,
            emergencyContactNumber, skillLevel, healthHistory
        });

        res.status(201).json({ message: `Successfully registered for ${sportName}!`, player });

    } catch (error) {
        console.error("Player Registration Error:", error);
        res.status(500).json({ message: `Server error during player registration: ${error.message}` });
    }
};


/**
 * @desc    Get a simplified list of unique players for dropdowns.
 * @logic   It now fetches anyone who has at least one registration in the 'Player' collection.
 * @route   GET /api/players/simple
 * @access  Private (Coach/Admin)
 */
const getSimplePlayerList = async (req, res) => {
  try {
    // 1. Authorize: Only coaches and admins can access this. (No change here)
    const role = req.user?.role?.toLowerCase();
    if (role !== 'coach' && role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to access this list.' });
    }

    // ★★★★★★★ START: THE NEW LOGIC YOU SUGGESTED ★★★★★★★

    // 2. Find all entries in the 'Player' collection.
    //    Then, use .populate() to fetch the 'firstName', 'lastName', and 'clubId' 
    //    from the referenced 'Member' document for each player.
    const allPlayerRegistrations = await Player.find({})
                                                .populate({
                                                    path: 'member',
                                                    select: 'firstName lastName clubId' // Select only these fields from the Member model
                                                })
                                                .lean();

    if (!allPlayerRegistrations || allPlayerRegistrations.length === 0) {
        return res.status(404).json({ message: 'No players have registered for any sport yet.' });
    }
    
    // 3. Process the list to create a UNIQUE list of players.
    //    A single member might be registered for multiple sports, but we only want to show them once in the dropdown.
    const uniquePlayers = new Map();

    allPlayerRegistrations.forEach(registration => {
        // Check if the populated member data exists
        if (registration.member) {
            const memberId = registration.member._id.toString();
            // If we haven't already added this member to our map, add them now.
            if (!uniquePlayers.has(memberId)) {
                uniquePlayers.set(memberId, {
                    _id: memberId,
                    displayName: `${registration.member.firstName} ${registration.member.lastName}`,
                    clubId: registration.member.clubId || '',
                });
            }
        }
    });

    // 4. Convert the Map values to an array to send as a response.
    const playerList = Array.from(uniquePlayers.values());

    // ★★★★★★★ END: THE NEW LOGIC ★★★★★★★

    res.status(200).json(playerList);

  } catch (error) {
    console.error('Error in getSimplePlayerList:', error);
    res.status(500).json({ message: 'Server error while fetching player list.' });
  }
};


// --- Other functions (getMyProfiles, etc.) remain unchanged ---

const getMyProfiles = async (req, res) => { /* ... no changes ... */ };
const updateMyProfile = async (req, res) => { /* ... no changes ... */ };
const deleteMyProfile = async (req, res) => { /* ... no changes ... */ };


// --- EXPORTS ---
module.exports = {
    registerPlayer,
    getMyProfiles,
    updateMyProfile,
    deleteMyProfile,
    getSimplePlayerList
};