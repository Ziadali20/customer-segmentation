import React from "react";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

function InsightsCards({ insights, activeTab }) {
  const cards =
    activeTab === "customer"
      ? [
          { title: "Total Customers", value: insights.totalCustomers, color: "bg-blue-600" },
          { title: "Top Segment", value: insights.topSegment, color: "bg-red-500" },
          { title: "High CLV Customers", value: insights.highCLVCount, color: "bg-gray-800" },
        ]
      : [
          { title: "High Churn", value: insights.highChurnRisk, color: "bg-red-600" },
          { title: "Total Revenue", value: `$${insights.totalRevenue.toFixed(2)}`, color: "bg-blue-600" },
        ];

  return (
    <motion.div className="insights-container" variants={cardVariants}>
      {cards.map(({ title, value, color }) => (
        <motion.div
          key={title}
          className={`insight-card ${color}`}
          variants={cardVariants}
        >
          <h3 className="insight-title">{title}</h3>
          <p className="insight-value">{value}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default InsightsCards;