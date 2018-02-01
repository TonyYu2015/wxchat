'use strict'
const fs = require('fs');
const Wechat = require('wechat4u');
const qrcode = require('qrcode-terminal');
const mongoose = require('mongoose');
const moment = require('moment');
const express = require('express');
const path = require('path');
const qiniu = require('qiniu');

const app = express();

//设置静态文件目录
app.use(express.static('./dist'));

// 设置路由
const router = express.Router();

// 解决moongose的promise过期问题
mongoose.Promise = global.Promise;

// 连接数据库
const db = mongoose.createConnection('mongodb://localhost:27017', (err, db) => {
	if(!err){
		console.log('数据库连接成功！！！');
		app.listen(3000);
	} else {
		console.log('数据库连接失败！！！');
		return null;
	}
});





app.use("/", router);


// 创建schema
let MessageSchema = mongoose.Schema({
	fromUser: 'string', // 发送者
	toUser: 'string', //接收者
	time: 'string', // 消息时间
	msgType: 'string', // 消息类型
	message: 'object'  // 定义一个属性message，类型为object
});

let bot;
let MessageModel = db.model('Person', MessageSchema, moment().format('YYYY-MM-DD'));

// 保存消息
const saveMessage = (
	bot,
	msg,
	MessageModel,
	opt = {
		method: 'getMsgImg',
		noteMessage: '你收到了一段文本消息！！！',
		path: `dist/Imgs/${msg.MsgId}.jpg`,
		savePath: 'picPath'
	}
	) => {

		// 插入数据库
		const insertDb = () => {
			console.log(opt.noteMessage);
			let msgType = '';
			switch(msg.MsgType){
				case 1:
					msgType = '文本';
					break;
				case 3:
					msgType = '图片';
					break;
				case 34:
					msgType = '语音';
					break;
				case 43:
				case 62:
					msgType = '视频';
					break;
				case 48:
					msgType = '地址';
					break;
				default:
					break;
			}
			new MessageModel({
				fromUser: bot.contacts[msg.FromUserName].isSelf ? `[User]${bot.user.NickName}` : bot.contacts[msg.FromUserName].getDisplayName(),
				toUser: bot.contacts[msg.ToUserName].isSelf ? `[User]${bot.user.NickName}` : bot.contacts[msg.ToUserName].getDisplayName(),
				time: msg.getDisplayTime(),
				msgType: msgType,
				message: Number(msg.MsgType) === 1 ? {text: msg.Content} : {
					author: msg.Content,
					[opt.savePath]: opt.path
				}
			}).save((err) => {
				if(!err){
					console.log('保存成功！！！');
				}
			});
		}

		if(Number(msg.MsgType) === 1){
			insertDb();
			console.log(msg.Content);
			return;
		}

		bot[opt.method](msg.MsgId)
			.then(res => {
			  fs.writeFileSync('dist/' + opt.path, res.data);
			  insertDb();
			})
			.catch(err => {
			  console.log(err);
			});
	}


try{
	bot = new Wechat(require("./local-data.json"));
} catch(e){
	bot = new Wechat();
}

if(bot.PROP.uin){
	bot.restart();
} else {
	bot.start();
}

// 监听错误
bot.on('error', err => {
	console.log(err);
});

// uuid事件
bot.on('uuid', uuid => {
	console.log('扫码登陆！！！');
	qrcode.generate('https://login.weixin.qq.com/l/' + uuid, {
		small: true
	});

	console.log('如果扫码不成功，请打开如下链接：');
	console.log('https://login.weixin.qq.com/qrcode/' + uuid);
});

// 登录事件
bot.on('login', () => {
	console.log('登陆成功！！！');
	// fs.writeFileSync('./local-data.json', JSON.stringify(bot.botData));
});

// 消息事件
bot.on('message', msg => {
	switch(msg.MsgType) {
		case bot.CONF.MSGTYPE_TEXT:
			// 文本
			saveMessage(
				bot,
				msg,
				db.model('Person', MessageSchema, moment().format('YYYY-MM-DD')),
				{
					method: 'getMsgImg',
					noteMessage: '你收到了一段文本消息！！！',
					path: `Imgs/${msg.MsgId}.jpg`,
					savePath: 'picPath'
				}
			)
			break;
		case bot.CONF.MSGTYPE_IMAGE:
			// 图片
			saveMessage(
				bot,
				msg,
				db.model('Person', MessageSchema, moment().format('YYYY-MM-DD')),
				{
					method: 'getMsgImg',
					noteMessage: '你收到了一张图片！！！',
					path: `Imgs/${msg.MsgId}.jpg`,
					savePath: 'picPath'
				}
			)
			break;
		case bot.CONF.MSGTYPE_EMOTICON:
			// 自定义表情
			saveMessage(
				bot,
				msg,
				db.model('Person', MessageSchema, moment().format('YYYY-MM-DD')),
				{
					method: 'getMsgImg',
					noteMessage: '你收到了一个表情！！！',
					path: `motion/${msg.MsgId}.gif`,
					savePath: 'emotionPath'
				}
			)
			break;
		case bot.CONF.MSGTYPE_VOICE:
			// 语音
			saveMessage(
				bot,
				msg,
				db.model('Person', MessageSchema, moment().format('YYYY-MM-DD')),
				{
					method: 'getVoice',
					noteMessage: '你收到了一段语音！！！',
					path: `Audios/${msg.MsgId}.mp3`,
					savePath: 'autioPath'
				}
			)
			break;
		case bot.CONF.MSGTYPE_VIDEO :
			// 视频
		case bot.CONF.MSGTYPE_MICROVIDEO:
			// 小视频
			saveMessage(
				bot,
				msg,
				db.model('Person', MessageSchema, moment().format('YYYY-MM-DD')),
				{
					method: 'getVideo',
					noteMessage: '你收到了一段视频！！！',
					path: `Vedios/${msg.MsgId}.mp4`,
					savePath: 'vedioPath'
				}
			)
			break;
		/*case bot.CONF.MSGTYPE_APP:
			// 文件
			bot.getDoc(msg.FromUserName, msg.MediaId, msg.FileName)
				.then(res => {
					console.log('你收到了一段视频！！！');
				  fs.writeFileSync(`Docs/${msg.FileName}`, res.data);
				  new MessageModel({
						fromUser: bot.contacts[msg.FromUserName].getDisplayName(),
						toUser: bot.contacts[msg.ToUserName].getDisplayName(),
						time: msg.getDisplayTime(),
						msgType: msg.MsgType,
						message: {
							docPath: `Docs/${msg.FileName}`
						} 
					}).save((err) => {
						if(!err){
							console.log('保存成功！！！')
						}
					});
				})
				.catch(err => {
				  console.log(err)
				})
			break;*/
		default:
			break;
	}
});

/*router.get('/', (req, res, next) => {
	res.render('');
})*/

// 根据日期返回前端微信记录
router.get('/data', (req, res, next) => {
	db.model('Person', MessageSchema, req.query.date).find({},(err, result) => {
		// console.log(result)
		res.send({result:result});
	});
});

// 登出事件
bot.on('logout', () => {
	console.log('登出成功！！！');
});


