import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import { DatePicker, Table, Button } from 'antd';
import fetch from 'isomorphic-fetch';
import { Player, ControlBar } from 'video-react';
import Audio from 'soundcloud-audio';
import classNames from 'classnames';

require("../../node_modules/video-react/dist/video-react.css");

/*const data = [
	{
		key: "1",
		sender: "小米",
		receiver: "小红",
		content: "你好",
		time: "12:30"
	}
]*/

function DownloadButton (props) {
		const { player,className } = props;
		const { currentSrc } = player;
		return(
			<a
				download
				href={currentSrc}
				className={classNames(className, {
          'video-react-control': true,
          'video-react-button': true,
        })}
        style={{
        	backgroundImage: 'url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBoZWlnaHQ9IjE4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIxOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgPHBhdGggZD0iTTE5IDloLTRWM0g5djZINWw3IDcgNy03ek01IDE4djJoMTR2LTJINXoiLz4gICAgPHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
        tabIndex="0"
			>
			</a>
		);
}

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: []
		}
		this.columns = [
			{
				title: "发送者",
				dataIndex: "sender",
				key: "sender"
			},
			{
				title: "接收者",
				dataIndex: "receiver",
				key: "receiver"
			},
			{
				title: "内容",
				dataIndex: "content",
				key: "content",
				width: "500px",
				render: (content) => {
					switch(content[0]){
						case "文本":
							return content[1].text;
						case "图片":
							return <a download href={content[1].picPath}><img width="100px" src={content[1].picPath}/></a>;
						case "表情":
							return <a download href={content[1].emotionPath}><img width="100px" src={content[1].emotionPath}/></a>;
						case "语音":
							return 	<audio 
												src={content[1].autioPath}
												controls
											></audio>;
						case "视频":
							return 	<Player
												width={300}
												src={content[1].vedioPath}
											>
												<ControlBar autoHide={false}>
													<DownloadButton order={8} />
												</ControlBar>
											</Player>;
						case "地址":
							return <a href=""></a>;
						default:
							break;
					}
				}
			},
			{
				title: "时间",
				dataIndex: "time",
				key: "time"
			}
		];
		this.date = '';
	}

	componentWillMount() {
		// 获取当日记录
		this.getData(moment().format('YYYY-MM-DD'));
	}

	getData = (date) => {
		fetch(`../data?date=${date}`)
			.then(res => {
				return res.json();
			})
			.then(res => {
				this.setState({
					data: res.result
				});
			})
			.catch(err => {
				console.log(err);
			})
	}

	render() {
		const data = this.state.data.length !== 0 && this.state.data.map((item, index) => {
			return {
				key: index,
				sender: item.fromUser,
				receiver: item.toUser,
				content: [item.msgType,item.message],
				time: item.time
			}
		}) || [];

		return (
			<div className="recoder-container"
				style={{
					"width": "1200px",
					"margin": "150px auto 0",
					"padding": "20px",
					"border": "1px solid #e0d7d7",
					"borderRadius": "10px"
				}}
			>
				<DatePicker 
					defaultValue={moment()}
					onChange={(date, dateStr) => {
						this.date = dateStr;
					}}
				/>
				<Button 
					style={{"marginLeft":"20px"}} 
					type="primary"
					onClick = {() => {
						this.getData(this.date || moment().format('YYYY-MM-DD'));
					}}
					>确定</Button>
				<Table 
					style={{"marginTop":"20px"}}
					dataSource={data} 
					columns={this.columns} 
					pagination={{ pageSize: 20 }} 
					scroll={{ y: 360 }}
				/>
			</div>
		);
	}
}

ReactDOM.render(<App/>, document.getElementById('root'));