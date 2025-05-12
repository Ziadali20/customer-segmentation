import logging
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix

# Configure logging
logger = logging.getLogger(__name__)

def train_repurchase_model(rfm, df):
    try:
        max_date = pd.to_datetime(df['InvoiceDate'].max())
        cutoff_date = max_date - pd.Timedelta(days=90)
        future_purchases = df[pd.to_datetime(df['InvoiceDate']) > cutoff_date].groupby('CustomerID')['InvoiceNo'].nunique()
        rfm['Purchased_Again'] = rfm.index.isin(future_purchases.index).astype(int)
        
        if rfm['Purchased_Again'].sum() == 0:
            logger.warning("No future purchases found for training. Using synthetic labels.")
            rfm['Purchased_Again'] = np.random.choice([0, 1], size=len(rfm), p=[0.7, 0.3])
        
        X = rfm[['Recency', 'Frequency', 'Monetary']]
        y = rfm['Purchased_Again']
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
        model = RandomForestClassifier(random_state=42)
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        conf_matrix = confusion_matrix(y_test, y_pred)
        class_report = classification_report(y_test, y_pred, output_dict=True)
        return model, scaler, conf_matrix, class_report
    except Exception as e:
        logger.error(f"Error in train_repurchase_model: {e}")
        raise