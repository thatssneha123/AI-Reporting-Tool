const {
  extractPdfText
} = require("../utils/pdfExtractor");

const {
  parseBillText
} = require("../utils/billParser");

async function test() {
  const text = await extractPdfText(
    "./sample-data/grocery-bill.pdf"
  );

  const items =
    parseBillText(text);

  console.log(
    JSON.stringify(
      items,
      null,
      2
    )
  );
}

test();