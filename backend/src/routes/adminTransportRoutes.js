import { Router } from "express";
import {
  getAdminBuses, getAdminDrivers, getAdminReservations, getAdminRoutes, getAdminSchedules, getAdminUsers,
  getAlerts, getAnalytics, getMaintenance, getOverview, putAdminBus, putAdminDriver, putAdminRoute,
  putAdminSchedule, putAdminUser, putMaintenance, removeAdminBus, removeAdminRoute, removeAdminSchedule,
} from "../controllers/transportController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import requireRole from "../middleware/requireRole.js";
import { ROLES } from "../validators/authValidator.js";

const router = Router();
router.use(authMiddleware, requireRole(ROLES.TRANSPORT_ADMIN));
router.get("/buses", getAdminBuses);
router.put("/buses", putAdminBus);
router.delete("/buses/:id", removeAdminBus);
router.get("/routes", getAdminRoutes);
router.put("/routes", putAdminRoute);
router.delete("/routes/:id", removeAdminRoute);
router.get("/schedules", getAdminSchedules);
router.put("/schedules", putAdminSchedule);
router.delete("/schedules/:id", removeAdminSchedule);
router.get("/reservations", getAdminReservations);
router.get("/users", getAdminUsers);
router.put("/users/:id", putAdminUser);
router.get("/drivers", getAdminDrivers);
router.put("/drivers/:id", putAdminDriver);
router.get("/maintenance", getMaintenance);
router.put("/maintenance/:id", putMaintenance);
router.get("/alerts", getAlerts);
router.get("/overview", getOverview);
router.get("/analytics", getAnalytics);

export default router;
