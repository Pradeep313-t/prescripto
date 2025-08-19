// routes/adminRouter.js
import express from "express";
import { addDoctor, loginAdmin, getAllDoctors, deleteDoctor, appointmentAdmin } from "../controllers/adminController.js";
import upload from "../middleware/multer.js";
import authAdmin from "../middleware/authAdmin.js";
import { changeAvailability } from "../controllers/doctorController.js";

const router = express.Router();

// Admin login
router.post("/login", loginAdmin);

// Add doctor (protected route)
router.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);

// Get all doctors (protected route)
// Get all doctors and their paths (protected route)
router.get("/doctors", authAdmin, getAllDoctors);

// Delete doctor (protected route)
router.delete("/doctors/:id", authAdmin, deleteDoctor);

// Get the path of a specific doctor by ID (protected route)
router.get("/doctors/:id/path", authAdmin, (req, res) => {
  // Example: return the path for the doctor resource
  const doctorId = req.params.id;
  res.json({
    success: true,
    path: `/api/admin/doctors/${doctorId}`
  });
});

// Change doctor availability (protected route)
router.post("/doctors/change-availability", authAdmin, changeAvailability);

router.get("/appointments", authAdmin, appointmentAdmin);


export default router;


