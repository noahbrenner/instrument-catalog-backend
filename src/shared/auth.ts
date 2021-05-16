import { Router } from "express";
import type { Request } from "express";
import jwt from "express-jwt";
import jwksRsa from "jwks-rsa";

interface InitialAuthRequest extends Request {
  user: {
    // Populated by checkJwt
    sub: string; // User ID
    "http:auth/roles"?: string[] | unknown;

    // `id` is included so we can assign to it, making an AuthRequest
    id: unknown;
  };
}

interface AuthRequest extends Request {
  user: {
    id: string;
  };
}

/** Type guard for InitialAuthRequest */
function isInitialAuthRequest(req: Request): req is InitialAuthRequest {
  // req.user["http:auth/roles"] can be missing, so we don't check for it
  return typeof (req as InitialAuthRequest).user?.sub === "string";
}

/** Type guard for AuthRequest */
function isAuthRequest(req: Request): req is AuthRequest {
  return typeof (req as AuthRequest).user?.id === "string";
}

function userIsAdmin(user: Partial<InitialAuthRequest["user"]>): boolean {
  const roles = user["http:auth/roles"];
  return Array.isArray(roles) && roles.includes("admin");
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
 * Errors if user is unauthenticated, otherwise populates req.user.id
 *
 *     app.use("/needs-auth", requireAuth, (req, res) => {
 *       // req.user.id is populated
 *     });
 */
export const requireAuth = Router().use(checkJwt, (req, _res, next) => {
  if (isInitialAuthRequest(req)) {
    // Alias `user.sub` to the more intuitive `user.id`
    (req as AuthRequest).user.id = req.user.sub;
    next();
  } else {
    next(new Error("Failed to identify user via JWT"));
  }
});

/**
 * Returns true if req.user owns resource OR if req.user is an admin
 *
 * When used as a type guard, enables access to req.user.id
 *
 *     if (requestUserCanModify(req, someResource)) {
 *       doSomethingWith(req.user.id);
 *     }
 */
export function requestUserCanModify<Resource extends { userId: string }>(
  req: Request,
  resource: Resource
): req is AuthRequest {
  return (
    isAuthRequest(req) &&
    (req.user.id === resource.userId || userIsAdmin(req.user))
  );
}
