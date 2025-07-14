import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Box, Typography, Chip } from '@mui/material';

const GoogleMap = ({ lockers, center = { lat: 45.7640, lng: 4.8357 }, zoom = 12 }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: 'AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg',
        version: 'weekly',
        libraries: ['places']
      });

      try {
        const google = await loader.load();
        
        if (mapRef.current && !map) {
          const newMap = new google.maps.Map(mapRef.current, {
            center: center,
            zoom: zoom,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ],
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
          });

          setMap(newMap);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de Google Maps:', error);
      }
    };

    initMap();
  }, [center, zoom, map]);

  useEffect(() => {
    if (map && lockers) {
      markers.forEach(marker => marker.setMap(null));

      const newMarkers = lockers.map(locker => {
        const position = {
          lat: locker.location.coordinates[1],
          lng: locker.location.coordinates[0]
        };

        const marker = new google.maps.Marker({
          position: position,
          map: map,
          title: `Casier ${locker.number}`,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="${locker.status === 'available' ? '#4CAF50' : '#FF9800'}" stroke="white" stroke-width="2"/>
                <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${locker.number}</text>
              </svg>
            `)}`,
            scaledSize: new google.maps.Size(24, 24),
            anchor: new google.maps.Point(12, 12)
          }
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; max-width: 200px;">
              <h3 style="margin: 0 0 8px 0; color: #333;">Casier ${locker.number}</h3>
              <p style="margin: 4px 0; color: #666;">${locker.address.street}</p>
              <p style="margin: 4px 0; color: #666;">${locker.address.neighborhood}</p>
              <div style="margin-top: 8px;">
                <span style="background: ${locker.status === 'available' ? '#4CAF50' : '#FF9800'}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">
                  ${locker.status === 'available' ? 'Disponible' : 'Réservé'}
                </span>
                <span style="margin-left: 8px; font-weight: bold; color: #333;">${locker.price}€/jour</span>
              </div>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        return marker;
      });

      setMarkers(newMarkers);
    }
  }, [map, lockers]);

  return (
    <Box sx={{ position: 'relative', height: 400, borderRadius: 3, overflow: 'hidden' }}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '12px'
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          padding: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Casiers disponibles
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={`${lockers?.filter(l => l.status === 'available').length || 0} disponibles`}
            size="small"
            color="success"
          />
          <Chip
            label={`${lockers?.length || 0} total`}
            size="small"
            variant="outlined"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default GoogleMap; 