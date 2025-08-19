import { createContext } from "react";
import axios from 'axios';
import { useEffect, useState } from "react";
import {toast} from "react-toastify";

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = '₹'
    
    // Backend URL configuration
    const backendUrl = "https://prescripto-backend-umb3.onrender.com"

    // State to hold doctors data and loading/error states
    const [doctorsData, setDoctorsData] = useState([]);
    const [doctorsLoading, setDoctorsLoading] = useState(false);
    const [doctorsError, setDoctorsError] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : false);
    const [userData, setUserData] = useState(null);
    const [slotsRefreshTrigger, setSlotsRefreshTrigger] = useState(0);

    // Function to trigger slot refresh across all components
    const refreshAppointmentSlots = () => {
        console.log('🔄 Triggering global slot refresh...');
        setSlotsRefreshTrigger(prev => prev + 1);
    };

    // Fetch doctors data from API on mount
    useEffect(() => {
        const fetchDoctors = async () => {
            setDoctorsLoading(true);
            setDoctorsError(null);
            try {
                console.log("🔄 Fetching doctors from:", backendUrl);
                // Fetch doctors from backend API
                const res = await fetch(`${backendUrl}/api/doctor/doctors`);
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();
                if (data.success && data.doctors) {
                    setDoctorsData(data.doctors);
                    console.log("✅ Doctors loaded successfully:", data.doctors.length);
                } else {
                    setDoctorsData([]);
                    console.log("⚠️ No doctors data received");
                }
            } catch (err) {
                console.error("❌ Error fetching doctors:", err);
                setDoctorsError(err.message);
                toast.error(`Failed to load doctors: ${err.message}`);
                setDoctorsData([]);
            } finally {
                setDoctorsLoading(false);
            }
        };
        fetchDoctors();
    }, [backendUrl]);

    // Function to refresh doctors data
    const getDoctorsData = async () => {
        setDoctorsLoading(true);
        setDoctorsError(null);
        try {
            const res = await fetch(`${backendUrl}/api/doctor/doctors`);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            if (data.success && data.doctors) {
                setDoctorsData(data.doctors);
            } else {
                setDoctorsData([]);
            }
        } catch (err) {
            setDoctorsError(err.message);
            toast.error(err.message);
        } finally {
            setDoctorsLoading(false);
        }
    };
    
    const loadUserProfileData = async () => {
        try {
            console.log("🔄 Loading user profile data...");
            console.log("🔑 Token:", token);
            console.log("🌐 Backend URL:", backendUrl);
            
            const {data} = await axios.get(backendUrl + '/api/user/get-profile', {headers:{token}})
            console.log("📡 API Response:", data);
            
            if (data.success) {
                setUserData(data.userData);
                console.log("✅ User data set successfully:", data.userData);
            } else {
                console.error("❌ API returned error:", data.message);
                toast.error(data.message || "Failed to load user profile data");
                setUserData(false);
            }
        } catch (error) {
            console.error("🔥 Error loading user profile:", error);
            if (error.response) {
                console.error("📡 Response error:", error.response.data);
                if (error.response.status === 401) {
                    console.log("🔒 Unauthorized - clearing token");
                    setToken(false);
                    localStorage.removeItem('token');
                    setUserData(false);
                }
            }
            setDoctorsError(error.message);
            toast.error(error.message);
            setUserData(false);
        }
    }


    const value = {
        doctors: doctorsData, 
        getDoctorsData,
        currencySymbol,
        doctorsLoading,
        doctorsError,
        token,setToken,
        backendUrl,
        userData,
        setUserData,
        loadUserProfileData,
        refreshUserData: loadUserProfileData,
        refreshAppointmentSlots
    }

    useEffect(() => {
        if(token) {
            loadUserProfileData();
        }   
        else {
                setUserData(false);
            }
    },[token])
    
    console.log("🎯 AppContext value:", { 
        doctorsCount: doctorsData.length, 
        doctorsLoading, 
        doctorsError,
        sampleDoctor: doctorsData[0],
        allDoctors: doctorsData,
        backendUrl,
        userData,
        setUserData,
        loadUserProfileData
    });
    
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider
