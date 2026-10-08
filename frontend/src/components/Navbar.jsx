import React from 'react';
import { Bell } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar-search">
        {/* Placeholder for future search/breadcrumb */}
      </div>
      <div className="navbar-actions flex-center gap-4">
        <button className="btn btn-secondary" style={{ padding: '8px', borderRadius: '50%' }}>
          <Bell size={18} />
        </button>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))' }}></div>
      </div>
    </header>
  );
};

export default Navbar;
