export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/reply" && request.method === "POST") {
      try {
        const data = await request.json();

        const message = data.message || "";
        const tone = data.tone || "Friendly";
        const length = data.length || "Medium";

        if (!message.trim()) {
          return new Response(
            JSON.stringify({ error: "Please enter a message." }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" }
            }
          );
        }

        const prompt = `
You are ReplyGen, an AI assistant that writes replies to messages.

Original message:
"${message}"

Tone: ${tone}
Length: ${length}

Write exactly 3 different reply suggestions.
Return ONLY a JSON array of 3 strings.
Do not use markdown.
`;

        const result = await env.AI.run(
          "@cf/meta/llama-3.1-8b-instruct",
          {
            prompt: prompt
          }
        );

        let text = result.response || "";

        let replies;

        try {
          replies = JSON.parse(text);
        } catch {
          replies = [
            text,
            "Thanks for your message! I'll get back to you soon.",
            "I appreciate your message. Let's stay in touch!"
          ];
        }

        return new Response(
          JSON.stringify({ replies }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );

      } catch (error) {
        return new Response(
          JSON.stringify({ error: "AI request failed." }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};
