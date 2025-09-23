const mongoose = require("mongoose");

const RequestedItemSchema = new mongoose.Schema({
  item: { type: String, required: true, trim: true },
  qty: { type: Number, required: true, min: 1 },
}, { _id: false });

const RegistrationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true },
  phone: { type: String, trim: true },
  registeredAt: { type: Date, default: Date.now }
}, { _id: false });

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  venue: { type: String, required: true, trim: true },
  venueFacilities: [{ type: String, trim: true }],
  requestedItems: [RequestedItemSchema],
  capacity: { type: Number, required: true, min: 1, max: 500 },
  date: { type: Date, required: true },   // date only
  startTime: { type: String, required: true }, // "HH:mm"
  endTime: { type: String, required: true },   // "HH:mm"
  status: { type: String, enum: ["pending","approved","rejected"], default: "pending" },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  registrations: { type: [RegistrationSchema], default: [] },
}, { timestamps: true });

EventSchema.virtual("registeredCount").get(function(){ return this.registrations.length; });
EventSchema.virtual("isFull").get(function(){ return this.registrations.length >= this.capacity; });

EventSchema.pre("validate", function(next){
  const today = new Date(); today.setHours(0,0,0,0);
  const maxDate = new Date(); maxDate.setMonth(maxDate.getMonth() + 3); maxDate.setHours(23,59,59,999);
  if (this.date < today) return next(new Error("Event date cannot be in the past"));
  if (this.date > maxDate) return next(new Error("Event date must be within the next 3 months"));

  const [sh, sm] = this.startTime.split(":").map(Number);
  const [eh, em] = this.endTime.split(":").map(Number);
  if ((eh*60+em) <= (sh*60+sm)) return next(new Error("End time must be after start time"));

  next();
});

module.exports = mongoose.model("Event", EventSchema);
