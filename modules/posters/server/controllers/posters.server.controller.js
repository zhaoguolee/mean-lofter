'use strict';

var _ = require('lodash'),
    async = require('async'),
    path = require('path'),
    userModel = require(path.resolve('./modules/users/server/models/users.server.model')),
    postersModel = require('../models/posters.server.model.js'),
    mediasModel = require('../models/medias.server.model.js');

exports.textPoster = function (req, res) {

    if (!req.body.content || !req.body.content.trim()) {
        return res.status(400).send({
            message: '内容不能为空'
        });
    }

    var user = req.user;

    var poster = {
        userId: user.id,
        title: req.body.title || '',
        content: req.body.content,
        type: 0
    };
    postersModel.save(poster, function (error, poster) {
        if (error) {
            return res.status(400).send({
                message: '系统暂不可用,请稍候再试'
            });
        }
        res.json(poster);
    });
};

exports.mediaPoster = function (req, res) {

    var user = req.user;
    var medias = req.body.medias;

    if (_.isEmpty(medias) || !_.isArray(medias)) {
        return res.status(400).send({
            message: '请添加图片或者视频文件'
        });
    }

    if (medias.length > 12) {
        return res.status(400).send({
            message: '图片或者视频文件过多'
        });
    }

    var poster = {
        userId: user.id,
        title: req.body.title || '',
        content: req.body.content || '',
        type: req.body.type || 0
    };

    async.waterfall([
        savePoster,
        updateMedias
    ], function (error, result) {
        if (error) {
            return res.status(400).send({
                message: '系统暂不可用,请稍候再试'
            });
        }
        res.json(result);
    });

    function savePoster(callback) {
        postersModel.save(poster, function (error, result) {
            if (error) {
                callback(error);
                return;
            }
            callback(null, result);
        });
    }

    function updateMedias(poster, callback) {
        poster.medias = [];
        async.eachLimit(medias, 5, function (item, callback) {
            mediasModel.mediaById(item, function (error, result) {
                if (error) {
                    callback(error);
                    return;
                }
                if (result.userId !== user.id) {
                    console.error('poster.server.controller.mediaPoster error, userId is not correct');
                    callback({message: 'userId not correct'});
                    return;
                }
                var media = _.extend(result, {posterId: poster.id});
                mediasModel.update(media, function (error, result) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    poster.medias.push(result);
                    callback(null);
                });
            });
        }, function (error) {
            callback(error, poster);
        });
    }
};

exports.view = function (req, res) {
    var selectedPoster = req.poster;
    userModel.userById(selectedPoster.userId, function (error, result) {
        if (error) {
            return res.status(400).send({message: '系统暂不可用,请稍候再试'});
        }
        var selectedUser = result;
        if (selectedUser && selectedUser.status !== -1) {
            res.json({selectedUser: selectedUser, selectedPoster: selectedPoster});
        } else {
            return res.status(404).send({message: '你查找的页面不存在或者已经被删除'});

        }
    });
};

exports.update = function (req, res) {
    var selectedPoster = req.poster;
    delete selectedPoster.medias;

    if (selectedPoster.type === 0) {
        if (!req.body.content || !req.body.content.trim()) {
            return res.status(400).send({
                message: '内容不能为空'
            });
        }
    }
    selectedPoster.title = req.body.title || '';
    selectedPoster.content = req.body.content || '';

    postersModel.update(selectedPoster, function (error, poster) {
        if (error) {
            return res.status(400).send({
                message: '系统暂不可用,请稍候再试'
            });
        }
        res.json(poster);
    });
};

exports.delete = function (req, res) {
    var selectedPoster = req.poster;
    delete selectedPoster.medias;
    postersModel.delete(selectedPoster, function (error, poster) {
        if (error) {
            return res.status(400).send({
                message: '系统暂不可用,请稍候再试'
            });
        }
        res.json(poster);
    });
};

exports.postersByUser = function (req, res) {

    var selectedUser = req.selectedUser;

    var lastCreatedDate = req.query.lastCreatedDate;
    var rows = 50;
    var paramRows = Number(req.query.rows);
    if (paramRows > 0 && paramRows < 100) {
        rows = paramRows;
    }

    if (!selectedUser) {
        return res.status(404).send({
            message: '你访问的页面不存在'
        });
    }

    async.waterfall([
        postersByUser,
        mediasByPosters
    ], function (error, result) {
        if (error) {
            return res.status(400).send({
                message: '系统暂不可用,请稍候再试'
            });
        }
        res.json({selectedUser: selectedUser, posters: result});
    });

    function postersByUser(callback) {
        postersModel.postersByUser(selectedUser.id, lastCreatedDate, rows, function (error, posters) {
            if (error) {
                callback(error);
                return;
            }
            callback(null, posters);
        });
    }

    function mediasByPosters(posters, callback) {
        if (posters.length === 0) {
            callback(null, []);
            return;
        }
        var postersMap = {};
        _.each(posters, function (item) {
            item.medias = [];
            postersMap[item.id] = item;
        });
        mediasModel.mediasByPosters(posters, function (error, medias) {
            if (error) {
                callback(error);
                return;
            }
            _.each(medias, function (media) {
                postersMap[media.posterId].medias.push(media);
            });
            callback(null, posters);
        });
    }
};

exports.posterById = function (req, res, next, posterId) {

    async.waterfall([
        posterById,
        mediasByPosters
    ], function (error, poster) {
        if (error) {
            return next(error);
        }
        if (!poster) {
            return res.status(404).send({
                message: '你查找的页面不存在或者已经被删除'
            });
        }
        req.poster = poster;
        next();
    });

    function posterById(callback) {
        postersModel.posterById(posterId, function (error, result) {
            if (error) {
                callback(error);
                return;
            }
            var poster = result && result.status !== -1 ? result : null;
            callback(null, poster);
        });
    }

    function mediasByPosters(poster, callback) {
        if (!poster) {
            callback(null);
            return;
        }
        mediasModel.mediasByPosters(poster, function (error, medias) {
            if (error) {
                callback(error);
                return;
            }
            poster.medias = medias;
            callback(null, poster);
        });
    }
};

exports.recommend = function (req, res) {

    var user = req.user;

    async.waterfall([
        postersByUser,
        mediasByPosters
    ], function (error, result) {
        if (error) {
            return res.status(400).send({
                message: '系统暂不可用,请稍候再试'
            });
        }
        res.json({posters: result});
    });

    function postersByUser(callback) {
        postersModel.postersByUser(user.id, 0, 20, function (error, posters) {
            if (error) {
                callback(error);
                return;
            }
            callback(null, posters);
        });
    }

    function mediasByPosters(posters, callback) {
        if (posters.length === 0) {
            callback(null, []);
            return;
        }
        var postersMap = {};
        _.each(posters, function (item) {
            item.medias = [];
            postersMap[item.id] = item;
        });
        mediasModel.mediasByPosters(posters, function (error, medias) {
            if (error) {
                callback(error);
                return;
            }
            _.each(medias, function (media) {
                postersMap[media.posterId].medias.push(media);
            });
            callback(null, posters);
        });
    }
};