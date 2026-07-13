# Dashboard Feature - Quick Start Guide

## How to Test the Dashboard Feature

### Step 1: Start the Backend
```bash
cd backend
npm install  # if not already installed
npm start
# Server will run on http://localhost:5000
```

### Step 2: Start the Frontend (in another terminal)
```bash
cd frontend
npm install  # if not already installed
npm run dev
# Frontend will run on http://localhost:5173
```

### Step 3: Test Dashboard Mode

1. **Open the application** at http://localhost:5173
2. **Upload a dataset** (CSV or Excel file)
   - Try with sample files from `backend/uploads/` folder
   - Works with: Sales, Movies, Grocery, Finance, HR, Orders, or any dataset

3. **Trigger Dashboard Mode** - Leave the question field EMPTY and click "Analyze"
   - OR use any of these trigger phrases:
     - "Analyze"
     - "Analyze data"
     - "Show dashboard"
     - "Generate dashboard"
     - "Dashboard"

4. **Observe the Dashboard**
   - You should see:
     - Multiple charts (4-8 depending on dataset type)
     - KPI metric cards
     - Data quality section
     - Insights and recommendations
     - Suggested next questions

### Step 4: Test Single-Chart Mode (Existing Feature)

Enter a specific query like:
- "Top 10 products"
- "Revenue by region"
- "Which category has highest sales"
- "Show me the trend"

You should see a single focused chart (existing behavior unchanged).

---

## What Gets Computed

### For Sales Datasets:
- Revenue Trend (Line chart)
- Sales by Region (Bar chart)
- Category Distribution (Pie chart)
- Top Products (Bar chart)

### For Movie Datasets:
- Genre Distribution (Pie chart)
- Release Year Distribution (Line chart)
- Rating Distribution (Bar chart)
- Country Distribution (Bar chart)

### For Grocery Datasets:
- Spending by Category (Pie chart)
- Top Items by Spend (Bar chart)
- Category Trends (Line chart)
- Item Distribution (Bar chart)

### For Finance Datasets:
- Monthly Expenses (Line chart)
- Expense Distribution (Pie chart)
- Category Analysis (Bar chart)

---

## Understanding the Response

### Dashboard Mode Response
```javascript
{
  dashboardMode: true,          // Indicates dashboard rendering
  domain: "Sales",              // Detected data domain
  datasetType: "...",           // Full dataset description
  charts: [                      // 4-8 charts with computed data
    {
      chartType: "bar|line|pie|area|scatter",
      reason: "Chart title/reason",
      xAxis: "column name",
      yAxis: "column name",
      chartData: [               // ⭐ ACTUAL COMPUTED DATA
        { name: "value", value: 12345 },
        // ... more data points
      ]
    }
  ],
  kpis: {                        // Key Performance Indicators
    cards: [
      { label: "KPI Name", value: "123", trend: "up|down|stable" }
    ]
  },
  insights: {                    // AI-generated insights
    insights: [
      "Insight text...",
      "Another insight..."
    ]
  },
  recommendations: {             // Business recommendations
    recommendations: [
      "Recommendation text..."
    ]
  },
  questions: {                   // Suggested next questions
    questions: [
      "Question text?"
    ]
  },
  summary: { /* ... */ },        // Dataset summary
  quality: { /* ... */ },        // Data quality metrics
  consumptionReport: null,       // For grocery datasets
  recommendationReport: null     // For grocery datasets
}
```

### Single-Chart Mode Response
```javascript
{
  dashboardMode: false,          // Indicates single-chart rendering
  chartType: "bar|line|pie|...",
  chartData: [ /* computed data */ ],
  insights: "Text insights",
  // ... other fields
}
```

---

## Debugging

### Check if Dashboard Mode is Triggered
1. Open browser DevTools → Network tab
2. Submit empty query
3. Look at API response JSON
4. Check if `"dashboardMode": true` is present

### Check Chart Data
1. In the response, each chart should have `chartData` array
2. Data should have `{name, value}` format (or `{x, y}` for scatter)
3. Charts should not be empty

### Common Issues

**Issue**: Charts show "No chart yet"
- **Cause**: chartData is empty or not computed
- **Solution**: Check console for errors, verify dataset format

**Issue**: Dashboard not triggered
- **Cause**: Query text is not recognized as empty/vague
- **Trigger Phrases**: Try "Analyze", "Dashboard", or leave field completely empty

**Issue**: Wrong charts for dataset
- **Cause**: Domain detection may have failed
- **Check**: Look at the `domain` field in response
- **Solution**: Check dataset has relevant columns for detection

---

## Module Structure

```
backend/src/
├── services/
│   └── ai.service.js                 # Orchestrates dashboard vs single-chart
├── ai/
│   ├── modules/
│   │   ├── dashboardGenerator.js     # Generates dashboard structure
│   │   ├── dashboardDataCompute.js   # ⭐ Computes chart data (NEW)
│   │   ├── queryClassifier.js        # Detects dashboard trigger
│   │   ├── datasetIntelligenceAgent.js # Domain detection
│   │   └── datasetAnalyzer.js        # Dataset statistics
│   ├── agents/
│   │   └── aiAgent.js                # Single-chart analysis (unchanged)
│   └── tests/
│       ├── dashboardComplete.test.js
│       ├── endToEndDashboard.test.js
│       └── dashboardIntegration.test.js

frontend/src/
├── pages/
│   └── Dashboard.jsx                 # Conditional rendering (modified)
├── components/
│   ├── dashboard/
│   │   └── DashboardGrid.jsx         # ⭐ Renders full dashboard (NEW)
│   └── results/
│       └── ChartRenderer.jsx         # Renders individual charts
```

---

## Test Datasets

Use these from `backend/uploads/`:
- `realistic_grocery_bills_150.csv` - Grocery dataset
- `netflix_titles.csv` - Movie dataset
- `Orders.csv` - Sales/Order dataset

Or upload your own CSV files.

---

## Expected Performance

- **Dashboard generation**: < 500ms
- **Chart data computation**: < 200ms per chart
- **Total response time**: < 1 second for most datasets
- **Supported dataset size**: Up to 100,000 rows

---

## Success Checklist

✅ Empty query shows 4-8 charts  
✅ Each chart displays data points  
✅ KPI cards show values  
✅ Insights are domain-specific  
✅ Recommendations are relevant  
✅ Specific queries still show one chart  
✅ Grocery analysis works (if applicable)  
✅ Frontend build has no errors  
✅ All tests pass  

If all checkboxes pass, the feature is working correctly!

---

## Support

For issues or questions:
1. Check `DASHBOARD_IMPLEMENTATION_SUMMARY.md` for detailed architecture
2. Review test files in `backend/src/ai/tests/`
3. Check browser console for error messages
4. Verify dataset format (CSV with column headers)
