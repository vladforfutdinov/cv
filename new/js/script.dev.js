"use strict";

(function () {
  'use strict';

  var useStorage = false,
      getElements = function getElements(selector) {
    return [].slice.call(document.querySelectorAll(selector));
  },
      getHashValue = function getHashValue(string) {
    var result = string ? string.replace(/^(.*?)\#(.*?)$/, '$2') : null;
    return string !== result ? result : null;
  },
      langs = {
    arr: getElements('#nav a'),
    active: 0
  },
      lang = {
    set: function set(lang) {
      if (lang) {
        setAttr(html, {
          'lang': lang
        });
      } else {
        this.reset();
      }
    },
    get: function get(src) {
      var lang = getHashValue(src) || getHashValue(langs.arr[langs.active].href) || '';
      this.set(lang);
      return lang;
    },
    reset: function reset() {
      html.removeAttribute('lang');
    }
  },
      tabs = {
    arr: [],
    active: 0,
    top: 0,
    reset: function reset() {
      forEach(tabs.arr, function (item, i) {
        removeAttr(tabs.arr[i], 'checked');
      });
    }
  },
      location = window.location,
      html = document.documentElement,
      nav = document.getElementById('nav'),
      namedSections = getElements('[data-name]'),
      isString = function isString(string) {
    return typeof string === 'string';
  },
      forEach = function forEach(arg, callback) {
    var result, length, val;

    if (Array.isArray(arg)) {
      length = arg.length;

      for (var i = 0; i < length; i = i + 1) {
        val = arg[i];
        result = callback.call(val, val, i, arg);

        if (result) {
          return result;
        }
      }
    } else if (!isString(arg)) {
      for (var key in arg) {
        if (arg.hasOwnProperty(key)) {
          val = arg[key];
          result = callback.call(val, val, key, arg);

          if (result) {
            return result;
          }
        }
      }
    }
  },
      onError = function onError(error) {
    lang.reset();
    window.history.pushState("", "", location.href.replace(location.hash, ''));
    setOnceEventCallback(nav, 'transitionend', function () {
      clearArticle();
    });
    console.log("Error:" + error);
  },
      setAttr = function setAttr(el, obj) {
    if (Array.isArray(el)) {
      forEach(el, function (item) {
        setAttr(item, obj);
      });
    } else {
      for (var key in obj) {
        var valArr;

        if (obj.hasOwnProperty(key)) {
          if (el[key] && el[key].setProperty) {
            valArr = obj[key].split(':');
            el[key].setProperty(valArr[0], valArr[1]);
          } else {
            el.setAttribute(key, obj[key]);
            el[key] = obj[key];
          }
        }
      }

      return el;
    }
  },
      getAttr = function getAttr(el, name) {
    return el.getAttribute(name);
  },
      removeAttr = function removeAttr(el, name) {
    el.removeAttribute(name);
    return el;
  },
      createEl = function createEl(attr) {
    return document.createElement(attr);
  },
      createFragment = function createFragment() {
    return document.createDocumentFragment();
  },
      appendChildIf = function appendChildIf(parent, child) {
    if (child) parent.appendChild(child);
  },
      getCharCode = function getCharCode(e) {
    return typeof e.which == "number" ? e.which : e.keyCode;
  },
      eventHandler = function () {
    var i = 1,
        listeners = {};
    return {
      addListener: function addListener(element, event, handler, capture) {
        if (Array.isArray(element)) {
          var same = this,
              ids = [];
          forEach(element, function (el) {
            ids.push(same._addListener(el, event, handler, capture));
          });
          return ids;
        } else {
          return this._addListener(element, event, handler, capture);
        }
      },
      _addListener: function _addListener(element, event, handler, capture) {
        var addListener = function addListener(element) {
          element.addEventListener(event, handler, capture);
          listeners[i] = {
            element: element,
            event: event,
            handler: handler,
            capture: capture
          };
          return i++;
        };

        if (Array.isArray(element)) {
          forEach(element, function (node) {
            addListener(node);
          });
        } else {
          return addListener(element);
        }
      },
      removeListener: function removeListener(id) {
        if (Array.isArray(id)) {
          var same = this;
          forEach(id, function (val) {
            same._removeListener(val);
          });
        } else {
          this._removeListener(id);
        }
      },
      _removeListener: function _removeListener(id) {
        if (id in listeners) {
          var h = listeners[id];
          h.element.removeEventListener(h.event, h.handler, h.capture);
          delete listeners[id];
        }
      }
    };
  }(),
      $storage = {
    _storage: function () {
      if (typeof Storage !== "undefined") {
        return window.sessionStorage;
      } else {
        return null;
      }
    }(),
    get: function get(key) {
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
    set: function set(key, value) {
      if (this._storage) {
        return this._storage.setItem(key, isString(value) ? value : JSON.stringify(value));
      } else {
        return null;
      }
    }
  },
      $http = {
    _http: function _http() {
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
    get: function get(address, success, fail, args) {
      var transport = this._http();

      transport.open('GET', address, true);

      transport.onreadystatechange = function () {
        if (transport.readyState == 4) {
          if (transport.status == 200) {
            success.call(this, JSON.parse(transport.responseText), args);
          } else {
            fail.call(this, transport.statusText, args);
          }
        }
      };

      transport.send(null);
    }
  },
      buildParams = function buildParams(obj) {
    var arr = [];

    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        arr.push(key + '=' + obj[key]);
      }
    }

    return '?' + arr.join('&');
  },
      getData = function getData(lng, success, error) {
    var data = $storage.get(lng);

    if (lng) {
      if (data && useStorage) {
        success.call(this, data, lng);
      } else {
        $http.get('data/' + lng + '.json', success, error, lng);
      }
    }
  },
      setOnceEventCallback = function setOnceEventCallback(el, eventType, callback) {
    var handler = function handler(e) {
      callback.call(e);
      this.removeEventListener(eventType, handler);
    };

    el.addEventListener(eventType, handler, false);
  },
      checkContent = function checkContent(obj) {
    var el,
        protocol,
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

        case "site":
          protocol = 'https://';
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
      clearArticle = function clearArticle() {
    forEach(namedSections, function (el) {
      while (el.lastChild) {
        el.removeChild(el.lastChild);
      }
    });
  },
      initArticle = function initArticle(data, key) {
    var getNamedSection = function getNamedSection(name) {
      return forEach(namedSections, function () {
        if (this.dataset && this.dataset.name === name) {
          return this;
        }
      });
    },
        getTable = function getTable(data) {
      var table = createEl('table'),
          thead = table.createTHead(),
          colspan = 0;
      forEach(data.value, function () {
        var row = createEl('tr'),
            cells = this.split('\t'),
            cellsLength = cells.length;
        forEach(cells, function (val, i) {
          var cell = createEl(i === 0 ? 'th' : 'td');

          if (cells.length == 1) {
            cell.setAttribute('colspan', colspan.toString());
          }

          cell.innerHTML = val;
          row.appendChild(cell);
        });
        colspan = cellsLength > 1 ? cellsLength : colspan;
        (cells[0] === '' ? thead : table).appendChild(row);
      });
      return table;
    },
        getParagraphs = function getParagraphs(data) {
      var value = createFragment(),
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

      return value;
    },
        fillIt = function fillIt(data, depth, i) {
      var body = createEl('section'),
          title = createEl('h' + (depth + 1)),
          value = createEl('div'),
          id = 'id' + Math.random().toString().substring(2, 6),
          checkbox = setAttr(createEl('input'), {
        'type': 'radio',
        'id': id,
        'name': 'section',
        'data-keywords': data.keywords
      }),
          label = setAttr(createEl('label'), {
        "for": id
      });
      if (data.type) setAttr(body, {
        "class": data.type
      });

      if (Array.isArray(data)) {
        forEach(data, function () {
          appendChildIf(value, fillIt(this, depth + 1));
        });
      } else {
        if (depth < 2) {
          body.appendChild(checkbox);
          body.appendChild(label);
          if (i === tabs.active) setAttr(checkbox, {
            checked: true
          });
        }

        if (data && data.title) {
          setAttr(label, {
            'data-title': data.title
          });
          title.innerHTML = data.title + ' ';
          value.appendChild(title);
        }

        if (data && data.value) {
          if (Array.isArray(data.value) && data.type !== 'table') {
            forEach(data.value, function () {
              appendChildIf(value, fillIt(this, depth + 1));
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

          if (data.addon) {
            forEach(data.addon, function (val, key) {
              var obj = {};
              obj['data-' + key] = val;
              setAttr(value, obj);
            });
          }

          body.appendChild(value);
        }
      }

      return body.textContent ? body : null;
    },
        fillSection = function fillSection(data) {
      var text = createEl('span'),
          body = createFragment(),
          depth = 1;

      if (Array.isArray(data)) {
        forEach(data, function (val, i) {
          appendChildIf(body, fillIt(this, depth, i));
        });
      } else if (!isString(data)) {
        body.appendChild(fillIt(data, depth));
      } else {
        text.innerHTML = data;
        body.appendChild(text);
      }

      return body;
    },
        getActiveTabId = function getActiveTabId(node) {
      return tabs.arr.indexOf(node);
    },
        getImagesByKeywords = function getImagesByKeywords(keywordsArr) {
      var requestParams = {
        key: 'AIzaSyBe1OnzKJuuRd_7SkJxns9pC_8aEo_A-ss',
        cx: '003590701350310628363:e2gnnylh6ii',
        imgSize: 'huge',
        imgColorType: 'gray',
        imgType: 'photo'
      }; //forEach(keywordsArr, function (item) {

      requestParams.q = keywordsArr.join(' ');
      $http.get('https://www.googleapis.com/customsearch/v1' + buildParams(requestParams), function (resp) {
        console.log(resp.items);
      }, function (err) {
        console.log(err);
      }); //});

      console.log(keywordsArr);
    },
        setBackgrounds = function setBackgrounds(imageLinks) {};

    clearArticle();
    if (key) $storage.set(key, data);

    if (data.title) {
      document.title = data.title;
    }

    if (data.description) {
      var metaDescription = createEl('meta');
      setAttr(metaDescription, {
        name: "description",
        content: data.description
      });
      document.getElementsByTagName('head')[0].appendChild(metaDescription);
    }

    for (var k in data) {
      var section;

      if (data.hasOwnProperty(k)) {
        section = getNamedSection(k);

        if (section) {
          section.appendChild(fillSection(data[k]));
        }
      }
    }

    tabs.arr = getElements('[data-name=section] [type=radio]');
    tabs.top = getElements('[data-name=section]')[0].offsetTop + getElements('[data-name=section]')[0].offsetHeight;
    setAttr(getElements('[data-name=section] [type=radio] + label + div'), {
      'style': 'top:' + tabs.top + 'px'
    }); // event listeners for set active tab

    eventHandler.addListener(tabs.arr, 'change', function () {
      tabs.reset();
      tabs.active = getActiveTabId(this); //setAttr(tabs.arr[tabs.active], {checked: true});
      //getImagesByKeywords(getAttr(this, 'data-keywords').split(','));
    });
    /*
                eventHandler.addListener(getElements("#tutorial button"), 'click', function () {
                    hideTutorial();
                });
                eventHandler.addListener(window, 'keyup', function (e) {
                    if (getCharCode(e) === 27) hideTutorial();
                });
    */

    if (window.keynavHandler) eventHandler.removeListener(window.keynavHandler);
    window.keynavHandler = eventHandler.addListener(window, 'keydown', function (e) {
      var nextIdx,
          activeEl,
          hasShift = e.shiftKey,
          obj = hasShift ? langs : tabs,
          charCode = getCharCode(e),
          ff = charCode === 39,
          rw = charCode === 37,
          delta = ff ? 1 : rw ? -1 : 0,
          history = window.history;
      if (!delta) return;
      nextIdx = obj.active + delta;
      obj.active = nextIdx < 0 ? nextIdx = obj.arr.length - 1 : nextIdx > obj.arr.length - 1 ? 0 : nextIdx;
      activeEl = obj.arr[obj.active];

      if (hasShift) {//window.location.hash = lang.get(activeEl.href);
      } else {
        tabs.reset();
        setAttr(activeEl, {
          checked: true
        });
      }
    });
  },

  /*
          hideTutorial = function () {
              getElements("#tutorial")[0].classList.add('hide');
          },
          showTutorial = function () {
              getElements("#tutorial")[0].classList.remove('hide');
          },
  */
  initNav = function initNav() {
    eventHandler.addListener(window, 'hashchange', function () {
      getData(lang.get(window.location.href), initArticle, onError);
    });
  };

  initNav();

  if (!!lang.get()) {
    getData(lang.get(window.location.href), initArticle, onError);
  }

  if (!Array.isArray) {
    Array.isArray = function (arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    };
  }
})();