import { Router } from 'express';
import {
  getHealthStatus,
  testGroqApi,
  parseShoppingRequest,
  getRecommendations,
  getAlternatives
} from '../controllers/aiController.js';

const router = Router();

// Health check and Groq connectivity test
router.get('/health', getHealthStatus);
router.post('/test', testGroqApi);

// Core Phase 2 AI endpoints
router.post('/parse-request', parseShoppingRequest);
router.post('/recommendations', getRecommendations);
router.post('/alternatives', getAlternatives);

export default router;
