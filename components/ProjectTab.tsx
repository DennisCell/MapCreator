import React, { useState } from 'react';
import { ProjectData, MapTheme } from '../types';
import { MAP_THEMES } from '../constants';
import TrashIcon from './icons/TrashIcon';

interface ProjectTabProps {
  projectData: ProjectData;
  setProjectData: React.Dispatch<React.SetStateAction<ProjectData>>;
  onImageExport: () => void;
  onHtmlExport: () => void;
  onLogout: () => void;
}

const ProjectTab: React.FC<ProjectTabProps> = ({ projectData, setProjectData, onImageExport, onHtmlExport, onLogout }) => {
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

  const SectionHeader: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">{children}</h2>
  );

  return (
    <div className="space-y-8">
      <section>
        <SectionHeader>Aangepaste Gegevensvelden</SectionHeader>
        <div className="space-y-2">
          {projectData.customFields.map(field => (
            <div key={field.id} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-700 font-medium">{field.name}</span>
              <button onClick={() => removeCustomField(field.id)} className="text-slate-400 hover:text-red-500">
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
            className="flex-grow p-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && addCustomField()}
          />
          <button onClick={addCustomField} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm">Toevoegen</button>
        </div>
      </section>

      <section>
        <SectionHeader>Basiskaart Thema</SectionHeader>
        <select value={projectData.mapTheme} onChange={handleThemeChange} className="w-full p-2 border border-slate-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          {Object.keys(MAP_THEMES).map(theme => (
            <option key={theme} value={theme} className="capitalize">{theme.charAt(0).toUpperCase() + theme.slice(1)}</option>
          ))}
        </select>
      </section>
      
      <section>
        <SectionHeader>Kaart Exporteren</SectionHeader>
        <div className="flex flex-col space-y-3">
          <button onClick={onImageExport} className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-sm">Afbeelding Downloaden (.JPG)</button>
          <button onClick={onHtmlExport} className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold shadow-sm">Interactieve Kaart Downloaden (.HTML)</button>
        </div>
      </section>

      <section>
        <SectionHeader>Account</SectionHeader>
        <div className="flex flex-col space-y-3">
          <button onClick={onLogout} className="w-full px-4 py-2.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-semibold shadow-sm">Uitloggen</button>
        </div>
      </section>
    </div>
  );
};

export default ProjectTab;
