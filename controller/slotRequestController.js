import { PrismaClient, RequestStatus, SlotStatus } from '@prisma/client';
import { logAction } from "../utils/logger.js";
import { sendApprovalEmail } from '../utils/mailer.js';
const prisma = new PrismaClient();

// ✅ Create Request
export const createSlotRequest = async (req, res) => {
  try {
    const { vehicleId } = req.body;
    const userId = req.user.id;

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle || vehicle.userId !== userId) {
      return res.status(404).json({ message: "Vehicle not found or not yours." });
    }

    const request = await prisma.slotRequest.create({
      data: {
        vehicleId,
        userId,
        slotNumber: "TBD",
        slotId: 1, // placeholder, actual slot assigned after approval
      },
    });
     await logAction(userId, `Created a new slot request for vehicle ${vehicleId}`);
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update Request (only pending)
export const updateSlotRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { vehicleId } = req.body;

    const request = await prisma.slotRequest.findUnique({ where: { id: parseInt(id) } });

    if (!request || request.requestStatus !== "PENDING" || request.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized or not updatable." });
    }

    await prisma.slotRequest.update({
      where: { id: parseInt(id) },
      data: { vehicleId },
    });
   await logAction(req.user.id, `Updated slot request ID ${id} with new vehicle ID ${vehicleId}`);
    res.json({ message: "Slot request updated." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ Delete Request
export const deleteSlotRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await prisma.slotRequest.deleteMany({
      where: {
        id: parseInt(id),
        userId: req.user.id,
        requestStatus: "PENDING",
      },
    });

    if (deleted.count === 0)
      return res.status(404).json({ message: "No deletable request found." });

    await logAction(req.user.id, `Deleted slot request ID ${id}`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Approve / Reject by Admin
export const handleRequestApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, plateNumber,slotId } = req.body; 
    
    console.log(id,status,plateNumber,slotId);
    

    if (req.user.role !== "ADMIN")
      return res.status(403).json({ message: "Admins only." });

    const request = await prisma.slotRequest.findUnique({
      where: { id: parseInt(id) },
      include: {
        vehicle: true,
        user: true,
      },
    });

    if (!request) return res.status(404).json({ message: "Request not found." });

    if (status === "APPROVED") {
      const slot = await prisma.parkingSlot.findFirst({
        where: {
          status: "AVAILABLE",
          vehicleType: request.vehicle.vehicleType,
          size: request.vehicle.size,
        },
      });

      if (!slot) {
        return res.status(404).json({ message: "No available compatible slot." });
      }

      // Update vehicle plate number if provided
      if (plateNumber && plateNumber !== request.vehicle.plateNumber) {
        await prisma.vehicle.update({
          where: { id: request.vehicle.id },
          data: { plateNumber },
        });
      }

      // Mark slot as OCCUPIED
      await prisma.parkingSlot.update({
        where: { id: slot.id },
        data: { status: "OCCUPIED" },
      });

      // Update the slotRequest
      const updatedRequest = await prisma.slotRequest.update({
        where: { id: request.id },
        data: {
          requestStatus: "APPROVED",
          slotId: slot.id,
          slotNumber: slot.slotNumber,
        },
        include: { vehicle: true },
      });

      await logAction(req.user.id, `Admin approved request ID ${id}`);

      await sendApprovalEmail(
        request.user.email,
        slot.slotNumber,
        plateNumber || request.vehicle.plateNumber,
        new Date()
      );

      return res.json({ message: "Approved and slot assigned.", slot });
    }

    // If rejected
    await prisma.slotRequest.update({
      where: { id: request.id },
      data: { requestStatus: "REJECTED" },
    });

    await logAction(req.user.id, `Admin rejected request ID ${id}`);
    return res.json({ message: "Request rejected." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};



//  List Requests
export const listRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, vehicleType } = req.query;
    const skip = (page - 1) * limit;
    const filters = {};
  

    if (status) filters.requestStatus = status;
    if (req.user.role !== "ADMIN") {
      filters.userId = req.user.id;
    }

    const requests = await prisma.slotRequest.findMany({
      where: filters,
      skip: parseInt(skip),
      take: parseInt(limit),
      include: { vehicle: true, slot: true },
    });
    await logAction(req.user.id, `Viewed parking slot requests list (page ${page})`);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
