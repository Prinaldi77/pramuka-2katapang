import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Save } from 'lucide-react';
import L from 'leaflet';
import { MapContainer, TileLayer, Circle, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Definisikan ikon penanda kustom untuk menghindari bug ikon Leaflet yang hilang di Vite
const customMarkerIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Komponen penolong untuk mengubah fokus kamera peta secara dinamis
const ChangeView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

// Komponen penolong untuk mendeteksi event klik di peta
const MapEventsHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Komponen marker seret (draggable)
const DraggableMarker = ({ position, onDragEnd }) => {
  const markerRef = useRef(null);
  const eventHandlers = React.useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          onDragEnd(latLng.lat, latLng.lng);
        }
      },
    }),
    [onDragEnd],
  );

  return (
    <L.Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      icon={customMarkerIcon}
      ref={markerRef}
    />
  );
};

const LocationPickerMap = ({
  latitude,
  longitude,
  radius,
  onChange,
}) => {
  const [presets, setPresets] = useState([]);
  const [presetName, setPresetName] = useState('');

  const latVal = Number(latitude) || -7.0278;
  const lngVal = Number(longitude) || 107.5756;
  const radVal = Number(radius) || 100;
  const position = [latVal, lngVal];

  // Muat lokasi favorit dari localStorage saat komponen dipasang
  useEffect(() => {
    const saved = localStorage.getItem('agenda_location_presets');
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Lokasi default
      const defaults = [
        { name: 'SMPN 2 Katapang (Pangkalan)', lat: -7.0278, lng: 107.5756 },
        { name: 'Buper Kiara Payung', lat: -6.9042, lng: 107.7667 },
      ];
      localStorage.setItem('agenda_location_presets', JSON.stringify(defaults));
      setPresets(defaults);
    }
  }, []);

  const updatePosition = (lat, lng) => {
    onChange(lat, lng);
  };

  const saveToPresets = () => {
    if (!presetName.trim()) {
      alert('Masukkan nama lokasi untuk disimpan.');
      return;
    }
    const newPreset = {
      name: presetName.trim(),
      lat: latVal,
      lng: lngVal,
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

  return (
    <div className="space-y-3 font-sans">
      
      {/* Pilihan Lokasi Favorit */}
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
                  Math.abs(p.lat - latVal) < 0.0001 && Math.abs(p.lng - lngVal) < 0.0001
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

      {/* Peta Interaktif Leaflet (OpenStreetMap) */}
      <div className="w-full h-60 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
        <MapContainer
          center={position}
          zoom={16}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          <ChangeView center={position} />
          <MapEventsHandler onMapClick={updatePosition} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Circle
            center={position}
            radius={radVal}
            pathOptions={{
              color: '#4c1d95',
              fillColor: '#8b5cf6',
              fillOpacity: 0.15,
              weight: 2
            }}
          />
          <DraggableMarker position={position} onDragEnd={updatePosition} />
        </MapContainer>
      </div>

      {/* Tampilan Koordinat & Input Simpan Favorit */}
      <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center justify-between pt-1">
        <span className="text-[10px] font-mono text-slate-400">
          Koordinat Terpilih: {latVal.toFixed(6)}, {lngVal.toFixed(6)}
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
