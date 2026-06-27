import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Save, Trash2 } from 'lucide-react';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Setup Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const redMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Helper component to center the map when coords change
function ChangeMapCenter({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

// Helper component to handle map clicks
function MapClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const LocationPickerMap = ({
  latitude,
  longitude,
  radius,
  onChange,
}) => {
  const [presets, setPresets] = useState([]);
  const [presetName, setPresetName] = useState('');

  // Load presets on mount
  useEffect(() => {
    const saved = localStorage.getItem('agenda_location_presets');
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Default presets
      const defaults = [
        { name: 'SMPN 2 Katapang (Pangkalan)', lat: -7.0278, lng: 107.5756 },
        { name: 'Buper Kiara Payung', lat: -6.9042, lng: 107.7667 },
      ];
      localStorage.setItem('agenda_location_presets', JSON.stringify(defaults));
      setPresets(defaults);
    }
  }, []);

  const handleMapClick = (lat, lng) => {
    onChange(lat, lng);
  };

  const saveToPresets = () => {
    if (!presetName.trim()) {
      alert('Masukkan nama lokasi untuk disimpan.');
      return;
    }
    const newPreset = {
      name: presetName.trim(),
      lat: latitude,
      lng: longitude,
    };
    const updated = [...presets, newPreset];
    localStorage.setItem('agenda_location_presets', JSON.stringify(updated));
    setPresets(updated);
    setPresetName('');
    alert(`Lokasi "${newPreset.name}" disimpan ke favorit!`);
  };

  const deletePreset = (index, e) => {
    e.stopPropagation();
    const updated = presets.filter((_, i) => i !== index);
    localStorage.setItem('agenda_location_presets', JSON.stringify(updated));
    setPresets(updated);
  };

  const selectPreset = (p) => {
    onChange(p.lat, p.lng);
  };

  const center = [latitude || -7.0278, longitude || 107.5756];

  return (
    <div className="space-y-3 font-sans">
      
      {/* Preset List Dropdown / Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 block">Pilih dari Lokasi Favorit</label>
        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
          {presets.length === 0 ? (
            <span className="text-xs text-slate-400 p-1">Belum ada lokasi favorit disimpan.</span>
          ) : (
            presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectPreset(p)}
                className={`inline-flex items-center space-x-1 px-2.5 py-1 text-xs rounded-lg transition-colors border ${
                  Math.abs(p.lat - latitude) < 0.0001 && Math.abs(p.lng - longitude) < 0.0001
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate max-w-[120px]">{p.name}</span>
                <span 
                  onClick={(e) => deletePreset(idx, e)} 
                  className="hover:text-red-300 ml-1 font-bold pl-1 border-l border-slate-200/50 cursor-pointer"
                  title="Hapus"
                >
                  &times;
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* The Interactive Map */}
      <div className="w-full h-60 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
        <MapContainer
          center={center}
          zoom={16}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeMapCenter center={center} />
          <MapClickHandler onClick={handleMapClick} />
          
          <Circle
            center={center}
            pathOptions={{
              color: '#4c1d95',
              fillColor: '#8b5cf6',
              fillOpacity: 0.15,
              weight: 2,
              dashArray: '5, 5'
            }}
            radius={radius || 100}
          />
          
          <Marker position={center} icon={redMarkerIcon} />
        </MapContainer>
      </div>

      {/* Coords & Save Preset Input */}
      <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center justify-between pt-1">
        <span className="text-[10px] font-mono text-slate-400">
          Koordinat Terpilih: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </span>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Simpan nama lokasi..."
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            className="flex-1 sm:w-40 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-primary min-h-[30px]"
          />
          <button
            type="button"
            onClick={saveToPresets}
            className="inline-flex items-center justify-center px-3 py-1 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-700 min-h-[30px]"
          >
            <Save className="h-3.5 w-3.5 mr-1" /> Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerMap;
