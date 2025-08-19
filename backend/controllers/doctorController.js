import doctorModel from "../models/doctorModel.js";

// Get doctor availability status
const getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required",
      });
    }

    const doctor = await doctorModel.findById(doctorId).select('_id name email available');
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        available: doctor.available,
      },
    });
  } catch (error) {
    console.error("Error getting doctor availability:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get doctor availability",
      error: error.message,
    });
  }
};

// Change availability of doctor
const changeAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { available } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required",
      });
    }

    if (typeof available !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "Available status must be a boolean",
      });
    }

    const doctor = await doctorModel.findByIdAndUpdate(
      doctorId, 
      { available }, 
      { new: true }
    ).select('_id name email available');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Doctor availability updated successfully",
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        available: doctor.available,
      },
    });
  } catch (error) {
    console.error("Error updating doctor availability:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update doctor availability",
      error: error.message,
    });
  }
};

const getDoctorsList = async (req, res) => {
  try {
    const doctors = await doctorModel.find().select('-password');
    return res.status(200).json({
      success: true,
      doctors,
    });
  } catch (error) {
    console.error("Error fetching doctors list:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctors list",
      error: error.message,
    });
  }
};

// Get booked slots for a specific doctor
const getBookedSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required",
      });
    }

    const doctor = await doctorModel.findById(doctorId).select('slots_booked');
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    console.log('🔍 Doctor found:', doctor._id);
    console.log('🔍 Doctor slots_booked:', doctor.slots_booked);

    return res.status(200).json({
      success: true,
      bookedSlots: doctor.slots_booked || {},
    });
  } catch (error) {
    console.error("Error getting booked slots:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get booked slots",
      error: error.message,
    });
  }
};

export { changeAvailability, getDoctorAvailability, getDoctorsList, getBookedSlots };