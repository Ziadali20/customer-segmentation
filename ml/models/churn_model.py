import logging
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix

# Configure logging
logger = logging.getLogger(__name__)

def train_churn_model(rfm, df):
    try:
        last_purchase = df.groupby('CustomerID')['InvoiceDate'].max()
        today_date = pd.to_datetime(df['InvoiceDate'].max()) + pd.Timedelta(days=1)
        rfm['Days_Since_Last_Purchase'] = rfm.index.map(lambda x: (today_date - pd.to_datetime(last_purchase[x])).days)
        rfm['Churn'] = (rfm['Days_Since_Last_Purchase'] > 90).astype(int)
        
        X = rfm[['Recency', 'Frequency', 'Monetary', 'Days_Since_Last_Purchase']]
        y = rfm['Churn']
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
        logger.error(f"Error in train_churn_model: {e}")
        raise