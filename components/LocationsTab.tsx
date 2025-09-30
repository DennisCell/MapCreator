
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
    color: '#3b82f6',
    shape: 'CIRCLE' as MarkerShape,
    icon: 'NONE' as MarkerIcon,
    customData: {} as { [key: string]: string },
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
  
  const addLocation = () => {
    if (!newLocation.name || !newLocation.latitude || !newLocation.longitude) {
      alert("Geef een locatienaam op en voer coördinaten in of selecteer een punt op de kaart.");
      return;
    }

    const location: Location = {
      id: crypto.randomUUID(),
      name: newLocation.name,
      type: newLocation.type,
      latitude: parseFloat(newLocation.latitude),
      longitude: parseFloat(newLocation.longitude),
      customData: newLocation.type === 'DETAILED' ? newLocation.customData : {},
      style: {
        color: newLocation.color,
        shape: newLocation.shape,
        icon: newLocation.icon,
      },
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

  const FormLabel: React.FC<{htmlFor: string, children: React.ReactNode}> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-600">{children}</label>
  );

  const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
  );

  const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
      <select {...props} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg"/>
  );
  
  return (
    <div className="space-y-8">
      <section className="bg-white rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 p-4 border-b border-slate-200">Nieuwe Locatie Toevoegen</h2>
        <div className="p-4 space-y-4">
            <div>
                <FormLabel htmlFor="name">Locatienaam</FormLabel>
                <FormInput id="name" name="name" type="text" value={newLocation.name} onChange={handleInputChange} />
            </div>
            
            <div className="space-y-2">
              <FormLabel htmlFor="coords">Locatie Coördinaten</FormLabel>
              <button 
                  onClick={() => setIsPlacingLocation(true)}
                  disabled={isPlacingLocation}
                  className="w-full px-4 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-100 border border-slate-300 disabled:opacity-50 disabled:cursor-wait font-semibold"
              >
                  {isPlacingLocation ? 'Selecteer op kaart...' : 'Selecteer Locatie op Kaart'}
              </button>
              {isPlacingLocation && <p className="text-sm text-blue-600 mt-2 text-center">Klik op de kaart om een pin te plaatsen.</p>}
              <FormInput 
                id="coords" 
                name="coords" 
                type="text" 
                value={coordsInput}
                onChange={handleCoordsChange}
                placeholder="Of typ hier: 51.689, 5.301" 
              />
            </div>

            <div>
              <FormLabel htmlFor="type">Locatietype</FormLabel>
              <FormSelect id="type" name="type" value={newLocation.type} onChange={handleInputChange}>
                <option value="DETAILED">Gedetailleerde Locatie</option>
                <option value="SIMPLE">Eenvoudig Label</option>
              </FormSelect>
            </div>

            {newLocation.type === 'DETAILED' && (
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-md font-semibold text-slate-700">Stijl & Gegevens</h3>
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div>
                    <FormLabel htmlFor="color">Markerkleur</FormLabel>
                    <FormInput type="color" id="color" name="color" value={newLocation.color} onChange={handleInputChange} className="p-1 h-10" />
                  </div>
                  <div>
                    <FormLabel htmlFor="shape">Markervorm</FormLabel>
                    <FormSelect id="shape" name="shape" value={newLocation.shape} onChange={handleInputChange}>
                      <option value="CIRCLE">Cirkel</option>
                      <option value="SQUARE">Vierkant</option>
                    </FormSelect>
                  </div>
                </div>
                 <div>
                    <FormLabel htmlFor="icon">Icoon</FormLabel>
                    <FormSelect id="icon" name="icon" value={newLocation.icon} onChange={handleInputChange}>
                      <option value="NONE">Geen</option>
                      <option value="BUILDING">Gebouw</option>
                      <option value="FLAG">Vlag</option>
                    </FormSelect>
                  </div>
                {projectData.customFields.map(field => (
                    <div key={field.id}>
                        <FormLabel htmlFor={field.id}>{field.name}</FormLabel>
                        <FormInput id={field.id} type="text" value={newLocation.customData[field.id] || ''} onChange={(e) => handleCustomDataChange(field.id, e.target.value)} />
                    </div>
                ))}
              </div>
            )}
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-lg">
            <button onClick={addLocation} disabled={!newLocation.latitude || !newLocation.longitude || !newLocation.name} className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-blue-400 disabled:cursor-not-allowed shadow-sm">Locatie Toevoegen</button>
        </div>
      </section>
      
      <section>
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Bestaande Locaties</h2>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {projectData.locations.length === 0 && <p className="text-slate-500 text-sm">Nog geen locaties toegevoegd.</p>}
            {projectData.locations.map(loc => (
            <div key={loc.id} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-700 font-medium">{loc.name}</span>
              <button onClick={() => removeLocation(loc.id)} className="text-slate-400 hover:text-red-500">
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