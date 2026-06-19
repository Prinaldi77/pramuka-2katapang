import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

// Import marker assets directly to fix Leaflet path mapping in Vite/React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Delete the default icon options and configure custom ones
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom Icon for Student Location
const studentIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom Icon for Agenda Location
const agendaIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const AttendanceMap = ({
  agendaLat,
  agendaLng,
  agendaRadius,
  userLat,
  userLng,
  agendaTitle = 'Lokasi Latihan',
}) => {
  // If no agenda coordinates are provided, default to SMPN 2 Katapang coordinates
  const latCenter = agendaLat || -7.0278;
  const lngCenter = agendaLng || 107.5756;
  const radius = agendaRadius || 100;

  // Center coordinate list
  const center = [latCenter, lngCenter];

  return (
    <div className="w-full h-80 sm:h-96 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative">
      <MapContainer
        center={userLat && userLng ? [userLat, userLng] : center}
        zoom={17}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Agenda Geofence Circle */}
        <Circle
          center={center}
          pathOptions={{
            color: '#2a4a29',
            fillColor: '#2a4a29',
            fillOpacity: 0.15,
            weight: 2,
            dashArray: '5, 10'
          }}
          radius={radius}
        />

        {/* Agenda Target Marker */}
        <Marker position={center} icon={agendaIcon}>
          <Popup>
            <div className="font-sans text-xs">
              <p className="font-bold text-slate-800">{agendaTitle}</p>
              <p className="text-slate-500 mt-1">Radius Geofence: {radius}m</p>
            </div>
          </Popup>
        </Marker>

        {/* Student Live GPS Marker (if available) */}
        {userLat && userLng && (
          <Marker position={[userLat, userLng]} icon={studentIcon}>
            <Popup>
              <div className="font-sans text-xs">
                <p className="font-bold text-emerald-700">Lokasi Anda Sekarang</p>
                <p className="text-slate-500 mt-1">
                  Koord: {userLat.toFixed(6)}, {userLng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Floating Legend */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur-xs p-3 rounded-lg border border-slate-200/80 shadow-md text-[10px] space-y-1 font-sans">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
          <span className="font-semibold text-slate-700">Target Lokasi Latihan</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
          <span className="font-semibold text-slate-700">Lokasi GPS Anda</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-block w-6 h-3 border border-dashed border-primary bg-primary/10 rounded"></span>
          <span className="font-semibold text-slate-700">Area Radius Absen ({radius}m)</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceMap;
