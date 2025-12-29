// middlewares/error-handler.js
import CustomAPIError from '../errors/custom-api-error.js';
  
const errorHandlerMiddleware = (err, req, res, next) => {
  // Handle invalid JSON 
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error("from JSON.parse Invalid JSON:", err.message);
    return res.status(400).json({ msg: "Invalid JSON payload" });
  }

  // Handle known custom errors
  if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).json({ msg: err.message });
  }

  // Log unexpected errors
  console.error("Unhandled error:", err);

  return res.status(500).json({ msg: "Something went wrong, please try again" });
};

export default errorHandlerMiddleware;

