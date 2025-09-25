
import React, { useState } from 'react';
import { ProjectData, MapTheme } from '../types';
import { MAP_THEMES } from '../constants';
import TrashIcon from './icons/TrashIcon';

interface ProjectTabProps {
  projectData: ProjectData;
  setProjectData: React.Dispatch<React.SetStateAction<ProjectData>>;
  onPngExport: () => void;
  onHtmlExport: () => void;
}

const ProjectTab: React.FC<ProjectTabProps> = ({ projectData, setProjectData, onPngExport, onHtmlExport }) => {
  const [newFieldName, setNewFieldName] = useState('');

  const addCustomField = () => {
    if (newFieldName.trim() === '') return;
    setProjectData(prev => ({
      ...prev,
      customFields: [...prev.customFields, { id: crypto.randomUUID(), name: newFieldName.trim() }]
    }));
    setNewFieldName('');
  };
  
  const removeCustomField = (id: string) => {
    setProjectData(prev => ({
      ...prev,
      customFields: prev.customFields.filter(field => field.id !== id)
    }));
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProjectData(prev => ({ ...prev, mapTheme: e.target.value as MapTheme }));
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Aangepaste Gegevensvelden</h2>
        <div className="space-y-2">
          {projectData.customFields.map(field => (
            <div key={field.id} className="flex items-center justify-between bg-white p-2 rounded-md shadow-sm">
              <span className="text-gray-800">{field.name}</span>
              <button onClick={() => removeCustomField(field.id)} className="text-red-500 hover:text-red-700">
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
        <div className="flex mt-3 gap-2">
          <input
            type="text"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            placeholder="Nieuwe veldnaam"
            className="flex-grow p-2 border rounded-md"
            onKeyDown={(e) => e.key === 'Enter' && addCustomField()}
          />
          <button onClick={addCustomField} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Toevoegen</button>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Basiskaart Thema</h2>
        <select value={projectData.mapTheme} onChange={handleThemeChange} className="w-full p-2 border rounded-md bg-white">
          {Object.keys(MAP_THEMES).map(theme => (
            <option key={theme} value={theme} className="capitalize">{theme.charAt(0).toUpperCase() + theme.slice(1)}</option>
          ))}
        </select>
      </section>
      
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Kaart Exporteren</h2>
        <div className="flex flex-col space-y-3">
          <button onClick={onPngExport} className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Afbeelding Downloaden (.PNG)</button>
          <button onClick={onHtmlExport} className="w-full px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600">Interactieve Kaart Downloaden (.HTML)</button>
        </div>
      </section>
    </div>
  );
};

export default ProjectTab;