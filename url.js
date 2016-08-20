'use strict';

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return factory();
        });

    } else if (typeof exports !== 'undefined') {
        root.UrlParametrized = factory();

    } else {
        root.UrlParametrized = factory();
    }
}(this, function () {

    var parametersRegExp                = /\((.*?)\)|(\(\?)?:\w+/g;
    var parametersOptionalReplaceRegExp = /^[^A-Za-z0-9\-\_]+|[^A-Za-z0-9\-\_]+$/g;

    /**
     * @param {String} url
     * @param {Object} options
     */
    function UrlParametrized(url, options) {
        this.url = url;

        options = options || {};

        // copy options
        for (var optionName in options) {
            this[optionName] = options[optionName];
        }
    }

    // prototype
    UrlParametrized.prototype = Object.create(Object.prototype, {
        /**
         * @var {Array}
         */
        parameters: {
            enumerable: true,
            configurable: true,
            get: function () {
                // extract url parameters
                if (this._parameters === undefined) {
                    this._parameters = (this.url.match(parametersRegExp) || []).map(function (parameter) {
                        var parameterOptions = {
                            name: null,
                            optional: false,
                            regExp: null
                        };

                        // optional
                        if (parameter.substr(0, 1) == '(') {
                            parameterOptions.optional = true;
                            parameterOptions.name     = parameter.replace(parametersOptionalReplaceRegExp, '');
                            parameterOptions.regExp   = new RegExp('\\((.*?)\\:' + parameterOptions.name + '(.*?)\\)', 'g');
                        }
                        // none optional
                        else {
                            parameterOptions.name   = parameter.substr(1);
                            parameterOptions.regExp = new RegExp('\\:' + parameterOptions.name, 'g');
                        }
                        return parameterOptions;
                    });
                }

                return this._parameters;
            }
        },

        /**
         * defined the url
         *
         * @var {String}
         */
        url: {
            enumerable: true,
            configurable: true,
            get: function () {
                return this._url;
            },
            set: function (url) {
                this._url = url;
                delete this._parameters;
            }
        }
    });

    /**
     * parse the url with given object
     *
     * @param {Object|Array} values
     * @param {...Object|...Array}
     * @returns {String}
     */
    UrlParametrized.prototype.parse = function (values) {
        var args = Array.prototype.slice.call(arguments);
        var self = this;

        // convert argument array to object
        args.forEach(function (argument, index) {
            if (argument instanceof Array) {
                args[index] = argument.reduce(function (acc, value, indexOfArray) {
                    // out of range... unknown parameter
                    if (self.parameters.length - 1 < indexOfArray) {
                        return acc;
                    }

                    if (value === true) {
                        value = 1;
                    }
                    else if (value === false) {
                        value = 0;
                    }

                    // key value list
                    acc[self.parameters[indexOfArray].name] = value;

                    return acc;
                }, {});
            }
        });

        // collect values from object
        values = this.parameters.reduce(function (acc, parameterOptions) {
            return args.reduce(function (accArguments, argument) {
                if (argument[parameterOptions.name] !== undefined) {
                    accArguments[parameterOptions.name] = argument[parameterOptions.name];
                }

                return accArguments;
            }, acc);
        }, {});

        return this.parameters.reduce(function (url, parameterOptions) {
            // get the value
            var value = values[parameterOptions.name];

            if (value === true) {
                value = 1;
            }
            else if (value === false) {
                value = 0;
            }

            var valueEscaped = encodeURI(value);

            // optional parameter
            if (parameterOptions.optional === true) {
                // no value
                if (value === undefined || value === null) {
                    // removing
                    return url.replace(parameterOptions.regExp, '');
                }

                // with value
                // replace parameter with value
                return url.replace(parameterOptions.regExp, '$1' + valueEscaped + '$2');
            }

            // required paramter but not setted
            if (value === undefined || value === null) {
                throw new Error('The url "' + self.url + '" requires the parameter "' + parameterOptions.name + '" but the value is not setted.');
            }

            // replacing value
            return url.replace(parameterOptions.regExp, valueEscaped);
        }, this.url || '');
    };

    return UrlParametrized;
}));
