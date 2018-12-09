"use strict";

function _templateObject() {
  var data = _taggedTemplateLiteral([""]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// LILFORM - by Benjamin Pang, aka @molarmanful
// (c) MIT 2018
// libs
var async = require('async'); // helpers


var rand = function rand(x, y) {
  var X = Math.min(x, y);
  var Y = Math.max(x, y);
  return (0 | Math.random() * (Y - X + 1)) + X;
};

var dist = function dist(x, y, a, b) {
  return Math.pow(Math.pow(x - a, 2) + Math.pow(y - b, 2), .5);
};

var sort = function sort(x, y) {
  return x.sort(function (a, b) {
    return y(a) - y(b);
  });
};

var sort2 = function sort2(x, y, z) {
  return x.sort(function (a, b) {
    return y(a) - y(b) || z(a) - z(b);
  });
};

var Env =
/*#__PURE__*/
function () {
  function Env(rows, cols) {
    _classCallCheck(this, Env);

    this.rows = rows;
    this.cols = cols;
    this.food = [];
    this.cell = [];
    this.type = 0;
  } // for printing/debugging purposes


  _createClass(Env, [{
    key: "toString",
    value: function toString() {
      var _this = this;

      var x = _toConsumableArray(new Array(this.rows * this.cols));

      this.cell.map(function (a) {
        x[_this.cols * a.row + a.col] = a.type + '';
      });
      return x.map(function (a, b) {
        return (a || ' ') + ((b + 1) % _this.cols ? ' ' : '\n');
      }).join(_templateObject());
    } // initialization of objects in env

  }, {
    key: "addFood",
    value: function addFood(row, col, energy, regen) {
      this.food.push(new Food(this, row, col, energy, regen));
      return this;
    }
  }, {
    key: "addCell",
    value: function addCell(row, col, type, cost, energy, sight, lim) {
      this.cell.push(new Cell(this, row, col, type, cost, energy, sight, lim));
      return this;
    } // env cleaning functions

  }, {
    key: "cull",
    value: function cull() {
      var _this2 = this;

      async.parallel([function (_) {
        return _this2.food = _this2.food.filter(function (a) {
          return a.energy > 0;
        });
      }, function (_) {
        return _this2.cell = _this2.cell.filter(function (a) {
          return a.energy > 0;
        });
      }]);
      return this;
    } // running sim

  }, {
    key: "step",
    value: function step() {
      var _this3 = this;

      // cell actions
      async.eachOf(this.cell, function (a, b) {
        if (_this3.cell[b]) _this3.cell[b].decide(_this3.food, _this3.cell);
      }); // food regen

      async.eachOf(this.food, function (a, b) {
        if (_this3.food[b]) _this3.food[b].add(1);
      });
      this.cull();
      return this;
    }
  }]);

  return Env;
}();

var Food =
/*#__PURE__*/
function () {
  function Food(env) {
    var row = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : rand(0, env.rows - 1);
    var col = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : rand(0, env.cols - 1);
    var energy = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : rand(1, 100);
    var regen = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : rand(1, energy);

    _classCallCheck(this, Food);

    this.env = env;
    this.row = row;
    this.col = col;
    this.energy = energy;
    this.base = energy;
    this.regen = regen;
  } // for printing/debugging purposes


  _createClass(Food, [{
    key: "toString",
    value: function toString() {
      return "F[".concat(this.row, ",").concat(this.col, "]").concat(this.energy);
    } // modify food energy

  }, {
    key: "drain",
    value: function drain(x) {
      this.energy -= x;
      return this;
    }
  }, {
    key: "add",
    value: function add() {
      var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.regen;
      if (this.energy < this.base) this.energy += x;
      return this;
    }
  }]);

  return Food;
}();

var Cell =
/*#__PURE__*/
function () {
  function Cell(env) {
    var row = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : rand(0, env.rows - 1);
    var col = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : rand(0, env.cols - 1);
    var type = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : env.type++;
    var cost = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : rand(1, 10);
    var energy = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : rand(cost * 2, cost * 10);
    var sight = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : rand(1, 10);
    var lim = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : rand(cost * 10, cost * 20);

    _classCallCheck(this, Cell);

    this.env = env;
    this.row = row;
    this.col = col;
    this.type = type; // energy management

    this.cost = cost;
    this.energy = energy;
    this.base = energy; // senses for finding food, reacting to env, etc.

    this.sight = sight; // cell duplication limit

    this.lim = lim;
  } // for printing/debugging purposes


  _createClass(Cell, [{
    key: "toString",
    value: function toString() {
      return "C".concat(this.type, "[").concat(this.row, " ").concat(this.col, "]{").concat(this.cost, " ").concat(this.sight, " ").concat(this.lim, "}").concat(this.energy, "/").concat(this.base);
    } // acting function

  }, {
    key: "decide",
    value: function decide(food, cell) {
      var _this4 = this;

      if (this.energy <= 0) return this; // if the cell doesn't have enough energy to move, then slowly die

      if (this.energy < this.cost) {
        this.move(0, 0);
        return this;
      } // get "killable" cell that is not own type


      var aroundc = this.findFood(cell); // get all food unoccupied by a cell

      var aroundf = this.findFood(food).filter(function (a) {
        return aroundc.filter(function (b) {
          return a.row == b.row && a.col == b.col;
        }).length == 0;
      });
      if (!aroundf.length) aroundf = this.findFood(food); // find nearest food/cell

      var nearing = sort2(_toConsumableArray(aroundf).concat(_toConsumableArray(aroundc)), function (a) {
        return dist(_this4.row, _this4.col, a.row, a.col);
      }, function (a) {
        return -a.energy;
      });
      var near = nearing[0];

      if (near) {
        // reproduce
        if (near.constructor == Cell && this.energy < near.energy) this.rep(near); // eat

        if (this.row == near.row && this.col == near.col) this.eat(near); // move towards nearest landmark
        else {
            var row = Math.sign(near.row - this.row);
            var col = Math.sign(near.col - this.col);
            this.move(row, col);
          } // move randomly until something appears nearby
      } else this.rmove(); // duplicate


      if (this.energy >= 2 * this.base) this.dup();
      return this;
    } // essential functions

  }, {
    key: "move",
    value: function move(r, c) {
      this.row += r;
      this.col += c; // idleness reduces energy by 1

      this.drain(r || c ? this.cost : 1);
      return this;
    }
  }, {
    key: "rmove",
    value: function rmove() {
      var row = rand(-1, 1);
      var col = rand(-1, 1); // wall constraints

      if (this.row == 0) row = rand(0, 1);
      if (this.row == this.env.rows - 1) row = rand(-1, 0);
      if (this.col == 0) col = rand(0, 1);
      if (this.col == this.env.cols - 1) col = rand(-1, 0);
      this.move(row, col);
      return this;
    }
  }, {
    key: "eat",
    value: function eat(x) {
      var y = x.energy;
      var X = y < this.cost ? y : this.cost;
      this.energy += X; // reduce food's energy

      if (x.constructor == Food) {
        var eating = this.env.food.findIndex(function (a) {
          return a.row == x.row && a.col == x.col && a.energy == x.energy;
        });
        this.env.food[eating].drain(X);
      } else {
        var _eating = this.env.cell.findIndex(function (a) {
          return a.type == x.type && a.row == x.row && a.col == x.col && a.energy == x.energy;
        });

        this.env.cell[_eating].drain(X);
      }

      return this;
    }
  }, {
    key: "drain",
    value: function drain(x) {
      this.energy -= x;
      return this;
    }
  }, {
    key: "dlim",
    value: function dlim(x) {
      this.lim -= x;
      if (this.lim <= 0) this.drain(this.energy);
      return this;
    }
  }, {
    key: "dup",
    value: function dup() {
      this.env.addCell(this.row, this.col, this.type, this.cost, this.base, this.sight);
      this.drain(this.base);
      this.dlim(this.cost);
      return this;
    }
  }, {
    key: "rep",
    value: function rep(x) {
      this.env.addCell(this.row, this.col, this.type, rand(this.cost, x.cost), rand(this.base, x.base), rand(this.sight, x.sight));
      this.drain(this.cost);
      this.dlim(this.cost);
      return this;
    } // check if food is within sight

  }, {
    key: "findFood",
    value: function findFood(food) {
      var _this5 = this;

      return food.filter(function (a) {
        return a.energy > 0 && a.type != _this5.type && dist(a.row, a.col, _this5.row, _this5.col) <= _this5.sight;
      });
    }
  }]);

  return Cell;
}();

if (typeof module !== 'undefined' && module.exports) module.exports = Env;