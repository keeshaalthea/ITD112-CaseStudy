import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, deleteDoc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import { useNavigate } from "react-router-dom";
import "../CrimeDataList.css";
import Logo from "./img/crimeLogo.svg";
import addIcon from "./img/add.svg";
import tableIcon from "./img/table.svg";
import graphIcon from "./img/graph.svg";

const CrimeDataList = () => {
  const navigate = useNavigate();

  // State Variables
  const [rawData, setRawData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    date: "",
    timeOccurred: "",
    region: "",
    crime: "",
    victimAge: "",
    victimSex: "",
    victimDescent: "",
    suspectAge: "",
    suspectSex: "",
    premise: "",
    weaponsUsed: ""
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const crimeCollection = collection(db, "crimeData"); // Updated collection name
        const q = query(crimeCollection, orderBy("date"));
        const crimeSnapshot = await getDocs(q);
        const dataList = crimeSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRawData(dataList);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${month}/${day}/${year}`;
  };


  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "crimeData", id)); // Updated collection name
      setRawData(rawData.filter((data) => data.id !== id));
      alert("Data deleted successfully!");
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const formatDateForInput = (dateString) => {
    const dateObj = new Date(dateString);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`; // Format required for input type="date"
  };


  const handleEdit = (data) => {
    setEditingId(data.id);
    setEditForm({
      date: formatDateForInput(data.date),
      timeOccurred: data.timeOccurred,
      region: data.region,
      crime: data.crime,
      victimAge: data.victimAge,
      victimSex: data.victimSex,
      victimDescent: data.victimDescent,
      suspectAge: data.suspectAge,
      suspectSex: data.suspectSex,
      premise: data.premise,
      weaponsUsed: data.weaponsUsed
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "crimeData", editingId), { ...editForm }); // Updated collection name
      const updatedData = rawData.map((data) =>
        data.id === editingId ? { ...data, ...editForm } : data
      );
      setRawData(updatedData);
      setEditingId(null);
      setIsModalOpen(false);
      alert("Data updated successfully!");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSort = (field) => {
    const newSortOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newSortOrder);
  };

  // Filter, Sort, and Paginate Data
  const filteredData = rawData
  .filter((data) => {
    // Filter by crime, region, or year from the search query
    const searchValue = searchQuery.toLowerCase();
    const matchesSearchQuery =
      data.crime.toLowerCase().includes(searchValue) ||
      data.region.toLowerCase().includes(searchValue) ||
      new Date(data.date).getFullYear().toString().includes(searchValue);

    return matchesSearchQuery;
  })
  .sort((a, b) => {
    if (sortField === "victimAge" || sortField === "suspectAge") {
      return sortOrder === "asc" ? a[sortField] - b[sortField] : b[sortField] - a[sortField];
    }
    return sortOrder === "asc"
      ? a[sortField].localeCompare(b[sortField])
      : b[sortField].localeCompare(a[sortField]);
  });

  const currentPageData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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
          <h3>
            <b>Crime Data List ────────────</b>
          </h3>
          <p>This page shows the list of all crime data recorded.</p>
          <button className="data-button" onClick={() => navigate("/DataVis")}>
          Crime Data Visualization 🡢
          </button>
        </aside>

        <main className="main-content">
          <div className="filters-row">
            <input
              type="text"
              placeholder="Search by Crime, Region, or Year"
              value={searchQuery}
              onChange={handleSearch}
              className="search-input"
            />
            
            <button className="sort-button" onClick={() => handleSort("victimAge")}>
              Sort by Victim Age {sortField === "victimAge" && (sortOrder === "asc" ? "▲" : "▼")}
            </button>
            <button className="sort-button" onClick={() => handleSort("date")}>
              Sort by Date {sortField === "date" && (sortOrder === "asc" ? "▲" : "▼")}
            </button>
          </div>

          <div className="data-summary">
            Total Data Entries: {filteredData.length}
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ textAlign: "center" }}>Date</th>
                  <th style={{ textAlign: "center" }}>Time Occurred</th>
                  <th style={{ textAlign: "center" }}>Region</th>
                  <th style={{ textAlign: "center" }}>Crime</th>
                  <th style={{ textAlign: "center" }}>Victim Age</th>
                  <th style={{ textAlign: "center" }}>Victim Sex</th>
                  <th style={{ textAlign: "center" }}>Victim Descent</th>
                  <th style={{ textAlign: "center" }}>Suspect Age</th>
                  <th style={{ textAlign: "center" }}>Suspect Sex</th>
                  <th style={{ textAlign: "center" }}>Premise</th>
                  <th style={{ textAlign: "center" }}>Weapons Used</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPageData.map((data) => (
                  <tr key={data.id}>
                    <td>{formatDate(data.date)}</td>
                    <td>{data.timeOccurred}</td>
                    <td>{data.region}</td>
                    <td>{data.crime}</td>
                    <td>{data.victimAge}</td>
                    <td>{data.victimSex}</td>
                    <td>{data.victimDescent}</td>
                    <td>{data.suspectAge}</td>
                    <td>{data.suspectSex}</td>
                    <td>{data.premise}</td>
                    <td>{data.weaponsUsed}</td>
                    <td>
                      <button onClick={() => handleEdit(data)} className="edit-button">Edit</button>
                      <button onClick={() => handleDelete(data.id)} className="delete-button">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>Previous</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}>Next</button>
          </div>

          {/* Edit Modal */}
          {isModalOpen && (
            <div className="modal">
              <div className="modal-content">
                <h3 style={{ textAlign: "center", marginBottom: "5px" }}>Edit Data</h3>
                <form onSubmit={handleUpdate}>
                  <input
                    type="date"
                    name="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    required
                    className="form-input"
                  />
                  <input
                    type="time"
                    name="timeOccurred"
                    value={editForm.timeOccurred}
                    onChange={(e) => setEditForm({ ...editForm, timeOccurred: e.target.value })}
                    required
                    className="form-input"
                 />
                  <select
                    name="region"
                    value={editForm.region}
                    onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
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
                  <select
                    name="crime"
                    value={editForm.crime}
                    onChange={(e) => setEditForm({ ...editForm, crime: e.target.value })}
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
                  <input
                    type="number"
                    name="victimAge"
                    value={editForm.victimAge}
                    onChange={(e) => setEditForm({ ...editForm, victimAge: e.target.value })}
                    placeholder="Victim Age"
                    className="form-input"
                  />
                  <select
                    name="victimSex"
                    value={editForm.victimSex}
                    onChange={(e) => setEditForm({ ...editForm, victimSex: e.target.value })}
                    required
                    className="form-input"
                  >
                    <option value="" disabled>Select Victim Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <select
                  name="victimDescent"
                  value={editForm.victimDescent}
                  onChange={(e) => setEditForm({ ...editForm, victimDescent: e.target.value })}
                  required
                  className="form-input"
                >
                  <option value="" disabled>Select Victim Descent</option>
                  <option value="Filipino">Filipino</option>
                  <option value="Foreigner">Foreigner</option>
                </select>
                  <input
                    type="number"
                    name="suspectAge"
                    value={editForm.suspectAge}
                    onChange={(e) => setEditForm({ ...editForm, suspectAge: e.target.value })}
                    placeholder="Suspect Age"
                    className="form-input"
                  />
                  <select
                    name="suspectSex"
                    value={editForm.suspectSex}
                    onChange={(e) => setEditForm({ ...editForm, suspectSex: e.target.value })}
                    required
                    className="form-input"
                  >
                    <option value="" disabled>Select Suspect Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <select
                    name="premise"
                    value={editForm.premise}
                    onChange={(e) => setEditForm({ ...editForm, premise: e.target.value })}
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
                  </select>
                  <select
                    name="weaponsUsed"
                    value={editForm.weaponsUsed}
                    onChange={(e) => setEditForm({ ...editForm, weaponsUsed: e.target.value })}
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
                  <button type="submit" className="edit-button2">Update</button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="delete-button2"
                  >
                    Close
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CrimeDataList;
