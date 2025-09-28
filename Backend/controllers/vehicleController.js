// Backend/controllers/vehicleController.js
const Vehicle = require("../models/Vehicle");

const getAllVehicles = async (req, res, next) => {
  let vehicles;
  // Get all Vehicles
  try {
    vehicles = await Vehicle.find();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching vehicles" });
  }

  // not found
  if (!vehicles) {
    return res.status(404).json({ message: "Vehicles not found" });
  }

  // Display all Vehicles
  return res.status(200).json({ vehicles });
};

//data insert
const addVehicle = async (req, res, next) => {
  const {vehicleType, licensePlate, fuelType, capacityValue, capacityUnit, status} = req.body;

  let vehicle;
  try {
    vehicle = new Vehicle({vehicleType, licensePlate, fuelType, capacityValue, capacityUnit, status});
    await vehicle.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error creating vehicle" });
  }

  // not inserted
  if (!vehicle) {
    return res.status(404).json({ message: "Unable To Add Vehicle" });
  }

  return res.status(200).json({ vehicle });
};

//Get by id
const getById = async (req, res, next) => {
  const id = req.params.id;

  let vehicle;
  try {
    vehicle = await Vehicle.findById(id);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching vehicle" });
  }
  // not available vehicle
  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found" });
  }
  return res.status(200).json({ vehicle });
};

//update Vehicle Details
const updateVehicle = async (req, res, next) => {
  const id = req.params.id;
  const {vehicleType, licensePlate, fuelType, capacityValue, capacityUnit, status} = req.body;
  let vehicle;
  try { 
    vehicle = await Vehicle.findByIdAndUpdate(
      id,
      { vehicleType, licensePlate, fuelType, capacityValue, capacityUnit, status},
      { new: true, runValidators: true }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error updating vehicle" });
  }
  if (!vehicle) {
    return res.status(404).json({ message: "Unable To Update Vehicle Details" });
  }
  return res.status(200).json({ vehicle });
};

//Delete Vehicle details
const deleteVehicle = async (req, res, next) => {
  const id = req.params.id;

  let vehicle;  
  try {
    vehicle = await Vehicle.findByIdAndDelete(id)
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error deleting vehicle" });
  }
  if (!vehicle) {
    return res.status(404).json({ message: "Unable To Delete Vehicle" });
  } 
  return res.status(200).json({ message:"Vehicle Successfully Deleted" });
};

exports.getAllVehicles = getAllVehicles;
exports.addVehicle = addVehicle;
exports.getById = getById;
exports.updateVehicle = updateVehicle;
exports.deleteVehicle = deleteVehicle;
