const swig = require('../lib/swig');
const expect = require('expect.js');
const path = require('path');
const fs = require('fs');
const efn = function () {};

describe('swig.loaders', function () {
  describe('API', function () {
    it('requires load and resolve methods', function () {
      expect(function () {
        swig.setDefaults({ loader: 'foobar' });
      }).to.throwError(/Invalid loader option "foobar" found\..*/);

      expect(function () {
        swig.setDefaults({ loader: { load: efn } });
      }).to.throwError(/Invalid loader option \{\} found\..*/);

      expect(function () {
        swig.setDefaults({ loader: { resolve: efn } });
      }).to.throwError(/Invalid loader option \{\} found\..*/);
    });
  });

  describe('Memory', function () {
    it('can use extends', function () {
      let templates, html, s;

      templates = {
        'page.html':
          '{% extends "layout.html" %}{% block content %}Hello {{ name }}!{% endblock %}'
      };
      templates[path.sep + 'layout.html'] =
        '<html>{% block content %}{% endblock %}</html>';

      s = new swig.Swig({ loader: swig.loaders.memory(templates) });
      html = s.renderFile('page.html', { name: 'world' });
      expect(html).to.equal('<html>Hello world!</html>');
    });

    it('can use include', function () {
      let templates, s, html;

      templates = {
        'page.html': '<html>{% include "content.html" %}</html>',
        'content.html': 'Hello {{ name }}!'
      };

      s = new swig.Swig({ loader: swig.loaders.memory(templates) });
      html = s.renderFile('page.html', { name: 'world' });
      expect(html).to.equal('<html>Hello world!</html>');
    });

    it('can use base paths', function () {
      let templates, s, html;

      templates = {
        '/baz/bar/page.html': '<html>{% include "content.html" %}</html>',
        '/baz/content.html': 'Hello {{ name }}!'
      };

      s = new swig.Swig({ loader: swig.loaders.memory(templates, '/baz') });
      html = s.renderFile('bar/page.html', { name: 'world' });
      expect(html).to.equal('<html>Hello world!</html>');
    });

    it('throws on undefined template', function () {
      const s = new swig.Swig({ loader: swig.loaders.memory({}) });
      expect(function () {
        s.renderFile('foobar');
      }).to.throwError(/Unable to find template "\/foobar"\./);
    });

    it('will run asynchronously', function (done) {
      const t = { 'content.html': 'Hello {{ name }}!' };
      const s = new swig.Swig({ loader: swig.loaders.memory(t) });
      s.renderFile('/content.html', { name: 'Tacos' }, function (err, out) {
        if (err) throw err;
        expect(out).to.equal('Hello Tacos!');
        done();
      });
    });
  });

  // The following tests should *not* run in the browser
  if (!fs || !fs.readFileSync) {
    return;
  }
  describe('FileSystem', function () {
    const macroExpectation =
      '\n\nasfdasdf\n\n\n\n\nHahahahahah!\n\n\n\n\n\n\n\n\n\n';
    it('is the default', function () {
      const s = new swig.Swig();
      const file = s.options.loader.load(
        path.resolve(__dirname, 'cases/macros.html')
      );
      expect(typeof file).to.be.a('string');
    });

    it('can take a base path', function () {
      const s = new swig.Swig({
        loader: swig.loaders.fs(path.resolve(__dirname, 'cases'))
      });
      expect(s.renderFile('macros.html')).to.equal(macroExpectation);
    });

    it('will run asynchronously', function (done) {
      const s = new swig.Swig({
        loader: swig.loaders.fs(path.resolve(__dirname, 'cases'))
      });
      s.renderFile('macros.html', {}, function (err, out) {
        if (err) throw err;
        expect(out).to.equal(macroExpectation);
        done();
      });
    });

    it('takes cwd as default base path', function () {
      const filepath = path.relative(
        process.cwd(),
        path.resolve(__dirname, 'cases/macros.html')
      );
      const s = new swig.Swig();

      expect(s.renderFile(filepath)).to.equal(macroExpectation);
    });
  });
});
