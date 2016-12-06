const chalk = require('chalk');


/* 
* tools helper
*/


//?a=1&b=2 -> {a:1,b:2}
//a=1&b=2 -> {a:1,b:2}
function paramToObj(strLink) {
    var str = strLink;
    if(strLink.indexOf('?') > -1){
        str = strLink.split('?')[1];
    }

    var keyValues = str.split("&");
    var result = {};
    for(k in keyValues){
        if(keyValues.hasOwnProperty(k)){
            var kv = keyValues[k].split('=');
            var getValue  =  kv[1];
            if(getValue && /^-?\d+$/.test(getValue)){
                getValue = parseInt(getValue); 
            }
            result[kv[0]] = getValue;
        }
    }
    return result;
}



//删除数组的第Ｎ项
Array.prototype.removeAt = function( index )
{
    var part1 = this.slice( 0, index );
    var part2 = this.slice( index );
    part1.pop();
    return( part1.concat( part2 ) );
}

//去除字符串尾部空格或指定字符  
String.prototype.trimEnd = function(chars) /*String*/
{
    if (chars == null) {
        chars = FRL.strings.whiteSpaceChars;
    }
    if (this == null || this == "") {
        return "";
    }
    var i /*int*/;
    var l /*int*/ = this.length;
    for (i = this.length - 1; (i >= 0) && (chars.indexOf(this.charAt(i)) > -1); i--) {

    }

    return this.substring(0, i + 1);
};


Date.prototype.format=function(fmt) {      
    var o = {      
    "M+" : this.getMonth()+1, //月份
    "d+" : this.getDate(), //日
    "h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时
    "H+" : this.getHours(), //小时
    "m+" : this.getMinutes(), //分
    "s+" : this.getSeconds(), //秒
    "q+" : Math.floor((this.getMonth()+3)/3), //季度
    "S" : this.getMilliseconds() //毫秒
    };      
    var week = {      
    "0" : "\u65e5",      
    "1" : "\u4e00",      
    "2" : "\u4e8c",      
    "3" : "\u4e09",      
    "4" : "\u56db",      
    "5" : "\u4e94",      
    "6" : "\u516d"     
    };      
    if(/(y+)/.test(fmt)){      
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));      
    }      
    if(/(E+)/.test(fmt)){      
        fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "\u661f\u671f" : "\u5468") : "")+week[this.getDay()+""]);      
    }      
    for(var k in o){      
        if(new RegExp("("+ k +")").test(fmt)){      
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));      
        }      
    }      
    return fmt;      
}  

function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

// common log 
var log = {
    error: function(msg, err){
        console.log(chalk.red('%s'), msg);
        err && console.log(err);
    },
    warn: function(msg){
        console.log(chalk.yellow('%s'), msg);
    },
    success: function(msg){
        console.log(chalk.green('%s'), msg);
    },
    normal: function(msg){
        console.log( msg);
    }
}


module.exports = {
   paramToObj: paramToObj,
   guid: guid,
   log: log
}