'use strict';

/**
 * Check Login
 */
exports.isLogin = function (req, res, next) {

    if (req.user) {
        return next();
    } else {
        return res.status(401).json({
            message: '用户未登录'
        });
    }
};
