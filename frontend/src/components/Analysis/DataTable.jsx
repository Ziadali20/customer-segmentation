import React from "react";
import { CSVLink } from "react-csv";
import { motion } from "framer-motion";
import { FaDownload } from "react-icons/fa";

const cardVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.3 } },
  tap: { scale: 0.95 },
};

function DataTable({
  title,
  data,
  columns,
  searchKeys,
  searchQuery,
  setSearchQuery,
  sortConfig,
  handleSort,
  page,
  handlePageChange,
  rowsPerPage,
  tableKey,
  csvFilename,
}) {
  const filterData = (data, keys) => {
    if (!searchQuery || !data) return data;
    return data.filter((item) =>
      keys.some((key) =>
        String(item[key]).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  };

  const sortData = (data, key, direction) => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const aValue = a[key] || 0;
      const bValue = b[key] || 0;
      if (typeof aValue === "string") {
        return direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return direction === "asc" ? aValue - bValue : bValue - aValue;
    });
  };

  return (
    <motion.div className="chart-card chartContainer" variants={cardVariants}>
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <CSVLink data={filterData(data, searchKeys)} filename={csvFilename} className="csv-link">
          <motion.button
            className="download-button"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <FaDownload />
          </motion.button>
        </CSVLink>
      </div>
      <input
        type="text"
        placeholder={`Search by ${searchKeys.join(" or ")}`}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(({ key, label, sortable }) => (
              <th
                key={key}
                className={`table-header ${sortable ? "sortable" : ""}`}
                onClick={sortable ? () => handleSort(key) : undefined}
              >
                {label}{" "}
                {sortConfig.key === key && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortData(filterData(data, searchKeys), sortConfig.key, sortConfig.direction)
            .slice(page[tableKey] * rowsPerPage, page[tableKey] * rowsPerPage + rowsPerPage)
            .map((item, index) => (
              <tr key={index}>
                {columns.map(({ key, render }) => (
                  <td key={key} className="table-cell">
                    {render ? render(item) : item[key]}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
      <div className="pagination">
        <button
          onClick={() => handlePageChange(tableKey, page[tableKey] - 1)}
          disabled={page[tableKey] === 0}
          className="pagination-button"
        >
          Previous
        </button>
        <button
          onClick={() => handlePageChange(tableKey, (page[tableKey] || 0) + 1)}
          disabled={
            page[tableKey] * rowsPerPage + rowsPerPage >= filterData(data, searchKeys).length
          }
          className="pagination-button"
        >
          Next
        </button>
      </div>
    </motion.div>
  );
}

export default DataTable;