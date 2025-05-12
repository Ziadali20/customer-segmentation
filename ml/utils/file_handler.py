import logging
import os
import pandas as pd
import chardet
from utils.data_cleaning import map_headers_dynamic

# Configure logging
logger = logging.getLogger(__name__)

UPLOAD_FOLDER = "Uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def detect_encoding(file_path, sample_size=100_000):
    try:
        with open(file_path, "rb") as f:
            raw_data = f.read(sample_size)
        result = chardet.detect(raw_data)
        encoding = result["encoding"] if result["encoding"] else "utf-8"
        if encoding.lower() in ["ascii", "unknown", None]:
            encoding = "latin1"
        return encoding
    except Exception as e:
        logger.error(f"Error detecting encoding: {e}")
        raise ValueError("Failed to detect file encoding")

def load_and_clean_file(request):
    try:
        if 'file' not in request.files:
            raise ValueError("No file uploaded")
        
        file = request.files['file']
        if file.filename == '':
            raise ValueError("No file selected")
        
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        
        encoding = detect_encoding(file_path)
        
        # Load CSV without assuming column names
        try:
            df = pd.read_csv(
                file_path,
                encoding=encoding,
                dtype=str,
                parse_dates=['InvoiceDate', 'InvDate', 'OrderDate', 'PurchaseDate'],
                on_bad_lines='skip'
            )
        except Exception as e:
            logger.error(f"CSV parsing failed with standard format: {e}")
            df = pd.read_csv(
                file_path,
                encoding=encoding,
                dtype=str,
                on_bad_lines='skip'
            )
        
        logger.info(f"Original columns: {df.columns.tolist()}")
        logger.info(f"First 5 rows:\n{df.head().to_string()}")
        logger.info(f"Initial data types:\n{df.dtypes}")
        
        # Dynamically map headers
        header_mapping = map_headers_dynamic(df.columns)
        df.columns = [header_mapping.get(col, col) for col in df.columns]
        logger.info(f"Columns after mapping: {df.columns.tolist()}")
        
        # Check for required columns after mapping
        required_columns = ['InvoiceNo', 'StockCode', 'Description', 'Quantity', 'InvoiceDate', 'UnitPrice']
        required_id_columns = ['CustomerID', 'Customer Name']
        
        has_customer_id = any(col in df.columns for col in required_id_columns)
        if not has_customer_id:
            raise ValueError(f"CSV file must contain at least one customer identifier column: {', '.join(required_id_columns)}")
        
        if not all(col in df.columns for col in required_columns):
            missing_cols = [col for col in required_columns if col not in df.columns]
            raise ValueError(f"CSV file missing columns after mapping: {', '.join(missing_cols)}")
        
        # Proceed with cleaning
        if 'CustomerID' not in df.columns and 'Customer Name' in df.columns:
            df['CustomerID'] = df['Customer Name']
            logger.info("Using 'Customer Name' as 'CustomerID'")
        
        df['CustomerID'] = df['CustomerID'].astype(str)
        
        if 'Country' not in df.columns:
            df['Country'] = 'Unknown'
            logger.info("Added default 'Country' column")
        
        df = df.dropna(subset=['InvoiceNo', 'Quantity', 'UnitPrice', 'InvoiceDate'])
        
        df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'], errors='coerce')
        invalid_dates = df['InvoiceDate'].isna().sum()
        if invalid_dates > 0:
            logger.warning(f"Dropping {invalid_dates} rows with invalid InvoiceDate")
            df = df.dropna(subset=['InvoiceDate'])
        
        for col in ['Quantity', 'UnitPrice']:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            invalid_nums = df[col].isna().sum()
            if invalid_nums > 0:
                logger.warning(f"Dropping {invalid_nums} rows with invalid {col}")
                df = df.dropna(subset=[col])
        
        df['TotalPrice'] = df['Quantity'] * df['UnitPrice']
        
        if df.empty:
            raise ValueError("No valid data after cleaning")
        
        logger.info(f"Final data types:\n{df.dtypes}")
        logger.info(f"Final columns: {df.columns.tolist()}")
        
        return df
    except Exception as e:
        logger.error(f"Error in load_and_clean_file: {e}")
        raise