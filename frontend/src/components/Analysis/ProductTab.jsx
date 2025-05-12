import React, { useMemo, useRef } from "react";
import { Bar, Pie } from "react-chartjs-2";
import ChartCard from "./ChartCard";
import DataTable from "./DataTable";

const cardVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

function ProductTab({
  topProducts,
  inventoryTurnover,
  sentimentSummary,
  affinityRules,
  searchQuery,
  setSearchQuery,
  sortConfig,
  setSortConfig,
  page,
  setPage,
  rowsPerPage,
}) {
  const chartRefs = {
    topProducts: useRef(null),
    inventoryTurnover: useRef(null),
    sentiment: useRef(null),
  };

  const topProductsBar = useMemo(
    () =>
      topProducts
        ? {
            labels: topProducts.map((item) => item.Description),
            datasets: [
              {
                label: "Revenue ($)",
                data: topProducts.map((item) => item.TotalPrice),
                backgroundColor: "#ff6f61",
                borderRadius: 4,
              },
            ],
            options: {
              scales: { y: { beginAtZero: true } },
              plugins: { datalabels: { display: false } },
            },
          }
        : null,
    [topProducts]
  );

  const inventoryTurnoverBar = useMemo(
    () =>
      inventoryTurnover
        ? {
            labels: inventoryTurnover.slice(0, 10).map((item) => item.Description),
            datasets: [
              {
                label: "Turnover Rate",
                data: inventoryTurnover.slice(0, 10).map((item) => item.Turnover_Rate),
                backgroundColor: "#ff6f61",
                borderRadius: 4,
              },
            ],
            options: {
              scales: { y: { beginAtZero: true } },
              plugins: { datalabels: { display: false } },
            },
          }
        : null,
    [inventoryTurnover]
  );

  const sentimentDonutChart = useMemo(
    () =>
      sentimentSummary
        ? {
            labels: ["Positive", "Neutral", "Negative"],
            datasets: [
              {
                data: [
                  sentimentSummary.filter((s) => s.Sentiment > 0).length,
                  sentimentSummary.filter((s) => s.Sentiment === 0).length,
                  sentimentSummary.filter((s) => s.Sentiment < 0).length,
                ],
                backgroundColor: ["#4e79a7", "#ff6f61", "#2c3e50"],
                borderWidth: 0,
              },
            ],
            options: {
              cutout: "50%",
              plugins: { datalabels: { color: "#fff", font: { weight: "bold" } } },
            },
          }
        : null,
    [sentimentSummary]
  );

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handlePageChange = (tableKey, newPage) => {
    setPage((prev) => ({ ...prev, [tableKey]: newPage }));
  };

  return (
    <div className="charts-container">
      {topProductsBar && (
        <ChartCard
          title="Top Products by Revenue"
          description="Highlights top-performing products for inventory optimization."
          chartData={topProductsBar}
          chartRef={chartRefs.topProducts}
          ChartComponent={Bar}
          exportFilename="top_products"
          fullWidth
        />
      )}
      {inventoryTurnoverBar && (
        <ChartCard
          title="Inventory Turnover"
          description="Identifies high-turnover products for stock management."
          chartData={inventoryTurnoverBar}
          chartRef={chartRefs.inventoryTurnover}
          ChartComponent={Bar}
          exportFilename="inventory_turnover"
          fullWidth
        />
      )}
      {sentimentDonutChart && (
        <ChartCard
          title="Product Sentiment"
          description="Summarizes product sentiment to guide marketing efforts."
          chartData={sentimentDonutChart}
          chartRef={chartRefs.sentiment}
          ChartComponent={Pie}
          exportFilename="product_sentiment"
        />
      )}
     
    </div>
  );
}

export default ProductTab;