import { useState } from "react";
import { createContext } from "react";
import { toast } from 'react-toastify'
import axios from "axios"; // 1. Import axios

export const AdminContext = createContext() 

const AdminContextProvider = (props) => {
    const [aToken, setAToken] = useState(localStorage.getItem('aToken')?localStorage.getItem('aToken'): "")

    // Provide fallback backend URL if environment variable is not set
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"

    // get the all added doctors here
    const [doctors, setDoctors] = useState([]);
    const [doctorsLoading, setDoctorsLoading] = useState(false);
    const [doctorsError, setDoctorsError] = useState(null);
    const [appointments, setAppointments] = useState([]);

    /**
     * The error "Failed to load resource: the server responded with a status of 401 (Unauthorized)"
     * occurs when the backend API endpoint /api/admin/doctors is accessed with an invalid, expired,
     * or missing admin token (aToken). The backend checks for a valid Bearer token in the Authorization
     * header. If the token is not present, is expired, or is invalid, the backend responds with a 401
     * Unauthorized status, which causes this error in the browser console.
     * 
     * Common reasons:
     * - The admin is not logged in, so there is no token.
     * - The token in localStorage is expired or has been removed/invalidated.
     * - The Authorization header is missing or malformed.
     * - The backend secret or token verification logic has changed.
     * 
     * Solution: Ensure the admin is logged in and a valid token is present in localStorage.
     * If you see this error, prompt the user to log in again.
     */
    const fetchAllDoctors = async () => {
        if (!aToken) {
            setDoctorsError("No authentication token found. Please log in.");
            return;
        }

        setDoctorsLoading(true);
        setDoctorsError(null);
        try {
            console.log("Fetching doctors from:", `${backendUrl}/api/admin/doctors`);
            console.log("Using token:", aToken ? "Token present" : "No token");
            
            const res = await fetch(`${backendUrl}/api/admin/doctors`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${aToken}`,
                },
            });

            console.log("Response status:", res.status);

            if (res.status === 401) {
                // Unauthorized - likely invalid/expired token
                setDoctorsError("Unauthorized. Please log in again.");
                toast.error("Unauthorized. Please log in again.");
                setDoctors([]);
                setAToken("");
                localStorage.removeItem('aToken');
                return;
            }

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            console.log("Response data:", data);
            
            if (data.success) {
                setDoctors(data.doctors || []);
                console.log("Doctors fetched successfully:", data.doctors);
            } else {
                setDoctorsError(data.message || "Failed to fetch doctors");
                toast.error(data.message || "Failed to fetch doctors");
            }
        } catch (err) {
            console.error("Error fetching doctors:", err);
            setDoctorsError(err.message || "Failed to fetch doctors");
            toast.error(err.message || "Failed to fetch doctors");
        } finally {
            setDoctorsLoading(false);
        }
    };

    // Delete doctor function
    const deleteDoctor = async (doctorId) => {
        if (!aToken) {
            toast.error("No authentication token found. Please log in.");
            return false;
        }

        if (!doctorId) {
            toast.error("Doctor ID is required");
            return false;
        }

        try {
            console.log("Deleting doctor with ID:", doctorId);
            
            const res = await fetch(`${backendUrl}/api/admin/doctors/${doctorId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${aToken}`,
                },
            });

            console.log("Delete response status:", res.status);

            if (res.status === 401) {
                toast.error("Unauthorized. Please log in again.");
                setAToken("");
                localStorage.removeItem('aToken');
                return false;
            }

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            console.log("Delete response data:", data);
            
            if (data.success) {
                toast.success("Doctor deleted successfully");
                // Remove the deleted doctor from the local state
                setDoctors(prevDoctors => prevDoctors.filter(doctor => doctor._id !== doctorId));
                return true;
            } else {
                toast.error(data.message || "Failed to delete doctor");
                return false;
            }
        } catch (err) {
            console.error("Error deleting doctor:", err);
            toast.error(err.message || "Failed to delete doctor");
            return false;
        }
    };

    // Update doctor availability function
    const updateDoctorAvailability = async (doctorId, isAvailable) => {
        if (!aToken) {
            toast.error("No authentication token found. Please log in.");
            return false;
        }

        if (!doctorId) {
            toast.error("Doctor ID is required");
            return false;
        }

        try {
            console.log("Updating availability for doctor ID:", doctorId, "to:", isAvailable);
            // FIX 2: Use correct endpoint and method
            const res = await fetch(`${backendUrl}/api/admin/doctors/change-availability`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${aToken}`,
                },
                body: JSON.stringify({
                    id: doctorId,
                    isAvailable: isAvailable
                }),
            });

            console.log("Availability update response status:", res.status);

            if (res.status === 401) {
                toast.error("Unauthorized. Please log in again.");
                setAToken("");
                localStorage.removeItem('aToken');
                return false;
            }

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            console.log("Availability update response data:", data);

            if (data.success) {
                toast.success(data.message || `Doctor is now ${isAvailable ? 'available' : 'not available'}`);
                // Update the doctor's availability in the local state
                setDoctors(prevDoctors => 
                    prevDoctors.map(doctor => 
                        doctor._id === doctorId 
                            ? { ...doctor, isAvailable: isAvailable }
                            : doctor
                    )
                );
                return true;
            } else {
                toast.error(data.message || "Failed to update doctor availability");
                return false;
            }
        } catch (err) {
            console.error("Error updating doctor availability:", err);
            toast.error(err.message || "Failed to update doctor availability");
            return false;
        }
    };

    const getAllAppointments = async () => {
        if (!aToken) {
            toast.error("No authentication token found. Please log in."); // 3. Handle missing token
            return;
        }
        try {
            // 2. Send token as Bearer in Authorization header
            const res = await axios.get(
                backendUrl + '/api/admin/appointments',
                {
                    headers: {
                        'Authorization': `Bearer ${aToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const data = res.data;
            if (res.status === 401 || !data.success) { // 3. Handle 401
                toast.error(data.message || "Unauthorized. Please log in again.");
                setAToken("");
                localStorage.removeItem('aToken');
                setAppointments([]);
                return;
            }
            // 4. Update appointments state on success
            setAppointments(data.appointments || []);
        } catch (error) {
            toast.error(error.message || "Failed to fetch appointments");
            setAppointments([]);
        }
    }


    const value = {
        aToken,
        setAToken,
        backendUrl,
        doctors,
        setDoctors,
        doctorsLoading,
        doctorsError,
        fetchAllDoctors,
        deleteDoctor,
        updateDoctorAvailability,
        appointments,setAppointments,
        getAllAppointments,
    }
    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider