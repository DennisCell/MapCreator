import React, { useState } from 'react';
import { ProjectData } from '../types';
import ProjectTab from './ProjectTab';
import LocationEditorTab from './LocationsTab';
import LocationListTab from './LocationListTab';
import LocationDetailPanel from './LocationDetailPanel';

interface WorkspacePanelProps {
  projectData: ProjectData;
  setProjectData: React.Dispatch<React.SetStateAction<ProjectData>>;
  onImageExport: () => void;
  onHtmlExport: () => void;
  isPlacingLocation: boolean;
  setIsPlacingLocation: React.Dispatch<React.SetStateAction<boolean>>;
  newLocationCoords: {lat: number, lng: number} | null;
  setNewLocationCoords: React.Dispatch<React.SetStateAction<{lat: number, lng: number} | null>>;
  selectedLocationId: string | null;
  setSelectedLocationId: React.Dispatch<React.SetStateAction<string | null>>;
  onLogout: () => void;
}

type Tab = 'Lijst' | 'Editor' | 'Project';

const WorkspacePanel: React.FC<WorkspacePanelProps> = (props) => {
  const { projectData, selectedLocationId, setSelectedLocationId } = props;
  const [activeTab, setActiveTab] = useState<Tab>('Lijst');

  const selectedLocation = projectData.locations.find(loc => loc.id === selectedLocationId);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Lijst':
        return <LocationListTab {...props} />;
      case 'Editor':
        return <LocationEditorTab {...props} />;
      case 'Project':
        return <ProjectTab {...props} />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{ name: Tab }> = ({ name }) => {
    const isActive = activeTab === name;
    return (
      <button
        onClick={() => setActiveTab(name)}
        className={`flex-1 py-2 px-4 text-sm font-medium transition-all duration-200 rounded-md
          ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-white/60'}`}
      >
        {name}
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="p-4 bg-white border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-800">MapCreator Pro</h1>
      </header>
      
      {selectedLocation ? (
        <LocationDetailPanel 
          location={selectedLocation} 
          projectData={props.projectData}
          setProjectData={props.setProjectData}
          onBack={() => setSelectedLocationId(null)}
          setSelectedLocationId={setSelectedLocationId}
        />
      ) : (
        <>
          <nav className="p-2 bg-slate-100 border-b border-slate-200">
            <div className="flex space-x-2 bg-slate-200/80 p-1 rounded-lg">
                <TabButton name="Lijst" />
                <TabButton name="Editor" />
                <TabButton name="Project" />
            </div>
          </nav>
          <div className="flex-grow p-4 overflow-y-auto">
            {renderTabContent()}
          </div>
        </>
      )}
    </div>
  );
};

export default WorkspacePanel;
