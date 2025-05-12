import logging
import pandas as pd
import warnings

# Configure logging
logger = logging.getLogger(__name__)

# Suppress warnings
warnings.filterwarnings("ignore", category=pd.errors.SettingWithCopyWarning)

def perform_rfm_analysis(df):
    try:
        required_columns = ['InvoiceNo', 'StockCode', 'Description', 'Quantity', 'InvoiceDate', 'UnitPrice', 'CustomerID']
        if not all(col in df.columns for col in required_columns):
            raise ValueError(f"CSV file must contain the following columns: {', '.join(required_columns)}")
        
        df_cleaned = df.copy()
        
        today_date = pd.to_datetime(df_cleaned['InvoiceDate'].max()) + pd.Timedelta(days=1)
        rfm = df_cleaned.groupby('CustomerID').agg({
            'InvoiceDate': lambda date: (today_date - pd.to_datetime(date.max())).days,
            'InvoiceNo': lambda num: num.nunique(),
            'TotalPrice': lambda price: price.sum()
        })
        
        rfm.columns = ['Recency', 'Frequency', 'Monetary']
        rfm = rfm[rfm['Monetary'] > 0]
        
        rfm['recency_score'] = pd.qcut(rfm['Recency'], 5, labels=[5, 4, 3, 2, 1], duplicates='drop')
        rfm['frequency_score'] = pd.qcut(rfm['Frequency'].rank(method='first'), 5, labels=[1, 2, 3, 4, 5], duplicates='drop')
        rfm['monetary_score'] = pd.qcut(rfm['Monetary'], 5, labels=[1, 2, 3, 4, 5], duplicates='drop')
        rfm['RFM_SCORE'] = rfm['recency_score'].astype(str) + rfm['frequency_score'].astype(str)
        
        seg_map = {
            r'[1-2][1-2]': 'hibernating',
            r'[1-2][3-4]': 'at_Risk',
            r'[1-2]5': 'cant_loose',
            r'3[1-2]': 'about_to_Sleep',
            r'33': 'need_attention',
            r'[3-4][4-5]': 'loyal_customers',
            r'41': 'promising',
            r'51': 'new_customers',
            r'[4-5][2-3]': 'potential_loyalists',
            r'5[4-5]': 'champions'
        }
        rfm['segment'] = rfm['RFM_SCORE'].replace(seg_map, regex=True)
        
        rfm['recommendation'] = rfm['segment'].map({
            'hibernating': 'Send re-engagement email with discount.',
            'at_Risk': 'Offer loyalty discount to retain.',
            'cant_loose': 'Provide exclusive offer to prevent churn.',
            'about_to_Sleep': 'Send reminder email with new products.',
            'need_attention': 'Engage with personalized recommendations.',
            'loyal_customers': 'Reward with loyalty points.',
            'promising': 'Upsell with product bundles.',
            'new_customers': 'Welcome email with first-purchase discount.',
            'potential_loyalists': 'Encourage repeat purchase with coupon.',
            'champions': 'VIP program invitation.'
        })
        
        return rfm
    except Exception as e:
        logger.error(f"Error in perform_rfm_analysis: {e}")
        raise

def marketing_recommendations(rfm, rules):
    try:
        if rfm is None or rfm.empty:
            return [{"Segment": "No data", "Recommendation": "Insufficient data for recommendations"}]
            
        if not isinstance(rules, list):
            rules = []
        
        recommendations = []
        
        for segment in rfm['segment'].unique():
            segment_customers = rfm[rfm['segment'] == segment]
            
            top_customers = []
            try:
                if 'Monetary' in segment_customers.columns:
                    top_customers = segment_customers.nlargest(5, 'Monetary').index.tolist()
                top_customers = [str(c) for c in top_customers]
            except Exception as e:
                logger.warning(f"Error getting top customers: {e}")
            
            bundle_suggestions = []
            for i, rule in enumerate(rules[:3]):
                try:
                    if isinstance(rule, dict) and 'antecedents' in rule and 'consequents' in rule and 'lift' in rule:
                        bundle_suggestions.append(
                            f"Bundle {rule['antecedents']} with {rule['consequents']} (Lift: {float(rule['lift']):.2f})"
                        )
                except Exception as e:
                    logger.warning(f"Error processing rule {i}: {e}")
            
            segment_recommendation = "General marketing recommendation"
            if 'recommendation' in segment_customers.columns and not segment_customers.empty:
                segment_recommendation = segment_customers['recommendation'].iloc[0]
            
            recommendations.append({
                'Segment': str(segment),
                'CustomerCount': int(len(segment_customers)),
                'TopCustomers': top_customers,
                'Recommendation': str(segment_recommendation),
                'ProductBundles': bundle_suggestions if bundle_suggestions else ["No specific bundle recommendations identified"]
            })
        
        return recommendations
    except Exception as e:
        logger.error(f"Error in marketing_recommendations: {e}")
        return [{"Segment": "Error", "Recommendation": f"Error generating recommendations: {str(e)}"}]