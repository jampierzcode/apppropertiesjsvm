// MapComponent.js
import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

// Solucionar problemas de íconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapFilter = ({ ubicaciones }) => {
  const mapRef = useRef();
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const positionsArray = await Promise.all(
          ubicaciones.map(async (ubicacion) => {
            const { region, provincia, distrito } = ubicacion.ubicacion;
            const fullAddress = `${distrito}, ${provincia}, ${region}, Peru`;

            const response = await axios.get(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                fullAddress
              )}&format=json&limit=1`
            );

            if (response.data.length > 0) {
              const { lat, lon } = response.data[0];
              return {
                position: [parseFloat(lat), parseFloat(lon)],
                ubicacion,
              };
            } else {
              console.log(
                "No se encontraron coordenadas para la dirección proporcionada."
              );
              return null;
            }
          })
        );

        setPositions(positionsArray.filter((pos) => pos !== null));
      } catch (error) {
        console.error("Error al obtener las coordenadas:", error);
      }
    };

    if (ubicaciones.length > 0) {
      fetchCoordinates();
    }
  }, [ubicaciones]);

  useEffect(() => {
    if (positions.length > 0 && mapRef.current) {
      const bounds = L.latLngBounds(positions.map((pos) => pos.position));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      // mapRef.current.flyTo(bounds, 8);
    }
  }, [positions]);

  return (
    <MapContainer
      center={[positions[0]?.position[0] || 0, positions[0]?.position[1] || 0]}
      zoom={13}
      className={`h-[200px] md:h-[450px] w-full`}
      ref={mapRef}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {positions.length > 0 &&
        positions.map(({ position, ubicacion }, index) => (
          <Marker key={index} position={position}>
            <Popup>Propiedades: {ubicacion.cant_propiedades}</Popup>
          </Marker>
        ))}
    </MapContainer>
  );
};

export default MapFilter;
