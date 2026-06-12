function parseBillText(text) {
  const lines = text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const items = [];

  let billDate = null;

  // Extract Date
  for (const line of lines) {
    const dateMatch = line.match(
      /Date:\s*(\d{4}-\d{2}-\d{2})/i
    );

    if (dateMatch) {
      billDate = dateMatch[1];
      break;
    }
  }

  // Extract Items
  for (const line of lines) {
    const match = line.match(
      /^(.+?)\s+(\d+)\s+(\d+(?:\.\d+)?)$/
    );

    if (!match) continue;

    const item = match[1].trim();
    const quantity = Number(match[2]);
    const amount = Number(match[3]);

    // Skip headers
    if (
      item.toLowerCase().includes("product")
    ) {
      continue;
    }

    items.push({
      date: billDate,
      item,
      quantity,
      amount
    });
  }

  return items;
}

module.exports = {
  parseBillText
};