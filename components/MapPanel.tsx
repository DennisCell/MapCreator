
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { ProjectData, Location } from '../types';
import { MAP_THEMES } from '../constants';

// Declare leaflet and its plugins from CDN
declare const L: any;

interface MapPanelProps {
  projectData: ProjectData;
  setProjectData: React.Dispatch<React.SetStateAction<ProjectData>>;
  isPlacingLocation: boolean;
  setIsPlacingLocation: React.Dispatch<React.SetStateAction<boolean>>;
  setNewLocationCoords: React.Dispatch<React.SetStateAction<{lat: number, lng: number} | null>>;
  selectedLocationId: string | null;
  setSelectedLocationId: React.Dispatch<React.SetStateAction<string | null>>;
}

// Fix: Changed component signature to use React.FC to resolve "Cannot find namespace 'JSX'" error.
const MapPanel: React.FC<MapPanelProps> = ({ 
  projectData, 
  setProjectData,
  isPlacingLocation,
  setIsPlacingLocation,
  setNewLocationCoords,
  selectedLocationId,
  setSelectedLocationId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const layersRef = useRef<any[]>([]);
  const connectorsRef = useRef<any>(null);
  const draggableRef = useRef<Map<string, any>>(new Map());
  const locationLayersRef = useRef<Map<string, any>>(new Map());
  const [currentZoom, setCurrentZoom] = useState(projectData.mapZoom);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current, { 
        zoomControl: false,
        zoomDelta: 0.25,
        zoomSnap: 0.25,
      }).setView(projectData.mapCenter, projectData.mapZoom);
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapRef.current = map;
      
      // When the map is rendered conditionally (e.g., after a login),
      // its container might not have the correct size at the moment of initialization.
      // Calling invalidateSize() after a short delay ensures the map dimensions are
      // correctly calculated, fixing rendering issues like grey tiles.
      setTimeout(() => map.invalidateSize(), 100);

      connectorsRef.current = L.layerGroup().addTo(map);

      map.on('moveend', () => {
        const mapInstance = mapRef.current;
        if (!mapInstance) return;

        const center = mapInstance.getCenter();
        const zoom = mapInstance.getZoom();
        setCurrentZoom(zoom);
        setProjectData(prev => ({
            ...prev,
            mapCenter: [center.lat, center.lng],
            mapZoom: zoom,
        }));
      });

      const getScale = (z: number) => {
        if (z >= 13) return 1.0;
        if (z <= 9) return 0.3;
        // Linear interpolation between zoom 9 (scale 0.3) and zoom 13 (scale 1.0)
        const scale = 0.3 + (z - 9) * (1.0 - 0.3) / (13 - 9);
        return Math.max(0.3, Math.min(1.0, scale));
      };

      // Set initial scale
      const initialScale = getScale(projectData.mapZoom);
      document.documentElement.style.setProperty('--location-scale', initialScale.toString());

      map.on('zoomend', (e: any) => {
        const newZoom = e.target.getZoom();
        const newScale = getScale(newZoom);
        document.documentElement.style.setProperty('--location-scale', newScale.toString());
      });


      tileLayerRef.current = L.tileLayer(MAP_THEMES[projectData.mapTheme].url, {
        attribution: MAP_THEMES[projectData.mapTheme].attribution,
      }).addTo(map);
    }
  }, []); // Only run once on mount

  // Fly to selected location
  useEffect(() => {
    if (mapRef.current && selectedLocationId) {
      const location = projectData.locations.find(loc => loc.id === selectedLocationId);
      if (location) {
        mapRef.current.flyTo([location.latitude, location.longitude], 15, {
          duration: 1.5,
        });
      }
    }
  }, [selectedLocationId, projectData.locations]);


  const handleMapClick = useCallback((e: any) => {
    setNewLocationCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    setIsPlacingLocation(false); // Exit placing mode after a location is selected
  }, [setNewLocationCoords, setIsPlacingLocation]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const mapContainer = map.getContainer();

    if (isPlacingLocation) {
      mapContainer.style.cursor = 'crosshair';
      map.on('click', handleMapClick);
    } else {
      mapContainer.style.cursor = '';
      map.off('click', handleMapClick);
    }
    
    return () => {
      mapContainer.style.cursor = '';
      map.off('click', handleMapClick);
    };
  }, [isPlacingLocation, handleMapClick]);


  useEffect(() => {
    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(MAP_THEMES[projectData.mapTheme].url);
      tileLayerRef.current.options.attribution = MAP_THEMES[projectData.mapTheme].attribution;
      tileLayerRef.current.redraw();
    }
  }, [projectData.mapTheme]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear previous layers
    layersRef.current.forEach(layer => map.removeLayer(layer));
    layersRef.current = [];
    connectorsRef.current.clearLayers();
    locationLayersRef.current.clear();
    draggableRef.current.forEach(d => d.disable());
    draggableRef.current.clear();


    // Fix: Explicitly type the Map to ensure TypeScript correctly infers the type of `from` and `to` locations.
    const locationMap = new Map<string, Location>(projectData.locations.map(loc => [loc.id, loc]));

    // Draw locations
    projectData.locations.forEach(location => {
      let marker;
      if (location.type === 'SIMPLE') {
        marker = L.marker([location.latitude, location.longitude], {
          icon: L.divIcon({
            className: 'leaflet-div-icon',
            html: `<span class="bg-slate-800 text-white px-2 py-1 rounded-md text-xs shadow-md">${location.name}</span>`,
            iconSize: [100, 20],
            iconAnchor: [50, 10]
          })
        });
      } else {
        const iconContent = `<div class="w-7 h-7 flex items-center justify-center text-white ${location.style.shape === 'SQUARE' ? 'rounded-md' : 'rounded-full'} ring-2 ring-white/70 shadow-lg" style="background-color: ${location.style.color};">
            ${location.style.icon === 'BUILDING' ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0v-4m0 4h5m0 0v-4m0 4H8m2-8h4m-4 0V9m4 0v4m-4-4h.01M12 13h.01M12 9h.01M12 5h.01M8 13h.01M8 9h.01M8 5h.01M5 17h.01M5 13h.01M5 9h.01M5 5h.01"/></svg>` : ''}
            ${location.style.icon === 'FLAG' ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg>` : ''}
          </div>`;
        const iconHtml = `<div class="scalable-content scalable-marker-content">${iconContent}</div>`;
        
        const markerDiv = L.divIcon({
          className: `custom-marker`,
          html: iconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        marker = L.marker([location.latitude, location.longitude], { icon: markerDiv });
        
        marker.on('click', () => {
          setSelectedLocationId(location.id);
        });

        const populatedCustomFields = projectData.customFields.filter(
            field => location.customData[field.id] && location.customData[field.id].trim() !== ''
        );
        const descriptionField = populatedCustomFields.find(f => f.name.toLowerCase() === 'omschrijving' || f.name.toLowerCase() === 'acties');
        const regularFields = populatedCustomFields.filter(f => f.id !== descriptionField?.id);
        
        const dragHandleIconSvg = `<svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-slate-400"><circle cx="9" cy="4" r="1.5"></circle><circle cx="9" cy="12" r="1.5"></circle><circle cx="9" cy="20" r="1.5"></circle><circle cx="15" cy="4" r="1.5"></circle><circle cx="15" cy="12" r="1.5"></circle><circle cx="15" cy="20" r="1.5"></circle></svg>`;

        let tooltipInnerContent = `<div class="p-3 font-sans bg-white/90 backdrop-blur-sm rounded-lg shadow-md ring-1 ring-slate-900/5 cursor-grab" style="min-width: 220px;">`;
        tooltipInnerContent += `<div class="flex items-start justify-between">`;
        tooltipInnerContent += `<h2 class="text-base font-bold text-slate-700 break-words flex-grow mr-2">${location.name}</h2>`;
        tooltipInnerContent += `<div class="flex-shrink-0 pt-1">${dragHandleIconSvg}</div>`;
        tooltipInnerContent += `</div>`;


        if (regularFields.length > 0) {
            tooltipInnerContent += `<div class="mt-2 pt-2 border-t border-slate-200/80 space-y-1 text-sm">`;
            regularFields.forEach(field => {
                const value = location.customData[field.id] || '';
                tooltipInnerContent += `<div class="flex justify-between items-baseline"><span class="text-slate-500 mr-2">${field.name}</span><span class="font-medium text-slate-800 text-right">${value}</span></div>`;
            });
            tooltipInnerContent += `</div>`;
        }

        if (descriptionField && location.customData[descriptionField.id]) {
            tooltipInnerContent += `<div class="pt-2 mt-2 border-t border-slate-200/80"><p class="text-sm text-slate-700 whitespace-pre-wrap break-words">${location.customData[descriptionField.id]}</p></div>`;
        }
        tooltipInnerContent += `</div>`;
        const tooltipContent = `<div class="scalable-content scalable-tooltip-content">${tooltipInnerContent}</div>`;
        
        const tooltip = marker.bindTooltip(tooltipContent, {
            permanent: true,
            direction: 'right',
            offset: [16, 0],
            className: 'custom-leaflet-tooltip'
        }).getTooltip();

        if (tooltip) {
          const tooltipElement = tooltip.getElement();
          if (location.labelOffset && tooltipElement) {
              L.DomUtil.setPosition(tooltipElement, L.point(location.labelOffset.x, location.labelOffset.y));
          }

          if (tooltipElement) {
              const draggable = new L.Draggable(tooltipElement);
              draggable.enable();
              draggable.on('dragend', () => {
                  const pos = L.DomUtil.getPosition(tooltipElement);
                  setProjectData(prev => ({
                      ...prev,
                      locations: prev.locations.map(loc => 
                          loc.id === location.id ? { ...loc, labelOffset: { x: pos.x, y: pos.y } } : loc
                      )
                  }));
              });
              draggableRef.current.set(location.id, draggable);
          }
        }
      }
      
      marker.addTo(map);
      layersRef.current.push(marker);
      locationLayersRef.current.set(location.id, marker);
    });
    
    // Draw connectors after all markers are on the map
    projectData.locations.forEach(location => {
      if (location.type === 'DETAILED' && location.labelOffset && (location.labelOffset.x !== 0 || location.labelOffset.y !== 0)) {
        const marker = locationLayersRef.current.get(location.id);
        const tooltip = marker?.getTooltip();
        if (!marker || !tooltip) return;

        const tooltipEl = tooltip.getElement();
        if (!tooltipEl) return;
        
        const markerLatLng = L.latLng(location.latitude, location.longitude);
        
        // Use the saved absolute position of the tooltip
        const tooltipTopLeftPoint = L.point(location.labelOffset.x, location.labelOffset.y);

        // Anchor the line to the middle of the left edge of the tooltip
        const lineEndPoint = tooltipTopLeftPoint.add([0, tooltipEl.offsetHeight / 2]);
        const lineEndLatLng = map.containerPointToLatLng(lineEndPoint);

        const line = L.polyline([markerLatLng, lineEndLatLng], {
            color: '#64748b', // slate-500
            weight: 1,
            dashArray: '4, 4'
        });
        line.addTo(connectorsRef.current);
      }
    });


    // Draw connections
    projectData.connections.forEach(conn => {
      const from = locationMap.get(conn.from);
      const to = locationMap.get(conn.to);
      if (from && to) {
        const latlngs = [[from.latitude, from.longitude], [to.latitude, to.longitude]];
        const polyline = L.polyline(latlngs, { color: '#3b82f6', weight: 3 }).addTo(map);
        layersRef.current.push(polyline);
        
        const decorator = L.polylineDecorator(polyline, {
            patterns: [
                { offset: '100%', repeat: 0, symbol: L.Symbol.arrowHead({ pixelSize: 12, pathOptions: { color: '#3b82f6', fillOpacity: 1, weight: 0 } }) }
            ]
        }).addTo(map);
        layersRef.current.push(decorator);
      }
    });

  }, [projectData, setProjectData, setSelectedLocationId]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full grayscale-[50%] contrast-125" />
    </div>
  );
};

export default MapPanel;
