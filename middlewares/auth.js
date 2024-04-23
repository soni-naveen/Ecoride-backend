const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.auth = async (req, res, next) => {
  try {
    // extract JWT token
    const token =
      req.cookies.token || req.header("Authorization").replace("Bearer ", "");

    // if token is missing, then return response
    if (!token || token == undefined) {
      return res.status(401).json({
        success: false,
        message: "Token Missing!",
      });
    }

    //verity the token
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload;
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "token is invalid",
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Something went wrong, while validating the token",
    });
  }
};

//The code req.header("Authorization").replace("Bearer ", ""); is used to extract the token part from an Authorization header in a HTTP request.

// Here's a breakdown of how it works:

// req.header("Authorization"): This retrieves the value of the Authorization header from the HTTP request. For example, if the Authorization header is "Bearer <token>", this call would return "Bearer <token>".
// .replace("Bearer ", ""): This method is used to remove the "Bearer " prefix from the authorization string. The replace function replaces all occurrences of the specified string ("Bearer ") with the replacement string (an empty string ""). This effectively removes the "Bearer " prefix, leaving only the token part.

// So, if req.header("Authorization") is "Bearer <token>", then req.header("Authorization").replace("Bearer ", "") would return just "<token>".
