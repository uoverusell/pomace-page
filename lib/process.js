'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.insertComponents = exports.toHtmlElement = exports.camelToMiddleLine = exports.toParamsVal = exports.toStringNode = undefined;

var _pomaceBase = require('pomace-base');

var obj = {};

var tag = {
  close: function close(f) {
    return new RegExp('{#' + f + '/}');
  },
  start: function start(f) {
    return new RegExp('{#' + f + '}');
  },
  end: function end(f) {
    return new RegExp('{#\\/' + f + '}');
  },
  normal: function normal(f) {
    return new RegExp('(\\{#' + f + '*?\\}(.|\\n)*?\\{#\\/' + f + '*?\\})+');
  }
};

var noChild = function noChild(str, f) {
  var nodeFormat = '\n     <CHORUS_NODE_' + String(f).toUpperCase() + ' class="__chrousNode__" fieldName="' + f + '">\n     </CHORUS_NODE_' + String(f).toUpperCase() + '>\n    ';
  return str.replace(tag.close(f), nodeFormat);
};

var hasChild = function hasChild(str, f) {
  return str.replace(tag.normal(f), function (str) {
    var nodeStartFormat = '<CHORUS_NODE_' + String(f).toUpperCase() + ' class="__chrousNode__" fieldName="' + f + '">';
    var nodeEndFormat = '</CHORUS_NODE_' + String(f).toUpperCase() + '>';

    str = str.replace(tag.start(f), nodeStartFormat);
    str = str.replace(tag.end(f), nodeEndFormat);

    return str;
  });
};

var toStringNode = exports.toStringNode = obj.toStringNode = function (str, keys) {
  for (var i = 0; i < keys.length; i++) {
    str = noChild(str, keys[i]);
    str = hasChild(str, keys[i]);
  }

  str = str.replace(tag.normal('[a-zA-Z0-9_]'), '');
  str = str.replace(tag.close('[a-zA-Z0-9_]'), '');

  return str;
};

var toParamsVal = exports.toParamsVal = obj.toParamsVal = function (params, str) {
  for (var k in params) {
    str = str.replace(new RegExp('\\{\\$' + k + '\\}', 'g'), params[k]);
  }
  return str;
};

var camelToMiddleLine = exports.camelToMiddleLine = obj.camelToMiddleLine = function (str) {
  var newStr = [];

  for (var i = 0; i < str.length; i++) {
    var letter = str.charAt(i);

    if (/[A-Z]/g.test(letter)) {
      newStr[i] = '-' + letter.toLowerCase();
    } else {
      newStr[i] = letter;
    }
  }

  return newStr.join('');
};

var toHtmlElement = exports.toHtmlElement = obj.toHtmlElement = function (name, str) {
  var node = null;

  if (/(<.+>(.|\n)+<\.+>)*?/g.test(str)) {
    var builder = (0, _pomaceBase.buildDOM)('<div>');
    var arr = str.match(/<(.|\n)+>/g);

    str = arr !== null ? arr.join('') : '';
    builder.$$.html(str);
    node = (0, _pomaceBase.gartherDOM)(builder.$$.child);
  } else {
    return '';
  }

  if (node === null) {
    throw 'Page ' + name + ' create this face is fail.';
  }

  var chorusNodes = node.$$.searchAll('.__chrousNode__');
  var fields = {};

  chorusNodes.map(function (cn) {
    var fieldName = cn.getAttribute('fieldName');
    fields[fieldName] = cn;
  });

  return {
    parent: node,
    children: fields
  };
};

var insertComponents = exports.insertComponents = function insertComponents(fields, components) {
  for (var fieldName in fields) {
    var markNode = (0, _pomaceBase.buildDOM)(fields[fieldName]);
    var node = components[fieldName];

    markNode.$$.sibling(node);
    node.$$.last(markNode.$$.child);
    markNode.$$.remove();

    markNode = null;
    node = null;
  }
};

exports.default = obj;