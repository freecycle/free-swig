const swig = require('../lib/swig');
const expect = require('expect.js');
const fs = require('fs');
const path = require('path');

describe('Regressions', function () {
  it('gh-285: preserves forward-slashes in text', function () {
    expect(swig.render('foo\\ blah \\ and stuff')).to.equal(
      'foo\\ blah \\ and stuff'
    );
  });

  it('gh-303: sets work in loops', function () {
    const opts = { locals: { b: [1] } };
    expect(
      swig.render(
        '{% set foo = "old" %}{% for a in b %}{% if a %}{% set foo = "new" %}{% endif %}{% endfor %}{{ foo }}',
        opts
      )
    ).to.equal('new');
  });

  it('gh-322: logic words are not partially matched', function () {
    expect(swig.render('{{ org }}', { locals: { org: 'foo' } })).to.equal('foo');
    expect(swig.render('{{ andif }}', { locals: { andif: 'foo' } })).to.equal(
      'foo'
    );
    expect(swig.render('{{ note }}', { locals: { note: 'foo' } })).to.equal(
      'foo'
    );
    expect(
      swig.render('{{ truestuff }}', { locals: { truestuff: 'foo' } })
    ).to.equal('foo');
    expect(swig.render('{{ falsey }}', { locals: { falsey: 'foo' } })).to.equal(
      'foo'
    );
  });

  it('gh-323: stuff', function () {
    const tpl = "{% set foo = {label:'account.label',value:page.code} %}";
    const opts = { locals: { page: { code: 'tacos' } } };
    expect(swig.render(tpl + '{{ foo.value }}', opts)).to.equal('tacos');
  });

  // The following tests should *not* run in the browser
  if (!fs || !fs.readFileSync) {
    return;
  }

  it('gh-287: Options object overwrite exposure', function () {
    const opts = {};
    swig.compileFile(
      path.resolve(__dirname, 'cases/extends_1.test.html'),
      opts
    );
    expect(Object.keys(opts)).to.eql([]);
  });
});
