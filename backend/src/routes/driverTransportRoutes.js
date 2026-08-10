import { Router } from "express";
import {
  assignedTrips, changeTripStatus, conditionReport, delayReport, emergencyReport, manifest, publishLocation, scanTicket, summary,
} from "../controllers/transportController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import requireRole from "../middleware/requireRole.js";
import { ROLES } from "../validators/authValidator.js";

const router = Router();
router.use(authMiddleware, requireRole(ROLES.DRIVER));
router.get("/trips", assignedTrips);
router.get("/trips/:id/passengers", manifest);
router.get("/trips/:id/summary", summary);
router.patch("/trips/:id/status", changeTripStatus);
router.put("/location", publishLocation);
router.post("/tickets/verify", scanTicket);
router.post("/reports/condition", conditionReport);
router.post("/reports/delay", delayReport);
router.post("/reports/emergency", emergencyReport);

export default router;
