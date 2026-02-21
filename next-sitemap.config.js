/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://blossomjewellery.art",
  generateRobotsTxt: false,
  changefreq: "weekly",
  priority: 0.7,
  sitemapSize: 5000,
  exclude: [
    "/studio",
    "/studio/**",
    "/api/**",
    "/admin",
    "/admin/**",
    "/account",
    "/account/**",
    "/checkout/**",
  ],
};
