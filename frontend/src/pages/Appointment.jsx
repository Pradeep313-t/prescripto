import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppContext } from "../context/AppContext"
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import { toast } from 'react-toastify'
import axios from 'axios'

const Appointment = () => {
  // Add refreshAppointmentSlots to your context destructuring
  const { docId } = useParams()
  const { doctors, backendUrl, token, slotsRefreshTrigger, currencySymbol, refreshAppointmentSlots } = useContext(AppContext)
  const daysOfWeek = ['SUN','MON','TUE','WED','THU','FRI','SAT']

  const navigate = useNavigate()

  const [docInfo,setDocInfo] = useState(null)

  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')
  const [bookedSlots, setBookedSlots] = useState({}) // Store booked slots data

  const fetchDocInfo = async () => {
    const docInfo = doctors.find(doc => doc._id === docId)
    setDocInfo(docInfo)
    
    // Fetch booked slots for this doctor
    if (docInfo) {
      await fetchBookedSlots(docInfo._id)
    }
  }

  // Fetch booked slots from backend
  const fetchBookedSlots = async (doctorId) => {
    try {
      console.log('🔍 Fetching booked slots for doctor:', doctorId);
      const response = await axios.get(`${backendUrl}/api/doctor/booked-slots/${doctorId}`)
      console.log('📡 Booked slots response:', response.data);
      
      if (response.data.success) {
        setBookedSlots(response.data.bookedSlots || {});
        console.log('✅ Booked slots updated:', response.data.bookedSlots);
      } else {
        console.log('❌ Failed to fetch booked slots:', response.data.message);
        setBookedSlots({});
      }
    } catch (error) {
      console.error('🔥 Error fetching booked slots:', error);
      setBookedSlots({});
    }
  }

  // Refresh available slots (can be called from parent components)
  const refreshSlots = async () => {
    console.log('🔄 Refreshing slots for doctor:', docId);
    try {
      await fetchBookedSlots(docId);
      await getAvailableSlots();
      console.log('✅ Slots refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing slots:', error);
    }
  };

  // Listen for global slot refresh trigger
  useEffect(() => {
    if (slotsRefreshTrigger > 0) {
      console.log('🔄 Global slot refresh triggered, refreshing slots...');
      refreshSlots();
    }
  }, [slotsRefreshTrigger]);

  const getAvailableSlots = async () => {
      setDocSlots([]);
      // getting current date
      let today = new Date();

      for (let i = 0; i < 7; i++) {
        // getting date with index 
        let currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);

        // setting end time of the date
        let endTime = new Date(today);
        endTime.setDate(today.getDate() + i);
        endTime.setHours(21, 0, 0, 0);

        // setting start hours
        if (today.getDate() === currentDate.getDate()) {
          currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10);
          currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
        } else {
          currentDate.setHours(10);
          currentDate.setMinutes(0);
        }

        let timeSlots = [];

        while (currentDate < endTime) {
          // Format time as "hh:mm am/pm"
          let hours = currentDate.getHours();
          let minutes = currentDate.getMinutes();
          let ampm = hours >= 12 ? 'pm' : 'am';
          let displayHours = hours % 12;
          displayHours = displayHours === 0 ? 12 : displayHours;
          let displayMinutes = minutes < 10 ? '0' + minutes : minutes;
          let formattedTime = `${displayHours}:${displayMinutes} ${ampm}`;

          // Create slot date string for comparison
          let day = currentDate.getDate();
          let month = currentDate.getMonth() + 1;
          let year = currentDate.getFullYear();
          const slotDate = day + "_" + month + "_" + year;

          // Check if this slot is already booked
          const isBooked = bookedSlots[slotDate] && bookedSlots[slotDate].includes(formattedTime);
          
          if (isBooked) {
            console.log(`❌ Slot ${formattedTime} on ${slotDate} is booked`);
          } else {
            console.log(`✅ Slot ${formattedTime} on ${slotDate} is available`);
          }

          // Only add slot if it's not booked
          if (!isBooked) {
            timeSlots.push({
              datetime: new Date(currentDate),
              time: formattedTime,
              slotDate: slotDate
            });
          }

          // increment time by 30 min
          currentDate.setMinutes(currentDate.getMinutes() + 30);
        }
        setDocSlots(prev => ([...prev, timeSlots]));
      }
  }


  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Please login to book an appointment")
      return navigate('/login')
    } 
    try {
        const date = docSlots[slotIndex][0].datetime

        let day = date.getDate()
        let month = date.getMonth() + 1 // Months are zero-based in JS
        let year = date.getFullYear()

        const slotDate = day + "_" + month + "_" + year

        const { data } = await axios.post(backendUrl + '/api/user/book-appointment', {docId,slotDate, slotTime},{headers:{token}})
        if(data.success) {
          toast.success(data.message || "Appointment booked successfully")
          
          // Refresh booked slots to hide the newly booked slot
          await fetchBookedSlots(docId)
          
          // Refresh available slots
          await getAvailableSlots()
          
          // Trigger global refresh to update all appointments
          refreshAppointmentSlots(); // <-- Fix: Use context function
          
          // Fix: Redirect to My Appointments after booking
          navigate('/my-appointments')
        } else {
          toast.error(data.message || "Failed to book appointment")
        }
    } catch (error) {
      console.log(error)
      toast.error(error.message || "Failed to book appointment")
    }
  }

  useEffect(() =>{
    fetchDocInfo()
  },[doctors,docId])

  useEffect(()=>{
    getAvailableSlots()
  },[docInfo, bookedSlots]) // Added bookedSlots dependency

  useEffect(() => {
    console.log(docSlots);
  },[docSlots])

  return docInfo && (
    <div>
        {/* Doct deta */}
        <div className='flex flex-col sm:flex-row gap-4'>
          <div>
            <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
          </div>
          <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
            {/* Doc info : n ,dre, expe */}
            <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
              {docInfo.name} <img className='w-5' src={assets.verified_icon} alt="" />
            </p>
            <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
              <p>{docInfo.degree} - {docInfo.speciality}</p>
              <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
            </div>
            {/* doc about */}
            <div>
              <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>
                About <img src={assets.info_icon} alt="" />
              </p>
              <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>

            </div>
            <p className='text-gray-500 font-medium mt-4'>
            Appointment fee:  <span className='text-gray-600'>{currencySymbol}{docInfo.fees}</span>
            </p>

          </div>
        </div>

        {/* booking slots*/}
        <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
          <p>Booking Slots</p>
          
          {/* Show available slots info */}
          {docSlots.length > 0 && (
            <div className="text-sm text-gray-500 mt-2">
              Showing available slots only. Booked slots are hidden.
            </div>
          )}
          
          <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
            {
              docSlots.length > 0 && docSlots.map((item, index) => {
                // Only show date if there are available slots
                if (item.length === 0) return null;
                
                // Correctly get the day of week using getDay(), not getDate()
                // getDay() returns 0 (Sunday) to 6 (Saturday)
                const dateObj = item[0] && item[0].datetime;
                const dayName = dateObj ? daysOfWeek[dateObj.getDay()] : '';
                const dayNum = dateObj ? dateObj.getDate() : '';
                return (
                  <div
                    onClick={() => setSlotIndex(index)}
                    className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-gray-200'}`}
                    key={index}
                  >
                    <p>{dayName}</p>
                    <p>{dayNum}</p>
                  </div>
                );
              })
            }
          </div>

          <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
            {
              docSlots.length && docSlots[slotIndex] && docSlots[slotIndex].length > 0 ? (
                docSlots[slotIndex].map((item,index) => (
                  <p 
                  onClick={() => setSlotTime(item.time)}
                  className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-primary text-white' : 'text-gray-400 border border-gray-300'}`} key={index}>{item.time.toLowerCase()}</p>
                ))
              ) : (
                <p className="text-sm text-gray-500">No available slots for selected date</p>
              )
            }
          </div>
          
          {slotTime && (
            <button onClick={bookAppointment} className='bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6'>Book an appointment</button>
          )}
        </div>
        {/* List related doctors */}
        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
    </div>
  )
}

export default Appointment