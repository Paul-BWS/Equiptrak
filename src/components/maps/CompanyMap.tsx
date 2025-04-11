import { useEffect, useState } from 'react';
import { useMaps } from '@/contexts/MapsContext';
import { GoogleMap, Marker } from '@react-google-maps/api';

interface CompanyMapProps {
  address: string;
}

export function CompanyMap({ address }: CompanyMapProps) {
  const { isLoaded, loadError: contextLoadError } = useMaps();
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(true);

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  console.log('Using Google Maps API Key:', googleMapsApiKey ? `${googleMapsApiKey.substring(0, 5)}...` : 'Key not found!');

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
  };
  
  const defaultCenter = {
    lat: 51.5074, // London coordinates as default
    lng: -0.1278,
  };

  useEffect(() => {
    if (!isLoaded || !googleMapsApiKey) {
      setIsGeocoding(false);
      return;
    }
    if (!address) {
      setGeocodingError("No address provided");
      setIsGeocoding(false);
      return;
    }

    setIsGeocoding(true);
    setGeocodingError(null);
    setCoordinates(null);

    const geocodeAddress = async () => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsApiKey}`
        );
        
        const data = await response.json();
        console.log("Geocoding API response:", data);
        
        if (data.status === 'OK' && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          setCoordinates({ lat, lng });
          setGeocodingError(null);
        } else {
          setGeocodingError(`Could not find coordinates. Status: ${data.status}${data.error_message ? ` - ${data.error_message}` : ''}`);
          console.error("Geocoding error details:", data);
        }
      } catch (err) {
        setGeocodingError(`Error calling Geocoding API: ${(err as Error).message}`);
        console.error(err);
      } finally {
        setIsGeocoding(false);
      }
    };
    
    geocodeAddress();
    
  }, [address, googleMapsApiKey, isLoaded]);

  const error = contextLoadError?.message || geocodingError;
  const isLoading = !isLoaded || isGeocoding;

  if (error) {
    return (
      <div className="bg-red-50 h-full flex items-center justify-center p-4 text-red-700 text-center">
        <p>Error loading map:</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gray-50 h-full flex items-center justify-center">
        <p>Loading map data...</p> 
      </div>
    );
  }

  return (
    <div className="w-full h-full">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={coordinates || defaultCenter}
          zoom={coordinates ? 12 : 8} 
        >
          {coordinates && <Marker position={coordinates} />}
        </GoogleMap>
    </div>
  );
}