import type { News } from "@types~/news";
import puppeteer from "puppeteer";

export async function scrapeNews() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("https://www.lemonde.fr/politique/");

  // select all section elements with a class of "teaser teaser--highlight "
  const urls = await page.evaluate(() => {
    // accept all cookies
    document.querySelector("button[data-gdpr-expression='acceptAll']").click();

    const articles = Array.from(
      document.querySelectorAll("section.teaser.teaser--highlight")
    );

    return articles.map((article) => {
      return article.querySelector("a").href;
    });
  });

  const newsPromises = urls.map(async (url) => {
    const articlePage = await browser.newPage();
    await articlePage.goto(url);
    // Perform your actions on the article page
    const news = await articlePage.evaluate(() => {
      const title = document.querySelector("h1.article__title")
        .textContent as string;
      const description = document.querySelector("p.article__desc")
        .textContent as string;
      const content = document.querySelector("section.article__wrapper")
        .textContent as string;
      const date = new Date().toISOString();

      return {
        title,
        content,
        description,
        date,
      };
    });

    await articlePage.close();

    return news as News;
  });

  const news = await Promise.all(newsPromises);

  await browser.close();

  return news;
}
