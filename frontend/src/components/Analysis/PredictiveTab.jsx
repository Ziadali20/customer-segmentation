import React, { useMemo, useRef } from "react";
import { Bar, Line } from "react-chartjs-2";
import ChartCard from "./ChartCard";
import DataTable from "./DataTable";

const cardVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

function PredictiveTab({
  churnPrediction,
  repurchasePredictions,
  salesDropFactors,
  retentionRate,
  discountImpact,
  heatmapData,
  marketingRecommendations,
  searchQuery,
  setSearchQuery,
  sortConfig,
  setSortConfig,
  page,
  setPage,
  rowsPerPage,
}) {
  const chartRefs = {
    repurchase: useRef(null),
    salesDropFactors: useRef(null),
    retentionRate: useRef(null),
    discountImpact: useRef(null),
    heatmap: useRef(null),
    marketingSegments: useRef(null),
  };

  const repurchaseHistogram = useMemo(() => {
    if (!repurchasePredictions) return null;
    const bins = Array(10).fill(0);
    repurchasePredictions.forEach((p) => {
      const bin = Math.min(Math.floor(p.Repurchase_Probability * 10), 9);
      bins[bin]++;
    });
    return {
      labels: bins.map((_, i) => `${i / 10}-${(i + 1) / 10}`),
      datasets: [
        {
          label: "Customers",
          data: bins,
          backgroundColor: "#4e79a7",
          borderRadius: 4,
        },
      ],
      options: {
        scales: { y: { beginAtZero: true } },
        plugins: { datalabels: { display: false } },
      },
    };
  }, [repurchasePredictions]);

  const salesDropFactorsBar = useMemo(
    () =>
      salesDropFactors
        ? {
            labels: ["Avg Order Value", "Return Rate"],
            datasets: [
              {
                label: "Values",
                data: [
                  salesDropFactors[0]?.AvgOrderValue || 0,
                  (salesDropFactors[0]?.ReturnRate || 0) * 100,
                ],
                backgroundColor: ["#ff6f61", "#4e79a7"],
                borderRadius: 4,
              },
            ],
            options: {
              scales: { y: { beginAtZero: true } },
              plugins: { datalabels: { display: false } },
            },
          }
        : null,
    [salesDropFactors]
  );

  const retentionRateLine = useMemo(
    () =>
      retentionRate
        ? {
            labels: retentionRate.map((item) => item.cohort),
            datasets: [
              {
                label: "Retention Rate (%)",
                data: retentionRate.map((item) => (item.month_1 || 0) * 100),
                borderColor: "#4e79a7",
                backgroundColor: "rgba(78, 121, 167, 0.3)",
                fill: true,
                tension: 0.4,
              },
            ],
            options: {
              scales: { y: { beginAtZero: true } },
              plugins: { datalabels: { display: false } },
            },
          }
        : null,
    [retentionRate]
  );

  const discountImpactLine = useMemo(
    () =>
      discountImpact
        ? {
            labels: discountImpact.map((item) => `${item.Simulated_Discount}%`),
            datasets: [
              {
                label: "Revenue ($)",
                data: discountImpact.map((item) => item.Discounted_TotalPrice),
                borderColor: "#4e79a7",
                backgroundColor: "rgba(78, 121, 167, 0.3)",
                fill: true,
                tension: 0.4,
              },
            ],
            options: {
              scales: { y: { beginAtZero: true } },
              plugins: { datalabels: { display: false } },
            },
          }
        : null,
    [discountImpact]
  );

  const heatmapStackedBar = useMemo(() => {
    if (!heatmapData) return null;
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const hours = Array.from({ length: 24 }, (_, i) => `Hour_${i}`);
    return {
      labels: hours.map((h) => h.replace("Hour_", "")),
      datasets: heatmapData.map((day, index) => ({
        label: days[index],
        data: hours.map((hour) => day[hour] || 0),
        backgroundColor: `rgba(78, 121, 167, ${0.3 + index * 0.1})`,
      })),
      options: {
        scales: {
          y: { stacked: true, beginAtZero: true },
          x: { stacked: true, title: { display: true, text: "Hour of Day" } },
        },
        plugins: { datalabels: { display: false } },
      },
    };
  }, [heatmapData]);

  const marketingSegmentsBar = useMemo(
    () =>
      marketingRecommendations
        ? {
            labels: marketingRecommendations.map((item) => item.Segment),
            datasets: [
              {
                label: "Customer Count",
                data: marketingRecommendations.map((item) => item.CustomerCount),
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
    [marketingRecommendations]
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
      {churnPrediction?.churn_predictions && (
        <DataTable
          title="Churn Predictions"
          data={churnPrediction.churn_predictions}
          columns={[
            { key: "CustomerID", label: "CustomerID", sortable: true },
            {
              key: "Churn_Probability",
              label: "Churn Probability",
              sortable: true,
              render: (item) => item.Churn_Probability.toFixed(2),
            },
            { key: "recommendation", label: "Recommendation" },
          ]}
          searchKeys={["CustomerID"]}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortConfig={sortConfig}
          handleSort={handleSort}
          page={page}
          handlePageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          tableKey="churn_predictions"
          csvFilename="churn_predictions.csv"
        />
      )}
      {repurchaseHistogram && (
        <ChartCard
          title="Repurchase Probability Distribution"
          description="Shows repurchase probability distribution for targeted campaigns."
          chartData={repurchaseHistogram}
          chartRef={chartRefs.repurchase}
          ChartComponent={Bar}
          exportFilename="repurchase_distribution"
          fullWidth
        />
      )}
      {/* {salesDropFactorsBar && (
        <ChartCard
          title="Sales Drop Factors"
          description="Analyzes factors contributing to sales drops for mitigation strategies."
          chartData={salesDropFactorsBar}
          chartRef={chartRefs.salesDropFactors}
          ChartComponent={Bar}
          exportFilename="sales_drop_factors"
          fullWidth
        />
      )} */}
      {retentionRateLine && (
        <ChartCard
          title="Retention Rate"
          description="Tracks customer retention over time to assess loyalty."
          chartData={retentionRateLine}
          chartRef={chartRefs.retentionRate}
          ChartComponent={Line}
          exportFilename="retention_rate"
          fullWidth
        />
      )}
      {/* {discountImpactLine && (
        <ChartCard
          title="Discount Impact"
          description="Evaluates the impact of discounts on revenue to optimize pricing strategies."
          chartData={discountImpactLine}
          chartRef={chartRefs.discountImpact}
          ChartComponent={Line}
          exportFilename="discount_impact"
          fullWidth
        />
      )} */}
      {heatmapStackedBar && (
        <ChartCard
          title="Customer Activity Heatmap"
          description="Visualizes peak customer activity by day and hour to optimize engagement."
          chartData={heatmapStackedBar}
          chartRef={chartRefs.heatmap}
          ChartComponent={Bar}
          exportFilename="activity_heatmap"
          fullWidth
        />
      )}
      {marketingSegmentsBar && (
        <ChartCard
          title="Marketing Segments"
          description="Guides marketing campaigns by segmenting customers based on behavior."
          chartData={marketingSegmentsBar}
          chartRef={chartRefs.marketingSegments}
          ChartComponent={Bar}
          exportFilename="marketing_segments"
          fullWidth
        />
      )}
      {marketingRecommendations && (
        <DataTable
          title="Marketing Recommendations"
          data={marketingRecommendations}
          columns={[
            { key: "Segment", label: "Segment", sortable: true },
            { key: "CustomerCount", label: "Customer Count", sortable: true },
            { key: "Recommendation", label: "Recommendation" },
          ]}
          searchKeys={["Segment"]}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortConfig={sortConfig}
          handleSort={handleSort}
          page={page}
          handlePageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          tableKey="marketingRecommendations"
          csvFilename="marketing_recommendations.csv"
        />
      )}
    </div>
  );
}

export default PredictiveTab;