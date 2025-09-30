
export interface CustomField {
  id: string;
  name: string;
}

export type LocationType = 'DETAILED' | 'SIMPLE';
export type MarkerShape = 'CIRCLE' | 'SQUARE';
export type MarkerIcon = 'BUILDING' | 'FLAG' | 'NONE';

export interface LocationStyle {
  color: string;
  shape: MarkerShape;
  icon: MarkerIcon;
}

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  latitude: number;
  longitude: number;
  customData: { [fieldId: string]: string };
  style: LocationStyle;
  labelOffset?: { x: number; y: number };
}

export interface Connection {
  id: string;
  from: string; // Location ID
  to: string;   // Location ID
}

export type MapTheme = 'light' | 'dark' | 'satellite' | 'streets';

export interface ProjectData {
  customFields: CustomField[];
  locations: Location[];
  connections: Connection[];
  mapTheme: MapTheme;
  mapCenter: [number, number];
  mapZoom: number;
}