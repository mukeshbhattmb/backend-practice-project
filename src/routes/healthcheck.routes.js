import { Router } from "express";
import { healthcheck } from "../controllers/healthcheck.controllers.js"

const router = Router()

router.route("/").get(healthcheck)


export default router
















// import { Router } from "express";
// import { healthCheck } from "../controllers/healthcheck.controllers.js";

// const router = Router();

// router.route("/").get(healthCheck)

// export default router