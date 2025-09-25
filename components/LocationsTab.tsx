
import React, { useState, useEffect } from 'react';
import { ProjectData, Location, LocationType, MarkerShape, MarkerIcon } from '../types';
import TrashIcon from './icons/TrashIcon';

interface LocationEditorTabProps {
  projectData: ProjectData;
  setProjectData: React.Dispatch<React.SetStateAction<ProjectData>>;
  isPlacingLocation: boolean;
  setIsPlacingLocation: React.Dispatch<React.SetStateAction<boolean>>;
  newLocationCoords: { lat: number; lng: number } | null;
  setNewLocationCoords: React.Dispatch<React.SetStateAction<{ lat: number; lng: number } | null>>;
}

const LocationEditorTab: React.FC<LocationEditorTabProps> = ({ 
  projectData, 
  setProjectData,
  isPlacingLocation,
  setIsPlacingLocation,
  newLocationCoords,
  setNewLocationCoords,
}) => {
  const initialLocationState = {
    name: '',
    type: 'DETAILED' as LocationType,
    latitude: '',
    longitude: '',
    color: '#3388ff',
    shape: 'CIRCLE' as MarkerShape,
    icon: 'NONE' as MarkerIcon,
    customData: {} as { [key: string]: string },
    imageUrl: '',
  };
  
  const [newLocation, setNewLocation] = useState(initialLocationState);
  const [coordsInput, setCoordsInput] = useState('');
  
  useEffect(() => {
    if (newLocationCoords) {
      const lat = String(newLocationCoords.lat.toFixed(6));
      const lng = String(newLocationCoords.lng.toFixed(6));
      setNewLocation(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng
      }));
      setCoordsInput(`${lat}, ${lng}`);
      setNewLocationCoords(null); // Consume the coordinates
    }
  }, [newLocationCoords, setNewLocationCoords]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewLocation(prev => ({ ...prev, [name]: value }));
  };

  const handleCoordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCoordsInput(value);

    const parts = value.split(',');
    if (parts.length === 2) {
      const lat = parseFloat(parts[0].trim());
      const lng = parseFloat(parts[1].trim());

      if (!isNaN(lat) && !isNaN(lng)) {
        setNewLocation(prev => ({
          ...prev,
          latitude: String(lat),
          longitude: String(lng),
        }));
      } else {
        setNewLocation(prev => ({ ...prev, latitude: '', longitude: '' }));
      }
    } else {
      setNewLocation(prev => ({ ...prev, latitude: '', longitude: '' }));
    }
  };

  const handleCustomDataChange = (fieldId: string, value: string) => {
    setNewLocation(prev => ({
      ...prev,
      customData: {
        ...prev.customData,
        [fieldId]: value
      }
    }));
  };
  
  const getCustomFieldByName = (name: string) => {
    return projectData.customFields.find(f => f.name.toLowerCase() === name.toLowerCase());
  }

  const addLocation = () => {
    if (!newLocation.name || !newLocation.latitude || !newLocation.longitude) {
      alert("Geef een locatienaam op en voer coördinaten in of selecteer een punt op de kaart.");
      return;
    }

    const customDataWithImage = { ...newLocation.customData };
    const imageUrlField = getCustomFieldByName('image url');
    if (imageUrlField && newLocation.imageUrl) {
      customDataWithImage[imageUrlField.id] = newLocation.imageUrl;
    }

    const location: Location = {
      id: crypto.randomUUID(),
      name: newLocation.name,
      type: newLocation.type,
      latitude: parseFloat(newLocation.latitude),
      longitude: parseFloat(newLocation.longitude),
      customData: newLocation.type === 'DETAILED' ? customDataWithImage : {},
      style: {
        color: newLocation.color,
        shape: newLocation.shape,
        icon: newLocation.icon,
      },
      imageUrl: newLocation.imageUrl,
    };

    setProjectData(prev => ({
      ...prev,
      locations: [...prev.locations, location]
    }));
    
    setNewLocation(initialLocationState);
    setCoordsInput('');
  };
  
  const removeLocation = (id: string) => {
    setProjectData(prev => ({
      ...prev,
      locations: prev.locations.filter(loc => loc.id !== id),
      connections: prev.connections.filter(conn => conn.from !== id && conn.to !== id)
    }));
  };
  
  return (
    <div className="space-y-6">
      <section className="p-4 bg-white rounded-lg shadow space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Nieuwe Locatie Toevoegen</h2>
        <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-600">Locatienaam</label>
            <input id="name" name="name" type="text" value={newLocation.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Locatie Coördinaten</label>
          <button 
              onClick={() => setIsPlacingLocation(true)}
              disabled={isPlacingLocation}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-wait font-medium"
          >
              {isPlacingLocation ? 'Selecteer op kaart...' : 'Selecteer Locatie op Kaart'}
          </button>
          {isPlacingLocation && <p className="text-sm text-blue-600 mt-2">Klik op de kaart om een pin te plaatsen.</p>}
        </div>

        <div>
            <label htmlFor="coords" className="block text-sm font-medium text-gray-600">Coördinaten (Lat, Long)</label>
            <input 
              id="coords" 
              name="coords" 
              type="text" 
              value={coordsInput}
              onChange={handleCoordsChange}
              placeholder="bv: 51.689, 5.301" 
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-600">Locatietype</label>
          <select name="type" value={newLocation.type} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
            <option value="DETAILED">Gedetailleerde Locatie</option>
            <option value="SIMPLE">Eenvoudig Label</option>
          </select>
        </div>

        {newLocation.type === 'DETAILED' && (
          <>
            <h3 className="text-md font-semibold text-gray-700 pt-2 border-t">Stijl & Gegevens</h3>
            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-600">Markerkleur</label>
                <input type="color" name="color" value={newLocation.color} onChange={handleInputChange} className="mt-1 h-10 w-full rounded-md border border-gray-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Markervorm</label>
                <select name="shape" value={newLocation.shape} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                  <option value="CIRCLE">Cirkel</option>
                  <option value="SQUARE">Vierkant</option>
                </select>
              </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-600">Icoon</label>
                <select name="icon" value={newLocation.icon} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                  <option value="NONE">Geen</option>
                  <option value="BUILDING">Gebouw</option>
                  <option value="FLAG">Vlag</option>
                </select>
              </div>
            <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-600">Afbeelding URL (optioneel)</label>
                <input id="imageUrl" name="imageUrl" type="text" value={newLocation.imageUrl} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="https://..."/>
            </div>
            {projectData.customFields.filter(f => f.name.toLowerCase() !== 'image url').map(field => (
                <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-600">{field.name}</label>
                    <input type="text" value={newLocation.customData[field.id] || ''} onChange={(e) => handleCustomDataChange(field.id, e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                </div>
            ))}
          </>
        )}
        <button onClick={addLocation} disabled={!newLocation.latitude || !newLocation.longitude || !newLocation.name} className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed">Locatie Toevoegen</button>
      </section>
      
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Bestaande Locaties</h2>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {projectData.locations.length === 0 && <p className="text-gray-500 text-sm">Nog geen locaties toegevoegd.</p>}
            {projectData.locations.map(loc => (
            <div key={loc.id} className="flex items-center justify-between bg-white p-2 rounded-md shadow-sm">
              <span className="text-gray-800 font-medium">{loc.name}</span>
              <button onClick={() => removeLocation(loc.id)} className="text-red-500 hover:text-red-700">
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LocationEditorTab;