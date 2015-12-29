import async from '../../lib';
import {transformFile} from 'babel-core';
import _ from 'lodash';
import readdirR from 'recursive-readdir';
import pluginCJS from 'babel-plugin-transform-es2015-modules-commonjs';
import pluginLodashImportRename from './plugin-lodash-import-rename';
import {join as joinPath} from 'path';
import fs from 'fs-extra';

export default function(cb, options) {
    options = _.defaults({}, options, {path:'lib/', outpath:'build/modules', es6: false});
    let plugins = [pluginLodashImportRename];
    if (!options.es6) {
        plugins.push(pluginCJS);
    }

    readdirR(options.path, [], function(err, files) {
        fs.emptyDirSync(options.outpath);
        fs.emptyDirSync(joinPath(options.outpath, 'internal'));
        async.each(files, (file, callback) => {
            var filename = file.startsWith(options.path) ? file.slice(options.path.length) : file;
            transformFile(file, {
                babelrc: false,
                plugins: plugins
            }, function(err, content) {
                fs.writeFile(joinPath(options.outpath, filename), content.code, callback);
            });
        }, cb);
    });
}
