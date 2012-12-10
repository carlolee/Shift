var height, endpoint,
    open = false,
    paneElement = document.getElementById('curtain-pane'), 
    handleElement = document.getElementById('curtain-handle'),
    detailsElement = document.getElementById('curtain-details'),
    detailsOffset = -68,
    headerElement = document.getElementById('curtain-header')

var animate = {

  opacity: function(element, opacity, duration) {

    var style = element.style

    style.webkitTransitionDuration = 
    style.MozTransitionDuration = 
    style.msTransitionDuration = 
    style.OTransitionDuration = 
    style.transitionDuration = duration ? duration + 'ms' : 0

    style.opacity = Math.round( opacity * 100 ) / 100

  },

  move: function(element, coords, duration) {

    var style = element.style

    style.webkitTransitionDuration = 
    style.MozTransitionDuration = 
    style.msTransitionDuration = 
    style.OTransitionDuration = 
    style.transitionDuration = duration ? duration + 'ms' : 0

    style.MozTransform = 
    style.webkitTransform =
    style.msTransform = 
    style.OTransform = (coords.x != undefined ? 'translateX(' + coords.x + 'px)' : '') + ' ' + 
                       (coords.y != undefined ? 'translateY(' + coords.y + 'px)' : '')

  }

}




Shift(handleElement, {
  before: function() {},
  start: function(event) {

    var windowHeight = window.innerHeight
    document.body.minHeight = windowHeight + 'px'

    window.scrollTo(0,0)
    
    // calculate distance to endpoint
    endpoint = window.innerHeight - 100

  },
  tamper: function(x, y) {

    if (open && y<0 || !open && y>0) y = y / ( Math.abs(y)/50 + 1)
    else if (open && endpoint-y<0) y = endpoint - (endpoint-y) / ( Math.abs(endpoint-y)/50 + 1)
    else if (!open && endpoint+y<0) y = -endpoint + (endpoint+y) / ( Math.abs(endpoint+y)/50 + 1)

    return { x: x, y: y }

  },
  move: function(event) {

    event.stopPropagation()
    event.preventDefault()

    if (open) {
      animate.opacity(headerElement, this.delta.y / endpoint)
      animate.move(paneElement, { y: -endpoint + this.delta.y })
      animate.move(detailsElement, { y: this.delta.y/endpoint * detailsOffset - detailsOffset })
    }
    else {
      animate.opacity(headerElement, 1 + this.delta.y / endpoint)
      animate.move(paneElement, { y: this.delta.y })
      animate.move(detailsElement, { y: this.delta.y/endpoint * (detailsOffset) })
    }

  },
  end: function(event) {

    var valid = (open ? this.delta.y > endpoint/2 : this.delta.y < -endpoint/2)
                || (Date.now() - this.start.time < 350 
                  && (open ? this.delta.y > 100 : this.delta.y < -100))
    
    if (open && valid || !open && !valid) {
      animate.opacity(headerElement, 1)
      animate.move(paneElement, { y: 0 }, 200)
      animate.move(detailsElement, { y: 0 }, 200)
    }
    else {
      animate.opacity(headerElement, 0)
      animate.move(paneElement, { y: -endpoint }, 200)
      animate.move(detailsElement, { y: -detailsOffset }, 200)
    }

    if (valid) open = !open

  }
})