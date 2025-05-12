export const getSegmentDonutChart = (segmentData?: Record<string, any[]>) => {
    if (!segmentData) return null;
    return {
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
    };
  };
  
  export const getMonthlyRevenueLine = (monthlyRevenue?: Array<{ YearMonth: string; TotalPrice: number }>) => {
    if (!monthlyRevenue) return null;
    return {
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
    };
  };
  
  export const getTopCustomersBar = (topCustomers?: Array<{ CustomerID: string; TotalPrice: number }>) => {
    if (!topCustomers) return null;
    return {
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
    };
  };
  
  export const getTopProductsBar = (topProducts?: Array<{ Description: string; TotalPrice: number }>) => {
    if (!topProducts) return null;
    return {
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
    };
  };
  
  export const getGeographicalRevenueBar = (
    geographicalRevenue?: Array<{
      Country: string;
      RawRevenue: number;
      RevenuePerCustomer: number;
      CustomerCount: number;
      recommendation: string;
    }>
  ) => {
    if (!geographicalRevenue) return null;
    return {
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
    };
  };
  
  export const getMonthlyAcquisitionArea = (
    monthlyCustomerAcquisition?: Array<{ YearMonth: string; newCustomers: number }>
  ) => {
    if (!monthlyCustomerAcquisition) return null;
    return {
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
    };
  };
  
  export const getInventoryTurnoverBar = (
    inventoryTurnover?: Array<{ Description: string; Turnover_Rate: number }>
  ) => {
    if (!inventoryTurnover) return null;
    return {
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
    };
  };
  
  export const getRepurchaseHistogram = (repurchasePredictions?: Array<{ Repurchase_Probability: number }>) => {
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
  };