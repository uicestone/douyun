# 安装

```
npm install --registry=https://registry.npm.taobao.org
bower install
```

# 运行

## 开发环境

```
gulp serve
node server
```

## 生产环境

```
gulp build
```

Apache2或NGINX等Web Server，绑定dist目录
PM2等进程管理工具启动`node server`
