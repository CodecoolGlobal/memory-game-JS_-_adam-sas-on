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
			memo = {memos:[], cardOpen: null, cardIndex: -1, node:null, pos:1, timeout:false};
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

	function reCreateMemo(e){
		var count = "";
		if(page.select){
			count = page.select.options[page.select.selectedIndex].value;
			count = parseInt(count, 10);
		}
		if(!isNumber(count) ) count = 12;// if no way to select number of memos, then use the default numbers of memos in this game;

		memo.memos = [];
		for(var i = 1; i <= count; i++){// create array of numbers;
			memo.memos.push(i);
			memo.memos.push(i);
		}
		shuffle(memo.memos);
		console.log(memo.memos);

		var nodes = document.getElementsByClassName("box"), memoDiv = false;
		i = nodes.length - 1;
		// get node parent of memo cards or "content-wrapper" container as default;
		if(i >= 0) memoDiv = nodes[0].parentNode;
		else {
			memoDiv = document.getElementsByClassName("content-wrapper");
			if(memoDiv.length) memoDiv = memoDiv[0];
			else memoDiv = false;
		}

		if(memoDiv == false) return;

		clearNode(memoDiv);

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

	function shuffle(array){
		var index = array.length, temp, randIndex;

		// While there remain elements to shuffle...
		while(0 !== index){
			// Pick a remaining element...
			randIndex = Math.floor(Math.random() * index);
			index -= 1;

			// And swap it with the current element.
			temp = array[index];
			array[index] = array[randIndex];
			array[randIndex] = temp;
		}

		return array;
	}

	function clearNode(node){
		while(node.firstChild) node.removeChild(node.firstChild);
	}

	function openMemoCard(e){
		var event = (!e)?window.event:e, card;
		if(event.target) card = event.target;
		else if(event.srcElement) card = event.srcElement;

		var i = 0, node = card;
		while((node=node.previousSibling)!=null){
			if(node.tagName.toLowerCase() == "div") i++;
		}

		stopGradient();
		card.style.background = "#FFF";
		card.appendChild(document.createTextNode(memo.memos[i]) );

		if(memo.cardIndex >= 0){
			if(memo.memos[memo.cardIndex] == memo.memos[i]){// second card is correct;
				removeMemoEvent(card);
			} else {// wrong card;
				clearNode(card);
				clearNode(memo.cardOpen);

				card.style.background = "";
				memo.cardOpen.style.background = "";
				node = [];
				node.push(memo.cardOpen);
				runMemos(node);
			}
			console.dir(memo.cardOpen);
			memo.cardOpen = null;
			memo.cardIndex = -1;
		} else {
			memo.cardIndex = i;
			memo.cardOpen = card;

			removeMemoEvent(card);
			card.style.background = "#FFF";
		}

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
			if(page.btn) page.btn.addEventListener("click", reCreateMemo, false);
		} else {
			if(page.btn) page.btn.onclick = reCreateMemo;
		}
	}
	function runMemos(memoNodes){
		var i = memoNodes.length - 1;
		if(i < 0) return;

		if(cfg.addEvent == 1){
			for(; i >= 0; i--){
				memoNodes[i].addEventListener("mouseover", startGradient, false);
				memoNodes[i].addEventListener("mouseout", stopGradient, false);
				memoNodes[i].addEventListener("click", openMemoCard, false);
			}
		} else {
			for(; i >= 0; i--){
				memoNodes[i].onmouseover = startGradient;
				memoNodes[i].onmouseout = stopGradient;
				memoNodes[i].onclick = openMemoCard;
			}
		}
	}
	function removeMemoEvent(memoNode){
		if(cfg.addEvent == 1){
			memoNode.removeEventListener("mouseover", startGradient);
			memoNode.removeEventListener("mouseout", stopGradient);
			memoNode.removeEventListener("click", openMemoCard);
		} else {
			memoNode.onmouseover = function(){};
			memoNode.onmouseout = function(){};
			memoNode.onclick = function(){};
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

