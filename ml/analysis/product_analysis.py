import logging
import pandas as pd
import numpy as np
from mlxtend.frequent_patterns import apriori, association_rules
from textblob import TextBlob
import psutil

# Configure logging
logger = logging.getLogger(__name__)

def product_affinity_analysis(df):
    try:
        memory = psutil.virtual_memory()
        logger.info(f"Available memory: {memory.available / (1024**2):.2f} MiB")
        
        df_sample = df.sample(frac=0.005, random_state=42)
        item_counts = df_sample['Description'].value_counts()
        frequent_items = item_counts[item_counts > 5].index
        df_sample = df_sample[df_sample['Description'].isin(frequent_items)]
        
        logger.info(f"Sample size: {len(df_sample)}, Unique items: {len(frequent_items)}")
        
        basket = df_sample.groupby(['InvoiceNo', 'Description'])['Quantity'].sum().unstack(fill_value=0)
        basket = (basket > 0).astype(pd.SparseDtype(bool, fill_value=False))
        
        frequent_itemsets = apriori(basket, min_support=0.005, use_colnames=True, low_memory=True)
        if frequent_itemsets.empty:
            logger.warning("No frequent itemsets found.")
            return []
        
        rules = association_rules(frequent_itemsets, metric="lift", min_threshold=1)
        if rules.empty:
            logger.warning("No association rules found.")
            return []
        
        rules = rules.sort_values('lift', ascending=False).head(10)
        
        # Convert frozenset to string for JSON serialization
        rules['antecedents'] = rules['antecedents'].apply(lambda x: ', '.join(x))
        rules['consequents'] = rules['consequents'].apply(lambda x: ', '.join(x))
        
        rules['recommendation'] = rules.apply(
            lambda x: f"Bundle {x['antecedents']} with {x['consequents']} (Confidence: {x['confidence']:.2f}, Lift: {x['lift']:.2f})",
            axis=1
        )
        
        logger.info(f"Rules after conversion:\n{rules[['antecedents', 'consequents', 'recommendation']].head().to_string()}")
        
        return rules[['antecedents', 'consequents', 'support', 'confidence', 'lift', 'recommendation']].to_dict(orient='records')
    except Exception as e:
        logger.error(f"Error in product_affinity_analysis: {e}")
        raise

def sentiment_analysis(df):
    try:
        df['Sentiment'] = df['Description'].apply(lambda x: TextBlob(str(x)).sentiment.polarity)
        sentiment_summary = df.groupby('Description')['Sentiment'].mean().reset_index()
        
        sentiment_summary['recommendation'] = sentiment_summary['Sentiment'].apply(
            lambda x: 'Highlight in marketing.' if x > 0.2
            else 'Review description for negative tone.' if x < -0.2
            else 'Neutral; monitor customer feedback.'
        )
        
        return sentiment_summary.to_dict(orient='records')
    except Exception as e:
        logger.error(f"Error in sentiment_analysis: {e}")
        raise

def inventory_turnover(df):
    try:
        total_quantity_sold = df[df['Quantity'] > 0].groupby('Description')['Quantity'].sum()
        avg_inventory = df.groupby('Description')['Quantity'].apply(lambda x: x.abs().mean())
        
        if total_quantity_sold.empty or avg_inventory.empty:
            logger.warning("Insufficient data for inventory turnover calculation.")
            return []
        
        common_index = total_quantity_sold.index.intersection(avg_inventory.index)
        if not common_index.empty:
            total_quantity_sold = total_quantity_sold.loc[common_index]
            avg_inventory = avg_inventory.loc[common_index]
        else:
            logger.warning("No common items for turnover calculation.")
            return []
        
        turnover = (total_quantity_sold / avg_inventory).rename('Turnover_Rate')
        turnover = turnover.reset_index()
        
        turnover['recommendation'] = turnover['Turnover_Rate'].apply(
            lambda x: 'Increase stock due to high demand.' if x > turnover['Turnover_Rate'].quantile(0.75)
            else 'Reduce stock to avoid overstocking.' if x < turnover['Turnover_Rate'].quantile(0.25)
            else 'Maintain current stock levels.'
        )
        
        return turnover.to_dict(orient='records')
    except Exception as e:
        logger.error(f"Error in inventory_turnover: {e}")
        raise

def discount_impact_analysis(df):
    try:
        discount_levels = [0, 0.05, 0.1, 0.15, 0.2]
        df['Simulated_Discount'] = np.random.choice(discount_levels, size=len(df), p=[0.5, 0.2, 0.15, 0.1, 0.05])
        df['Discounted_Price'] = df['UnitPrice'] * (1 - df['Simulated_Discount'])
        df['Discounted_TotalPrice'] = df['Quantity'] * df['Discounted_Price']
        discount_impact = df.groupby('Simulated_Discount')['Discounted_TotalPrice'].sum().reset_index()
        
        discount_impact['recommendation'] = discount_impact.apply(
            lambda x: f"Discount of {x['Simulated_Discount']*100:.0f}% yields {x['Discounted_TotalPrice']:.2f}; evaluate demand elasticity.",
            axis=1
        )
        
        return discount_impact.to_dict(orient='records')
    except Exception as e:
        logger.error(f"Error in discount_impact_analysis: {e}")
        raise