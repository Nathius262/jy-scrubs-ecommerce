import express, { Router } from "express";
import {checkout, exchangeRate, verifyPaystackTransaction} from '../controllers/cartController.js';


const router = Router();

router.get('/api/convert-currency', exchangeRate);
router.get('/api/verify-payment', verifyPaystackTransaction);

router.get('/', checkout);

export default router;