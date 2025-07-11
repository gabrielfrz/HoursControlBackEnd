export const Point = {
  createTable: `
    CREATE TABLE IF NOT EXISTS points (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      type TEXT NOT NULL
    );
  `,
};
