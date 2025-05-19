import { PrismaClient } from "@prisma/client";
import { logAction } from "../utils/logger.js";

const prisma = new PrismaClient();

// Add Vehicle
export const addVehicle = async (req, res) => {
  try {
    const { plateNumber, vehicleType, size, additionalAttributes } = req.body;
    const userId = req.user.id;
    const existingVehicle = await prisma.vehicle.findUnique({
    where: { plateNumber },
    });

    if (existingVehicle) {
      return res.status(400).json({ error: 'Vehicle with this plate number already exists.' });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        plateNumber,
        vehicleType,
        size,
        userId,
        additionalAttributes
      },
    });
    await logAction(userId, `Added vehicle with plate number ${plateNumber}`);
    return res.status(201).json(vehicle);
  } catch (err) {
    console.log("reached here",err);
    return res.status(500).json({ message: err.message });
  }
};

// Update Vehicle
export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { plateNumber, vehicleType, size, attributes } = req.body;
    const userId = req.user.id;

    const vehicle = await prisma.vehicle.updateMany({
      where: {
        id: parseInt(id),
        userId,
      },
      data: {
        plateNumber,
        vehicleType,
        size,
        // attributes,
      },
    });

    if (vehicle.count === 0) {
      return res.status(404).json({ message: "Vehicle not found or not authorized" });
    }
    await logAction(userId, `Updated vehicle ID ${id} with plate number ${plateNumber}`);
    return res.status(200).json({ message: "Vehicle updated" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Delete Vehicle
export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deleted = await prisma.vehicle.deleteMany({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ message: "Vehicle not found or not authorized" });
    }
    await logAction(userId, `Deleted vehicle ID ${id}`);
    return res.status(200).json({ message: "Vehicle deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// List Vehicles
// List Vehicles
export const listVehicles = async (req, res) => {
  try {
    const { page = 1, limit = 10, plateNumber, vehicleType } = req.query;
    const { id: userId, role } = req.user;

    const filters = {};
    if (role !== "ADMIN") {
      filters.userId = userId;
    }
    if (plateNumber) filters.plateNumber = { contains: plateNumber };
    if (vehicleType) filters.vehicleType = vehicleType;

    const vehicles = await prisma.vehicle.findMany({
      where: filters,
      skip: (page - 1) * limit,
      take: parseInt(limit),
    });

    await logAction(userId, `Viewed vehicle list (Role: ${role}), page: ${page}`);
    return res.status(200).json(vehicles);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
