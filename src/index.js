var elasticsearch = require('elasticsearch'),
    util = require('util');


module.exports = function(express) {
  var Logger;

  function ElasticsearchApi(options) {
    var self = this;
    
    this.options = options || {};

    this.es = {
      index: 'connect',
      type: 'logger'
    }

    this.client = new elasticsearch.Client({
       host: this.options.hosts
    });

    this.client.indices.create({
      index: this.es.index,
      type: this.es.type,
    }, function(){
      self.client.indices.putMapping({
        index: self.es.index,
        type: self.es.type,
        body: {
          "ip" : { "enabled" : true },
          "method": { "enabled" : true },
          "remote-addr": { "enabled" : true },
          "status": { "enabled" : true, type: 'integer' },
          "contentLength": { "enabled" : true, type: 'integer' },
          "responseTime": { "enabled" : true, type: 'integer' },
          "httpVersion": { "enabled" : true },
          "userAgent": { "enabled" : true }
        }
      }, function(){ });

    });
    var elasticStream = {
      write: function(message, encoding){
        message = JSON.parse(message)
        var id = uuid();
        try{ message.status = parseInt(message.status); }
        catch(e){ message.status = 0; }
        try{ message.contentLength = parseInt(message.contentLength); }
        catch(e){ message.contentLength = 0; }
        try{ message.responseTime = parseInt(message.responseTime); }
        catch(e){ message.responseTime = 0; }
        message['@timestamp'] = new Date();
        self.client.index({
            index: self.es.index,
            type: self.es.type,
            id: id,
            body: message
          }, function (e, r) {
            //cb(e); there is no needed cb function
          })
      }
    }
    var format = '{"ip": ":remote-addr","timestamp":":date","method":":method","url":":url","status"\:":status","contentLength":":res[Content-Length]","responseTime":":response-time","httpVersion":":http-version","userAgent":":user-agent"}'
    Logger = express.logger({stream: elasticStream, format: format});
    return Logger;
  }

  //for generate new uuid
  function uuid() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
  }

  return ElasticsearchApi;
}
