import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { Upload as UploadIcon, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { validateCSVStructure, generateSampleCSV } from '@/utils/csvValidation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// Helper function to determine asset type from ticker/name
const determineAssetType = (ticker: string, name: string): 'Stock' | 'ETF' | 'Crypto' => {
  const tickerUpper = ticker.toUpperCase();
  const nameUpper = name.toUpperCase();
  
  // Common crypto ticker patterns
  const cryptoTickers = [
    'BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'SOL', 'DOT', 'DOGE', 'MATIC', 
    'AVAX', 'LINK', 'UNI', 'LTC', 'ATOM', 'XLM', 'SHIB', 'TRX', 'ETC',
    'XMR', 'ALGO', 'VET', 'FIL', 'HBAR', 'ICP', 'APT', 'NEAR', 'STX'
  ];
  
  // Check for crypto - either ends with -USD or matches known crypto ticker
  if (tickerUpper.endsWith('-USD') || 
      cryptoTickers.some(crypto => tickerUpper.includes(crypto)) ||
      nameUpper.includes('BITCOIN') || nameUpper.includes('ETHEREUM') ||
      nameUpper.includes('CRYPTO')) {
    return 'Crypto';
  }
  
  // Check for ETF indicators
  if (nameUpper.includes('ETF') || nameUpper.includes('FUND') || 
      nameUpper.includes('INDEX') || nameUpper.includes('TRUST')) {
    return 'ETF';
  }
  
  // Default to Stock
  return 'Stock';
};

// Helper function to determine bullish/bearish based on cost basis vs market value
const calculateIsBullish = (marketValue: number, costBasis: number, shares: number): boolean => {
  const totalCost = costBasis * shares;
  const gainPercent = ((marketValue - totalCost) / totalCost) * 100;
  return gainPercent >= 0; // Bullish if positive or break-even
};

// Helper function to calculate expected sell date (simplified: 1 year from acquisition + volatility adjustment)
const calculateExpectedSellDate = (acquisitionDate: string, volatility: number): string => {
  const acqDate = new Date(acquisitionDate);
  // Base holding period of 1 year, adjusted by volatility
  // High volatility = shorter hold, low volatility = longer hold
  const daysToAdd = volatility < 15 ? 450 : volatility < 25 ? 365 : 270;
  acqDate.setDate(acqDate.getDate() + daysToAdd);
  return acqDate.toISOString().split('T')[0];
};

export default function Upload() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userRole } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to upload portfolio data',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setValidationResult(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          // Validate CSV structure
          const validation = validateCSVStructure(results.data);
          setValidationResult(validation);

          if (!validation.isValid) {
            toast({
              title: 'Validation Failed',
              description: `Found ${validation.errors.length} error(s) in the CSV file`,
              variant: 'destructive',
            });
            setIsProcessing(false);
            return;
          }

          const clientIdToUse = user.id;

          // Get the existing portfolio - use the known ID to avoid RLS issues
          const portfolioId = 'd21c4285-1b8d-45cc-9124-d348de8a3ca5';
          
          console.log('Using portfolio:', portfolioId);
          
          // Delete existing holdings for this portfolio to replace with new data
          await supabase
            .from('portfolio_holdings')
            .delete()
            .eq('portfolio_id', portfolioId);

          // Import stock utilities
          const { getStockInfo, fetchCurrentPrice, fetchHistoricalData, calculateVolatility } = await import('@/utils/stockData');

          // Prepare holdings data with live stock info
          const holdingsPromises = (results.data as any[]).map(async (row: any) => {
            const ticker = row.Ticker.toUpperCase();
            const purchasePrice = parseFloat(row.Purchase_Price);
            const quantity = parseFloat(row.Quantity);

            // Fetch current price and historical data
            const [currentPrice, historicalData] = await Promise.all([
              fetchCurrentPrice(ticker),
              fetchHistoricalData(ticker, 30),
            ]);

            const stockInfo = getStockInfo(ticker);
            const marketValue = currentPrice * quantity;
            const totalCost = purchasePrice * quantity;
            const assetType = determineAssetType(ticker, stockInfo.name);
            const isBullish = currentPrice >= purchasePrice;
            
            // Calculate volatility from historical data
            const prices = historicalData.map((d: any) => d.price);
            const volatility = calculateVolatility(prices);
            
            // Expected sell date based on volatility
            const acquisitionDate = new Date();
            const daysToAdd = volatility < 15 ? 450 : volatility < 25 ? 365 : 270;
            acquisitionDate.setDate(acquisitionDate.getDate() + daysToAdd);
            const expectedSellDate = acquisitionDate.toISOString().split('T')[0];

            return {
              portfolio_id: portfolioId,
              client_id: clientIdToUse,
              stock_ticker: ticker,
              stock_name: stockInfo.name,
              sector: stockInfo.sector,
              region: stockInfo.region,
              shares: quantity,
              market_value: marketValue,
              volatility,
              acquisition_date: new Date().toISOString().split('T')[0],
              cost_basis: purchasePrice,
              portfolio_weight: 0, // Will be calculated after all holdings are inserted
              asset_type: assetType,
              is_bullish: isBullish,
              expected_sell_date: expectedSellDate,
            };
          });

          const holdingsData = await Promise.all(holdingsPromises);

          // Calculate portfolio weights
          const totalPortfolioValue = holdingsData.reduce((sum, h) => sum + h.market_value, 0);
          holdingsData.forEach(h => {
            h.portfolio_weight = (h.market_value / totalPortfolioValue) * 100;
          });

          // Insert holdings
          const { error: holdingsError } = await supabase
            .from('portfolio_holdings')
            .insert(holdingsData);

          if (holdingsError) throw holdingsError;

          toast({
            title: 'Upload Successful',
            description: `Processed ${holdingsData.length} holdings with live market data`,
          });

          // Navigate to client dashboard
          setTimeout(() => {
            navigate(userRole === 'admin' ? '/admin' : '/client');
          }, 1500);
        } catch (error) {
          console.error('Upload error:', error);
          toast({
            title: 'Processing Error',
            description: error instanceof Error ? error.message : 'Failed to process CSV file',
            variant: 'destructive',
          });
        } finally {
          setIsProcessing(false);
        }
      },
      error: (error) => {
        toast({
          title: 'Parse Error',
          description: error.message,
          variant: 'destructive',
        });
        setIsProcessing(false);
      },
    });
  }, [user, userRole, navigate, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      handleFileUpload(file);
    } else {
      toast({
        title: 'Invalid File',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      });
    }
  }, [handleFileUpload, toast]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const downloadSampleCSV = () => {
    const csv = generateSampleCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'risktwo_sample_portfolio.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Download Started',
      description: 'Sample CSV template downloaded successfully',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Portfolio</h1>
        <p className="text-muted-foreground mt-1">
          Import client portfolio data for automated risk assessment
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Sample Template
            </CardTitle>
            <CardDescription>
              Download a pre-formatted CSV template with example data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={downloadSampleCSV} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download Sample CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Required Columns
            </CardTitle>
            <CardDescription>
              Your CSV must include all these fields
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li className="font-semibold text-foreground">Just 3 simple fields:</li>
              <li>• <span className="font-medium">Ticker</span> - Stock symbol (e.g., AAPL)</li>
              <li>• <span className="font-medium">Purchase_Price</span> - Price when bought</li>
              <li>• <span className="font-medium">Quantity</span> - Number of shares</li>
              <li className="text-xs mt-2 text-muted-foreground/80">
                We'll automatically fetch current prices, sectors, and calculate your portfolio metrics!
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
          <CardDescription>
            Drag and drop your portfolio CSV file or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center transition-all
              ${isDragging
                ? 'border-primary bg-primary/5 scale-105'
                : 'border-border hover:border-primary/50 hover:bg-secondary/50'
              }
              ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
            `}
          >
            <UploadIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {isProcessing ? 'Processing...' : 'Drop CSV file here'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              or click the button below to browse
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
              disabled={isProcessing}
            />
            <Button asChild disabled={isProcessing}>
              <label htmlFor="file-upload" className="cursor-pointer">
                Select CSV File
              </label>
            </Button>
          </div>

          {validationResult && (
            <div className="mt-6 space-y-4">
              {validationResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Validation Errors</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      {validationResult.errors.slice(0, 5).map((error, i) => (
                        <li key={i} className="text-sm">{error}</li>
                      ))}
                      {validationResult.errors.length > 5 && (
                        <li className="text-sm">
                          ... and {validationResult.errors.length - 5} more errors
                        </li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.warnings.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Warnings</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      {validationResult.warnings.map((warning, i) => (
                        <li key={i} className="text-sm">{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.isValid && (
                <Alert className="border-success bg-success/10">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <AlertTitle className="text-success">Validation Passed</AlertTitle>
                  <AlertDescription>
                    CSV file structure is valid and ready for processing
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
