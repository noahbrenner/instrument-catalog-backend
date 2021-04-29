-- We store as little user data as possible. The user ID comes from Auth0 and
-- from a 3rd party OAuth service (e.g. Google) if a user signs in with one.
-- This table exists mainly to simplify deleting a user, with the deletion
-- cascading on the instruments table.
CREATE TABLE users (
  id varchar PRIMARY KEY
);
