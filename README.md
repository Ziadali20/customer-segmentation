# Customer Segmentation using RFM Analysis 🚀

## 📌 Overview

A powerful web application to analyze customer behavior, track sales performance, and predict future actions.
Built with **RFM (Recency, Frequency, Monetary)** analysis and machine learning, it empowers businesses with data-driven insights through interactive dashboards (React frontend), a Node.js API backend, and Python ML models. Users upload transactional CSV files, and the app delivers actionable insights via charts and tables across four tabs: **Customer**, **Revenue**, **Product**, and **Predictive**.

---

## 📁 Features

- 📊 **Customer Segmentation**: Groups customers using RFM analysis (e.g., Champions, At-Risk).
- 💸 **Revenue Analysis**: Tracks monthly, daily, seasonal, and geographical revenue trends.
- 📦 **Product Insights**: Identifies top products, inventory turnover, and sentiment.
- 🔮 **Predictive Analytics**: Forecasts churn and marketing recommendations.
- 📈 **Interactive Visualizations**: Dynamic charts and filterable tables with export options (PNG, CSV).

---

## ⚙️ How It Works

1. **Upload CSV**: Users upload transactional data via the React frontend’s `FileUploader`.
2. **Data Processing**: Python (Flask) scripts clean data and extract features (`file_handler.py`, `data_cleaning.py`).
3. **Analysis**:
   - `rfm_analysis.py`: Segments customers based on RFM scores.
   - `customer_analysis.py`: Calculates CLV, top customers, and activity patterns.
   - `sales_analysis.py`: Analyzes revenue trends and detects declines.
   - `product_analysis.py`: Evaluates products and suggests bundles.
   - `churn_model.py`, `repurchase_model.py`: Predicts churn and repurchase using Random Forest.
4. **API Layer**: Node.js (`server.js`) serves data from Flask via REST endpoints (e.g., `/rfm_analysis`).
5. **Charts Rendered**: React frontend uses Chart.js to visualize insights.

---

## 📊 Visualizations

The application displays insights through Chart.js-powered charts. Below is a list of charts with their purposes:

**Customer Segments**  
Shows the distribution of customers across RFM segments for targeted marketing.

**Customer Lifetime Value (CLV)**  
Displays the spread of customer value to identify high-value clients.

**Top Customers by Revenue**  
Ranks top-spending customers for VIP program enrollment.

**Monthly Revenue Trends**  
Tracks revenue over time to spot growth or decline patterns.

**Revenue by Country**  
Highlights revenue performance across markets for expansion planning.

**Seasonal Revenue Patterns**  
Reveals seasonal trends to optimize inventory and promotions.

**Top Products by Revenue**  
Identifies best-selling products for marketing and restocking.

**Product Sentiment**  
Shows customer sentiment toward products to guide marketing decisions.

**Repurchase Probability**  
Predicts which customers are likely to repurchase for campaign targeting.

**Retention Rate**  
Measures customer loyalty over time to inform retention strategies.

**Customer Activity Heatmap**  
Maps purchase activity by day and hour to schedule promotions.

**Customer Count by Segment**  
Shows segment sizes to prioritize marketing resources.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Chart.js, Bootstrap, Framer Motion
- **Backend**: Node.js, Express, Multer (file uploads)
- **ML & Data Processing**: Python, Pandas, Scikit-learn, mlxtend (Apriori), TextBlob (sentiment), Flask
- **Storage**: CSV file uploads (saved in `Uploads/` folder)

---

## 🚀 Getting Started

### Prerequisites

- Node.js: 13.x or later
- npm: 6.x or later
- Python: 3.8 or later

### Setup Instructions

1. Create a new folder and open a terminal in that directory.
2. Clone the repository:
   ```bash
   git clone https://github.com/Ziadali20/customer-segmentation.git
   ```
3. Open the `customer-segmentation` folder in Visual Studio Code.
4. Open three terminals in VS Code and run the following commands:

   **Terminal 1 (Python Backend):**

   ```bash
   cd ml
   pip install -r requirements.txt
   python app.py
   ```

   **Terminal 2 (Node.js Backend):**

   ```bash
   cd backend
   npm i
   npm start
   ```

   **Terminal 3 (Frontend):**

   ```bash
   cd frontend
   npm i
   npm start
   ```

6. Access the app:
   Open `http://localhost:3000` in your browser, upload a CSV file, and explore the dashboard.

---

## 🤝 Contributing

Contributions are welcome! Fork the repo, create a branch, and submit a pull request.
