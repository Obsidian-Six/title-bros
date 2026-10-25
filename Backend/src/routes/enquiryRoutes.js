import { Router } from "express";
import { createEnquiry } from "../controllers/enquiryController.js";

const router = Router();

router.post("/", createEnquiry);

export default router;