(function($) {
  $.fn.timeline = function(json){
  
    // Prepare to redraw.
    $(this).empty();
    var that = this;
  
    // Get total points calculated by year and month part, used to draw scale.
    this.getPoints = function(date_string) {
      var parts = date_string.split('-');
      var points = 0;
      points = 12 * parseInt(parts[0]) + parseInt(parts[1]) - 1;
      return points;
    };
    // Get String Month representation from a point value.
    this.getMonth = function(points,display_month) {
      var rtn = parseInt(points / 12);
      if ( display_month) {
       rtn += '-' + parseInt(points % 12); 
      }
      return rtn;
    };
  
    // Set width.
    $(this).css({width: json.width + 'px'});
    // Add skeleton divs.
    var tl_body = $('<div id="tl-body" class="timeline-box"></div>');
  
    var btn_prev = $('<div class="btn-prev"></div>');
    var tl_body_container = $('<div class="tl-body-container"></div>');
    var btn_next = $('<div class="btn-next"></div>');
    tl_body.append(btn_prev)
           .append(tl_body_container)
           .append(btn_next);
    
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
    var additional = 30; //  months before and after timeline.
    var diff = max_point - min_point + additional * 2; 
    
    var ratio = json.ratio ? json.ratio : 40;
    tl_timescale.css({width: ( diff * ratio )  + 'px'});
  
    // Adjust the timescale.
    this.moveTimeScale = function(target_left) {
      var current_left = parseInt(tl_timescale.css('left'));
      if(isNaN(current_left)) {
        current_left = 0;
      }
      var moved = target_left - current_left;
      moved = (moved > 0 ? "+=" : "-=") + Math.abs(moved);
      tl_timescale.animate({
        left: moved 
      });
    };
  
    // Adjust the slider.
    this.moveSlider = function(target_left) {
      var slide_ratio = Math.abs(target_left) / tl_timescale.width();
      $("#tl-slider .ui-slider-handle").css({left: (slide_ratio * 100) + '%'}); 
    };
  
    // Load content to top area.
    this.loadContent = function(dates){
      $.each(dates, function(i,n){
        var key = $('.tl-body-content').length;
        var tl_body_content = $('<div class="tl-body-content" key="' + key + '"></div>');
        tl_body_content.append('<div class="tl-body-content-thumbnail"><img src="'+ n.thumbnail +'" /></div>');
        tl_body_content.append('<div class="tl-body-content-right-col"><div class="tl-body-content-date">'+ n.date +'</div>'
          +'<div class="tl-body-content-title"><a href="' + n.link + '">'+ n.title +'</a></div>'
          +'<div class="tl-body-content-desc">'+ n.desc +'</div></div>');
        tl_body_container.append(tl_body_content);
      });
    };
  
    // Load timepoints to scale.
    this.loadTimescale = function(dates){
      $.each(dates, function(i,n) {
        var left = ( that.getPoints(n.date) - min_point + additional) * ratio; 
        var key = $('.tl-timescale-container').length;
        var tl_timescale_container = $('<div class="tl-timescale-container" key="' + key + '"></div>');
        tl_timescale_container.append('<span title="'+ n.title +'">' + n.date + '</span>');
        tl_timescale_container.css({left: left + 'px'});
        tl_timescale.append(tl_timescale_container);
      });
    };
  
    // Focus to a specific time point, provied by key value.
    this.focusContent = function(key) {
      var max_key = this.getKeyCount()-1;
      if (key < 0 || key > max_key) {
        ;
      }
      else {
        if (key == 0) {
          btn_prev.fadeOut();
        }
        else if (key == max_key) {
          btn_next.fadeOut();
        }
        else {
          btn_prev.fadeIn();
          btn_next.fadeIn();
        }
        var point_left = $('.tl-timescale-container[key="' + key + '"]').css('left');
        var target_left = - (parseInt(point_left) - $(that).width() / 2);
        // adjust timescale.
        that.moveTimeScale(target_left); 
    
        // Show current time point detail in top area.
        tl_body_container.find('.tl-body-content').hide(); 
        tl_body_container.find('.tl-body-content:nth-child(' + (key + 1) + ')').show();
        // adjust slider.
        that.moveSlider(target_left);
        tl_body_container.attr('ref', key);
      }
    };
    
    // Get which key frame is showing in the detail box.
    this.getCurrentKey = function() {
      return parseInt(tl_body_container.attr('ref') ? tl_body_container.attr('ref') : 0);
    };
    
    this.getKeyCount = function() {
      return $('.tl-timescale-container').length;
    };
    
    this.focusNext = function() {
      var current_key = this.getCurrentKey();
      this.focusContent(current_key+1);
    };
    
    this.focusPrev = function() {
      var current_key = this.getCurrentKey();
      this.focusContent(current_key-1);
    };
    
    btn_next.click(function() {
      that.focusNext();
    });
    
    btn_prev.click(function() {
      that.focusPrev();
    });
  
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
  
  
    var loaded_year = [];
  
    // Load more time points. 
    this.loadMore = function(left) {
      var screen_year = null;
      if(left === false) {
        screen_year = this.getMonth(min_point, false);
        console.log(min_point);
      }else{
        // formula: W / (max -min + 2a ) == (-init_left + w/2) / a
        var init_left = $(that).width() / 2  - additional * tl_timescale.width() / (max_point - min_point + 2 * additional);
        // formula: (-init_left + w/2) / a == (- new_left + w/2) / (new_point - min_point + a)
        var new_point = (-left + $(that).width()/ 2) * additional / (-init_left + $(that).width() / 2) + min_point - additional; 
        screen_year = this.getMonth(new_point, false);
      }
      if( -1 !== $.inArray(screen_year, loaded_year) ) {
        return;
      }
   
      $.ajax({
        url: 'fixture.json',
        type: 'POST',
        data: { date: screen_year },
        dataType: 'json'
      }).done(function(data){
        var load_data = [];
        $.each(data, function(i, n) {
          var parts = n.date.split('-');
          if( screen_year == parts[0] ) {
            load_data.push(n);
          }
        }); 

        that.loadContent(load_data);
        that.loadTimescale(load_data);
        // Prevent duplicate event. @todo
        that.bindEvents();
        loaded_year.push(screen_year);
         if( left === false ) {
           that.focusContent(0);
         }
      });
      
    };
    // Bind the events after new timepoints are loaded.
    this.bindEvents = function() {
      $(".tl-timescale-container span").tooltip();
      $(".tl-timescale-container span").bind('click', function(){
        var key = parseInt($(this).parent().attr('key')); 
        that.focusContent(key);
      });
    };
  
    this.loadMore(false);
  
    // Make timeline draggable.
    tl_timescale.draggable({
      axis:"x",
      stop: function(event, ui){
        var final_left = ui.position.left;
        var right = $(this).width() - $(that).width() + ui.position.left;
        if( ui.position.left > $(that).width()/2 - additional * ratio){
          $(this).animate({left: "-=" + (ui.position.left - $(that).width()/2 + additional * ratio) }); 
        }else if(right < 0){
          $(this).animate({left: "+=" + (-right)}); 
        }
        that.moveSlider(final_left);
        that.loadMore(final_left);
      }
    }); 
  
    tl_slider.slider({
      min:0,
      max:diff + additional * 2,
      value: additional, 
      stop: function(event,ui){
        var slider_ratio = ui.value / (diff + additional * 2) ;
        var new_left = slider_ratio * tl_timescale.width() - $(that).width() / 2;
        that.moveTimeScale( -new_left);
        that.loadMore(-new_left);
      }
    });
  
  
    // Slider bar represents one widget width ratio.
    //$(".ui-slider .ui-slider-handle").css({width: ($(that).width() * $(that).width() / tl_timescale.width() ) + 'px'});
  
  };
})(jQuery);

