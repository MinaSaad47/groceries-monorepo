import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export const registry = new OpenAPIRegistry();

export const bearerAuth = registry.registerComponent(
  "securitySchemes",
  "bearerAuth",
  {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  }
);

export const oauth2Auth = registry.registerComponent(
  "securitySchemes",
  "oauth2Auth",
  {
    type: "oauth2",
    flows: {
      implicit: {
        authorizationUrl: "/auth/google",
        scopes: [],
        tokenUrl: "/auth/google/callback",
      },
    },
  }
);
