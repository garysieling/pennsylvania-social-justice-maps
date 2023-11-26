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
    /*
    HTTP/1.0 200 OK
Server: SimpleHTTP/0.6 Python/3.11.4
Date: Sun, 26 Nov 2023 19:36:23 GMT
Content-type: text/html
Content-Length: 11975
Last-Modified: Sun, 26 Nov 2023 19:36:21 GMT*/

/*
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: *
Link: </commons.js>; rel=preload; as=script
Link: </socket.io/socket.io.js>; rel=preload; as=script
Link: </page-data/app-data.json>; rel=preload; as=fetch ; crossorigin
Link: </page-data\sheet\page-data.json>; rel=preload; as=fetch ; crossorigin
Link: </page-data\404.html\page-data.json>; rel=preload; as=fetch ; crossorigin
Link: </page-data\dev-404-page\page-data.json>; rel=preload; as=fetch ; crossorigin
Link: </page-data/sq/d/2744905544.json>; rel=preload; as=fetch ; crossorigin
Accept-Ranges: bytes
Cache-Control: public, max-age=0
Last-Modified: Sun, 26 Nov 2023 19:40:07 GMT
ETag: W/"3cb-18c0d2573f3"
Content-Type: text/html; charset=UTF-8
Content-Length: 971
Vary: Accept-Encoding
Date: Sun, 26 Nov 2023 19:40:14 GMT
Connection: keep-alive
Keep-Alive: timeout=5*/
    app.use((req, res, next) => {
     res.set('Cross-Origin-Opener-Policy', 'same-origin');
     //res.set('Cross-Origin-Opener-Policy', 'unsafe-none');
     res.set('Referrer-Policy', 'origin-when-cross-origin');
     res.set('Access-Control-Allow-Origin', '*');
     //res.set('X-XSS-Protection', '0');
     next();
   });
 },
  headers: [
    {
      source: `/sheet`,
      headers: [
        
        {
          key: `X-Frame-Options`,
          value: `SAMEORIGIN`,
        },
        {
          key: `Access-Control-Allow-Origin`,
          value: `*`
        }
      ]
    }
  ]
};