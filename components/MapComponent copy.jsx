import React, { useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
const MapComponent = ({ projects }) => {
  const [position, setPosition] = useState([24.01892945694433, 77.73512526712899]); // Latitude and Longitude of India
  const [zoom, setZoom] = useState(5); // Initial zoom level to show India in a good size
  // Latitude and Longitude of the map center
  const markers = [
    {
      name: "project1",
      location: [28.67076531162695, 77.20330849726302],
    },
    {
      name: "project2",
      location: [26.315058369774867, 73.01105946792359],
    },
  ];
  return (
    <MapContainer center={position} zoom={5} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {projects?.map((project, idx) => {
        if (project?.latitude && project.longitude) {
          return (
            <Marker position={[project.latitude, project.longitude]} key={project.id}>
              <Popup>{project.name}</Popup>
            </Marker>
          );
        }
      })}
    </MapContainer>
  );
};

export default MapComponent;
