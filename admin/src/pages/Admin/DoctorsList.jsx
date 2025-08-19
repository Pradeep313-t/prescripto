import React, { useContext, useEffect, useRef, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';

/**
 * Why is the doctors list fetching/loading repeatedly?
 * 
 * The likely cause is that the `fetchAllDoctors` function is being re-created on every render,
 * which causes the useEffect dependency `[aToken, fetchAllDoctors]` to trigger on every render,
 * resulting in repeated fetching.
 * 
 * Solution: Only depend on `aToken` in useEffect, and ensure `fetchAllDoctors` is stable (doesn't change on every render).
 * If you must keep `fetchAllDoctors` in the dependency array, memoize it in the context using useCallback.
 * 
 * For now, we will only depend on `aToken` to prevent repeated fetching.
 */

const DoctorsList = () => {
  const { fetchAllDoctors, doctors, doctorsLoading, doctorsError, aToken, deleteDoctor } = useContext(AdminContext);
  const [deletingDoctor, setDeletingDoctor] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);

  // Only run fetchAllDoctors when aToken changes from empty to a value (i.e., on login)
  // Use a ref to ensure we only fetch once per aToken change
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (aToken && !fetchedRef.current) {
      fetchAllDoctors();
      fetchedRef.current = true;
    }
    if (!aToken) {
      fetchedRef.current = false;
    }
    // eslint-disable-next-line
  }, [aToken]);

  const handleDeleteClick = (doctor) => {
    setDoctorToDelete(doctor);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!doctorToDelete) return;

    setDeletingDoctor(doctorToDelete._id);
    const success = await deleteDoctor(doctorToDelete._id);
    
    if (success) {
      setShowDeleteConfirm(false);
      setDoctorToDelete(null);
    }
    
    setDeletingDoctor(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDoctorToDelete(null);
  };

  if (doctorsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading doctors...</div>
      </div>
    );
  }

  if (doctorsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 text-lg">{doctorsError}</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#F8F9FD] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-gray-800">All Doctors</h1>
        
        {doctors.length === 0 ? (
          <div className="text-center text-gray-500 py-16">
            <div className="text-6xl mb-4">👨‍⚕️</div>
            <p className="text-xl">No doctors found</p>
            <p className="text-sm mt-2">Add some doctors to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {doctors.map((doctor) => (
                             <div key={doctor._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 relative group">
                {/* Delete Button - Only visible on hover */}
                <button
                  onClick={() => handleDeleteClick(doctor)}
                  disabled={deletingDoctor === doctor._id} 
                  className="absolute top-3 right-3 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50 z-10"
                  title="Delete doctor"
                >
                  {deletingDoctor === doctor._id ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>

                {/* Doctor Profile Picture */}
                <div className="flex justify-center mb-4">
                  <div className="relative group">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-gray-100 shadow-sm hover:bg-primary transition-all duration-300 hover:scale-110 hover:shadow-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80x80?text=👨‍⚕️';
                      }}
                    />
                    {/* Online Status Indicator */}
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                  </div>
                </div>

                {/* Doctor Information */}
                <div className="text-center">
                  <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate">
                    Dr. {doctor.name}
                  </h3>
                  <p className="text-gray-600 text-xs capitalize">
                    {doctor.speciality}
                  </p>
                </div>

                {/* Additional Info (Hidden by default, can be expanded) */}
                <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-1">
                  <p className="truncate"><span className="font-medium">Experience:</span> {doctor.experience} years</p>
                  <p className="truncate"><span className="font-medium">Fees:</span> ₹{doctor.fees}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && doctorToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>Dr. {doctorToDelete.name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deletingDoctor === doctorToDelete._id}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deletingDoctor === doctorToDelete._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsList;