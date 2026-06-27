import React, { useEffect, useRef, useState } from 'react';

const AttendanceMap = ({
  agendaLat,
  agendaLng,
  agendaRadius,
  userLat,
  userLng,
  agendaTitle = 'Lokasi Latihan',
}) => {
  const mapContainerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

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

  // Initialize and update Map markers/circle
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current) return;

    const latCenter = Number(agendaLat) || -7.0278;
    const lngCenter = Number(agendaLng) || 107.5756;
    const radius = Number(agendaRadius) || 100;
    const center = { lat: latCenter, lng: lngCenter };

    // Create Map instance
    const map = new window.google.maps.Map(mapContainerRef.current, {
      center: userLat && userLng ? { lat: Number(userLat), lng: Number(userLng) } : center,
      zoom: 17,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    // Create Agenda Location Marker
    new window.google.maps.Marker({
      position: center,
      map: map,
      title: agendaTitle,
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
      }
    });

    // Create Geofence Circle
    new window.google.maps.Circle({
      strokeColor: '#16a34a',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#22c55e',
      fillOpacity: 0.15,
      map: map,
      center: center,
      radius: radius,
    });

    // Create Student Live Location Marker (if available)
    if (userLat && userLng) {
      new window.google.maps.Marker({
        position: { lat: Number(userLat), lng: Number(userLng) },
        map: map,
        title: 'Lokasi Anda',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
        }
      });
    }

  }, [mapLoaded, agendaLat, agendaLng, agendaRadius, userLat, userLng, agendaTitle]);

  return (
    <div className="w-full h-80 sm:h-96 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Floating Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-xs p-3 rounded-lg border border-slate-200/80 shadow-md text-[10px] space-y-1 font-sans">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
          <span className="font-semibold text-slate-700">Target Lokasi Latihan</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
          <span className="font-semibold text-slate-700">Lokasi GPS Anda</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-block w-6 h-3 border border-dashed border-emerald-600 bg-emerald-600/10 rounded"></span>
          <span className="font-semibold text-slate-700">Area Radius Absen ({agendaRadius || 100}m)</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceMap;
