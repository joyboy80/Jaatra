import { Router } from "express";
import { aiContext, askAi } from "../controllers/aiController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import requireRole from "../middleware/requireRole.js";
import { ROLES } from "../validators/authValidator.js";

const router = Router();
router.use(authMiddleware, requireRole(ROLES.STUDENT, ROLES.TEACHER, ROLES.STAFF));
router.get("/context", aiContext);
router.post("/chat", askAi);
export default router;
