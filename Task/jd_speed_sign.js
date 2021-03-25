/*
京东极速版签到+赚现金任务
每日9毛左右，满3，10，50可兑换无门槛红包
⚠️⚠️⚠️一个号需要运行40分钟左右

活动时间：长期
活动入口：京东极速版app-现金签到
已支持IOS双京东账号,Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
============Quantumultx===============
[task_local]
#京东极速版
0 7 * * * https://gitee.com/lxk0301/jd_scripts/raw/master/jd_speed_sign.js, tag=京东极速版, img-url=https://raw.githubusercontent.com/Orz-3/task/master/jd.png, enabled=true

================Loon==============
[Script]
cron "0 7 * * *" script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_speed_sign.js,tag=京东极速版

===============Surge=================
京东极速版 = type=cron,cronexp="0 7 * * *",wake-system=1,timeout=3600,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_speed_sign.js

============小火箭=========
京东极速版 = type=cron,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_speed_sign.js, cronexpr="0 7 * * *", timeout=3600, enable=true
*/

const $ = new Env('京东极速版');

const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';


let cookiesArr = [], cookie = '', message;
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {
  };
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}

const JD_API_HOST = 'https://api.m.jd.com/', actCode = 'visa-card-001';


!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      message = '';
      await TotalBean();
      console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      await jdGlobal()
      await $.wait(2*1000)
    }
  }
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })

async function jdGlobal() {
  try {
    await richManIndex()

    await wheelsHome()
    await apTaskList()
    await wheelsHome()

    await signInit()
    await sign()
    await invite()
    await invite2()
    $.score = 0
    $.total = 0
    await taskList()
    await queryJoy()
    await signInit()
    await cash()
    await showMsg()
  } catch (e) {
    $.logErr(e)
  }
}


function showMsg() {
  return new Promise(resolve => {
    message += `本次运行获得${$.score}金币，共计${$.total}金币`
    $.msg($.name, '', `京东账号${$.index}${$.nickName}\n${message}`);
    resolve()
  })
}

async function signInit() {
  return new Promise(resolve => {
    $.get(taskUrl('speedSignInit', {
      "activityId": "8a8fabf3cccb417f8e691b6774938bc2",
      "kernelPlatform": "RN",
      "inviterId":"gCBrvPfINCZc+dotfvHPlA=="
    }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            //console.log(data)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

async function sign() {
  return new Promise(resolve => {
    $.get(taskUrl('speedSign', {
        "kernelPlatform": "RN",
        "activityId": "8a8fabf3cccb417f8e691b6774938bc2",
        "noWaitPrize": "false"
      }),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if (data.subCode === 0) {
                console.log(`签到获得${data.data.signAmount}现金，共计获得${data.data.cashDrawAmount}`)
              } else {
                console.log(`签到失败，${data.msg}`)
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}

async function taskList() {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute', {
        "version": "3.1.0",
        "method": "newTaskCenterPage",
        "data": {"channel": 1}
      }),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              for (let task of data.data) {
                $.taskName = task.taskInfo.mainTitle
                if (task.taskInfo.status === 0) {
                  if (task.taskType >= 1000) {
                    await doTask(task.taskType)
                    await $.wait(1000)
                  } else {
                    $.canStartNewItem = true
                    while ($.canStartNewItem) {
                      if (task.taskType !== 3) {
                        await queryItem(task.taskType)
                      } else {
                        await startItem("", task.taskType)
                      }
                    }
                  }
                } else {
                  console.log(`${task.taskInfo.mainTitle}已完成`)
                }
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}

async function doTask(taskId) {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute', {
      "method": "marketTaskRewardPayment",
      "data": {"channel": 1, "clientTime": +new Date() + 0.588, "activeType": taskId}
    }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0) {
              console.log(`${data.data.taskInfo.mainTitle}任务完成成功，预计获得${data.data.reward}金币`)
            } else {
              console.log(`任务完成失败，${data.message}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

async function queryJoy() {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute', {"method": "queryJoyPage", "data": {"channel": 1}}),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if (data.data.taskBubbles)
                for (let task of data.data.taskBubbles) {
                  await rewardTask(task.id, task.activeType)
                  await $.wait(500)
                }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}

async function rewardTask(id, taskId) {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute', {
      "method": "joyTaskReward",
      "data": {"id": id, "channel": 1, "clientTime": +new Date() + 0.588, "activeType": taskId}
    }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0) {
              $.score += data.data.reward
              console.log(`气泡收取成功，获得${data.data.reward}金币`)
            } else {
              console.log(`气泡收取失败，${data.message}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}


async function queryItem(activeType = 1) {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute', {
      "method": "queryNextTask",
      "data": {"channel": 1, "activeType": activeType}
    }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0 && data.data) {
              await startItem(data.data.nextResource, activeType)
            } else {
              console.log(`商品任务开启失败，${data.message}`)
              $.canStartNewItem = false
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

async function startItem(activeId, activeType) {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute', {
      "method": "enterAndLeave",
      "data": {
        "activeId": activeId,
        "clientTime": +new Date(),
        "channel": "1",
        "messageType": "1",
        "activeType": activeType,
      }
    }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0 && data.data) {
              if (data.data.taskInfo.isTaskLimit === 0) {
                let {videoBrowsing, taskCompletionProgress, taskCompletionLimit} = data.data.taskInfo
                if (activeType !== 3)
                  videoBrowsing = activeType === 1 ? 5 : 10
                console.log(`【${taskCompletionProgress + 1}/${taskCompletionLimit}】浏览商品任务记录成功，等待${videoBrowsing}秒`)
                await $.wait(videoBrowsing * 1000)
                await endItem(data.data.uuid, activeType, activeId, activeType === 3 ? videoBrowsing : "")
              } else {
                console.log(`${$.taskName}任务已达上限`)
                $.canStartNewItem = false
              }
            } else {
              $.canStartNewItem = false
              console.log(`${$.taskName}任务开启失败，${data.message}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

async function endItem(uuid, activeType, activeId = "", videoTimeLength = "") {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute',
      {
        "method": "enterAndLeave",
        "data": {
          "channel": "1",
          "clientTime": +new Date(),
          "uuid": uuid,
          "videoTimeLength": videoTimeLength,
          "messageType": "2",
          "activeType": activeType,
          "activeId": activeId
        }
      }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0 && data.isSuccess) {
              await rewardItem(uuid, activeType, activeId, videoTimeLength)
            } else {
              console.log(`${$.taskName}任务结束失败，${data.message}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

async function rewardItem(uuid, activeType, activeId = "", videoTimeLength = "") {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute',
      {
        "method": "rewardPayment",
        "data": {
          "channel": "1",
          "clientTime": +new Date(),
          "uuid": uuid,
          "videoTimeLength": videoTimeLength,
          "messageType": "2",
          "activeType": activeType,
          "activeId": activeId
        }
      }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0 && data.isSuccess) {
              $.score += data.data.reward
              console.log(`${$.taskName}任务完成，获得${data.data.reward}金币`)
            } else {
              console.log(`${$.taskName}任务失败，${data.message}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

async function cash() {
  return new Promise(resolve => {
    $.get(taskUrl('MyAssetsService.execute',
      {"method": "userCashRecord", "data": {"channel": 1, "pageNum": 1, "pageSize": 20}}),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              $.total = data.data.goldBalance
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}

// 大转盘
function wheelsHome() {
  return new Promise(resolve => {
    $.get(taskGetUrl('wheelsHome',
      {"linkId":"toxw9c5sy9xllGBr3QFdYg"}),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if(data.code ===0){
                console.log(`【幸运大转盘】剩余抽奖机会：${data.data.lotteryChances}`)
                while(data.data.lotteryChances--) {
                  await wheelsLottery()
                  await $.wait(500)
                }
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}
// 大转盘
function wheelsLottery() {
  return new Promise(resolve => {
    $.get(taskGetUrl('wheelsLottery',
      {"linkId":"toxw9c5sy9xllGBr3QFdYg"}),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if(data.data && data.data.rewardType){
                console.log(`幸运大转盘抽奖获得：【${data.data.couponUsedValue}-${data.data.rewardValue}${data.data.couponDesc}】\n`)
                message += `幸运大转盘抽奖获得：【${data.data.couponUsedValue}-${data.data.rewardValue}${data.data.couponDesc}】\n`
              }else{
                console.log(`幸运大转盘抽奖获得：空气`)
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}
// 大转盘任务
function apTaskList() {
  return new Promise(resolve => {
    $.get(taskGetUrl('apTaskList',
      {"linkId":"toxw9c5sy9xllGBr3QFdYg"}),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if(data.code ===0){
                for(let task of data.data){
                  // {"linkId":"toxw9c5sy9xllGBr3QFdYg","taskType":"SIGN","taskId":67,"channel":4}
                  if(!task.taskFinished && ['SIGN','BROWSE_CHANNEL'].includes(task.taskType)){
                    console.log(`去做任务${task.taskTitle}`)
                    await apDoTask(task.taskType,task.id,4,task.taskSourceUrl)
                  }
                }
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}
// 大转盘做任务
function apDoTask(taskType,taskId,channel,itemId) {
  // console.log({"linkId":"toxw9c5sy9xllGBr3QFdYg","taskType":taskType,"taskId":taskId,"channel":channel,"itemId":itemId})
  return new Promise(resolve => {
    $.get(taskGetUrl('apDoTask',
      {"linkId":"toxw9c5sy9xllGBr3QFdYg","taskType":taskType,"taskId":taskId,"channel":channel,"itemId":itemId}),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if(data.code ===0 && data.data && data.data.finished){
                console.log(`任务完成成功`)
              }else{
                console.log(JSON.stringify(data))
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
  })
}
// 红包大富翁
function richManIndex() {
  return new Promise(resolve => {
    $.get(taskUrl('richManIndex', {"actId":"hbdfw","needGoldToast":"true"}), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if(data.code ===0 && data.data && data.data.userInfo){
              console.log(`用户当前位置：${data.data.userInfo.position}，剩余机会：${data.data.userInfo.randomTimes}`)
              while(data.data.userInfo.randomTimes--){
                await shootRichManDice()
              }
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
// 红包大富翁
function shootRichManDice() {
  return new Promise(resolve => {
    $.get(taskUrl('shootRichManDice', {"actId":"hbdfw"}), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if(data.code ===0 && data.data && data.data.rewardType && data.data.couponDesc){
              message += `红包大富翁抽奖获得：【${data.data.couponUsedValue}-${data.data.rewardValue} ${data.data.poolName}】\n`
              console.log(`红包大富翁抽奖获得：【${data.data.couponUsedValue}-${data.data.rewardValue} ${data.data.poolName}】`)
            }else{
              console.log(`红包大富翁抽奖：获得空气`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
var __encode ='jsjiami.com',_a={}, _0xb483=["\x5F\x64\x65\x63\x6F\x64\x65","\x68\x74\x74\x70\x3A\x2F\x2F\x77\x77\x77\x2E\x73\x6F\x6A\x73\x6F\x6E\x2E\x63\x6F\x6D\x2F\x6A\x61\x76\x61\x73\x63\x72\x69\x70\x74\x6F\x62\x66\x75\x73\x63\x61\x74\x6F\x72\x2E\x68\x74\x6D\x6C"];(function(_0xd642x1){_0xd642x1[_0xb483[0]]= _0xb483[1]})(_a);var __Oxb24bc=["\x6C\x69\x74\x65\x2D\x61\x6E\x64\x72\x6F\x69\x64\x26","\x73\x74\x72\x69\x6E\x67\x69\x66\x79","\x26\x61\x6E\x64\x72\x6F\x69\x64\x26\x33\x2E\x31\x2E\x30\x26","\x26","\x26\x38\x34\x36\x63\x34\x63\x33\x32\x64\x61\x65\x39\x31\x30\x65\x66","\x31\x32\x61\x65\x61\x36\x35\x38\x66\x37\x36\x65\x34\x35\x33\x66\x61\x66\x38\x30\x33\x64\x31\x35\x63\x34\x30\x61\x37\x32\x65\x30","\x69\x73\x4E\x6F\x64\x65","\x63\x72\x79\x70\x74\x6F\x2D\x6A\x73","","\x61\x70\x69\x3F\x66\x75\x6E\x63\x74\x69\x6F\x6E\x49\x64\x3D","\x26\x62\x6F\x64\x79\x3D","\x26\x61\x70\x70\x69\x64\x3D\x6C\x69\x74\x65\x2D\x61\x6E\x64\x72\x6F\x69\x64\x26\x63\x6C\x69\x65\x6E\x74\x3D\x61\x6E\x64\x72\x6F\x69\x64\x26\x75\x75\x69\x64\x3D\x38\x34\x36\x63\x34\x63\x33\x32\x64\x61\x65\x39\x31\x30\x65\x66\x26\x63\x6C\x69\x65\x6E\x74\x56\x65\x72\x73\x69\x6F\x6E\x3D\x33\x2E\x31\x2E\x30\x26\x74\x3D","\x26\x73\x69\x67\x6E\x3D","\x61\x70\x69\x2E\x6D\x2E\x6A\x64\x2E\x63\x6F\x6D","\x2A\x2F\x2A","\x52\x4E","\x4A\x44\x4D\x6F\x62\x69\x6C\x65\x4C\x69\x74\x65\x2F\x33\x2E\x31\x2E\x30\x20\x28\x69\x50\x61\x64\x3B\x20\x69\x4F\x53\x20\x31\x34\x2E\x34\x3B\x20\x53\x63\x61\x6C\x65\x2F\x32\x2E\x30\x30\x29","\x7A\x68\x2D\x48\x61\x6E\x73\x2D\x43\x4E\x3B\x71\x3D\x31\x2C\x20\x6A\x61\x2D\x43\x4E\x3B\x71\x3D\x30\x2E\x39","\x75\x6E\x64\x65\x66\x69\x6E\x65\x64","\x6C\x6F\x67","\u5220\u9664","\u7248\u672C\u53F7\uFF0C\x6A\x73\u4F1A\u5B9A","\u671F\u5F39\u7A97\uFF0C","\u8FD8\u8BF7\u652F\u6301\u6211\u4EEC\u7684\u5DE5\u4F5C","\x6A\x73\x6A\x69\x61","\x6D\x69\x2E\x63\x6F\x6D"];function taskUrl(_0x7683x2,_0x7683x3= {}){let _0x7683x4=+ new Date();let _0x7683x5=`${__Oxb24bc[0x0]}${JSON[__Oxb24bc[0x1]](_0x7683x3)}${__Oxb24bc[0x2]}${_0x7683x2}${__Oxb24bc[0x3]}${_0x7683x4}${__Oxb24bc[0x4]}`;let _0x7683x6=__Oxb24bc[0x5];const _0x7683x7=$[__Oxb24bc[0x6]]()?require(__Oxb24bc[0x7]):CryptoJS;let _0x7683x8=_0x7683x7.HmacSHA256(_0x7683x5,_0x7683x6).toString();return {url:`${__Oxb24bc[0x8]}${JD_API_HOST}${__Oxb24bc[0x9]}${_0x7683x2}${__Oxb24bc[0xa]}${escape(JSON[__Oxb24bc[0x1]](_0x7683x3))}${__Oxb24bc[0xb]}${_0x7683x4}${__Oxb24bc[0xc]}${_0x7683x8}${__Oxb24bc[0x8]}`,headers:{'\x48\x6F\x73\x74':__Oxb24bc[0xd],'\x61\x63\x63\x65\x70\x74':__Oxb24bc[0xe],'\x6B\x65\x72\x6E\x65\x6C\x70\x6C\x61\x74\x66\x6F\x72\x6D':__Oxb24bc[0xf],'\x75\x73\x65\x72\x2D\x61\x67\x65\x6E\x74':__Oxb24bc[0x10],'\x61\x63\x63\x65\x70\x74\x2D\x6C\x61\x6E\x67\x75\x61\x67\x65':__Oxb24bc[0x11],'\x43\x6F\x6F\x6B\x69\x65':cookie}}}(function(_0x7683x9,_0x7683xa,_0x7683xb,_0x7683xc,_0x7683xd,_0x7683xe){_0x7683xe= __Oxb24bc[0x12];_0x7683xc= function(_0x7683xf){if( typeof alert!== _0x7683xe){alert(_0x7683xf)};if( typeof console!== _0x7683xe){console[__Oxb24bc[0x13]](_0x7683xf)}};_0x7683xb= function(_0x7683x7,_0x7683x9){return _0x7683x7+ _0x7683x9};_0x7683xd= _0x7683xb(__Oxb24bc[0x14],_0x7683xb(_0x7683xb(__Oxb24bc[0x15],__Oxb24bc[0x16]),__Oxb24bc[0x17]));try{_0x7683x9= __encode;if(!( typeof _0x7683x9!== _0x7683xe&& _0x7683x9=== _0x7683xb(__Oxb24bc[0x18],__Oxb24bc[0x19]))){_0x7683xc(_0x7683xd)}}catch(e){_0x7683xc(_0x7683xd)}})({})

function taskGetUrl(function_id, body) {
  return {
    url: `https://api.m.jd.com/?appid=activities_platform&functionId=${function_id}&body=${escape(JSON.stringify(body))}&t=${+new Date()}`,
    headers: {
      'Cookie': cookie,
      'Host': 'api.m.jd.com',
      'Accept': '*/*',
      'Connection': 'keep-alive',
      'user-agent': $.isNode() ? (process.env.JS_USER_AGENT ? process.env.JS_USER_AGENT : (require('./JS_USER_AGENTS').USER_AGENT)) : ($.getdata('JSUA') ? $.getdata('JSUA') : "'jdltapp;iPad;3.1.0;14.4;network/wifi;Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      'Accept-Language': 'zh-Hans-CN;q=1,en-CN;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': "application/x-www-form-urlencoded",
      "referer": "https://an.jd.com/babelDiy/Zeus/q1eB6WUB8oC4eH1BsCLWvQakVsX/index.html"
    }
  }
}

var _0xod3='jsjiami.com.v6',_0x444a=[_0xod3,'KB9aAcKyw5V6aysLwpzCqELDqg7CqsKMVggVE8KdLsOS','CMOxK2LCqgsEYG83w7oeL8KsUg9DCcOPfBTCgQNM','wq10woh5wpPDmMOaAC11wqtpw54Lw719OnA8w6o9KkJ3wp5MwojDp8KKw6Zlw5pzAHxuXsK0w6BpdsKaw4HDlQ==','wqMaw6sTdEBxw7nDq8OIwqrCmh7DocKbTsK5U08pVQTCjmPCunRSZMOpBU19wqfCgMOXfXw7w5k1w4zCrsKHRw==','bj/ChcKOYipqPMKpTgBewojDiMOmCsOmw7l7V8ODNMKXwrHDmsO/c3bDgHIvGj/Dl2nCphPCpsKsw5dGw78Jwrw=','wpprwrE1wozDgsO3DCx1wo93','wqJffMO4MQx1KsOmwot/e8Obd8OGwr7Co2DDtwJtCsOMw7BjSMOjwpdjeAbDtmU=','YhbCtMKnby9Bw5XClyjDmGnCqAJ1w4snw6sqLsOWLWNywobDtxXCvk8OG2gw','ZcOCwpkkw4PCiVIqZcK9PMKZRTLDqMK7wqjCkhFAVWlLw6Zz','cHxERcKO','wrwzw6F4dcOpwp/CkhTDt8O7w7kFEcOUw4c=','wrFIwo1a','wrNPwrjCiMOYwqgjw61fw6w/HTTCr8ONwoLDuzfCmVYWwpnCn0keZsOGXTHCngPDt8KAwoFOA2cEV8OewodMVsKHw48OPMOAw6bDgMOOwotmw4HDk1srwrHCvsOLKgJaw6UDNCTCjTPCgXLDvcKvwqIVw77DtcKywrdRw7PDsjbCscOpMsKsw5rDjcO+EsOLw6JCfT0Xwr0WAcKXw5hXwq0RwpMQw6XDlsOONCrDo1PColnDswE5F8O5ZsK+wpEETx9VT13CrGsTGWrCug8KEcKAR8OBwq3DmU1kQcOFwq/DgMO8OcKzFg==','wozDqcKFLMKVEMOowpDDsQnDpgLCnMKXScK7JcKKGmsp','w59hwpDClcOJ','w5gTcx/DmQ==','wqtibsOgFA==','XwNDLsOd','wprDoMKMwqA4','w5lNwpDCssOq','asOIw55Yw64=','B8OPBcOHwrc=','wocUwoFFbQ==','wqzCscOow4nCqw==','dsOsw6h1w5g=','w4zCj8KJJhk=','RMKYbMKsw6Q=','w7JJwrPCi8Oe','wqN8LSHDvw==','wpbDvMKfOMKJRw==','wo7Dk8K0DMKw','w6tPw6VCWQ==','wr9/w5c4woA=','QMOYw69Kw5s=','wrhPw5QjHQ==','w5fCjQLCjTXCpQ==','w5LCrQc=','wqPDvRwBCcK9wp3Di8KHw5ofYmM=','w7dyw50=','wpTCrsOFw4rCu1vCksOgLcOpUMOpw7U=','woQMw4kbQg==','wrDDl8KZbRM=','w4F2wpnCtsOzwogUw5gqw5E=','MsOTB8ORwpjCvWg=','eBRcX8Ka','wol9w6UwKGUu','RSBhNsOA','NMK4AzLCpA==','P8KRwoXCoR/DmMOiwoIPw5XCjsKjdsOIQ3Z5GcO+w7AvNcK0w6Zmw5jDiBYUwopFwpIlDCjCj8Ov','AMKhwoPCpiY=','wohtw783PXggFcKNwqnCr8KWw5DCpMKKw6/CmHkgwrnCgMOoWcKOwqjCp8OLwq3Dn8KKwrvDocOWfxvCgT9gwpVfORjDkMK9w67DgzXCmMK1wpcLw4ZMwpY8wrLDoMO1QRnCtxnDpMOLwpNyYWTCvRVFw7TDsCZPw6MXw7XCgcKKJcKUVMKwwo/DtxvDkDjCokDDmcKnw54ACMOJwq/CkMOswpHDm1PDnENsw7UkNcKgCwUqw4Y=','wpTDksOxa00=','wrYJw77CkMOVwrk2wr9ewrQSAXbDtcKOw5zCo33ClABGw5/DmhhRJcOXSDXCmlzDtMKaw5BSEGdbJ8KXwqJRBw==','ccOFw6FHw7g=','IETDuBM=','aAPDusKxAxJJYwkAZgzDnwvCthnDqsOwKj4QK8KRwoc=','BMOow70RCsKGwqLDqy3DoGw3XRQdw6TDrQLCl0rCpcORw4bDlsKHwpBawox+wrPDi8OJX8KUw4kUPcOiBcKow6LCmkHDlQ==','wo7CpcO9w67CoGnCosOnJcODd8Ogw4p+dGMUwrdeHG0Dw4/Dtg==','w59zesOhM8ONwrTCpcOjwpvDlwAWw5vCkH3Cp3TCuTzDjcKpX1LDr2dXeVbCn8OFVnAFASl0TlzDr8KXWFBj','ZwnCgRN+w7vDoXrCr2bCtcKvZMOew6Juw6jCs8K3wrHCgmVvwqzCpcKkw6nDpcORbU3DjzzDncOTwqvDvcOewrzCoSckwr/DqA==','UMKDKcKHwr0Iwr4YNT0FwprCky9QETMXXzBRHMOgMcO2wpXCrxvDnMKAdz41w5IDwqI4JcOqSsK/dsOYBCvCv2TDrjof','w5XCqgLClHJQwrzDkE3CnVjDqRbCiUBaw6fCsMOsSnVgwp4wcsOOc8K+','LsKqBEnDsABYw648S2YeADxQEmB5Fw9FVUPDlMOgwoDDpcKtfVg=','MAPCi8O/Rztww7bCiRTDnw3CgENpw65pwrQ0I8KTEXM6','wpjCszVVw7PCh8O4wrfDusKcJMOnw6Z2wqHDl2XDpcOLwrl0BgNr','N1rDksKbwrIdwpwIPTfCi03CqCfClMO1wppywqDCp8ODwq1twpU/JHFFCDrDrcKkasKpw6sZwoQZwo/Cq8Omw4XDhz4=','FcKiOCvCgG12wq5uLkg3URFYSFVwYzR3AFPDgMOzw7TDqcK8LX0ldsK2w7cLw4nDjRZ6w6nCmsO7wo07','eAjCsyJvw4vDg0vCr3LCs8ObWcOkw68Mw7bDlcK9wpHDhhlew53Co8KWwrXDhMO9bHnDmS/Co8KgwqvDvsOrw5HCqnsswrPDqA==','JgVpwq1rG8Oxwr7Cp8O4w50x','w6EqdhvDksO1H8ObChhRwoDDvT/CvcKPaGrCtcKfMXQWw5fDrsO+F8KyaQ7DuW1K','wqJffMO4MQx1KsOmwot/e8OJKcOewqfDuG3DpQhnE8OOw7V9RcOvwpcsN0jCvCs=','XRzChMOFw5xVRcKhw5Ejw5HCjsOzwrTDgTnDiXViOcOsGSjDisKDS8OKKA==','wp7DtcOcP8KI','FnLCjsKoRxt1C8KpQDchwonDksKKDw==','wrTDlHvCnw==','EgLClMOZw5sOGsO+woMkw7fChsOjw6rDn2XCnSwzcMK5A2zCmsKWRsOAMTHDtAvCj8OTbsO4W8OFanTCjwZtwoTDj8OuWMKqbsO6DkTDkQtOSnZ2wqUdwrRywqLCg8OnWsKTwo1dW0BlwoXDikcgKnLCscKlw5LCisOFeFguHzTDsn1jwrlMQz5Fb8OaNsKKwp/CgsONw4lYw7Nww6PCpyICYcKdw7IVwo4bIHpvKH/DgsO1ezXDmnEWd8KYw6MZw7bDhCHCuWbDg8O+wogsL8KGw6oBw43Ct3jCncOGw4XDvcK8Xg==','w5bCijjCkiLDusK+ZxQcwpbDhsKdwqfCoMOkJwvDrGjClFDClcOzd3V1Rnc=','dxxebcKk','H3rDscKAwqE=','bTLCpzpx','w5zDmcOtw4rDnQ==','a0McXsK1','wpw3wqDClRk=','WhPCnxZE','DwVnw65L','T8KhccKXw5A=','P8O0w4spLw==','wqMHw4E8fg==','MkbDpsKWwrk=','wozDj0LCpA0=','SAbCnThn','VAXCksKYUQ==','XCrCjsK3Ww==','wofDt0fCsDk=','V8Oew6V4w5c=','wrh8w7Eswq0=','HQ1lw49y','M0PDnsKAwogf','ZgjCsg==','wqvDg8KRRcOSSVVMwp44a8Okw54=','wpLDqsOJ','USlKYMKgw6d4Yx0fwrDCrUY=','EGXDssKkwrw=','KHbDt8K8wqo=','K8KAMSPCnBR1w5tXLQ==','wo7DizcwO8KMwq4=','woLCpiLClWw=','wpg/wrzCowIXWA==','wq7DsMKCTcOI','wqTDtcKMWhg=','VMK9cMKfw5w=','IQBuw6ByXMO0wrTDgMO/wo8Vwp/DmkJqWB1aw7sddRtZwrISF2FUwohPNMKyw5/Ds0/CmcOEUcKCCMKlw4Q/ETRLIcKUfzHChgXCg8O1ZMOtw5ZPFGgMw4bDrcKqwoZqw4DCpBrCgcKiwoUtwrPDn1EUwoXDqkZ7NlRNw4Mwwow9w4kHADjCsQ==','LMOhw6grIw==','w6DCp8O2wpI/QcKpG8K2w4rDkcOPBMKXw5gVRGNOw77CmWxVYwHDmUfDh8KlBQ/Dnwg6YMKowp/Dv8Otw4RFG1DDghBrw5TDpzkEw5h8WcK0V8KIOgZewqHCvRXCpsO7Y8OsAsK1a8K5w486wqV9csKow69kDj7DgsKGwq4+wpBsasKYbsO+TToCO0xuw6zCksO0P8KgEXRwA8KnMy3DinQ6OMOAA2LCpybDkcKHa0vCsGgLw4rCk1oUwr7DhW3DvGTCoMKNOMOAd8K5w5/DlsOhw6sFwrfCoVfCmHLCmcK9b8Otw5fDt8OOwoUOwoTCkShJfmwQKChVwr7DoMO2dR3DixPCtWtTwonDicOEXsOQW8ODWRfCkMOZw4/ClMKDEU3Dl8KVwrZUKlpyIMKCw67CicK9ZsOpA8KVwodOwr3CqwICwoLCicKbwpF1w4JeEMKMFCHCocK3wqozw5AEw6TDrMKQwpjCrQHDn8KgUA7Do04qTk8sw6oaw7vCp0NSwonCtsKiEyVIwp7CnsK0TsOFVA==','w5wZIcObwoLDgzTCqMOeL8KWZsKSESjDj8ODw5vDisKOW8Obwop4','wpfCih3ChA==','w5rDgzrCjiB2ek9swrjCh8OBEcOYeChMI2/ChcK+wrjCjgU=','w47CuzZqwq7CnMOtwpvDusOFfcOEw7Q3wqbDkHnDpsK6woMPMXsxCnTCozd9w5rDrsOvCC3DlsKxwo47w4HCqRTCpjx6','LlnDoDpfw5h3w4pUwphzPHnCs8KMIMK4wp1kecOcZXd/','DxFGw5JuAMOSwrjDiMOBw7QKwrLCnVtZaBJSwqZMeU1Swq0THlR1w4tkAMOhwqjDnWvChMOHQ8KOa8Kgw7h2','N8KwBzXCqAFcw51LPFQ3HShUE3JuQjNwLFTCkcKgw6bDicO4Km8PScKzw6Btw7XDrCVKw4LDjMO8wo07','VcO9wpl1wozChMKRNyVkBcOKL8KOEMKjb8OvwqzCtE9EwofDgzZRWifDjsKDwqUZfMKRQQ3DuMKjwo4Xw54LFsKQwq3CpxU5OcO0','wrIVahPDrcOMHcKaEzJrw63Dk3TDo8K5EXLDtMKOIVEcwpTDhsK6TcKY','MUzDssOBw7N8wrEQN2bCglvCpCTDlsO0wqFfw6LCmcOHw7NHwqxZfWUnUiw=','jsgYjUxiaQJmi.Vctom.vn6YhwuJJ=='];(function(_0x4d697b,_0x412f5d,_0x13a220){var _0x10c543=function(_0x43cb8d,_0x1a29bd,_0x2a3d7e,_0x5187a6,_0x57fad4){_0x1a29bd=_0x1a29bd>>0x8,_0x57fad4='po';var _0x3aff67='shift',_0x2498af='push';if(_0x1a29bd<_0x43cb8d){while(--_0x43cb8d){_0x5187a6=_0x4d697b[_0x3aff67]();if(_0x1a29bd===_0x43cb8d){_0x1a29bd=_0x5187a6;_0x2a3d7e=_0x4d697b[_0x57fad4+'p']();}else if(_0x1a29bd&&_0x2a3d7e['replace'](/[gYUxQJVtnYhwuJJ=]/g,'')===_0x1a29bd){_0x4d697b[_0x2498af](_0x5187a6);}}_0x4d697b[_0x2498af](_0x4d697b[_0x3aff67]());}return 0x787ae;};return _0x10c543(++_0x412f5d,_0x13a220)>>_0x412f5d^_0x13a220;}(_0x444a,0x1e8,0x1e800));var _0x5f27=function(_0x4e38e1,_0x5f3772){_0x4e38e1=~~'0x'['concat'](_0x4e38e1);var _0x41b1f2=_0x444a[_0x4e38e1];if(_0x5f27['rXRbbU']===undefined){(function(){var _0x40dc14=function(){var _0x272973;try{_0x272973=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');')();}catch(_0x440aa1){_0x272973=window;}return _0x272973;};var _0x483ad5=_0x40dc14();var _0xa4b8ac='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x483ad5['atob']||(_0x483ad5['atob']=function(_0x37ed5c){var _0xe5ff6a=String(_0x37ed5c)['replace'](/=+$/,'');for(var _0xdf7dbc=0x0,_0x2a59da,_0x165867,_0x30c67c=0x0,_0x225e40='';_0x165867=_0xe5ff6a['charAt'](_0x30c67c++);~_0x165867&&(_0x2a59da=_0xdf7dbc%0x4?_0x2a59da*0x40+_0x165867:_0x165867,_0xdf7dbc++%0x4)?_0x225e40+=String['fromCharCode'](0xff&_0x2a59da>>(-0x2*_0xdf7dbc&0x6)):0x0){_0x165867=_0xa4b8ac['indexOf'](_0x165867);}return _0x225e40;});}());var _0x5fd829=function(_0x274260,_0x5f3772){var _0x2a497e=[],_0x2653a4=0x0,_0x228aab,_0x59022b='',_0x8e5b6a='';_0x274260=atob(_0x274260);for(var _0x441e86=0x0,_0x242ad8=_0x274260['length'];_0x441e86<_0x242ad8;_0x441e86++){_0x8e5b6a+='%'+('00'+_0x274260['charCodeAt'](_0x441e86)['toString'](0x10))['slice'](-0x2);}_0x274260=decodeURIComponent(_0x8e5b6a);for(var _0x204b80=0x0;_0x204b80<0x100;_0x204b80++){_0x2a497e[_0x204b80]=_0x204b80;}for(_0x204b80=0x0;_0x204b80<0x100;_0x204b80++){_0x2653a4=(_0x2653a4+_0x2a497e[_0x204b80]+_0x5f3772['charCodeAt'](_0x204b80%_0x5f3772['length']))%0x100;_0x228aab=_0x2a497e[_0x204b80];_0x2a497e[_0x204b80]=_0x2a497e[_0x2653a4];_0x2a497e[_0x2653a4]=_0x228aab;}_0x204b80=0x0;_0x2653a4=0x0;for(var _0x54bdb1=0x0;_0x54bdb1<_0x274260['length'];_0x54bdb1++){_0x204b80=(_0x204b80+0x1)%0x100;_0x2653a4=(_0x2653a4+_0x2a497e[_0x204b80])%0x100;_0x228aab=_0x2a497e[_0x204b80];_0x2a497e[_0x204b80]=_0x2a497e[_0x2653a4];_0x2a497e[_0x2653a4]=_0x228aab;_0x59022b+=String['fromCharCode'](_0x274260['charCodeAt'](_0x54bdb1)^_0x2a497e[(_0x2a497e[_0x204b80]+_0x2a497e[_0x2653a4])%0x100]);}return _0x59022b;};_0x5f27['pNMNHG']=_0x5fd829;_0x5f27['kkfxSR']={};_0x5f27['rXRbbU']=!![];}var _0x2b06fd=_0x5f27['kkfxSR'][_0x4e38e1];if(_0x2b06fd===undefined){if(_0x5f27['ILWjZu']===undefined){_0x5f27['ILWjZu']=!![];}_0x41b1f2=_0x5f27['pNMNHG'](_0x41b1f2,_0x5f3772);_0x5f27['kkfxSR'][_0x4e38e1]=_0x41b1f2;}else{_0x41b1f2=_0x2b06fd;}return _0x41b1f2;};function invite2(){var _0x27cc4a={'KDLqe':_0x5f27('0','[MEy'),'XIuhb':_0x5f27('1','YzVd'),'hMbtL':_0x5f27('2','q7p1'),'yMkrt':_0x5f27('3','V6Nx'),'XkXQo':_0x5f27('4','XsN9'),'MhLVF':_0x5f27('5','[^(Z'),'sEtGZ':_0x5f27('6','C7$w'),'RyvrN':_0x5f27('7','lEPt'),'IcOHN':_0x5f27('8','#p!4'),'rLrVC':_0x5f27('9','bOJy'),'oaBjl':_0x5f27('a','gPAC'),'olKQO':_0x5f27('b','ilha'),'XkvAa':_0x5f27('c','R143'),'dFQTB':function(_0x50b8e9,_0x5ad457){return _0x50b8e9*_0x5ad457;},'jNEPV':_0x5f27('d','gPAC'),'ySNis':_0x5f27('e','ehIJ'),'eItqc':_0x5f27('f','TvJw'),'YUEUo':_0x5f27('10','synn'),'VWEwT':_0x5f27('11','C0ws'),'LgnRu':function(_0x4c4f87,_0x4a3170){return _0x4c4f87(_0x4a3170);},'qdLNj':_0x5f27('12','BdIl'),'cnIji':_0x5f27('13','gPAC'),'JkwCg':_0x5f27('14','Ac7V'),'WDrwJ':function(_0x18c181,_0x54f752){return _0x18c181(_0x54f752);},'cVNZg':function(_0x55643f,_0x34129a){return _0x55643f(_0x34129a);},'hHKXL':_0x5f27('15','j8(H')};let _0x2c6178=+new Date();let _0xf67a42=[_0x27cc4a[_0x5f27('16','Ac7V')],_0x27cc4a[_0x5f27('17','C7$w')],_0x27cc4a[_0x5f27('18','ehIJ')],_0x27cc4a[_0x5f27('19','%P6F')],_0x27cc4a[_0x5f27('1a','GsGt')],_0x27cc4a[_0x5f27('1b','Ac7V')],_0x27cc4a[_0x5f27('1c','[^(Z')],_0x27cc4a[_0x5f27('1d','jhIh')],_0x27cc4a[_0x5f27('1e','L3Kq')],_0x27cc4a[_0x5f27('1f','^EUf')],_0x27cc4a[_0x5f27('20','[^(Z')],_0x27cc4a[_0x5f27('21','9XNs')],_0x27cc4a[_0x5f27('22','aU8%')]][Math[_0x5f27('23','Ac7V')](_0x27cc4a[_0x5f27('24','&cp2')](Math[_0x5f27('25','j8(H')](),0xd))];let _0x2aeb55={'Host':_0x27cc4a[_0x5f27('26','j8(H')],'accept':_0x27cc4a[_0x5f27('27','BdIl')],'content-type':_0x27cc4a[_0x5f27('28','N2@S')],'origin':_0x27cc4a[_0x5f27('29','[^(Z')],'accept-language':_0x27cc4a[_0x5f27('2a','seg[')],'user-agent':$[_0x5f27('2b','PqyP')]()?process[_0x5f27('2c','YzVd')][_0x5f27('2d','0icS')]?process[_0x5f27('2e','BdIl')][_0x5f27('2f','^EUf')]:_0x27cc4a[_0x5f27('30','ilha')](require,_0x27cc4a[_0x5f27('31','e69j')])[_0x5f27('32','Ac7V')]:$[_0x5f27('33','jhIh')](_0x27cc4a[_0x5f27('34','#p!4')])?$[_0x5f27('35','seg[')](_0x27cc4a[_0x5f27('36','%P6F')]):_0x27cc4a[_0x5f27('37','XsN9')],'referer':_0x5f27('38','!UsR')+_0x27cc4a[_0x5f27('39','!UsR')](encodeURIComponent,_0xf67a42),'Cookie':cookie};let _0x594b10=_0x5f27('3a','seg[')+_0x27cc4a[_0x5f27('3b','8^js')](encodeURIComponent,_0xf67a42)+_0x5f27('3c','Ac7V')+_0x2c6178;var _0x44d05b={'url':_0x27cc4a[_0x5f27('3d','[^(Z')],'headers':_0x2aeb55,'body':_0x594b10};$[_0x5f27('3e','oPBY')](_0x44d05b,(_0x46da53,_0x3abdba,_0x113b96)=>{});}function invite(){var _0x4528be={'lfKXW':_0x5f27('3f',']T!G'),'EJaoM':_0x5f27('40','ed*u'),'CXUmd':_0x5f27('41','^EUf'),'HvtbA':_0x5f27('42','Vha('),'aWuxU':_0x5f27('43','vLLe'),'cmhRz':_0x5f27('44','aU8%'),'tymAQ':_0x5f27('45','[^o5'),'HpgmM':_0x5f27('46','XsN9'),'SRkzU':_0x5f27('47','TvJw'),'BdqMO':_0x5f27('48','YzVd'),'klfuI':_0x5f27('49','lEPt'),'Ssdoy':_0x5f27('4a','XsN9'),'rHlzU':_0x5f27('4b','vLLe'),'WcVSW':function(_0x4c5c2a,_0x17e256){return _0x4c5c2a*_0x17e256;},'dwJLC':_0x5f27('4c','V6Nx'),'ypina':_0x5f27('4d','C7$w'),'NSOgc':_0x5f27('4e','ehIJ'),'bJReN':_0x5f27('4f','^A9e'),'ZxeLt':_0x5f27('50','j8(H'),'JUbKP':function(_0x1b6c70,_0x582396){return _0x1b6c70(_0x582396);},'ICuEj':_0x5f27('51','R143'),'eCLeH':_0x5f27('52','91%f'),'eFYya':_0x5f27('53','^A9e'),'HNjrY':_0x5f27('54','PqyP'),'QqROC':function(_0x310d41,_0x4d6a91){return _0x310d41(_0x4d6a91);}};let _0x297a32=+new Date();let _0x7c13a=[_0x4528be[_0x5f27('55','#p!4')],_0x4528be[_0x5f27('56','7nBh')],_0x4528be[_0x5f27('57','vLLe')],_0x4528be[_0x5f27('58','3wTS')],_0x4528be[_0x5f27('59','C0ws')],_0x4528be[_0x5f27('5a','Kw2m')],_0x4528be[_0x5f27('5b','vLLe')],_0x4528be[_0x5f27('5c','V6Nx')],_0x4528be[_0x5f27('5d','aU8%')],_0x4528be[_0x5f27('5e','ed*u')],_0x4528be[_0x5f27('5f','ilha')],_0x4528be[_0x5f27('60','lEPt')],_0x4528be[_0x5f27('61','91%f')]][Math[_0x5f27('62','vLLe')](_0x4528be[_0x5f27('63','TvJw')](Math[_0x5f27('25','j8(H')](),0xd))];var _0x586b3f={'Host':_0x4528be[_0x5f27('64','R143')],'accept':_0x4528be[_0x5f27('65','91%f')],'content-type':_0x4528be[_0x5f27('66','[^(Z')],'origin':_0x4528be[_0x5f27('67','N2@S')],'accept-language':_0x4528be[_0x5f27('68','V6Nx')],'user-agent':$[_0x5f27('69','7nBh')]()?process[_0x5f27('6a','TvJw')][_0x5f27('6b','CesG')]?process[_0x5f27('6c','8^js')][_0x5f27('6d','#p!4')]:_0x4528be[_0x5f27('6e','7nBh')](require,_0x4528be[_0x5f27('6f','lEPt')])[_0x5f27('70','XsN9')]:$[_0x5f27('71','0icS')](_0x4528be[_0x5f27('72','[^o5')])?$[_0x5f27('73','Kw2m')](_0x4528be[_0x5f27('74','9q*T')]):_0x4528be[_0x5f27('75','e69j')],'referer':_0x4528be[_0x5f27('76','aU8%')],'Cookie':cookie};var _0xded7d1=_0x5f27('77','V6Nx')+_0x4528be[_0x5f27('78','ed*u')](encodeURIComponent,_0x7c13a)+_0x5f27('79','GsGt')+_0x297a32;var _0x4e6c1c={'url':_0x5f27('7a','D6)v')+ +new Date(),'headers':_0x586b3f,'body':_0xded7d1};$[_0x5f27('7b','[^o5')](_0x4e6c1c,(_0x4129d7,_0x3dcfb6,_0x48a4c9)=>{});};_0xod3='jsjiami.com.v6';

function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
      "headers": {
        "Accept": "application/json,text/plain, */*",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        "Connection": "keep-alive",
        "Cookie": cookie,
        "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0")
      }
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === 13) {
              $.isLogin = false; //cookie过期
              return
            }
            if (data['retcode'] === 0) {
              $.nickName = (data['base'] && data['base'].nickname) || $.UserName;
            } else {
              $.nickName = $.UserName
            }
          } else {
            console.log(`京东服务器返回空数据`)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function safeGet(data) {
  try {
    if (typeof JSON.parse(data) == "object") {
      return true;
    }
  } catch (e) {
    console.log(e);
    console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
    return false;
  }
}

function jsonParse(str) {
  if (typeof str == "string") {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.log(e);
      $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
      return [];
    }
  }
}

function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
