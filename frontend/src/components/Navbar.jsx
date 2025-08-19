import React, { useState, useContext, useEffect } from 'react'
import {assets} from "../assets/assets"
import { NavLink, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext';

const Navbar = () => {

    const navigate = useNavigate() 

    const {token, setToken, userData} = useContext(AppContext)

    const [showMenu, setShowMenu] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)

    const logout = () => {
        setToken(false)  
        localStorage.removeItem('token')   
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClick = (e) => {
            if (!e.target.closest('.profile-dropdown-group')) {
                setDropdownOpen(false);
            }
        };
        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClick);
        }
        return () => document.removeEventListener('mousedown', handleClick);
    }, [dropdownOpen]);
    
  return (
    <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400'>
        <img src={assets.logo} alt="logo" className='w-44 cursor-pointer'/>
        <ul className='hidden md:flex items-start gap-5 font-medium'>
            <NavLink to="/">
                <li className='py-1'>HOME</li>
                <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
            </NavLink>
            <NavLink to="/doctors">
                <li className='py-1'>ALL DOCTORS</li>
                <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
            </NavLink>
            <NavLink to="/about">
                <li className='py-1'>ABOUT</li>
                <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
            </NavLink>
            <NavLink to="/contact">
                <li className='py-1'>CONTACT</li>
                <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
            </NavLink>
        </ul>
        <div className='flex items-center gap-4'>
            {
                token 
                ? (
                    <div 
                        className='flex items-center gap-2 cursor-pointer group relative profile-dropdown-group'
                        onMouseEnter={() => setDropdownOpen(true)}
                        onMouseLeave={() => setDropdownOpen(false)}
                        onClick={() => setDropdownOpen((prev) => !prev)}
                        tabIndex={0}
                        style={{ outline: 'none' }}
                    >
                        <img className='w-8 rounded-full ' src={userData?.image || assets.profile_pic} alt="" />
                        <img className='w-2.5' src={assets.dropdown_icon} alt="" />
                        <div
                            className={`absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 ${
                                dropdownOpen ? 'block' : 'hidden'
                            }`}
                        >
                            <div className='min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4'>
                                <p onClick={() => { setDropdownOpen(false); navigate("/my-profile"); }} className='hover:text-black cursor-pointer'>My Profile</p>
                                <p onClick={() => { setDropdownOpen(false); navigate("/my-appointments"); }} className='hover:text-black cursor-pointer'>My Appointments</p>
                                <p onClick={() => { setDropdownOpen(false); logout(); }} className='hover:text-black cursor-pointer'>logout</p>
                            </div>
                        </div>
                    </div>
                )
                : <button onClick={() => navigate('/login')} className='bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block'>Create Account</button>
            }

            <img
                onClick={() => setShowMenu(true)}
                className='w-6 md:hidden'
                src={assets.menu_icon}
                alt="menu"
            />
            {/* Mobile Menu */}
            <div
                className={`${
                    showMenu ? 'fixed w-full h-full' : 'h-0 w-0'
                } md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}
                style={{
                    transition: 'all 0.3s',
                    visibility: showMenu ? 'visible' : 'hidden',
                }}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <img src={assets.logo} alt="logo" className="w-32" />
                    <img
                        onClick={() => setShowMenu(false)}
                        src={assets.cross_icon}
                        alt="close"
                        className="w-6 cursor-pointer"
                    />
                </div>
                <ul className="flex flex-col items-center gap-4 p-6 font-medium text-lg">
                    <NavLink to="/" onClick={() => setShowMenu(false)} >
                        <p className="px-4 py-2 rounded inline-block">Home</p>
                    </NavLink>
                    <NavLink to="/doctors" onClick={() => setShowMenu(false)} >
                        <p className="px-4 py-2 rounded inline-block">All Doctors</p>
                    </NavLink>
                    <NavLink to="/about" onClick={() => setShowMenu(false)} >
                        <p className="px-4 py-2 rounded inline-block">About</p>
                    </NavLink>
                    <NavLink to="/contact" onClick={() => setShowMenu(false)} >
                        <p className="px-4 py-2 rounded inline-block">Contact</p>
                    </NavLink>
                </ul>
            </div>
            
        </div>
    </div>
  )
}

export default Navbar