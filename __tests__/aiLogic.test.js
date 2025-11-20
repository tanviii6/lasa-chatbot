import {
  findVeganUnder200,
  filterMealsUnderCalories,
  handleMissingMenu,
  reportInvalidItem,
  detectValidQuestion,
  detectUnrecognized
} from "../lib/aiLogic.js";

describe("AI Logic Unit Tests", () => {


  test("TC1: No Matching Items → returns fallback suggestion", () => {
    const menu = [
      { name: "Chicken Alfredo", vegan: false, calories: 900 },
      { name: "Beef Tacos", vegan: false, calories: 500 }
    ];

    const result = findVeganUnder200(menu);

    expect(result.status).toBe("no_match");
    expect(result.message).toMatch(/No exact matches found/);
  });


  test("TC2: Personalized filter → meals under 600 calories", () => {
    const menu = [
      { name: "Salad Bowl", calories: 350 },
      { name: "Veggie Wrap", calories: 550 },
      { name: "Fried Chicken", calories: 1200 }
    ];

    const result = filterMealsUnderCalories(menu, 600);

    expect(result.length).toBe(2);
    expect(result[0].name).toBe("Salad Bowl");
    expect(result[1].name).toBe("Veggie Wrap");
  });


  test("TC3: Missing menu data → fallback message", () => {
    const result = handleMissingMenu(null);

    expect(result.status).toBe("no_menu");
    expect(result.message).toMatch(/menu data is unavailable/i);
  });


  test("TC4: Report invalid item → logs item", () => {
    const item = "Dragonfruit Burger"; // fake item
    const result = reportInvalidItem(item);

    expect(result.logged).toBe(true);
    expect(result.item).toBe(item);
    expect(result.message).toMatch(/added to vendor review queue/i);
  });

  test("TC5: Recognizes valid health-related question", () => {
    const q = "What's the healthiest lunch today?";

    const result = detectValidQuestion(q);

    expect(result.valid).toBe(true);
    expect(result.intent).toBe("nutrition_query");
  });

  
  test("TC6: Unrecognized gibberish input → reprompt", () => {
    const q = "wagwunjhshd???";
    const result = detectUnrecognized(q);

    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/did you mean/i);
  });
});
