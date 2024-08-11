import express from 'express';
import 'dotenv/config';
import helmet from 'helmet';
import morgan from 'morgan';
import pool from './src/configs/mysql_db.config.js';

const app = express();
app.use(helmet());
app.use(morgan('common'));

app.get('/', (req, res) => {
    res.send('Hello World');
});

(async () => {
    try {
        const connection = await pool.getConnection();
        console.log("\nConnected to MySQL database successfully\n\n");
        connection.release;
    } catch (err) {
        console.error("\nConnection failed: ", err);    
    }
})();

export default app;