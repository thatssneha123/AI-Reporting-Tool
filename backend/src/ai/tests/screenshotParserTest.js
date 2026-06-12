const {
  extractImageText
} = require("../utils/imageExtractor");

const {
  parseScreenshotBill
} = require("../utils/screenshotBillParser");

async function test() {
  const text = await extractImageText(
    "./sample-data/sample-bill.jpg"
  );

  const items =
    parseScreenshotBill(text);

  console.log(
    JSON.stringify(
      items,
      null,
      2
    )
  );
}

test();