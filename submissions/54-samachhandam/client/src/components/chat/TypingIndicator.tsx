import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-1 px-4 py-2 bg-muted rounded-2xl w-fit soft-shadow">
      <div className="w-2 h-2 bg-primary rounded-full animate-typing"></div>
      <div className="w-2 h-2 bg-primary rounded-full animate-typing" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-2 h-2 bg-primary rounded-full animate-typing" style={{ animationDelay: '0.4s' }}></div>
    </div>
  );
};

export default TypingIndicator;
