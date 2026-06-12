const {
  extractPdfText
} = require("../utils/pdfExtractor");

async function test() {
  const text = await extractPdfText(
    "./sample-data/grocery-bill.pdf"
  );

  console.log(text);
}

test();