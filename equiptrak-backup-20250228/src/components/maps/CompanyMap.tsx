import { useEffect, useState } from 'react';
import { useMaps } from './MapsContext';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

interface CompanyMapProps {
  address: string;
}

export function CompanyMap({ address }: CompanyMapProps) {
  const { coordinates, setCoordinates, isLoading, setIsLoading, error, setError } = useMaps();
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Use import.meta.env instead of process.env for Vite
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  
  const mapContainerStyle = {
    width: '100%',
    height: '300px',
  };
  
  const defaultCenter = {
    lat: 51.5074, // London coordinates as default
    lng: -0.1278,
  };

  useEffect(() => {
    if (!address) {
      setError("No address provided");
      return;
    }

    // For now, let's just use a placeholder instead of making API calls
    // This avoids needing an actual Google Maps API key for development
    setIsLoading(true);
    setTimeout(() => {
      setCoordinates(defaultCenter);
      setIsLoading(false);
    }, 500);
    
    // Comment out the actual geocoding for now
    /*
    const geocodeAddress = async () => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsApiKey}`
        );
        
        const data = await response.json();
        
        if (data.status === 'OK' && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          setCoordinates({ lat, lng });
          setError(null);
        } else {
          setError("Could not find coordinates for this address");
        }
      } catch (err) {
        setError("Error geocoding address");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    geocodeAddress();
    */
  }, [address, setCoordinates, setError, setIsLoading]);

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
        <p>Error loading map: {error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200 flex justify-center">
        <p>Loading map...</p>
      </div>
    );
  }

  // Use a placeholder div instead of the actual Google Maps component
  // until you have a valid API key
  return (
    <div className="border rounded-md overflow-hidden h-[300px]">
      <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center p-4 text-center">
        <p className="text-gray-600 mb-2">Map would display here for address:</p>
        <p className="font-semibold mb-4">{address}</p>
        <p className="text-sm text-gray-500">Google Maps integration coming soon</p>
      </div>
    </div>
  );
  
  /* Uncomment this when you have a valid Google Maps API key
  return (
    <div className="border rounded-md overflow-hidden h-[300px]">
      <LoadScript googleMapsApiKey={googleMapsApiKey} onLoad={() => setMapLoaded(true)}>
        {mapLoaded && (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={coordinates || defaultCenter}
            zoom={15}
          >
            {coordinates && <Marker position={coordinates} />}
          </GoogleMap>
        )}
      </LoadScript>
    </div>
  );
  */
}