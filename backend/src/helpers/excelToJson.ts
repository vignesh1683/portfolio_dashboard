import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";

const INPUT_FILE = path.join(__dirname, "../data/E555815F_58D029050B.xlsx");
const OUTPUT_FILE = path.join(__dirname, "../data/holdings.json");

// Load workbook
const workbook = XLSX.readFile(INPUT_FILE);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

// Convert to JSON
const rows: any[] = XLSX.utils.sheet_to_json(worksheet, {
  defval: "",
});

interface Holding {
  no: number;
  particulars: string; 
  symbol: string;
  purchasePrice: number;
  qty: number;
  investment: number;
  portfolioPercent: string | number;
  cmp: number;
  presentValue: number;
  gainLoss: number;
  gainLossPercent: string | number;
  marketCap: number;
  peRatio: number;
  latestEarnings: number;
  
  // Core Fundamentals
  revenueTTM: number;
  ebitdaTTM: number;
  ebitdaPercent: string | number;
  pat: number;
  patPercent: string | number;
  cfoMarch24: number;
  cfo5Years: number;
  freeCashFlow: number;
  debtToEquity: number;
  bookValue: number;

  // Growth (3 Years)
  revenueGrowth: string | number;
  ebitdaGrowth: string | number;
  profitGrowth: string | number;
  
  // Valuation & Others
  marketCap2: number; 
  priceToSales: number;
  cfoToEbitda: string | number;
  cfoToPat: string | number;
  priceToBook: number;
  stage2: string;
  salePrice: number;
  abhishek: string;
}

interface Sector {
  sectorName: string;
  investment: number;
  presentValue: number;
  gainLoss: number;
  gainLossPercent: string | number;
  portfolioPercent: number;
  holdings: Holding[];
}

interface Portfolio {
  grandTotal: {
    investment: number;
    presentValue: number;
    gainLoss: number;
    gainLossPercent: string | number;
    portfolioPercent: number;
    totalSalePrice?: number; 
  };
  sectors: Sector[];
}

// --- Logic ---

const portfolioData: Portfolio = {
  grandTotal: {
    investment: 0,
    presentValue: 0,
    gainLoss: 0,
    gainLossPercent: 0,
    portfolioPercent: 0,
  },
  sectors: [],
};

let currentSector: Sector | null = null;

// Helpers
const num = (val: any) => (val === "" || val === undefined ? 0 : Number(val));
const str = (val: any) => (val === undefined ? "" : String(val).trim());

for (const row of rows) {
  const colNo = row.__EMPTY;      
  const colName = row.__EMPTY_1;  
  const colInv = row.__EMPTY_4;   
  
  // 1. DETECT HOLDING (Child)
  // Has a Number in 'No' column AND has a Name
  if (typeof colNo === "number" && str(colName)) {
    const holding: Holding = {
      no: num(row.__EMPTY),
      particulars: str(row.__EMPTY_1),
      symbol: str(row.__EMPTY_6).toUpperCase(),
      purchasePrice: num(row.__EMPTY_2),
      qty: num(row.__EMPTY_3),
      investment: num(row.__EMPTY_4),
      portfolioPercent: row.__EMPTY_5 * 100,
      cmp: num(row.__EMPTY_7),
      presentValue: num(row.__EMPTY_8),
      gainLoss: num(row.__EMPTY_9),
      gainLossPercent: row.__EMPTY_10 * 100,
      marketCap: num(row.__EMPTY_11),
      peRatio: num(row.__EMPTY_12),
      latestEarnings: num(row.__EMPTY_13),

      // Mapping based on "Core Fundamentals" header spanning
      revenueTTM: num(row["Core Fundamentals"]), 
      ebitdaTTM: num(row.__EMPTY_14),
      ebitdaPercent: row.__EMPTY_15,
      pat: num(row.__EMPTY_16),
      patPercent: row.__EMPTY_17,
      cfoMarch24: num(row.__EMPTY_18),
      cfo5Years: num(row.__EMPTY_19),
      freeCashFlow: num(row.__EMPTY_20),
      debtToEquity: num(row.__EMPTY_21),
      bookValue: num(row.__EMPTY_22),

      // Mapping based on "Growth" header spanning
      revenueGrowth: row["Growth (3 years"], 
      ebitdaGrowth: row.__EMPTY_23,
      profitGrowth: row.__EMPTY_24,

      marketCap2: num(row.__EMPTY_25),
      priceToSales: num(row.__EMPTY_26),
      cfoToEbitda: row.__EMPTY_27,
      cfoToPat: row.__EMPTY_28,
      priceToBook: num(row.__EMPTY_29),
      stage2: str(row.__EMPTY_30),
      salePrice: num(row.__EMPTY_31),
      abhishek: str(row.__EMPTY_32),
    };

    if (currentSector) {
      currentSector.holdings.push(holding);
    } else {
      // Create a dummy sector if one doesn't exist yet
      currentSector = {
        sectorName: "Uncategorized",
        investment: 0, presentValue: 0, gainLoss: 0, gainLossPercent: 0, portfolioPercent: 0,
        holdings: [holding]
      };
      portfolioData.sectors.push(currentSector);
    }
    continue;
  }

  // 2. DETECT SECTOR (Parent)
  // 'No' is empty, 'Particulars' has text, 'Investment' has value
  if (
    (colNo === "" || colNo === undefined) &&
    str(colName) &&
    colName !== "Particulars" &&
    !colName.includes("Market Cap")
  ) {
    // Determine if this is a valid data row by checking if it has Investment numbers
    // (Some header rows might have text but no numbers)
    if (num(colInv) > 0 || num(row.__EMPTY_9) !== 0) {
      currentSector = {
        sectorName: str(colName),
        investment: num(colInv),
        portfolioPercent: num(row.__EMPTY_5) * 100,
        presentValue: num(row.__EMPTY_8),
        gainLoss: num(row.__EMPTY_9),
        gainLossPercent: row.__EMPTY_10 * 100,
        holdings: [],
      };
      portfolioData.sectors.push(currentSector);
    }
    continue;
  }

  // 3. DETECT GRAND TOTAL
  // 'No' is empty, 'Particulars' is empty, 'Investment' has large value
  if (
    (colNo === "" || colNo === undefined) &&
    !str(colName) &&
    num(colInv) > 0
  ) {
    portfolioData.grandTotal = {
      investment: num(colInv),
      portfolioPercent: num(row.__EMPTY_5) * 100, 
      presentValue: num(row.__EMPTY_8),
      gainLoss: num(row.__EMPTY_9),
      gainLossPercent: row.__EMPTY_10 * 100,
    };
    continue;
  }
  
  // 4. DETECT REALIZED P&L (Bottom rows)
  // 'Sale price' (Column 31/33 depending on mapping) has value but main cols empty
  if(num(row.__EMPTY_33) !== 0) {
     // If you want to capture the specific "Sale price" total at the bottom
     portfolioData.grandTotal.totalSalePrice = num(row.__EMPTY_33);
  }
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(portfolioData, null, 2));

// Console Summary
console.log("Transformation Complete.");
console.log(`Grand Total Investment: ${portfolioData.grandTotal.investment}`);
console.log(`Total Sectors: ${portfolioData.sectors.length}`);
portfolioData.sectors.forEach(s => {
    console.log(` - ${s.sectorName}: ${s.holdings.length} holdings`);
});