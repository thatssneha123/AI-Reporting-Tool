/**
 * AgentRegistry - Agent discovery and registration
 * 
 * Maintains a registry of available agents.
 * The orchestrator uses this to discover which agents exist
 * and resolve execution order based on requires/produces declarations.
 */

class AgentRegistry {
  constructor() {
    /** @type {Map<string, import('./baseAgent')>} */
    this._agents = new Map();
  }

  /**
   * Register an agent instance
   * @param {import('./baseAgent')} agent - Agent instance (must extend BaseAgent)
   * @returns {AgentRegistry} this (for chaining)
   */
  register(agent) {
    if (!agent || !agent.name) {
      throw new Error("Cannot register agent without a name");
    }
    if (typeof agent.run !== "function") {
      throw new Error(`Agent "${agent.name}" must have a run() method`);
    }
    if (this._agents.has(agent.name)) {
      throw new Error(`Agent "${agent.name}" is already registered`);
    }
    this._agents.set(agent.name, agent);
    return this;
  }

  /**
   * Get an agent by name
   * @param {string} name
   * @returns {import('./baseAgent')|undefined}
   */
  get(name) {
    return this._agents.get(name);
  }

  /**
   * Check if an agent is registered
   * @param {string} name
   * @returns {boolean}
   */
  has(name) {
    return this._agents.has(name);
  }

  /**
   * Get all registered agents
   * @returns {import('./baseAgent')[]}
   */
  all() {
    return Array.from(this._agents.values());
  }

  /**
   * Get agent names
   * @returns {string[]}
   */
  names() {
    return Array.from(this._agents.keys());
  }

  /**
   * Get the count of registered agents
   * @returns {number}
   */
  get size() {
    return this._agents.size;
  }

  /**
   * Resolve execution order based on agent requires/produces declarations.
   * Uses a topological sort to determine correct ordering.
   * 
   * @param {string[]} [filter] - If provided, only include these agent names
   * @returns {import('./baseAgent')[]} Agents in dependency-resolved order
   */
  resolveExecutionOrder(filter = null) {
    const agents = filter
      ? filter.map(name => this._agents.get(name)).filter(Boolean)
      : this.all();

    // Build a map of what each agent produces
    const producerMap = new Map(); // key -> agentName
    for (const agent of agents) {
      for (const key of agent.produces) {
        producerMap.set(key, agent.name);
      }
    }

    // Build adjacency list (agent -> agents it depends on)
    const deps = new Map();
    for (const agent of agents) {
      const dependencies = [];
      for (const req of agent.requires) {
        const producer = producerMap.get(req);
        if (producer && producer !== agent.name) {
          dependencies.push(producer);
        }
      }
      deps.set(agent.name, dependencies);
    }

    // Topological sort (Kahn's algorithm)
    const inDegree = new Map();
    for (const agent of agents) {
      if (!inDegree.has(agent.name)) inDegree.set(agent.name, 0);
    }
    for (const [, dependencies] of deps) {
      for (const dep of dependencies) {
        inDegree.set(dep, (inDegree.get(dep) || 0));
      }
    }
    for (const [agentName, dependencies] of deps) {
      for (const dep of dependencies) {
        // dep must come before agentName
        inDegree.set(agentName, (inDegree.get(agentName) || 0) + 1);
      }
    }

    // Recalculate in-degree properly
    const degree = new Map();
    for (const agent of agents) {
      degree.set(agent.name, 0);
    }
    for (const [agentName, dependencies] of deps) {
      degree.set(agentName, dependencies.length);
    }

    const queue = [];
    for (const [name, deg] of degree) {
      if (deg === 0) queue.push(name);
    }

    const sorted = [];
    while (queue.length > 0) {
      const current = queue.shift();
      sorted.push(current);

      // Find agents that depend on `current`
      for (const [agentName, dependencies] of deps) {
        if (dependencies.includes(current)) {
          degree.set(agentName, degree.get(agentName) - 1);
          if (degree.get(agentName) === 0) {
            queue.push(agentName);
          }
        }
      }
    }

    // If we couldn't sort all agents, there's a circular dependency
    if (sorted.length !== agents.length) {
      const unsorted = agents
        .filter(a => !sorted.includes(a.name))
        .map(a => a.name);
      throw new Error(
        `Circular dependency detected among agents: ${unsorted.join(", ")}`
      );
    }

    return sorted.map(name => this._agents.get(name));
  }

  /**
   * Remove all registered agents (useful for testing)
   */
  clear() {
    this._agents.clear();
  }
}

module.exports = AgentRegistry;
