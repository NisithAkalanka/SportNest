const Player = require('../models/PlayerModel');
const Member = require('../models/memberModel'); // We might need this later


const registerForSport = async (req, res) => {
    // Get form data from the request body
    const { sportName, dateOfBirth, phoneNumber, emergencyContactName, emergencyContactNumber, skillLevel, healthHistory } = req.body;
    
    // Get user info from the token (attached by our 'protect' middleware)
    const memberId = req.user._id;

    try {
        // Validation: Check if this member is ALREADY a player in THIS sport
        const existingPlayer = await Player.findOne({ member: memberId, sportName: sportName });

        if (existingPlayer) {
            return res.status(400).json({ message: `You are already registered for ${sportName}.` });
        }

        // Create a new Player record in the database
        const newPlayer = new Player({
            member: memberId,
            clubId: req.user.clubId, // Get ClubID from the logged-in user
            fullName: `${req.user.firstName} ${req.user.lastName}`, // Get Full Name from logged-in user
            sportName,
            dateOfBirth,
            phoneNumber,
            emergencyContactName,
            emergencyContactNumber,
            skillLevel,
            healthHistory
        });
        await newPlayer.save();

        // Send a success response
        res.status(201).json({ 
            message: `Congratulations! You are now officially a <strong>Player</strong> in ${sportName}!` 
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error during sport registration.' });
    }
};

module.exports = { 
   
    registerForSport 

};
