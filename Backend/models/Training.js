const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
    coach: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Member' // ← correct reference
    },
    title: {
        type: String,
        required: [true, 'කරුණාකර මාතෘකාවක් ඇතුළත් කරන්න'],
        trim: true
    },
    date: {
        type: Date,
        required: [true, 'කරුණාකර දිනයක් තෝරන්න']
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    location: {
        type: String,
        trim: true
    },
    capacity: {
        type: Number,
        required: true,
        min: [1, 'Capacity must be at least 1'],
        max: [500, 'Capacity cannot exceed 500'],
        default: 20
    },
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Member'
        }
    ]
}, {
    timestamps: true
});

// --- 🔴 Prevent overlapping sessions (DB-level validation) ---
trainingSchema.pre('save', async function (next) {
    const Training = mongoose.model('Training');

    const newStart = new Date(`${this.date.toISOString().split("T")[0]}T${this.startTime}`);
    const newEnd = new Date(`${this.date.toISOString().split("T")[0]}T${this.endTime}`);

    if (newEnd <= newStart) {
        return next(new Error("❌ End time must be after start time."));
    }

    const conflict = await Training.findOne({
        _id: { $ne: this._id }, // ignore self when editing
        location: this.location,
        date: this.date,
        $or: [
            {
                $and: [
                    { startTime: { $lt: this.endTime } },
                    { endTime: { $gt: this.startTime } }
                ]
            }
        ]
    });

    if (conflict) {
        return next(new Error("⚠️ Session conflict: another session exists at this venue & time."));
    }

    next();
});

const Training = mongoose.model('Training', trainingSchema);
module.exports = Training;
