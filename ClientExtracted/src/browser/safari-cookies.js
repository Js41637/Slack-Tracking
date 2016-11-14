/* eslint prefer-template:0, no-shadow:0, no-unused-vars:0, prefer-arrow-callback:0 */
"use strict";

var fs = require('fs');

var Cookies = function() {
  this._init();
};

Cookies.prototype.parse = function(cookiePath) {
  this._init();
  this.cookiePath = cookiePath;

  this._open();
  this._getNumPages();
  this._getPageSizes();
  this._getPages();

  this.pages.forEach((page, i) => {
    try {
      this._getNumCookies(i);
      this._getCookieOffsets(i);
      this._getCookieData(i);
    } catch (e) {
      return;
    }

    this.pages[i].cookies.forEach((cookie, j) => {
      try {
        this.cookies.push(this._parseCookieData(i, j));
      } catch (e) {
        return;
      }
    });
  });

  return this.cookies;
};

Cookies.prototype._init = function() {
  this.cookiePath = null;
  this.curBufPos = 0;
  this.data = null;
  this.numPages = 0;
  this.bufSize = 0;
  this.pages = [];
  this.pageSizes = [];
  this.cookies = [];
};

Cookies.prototype._open = function() {
  let fileDescriptor = fs.openSync(this.cookiePath, 'r');
  let fileStats = fs.statSync(this.cookiePath);
  this.data = new Buffer(fileStats.size);

  let bytesRead = fs.readSync(fileDescriptor, this.data, 0, fileStats.size, 0);
  this.bufSize = fileStats.size;

  if (bytesRead !== fileStats.size) {
    throw new Error('File size did not match');
  }

  let header = this._readSlice(4).toString();

  if (header !== 'cook') {
    throw new Error(`This file did not appear to be in the valid format for binary cookies (missed 'cook' header)`);
  }
};

Cookies.prototype._readSlice = function(len) {
  //console.log("Reading " + len + " bytes from byte " + this.curBufPos);
  var sliceBuf = this.data.slice(this.curBufPos, this.curBufPos + len);
  this.curBufPos += len;
  return sliceBuf;
};

Cookies.prototype._readIntBE = function() {
  var ret = this.data.readInt32BE(this.curBufPos);
  this.curBufPos += 4;
  return ret;
};

Cookies.prototype._readIntLE = function() {
  var ret = this.data.readInt32LE(this.curBufPos);
  this.curBufPos += 4;
  return ret;
};

Cookies.prototype._getNumPages = function() {
  this.numPages = this._readIntBE();
  return this.numPages;
};

Cookies.prototype._getPageSizes = function() {
  for (var i = 0; i < this.numPages; i++) {
    this.pageSizes.push(this._readIntBE());
  }
  return this.pageSizes;
};

Cookies.prototype._getPages = function() {
  this.pageSizes.forEach((pageSize, pageIndex) => {
    this.pages[pageIndex] = {buf: this._readSlice(pageSize)};
  });
  return this.pages;
};

Cookies.prototype._getNumCookies = function(pageIndex) {
  var p = this.pages[pageIndex];
  p.bufPos = 0;
  var pageHeader = p.buf.readInt32BE(p.bufPos); p.bufPos += 4;
  if (pageHeader !== 256) {
    throw new Error("Page header was not expected 256, it was " + pageHeader);
  }
  p.numCookies = p.buf.readInt32LE(p.bufPos); p.bufPos += 4;
  return p.numCookies;
};

Cookies.prototype._getCookieOffsets = function(pageIndex) {
  var p = this.pages[pageIndex];
  p.cookieOffsets = [];
  for (var i = 0; i < p.numCookies; i++) {
    p.cookieOffsets[i] = p.buf.readInt32LE(p.bufPos); p.bufPos += 4;
  }
  return p.cookieOffsets;
};

Cookies.prototype._getCookieData = function(pageIndex) {
  var p = this.pages[pageIndex];
  p.cookies = [];
  var endOfPagePos = 0;
  p.cookieOffsets.forEach((offset, cookieIndex) => {
    var bufPos = offset;
    //console.log(bufPos);
    var cookieSize = p.buf.readInt32LE(bufPos);
    //console.log("cookie is " + cookieSize + " bytes long");
    //console.log("slicing from " + bufPos + " to " + (bufPos + cookieSize));
    //console.log(p.buf.length);
    try {
      p.cookies[cookieIndex] = {buf: p.buf.slice(bufPos, bufPos + cookieSize)};
    } catch (e) {
      p.cookies[cookieIndex] = {buf: p.buf.slice(bufPos)};
    }
    //console.log(p.cookies[cookieIndex].buf.length);
    endOfPagePos = bufPos + cookieSize;
  });
  // ensure end of page is reached
  //if (p.buf.readInt32LE(endOfPagePos) !== 0) {
    //console.log(endOfPagePos);
    //throw new Error("Finished reading cookies for page but didn't find " +
                    //"correct end-of-page marker");
  //}
  return p.cookies;
};

Cookies.prototype._parseCookieData = function(pageIndex, cookieIndex) {
  var p = this.pages[pageIndex];
  var c = p.cookies[cookieIndex];
  var data = {};
  var offsets = {};
  var numOffsets = [];
  var bufPos = 0;
  var macEpochOffset = 978307200;
  data.unknown = c.buf.readInt32LE(bufPos);
  data.flags = c.buf.readInt32LE(bufPos += 4);
  data.unknown2 = c.buf.readUInt32LE(bufPos += 8);
  ['url', 'name', 'path', 'value'].forEach((key) => {
    offsets[key] = c.buf.readInt32LE(bufPos += 4);
    numOffsets.push(offsets[key]);
  });
  var endOfCookie = c.buf.readUInt32LE(bufPos += 4);
  if (endOfCookie !== 0) {
    throw new Error("End of cookie data was not what we expected: " +
                    endOfCookie);
  }
  data.expiration = c.buf.readDoubleLE(bufPos += 8) + macEpochOffset;
  data.expiration = new Date(data.expiration * 1000);
  data.creation = c.buf.readDoubleLE(bufPos += 8) + macEpochOffset;
  data.creation = new Date(data.creation * 1000);
  Object.keys(offsets).forEach((key) => {
    var offset = offsets[key];
    var str = "";
    var curChar = 0;
    do {
      curChar = c.buf.toString("utf8", offset, ++offset);
      str += curChar;
    } while (curChar !== "\u0000");
    data[key] = new Buffer(str, "ascii").toString("utf8").trim();
    data[key] = data[key].replace("\u0000", "");
  });
  c.data = data;
  return data;
};

module.exports = function() {
  return new Cookies();
};
