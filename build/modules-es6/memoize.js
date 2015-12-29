'use strict';

import identity from '../../deps/lodash-es/utility/identity';
import rest from '../../deps/lodash-es/function/rest';

import setImmediate from './internal/setImmediate';

export default function memoize(fn, hasher) {
    var memo = {};
    var queues = {};
    hasher = hasher || identity;
    var memoized = rest(function memoized(args) {
        var callback = args.pop();
        var key = hasher.apply(null, args);
        if (key in memo) {
            setImmediate(function () {
                callback.apply(null, memo[key]);
            });
        } else if (key in queues) {
            queues[key].push(callback);
        } else {
            queues[key] = [callback];
            fn.apply(null, args.concat([rest(function (args) {
                memo[key] = args;
                var q = queues[key];
                delete queues[key];
                for (var i = 0, l = q.length; i < l; i++) {
                    q[i].apply(null, args);
                }
            })]));
        }
    });
    memoized.memo = memo;
    memoized.unmemoized = fn;
    return memoized;
}