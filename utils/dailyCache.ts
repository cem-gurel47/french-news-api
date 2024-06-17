import type { News } from "@types~/news";
import Redis from "ioredis";
import { scrapeNews } from "@utils/news";
import cron from "node-cron";

const client = new Redis(
  `rediss://default:${process.env["REDIS_CACHE"]}@emerging-cougar-31836.upstash.io:6379`
);

export async function getNews() {
  const news = await client.get("news");

  if (!news) {
    throw new Error("No news found in cache");
  }

  return JSON.parse(news) as News[];
}

export async function setNews(news: News[]) {
  await client.set("news", JSON.stringify(news));
}

export async function setNewsDaily() {
  // delete previous news
  await client.del("news");

  const news = await scrapeNews();
  await setNews(news);
}

cron.schedule("0 0 * * *", setNewsDaily);
