
import React from 'react';

const DragHandleIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
    <circle cx="9" cy="4" r="1.5"></circle>
    <circle cx="9" cy="12" r="1.5"></circle>
    <circle cx="9" cy="20" r="1.5"></circle>
    <circle cx="15" cy="4" r="1.5"></circle>
    <circle cx="15" cy="12" r="1.5"></circle>
    <circle cx="15" cy="20" r="1.5"></circle>
  </svg>
);

export default DragHandleIcon;