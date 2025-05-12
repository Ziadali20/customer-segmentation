import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FaDownload } from "react-icons/fa";
import { CSVLink } from "react-csv";
import { saveAs } from "file-saver";

const cardVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.3 } },
  tap: { scale: 0.95 },
};

function ChartCard({
  title,
  description,
  chartData,
  rawData,
  chartRef,
  ChartComponent,
  exportFilename,
  csvData,
  fullWidth = false,
}) {
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");

  // Extract unique years and months from rawData
  const { years, months } = useMemo(() => {
    if (!rawData || !rawData.length) return { years: [], months: [] };

    const yearsSet = new Set();
    const monthsSet = new Set();

    rawData.forEach((item) => {
      if (item.YearMonth) {
        const [year, month] = item.YearMonth.split("-");
        yearsSet.add(year);
        monthsSet.add(month);
      } else if (item.Date) {
        const date = new Date(item.Date);
        yearsSet.add(date.getFullYear().toString());
        monthsSet.add((date.getMonth() + 1).toString().padStart(2, "0"));
      } else if (item.Month) {
        monthsSet.add(item.Month);
      }
    });

    return {
      years: ["All", ...Array.from(yearsSet).sort()],
      months: ["All", ...Array.from(monthsSet).sort()],
    };
  }, [rawData]);

  // Filter rawData based on selected year and month
  const filteredData = useMemo(() => {
    if (!rawData || !rawData.length) return rawData;

    return rawData.filter((item) => {
      let year = "";
      let month = "";

      if (item.YearMonth) {
        [year, month] = item.YearMonth.split("-");
      } else if (item.Date) {
        const date = new Date(item.Date);
        year = date.getFullYear().toString();
        month = (date.getMonth() + 1).toString().padStart(2, "0");
      } else if (item.Month) {
        month = item.Month;
      }

      const yearMatch = selectedYear === "All" || year === selectedYear;
      const monthMatch = selectedMonth === "All" || month === selectedMonth;

      return yearMatch && monthMatch;
    });
  }, [rawData, selectedYear, selectedMonth]);

  // Compute filtered chartData based on filteredData
  const computedChartData = useMemo(() => {
    if (!filteredData || !filteredData.length || !chartData) return chartData;

    // Example: Adapt for specific chart types (e.g., monthlyRevenue)
    if (chartData.labels.some((label) => label.includes("-"))) {
      // Handle time-series data (e.g., monthlyRevenue)
      const labels = filteredData.map((item) => item.YearMonth || item.Date);
      const data = filteredData.map((item) => item.TotalPrice || item.value || 0);

      return {
        labels,
        datasets: [
          {
            ...chartData.datasets[0],
            data,
          },
        ],
        options: chartData.options,
      };
    }

    // Return original chartData for non-temporal data
    return chartData;
  }, [filteredData, chartData]);

  const exportChart = (chartRef, filename) => {
    if (chartRef?.current?.canvas) {
      const canvas = chartRef.current.canvas;
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `${filename}.png`);
        }
      });
    }
  };

  return (
    <motion.div
      className={`chart-card ${fullWidth ? "chartContainer" : ""}`}
      variants={cardVariants}
    >
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <div className="filter-container">
          {years.length > 1 && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="filter-select"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          )}
          {months.length > 1 && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="filter-select"
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          )}
        </div>
        {csvData ? (
          <CSVLink data={csvData} filename={`${exportFilename}.csv`} className="csv-link">
            <motion.button
              className="download-button"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <FaDownload />
            </motion.button>
          </CSVLink>
        ) : (
          <motion.button
            className="download-button"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => exportChart(chartRef, exportFilename)}
          >
            <FaDownload />
          </motion.button>
        )}
      </div>
      <p className="chart-description">{description}</p>
      <div className="chart-wrapper">
        {computedChartData ? (
          <ChartComponent ref={chartRef} data={computedChartData} options={computedChartData.options} />
        ) : (
          <p>No chart data available</p>
        )}
      </div>
    </motion.div>
  );
}

export default ChartCard;