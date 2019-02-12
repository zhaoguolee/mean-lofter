'use strict';

var _ = require('lodash'),
    async = require('async'),
    commentsModel = require('../models/comments.server.model');

exports.save = function (req, res) {

    if (!req.body.content || !req.body.content.trim()) {
        return res.status(400).send({
            message: '内容不能为空'
        });
    }

    var user = req.user;

    var comment = {
        userId: user.id,
        targetId: req.body.targetId,
        replyId: req.body.replyId,
        content: req.body.content
    };
    commentsModel.save(comment, function (error, comment) {
        if (error) {
            return res.status(400).send({
                message: '系统暂不可用,请稍候再试'
            });
        }
        res.json(comment);
    });
};

exports.commentsByTargetId = function (req, res) {
    var targetId = req.params.targetId;
    commentsModel.commentsByTargetId(targetId, function (error, comments) {
        if (error) {
            return res.status(400).send({
                message: '系统暂不可用,请稍候再试'
            });
        }
        res.json(comments);
    });
};