import { useState } from "react";
import ChartRenderer from "../results/ChartRenderer";

/**
 * Dashboard Grid Component
 * Renders multiple charts and cards in a responsive grid layout
 */
export default function DashboardGrid({ dashboard, locale = "en-US" }) {
  const [expandedChart, setExpandedChart] = useState(null);

  if (!dashboard || !dashboard.dashboardMode) {
    return null;
  }

  const {
    domain,
    datasetType,
    charts = [],
    summary,
    quality,
    kpis,
    insights,
    recommendations,
    questions,
  } = dashboard;

  return (
    <div className="w-full min-w-0">
      {/* Header */}
      <div className="mb-6 overflow-hidden rounded-xl border border-[#e5e1d8] bg-[#fffefb] p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-medium text-[#04342c]">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-[#3a3a35]">
              {domain} / {datasetType}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-[#3a3a35]">
              Auto-Generated Dashboard
            </div>
            <div className="mt-1 inline-block rounded-full border border-[#9fe1cb] bg-[#e1f5ee] px-3 py-1 text-xs font-medium text-[#0f6e56]">
              AI Powered
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          <MetricCard
            label="Total Records"
            value={summary.metrics.totalRecords.toLocaleString()}
            icon="ti ti-chart-bar"
          />
          <MetricCard
            label="Total Columns"
            value={summary.metrics.totalColumns}
            icon="ti ti-table"
          />
          <MetricCard
            label="Data Quality"
            value={`${summary.metrics.dataQualityScore}%`}
            icon="ti ti-check"
            trend={summary.metrics.dataQualityScore >= 75 ? "up" : "down"}
          />
          <MetricCard
            label="Dataset Type"
            value={summary.metrics.domain}
            icon="ti ti-folders"
          />
        </div>
      )}

      {/* KPI Cards */}
      {kpis && kpis.cards && kpis.cards.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-4 text-lg font-medium text-[#04342c]">
            {kpis.title}
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {kpis.cards.map((card, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-xl border border-[#e5e1d8] bg-[#fffefb] p-4"
              >
                <div className="text-xs text-[#3a3a35]">
                  {card.label}
                </div>
                <div className="mt-1 text-sm font-semibold text-[#04342c]">
                  {card.value ?? card.metric}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      {charts && charts.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-4 text-lg font-medium text-[#04342c]">
            Visualizations
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {charts.map((chart, idx) => (
              <div
                key={idx}
                className="min-w-0 overflow-hidden rounded-xl"
                onClick={() => setExpandedChart(idx)}
              >
                <ChartRenderer
                  chartType={chart.chartType}
                  data={chart.chartData || []}
                  title={chart.reason || `Chart ${idx + 1}`}
                  xAxis={chart.xAxis}
                  yAxis={chart.yAxis}
                  compact={true}
                  locale={locale}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Quality Section */}
      {quality && (
        <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Quality Card */}
          <div className="overflow-hidden rounded-xl border border-[#e5e1d8] bg-[#fffefb] p-5">
            <h3 className="mb-4 font-medium text-[#04342c]">
              {quality.title}
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-[#3a3a35]">
                  Quality Score
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="text-2xl font-semibold text-[#04342c]">
                    {quality.metrics.dataQualityScore}%
                  </div>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#f1efe8]">
                    <div
                      className="h-full rounded-full bg-[#0f6e56]"
                      style={{
                        width: `${quality.metrics.dataQualityScore}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-[#e5e1d8] pt-4">
                <div className="text-xs font-medium text-[#3a3a35]">
                  Issues
                </div>
                {quality.metrics.missingValuesTotal > 0 && (
                  <div className="mt-2 text-xs text-[#3a3a35]">
                    Missing values: {quality.metrics.missingValuesTotal}
                  </div>
                )}
                {quality.metrics.duplicateRows > 0 && (
                  <div className="mt-1 text-xs text-[#3a3a35]">
                    Duplicate rows: {quality.metrics.duplicateRows}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Insights Card */}
          {insights && (
            <div className="overflow-hidden rounded-xl border border-[#e5e1d8] bg-[#fffefb] p-5">
              <h3 className="mb-4 font-medium text-[#04342c]">
                {insights.title}
              </h3>
              <ul className="space-y-2">
                {insights.insights?.slice(0, 4).map((insight, idx) => (
                  <li
                    key={idx}
                    className="flex gap-2 text-xs text-[#3a3a35]"
                  >
                    <span className="text-[#0f6e56]">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Recommendations & Next Questions */}
      {(recommendations || questions) && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Recommendations */}
          {recommendations && (
            <div className="overflow-hidden rounded-xl border border-[#e5e1d8] bg-[#fffefb] p-5">
              <h3 className="mb-4 font-medium text-[#04342c]">
                {recommendations.title}
              </h3>
              <ul className="space-y-2">
                {recommendations.recommendations?.slice(0, 5).map((rec, idx) => (
                  <li
                    key={idx}
                    className="flex gap-2 text-xs text-[#3a3a35]"
                  >
                    <span className="text-[#0f6e56]">→</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Questions */}
          {questions && (
            <div className="overflow-hidden rounded-xl border border-[#e5e1d8] bg-[#fffefb] p-5">
              <h3 className="mb-4 font-medium text-[#04342c]">
                {questions.title}
              </h3>
              <ul className="space-y-2">
                {questions.questions?.slice(0, 5).map((q, idx) => (
                  <li
                    key={idx}
                    className="flex cursor-pointer gap-2 text-xs text-[#3a3a35] hover:text-[#0f6e56]"
                  >
                    <span className="text-[#0f6e56]">•</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Metric Card Component
 */
function MetricCard({ label, value, icon = "ti ti-chart-bar", trend = null }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#e5e1d8] bg-[#fffefb] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs text-[#3a3a35]">{label}</div>
          <div className="mt-2 truncate text-2xl font-semibold text-[#04342c]">
            {value}
          </div>
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#9fe1cb] bg-[#e1f5ee] text-[#0f6e56]">
          <i className={`${icon} text-xl`} aria-hidden="true" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 text-xs font-medium text-[#0f6e56]">
          {trend === "up" ? "Positive" : "Needs attention"}
        </div>
      )}
    </div>
  );
}
