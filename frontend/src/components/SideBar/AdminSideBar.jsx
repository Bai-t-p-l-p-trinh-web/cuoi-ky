import React from 'react';
import { 
  User, 
  Car, 
  CircleDollarSign, 
  CreditCard, 
  MessageSquareWarning, 
  LayoutList, 
  MailQuestion 
} from "lucide-react";
import SideBarItem from './SideBarItem';
import "./Sidebar.scss"
import SideBarAccount from './SideBarAccount';

const sideBarItems = [
  { to: '/admin/users', label: "Users", icon: User },
  { to: '/admin/listings', label: "Listings", icon: Car },
  { to: '/admin/sales', label: "Sales", icon: CircleDollarSign },
  { to: '/admin/payments', label: "Payments", icon: CreditCard },
  { to: '/admin/reports', label: "Reports", icon: MessageSquareWarning },
  { to: '/admin/categories', label: "Categories", icon: LayoutList },
  { to: '/admin/support', label: "Support", icon: MailQuestion }
];

const AdminSideBar = () => {
  return (
    <div className='bg-[#181818] min-h-screen px-2 pb-6 w-64 flex flex-col justify-between'>
      <div>
        <div class="wave-container flex justify-center pt-2 font-extrabold">
          <h1 class="wave-text">
              <span>A</span><span>D</span><span>M</span><span>I</span><span>N</span>
              
          </h1>
        </div>
        <div className="flex flex-col">
          {sideBarItems.map((item) => (
            <SideBarItem key={item.to} {...item} />
          ))}
        </div>
      </div>
      <div className='flex justify-center'>
        <SideBarAccount />
      </div>
    </div>
  )
}

export default AdminSideBar;
