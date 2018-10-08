Async Task runner with failure limits and limit to number of slots available
To Run : open index.html in browser
usage :

var r =  new Runner(3);
r.pushToRunner({
    // this function needs to return a promise that resolves or rejects based on task
    // failed or completed. haven't tested this part but if timeout behaviour is required,
    // timeout can also be used
    // by rejecting the returned promise after certain timeout
    start: function () {
            var that = this;
            return new Promise(function (resolve, reject) {
                setTimeout(function(){
                    resume();
                }, 2000);
            })
        },

        //relative priority , used if buffering is required. we use a binary
        //priority heap to store these. we also store timestamps using performance.now
        // (if available) in case of same priority to resolve tie. benefit of using performance.now
	// is that it is monotonically increasing , hence no chance of being same
        priority : 11,
        failLimit : 3, //
        label : "example task" //
})

