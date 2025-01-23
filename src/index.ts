import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import compileRoute from "./routes/compile";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use("/contract", compileRoute);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
