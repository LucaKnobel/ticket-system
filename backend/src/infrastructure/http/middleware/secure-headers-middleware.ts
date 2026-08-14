import { createMiddleware } from "hono/factory";
import { secureHeaders } from "hono/secure-headers";

/**
 * Applies security headers relevant to the JSON API.
 * Browser document policies such as CSP are configured by the frontend web server.
 */
export const secureHeadersMiddleware = createMiddleware(async (c, next) => {
  const middleware = secureHeaders({
    xContentTypeOptions: "nosniff",
    referrerPolicy: "no-referrer",
    xFrameOptions: false,
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
  });

  return middleware(c, next);
});
