import { Router } from "express";
import { index_view } from "../controllers/rootController.js";
import { searchProducts } from "../controllers/searchController.js";

const router = Router();

router.route('/')
    .get(index_view);

router.get('/search', searchProducts);
export default router;