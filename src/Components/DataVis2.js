import React, { useState, useEffect } from "react";
import "../DataVis2.css"; // CSS file for custom styling
import Logo from "./img/crimeLogo.svg";
import addIcon from "./img/add.svg";
import tableIcon from "./img/table.svg";
import graphIcon from "./img/graph.svg";
import { useNavigate } from "react-router-dom";
import 'leaflet/dist/leaflet.css';
import TimeGraph from "./TimeGraph";
//import { collection, getDocs, doc, deleteDoc, updateDoc, query, orderBy } from "firebase/firestore";
//import { db } from "./firebase";

const DataVis2 = () => {
  const navigate = useNavigate(); 
 

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <img
          src={Logo}
          alt="Logo"
          className="navbar-logo"
          onClick={() => navigate("/")} // Navigate to home on logo click
          style={{ cursor: "pointer" }} // Indicate clickable logo
        />
        <div className="navbar-icons">
          <span className="icon" onClick={() => navigate("/add")} style={{ cursor: "pointer" }}>
            <img src={addIcon} alt="Add" className="icon-image" />
          </span>
          <span className="icon" onClick={() => navigate("/list")} style={{ cursor: "pointer" }}>
            <img src={tableIcon} alt="Table" className="icon-image" />
          </span>
          <span className="icon" onClick={() => navigate("/DataVis")} style={{ cursor: "pointer"}}>
            <img src={graphIcon} alt="Graph" className="icon-image" />
          </span>
        </div>
      </nav>

      {/* Sidebar and Main Content */}
      <div className="content">
        <aside className="sidebar">
          <h3><b>Philippine Crime Data Visualization ────────────</b></h3>
          <p>This page features a collection of data visualizations designed to provide valuable insights into crime data.</p>
          <div className="sidebar-buttons">
            <button className= "sidebutton1" onClick={() => navigate("/DataVis")}><b>Crime Overview  🡢</b></button>
            <button onClick={() => navigate("/DataVis2")} ><b>Time-Based Patterns  🡢</b></button>
            <button onClick={() => navigate("/DataVis3")}><b>Victim/Suspect Demographics  🡢</b></button>
            <button onClick={() => navigate("/DataVis4")}><b>Crime Locations  🡢</b></button>
            <button onClick={() => navigate("/DataVis5")}><b>Weapons and Crime Types  🡢</b></button>
          </div>
        </aside>
        <main className="main-content">
        <TimeGraph/>
        </main>
      </div>
    </div>
  );
};

export default DataVis2;