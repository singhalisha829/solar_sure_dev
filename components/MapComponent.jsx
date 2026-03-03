import React, { useState } from "react";
import { MapContainer, Marker, TileLayer, Popup, useMapEvents, useMap } from "react-leaflet";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

const MapComponent = ({ projects = [] }) => {
  // Latitude and Longitude of India
  const [position] = useState([24.01892945694433, 77.73512526712899]);
  const [zoom] = useState(5); // Initial zoom level to show India in a good size


  // MapMyIndia tile layer configuration
  const mapMyIndiaTileLayer = {
    url: "https://apis.mapmyindia.com/advancedmaps/v1/019b6fc769c9fb1c56e8a912358b39bb/still_map/{z}/{x}/{y}.png",
    attribution: '© <a href="https://www.mapmyindia.com/">MapmyIndia</a>',
  };

  return (
    <MapContainer center={position} zoom={zoom} style={{ height: "100%", width: "100%" }}>
      <TileLayer url={mapMyIndiaTileLayer.url} attribution={mapMyIndiaTileLayer.attribution} />

      {/* Render markers for projects if they have coordinates */}
      {projects.map((project) => {
        if (project?.latitude && project.longitude) {
          return (
            <Marker position={[project.latitude, project.longitude]} key={project.id}>
              <Popup>{project.name}</Popup>
            </Marker>
          );
        }
        return null;
      })}
    </MapContainer>
  );
};

export default MapComponent;
