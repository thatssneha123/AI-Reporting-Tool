import { useState } from "react";
import ChartRenderer from "../results/ChartRenderer";

/**
 * Dashboard Grid Component
 * Renders multiple charts and cards in a responsive grid layout
 */
export default function DashboardGrid({ dashboard, locale = "en-US", onQuestionSelect }) {
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
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {domain} • {datasetType}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-[var(--text-secondary)]">
              Auto-Generated Dashboard
            </div>
            <div className="mt-1 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              AI Powered
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total Records"
            value={summary.metrics.totalRecords.toLocaleString()}
            icon="📊"
          />
          <MetricCard
            label="Total Columns"
            value={summary.metrics.totalColumns}
            icon="📋"
          />
          <MetricCard
            label="Data Quality"
            value={`${summary.metrics.dataQualityScore}%`}
            icon="✓"
            trend={summary.metrics.dataQualityScore >= 75 ? "up" : "down"}
          />
          <MetricCard
            label="Dataset Type"
            value={summary.metrics.domain}
            icon="🗂️"
          />
        </div>
      )}

      {/* Executive Summary Card (rendered above KPIs) */}
      {dashboard.executiveSummary && (
        <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg">✨</span>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              {dashboard.executiveSummary.title || "Executive Summary"}
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
            {dashboard.executiveSummary.text}
          </p>
          {dashboard.executiveSummary.highlights?.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-[var(--text-secondary)]">
              {dashboard.executiveSummary.highlights.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* KPI Cards */}
      {kpis && kpis.cards && kpis.cards.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
            {kpis.title}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {kpis.cards.map((card, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3"
              >
                <div className="text-xs text-[var(--text-secondary)]">
                  {card.label}
                </div>
                <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
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
          <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
            Visualizations
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {charts.map((chart, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5"
                onClick={() => setExpandedChart(idx)}
              >
                <h3 className="mb-3 font-semibold text-[var(--text-primary)]">
                  {chart.reason || `Chart ${idx + 1}`}
                </h3>
                <div className="h-64 min-h-64 w-full">
                  <ChartRenderer
                    chartType={chart.chartType}
                    data={chart.chartData || []}
                    title={chart.reason || `Chart ${idx + 1}`}
                    xAxis={chart.xAxis}
                    yAxis={chart.yAxis}
                    compact={true}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Quality Section */}
      {quality && (
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {/* Quality Card */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <h3 className="mb-4 font-semibold text-[var(--text-primary)]">
              {quality.title}
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Quality Score
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="text-2xl font-bold text-[var(--text-primary)]">
                    {quality.metrics.dataQualityScore}%
                  </div>
                  <div className="h-2 flex-1 rounded-full bg-[var(--border)]">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600"
                      style={{
                        width: `${quality.metrics.dataQualityScore}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-[var(--border)] pt-4">
                <div className="text-xs font-semibold text-[var(--text-secondary)]">
                  Issues
                </div>
                {quality.metrics.missingValuesTotal > 0 && (
                  <div className="mt-2 text-xs text-[var(--text-secondary)]">
                    Missing values: {quality.metrics.missingValuesTotal}
                  </div>
                )}
                {quality.metrics.duplicateRows > 0 && (
                  <div className="mt-1 text-xs text-[var(--text-secondary)]">
                    Duplicate rows: {quality.metrics.duplicateRows}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Insights Card */}
          {insights && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
              <h3 className="mb-4 font-semibold text-[var(--text-primary)]">
                {insights.title}
              </h3>
              <ul className="space-y-2">
                {insights.insights?.slice(0, 4).map((insight, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-[var(--text-secondary)]"
                  >
                    • {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Recommendations & Next Questions */}
      {(recommendations || questions) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recommendations */}
          {recommendations && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
              <h3 className="mb-4 font-semibold text-[var(--text-primary)]">
                {recommendations.title}
              </h3>
              <ul className="space-y-2">
                {recommendations.recommendations?.slice(0, 5).map((rec, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-[var(--text-secondary)]"
                  >
                    → {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Questions */}
          {questions && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
              <h3 className="mb-4 font-semibold text-[var(--text-primary)]">
                {questions.title}
              </h3>
              <ul className="space-y-2">
                {questions.questions?.slice(0, 5).map((q, idx) => (
                  <li
                    key={idx}
                    onClick={() => onQuestionSelect && onQuestionSelect(q)}
                    className="cursor-pointer text-xs text-blue-600 hover:underline dark:text-blue-400"
                  >
                    • {q}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Grocery Consumption Report (Automatically rendered below Dashboard for Grocery datasets) */}
      {dashboard.consumptionReport && (
        <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
            Grocery Consumption Report
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
              <div className="text-xs text-[var(--text-secondary)]">Total Spend</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">₹{dashboard.consumptionReport.totalSpend}</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
              <div className="text-xs text-[var(--text-secondary)]">Healthy Spend</div>
              <div className="mt-1 text-sm font-semibold text-green-500">₹{dashboard.consumptionReport.healthySpend}</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
              <div className="text-xs text-[var(--text-secondary)]">Unhealthy Spend</div>
              <div className="mt-1 text-sm font-semibold text-red-500">₹{dashboard.consumptionReport.unhealthySpend}</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
              <div className="text-xs text-[var(--text-secondary)]">Health Score</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{dashboard.consumptionReport.healthScore}/100</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
              <div className="text-xs text-[var(--text-secondary)]">Estimated Savings</div>
              <div className="mt-1 text-sm font-semibold text-emerald-400">₹{dashboard.consumptionReport.estimatedSavings}</div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendation Report (Automatically rendered below Dashboard for Grocery datasets) */}
      {dashboard.recommendationReport && (
        <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
            Recommendation Report
          </h2>
          {dashboard.recommendationReport.recommendations?.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-semibold text-[var(--text-secondary)]">AI Suggestions</h3>
              <ul className="list-disc space-y-1 pl-5 text-xs text-[var(--text-secondary)]">
                {dashboard.recommendationReport.recommendations.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="grid gap-6 md:grid-cols-3">
            {dashboard.recommendationReport.unhealthyItems?.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-red-400">Unhealthy Items</h3>
                <ul className="list-disc space-y-1 pl-5 text-xs text-[var(--text-secondary)]">
                  {dashboard.recommendationReport.unhealthyItems.map((item, idx) => (
                    <li key={idx}>{item.item} ({item.category})</li>
                  ))}
                </ul>
              </div>
            )}
            {dashboard.recommendationReport.healthyItems?.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-green-400">Healthy Items</h3>
                <ul className="list-disc space-y-1 pl-5 text-xs text-[var(--text-secondary)]">
                  {dashboard.recommendationReport.healthyItems.map((item, idx) => (
                    <li key={idx}>{item.item} ({item.category})</li>
                  ))}
                </ul>
              </div>
            )}
            {dashboard.recommendationReport.swadeshiAlternatives?.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-emerald-400">Swadeshi Alternatives</h3>
                <ul className="list-disc space-y-1 pl-5 text-xs text-[var(--text-secondary)]">
                  {dashboard.recommendationReport.swadeshiAlternatives.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Metric Card Component
 */
function MetricCard({ label, value, icon = "📊", trend = null }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-[var(--text-secondary)]">{label}</div>
          <div className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
            {value}
          </div>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
      {trend && (
        <div className="mt-3 text-xs font-semibold text-green-600 dark:text-green-400">
          {trend === "up" ? "↑ Positive" : "↓ Needs attention"}
        </div>
      )}
    </div>
  );
}
