export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Required: ?query=pasta" }),
        { status: 400 }
      );
    }

    const q = query.toLowerCase();

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
    const recipes = data.recipes || {};

    const results = [];

    for (const hallKey of Object.keys(menuToday)) {
      const hallLower = hallKey.toLowerCase();

      for (const meal of Object.keys(menuToday[hallKey])) {
        const stationData = menuToday[hallKey][meal];
        const recipeIDs = Object.values(stationData).flat();

        recipeIDs.forEach(id => {
          const item = recipes[id];
          if (!item) return;

          const name = item.name.toLowerCase();

          if (name.includes(q)) {
            results.push({
              hall: hallLower,
              meal,
              id,
              name: item.name
            });
          }
        });
      }
    }

    return new Response(
      JSON.stringify({
        query,
        count: results.length,
        results
      }),
      { status: 200 }
    );

  } catch (err) {
    console.log("SEARCH ERROR:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500
    });
  }
}

