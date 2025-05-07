import React from 'react'
import { NavLink } from 'react-router-dom'

const SideBarItem = ({to, icon: Icon, label}) => {
  return (
    <NavLink to={to} className={({isActive}) => `flex items-center gap-2 p-3 rounded-lg transition ${isActive ? "bg-pink-100 text-pink-600" : "text-gray-600 hover:bg-gray-100"}`}>
      <Icon className='w-5 h-5' />
      <span className="text-sm font-medium">{label}</span>
    </NavLink>
  )
}

export default SideBarItem