    import React from 'react';
    import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

    const containerStyle = {
      width: '100%',
      height: '400px'
    };

    const center = {
      lat: -3.745,
      lng: -38.523
    };

    function MyMapComponent() {
      const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "YOUR_API_KEY" // Replace with your actual API key
      });

      const [map, setMap] = React.useState(null);

      const onLoad = React.useCallback(function callback(map) {
        // Optional: Perform actions when the map loads
        setMap(map);
      }, []);

      const onUnmount = React.useCallback(function callback(map) {
        // Optional: Perform cleanup when the map unmounts
        setMap(null);
      }, []);

      return isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {/* Child components like Markers, InfoWindows can be placed here */}
        </GoogleMap>
      ) : <></>;
    }

    export default React.memo(MyMapComponent);