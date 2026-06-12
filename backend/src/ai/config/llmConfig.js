module.exports = {
  apiEndpoint: "https://api.groq.com/openai/v1/chat/completions",
  model: "llama-3.1-8b-instant",
  max_tokens: 700,
  headers: {
    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    "Content-Type": "application/json"
  }
};
