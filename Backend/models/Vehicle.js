const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VehicleSchema = new Schema({
  vehicleId: {
    type: String,
    required: true,
    unique: true,
    default: () => `VEH-${Date.now()}`
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['Truck', 'Van', 'Bike', 'Mini Truck'],
  },
  licensePlate: {
    type: String,
    required: true,
    unique: true
  },
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
    required: true
  },
  capacityValue: {
    type: Number,
    required: true
  },
  capacityUnit: {
    type: String,
    enum:['Kg','Ton','Litre'],
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Maintenance'],
    default: 'Active'
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("Vehicle", VehicleSchema);
