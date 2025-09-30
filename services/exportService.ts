import { ProjectData } from '../types';
import { MAP_THEMES } from '../constants';

export const generateExportHtml = (projectData: ProjectData): string => {
  const serializedData = JSON.stringify(projectData);
  const mapThemeDetails = MAP_THEMES[projectData.mapTheme];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Map - MapCreator Pro</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://unpkg.com/leaflet-polylinedecorator@1.6.0/dist/leaflet.polylineDecorator.js"></script>
    <style>
        body, html { margin: 0; padding: 0; height: 100%; font-family: sans-serif; }
        #map { width: 100%; height: 100%; }
        .custom-leaflet-tooltip.leaflet-tooltip-permanent {
          background: transparent;
          border: none;
          box-shadow: none;
          padding: 0;
        }
        .custom-leaflet-tooltip.leaflet-tooltip-permanent::before {
          content: none; /* Hide the default arrow */
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        const projectData = ${serializedData};
        
        const map = L.map('map').setView(projectData.mapCenter, projectData.mapZoom);

        L.tileLayer('${mapThemeDetails.url}', {
            attribution: '${mapThemeDetails.attribution}',
            maxZoom: 19
        }).addTo(map);

        const markerMap = new Map();
        projectData.locations.forEach(location => {
            let marker;
            if (location.type === 'SIMPLE') {
                marker = L.marker([location.latitude, location.longitude], {
                    icon: L.divIcon({
                        className: 'leaflet-div-icon',
                        html: \`<span style="background: #1e293b; color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);">\${location.name}</span>\`,
                        iconSize: [100, 20],
                        iconAnchor: [50, 10]
                    })
                });
            } else {
                let iconHtml = '';
                if (location.style.icon === 'BUILDING') iconHtml = '<svg xmlns="http://www.w.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM7.5 5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM4.5 8a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5z"/><path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zm11 0H3v14h3v-2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V15h3z"/></svg>';
                if (location.style.icon === 'FLAG') iconHtml = '<svg xmlns="http://www.w.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.314.464L14.5 8l.186.464A.5.5 0 0 1 14.5 9H14v7a.5.5 0 0 1-.5.5H9.5a.5.5 0 0 1 0-1H13V9H2L1.5 8.5l.5-.5H2v-1h1.5v-1H2v-1h1.5V4H2v-1h1.5V2H2V1h1.5V0h1v1h1.5v1H6V1h1.5v1H9V1h1.5v1H12V1h1.5V0h.278zM14 1.422l-2.158 1.573-.01.006-2.16 1.573-2.158 1.573-2.16 1.573L3.398 8H14zM2 9.5V15h1V9.5z"/></svg>';
                
                const shapeRadius = location.style.shape === 'SQUARE' ? '6px' : '50%';
                const markerHtml = \`<div style="width: 28px; height: 28px; background-color: \${location.style.color}; border-radius: \${shapeRadius}; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid rgba(255,255,255,0.7); box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);">\${iconHtml}</div>\`;

                marker = L.marker([location.latitude, location.longitude], {
                    icon: L.divIcon({
                        className: '',
                        html: markerHtml,
                        iconSize: [32, 32],
                        iconAnchor: [16, 16],
                    })
                });

                const populatedCustomFields = projectData.customFields.filter(
                    field => location.customData[field.id] && String(location.customData[field.id]).trim() !== ''
                );
                const descriptionField = populatedCustomFields.find(f => f.name.toLowerCase() === 'omschrijving' || f.name.toLowerCase() === 'acties');
                const regularFields = populatedCustomFields.filter(f => !descriptionField || f.id !== descriptionField.id);

                let tooltipHtml = \`<div style="padding: 12px; font-family: sans-serif; background-color: rgba(255,255,255,0.95); border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); min-width: 200px; border: 1px solid #f1f5f9;">\`;
                tooltipHtml += \`<h2 style="font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 8px 0; word-wrap: break-word;">\${location.name}</h2>\`;

                if (regularFields.length > 0) {
                    tooltipHtml += \`<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 14px; display: grid; gap: 4px;">\`;
                    regularFields.forEach(field => {
                        const value = location.customData[field.id] || '';
                        tooltipHtml += \`<div style="display: flex; justify-content: space-between; align-items: baseline;"><span style="color: #64748b; margin-right: 8px;">\${field.name}</span><span style="font-weight: 500; text-align: right; color: #1e293b;">\${value}</span></div>\`;
                    });
                    tooltipHtml += \`</div>\`;
                }

                if (descriptionField && location.customData[descriptionField.id]) {
                    tooltipHtml += \`<div style="padding-top: 8px; margin-top: 8px; border-top: 1px solid #e2e8f0;">\`;
                    tooltipHtml += \`<p style="font-size: 14px; color: #334155; white-space: pre-wrap; word-wrap: break-word; margin: 0;">\${location.customData[descriptionField.id]}</p>\`;
                    tooltipHtml += \`</div>\`;
                }
                tooltipHtml += \`</div>\`;
                
                marker.bindTooltip(tooltipHtml, {
                    permanent: true,
                    direction: 'right',
                    offset: [16, 0],
                    className: 'custom-leaflet-tooltip'
                }).openTooltip();
            }
            marker.addTo(map);
            markerMap.set(location.id, marker);
        });

        projectData.connections.forEach(conn => {
            const fromLocation = projectData.locations.find(l => l.id === conn.from);
            const toLocation = projectData.locations.find(l => l.id === conn.to);
            if(fromLocation && toLocation) {
                const latlngs = [[fromLocation.latitude, fromLocation.longitude], [toLocation.latitude, toLocation.longitude]];
                const polyline = L.polyline(latlngs, { color: '#3b82f6', weight: 3 }).addTo(map);
                L.polylineDecorator(polyline, {
                    patterns: [
                        { offset: '100%', repeat: 0, symbol: L.Symbol.arrowHead({ pixelSize: 12, pathOptions: { color: '#3b82f6', fillOpacity: 1, weight: 0 } }) }
                    ]
                }).addTo(map);
            }
        });

        // Position tooltips and draw connector lines once the map is ready
        map.whenReady(function() {
            const connectors = L.layerGroup().addTo(map);
            projectData.locations.forEach(location => {
                if (location.type === 'DETAILED' && location.labelOffset) {
                    const marker = markerMap.get(location.id);
                    const tooltip = marker?.getTooltip();
                    if (!marker || !tooltip) return;
                    const tooltipEl = tooltip.getElement();
                    if (!tooltipEl) return;
                    
                    L.DomUtil.setPosition(tooltipEl, L.point(location.labelOffset.x, location.labelOffset.y));

                    if (location.labelOffset.x !== 0 || location.labelOffset.y !== 0) {
                        const markerLatLng = marker.getLatLng();
                        const tooltipTopLeftPoint = L.point(location.labelOffset.x, location.labelOffset.y);
                        const tooltipHeight = tooltipEl.offsetHeight;
                        const lineEndPoint = tooltipTopLeftPoint.add([0, tooltipHeight / 2]);
                        const lineEndLatLng = map.containerPointToLatLng(lineEndPoint);

                        const line = L.polyline([markerLatLng, lineEndLatLng], {
                            color: '#64748b',
                            weight: 1,
                            dashArray: '4, 4'
                        });
                        line.addTo(connectors);
                    }
                }
            });
        });
    </script>
</body>
</html>
  `;
};