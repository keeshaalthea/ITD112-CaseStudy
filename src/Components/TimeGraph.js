import React, { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { Line } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import "../TimeGraph.css";

const TimeGraph = () => {
  const [peakTime, setPeakTime] = useState("");
  const [mostCrimeIntensiveMonth, setMostCrimeIntensiveMonth] = useState("");
  const [crimeByHour, setCrimeByHour] = useState(Array(24).fill(0));
  const [crimeTypes, setCrimeTypes] = useState([]);
  const [selectedCrimeTypeLine, setSelectedCrimeTypeLine] = useState("All Crimes");
  const [filteredCrimeByHour, setFilteredCrimeByHour] = useState(Array(24).fill(0));
  const [timeOfDayCounts, setTimeOfDayCounts] = useState({ Morning: 0, Afternoon: 0, Night: 0 });
  const [selectedCrimeTypePie, setSelectedCrimeTypePie] = useState("All Crimes");
  const [filteredTimeOfDayCounts, setFilteredTimeOfDayCounts] = useState({ Morning: 0, Afternoon: 0, Night: 0 });

  useEffect(() => {
    const fetchCrimeData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "crimeData"));
        const hourCounts = Array(24).fill(0);
        const crimeTypesSet = new Set();
        const timeOfDay = { Morning: 0, Afternoon: 0, Night: 0 };
        const crimeData = [];

        querySnapshot.forEach((doc) => {
          const record = doc.data();
          const timeOccurred = record.timeOccurred;
          const hour = parseInt(timeOccurred.split(':')[0], 10);

          hourCounts[hour]++;
          crimeData.push(record);
          if (record.crime) {
            crimeTypesSet.add(record.crime);
          }

          // Categorize crime occurrences by time of day
          const timeOfDayCategory = getTimeOfDay(hour);
          timeOfDay[timeOfDayCategory]++;
        });

        setCrimeByHour(hourCounts);
        setFilteredCrimeByHour(hourCounts);
        setCrimeTypes(["All Crimes", ...Array.from(crimeTypesSet)]);
        setTimeOfDayCounts(timeOfDay);

        // Calculate the peak time
        const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
        setPeakTime(`${getTimeOfDay(peakHour)} ${convertTo12Hour(peakHour)}`);

        // Calculate the most crime-intensive month
        const monthCounts = {};
        crimeData.forEach((record) => {
          const monthYear = new Date(record.date).toLocaleString('default', { month: 'long', year: 'numeric' });
          monthCounts[monthYear] = (monthCounts[monthYear] || 0) + 1;
        });
        const mostIntensiveMonth = Object.keys(monthCounts).reduce((a, b) =>
          monthCounts[a] > monthCounts[b] ? a : b
        );
        setMostCrimeIntensiveMonth(mostIntensiveMonth);
      } catch (error) {
        console.error("Error fetching crime data:", error);
      }
    };

    fetchCrimeData();
  }, []);

  useEffect(() => {
    // Filter the line graph data by selected crime type
    if (selectedCrimeTypeLine === "All Crimes") {
      setFilteredCrimeByHour(crimeByHour);
    } else {
      const filteredCounts = Array(24).fill(0);
      const fetchFilteredData = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "crimeData"));
          querySnapshot.forEach((doc) => {
            const record = doc.data();
            if (record.crime === selectedCrimeTypeLine) {
              const hour = parseInt(record.timeOccurred.split(':')[0], 10);
              filteredCounts[hour]++;
            }
          });
          setFilteredCrimeByHour(filteredCounts);
        } catch (error) {
          console.error("Error filtering crime data:", error);
        }
      };
      fetchFilteredData();
    }
  }, [selectedCrimeTypeLine, crimeByHour]);

  useEffect(() => {
    // Filter the pie chart data by selected crime type
    if (selectedCrimeTypePie === "All Crimes") {
      setFilteredTimeOfDayCounts(timeOfDayCounts);
    } else {
      const filteredTimeOfDay = { Morning: 0, Afternoon: 0, Night: 0 };
      const fetchFilteredPieData = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "crimeData"));
          querySnapshot.forEach((doc) => {
            const record = doc.data();
            if (record.crime === selectedCrimeTypePie) {
              const hour = parseInt(record.timeOccurred.split(':')[0], 10);
              const timeOfDayCategory = getTimeOfDay(hour);
              filteredTimeOfDay[timeOfDayCategory]++;
            }
          });
          setFilteredTimeOfDayCounts(filteredTimeOfDay);
        } catch (error) {
          console.error("Error filtering pie chart data:", error);
        }
      };
      fetchFilteredPieData();
    }
  }, [selectedCrimeTypePie, timeOfDayCounts]);

  const getTimeOfDay = (hour) => {
    if (hour >= 6 && hour < 12) return "Morning";
    if (hour >= 12 && hour < 18) return "Afternoon";
    return "Night";
  };

  const convertTo12Hour = (hour) => {
    const isPM = hour >= 12;
    const hour12 = hour % 12 || 12;
    const suffix = isPM ? "PM" : "AM";
    return `${hour12} ${suffix}`;
  };

  const handleFilterChangeLine = (event) => {
    setSelectedCrimeTypeLine(event.target.value);
  };

  const handleFilterChangePie = (event) => {
    setSelectedCrimeTypePie(event.target.value);
  };

  const renderDataCards = () => (
    <div className="data-cards" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
      <div className="data-card">
        <h3>Peak Time of Crime Occurrence:</h3>
        <p>{peakTime}</p>
      </div>
      <div className="data-card">
        <h3>Highest Crime Month:</h3>
        <p>{mostCrimeIntensiveMonth}</p>
      </div>
    </div>
  );

  const renderLineChartSection = () => {
    const chartData = {
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      datasets: [
        {
          label: `Crime Occurrence by Hour (${selectedCrimeTypeLine})`,
          data: filteredCrimeByHour,
          borderColor: '#5271FF',
          backgroundColor: 'rgba(82, 113, 255, 0.2)',
          fill: true,
          tension: 0.4,
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
            text: 'Hour of the Day (0–23)',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Number of Crimes',
          },
          beginAtZero: true,
        },
      },
      maintainAspectRatio: false,
    };

    return (
      <div className="chart-container">
        <div className="filter-container" style={{ marginBottom: '20px' }}>
          <label htmlFor="crimeFilterLine">Filter by Crime Type:</label>
          <select id="crimeFilterLine" value={selectedCrimeTypeLine} onChange={handleFilterChangeLine}>
            {crimeTypes.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="line-chart">
          <Line data={chartData} options={chartOptions} />
        </div>
        <div className="chart-explanation">
          <h3>Crime Occurrence by Time of Day</h3>
          <p>This line chart highlights the peak crime hours of the day, indicating which hours are riskiest for crime occurrences.</p>
        </div>
      </div>
    );
  };

  const renderPieChartSection = () => {
    const pieData = {
      labels: ['Morning (6:00–11:59)', 'Afternoon (12:00–17:59)', 'Night (18:00–05:59)'],
      datasets: [
        {
          data: [filteredTimeOfDayCounts.Morning, filteredTimeOfDayCounts.Afternoon, filteredTimeOfDayCounts.Night],
          backgroundColor: ['#4ACFD9', '#5271FF', '#004AAD'],
          hoverOffset: 4,
        },
      ],
    };

    const pieOptions = {
      plugins: {
        legend: {
          position: 'top',
        },
      },
    };

    return (
      <div className="chart-container">
        <div className="filter-container" style={{ marginBottom: '20px' }}>
          <label htmlFor="crimeFilterPie">Filter by Crime Type:</label>
          <select id="crimeFilterPie" value={selectedCrimeTypePie} onChange={handleFilterChangePie}>
            {crimeTypes.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="pie-chart">
          <Pie data={pieData} options={pieOptions} />
        </div>
        <div className="chart-explanation">
          <h3>Distribution of Crimes by Time of Day</h3>
          <p>This pie chart breaks down crime occurrences by time of day: morning, afternoon, and night.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="crime-time-graph">
      {renderDataCards()}
      {renderLineChartSection()}
      {renderPieChartSection()}
    </div>
  );
};

export default TimeGraph;
