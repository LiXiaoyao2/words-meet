# 心动相遇

局域网词语默契游戏，支持双人及 2～3 人挑战。服务器无需安装依赖，使用 Node.js 启动：

```bash
node server.js
```

默认监听 `0.0.0.0:43871`，可以设置 `PORT` 更改端口。手机和电脑在同一网络时访问 `http://电脑局域网IP:43871/`。

微信小程序客户端位于 [miniprogram](miniprogram/README.md)。玩家身份、好友和战绩保存在本地 `friends.json`，包含私人数据，已排除在 Git 之外；需要迁移或备份时请单独妥善保管。敏感词表由 `sensitive-words.json` 维护，简单词库不能保证识别所有变体。
