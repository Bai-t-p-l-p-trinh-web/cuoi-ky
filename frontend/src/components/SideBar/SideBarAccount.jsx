import React from 'react'
import { LogOut } from 'lucide-react'

const SideBarAccount = () => {
  return (
    <div className='flex justify-between items-center pr-2 bg-[#FFFFFF] w-[90%] rounded-xl'>
        <div className='flex justify-between items-center'>
            <img className='rounded-full w-12 h-12 m-2' src='/avatar.jpg'></img>
            <div className='flex flex-col items-center'>
                <span className='text-lg'>John Doe</span>
                <span className='bg-[#171717] text-white text-sm px-2 py-0.25 rounded-full align-middle'>Admin</span>
            </div>
        </div>
        <LogOut/>
    </div>
  )
}

export default SideBarAccount