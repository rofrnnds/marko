'use strict';

var Builder = require('./Builder');
var CodeGenerator = require('./CodeGenerator');
var Compiler = require('./Compiler');
var Walker = require('./Walker');

var defaultOptions = {
        /**
         * Set of tag names that should automatically have whitespace preserved.
         * Alternatively, if value is `true` then whitespace will be preserved
         * for all tags.
         */
        preserveWhitespace: {
            'pre': true,
            'textarea': true,
            'script': true
        },
        /**
         * If true, then the compiler will check the disk to see if a previously compiled
         * template is the same age or newer than the source template. If so, the previously
         * compiled template will be loaded. Otherwise, the template will be recompiled
         * and saved to disk.
         *
         * If false, the template will always be recompiled. If `writeToDisk` is false
         * then this option will be ignored.
         */
        checkUpToDate: true,
        /**
         * If true (the default) then compiled templates will be written to disk. If false,
         * compiled templates will not be written to disk (i.e., no `.marko.js` file will
         * be generated)
         */
        writeToDisk: true
    };

var req = require;

function createBuilder(options) {
    return new Builder(options);
}

function createWalker(options) {
    return new Walker(options);
}

function generateCode(ast, options) {
    var builder = options && options.builder;

    if (!builder) {
        builder = createBuilder(options);
    }

    var generatorOptions = {
        builder
    };

    var generator = new CodeGenerator(generatorOptions);
    return generator.generateCode(ast);
}

function compileFile(path, options, callback) {
    var fs = req('fs');

    if (typeof options === 'function') {
        callback = options;
        options = null;
    }

    var compiler = new Compiler(options);

    if (callback) {
        fs.readFile(path, {encoding: 'utf8'}, function(err, templateSrc) {
            if (err) {
                return callback(err);
            }

            try {
                callback(null, compiler.compile(templateSrc, path));
            } catch(e) {
                callback(e);
            }
        });
    } else {
        let templateSrc = fs.readFileSync(path, {encoding: 'utf8'});
        return compiler.compile(templateSrc, path);
    }
}

function checkUpToDate(templateFile, templateJsFile) {
    return false; // TODO Implement checkUpToDate
}

exports.createBuilder = createBuilder;
exports.generateCode = generateCode;
exports.compileFile = compileFile;
exports.defaultOptions = defaultOptions;
exports.checkUpToDate = checkUpToDate;
exports.createWalker = createWalker;

var taglibLookup = require('./taglib-lookup');
taglibLookup.registerTaglib(require.resolve('../taglibs/core/marko-taglib.json'));

/*
exports.Taglib = require('./Taglib');
exports.loader = require('./taglib-loader');
exports.lookup = require('./taglib-lookup');
exports.buildLookup = exports.lookup.buildLookup;
exports.registerTaglib = exports.lookup.registerTaglib;
exports.excludeDir = exports.lookup.excludeDir;
exports.clearCaches = function() {
    exports.lookup.clearCaches();
    require('./taglib-finder').clearCaches();
};
*/