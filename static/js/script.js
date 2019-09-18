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

			cfg = {addEvent:0, initialized:0, prefix:""};
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
		if(cfg.initialized) return;
		cfg.initialized = 1;

		var nodes;
		page.menu = getByID("content-message");
		if(page.menu){
			nodes = page.menu.getElementsByTagName("form");
			if(nodes.length > 0) page.form = nodes[0];
		}
		if(page.form){
			nodes = page.form.getElementsByTagName("select");
			if(nodes.length) page.select = nodes[0];

			nodes = page.form.getElementsByTagName("input");
			for(var i = nodes.length - 1; i >= 0; i--){
				if(nodes[i].type == "submit") page.btn = nodes[i];
			}

		}

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

	function reCreateMeno(e){
		var count = "";
		if(page.select){
			count = page.select.options[page.select.selectedIndex].value;
			count = parseInt(count, 10);
		}
		if(!isNumber(count) ) count = 12;// if no way to select number of memos, then use the default numbers of memos in this game;

		var nodes = document.getElementsByClassName("box"), i = nodes.length - 1, memoDiv;
		if(i >= 0) memoDiv = nodes[0].parentNode;
		for(; i >= 0; i--){
			memoDiv.removeChild(nodes[i]);
		}

		nodes = [];
		var card;
		for(i = count*2; i > 0; i--){
			card = document.createElement("div");
			card.className="box col";
			memoDiv.appendChild(card);
			nodes.push(card);
		}

		runMemos(nodes);

		var event = (e)?e:window.event;
		event.preventDefault();
		page.menu.style.display = "none";
	}

	function isNumber(value){
		return ( Object.prototype.toString.call(value)!=='[object Array]' && (value-parseFloat(value)+1)>=0)?true:false;
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
		if(cfg.initialized > 1) return;
		cfg.initialized += 1;

		var nodes = document.getElementsByClassName("box");
		runMemos(nodes);
		if(cfg.addEvent == 1){
			if(page.btn) page.btn.addEventListener("click", reCreateMeno, false);
		} else {
			if(page.btn) page.btn.onclick = reCreateMeno;
		}
	}
	function runMemos(memoNodes){
		var i = memoNodes.length - 1;
		if(i < 0) return;

		if(cfg.addEvent == 1){
			for(; i >= 0; i--){
				memoNodes[i].addEventListener("mouseover", startGradient, false);
				memoNodes[i].addEventListener("mouseout", stopGradient, false);
			}
		} else {
			for(; i >= 0; i--){
				memoNodes[i].onmouseover = startGradient;
				memoNodes[i].onmouseout = stopGradient;
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

			setUp({});
			run();

			return inst2;
		}
	}
})();

