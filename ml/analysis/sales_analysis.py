import logging
import pandas as pd

# Configure logging
logger = logging.getLogger(__name__)

def sales_drop_analysis(df):
    try:
        df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'], errors='coerce')
        df = df.dropna(subset=['InvoiceDate'])
        
        df['YearMonth'] = df['InvoiceDate'].dt.strftime('%Y-%m')
        
        monthly_revenue = df.groupby('YearMonth')['TotalPrice'].sum().reset_index()
        
        monthly_revenue['YearMonth_date'] = pd.to_datetime(monthly_revenue['YearMonth'] + '-01')
        monthly_revenue = monthly_revenue.sort_values('YearMonth_date')
        
        if len(monthly_revenue) >= 13:
            monthly_revenue['YoY_Change'] = monthly_revenue['TotalPrice'].pct_change(12).fillna(0)
        else:
            monthly_revenue['YoY_Change'] = monthly_revenue['TotalPrice'].pct_change().fillna(0)
            logger.warning("Insufficient data for YoY calculation, using MoM instead")
        
        drops = monthly_revenue[monthly_revenue['YoY_Change'] < -0.1].copy()
        if drops.empty:
            logger.info("No significant sales drops detected.")
            return []
        
        factors = []
        for _, row in drops.iterrows():
            current_month = row['YearMonth']
            month_data = df[df['YearMonth'] == current_month].copy()
            
            customer_count = month_data['CustomerID'].nunique()
            avg_order_value = month_data.groupby('InvoiceNo')['TotalPrice'].sum().mean()
            total_orders = month_data['InvoiceNo'].nunique()
            
            sales_qty = df[(df['YearMonth'] == current_month) & (df['Quantity'] > 0)]['Quantity'].sum()
            returns_qty = df[(df['YearMonth'] == current_month) & (df['Quantity'] < 0)]['Quantity'].abs().sum()
            
            return_rate = 0
            if sales_qty > 0:
                return_rate = returns_qty / sales_qty
            
            overall_customer_avg = df.groupby('YearMonth')['CustomerID'].nunique().mean()
            overall_order_avg = df.groupby(['YearMonth', 'InvoiceNo'])['TotalPrice'].sum().groupby('YearMonth').mean().mean()
            
            reasons = []
            recommendations = []
            
            if customer_count < overall_customer_avg * 0.8:
                reasons.append(f"Customer activity dropped to {customer_count} customers vs. avg {overall_customer_avg:.0f}")
                recommendations.append("Launch customer re-engagement campaign with special offers")
            
            if avg_order_value < overall_order_avg * 0.8:
                reasons.append(f"Low average order value: ${avg_order_value:.2f} vs. avg ${overall_order_avg:.2f}")
                recommendations.append("Implement product bundling and upselling strategies")
            
            if return_rate > 0.05:
                reasons.append(f"High return rate: {return_rate:.1%}")
                recommendations.append("Review product quality and listings for accuracy")
            
            if not reasons:
                reasons.append("No clear single factor identified")
                recommendations.append("Investigate external factors like seasonality or competition")
            
            factors.append({
                'YearMonth': current_month,
                'Revenue': float(row['TotalPrice']),
                'YoY_Change': float(row['YoY_Change']),
                'CustomerCount': int(customer_count),
                'AvgOrderValue': float(avg_order_value),
                'ReturnRate': float(return_rate),
                'Reasons': reasons,
                'Recommendations': recommendations
            })
        
        return factors
    except Exception as e:
        logger.error(f"Error in sales_drop_analysis: {e}")
        raise

def monthly_revenue_analysis(df):
    try:
        required_columns = ['InvoiceDate', 'Quantity', 'UnitPrice']
        if not all(col in df.columns for col in required_columns):
            raise ValueError(f"CSV file must contain the following columns: {', '.join(required_columns)}")
        
        df['YearMonth'] = pd.to_datetime(df['InvoiceDate']).dt.to_period('M')
        monthly_revenue = df.groupby('YearMonth')['TotalPrice'].sum().reset_index()
        monthly_revenue['YoY_Change'] = monthly_revenue['TotalPrice'].pct_change(periods=12).fillna(0)
        monthly_revenue['recommendation'] = monthly_revenue['YoY_Change'].apply(
            lambda x: 'Investigate decline; consider promotions.' if x < -0.1
            else 'Monitor growth; optimize marketing.' if x > 0.1
            else 'Stable; maintain strategy.'
        )
        monthly_revenue['YearMonth'] = monthly_revenue['YearMonth'].astype(str)
        
        return monthly_revenue.to_dict(orient='records')
    except Exception as e:
        logger.error(f"Error in monthly_revenue_analysis: {e}")
        raise

def daily_revenue_analysis(df):
    try:
        required_columns = ['InvoiceDate', 'Quantity', 'UnitPrice']
        if not all(col in df.columns for col in required_columns):
            raise ValueError(f"CSV file must contain the following columns: {', '.join(required_columns)}")
        
        df['YearMonth'] = pd.to_datetime(df['InvoiceDate']).dt.to_period('M')
        df['Day'] = df['InvoiceDate'].dt.day.astype(int)
        daily_revenue = df.groupby(['YearMonth', 'Day'])['TotalPrice'].sum().reset_index()
        daily_revenue['YearMonth'] = daily_revenue['YearMonth'].astype(str)
        
        daily_revenue_dict = daily_revenue.groupby('YearMonth').apply(
            lambda x: x.set_index('Day')['TotalPrice'].to_dict()
        ).to_dict()
        
        return daily_revenue_dict
    except Exception as e:
        logger.error(f"Error in daily_revenue_analysis: {e}")
        raise

def seasonality_analysis(df):
    try:
        df['Month'] = pd.to_datetime(df['InvoiceDate']).dt.month.astype(int)
        seasonal_revenue = df.groupby('Month')['TotalPrice'].sum().reset_index()
        
        seasonal_revenue['recommendation'] = seasonal_revenue['TotalPrice'].apply(
            lambda x: 'High season; increase inventory.' if x > seasonal_revenue['TotalPrice'].quantile(0.75)
            else 'Low season; run promotions.' if x < seasonal_revenue['TotalPrice'].quantile(0.25)
            else 'Stable season; maintain strategy.'
        )
        
        return seasonal_revenue.to_dict(orient='records')
    except Exception as e:
        logger.error(f"Error in seasonality_analysis: {e}")
        raise