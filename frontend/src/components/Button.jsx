import React from 'react';

const Button = ({ children, variant = 'primary', className = '', isLoading = false, ...props }) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const loadingClass = isLoading ? 'opacity-70 cursor-not-allowed' : '';
  
  return (
    <button 
      className={`${baseClass} ${variantClass} ${loadingClass} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <span className="spinner">↻</span> : null}
      {children}
    </button>
  );
};

export default Button;
