CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  name        varchar(40) UNIQUE NOT NULL,
  slug        varchar(40) UNIQUE NOT NULL,
  summary     varchar NOT NULL,
  description varchar NOT NULL
);
