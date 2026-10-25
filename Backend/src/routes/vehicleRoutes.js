import { Router } from 'express';
import { decodeVin, getMakes, getModelsForMakeYear } from '../controllers/vehicleController.js';

const router = Router();

router.get('/decode-vin/:vin', decodeVin);
router.get('/makes', getMakes);
router.get('/makes/:year', getMakes);
router.get('/models/:make/:year', getModelsForMakeYear);

export default router;
