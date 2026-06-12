function parseScreenshotBill(text) {
  const lines = text
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  const items = [];

  for (let i = 0; i < lines.length - 1; i++) {
    const current = lines[i];
    const next = lines[i + 1];

    const match = next.match(
      /x\s*(\d+).*?(\d+)$/
    );

    if (!match) continue;

    const quantity = Number(match[1]);
    const amount = Number(match[2]);

    // Skip bill summary rows
    const lower = current.toLowerCase();

    if (
      lower.includes("bill") ||
      lower.includes("discount") ||
      lower.includes("total") ||
      lower.includes("charge") ||
      lower.includes("mrp")
    ) {
      continue;
    }

    items.push({
      item: current,
      quantity,
      amount
    });
  }

  return items;
}

module.exports = {
  parseScreenshotBill
};