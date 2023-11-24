/**
 * @type {import('gatsby').GatsbyConfig}
 */

module.exports = {
  siteMetadata: {
    title: `Montgomery County PA Maps`,
    siteUrl: `https://www.garysieling.com`
  },
  plugins: ["gatsby-plugin-theme-ui",
    {
      resolve: 'gatsby-plugin-react-leaflet',
      options: {
        linkStyles: true // (default: true) Enable/disable loading stylesheets via CDN
      }
    }
  ],
  headers: [
    {
      source: `/sheet`,
      headers: [
        {
          key: `cross-origin-opener-policy`,
          value: `unsafe-none`,
        },
        {
          key: `referrer-policy`,
          value: `origin-when-cross-origin` //strict-origin-when-cross-origin
        },
          {
          key: `x-xss-protection`,
          value: `0`,
        },
        {
          key: `x-content-type-options`,
          value: `nosniff`,
        },
        {
          key: `x-frame-options`,
          value: `DENY`,
        },
      ]
    }
  ]
};