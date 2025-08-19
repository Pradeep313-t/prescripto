import React, { useState, useContext } from 'react'
import { assets } from "../assets/assets"
import { AdminContext } from '../context/AdminContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const [state, setState] = useState('Admin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const { setAToken, backendUrl } = useContext(AdminContext)
    const navigate = useNavigate()

    const onSubmitHandler = async (event) => {
        event.preventDefault()
        // The reason for the admin not logging in properly could be due to several factors:
        // 1. Incorrect backendUrl or API endpoint.
        // 2. Incorrect email or password being sent.
        // 3. Backend not returning the expected response (e.g., no 'success' or 'token' field).
        // 4. Network issues or CORS errors.
        // 5. The AdminContext may not be providing setAToken or backendUrl correctly.
        // 6. The backend may not be connected to the database or has authentication logic issues.
        // 7. The frontend may not be handling errors or responses as expected.
        // To debug, check the network request in browser dev tools, verify backend logs, and ensure environment variables are set correctly.

        try {
            if (state === 'Admin') {
                const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })
                if (data.success) {
                    localStorage.setItem('aToken', data.token)
                    setAToken(data.token)
                    toast.success('Login successful!')
                    navigate('/admin-dashboard')
                } else {
                    toast.error(data.message)
                }
            } else {
                // Doctor login not implemented
                toast.info("Doctor login is not implemented yet.")
            }
        } catch (error) {
            // Error not handled in original code
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message)
            } else {
                toast.error("An error occurred during login.")
            }
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
            <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border-0 rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
                <p className='text-2xl font-semibold m-auto'>
                    <span className='text-primary'> {state}</span> Login
                </p>
                <div className='w-full'>
                    <p>Email</p>
                    <input
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        className='border border-[#DADADA] rounded w-full p-2 mt-1'
                        type="email"
                        required
                    />
                </div>
                <div>
                    <p>Password</p>
                    <input
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        className='border border-[#DADADA] rounded w-50 p-2 mt-1'
                        type="password"
                        required
                    />
                </div>
                <button className='bg-primary text-white w-full py-2 rounded-md text-base'>Login</button>
                {
                    state === "Admin"
                        ? <p>Doctor Login? <span className='text-primary underline cursor-pointer' onClick={() => setState('Doctor')}>Click Here</span></p>
                        : <p>Admin Login? <span className='text-primary underline cursor-pointer' onClick={() => setState('Admin')}>Click Here</span></p>
                }
            </div>
        </form>
    )
}
/*
The error `POST http://localhost:4000/api/admin/login 401 (Unauthorized)` means that your login request to the backend failed with a 401 status code, which stands for "Unauthorized". This typically happens when the credentials (email or password) you provided are incorrect, or the backend is not able to authenticate you.

How to debug:
1. Double-check the email and password you are entering.
2. Make sure the backend is running and accessible at `http://localhost:4000`.
3. Check the backend `/api/admin/login` route to ensure it is working as expected.
4. If you are using a database, make sure the admin user exists with the credentials you are trying.
5. If the backend expects additional headers or a specific request body format, ensure your frontend matches that.

In your code, when a 401 is returned, the error handler in `onSubmitHandler` will show a toast with the error message from the backend (if provided), or a generic error message.

To see the exact reason, check the backend server logs for the `/login` request, or inspect the `error.response.data` in your browser's network tab for more details.
*/

export default Login