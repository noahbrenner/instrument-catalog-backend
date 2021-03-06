/**
 * These test mocks were modeled after tests in the express-jwt npm package.
 * The mock RSA keys were coppied directly from their mock directory:
 * https://github.com/auth0/node-jwks-rsa/blob/master/tests/mocks/keys.js
 */
import jose from "jose";
import jws from "jws";
import { rest } from "msw";
import { setupServer } from "msw/node";

const publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDdlatRjRjogo3WojgGHFHYLugd
UWAY9iR3fy4arWNA1KoS8kVw33cJibXr8bvwUAUparCwlvdbH6dvEOfou0/gCFQs
HUfQrSDv+MuSUMAe8jzKE4qW+jK+xQU9a03GUnKHkkle+Q0pX/g6jXZ7r1/xAK5D
o2kQ+X5xK9cipRgEKwIDAQAB
-----END PUBLIC KEY-----`;

const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIICWwIBAAKBgQDdlatRjRjogo3WojgGHFHYLugdUWAY9iR3fy4arWNA1KoS8kV
w33cJibXr8bvwUAUparCwlvdbH6dvEOfou0/gCFQsHUfQrSDv+MuSUMAe8jzKE4
qW+jK+xQU9a03GUnKHkkle+Q0pX/g6jXZ7r1/xAK5Do2kQ+X5xK9cipRgEKwIDA
QABAoGAD+onAtVye4ic7VR7V50DF9bOnwRwNXrARcDhq9LWNRrRGElESYYTQ6Eb
atXS3MCyjjX2eMhu/aF5YhXBwkppwxg+EOmXeh+MzL7Zh284OuPbkglAaGhV9bb
6/5CpuGb1esyPbYW+Ty2PC0GSZfIXkXs76jXAu9TOBvD0ybc2YlkCQQDywg2R/7
t3Q2OE2+yo382CLJdrlSLVROWKwb4tb2PjhY4XAwV8d1vy0RenxTB+K5Mu57uVS
THtrMK0GAtFr833AkEA6avx20OHo61Yela/4k5kQDtjEf1N0LfI+BcWZtxsS3jD
M3i1Hp0KSu5rsCPb8acJo5RO26gGVrfAsDcIXKC+bQJAZZ2XIpsitLyPpuiMOvB
bzPavd4gY6Z8KWrfYzJoI/Q9FuBo6rKwl4BFoToD7WIUS+hpkagwWiz+6zLoX1d
bOZwJACmH5fSSjAkLRi54PKJ8TFUeOP15h9sQzydI8zJU+upvDEKZsZc/UhT/Sy
SDOxQ4G/523Y0sz/OZtSWcol/UMgQJALesy++GdvoIDLfJX5GBQpuFgFenRiRDa
bxrE9MNUZ2aPFaFp+DyAe+b4nDwuJaW2LURbr8AEZga7oQj0uYxcYw==
-----END RSA PRIVATE KEY-----`;

const { AUTH0_DOMAIN, AUTH0_BACKEND_API_IDENTIFIER } = process.env;
const correctKid = "123";
const incorrectKid = "456";

const authEndpoint = `https://${AUTH0_DOMAIN}/.well-known/jwks.json`;
const parsed = jose.JWK.asKey(publicKey).toJWK();
const key = { ...parsed, use: "sig", kid: correctKid };
export const authServer = setupServer(
  rest.get(authEndpoint, (_req, res, ctx) => res(ctx.json({ keys: [key] })))
);

const fluteOwnerUserId = "seed.user|1";
const unseededUserId = "seed.user|99"; // Owns no instruments in our seed data

/** This user owns the instrument "Flute" and does not own "Double Bass" */
export const user = {
  id: fluteOwnerUserId,
  accessToken: jws.sign({
    secret: privateKey,
    header: { alg: "RS256", typ: "JWT", kid: correctKid },
    payload: {
      sub: fluteOwnerUserId,
      aud: AUTH0_BACKEND_API_IDENTIFIER, // Audience
      iss: `https://${AUTH0_DOMAIN}/`, // Issuer
    },
  }),
};

/** This user owns no instruments and is not in the users table */
export const unseededUser = {
  id: unseededUserId,
  accessToken: jws.sign({
    secret: privateKey,
    header: { alg: "RS256", typ: "JWT", kid: correctKid },
    payload: {
      sub: unseededUserId,
      aud: AUTH0_BACKEND_API_IDENTIFIER, // Audience
      iss: `https://${AUTH0_DOMAIN}/`, // Issuer
    },
  }),
};

/** This user owns no instruments but is an admin */
export const admin = {
  id: unseededUserId,
  accessToken: jws.sign({
    secret: privateKey,
    header: { alg: "RS256", typ: "JWT", kid: correctKid },
    payload: {
      sub: unseededUserId,
      "http:auth/roles": ["admin"],
      aud: AUTH0_BACKEND_API_IDENTIFIER, // Audience
      iss: `https://${AUTH0_DOMAIN}/`, // Issuer
    },
  }),
};

/** This user would be an admin, but has an invalid access token (bad kid) */
export const invalidUser = {
  id: fluteOwnerUserId,
  accessToken: jws.sign({
    secret: privateKey,
    header: { alg: "RS256", typ: "JWT", kid: incorrectKid },
    payload: {
      sub: "seed.user|1",
      "http:auth/roles": ["admin"],
      aud: AUTH0_BACKEND_API_IDENTIFIER, // Audience
      iss: `https://${AUTH0_DOMAIN}/`, // Issuer
    },
  }),
};
