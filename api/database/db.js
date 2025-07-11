import pg from "pg";

const { Pool } = pg;


export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  
  ssl: {
    rejectUnauthorized: false,
  },
});


export const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("Conexão com o PostgreSQL estabelecida com sucesso!");
    client.release(); // Libera o cliente de volta para o pool.
  } catch (error) {
    console.error("Falha ao conectar com a base de dados:", error);
  }
};
