// MapComponent.js
import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
const MapEvents = ({ setPosition }) => {
  useMapEvents({
    async click(e) {
      console.log(e);
      const { lat, lng } = e.latlng;

      setPosition([lat, lng]);
    },
  });
  return null;
};
const MapComponent = ({ position, address, mapRef, setPosition }) => {
  console.log(position);
  return (
    <MapContainer
      center={position}
      zoom={17}
      style={{ height: "400px", width: "100%" }}
      ref={mapRef}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        // url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        // url="https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png"
        // attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under ODbL.'

        // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapEvents setPosition={setPosition} />
      <Marker position={position}>
        <Popup>
          Dirección: {address.exactAddress}, {address.zone}, {address.locality},{" "}
          {address.province}, {address.postalCode}, {address.country}
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapComponent;
