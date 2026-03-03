import React from 'react'
import { Outlet } from 'react-router-dom'

const RootLayout : React.FC = () => {
  return (
    <div className="min-h-screen BGImage">
        <div className=' bg-black/50 min-h-screen'>
            <Outlet/>
        </div>
    </div>
  )
}

export default RootLayout