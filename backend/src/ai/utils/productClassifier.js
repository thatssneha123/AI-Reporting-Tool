const PRODUCT_CATEGORIES = {
  "maggi": "instant_food",
  "yippee": "instant_food",

  "maida": "refined_flour",

  "chips": "processed_snack",
  "kurkure": "processed_snack",
  "lays": "processed_snack",

  "coke": "soft_drink",
  "pepsi": "soft_drink",

  "milk": "dairy",
  "curd": "dairy",
  "paneer": "dairy",

  "rice": "grain",
  "wheat": "grain",
  "atta": "grain",

  "apple": "fruit",
  "banana": "fruit",

  "potato": "vegetable",
  "onion": "vegetable"
};

function classifyProduct(productName = "") {
  const item = productName.toLowerCase();

  for (const keyword of Object.keys(PRODUCT_CATEGORIES)) {
    if (item.includes(keyword)) {
      return PRODUCT_CATEGORIES[keyword];
    }
  }

  return "unknown";
}

module.exports = {
  classifyProduct
};