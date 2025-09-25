
import React, { useState } from 'react';
import { ProjectData } from '../types';
import ProjectTab from './ProjectTab';
import LocationEditorTab from './LocationsTab';
import LocationListTab from './LocationListTab';
import LocationDetailPanel from './LocationDetailPanel';

interface WorkspacePanelProps {
  projectData: ProjectData;
  setProjectData: React.Dispatch<React.SetStateAction<ProjectData>>;
  onPngExport: () => void;
  onHtmlExport: () => void;
  isPlacingLocation: boolean;
  setIsPlacingLocation: React.Dispatch<React.SetStateAction<boolean>>;
  newLocationCoords: {lat: number, lng: number} | null;
  setNewLocationCoords: React.Dispatch<React.SetStateAction<{lat: number, lng: number} | null>>;
  selectedLocationId: string | null;
  setSelectedLocationId: React.Dispatch<React.SetStateAction<string | null>>;
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
        className={`flex-1 py-3 text-sm font-medium transition-colors duration-200 border-b-2
          ${isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
      >
        {name}
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 bg-gray-50 border-b">
        <h1 className="text-2xl font-bold text-gray-800">MapCreator Pro</h1>
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
          <nav className="flex border-b">
            <TabButton name="Lijst" />
            <TabButton name="Editor" />
            <TabButton name="Project" />
          </nav>
          <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
            {renderTabContent()}
          </div>
        </>
      )}
    </div>
  );
};

export default WorkspacePanel;