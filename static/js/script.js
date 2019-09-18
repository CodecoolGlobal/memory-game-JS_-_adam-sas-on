var App_ = (function(){
	var page, memo, cfg, instance;

	function App_(){
		if(instance == null){
			instance = Object.create(App_.prototype);

			if(!Event.prototype.preventDefault){
				Event.prototype.preventDefault = function(){this.returnValue=false;};
			}
			if(!Event.prototype.stopPropagation){
				Event.prototype.stopPropagation = function(){this.cancelBubble=true;};
			}

			cfg = {addEvent:0, initialized:false, prefix:""};
			getCssPrefix();

			if(Element.prototype.addEventListener) cfg.addEvent = 1;
			else if(Element.prototype.attachEvent){
				Element.prototype.addEventListener = function(eventName, listener, useCapture){
					this.attachEvent('on' + eventName, listener);
				}

				Element.prototype.removeEventListener = function(eventName, listener){
					this.detachEvent('on' + eventName, listener);
				}
				cfg.addEvent = 1;
			}

			page = {menu: null, form: null, select: null, btn: null};
			memo = {memos:[], node:null, pos:1, timeout:false};
		}

		return instance;
	}

	function setUp(args){
		page.menu = getByID("content-message");

	}

	function getCssPrefix(){
		var prefixes = ['', '-o-', '-ms-', '-moz-', '-webkit-'], value = "", node;
		node = document.createElement("div");

		for(var i = 0; i < prefixes.length; i++){
			node.style.background = prefixes[i] + "linear-gradient(#000, #FFF)";

			if(node.style.background){
				value = prefixes[i];// check if the style was successfully set;
				break;
			}
		}
		cfg.prefix = value;
	}

	function getByID(id_str){
		var result;
		try {
			result = document.getElementById(id_str);
		} catch(e){result=null;}
		return result;
	}

	function startGradient(e){
		var event = (!e)?window.event:e;
		if(event.target) memo.node = event.target;
		else if(event.srcElement) memo.node = event.srcElement;

		memo.pos = 0;
		nextGradient();
		memo.timeout = setInterval(nextGradient, 10);
	}
	function nextGradient(){
		if(memo.pos == 140){
			memo.node.style.background = "#FFF";
			clearInterval(memo.timeout);
			memo.timeout = false;
			memo.pos = 1;
			return;
		}

		memo.pos += 2;
		var percentages = [0, 0, 0];
		percentages[2] = Math.min(100, memo.pos);
		if(memo.pos > 20) percentages[1] = Math.min(100, memo.pos - 20);
		if(memo.pos > 40) percentages[0] = memo.pos - 40;

		memo.node.style.background = cfg.prefix + "linear-gradient(145deg, #FFF " + percentages[0] + "%, #CCC " + percentages[1] + "%, #FFF " + percentages[2] + "%)";
	}
	function stopGradient(){
		memo.node.style.background = "";
		if(memo.timeout != false) clearInterval(memo.timeout);
		memo.timeout = false;
	}

	function run(){
		if(cfg.initialized) return;
		cfg.initialized = true;

		var nodes = document.getElementsByClassName("box");
		if(cfg.addEvent == 1){
			for(var i = 0; i < nodes.length; i++){
				nodes[i].addEventListener("mouseover", startGradient, false);
				nodes[i].addEventListener("mouseout", stopGradient, false);
			}
		} else {
			for(var i = 0; i < nodes.length; i++){
				nodes[i].onmouseover = startGradient;
				nodes[i].onmouseout = stopGradient;
			}
		}
	}

	return {
		getInstance: function(){
			return new App_();
		},
		init: function(){
			var inst2 = instance;
			if(instance == null) inst2 = new App_();

			run();

			return inst2;
		}
	}
})();

