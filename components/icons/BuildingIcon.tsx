
import React from 'react';

const BuildingIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0v-4m0 4h5m0 0v-4m0 4H8m2-8h4m-4 0V9m4 0v4m-4-4h.01M12 13h.01M12 9h.01M12 5h.01M8 13h.01M8 9h.01M8 5h.01M5 17h.01M5 13h.01M5 9h.01M5 5h.01" />
  </svg>
);

export default BuildingIcon;