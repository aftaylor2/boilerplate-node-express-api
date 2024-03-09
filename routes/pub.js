import express from 'express';

import { getPublicEndpointTest } from '../controllers/pub.js';

const router = express.Router({ mergeParams: true });

router.route('/test').get(getPublicEndpointTest);


export default router;