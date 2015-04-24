(function () {
    'use strict';

    var useStorage = false,
        defLang = 'en',
        location = window.location,
        html = document.documentElement,
        nav = document.getElementById('nav'),
        lang = {
            get: function () {
                var lang = location.hash.replace('#', '') || defLang || '';

                if (lang) {
                    html.setAttribute('lang', lang);
                } else {
                    this.reset();
                }

                return lang;
            },
            reset: function () {
                html.removeAttribute('lang');
            }
        },
        namedSections = [].slice.call(document.querySelectorAll('[data-name]')),
        isString = function (string) {
            return typeof string === 'string';
        },
        forEach = function (arg, callback) {
            var result, key, i, length, val;
            if (Array.isArray(arg)) {
                length = arg.length;
                for (i = 0; i < length; i = i + 1) {
                    val = arg[i];
                    result = callback.call(val, val, i, arg);
                    if (result) {
                        return result;
                    }
                }
            } else if (!isString(arg)) {
                for (key in arg) {
                    if (arg.hasOwnProperty(key)) {
                        val = arg[key];
                        result = callback.apply(val, val, key, arg);
                        if (result) {
                            return result;
                        }
                    }
                }
            }
        },
        onError = function (error) {
            lang.reset();

            window.history.pushState("", "", location.href.replace(location.hash, ''));

            setOnceEventCallback(nav, 'transitionend', function () {
                clearArticle();
            });

            console.log("Error:" + error);
        },
        setAttr = function (el, obj) {
            var key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    el.setAttribute(key, obj[key]);
                }
            }

            return el;
        },
        createEl = function(attr){
            return document.createElement(attr);
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
                    } catch (E) {
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
                transport.open('GET', 'data/' + key + '.json', true);
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
        getData = function (lng, success, error) {
            var data = $storage.get(lng);

            if (lng) {
                if (data && useStorage) {
                    success.call(this, data);
                } else {
                    $http.get(lng, success, error)
                }
            }
        },
        setOnceEventCallback = function (el, eventType, callback) {
            var handler = function (e) {
                callback.call(e);
                this.removeEventListener(eventType, handler);
            };

            el.addEventListener(eventType, handler, false);
        },
        checkContent = function (obj) {
            var el, protocol,
                postfix = '';

            if (obj.type) {

                switch (obj.type) {
                    case "phone":
                        protocol = 'tel:';
                        break;
                    case "skype":
                        protocol = 'skype:';
                        postfix = '?chat';
                        break;
                    case "email":
                        protocol = 'mailto:';
                        break;
                }

                if (protocol) {
                    el = createEl('a');
                    setAttr(el, {
                        "data-type": obj.type,
                        href: protocol + obj.value + postfix
                    });
                    el.innerHTML = obj.value;
                }
            }

            return el;
        },
        clearArticle = function () {
            forEach(namedSections, function (el) {
                while (el.lastChild) {
                    el.removeChild(el.lastChild);
                }
            });
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
                    var table = createEl('table'),
                        thead = table.createTHead(0),
                        colspan = 0;

                    forEach(data.value, function () {
                        var row = createEl('tr'),
                            cells = this.split('\t'),
                            cellsLength = cells.length;

                        forEach(cells, function (val, i) {
                            var cell = createEl(i === 0 ? 'th' : 'td');
                            if (cells.length == 1) {
                                cell.setAttribute('colspan', colspan);
                            }
                            cell.innerHTML = val;
                            row.appendChild(cell);
                        });

                        colspan = cellsLength > 1 ? cellsLength : colspan;

                        (cells[0] === '' ? thead : table).appendChild(row);
                    });

                    return table;
                },
                getParagraphs = function (data) {
                    var value = document.createDocumentFragment(),
                        node = checkContent(data);

                    if (node) {
                        value.appendChild(node);
                    } else {
                        forEach(data.value.split('\n'), function (val) {
                            var p = createEl('p');
                            p.innerHTML = val;
                            value.appendChild(p);
                        });
                    }

                    return value
                },
                fillIt = function (data, depth) {
                    var body = createEl('section'),
                        title = createEl('h' + (depth + 1)),
                        value = createEl('div'),
                        id = 'id' + Math.random().toString().replace('0.', ''),
                        checkbox = setAttr(createEl('input'), {
                            type: 'radio',
                            id: id,
                            name: 'section'
                        }),
                        label = setAttr(createEl('label'), {
                            for: id
                        });

                    if (data.type) setAttr(body, {class: data.type});

                    if (Array.isArray(data)) {
                        forEach(data, function () {
                            value.appendChild(fillIt(this, depth + 1));
                        });
                    } else {
                        if (depth < 2){
                            body.appendChild(checkbox);
                            body.appendChild(label);
                        }
                        if (data && data.title) {
                            setAttr(label, {'data-title': data.title});
                            title.innerHTML = data.title;
                            value.appendChild(title);
                        }

                        if (data && data.value) {
                            if (Array.isArray(data.value) && data.type !== 'table') {
                                forEach(data.value, function () {
                                    var node = fillIt(this, depth + 1);
                                    if (node) value.appendChild(node);
                                });
                            } else if (!isString(data.value) && data.value !== undefined) {
                                if (data.type === 'table') {
                                    value.appendChild(getTable(data));
                                } else {
                                    value.appendChild(fillIt(data.value, depth + 1));
                                }
                            } else {
                                value.appendChild(getParagraphs(data));
                            }
                            body.appendChild(value);
                        }
                    }
                    return body.textContent ? body : null;
                },
                fillSection = function (data) {
                    var text = createEl('span'),
                        body = document.createDocumentFragment(),
                        depth = 1;

                    if (Array.isArray(data)) {
                        forEach(data, function () {
                            var node = fillIt(this, depth);
                            if (node) body.appendChild(node);
                        });
                    } else if (!isString(data)) {
                        body.appendChild(fillIt(data, depth));
                    } else {
                        text.innerHTML = data;
                        body.appendChild(text);
                    }

                    return body;
                };

            clearArticle();

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