const HEALTH_SCORES = {
  fruit: 10,
  vegetable: 10,

  grain: 8,
  dairy: 7,

  instant_food: 2,
  processed_snack: 2,
  soft_drink: 1,
  refined_flour: 3,

  unknown: 5
};

function getHealthScore(category) {
  return HEALTH_SCORES[category] || 5;
}

module.exports = {
  getHealthScore
};