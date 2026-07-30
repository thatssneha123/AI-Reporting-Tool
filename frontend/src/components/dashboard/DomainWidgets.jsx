import React from "react";

/**
 * Pluggable Domain Widget Registry
 * Maps dataset domain names to domain-specific UI widget renderers.
 */

// 1. Grocery Domain Widget
function GroceryDomainWidget({ dashboard }) {
  const consumptionReport = dashboard.consumptionReport || dashboard.domainIntelligence?.consumptionReport;
  const recommendationReport = dashboard.recommendationReport || dashboard.domainIntelligence?.recommendationReport;

  if (!consumptionReport && !recommendationReport) return null;

  return (
    <div className="space-y-6">
      {/* Grocery Consumption Report */}
      {consumptionReport && (
        <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
            Grocery Consumption Report
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
              <div className="text-xs text-[var(--text-secondary)]">Total Spend</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">₹{consumptionReport.totalSpend}</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
              <div className="text-xs text-[var(--text-secondary)]">Healthy Spend</div>
              <div className="mt-1 text-sm font-semibold text-green-500">₹{consumptionReport.healthySpend}</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
              <div className="text-xs text-[var(--text-secondary)]">Unhealthy Spend</div>
              <div className="mt-1 text-sm font-semibold text-red-500">₹{consumptionReport.unhealthySpend}</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
              <div className="text-xs text-[var(--text-secondary)]">Health Score</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{consumptionReport.healthScore}/100</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
              <div className="text-xs text-[var(--text-secondary)]">Estimated Savings</div>
              <div className="mt-1 text-sm font-semibold text-emerald-400">₹{consumptionReport.estimatedSavings}</div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendation Report */}
      {recommendationReport && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
            Recommendation Report
          </h2>
          {recommendationReport.recommendations?.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-semibold text-[var(--text-secondary)]">AI Suggestions</h3>
              <ul className="list-disc space-y-1 pl-5 text-xs text-[var(--text-secondary)]">
                {recommendationReport.recommendations.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="grid gap-6 md:grid-cols-3">
            {recommendationReport.unhealthyItems?.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-red-400">Unhealthy Items</h3>
                <ul className="list-disc space-y-1 pl-5 text-xs text-[var(--text-secondary)]">
                  {recommendationReport.unhealthyItems.map((item, idx) => (
                    <li key={idx}>{item.item} ({item.category})</li>
                  ))}
                </ul>
              </div>
            )}
            {recommendationReport.healthyItems?.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-green-400">Healthy Items</h3>
                <ul className="list-disc space-y-1 pl-5 text-xs text-[var(--text-secondary)]">
                  {recommendationReport.healthyItems.map((item, idx) => (
                    <li key={idx}>{item.item} ({item.category})</li>
                  ))}
                </ul>
              </div>
            )}
            {recommendationReport.swadeshiAlternatives?.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-emerald-400">Swadeshi Alternatives</h3>
                <ul className="list-disc space-y-1 pl-5 text-xs text-[var(--text-secondary)]">
                  {recommendationReport.swadeshiAlternatives.map((item, idx) => (
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

// 2. Sales Domain Widget
function SalesDomainWidget({ dashboard }) {
  const domainIntel = dashboard.domainIntelligence;
  if (!domainIntel) return null;

  return (
    <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
      <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
        Sales & Revenue Intelligence
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
          <div className="text-xs text-[var(--text-secondary)]">Domain Scope</div>
          <div className="mt-1 text-sm font-semibold text-blue-500">Sales Operations</div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
          <div className="text-xs text-[var(--text-secondary)]">Analysis Focus</div>
          <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Revenue & Volume</div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
          <div className="text-xs text-[var(--text-secondary)]">AI Recommendations</div>
          <div className="mt-1 text-sm font-semibold text-emerald-400">{domainIntel.aiSuggestions?.length || 0} Suggestions</div>
        </div>
      </div>
    </div>
  );
}

// 3. HR Domain Widget
function HRDomainWidget({ dashboard }) {
  const domainIntel = dashboard.domainIntelligence;
  if (!domainIntel) return null;

  return (
    <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
      <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
        HR & Workforce Intelligence
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
          <div className="text-xs text-[var(--text-secondary)]">Domain Scope</div>
          <div className="mt-1 text-sm font-semibold text-purple-500">Workforce Analytics</div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
          <div className="text-xs text-[var(--text-secondary)]">Analysis Focus</div>
          <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Headcount & Distribution</div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
          <div className="text-xs text-[var(--text-secondary)]">AI Recommendations</div>
          <div className="mt-1 text-sm font-semibold text-emerald-400">{domainIntel.aiSuggestions?.length || 0} Suggestions</div>
        </div>
      </div>
    </div>
  );
}

// 4. Finance Domain Widget
function FinanceDomainWidget({ dashboard }) {
  const domainIntel = dashboard.domainIntelligence;
  if (!domainIntel) return null;

  return (
    <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
      <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
        Financial Intelligence
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
          <div className="text-xs text-[var(--text-secondary)]">Domain Scope</div>
          <div className="mt-1 text-sm font-semibold text-emerald-500">Financial Performance</div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
          <div className="text-xs text-[var(--text-secondary)]">Analysis Focus</div>
          <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Margins & Expenditure</div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
          <div className="text-xs text-[var(--text-secondary)]">AI Recommendations</div>
          <div className="mt-1 text-sm font-semibold text-emerald-400">{domainIntel.aiSuggestions?.length || 0} Suggestions</div>
        </div>
      </div>
    </div>
  );
}

// 5. Healthcare Domain Widget
function HealthcareDomainWidget({ dashboard }) {
  const domainIntel = dashboard.domainIntelligence;
  if (!domainIntel) return null;

  return (
    <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
      <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
        Healthcare & Medical Intelligence
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
          <div className="text-xs text-[var(--text-secondary)]">Domain Scope</div>
          <div className="mt-1 text-sm font-semibold text-teal-500">Medical Data Analytics</div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
          <div className="text-xs text-[var(--text-secondary)]">Analysis Focus</div>
          <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Patient & Outcomes</div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
          <div className="text-xs text-[var(--text-secondary)]">AI Recommendations</div>
          <div className="mt-1 text-sm font-semibold text-emerald-400">{domainIntel.aiSuggestions?.length || 0} Suggestions</div>
        </div>
      </div>
    </div>
  );
}

// Registry map for pluggable domain widgets
const DOMAIN_WIDGET_REGISTRY = {
  grocery: GroceryDomainWidget,
  expense: GroceryDomainWidget,
  sales: SalesDomainWidget,
  orders: SalesDomainWidget,
  hr: HRDomainWidget,
  workforce: HRDomainWidget,
  finance: FinanceDomainWidget,
  financial: FinanceDomainWidget,
  healthcare: HealthcareDomainWidget,
  medical: HealthcareDomainWidget,
};

/**
 * Scalable Domain Widget Renderer Component
 * Renders domain-specific widgets conditionally based on detected dataset domain.
 */
export default function DomainWidgetRenderer({ dashboard, activeDomain = "generic", isGroceryDomain = false }) {
  if (!dashboard) return null;

  const domainKey = String(activeDomain || "generic").toLowerCase().trim();

  // If grocery domain explicitly detected or matched in registry
  if (isGroceryDomain || domainKey === "grocery" || domainKey === "expense") {
    return <GroceryDomainWidget dashboard={dashboard} />;
  }

  // Lookup domain widget in pluggable registry
  const WidgetComponent = DOMAIN_WIDGET_REGISTRY[domainKey];
  if (WidgetComponent) {
    return <WidgetComponent dashboard={dashboard} />;
  }

  // Generic / unknown datasets render NO grocery or domain-specific widgets (clean generic view)
  return null;
}
