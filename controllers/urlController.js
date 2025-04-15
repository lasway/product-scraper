const urlService = require("../services/urlService");

exports.shortenUrl = (req, res) => {
  const result = urlService.createShortUrl(req.body);

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  res.json(result);
};

exports.redirectUrl = (req, res) => {
  const { shortCode } = req.params;
  const result = urlService.getOriginalUrl(shortCode);

  if (result.error === "not_found") {
    return res.status(404).json({ error: "URL not found" });
  }

  if (result.error === "expired") {
    return res.status(410).json({ error: "URL has expired" });
  }

  res.redirect(result.originalUrl);
};

exports.getStats = (req, res) => {
  const { shortCode } = req.params;
  const result = urlService.getStats(shortCode);

  if (result.error === "not_found") {
    return res.status(404).json({ error: "URL not found" });
  }

  if (result.error === "expired") {
    return res.status(410).json({ error: "URL has expired" });
  }

  res.json(result);
};
