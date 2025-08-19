// routes/doctorRoute.js
import express from "express";
import { changeAvailability, getDoctorAvailability, getDoctorsList, getBookedSlots } from "../controllers/doctorController.js";
import authAdmin from "../middleware/authAdmin.js";

const router = express.Router();

// Get all doctors (public route for frontend)
router.get("/doctors", getDoctorsList);

// Get booked slots for a specific doctor (public route)
router.get("/booked-slots/:doctorId", getBookedSlots);

// Change doctor availability (protected route)
router.put("/change-availability", authAdmin, changeAvailability);

// Get doctor availability status (protected route)
router.get("/availability/:doctorId", authAdmin, getDoctorAvailability);

export default router;
