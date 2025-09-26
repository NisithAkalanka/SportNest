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

// =================================================================================
// 1. CREATE a new member (Register)
const registerMember = async (req, res) => {
    const { 
        firstName, lastName, age, nic, gender, role, email, contactNumber, password, confirmPassword 
    } = req.body;

    if (!firstName || !lastName || !email || !contactNumber|| !password || !nic ) {
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
                token: generateToken(member._id)
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

// 4. Update logged-in user's profile (with image upload support)
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
            
            // Profile picture update
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

    const resetToken = crypto.randomBytes(32).toString('hex');
    member.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    member.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    await member.save({ validateBeforeSave: false });

    try {
        const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
        const message = `Forgot your password? Click here: ${resetURL}\nIf you didn't, please ignore this email.`;
        await sendEmail({ email: member.email, subject: 'Password Reset Token', message });
        res.status(200).json({ message: 'Token sent to email!' });
    } catch (err) {
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

    if (!member) return res.status(400).json({ message: 'Token invalid or expired.' });

    member.password = req.body.password;
    member.passwordResetToken = undefined;
    member.passwordResetExpires = undefined;
    await member.save();

    const token = generateToken(member._id);
    res.status(200).json({ token });
};

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

const processMembershipPayment = async (req, res) => {
    const userId = req.user._id;
    const { membershipId, planName, planPrice, paymentMethod } = req.body;
    
    if (!membershipId || !planName || !planPrice) {
        return res.status(400).json({ message: 'Membership ID, plan name, and plan price are required.' });
    }

    try {
        const member = await Member.findById(userId);
        if (!member) {
            return res.status(404).json({ message: 'Member not found.' });
        }

        // Verify membership details match
        if (member.membershipId !== membershipId || member.membershipPlan !== planName) {
            return res.status(400).json({ message: 'Membership details do not match.' });
        }

        // Create payment record (you might want to create a MembershipPayment model)
        const paymentData = {
            membershipId,
            planName,
            amount: planPrice,
            paymentMethod: paymentMethod ? {
                cardName: paymentMethod.cardName,
                cardNumber: paymentMethod.cardNumber,
                expiryMonth: paymentMethod.expiryMonth,
                expiryYear: paymentMethod.expiryYear
            } : null,
            status: 'completed',
            transactionId: `MEM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            paymentDate: new Date()
        };

        // Update membership status to paid
        member.membershipStatus = 'Paid';
        member.paymentDate = new Date();
        await member.save();

        res.status(200).json({
            message: 'Membership payment processed successfully',
            paymentId: paymentData.transactionId,
            membershipId: member.membershipId,
            planName: member.membershipPlan,
            status: member.membershipStatus
        });

    } catch (error) {
        console.error('Membership Payment Error:', error);
        res.status(500).json({ message: 'Server error during membership payment processing.' });
    }
};

// Final exports for all functions
module.exports = {
    registerMember, loginMember, getMyUserProfile, updateMyUserProfile, deleteMyUserProfile,
    getAllMembers, getMemberById, updateMember, deleteMember,
    forgotPassword, resetPassword, subscribeToMembership,
    cancelMembership, processMembershipPayment
};
