import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import routers from "./routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use("/contract", routers);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
