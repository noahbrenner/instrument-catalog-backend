CREATE TABLE instruments (
  id
    BIGSERIAL PRIMARY KEY,
  category_id
    INTEGER
    NOT NULL
    REFERENCES categories (id)
      ON DELETE RESTRICT ON UPDATE CASCADE,
  user_id
    varchar
    NOT NULL
    REFERENCES users (id)
      ON DELETE CASCADE ON UPDATE CASCADE,
  name
    varchar(30) NOT NULL CHECK (length(name) >= 1),
  summary
    varchar NOT NULL,
  description
    varchar NOT NULL,
  image_url
    varchar NOT NULL
);
