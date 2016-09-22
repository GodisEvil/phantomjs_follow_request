"use strict";

var port, server, service,
    system = require('system');

if (system.args.length !== 2) {
    console.log('Usage: serverkeepalive.js <portnumber>');
    phantom.exit(1);
} else {
    port = system.args[1];
    server = require('webserver').create();

    service = server.listen(port, { keepAlive: true }, function (request, response) {
        // console.log('Request at ' + new Date());
        // console.log(JSON.stringify(request, null, 4));

        response.statusCode = 200;
        response.headers = {
            'Cache': 'no-cache',
            'Content-Type': 'text/plain',
            'Connection': 'Keep-Alive',
            'Keep-Alive': 'timeout=5, max=100'
            // 'Content-Length': body.length
        };
        var body = {'code':0, 'msg':[]};

        // body 部分就是要请求的 url
        var rawData = request.postRaw;
        console.log('post body: ' + rawData);

        try {
            var data =  JSON.parse(rawData);
            var preUrl = data.url;
            var clientAddr = data.peer;
            if (!preUrl || !clientAddr) {
                throw 'empty parameter';
            }
        } catch (err)   {
            body['code'] = 1;
            body['msg'].push(err);
            body = JSON.stringify(body);
            response.headers['Content-Length'] = body.length;
            response.write(body);
            response.close();
            return;
        }

        // 清除 cookie
        phantom.clearCookies();
        var page = require('webpage').create();
        // 单位是 milli-secs，1s = 100 milli-secs
        page.settings.resourceTimeout = 1000;
        page.onResourceRequested = function(requestData, networkRequest)    {
            console.log('id = ' + requestData.id + ', url = ' + requestData.url);
            body['msg'].push(url);
        };
        page.onResourceTimeout = function (request) {
            console.log('Timeout (#' + request.id + '): ' + JSON.stringify(request));
        };
        page.onError = function(msg, trace)    {
            var msgStack = ['ERROR: ' + msg];

            if (trace && trace.length) {
                msgStack.push('TRACE:');
                trace.forEach(function(t) {
                    msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
                });
            }

            console.error(msgStack.join('\n'));
        };
        page.onLoadFinished = function(status) {
            console.log('loadFinished, status: ' + status);
        };
        page.open(preUrl, function (status) {
            if (status == 'success')    {
                console.log('completed ' + preUrl);
            }
        });
        body = JSON.stringify(body);
        response.headers['Content-Length'] = body.length;
        response.write(body);
        response.close();
    });

    if (service) {
        console.log('Web server running on port ' + port);
    } else {
        console.log('Error: Could not create web server listening on port ' + port);
        phantom.exit();
    }
}

