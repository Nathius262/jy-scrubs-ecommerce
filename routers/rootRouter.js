import { Router } from "express";
import { index_view } from "../controllers/rootController.js";

const router = Router();

router.route('/')
    .get(index_view);


export default router;