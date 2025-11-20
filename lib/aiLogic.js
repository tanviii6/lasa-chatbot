
function findVeganUnder200(menu) {
  if (!Array.isArray(menu)) return { status: "no_menu", message: "Menu data missing." };

  const matches = menu.filter(
    (item) =>
      item.isVegan === true &&
      typeof item.calories === "number" &&
      item.calories <= 200
  );

  if (matches.length === 0) {
    return {
      status: "no_match",
      message: "No exact matches found — would you like to try vegetarian or low-calorie options instead?"
    };
  }

  return { status: "ok", items: matches };
}



function handleMissingMenu(menu) {
  if (!menu) {
    return {
      status: "no_menu",
      message: "Sorry! Menu data is unavailable right now."
    };
  }

  return { status: "ok" };
}



function reportInvalidItem(item) {
  return {
    logged: true,
    item,
    message: "Item added to vendor review queue."
  };
}



function detectNutritionQuery(text) {
  const t = text.toLowerCase();

  const keywords = ["calories", "protein", "healthy", "vegan", "nutrition"];

  const found = keywords.some((k) => t.includes(k));

  if (found) {
    return {
      valid: true,
      intent: "nutrition_query"
    };
  }

  return { valid: false };
}



function detectUnrecognized(text) {
  const cleaned = text.trim().toLowerCase();

  if (!/[a-zA-Z]/.test(cleaned)) {
    return {
      valid: false,
      message: "Hmm, I didn't catch that — did you mean something from the dining menu?"
    };
  }

  if (cleaned.length < 3) {
    return {
      valid: false,
      message: "I'm not sure what that means — did you mean something else?"
    };
  }

  const knownWords = [
    "menu",
    "nutrition",
    "calories",
    "lunch",
    "dinner",
    "breakfast",
    "vegan",
    "healthy",
    "protein",
    "food"
  ];

  const containsKnownWord = knownWords.some((w) => cleaned.includes(w));

  if (!containsKnownWord) {
    return {
      valid: false,
      message: "Hmm, I didn't catch that — did you mean something from the dining menu?"
    };
  }

  return { valid: true };
}

function filterMealsUnderCalories(menu, maxCalories) {
  return menu.filter(
    (item) =>
      typeof item.calories === "number" &&
      item.calories <= maxCalories
  );
}

function detectValidQuestion(text) {
  const t = text.toLowerCase();

  const keywords = ["healthy", "healthiest", "calories", "nutrition", "protein", "vegan"];

  const found = keywords.some(k => t.includes(k));

  if (found) {
    return {
      valid: true,
      intent: "nutrition_query"
    };
  }

  return { valid: false };
}


module.exports = {
  findVeganUnder200,
  handleMissingMenu,
  reportInvalidItem,
  detectNutritionQuery,
  detectUnrecognized,
  filterMealsUnderCalories,
  detectValidQuestion,
};
