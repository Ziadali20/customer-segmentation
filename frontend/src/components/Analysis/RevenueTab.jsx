import React, { useMemo, useRef } from "react";
import { Line, Bar } from "react-chartjs-2";
import ChartCard from "./ChartCard";
import DataTable from "./DataTable";



function RevenueTab({
  monthlyRevenue,
  geographicalRevenue,
  monthlyCustomerAcquisition,
  seasonalRevenue,
  useScaledRevenue,
  setUseScaledRevenue,
  searchQuery,
  setSearchQuery,
  sortConfig,
  setSortConfig,
  page,
  setPage,
  rowsPerPage,
}) {
  const chartRefs = {
    monthlyRevenue: useRef(null),
    geographicalRevenue: useRef(null),
    monthlyAcquisition: useRef(null),
    seasonalRevenue: useRef(null),
  };

  const monthlyRevenueLine = useMemo(
    () =>
      monthlyRevenue
        ? {
            labels: monthlyRevenue.map((item) => item.YearMonth),
            datasets: [
              {
                label: "Revenue ($)",
                data: monthlyRevenue.map((item) => item.TotalPrice),
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
    [monthlyRevenue]
  );

  const geographicalRevenueBar = useMemo(
    () =>
      geographicalRevenue
        ? {
            labels: geographicalRevenue.slice(0, 10).map((item) => item.Country),
            datasets: [
              {
                label: "Revenue ($)",
                data: geographicalRevenue.slice(0, 10).map((item) => item.RawRevenue),
                backgroundColor: "#4e79a7",
                borderRadius: 4,
              },
            ],
            options: {
              scales: { y: { beginAtZero: true } },
              plugins: { datalabels: { display: false } },
            },
          }
        : null,
    [geographicalRevenue]
  );

  const monthlyAcquisitionArea = useMemo(
    () =>
      monthlyCustomerAcquisition
        ? {
            labels: monthlyCustomerAcquisition.map((item) => item.YearMonth),
            datasets: [
              {
                label: "New Customers",
                data: monthlyCustomerAcquisition.map((item) => item.newCustomers),
                borderColor: "#ff6f61",
                backgroundColor: "rgba(255, 111, 97, 0.3)",
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
    [monthlyCustomerAcquisition]
  );

  const seasonalRevenueArea = useMemo(
    () =>
      seasonalRevenue
        ? {
            labels: seasonalRevenue.map((item) => item.Month),
            datasets: [
              {
                label: "Revenue ($)",
                data: seasonalRevenue.map((item) => item.TotalPrice),
                borderColor: "#ff6f61",
                backgroundColor: "rgba(255, 111, 97, 0.3)",
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
    [seasonalRevenue]
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
      {monthlyRevenueLine && (
        <ChartCard
          title="Monthly Revenue"
          description="Tracks monthly revenue trends to identify growth patterns."
          chartData={monthlyRevenueLine}
          // rawData={monthlyRevenue}
          chartRef={chartRefs.monthlyRevenue}
          ChartComponent={Line}
          exportFilename="monthly_revenue"
          fullWidth
        />
      )}
      {geographicalRevenueBar && (
        <ChartCard
          title="Revenue by Country"
          description="Compares revenue across countries to identify key markets."
          chartData={geographicalRevenueBar}
          chartRef={chartRefs.geographicalRevenue}
          ChartComponent={Bar}
          exportFilename="geographical_revenue"
          fullWidth
        />
      )}
      {monthlyAcquisitionArea && (
        <ChartCard
          title="Monthly Customer Acquisition"
          description="Tracks new customer acquisition to evaluate marketing efforts."
          chartData={monthlyAcquisitionArea}
        //   rawData={monthlyAcquisition}
          chartRef={chartRefs.monthlyAcquisition}
          ChartComponent={Line}
          exportFilename="monthly_acquisition"
          fullWidth
        />
      )}
      {seasonalRevenueArea && (
        <ChartCard
          title="Seasonal Revenue"
          description="Identifies seasonal revenue patterns for strategic planning."
          chartData={seasonalRevenueArea}
          chartRef={chartRefs.seasonalRevenue}
          ChartComponent={Line}
          exportFilename="seasonal_revenue"
          fullWidth
        //   rawData={seasonalRevenue}
        />
      )}
      {geographicalRevenue && (
        <DataTable
          title="Geographical Revenue Details"
          data={geographicalRevenue}
          columns={[
            { key: "Country", label: "Country", sortable: true },
            {
              key: useScaledRevenue ? "RevenuePerCustomer" : "RawRevenue",
              label: useScaledRevenue ? "Revenue per Customer" : "Total Revenue",
              sortable: true,
              render: (item) =>
                `$${(useScaledRevenue ? item.RevenuePerCustomer : item.RawRevenue).toFixed(2)}`,
            },
            { key: "CustomerCount", label: "Customer Count", sortable: true },
            { key: "recommendation", label: "Recommendation" },
          ]}
          searchKeys={["Country"]}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortConfig={sortConfig}
          handleSort={handleSort}
          page={page}
          handlePageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          tableKey="geographicalRevenue"
          csvFilename="geographical_revenue.csv"
        >
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={useScaledRevenue}
              onChange={() => setUseScaledRevenue(!useScaledRevenue)}
              className="checkbox-input"
            />
            Use Scaled Revenue (Per Customer)
          </label>
        </DataTable>
      )}
    </div>
  );
}

export default RevenueTab;