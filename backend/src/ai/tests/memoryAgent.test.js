const path = require("path");
const memoryAgent = require("../orchestrator/agents/MemoryAgent");
const orchestrator = require("../orchestrator/orchestrator");
const { analyzeFileWithAi } = require("../../services/ai.service");

async function testMemoryAgent() {
  console.log("Running MemoryAgent Unit Tests...\n");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    memoryAgent.clear();

    // Test 1: Save & Get Session Memory
    console.log("Test 1: Save & Retrieve Session Memory");
    const sessionKey = "test_session_1";
    memoryAgent.saveSession(sessionKey, {
      datasetType: "Grocery Dataset",
      profile: { rowCount: 10, columnCount: 4, quality: { qualityScore: 95 } },
      consumptionReport: { healthScore: 80, totalSpend: 1500 },
      executiveSummary: { title: "Executive Summary", text: "Grocery summary test" },
    });

    const session = memoryAgent.getSession(sessionKey);
    assert(session.datasetType === "Grocery Dataset", "Session stores datasetType");
    assert(session.healthScore === 80, "Session stores healthScore");
    assert(session.totalSpend === 1500, "Session stores totalSpend");

    // Test 2: Follow-up query detection
    console.log("\nTest 2: Follow-up Query Detection");
    assert(memoryAgent.isFollowUpQuery("What was the health score?"), "Detects health score follow-up");
    assert(memoryAgent.isFollowUpQuery("What was the total spend?"), "Detects total spend follow-up");
    assert(memoryAgent.isFollowUpQuery("Compare with previous result"), "Detects comparison follow-up");
    assert(memoryAgent.isFollowUpQuery("What is the dataset type?"), "Detects dataset type follow-up");
    assert(!memoryAgent.isFollowUpQuery("top 10 products"), "Does not trigger on specific analytical queries");

    // Test 3: Resolving follow-up queries via MemoryAgent
    console.log("\nTest 3: Resolving Follow-up Queries");
    const healthRes = memoryAgent.resolveFollowUp("What was the health score?", sessionKey);
    assert(healthRes !== null && healthRes.insights.includes("80/100"), "Resolves health score follow-up using stored memory");

    const spendRes = memoryAgent.resolveFollowUp("What was the total spend?", sessionKey);
    assert(spendRes !== null && spendRes.insights.includes("1,500"), "Resolves total spend follow-up using stored memory");

    const compareRes = memoryAgent.resolveFollowUp("Compare with previous result", sessionKey);
    assert(compareRes !== null && compareRes.insightBullets.length > 0, "Resolves comparison follow-up using stored memory");

    // Test 4: Record question history
    console.log("\nTest 4: Recording Question History");
    memoryAgent.recordQuestion(sessionKey, "What is top product?", { chartType: "bar" });
    const updatedSession = memoryAgent.getSession(sessionKey);
    assert(updatedSession.previousQuestions.length === 1, "Records asked question in history");
    assert(updatedSession.previousQuestions[0].question === "What is top product?", "Question recorded correctly");

    // Test 5: End-to-End Orchestrator + Analyze Memory Flow
    console.log("\nTest 5: End-to-End Session Memory Flow");
    const sampleFilePath = path.join(__dirname, "../sample-data/sales.csv");
    
    // 1. Process dashboard via Orchestrator (saves memory)
    const dashResult = await analyzeFileWithAi({ filePath: sampleFilePath, query: "" });
    assert(dashResult.dashboardMode === true, "Orchestrator generates dashboard");

    // 2. Ask follow-up question
    const followUpResult = await analyzeFileWithAi({ filePath: sampleFilePath, query: "What is the dataset type?" });
    assert(followUpResult && typeof followUpResult.insights === "string" && followUpResult.insights.includes("Sales Time Series"), "Resolves follow-up query from Orchestrator-saved session memory");

  } catch (err) {
    console.error("Test execution failed with error:", err);
    failed++;
  }

  console.log(`\nMemoryAgent Test Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

testMemoryAgent();
