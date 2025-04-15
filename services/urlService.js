const crypto = require("crypto");

const urlDatabase = new Map();
const originalUrlMap = new Map();

// Cleanup expired URLs periodically
setInterval(() => {
  const now = new Date();
  urlDatabase.forEach((urlData, shortCode) => {
    if (urlData.expiresAt && now > new Date(urlData.expiresAt)) {
      originalUrlMap.delete(urlData.originalUrl);
      urlDatabase.delete(shortCode);
      console.log(`Cleaned up expired URL: ${shortCode}`);
    }
  });
}, 3600000); // Every hour

function generateShortCode(length = 6) {
  return crypto
    .randomBytes(length)
    .toString("base64")
    .replace(/[+/=]/g, "")
    .substring(0, length);
}

exports.createShortUrl = ({ url, expireHours }) => {
  if (!url) {
    return { error: "URL is required" };
  }

  // Ensure protocol
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  try {
    new URL(url);
  } catch {
    return { error: "Invalid URL format" };
  }

  // Check for duplicate
  if (originalUrlMap.has(url)) {
    const shortCode = originalUrlMap.get(url);
    const urlData = urlDatabase.get(shortCode);
    return {
      shortCode,
      originalUrl: urlData.originalUrl,
      expiresAt: urlData.expiresAt,
      clicks: urlData.clicks,
      duplicate: true,
    };
  }

  let shortCode;
  do {
    shortCode = generateShortCode();
  } while (urlDatabase.has(shortCode));

  let expiresAt = null;
  if (expireHours && !isNaN(expireHours) && expireHours > 0) {
    expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + parseInt(expireHours));
  }

  const urlData = {
    originalUrl: url,
    shortCode,
    createdAt: new Date(),
    expiresAt,
    clicks: 0,
  };

  urlDatabase.set(shortCode, urlData);
  originalUrlMap.set(url, shortCode);

  return {
    shortCode,
    originalUrl: url,
    expiresAt,
    clicks: 0,
  };
};

exports.getOriginalUrl = (shortCode) => {
  if (!urlDatabase.has(shortCode)) {
    return { error: "not_found" };
  }

  const urlData = urlDatabase.get(shortCode);
  if (urlData.expiresAt && new Date() > new Date(urlData.expiresAt)) {
    originalUrlMap.delete(urlData.originalUrl);
    urlDatabase.delete(shortCode);
    return { error: "expired" };
  }

  urlData.clicks++;
  urlDatabase.set(shortCode, urlData);

  return { originalUrl: urlData.originalUrl };
};

exports.getStats = (shortCode) => {
  if (!urlDatabase.has(shortCode)) {
    return { error: "not_found" };
  }

  const urlData = urlDatabase.get(shortCode);
  if (urlData.expiresAt && new Date() > new Date(urlData.expiresAt)) {
    return { error: "expired" };
  }

  return {
    shortCode,
    originalUrl: urlData.originalUrl,
    createdAt: urlData.createdAt,
    expiresAt: urlData.expiresAt,
    clicks: urlData.clicks,
  };
};
