let jwt = require('jsonwebtoken');
const UserSession = require('../models/UserSession');
const readFileSync = require('fs').readFileSync;
let privateKey = readFileSync('server/sslcert/server.key', 'utf8'); // privatekey for jwt

let verifyToken = function(req, res, next) {
    console.log('Verifying token.');
    let token = null;
    try {
    // x-access-token preferred
        token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'].split(' ')[1];
    } catch (err) {
        token = undefined;
    }
    if (!token) {
        return res.status(403).send({auth: false, message: 'No token provided.'});
    }

    jwt.verify(token, privateKey, function(err, decoded) {
        if (err) {
            if (err.name == 'TokenExpiredError') {
                console.log('Deleting token from db. Token doesn\'t exist');
                // delete token from UserSession
                UserSession.findOneAndRemove({
                    token: token
                }, (err) => {
                    if (err) {
                        return res.status(500).send({
                            success: false,
                            message: 'Error: Server error'
                        });
                    }
                });
            }
            return res.status(401).send({auth: false, err});
        }
        // save to request for use in other routes
        req.user_id = decoded.user_id;
        req.role = decoded.role;
        req.token = token;
        // Check log in status
        UserSession.findOne({
            token: token
        }, null, (err, session) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: 'Error: Server error'
                });
            }
            if (!session) {
                return res.status(401).send({
                    success: false,
                    message: 'Error: Invalid token.'
                });
            }
            next();
        });
    });
};

let requireRole = function(role) {
    return function(req, res, next) {
        verifyToken(req, res, function() {
            if (req.role != role) {
                return res.status(403).send({
                    success: false,
                    message: 'Error: Forbidden request.'
                });
            }
            next();
        });
    };
};

let verifyUser = function(req, res, next) {
    verifyToken(req, res, function() {
        if (req.params.userID == req.user_id || req.role == 'admin') {
            next();
        } else {
            return res.status(403).send({
                success: false,
                message: 'Error: Forbidden request.'
            });
        }
    });
};

// Use verifyToken to check if the token is valid
// Use verifyUser for non-admins when they want to access their own data
// Use requireRole for role specfic functions, for eg, instructors setting up assignments or admin signup

module.exports = {verifyToken, requireRole, verifyUser};
