function Shift(element, options) {
  
  // no options or no root element
  if (!element) return
  console.log('Shift initialized on', element)

  var 
      // simple no operation function
      noop = function() {},

      // offload a functions execution
      offload = function(fn) { setTimeout(fn || noop, 0) },

      // check what the browser can do
      browser = {
        addEventListener: !!window.addEventListener,
        touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
        transitions: (function(temp) {
          var props = ['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective']
          for ( var i in props ) if (temp.style[ props[i] ] !== undefined) return true
          return false;
        })(document.createElement('shift'))
      },

      // cache the style element
      style = element.style,

      // initialize start and delta for finger tracking
      start = delta = end = {},

      // intialize options
      beforeFn = !!options && options.before || noop,
      startFn = !!options && options.start || noop,
      moveFn = !!options && options.move || noop,
      endFn = !!options && options.end || noop,
      tamperFn = !!options && options.tamper || noop

  // no need to continue if browser doesnt support event listeners
  if (!browser.addEventListener) return

  // call before function option
  offload(beforeFn.call(element))

  // setup event capturing
  var events = {
    handleEvent: function(event) {
      switch (event.type) {
        case 'touchstart': this.start(event); break
        case 'touchmove': this.move(event); break
        case 'touchend': this.end(event); break
        case 'webkitTransitionEnd':
        case 'msTransitionEnd':
        case 'oTransitionEnd':
        case 'transitionend': this.transitionEnd(event); break
      }
    },
    start: function(event) {

      // measure start values
      var touches = event.touches[0]
      start = {

        // get initial touch coords
        x: touches.pageX,
        y: touches.pageY,

        // store time to determine touch duration
        time: Date.now()

      }

      // reset delta and end measurements
      delta = end = {}

      // attach touchmove and touchend listeners
      element.addEventListener('touchmove', this, false)
      element.addEventListener('touchend', this, false)

      offload(startFn.call({ start: start }, event))

    },
    move: function(event) {

      // currently Shift only supports one finger
      if ( event.touches.length > 1 || event.scale && event.scale !== 1) return

      // measure change in x and y
      var touches = event.touches[0]
      delta = {
        x: touches.pageX - start.x,
        y: touches.pageY - start.y
      }
      // continue to overwrite end
      end = {
        x: touches.pageX,
        y: touches.pageY
      }

      delta = tamperFn(delta.x, delta.y)

      offload(moveFn.call({ start: start, delta: delta }, event))

    },
    end: function(event) {

      // measure duration
      var now = Date.now(),
          duration = now - start.time

      // kill touchmove and touchend event listeners until touchstart called again
      element.removeEventListener('touchmove', this, false)
      element.removeEventListener('touchend', this, false)

      // if touchmove isn't called, set end to the same as start
      if (!delta.x || !delta.y) {
        end = start
        // set proper time for touchend
        end.time = now
      }

      offload(endFn.call({ start: start, end: end, delta: delta, duration: duration }, event))

    },
    transitionEnd: function(event) {}
  }

  // set touchstart event on element
  element.addEventListener('touchstart', events, false)

  // expose the Shift API
  return {
    kill: function() {

      // remove touchstart listener
      element.removeEventListener('touchstart', this, false)
      element.removeEventListener('webkitTransitionEnd', this, false)
      element.removeEventListener('msTransitionEnd', this, false)
      element.removeEventListener('oTransitionEnd', this, false)
      element.removeEventListener('transitionend', this, false)

    }
  }

}