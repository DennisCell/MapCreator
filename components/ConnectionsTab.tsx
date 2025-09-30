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
  
  const SectionHeader: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">{children}</h2>
  );

  return (
    <div className="space-y-8">
      <section>
        <SectionHeader>Verbinding Tekenen</SectionHeader>
        <button 
          onClick={() => setIsDrawingConnection(!isDrawingConnection)}
          className={`w-full px-4 py-2.5 font-semibold text-white rounded-lg shadow-sm ${isDrawingConnection ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isDrawingConnection ? 'Tekenen Annuleren' : 'Start Verbinding Tekenen'}
        </button>
        {isDrawingConnection && <p className="text-sm text-blue-600 mt-2 text-center">Klik op twee locaties op de kaart om een verbinding te maken.</p>}
      </section>
      
      <section>
        <SectionHeader>Bestaande Verbindingen</SectionHeader>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
           {projectData.connections.length === 0 && <p className="text-slate-500 text-sm">Nog geen verbindingen toegevoegd.</p>}
           {projectData.connections.map(conn => (
            <div key={conn.id} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-700 font-medium">
                {getLocationName(conn.from)} &rarr; {getLocationName(conn.to)}
              </span>
              <button onClick={() => removeConnection(conn.id)} className="text-slate-400 hover:text-red-500">
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