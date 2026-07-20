/**
 * BaseAgent - Abstract base class for all AI agents
 * 
 * Every agent in the system extends this class.
 * An agent is a single-responsibility unit that:
 *   - Reads from AgentContext
 *   - Performs its work (calling existing modules as "tools")
 *   - Writes its results back to AgentContext
 * 
 * Agents NEVER call other agents directly — only the orchestrator coordinates them.
 */

class BaseAgent {
  /**
   * @param {Object} config
   * @param {string} config.name - Unique agent identifier (e.g., "SchemaAgent")
   * @param {string} config.description - Human-readable description
   * @param {string[]} [config.requires] - Context keys this agent needs populated before running
   * @param {string[]} [config.produces] - Context keys this agent will populate
   */
  constructor({ name, description, requires = [], produces = [] }) {
    if (!name) throw new Error("Agent must have a name");
    if (!description) throw new Error("Agent must have a description");
    if (new.target === BaseAgent) {
      throw new Error("BaseAgent is abstract — extend it, don't instantiate directly");
    }

    this.name = name;
    this.description = description;
    this.requires = requires;
    this.produces = produces;
  }

  /**
   * Execute the agent's work.
   * Subclasses MUST override this method.
   * 
   * @param {AgentContext} context - Shared state bus
   * @returns {Promise<void>} - Agent writes results directly to context
   */
  async run(context) {
    throw new Error(`${this.name}.run() must be implemented by subclass`);
  }

  /**
   * Check if this agent's prerequisites are satisfied in the context.
   * @param {AgentContext} context
   * @returns {{ satisfied: boolean, missing: string[] }}
   */
  checkPrerequisites(context) {
    const missing = this.requires.filter(key => !context.has(key));
    return {
      satisfied: missing.length === 0,
      missing,
    };
  }

  /**
   * Validate that the agent produced what it promised.
   * @param {AgentContext} context
   * @returns {{ valid: boolean, missing: string[] }}
   */
  validateOutput(context) {
    const missing = this.produces.filter(key => !context.has(key));
    return {
      valid: missing.length === 0,
      missing,
    };
  }
}

module.exports = BaseAgent;
