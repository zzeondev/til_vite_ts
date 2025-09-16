import React from 'react';

type LoadingProps = {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  overlay?: boolean;
  className?: string;
};

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  message = '로딩 중...',
  overlay = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const spinner = (
    <div className={`spinner ${sizeClasses[size]} ${className}`}>
      <div className="spinner-inner"></div>
    </div>
  );

  const content = (
    <div className="loading-content">
      {spinner}
      {message && <span className={`loading-text ${textSizes[size]}`}>{message}</span>}
    </div>
  );

  if (overlay) {
    return <div className="loading-overlay">{content}</div>;
  }

  return <div className="loading-container">{content}</div>;
};

export default Loading;
