const {makeRes} = require ('./controllerUtils.js');

const authenticateMiddleware = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json(makeRes(401, "unauthorized", null));
    }
    next();
};

module.exports = {
    authenticateMiddleware
}
