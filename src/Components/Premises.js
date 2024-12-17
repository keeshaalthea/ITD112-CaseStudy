import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import phData from '../ph.json'; // Philippine region data (GeoJSON)
import "../Premises.css"; // Adjust for your styles

import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const ChoroplethMap = ({ year }) => {
  const [crimeTypeFilter, setCrimeTypeFilter] = useState("All");
  const [selectedYear, setSelectedYear] = useState(year || "All");
  const [crimeData, setCrimeData] = useState([]);
  const [filteredCrimeData, setFilteredCrimeData] = useState({});
  const [crimeTypes, setCrimeTypes] = useState([]); // Holds unique crime types
  const [years, setYears] = useState([]); // Holds unique years

  // State for data cards
  const [mostCommonPremise, setMostCommonPremise] = useState("N/A");
  const [regionWithHighestCrime, setRegionWithHighestCrime] = useState("N/A");

  // Fetch crime data from Firebase
  useEffect(() => {
    const fetchCrimeData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "crimeData"));
        const crimes = querySnapshot.docs.map(doc => doc.data());
        setCrimeData(crimes);

        // Extract unique crime types from the 'crime' column
        const types = Array.from(new Set(crimes.map(crime => crime.crime))).sort();
        setCrimeTypes(types);

        // Extract unique years from the 'date' column
        const uniqueYears = Array.from(new Set(crimes.map(crime => crime.date.split("-")[0]))).sort();
        setYears(uniqueYears);

        // Compute data for data cards
        const premiseCounts = {};
        const regionCounts = {};
        crimes.forEach(crime => {
          if (crime.premise) premiseCounts[crime.premise] = (premiseCounts[crime.premise] || 0) + 1;
          if (crime.region) regionCounts[crime.region] = (regionCounts[crime.region] || 0) + 1;
        });

        const mostCommonPremise = Object.keys(premiseCounts).reduce((a, b) =>
          premiseCounts[a] > premiseCounts[b] ? a : b, "N/A");
        setMostCommonPremise(mostCommonPremise);

        const regionWithHighestCrime = Object.keys(regionCounts).reduce((a, b) =>
          regionCounts[a] > regionCounts[b] ? a : b, "N/A");
        setRegionWithHighestCrime(regionWithHighestCrime);
      } catch (error) {
        console.error("Error fetching crime data:", error);
      }
    };

    fetchCrimeData();
  }, []);

  // Filter crime data by year and crime type
  const filteredCrimes = useMemo(() => {
    return crimeData.filter(crime => {
      const crimeYear = crime.date.split("-")[0]; // Extract year from date
      const matchesYear = selectedYear === "All" || crimeYear === selectedYear;
      const matchesCrimeType = crimeTypeFilter === "All" || crime.crime === crimeTypeFilter;
      return matchesYear && matchesCrimeType;
    });
  }, [crimeData, selectedYear, crimeTypeFilter]);

  // Count crimes by region
  const countCrimesByRegion = (filteredCrimeList) => {
    return filteredCrimeList.reduce((acc, crime) => {
      const region = crime.region; // Assuming `crime.region` is the region name
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {});
  };

  useEffect(() => {
    const crimeCounts = countCrimesByRegion(filteredCrimes);
    setFilteredCrimeData(crimeCounts); // Update state with crime counts
  }, [filteredCrimes]);

  // Style function for GeoJSON regions based on crime count
  const styleFeature = (feature) => {
    const region = feature.properties.name; // Assuming GeoJSON has "name" as the region name
    const crimeCount = filteredCrimeData[region] || 0;
    return {
      fillColor: getColor(crimeCount),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7,
    };
  };

  const getColor = (crimeCount) => {
    return crimeCount > 100
      ? '#800026'
      : crimeCount > 50
      ? '#BD0026'
      : crimeCount > 20
      ? '#E31A1C'
      : crimeCount > 10
      ? '#FC4E2A'
      : '#FD8D3C';
  };

  const onEachFeature = (feature, layer) => {
    const region = feature.properties.name;
    layer.bindPopup(`<strong>${region}</strong><br/>Crimes: ${filteredCrimeData[region] || 0}`);
    layer.on('mouseover', () => {
      layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7,
      });
    });
    layer.on('mouseout', () => {
      layer.setStyle(styleFeature(feature));
    });
  };

  return (
    <>
      {/* Render Data Cards Before the Map */}
      <div className="data-cards" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div className="data-card">
          <h3>Region with Highest Crime Count:</h3>
          <p>{regionWithHighestCrime}</p>
        </div>
      </div>
  
      {/* Choropleth Map Container */}
      <div className="choropleth-map-container">
        {/* Filter Dropdowns */}
        <label htmlFor="crimeType">Select Crime Type: </label>
        <select
          id="crimeType"
          name="crimeType"
          onChange={(e) => setCrimeTypeFilter(e.target.value)}
          value={crimeTypeFilter}
        >
          <option value="All">All</option>
          {crimeTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
  
        <label htmlFor="year">Select Year: </label>
        <select
          id="year"
          name="year"
          onChange={(e) => setSelectedYear(e.target.value)}
          value={selectedYear}
        >
          <option value="All">All</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
  
        {/* Map Container */}
        <MapContainer
          style={{ height: '600px', width: '100%' }}
          center={[13.41, 122.56]} // Rough center of the Philippines
          zoom={6}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <GeoJSON
            data={phData}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
  
          {/* Bubble Markers */}
          {Object.entries(filteredCrimeData).map(([region, count]) => {
            const regionData = phData.features.find(
              (feature) => feature.properties.name === region
            );
            if (regionData) {
              let coordinates;
              if (regionData.geometry.type === "Polygon") {
                coordinates = regionData.geometry.coordinates[0][0];
              } else if (regionData.geometry.type === "MultiPolygon") {
                coordinates = regionData.geometry.coordinates[0][0][0];
              }
  
              if (coordinates) {
                return (
                  <CircleMarker
                    key={region}
                    center={[coordinates[1], coordinates[0]]}
                    radius={Math.sqrt(count) * 5} // Scale marker size by crime count
                    color="#007BFF"
                    fillColor="#007BFF"
                    fillOpacity={0.6}
                  >
                    <Popup>
                      <strong>{region}</strong><br />
                      Crimes: {count}
                    </Popup>
                  </CircleMarker>
                );
              }
            }
            return null;
          })}
        </MapContainer>
      </div>
    </>
  );
};

export default ChoroplethMap;
