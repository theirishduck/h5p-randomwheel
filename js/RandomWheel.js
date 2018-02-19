var H5P = H5P || {};

/**
 * Constructor.
 */
H5P.RandomWheel = (function ($, JoubelUI) {
  
  function RandomWheel(options) {
    if (!(this instanceof H5P.RandomWheel)) {
      return new H5P.RandomWheel(options);
    }
    var self = this;
    this.options = options;
    this.theWheel = undefined;
    this.wheelSpinning = false;
    this.canvasId = "canvas" + Math.round(new Date().getTime() + (Math.random() * 100));
    this.slices = this.options.words.length;
    H5P.EventDispatcher.call(this);
    //this.on('resize', self.resize, self);

  }
  RandomWheel.prototype = Object.create(H5P.EventDispatcher.prototype);
  RandomWheel.prototype.constructor = RandomWheel;

  /**
   * Append field to wrapper.
   *
   * @param {jQuery} $container
   */
  RandomWheel.prototype.attach = function ($container) {
    var that = this;
    $left = $('<div>', {
      'class': 'g2 randomwheel-content-left'
    });
    $right = $('<div>', {
      'class': 'g2 randomwheel-content-right'
    });
    this.$container = $container
      .addClass('h5p-randomwheel')
      .html('<div class="h5p-heading">' + this.options.intro + '</div>');
    

    $instructions = $('<div id="instructions" class="h5p-instructions">&nbsp;</div>');
    this.$container.append($instructions);
    $canvas = $('<canvas>', {
      'class': 'randomwheel-content',
      'id': that.canvasId,
      text: "Canvas not supported, use another browser."
    });
    $right.append($canvas);
    $spinBtn = JoubelUI.createButton({
      'class': 'spin',
      'title': that.options.spinLabel,
      text: that.options.spinLabel
    }).click(function () {
      $("#instructions").html("&nbsp;");
      that.startSpin();
    }).appendTo($left);


    this.$container.append($left);
    this.$container.append($right);
    this.resizeCanvas(that.canvasId);
    //$("#instructions").hide();
    this.buildWheel();
  };

  RandomWheel.prototype.startSpin = function () {
     var that = this;
     // Ensure that spinning can't be clicked again while already running.
     if (that.wheelSpinning == false) {
       that.theWheel.rotationAngle=0;
       // Begin the spin animation by calling startAnimation on the wheel object.
       that.theWheel.startAnimation();
       that.wheelSpinning = true;
     }
  }
  
  RandomWheel.prototype.drawTriangle = function ()
  {
      var that = this;
      // Get the canvas context the wheel uses.
      var ctx = that.theWheel.ctx;
      var size = 10;
      //var center = 150;
      var center = $('#' + that.canvasId).width() / 2;
      ctx.strokeStyle = 'black';  // Set line colour.
      ctx.fillStyle   = 'white';  // Set fill colour.
      ctx.lineWidth   = 2;
      ctx.beginPath();           // Begin path.
      ctx.moveTo(center - size, 0);        // Move to initial position.
      ctx.lineTo(center, 20);        // Draw lines to make the shape.
      ctx.lineTo(center + size, 0);
      //ctx.lineTo(center + size, center - size);
      ctx.stroke();              // Complete the path by stroking (draw lines).
      ctx.fill();                // Then fill.
  }
    
  RandomWheel.prototype.buildWheel = function (width) {
    var that = this;
    
    if (that.slices === undefined || that.slices === 0) {
      return;
    }

    var callbackFinished = (function() {
      var winningSegment = this.theWheel.getIndicatedSegment();
      this.theWheel.stopAnimation(false);  // Stop the animation
      this.theWheel.draw();
      this.drawTriangle();
      this.wheelSpinning = false;
      $("#instructions").html(this.options.instructions + " <strong>" + winningSegment.text + "</strong>");
      $("#instructions").show();
    }).bind(this);
    
    var callbackAfter = (function() {
      this.drawTriangle();
    }).bind(this);

    that.theWheel = new Winwheel({
      'canvasId'    : that.canvasId,
      'numSegments' : 0,
      
      'animation' :               // Definition of the animation
      {
        'type'         : 'spinToStop',
        'duration'     : 3,
        'repeat'       : 2,
        'spins'        : 2 * that.slices, // The number of complete 360 degree rotations the wheel is to do.
        'stopAngle'    : null,
        'direction'    : 'clockwise',
        'easing'       : 'Power4.easeOut',
        'repeat'       : 0,
        'yoyo'         : true,
        'lineWidth'    : 1,
        'callbackFinished' : callbackFinished,
        'callbackAfter' : callbackAfter
      }
    });
    
    for (var index = 0; index < that.slices; index++) {
      that.theWheel.addSegment({'fillStyle' : that.getRandomColor(that.slices, index), 'text' : this.options.words[index]});
    }
    that.theWheel.draw();
    that.drawTriangle();
  }
  

  RandomWheel.prototype.getRandomColor = function(numOfSteps, step) {
    // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
    // Adam Cole, 2011-Sept-14
    // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
    var r, g, b;
    var h = step / numOfSteps;
    var i = ~~(h * 6);
    var f = h * 6 - i;
    var q = 1 - f;
    switch(i % 6){
        case 0: r = 1; g = f; b = 0; break;
        case 1: r = q; g = 1; b = 0; break;
        case 2: r = 0; g = 1; b = f; break;
        case 3: r = 0; g = q; b = 1; break;
        case 4: r = f; g = 0; b = 1; break;
        case 5: r = 1; g = 0; b = q; break;
    }
    var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
    return (c);
  }
  
  /**
   * Resize function for responsiveness.
   */
  RandomWheel.prototype.resizeCanvas = function (id) {
    var canvasWidth = $('.h5p-randomwheel').width() / 2;
    var canvasHeight = canvasWidth / 16 * 8;
    var c = $("#" + id);
    ctx = c[0].getContext('2d');
    ctx.canvas.height = canvasHeight;
    ctx.canvas.width = canvasWidth;
  };

  return RandomWheel;

})(H5P.jQuery, H5P.JoubelUI);