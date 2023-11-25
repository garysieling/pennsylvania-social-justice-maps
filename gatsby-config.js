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
  developMiddleware: app => {
    app.use((req, res, next) => {
     res.set('Cross-Origin-Opener-Policy', 'same-origin');
     res.set('Referrer-Policy', 'origin-when-cross-origin');
     next();
   });
 },
  headers: [
    {
      source: `/sheet`,
      headers: [
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
        {
          key: `Access-Control-Allow-Origin`,
          value: `*`
        }
      ]
    }
  ]
};