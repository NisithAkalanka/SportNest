// backend/controllers/memberController.js
const Member = require('../models/memberModel');
const Player = require('../models/PlayerModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

// Helper function to generate a JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const generateNextClubId = async () => {
    let clubId;
    let isUnique = false;
    while (!isUnique) {
        const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
        clubId = `C-${randomNumber}`;
        const existingMember = await Member.findOne({ clubId });
        if (!existingMember) {
            isUnique = true;
        }
    }
    return clubId;
};

// ===================== MEMBERSHIP PLANS =====================
const getMembershipPlans = async (req, res) => {
    try {
        // Updated plans with new prices
        const plans = [
            {
                id: 1,
                name: 'Student Membership',
                price: 20000,
                duration: '6 Months',
                features: ['Access to all clubs', 'Online booking system', 'Basic support']
            },
            {
                id: 2,
                name: 'Ordinary Membership',
                price: 60000,
                duration: '1 Year',
                features: ['All Student features', 'Priority booking', 'Monthly newsletter']
            },
            {
                id: 3,
                name: 'Life Time Membership',
                price: 100000,
                duration: 'life',
                features: ['All Features Included']
            }
        ];
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching plans.' });
    }
};

// =================================================================================
// 1. CREATE a new member (Register)
const registerMember = async (req, res) => {
    const { firstName, lastName, age, nic, gender, role, email, contactNumber, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !email || !contactNumber || !password || !nic) {
        return res.status(400).json({ message: 'Please fill all required fields' });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match!' });
    }
    try {
        const userExists = await Member.findOne({ $or: [{ email }, { nic }] });
        if (userExists) {
            return res.status(400).json({ message: 'Member with this Email or NIC already exists' });
        }

        const clubId = await generateNextClubId();
        const newMember = new Member({
            firstName, lastName, gender, age, nic, email, contactNumber, password, role, clubId,
        });

        const savedMember = await newMember.save();
        if (savedMember) {
            res.status(201).json({
                _id: savedMember._id,
                firstName: savedMember.firstName,
                lastName: savedMember.lastName,
                email: savedMember.email,
                role: savedMember.role,
                clubId: savedMember.clubId,
                contactNumber: savedMember.contactNumber,
                profileImage: savedMember.profileImage,
                token: generateToken(savedMember._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid member data' });
        }
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

// 2. Login a member
const loginMember = async (req, res) => {
    const { email, password } = req.body;
    try {
        const member = await Member.findOne({ email });
        if (member && (await member.matchPassword(password))) {
            // ★★★ DEBUGGING: Token සෑදීමට පෙර පරීක්ෂා කිරීම ★★★
            console.log("\n--- BACKEND LOGIN CHECK ---");
            console.log("User found in DB. ID to be used in token:", member._id);
            console.log("-------------------------\n");

            res.status(200).json({
                _id: member._id,
                clubId: member.clubId,
                firstName: member.firstName,
                lastName: member.lastName,
                email: member.email,
                role: member.role,
                contactNumber: member.contactNumber,
                profileImage: member.profileImage,
                membershipId: member.membershipId,
                membershipPlan: member.membershipPlan,
                membershipStatus: member.membershipStatus,
                token: generateToken(member._id) // ✅ fixed: direct call with member._id
            });
        } else {
            res.status(401).json({ message: 'Login failed. Please check your credentials.' });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error while logging in.' });
    }
};

// 3. Get logged-in user's full profile
const getMyUserProfile = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Not authorized' });

        const memberDetails = await Member.findById(userId).select('-password');
        if (!memberDetails) return res.status(404).json({ message: 'User not found.' });

        const playerProfiles = await Player.find({ member: userId });
        res.status(200).json({ memberDetails, playerProfiles });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error while fetching profile data.' });
    }
};

// 4. Update logged-in user's profile
const updateMyUserProfile = async (req, res) => {
    try {
        const member = await Member.findById(req.user.id);
        if (member) {
            member.firstName = req.body.firstName || member.firstName;
            member.lastName = req.body.lastName || member.lastName;
            member.email = req.body.email || member.email;
            member.contactNumber = req.body.contactNumber || member.contactNumber;
            member.age = req.body.age || member.age;
            member.nic = req.body.nic || member.nic;
            member.gender = req.body.gender || member.gender;

            if (req.file) {
                member.profileImage = `/uploads/profilePics/${req.file.filename}`;
            }

            const updatedMember = await member.save();
            res.status(200).json({
                _id: updatedMember._id,
                firstName: updatedMember.firstName,
                lastName: updatedMember.lastName,
                email: updatedMember.email,
                role: updatedMember.role,
                clubId: updatedMember.clubId,
                contactNumber: updatedMember.contactNumber,
                profileImage: updatedMember.profileImage,
                membershipId: updatedMember.membershipId,
                membershipPlan: updatedMember.membershipPlan,
                membershipStatus: updatedMember.membershipStatus,
                token: generateToken(updatedMember._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: 'Server error while updating profile.' });
    }
};

// 5. Delete the logged-in user's account
const deleteMyUserProfile = async (req, res) => {
    try {
        const member = await Member.findById(req.user.id);
        if (!member) return res.status(404).json({ message: "User not found." });
        await Player.deleteMany({ member: req.user.id });
        await member.deleteOne();
        res.status(200).json({ message: "Account has been permanently deleted." });
    } catch (error) {
        console.error("Error deleting user profile:", error);
        res.status(500).json({ message: "Server error while deleting account." });
    }
};

// 6. Get all members (Admin)
const getAllMembers = async (req, res) => {
    try {
        const members = await Member.find({});
        res.status(200).json(members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 7. Get member by ID (Admin)
const getMemberById = async (req, res) => {
    const { id } = req.params;
    try {
        const member = await Member.findById(id);
        if (!member) { return res.status(404).json({ message: 'Member not found' }); }
        res.status(200).json(member);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 8. Update member (Admin)
const updateMember = async (req, res) => {
    const { id } = req.params;
    try {
        const member = await Member.findById(id);
        if (!member) { return res.status(404).json({ message: 'Member not found' }); }
        member.firstName = req.body.firstName || member.firstName;
        member.lastName = req.body.lastName || member.lastName;
        member.email = req.body.email || member.email;
        member.contactNumber = req.body.contactNumber || member.contactNumber;
        member.role = req.body.role || member.role;

        if (req.file) {
            member.profileImage = `/uploads/profilePics/${req.file.filename}`;
        }

        const updatedMember = await member.save();
        res.status(200).json({
            _id: updatedMember._id,
            clubId: updatedMember.clubId,
            name: `${updatedMember.firstName} ${updatedMember.lastName}`,
            email: updatedMember.email,
            role: updatedMember.role,
            profileImage: updatedMember.profileImage,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 9. Delete member (Admin)
const deleteMember = async (req, res) => {
    const { id } = req.params;
    try {
        const member = await Member.findById(id);
        if (!member) { return res.status(404).json({ message: 'Member not found' }); }
        await Player.deleteMany({ member: id });
        await member.deleteOne();
        res.status(200).json({ message: "Member has been permanently deleted." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Password Reset Functions
const forgotPassword = async (req, res) => {
    const member = await Member.findOne({ email: req.body.email });
    if (!member) return res.status(404).json({ message: 'No user with that email.' });

    const resetToken = member.createPasswordResetToken();
    await member.save({ validateBeforeSave: false });

    try {
        const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        const messageHtml = `
            <p>Hi ${member.firstName || 'there'},</p>
            <p>You requested a password reset for your SportNest account. Click the link below to reset your password. This link is valid for 10 minutes.</p>
            <p><a href="${resetURL}" target="_blank" rel="noopener noreferrer">Reset your password</a></p>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p>— SportNest Team</p>
        `;

        await sendEmail({
            to: member.email,
            subject: 'SportNest - Password Reset Request',
            html: messageHtml
        });

        res.status(200).json({ message: 'Token sent to email!' });
    } catch (err) {
        console.error('Error sending reset email:', err);
        member.passwordResetToken = undefined;
        member.passwordResetExpires = undefined;
        await member.save({ validateBeforeSave: false });
        res.status(500).json({ message: 'Error sending email. Try again later.' });
    }
};

const resetPassword = async (req, res) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const member = await Member.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    if (!member) return res.status(400).json({ message: 'Token is invalid or has expired.' });

    member.password = req.body.password;
    member.passwordResetToken = undefined;
    member.passwordResetExpires = undefined;
    await member.save();

    res.status(200).json({ message: "Password reset successfully. You can now login." });
};

// Membership Subscription
const subscribeToMembership = async (req, res) => {
    const userId = req.user._id;
    const { clubId, planName } = req.body;
    if (!clubId || !planName) return res.status(400).json({ message: 'Club ID and Plan Name are required.' });
    try {
        const member = await Member.findById(userId);
        if (!member) return res.status(404).json({ message: 'Member not found.' });
        const membershipId = 'MEM-' + Math.floor(100000 + Math.random() * 900000);
        member.membershipId = membershipId;
        member.membershipPlan = planName;
        member.membershipStatus = 'Active';
        if (!member.clubId) { member.clubId = clubId; }
        const updatedMember = await member.save();
        res.status(200).json({
            _id: updatedMember._id,
            firstName: updatedMember.firstName,
            lastName: updatedMember.lastName,
            email: updatedMember.email,
            role: updatedMember.role,
            clubId: updatedMember.clubId,
            contactNumber: updatedMember.contactNumber,
            profileImage: updatedMember.profileImage,
            membershipId: updatedMember.membershipId,
            membershipPlan: updatedMember.membershipPlan,
            membershipStatus: updatedMember.membershipStatus,
            token: generateToken(updatedMember._id),
        });
    } catch (error) {
        console.error('Subscription Error:', error);
        res.status(500).json({ message: 'Server error during membership subscription.' });
    }
};

const cancelMembership = async (req, res) => {
    const userId = req.user._id;
    try {
        const member = await Member.findById(userId);
        if (!member) {
            return res.status(404).json({ message: "Member not found." });
        }
        member.membershipId = undefined;
        member.membershipPlan = undefined;
        member.membershipStatus = 'Cancelled';
        const updatedMember = await member.save();
        res.status(200).json({
            _id: updatedMember._id,
            firstName: updatedMember.firstName,
            lastName: updatedMember.lastName,
            email: updatedMember.email,
            role: updatedMember.role,
            clubId: updatedMember.clubId,
            contactNumber: updatedMember.contactNumber,
            profileImage: updatedMember.profileImage,
            membershipId: updatedMember.membershipId,
            membershipPlan: updatedMember.membershipPlan,
            membershipStatus: updatedMember.membershipStatus,
            token: generateToken(updatedMember._id),
        });
    } catch (error) {
        console.error("Error cancelling membership:", error);
        res.status(500).json({ message: "Server error while cancelling membership." });
    }
};

const renewMembership = async (req, res) => {
    try {
        const { newPlan } = req.body;
        if (!newPlan) {
            return res.status(400).json({ message: 'New plan is required for renewal.' });
        }

        const member = await Member.findById(req.user.id);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        member.membershipPlan = newPlan;
        member.membershipStatus = 'Active';

        if (newPlan === 'Life Membership') {
            member.membershipExpiresAt = new Date(new Date().setFullYear(new Date().getFullYear() + 100));
        } else {
            member.membershipExpiresAt = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
        }

        const updatedMember = await member.save();

        res.status(200).json({
            _id: updatedMember._id,
            clubId: updatedMember.clubId,
            firstName: updatedMember.firstName,
            lastName: updatedMember.lastName,
            email: updatedMember.email,
            role: updatedMember.role,
            contactNumber: updatedMember.contactNumber,
            profileImage: updatedMember.profileImage,
            membershipId: updatedMember.membershipId,
            membershipPlan: updatedMember.membershipPlan,
            membershipStatus: updatedMember.membershipStatus,
            token: generateToken(updatedMember._id),
        });

    } catch (error) {
        console.error("Membership Renewal Error:", error);
        res.status(500).json({ message: "Server error during membership renewal." });
    }
};

module.exports = {
    registerMember,
    loginMember,
    getMyUserProfile,
    updateMyUserProfile,
    deleteMyUserProfile,
    getAllMembers,
    getMemberById,
    updateMember,
    deleteMember,
    forgotPassword,
    resetPassword,
    getMembershipPlans,
    subscribeToMembership,
    cancelMembership,
    renewMembership
};
