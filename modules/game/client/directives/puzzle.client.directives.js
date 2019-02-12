'use strict';

angular.module('game')
    .directive('puzzle', ['$window', function ($window) {
        var helper = {
            support: !!($window.CanvasRenderingContext2D)
        };

        return {
            restrict: 'A',
            template: '<canvas/>',
            link: function (scope, element, attributes) {

                if (!helper.support) return;

                var puzzleDifficulty = 2;
                var puzzleHoverHint = '#009900';

                var _canvas = element.find('canvas')[0];
                var _draw = _canvas.getContext('2d');

                var _img = new Image();
                _img.addEventListener('load', onImage, false);
                _img.src = scope.$eval(attributes.puzzleSrc);

                var _pieces;
                var _puzzleWidth;
                var _puzzleHeight;
                var _pieceWidth;
                var _pieceHeight;
                var _currentPiece;
                var _currentDropPiece;

                var _mouse;

                function onImage(e) {
                    var width = _img.width;
                    var height = _img.height;
                    _pieceWidth = Math.floor(width / puzzleDifficulty);
                    _pieceHeight = Math.floor(height / puzzleDifficulty);
                    _puzzleWidth = _pieceWidth * puzzleDifficulty;
                    _puzzleHeight = _pieceHeight * puzzleDifficulty;
                    setCanvas();
                    initPuzzle();
                }

                function setCanvas() {
                    _canvas.width = _puzzleWidth;
                    _canvas.height = _puzzleHeight;
                    _canvas.style.border = '1px solid black';
                }

                function initPuzzle() {
                    _pieces = [];
                    _mouse = {x: 0, y: 0};
                    _currentPiece = null;
                    _currentDropPiece = null;
                    _draw.drawImage(_img, 0, 0, _puzzleWidth, _puzzleHeight, 0, 0, _puzzleWidth, _puzzleHeight);
                    createTitle('开始');
                    buildPieces();
                }

                function createTitle(msg) {
                    _draw.fillStyle = '#000000';
                    _draw.globalAlpha = 0.4;
                    _draw.fillRect(100, _puzzleHeight - 40, _puzzleWidth - 200, 40);
                    _draw.fillStyle = '#FFFFFF';
                    _draw.globalAlpha = 1;
                    _draw.textAlign = 'center';
                    _draw.textBaseline = 'middle';
                    _draw.font = '20px Arial';
                    _draw.fillText(msg, _puzzleWidth / 2, _puzzleHeight - 20);
                }

                function buildPieces() {
                    var i;
                    var piece;
                    var xPos = 0;
                    var yPos = 0;
                    for (i = 0; i < puzzleDifficulty * puzzleDifficulty; i++) {
                        piece = {};
                        piece.sx = xPos;
                        piece.sy = yPos;
                        _pieces.push(piece);
                        xPos += _pieceWidth;
                        if (xPos >= _puzzleWidth) {
                            xPos = 0;
                            yPos += _pieceHeight;
                        }
                    }
                    _canvas.onmousedown = startPuzzle;
                }

                function startPuzzle() {
                    if (attributes.puzzleStartCallback) {
                        scope.$apply(attributes.puzzleStartCallback);
                    }
                    _pieces = shuffleArray(_pieces);
                    _draw.clearRect(0, 0, _puzzleWidth, _puzzleHeight);
                    var i;
                    var piece;
                    var xPos = 0;
                    var yPos = 0;
                    for (i = 0; i < _pieces.length; i++) {
                        piece = _pieces[i];
                        piece.xPos = xPos;
                        piece.yPos = yPos;
                        _draw.drawImage(_img, piece.sx, piece.sy, _pieceWidth, _pieceHeight, xPos, yPos, _pieceWidth, _pieceHeight);
                        _draw.strokeRect(xPos, yPos, _pieceWidth, _pieceHeight);
                        xPos += _pieceWidth;
                        if (xPos >= _puzzleWidth) {
                            xPos = 0;
                            yPos += _pieceHeight;
                        }
                    }
                    _canvas.onmousedown = onPuzzleClick;
                }

                function onPuzzleClick(e) {
                    var posx = 0;
                    var posy = 0;

                    if (e.pageX || e.pageY) {
                        posx = e.pageX;
                        posy = e.pageY;
                    } else if (e.clientX || e.clientY) {
                        posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                        posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                    }
                    _mouse.x = posx - _canvas.offsetLeft;
                    _mouse.y = posy - _canvas.offsetTop;

                    _currentPiece = checkPieceClicked();
                    if (_currentPiece) {
                        _draw.clearRect(_currentPiece.xPos, _currentPiece.yPos, _pieceWidth, _pieceHeight);
                        _draw.save();
                        _draw.globalAlpha = 0.9;
                        _draw.drawImage(_img, _currentPiece.sx, _currentPiece.sy, _pieceWidth, _pieceHeight, _mouse.x - (_pieceWidth / 2), _mouse.y - (_pieceHeight / 2), _pieceWidth, _pieceHeight);
                        _draw.restore();
                        _canvas.onmousemove = updatePuzzle;
                        _canvas.onmouseup = pieceDropped;
                    }
                }

                function checkPieceClicked() {
                    var i;
                    var piece;
                    for (i = 0; i < _pieces.length; i++) {
                        piece = _pieces[i];
                        if (_mouse.x < piece.xPos || _mouse.x > (piece.xPos + _pieceWidth) || _mouse.y < piece.yPos || _mouse.y > (piece.yPos + _pieceHeight)) {
                            //PIECE NOT HIT
                        }
                        else {
                            return piece;
                        }
                    }
                    return null;
                }

                function updatePuzzle(e) {
                    _currentDropPiece = null;
                    var posx = 0;
                    var posy = 0;

                    if (e.pageX || e.pageY) {
                        posx = e.pageX;
                        posy = e.pageY;
                    } else if (e.clientX || e.clientY) {
                        posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                        posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                    }
                    _mouse.x = posx - _canvas.offsetLeft;
                    _mouse.y = posy - _canvas.offsetTop;
                    _draw.clearRect(0, 0, _puzzleWidth, _puzzleHeight);
                    var i;
                    var piece;
                    for (i = 0; i < _pieces.length; i++) {
                        piece = _pieces[i];
                        if (piece === _currentPiece) {
                            continue;
                        }
                        _draw.drawImage(_img, piece.sx, piece.sy, _pieceWidth, _pieceHeight, piece.xPos, piece.yPos, _pieceWidth, _pieceHeight);
                        _draw.strokeRect(piece.xPos, piece.yPos, _pieceWidth, _pieceHeight);
                        if (!_currentDropPiece) {
                            if (_mouse.x < piece.xPos || _mouse.x > (piece.xPos + _pieceWidth) || _mouse.y < piece.yPos || _mouse.y > (piece.yPos + _pieceHeight)) {
                                //NOT OVER
                            }
                            else {
                                _currentDropPiece = piece;
                                _draw.save();
                                _draw.globalAlpha = 0.4;
                                _draw.fillStyle = puzzleHoverHint;
                                _draw.fillRect(_currentDropPiece.xPos, _currentDropPiece.yPos, _pieceWidth, _pieceHeight);
                                _draw.restore();
                            }
                        }
                    }
                    _draw.save();
                    _draw.globalAlpha = 0.6;
                    _draw.drawImage(_img, _currentPiece.sx, _currentPiece.sy, _pieceWidth, _pieceHeight, _mouse.x - (_pieceWidth / 2), _mouse.y - (_pieceHeight / 2), _pieceWidth, _pieceHeight);
                    _draw.restore();
                    _draw.strokeRect(_mouse.x - (_pieceWidth / 2), _mouse.y - (_pieceHeight / 2), _pieceWidth, _pieceHeight);
                }

                function pieceDropped(e) {
                    _canvas.onmousemove = null;
                    _canvas.onmouseup = null;
                    if (_currentDropPiece) {
                        var tmp = {xPos: _currentPiece.xPos, yPos: _currentPiece.yPos};
                        _currentPiece.xPos = _currentDropPiece.xPos;
                        _currentPiece.yPos = _currentDropPiece.yPos;
                        _currentDropPiece.xPos = tmp.xPos;
                        _currentDropPiece.yPos = tmp.yPos;
                    }
                    resetPuzzleAndCheckWin();
                }

                function resetPuzzleAndCheckWin() {
                    _draw.clearRect(0, 0, _puzzleWidth, _puzzleHeight);
                    var gameWin = true;
                    var i;
                    var piece;
                    for (i = 0; i < _pieces.length; i++) {
                        piece = _pieces[i];
                        _draw.drawImage(_img, piece.sx, piece.sy, _pieceWidth, _pieceHeight, piece.xPos, piece.yPos, _pieceWidth, _pieceHeight);
                        _draw.strokeRect(piece.xPos, piece.yPos, _pieceWidth, _pieceHeight);
                        if (piece.xPos !== piece.sx || piece.yPos !== piece.sy) {
                            gameWin = false;
                        }
                    }
                    if (gameWin) {
                        setTimeout(gameOver, 500);
                    }
                }

                function gameOver() {
                    if (attributes.puzzleFinishCallback) {
                        scope.$apply(attributes.puzzleFinishCallback);
                    }
                    _canvas.onmousedown = null;
                    _canvas.onmousemove = null;
                    _canvas.onmouseup = null;
                    initPuzzle();
                }

                function shuffleArray(o) {
                    for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
                    return o;
                }
            }
        };
    }]);