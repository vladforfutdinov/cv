var zone = $('#zone')[0];
var list = $('#list').find('ol')[0];
var size = $('#size')[0];
var flush = $('#flush')[0];

var storageApp = {
    makeObject: function(_item, el){
        return {
            'coord' : _item.coord,
            'elem' : el
        };
    },
    flushStorage: function(){
        $.jStorage.flush();
        $('#zone .item, #list li').remove();
        array = [];
        store = [];
        $(size).text($.jStorage.storageSize());
    },
    makeElement: function(index, data){
        var element = document.createElement('div');
        $(element).addClass('item');
        element.coord  = data || {};

        var label = document.createElement('span');
        label.coord  = data;
        $(label).attr({'data-count' : index + 1});
        $(element).append(label);

        return element;
    },
    makePoint: function(index, data, area){
        var element = document.createElement('div');
        $(element).addClass('point');
        element.coord  = data || {};

        var label = document.createElement('span');
        label.coord  = data;
        $(label).attr({'data-count' : index + 1});
        $(element).append(label);

        return element;
    },
    makeListItem: function(index, el){
        var listItem = document.createElement('li');
        $(listItem).attr({'data-count' : index + 1});
        $(listItem).html('<em>['+ el.coord.width + '\u00D7' + el.coord.height + ']</em>');
        el.obj = listItem;
        listItem.obj = el;

        var del = document.createElement('span');
        del.coord = listItem.obj.coord;
        listItem.appendChild(del);

        return listItem;
    },
    refresh: function(){
        var _this = this;
        array = [];
        store = [];
        noHover = false;

        $(zone).find('div').remove();
        $(list).children().remove();
        $(size).text($.jStorage.storageSize());

        var getStorage = $.jStorage.get('mapa');
        if (getStorage){
            store = JSON.parse(getStorage);
            if (store.length){
                $(store).each(function(i){
                    var element = _this.makeElement(i, this.coord);
                    $(element).css(this.coord);
                    array.push(_this.makeObject(this, element));
                    $(zone).append(element);
                });
                _this.fillList(array, list);
            } else {
                _this.flushStorage();
            }
        }

        $(zone).off();
        $(zone).on(handleHovers, '.item');
        $(zone).on({'mousedown' : _this.drawArea});
        $(zone).on({'click' : drawAreaPoint});
        $(zone).on({'dblclick' : closeArea});
        $(zone).on({'click' : removeArea}, 'span');

        $(list).off();
        $(list).on(handleHovers, 'li');
        $(list).on({'click' : removeArea}, 'span');

        $(flush).off('click');
        $(flush).on({'click' : _this.flushStorage});
    },
    setStartPx: function(e, _top, _left){
        var top = e.pageY;
        var left = e.pageX;
        var dy = top - _top - zone.y;
        var dx = left - _left - zone.x;
        return {
            'left' : (dx >= 0 ? _left : (left - zone.x)),
            'top' : (dy >= 0 ? _top : (top - zone.y)),
            'width' : (dx >= 0 ? dx : -dx),
            'height' : (dy >= 0 ? dy : -dy)
        };
    },
    drawArea: function(e){
        var _this = this;

        if (e.target.tagName.toLowerCase() != 'span'){
            noHover = true;
            var _item = {'coord' : {}};
            var _top = e.pageY - zone.y;
            var _left = e.pageX - zone.x;

            var element = _this.makeElement(array.length);
            $(element).addClass('temp');
            $(this).append(element);

            $(window).on({
                mousemove : function(e){
                    _item.coord = _this.setStartPx(e, _top, _left);
                    $(element).css(_item.coord);
                },
                mouseup : function(){
                    if (_item.coord.width > 10 || _item.coord.height > 10){
                        element.coord = _item.coord;
                        store.push(_item);
                        array.push(_this.makeObject(_item, element));

                        $(element).css(_item.coord);
                        $(element).removeClass();
                    } else {
                        $(element).remove();
                    }

                    $(this).off('mouseup');
                    $(this).off('mousemove');

                    _this.saveList(store);

                    _this.refresh();
                }
            });
        }
    },
    fillList: function (array, destnation){
        var _this = this;
        if (array.length){
            $(destnation).children().remove();
            $(array).each(function(i){
                var listItem = _this.makeListItem(i, this.elem);
                destnation.appendChild(listItem);
            });

        }
    },
    saveList: function (array){
        var jsonString = JSON.stringify(array);
        $.jStorage.set('mapa', jsonString);
        size.innerHTML = $.jStorage.storageSize();
    },
    coords: function (zone){
        zone.x = zone.offsetLeft;
        zone.y = zone.offsetTop;
    }
};

function init(){

    $(document.body).addClass((!jQuery.support.leadingWhitespace ? 'ie8' : ''));

    var array, store, noHover;

    var debug = $('#debug')[0];

    var zone = $('#zone')[0];
    var list = $('#list ol')[0];
    var size = $('#size')[0];
    var flush = $('#flush')[0];
    var refresh = function(){
        array = [];
        store = [];
        noHover = false;

        $(zone).find('div').remove();
        $(list).children().remove();
        $(size).text($.jStorage.storageSize());

        var getStorage = $.jStorage.get('mapa');
        if (getStorage){
            store = JSON.parse(getStorage);
            if (store.length){
                $(store).each(function(i){
                    var element = makeElement(i, this.coord);
                    $(element).css(this.coord);
                    array.push(makeObject(this, element));
                    $(zone).append(element);
                });
                fillList(array, list);
            } else {
                flushStorage();
            }
        }

        $(zone).off();
        $(zone).on(handleHovers, '.item');
        $(zone).on({'mousedown' : drawArea});
        $(zone).on({'click' : drawAreaPoint});
        $(zone).on({'dblclick' : closeArea});
        $(zone).on({'click' : removeArea}, 'span');

        $(list).off();
        $(list).on(handleHovers, 'li');
        $(list).on({'click' : removeArea}, 'span');

        $(flush).off('click');
        $(flush).on({'click' : flushStorage});
    };

    coords(zone);

    refresh();

    var handleHovers = {
        'mouseenter' : function(e){
            if (!noHover){
                $(this).addClass('hover');
                $(this.obj).addClass('hover');
            }
        },
        'mouseleave' : function(){
            $(this).removeClass('hover');
            $(this.obj).removeClass('hover');
        }
    };

    var makeObject = function(_item, el){
        return{
            'coord' : _item.coord,
            'elem' : el
        };
    };

    var flushStorage = function(){
        $.jStorage.flush();
        $('#zone .item, #list li').remove();
        array = [];
        store = [];
        $(size).text($.jStorage.storageSize());
    };

    $(window).on({'resize' : coords});

    var makeElement = function(index, data){
        var element = document.createElement('div');
        $(element).addClass('item');
        element.coord  = data || {};

        var label = document.createElement('span');
        label.coord  = data;
        $(label).attr({'data-count' : index + 1});
        $(element).append(label);

        return element;
    };

    var makePoint = function(index, data, area){
        var element = document.createElement('div');
        $(element).addClass('point');
        element.coord  = data || {};

        var label = document.createElement('span');
        label.coord  = data;
        $(label).attr({'data-count' : index + 1});
        $(element).append(label);

        return element;
    };

    var drawArea = function(e){
        if (e.target.tagName.toLowerCase() != 'span'){
            noHover = true;
            var _item = {'coord' : {}};
            var _top = e.pageY - zone.y;
            var _left = e.pageX - zone.x;

            var element = makeElement(array.length);
            $(element).addClass('temp');
            $(this).append(element);

            $(window).on({
                mousemove : function(e){
                    var top = e.pageY;
                    var left = e.pageX;
                    var dy = top - _top - zone.y;
                    var dx = left - _left - zone.x;
                    _item.coord = {
                        'left' : (dx >= 0 ? _left : (left - zone.x)),
                        'top' : (dy >= 0 ? _top : (top - zone.y)),
                        'width' : (dx >= 0 ? dx : -dx),
                        'height' : (dy >= 0 ? dy : -dy)
                    };
                    $(element).css(_item.coord);
                },
                mouseup : function(){
                    if (_item.coord.width > 10 || _item.coord.height > 10){
                        element.coord = _item.coord;
                        store.push(_item);
                        array.push(makeObject(_item, element));

                        $(element).css(_item.coord);
                        $(element).removeClass();
                    } else {
                        $(element).remove();
                    }

                    $(this).off('mouseup');
                    $(this).off('mousemove');

                    saveList(store);

                    refresh();
                }
            });
        }
    };

    var drawAreaPoint = function(e){
        console.log(0);
        if (e.target.tagName.toLowerCase() != 'span'){
            noHover = true;
            var _item = {'coord' : {
                y : e.pageY - zone.y,
                x : e.pageX - zone.x
            }};

            var element = makePoint(array.length, null, openArea);
            $(element).addClass('temp');
            $(this).append(element);

            $(window).on({
                mousemove : function(e){
                    var top = e.pageY;
                    var left = e.pageX;
                    var dy = top - _top - zone.y;
                    var dx = left - _left - zone.x;
                    _item.coord = {
                        'left' : (dx >= 0 ? _left : (left - zone.x)),
                        'top' : (dy >= 0 ? _top : (top - zone.y)),
                        'width' : (dx >= 0 ? dx : -dx),
                        'height' : (dy >= 0 ? dy : -dy)
                    };
                    $(element).css(_item.coord);
                },
                mouseup : function(){
                    if (_item.coord.width > 10 || _item.coord.height > 10){
                        element.coord = _item.coord;
                        store.push(_item);
                        array.push(makeObject(_item, element));

                        $(element).css(_item.coord);
                        $(element).removeClass();
                    } else {
                        $(element).remove();
                    }

                    $(this).off('mouseup');
                    $(this).off('mousemove');

                    saveList(store);

                    refresh();
                }
            });
        }
    };

    var closeArea = function(e){
        if (e.target.tagName.toLowerCase() != 'span'){
            noHover = false;
            var _item = {'coord' : {}};
            var _top = e.pageY - zone.y;
            var _left = e.pageX - zone.x;
        }
    };

    var makeListItem = function(index, el){
        var listItem = document.createElement('li');
        $(listItem).attr({'data-count' : index + 1});
        $(listItem).html('<em>['+ el.coord.width + '\u00D7' + el.coord.height + ']</em>');
        el.obj = listItem;
        listItem.obj = el;

        var del = document.createElement('span');
        del.coord = listItem.obj.coord;
        listItem.appendChild(del);

        return listItem;
    };

    var removeArea = function(e){
        var _this = this;
        $.each(store, function(i){
            if (this.coord === _this.coord){
                store.splice(i, 1);
                saveList(store);
            }
        });
        refresh();
    };

    function fillList(array, destnation){
        if (array.length){
            $(destnation).children().remove();
            $(array).each(function(i){
                var listItem = makeListItem(i, this.elem);
                destnation.appendChild(listItem);
            });

        }
    }

    function saveList(array){
        var jsonString = JSON.stringify(array);
        $.jStorage.set('mapa', jsonString);
        size.innerHTML = $.jStorage.storageSize();
    }

    function coords(zone){
        zone.x = zone.offsetLeft;
        zone.y = zone.offsetTop;
    }

}

(function($){
    $.fn.serializeJSON=function() {
        var json = {};
        jQuery.map($(this).serializeArray(), function(n, i){
            json[n['name']] = n['value'];
        });
        return json;
    };
})(jQuery);

$(function(){init();});
