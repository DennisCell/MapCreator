
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

  const handlePngExport = useCallback(() => {
    if (mapRef.current) {
      const html2canvas = (window as any).html2canvas;
      if (html2canvas) {
        const mapElement = mapRef.current;
        const { width, height } = mapElement.getBoundingClientRect();

        html2canvas(mapElement, {
          useCORS: true,
          width: width,
          height: height,
          windowWidth: width,
          windowHeight: height,
        }).then((canvas: HTMLCanvasElement) => {
          const link = document.createElement('a');
          link.download = 'map.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
        });
      } else {
        console.error("html2canvas library is not loaded.");
        alert("De afbeelding export functie is niet beschikbaar omdat een vereiste bibliotheek niet is geladen. Controleer uw internetverbinding en probeer het opnieuw.");
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
    <div className="flex h-screen w-screen font-sans text-gray-800">
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
      <div className="w-[35%] max-w-md h-full bg-white shadow-2xl z-10 overflow-y-auto">
        <WorkspacePanel
          projectData={projectData}
          setProjectData={setProjectData}
          onPngExport={handlePngExport}
          onHtmlExport={handleHtmlExport}
          isPlacingLocation={isPlacingLocation}
          setIsPlacingLocation={setIsPlacingLocation}
          newLocationCoords={newLocationCoords}
          setNewLocationCoords={setNewLocationCoords}
          selectedLocationId={selectedLocationId}
          setSelectedLocationId={setSelectedLocationId}
        />
      </div>
    </div>
  );
}

export default App;