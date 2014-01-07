(function () {
    var utils = {
        createEl : function(tag, attr, injection){
            var el = tag ? document.createElement(tag) : document.createDocumentFragment();
            for (key in attr){
                el.setAttribute(key, attr[key]);
            }
            if (injection){
                if (injection == injection.toString()){
                    el.innerHTML = injection;
                } else {
                    el.appendChild(injection);
                }
            }
            return el;
        }
    };
    var body = document.body;
    if (typeof(lv) == 'undefined') {
        var lv = false;
    }
    var clientLang = document.documentElement.lang;
    var header = document.getElementsByTagName('header')[0];
    var triggerTitles = {
        'lg': {
            'ru': 'In English', 'en': 'По-русски'},
        'fb': {
            true: {
                'ru': 'Развернуть все', 'en': 'Unfold all'
            },
            false: {
                'ru': 'Свернуть все', 'en': 'Fold up all'
            }
        }
    };
    var langTrigger  = utils.createEl('span', {class : 'lng'}, 'damn');
    header.appendChild(langTrigger);
    if (!lv) {
        body.className += 'modern';
        var flipTrigger = utils.createEl('span', {class : 'flp unfolded'});
        header.appendChild(flipTrigger);
        var sections = document.getElementsByTagName('section');
        flipTrigger.onclick = function () {
            var foldStatus = this.className.indexOf('folded') == -1;
            this.className = foldStatus ? this.className + ' folded' : this.className.replace('folded', '');
            this.innerHTML = triggerTitles.fb[this.className.indexOf('folded') == -1][clientLang];
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
    }
    langTrigger.onclick = function () {
        clientLang = clientLang == 'en' ? 'ru' : 'en';
        translate(true);
    };
    translate();
    function translate(dt) {
        langTrigger.innerHTML = triggerTitles.lg[clientLang];
        if (!lv) {
            flipTrigger.innerHTML = triggerTitles.fb[flipTrigger.className.indexOf('folded') == -1][clientLang];
        }
        if (dt) {
            var el = document.body.getElementsByTagName('*');
            for (var i = 0, ilength = el.length; i < ilength; i++) {
                if (el[i] && el[i].getAttribute('data-lang')) {
                    var cn = el[i].childNodes;
                    console.log(cn);
                    for (var j = 0, jlength = cn.length, temp; j < jlength; j++) {
                        if (cn[j].nodeType == 3 && cn[j].nodeValue) {
                            console.log();
                            temp = el[i].getAttribute('data-lang');
                            el[i].setAttribute('data-lang', cn[j].nodeValue);
                            cn[j].nodeValue = temp;
                        }
                    }
                }
            }
        }
    }
})();




