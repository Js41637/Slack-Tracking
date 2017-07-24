webpackJsonp([83], {
  0: function(n, e) {
    n.exports = function(n) {
      "undefined" != typeof execScript ? execScript(n) : eval.call(null, n);
    };
  },
  197: function(n, e, r) {
    r(0)(r(212));
  },
  212: function(n, e) {
    n.exports = "(function(f){if(typeof exports===\"object\"&&typeof module!==\"undefined\"){module.exports=f()}else if(typeof define===\"function\"&&define.amd){define([],f)}else{var g;if(typeof window!==\"undefined\"){g=window}else if(typeof global!==\"undefined\"){g=global}else if(typeof self!==\"undefined\"){g=self}else{g=this}g.parseMessageFormatString = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require==\"function\"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error(\"Cannot find module '\"+o+\"'\");throw f.code=\"MODULE_NOT_FOUND\",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require==\"function\"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){\n/**\n * Tokens\n *\n * Turns this:\n *  `You have { numBananas, plural,\n *       =0 {no bananas}\n *      one {a banana}\n *    other {# bananas}\n *  } for sale`\n *\n * into this:\n *  [\n *    [ \"text\", \"You have \" ],\n *    [ \"{\", \"{\" ],\n *    [ \"space\", \" \" ],\n *    [ \"id\", \"numBananas\" ],\n *    [ \",\", \", \" ],\n *    [ \"space\", \" \" ],\n *    [ \"type\", \"plural\" ],\n *    [ \",\", \",\" ],\n *    [ \"space\", \"\\n     \" ],\n *    [ \"selector\", \"=0\" ],\n *    [ \"space\", \" \" ],\n *    [ \"{\", \"{\" ],\n *    [ \"text\", \"no bananas\" ],\n *    [ \"}\", \"}\" ],\n *    [ \"space\", \"\\n    \" ],\n *    [ \"selector\", \"one\" ],\n *    [ \"space\", \" \" ],\n *    [ \"{\", \"{\" ],\n *    [ \"text\", \"a banana\" ],\n *    [ \"}\", \"}\" ],\n *    [ \"space\", \"\\n  \" ],\n *    [ \"selector\", \"other\" ],\n *    [ \"space\", \" \" ],\n *    [ \"{\", \"{\" ],\n *    [ \"#\", \"#\" ],\n *    [ \"text\", \" bananas\" ],\n *    [ \"}\", \"}\" ],\n *    [ \"space\", \"\\n\" ],\n *    [ \"}\", \"}\" ],\n *    [ \"text\", \" for sale.\" ]\n *  ]\n **/\n\n'use strict'\n\nmodule.exports = function tokens (pattern) {\n  var current = { tokens: [], pattern: String(pattern), index: 0 }\n  try {\n    messageTokens(current, 'message')\n    if (current.index < current.pattern.length) {\n      throw new Error('Unexpected symbol')\n    }\n  } catch (error) {\n    current.error = error\n  }\n  return {\n    tokens: current.tokens,\n    lastIndex: current.index,\n    error: current.error\n  }\n}\n\nfunction isDigit (char) {\n  return (\n    char === '0' ||\n    char === '1' ||\n    char === '2' ||\n    char === '3' ||\n    char === '4' ||\n    char === '5' ||\n    char === '6' ||\n    char === '7' ||\n    char === '8' ||\n    char === '9'\n  )\n}\n\nfunction isWhitespace (char) {\n  var code = char && char.charCodeAt(0)\n  return (\n    (code >= 0x09 && code <= 0x0D) ||\n    code === 0x20 || code === 0x85 || code === 0xA0 || code === 0x180E ||\n    (code >= 0x2000 && code <= 0x200D) ||\n    code === 0x2028 || code === 0x2029 || code === 0x202F || code === 0x205F ||\n    code === 0x2060 || code === 0x3000 || code === 0xFEFF\n  )\n}\n\nfunction skipWhitespace (current) {\n  var start = current.index\n  var pattern = current.pattern\n  var length = pattern.length\n  while (\n    current.index < length &&\n    isWhitespace(pattern[current.index])\n  ) {\n    ++current.index\n  }\n  if (start < current.index) {\n    current.tokens.push([ 'space', pattern.slice(start, current.index) ])\n  }\n}\n\nfunction text (current, parentType) {\n  var pattern = current.pattern\n  var length = pattern.length\n  var isHashSpecial = (parentType === 'plural' || parentType === 'selectordinal')\n  var isSpaceSpecial = (parentType === 'style')\n  var start = current.index\n  var char\n  while (current.index < length) {\n    char = pattern[current.index]\n    if (\n      char === '{' ||\n      char === '}' ||\n      (isHashSpecial && char === '#') ||\n      (isSpaceSpecial && isWhitespace(char))\n    ) {\n      break\n    } else if (char === '\\'') {\n      char = pattern[++current.index]\n      if (char === '\\'') { // double is always 1 '\n        ++current.index\n      } else if (\n        // only when necessary\n        char === '{' ||\n        char === '}' ||\n        (isHashSpecial && char === '#') ||\n        (isSpaceSpecial && isWhitespace(char))\n      ) {\n        while (++current.index < length) {\n          char = pattern[current.index]\n          if (pattern.slice(current.index, current.index + 2) === '\\'\\'') { // double is always 1 '\n            ++current.index\n          } else if (char === '\\'') { // end of quoted\n            ++current.index\n            break\n          }\n        }\n      } // lone ' is just a '\n    } else {\n      ++current.index\n    }\n  }\n\n  return pattern.slice(start, current.index)\n}\n\nfunction argumentTokens (current) {\n  var pattern = current.pattern\n  var char = pattern[current.index]\n  if (char === '#') {\n    ++current.index // move passed #\n    current.tokens.push([ '#', '#' ])\n    return\n  }\n\n  if (char === '{') {\n    ++current.index // move passed {\n    current.tokens.push([ '{', '{' ])\n  } else {\n    throw new Error('Expected { to start placeholder')\n  }\n\n  skipWhitespace(current)\n\n  argId(current)\n\n  skipWhitespace(current)\n\n  char = pattern[current.index]\n  if (char === '}') { // end placeholder\n    ++current.index\n    current.tokens.push([ char, char ])\n    return\n  } else if (char === ',') {\n    ++current.index\n    current.tokens.push([ char, char ])\n  } else {\n    throw new Error('Expected , or }')\n  }\n\n  skipWhitespace(current)\n\n  var type = argType(current)\n\n  skipWhitespace(current)\n\n  char = pattern[current.index]\n  if (char === '}') { // end placeholder\n    ++current.index\n    current.tokens.push([ char, char ])\n    return\n  } else if (char === ',') {\n    ++current.index\n    current.tokens.push([ char, char ])\n  } else {\n    throw new Error('Expected , or }')\n  }\n\n  skipWhitespace(current)\n\n  if (type === 'plural' || type === 'selectordinal') {\n    pluralOffsetTokens(current)\n    skipWhitespace(current)\n    subMessagesTokens(current, type)\n  } else if (type === 'select') {\n    subMessagesTokens(current, type)\n  } else {\n    argStyle(current)\n  }\n\n  skipWhitespace(current)\n\n  char = pattern[current.index]\n  if (char === '}') { // end placeholder\n    ++current.index\n    current.tokens.push([ char, char ])\n  } else {\n    throw new Error('Expected } to end the placeholder')\n  }\n}\n\nfunction argId (current) {\n  var pattern = current.pattern\n  var length = pattern.length\n  var start = current.index\n  while (current.index < length) {\n    var char = pattern[current.index]\n    if (\n      char === '{' || char === '#' || char === '}' || char === ',' ||\n      isWhitespace(char)\n    ) {\n      break\n    }\n    ++current.index\n  }\n  var token = pattern.slice(start, current.index)\n  if (token) {\n    current.tokens.push([ 'id', token ])\n  } else {\n    throw new Error('Expected placeholder id')\n  }\n  return token\n}\n\nfunction argType (current) {\n  var pattern = current.pattern\n  var token\n  var types = [\n    'number', 'date', 'time', 'ordinal', 'duration', 'spellout', 'plural', 'selectordinal', 'select'\n  ]\n  for (var t = 0, tt = types.length; t < tt; ++t) {\n    var type = types[t]\n    if (pattern.slice(current.index, current.index + type.length) === type) {\n      token = type\n      current.index += type.length\n      break\n    }\n  }\n  if (token) {\n    current.tokens.push([ 'type', token ])\n  } else {\n    throw new Error('Expected placeholder type:\\n' + types.join(', '))\n  }\n  return token\n}\n\nfunction argStyle (current) {\n  var token = text(current, 'style')\n  if (token) {\n    current.tokens.push([ 'style', token ])\n  } else {\n    throw new Error('Expected a placeholder style name')\n  }\n  return token\n}\n\nfunction pluralOffsetTokens (current) {\n  var pattern = current.pattern\n  var length = pattern.length\n  if (pattern.slice(current.index, current.index + 7) === 'offset:') {\n    current.index += 7 // move passed offset:\n    current.tokens.push([ 'offset', 'offset' ])\n    current.tokens.push([ ':', ':' ])\n    skipWhitespace(current)\n    var start = current.index\n    while (\n      current.index < length &&\n      isDigit(pattern[current.index])\n    ) {\n      ++current.index\n    }\n    if (start !== current.index) {\n      current.tokens.push([ 'number', pattern.slice(start, current.index) ])\n    } else {\n      throw new Error('Expected offset number')\n    }\n  }\n}\n\nfunction subMessagesTokens (current, parentType) {\n  var pattern = current.pattern\n  var length = pattern.length\n  var hasSubs = false\n  var hasOther = false\n  while (\n    current.index < length &&\n    pattern[current.index] !== '}'\n  ) {\n    var select = selector(current)\n    if (select === 'other') {\n      hasOther = true\n    }\n    skipWhitespace(current)\n    subMessageTokens(current, parentType)\n    skipWhitespace(current)\n    hasSubs = true\n  }\n  if (!hasSubs) {\n    throw new Error('Expected ' + parentType + ' message options')\n  } else if (!hasOther) {\n    throw new Error('Expected ' + parentType + ' to have an \"other\" option')\n  }\n}\n\nfunction selector (current) {\n  var start = current.index\n  var pattern = current.pattern\n  var length = pattern.length\n  while (current.index < length) {\n    var char = pattern[current.index]\n    if (char === '}' || char === ',' || char === '{' || isWhitespace(char)) {\n      break\n    }\n    ++current.index\n  }\n  var token = pattern.slice(start, current.index)\n  if (token) {\n    current.tokens.push([ 'selector', token ])\n  } else {\n    throw new Error('Expected option selector')\n  }\n  return token\n}\n\nfunction subMessageTokens (current, parentType) {\n  var char = current.pattern[current.index]\n  if (char !== '{') {\n    throw new Error('Expected { to start sub message')\n  }\n  ++current.index // move passed {\n  current.tokens.push([ char, char ])\n\n  messageTokens(current, parentType)\n\n  char = current.pattern[current.index]\n  if (char !== '}') {\n    throw new Error('Expected } to end sub message')\n  }\n\n  ++current.index // move passed }\n  current.tokens.push([ char, char ])\n}\n\nfunction messageTokens (current, parentType) {\n  var tokens = current.tokens\n  var pattern = current.pattern\n  var length = pattern.length\n  var token\n  if ((token = text(current, parentType))) {\n    tokens.push([ 'text', token ])\n  }\n  while (current.index < length && pattern[current.index] !== '}') {\n    argumentTokens(current)\n    if ((token = text(current, parentType))) {\n      tokens.push([ 'text', token ])\n    }\n  }\n  return tokens\n}\n\n},{}]},{},[1])(1)\n});";
  }
}, [197]);