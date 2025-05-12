import logging
from fuzzywuzzy import fuzz, process

# Configure logging
logger = logging.getLogger(__name__)

# Header mapping to standardize column names
HEADER_MAPPING = {
    'Customer Name': ['Customer Name', 'CustName', 'Customer', 'ClientName'],
    'InvoiceNo': ['InvoiceNo', 'InvNum', 'InvoiceNumber', 'OrderNo'],
    'StockCode': ['StockCode', 'StCode', 'ProductCode', 'ItemCode'],
    'Description': ['Description', 'Desc', 'ProductDescription', 'ItemDesc'],
    'Quantity': ['Quantity', 'Quant', 'Qty', 'Amount'],
    'InvoiceDate': ['InvoiceDate', 'InvDate', 'OrderDate', 'PurchaseDate'],
    'UnitPrice': ['UnitPrice', 'UnitPrive', 'Price', 'UnitCost'],
    'CustomerID': ['CustomerID', 'CustId', 'ClientID', 'CustomerNo'],
    'Country': ['Country', 'Cntry', 'Location', 'Region'],
    'Email': ['Email', 'EmaiCust', 'CustomerEmail', 'EmailAddress']
}

# Standard column names expected by the application
STANDARD_COLUMNS = [
    'Customer Name', 'InvoiceNo', 'StockCode', 'Description', 
    'Quantity', 'InvoiceDate', 'UnitPrice', 'CustomerID', 
    'Country', 'Email'
]

# Fallback mapping for common aliases to speed up matching
FALLBACK_MAPPING = {
    'Customer Name': ['CustName', 'Customer', 'ClientName'],
    'InvoiceNo': ['InvNum', 'InvoiceNumber', 'OrderNo'],
    'StockCode': ['StCode', 'ProductCode', 'ItemCode'],
    'Description': ['Desc', 'ProductDescription', 'ItemDesc'],
    'Quantity': ['Quant', 'Qty', 'Amount'],
    'InvoiceDate': ['InvDate', 'OrderDate', 'PurchaseDate'],
    'UnitPrice': ['UnitPrive', 'Price', 'UnitCost'],
    'CustomerID': ['CustId', 'ClientID', 'CustomerNo'],
    'Country': ['Cntry', 'Location', 'Region'],
    'Email': ['EmaiCust', 'CustomerEmail', 'EmailAddress']
}

def map_headers_dynamic(columns, standard_columns=STANDARD_COLUMNS, threshold=80):
    """
    Dynamically map DataFrame columns to standard columns using fuzzy matching.
    
    Args:
        columns: List of DataFrame column names
        standard_columns: List of expected standard column names
        threshold: Minimum fuzzy matching score (0-100) to consider a match
    
    Returns:
        Dictionary mapping original column names to standard column names
    """
    logger.info(f"Mapping columns: {columns}")
    mapping = {}
    
    # First, try exact matches or fallback mapping
    reverse_fallback = {}
    for std_col, aliases in FALLBACK_MAPPING.items():
        reverse_fallback[std_col.lower()] = std_col
        for alias in aliases:
            reverse_fallback[alias.lower()] = std_col
    
    for col in columns:
        col_lower = col.lower()
        if col in standard_columns:
            mapping[col] = col
        elif col_lower in reverse_fallback:
            mapping[col] = reverse_fallback[col_lower]
    
    # For unmapped columns, use fuzzy matching
    unmapped_cols = [col for col in columns if col not in mapping]
    for col in unmapped_cols:
        # Find the best match among standard columns
        best_match, score = process.extractOne(
            col, standard_columns, scorer=fuzz.token_sort_ratio
        )
        if score >= threshold:
            mapping[col] = best_match
            logger.info(f"Mapped '{col}' to '{best_match}' with score {score}")
        else:
            logger.warning(f"No match for '{col}' (best: '{best_match}', score: {score})")
            mapping[col] = col  # Keep original if no good match
    
    return mapping