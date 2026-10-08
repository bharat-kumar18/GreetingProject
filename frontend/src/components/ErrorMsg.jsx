import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMsg = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="error-container mt-4 mb-4">
      <AlertCircle size={20} />
      <span>{message}</span>
    </div>
  );
};

export default ErrorMsg;
