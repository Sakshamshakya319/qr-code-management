import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="loading">
      <div className="text-center">
        <div className="spinner"></div>
        {text && <p className="mt-2 text-muted">{text}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;