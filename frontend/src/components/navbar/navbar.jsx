import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaHome, FaChartLine, FaDatabase, FaEnvelope, FaBars, FaTimes, FaTachometerAlt, FaUsers, FaProductHunt, FaGlobe } from "react-icons/fa";
import "./navbar.css";

export default function Navbar({ activeTab, setActiveTab }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const analysisTabs = [
    { tab: "customer", icon: <FaUsers />, label: "Customer" },
    { tab: "revenue", icon: <FaChartLine />, label: "Revenue" },
    { tab: "product", icon: <FaProductHunt />, label: "Product" },
    { tab: "predictive", icon: <FaGlobe />, label: "Predictive" },
  ];

  return (
    <>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      <nav className={`custom-navbar ${isSidebarOpen ? "open" : ""}`}>
        <ul className="navbar-list">
          <li className="navbar-item">
            <Link to="/" className="navbar-link" onClick={toggleSidebar}>
              <FaHome className="navbar-icon" />
              <span>Home</span>
            </Link>
          </li>
          <li className="navbar-item">
            <div className={`navbar-link ${location.pathname === "/analysis" ? "navbar-link-active" : ""}`}>
              <FaChartLine className="navbar-icon" />
              <span>Analysis</span>
            </div>
            <ul className="submenu-list">
              {analysisTabs.map(({ tab, icon, label }) => (
                <motion.li
                  key={tab}
                  className={`submenu-item ${activeTab === tab && location.pathname === "/analysis" ? "submenu-item-active" : ""}`}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link
                    to="/analysis"
                    className="submenu-link"
                    onClick={() => {
                      setActiveTab(tab);
                      toggleSidebar();
                    }}
                  >
                    <span className="submenu-icon">{icon}</span>
                    <span>{label}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </li>
      
        </ul>
      </nav>

      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  );
}