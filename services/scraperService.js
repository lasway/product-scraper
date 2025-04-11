const puppeteer = require("puppeteer");
const Product = require("../models/product");

class ScraperService {
  async scrapeProducts() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();

      await page.goto(process.env.TARGET_URL, { waitUntil: "networkidle2" });

      const products = await page.evaluate(() => {
        const productElements = document.querySelectorAll(".product_pod");

        return Array.from(productElements).map((product) => {
          const nameElement = product.querySelector("h3 a");
          const priceElement = product.querySelector(".price_color");
          const ratingElement = product.querySelector(".star-rating");
          const productLinkElement = product.querySelector("h3 a");
          const imageElement = product.querySelector("img");

          const ratingMapping = {
            One: 1,
            Two: 2,
            Three: 3,
            Four: 4,
            Five: 5,
          };

          const ratingClass = ratingElement ? ratingElement.classList[1] : "";
          const rating = ratingMapping[ratingClass] || 0;

          return {
            name: nameElement
              ? nameElement.getAttribute("title").trim()
              : "Unknown Product",
            price: priceElement
              ? parseFloat(priceElement.innerText.replace(/[^0-9.]/g, ""))
              : 0,
            description: "No description available",
            rating: rating,
            productUrl: productLinkElement
              ? "https://books.toscrape.com" +
                productLinkElement.getAttribute("href")
              : "",
            imageUrl: imageElement ? imageElement.getAttribute("src") : "",
          };
        });
      });

      for (const product of products) {
        await this.upsertProduct(product);
      }

      console.log("Product data updated successfully");

      // Handle pagination (optional)
      const nextPageButton = await page.$("li.next a");
      if (nextPageButton) {
        const nextPageUrl = await page.evaluate(
          (button) => button.getAttribute("href"),
          nextPageButton
        );
        await page.goto(`https://books.toscrape.com/catalogue${nextPageUrl}`, {
          waitUntil: "networkidle2",
        });
        await this.scrapeProducts();
      }
    } catch (error) {
      console.error("Error during scraping:", error);
    } finally {
      await browser.close();
    }
  }

  async upsertProduct(productData) {
    try {
      await Product.findOneAndUpdate(
        { productUrl: productData.productUrl },
        {
          ...productData,
          lastUpdated: new Date(),
        },
        { upsert: true, new: true, runValidators: true }
      );
    } catch (error) {
      console.error(`Error upserting product: ${error.message}`);
    }
  }
}

module.exports = new ScraperService();
