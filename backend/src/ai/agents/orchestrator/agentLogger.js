/**
 * AgentLogger - Structured logging for the agent system
 * 
 * Provides per-agent logging with timing, structured output,
 * and respects the existing AI_DEBUG environment variable.
 */

const isDebug = () => process.env.AI_DEBUG === "true";

class AgentLogger {
  /**
   * @param {string} [prefix="AgentSystem"] - Log prefix
   */
  constructor(prefix = "AgentSystem") {
    this._prefix = prefix;
  }

  /**
   * Log agent lifecycle start
   * @param {string} agentName
   */
  agentStart(agentName) {
    if (isDebug()) {
      console.log(`\n[${this._prefix}] ▶ ${agentName} — starting`);
    }
  }

  /**
   * Log agent lifecycle completion
   * @param {string} agentName
   * @param {number} durationMs
   */
  agentComplete(agentName, durationMs) {
    if (isDebug()) {
      console.log(
        `[${this._prefix}] ✓ ${agentName} — completed in ${durationMs}ms`
      );
    }
  }

  /**
   * Log agent lifecycle error (non-fatal)
   * @param {string} agentName
   * @param {Error|string} error
   */
  agentError(agentName, error) {
    const message = error instanceof Error ? error.message : String(error);
    // Always log errors, even when AI_DEBUG is off
    console.error(`[${this._prefix}] ✗ ${agentName} — error: ${message}`);
  }

  /**
   * Log agent skip (prerequisites not met or not needed)
   * @param {string} agentName
   * @param {string} reason
   */
  agentSkip(agentName, reason) {
    if (isDebug()) {
      console.log(`[${this._prefix}] ⊘ ${agentName} — skipped: ${reason}`);
    }
  }

  /**
   * Log orchestrator-level events
   * @param {string} message
   */
  orchestrator(message) {
    if (isDebug()) {
      console.log(`[${this._prefix}] ◆ Orchestrator — ${message}`);
    }
  }

  /**
   * Log pipeline summary after all agents complete
   * @param {import('./agentContext')} context
   */
  pipelineSummary(context) {
    if (!isDebug()) return;

    const metrics = context.getAgentMetrics();
    console.log(`\n[${this._prefix}] ═══ Pipeline Summary ═══`);
    console.log(`  Mode: ${context.isDashboardMode ? "Dashboard" : "Analyze"}`);
    console.log(`  Agents run: ${metrics.agentsRun.join(" → ")}`);
    console.log(`  Total time: ${metrics.totalProcessingMs}ms`);

    if (Object.keys(metrics.timing).length > 0) {
      console.log(`  Timing breakdown:`);
      for (const [agent, ms] of Object.entries(metrics.timing)) {
        const bar = "█".repeat(Math.max(1, Math.round(ms / 50)));
        console.log(`    ${agent.padEnd(20)} ${String(ms).padStart(6)}ms ${bar}`);
      }
    }

    if (metrics.errors.length > 0) {
      console.log(`  Errors (${metrics.errors.length}):`);
      for (const err of metrics.errors) {
        console.log(`    ✗ ${err.agent}: ${err.message}`);
      }
    }

    console.log(`[${this._prefix}] ════════════════════════\n`);
  }

  /**
   * Log arbitrary debug data
   * @param {string} label
   * @param {*} data
   */
  debug(label, data) {
    if (isDebug()) {
      console.log(`[${this._prefix}] 🔍 ${label}:`, 
        typeof data === "object" ? JSON.stringify(data, null, 2) : data
      );
    }
  }

  /**
   * Log an informational message (always visible)
   * @param {string} message
   */
  info(message) {
    console.log(`[${this._prefix}] ${message}`);
  }

  /**
   * Log a warning (always visible)
   * @param {string} message
   */
  warn(message) {
    console.warn(`[${this._prefix}] ⚠ ${message}`);
  }
}

module.exports = AgentLogger;
