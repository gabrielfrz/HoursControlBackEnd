import pg from 'pg';
console.log('DATABASE_URL carregado no db.js:', process.env.DATABASE_URL);

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const connectDB = async () => {
  try {
    
    const client = await pool.connect();
    console.log('Conectado ao PostgreSQL via Neon!');
    client.release(); 
  } catch (error) {
    console.error('Erro ao conectar ao DB:', error);
    process.exit(1);
  }
};
