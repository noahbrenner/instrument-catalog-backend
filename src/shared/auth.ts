import { Router } from "express";
import type { Request, RequestHandler } from "express";
import jwt from "express-jwt";
import jwksRsa from "jwks-rsa";

interface AuthRequest extends Request {
  user: {
    // Populated by jwt
    sub: string; // User ID
    "http:auth/roles"?: string[] | unknown;

    // Populated by requireAuth
    id: string;
    isAdmin: boolean;
  };
}

interface PartialAuthRequest extends AuthRequest {
  user: AuthRequest["user"] &
    Partial<Pick<AuthRequest["user"], "id" | "isAdmin">>;
}

/** Throw if the initial values from checkJwt have not been populated */
function assertPartialAuthRequest(
  req: Request | PartialAuthRequest
): asserts req is PartialAuthRequest {
  // We don't test for req.user["http:auth/roles"] because users can still
  // authenticate if it's missing, they just can't be an admin
  if (typeof (req as PartialAuthRequest)?.user?.sub !== "string") {
    throw new Error("Failed to identify user via JWT");
  }
}

/** Asserts that req.user.id and req.user.isAdmin are available */
export function assertAuthRequest(
  req: Request | AuthRequest
): asserts req is AuthRequest {
  assertPartialAuthRequest(req);
  const { id, isAdmin } = req.user;
  if (typeof id !== "string" || typeof isAdmin !== "boolean") {
    throw new Error("Failed to identify user");
  }
}

const { AUTH0_DOMAIN, AUTH0_BACKEND_API_IDENTIFIER } = process.env;
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),
  audience: AUTH0_BACKEND_API_IDENTIFIER,
  issuer: [`https://${AUTH0_DOMAIN}/`],
  algorithms: ["RS256"],
});

/**
 * Throws if user is unauthenticated, otherwise populates req.user
 *
 * Usage:
 *   import { requireAuth, assertAuthRequest } from "#shared/auth";
 *
 *   router.use("/needs-auth", requireAuth, (req, res) => {
 *     assertAuthRequest(req); // req is now typed as AuthRequest
 *     doThingsWith(req.user.id, req.user.isAdmin);
 *   });
 */
export const requireAuth = Router().use(checkJwt, ((req, _res, next) => {
  assertPartialAuthRequest(req);
  const roles = req.user["http:auth/roles"];
  req.user.isAdmin = Array.isArray(roles) && roles.includes("admin");
  req.user.id = req.user.sub;
  return next();
}) as RequestHandler);
