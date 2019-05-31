const parametersRegExp                = /\((.*?)\)|(\(\?)?:\w+/g;
const parametersOptionalReplaceRegExp = /^[^A-Za-z0-9\-_]+|[^A-Za-z0-9\-_]+$/g;

export default class UrlParametrized {
    /**
     * @return {Array}
     */
    get parameters() {
        // extract url parameters
        if (this._parameters !== undefined) {
            return this._parameters;
        }

        this._parameters = (this.url.match(parametersRegExp) || []).map(function (parameter) {
            const parameterOptions = {
                name:     null,
                optional: false,
                regExp:   null
            };

            // optional
            if (parameter.substr(0, 1) === '(') {
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

        return this._parameters;
    }

    /**
     * defined the url
     *
     * @return {String}
     */
    get url() {
        return this._url;
    }

    set url(url) {
        this._url = url;
        delete this._parameters;
    }

    /**
     * @param {String} url
     */
    constructor(url) {
        this.url = url;
    }

    /**
     * parse the url with given object
     *
     * @param parameters
     * @return {*|String|string}
     */
    parse(...parameters) {
        // convert argument array to object
        parameters.forEach((argument, index) => {
            if (argument instanceof Array) {
                parameters[index] = argument.reduce((acc, value, indexOfArray) => {
                    // out of range... unknown parameter
                    if (this.parameters.length - 1 < indexOfArray) {
                        return acc;
                    }

                    if (value === true) {
                        value = 1;
                    }
                    else if (value === false) {
                        value = 0;
                    }

                    // key value list
                    acc[this.parameters[indexOfArray].name] = value;

                    return acc;
                }, {});
            }
        });

        // collect values from object
        const values = this.parameters.reduce((acc, parameterOptions) => {
            return parameters.reduce((accArguments, argument) => {
                if (argument[parameterOptions.name] !== undefined) {
                    accArguments[parameterOptions.name] = argument[parameterOptions.name];
                }

                return accArguments;
            }, acc);
        }, {});

        return this.parameters.reduce((url, parameterOptions) => {
            // get the value
            let value = values[parameterOptions.name];

            if (value === true) {
                value = 1;
            }
            else if (value === false) {
                value = 0;
            }

            const valueEscaped = encodeURI(value);

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
                throw new Error('The url "' + this.url + '" requires the parameter "' + parameterOptions.name + '" but the value is not setted.');
            }

            // replacing value
            return url.replace(parameterOptions.regExp, valueEscaped);
        }, this.url || '');
    }
}
