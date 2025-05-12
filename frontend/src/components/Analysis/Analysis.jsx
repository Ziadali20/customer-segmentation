import React, { useState, useContext, useMemo } from "react";
import { motion } from "framer-motion";
import { UserContext } from "../../Context/data-context";
import FileUploader from "./FileUploader";
import InsightsCards from "./InsightsCards";
import CustomerTab from "./CustomerTab";
import RevenueTab from "./RevenueTab";
import ProductTab from "./ProductTab";
import PredictiveTab from "./PredictiveTab";
import axios from "axios";
import "./Analysis.css";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1 } },
};

function Analysis({ activeTab, setActiveTab }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [useScaledRevenue, setUseScaledRevenue] = useState(false);
  const [page, setPage] = useState({
    clv: 0,
    geographicalRevenue: 0,
    affinityRules: 0,
    churn_predictions: 0,
    marketingRecommendations: 0,
  });
  const [rowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const { rfmData, setRfmData } = useContext(UserContext);

  const {
    segmentData,
    monthlyRevenue,
    topCustomers,
    topProducts,
    geographicalRevenue,
    monthlyCustomerAcquisition,
    heatmapData,
    churnPrediction,
    clv,
    affinityRules,
    sentimentSummary,
    inventoryTurnover,
    discountImpact,
    seasonalRevenue,
    retentionRate,
    salesDropFactors,
    repurchasePredictions,
    marketingRecommendations,
  } = rfmData;

  const insights = useMemo(
    () => ({
      totalCustomers: Object.values(segmentData || {}).reduce(
        (sum, seg) => sum + (seg?.length || 0),
        0
      ),
      topSegment:
        Object.entries(segmentData || {})
          .sort((a, b) => b[1].length - a[1].length)[0]?.[0] || "N/A",
      highCLVCount: clv?.filter((c) => c.CLV > (clv[0]?.CLV * 0.75 || 0)).length || 0,
      totalRevenue:
        monthlyRevenue?.reduce((sum, item) => sum + (item.TotalPrice || 0), 0) || 0,
      highChurnRisk:
        churnPrediction?.churn_predictions?.filter((c) => c.Churn_Probability > 0.7)
          .length || 0,
    }),
    [segmentData, clv, monthlyRevenue, churnPrediction]
  );

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://localhost:5001/upload_csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const endpoints = [
        "rfm_analysis",
        "monthly_revenue",
        "daily_revenue",
        "top_customers",
        "top_products",
        `geographical_analysis${useScaledRevenue ? "?scaled=true" : ""}`,
        "monthly_customer_acquisition",
        "customer_activity_heatmap",
        "churn_prediction",
        "customer_lifetime_value",
        "product_affinity",
        "sentiment_analysis",
        "inventory_turnover",
        "discount_impact",
        "seasonality_analysis",
        "retention_rate",
        "sales_drop_analysis",
        "repurchase_prediction",
        "marketing_recommendations",
      ];

      const responses = await Promise.all(
        endpoints.map((endpoint) =>
          axios
            .post(`http://localhost:5001/${endpoint}`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            })
            .catch((err) => ({
              error: `Failed to fetch ${endpoint}: ${err.message}`,
            }))
        )
      );

      const failedEndpoints = responses
        .map((res, idx) => (res.error ? endpoints[idx] : null))
        .filter(Boolean);
      if (failedEndpoints.length > 0) {
        setError(`Failed to fetch data from: ${failedEndpoints.join(", ")}`);
      }

      setRfmData({
        segmentData: responses[0].data?.segment_data || {},
        monthlyRevenue: responses[1].data?.monthly_revenue || [],
        dailyRevenue: responses[2].data?.daily_revenue || {},
        topCustomers: responses[3].data?.top_customers || [],
        topProducts: responses[4].data?.top_products || [],
        geographicalRevenue: responses[5].data?.geographical_revenue || [],
        monthlyCustomerAcquisition: responses[6].data?.monthly_acquisition || [],
        heatmapData: responses[7].data?.activity_heatmap || [],
        churnPrediction: responses[8].data || {},
        clv: responses[9].data?.clv || [],
        affinityRules: responses[10].data?.affinity_rules || [],
        sentimentSummary: responses[11].data?.sentiment_summary || [],
        inventoryTurnover: responses[12].data?.inventory_turnover || [],
        discountImpact: responses[13].data?.discount_impact || [],
        seasonalRevenue: responses[14].data?.seasonal_revenue || [],
        retentionRate: responses[15].data?.retention_data || [],
        salesDropFactors: responses[16].data?.sales_drop_factors || [],
        repurchasePredictions: responses[17].data?.repurchase_predictions || [],
        marketingRecommendations: responses[18].data?.marketing_recommendations || [],
      });
    } catch (err) {
      setError(err.response?.data?.error || "Error processing file.");
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "customer":
        return (
          <CustomerTab
            segmentData={segmentData}
            topCustomers={topCustomers}
            clv={clv}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
            page={page}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
          />
        );
      case "revenue":
        return (
          <RevenueTab
            monthlyRevenue={monthlyRevenue}
            geographicalRevenue={geographicalRevenue}
            monthlyCustomerAcquisition={monthlyCustomerAcquisition}
            seasonalRevenue={seasonalRevenue}
            useScaledRevenue={useScaledRevenue}
            setUseScaledRevenue={setUseScaledRevenue}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
            page={page}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
          />
        );
      case "product":
        return (
          <ProductTab
            topProducts={topProducts}
            inventoryTurnover={inventoryTurnover}
            sentimentSummary={sentimentSummary}
            affinityRules={affinityRules}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
            page={page}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
          />
        );
      case "predictive":
        return (
          <PredictiveTab
            churnPrediction={churnPrediction}
            repurchasePredictions={repurchasePredictions}
            salesDropFactors={salesDropFactors}
            retentionRate={retentionRate}
            discountImpact={discountImpact}
            heatmapData={heatmapData}
            marketingRecommendations={marketingRecommendations}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
            page={page}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
          />
        );
      default:
        return (
          <CustomerTab
            segmentData={segmentData}
            topCustomers={topCustomers}
            clv={clv}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
            page={page}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
          />
        );
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="analysis-container"
    >
      <div className="main-content">
        <FileUploader
          file={file}
          handleFileChange={handleFileChange}
          handleUpload={handleUpload}
          loading={loading}
          error={error}
        />
        {(activeTab === "customer" || activeTab === "predictive") && (
          <InsightsCards insights={insights} activeTab={activeTab} />
        )}
        {renderTabContent()}
      </div>
    </motion.div>
  );
}

export default Analysis;