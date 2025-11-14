import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

export default function Help() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help & Documentation</h1>
        <p className="text-muted-foreground mt-1">
          Guide to using the RiskTwo dashboard and understanding risk scoring methodology
        </p>
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Quick Start</AlertTitle>
        <AlertDescription>
          Upload a CSV file with your client portfolio data to automatically calculate risk scores
          and generate comprehensive reports.
        </AlertDescription>
      </Alert>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Risk Scoring Methodology</CardTitle>
          <CardDescription>
            Understanding how client portfolios are assessed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Risk Score Components (0-100 scale)</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="font-medium text-primary min-w-32">Volatility (40pts):</span>
                <span className="text-muted-foreground">
                  Average portfolio volatility weighted by position size. Higher volatility indicates
                  greater price fluctuation risk.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-primary min-w-32">Sector Concentration (30pts):</span>
                <span className="text-muted-foreground">
                  Measured using Herfindahl index. High concentration in few sectors increases
                  sector-specific risk exposure.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-primary min-w-32">Geographic Concentration (30pts):</span>
                <span className="text-muted-foreground">
                  Regional diversification assessment. Concentrated geographic exposure increases
                  country/region-specific risk.
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Risk Tier Classifications</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-success text-success-foreground text-xs font-medium">
                  Low Risk
                </span>
                <span className="text-muted-foreground">Score 0-39: Well-diversified portfolio</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-warning text-warning-foreground text-xs font-medium">
                  Medium Risk
                </span>
                <span className="text-muted-foreground">Score 40-69: Moderate risk exposure</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-destructive text-destructive-foreground text-xs font-medium">
                  High Risk
                </span>
                <span className="text-muted-foreground">Score 70-100: Elevated risk requiring attention</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What CSV format is required?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Your CSV must include these columns in any order:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Client_ID (unique identifier)</li>
                  <li>Stock_Ticker, Stock_Name</li>
                  <li>Sector, Region</li>
                  <li>Shares, Market_Value, Volatility</li>
                  <li>Acquisition_Date (YYYY-MM-DD format)</li>
                  <li>Cost_Basis, Portfolio_Weight</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">
                  Download the sample template from the Upload page to see the exact format.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>How is risk score calculated?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">
                  Risk scores are calculated using a rule-based algorithm that evaluates three key factors:
                  portfolio volatility (40 points), sector concentration (30 points), and geographic
                  concentration (30 points). Each factor is assessed against predefined thresholds to
                  determine its contribution to the total risk score (0-100 scale).
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>Can I export filtered reports?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">
                  Yes! On the Reports page, you can export all client data or filter by risk level
                  (Low, Medium, High) to focus on specific client segments. All exports include
                  comprehensive risk metrics and portfolio characteristics.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>What does high sector concentration mean?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">
                  Sector concentration measures how much of a portfolio is invested in specific
                  industry sectors. High concentration (e.g., 70% in Technology) increases risk because
                  sector-specific events can significantly impact the entire portfolio. Diversification
                  across multiple sectors typically reduces this risk.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>How often should I update portfolio data?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">
                  For compliance purposes, we recommend updating portfolio data at least monthly or
                  whenever significant portfolio changes occur. More frequent updates provide better
                  real-time risk monitoring and early detection of emerging risks.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>User Workflow</CardTitle>
          <CardDescription>Step-by-step guide to using RiskTwo</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                1
              </span>
              <div>
                <p className="font-medium">Download Sample Template</p>
                <p className="text-muted-foreground">
                  Get the CSV template from the Upload page to understand required format
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                2
              </span>
              <div>
                <p className="font-medium">Prepare Your Data</p>
                <p className="text-muted-foreground">
                  Format your client portfolio data according to the template specifications
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                3
              </span>
              <div>
                <p className="font-medium">Upload CSV File</p>
                <p className="text-muted-foreground">
                  Drag and drop or select your CSV file on the Upload page
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                4
              </span>
              <div>
                <p className="font-medium">Review Dashboard</p>
                <p className="text-muted-foreground">
                  View risk distribution, top risk clients, and overall portfolio metrics
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                5
              </span>
              <div>
                <p className="font-medium">Generate Reports</p>
                <p className="text-muted-foreground">
                  Export detailed risk assessment reports for compliance and monitoring
                </p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
