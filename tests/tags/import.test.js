const swig = require('../../lib/swig');
const expect = require('expect.js');
const path = require('path');

describe('Tag: import', function () {
  it('throws on bad arguments', function () {
    expect(function () {
      swig.render('{% import bar %}');
    }).to.throwError(/Unexpected variable "bar" on line 1\./);
    expect(function () {
      swig.render(
        '{% import "' + path.resolve(__dirname, '../cases/import.test.html') + '" "bar" %}' // eslint-disable-line
      );
    }).to.throwError(/Unexpected string "bar" on line 1\./);
  });
});
