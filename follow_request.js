/**
 * Created by Administrator on 2016/9/20.
 */
var system = require('system');

if (system.args.length !== 2) {
    console.log('Usage: serverkeepalive.js  url');
    phantom.exit(1);
}
// 清除 cookie
phantom.clearCookies();
var page = require('webpage').create();
// 单位是 milli-secs，1s = 100 milli-secs
page.settings.resourceTimeout = 1000;
page.onResourceRequested = function(requestData, networkRequest)    {
    console.log('id = ' + requestData.id + ', url = ' + requestData.url);
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

    console.log(msgStack.join('\n'));
};

// 这是必不可少的，否则可能导致 phantomjs 一直运行着不退出
page.onLoadFinished = function(status) {
    console.log('onLoadFinished status = ' + status);
    //phantom.exit();
};

page.open(system.args[1], function (status) {
    if (status == 'success')    {
        console.log('completed ' + preUrl);
    } else {
        console.log('status = ' + status);
    }
    phantom.exit();
});
