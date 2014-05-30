var app = {
    createEl: function (tag, attr, injection) {
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
    translate: function () {
        this.lang = (this.lang == 'en' ? 'ru' : 'en');
        app.setSectionsSize();
    },
    initTrigger: function (dest, trigger, array, fn, fnThis) {
        for (var key in array) {
            if (array.hasOwnProperty(key)) {
                if (array[key].toString() === array[key]) {
                    trigger.appendChild(app.createEl('span', {lang: key}, app.createEl('span', null, array[key])));
                } else {
                    for (var subKey in array[key]) {
                        if (array[key].hasOwnProperty(subKey)) {
                            trigger.appendChild(app.createEl('span', {lang: key, class: subKey}, app.createEl('span', null, array[key][subKey])));
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
            headers = app.toArray(document.getElementsByTagName('h2'));

        for (var i = 0, ilength = headers.length; i < ilength; i++) {
            innerSpans = app.toArray(headers[i].getElementsByTagName('span'));

            for (var j = 0, jlength = innerSpans.length; j < jlength; j++) {
                label = app.createEl('label', {for: ('section' + i), lang: innerSpans[j].lang}, innerSpans[j].innerText);
                headers[i].appendChild(label);
                innerSpans[j].parentNode.removeChild(innerSpans[j]);
            }
            app._appendAfter(headers[i], app.createEl('input', {id: ('section' + i), type: 'checkbox'}));
        }

        app.setSectionsSize();
    },
    _appendAfter: function (node, insertNode) {
        if (node.nextSibling) {
            node.parentNode.insertBefore(insertNode, node.nextSibling);
        }
        else {
            node.parentNode.appendChild(insertNode);
        }
    },
    toggleClass: function (el, first, second, bool) {
        if (el) {
            if (app.isArray(el)) {
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

//        console.log(isBool);
        for (var i = 0, length = classes.length; i < length; i++) {
            firstIndex = (classes[i] === first ? i : firstIndex);
            secondIndex = (classes[i] === second ? i : secondIndex);
        }

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
    isArray: function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    },
    isFunc: function (obj) {
        return typeof(obj) === 'function';
    },
    toArray: function (list) {
        return Array.prototype.slice.call(list);
    },
    addClass: function (el, className) {
        if (app.isArray(el)) {
            for (var i = 0, length = el.length; i < length; i++) {
                el[i].className += ' ' + className;
            }
        } else {
            el.className += ' ' + className;
        }
    },
    every: function (els, fn) {
        var every = true;
        for (var i = 0, length = els.length; i < length; i++) {
            every = fn(els[i]);
        }
        return every;
    },
    hasClass: function (el, className) {
        var classes = el.className.split(' ');

        for (var i = 0, length = classes.length; i < length; i++) {
            if(classes[i] === className){
                return true;
            }
        }

        return false;
    },
    setSectionsSize: function () {
        var sections = app.toArray(document.getElementsByTagName('section'));

        for (var i = 0, ilength = sections.length; i < ilength; i++) {
            sections[i].style.maxHeight = '';
            (function(el){
                setTimeout(function(){
                    el.style.maxHeight = el.clientHeight + 'px';
                }, 0);
            })(sections[i]);
        }
    },
    parent: function(el, className){
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

            isMatch = app.hasClass(currentNode, className);

            firstLoop = false;
        }

        return currentNode;
    },
    onload: function (func) {
        window.onload = function () {
            if (app.isArray(func)) {
                for (var i = 0, length = func.length; i < length; i++) {
                    if (app.isFunc(func[i])) {
                        func[i].call();
                    }
                }
            } else {
                func();
            }
        };
    }
};

(function () {
    var body = document.body,
        lv = lv || false,
        lngBase = document.body,
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

    app.initTrigger(lngBase, app.createEl('span', {class: 'lng'}), triggerTitles.lg, app.translate, document.documentElement);

    app.onload([app.initFolders]);

    if (!lv) {
        var headers = app.toArray(document.getElementsByTagName('h2')),
            folder = app.initTrigger(
                header,
                app.createEl('span', {class: 'folder hide'}),
                triggerTitles.fb,
                function () {
                    console.log(this);
                    var el = app.parent(this, 'folder'),
                        state = app.hasClass(el, 'show'),
                        checkboxes = app.toArray(document.getElementsByTagName('input'));

                    app.toggleClass(el, 'show', 'hide');

                    for (var i = 0, length = checkboxes.length; i < length; i++) {
                        checkboxes[i].checked = !state;
                    }

                }
            );

        body.className += 'modern';
    }
})();
