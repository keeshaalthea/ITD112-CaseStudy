import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "../Weapon.css";

const Weapon = () => {
  const [mostUsedWeapon, setMostUsedWeapon] = useState("");
  const [secondMostUsedWeapon, setSecondMostUsedWeapon] = useState("");
  const [thirdMostUsedWeapon, setThirdMostUsedWeapon] = useState("");
  const [weaponByCrimeData, setWeaponByCrimeData] = useState({});
  const [crimeTypes, setCrimeTypes] = useState([]);
  const [barGraphFilter, setBarGraphFilter] = useState("All Crimes");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "crimeData"));
        const weaponsCount = {};
        const crimeTypeWeaponMap = {};
        const uniqueCrimeTypes = new Set();

        querySnapshot.forEach((doc) => {
          const record = doc.data();
          const weapon = record.weaponsUsed || "Unknown Weapon";
          const crimeType = record.crime || "Unknown Crime";

          // Count occurrences of each weapon
          weaponsCount[weapon] = (weaponsCount[weapon] || 0) + 1;

          // Map weapons by crime type
          if (!crimeTypeWeaponMap[crimeType]) {
            crimeTypeWeaponMap[crimeType] = {};
          }
          crimeTypeWeaponMap[crimeType][weapon] =
            (crimeTypeWeaponMap[crimeType][weapon] || 0) + 1;

          uniqueCrimeTypes.add(crimeType);
        });

        // Sort weapons by count to find the top three most used weapons
        const sortedWeapons = Object.entries(weaponsCount).sort(
          (a, b) => b[1] - a[1]
        );
        setMostUsedWeapon(sortedWeapons[0]?.[0] || "N/A");
        setSecondMostUsedWeapon(sortedWeapons[1]?.[0] || "N/A");
        setThirdMostUsedWeapon(sortedWeapons[2]?.[0] || "N/A");

        setWeaponByCrimeData(crimeTypeWeaponMap);
        setCrimeTypes(["All Crimes", ...Array.from(uniqueCrimeTypes)]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const renderDataCards = () => (
    <div className="data-cards" style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
      <div className="data-card">
        <h3>Most Used Weapon</h3>
        <p>{mostUsedWeapon}</p>
      </div>
      <div className="data-card">
        <h3>2nd Most Used Weapon</h3>
        <p>{secondMostUsedWeapon}</p>
      </div>
      <div className="data-card">
        <h3>3rd Most Used Weapon</h3>
        <p>{thirdMostUsedWeapon}</p>
      </div>
    </div>
  );

  const renderBarGraphSection = () => {
    const labels = [];
    const data = [];

    if (barGraphFilter === "All Crimes") {
      // Aggregate data for all crimes
      const allWeaponsCount = {};
      Object.values(weaponByCrimeData).forEach((weapons) => {
        for (const [weapon, count] of Object.entries(weapons)) {
          allWeaponsCount[weapon] = (allWeaponsCount[weapon] || 0) + count;
        }
      });
      for (const [weapon, count] of Object.entries(allWeaponsCount)) {
        labels.push(weapon);
        data.push(count);
      }
    } else {
      // Show data for the selected crime type
      const selectedWeapons = weaponByCrimeData[barGraphFilter] || {};
      for (const [weapon, count] of Object.entries(selectedWeapons)) {
        labels.push(weapon);
        data.push(count);
      }
    }

    const chartData = {
      labels,
      datasets: [
        {
          label: "Number of Times Used",
          data,
          backgroundColor: "#5271FF",
          borderColor: "#3149b6",
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
            text: "Weapons",
          },
        },
        y: {
          title: {
            display: true,
            text: "Count",
          },
          beginAtZero: true,
        },
      },
      maintainAspectRatio: false,
    };

    return (
      <div className="chart-container">
        <div className="filter-container" style={{ marginBottom: "20px" }}>
          <label htmlFor="barGraphFilter">Filter by Crime Type: </label>
          <select
            id="barGraphFilter"
            value={barGraphFilter}
            onChange={(e) => setBarGraphFilter(e.target.value)}
          >
            {crimeTypes.map((crime) => (
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
          <h3>Weapons Used by Crime Type</h3>
          <p>
            This bar graph illustrates the distribution of weapons used,
            filtered by crime type.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="crime-map-container">
      {renderDataCards()}
      {renderBarGraphSection()}
    </div>
  );
};

export default Weapon;
