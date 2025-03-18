import express from "express";
import contractController from "../controllers/contract";

const router = express.Router();

router.post("/compile", contractController.compile);
router.post("/test", contractController.testContrat);
router.post("/verify", contractController.verifyContract);

export default router;
