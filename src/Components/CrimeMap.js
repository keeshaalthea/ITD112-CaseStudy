import React, { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { Doughnut, Pie, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import "../CrimeMap.css";

const CrimeMap = () => {
  const [crimeData, setCrimeData] = useState({});
  const [totalCrimes, setTotalCrimes] = useState(0);
  const [mostCommonCrime, setMostCommonCrime] = useState("");
  const [mostCommonPremise, setMostCommonPremise] = useState("");
  const [yearWithHighestCrime, setYearWithHighestCrime] = useState("");
  const [crimeTypeCounts, setCrimeTypeCounts] = useState({});
  const [premiseCounts, setPremiseCounts] = useState({});
  const [yearCounts, setYearCounts] = useState({});
  const [barGraphFilter, setBarGraphFilter] = useState("All Crimes");


  useEffect(() => {
    const fetchCrimeData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "crimeData"));
        const data = {};
        let totalCrimesCount = 0;
        const crimeTypeCounts = {};
        const premiseCounts = {};
        const yearCounts = {};

        querySnapshot.forEach((doc) => {
          const record = doc.data();
          const region = record.region || "Unknown Region";
          const crime = record.crime || "Unknown Crime";
          const premise = record.premise || "Unknown Premise";
          const date = record.date;

          if (!data[region]) {
            data[region] = [];
          }
          data[region].push(record);

          totalCrimesCount++;
          crimeTypeCounts[crime] = (crimeTypeCounts[crime] || 0) + 1;
          premiseCounts[premise] = (premiseCounts[premise] || 0) + 1;

          const year = date ? new Date(date).getFullYear() : "Unknown Year";
          if (year !== "Unknown Year") {
            yearCounts[year] = (yearCounts[year] || 0) + 1;
          }
        });

        setCrimeData(data);
        setTotalCrimes(totalCrimesCount);
        setMostCommonCrime(
          Object.keys(crimeTypeCounts).length
            ? Object.keys(crimeTypeCounts).reduce((a, b) =>
                crimeTypeCounts[a] > crimeTypeCounts[b] ? a : b
              )
            : "No Data"
        );
        setMostCommonPremise(
          Object.keys(premiseCounts).length
            ? Object.keys(premiseCounts).reduce((a, b) =>
                premiseCounts[a] > premiseCounts[b] ? a : b
              )
            : "No Data"
        );
        setYearWithHighestCrime(
          Object.keys(yearCounts).length
            ? Object.keys(yearCounts).reduce((a, b) =>
                yearCounts[a] > yearCounts[b] ? a : b
              )
            : "No Data"
        );
        setCrimeTypeCounts(crimeTypeCounts);
        setPremiseCounts(premiseCounts);
        setYearCounts(yearCounts);
      } catch (error) {
        console.error("Error fetching crime data:", error);
      }
    };

    fetchCrimeData();
  }, []);

  const renderDataCards = () => (
    <div className="data-cards" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
      <div className="data-card">
        <h3>Total Crimes Recorded</h3>
        <p>{totalCrimes}</p>
      </div>
      <div className="data-card">
        <h3>Most Common Crime Type</h3>
        <p>{mostCommonCrime}</p>
      </div>
      <div className="data-card">
        <h3>Most Common Premise</h3>
        <p>{mostCommonPremise}</p>
      </div>
      <div className="data-card">
        <h3>Year with Highest Crime Rate</h3>
        <p>{yearWithHighestCrime}</p>
      </div>
    </div>
  );

  const renderDonutChartSection = () => {
    const labels = Object.keys(crimeTypeCounts);
    const data = Object.values(crimeTypeCounts);
    const colors = [
      '#4ACFD9', '#5271FF', '#F9C8F0', '#FFCE56', '#9966FF', '#FF6384', '#fe66c3',
      '#b3c1fe', '#004aad', '#16afb4', '#c4a6ff', '#073064', '#b3ffb3', '#3149b6', '#81f4e1'
    ];

    const chartData = {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
        },
      ],
    };

    const chartOptions = {
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            boxWidth: 10,
            padding: 10,
          },
          align: 'center',
        },
      },
      layout: {
        padding: {
          top: -5,
        },
      },
      maintainAspectRatio: false,
    };

    return (
      <div className="chart-container">
        <div className="donut-chart">
          <Doughnut data={chartData} options={chartOptions} />
        </div>
        <div className="chart-explanation">
          <h3>Crime Types Overview</h3>
          <p>The donut chart illustrates the distribution of crime types recorded in the database.</p>
        </div>
      </div>
    );
  };

  const renderPieChartSection = () => {
    const labels = Object.keys(premiseCounts);
    const data = Object.values(premiseCounts);
    const colors = [
      '#4ACFD9', '#5271FF', '#F9C8F0', '#FFCE56', '#9966FF', '#FF6384', '#fe66c3',
      '#b3c1fe', '#004aad', '#16afb4', '#c4a6ff', '#073064', '#b3ffb3', '#3149b6', '#81f4e1'
    ];

    const chartData = {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
        },
      ],
    };

    const chartOptions = {
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            boxWidth: 10,
            padding: 10,
          },
          align: 'center',
        },
      },
      layout: {
        padding: {
          top: -5,
        },
      },
      maintainAspectRatio: false,
    };

    return (
      <div className="chart-container">
        <div className="pie-chart">
          <Pie data={chartData} options={chartOptions} />
        </div>
        <div className="chart-explanation">
          <h3>Premises Overview</h3>
          <p>This pie chart illustrates the distribution of crime premises recorded in the database.</p>
        </div>
      </div>
    );
  };


  const renderBarGraphSection = () => {
    let labels = [];
    let data = [];
  
    if (barGraphFilter === "All Crimes") {
      // If the filter is "All Crimes", show data for each year
      labels = Object.keys(yearCounts);
      data = Object.values(yearCounts);
    } else {
      // If the filter is a specific crime, show data for that crime
      const filteredYearCounts = {};
      for (const region in crimeData) {  // Loop over regions in crimeData
        const records = crimeData[region];  // Get the array of records for each region
        for (const record of records) {  // Loop over each crime record
          const crime = record.crime;
          const date = record.date;
          const year = date ? new Date(date).getFullYear() : "Unknown Year";
          if (crime === barGraphFilter && year !== "Unknown Year") {
            filteredYearCounts[year] = (filteredYearCounts[year] || 0) + 1;
          }
        }
      }
      labels = Object.keys(filteredYearCounts);
      data = Object.values(filteredYearCounts);
    }
  
    const chartData = {
      labels,
      datasets: [
        {
          label: 'Number of Crimes',
          data,
          backgroundColor: '#5271FF', // Change this to the color you prefer
          borderColor: '#3149b6', // Border color for bars
          borderWidth: 1,
        },
      ],
    };
  
    const chartOptions = {
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Year',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Crimes Recorded',
          },
          beginAtZero: true,
        },
      },
      maintainAspectRatio: false,
    };
  
    return (
      <div className="chart-container">
        <div className="filter-container" style={{ marginBottom: '20px' }}>
          <label htmlFor="barGraphFilter">Filter by Crime Type: </label>
          <select
            id="barGraphFilter"
            value={barGraphFilter}
            onChange={(e) => setBarGraphFilter(e.target.value)}
          >
            <option value="All Crimes">All Crimes</option>
            {Object.keys(crimeTypeCounts).map((crime) => (
              <option key={crime} value={crime}>
                {crime}
              </option>
            ))}
          </select>
        </div>
        <div className="bar-chart">
          <Bar data={chartData} options={chartOptions} />
        </div>
        <div className="chart-explanation">
          <h3>Crimes Recorded by Year</h3>
          <p>This bar graph illustrates the number of crimes recorded per year based on the date information from the dataset.</p>
        </div>
      </div>
    );
  };
  
  
  return (
    <div className="crime-map-container">
      {renderDataCards()}
      {renderDonutChartSection()}
      {/* Add space between donut and pie chart */}
      <div style={{ marginBottom: '40px' }}></div>
      {renderPieChartSection()}
      <div style={{ marginBottom: '40px' }}></div> {/* Space between pie chart and bar chart */}

      {renderBarGraphSection()}
    </div>
  );
};

export default CrimeMap;
