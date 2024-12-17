import React, { useState, useEffect } from "react";
import "../Home.css"; // CSS file for custom styling
import Logo from "./img/crimeLogo.svg"; // The logo image for the navbar
import Image1 from "./img/1.png"; // Image 1
import Image2 from "./img/2.png"; // Image 2
import addIcon from "./img/add.svg";
import tableIcon from "./img/table.svg";
import graphIcon from "./img/graph.svg";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate(); 

  // State to track the visible image
  const [currentImage, setCurrentImage] = useState(0);

  // List of images
  const images = [Image1, Image2];

  // Switch between images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevIndex) => (prevIndex + 1) % images.length);
    }, 3500); // Change image every 3 seconds

    return () => clearInterval(interval); // Clean up the interval when component unmounts
  }, []);

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar" style={{zIndex: "10",  boxShadow: "0 4px 8px rgba(41, 41, 41, 0.1)"}}>
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
          <span className="icon" onClick={() => navigate("/DataVis")} style={{ cursor: "pointer" }}>
            <img src={graphIcon} alt="Graph" className="icon-image" />
          </span>
        </div>
      </nav>

      {/* Main Content with Image Switcher */}
      <div className="main-content" style={{ padding: "0", marginTop: "0", height: "calc(100vh - 90px)", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden", position: "relative" }}>
        {/* Image 1 */}
        <img 
          src={images[0]} 
          alt="Image 1" 
          className={`fade-image ${currentImage === 0 ? "visible" : ""}`} 
          style={{
            position: "absolute",
            width: "100%", 
            height: "100%", 
            objectFit: "cover",
            transition: "opacity 1s ease-in-out",
            opacity: currentImage === 0 ? 1 : 0
          }} 
        />
        {/* Image 2 */}
        <img 
          src={images[1]} 
          alt="Image 2" 
          className={`fade-image ${currentImage === 1 ? "visible" : ""}`} 
          style={{
            position: "absolute",
            width: "100%", 
            height: "100%", 
            objectFit: "cover",
            transition: "opacity 1s ease-in-out",
            opacity: currentImage === 1 ? 1 : 0
          }} 
        />
        <button
          className="manage-data-button"
          onClick={() => navigate("/add")}
        >
          Manage Philippine Crime Data
        </button>
      </div>

      {/* Description of Agila 365 */}
      <div className="agila-description">
        <h2>What is Agila 365?</h2>
        <p>
          Agila 365 is a web application designed to help manage Philippine crime data and visualize it to gain valuable insights. 
          It allows users to add new crime data, view it in a table format, and explore visualizations made from the data. 
          By utilizing this tool, users can better understand crime trends and patterns, helping to improve safety and security in the community.
        </p>
        <p>
          This application aligns with the United Nations Sustainable Development Goal (SDG) 16, which promotes peace, justice, and strong institutions. 
          Agila 365 aims to contribute towards creating safer communities through data-driven decisions and transparent reporting.
        </p>
      </div>
    </div>
  );
};

export default Home;
