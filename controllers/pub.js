// import ErrorResponse from '../utils/errorResponse';
import asyncHandler from '../middleware/async.js';

// @desc      Test Public Route
// @route     GET /public/test 
// @access    Public
export const getPublicEndpointTest = asyncHandler(async (_req, res, _next) =>
  res.status(200).json({desc: 'UNAUTHENTICATED PUBLIC endpoint test'})
);