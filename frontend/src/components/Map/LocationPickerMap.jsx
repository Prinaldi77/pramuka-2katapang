import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Save } from 'lucide-react';

const LocationPickerMap = ({
  latitude,
  longitude,
  radius,
  onChange,
}) => {
  const mapContainerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [presets, setPresets] = useState([]);
  const [presetName, setPresetName] = useState('');
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

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

  // Load Google Maps SDK Script
  useEffect(() => {
    const loadScript = () => {
      if (window.google && window.google.maps) {
        setMapLoaded(true);
        return;
      }
      const existing = document.getElementById('google-maps-script');
      if (existing) {
        const check = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(check);
            setMapLoaded(true);
          }
        }, 100);
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY || 'AIzaSyA0qPgb21JTzpe0EruEbfLkYrPGSMvM6Co'}`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    };

    loadScript();
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current) return;

    const latVal = Number(latitude) || -7.0278;
    const lngVal = Number(longitude) || 107.5756;
    const radVal = Number(radius) || 100;
    const pos = { lat: latVal, lng: lngVal };

    // Create Map instance
    const map = new window.google.maps.Map(mapContainerRef.current, {
      center: pos,
      zoom: 16,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    mapRef.current = map;

    // Create Draggable Marker
    const marker = new window.google.maps.Marker({
      position: pos,
      map: map,
      draggable: true,
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
      }
    });
    markerRef.current = marker;

    // Create Geofence Circle
    const circle = new window.google.maps.Circle({
      strokeColor: '#4c1d95',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#8b5cf6',
      fillOpacity: 0.15,
      map: map,
      center: pos,
      radius: radVal,
    });
    circleRef.current = circle;

    // Map Click Listener
    map.addListener('click', (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      updatePosition(lat, lng);
    });

    // Marker Drag Listener
    marker.addListener('dragend', (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      updatePosition(lat, lng);
    });

  }, [mapLoaded]);

  // Handle external coordinate changes or preset selections
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const latVal = Number(latitude) || -7.0278;
    const lngVal = Number(longitude) || 107.5756;
    const radVal = Number(radius) || 100;
    const pos = { lat: latVal, lng: lngVal };

    if (markerRef.current) {
      markerRef.current.setPosition(pos);
    }
    if (circleRef.current) {
      circleRef.current.setCenter(pos);
      circleRef.current.setRadius(radVal);
    }
    mapRef.current.panTo(pos);
  }, [latitude, longitude, radius, mapLoaded]);

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
      lat: Number(latitude),
      lng: Number(longitude),
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
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Coords & Save Preset Input */}
      <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center justify-between pt-1">
        <span className="text-[10px] font-mono text-slate-400">
          Koordinat Terpilih: {Number(latitude).toFixed(6)}, {Number(longitude).toFixed(6)}
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
