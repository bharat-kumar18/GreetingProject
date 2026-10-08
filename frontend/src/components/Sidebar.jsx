import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileImage, Users, Eye, Layers, Image as ImageIcon } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        GreetingGen
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        <NavLink to="/templates" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
          <FileImage size={20} /> Templates
        </NavLink>
        <NavLink to="/recipients" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
          <Users size={20} /> Recipients
        </NavLink>
        <NavLink to="/preview" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
          <Eye size={20} /> Single Preview
        </NavLink>
        <NavLink to="/batch-generation" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
          <Layers size={20} /> Batch Gen
        </NavLink>
        <NavLink to="/generated" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
          <ImageIcon size={20} /> Generated
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
