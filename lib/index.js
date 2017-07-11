'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _pomaceBase = require('pomace-base');

var _process = require('./process');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var __state__ = {};

var Page = function () {
  function Page(name) {
    _classCallCheck(this, Page);

    this.name = name;
    this.face = null;
    this.renderTimes = 0;
    this.components = [];
    this.theme = {};
    this.process = {};
    this.preprocess = {};
    this.dothProcess = [];
    this.__style__ = null;
    this.__cap__ = null;
    this.__err__ = null;
    this.__mess__ = {};
    this.__state__ = {};
    this.__on__ = {};
    this.__call__ = {
      fetch: function fetch() {},
      cram: function cram() {}
    };
  }

  _createClass(Page, [{
    key: 'definePreprocess',
    value: function definePreprocess() {
      var preprocess = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      this.preprocess = preprocess;
    }
  }, {
    key: 'setup',
    value: function setup(doth) {
      var _this = this;

      doth({
        face: function face() {
          var tags = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

          _this.face = tags;
        },
        theme: function theme() {
          var style = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

          _this.theme = style;
        },
        components: function components() {
          var _components = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

          _this.components = _components;
        },
        connect: function connect() {
          var reset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

          _this.__call__.fetch = reset.fetch ? reset.fetch : function () {};
          _this.__call__.cram = reset.cram ? reset.cram : function () {};
        }
      });
    }
  }, {
    key: 'capture',
    value: function capture(cb) {
      var _this2 = this;

      this.__cap__ = function (errType) {
        cb && cb({
          type: errType,
          msg: _this2.__mess__[errType]
        });
      };
    }
  }, {
    key: 'message',
    value: function message(type, content) {
      this.__mess__[type] = content;
    }
  }, {
    key: 'render',
    value: function render() {
      var s = this;

      (0, _pomaceBase.sequence)(s.dothProcess).begin({
        fetch: function fetch() {
          return s.fetch.apply(s, arguments);
        },
        cram: function cram() {
          s.cram.apply(s, arguments);
        },
        dispatch: function dispatch() {
          s.__dispatch__.apply(s, arguments);
        },
        error: function error(type) {
          this.__cap__(type);
        },

        get RENDER_TIMES() {
          return s.renderTimes;
        }
      });
    }
  }, {
    key: 'fetch',
    value: function fetch(k) {
      var ic = this.__call__;
      var is = this.__state__;

      return typeof is[k] !== 'undefined' ? is[k] : ic.fetch(k);
    }
  }, {
    key: 'cram',
    value: function cram(k, v) {
      var ic = this.__call__;
      var is = this.__state__;

      ic.cram ? ic.cram(k, v) : null;

      is[k] = v;

      Page.store.cram(this.name + '_' + k, v);
    }
  }, {
    key: 'on',
    value: function on(n, doth) {
      var on = this.__on__;

      if (typeof doth === 'function') {
        on[n] = doth;
      } else if (on.hasOwnProperty(n) && typeof on[n] === 'function') {
        on[n](doth);
      } else {
        (0, _pomaceBase.errBreak)('Not defined ' + n + ' event by the page.');
      }
    }
  }, {
    key: '__theme__',
    value: function __theme__() {
      var theme = {};
      var css = '';

      if (_typeof(this.theme) === 'object') {
        for (var k in this.theme) {
          if (!this.theme.hasOwnProperty(k) || _typeof(this.theme[k]) !== 'object') {
            continue;
          }

          var thm = this.theme[k];
          var ithm = {};

          for (var z in thm) {
            ithm[(0, _process.camelToMiddleLine)(z)] = thm[z];
          }

          theme[(0, _process.camelToMiddleLine)(k)] = ithm;
        }

        for (var j in theme) {
          css += j + ' ' + JSON.stringify(theme[j], null, '\t').replace(/"/g, '').replace(/\,/g, ';');
        }
      }

      return css;
    }
  }, {
    key: '__dispatch__',
    value: function __dispatch__() {
      (0, _pomaceBase.debug)('[page] ' + this.name + ' (render ' + ++this.renderTimes + ' times)');

      var faceType = typeof arguments[0] === 'string' ? arguments[0] : null;
      var params = _typeof(arguments[0]) === 'object' ? arguments[0] : !arguments[1] ? {} : arguments[1];

      var name = this.name,
          components = this.components;

      var _css_ = this.__theme__();
      var face = this.face;


      if ((typeof face === 'undefined' ? 'undefined' : _typeof(face)) === 'object') {
        face = face.hasOwnProperty(faceType) ? face[faceType] : face['default'];
      }

      var header = (0, _pomaceBase.buildDOM)(document.head);
      var view = (0, _pomaceBase.buildDOM)(Page.view);
      var scope = (0, _pomaceBase.buildDOM)(document.body);
      var rendered = (0, _process.toStringNode)(face, Object.keys(components));

      if (!this.__style__) {
        var style = (0, _pomaceBase.buildDOM)('<style>');

        style.$$.html('\n' + _css_ + '\n');
        header.$$.last(style);
        this.__style__ = style;
      }

      rendered = (0, _process.toParamsVal)(params, rendered);
      rendered = (0, _process.toHtmlElement)(name, rendered);
      (0, _process.insertComponents)(rendered.children, components);
      view.$$.html('');
      view.$$.last(rendered.parent);

      if (view.$$.parent.tagName !== 'body') {
        scope.$$.last(view);
      }

      view = null;
      scope = null;
      rendered.parent = null;
      rendered.children = null;
      rendered = null;
    }
  }, {
    key: 'flow',
    get: function get() {
      var _this3 = this;

      return {
        process: function process(pn, doth) {
          if (typeof doth !== 'function') {
            (0, _pomaceBase.errBreak)(pn + '\'s doth must a function');
            return;
          }
          if (_this3.process.hasOwnProperty(pn)) {
            (0, _pomaceBase.errBreak)('Please rename your flow, ' + pn + ' is defined.');
            return;
          }

          var s = _this3;
          s.process[pn] = doth;

          s.dothProcess.push({
            key: pn,
            doth: !s.preprocess.hasOwnProperty(pn) && typeof s.preprocess[pn] !== 'function' ? s.process[pn] : function () {
              var _arguments = arguments;

              s.preprocess[pn](function () {
                s.process[pn].apply(s, _arguments);
              }, s);
            }
          });
        }
      };
    }
  }], [{
    key: 'PREVIEW_OFF',
    value: function PREVIEW_OFF() {
      var preview = document.getElementById('pomace-preview');

      if (preview === null) {
        return;
      }

      preview.style.display = 'none';
      preview = null;
    }
  }, {
    key: 'PREVIEW_ON',
    value: function PREVIEW_ON() {
      var preview = document.getElementById('pomace-preview');

      if (preview === null) {
        return;
      }

      preview.style.display = 'block';
      preview = null;
    }
  }, {
    key: 'view',
    get: function get() {
      var v = (0, _pomaceBase.searchDOM)('#pomace-view');

      v = v === null ? (0, _pomaceBase.buildDOM)('<div id="pomace-view">') : v;

      return v;
    }
  }, {
    key: 'store',
    get: function get() {
      return {
        cram: function cram(k, v, n) {
          __state__['' + (typeof n !== 'undefined' ? n + '_' : '') + k] = v;
        },
        fetch: function fetch(k, n) {
          return __state__['' + (typeof n !== 'undefined' ? n + '_' : '') + k];
        }
      };
    }
  }]);

  return Page;
}();

exports.default = Page;