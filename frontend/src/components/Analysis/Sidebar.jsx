import React from "react";
import { motion } from "framer-motion";
import { FaUsers, FaChartLine, FaProductHunt, FaGlobe } from "react-icons/fa";

function Sidebar({ activeTab, setActiveTab }) {
  const tabs = [
    { tab: "customer", icon: <FaUsers />, label: "Customer" },
    { tab: "revenue", icon: <FaChartLine />, label: "Revenue" },
    { tab: "product", icon: <FaProductHunt />, label: "Product" },
    { tab: "predictive", icon: <FaGlobe />, label: "Predictive" },
  ];

  return (
    <div className="sidebar">
      <ul className="sidebar-list">
        {tabs.map(({ tab, icon, label }) => (
          <motion.li
            key={tab}
            className={`sidebar-item ${activeTab === tab ? "sidebar-item-active" : ""}`}
            whileHover={{ x: 5 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="sidebar-link"
              onClick={() => setActiveTab(tab)}
            >
              <span className="sidebar-icon">{icon}</span>
              <span>{label}</span>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;