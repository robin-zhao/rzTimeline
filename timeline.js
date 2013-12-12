 
$.fn.timeline = function(json){

  // Prepare to redraw.
  $(this).empty();
  var that = this;

  // Set width.
  $(this).css({width: json.width + 'px'});
  // Add skeleton divs.
  var tl_body = $('<div id="tl-body"></div>');
  var tl_timescale = $('<div id="tl-timescale"></div>');
  var tl_slider = $('<div id="tl-slider"></div>');
  $(this).append(tl_body);
  $(this).append(tl_timescale);
  $(this).append(tl_slider);

  // Calculate scale ratio.
  var additional = 20;
  var diff = json.max_date - json.min_date + additional * 2; 
  var ratio = json.ratio ? json.ratio : 50;
  tl_timescale.css({width: ( diff * ratio )  + 'px'});

  // Slide the timescale.
  this.slideTo = function(current_left, target_left) {
    var moved = target_left - current_left;
    moved = (moved > 0 ? "+=" : "-=") + Math.abs(moved);
    tl_timescale.animate({
      left: moved 
    });
  }
  this.loadContent = function(){

  }
  this.loadTimescale = function(){

  }

  // Draw scale lines.
  var current_scale = null;
  var scale_year = 0;
  for(var i=0; i<diff; i++){
    scale_year = json.min_date - additional + i;
    current_scale = $('<div class="scale"></div>');
    current_scale.append('<span>' + scale_year + '</span>');
    current_scale.css({left: i*ratio +'px'});
    if( scale_year % 10 === 0){
      current_scale.addClass('scale-decade');
    }
    tl_timescale.append(current_scale);
  }

  // Insert available date points. 
  $.each(json.points, function(i,n){
    var tl_body_container = $('<div class="tl-body-container"></div>');
    var left = ( n.date - json.min_date + additional) * ratio; 

    if ( i === json.focus ) {
      tl_timescale.css({left: (-left+$(that).width()/2) + 'px'});
    }

    var tl_timescale_container = $('<div class="tl-timescale-container"></div>');
    tl_timescale_container.append('<span title="'+ n.title +'">' + n.date + '</span>');
    tl_timescale_container.css({left: left + 'px'});
    tl_timescale.append(tl_timescale_container);

  });

  $(".tl-timescale-container span").tooltip();
  $(".tl-timescale-container span").bind('click', function(){
    var current_left = parseInt(tl_timescale.css('left'));
    var target_left = - (parseInt($(this).parent().css('left')) - $(that).width() / 2);
    that.slideTo(current_left, target_left); 
  });

  // Make timeline draggable.
  tl_timescale.draggable({
    axis:"x",
    stop: function(event, ui){
      var right = $(this).width() - $(that).width() + ui.position.left;
      if( ui.position.left > $(that).width()/2 - additional * ratio){
        $(this).animate({left: "-=" + (ui.position.left - $(that).width()/2 + additional * ratio) }); 
      }else if(right < 0){
        $(this).animate({left: "+=" + (-right)}); 
      }
    }
  }); 

  tl_slider.slider({
    min:0,
    max:diff + additional * 2,
    value: additional, 
    stop: function(event,ui){
      var slider_ratio = ui.value / (diff + additional * 2) ;
      var new_left = slider_ratio * tl_timescale.width() - $(that).width() / 2;
      that.slideTo( parseInt(tl_timescale.css('left')), -new_left);
    }
  });
  // Slider bar represents one widget width ratio.
  //$(".ui-slider .ui-slider-handle").css({width: ($(that).width() * $(that).width() / tl_timescale.width() ) + 'px'});

};

