const cron = require('node-cron');
const Member = require('../models/memberModel');
const sendEmail = require('./email');

// send reminder email to members whose membership is expiring in 3 days
// and update membership status to 'Expired' for those whose membership has expired
const sendRenewalReminders = async () => {
    console.log('[Scheduler] Reminder started...');
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
            console.log(`[Scheduler] Reminder send ${membersToExpire.length} found two users.`);
            for (const member of membersToExpire) {
                
            }
        }
    } catch (error) {
        console.error('[Scheduler] Reminder යැවීමේදී දෝෂයක්:', error);
    }
};


// display the members whose membership has expired and update their status to 'Expired'
const updateExpiredMemberships = async () => {
    console.log('[Scheduler] කල් ඉකුත් වූ සාමාජිකයින් සෙවීමේ කාර්යය ක්‍රියාත්මක වේ...');
    const now = new Date();
    try {
        const result = await Member.updateMany(
            { 
                membershipExpiresAt: { $lt: now }, // past date
                membershipStatus: 'Active' // but still marked as Active
            },
            { 
                $set: { membershipStatus: 'Expired' } // change status to Expired
            }
        );

        if (result.nModified > 0) {
            console.log(`[Scheduler] users ${result.nModified} updated membership of two membership.`);
        }
    } catch (error) {
        console.error('[Scheduler] update when expired membership:', error);
    }
};


// main function to start scheduled jobs
const startScheduledJobs = () => {
    // every day at 9 AM, send renewal reminders
    cron.schedule('0 9 * * *', sendRenewalReminders);

    // every day at 1 AM, update expired memberships
    cron.schedule('0 1 * * *', updateExpiredMemberships);

    console.log("Starting automatic scheduling (Cron Jobs).");
};

module.exports = startScheduledJobs;