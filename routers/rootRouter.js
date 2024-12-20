import { Router } from "express";
import { index_view, about_view, contact_view, terms_conditions_view, privacy_policy_view } from "../controllers/rootController.js";
import { searchProducts } from "../controllers/searchController.js";

const router = Router();

router.route('/')
    .get(index_view);

router.get('/about', about_view);
router.get('/privacy-policy', privacy_policy_view);
router.get('/contact', contact_view);
router.get('/terms-and-conditions', terms_conditions_view);


router.get('/search', searchProducts);
export default router;