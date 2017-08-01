'use strict';

exports.__esModule = true;
// Had to make uuid use a constant seed so it would generate same sequence across runs. This was needed
// so server side rendering and client side rendering yield same results (e.g. the uuid is used when rendering
// the concunctions with their name and id)
var query_builder_seed = 0;

exports.default = function () {
    // Generate a random GUID http://stackoverflow.com/a/2117523.
    var timePart = (new Date().getTime().toString(16) + 'FF').substr(0, 11);
    var s = 'ssssssss-xxxx-4xxx-yxxx-x'.replace(/[xys]/g, function (c) {
        //    const r = ;
        var r = c === 's' ? Math.floor(Math.random() * 16) : query_builder_seed++ & 0xf;
        var v = c === 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
    }) + timePart;
    return s;
};