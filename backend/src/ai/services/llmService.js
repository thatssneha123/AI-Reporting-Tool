const llmConfig = require("../config/llmConfig");

// 🔥 MAIN LLM CALL
async function callLLM(systemPrompt, userMessage) {
  const response = await fetch(llmConfig.apiEndpoint, {
    method: "POST",
    headers: llmConfig.headers,
    body: JSON.stringify({
      model: llmConfig.model,
      max_tokens: llmConfig.max_tokens,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LLM API error ${response.status}: ${error}`);
  }

  const data = await response.json();

  // 👇 DEBUG once (remove later if you want)

  if (!data?.choices?.[0]?.message?.content) {
  throw new Error("Empty LLM response");
}

return data.choices[0].message.content;
}


// 🔥 JSON HELPER (important for your agent)
async function callLLMJson(systemPrompt, userMessage) {
  const raw = await callLLM(systemPrompt, userMessage);

  // remove ```json ``` if model adds it
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);

    throw new Error("Failed to parse LLM JSON response: " + cleaned);
  }
}

module.exports = { callLLM, callLLMJson };
