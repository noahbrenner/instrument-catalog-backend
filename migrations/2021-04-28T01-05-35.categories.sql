CREATE TABLE categories (
  id
    SERIAL PRIMARY KEY,
  name
    varchar(40) NOT NULL UNIQUE,
  slug
    varchar(40) NOT NULL UNIQUE,
  summary
    varchar NOT NULL,
  description
    varchar NOT NULL
);
