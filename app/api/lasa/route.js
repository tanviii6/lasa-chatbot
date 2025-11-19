import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

function extractHallFromMessages(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const text = messages[i].content.toLowerCase();
    if (text.includes("warren")) return "warren";
    if (text.includes("marciano")) return "marciano";
    if (text.includes("west")) return "west";
    if (text.includes("granby")) return "granby";
  }
  return null;
}

function extractMealFromMessages(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const text = messages[i].content.toLowerCase();
    if (text.includes("breakfast")) return "Breakfast";
    if (text.includes("lunch")) return "Lunch";
    if (text.includes("dinner")) return "Dinner";
  }
  return null;
}

function extractQueryItem(messages) {
  const keywords = ["pasta", "pizza", "salad", "soup", "chicken", "tofu", "rice"];
  for (let i = messages.length - 1; i >= 0; i--) {
    const text = messages[i].content.toLowerCase();
    const found = keywords.find(k => text.includes(k));
    if (found) return found;
  }
  return null;
}

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const hall = extractHallFromMessages(messages);
    const meal = extractMealFromMessages(messages);
    const itemQuery = extractQueryItem(messages);

    let apiData = null;
    let apiType = null;

    if (hall && meal) {
      const url = `http://localhost:3000/api/menu/structured?hall=${hall}&meal=${meal}`;
      const res = await fetch(url);
      apiData = await res.json();
      apiType = "structured";
    } 
    
    else if (itemQuery) {
      const url = `http://localhost:3000/api/menu/search?query=${itemQuery}`;
      const res = await fetch(url);
      apiData = await res.json();
      apiType = "search";
    } 
    
    else if (meal && !hall) {
      return new Response(
        JSON.stringify({
          reply: {
            role: "assistant",
            content: "Which dining hall?"
          }
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    } 
    
    else if (hall && !meal) {
      return new Response(
        JSON.stringify({
          reply: {
            role: "assistant",
            content: "Which meal? Breakfast, Lunch, or Dinner?"
          }
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const systemMessages = [
      {
        role: "system",
        content:
          "You are LASA, a BU Dining assistant. Always answer using provided menu data in apiData if available. Do not invent menu items."
      }
    ];

    if (apiType && apiData) {
      systemMessages.push({ role: "system", content: `apiType: ${apiType}` });
      systemMessages.push({
        role: "system",
        content: `apiData: ${JSON.stringify(apiData)}`
      });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [...systemMessages, ...messages],
      temperature: 0.4,
      max_completion_tokens: 300
    });

    const reply = completion.choices[0].message;

    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500
    });
  }
}
