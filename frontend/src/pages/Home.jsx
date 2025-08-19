import React, { useContext } from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'


const Home = () => {
  

  return (
    <div>
        <Header /> 
        <SpecialityMenu />
        
        {/* Debug section to show doctors data */}
        
        
        <TopDoctors />
        <Banner />
    </div>
  )
}

export default Home