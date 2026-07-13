# AI Request Flow Report

## 1. Current execution flow in the live application

The live Analyze flow is driven by the Dashboard screen, not the older Query screen.

### Frontend path
1. User clicks Analyze in [frontend/src/pages/Dashboard.jsx](frontend/src/pages/Dashboard.jsx).
2. The local `analyze()` function calls [frontend/src/services/queryService.js](frontend/src/services/queryService.js).
3. The service sends a POST request to `/analyze` through [frontend/src/services/api.js](frontend/src/services/api.js).
4. The frontend receives the JSON response and updates the dashboard chart/results state.

### Backend path
1. Express routes the request through [backend/src/routes/analyze.routes.js](backend/src/routes/analyze.routes.js).
2. The route calls [backend/src/controllers/analyze.controller.js](backend/src/controllers/analyze.controller.js).
3. The controller loads the dataset from MongoDB via [backend/src/models/Dataset.model.js](backend/src/models/Dataset.model.js).
4. It calls [backend/src/services/ai.service.js](backend/src/services/ai.service.js) using `analyzeFileWithAi(...)`.
5. The service loads the file through [backend/src/ai/modules/datasetLoader.js](backend/src/ai/modules/datasetLoader.js).
6. It runs [backend/src/ai/modules/datasetIntelligenceAgent.js](backend/src/ai/modules/datasetIntelligenceAgent.js), then calls [backend/src/ai/agents/aiAgent.js](backend/src/ai/agents/aiAgent.js).
7. The agent uses [backend/src/ai/modules/datasetAnalyzer.js](backend/src/ai/modules/datasetAnalyzer.js) for local analysis, [backend/src/ai/modules/intentParser.js](backend/src/ai/modules/intentParser.js) for intent parsing, and [backend/src/ai/modules/insightGenerator.js](backend/src/ai/modules/insightGenerator.js) for insight generation.
8. The LLM request is executed in [backend/src/ai/services/llmService.js](backend/src/ai/services/llmService.js) using config from [backend/src/ai/config/llmConfig.js](backend/src/ai/config/llmConfig.js).
9. For grocery/bill-style queries, the service also appends data from [backend/src/ai/modules/consumptionAnalyzer.js](backend/src/ai/modules/consumptionAnalyzer.js) and [backend/src/ai/modules/recommendationEngine.js](backend/src/ai/modules/recommendationEngine.js).
10. The controller creates an entry in [backend/src/models/Analysis.model.js](backend/src/models/Analysis.model.js) and returns the merged result to the frontend.

## 2. Files that are actually executed in the live path

### Frontend
- [frontend/src/pages/Dashboard.jsx](frontend/src/pages/Dashboard.jsx)
- [frontend/src/components/dashboard/QuestionPanel.jsx](frontend/src/components/dashboard/QuestionPanel.jsx)
- [frontend/src/services/queryService.js](frontend/src/services/queryService.js)
- [frontend/src/services/api.js](frontend/src/services/api.js)

### Backend
- [backend/src/app.js](backend/src/app.js)
- [backend/src/routes/analyze.routes.js](backend/src/routes/analyze.routes.js)
- [backend/src/controllers/analyze.controller.js](backend/src/controllers/analyze.controller.js)
- [backend/src/services/ai.service.js](backend/src/services/ai.service.js)
- [backend/src/ai/modules/datasetLoader.js](backend/src/ai/modules/datasetLoader.js)
- [backend/src/ai/modules/datasetIntelligenceAgent.js](backend/src/ai/modules/datasetIntelligenceAgent.js)
- [backend/src/ai/agents/aiAgent.js](backend/src/ai/agents/aiAgent.js)
- [backend/src/ai/modules/datasetAnalyzer.js](backend/src/ai/modules/datasetAnalyzer.js)
- [backend/src/ai/modules/intentParser.js](backend/src/ai/modules/intentParser.js)
- [backend/src/ai/modules/insightGenerator.js](backend/src/ai/modules/insightGenerator.js)
- [backend/src/ai/services/llmService.js](backend/src/ai/services/llmService.js)
- [backend/src/ai/config/llmConfig.js](backend/src/ai/config/llmConfig.js)
- [backend/src/ai/modules/consumptionAnalyzer.js](backend/src/ai/modules/consumptionAnalyzer.js)
- [backend/src/ai/modules/recommendationEngine.js](backend/src/ai/modules/recommendationEngine.js)
- [backend/src/models/Dataset.model.js](backend/src/models/Dataset.model.js)
- [backend/src/models/Analysis.model.js](backend/src/models/Analysis.model.js)

## 3. Files that are unused or effectively unused

### Frontend
- [frontend/src/pages/Query.jsx](frontend/src/pages/Query.jsx) is not used in the live app because [frontend/src/App.jsx](frontend/src/App.jsx) redirects `/query` to `/dashboard`.

### Backend
- [backend/src/routes/ai.routes.js](backend/src/routes/ai.routes.js) is a duplicate analyze route, but the active live route is [backend/src/routes/analyze.routes.js](backend/src/routes/analyze.routes.js).
- [backend/src/ai/modules/visualizationPlanner.js](backend/src/ai/modules/visualizationPlanner.js) is imported in [backend/src/ai/agents/aiAgent.js](backend/src/ai/agents/aiAgent.js) but never called.

## 4. Why datasetIntelligenceAgent.js is effectively ignored

This is the key issue.

- [backend/src/services/ai.service.js](backend/src/services/ai.service.js) does call `analyzeDatasetIntelligence(...)`.
- However, the returned object is assigned to a local variable and never used to influence the downstream analysis.
- The service later calls `runAgent(normalizedQuery, dataset, { datasetIntelligence })`, but [backend/src/ai/agents/aiAgent.js](backend/src/ai/agents/aiAgent.js) defines `runAgent(userInput, rawDataset)` with only two parameters, so the third argument is ignored.
- The downstream modules in [backend/src/ai/modules/intentParser.js](backend/src/ai/modules/intentParser.js), [backend/src/ai/modules/insightGenerator.js](backend/src/ai/modules/insightGenerator.js), and [backend/src/ai/modules/visualizationPlanner.js](backend/src/ai/modules/visualizationPlanner.js) do not consume the intelligence object.
- The final response payload comes from the existing AI agent result plus the grocery/bill-specific reports, not from the dataset intelligence object.

So the module is not completely dead from an execution standpoint, but it is effectively inert from a business logic standpoint.

## 5. Safest integration point without breaking grocery bill analysis

The safest place to integrate it is the boundary between [backend/src/services/ai.service.js](backend/src/services/ai.service.js) and [backend/src/ai/agents/aiAgent.js](backend/src/ai/agents/aiAgent.js).

Why this is the safest point:
- It keeps the existing response structure intact.
- It does not interfere with the currently working grocery/bill analysis path in [backend/src/ai/modules/consumptionAnalyzer.js](backend/src/ai/modules/consumptionAnalyzer.js) and [backend/src/ai/modules/recommendationEngine.js](backend/src/ai/modules/recommendationEngine.js).
- It allows the dataset intelligence object to enrich intent parsing and insight generation without changing the frontend contract.

Recommended integration strategy:
1. Keep the current `analyzeFileWithAi(...)` entry point unchanged.
2. Pass the already-computed intelligence object into `runAgent(...)` as an optional context argument.
3. Inside the agent, use it only as metadata enrichment for the existing intent and insight pipeline.
4. Do not alter the response shape unless the frontend is also updated.

## Bottom line

The current live request path is working, but the dataset intelligence module is not meaningfully participating in the result. The reason is not that the route is missing; it is that the computed intelligence is never consumed by the downstream agent pipeline.
