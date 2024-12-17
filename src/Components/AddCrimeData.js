import React, { useState } from "react";
import Papa from "papaparse";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import "../AddCrime.css"; // CSS file for custom styling
import Logo from "./img/crimeLogo.svg";
import addIcon from "./img/add.svg";
import tableIcon from "./img/table.svg";
import graphIcon from "./img/graph.svg";
import { useNavigate } from "react-router-dom";

const AddCrimeData = () => {
  const navigate = useNavigate();

  const [date, setDate] = useState("");
  const [timeOccurred, setTimeOccurred] = useState("");
  const [region, setRegion] = useState("");
  const [crime, setCrime] = useState("");
  const [victimAge, setVictimAge] = useState("");
  const [victimSex, setVictimSex] = useState("");
  const [victimDescent, setVictimDescent] = useState("");
  const [suspectAge, setSuspectAge] = useState("");
  const [suspectSex, setSuspectSex] = useState("");
  const [premise, setPremise] = useState("");
  const [weaponsUsed, setWeaponsUsed] = useState("");
  const [csvFile, setCsvFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "crimeData"), {
        date,
        timeOccurred,
        region,
        crime,
        victimAge,
        victimSex,
        victimDescent,
        suspectAge,
        suspectSex,
        premise,
        weaponsUsed,
      });
      setDate("");
      setTimeOccurred("");
      setRegion("");
      setCrime("");
      setVictimAge("");
      setVictimSex("");
      setVictimDescent("");
      setSuspectAge("");
      setSuspectSex("");
      setPremise("");
      setWeaponsUsed("");
      alert("Data added successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type !== "text/csv") {
      alert("Please upload a valid CSV file.");
      return;
    }
    setCsvFile(file);
  };

  const handleFileUpload = async () => {
    if (!csvFile) {
      alert("Please select a CSV file to upload.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      const rows = parsed.data;

      const data = rows.map((row) => ({
        date: row["Date"]?.trim() || "",
        timeOccurred: row["Time Occurred"]?.trim() || "",
        region: row["Region"]?.trim() || "",
        crime: row["Crime"]?.trim() || "",
        victimAge: row["Victim Age"]?.trim() || "",
        victimSex: row["Victim Sex"]?.trim() || "",
        victimDescent: row["Victim Descent"]?.trim() || "",
        suspectAge: row["Suspect Age"]?.trim() || "",
        suspectSex: row["Suspect Sex"]?.trim() || "",
        premise: row["Premise"]?.trim() || "",
        weaponsUsed: row["Weapons Used"]?.trim() || "",
      }));

      try {
        const batch = data.map(async (item) => {
          await addDoc(collection(db, "crimeData"), item);
        });

        await Promise.all(batch);
        alert("CSV data uploaded successfully!");
        window.location.reload();
      } catch (error) {
        console.error("Error uploading CSV data:", error);
        alert("Failed to upload CSV data. Please try again.");
      }
    };

    reader.readAsText(csvFile);
  };

  return (
    <div className="app">
      <nav className="navbar">
        <img
          src={Logo}
          alt="Logo"
          className="navbar-logo"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        />
        <div className="navbar-icons">
          <span className="icon" onClick={() => navigate("/add")} style={{ cursor: "pointer" }}>
            <img src={addIcon} alt="Add" className="icon-image" />
          </span>
          <span className="icon" onClick={() => navigate("/list")} style={{ cursor: "pointer" }}>
            <img src={tableIcon} alt="Table" className="icon-image" />
          </span>
          <span className="icon" onClick={() => navigate("/DataVis")} style={{ cursor: "pointer" }}>
            <img src={graphIcon} alt="Graph" className="icon-image" />
          </span>
        </div>
      </nav>

      <div className="content">
        <aside className="sidebar">
          <h3><b>Add Crime Data ────────────</b></h3>
          <p>Add new crime data entries or upload a CSV file.</p>
          <button className="data-buttonA" onClick={() => navigate("/list")}>
            View Crime Data 🡢
          </button>
        </aside>
        <main className="main-content">
          <div className="form-section">
            <form onSubmit={handleSubmit} className="form-container">
              <div className="form-group">
              <label htmlFor="date" className="form-label">Date</label>
                <input
                  type="date"
                  placeholder="Date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
              <label htmlFor="timeOccurred" className="form-label">Time Occurred</label>
                <input
                  type="time"
                  placeholder="Time Occurred"
                  value={timeOccurred}
                  onChange={(e) => setTimeOccurred(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  required
                  className="form-input"
                >
                  <option value="" disabled>Select Region</option>
                  <option value="National Capital Region">National Capital Region</option>
                  <option value="Ilocos">Ilocos</option>
                  <option value="Cagayan Valley">Cagayan Valley</option>
                  <option value="Central Luzon">Central Luzon</option>
                  <option value="Calabarzon">Calabarzon</option>
                  <option value="Mimaropa">Mimaropa</option>
                  <option value="Bicol">Bicol</option>
                  <option value="Western Visayas">Western Visayas</option>
                  <option value="Central Visayas">Central Visayas</option>
                  <option value="Eastern Visayas">Eastern Visayas</option>
                  <option value="Zamboanga Peninsula">Zamboanga Peninsula</option>
                  <option value="Northern Mindanao">Northern Mindanao</option>
                  <option value="Davao">Davao</option>
                  <option value="Soccsksargen">Soccsksargen</option>
                  <option value="Caraga">Caraga</option>
                  <option value="Autonomous Region in Muslim Mindanao">Autonomous Region in Muslim Mindanao</option>
                  <option value="Cordillera Administrative Region">Cordillera Administrative Region</option>
                </select>
              </div>

              <div className="form-group">
                <select
                  value={crime}
                  onChange={(e) => setCrime(e.target.value)}
                  required
                  className="form-input"
                >
                  <option value="" disabled>Select Crime</option>
                  <option value="Cybercrime">Cybercrime</option>
                  <option value="Vehicular Crime">Vehicular Crime</option>
                  <option value="Kidnapping">Kidnapping</option>
                  <option value="Hit and Run">Hit and Run</option>
                  <option value="Physical Injury">Physical Injury</option>
                  <option value="Arson">Arson</option>
                  <option value="Fraud">Fraud</option>
                  <option value="Human Trafficking">Human Trafficking</option>
                  <option value="Assault">Assault</option>
                  <option value="Rape">Rape</option>
                  <option value="Illegal Drugs">Illegal Drugs</option>
                  <option value="Murder">Murder</option>
                  <option value="Theft">Theft</option>
                  <option value="Homicide">Homicide</option>
                  <option value="Robbery">Robbery</option>
                </select>
              </div>

              <div className="form-group">
                <input
                  type="number"
                  placeholder="Victim Age"
                  value={victimAge}
                  onChange={(e) => setVictimAge(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <select
                  value={victimSex}
                  onChange={(e) => setVictimSex(e.target.value)}
                  required
                  className="form-input"
                >
                  <option value="" disabled>Select Victim Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="form-group">
                <select
                  value={victimDescent}
                  onChange={(e) => setVictimDescent(e.target.value)}
                  required
                  className="form-input"
                >
                  <option value="" disabled>Select Victim Descent</option>
                  <option value="Filipino">Filipino</option>
                  <option value="Foreigner">Foreigner</option>
                </select>
              </div>

              <div className="form-group">
                <input
                  type="number"
                  placeholder="Suspect Age"
                  value={suspectAge}
                  onChange={(e) => setSuspectAge(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <select
                  value={suspectSex}
                  onChange={(e) => setSuspectSex(e.target.value)}
                  required
                  className="form-input"
                >
                  <option value="" disabled>Select Suspect Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="form-group">
                <select
                  value={premise}
                  onChange={(e) => setPremise(e.target.value)}
                  required
                  className="form-input"
                >
                  <option value="" disabled>Select Premise</option>
                  <option value="Bar">Bar</option>
                  <option value="Market">Market</option>
                  <option value="Home">Home</option>
                  <option value="Mall">Mall</option>
                  <option value="Street">Street</option>
                  <option value="Hospital">Hospital</option>
                  <option value="School">School</option>
                  <option value="Highway">Highway</option>
                  <option value="Office">Office</option>
                  <option value="Park">Park</option>
                </select>
              </div>

              <div className="form-group">
              <select
                  value={weaponsUsed}
                  onChange={(e) => setWeaponsUsed(e.target.value)}
                  required
                  className="form-input"
                >
                  <option value="" disabled>Select Weapons Used</option>
                  <option value="No Weapon">No Weapon</option>
                  <option value="Computer">Computer</option>
                  <option value="Personal Weapon">Personal Weapon</option>
                  <option value="Firearm">Firearm</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Blunt Instrument">Blunt Instruments</option>
                  <option value="Bodily Force">Bodily Force</option>
                  <option value="Knife">Knife</option>
                  <option value="Drugs">Drugs</option>
                </select>
              </div>

              <button type="submit" className="submit-button">
                Add Data
              </button>
            </form>
          </div>

                        {/* CSV Uploader */}
          <div className="csv-uploader-section">
            <h2>Upload File Directly</h2>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="csv-input"
            />
            <button onClick={handleFileUpload} className="csv-upload-button">
              Upload
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddCrimeData;