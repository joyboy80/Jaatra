import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();
router.use(authMiddleware);
router.get("/", getProfile);
router.put("/", updateProfile);

export default router;
