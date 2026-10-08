import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="flex-center mt-4 mb-4" style={{ flexDirection: 'column', gap: '12px' }}>
      <Loader2 size={32} className="spinner" style={{ color: 'var(--brand-primary)' }} />
      <p>{message}</p>
    </div>
  );
};

export default Loading;
