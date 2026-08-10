import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import requireRole from "../middleware/requireRole.js";
import { approveDriver, pendingDrivers, rejectDriver } from "../controllers/adminController.js";
import { sendSuccess } from "../utils/response.js";
import { ROLES } from "../validators/authValidator.js";

function portalRouter(...roles) {
  const router = Router();
  router.use(authMiddleware, requireRole(...roles));
  router.get("/", (req, res) => sendSuccess(res, {
    data: {
      authorized: true,
      userType: req.user.userType,
      userId: req.user.id,
    },
  }));
  return router;
}

export const studentRouter = portalRouter(ROLES.STUDENT);
export const teacherRouter = portalRouter(ROLES.TEACHER);
export const staffRouter = portalRouter(ROLES.STAFF);
export const driverRouter = portalRouter(ROLES.DRIVER);
export const adminRouter = portalRouter(ROLES.TRANSPORT_ADMIN);
adminRouter.get("/drivers/pending", pendingDrivers);
adminRouter.put("/drivers/:id/approve", approveDriver);
adminRouter.put("/drivers/:id/reject", rejectDriver);
