
import React, { useState, useEffect } from 'react';
import { ProjectData, Location, LocationType, MarkerShape, MarkerIcon } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import SaveIcon from './icons/SaveIcon';
import XIcon from './icons/XIcon';

interface LocationDetailPanelProps {
  location: Location;
  projectData: ProjectData;
  setProjectData: React.Dispatch<React.SetStateAction<ProjectData>>;
  onBack: () => void;
  setSelectedLocationId: React.Dispatch<React.SetStateAction<string | null>>;
}

const LocationDetailPanel: React.FC<LocationDetailPanelProps> = ({ 
  location, 
  projectData, 
  setProjectData, 
  onBack,
  setSelectedLocationId
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Location>(location);

  useEffect(() => {
    // If the location prop changes (e.g., user selects a different location),
    // reset the state.
    setEditedData(location);
    setIsEditing(false);
  }, [location]);
  
  const handleSave = () => {
    setProjectData(prev => ({
      ...prev,
      locations: prev.locations.map(loc => loc.id === location.id ? editedData : loc)
    }));
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditedData(location);
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleStyleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ 
      ...prev, 
      style: {
        ...prev.style,
        [name]: value
      } 
    }));
  };

  const handleCustomDataChange = (fieldId: string, value: string) => {
    setEditedData(prev => ({
      ...prev,
      customData: {
        ...prev.customData,
        [fieldId]: value
      }
    }));
  };

  const removeLocation = () => {
    if (window.confirm('Weet u zeker dat u deze locatie wilt verwijderen?')) {
        setProjectData(prev => ({
            ...prev,
            locations: prev.locations.filter(loc => loc.id !== location.id),
            connections: prev.connections.filter(conn => conn.from !== location.id && conn.to !== location.id)
        }));
        setSelectedLocationId(null); // Go back to list after delete
    }
  };

  const descriptionField = projectData.customFields.find(f => f.name.toLowerCase() === 'omschrijving' || f.name.toLowerCase() === 'acties');
  const imageUrlField = projectData.customFields.find(f => f.name.toLowerCase() === 'image url');
  const regularFields = projectData.customFields.filter(f => 
      f.id !== descriptionField?.id && 
      f.id !== imageUrlField?.id
  );

  const renderEditForm = () => (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-600">Naam</label>
        <input type="text" name="name" value={editedData.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600">Afbeelding URL</label>
        <input type="text" name="imageUrl" value={editedData.imageUrl || ''} onChange={handleInputChange} placeholder="https://..." className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Markerkleur</label>
            <input type="color" name="color" value={editedData.style.color} onChange={handleStyleChange} className="mt-1 h-10 w-full rounded-md border border-gray-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Markervorm</label>
            <select name="shape" value={editedData.style.shape} onChange={handleStyleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              <option value="CIRCLE">Cirkel</option>
              <option value="SQUARE">Vierkant</option>
            </select>
          </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-600">Icoon</label>
            <select name="icon" value={editedData.style.icon} onChange={handleStyleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              <option value="NONE">Geen</option>
              <option value="BUILDING">Gebouw</option>
              <option value="FLAG">Vlag</option>
            </select>
        </div>

      {regularFields.map(field => (
          <div key={field.id}>
              <label className="block text-sm font-medium text-gray-600">{field.name}</label>
              <input type="text" value={editedData.customData[field.id] || ''} onChange={(e) => handleCustomDataChange(field.id, e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
          </div>
      ))}

      {descriptionField && (
          <div>
            <label className="block text-sm font-medium text-gray-600">{descriptionField.name}</label>
            <textarea
              value={editedData.customData[descriptionField.id] || ''}
              onChange={(e) => handleCustomDataChange(descriptionField.id, e.target.value)}
              rows={5}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
      )}
    </div>
  );
  
  const renderView = () => {
    const populatedRegularFields = regularFields.filter(f => location.customData[f.id] && String(location.customData[f.id]).trim() !== '');

    return (
      <div className="p-4">
        {location.imageUrl ? (
          <img src={location.imageUrl} alt={location.name} className="w-full h-48 object-cover rounded-lg mb-4" />
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-800 break-words">{location.name}</h2>
        
        <div className="mt-4 space-y-4">
            <section>
                <h3 className="font-semibold text-gray-700 mb-2 border-b pb-1">Details</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    {populatedRegularFields.map(field => (
                        <React.Fragment key={field.id}>
                            <div className="text-gray-500">{field.name}</div>
                            <div className="text-gray-800 font-medium text-right">{location.customData[field.id]}</div>
                        </React.Fragment>
                    ))}
                    {populatedRegularFields.length === 0 && <p className="text-gray-500 col-span-2">Geen details beschikbaar.</p>}
                </div>
            </section>
            
            {descriptionField && location.customData[descriptionField.id] && (
                 <section>
                    <h3 className="font-semibold text-gray-700 mb-2 border-b pb-1">{descriptionField.name}</h3>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{location.customData[descriptionField.id]}</p>
                </section>
            )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex items-center justify-between p-3 border-b bg-white">
        <button onClick={onBack} className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
          <ArrowLeftIcon className="w-5 h-5 mr-1" />
          Terug naar lijst
        </button>
        <div className="flex items-center space-x-2">
           {isEditing ? (
             <>
                <button onClick={handleCancel} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors">
                    <XIcon className="w-5 h-5" />
                </button>
                <button onClick={handleSave} className="p-2 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50 transition-colors">
                    <SaveIcon className="w-5 h-5" />
                </button>
             </>
           ) : (
             <>
                <button onClick={() => setIsEditing(true)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors">
                    <PencilIcon className="w-5 h-5" />
                </button>
                <button onClick={removeLocation} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors">
                    <TrashIcon className="w-5 h-5" />
                </button>
             </>
           )}
        </div>
      </div>
      <div className="flex-grow overflow-y-auto">
        {isEditing ? renderEditForm() : renderView()}
      </div>
    </div>
  );
};

export default LocationDetailPanel;