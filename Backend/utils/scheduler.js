const cron = require('node-cron');
const Member = require('../models/memberModel');
const sendEmail = require('./email');

// 1. දින 3කින් කල් ඉකුත් වන අයට Reminder යැවීමේ කාර්යය
const sendRenewalReminders = async () => {
    console.log('[Scheduler] Reminder කාර්යය ක්‍රියාත්මක වේ...');
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const startOfDay = new Date(threeDaysFromNow.setHours(0, 0, 0, 0));
    const endOfDay = new Date(threeDaysFromNow.setHours(23, 59, 59, 999));

    try {
        const membersToExpire = await Member.find({
            membershipStatus: 'Active',
            membershipExpiresAt: { $gte: startOfDay, $lt: endOfDay }
        });

        if (membersToExpire.length > 0) {
            console.log(`[Scheduler] Reminder යැවීමට ${membersToExpire.length} දෙනෙකු හමුවිය.`);
            for (const member of membersToExpire) {
                // ... (Email යැවීමේ කේතය මෙතන තිබිය යුතුය) ...
            }
        }
    } catch (error) {
        console.error('[Scheduler] Reminder යැවීමේදී දෝෂයක්:', error);
    }
};


// ★★★ 2. කල් ඉකුත් වූ සාමාජිකයින්ගේ Status එක 'Expired' ලෙස වෙනස් කිරීමේ කාර්යය ★★★
const updateExpiredMemberships = async () => {
    console.log('[Scheduler] කල් ඉකුත් වූ සාමාජිකයින් සෙවීමේ කාර්යය ක්‍රියාත්මක වේ...');
    const now = new Date();
    try {
        const result = await Member.updateMany(
            { 
                membershipExpiresAt: { $lt: now }, // කල් ඉකුත්වීමේ දිනය අදට වඩා පැරණි
                membershipStatus: 'Active' // නමුත් තවමත් 'Active' ලෙස ඇති අය
            },
            { 
                $set: { membershipStatus: 'Expired' } // ඔවුන්ගේ Status එක 'Expired' ලෙස වෙනස් කරන්න
            }
        );

        if (result.nModified > 0) {
            console.log(`[Scheduler] සාමාජිකයින් ${result.nModified} දෙනෙකුගේ සාමාජිකත්වය 'Expired' ලෙස යාවත්කාලීන කරන ලදී.`);
        }
    } catch (error) {
        console.error('[Scheduler] කල් ඉකුත් වූ සාමාජිකත්ව යාවත්කාලීන කිරීමේදී දෝෂයක්:', error);
    }
};


// ★★★ ප්‍රධාන Job එක ★★★
const startScheduledJobs = () => {
    // සෑම දිනකම උදේ 9 ට, reminder යැවීම
    cron.schedule('0 9 * * *', sendRenewalReminders);

    // සෑම දිනකම උදේ 1 ට, කල් ඉකුත් වූ සාමාජිකත්ව යාවත්කාලීන කිරීම
    cron.schedule('0 1 * * *', updateExpiredMemberships);

    console.log("Starting automatic scheduling (Cron Jobs).");
};

module.exports = startScheduledJobs;