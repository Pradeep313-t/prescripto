import React, { useState, useContext, useRef } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const MyProfile = () => {

  const { userData, setUserData, backendUrl, token, refreshUserData } = useContext(AppContext)

  const [isEdit, setIsEdit] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)

  const handleImageClick = () => {
    if (isEdit) {
      console.log("🖼️ Image clicked, opening file picker...")
      fileInputRef.current?.click()
    } else {
      console.log("🖼️ Not in edit mode - image not clickable")
    }
  }

  const handleImageChange = (e) => {
    console.log("🖼️ File input changed:", e.target.files)
    const file = e.target.files[0]
    if (file) {
      console.log("🖼️ File selected:", file.name, file.type, file.size)
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }

      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        console.log("🖼️ Preview created")
        setImagePreview(e.target.result)
      }
      reader.onerror = (error) => {
        console.error("🖼️ Error reading file:", error)
        toast.error('Error reading image file')
      }
      reader.readAsDataURL(file)
    } else {
      console.log("🖼️ No file selected")
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    console.log("💾 Starting save process...")
    
    try {
      // Ensure address exists and has proper structure
      const safeAddress = userData.address || { lin1: '', lin2: '' }
      
      // Create FormData for multipart/form-data (required for file upload)
      const formData = new FormData()
      formData.append('name', userData.name || '')
      formData.append('phone', userData.phone || '')
      formData.append('address', JSON.stringify(safeAddress))
      formData.append('dob', userData.dob || '')
      formData.append('gender', userData.gender || '')
      
      // Add image if selected
      if (selectedImage) {
        console.log("🖼️ Adding image to FormData:", selectedImage.name)
        formData.append('image', selectedImage)
      } else {
        console.log("🖼️ No image selected")
      }
      
      // Debug: Log what we're about to send
      console.log("🔄 Saving profile data:", {
        name: userData.name || '',
        phone: userData.phone || '',
        address: JSON.stringify(safeAddress),
        dob: userData.dob || '',
        gender: userData.gender || '',
        hasImage: !!selectedImage,
        imageName: selectedImage?.name
      })
      console.log("🔑 Token:", token)
      console.log("🌐 Backend URL:", backendUrl)
      
      const response = await fetch(`${backendUrl}/api/user/update-profile`, {
        method: 'POST',
        headers: {
          'token': token
          // Note: Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData
      })

      console.log("📡 Response status:", response.status)
      const data = await response.json()
      console.log("📡 Response data:", data)
      
      if (data.success) {
        toast.success('Profile updated successfully!')
        setIsEdit(false)
        setSelectedImage(null)
        setImagePreview(null)
        // Refresh the user data from backend to ensure consistency
        await refreshUserData()
      } else {
        toast.error(data.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('🔥 Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Show loading state
  if (userData === null) {
    return (
      <div className='max-w-lg flex flex-col gap-2 text-sm'>
        <p>Loading profile...</p>
      </div>
    )
  }

  // Show not logged in message
  if (userData === false) {
    return (
      <div className='max-w-lg flex flex-col gap-2 text-sm'>
        <p>Please log in to view your profile.</p>
      </div>
    )
  }

  // Show profile when userData exists
  return (
    <div className='max-w-lg flex flex-col gap-2 text-sm'>
        {/* Image Section */}
        <div className='relative'>
          <img 
            className={`w-36 rounded ${isEdit ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
            src={imagePreview || userData.image || assets.profile_pic} 
            alt="Profile" 
            onClick={handleImageClick}
            title={isEdit ? "Click to change image" : "Profile image"}
          />
        </div>
        
        {/* Hidden file input for click on image */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />

        {/* Image selection info */}
        {isEdit && selectedImage && (
          <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
            ✓ New image selected: {selectedImage.name}
          </div>
        )}

        {
          isEdit 
          ? <input className='bg-gray-50 text-3xl font-medium max-w-60 mt-4 border border-black rounded' type="text" value={userData.name} onChange={e => setUserData(prev => ({...prev,name:e.target.value}))}/>
          : <p className='font-medium text-3xl text-neutral-800 mt-4'>{userData.name}</p>
        }
        <hr className='bg-zinc-400 h-[1px] border-none'/>
        <div >
          <p className='text-neutral-500 underline mt-3'>CONTACT INFO</p>
          <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
            <p className='font-medium'>Email id:</p>
            <p className='text-blue-500'>{userData.email}</p>
            <p className='font-medium'>Phone</p>
            {
              isEdit 
              ? <input className='rounded border border-black bg-gray-100 max-w-52' type="text" value={userData.phone} onChange={e => setUserData(prev => ({...prev,phone:e.target.value}))}/>
              : <p className='text-blue-400'>{userData.phone}</p>
            }
            <p className='font-medium'>Address:</p>
            {
              isEdit
              ? <p>
                <input 
                  className='rounded border border-black bg-gray-50' 
                  name="lin1"
                  onChange={(e) => setUserData(prev => ({...prev, address: {...prev.address, lin1: e.target.value}}))} 
                  value={userData.address?.lin1 || ''} 
                  type="text" 
                  placeholder="Address Line 1"
                />
                <br />
                <input 
                  className='rounded mt-2 border border-black bg-gray-50' 
                  name="lin2"
                  onChange={(e) => setUserData(prev => ({...prev, address: {...prev.address, lin2: e.target.value}}))} 
                  value={userData.address?.lin2 || ''} 
                  type="text" 
                  placeholder="Address Line 2"
                />
              </p>
              : <p className='text-gray-500'>
                {
                  userData.address?.lin1 || 'Not provided'
                } <br />
                {
                  userData.address?.lin2 || 'Not provided'
                }
              </p>
            }
          </div>
        </div>
        <div>
          <p className='text-neutral-500 underline mt-3' >Basic Info</p>
          <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
            <p className='font-medium'>Gender:</p>
            {
              isEdit 
              ? <select className='rounded border border-black max-w-20 bg-gray-100' onChange={(e) => setUserData(prev => ({...prev, gender:e.target.value}))} value={userData.gender}>
                  
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              : <p className='text-gray-400'>{userData.gender}</p>
            }
            <p className='font-medium'>Birthday:</p>
            {
              isEdit 
              ? <input className='rounded border border-black max-w-28 bg-gray-100' type="date" onChange={(e) => setUserData(prev => ({...prev, dob:e.target.value}))} value={userData.dob}/>
              : <p className='text-gray-400'>{userData.dob}</p>
            }
          </div>
        </div>

        <div className='mt-10'>
          {
            isEdit
            ? <button 
                className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed' 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Info'}
              </button>
            : <button className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all' onClick={() => setIsEdit(true)}>Edit</button>
          }
        </div>

    </div>
  )
}

export default MyProfile