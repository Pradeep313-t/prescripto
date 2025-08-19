import React, { useEffect } from 'react' // FIX 1: Import useEffect
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'


const AllApointments = () => {

  const {aToken, appointments, getAllAppointments} = useContext(AdminContext)

  useEffect(() => {
    if(aToken) {
      getAllAppointments()
    }
  },[aToken])

  return (
    <div className='w-full max-w-6xl m-5  '>
        <p className='mb-3 text-lg font-medium'>All Appointments</p>

        <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-auto'>
          <div>
            <p>#</p>
            <p>Patient</p>
            <p>Age</p>
            <p>Date & Time</p>
            <p>Doctor</p>
            <p>Fees</p>
            <p>Actions</p>
          </div>
         
          
        </div>
    </div>
  )
}

export default AllApointments