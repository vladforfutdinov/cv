(function () {
    var head = document.head,
        body = document.body,
        namedSections = [].slice.call(document.querySelectorAll('[data-name]')),
        $http = {
            _http: function () {
                var xmlhttp;
                try {
                    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
                } catch (e) {
                    try {
                        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                    } catch (E) {
                        xmlhttp = false;
                    }
                }
                if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
                    xmlhttp = new XMLHttpRequest();
                }
                return xmlhttp;
            },
            get: function (uri, success, fail) {
                var transport = this._http();
                transport.open('GET', uri, true);
                transport.onreadystatechange = function () {
                    if (transport.readyState == 4) {
                        if (transport.status == 200) {
                            success.call(this, JSON.parse(transport.responseText));
                        } else {
                            fail.call(this, transport.statusText);
                        }
                    }
                };
                transport.send(null);
            }
        },
        isString = function (string) {
            return string === '' + string;
        },
        forEach = function (arg, callback) {
            if (Array.isArray(arg)) {
                var result;

                for (var i = 0, length = arg.length; i < length; i++) {
                    result = callback.apply(arg[i]);
                    if (result) {
                        return result;
                    }
                }
            } else if (!isString(arg)) {
                for (var key in arg) {
                    if (arg.hasOwnProperty(key)) {
                        result = callback.apply(arg[i]);
                        if (result) {
                            return result;
                        }
                    }
                }
            }
        },
        onError = function (error) {
            console.log("Error:" + error);
        },
        init = function (data) {
            var getNamedSection = function (name) {
                    return forEach(namedSections, function () {
                        if (this.dataset && this.dataset.name === name) {
                            return this;
                        }
                    });
                },
                fillIt = function (data, depth) {
                    var body = document.createDocumentFragment(),
                        title = document.createElement('h' + depth),
                        value = document.createElement('p');

                    if (Array.isArray(data)) {
                        forEach(data, function () {
                            value.appendChild(fillIt(this, depth + 1));
                        });
                    } else {
                        if (data && data.title) {
                            title.innerHTML = data.title;
                            body.appendChild(title);
                        }

                        if (data && data.value) {
                            if (Array.isArray(data.value)) {
                                value = document.createElement('div');
                                forEach(data.value, function () {
                                    value.appendChild(fillIt(this, depth + 1));
                                });
                            } else if (!isString(data.value) && data.value !== undefined) {
                                if (data.value.type === 'table') {
                                    forEach(data.value.value, function () {
                                        var row = document.createElement('p'),
                                            string = this.toString(),
                                            isHeading = !/\t/gi.test(string);

                                        row.className = 'row';
                                        row.innerHTML = '<span class="' + (isHeading ? 'heading' : '') + '">' + string.replace(/\t/gi, '</span><span>') + '</span>';
                                        value.appendChild(row);
                                    });
                                } else {
                                    value.appendChild(fillIt(data.value, depth + 1));
                                }
                            } else {
                                value.innerHTML = data.value.replace(/\n/gi, '<br>');
                            }
                            body.appendChild(value);
                        }
                    }

                    return body;
                },
                fillSection = function (data) {
                    var text = document.createElement('span'),
                        body = document.createDocumentFragment(),
                        depth = 1;

                    if (Array.isArray(data)) {
                        forEach(data, function () {
                            body.appendChild(fillIt(this, depth));
                        });
                    } else if (!isString(data)) {
                        body.appendChild(fillIt(data, depth));
                    } else {
                        text.innerHTML = data;
                        body.appendChild(text);
                    }

                    return body;
                };

            if (data.title) {
                head.getElementsByTagName('title')[0].innerHTML = data.title;
            }

            for (var key in data) {
                var section;
                if (data.hasOwnProperty(key)) {
                    section = getNamedSection(key);
                    if (section) {
                        section.appendChild(fillSection(data[key]));
                    }
                }
            }
        };

    $http.get('data.json', init, onError);

    if (!Array.isArray) {
        Array.isArray = function (arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        };
    }
})();
