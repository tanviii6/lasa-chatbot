export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const hall = searchParams.get("hall")?.toLowerCase();
    const meal = searchParams.get("meal");

    if (!hall || !meal) {
      return new Response(
        JSON.stringify({ error: "Missing hall or meal parameter" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const res = await fetch("https://www.bu.edu/phpbin/dining/api/full/", {
      cache: "no-store"
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "Dining API unavailable" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();

    const today = new Date();
    const dateKey = today.toLocaleDateString("en-US");

    const menuForToday = data.menu?.[dateKey] || {};
    const hallData = menuForToday[hall];

    if (!hallData) {
      return new Response(
        JSON.stringify({ error: `Dining hall '${hall}' not found today` }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const mealData = hallData[meal];
    if (!mealData) {
      return new Response(
        JSON.stringify({ error: `Meal '${meal}' not found for '${hall}' today` }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const recipeIDs = Object.values(mealData).flat();
    const recipes = data.recipes || {};

    const recipeNames = recipeIDs.map(id => recipes[id]?.name || "Unknown item");

    return new Response(
      JSON.stringify({
        hall,
        meal,
        count: recipeNames.length,
        items: recipeNames
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
