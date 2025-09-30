import React, { useCallback, useRef, useState, useEffect } from 'react';
import { INITIAL_PROJECT_DATA } from './constants';
import { ProjectData } from './types';
import MapPanel from './components/MapPanel';
import WorkspacePanel from './components/WorkspacePanel';
import { generateExportHtml } from './services/exportService';
import LoginScreen from './components/LoginScreen';
import { supabase } from './services/supabaseClient';
import type { Session } from '@supabase/supabase-js';

function App() {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [isPlacingLocation, setIsPlacingLocation] = useState<boolean>(false);
  const [newLocationCoords, setNewLocationCoords] = useState<{lat: number, lng: number} | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const saveDataTimeoutRef = useRef<number | null>(null);
  
  // If the Supabase client isn't configured, display an error message
  // instead of trying to render the app, which would cause a crash.
  if (!supabase) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-100 p-8">
        <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg text-center">
            <h1 className="text-2xl font-bold text-red-600">Supabase Is Not Configured</h1>
            <p className="text-slate-700 mt-4">
                The application cannot connect to the backend because the Supabase client is not configured.
            </p>
            <p className="text-slate-600 mt-2">
                Please open the file <code className="bg-slate-200 text-slate-800 px-1.5 py-1 rounded-md font-mono">services/supabaseClient.ts</code> and replace the placeholder values with your actual Supabase Project URL and Public Anon Key.
            </p>
        </div>
      </div>
    );
  }

  const saveProjectData = useCallback(async (dataToSave: ProjectData) => {
    if (!session?.user) return;
    const { error } = await supabase
      .from('projects')
      .upsert({ 
          user_id: session.user.id, 
          data: dataToSave, 
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error saving project data:', error);
    }
  }, [session]);

  const debouncedSave = useCallback((data: ProjectData) => {
    if (saveDataTimeoutRef.current) {
        clearTimeout(saveDataTimeoutRef.current);
    }
    saveDataTimeoutRef.current = window.setTimeout(() => {
        saveProjectData(data);
    }, 1000); // Save 1 second after last change
  }, [saveProjectData]);

  const setAndSaveProjectData: React.Dispatch<React.SetStateAction<ProjectData>> = (action) => {
    // This function assumes projectData is not null when called, which is ensured
    // by the conditional rendering logic in this component.
    setProjectData(prevData => {
        const newData = action instanceof Function ? action(prevData!) : action;
        if (newData) {
          debouncedSave(newData);
        }
        return newData;
    });
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      setLoading(true);
      supabase
        .from('projects')
        .select('data')
        .eq('user_id', session.user.id)
        .single()
        .then(({ data, error }) => {
          if (data && data.data) {
            setProjectData(data.data as ProjectData);
          } else {
            // No existing project, use initial data and save it.
            setProjectData(INITIAL_PROJECT_DATA);
            saveProjectData(INITIAL_PROJECT_DATA);
          }
          if (error && error.code !== 'PGRST116') { // PGRST116: Ignore "no rows found" error
            console.error('Error fetching project data:', error);
          }
        })
        .finally(() => setLoading(false));
    } else {
      // User logged out, clear project data
      setProjectData(null);
    }
  }, [session, saveProjectData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

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
    if (!projectData) return;
    const htmlContent = generateExportHtml(projectData);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'interactive_map.html';
    link.click();
    URL.revokeObjectURL(link.href);
  }, [projectData]);
  
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Laden...</p>
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }
  
  if (!projectData) {
      return (
          <div className="flex h-screen w-screen items-center justify-center bg-slate-100">
            <p className="text-slate-600">Projectgegevens laden...</p>
          </div>
      );
  }

  return (
    <div className="flex h-screen w-screen font-sans text-slate-800">
      <div className="flex-grow h-full" ref={mapRef}>
        <MapPanel
          projectData={projectData}
          setProjectData={setAndSaveProjectData}
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
          setProjectData={setAndSaveProjectData}
          onImageExport={handleImageExport}
          onHtmlExport={handleHtmlExport}
          isPlacingLocation={isPlacingLocation}
          setIsPlacingLocation={setIsPlacingLocation}
          newLocationCoords={newLocationCoords}
          setNewLocationCoords={setNewLocationCoords}
          selectedLocationId={selectedLocationId}
          setSelectedLocationId={setSelectedLocationId}
          onLogout={handleLogout}
        />
      </aside>
    </div>
  );
}

export default App;
