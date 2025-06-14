import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.file_handler import load_and_clean_file
from analysis.rfm_analysis import perform_rfm_analysis, marketing_recommendations
from analysis.product_analysis import product_affinity_analysis, sentiment_analysis, inventory_turnover, discount_impact_analysis
from analysis.sales_analysis import sales_drop_analysis, monthly_revenue_analysis, daily_revenue_analysis, seasonality_analysis
from analysis.customer_analysis import calculate_clv, top_customers_analysis, top_products_analysis, monthly_customer_acquisition, geographical_analysis, product_return_rate, customer_activity_heatmap, retention_rate
from models.churn_model import train_churn_model
from models.repurchase_model import train_repurchase_model

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.route('/upload_csv', methods=['POST'])
def upload_csv():
    try:
        df = load_and_clean_file(request)
        return jsonify({"message": "File uploaded and cleaned successfully"}), 200
    except Exception as e:
        logger.error(f"Error in upload_csv: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/rfm_analysis', methods=['POST'])
def rfm_analysis():
    try:
        df = load_and_clean_file(request)
        rfm = perform_rfm_analysis(df)
        segment_data = rfm.groupby('segment').apply(lambda x: x.reset_index().to_dict(orient='records')).to_dict()
        return jsonify({"segment_data": segment_data}), 200
    except Exception as e:
        logger.error(f"Error in rfm_analysis: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/train_model', methods=['POST'])
def train_model():
    try:
        df = load_and_clean_file(request)
        rfm = perform_rfm_analysis(df)
        model, scaler, conf_matrix, class_report = train_repurchase_model(rfm, df)
        return jsonify({
            "confusion_matrix": conf_matrix.tolist(),
            "classification_report": class_report,
            "model_trained": True
        }), 200
    except Exception as e:
        logger.error(f"Error in train_model: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/churn_prediction', methods=['POST'])
def churn_prediction():
    try:
        df = load_and_clean_file(request)
        rfm = perform_rfm_analysis(df)
        model, scaler, conf_matrix, class_report = train_churn_model(rfm, df)
        churn_probs = model.predict_proba(scaler.transform(rfm[['Recency', 'Frequency', 'Monetary', 'Days_Since_Last_Purchase']]))[:, 1]
        rfm_reset = rfm.reset_index()
        rfm_reset['Churn_Probability'] = churn_probs
        rfm_reset['recommendation'] = rfm_reset['Churn_Probability'].apply(
            lambda x: f"High churn risk ({x:.2f}); offer discount." if x > 0.7
            else f"Moderate risk ({x:.2f}); engage with email." if x > 0.3
            else f"Low risk ({x:.2f}); maintain relationship."
        )
        return jsonify({
            "confusion_matrix": conf_matrix.tolist(),
            "classification_report": class_report,
            "churn_predictions": rfm_reset[['CustomerID', 'Churn_Probability', 'recommendation']].to_dict(orient='records')
        }), 200
    except Exception as e:
        logger.error(f"Error in churn_prediction: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/repurchase_prediction', methods=['POST'])
def repurchase_prediction():
    try:
        df = load_and_clean_file(request)
        rfm = perform_rfm_analysis(df)
        model, scaler, _, _ = train_repurchase_model(rfm, df)
        repurchase_probs = model.predict_proba(scaler.transform(rfm[['Recency', 'Frequency', 'Monetary']]))[:, 1]
        rfm_reset = rfm.reset_index()
        rfm_reset['Repurchase_Probability'] = repurchase_probs
        rfm_reset['recommendation'] = rfm_reset['Repurchase_Probability'].apply(
            lambda x: f"High repurchase likelihood ({x:.2f}); upsell products." if x > 0.7
            else f"Moderate likelihood ({x:.2f}); send promotional email." if x > 0.3
            else f"Low likelihood ({x:.2f}); re-engage with discount."
        )
        return jsonify({
            "repurchase_predictions": rfm_reset[['CustomerID', 'Repurchase_Probability', 'recommendation']].to_dict(orient='records')
        }), 200
    except Exception as e:
        logger.error(f"Error in repurchase_prediction: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/customer_lifetime_value', methods=['POST'])
def customer_lifetime_value():
    try:
        df = load_and_clean_file(request)
        clv = calculate_clv(df)
        return jsonify({"clv": clv.to_dict(orient='records')}), 200
    except Exception as e:
        logger.error(f"Error in customer_lifetime_value: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/product_affinity', methods=['POST'])
def product_affinity():
    try:
        df = load_and_clean_file(request)
        rules = product_affinity_analysis(df)
        return jsonify({"affinity_rules": rules}), 200
    except Exception as e:
        logger.error(f"Error in product_affinity: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/sentiment_analysis', methods=['POST'])
def sentiment_analysis_endpoint():
    try:
        df = load_and_clean_file(request)
        sentiment_summary = sentiment_analysis(df)
        return jsonify({"sentiment_summary": sentiment_summary}), 200
    except Exception as e:
        logger.error(f"Error in sentiment_analysis_endpoint: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/inventory_turnover', methods=['POST'])
def inventory_turnover_endpoint():
    try:
        df = load_and_clean_file(request)
        turnover = inventory_turnover(df)
        return jsonify({"inventory_turnover": turnover}), 200
    except Exception as e:
        logger.error(f"Error in inventory_turnover_endpoint: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/discount_impact', methods=['POST'])
def discount_impact():
    try:
        df = load_and_clean_file(request)
        discount_impact = discount_impact_analysis(df)
        return jsonify({"discount_impact": discount_impact}), 200
    except Exception as e:
        logger.error(f"Error in discount_impact: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/monthly_revenue', methods=['POST'])
def monthly_revenue():
    try:
        df = load_and_clean_file(request)
        monthly_revenue = monthly_revenue_analysis(df)
        return jsonify({"monthly_revenue": monthly_revenue}), 200
    except Exception as e:
        logger.error(f"Error in monthly_revenue: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/daily_revenue', methods=['POST'])
def daily_revenue():
    try:
        df = load_and_clean_file(request)
        daily_revenue = daily_revenue_analysis(df)
        return jsonify({"daily_revenue": daily_revenue}), 200
    except Exception as e:
        logger.error(f"Error in daily_revenue: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/top_customers', methods=['POST'])
def top_customers():
    try:
        df = load_and_clean_file(request)
        top_customers = top_customers_analysis(df)
        return jsonify({"top_customers": top_customers}), 200
    except Exception as e:
        logger.error(f"Error in top_customers: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/top_products', methods=['POST'])
def top_products():
    try:
        df = load_and_clean_file(request)
        top_products = top_products_analysis(df)
        return jsonify({"top_products": top_products}), 200
    except Exception as e:
        logger.error(f"Error in top_products: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/monthly_customer_acquisition', methods=['POST'])
def monthly_customer_acquisition_endpoint():
    try:
        df = load_and_clean_file(request)
        monthly_acquisition = monthly_customer_acquisition(df)
        return jsonify({"monthly_acquisition": monthly_acquisition}), 200
    except Exception as e:
        logger.error(f"Error in monthly_customer_acquisition: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/geographical_analysis', methods=['POST'])
def geographical_analysis_endpoint():
    try:
        df = load_and_clean_file(request)
        geographical_revenue = geographical_analysis(df, request)
        return jsonify({"geographical_revenue": geographical_revenue}), 200
    except Exception as e:
        logger.error(f"Error in geographical_analysis: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/product_return_rate', methods=['POST'])
def product_return_rate_endpoint():
    try:
        df = load_and_clean_file(request)
        return_rate = product_return_rate(df)
        return jsonify({"product_return_rate": return_rate}), 200
    except Exception as e:
        logger.error(f"Error in product_return_rate: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/customer_activity_heatmap', methods=['POST'])
def customer_activity_heatmap_endpoint():
    try:
        df = load_and_clean_file(request)
        heatmap_data = customer_activity_heatmap(df)
        return jsonify(heatmap_data), 200
    except Exception as e:
        logger.error(f"Error in customer_activity_heatmap: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/seasonality_analysis', methods=['POST'])
def seasonality_analysis_endpoint():
    try:
        df = load_and_clean_file(request)
        seasonal_revenue = seasonality_analysis(df)
        return jsonify({"seasonal_revenue": seasonal_revenue}), 200
    except Exception as e:
        logger.error(f"Error in seasonality_analysis: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/retention_rate', methods=['POST'])
def retention_rate_endpoint():
    try:
        df = load_and_clean_file(request)
        retention_data = retention_rate(df)
        return jsonify(retention_data), 200
    except Exception as e:
        logger.error(f"Error in retention_rate: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/sales_drop_analysis', methods=['POST'])
def sales_drop_analysis_endpoint():
    try:
        df = load_and_clean_file(request)
        factors = sales_drop_analysis(df)
        return jsonify({"sales_drop_factors": factors}), 200
    except Exception as e:
        logger.error(f"Error in sales_drop_analysis_endpoint: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/marketing_recommendations', methods=['POST'])
def marketing_recommendations_endpoint():
    try:
        df = load_and_clean_file(request)
        rfm = perform_rfm_analysis(df)
        rules = product_affinity_analysis(df)
        recommendations = marketing_recommendations(rfm, rules)
        return jsonify({"marketing_recommendations": recommendations}), 200
    except Exception as e:
        logger.error(f"Error in marketing_recommendations_endpoint: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)