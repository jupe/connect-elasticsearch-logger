connect-elasticsearch-logger
============================

Inspired by elasticsearch and kibana. Those are great tools to visualize logs, but what about if it can be also to visualize your connect (/express) application http interface ;) . This library allows logging from express application to the elasticsearch database and then you can yse kibana to visualize all data easily.

This library just create writable stream for connect.logger and direct logs to the elasticsearch server.



Usage example:
```
var express = require('express');
var elalogger = require("connect-elasticsearch-logger")(express);
app.use( new elalogger({ hosts: 'myhost:9200' }) );
```


License: (MIT) See License file.
