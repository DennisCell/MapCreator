
import React from 'react';
import { ProjectData } from '../types';
import TrashIcon from './icons/TrashIcon';

interface ConnectionsTabProps {
  projectData: ProjectData;
  setProjectData: React.Dispatch<React.SetStateAction<ProjectData>>;
  isDrawingConnection: boolean;
  setIsDrawingConnection: React.Dispatch<React.SetStateAction<boolean>>;
}

const ConnectionsTab: React.FC<ConnectionsTabProps> = ({ projectData, setProjectData, isDrawingConnection, setIsDrawingConnection }) => {
  
  const removeConnection = (id: string) => {
    setProjectData(prev => ({
      ...prev,
      connections: prev.connections.filter(conn => conn.id !== id)
    }));
  };

  const getLocationName = (id: string) => {
    return projectData.locations.find(loc => loc.id === id)?.name || 'Onbekend';
  };
  
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Verbinding Tekenen</h2>
        <button 
          onClick={() => setIsDrawingConnection(!isDrawingConnection)}
          className={`w-full px-4 py-2 text-white rounded-md ${isDrawingConnection ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {isDrawingConnection ? 'Tekenen Annuleren' : 'Start Verbinding Tekenen'}
        </button>
        {isDrawingConnection && <p className="text-sm text-blue-600 mt-2">Klik op twee locaties op de kaart om een verbinding te maken.</p>}
      </section>
      
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Bestaande Verbindingen</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
           {projectData.connections.length === 0 && <p className="text-gray-500 text-sm">Nog geen verbindingen toegevoegd.</p>}
           {projectData.connections.map(conn => (
            <div key={conn.id} className="flex items-center justify-between bg-white p-2 rounded-md shadow-sm">
              <span className="text-gray-800">
                {getLocationName(conn.from)} &rarr; {getLocationName(conn.to)}
              </span>
              <button onClick={() => removeConnection(conn.id)} className="text-red-500 hover:text-red-700">
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ConnectionsTab;