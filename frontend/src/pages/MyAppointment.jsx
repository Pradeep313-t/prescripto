import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from "../context/AppContext"
import axios from 'axios';
import { toast } from 'react-toastify';

const MyAppointment = () => {

  const { backendUrl, token, getDoctorsData, refreshAppointmentSlots } = useContext(AppContext)

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const slotDateFormat = (slotDate) => {
    console.log('🔍 slotDateFormat called with:', slotDate);
    
    if (!slotDate) {
      return 'Date not available';
    }
    
    // Try different date formats
    let day, month, year;
    
    // Format 1: "25_7_2024" (day_month_year)
    if (slotDate.includes('_')) {
      const dateArray = slotDate.split("_");
      if (dateArray.length === 3) {
        day = dateArray[0];
        month = Number(dateArray[1]);
        year = dateArray[2];
      }
    }
    // Format 2: "2024-07-25" (ISO date)
    else if (slotDate.includes('-')) {
      const dateArray = slotDate.split("-");
      if (dateArray.length === 3) {
        year = dateArray[0];
        month = Number(dateArray[1]);
        day = dateArray[2];
      }
    }
    // Format 3: "25/7/2024" (day/month/year)
    else if (slotDate.includes('/')) {
      const dateArray = slotDate.split("/");
      if (dateArray.length === 3) {
        day = dateArray[0];
        month = Number(dateArray[1]);
        year = dateArray[2];
      }
    }
    // Format 4: Direct Date object or timestamp
    else if (typeof slotDate === 'number' || slotDate instanceof Date) {
      const date = new Date(slotDate);
      if (!isNaN(date.getTime())) {
        day = date.getDate();
        month = date.getMonth() + 1; // getMonth() returns 0-11
        year = date.getFullYear();
      }
    }
    
    // Validate the parsed values
    if (day && month && year && month >= 1 && month <= 12) {
      return `${day} ${months[month]} ${year}`;
    }
    
    // If all parsing fails, return the original date or a fallback
    console.log('⚠️ Could not parse date format, returning original:', slotDate);
    return slotDate || 'Date not available';
  }

  const getUserAppointments = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching appointments...');
      console.log('🔑 Token:', token);
      console.log('🌐 Backend URL:', backendUrl);
      
      const { data} = await axios.get(backendUrl + '/api/user/appointments',{headers:{token}})

      if (data.success) {
        console.log('✅ Appointments fetched successfully:', data.appointments);
        console.log('🔍 First appointment structure:', data.appointments[0]);
        console.log('🏠 Address data:', data.appointments[0]?.docData?.address);
        console.log('📅 Raw slotDate:', data.appointments[0]?.slotDate);
        console.log('⏰ Raw slotTime:', data.appointments[0]?.slotTime);
        setAppointments(data.appointments.reverse());
      } else {
        console.error('❌ API returned error:', data.message);
        toast.error(data.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      console.error('🔥 Error fetching appointments:', error);
      if (error.response) {
        console.error('📡 Response error:', error.response.data);
        console.error('📡 Status:', error.response.status);
        toast.error(error.response.data?.message || `Error ${error.response.status}: Failed to fetch appointments`);
      } else if (error.request) {
        console.error('📡 No response received');
        toast.error('No response from server. Please check your connection.');
      } else {
        console.error('📡 Request setup error:', error.message);
        toast.error(error.message || 'Failed to fetch appointments');
      }
    } finally {
      setLoading(false);
    }
  }

  const cancelAppointment = async (appointmentId) => {
    try {
      console.log('🚫 Cancelling appointment:', appointmentId);
      
      const {data} = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers: { token } });
      
      if (data.success) {
        toast.success(data.message || "Appointment cancelled successfully");
        
        // Refresh appointments after cancellation
        getUserAppointments();
        getDoctorsData(); // Refresh doctors data if needed
        refreshAppointmentSlots(); // Refresh appointment slots in context
      } else if (data.message) {
        toast.error(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to cancel appointment");
    }
  }

  const payAppointment = async (appointmentId) => {
    try {
      await axios.post(backendUrl + '/api/user/pay-appointment', { appointmentId }, { headers: { token } });
      toast.success("Payment successful");
      getUserAppointments();
      refreshAppointmentSlots();
    } catch (error) {
      toast.error(error.message || "Failed to pay for appointment");
    }
  }

  useEffect(() => {
    if (token) {
      getUserAppointments();
    } else {
      setLoading(false);
    }
  }, [token]);

  if (!token) {
    return (
      <div>
        <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My Appointments</p>
        <div className="text-center py-8">
          <p className="text-gray-500">Please log in to view your appointments.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My Appointments</p>
        <div className="text-center py-8">
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div>
        <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My Appointments</p>
        <div className="text-center py-8">
          <p className="text-gray-500">No appointments found.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
        <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My Appointments</p>
        <div>
          {
            appointments.map((appointment,index) => (
              <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b border-gray-400' key={appointment._id || index}>
                <div>
                  <img className='w-32 bg-indigo-50' src={appointment.docData?.image || 'https://via.placeholder.com/128x128'} alt="Doctor" />
                </div>
                <div className='flex-1 text-small text-zinc-600'> 
                  <p className='text-neutral-800 font-semibold'>{appointment.docData?.name || 'Doctor Name'}</p>
                  <p>{appointment.docData?.speciality || 'Speciality'}</p>
                  <p className='text-zinc-700 font-medium mt-1'>Address</p>
                  <p className='text-xs'>{appointment.docData?.address?.line1 || 'Address not available'}</p>
                  <p className='text-xs'>{appointment.docData?.address?.line2 || ''}</p>
                  <p className='text-xs mt-1'><span className='text-sm text-neutral-700 font-medium'>Date & Time:</span> {slotDateFormat(appointment.slotDate)} | {appointment.slotTime}</p>
                </div>
                <div></div>
                <div className='flex flex-col gap-2 justify-end'>
                  {(appointment.status === 'pending' || appointment.status === 'paid') && (
                    <>
                      {appointment.status === 'pending' && (
                        <button
                          onClick={() => payAppointment(appointment._id)}
                          className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'
                        >
                          Pay Online
                        </button>
                      )}
                      {appointment.status === 'paid' && (
                        <button className='text-sm text-green-600 text-center sm:min-w-48 py-2 border border-green-600 rounded'>Paid</button>
                      )}
                      <button
                        onClick={() => cancelAppointment(appointment._id)}
                        className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'
                      >
                        Cancel Appointment
                      </button>
                    </>
                  )}
                  {appointment.status === 'cancelled' && (
                    <button className='text-sm text-red-600 text-center sm:min-w-48 py-2 border border-red-600 rounded'>Cancelled</button>
                  )}
                </div>
              </div>
            ))
          }
        </div>
    </div>
  )
}

export default MyAppointment