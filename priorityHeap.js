//TODO : use modules
function PriorityHeap(){
    this.list = [null];
}

PriorityHeap.prototype._isGreaterThan = function(obj1, obj2){
    if(obj1.priority > obj2.priority) return;
    if(obj1.priority === obj2.priority) return obj1.timestamp > obj2.timestamp;
};

PriorityHeap.prototype._isLessThan = function(obj1, obj2){
    if(obj1.priority < obj2.priority) return;
    if(obj1.priority === obj2.priority) return obj1.timestamp < obj2.timestamp;
};

/**
 *
 * @param obj
 * obj.priority is used to determine the position in the list. incase elements have same priority, we
 * use obj.timestamp to break the tie
 */
PriorityHeap.prototype.insertToHeap = function (obj) {
    this.list.push(obj);
    var currentNodeIdx = this.list.length - 1;
    var currentNodeParentIdx = Math.floor(currentNodeIdx / 2);
    while ( this.list[currentNodeParentIdx] &&
        this._isGreaterThan(obj, this.list[currentNodeParentIdx])
        ) {
        var parent = this.list[currentNodeParentIdx];
        this.list[currentNodeParentIdx] = obj;
        this.list[currentNodeIdx] = parent;
        currentNodeIdx = currentNodeParentIdx;
        currentNodeParentIdx = Math.floor(currentNodeIdx / 2);
    }
};

/*
  this will remove the given element with highest priority
 */
PriorityHeap.prototype.popHighest = function () {
    //handle special case early and exit
    if (this.list.length < 3) {
        var toReturn = this.list.pop();
        this.list[0] = null;
        return toReturn;
    }
    var toRemove = this.list[1];
    this.list[1] = this.list.pop();
    var currentIdx = 1;
    var left = 2*currentIdx;
    var right = 2*currentIdx + 1;
    var currentChildIdx;
    if(this.list[right]){
        currentChildIdx = this._isGreaterThan(this.list[right], this.list[left]) ? right : left;
    }
    while (this.list[currentChildIdx] && this._isLessThan(this.list[currentIdx], this.list[currentChildIdx])) {
        //swap childnode and parent node
        var temp = this.list[currentChildIdx];
        this.list[currentChildIdx] = this.list[currentIdx];
        this.list[currentIdx] = temp;
    }
    return toRemove;
};
