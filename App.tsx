import React, { useCallback, useRef, useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { INITIAL_PROJECT_DATA } from './constants';
import { ProjectData } from './types';
import MapPanel from './components/MapPanel';
import WorkspacePanel from './components/WorkspacePanel';
import { generateExportHtml } from './services/exportService';

function App() {
  const [projectData, setProjectData] = useLocalStorage<ProjectData>('map-creator-project', INITIAL_PROJECT_DATA);
  const mapRef = useRef<HTMLDivElement>(null);
  const [isPlacingLocation, setIsPlacingLocation] = useState<boolean>(false);
  const [newLocationCoords, setNewLocationCoords] = useState<{lat: number, lng: number} | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  const handleImageExport = useCallback(() => {
    if (mapRef.current) {
      const html2canvas = (window as any).html2canvas;
      if (html2canvas) {
        const mapElement = mapRef.current;
        
        // Verberg tijdelijk UI-elementen die niet in de export moeten komen
        const leafletControls = mapElement.querySelector('.leaflet-control-container') as HTMLElement | null;
        if (leafletControls) {
          leafletControls.style.display = 'none';
        }

        html2canvas(mapElement, {
          useCORS: true,
          logging: false, // Zet op true voor debuggen indien nodig
        }).then((canvas: HTMLCanvasElement) => {
          const link = document.createElement('a');
          link.download = 'map.jpg';
          link.href = canvas.toDataURL('image/jpeg', 0.95);
          link.click();
        }).catch(err => {
            console.error("html2canvas error:", err);
            alert("Er is een fout opgetreden bij het exporteren van de afbeelding. Probeer het opnieuw.");
        }).finally(() => {
            // Herstel UI-elementen in een finally-blok om zeker te zijn dat ze altijd worden hersteld
            if (leafletControls) {
                leafletControls.style.display = '';
            }
        });
      } else {
        console.error("html2canvas library is not loaded.");
        alert("De export-functionaliteit kon niet worden geïnitialiseerd. Probeer de pagina te vernieuwen.");
      }
    }
  }, []);

  const handleHtmlExport = useCallback(() => {
    const htmlContent = generateExportHtml(projectData);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'interactive_map.html';
    link.click();
    URL.revokeObjectURL(link.href);
  }, [projectData]);

  return (
    <div className="flex h-screen w-screen font-sans text-slate-800">
      <div className="flex-grow h-full" ref={mapRef}>
        <MapPanel
          projectData={projectData}
          setProjectData={setProjectData}
          isPlacingLocation={isPlacingLocation}
          setIsPlacingLocation={setIsPlacingLocation}
          setNewLocationCoords={setNewLocationCoords}
          selectedLocationId={selectedLocationId}
          setSelectedLocationId={setSelectedLocationId}
        />
      </div>
      <aside className="w-[450px] flex-shrink-0 h-full bg-white shadow-lg z-10 border-l border-slate-200">
        <WorkspacePanel
          projectData={projectData}
          setProjectData={setProjectData}
          onImageExport={handleImageExport}
          onHtmlExport={handleHtmlExport}
          isPlacingLocation={isPlacingLocation}
          setIsPlacingLocation={setIsPlacingLocation}
          newLocationCoords={newLocationCoords}
          setNewLocationCoords={setNewLocationCoords}
          selectedLocationId={selectedLocationId}
          setSelectedLocationId={setSelectedLocationId}
        />
      </aside>
    </div>
  );
}

export default App;