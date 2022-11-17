"use strict";

const mt = new MersenneTwister();

// 初回起動時のソーバーデート
// ビルWのソーバーデートらしきもの
let mySoberDate = new Date(1934,11,10, 9);

// JS から制御するDOMエレメントの宣言
// 宣言されてるか判別のために初期値はnull（undefineにしない）
let elmDay = null;
let elmHour = null;
let elmMinute = null;
let elmSeconds = null;
let elmBody = null;

let elmSoberYear = null;
let elmSoberMonth = null;
let elmSoberDay = null;
let elmSoberHour = null;


// ピンクの雲の要素を作成する函数
// 幅と高さが100%のdiv要素を生成して、
// その中のランダムな高さの位置にランダムな
// サイズのピンクの雲のimg要素を追加する
const genCloudElement = size => {
    if(size === undefined){
	size = 100;
    }
    const cloud = new Image();
    cloud.src = "./img/cloud.svg";
    cloud.className = "cloud-image";
    cloud.width = `${(150 * size / 100).toString()}`;
    cloud.height = `${(80 * size / 100).toString()}`;
    cloud.style.top = `${Math.floor(mt.next()*(window.innerHeight+cloud.height)-cloud.height/2)}px`;
    cloud.style.opacity = (10 - Math.random() * 2)/10;
    const div = document.createElement("div");
    div.className = `anim-background anim-${['10','15', '20', '25'][mt.nextInt(0,3)]}`;
    div.appendChild(cloud);

    return div;
};

const putCloudElement = () => {
    const size = mt.nextInt(30, 100);
    const elm = genCloudElement(size);
    elmBody.appendChild(elm);
    // アニメーションフレームの最大時間が25秒なので、そこで削除する
    setTimeout(()=>{
	elm.remove();
    },25000);
};

const cloudElementPutingScheduler = () => {
    const minDelayTime = 300; //msec
    const maxDelayTime = 2000; //msec
    const delayTime = mt.nextInt(minDelayTime,maxDelayTime);
    // 画面が隠れているときは描画しない
    if(!document.hidden){
	putCloudElement();
    }
    setTimeout(cloudElementPutingScheduler, delayTime);
};

const formatDateToCalendar = date => {
    // ミリ秒をトータルの秒に変換
    const s = Math.floor(date / 1000)

    // 秒,分、時間、日を生成（日以外は2桁0埋め文字列）
    return {
	msec : (date%1000).toString().slice(0,2).padStart(2, 0),
	sec  : (s%60).toString().padStart(2, "0"),
	min  : Math.floor((s/60)%60).toString().padStart(2, "0"),
	hour : Math.floor((s/60/60)%24).toString().padStart(2, "0"),
	day  : (Math.floor(s / 24 / 60 / 60)).toString()
    }
};
     
const generatePeriod = ()=>{
    const now = new Date();
    const period = now.getTime() - mySoberDate.getTime();
    // マイナス値の場合は0を返す
    if(period < 0) return 0;
    return period;
};

const updateSoberDate = (year, month, day, hour) => {
    localStorage.setItem("soberYear", year);
    localStorage.setItem("soberMonth", month);
    localStorage.setItem("soberDay", day);
    localStorage.setItem("soberHour", hour);
    mySoberDate = new Date(year, month-1, day, hour);
};

const checkDate = (year, month, day, hour) =>{
    // 年数は4桁だけ許す
    if(year.length !== 4) return false;
    // 各文字列を数値に変換
    const y = Number(year);
    const m = Number(month);
    const d = Number(day);
    const h = Number(hour);
    if(isNaN(y) || !Number.isInteger(y)
       ||
       isNaN(m) || !Number.isInteger(m)
       ||
       isNaN(d) || !Number.isInteger(d)
       ||
       isNaN(h) && !Number.isInteger(h) && h < 0 && h >24
       ||
       isNaN((new Date(`${y}-${m}-${d}`)).getDate())
      ){
	return false;
    }
    return true;
};

// called per display frame rate
const update = () => {
    const period = formatDateToCalendar(generatePeriod());
    
    // DOM Element に値を反映
    elmDay.innerText = period.day;
    elmHour.innerText = period.hour;
    elmMinute.innerText = period.min;
    elmSeconds.innerText = `${period.sec}.${period.msec}`;
    requestAnimationFrame(update);
};

// called when DOM elements is ready
const startUp = () => {
    // 必要なDOMエレメントを取得
    elmDay = document.getElementById("day");
    elmHour = document.getElementById("hour");
    elmMinute = document.getElementById("minute");
    elmSeconds = document.getElementById("seconds");
    elmBody = document.getElementsByTagName("body")[0];

    elmSoberYear = document.getElementById("sober-year");
    elmSoberMonth = document.getElementById("sober-month");
    elmSoberDay = document.getElementById("sober-day");
    elmSoberHour = document.getElementById("sober-hour");
   
    // 変更可能なspan要素を取得して変更イベントを受けられるようにする
    const elmSpans = document.getElementsByTagName("span");
    const elmEditables = Array.prototype.filter.call(elmSpans, (span) =>
	span.contentEditable === "true"
    );
    elmEditables.forEach( span =>  {
	span.addEventListener('focus', (event) => {
	    event.target.style.background = 'pink';
	});
	span.addEventListener('blur', (event) => {
	    event.target.style.background = '';
	})
    });
    // 1度の変更で複数回処理が発生するがやむを得ない
    ["keyup", "paste", "copy", "cut", "mouseup"].forEach(ev => {
	elmEditables.forEach( span =>  {
	    span.addEventListener(ev, (event) => {
		if(!checkDate(elmSoberYear.innerText,
			      elmSoberMonth.innerText,
			      elmSoberDay.innerText,
			      elmSoberHour.innerText)){
		    return;
		}
		updateSoberDate(elmSoberYear.innerText,
				elmSoberMonth.innerText,
				elmSoberDay.innerText,
				elmSoberHour.innerText);
	    });
	})
    });

    // 保存済みのソーバーデートが存在する場合読み込む
    if (localStorage.getItem("soberYear") !== null){
	mySoberDate = new Date(
	    Number(localStorage.getItem("soberYear")),
	    Number(localStorage.getItem("soberMonth"))-1,
	    Number(localStorage.getItem("soberDay")),
	    Number(localStorage.getItem("soberHour")));
	elmEditables[0].innerText = localStorage.getItem("soberYear");
	elmEditables[1].innerText = localStorage.getItem("soberMonth");
	elmEditables[2].innerText = localStorage.getItem("soberDay");
    	elmEditables[3].innerText = localStorage.getItem("soberHour");
    }
    // カウンターの描画を開始
    update();
    // ピンクの雲を描画するスケジューラの起動(CSSアニメーション）
    cloudElementPutingScheduler();
};

document.addEventListener('DOMContentLoaded', startUp);
