import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileImage, Users, Eye, Layers, Image as ImageIcon, X } from 'lucide-react';

const Sidebar = ({ isOpen, closeSidebar }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header flex-between">
        GreetingGen
        <button className="menu-toggle" onClick={closeSidebar} style={{ display: isOpen ? 'block' : 'none' }}>
          <X size={20} />
        </button>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" onClick={closeSidebar} className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        <NavLink to="/templates" onClick={closeSidebar} className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
          <FileImage size={20} /> Templates
        </NavLink>
        <NavLink to="/recipients" onClick={closeSidebar} className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
          <Users size={20} /> Recipients
        </NavLink>
        <NavLink to="/preview" onClick={closeSidebar} className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
          <Eye size={20} /> Single Preview
        </NavLink>
        <NavLink to="/batch-generation" onClick={closeSidebar} className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
          <Layers size={20} /> Batch Gen
        </NavLink>
        <NavLink to="/generated" onClick={closeSidebar} className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
          <ImageIcon size={20} /> Generated
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
