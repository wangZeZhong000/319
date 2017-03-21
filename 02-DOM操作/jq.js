/**
 *
 * Created by ChengXiancheng on 2017/3/15.
 */

(function(window){
    var arr=[];
    var push=arr.push;
    var splice=arr.splice;
    var slice=arr.slice;

    var toString = Object.prototype.toString;

    var class2type = {};
    var types = "Number String Boolean Object Array Math Date RegExp Function".split(" ");
    for (var i = 0; i < types.length; i++) {
        var type = types[i];//"Number"

        //class2type["[object Number]"]="number"
        class2type["[object " + type + "]"] = type.toLowerCase();
    }


    function isLikeArray(array) {
        var len = array.length;//数组、伪数组的长度
        return typeof len === "number"
            && len >= 0
            && len - 1 in array;
    }

    //1、选择器函数
    var Sizzle=function(selector){
        return document.querySelectorAll(selector);
    };
    //2、入口函数
    var jQuery=function(selector){
        //返回一个F的实例
        return new jQuery.fn.F(selector);
    };
    jQuery.fn=jQuery.prototype={
        constructor:jQuery,
        F:function(selector){
            //1、清空之前的DOM元素
            splice.call(this,0,this.length);//本身没有length属性，会设置length属性的值为0

            if(selector==null) return this;

            if(jQuery.isString(selector)){
                //selector可能是一个选择器，也可能是一个html标签(<开头，>结尾)
                if(selector[0]==="<" && selector[selector.length-1]===">" && selector.length>=3){
                    //selector是一个html标签-->将这一段html标签转换为DOM元素
                    //dom.innerHTML="html标签"
                    //要找到一个dom元素，就不能使用HTML页面中已经存在的标签，可以在内存中创建出这样的DOM元素
                    var div=document.createElement("div");
                    div.innerHTML=selector;//这一行代码执行完毕，div就会拥有一系列的子节点

                    //将div的子节点遍历追加到this中
                    //div.childNodes：获取到所有的子节点

                    var nodes=div.childNodes;
                    push.apply(this,nodes);

                }else{
                    //2、通过选择器函数获取元素
                    var elements=Sizzle(selector);
                    //3、借用push方法将elements中的每一个DOM元素遍历添加到this中
                    push.apply(this,elements);
                }



            }else if(selector.nodeType){
                //selector是一个dom元素
                this[0]=selector;
                this.length=1;//this["length"]=1
            }else{
                jQuery.merge(this,selector);
            }


            //4、返回this
            return this;

        }
    };

    //设置F的原型指向jquery的原型
    jQuery.fn.F.prototype=jQuery.fn;

    //extend方法
    jQuery.fn.extend=jQuery.extend=function(){
        var target,sources,
            arg0=arguments[0];

        if(arguments.length==0) return this;
        if(arguments.length==1){
            target=this;
            sources=[arg0];
        }else{
            target=arg0;
            sources=slice.call(arguments,1);
        }

        for (var i = 0; i < sources.length; i++) {
            var source = sources[i];
            for (var key in source) {
                target[key]=source[key];
            }
        }
        return target;
    };


    jQuery.extend({
        /**
         * 1、遍历数组、伪数组  2、遍历普通的对象
         * @param array
         * @param callback
         */
        each: function (array, callback) {
            var i, len;
            if (isLikeArray(array)) {
                for (i = 0, len = array.length; i < len; i++) {
                    if (callback.call(array[i], i, array[i]) === false)
                        break;

                }
            } else {
                for (i in array) {
                    if (callback.call(array[i], i, array[i]) === false)
                        break;
                }
            }
        },
        type: function (data) {
            if (data == null) {
                return String(data);
            }

            var result = toString.call(data);//"[object Xxxx]"

            //发现result正好就在class2type中有该属性的名称
            return class2type[result];       //return "xxxx";

        },
        isString: function (str) {
            return typeof str === "string";
        },
        isFunction: function (fn) {
            return typeof fn === "function";
        },
        isArray: Array.isArray || function (array) {
            return jQuery.type(array) === "array";
        },
//        isArray2: function (array) {
//            return Array.isArray?
//                    Array.isArray(array) :
//                    jQuery.type(array) === "array";
//        }

        //将source中的元素遍历添加到target中
        merge:function(target,source){
            //target:{0:10,length:1}
            //source:{0:"a",1:"b",length:2}

            //保存了原始目标对象的长度
            var len=target.length;      //len:1
            for (var i = 0; i < source.length; i++) {
                var v = source[i];

                //在追加的时候：设置以target的长度为索引的元素的值，这一行代码对于数组来说长度自增，对于伪数组来说长度不会发生任何变化
                target[len+i]=v;
            }
            //第一次遍历：i=0 len=1 target[1]="a"
            //第二次遍历：i=1 len=1 target[2]="b"


            //这一行代码执行之前，target.length对于数组来说是：3，对于伪数组来说：1
            target.length=source.length+len;//target.length=2+1=3

            return target;

        },

        makeArray:function(data){
            if(isLikeArray(data)){
                return jQuery.merge([],data);
            }

            return [data];
        },
        trim:function(str){
            return str.replace(/^\s+|\s+$/g,"");
        }
    });

    jQuery.fn.extend({
        //遍历F的实例(JQuery对象)中每一个DOM元素的遍历
        each: function (callback) {
            jQuery.each(this, callback);

            return this;
        }
    });

    //CSS模块
    jQuery.fn.extend({
        css:function(){
            var len=arguments.length,
                arg0=arguments[0],
                arg1=arguments[1];

            if(len===0) return this;

            if(len===1){
                if(jQuery.isString(arg0)){
                    var firstDom=this[0];
                    return window.getComputedStyle(firstDom,null)[arg0];
                }else{
                    return this.each(function(){
                       //this:DOM
                        var dom=this;

                        jQuery.each(arg0,function(styleName,styleValue){
                            dom.style[styleName]=styleValue;
                        });
                    });
                }

            }else{
                return this.each(function(){
                    this.style[arg0]=arg1;
                });

            }
        },
        show:function(){
            return this.css("display","block");
        },
        hide:function(){
            return this.css("display","none");
        },
        toggle:function(){
            return this.each(function(){
                var $dom=jQuery(this);
                if($dom.css("display")==="none"){
                    $dom.show();
                }else{
                    $dom.hide();
                }
            });
        }
    });

    //DOM操作
    jQuery.fn.extend({
        get:function(index){
            var len=arguments.length;

            if(len===0){
                return jQuery.makeArray(this);
            }

            if(index>=0){
                return this[index];
            }

            return this[index+this.length];
        },
        //返回由第一个DOM元素组成的jquery对象
        first:function(){
            // return jQuery(this.get(0));

            return this.eq(0);
        },
        //返回由最后一个DOM元素组成的jquery对象
        last:function(){
            // return jQuery(this.get(-1));

            return this.eq(-1);
        },
        eq:function(index){
            return jQuery(this.get(index));
        },
        find:function(selector){
            var $=jQuery();

            this.each(function(){
                var dom=this;
                var elements=dom.querySelectorAll(selector);
                jQuery.merge($,elements);
            });

            return $;
        }
    })

    window.$=window.jQuery=jQuery;

})(window);