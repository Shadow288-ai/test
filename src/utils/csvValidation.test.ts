import { describe, it, expect } from "vitest";
import { validateCSVStructure } from "@/utils/csvValidation";

describe("validateCSVStructure", () => {
  it("fails on empty CSV data", () => {
    const result = validateCSVStructure([]);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("CSV file is empty"); // :contentReference[oaicite:8]{index=8}
  });

  it("detects missing required columns", () => {
    const result = validateCSVStructure([{ Ticker: "AAPL", Quantity: "10" }]); // missing Purchase_Price
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("Missing required columns"))).toBe(true);
    // REQUIRED_COLUMNS: Ticker, Purchase_Price, Quantity :contentReference[oaicite:9]{index=9}
  });

  it("validates each row and includes correct row numbers (header = row 1)", () => {
    const data = [
      { Ticker: "", Purchase_Price: "100", Quantity: "2" },     // rowNum = 2
      { Ticker: "MSFT", Purchase_Price: "-5", Quantity: "2" },  // rowNum = 3
      { Ticker: "GOOGL", Purchase_Price: "10", Quantity: "0" }, // rowNum = 4
    ];

    const result = validateCSVStructure(data);
    expect(result.isValid).toBe(false);

    expect(result.errors).toContain("Row 2: Ticker is required");
    expect(result.errors).toContain("Row 3: Purchase_Price must be a positive number");
    expect(result.errors).toContain("Row 4: Quantity must be a positive number");
  });

  it("adds a warning for very large quantity", () => {
    const data = [{ Ticker: "AAPL", Purchase_Price: "100", Quantity: "10001" }];
    const result = validateCSVStructure(data);

    expect(result.warnings.some((w) => w.includes("Very large quantity"))).toBe(true); // :contentReference[oaicite:10]{index=10}
  });
});
