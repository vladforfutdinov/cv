var calc = {
    // temperatures
    temp : {
        c : function(value, adduction){return (adduction ? value : value).toFixed(1);},
        f : function(value, adduction){return (adduction ? ((value - 32) * 5 / 9) : (value * 9 / 5 + 32)).toFixed(1);},
        k : function(value, adduction){return (adduction ? (value - 273) : (value + 273)).toFixed(1);}
    },
    // inches
    inches : {
        cm : function(value, adduction){return (adduction ? value : value).toFixed(2);},
        in : function(value, adduction){return (adduction ? (value * 2.54) : (value / 2.54)).toFixed(2);},
        ft : function(value, adduction){return (adduction ? (value * 30.48) : (value / 30.48)).toFixed(3);}
    },
    // meters
    meters :{
        m : function(value, adduction){return (adduction ? value : value).toFixed(3);},
        ft : function(value, adduction){return (adduction ? (value * 0.3048) : (value / 0.3048)).toFixed(3);},
        km : function(value, adduction){return (adduction ? (value * 1000) : (value / 1000)).toFixed(3);},
        sm : function(value, adduction){return (adduction ? (value * 1609.3) : (value / 1609.3)).toFixed(3);},
        nm : function(value, adduction){return (adduction ? (value * 1852.0) : (value / 1852.0)).toFixed(3);}
    },
    // weight
    weight : {
        g : function(value, adduction){return (adduction ? value : value).toFixed(3);},
        kg : function(value, adduction){return (adduction ? value * 1000 : value / 1000).toFixed(3);},
        t : function(value, adduction){return (adduction ? value * 1000000 : value / 1000000).toFixed(3);},
        lb : function(value, adduction){return (adduction ? value * 453.59237 : value / 453.59237).toFixed(2);},
        oz : function(value, adduction){return (adduction ? value * 28.35 : value / 28.35).toFixed(3);},
        ozt : function(value, adduction){return (adduction ? value * 31.1034768 : value / 31.1034768).toFixed(3);},
        ct : function(value, adduction){return (adduction ? value * .2 : value / .2).toFixed(2);}
    }
};

(function(){
    var tools = document.getElementsByTagName('section');
    if (tools.length){
        for(var i = 0,ilength = tools.length;i < ilength;i++){
            var tool = tools[i];
            tool.inputs = tool.getElementsByTagName('input');
            if (tool.inputs.length){
                for(var j = 0,jlength = tool.inputs.length;j < jlength;j++){
                    var input = tool.inputs[j];
                    input.tool = tool;
                    input.value = '';
                    input.onkeyup = function(){
                        var toolName = this.tool.getAttribute('data-name');
                        this.className = this.className.replace('error', '');
                        if (!isNaN(Number(this.value))){
                            this.tool.value = calc[toolName][this.name](parseFloat(this.value || 0), true);
                            if (this.tool.inputs.length){
                                for(var k = 0, klength = this.tool.inputs.length; k < klength; k++){
                                    this.tool.inputs[k].className = this.tool.inputs[k].className.replace('error', '');
                                    if (this.tool.inputs[k] !== this){
                                        var value = calc[toolName][this.tool.inputs[k].name](parseFloat(this.tool.value), false);
                                        this.tool.inputs[k].value = (!isNaN(value) ? value : this.tool.inputs[k].value);
                                    }
                                }
                            }
                        } else {
                            this.className += (this.className.indexOf('error') != -1) ? '' : ' error';
                        }
                    };
                    input.onfocus = function(){
                        var _this = this;
                        _this.className = (_this.className.indexOf('error') != -1 || _this.className.indexOf('onfocus') != -1)
                            ? _this.className
                            : _this.className + ' focused';
                        setTimeout(function(){
                            _this.className = _this.className.replace('focused', ' onfocus');
                        }, 500);
                    };
                    input.onblur = function(){
                        this.className = this.className.replace('focused', '');
                        this.className = this.className.replace('onfocus', '');
                    };
                }
            }
        }
    }
})();
