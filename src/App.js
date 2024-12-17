// App.js
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CrimeDataList from "./Components/CrimeDataList"; // Adjust the path if needed
import Home from "./Components/Home";
import AddCrimeData from "./Components/AddCrimeData";
import DataVis from "./Components/DataVis"
import DataVis2 from "./Components/DataVis2";
import DataVis3 from "./Components/DataVis3"
import DataVis4 from "./Components/DataVis4"
import DataVis5 from "./Components/DataVis5"

// Define routes for the app
const routes = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/List",
    element: <CrimeDataList />,
  },
  {
    path: "/Add",
    element: <AddCrimeData />,
  },
  {
    path: "/DataVis",
    element: <DataVis />,
  },
  {
    path: "/DataVis2",
    element: <DataVis2 />,
  },
  {
    path: "/DataVis3",
    element: <DataVis3 />,
  },
  {
    path: "/DataVis4",
    element: <DataVis4 />,
  },
  {
  path: "/DataVis5",
  element: <DataVis5 />,
}
];

// Create the router with future flags
const router = createBrowserRouter(routes, {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
});

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
