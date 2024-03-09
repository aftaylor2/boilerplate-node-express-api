import ErrorResponse from '../utils/errorResponse.js';

const defaultMsg = 'Server Error';
const defaultCode = 500; // Default Error Code

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  if (!error) next();

  error.message = err.message;

  // Log to console
  if (err.message !== 'Unauthorized access to route') console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = new ErrorResponse(`Resource not found`, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error = new ErrorResponse('Duplicate field value entered', 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  // Additional logic for handling SyntaxError or TypeError
  const invalidData = err instanceof SyntaxError;
  const invalidType = err instanceof TypeError;

  if (invalidData)  error = new ErrorResponse('Invalid date', defaultCode);
  if (invalidType)  error = new ErrorResponse('Invalid type', defaultCode);

  return res.status(error.statusCode || defaultCode).json({
    success: false,
    error: error.message || defaultMsg
  });
};


export default errorHandler;
