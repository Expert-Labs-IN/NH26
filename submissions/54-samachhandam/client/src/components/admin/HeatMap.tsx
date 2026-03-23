import {
  GoogleMap,
  HeatmapLayer,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useCallback } from "react";

type HeatPoint = {
  lat: number;
  lng: number;
};

const heatmapData: HeatPoint[] = [
  // 🔴 Howrah (dense → many points)
  { lat: 22.5958, lng: 88.2636 },
  { lat: 22.5960, lng: 88.2638 },
  { lat: 22.5962, lng: 88.2640 },

  // 🔴 Sealdah
  { lat: 22.5676, lng: 88.3702 },
  { lat: 22.5678, lng: 88.3705 },
  { lat: 22.5680, lng: 88.3700 },

  // 🔴 Esplanade (center)
  { lat: 22.5726, lng: 88.3639 },
  { lat: 22.5727, lng: 88.3640 },
  { lat: 22.5725, lng: 88.3638 },

  // 🟠 Salt Lake
  { lat: 22.5726, lng: 88.4170 },
  { lat: 22.5730, lng: 88.4175 },

  // 🟡 Garia (less dense)
  { lat: 22.4620, lng: 88.4000 },
];

export default function HeatMapComponent() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries: ["visualization"],
  });

  // ✅ Properly typed map instance
  const onLoad = useCallback((map: google.maps.Map) => {
    const bounds = new google.maps.LatLngBounds();

    heatmapData.forEach((p) => {
      bounds.extend(new google.maps.LatLng(p.lat, p.lng));
    });

    map.fitBounds(bounds);
  }, []);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "500px" }}
      onLoad={onLoad}
    >
      <HeatmapLayer
        data={heatmapData.map(
          (p) => new google.maps.LatLng(p.lat, p.lng)
        )}
      />
    </GoogleMap>
  );
}
