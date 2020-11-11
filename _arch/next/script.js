var app = {
    _createEl: function (tag, attr, injection) {
        var el = tag ? document.createElement(tag) : document.createDocumentFragment();
        for (var key in attr) {
            if (attr.hasOwnProperty(key)) {
                el.setAttribute(key, attr[key]);
            }
        }
        if (injection) {
            if (injection == injection.toString()) {
                el.innerHTML = injection;
            } else {
                el.appendChild(injection);
            }
        }
        return el;
    },
    translate: function () {
        this.lang = (this.lang == 'en' ? 'ru' : 'en');
    },
    initTrigger: function (dest, trigger, array, fn, fnThis) {
        for (var key in array) {
            if (array.hasOwnProperty(key)) {
                if (array[key].toString() === array[key]) {
                    trigger.appendChild(app._createEl('span', {lang: key}, array[key]));
                } else {
                    for (var subKey in array[key]) {
                        if (array[key].hasOwnProperty(subKey)) {
                            trigger.appendChild(app._createEl('span', {lang: key, class: subKey}, array[key][subKey]));
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
    _toggleClass: function (el, first, second, bool) {
        var classes = el.className.split(/\s+/gi),
            firstIndex = -1,
            secondIndex = -1,
            isBool = arguments.length === 4;

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

        el.className = classes.join(' ');
    },
    _every: function (els, fn) {
        var every = true;
        for (var i = 0, length = els.length; i < length; i++) {
            every = fn(els[i]);
        }
        return every;
    },
    _hasClass: function (el, className) {
        var classes = el.className.split(' '),
            has = false;

        for (var i = 0, length = classes.length; i < length; i++) {
            has = classes[i] === className;
        }

        return has;

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

    app.initTrigger(header, app._createEl('span', {class: 'lng'}), triggerTitles.lg, app.translate, document.documentElement);

    if (!lv) {
        var headers = document.getElementsByTagName('h2');

        body.className += 'modern';

        var flipTrigger = function () {
            var el = this.parentNode;
            var foldStatus = el.className.indexOf(' folded') == -1;
            el.className = foldStatus ? el.className + ' folded' : el.className.replace(' folded', '');
            for (var i = 0, length = sections.length; i < length; i++) {
                if (foldStatus) {
                    sections[i].className = sections[i].className.replace('hidden', '');
                } else if (sections[i].className.indexOf('hidden') == -1) {
                    sections[i].className = sections[i].className + ' hidden';
                }
            }
        };
//        var folder = app.initTrigger(header, app.createEl('span', {class: 'flp show'}), triggerTitles.fb, flipTrigger);

        window.onmousedown = function (e) {
            if (e.target.tagName.toLowerCase() == 'h2') {
                e.preventDefault();
            }
        };
        window.onclick = function (e) {
            var header = e.target.tagName.toLowerCase() == 'h2' ? e.target : e.target.parentNode;
            if (header.tagName.toLowerCase() === 'h2') {
                app._toggleClass(header, 'hide', 'show');
            }
//            checkFolder();
        };
//        checkFolder();

        function checkFolder() {
            var headers = document.getElementsByTagName('h2'),
                checkHeaders = app._every(headers, function (el) {
                    return app._hasClass(el, 'hide');
                });

            console.log(checkHeaders);

            app._toggleClass(folder, 'show', 'hide', checkHeaders);
        }

    }

})();
