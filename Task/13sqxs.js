/*
脚本名称："shu旗小说多账户号稳定版";
适用版本：verson 4.3.2或者4.3.3 ;
作者：caixukun; hcc修改


【注意事项】：
0.所有js脚本均为本地脚本，非远程目录。

1.有时候会出现获取不到ck的情况，请关闭代理重复该步骤多试几次；

2.看视频金币ck获取可能会出现视频加载失败，可以先关闭qx，待视频能看再打开qx;

3.运行次数大概一天，一到两次，日收益5毛左右；

4.阅读任务可能会出现中断，读者可自行更改间隔时间；

5.所有ck获取完成，可以打开boxjs看看书否所有的参数都有值，不要出现账号1的ack和账号2的bck混合在一起；


【nodejs教程】：
打开boxjs，复制会话，新建文件，粘贴，改文件名为 sqxsck.json,与本脚本放同一目录下，用nodejs即可运行本脚本；


【QX教程】：
hostname：ocean.shuqireader.com

[rewrite_local]
https://ocean.shuqireader.com/api/ad/v1/api/prize/lottery url script-request-body https://raw.githubusercontent.com/adw2s/Action/main/Task/sqxsgetck.js
https://ocean.shuqireader.com/api/activity/activity/v1/lottery/draw url script-request-body https://raw.githubusercontent.com/adw2s/Action/main/Task/sqxsgetck.js
https://ocean.shuqireader.com/api/activity/xapi/gold/record url script-request-body https://raw.githubusercontent.com/adw2s/Action/main/Task/sqxsgetck.js
https://ocean.shuqireader.com/api/prizecenter/xapi/prize/manual/receive url script-request-body https://raw.githubusercontent.com/adw2s/Action/main/Task/sqxsgetck.js
https://ocean.shuqireader.com/api/ad/v1/api/prize/readpage/pendant/lottery url script-request-body https://raw.githubusercontent.com/adw2s/Action/main/Task/sqxsgetck.js
https://ocean.shuqireader.com/api/activity/xapi/gold/withdraw/info url script-request-body https://raw.githubusercontent.com/adw2s/Action/main/Task/sqxsgetck.js
https://ocean.shuqireader.com/api/activity/xapi/gold/withdraw url script-request-body https://raw.githubusercontent.com/adw2s/Action/main/Task/sqxsgetck.js

[task_local]
0 12 * * * https://raw.githubusercontent.com/adw2s/Action/main/Task/sqxs.js, tag=shu旗小说, enabled=true

boxjs：https://raw.githubusercontent.com/adw2s/Action/main/Task/sqxs.boxjs.json


*/





const jobname='shu旗小说'
const $=Env(jobname)
const notify = $.isNode() ?require('./sendNotify') : '';

let ReadTimes=0;
let vediogold=0;
let drawgold=0;
let todaygold=0;
let hsincome=0;
let ableCash=0;
let areyouOK='';
let yesok='';
let tellme=0;

!(async () => {
	await all();
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })









async function all()
{
	//nodejs运行
	if ($.isNode())
	{
		for (let w = 1; w < 3; w++){
			let sqxsck = require('./sqxsck'+w+'.json');


		let CountNumber =sqxsck.settings[1].val;
		$.log(`============ 共 ${CountNumber} 个${jobname}账号=============`);
		for (let i = 0; i < CountNumber; i++)
		{
			if (sqxsck.datas[0+12*i].val)
			{
				readckArr=sqxsck.datas[0+12*i].val.split('&&');
				receivecoinckArr = sqxsck.datas[1+12*i].val.split('&&');
				vediogoldprizeckArr=sqxsck.datas[2+12*i].val.split('&&');
				vediodrawprizeckArr= sqxsck.datas[3+12*i].val.split('&&');
				drawckArr= sqxsck.datas[4+12*i].val.split('&&');
				userinfock=sqxsck.datas[5+12*i].val;
				zhurl=sqxsck.datas[6+12*i].val;
				zhhd=sqxsck.datas[7+12*i].val;
				zhbd=sqxsck.datas[8+12*i].val;
				withdrawurl=sqxsck.datas[9+12*i].val;
				withdrawhd=sqxsck.datas[10+12*i].val;
				withdrawbd=sqxsck.datas[11+12*i].val;

				$.log(`\n============ 【shu旗小说${i+1}】=============`);
				ReadTimes=0;
				vediogold=0;
				drawgold=0;
				todaygold=0;
				hsincome=0;
				ableCash=0;
				areyouOK='';
				yesok='';
				tellme=0;

				//阅读
				await readbook();

				//收集阅读金币
				//if(ReadTimes>0)
				await receivecoin();

				//看视频奖励金币
				await vediogoldprize(0);

				//看视频奖励抽奖次数
				await vediodrawprize(0);

				//个人信息
				await userinfo();

				//个人账户
				await withdrawinfo();

				await showmsg();
			}
		}
		}

	}
	//QX运行
	else
	{

		let CountNumber =$.getval('CountNumber');
		$.log(`============ 共 ${CountNumber} 个${jobname}账号=============`);

		for (let i = 1; i <= CountNumber; i++)
		{
			if ($.getdata(`readck${i}`))
			{
				readckArr = $.getdata(`readck${i}`).split('&&');
				receivecoinckArr = $.getdata(`receivecoinck${i}`).split('&&');
				vediogoldprizeckArr= $.getdata(`vediogoldprizeck${i}`).split('&&');
				vediodrawprizeckArr= $.getdata(`vediodrawprizeck${i}`).split('&&');
				drawckArr= $.getdata(`drawck${i}`).split('&&');
				userinfock=$.getdata(`userinfock${i}`);
				zhurl=$.getdata(`zhurl${i}`);
				zhhd=$.getdata(`zhhd${i}`);
				zhbd=$.getdata(`zhbd${i}`);
				withdrawurl=$.getdata(`withdrawurl${i}`);
				withdrawhd=$.getdata(`withdrawhd${i}`);
				withdrawbd=$.getdata(`withdrawbd${i}`);

				$.log('\n============ 【shu旗小说'+i+'】=============');
				ReadTimes=0;
				vediogold=0;
				drawgold=0;
				todaygold=0;
				hsincome=0;
				ableCash=0;
				areyouOK='';
				yesok='';
				tellme=0;

				//阅读
				await readbook();

				//收集阅读金币
				//if(ReadTimes>0)
				await receivecoin();

				//看视频奖励金币
				await vediogoldprize(0);

				//看视频奖励抽奖次数
				await vediodrawprize(0);

				//个人信息
				await userinfo();

				//个人账户
				await withdrawinfo();

				await showmsg();
			}
		}

	}
}



function readbook() {
  return new Promise((resolve, reject) => {
  const url = "https://ocean.shuqireader.com/api/ad/v1/api/prize/readpage/pendant/lottery";

  const request = {
      url: url,
      headers: JSON.parse(readckArr[1]),
      body: readckArr[0]
  };
	$.post(request, async(error, request, data) =>{
      try {
		const result=JSON.parse(data)
		//$.log(data);
		if(result.status==200)
		{
			ReadTimes++;
			$.log("【阅读任务】第"+ReadTimes+"次阅读成功，获得3金币");
			await $.wait(9500);
			await readbook();
		}
		 else
		 {
			 $.log("【阅读任务】阅读失败，"+result.message);
			 //$.log(data);
		 }

      } catch(e) {
			$.log(e)
      }
      resolve();
    });
  });
}

function receivecoin() {
  return new Promise((resolve, reject) => {
  const url = "https://ocean.shuqireader.com/api/prizecenter/xapi/prize/manual/receive";

  const request = {
      url: url,
      headers: JSON.parse(receivecoinckArr[1]),
      body: receivecoinckArr[0]
  };
	$.post(request, async(error, request, data) =>{
      try {
		  //$.log(data);
		const result=JSON.parse(data);
		if(result.status==200)
		{

			$.log("【收集金币】收集阅读金币成功，共获得"+ReadTimes*3+"金币");

		}
		 else
		 {
			 $.log("【收集金币】收集阅读金币失败,"+result.message);
             //$.log(data);
		 }

      } catch(e) {
			$.log(e)
      }
      resolve();
    });
  });
}

function vediogoldprize(j) {
  return new Promise((resolve, reject) => {
  const url = "https://ocean.shuqireader.com/api/ad/v1/api/prize/lottery";
  const request = {
      url: url,
      headers: JSON.parse(vediogoldprizeckArr[1]),
      body: vediogoldprizeckArr[0]
  };
	$.post(request, async(error, request, data) =>{
      try {
		const result=JSON.parse(data)
		//$.log(data);
		if(result.status==200)
		{
			j++;
			$.log("【视频金币】观看第"+j+"个视频成功，获得250金币，等待30s观看下一个视频");
			vediogold+=250;
			await $.wait(38000);
			await vediogoldprize(j);
		}
		 else
		 {
			 $.log("【视频金币】观看失败,"+result.message);
			 //$.log(data);

		 }
      } catch(e) {
			$.log(e)
      }
      resolve();
    });
  });
}

function vediodrawprize(k) {
  return new Promise((resolve, reject) => {
  const url = "https://ocean.shuqireader.com/api/ad/v1/api/prize/lottery";

  const request = {
      url: url,
      headers: JSON.parse(vediodrawprizeckArr[1]),
      body: vediodrawprizeckArr[0]
  };
	$.post(request, async(error, request, data) =>{
      try {
		const result=JSON.parse(data)
		//$.log(data);

		if(result.status==200)
		{
			k++;
			$.log("【视频抽奖】观看第"+k+"个视频成功，获得一次抽奖机会");
			await $.wait(12000);
			await draw(k);
		}
		 else
		 {
			 $.log("【视频抽奖】观看失败,"+result.message);
			 //$.log(data);
		 }
      } catch(e) {
			$.log(e)
      }
      resolve();
    });
  });
}

function draw(k) {
  return new Promise((resolve, reject) => {
  const url = "https://ocean.shuqireader.com/api/activity/activity/v1/lottery/draw?asac=2A20C07RJ9F51AOEFSNHDR";

  const request = {
      url: url,
      headers: JSON.parse(drawckArr[1]),
      body: drawckArr[0]
  };
	$.post(request, async(error, request, data) =>{
      try {
		const result=JSON.parse(data)
		//$.log(data);
		if(result.status==200)
		{
			$.log("【抽奖任务】抽奖成功，获得"+result.data.prizeList[0].prizeName);
			drawgold+=parseInt(result.data.prizeList[0].prizeName);
			await $.wait(11000);
			//await vediodrawprize(k);
		}
		 else
		 {
			 $.log("【抽奖任务】抽奖失败,"+result.message);
			 //$.log(data);
		 }
      } catch(e) {
			$.log(e)
      }
      resolve();
    });
  });
}

function withdrawinfo(k) {
  return new Promise((resolve, reject) => {

  const request = {
      url: zhurl,
      headers: JSON.parse(zhhd),
      body: zhbd
  };
	$.post(request, async(error, request, data) =>{
      try {
		const result=JSON.parse(data)
		$.log(data);
		if(result.status==200)
		{
			ableCash = result.data.withdrawableCash
			$.log("【账户信息】 可提现金额: "+result.data.withdrawableCash + '元');
			await $.wait(5000);

			if (result.canWithDraw == true){
				areyouOK = '已经可以提现了。'
				$.log("已经可以提现了。");
				await withdraw(k);
			}else {
				$.log("暂不可提现。");
			}

		}
		 else
		 {
			 $.log("【提现】提现失败,"+result.message);
			 //$.log(data);
		 }
      } catch(e) {
			$.log(e)
      }
      resolve();
    });
  });
}

function withdraw(k) {
  return new Promise((resolve, reject) => {

  const request = {
      url: withdrawurl,
      headers: JSON.parse(withdrawhd),
      body: withdrawbd
  };
	$.post(request, async(error, request, data) =>{
      try {
		const result=JSON.parse(data)
		//$.log(data);
		if(result.status==200)
		{
			yesok =  "【提现】提现成功。"
			tellme=1;
			$.log("【提现】提现成功。");
			await $.wait(5000);
		}
		 else
		 {
			 $.log("【提现】提现失败,"+result.message);
			 //$.log(data);
		 }
      } catch(e) {
			$.log(e)
      }
      resolve();
    });
  });
}




function userinfo() {
  return new Promise((resolve, reject) => {
  const request = {
      url: userinfock,
      headers: {},
      body: ""
  };

	$.post(request, async(error, request, data) =>{
      try {
		  $.log(data);
		  const result=JSON.parse(data);
		if(result.status==200)
		{
			todaygold = result.data.gold
			hsincome = result.data.income
		}
		 else
		 {
			 $.log("【金币总数】数据异常,"+result.message);
             //$.log(data);
		 }

      } catch(e) {
			$.log(e)
      }
      resolve();
    });
  });
}


function showmsg(){

		$.log("【阅读任务】本次共获得"+ReadTimes*3+"金币");
		$.log("【视频任务】本次共获得"+vediogold+"金币");
		$.log("【抽奖任务】本次共获得"+drawgold+"金币");
		$.log("【金币总数】"+todaygold+"金币");
		$.log("【历史累计收益】"+hsincome+"元");
		$.log("【账户信息】 可提现金额: "+ableCash + '元');
		$.log(areyouOK);
		$.log(yesok);

		if(tellme == 1 ){


			notify.sendNotify(`@提现啦@ ${$.name}-账号${$.index}` , "【阅读任务】本次共获得"+ReadTimes*3+"金币\n"+"【视频任务】本次共获得"+vediogold+"金币\n"+"【抽奖任务】本次共获得"+drawgold+"金币\n"+"【金币总数】"+todaygold+"金币\n"+"【历史累计收益】"+hsincome+"元\n"+"【账户信息】 可提现金额: "+ableCash + '元\n' + areyouOK +'\n'+ yesok)

		}
 }

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r)));let h=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];h.push(e),s&&h.push(s),i&&h.push(i),console.log(h.join("\n")),this.logs=this.logs.concat(h)}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
