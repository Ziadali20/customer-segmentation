import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import Analysis from "./components/Analysis/Analysis.jsx";
import UserContextProvider from "./Context/data-context";
import Navbar from "./components/navbar/navbar.jsx";
import Home from "./components/home/home.jsx";

ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
);

function App() {
  const [activeTab, setActiveTab] = useState("customer");

  return (
    <UserContextProvider>
      <Router>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <Routes>
          <Route element={<Home />} path="/" />
          <Route element={<Analysis activeTab={activeTab} setActiveTab={setActiveTab} />} path="/analysis" />
          {/* <Route element={<UserData />} path="/user-data" /> */}
          {/* <Route element={<SendEmails />} path="/send-emails" /> */}
          {/* <Route element={<Dashboard />} path="/dashboard" /> */}
        </Routes>
      </Router>
    </UserContextProvider>
  );
}

export default App;