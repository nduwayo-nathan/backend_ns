// controllers/slotController.js
import { PrismaClient } from "@prisma/client";
import { logAction } from "../utils/logger.js";

const prisma = new PrismaClient();

export const bulkCreateSlots = async (req, res) => {
  try {
    const { count, baseNumber, size, vehicleType, location } = req.body;

    // Validate input
    if (
      typeof count !== "number" ||
      !baseNumber ||
      !size ||
      count <= 0
    ) {
      return res.status(400).json({ message: "Invalid input for bulk creation." });
    }

    // Generate slot numbers
    const slots = Array.from({ length: count }, (_, index) => ({
      slotNumber: `${baseNumber}${index + 1}`,
      size,
      vehicleType: vehicleType || null,
      location: location || null,
      status: "AVAILABLE", // default status if needed
    }));

    // Insert into database
    const created = await prisma.parkingSlot.createMany({
      data: slots,
      skipDuplicates: true,
    });

    // Log the action
    await logAction(req.user.id, `Bulk created ${created.count} parking slots starting from ${baseNumber}`);

    return res.status(201).json({
      message: "Parking slots created successfully",
      count: created.count,
    });
  } catch (error) {
    console.error("Bulk slot creation failed:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


export const createSlot = async (req, res) => {
  try {
    const { slot_number, size, vehicle_type, location, status } = req.body;
    const slot = await prisma.parkingSlot.create({
      data: { slot_number, size, vehicle_type, location, status: status || "AVAILABLE" },
    });
    await logAction(req.user.id, `Created parking slot ${slot.slot_number}`);
    return res.status(201).json({message:"slot created successiful",slots:slot});
  } catch (error) {
    return res.status(403).json({ message: error.message });
  }
};

export const updateSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await prisma.parkingSlot.update({ where: { id: parseInt(id) }, data });
    await logAction(req.user.id, `Updated parking slot ID ${id}`);
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(403).json({ message: error.message });
  }
};

export const deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.parkingSlot.delete({ where: { id: parseInt(id) } });
    await logAction(req.user.id, `Deleted parking slot ID ${id}`);
    return res.status(200).json({ message: "Slot deleted" });
  } catch (error) {
    return res.status(403).json({ message: error.message });
  }
};

export const listSlots = async (req, res) => {
  try {
    const user = req.user;
    const { page = 1, limit = 10, slot_number, size, vehicle_type } = req.query;
    const skip = (page - 1) * limit;

    const filters = {};
    if (slot_number) filters.slot_number = { contains: slot_number };
    if (size) filters.size = size;
    if (vehicle_type) filters.vehicle_type = vehicle_type;
    if (user.role !== "ADMIN") filters.status = "AVAILABLE";

    const slots = await prisma.parkingSlot.findMany({
      where: filters,
      skip: parseInt(skip),
      take: parseInt(limit),
    });
    await logAction(user.id, `Viewed parking slots list (page ${page})`);
    return res.status(200).json(slots);
  } catch (error) {
    return res.status(403).json({ message: error.message });
  }
};
