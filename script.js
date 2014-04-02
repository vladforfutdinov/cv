var app = {
    createEl: function (tag, attr, injection) {
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
                    trigger.appendChild(app.createEl('span', {lang: key}, array[key]));
                } else {
                    for (var subKey in array[key]) {
                        if (array[key].hasOwnProperty(subKey)) {
                            trigger.appendChild(app.createEl('span', {lang: key, class: subKey}, array[key][subKey]));
                        }
                    }
                }
            }
        }
        trigger.onclick = function (e) {
            fn.call(fnThis || e.target);
        };
        dest.appendChild(trigger);
    },
    toggleClass: function (el, first, second) {
        var classes = el.className.split(' '),
            firstIndex = -1,
            secondIndex = -1;

        for (var i = 0, length = classes.length; i < length; i++) {
            firstIndex = (classes[i] === first ? i : firstIndex);
            secondIndex = (classes[i] === second ? i : secondIndex);
        }
        if (firstIndex != -1) {
            classes[firstIndex] = second || '';
        } else if (secondIndex != -1) {
            classes[secondIndex] = first || '';
        } else {
            classes.push(first);
        }

        el.className = classes.join(' ');
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
                    true: 'Развернуть все',
                    false:'Свернуть все'
                },
                en: {
                    true: 'Unfold all',
                    false:'Fold up all'
                }
            }
        };

    app.initTrigger(header, app.createEl('span', {class : 'lng'}), triggerTitles.lg, app.translate, document.documentElement);

    if (!lv) {
        var sections = document.getElementsByTagName('section');

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
        window.onmousedown = function (e) {
            if (e.target.tagName.toLowerCase() == 'h2') {
                e.preventDefault();
            }
        };
        window.onclick = function (e) {
            if (e.target.tagName.toLowerCase() == 'h2') {
                e.target.parentNode.className = e.target.parentNode.className.indexOf('hidden') == -1 ? e.target.parentNode.className + ' hidden' : e.target.parentNode.className.replace('hidden', '')
            }
        };

//        app.initTrigger(header, app.createEl('span', {class : 'flp unfolded'}), triggerTitles.fb, flipTrigger);
    }

})();
