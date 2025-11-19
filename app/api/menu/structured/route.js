export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const hallRaw = searchParams.get("hall");
    const meal = searchParams.get("meal");

    if (!hallRaw || !meal) {
      return new Response(
        JSON.stringify({
          error: "Required: ?hall=marciano&meal=Dinner"
        }),
        { status: 400 }
      );
    }

    const hall = hallRaw.toLowerCase();

    const res = await fetch("https://www.bu.edu/phpbin/dining/api/full/", {
      cache: "no-store"
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Dining API unavailable" }), {
        status: 500
      });
    }

    const data = await res.json();

    const today = new Date();
    const dateKey = today.toLocaleDateString("en-US");

    const menuToday = data.menu?.[dateKey] || {};

    const hallKey = Object.keys(menuToday).find(
      h => h.toLowerCase() === hall
    );

    if (!hallKey) {
      return new Response(
        JSON.stringify({ error: `Dining hall '${hallRaw}' not found` }),
        { status: 404 }
      );
    }

    const hallData = menuToday[hallKey];
    const mealData = hallData[meal];

    if (!mealData) {
      return new Response(
        JSON.stringify({ error: `Meal '${meal}' not found at ${hallRaw}` }),
        { status: 404 }
      );
    }

    const recipes = data.recipes || {};
    const recipeIDs = Object.values(mealData).flat();

    const categories = {
      entrees: [],
      pizza: [],
      soups: [],
      desserts: [],
      saladBar: [],
      sides: [],
      grabAndGo: [],
      condiments: [],
      uncategorized: []
    };

    const isDessert = n =>
      ["cookie", "cake", "brownie", "cupcake", "parfait", "pudding", "flan", "tres leche"]
        .some(y => n.includes(y));

    const isSaladBar = n =>
      ["salad", "spinach", "lettuce", "hummus", "edamame", "fruit", "avocado"]
        .some(y => n.includes(y));

    const isSide = n =>
      ["rice", "beans", "broccoli", "potato", "lentil", "peas", "carrot"]
        .some(y => n.includes(y));

    const isGrabAndGo = n =>
      ["wrap", "sandwich"]
        .some(y => n.includes(y));

    const isCondiment = n =>
      ["dressing", "vinaigrette", "sauce", "oil", "vinegar"]
        .some(y => n.includes(y));

    recipeIDs.forEach(id => {
      const item = recipes[id];
      if (!item) return;

      const name = item.name.toLowerCase();

      if (name.includes("pizza")) categories.pizza.push(item.name);
      else if (name.includes("soup")) categories.soups.push(item.name);
      else if (isDessert(name)) categories.desserts.push(item.name);
      else if (isSaladBar(name)) categories.saladBar.push(item.name);
      else if (isSide(name)) categories.sides.push(item.name);
      else if (isGrabAndGo(name)) categories.grabAndGo.push(item.name);
      else if (isCondiment(name)) categories.condiments.push(item.name);
      else categories.entrees.push(item.name);
    });

    return new Response(
      JSON.stringify({
        hall: hallKey,
        meal,
        categories
      }),
      { status: 200 }
    );

  } catch (err) {
    console.log("STRUCTURED ERROR:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500
    });
  }
}
