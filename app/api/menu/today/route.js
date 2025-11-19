export async function GET() {
  try {
    const res = await fetch("https://www.bu.edu/phpbin/dining/api/full/", {
      cache: "no-store"
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Dining API unavailable" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const data = await res.json();

    const today = new Date();
    const dateKey = today.toLocaleDateString("en-US");

    const menuForToday = data.menu?.[dateKey] || {};

    const result = {};

    for (const hallName of Object.keys(menuForToday)) {
      result[hallName] = Object.keys(menuForToday[hallName]); 
    }

    return new Response(JSON.stringify({ date: dateKey, halls: result }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
