import express, { Router } from "express";
import {checkout, processPayment} from '../controllers/cartController.js';


const router = Router();

router.get('/', checkout);
router.post('/process-payment', processPayment);

export default router;