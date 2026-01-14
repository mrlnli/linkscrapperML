import fs from "fs";
import { chromium } from "playwright";

const LIST_URL = "custid=SELLER_ID_HERE"; // substitua SELLER_ID_HERE pelo id do vendedor

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeUrl(url) {
  if (!url) return "";
  return url.split("#")[0].split("?")[0];
}

async function autoScroll(page, times = 12) {
  for (let i = 0; i < times; i++) {
    await page.mouse.wheel(0, 2500);
    await sleep(1200);
  }
}

async function main() {
  const browser = await chromium.launch({
    headless: false, // pra debugar
    slowMo: 50,
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });

  console.log("abrindo lista do vendedor");
  await page.goto(LIST_URL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  // scroll
  console.log("carregando produtos");
  await autoScroll(page, 15);

  // coleta links dos anuncios
  console.log("coletando links");
  const rawLinks = await page.$$eval("a", (as) =>
    as.map((a) => a.href).filter(Boolean)
  );

  const links = new Set();

  for (const href of rawLinks) {
    const u = href.toLowerCase();

    // formatos de links comuns:
    // https://produto.mercadolivre.com.br/MLB-...
    // /MLB-...
    // links q tem seller_id em filtro e levam pro produto dps
    if (
      u.includes("/mlb-") ||
      u.includes("produto.mercadolivre.com.br") ||
      u.includes("item.mercadolivre.com.br")
    ) {
      links.add(normalizeUrl(href));
    }
  }

  const linkList = Array.from(links).filter((l) => l.includes("mercadolivre"));
  console.log(`encontrados ${linkList.length} links de produtos`);

  if (linkList.length === 0) {
    console.log("0 links, salvando um HTML pra debug.");
    const html = await page.content();
    fs.writeFileSync("debug-ml.html", html, "utf-8");
    console.log("salvei: debug-ml.html (abra no navegador e procure os links)");
    await browser.close();
    return;
  }

  const produtos = [];

  for (let i = 0; i < linkList.length; i++) {
    const link = linkList[i];
    console.log(`(${i + 1}/${linkList.length}) abrindo: ${link}`);

    try {
      await page.goto(link, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2000);

      // p ele tentar aceitar cookies ou popups
      const cookieBtn = await page.$("button:has-text('Aceitar'), button:has-text('Entendi')");
      if (cookieBtn) await cookieBtn.click().catch(() => {});

      const data = await page.evaluate(() => {
        const title =
          document.querySelector("h1")?.innerText?.trim() || "";

        // tenta pegar preço
        const priceFraction =
          document.querySelector(".andes-money-amount__fraction")?.innerText?.trim() ||
          document.querySelector("[data-testid='price-part']")?.innerText?.trim() ||
          "";

        // pegar imagens dos produtos
        const imgs = Array.from(document.querySelectorAll("img"))
          .map((img) => img.src || img.getAttribute("data-src") || "")
          .filter(Boolean)
          .filter((src) => src.includes("mlstatic"));

        return {
          title,
          priceFraction,
          imgs: Array.from(new Set(imgs)),
        };
      });

      const price = Number(
        (data.priceFraction || "")
          .replace(/\./g, "")
          .replace(",", ".")
          .replace(/[^\d.]/g, "")
      ) || 0;

      produtos.push({
        name: data.title,
        price,
        images: data.imgs,
        image: data.imgs?.[0] || "",
        mercadoLivreUrl: link,
      });
    } catch (e) {
      console.log(" erro nesse produto:", e.message);
    }
  }

  fs.writeFileSync("produtos-ml.json", JSON.stringify(produtos, null, 2), "utf-8");
  console.log(`gerado produtos-ml.json com ${produtos.length} produtos`);

  await browser.close();
}

main();
