import { useRef } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = [
  "#04342c",
  "#085041",
  "#0f6e56",
  "#1d9e75",
  "#5dcaa5",
  "#9fe1cb",
  "#e1f5ee",
  "#cfcbb8",
];

export const demoTrend = [
  { month: "Jan", revenue: 128000, bills: 420 },
  { month: "Feb", revenue: 146000, bills: 468 },
  { month: "Mar", revenue: 138500, bills: 452 },
  { month: "Apr", revenue: 171000, bills: 521 },
  { month: "May", revenue: 194000, bills: 604 },
  { month: "Jun", revenue: 226000, bills: 688 },
];

export const demoCategories = [
  { category: "Electricity", amount: 13937138 },
  { category: "Invoices", amount: 12882751 },
  { category: "Sales", amount: 11602540 },
  { category: "Operations", amount: 10946174 },
];

export const demoDistribution = [
  { name: "Healthy", value: 48 },
  { name: "Review", value: 26 },
  { name: "Anomaly", value: 16 },
  { name: "Missing", value: 10 },
];

export const demoCorrelation = [
  { hours: 384, amount: 3225 },
  { hours: 488, amount: 3806 },
  { hours: 416, amount: 3203 },
  { hours: 475, amount: 4370 },
  { hours: 512, amount: 4860 },
  { hours: 356, amount: 2870 },
];

export default function ChartRenderer({
  chartType = "bar",
  data = [],
  title = "Analytics Visualization",
  compact = false,
  xAxis,
  yAxis,
  locale = "en-US",
}) {
  const chartRef = useRef(null);
  const chartData = normalizeChartData(data);
  const keys = Object.keys(chartData[0] || {});
  const numericKeys = keys.filter((key) => chartData.some((row) => Number.isFinite(Number(row[key]))));
  const xKey = pickKey(xAxis, keys) || inferXKey(chartType, keys, numericKeys);
  const yKey = pickKey(yAxis, keys) || inferYKey(chartType, keys, numericKeys, xKey);

  if (!chartData.length || !xKey || !yKey) {
    return (
      <div className="w-full min-w-0 overflow-hidden rounded-xl border border-[#e5e1d8] bg-[#fffefb] p-8 text-center">
        <div className="mx-auto h-24 w-full max-w-md skeleton" />
        <h3 className="mt-6 text-lg font-medium text-[#04342c]">No chart yet</h3>
      </div>
    );
  }

  return (
    <section className="w-full min-w-0 overflow-hidden rounded-xl border border-[#e5e1d8] bg-[#fffefb] p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="inline-flex rounded-full border border-[#9fe1cb] bg-[#e1f5ee] px-3 py-1 text-xs font-medium uppercase tracking-wide text-[#0f6e56]">RESULT</p>
          <h3 className="mt-3 text-lg font-medium tracking-tight text-[#04342c]">{title}</h3>
          <p className="mt-1 text-xs text-[#8b8a80]">{xKey} vs {yKey}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => downloadChart(chartRef.current, "svg")}
            className="rounded-lg border border-[#e5e1d8] bg-[#fffefb] px-3 py-1.5 text-xs font-medium text-[#3a3a35] hover:border-[#cfcbb8]"
          >
            SVG
          </button>
          <button
            onClick={() => downloadChart(chartRef.current, "png")}
            className="rounded-lg bg-[#0f6e56] px-3 py-1.5 text-xs font-medium text-[#e1f5ee] hover:bg-[#085041]"
          >
            PNG
          </button>
        </div>
      </div>
      <div ref={chartRef} className={`chart-container min-w-0 ${compact ? "h-56" : "h-80"}`}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart(chartType, chartData, xKey, yKey, locale)}
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function VisualizationGrid() {
  return (
    <section className="grid gap-5 xl:grid-cols-2">
      <ChartRenderer chartType="line" data={demoTrend} title="Revenue Trend Line Chart" />
      <ChartRenderer chartType="bar" data={demoCategories} title="Category Comparison Bar Chart" />
      <ChartRenderer chartType="pie" data={demoDistribution} title="Distribution Pie Chart" />
      <ChartRenderer chartType="scatter" data={demoCorrelation} title="Correlation Scatter Plot" />
    </section>
  );
}

function renderChart(chartType, data, xKey, yKey, locale) {
  const commonAxis = {
    tickLine: false,
    axisLine: false,
    tick: { fill: "#3a3a35", fontSize: 12, fontFamily: "ui-sans-serif, system-ui", fontWeight: 500 },
  };

  if (chartType === "line") {
    return (
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="4 4" stroke="#e5e1d8" />
        <XAxis dataKey={xKey} {...commonAxis} />
        <YAxis {...commonAxis} />
        <Tooltip content={<ChartTooltip xKey={xKey} yKey={yKey} locale={locale} />} />
        <Legend wrapperStyle={legendStyle} />
        <Line type="monotone" dataKey={yKey} stroke="#0f6e56" strokeWidth={3} dot={{ r: 4, fill: "#9fe1cb", stroke: "#0f6e56", strokeWidth: 1 }} activeDot={{ r: 7, fill: "#e1f5ee", stroke: "#0f6e56", strokeWidth: 2 }} />
      </LineChart>
    );
  }

  if (chartType === "pie") {
    return (
      <PieChart>
        <Pie data={data} dataKey={yKey} nameKey={xKey} cx="50%" cy="50%" innerRadius={58} outerRadius={104} paddingAngle={4}>
          {data.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
        </Pie>
        <Tooltip content={<ChartTooltip xKey={xKey} yKey={yKey} locale={locale} />} />
        <Legend wrapperStyle={legendStyle} />
      </PieChart>
    );
  }

  if (chartType === "scatter") {
    return (
      <ScatterChart>
        <CartesianGrid strokeDasharray="4 4" stroke="#e5e1d8" />
        <XAxis dataKey={xKey} {...commonAxis} />
        <YAxis dataKey={yKey} {...commonAxis} />
        <Tooltip content={<ChartTooltip xKey={xKey} yKey={yKey} locale={locale} />} />
        <Scatter data={data} fill="#0f6e56" />
      </ScatterChart>
    );
  }

  if (chartType === "area") {
    return (
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="4 4" stroke="#e5e1d8" />
        <XAxis dataKey={xKey} {...commonAxis} />
        <YAxis {...commonAxis} />
        <Tooltip content={<ChartTooltip xKey={xKey} yKey={yKey} locale={locale} />} />
        <Area type="monotone" dataKey={yKey} stroke="#0f6e56" fill="#e1f5ee" strokeWidth={3} />
      </AreaChart>
    );
  }

  return (
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="4 4" stroke="#e5e1d8" />
      <XAxis dataKey={xKey} {...commonAxis} />
      <YAxis {...commonAxis} />
      <Tooltip content={<ChartTooltip xKey={xKey} yKey={yKey} locale={locale} />} />
      <Bar dataKey={yKey} radius={[6, 6, 0, 0]} fill="#0f6e56" />
    </BarChart>
  );
}

function ChartTooltip({ active, payload, label, xKey, yKey, locale }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload || {};
  const xValue = row[xKey] ?? label;
  const yValue = row[yKey] ?? payload[0]?.value;

  return (
    <div style={tooltipStyle} className="px-4 py-3 text-sm">
      <p className="font-medium text-[#04342c]">{String(xValue)}</p>
      <p className="mt-1 text-xs font-medium text-[#0f6e56]">
        {yKey}: {formatNumber(yValue, locale)}
      </p>
    </div>
  );
}

function formatNumber(value, locale) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return String(value ?? "");
  return numeric.toLocaleString(locale, { maximumFractionDigits: 2 });
}

function downloadChart(container, type) {
  const svg = container?.querySelector("svg");
  if (!svg) return;

  const cloned = svg.cloneNode(true);
  cloned.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const serialized = new XMLSerializer().serializeToString(cloned);

  if (type === "svg") {
    downloadBlob(serialized, "analysis-chart.svg", "image/svg+xml;charset=utf-8");
    return;
  }

  const svgBlob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = svg.clientWidth * 2;
    canvas.height = svg.clientHeight * 2;
    const context = canvas.getContext("2d");
    context.fillStyle = "#faf9f6";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, "analysis-chart.png", "image/png");
    });
  };
  image.src = url;
}

function downloadBlob(content, filename, type) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function normalizeChartData(data) {
  if (!Array.isArray(data)) return [];
  return data
    .filter((row) => row && typeof row === "object")
    .map((row) => Object.fromEntries(
      Object.entries(row).map(([key, value]) => {
        const numericValue = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
        return [key, Number.isFinite(numericValue) ? numericValue : value];
      })
    ));
}

function pickKey(requestedKey, keys) {
  if (!requestedKey) return null;
  return keys.find((key) => key === requestedKey)
    || keys.find((key) => key.toLowerCase() === String(requestedKey).toLowerCase())
    || null;
}

function inferXKey(chartType, keys, numericKeys) {
  if (chartType === "scatter" && numericKeys.length >= 2) return numericKeys[0];
  return keys.find((key) => !numericKeys.includes(key)) || keys[0];
}

function inferYKey(chartType, keys, numericKeys, xKey) {
  if (chartType === "scatter" && numericKeys.length >= 2) return numericKeys.find((key) => key !== xKey);
  return numericKeys.find((key) => key !== xKey) || keys.find((key) => key !== xKey);
}

const tooltipStyle = {
  background: "#fffefb",
  border: "1px solid #e5e1d8",
  borderRadius: 10,
  boxShadow: "none",
};

const legendStyle = {
  background: "#fffefb",
  border: "1px solid #e5e1d8",
  borderRadius: 10,
  boxShadow: "none",
  padding: 8,
  color: "#04342c",
  fontSize: 12,
  fontWeight: 500,
  maxHeight: 80,
  overflowY: "auto",
};
