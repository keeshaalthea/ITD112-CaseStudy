import React, { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { Scatter } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import "../Demographic.css";

const Demographic = () => {
  const [averageVictimAge, setAverageVictimAge] = useState("N/A");
  const [averageSuspectAge, setAverageSuspectAge] = useState("N/A");
  const [crimeTypes, setCrimeTypes] = useState([]);
  const [selectedCrimeTypeScatter, setSelectedCrimeTypeScatter] = useState("All Crimes");
  const [selectedGenderFilter, setSelectedGenderFilter] = useState("victim");
  const [selectedCrimeTypePie, setSelectedCrimeTypePie] = useState("All Crimes");
  const [selectedCrimeTypeBar, setSelectedCrimeTypeBar] = useState("All Crimes");  // Added filter for bar chart
  const [scatterData, setScatterData] = useState([]);
  const [genderData, setGenderData] = useState({ male: 0, female: 0 });
  const [victimDescentData, setVictimDescentData] = useState({ filipino: 0, foreigner: 0 });

  useEffect(() => {
    const fetchCrimeData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "crimeData"));
        let totalVictimAge = 0;
        let totalSuspectAge = 0;
        let victimCount = 0;
        let suspectCount = 0;
        const crimeData = [];
        const crimeTypesSet = new Set();
        const scatterPoints = [];
        const genderCounts = { male: 0, female: 0 };
        const descentCounts = { filipino: 0, foreigner: 0 };

        querySnapshot.forEach((doc) => {
          const record = doc.data();

          // Summing victim ages
          if (record.victimAge) {
            totalVictimAge += Number(record.victimAge);
            victimCount++;
          }

          // Summing suspect ages
          if (record.suspectAge) {
            totalSuspectAge += Number(record.suspectAge);
            suspectCount++;
          }

          // Collecting crime types for the filter
          if (record.crime) {
            crimeTypesSet.add(record.crime);
          }

          // Prepare scatter plot data (Victim Age vs Suspect Age)
          if (record.victimAge && record.suspectAge) {
            scatterPoints.push({
              x: Number(record.victimAge),
              y: Number(record.suspectAge),
              crime: record.crime
            });
          }

          // Count victim descent
          if (record.victimDescent) {
            if (record.victimDescent === "Filipino") {
              descentCounts.filipino++;
            } else if (record.victimDescent === "Foreigner") {
              descentCounts.foreigner++;
            }
          }

          crimeData.push(record);
        });

        // Setting crime types for filter
        setCrimeTypes(["All Crimes", ...Array.from(crimeTypesSet)]);

        // Calculating averages
        const avgVictimAge = victimCount > 0 ? (totalVictimAge / victimCount).toFixed(1) : "N/A";
        const avgSuspectAge = suspectCount > 0 ? (totalSuspectAge / suspectCount).toFixed(1) : "N/A";

        setAverageVictimAge(avgVictimAge);
        setAverageSuspectAge(avgSuspectAge);
        setScatterData(scatterPoints);

        // Initialize gender counts
        const initialGenderCounts = { male: 0, female: 0 };
        
        // Count gender based on the selected filters
        crimeData.forEach((record) => {
          if (selectedGenderFilter === "victim" && record.victimSex) {
            if (record.victimSex === "Male") {
              initialGenderCounts.male++;
            } else if (record.victimSex === "Female") {
              initialGenderCounts.female++;
            }
          } else if (selectedGenderFilter === "suspect" && record.suspectSex) {
            if (record.suspectSex === "Male") {
              initialGenderCounts.male++;
            } else if (record.suspectSex === "Female") {
              initialGenderCounts.female++;
            }
          }
        });

        // Filter by crime type
        if (selectedCrimeTypePie !== "All Crimes") {
          initialGenderCounts.male = 0;
          initialGenderCounts.female = 0;

          crimeData.forEach((record) => {
            if (selectedGenderFilter === "victim" && record.victimSex && record.crime === selectedCrimeTypePie) {
              if (record.victimSex === "Male") {
                initialGenderCounts.male++;
              } else if (record.victimSex === "Female") {
                initialGenderCounts.female++;
              }
            } else if (selectedGenderFilter === "suspect" && record.suspectSex && record.crime === selectedCrimeTypePie) {
              if (record.suspectSex === "Male") {
                initialGenderCounts.male++;
              } else if (record.suspectSex === "Female") {
                initialGenderCounts.female++;
              }
            }
          });
        }

        // Set gender data for pie chart
        setGenderData(initialGenderCounts);

        // Set victim descent data for bar chart, filtering by selected crime type
        const filteredDescentCounts = { filipino: 0, foreigner: 0 };
        crimeData.forEach((record) => {
          if (selectedCrimeTypeBar === "All Crimes" || record.crime === selectedCrimeTypeBar) {
            if (record.victimDescent === "Filipino") {
              filteredDescentCounts.filipino++;
            } else if (record.victimDescent === "Foreigner") {
              filteredDescentCounts.foreigner++;
            }
          }
        });
        setVictimDescentData(filteredDescentCounts);

      } catch (error) {
        console.error("Error fetching crime data:", error);
      }
    };

    fetchCrimeData();
  }, [selectedGenderFilter, selectedCrimeTypePie, selectedCrimeTypeBar]);  // Added selectedCrimeTypeBar to the dependency array

  const handleScatterFilterChange = (event) => {
    setSelectedCrimeTypeScatter(event.target.value);
  };

  const handleGenderFilterChange = (event) => {
    setSelectedGenderFilter(event.target.value);
  };

  const handlePieCrimeFilterChange = (event) => {
    setSelectedCrimeTypePie(event.target.value);
  };

  const handleBarCrimeFilterChange = (event) => {
    setSelectedCrimeTypeBar(event.target.value);  // Added handler for bar chart filter
  };

  const filterScatterData = () => {
    if (selectedCrimeTypeScatter === "All Crimes") {
      return scatterData;
    }
    return scatterData.filter((dataPoint) => dataPoint.crime === selectedCrimeTypeScatter);
  };

  const renderDataCards = () => (
    <div className="data-cards" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
      <div className="data-card">
        <h3>Average Victim Age:</h3>
        <p>{averageVictimAge} years</p>
      </div>
      <div className="data-card">
        <h3>Average Suspect Age:</h3>
        <p>{averageSuspectAge} years</p>
      </div>
    </div>
  );

  const renderScatterPlotSection = () => {
    const scatterPlotData = {
      datasets: [
        {
          label: 'Victim Age vs Suspect Age',
          data: filterScatterData(),
          backgroundColor: 'rgba(82, 113, 255, 0.6)',
          borderColor: 'rgba(82, 113, 255, 1)',
          borderWidth: 1,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#5271FF',
        }
      ]
    };

    const scatterPlotOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
            position: 'nearest',
          callbacks: {
            label: (context) => {
              const crime = context.raw.crime ? context.raw.crime : "No Crime Data";
              return `Victim Age: ${context.raw.x} | Suspect Age: ${context.raw.y} | Crime: ${crime}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Victim Age'
          },
          ticks: {
            stepSize: 5,
            beginAtZero: true
          },
          min: 0,
          max: 90
        },
        y: {
          title: {
            display: true,
            text: 'Suspect Age'
          },
          ticks: {
            stepSize: 5,
            beginAtZero: true
          },
          min: 0,
          max: 90
        }
      }      
    };

    return (
      <div className="chart-container" style={{ backgroundColor: 'white', padding: '20px', marginTop: '20px' }}>
        <div className="filter-container" style={{ marginBottom: '20px' }}>
          <label htmlFor="crimeFilterScatter">Filter by Crime Type:</label>
          <select id="crimeFilterScatter" value={selectedCrimeTypeScatter} onChange={handleScatterFilterChange}>
            {crimeTypes.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div style={{ width: '100%', height: '650px' }}>
          <Scatter data={scatterPlotData} options={scatterPlotOptions} />
        </div>
        <div className="chart-explanation">
          <h3>Victim Age vs Suspect Age</h3>
          <p>This scatter plot shows the relationship between victim age and suspect age across various crime types. Hover over the points to see detailed age information and the associated crime.</p>
        </div>
      </div>
    );
  };

  const renderPieChart = () => {
    const pieChartData = {
      labels: ['Male', 'Female'],
      datasets: [{
        data: [genderData.male, genderData.female],
        backgroundColor: ['#5271FF', '#FF6384'],
        hoverBackgroundColor: ['#5271FF', '#FF6384'],
      }]
    };

    return (
      <div className="chart-container" style={{ backgroundColor: 'white', padding: '20px', marginTop: '20px' }}>
        <div className="filter-container" style={{ marginBottom: '20px' }}>
          <label htmlFor="genderFilter">Filter by:</label>
          <select id="genderFilter" value={selectedGenderFilter} onChange={handleGenderFilterChange}>
            <option value="victim">Victim</option>
            <option value="suspect">Suspect</option>
          </select>
          <label htmlFor="crimeFilterPie">Filter by Crime Type:</label>
          <select id="crimeFilterPie" value={selectedCrimeTypePie} onChange={handlePieCrimeFilterChange}>
            {crimeTypes.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div style={{ width: '100%', height: '300px' }}>
          <Pie data={pieChartData} />
        </div>
        <div className="chart-explanation">
          <h3>Gender Distribution by {selectedGenderFilter === 'victim' ? 'Victim' : 'Suspect'} and Crime</h3>
          <p>This pie chart shows the gender distribution for the selected filter (victim or suspect) and crime type.</p>
        </div>
      </div>
    );
  };

  const renderBarChart = () => {
    const barChartData = {
      labels: ['Filipino', 'Foreigner'],
      datasets: [{
        label: '', // Removing the label from the chart legend
        data: [victimDescentData.filipino, victimDescentData.foreigner],
        backgroundColor: ['#5271FF', '#4ACFD9'],
        hoverBackgroundColor: ['#5271FF', '#4ACFD9'],
      }]
    };
  
    const barChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: false, // This removes the legend
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Victim Descent', // X-axis label
          },
        },
        y: {
          title: {
            display: true,
            text: 'Number Recorded', // Y-axis label
          },
          beginAtZero: true,
          ticks: {
            stepSize: 5,
          },
          min: 0,
        },
      },
    };
  
    return (
      <div className="chart-container" style={{ backgroundColor: 'white', padding: '20px', marginTop: '20px' }}>
        <div className="filter-container" style={{ marginBottom: '20px' }}>
          <label htmlFor="crimeFilterBar">Filter by Crime Type:</label>
          <select id="crimeFilterBar" value={selectedCrimeTypeBar} onChange={handleBarCrimeFilterChange}>
            {crimeTypes.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="bar-chart1">
          <Bar data={barChartData} options={barChartOptions} />
        </div>
        <div className="chart-explanation">
          <h3>Victim Descent by Crime Type</h3>
          <p>This bar chart shows the distribution of Filipino vs. Foreigner victims based on the selected crime type.</p>
        </div>
      </div>
    );
  };
  
  return (
    <div className="crime-time-graph">
      {renderDataCards()}
      {renderScatterPlotSection()}
      {renderPieChart()}
      {renderBarChart()}
    </div>
  );
};

export default Demographic;
