import figlet from "figlet";
import { getNews } from "@utils/dailyCache";

const server = Bun.serve({
  port: 3000,
  development: true,
  async fetch(req) {
    const url = new URL(req.url);
    switch (url.pathname) {
      case "/":
        return new Response(figlet.textSync("Hello World!"));
      case "/news":
        const news = await getNews();

        return new Response(JSON.stringify(news));

      default:
        return new Response(figlet.textSync("Not Found"), { status: 404 });
    }
  },
  error(error) {
    return new Response(`<pre>${error}\n${error.stack}</pre>`, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  },
});

console.log(`Listening on http://localhost:${server.port} ...`);
