import express from "express";
import contractController from "../controllers/contract";

const router = express.Router();

router.post("/test", contractController.deploy);

export default router;
