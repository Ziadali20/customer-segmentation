import React, { useMemo, useRef } from "react";
import { Pie, Bar } from "react-chartjs-2";
import ChartCard from "./ChartCard";
import DataTable from "./DataTable";

const cardVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

function CustomerTab({
  segmentData,
  topCustomers,
  clv,
  searchQuery,
  setSearchQuery,
  sortConfig,
  setSortConfig,
  page,
  setPage,
  rowsPerPage,
}) {
  const chartRefs = {
    segmentDonut: useRef(null),
    topCustomers: useRef(null),
    clv: useRef(null),
  };

  const segmentDonutChart = useMemo(
    () =>
      segmentData
        ? {
            labels: Object.keys(segmentData),
            datasets: [
              {
                data: Object.values(segmentData).map((value) => value?.length || 0),
                backgroundColor: [
                  "#4e79a7",
                  "#ff6f61",
                  "#6b5b95",
                  "#88b04b",
                  "#f7cac9",
                  "#92a8d1",
                  "#955251",
                  "#b565a7",
                  "#009688",
                  "#f4a261",
                ],
                borderWidth: 0,
              },
            ],
            options: {
              cutout: "50%",
              plugins: {
                datalabels: { color: "#fff", font: { weight: "bold" } },
                tooltip: { enabled: true },
              },
            },
          }
        : null,
    [segmentData]
  );

  const topCustomersBar = useMemo(
    () =>
      topCustomers
        ? {
            labels: topCustomers.map((item) => item.CustomerID),
            datasets: [
              {
                label: "Revenue ($)",
                data: topCustomers.map((item) => item.TotalPrice),
                backgroundColor: "#ff6f61",
                borderRadius: 4,
              },
            ],
            options: {
              indexAxis: "y",
              scales: { x: { beginAtZero: true } },
              plugins: { datalabels: { display: false } },
            },
          }
        : null,
    [topCustomers]
  );

  const clvHistogram = useMemo(() => {
    if (!clv) return null;
    const bins = Array(10).fill(0);
    const maxCLV = Math.max(...clv.map((c) => c.CLV));
    clv.forEach((c) => {
      const bin = Math.min(Math.floor((c.CLV / maxCLV) * 10), 9);
      bins[bin]++;
    });
    return {
      labels: bins.map((_, i) => `${(i * maxCLV / 10).toFixed(0)}-${((i + 1) * maxCLV / 10).toFixed(0)}`),
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
  }, [clv]);

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
      {segmentDonutChart && (
        <ChartCard
          title="Customer Segments"
          description="Segments customers by RFM scores, highlighting high-value groups."
          chartData={segmentDonutChart}
          chartRef={chartRefs.segmentDonut}
          ChartComponent={Pie}
          exportFilename="customer_segments"
        />
      )}
      {topCustomersBar && (
        <ChartCard
          title="Top Customers by Revenue"
          description="Identifies top-spending customers for targeted strategies."
          chartData={topCustomersBar}
          chartRef={chartRefs.topCustomers}
          ChartComponent={Bar}
          exportFilename="top_customers"
        />
      )}
      {/* {clvHistogram && (
        <ChartCard
          title="CLV Distribution"
          description="Shows Customer Lifetime Value distribution for prioritization."
          chartData={clvHistogram}
          chartRef={chartRefs.clv}
          ChartComponent={Bar}
          exportFilename="clv_distribution"
          fullWidth
        />
      )} */}
      {clv && (
        <DataTable
          title="Customer Lifetime Value"
          data={clv}
          columns={[
            { key: "CustomerID", label: "CustomerID", sortable: true },
            {
              key: "CLV",
              label: "CLV",
              sortable: true,
              render: (item) => `$${item.CLV.toFixed(2)}`,
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
          tableKey="clv"
          csvFilename="clv_data.csv"
        />
      )}
    </div>
  );
}

export default CustomerTab;