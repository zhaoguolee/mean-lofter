'use strict';

exports.isMyPoster = function (req, res, next) {
    var selectedPoster = req.poster;
    var user = req.user;
    if (!user) {
        return res.status(401).json({
            message: '用户未登录'
        });
    } else if (selectedPoster.userId === user.id) {
        return next();
    } else {
        return res.status(403).send({message: '无权限进行操作'});
    }
};
