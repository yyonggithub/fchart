/**
 * Created by heyli on 2015/1/26.
 */
var utils = {

    sort: function(raw, sorted) {
        var sortTable = [];
        for (key in raw) {
            sortTable.push([key, raw[key].figure]);
        }
        sortTable.sort(function(a, b) {return b[1] - a[1]});

        // resume other data field value
        for (key in sortTable) {
            var index = sortTable[key][0];
            sorted[key] = {};
            for (k in raw[index]) {
                sorted[key][k] = raw[index][k];
            }
        }
    },

    getTotal: function(raw) {
        var total = 0;
        for (key in raw) {
            total += raw[key].figure;
        }
        return total;
    },

    getPercentage: function(sorted, percentage, total) {
        for (key in sorted) {
            percentage[key] = sorted[key].figure / total;
        }
    },

    getRadius: function(deg) {
        return deg / 180 * Math.PI;
    },

};

function fdata(data) {
    this.raw = data;
    this.sorted = {};
    this.info = {};
    this.total = 0;
    this.percentage = {};
}

function fchart(opt) {
    this.canvas = opt.wrapper;                         // canvas
    this.ctx = opt.wrapper.getContext('2d');           // canvas context
    this.cx = opt.cx || 100;                            // piechart x coordinate
    this.cy = opt.cy || 100;                            // piechart y coordinate
    this.r = opt.r || 100;                              // piechart radius
    this.type = opt.type || 'piechart';
    this.lineWidth = opt.lineWidth || 50;
    this.align = opt.align || 'center';
    var self = this;

    this.data = new fdata(opt.data);
    this.data.total = utils.getTotal(this.data.raw);
    utils.sort(this.data.raw, this.data.sorted);
    utils.getPercentage(this.data.sorted, this.data.percentage, this.data.total);
    
    this.getWrapperSize();
    this.draw();
}

// get wrapper size and set canvas size
fchart.prototype.getWrapperSize = function() {
    this.canvas.width = this.canvas.parentNode.clientWidth * 2;
    this.canvas.height = this.canvas.parentNode.clientHeight * 2;
    this.canvas.style.cssText = '-webkit-transform: translateX(-' + (this.canvas.width / 4) + 'px) scale(0.5);-webkit-transform-origin: 50% 0';
    
    switch(this.align){
        case 'left':
            this.cx = this.r + this.lineWidth;
            break;
        case 'right':
            this.cx = this.canvas.clientWidth - this.r - this.lineWidth;
            break;
        default:
            this.cx = this.canvas.clientWidth / 2;
            break;
    }

    this.cy = this.canvas.clientHeight / 2;
};

// draw canvas
fchart.prototype.draw = function() {
    switch(this.type){
        case 'ringchart':
            this.drawRingChart();
            break;
        case 'barchart':
            this.drawBarChart();
            break;
        default:
            this.drawPieChart();
            break;
    }
};

fchart.prototype.drawBarChart = function(){
    var ctx = this.ctx;
};

fchart.prototype.drawRingChart = function() {
    var ctx = this.ctx;
    var startDeg = -90;
    var deg = 0;
    var endDeg = 0;
    var startRadius = 0;
    var endRadius = 0;
    var startPos = {'x': this.cx, 'y': this.r - this.y};    // start drawing position
    var endPos = {'x': 0, 'y': 0};                              // end line position
    this.currentDeg = 0;   //accumulated degrees for drawing icon

    for (key in this.data.percentage) {
        this.data.info[key] = {};
        deg = this.data.percentage[key] * 360;
        if (deg === 0) {
            continue;
        }
        endDeg = startDeg + deg;
        startRadius = utils.getRadius(startDeg);
        endRadius = utils.getRadius(endDeg);
        //store info
        this.data.info[key].deg = deg;
        this.data.info[key].startDeg = startDeg;
        this.data.info[key].endDeg = endDeg;
        this.data.info[key].startRadius = startRadius;
        this.data.info[key].endRadius = endRadius;

        // drawing pichart
        ctx.beginPath();
        ctx.strokeStyle = this.data.sorted[key].color;
        ctx.arc(this.cx, this.cy, this.r, startRadius, endRadius, 0);
        ctx.lineWidth = this.lineWidth;
        ctx.stroke();
        ctx.closePath();


        /*// drawing white border
        ctx.beginPath();
        ctx.moveTo(this.cx, this.cy);
        ctx.lineTo(endPos.x, endPos.y);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        ctx.closePath();*/

        // next sector data
        startDeg = endDeg;
        startPos.x = endPos.x;
        startPos.y = endPos.y;

    }


};

// draw piechart
fchart.prototype.drawPieChart = function(){
    var ctx = this.ctx;

    var startDeg = -90;      // top degree is -90 degree
    var deg = 0;             // start degree
    var endDeg = 0;          // end degree
    var startRadius = 0;     // start radius
    var endRadius = 0;       // end radius
    var startPos = {'x': this.cx, 'y': this.r - this.y};    // start drawing position
    var endPos = {'x': 0, 'y': 0};                              // end line position
    this.currentDeg = 0;   //accumulated degrees for drawing icon

    for (key in this.data.percentage) {
        this.data.info[key] = {};
        deg = this.data.percentage[key] * 360;
        if (deg === 0) {
            continue;
        }
        endDeg = startDeg + deg;
        startRadius = utils.getRadius(startDeg);
        endRadius = utils.getRadius(endDeg);
        //store info
        this.data.info[key].deg = deg;
        this.data.info[key].startDeg = startDeg;
        this.data.info[key].endDeg = endDeg;
        this.data.info[key].startRadius = startRadius;
        this.data.info[key].endRadius = endRadius;

        // drawing pichart
        ctx.beginPath();
        ctx.moveTo(this.cx, this.cy);
        ctx.lineTo(startPos.x, startPos.y);
        ctx.arc(this.cx, this.cy, this.r, startRadius, endRadius, 0, 0);
        this.getPos(endDeg, endPos, this.r);
        ctx.fillStyle = this.data.sorted[key].color;
        ctx.fill();
        ctx.closePath();


        // // drawing white border
        // ctx.beginPath();
        // ctx.moveTo(this.cx, this.cy);
        // ctx.lineTo(endPos.x, endPos.y);
        // ctx.lineWidth = 1;
        // ctx.strokeStyle = '#ffffff';
        // ctx.stroke();
        // ctx.closePath();

        // next sector data
        startDeg = endDeg;
        startPos.x = endPos.x;
        startPos.y = endPos.y;

    }
};

// draw label and data
fchart.prototype.drawLabel = function() {
    
};

fchart.prototype.drawText = function() {
    
};

fchart.prototype.drawNum = function() {
    
};

// get end line of sector position
fchart.prototype.getPos = function(currentDeg, lineToPos, r) {
    var radius = 0;
    var deg = 0;
    currentDeg += 90;

    if (currentDeg <= 90) {
        deg = 90 - currentDeg;
        radius = utils.getRadius(deg);
        lineToPos.x = this.cx + Math.cos(radius) * r;
        lineToPos.y = this.cy - Math.sin(radius) * r;
    }
    else if (currentDeg <= 180) {
        deg = currentDeg - 90;
        radius = utils.getRadius(deg);
        lineToPos.x = this.cx + Math.cos(radius) * r;
        lineToPos.y = this.cy + Math.sin(radius) * r;
    }
    else if (currentDeg <= 270) {
        deg = 270 - currentDeg;
        radius = utils.getRadius(deg);
        lineToPos.x = this.cx - Math.cos(radius) * r;
        lineToPos.y = this.cy + Math.sin(radius) * r;
    }
    else if (currentDeg <= 360) {
        deg = currentDeg - 270;
        radius = utils.getRadius(deg);
        lineToPos.x = this.cx - Math.cos(radius) * r;
        lineToPos.y = this.cy - Math.sin(radius) * r;
    }
};