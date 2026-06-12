const {
  extractImageText
} = require("../utils/imageExtractor");

async function test() {
  const text = await extractImageText(
    "./sample-data/sample-bill.jpg"
  );

  console.log(text);
}

test();