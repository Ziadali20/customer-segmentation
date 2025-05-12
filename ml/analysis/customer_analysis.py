import logging
import pandas as pd

# Configure logging
logger = logging.getLogger(__name__)

def calculate_clv(df):
    try:
        avg_purchase_value = df.groupby('CustomerID')['TotalPrice'].mean()
        purchase_frequency = df.groupby('CustomerID')['InvoiceNo'].nunique() / df['InvoiceDate'].dt.year.nunique()
        retention_rate = df.groupby('CustomerID')['InvoiceNo'].count().apply(lambda x: min(x / 10, 0.9))
        churn_rate = 1 - retention_rate
        clv = (avg_purchase_value * purchase_frequency * retention_rate) / churn_rate
        clv = clv.reset_index().rename(columns={0: 'CLV'})
        
        clv['recommendation'] = clv['CLV'].apply(
            lambda x: 'Focus on retention with loyalty program.' if x > clv['CLV'].quantile(0.75)
            else 'Engage with targeted promotions.' if x > clv['CLV'].quantile(0.25)
            else 'Low CLV; minimize marketing spend.'
        )
        
        return clv
    except Exception as e:
        logger.error(f"Error in calculate_clv: {e}")
        raise

def top_customers_analysis(df):
    try:
        top_customers = df.groupby('CustomerID')['TotalPrice'].sum().nlargest(10).reset_index()
        top_customers['recommendation'] = 'Enroll in VIP program.'
        return top_customers.to_dict(orient='records')
    except Exception as e:
        logger.error(f"Error in top_customers_analysis: {e}")
        raise

def top_products_analysis(df):
    try:
        top_products = df.groupby('Description')['TotalPrice'].sum().nlargest(10).reset_index()
        top_products['recommendation'] = 'Promote heavily in marketing.'
        return top_products.to_dict(orient='records')
    except Exception as e:
        logger.error(f"Error in top_products_analysis: {e}")
        raise

def monthly_customer_acquisition(df):
    try:
        df['FirstPurchaseDate'] = pd.to_datetime(df.groupby('CustomerID')['InvoiceDate'].transform('min'))
        df['YearMonth'] = df['FirstPurchaseDate'].dt.to_period('M')
        monthly_acquisition = df.groupby('YearMonth')['CustomerID'].nunique().reset_index()
        monthly_acquisition['YoY_Change'] = monthly_acquisition['CustomerID'].pct_change(periods=12).fillna(0)
        monthly_acquisition['recommendation'] = monthly_acquisition['YoY_Change'].apply(
            lambda x: 'Increase marketing spend to boost acquisition.' if x < -0.1
            else 'Sustain acquisition strategies.' if x > 0.1
            else 'Maintain current efforts.'
        )
        monthly_acquisition['YearMonth'] = monthly_acquisition['YearMonth'].astype(str)
        monthly_acquisition.rename(columns={'CustomerID': 'newCustomers'}, inplace=True)
        
        return monthly_acquisition.to_dict(orient='records')
    except Exception as e:
        logger.error(f"Error in monthly_customer_acquisition: {e}")
        raise

def geographical_analysis(df, request):
    try:
        if 'Country' not in df.columns:
            raise ValueError("CSV file must contain a 'Country' column")
        
        geographical_revenue = df.groupby('Country').agg({
            'TotalPrice': 'sum',
            'CustomerID': 'nunique'
        }).reset_index()
        geographical_revenue.rename(columns={'TotalPrice': 'RawRevenue', 'CustomerID': 'CustomerCount'}, inplace=True)
        geographical_revenue['RevenuePerCustomer'] = geographical_revenue['RawRevenue'] / geographical_revenue['CustomerCount']
        
        geographical_revenue['recommendation'] = geographical_revenue['RevenuePerCustomer'].apply(
            lambda x: 'High-value market; expand marketing.' if x > geographical_revenue['RevenuePerCustomer'].quantile(0.75)
            else 'Low-value market; optimize campaigns.' if x < geographical_revenue['RevenuePerCustomer'].quantile(0.25)
            else 'Stable market; maintain strategy.'
        )
        
        scaled = request.args.get('scaled', 'false').lower() == 'true'
        if scaled:
            output = geographical_revenue[['Country', 'RevenuePerCustomer', 'CustomerCount', 'recommendation']]
        else:
            output = geographical_revenue[['Country', 'RawRevenue', 'RevenuePerCustomer', 'CustomerCount', 'recommendation']]
        
        return output.to_dict(orient='records')
    except Exception as e:
        logger.error(f"Error in geographical_analysis: {e}")
        raise

def product_return_rate(df):
    try:
        returns = df[df['Quantity'] < 0]
        return_rate = returns.groupby('Description')['Quantity'].sum().reset_index()
        total_sold = df[df['Quantity'] > 0].groupby('Description')['Quantity'].sum()
        return_rate['ReturnRate'] = return_rate['Quantity'].abs() / total_sold
        return_rate = return_rate.fillna(0)
        
        return_rate['recommendation'] = return_rate['ReturnRate'].apply(
            lambda x: 'Investigate quality issues.' if x > 0.1
            else 'Monitor returns.' if x > 0.02
            else 'Low returns; maintain quality.'
        )
        
        return return_rate.to_dict(orient='records')
    except Exception as e:
        logger.error(f"Error in product_return_rate: {e}")
        raise

def customer_activity_heatmap(df):
    try:
        required_columns = ['InvoiceDate', 'InvoiceNo']
        if not all(col in df.columns for col in required_columns):
            raise ValueError(f"CSV file must contain the following columns: {', '.join(required_columns)}")
        
        if df.empty:
            raise ValueError("No valid data after cleaning InvoiceDate and InvoiceNo")
        
        df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'], errors='coerce')
        df = df.dropna(subset=['InvoiceDate'])
        
        df['Hour'] = df['InvoiceDate'].dt.hour.fillna(0).astype(int)
        df['DayOfWeek'] = df['InvoiceDate'].dt.dayofweek.fillna(0).astype(int)
        
        activity_heatmap = df.groupby(['DayOfWeek', 'Hour'])['InvoiceNo'].nunique().unstack(fill_value=0)
        
        activity_heatmap.columns = activity_heatmap.columns.astype(int)
        all_hours = pd.Index(range(24), name='Hour')
        activity_heatmap = activity_heatmap.reindex(columns=all_hours, fill_value=0)
        
        activity_data = []
        for day in activity_heatmap.index:
            row_data = {'DayOfWeek': int(day)}
            for hour in activity_heatmap.columns:
                row_data[f"Hour_{int(hour)}"] = int(activity_heatmap.loc[day, hour])
            activity_data.append(row_data)
        
        if not activity_heatmap.empty:
            hour_sums = activity_heatmap.sum()
            day_sums = activity_heatmap.sum(axis=1)
            
            peak_hour = int(hour_sums.idxmax()) if not hour_sums.empty else 0
            peak_day = int(day_sums.idxmax()) if not day_sums.empty else 0
        else:
            peak_hour = 0
            peak_day = 0
            
        day_names = {0: 'Monday', 1: 'Tuesday', 2: 'Wednesday', 3: 'Thursday', 4: 'Friday', 5: 'Saturday', 6: 'Sunday'}
        recommendation = f"Peak activity on {day_names.get(peak_day, 'Unknown day')} at Hour {peak_hour}; schedule promotions accordingly."
        
        return {
            "activity_heatmap": activity_data,
            "peak_hour": peak_hour,
            "peak_day": peak_day,
            "peak_day_name": day_names.get(peak_day, 'Unknown'),
            "recommendation": recommendation
        }
    except Exception as e:
        logger.error(f"Error in customer_activity_heatmap: {e}")
        raise

def retention_rate(df):
    try:
        required_columns = ['InvoiceDate', 'CustomerID', 'InvoiceNo']
        if not all(col in df.columns for col in required_columns):
            raise ValueError(f"CSV file must contain the following columns: {', '.join(required_columns)}")
        
        df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'], errors='coerce')
        df = df.dropna(subset=['InvoiceDate'])
        
        df['YearMonth'] = df['InvoiceDate'].dt.strftime('%Y-%m')
        cohort_data = df.groupby(['CustomerID', 'YearMonth'])['InvoiceNo'].nunique().reset_index()
        
        first_purchase = df.groupby('CustomerID')['InvoiceDate'].min().reset_index()
        first_purchase['CohortMonth'] = first_purchase['InvoiceDate'].dt.strftime('%Y-%m')
        
        cohort_data = cohort_data.merge(first_purchase[['CustomerID', 'CohortMonth']], on='CustomerID')
        
        cohort_data['YearMonth_Year'] = pd.to_datetime(cohort_data['YearMonth']).dt.year
        cohort_data['YearMonth_Month'] = pd.to_datetime(cohort_data['YearMonth']).dt.month
        cohort_data['CohortMonth_Year'] = pd.to_datetime(cohort_data['CohortMonth']).dt.year
        cohort_data['CohortMonth_Month'] = pd.to_datetime(cohort_data['CohortMonth']).dt.month
        
        cohort_data['YearMonth_Int'] = (cohort_data['YearMonth_Year'] * 12 + cohort_data['YearMonth_Month']).astype(int)
        cohort_data['CohortMonth_Int'] = (cohort_data['CohortMonth_Year'] * 12 + cohort_data['CohortMonth_Month']).astype(int)
        cohort_data['CohortIndex'] = (cohort_data['YearMonth_Int'] - cohort_data['CohortMonth_Int']).astype(int)
        
        retention_table = pd.pivot_table(
            cohort_data,
            values='CustomerID',
            index='CohortMonth',
            columns='CohortIndex',
            aggfunc='nunique'
        ).fillna(0)
        
        if retention_table.empty:
            return {
                "retention_data": [],
                "recommendation": "Insufficient data for retention analysis."
            }
        
        cohort_sizes = retention_table[0]
        retention_rates = retention_table.div(cohort_sizes, axis=0).round(2)
        
        if retention_rates.shape[1] > 1:
            avg_retention = retention_rates.iloc[:, 1:].mean().mean()
        else:
            avg_retention = 0
        
        if avg_retention < 0.3:
            recommendation = 'Low retention rate of {:.1%}; focus on loyalty programs and customer engagement.'.format(avg_retention)
        elif avg_retention < 0.6:
            recommendation = 'Moderate retention rate of {:.1%}; enhance customer engagement with personalized offers.'.format(avg_retention)
        else:
            recommendation = 'High retention rate of {:.1%}; maintain current strategies and consider referral programs.'.format(avg_retention)
        
        retention_data = []
        for cohort in retention_rates.index:
            row = {'cohort': str(cohort)}
            for i in retention_rates.columns:
                if i in retention_rates.loc[cohort]:
                    row[f'month_{i}'] = float(retention_rates.loc[cohort, i])
                else:
                    row[f'month_{i}'] = 0.0
            retention_data.append(row)
        
        return {
            "retention_data": retention_data,
            "avg_retention": float(avg_retention),
            "recommendation": recommendation
        }
    except Exception as e:
        logger.error(f"Error in retention_rate: {e}")
        raise