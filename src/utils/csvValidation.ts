const REQUIRED_COLUMNS = [
  'Ticker',
  'Purchase_Price',
  'Quantity',
];

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateCSVStructure = (data: any[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (data.length === 0) {
    errors.push('CSV file is empty');
    return { isValid: false, errors, warnings };
  }

  // Check for required columns
  const firstRow = data[0];
  const columns = Object.keys(firstRow);
  
  const missingColumns = REQUIRED_COLUMNS.filter(col => !columns.includes(col));
  if (missingColumns.length > 0) {
    errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
  }

  // Validate each row
  data.forEach((row, index) => {
    const rowNum = index + 2; // +2 because of header and 0-indexing

    // Validate Ticker
    if (!row.Ticker || row.Ticker.toString().trim() === '') {
      errors.push(`Row ${rowNum}: Ticker is required`);
    }

    // Validate Purchase_Price
    const purchasePrice = parseFloat(row.Purchase_Price);
    if (isNaN(purchasePrice) || purchasePrice <= 0) {
      errors.push(`Row ${rowNum}: Purchase_Price must be a positive number`);
    }

    // Validate Quantity (allow decimals for crypto)
    const quantity = parseFloat(row.Quantity);
    if (isNaN(quantity) || quantity <= 0) {
      errors.push(`Row ${rowNum}: Quantity must be a positive number`);
    }

    // Warnings for data quality
    if (quantity > 10000) {
      warnings.push(`Row ${rowNum}: Very large quantity (${quantity} shares)`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const generateSampleCSV = (): string => {
  const header = REQUIRED_COLUMNS.join(',');
  
  // 60 diversified stocks, 25 ETFs, 15 crypto assets
  const assets = [
    // Technology Stocks (12)
    'AAPL,150.50,100', 'MSFT,330.25,50', 'GOOGL,140.75,75', 'META,350.00,30', 'NVDA,450.00,25',
    'AMD,120.50,40', 'INTC,45.25,100', 'AVGO,850.00,10', 'CSCO,52.75,80', 'ORCL,105.50,60',
    'ADBE,480.25,20', 'CRM,220.50,35',
    
    // Healthcare Stocks (10)
    'JNJ,160.50,50', 'UNH,480.25,20', 'PFE,32.75,150', 'ABBV,155.50,40', 'TMO,520.00,18',
    'ABT,105.25,55', 'DHR,240.50,28', 'LLY,550.75,15', 'BMY,65.25,85', 'AMGN,280.50,25',
    
    // Financials Stocks (10)
    'JPM,145.50,45', 'BAC,32.75,180', 'WFC,42.50,140', 'C,48.25,120', 'GS,385.50,18',
    'MS,88.75,65', 'BLK,720.50,10', 'SCHW,68.25,85', 'AXP,175.50,38', 'USB,42.75,135',
    
    // Consumer Discretionary Stocks (8)
    'AMZN,145.25,40', 'TSLA,245.50,25', 'HD,325.75,20', 'MCD,280.50,22', 'NKE,105.25,55',
    'SBUX,95.50,62', 'TGT,145.75,42', 'LOW,225.50,28',
    
    // Consumer Staples Stocks (6)
    'PG,145.50,42', 'KO,58.75,105', 'PEP,168.25,38', 'WMT,52.50,115', 'COST,580.75,12',
    'MDLZ,72.25,82',
    
    // Energy Stocks (5)
    'XOM,105.50,55', 'CVX,152.25,40', 'COP,118.75,48', 'SLB,58.50,102', 'EOG,125.25,45',
    
    // Industrials Stocks (6)
    'BA,185.50,32', 'CAT,285.75,22', 'GE,108.25,55', 'MMM,95.50,62', 'HON,195.75,32',
    'UPS,165.50,38',
    
    // Materials Stocks (3)
    'LIN,385.50,18', 'APD,285.75,22', 'ECL,185.25,32',
    
    // ETFs - Broad Market (8)
    'SPY,420.50,25', 'QQQ,365.75,30', 'IWM,185.25,50', 'DIA,345.50,28',
    'VTI,225.75,40', 'VOO,395.25,22', 'VEA,48.50,200', 'VWO,42.75,220',
    
    // ETFs - Sector Specific (8)
    'XLK,175.50,55', 'XLF,38.25,250', 'XLE,85.75,110', 'XLV,135.50,70',
    'XLI,105.25,90', 'XLY,165.75,58', 'XLP,75.50,125', 'XLU,68.25,140',
    
    // ETFs - Bond & Fixed Income (4)
    'AGG,105.25,90', 'BND,78.50,120', 'TLT,95.75,100', 'LQD,115.25,82',
    
    // ETFs - International & Emerging (3)
    'EFA,72.50,130', 'EEM,42.75,220', 'IEMG,52.25,180',
    
    // ETFs - Thematic (2)
    'ARKK,48.75,195', 'ICLN,22.50,420',
    
    // Cryptocurrency (15)
    'BTC-USD,42500.00,0.5', 'ETH-USD,2800.00,2', 'BNB-USD,325.50,10', 'XRP-USD,0.58,5000',
    'ADA-USD,0.45,8000', 'SOL-USD,98.75,25', 'DOT-USD,6.25,400', 'DOGE-USD,0.08,20000',
    'MATIC-USD,0.85,3500', 'AVAX-USD,35.50,80', 'LINK-USD,14.75,200', 'UNI-USD,6.50,450',
    'LTC-USD,85.25,35', 'ATOM-USD,9.75,300', 'XLM-USD,0.12,15000'
  ];
  
  return [header, ...assets].join('\n');
};
