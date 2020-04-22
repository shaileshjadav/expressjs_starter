const jwt = require('jsonwebtoken');

module.exports = {
  validateToken: (req, res, next) => {
    const token = req.body.token; 
    let result;
    if (token) {
    //   const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
     
      console.log(token);
      try {
        result = jwt.verify(token, process.env.JWT_SECRET);
        req.decoded = result;
        next();
      } catch (err) {
        // throw new Error(err);
        if(err){
            result = { 
                error: `Authentication error. Token is invalid.`,
                status: 401 
            };
            res.status(401).send(result);
        }
      }
    } else {
      result = { 
        error: `Authentication error. Token required.`,
        status: 401 
      };
      res.status(401).send(result);
    }
  }
};