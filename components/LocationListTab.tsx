
import React, { useRef, useEffect } from 'react';
import { ProjectData, Location } from '../types';
import DragHandleIcon from './icons/DragHandleIcon';

interface LocationListTabProps {
  projectData: ProjectData;
  setProjectData: React.Dispatch<React.SetStateAction<ProjectData>>;
  selectedLocationId: string | null;
  setSelectedLocationId: React.Dispatch<React.SetStateAction<string | null>>;
}

const LocationListTab: React.FC<LocationListTabProps> = ({ 
  projectData, 
  setProjectData,
  selectedLocationId,
  setSelectedLocationId,
}) => {
  const draggedItemRef = useRef<string | null>(null);
  const dragOverItemRef = useRef<string | null>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [selectedLocationId]);

  const getImageUrl = (location: Location): string | undefined => {
    const imageField = projectData.customFields.find(field => 
        field.name.toLowerCase().includes('image') || field.name.toLowerCase().includes('afbeelding')
    );
    if (imageField) {
        return location.customData[imageField.id];
    }
    return undefined;
  };

  const handleDragEnd = () => {
      const locations = [...projectData.locations];
      const draggedItemContent = locations.find(loc => loc.id === draggedItemRef.current);
      if (!draggedItemContent || !dragOverItemRef.current) return;

      const draggedItemIndex = locations.findIndex(loc => loc.id === draggedItemRef.current);
      const dragOverItemIndex = locations.findIndex(loc => loc.id === dragOverItemRef.current);

      if (draggedItemIndex !== dragOverItemIndex) {
        locations.splice(draggedItemIndex, 1);
        locations.splice(dragOverItemIndex, 0, draggedItemContent);
        setProjectData(prev => ({...prev, locations}));
      }
      
      draggedItemRef.current = null;
      dragOverItemRef.current = null;
  };
  
  const renderListItem = (location: Location) => {
    const isSelected = location.id === selectedLocationId;
    const imageUrl = getImageUrl(location);

    return (
        <div
            ref={isSelected ? activeItemRef : null}
            onClick={() => setSelectedLocationId(location.id)}
            onDragEnter={() => (dragOverItemRef.current = location.id)}
            onDragOver={(e) => e.preventDefault()}
            className={`flex items-center p-2.5 bg-white rounded-lg shadow-sm transition-all duration-200 cursor-pointer ring-2 ${isSelected ? 'ring-blue-500 shadow-md bg-blue-50' : 'ring-transparent hover:ring-blue-400 hover:shadow-md'}`}
        >
            <div 
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 cursor-grab mr-3"
                draggable
                onDragStart={(e) => {
                    e.stopPropagation();
                    draggedItemRef.current = location.id;
                }}
                onDragEnd={(e) => {
                    e.stopPropagation();
                    handleDragEnd();
                }}
            >
                <DragHandleIcon />
            </div>

            {imageUrl ? (
                <img src={imageUrl} alt={location.name} className="w-12 h-12 object-cover rounded-md mr-4 flex-shrink-0" />
            ) : (
                 <div className="w-12 h-12 bg-slate-100 rounded-md mr-4 flex-shrink-0 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                 </div>
            )}
            <div className="flex-grow min-w-0">
              <h3 className="font-bold text-slate-800 truncate">{location.name}</h3>
            </div>
        </div>
    );
  };


  return (
    <div className="space-y-3">
      {projectData.locations.length === 0 && (
        <p className="text-slate-500 text-center mt-4">Voeg locaties toe via het 'Editor' tabblad om ze hier te zien.</p>
      )}
      {projectData.locations.map(location => (
        <div key={location.id}>
            {renderListItem(location)}
        </div>
      ))}
    </div>
  );
};

export default LocationListTab;