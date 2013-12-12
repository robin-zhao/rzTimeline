 
$.fn.timeline = function(json){

  // Prepare to redraw.
  $(this).empty();
  var that = this;

  this.getPoints = function(date_string) {
    var parts = date_string.split('-');
    var points = 0;
    points = 12 * parseInt(parts[0]) + parseInt(parts[1]);
    console.log(parseInt(points));
    return points;
  }
  this.getMonth = function(points,display_month) {
    var rtn = parseInt(points / 12);
    if ( display_month) {
     rtn += '-' + parseInt(points % 12); 
    }
    return rtn;
  }

  // Set width.
  $(this).css({width: json.width + 'px'});
  // Add skeleton divs.
  var tl_body = $('<div id="tl-body"></div>');

  var tl_body_arrow_left = $('<div id="arrow-left"></div>');
  var tl_body_container = $('<div id="tl-body-container"></div>');
  var tl_body_arrow_right = $('<div id="arrow-right"></div>');
  tl_body.append(tl_body_arrow_left)
         .append(tl_body_container)
         .append(tl_body_arrow_right);
  
  var tl_timescale = $('<div id="tl-timescale"></div>');
  var tl_slider = $('<div id="tl-slider"></div>');
  var tl_middle_line = $('<div id="tl-middle-line"></div>');
  $(this).append(tl_middle_line);
  $(this).append(tl_body);
  $(this).append(tl_timescale);
  $(this).append(tl_slider);

  var min_point = this.getPoints(json.min_date); 
  var max_point = this.getPoints(json.max_date);

  // Calculate scale ratio.
  var additional = 50; //  months before and after timeline.
  var diff = max_point - min_point + additional * 2; 
  console.info(diff);
  
  var ratio = json.ratio ? json.ratio : 20;
  tl_timescale.css({width: ( diff * ratio )  + 'px'});

  // Slide the timescale.
  this.slideTo = function(current_left, target_left) {
    var moved = target_left - current_left;
    moved = (moved > 0 ? "+=" : "-=") + Math.abs(moved);
    tl_timescale.animate({
      left: moved 
    });
  };
  // Load content to top area.
  this.loadContent = function(dates){
    $.each(dates, function(i,n){

      var key = $('.tl-body-content').length;

      var tl_body_content = $('<div class="tl-body-content" key="' + key + '"></div>');
      tl_body_content.append('<div class="tl-body-content-date">'+ n.date +'</div>');
      tl_body_content.append('<div class="tl-body-content-title">'+ n.title +'</div>');
      tl_body_content.append('<div class="tl-body-content-desc">'+ n.desc +'</div>');
      
      tl_body_container.append(tl_body_content);
    });
  };

  this.focusContent = function() {
    // Show current content at top area.
    
  }

  // Load timepoints to scale.
  this.loadTimescale = function(){

  }

  // Draw scale lines.
  var current_scale = null;
  var scale_point = 0;
  for(var i=0; i<diff; i++){
    scale_point = min_point - additional + i;
    current_scale = $('<div class="scale"></div>');
    current_scale.append('<span>' + this.getMonth(scale_point,false) + '</span>');
    current_scale.css({left: i*ratio +'px'});
    if( scale_point % 12 === 0){
      current_scale.addClass('scale-decade');
    }
    tl_timescale.append(current_scale);
  }

  // Insert available date points. 
  $.each(json.points, function(i,n){

    var tl_body_container = $('<div class="tl-body-container"></div>');
    var left = ( that.getPoints(n.date) - min_point + additional) * ratio; 

    if ( i === json.focus ) {
      tl_timescale.css({left: (-left+$(that).width()/2) + 'px'});
    }

    var key = $('.tl-timescale-container').length;
    var tl_timescale_container = $('<div class="tl-timescale-container" key="' + key + '"></div>');
    tl_timescale_container.append('<span title="'+ n.title +'">' + n.date + '</span>');
    tl_timescale_container.css({left: left + 'px'});
    tl_timescale.append(tl_timescale_container);

  });

  $(".tl-timescale-container span").tooltip();
  $(".tl-timescale-container span").bind('click', function(){
    var current_left = parseInt(tl_timescale.css('left'));
    var target_left = - (parseInt($(this).parent().css('left')) - $(that).width() / 2);
    that.slideTo(current_left, target_left); 

    var key = parseInt($(this).parent().attr('key')) + 1; 
    $('#tl-body-container .tl-body-content').hide(); 
    $('#tl-body-container .tl-body-content:nth-child(' + key + ')').css({'display':'block'});

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

  this.loadContent(json.points);

  // Slider bar represents one widget width ratio.
  //$(".ui-slider .ui-slider-handle").css({width: ($(that).width() * $(that).width() / tl_timescale.width() ) + 'px'});

};

