const Admin = require('../models/Admin');
const Member = require('../models/memberModel');
const Player = require('../models/PlayerModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// ================== Admin Registration ==================
const registerAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ msg: 'Admin with this email already exists' });
    }

    admin = new Admin({ email, password });
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);
    await admin.save();

    res.status(201).json({ msg: 'Admin registered successfully. Please proceed to login.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ================== Admin Login ==================
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    let admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Invalid Credentials' });
    }

    const payload = { id: admin.id, role: 'admin' };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          _id: admin.id,
          email: admin.email,
          name: "Administrator",
          role: 'admin',
          token: token
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ================== Dashboard Summary ==================
const getUserManagementSummary = async (req, res) => {
  try {
    const totalMembers = await Member.countDocuments({});

    const planAggregation = await Member.aggregate([
      { $group: { _id: '$membershipPlan', count: { $sum: 1 } } }
    ]);

    let membersWithPlan = 0;
    let membersWithoutPlan = 0;
    const formattedPlanCounts = { student: 0, ordinary: 0, lifeTime: 0 };

    planAggregation.forEach(group => {
      if (group._id === 'None' || !group._id) {
        membersWithoutPlan += group.count;
      } else {
        membersWithPlan += group.count;
        if (group._id === 'Student Membership') formattedPlanCounts.student = group.count;
        if (group._id === 'Ordinary Membership') formattedPlanCounts.ordinary = group.count;
        if (group._id === 'Life Time Membership') formattedPlanCounts.lifeTime = group.count;
      }
    });

    const sportCountsAggregation = await Player.aggregate([
      { $group: { _id: '$sportName', count: { $sum: 1 } } }
    ]);

    const formattedSportCounts = {};
    sportCountsAggregation.forEach(group => {
      if (group._id) {
        const key = group._id.toLowerCase().replace(/\s+/g, '');
        formattedSportCounts[key] = group.count;
      }
    });

    // Count total player registrations (not unique members)
    const totalPlayersCount = await Player.countDocuments({});

    res.json({
      totalMembers,
      membersWithPlan,
      membersWithoutPlan,
      planCounts: formattedPlanCounts,
      totalPlayers: totalPlayersCount,
      sportCounts: formattedSportCounts,
    });

  } catch (error) {
    console.error("Error fetching user management summary:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ================== Get All Members ==================
const getAllMembers = async (req, res) => {
  try {
    const members = await Member.find().select("-password");
    res.json(members);
  } catch (error) {
    console.error("Error fetching all members:", error);
    res.status(500).json({ message: "Error fetching all members" });
  }
};

// ================== Get Members by Filter ==================
const getMembersByFilter = async (req, res) => {
  try {
    const { filterType, value } = req.params;
    let query = {};

    if (filterType === 'plan-status' && value === 'active') {
      query = { membershipPlan: { $ne: 'None' } };
    } else if (filterType === 'plan-status' && value === 'inactive') {
      query = { $or: [{ membershipPlan: 'None' }, { membershipPlan: null }] };
    } else if (filterType === 'plan-name') {
      query = { membershipPlan: value };
    }

    const members = await Member.find(query).select("-password");
    res.status(200).json(members);

  } catch (error) {
    res.status(500).json({ message: 'Error fetching members by filter' });
  }
};

// ================== Get Users by Plan ==================
const getUsersByPlan = async (req, res) => {
  try {
    const planName = req.params.planName;
    const users = await Member.find({ membershipPlan: planName }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ================== Get Active Members ==================
const getActiveMembers = async (req, res) => {
  try {
    const users = await Member.find({ 
      $and: [
        { membershipPlan: { $ne: "None" } },
        { membershipPlan: { $ne: null } },
        { membershipPlan: { $exists: true } }
      ]
    }).select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching active members:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================== Get Inactive Members ==================
const getInactiveMembers = async (req, res) => {
  try {
    const users = await Member.find({
      $or: [{ membershipPlan: "None" }, { membershipPlan: null }]
    }).select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching inactive members:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================== Get All Players ==================
const getAllPlayers = async (req, res) => {
  try {
    const players = await Player.find({})
      .populate('member', 'firstName lastName email contactNumber clubId')
      .sort({ createdAt: -1 });

    const formattedPlayers = players.map(p => ({
      _id: p._id,
      firstName: p.member?.firstName,
      lastName: p.member?.lastName,
      email: p.member?.email,
      clubId: p.member?.clubId,
      sportName: p.sportName,
      skillLevel: p.skillLevel,
      contactNumber: p.contactNumber,
      createdAt: p.createdAt,
    }));

    res.json(formattedPlayers);
  } catch (error) {
    console.error("Error fetching all players:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================== Get Players by Sport ==================
const getPlayersBySport = async (req, res) => {
  try {
    const sportName = req.params.sportName;
    const players = await Player.find({ sportName: sportName })
      .populate('member', 'firstName lastName email contactNumber clubId');

    const formattedPlayers = players.map(p => ({
      _id: p._id,
      firstName: p.member?.firstName,
      lastName: p.member?.lastName,
      email: p.member?.email,
      clubId: p.member?.clubId,
      skillLevel: p.skillLevel,
      contactNumber: p.contactNumber,
      createdAt: p.createdAt,
    }));

    res.json(formattedPlayers);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ================== Delete Member ==================
const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if member exists
    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Delete associated player profiles first
    await Player.deleteMany({ member: id });

    // Delete the member
    await Member.findByIdAndDelete(id);

    res.json({ message: "Member deleted successfully" });
  } catch (error) {
    console.error("Error deleting member:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getUserManagementSummary,
  // 🟢 NEWLY ADDED
  getMembersByFilter,
  getUsersByPlan,
  getActiveMembers,
  getInactiveMembers,
  getAllPlayers,
  getPlayersBySport,
  getAllMembers,
  deleteMember
};
