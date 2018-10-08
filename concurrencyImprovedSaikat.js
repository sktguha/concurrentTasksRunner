
function Runner(concurLimit) {
    this.concurLimit = concurLimit;
    this.slots = 0;
    this._priorityHeap = new PriorityHeap();
}

Runner.prototype.isString = function(str){
    try {
        return Object.prototype.toString.call(str).split(" ").pop().slice(0, -1) === "String"
    } catch(e) {
        return false;
    }
};

Runner.prototype._generateLabel = function(obj) {
    return "priority:" + obj.priority + ",faillimit:" + obj.failLimit;
};

Runner.prototype._normaliseTaskDetails = function(obj){
    obj.priority = obj.priority || 0;
    obj.failLimit = obj.failLimit || 1;
    obj.label = this.isString(obj.label) ? obj.label
        : this._generateLabel(obj);
    return obj;
};

Runner.prototype._getTimeStamp = function(){
    var now = (function() {
        return performance.now.bind(performance)       ||
            performance.mozNow.bind(performance)    ||
            performance.msNow.bind(performance)     ||
            performance.oNow.bind(performance)      ||
            performance.webkitNow.bind(performance) ||
            Date.now.bind(Date)  /*none found - fallback to browser default */
    })();
    return now();
};

/**
 * as soon as push happens run if slot free else push to heap
 * @param taskDetails contains description of task to run
 */
Runner.prototype.pushToRunner = function (taskDetails) {
    //wrap in an object as we need to store our own private data also
    taskDetails = this._normaliseTaskDetails(taskDetails);
    var taskToRun = {
        taskDetails : taskDetails,
        priority : taskDetails.priority,
        failCount : 0,
        failLimit : taskDetails.failLimit,
        timestamp : this._getTimeStamp(), //benefit of performance.now(if available) is that it is monotonically increasing so no chance of collision
        label : taskDetails.label
    };
    this._pushToRunner(taskToRun);
};

Runner.prototype._pushToRunner = function (taskDetails) {
    if(this.slots === this.concurLimit){
        console.log("buffering as no slots free", taskDetails.label, " max slots : ", this.concurLimit);
        this._pushToPrioHeap(taskDetails);
    } else {
        this._runTask(taskDetails)
    }
};

Runner.prototype._runTask = function(taskToRun){
    var that = this;
    that.slots ++;

    var onTaskSuccessOrFail = function() {
        this.slots --;
        var task = this.popHighestPrioTask();
        if(!task) {
            console.log("no more tasks to run at this moment when this task done:", taskToRun.label);
            return;
        }
        this._runTask(task);
    }.bind(this);
    console.log("Starting task", taskToRun.label);
    taskToRun.taskDetails.start().then(function () {
            console.log("Successfully executed task", taskToRun.label);
            onTaskSuccessOrFail();
        }
        , function () {
            console.log("task failed", taskToRun.label);
            taskToRun.failCount++;
            if (taskToRun.failCount >= taskToRun.failLimit - 1) {
                console.log("not putting back in queue as max failLimit reached for ", taskToRun.label);
                return;
            }
            console.log("retrying after putting back in queue...");
            that._pushToRunner(taskToRun);
            onTaskSuccessOrFail();
        }.bind(this));
};

Runner.prototype._pushToPrioHeap = function(obj){
    this._priorityHeap.insertToHeap(obj, obj.priority, obj.timestamp);
};

Runner.prototype.popHighestPrioTask = function(){
    return this._priorityHeap.popHighest();
};

// ------

const r = new Runner(3);

var fn = function () {
    var that = this;
    return new Promise(function (resolve, reject) {
        setTimeout(function(){
            resolve();
        }, 2000);
    })
};

r.pushToRunner({
    start: fn,
    priority : 5
}); // executes immediately

r.pushToRunner({
    start: fn,
    priority : 6
}); // executes immediately

r.pushToRunner({
    start: fn,
    priority : 7
}); // executes immediately

r.pushToRunner({
    start: fn,
    priority : 8,
    failLimit : 3
}); // should wait until one of the running tasks completes

r.pushToRunner({
    start: fn,
    priority : 8,
    failLimit : 3,
    label : "task with duplicate priority 8"
});

r.pushToRunner({
    start: function () {
        var that = this;
        return new Promise(function (resolve, reject) {
            setTimeout(function(){
                reject();
            }, 2000);
        })
    },
    priority : 11,
    label : "always failing task 1 failimit",
});

r.pushToRunner({
    start: function () {
        var that = this;
        return new Promise(function (resolve, reject) {
            setTimeout(function(){
                reject();
            }, 2000);
        })
    },
    priority : 11,
    failLimit : 3,
    label : "always failing task with failimit 3"
});


r.pushToRunner({
    start: fn,
    priority : 11
}); // should wait until one of the running tasks completes
