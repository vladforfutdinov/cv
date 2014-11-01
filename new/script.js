(function () {
    var html = document.documentElement,
        lang = {
            get: function () {
                var lang = window.location.hash.replace('#', '');
                html.setAttribute('lang', lang);
                return lang;
            }
        },
        namedSections = [].slice.call(document.querySelectorAll('[data-name]')),
        isString = function (string) {
            return typeof string === 'string';
        },
        forEach = function (arg, callback) {
            var result;
            if (Array.isArray(arg)) {
                for (var i = 0, length = arg.length; i < length; i++) {
                    result = callback.call(arg[i], arg[i], i, arg);
                    if (result) {
                        return result;
                    }
                }
            } else if (!isString(arg)) {
                for (var key in arg) {
                    if (arg.hasOwnProperty(key)) {
                        result = callback.apply(arg[key], arg[key], key, arg);
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
        $storage = {
            _storage: (function () {
                if (typeof(Storage) !== "undefined") {
                    return window.sessionStorage;
                } else {
                    return null;
                }
            })(),
            get: function (key) {
                var data;
                if (this._storage) {
                    data = this._storage.getItem(key);
                    if (data) {
                        return JSON.parse(data);
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }
            },
            set: function (key, value) {
                if (this._storage) {
                    return this._storage.setItem(key, value);
                } else {
                    return null;
                }
            }
        },
        $http = {
            _http: function () {
                var xmlhttp;
                try {
                    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
                } catch (e) {
                    try {
                        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                    }
                    catch (E) {
                        xmlhttp = false;
                    }
                }
                if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
                    xmlhttp = new XMLHttpRequest();
                }
                return xmlhttp;
            },
            get: function (key, success, fail) {
                var transport = this._http();
                transport.open('GET', key + '.json', true);
                transport.onreadystatechange = function () {
                    if (transport.readyState == 4) {
                        if (transport.status == 200) {
                            success.call(this, JSON.parse(transport.responseText));
                            $storage.set(key, transport.responseText);
                        } else {
                            fail.call(this, transport.statusText);
                        }
                    }
                };
                transport.send(null);
            }
        },
        getData = function(lng, success, error) {
            var data = $storage.get(lng);
            if (data) {
                success.call(this, data);
            } else {
                $http.get(lng, success, error)
            }
        },
        initArticle = function (data) {
            var getNamedSection = function (name) {
                    return forEach(namedSections, function () {
                        if (this.dataset && this.dataset.name === name) {
                            return this;
                        }
                    });
                },
                getTable = function (data) {
                    var table = document.createElement('table'),
                        thead = table.createTHead(0),
                        colspan = 0;

                    forEach(data.value, function () {
                        var row = document.createElement('tr'),
                            cells = this.split('\t'),
                            cellsLength = cells.length;

                        forEach(cells, function (val, i) {
                            var cell = document.createElement(i === 0 ? 'th' : 'td');
                            if (cells.length == 1) {
                                cell.setAttribute('colspan', colspan);
                            }
                            cell.appendChild(document.createTextNode(val));
                            row.appendChild(cell);
                        });

                        colspan = cellsLength > 1 ? cellsLength : colspan;

                        (cells[0] === '' ? thead : table).appendChild(row);
                    });

                    return table;
                },
                getParagraphs = function (data) {
                    var value = document.createDocumentFragment();

                    forEach(data.split('\n'), function (val) {
                        var p = document.createElement('p');
                        p.appendChild(document.createTextNode(val));
                        value.appendChild(p);
                    });

                    return value
                },
                fillIt = function (data, depth) {
                    var body = document.createDocumentFragment(),
                        title = document.createElement('h' + (depth + 1)),
                        value = document.createElement('div');

                    if (Array.isArray(data)) {
                        forEach(data, function () {
                            value.appendChild(fillIt(this, depth + 1));
                        });
                    } else {
                        if (data && data.title) {
                            title.appendChild(document.createTextNode(data.title));
                            body.appendChild(title);
                        }

                        if (data && data.value) {
                            if (Array.isArray(data.value)) {
                                forEach(data.value, function () {
                                    value.appendChild(fillIt(this, depth + 1));
                                });
                            } else if (!isString(data.value) && data.value !== undefined) {
                                if (data.value.type === 'table') {
                                    value.appendChild(getTable(data.value));
                                } else {
                                    value.appendChild(fillIt(data.value, depth + 1));
                                }
                            } else {
                                value.appendChild(getParagraphs(data.value));
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
                },
                clearArlicle = function () {
                    forEach(namedSections, function (el) {
                        while (el.lastChild) {
                            el.removeChild(el.lastChild);
                        }
                    });
                };

            clearArlicle();

            if (data.title) {
                document.title = data.title;
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
        },
        initNav = function () {
            window.addEventListener("hashchange", function () {
                getData(lang.get(), initArticle, onError);
            }, false);
        };

    initNav();

    if (!!lang.get()) {
        getData(lang.get(), initArticle, onError);
    }

    if (!Array.isArray) {
        Array.isArray = function (arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        };
    }
})();
