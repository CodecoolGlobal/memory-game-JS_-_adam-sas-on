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

			page = {menu: null};
			memo = {memos:[], node:null, pos:1, timeout:false};
		}

		return instance;
	}

	function setUp(args){
	
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
		if(event.target) page.node = event.target;
		else if(event.srcElement) page.node = event.srcElement;

		page.pos = 0;
		nextGradient();
		page.timeout = setInterval(nextGradient, 10);
	}
	function nextGradient(){
		if(page.pos == 140){
			page.node.style.background = "#FFF";
			clearInterval(page.timeout);
			page.timeout = false;
			page.pos = 1;
			return;
		}

		page.pos += 2;
		var percentages = [0, 0, 0];
		percentages[2] = Math.min(100, page.pos);
		if(page.pos > 20) percentages[1] = Math.min(100, page.pos - 20);
		if(page.pos > 40) percentages[0] = page.pos - 40;

		page.node.style.background = cfg.prefix + "linear-gradient(145deg, #FFF " + percentages[0] + "%, #CCC " + percentages[1] + "%, #FFF " + percentages[2] + "%)";
	}
	function stopGradient(){
		page.node.style.background = "";
		if(page.timeout != false) clearInterval(page.timeout);
		page.timeout = false;
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

