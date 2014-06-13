var app = {
    _createEl: function (tag, attr, injection) {
        var el = tag ? document.createElement(tag) : document.createDocumentFragment();
        for (var key in attr) {
            if (attr.hasOwnProperty(key)) {
                el.setAttribute(key, attr[key]);
            }
        }
        if (injection) {
            if (injection === injection.toString()) {
                el.innerHTML = injection;
            } else {
                el.appendChild(injection);
            }
        }
        return el;
    },
    _appendAfter: function (node, insertNode) {
        if (node.nextSibling) {
            node.parentNode.insertBefore(insertNode, node.nextSibling);
        }
        else {
            node.parentNode.appendChild(insertNode);
        }
    },
    _toggleClass: function (el, first, second, bool) {
        if (el) {
            if (app._isArray(el)) {
                for (var i = 0, length = el.length; i < length; i++) {
                    app._toggle(el[i], first, second, bool);
                }
            } else {
                app._toggle(el, first, second, bool);
            }
        }
    },
    _toggle: function (el, first, second, bool) {
        var classes = (' ' + el.className + ' ').split(/\s+/gi),
            firstIndex = -1,
            secondIndex = -1,
            isBool = bool !== undefined;

        for (var i = 0, length = classes.length; i < length; i++) {
            firstIndex = (classes[i] === first ? i : firstIndex);
            secondIndex = (classes[i] === second ? i : secondIndex);
        }

        console.log(bool);

        if (isBool) {
            classes[firstIndex] = '';
            classes[secondIndex] = '';
            classes.push(bool ? first : second);
        } else {
            if (firstIndex != -1) {
                classes[firstIndex] = second || '';
            } else if (secondIndex != -1) {
                classes[secondIndex] = first || '';
            } else {
                classes.push(first);
            }
        }

        el.className = classes.join(' ').replace(/\s+/g, ' ').trim();
    },
    _isArray: function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    },
    _isFunc: function (obj) {
        return typeof(obj) === 'function';
    },
    _toArray: function (list) {
        return Array.prototype.slice.call(list);
    },
    _addClass: function (el, className) {
        if (app._isArray(el)) {
            for (var i = 0, length = el.length; i < length; i++) {
                el[i].className += ' ' + className;
            }
        } else {
            el.className += ' ' + className;
        }
    },
    _every: function (els, fn) {
        var every = true;

        for (var i = 0, length = els.length; i < length; i++) {
            every = fn(els[i]);
        }

        return every;
    },
    _hasClass: function (el, className) {
        if (el && el.hasOwnProperty('tagName')) {
            var classes = el.className.split(' ');

            for (var i = 0, length = classes.length; i < length; i++) {
                if (classes[i] === className) {
                    return true;
                }
            }
        }
        return false;
    },
    _parent: function (el, className) {
        var isMatch = false,
            currentNode = el,
            firstLoop = true;

        while (!isMatch) {
            if (!firstLoop) {
                currentNode = currentNode.parentNode;
                if (currentNode === document.body) {
                    return false;
                }
            }
            isMatch = app._hasClass(currentNode, className);
            firstLoop = false;
        }

        return currentNode;
    },
    _event: function (target, object) {
        for (var key in object){
            if (object.hasOwnProperty(key)){
                    if (app._isArray(object[key])) {
                        for (var i = 0, length = object[key].length; i < length; i++) {
                            if (app._isFunc(object[key][i])) {
                                target.addEventListener(key, object[key][i]);
                            }
                        }
                    } else {
                        target.addEventListener(key, object[key]);
                    }
            }
        }
    },
    translate: function () {
        this.lang = (this.lang == 'en' ? 'ru' : 'en');
        app.switchSections(true);
    },
    initTrigger: function (dest, trigger, array, fn, fnThis) {
        for (var key in array) {
            if (array.hasOwnProperty(key)) {
                if (array[key].toString() === array[key]) {
                    trigger.appendChild(app._createEl('span', {lang: key}, app._createEl('span', null, array[key])));
                } else {
                    for (var subKey in array[key]) {
                        if (array[key].hasOwnProperty(subKey)) {
                            trigger.appendChild(app._createEl('span', {lang: key, class: subKey}, app._createEl('span', null, array[key][subKey])));
                        }
                    }
                }
            }
        }
        trigger.onclick = function (e) {
            fn.call(fnThis || e.target);
        };
        dest.appendChild(trigger);

        return trigger;
    },
    initFolders: function () {
        var label, innerSpans,
            headers = app._toArray(document.getElementsByTagName('h2'));

        for (var i = 0, ilength = headers.length; i < ilength; i++) {
            innerSpans = app._toArray(headers[i].getElementsByTagName('span'));

            for (var j = 0, jlength = innerSpans.length; j < jlength; j++) {
                label = app._createEl('label', {for: ('section' + i), lang: innerSpans[j].lang}, innerSpans[j].innerText);
                headers[i].appendChild(label);
                innerSpans[j].parentNode.removeChild(innerSpans[j]);
            }
            app._appendAfter(headers[i], app._createEl('input', {id: ('section' + i), type: 'checkbox'}));
        }

        app.setSectionsSize();
    },
    setSectionsSize: function () {
        var sections = app._toArray(document.getElementsByTagName('section'));

        for (var i = 0, length = sections.length; i < length; i++) {
            sections[i].style.maxHeight = '';
            (function (el) {
                setTimeout(function () {
                    el.style.maxHeight = el.clientHeight + 'px';
                }, 0);
            })(sections[i]);
        }
    },
    addFullLinks: function () {
        var links = app._toArray(document.getElementsByTagName('a'));

        for (var i = 0, length = links.length; i < length; i++) {
            if (links[i].href.indexOf(window.location.host) != -1) {
                links[i].setAttribute('data-link', links[i].href);
            }
        }
    },
    switchSections: function(force) {
        var el = document.getElementsByClassName('folder')[0],
            isFolderSwitcher = (this.hasOwnProperty('tagName') && app._parent(this, 'folder') ? true : false),
            state = force != undefined ? force : app._hasClass(el, 'show'),
            checkboxes = app._toArray(document.getElementsByTagName('input'));

        if (isFolderSwitcher || (!isFolderSwitcher && state)) {
            app._toggleClass(el, 'show', 'hide', !force);

            for (var i = 0, length = checkboxes.length; i < length; i++) {
                checkboxes[i].checked = !state;
            }

        }
        if (!isFolderSwitcher){
            app.setSectionsSize();
        }
    }
};

(function () {
    var body = document.body,
        lv = lv || false,
        header = document.getElementsByTagName('header')[0],
        triggerTitles = {
            'lg': {
                'ru': 'In English', 'en': 'По-русски'},
            'fb': {
                ru: {
                    show: 'Развернуть все',
                    hide: 'Свернуть все'
                },
                en: {
                    show: 'Unfold all',
                    hide: 'Fold all'
                }
            }
        };

    app.initTrigger(
        header,
        app._createEl('span', {class: 'lng trigger'}),
        triggerTitles.lg,
        app.translate,
        document.documentElement
    );

    app._event(window, {
        load: [app.initFolders, app.addFullLinks],
        resize: app.setSectionsSize
    });

    if (!lv) {
        app.initTrigger(
            header,
            app._createEl('span', {class: 'folder trigger hide'}),
            triggerTitles.fb,
            app.switchSections
        );

        body.className += 'modern';
    }
})();
