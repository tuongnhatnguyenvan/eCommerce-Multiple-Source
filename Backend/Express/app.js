import express from 'express';
import 'dotenv/config';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();
app.use(helmet());
app.use(morgan('common'));

app.get('/', (req, res) => {
    res.send('Hello World');
});

export default app;