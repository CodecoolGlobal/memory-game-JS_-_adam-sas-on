if(!Array.prototype.indexOf) {// 60% support (2019);
	Array.prototype.indexOf = function(needle){
		for(var i = 0; i < this.length; i++){
			if(this[i] === needle){
				return i;}
		}
		return -1;
	};
};
if(!Array.prototype.splice) {// 89% support (2019);
	Array.prototype.splice = function(){/* start, toRemove, values2add; */
		var args=Array().slice.call(arguments);

		if(args.length == 0) return null;/* undefined should be returned; */

		var removed = [], that = [],
		    i = 0, j, n2rm;
		if(args.length > 1) n2rm = args[1];
		else n2rm = this.length + 1;/* just in case +1 but unnecesary; */

		that = this.slice();/* for(i = 0; i < this.length; i++) that.push(this[i]); */
		this.length = 0;

		for(i = 0; i < args[0] && i < that.length; i++) this.push(that[i]);
		for(j = 0; i < that.length && j < n2rm; i++, j++) removed.push(that[i]);
		for(j = 2; j < args.length; j++) this.push(args[j]);/* will happened if args.length > 2; */
		for(; i < that.length; i++) this.push(that[i]);/* will be executed if args.length > 1 and args[1] is small enough; */

		/* this = that; forbidden! ReferenceError: Invalid assignment left-hand side; */
		return removed;
	};
};


var App_ = (function(){
	var page, memo, statistic, cfg, instance;

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

			page = {menu: null, form: null, select: null, btn: null, icons:[], iconDefault: ""};
			memo = {memos: [], cards: [], cardOpen: -1, cardIndex: -1, card2open: -1, node: null, pos: 1, timeout: false};
			statistic = {opens: 0, nodeCards: null, nodeOpens: null, messageFn:function(){} };
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

		var resultsId = "menu_left";
		if(args.hasOwnProperty('menuResults') ){
			if(isString(args.menuResults) ) resultsId = args.menuResults;
		}
		nodes = getByID(resultsId);
		if(nodes){
			clearNode(nodes);
			nodes.appendChild(document.createTextNode("# of card pairs to open: ") );
			statistic.nodeCards = document.createElement("span");
			nodes.appendChild(statistic.nodeCards);

			nodes.appendChild(document.createTextNode("; # of openings: ") );
			statistic.nodeOpens = document.createElement("span");
			nodes.appendChild(statistic.nodeOpens);

			statistic.messageFn = function(){
				var restCards = parseInt(memo.cards.length/2, 10);
				statistic.nodeCards.innerHTML = "";
				statistic.nodeCards.appendChild(document.createTextNode(restCards) );
				statistic.nodeOpens.innerHTML = "";
				statistic.nodeOpens.appendChild(document.createTextNode(statistic.opens) );
			}
		}

		setCards(args);
	}
	function setCards(args){
		page.iconDefault = "fas fa-code-branch";
		if(args.hasOwnProperty("iconDefault") ){
			if( isString(args.iconDefault) ) page.iconDefault = args.iconDefault;
		}

		page.icons = ["fas fa-code", "fas fa-bicycle", "fas fa-charging-station", "fas fa-fighter-jet", "fas fa-space-shuttle",
				"fas fa-globe-europe", "fas fa-laptop-code", "fas fa-microchip", "fas fa-sim-card", "fas fa-database",
				"fas fa-recycle", "fas fa-box-open", "fas fa-inbox", "fas fa-key" , "fas fa-lock-open",
				"fas fa-solar-panel", "fas fa-download", "fas fa-peace", "fas fa-layer-group", "fas fa-info-circle"];

		var nodes = document.getElementsByClassName("box"), i;
		for(i = 0; i < nodes.length; i++)
			memo.cards.push(nodes[i]);// to enable removing correctly opened cards;

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
		for(var i = 0; i < count; i++){// create array of numbers;
			memo.memos.push(page.icons[i]);
			memo.memos.push(page.icons[i]);
		}
		shuffle(memo.memos);
		statistic.opens = 0;

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

		memo.cards = [];
		var card;
		count = count*2;
		for(i = 0; i < count; i++){
			card = document.createElement("div");
			card.className="box col";

			nodes = document.createElement("span");
			nodes.className = page.iconDefault;
			card.appendChild(nodes);

			memoDiv.appendChild(card);
			memo.cards.push(card);
		}

		runMemos(memo.cards);

		var event = (e)?e:window.event;
		event.preventDefault();
		page.menu.style.display = "none";
	}

	function isNumber(value){
		return ( Object.prototype.toString.call(value)!=='[object Array]' && (value-parseFloat(value)+1)>=0)?true:false;
	}
	function isString(str){
		var result = false;
		if( typeof str == "string" || (typeof st == "object" && st.constructor === String) ) result = true;
		if(result === true && str.length == 0) result = false;
		return result;
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

	function removeFromCards(){
		var newCards = [], i = 0, n = memo.cards.length;
		for(; i < n; i++){
			if(i != memo.cardOpen && i != memo.card2open) newCards.push(memo.cards[i]);
		}
		memo.cards = newCards;
	}

	function clearNode(node){
		while(node.firstChild) node.removeChild(node.firstChild);
	}

	function openMemoCard(e){
		var event = (!e)?window.event:e, card = this;
		/*if(event.target) card = event.target;
		else if(event.srcElement) card = event.srcElement;*/

		var i = 0, node = card;
		while((node=node.previousSibling)!=null){
			if(node.tagName.toLowerCase() == "div") i++;
		}

		stopGradient();
		card.style.background = "#FFF";
		card.firstChild.className = memo.memos[i];

		if(memo.cardIndex >= 0){
			memo.card2open = memo.cards.indexOf(card);
			statistic.opens += 1;

			if(memo.memos[memo.cardIndex] == memo.memos[i]){// second card is correct;
				removeMemoEvent(card);

				removeFromCards();
				memo.cardOpen = memo.card2open = -1;
				memo.cardIndex = -1;
			} else {// wrong card;
				for(i = memo.cards.length - 1; i >= 0; i--){
					if(i == memo.cardOpen) continue;
					removeMemoEvent(memo.cards[i]);
				}

				setTimeout(closeWrongCards, 1000);
			}
			statistic.messageFn();
		} else {
			memo.cardIndex = i;
			memo.cardOpen = memo.cards.indexOf(card);

			removeMemoEvent(card);
			card.style.background = "#FFF";
		}

	}
	function closeWrongCards(){
		var card = memo.cards[memo.cardOpen], card2 = memo.cards[memo.card2open];

		card.firstChild.className  = page.iconDefault;// clearNode(card);
		card.style.background = "";
		card2.firstChild.className = page.iconDefault;// clearNode(card2);
		card2.style.background = "";

		runMemos(memo.cards);

		memo.cardOpen = -1;
		memo.cardIndex = -1;
		memo.card2open = -1;
	}

	function startGradient(e){
		memo.node = this;
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

		runMemos(memo.cards);
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

