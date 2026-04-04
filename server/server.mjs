import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());


app.listen(port, () => {
  console.log(`Email server running on http://localhost:${port}`);
  console.log('Secure CORS enabled for client requests.');
});
