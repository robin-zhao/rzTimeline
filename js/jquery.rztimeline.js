(function($) {
  $.fn.timeline = function(options) {
    // Extend our default options with those provided.
    // Note that the first argument to extend is an empty
    // object – this is to keep from overriding our "defaults" object.
    var opts = $.extend({}, $.fn.timeline.defaults, options);
    
    var month_names = [ "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December" ];
    
    var month_short_names = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
    
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
    // Get total points calculated by year and month and date part, used to draw scale.
    this.getDatePoints = function(date_string) {
      var parts = date_string.split('-');
      var points = 0;
      points = 12 * parseInt(parts[0]) + parseInt(parts[1]) - 1 + 1 / 30 * (parseInt(parts[2]) - 1);
      return points;
    };
    // Get String Month representation from a point value.
    this.getMonthFromPoint = function(points) {
      var rtn = parseInt(points % 12); 
      return rtn;
    };
    // Get String Month representation from a point value.
    this.getYearFromPoint = function(points) {
      var rtn = parseInt(points / 12);
      return rtn;
    };
  
    // Set width.
    $(this).css({width: opts.width + 'px'});
    // Add skeleton divs.
    var container = $('<div class="rztimeline-container"></div>');
    var tl_body = $('<div id="tl-body" class="timeline-box"></div>');
  
    var btn_prev = $('<div class="btn-prev"></div>');
    var tl_body_container = $('<div class="tl-body-container"></div>');
    var btn_next = $('<div class="btn-next"></div>');
    var msg_box = $('<div class="msg-box"></div>');
    tl_body.append(btn_prev)
           .append(tl_body_container)
           .append(btn_next)
           .append(msg_box);
    
    var tl_timescale = $('<div id="tl-timescale"></div>');
    var tl_scaleband = $('<div class="tl-scaleband"></div>');
    var tl_timeaxis = $('<div class="tl-timeaxis"></div>');
    tl_timescale.append(tl_scaleband);
    tl_timescale.append(tl_timeaxis);
    var tl_slider = $('<div id="tl-slider"></div>');
    var tl_middle_line = $('<div id="tl-middle-line"></div>');
    $(this).append(container);
    container.append(tl_middle_line);
    container.append(tl_body);
    container.append(tl_timescale);
    container.append(tl_slider);
    if (opts.show_roller) {
        var tl_roller = $('<div class="tl-roller"><label class="roller-tip">Travel to: </label></div>');
        var select_decade = $('<select class="select-decade"></select>');
        var select_year = $('<select class="select-year"></select>');
        tl_roller.append(select_decade);
        tl_roller.append(select_year);
        $(this).after(tl_roller);
    }
  
    var min_point = this.getPoints(opts.min_date); 
    var max_point = this.getPoints(opts.max_date);
  
    // Calculate scale ratio.
    var additional = 18; //  months before and after timeline.
    var diff = max_point - min_point + additional * 2; 
    
    var ratio = opts.ratio;
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
    this.loadContent = function(dates, redraw){
      if (redraw) {
        $('.tl-body-content').remove();
      }
      $.each(dates, function(i,n){
        var key = $('.tl-body-content').length;
        var tl_body_content = $('<div class="tl-body-content" key="' + key + '"></div>');
        tl_body_content.append('<div class="tl-body-content-thumbnail"><img src="'+ n.thumbnail +'" /></div>');
        tl_body_content.append('<div class="tl-body-content-right-col"><div class="tl-body-content-date">'+ new Date(n.date).toDateString() +'</div>'
          +'<div class="tl-body-content-title"><a href="' + n.link + '">'+ n.title +'</a></div>'
          +'<div class="tl-body-content-desc">'+ n.desc +'</div></div>');
        tl_body_container.append(tl_body_content);
      });
    };
  
    // Load timepoints to scale.
    this.loadTimescale = function(dates, redraw){
      if (redraw) {
        $('.tl-timescale-container').remove();
      }
      $.each(dates, function(i,n) {
        var left = ( that.getDatePoints(n.date) - min_point + additional) * ratio; 
        var key = $('.tl-timescale-container').length;
        var timescale_row = key % 3;
        var tl_timescale_container = $('<div class="tl-timescale-container timescale-row-' + timescale_row + '" title="'+ n.title +'" key="' + key + '">' + n.date + '</div>');
        tl_timescale_container.append('<span class="" title="'+ n.title +'"></span>');
        tl_timescale_container.css({left: left + 'px'});
        tl_scaleband.append(tl_timescale_container);
      });
    };
    
    // Focus to a scale
    this.focusScale = function(key) {
        $(".tl-timescale-container").removeClass('current');
        $(".tl-timescale-container[key="+key+"]").addClass('current');
    }
  
    // Focus to a specific time point, provied by key value.
    this.focusContent = function(key, direction) {
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
        if (direction == 'right') {
            tl_body_container.find('.tl-body-content.current').removeClass('current').animate({'left': '-100%'}, function(){
                $(this).hide().css('left', '36px');
            }); 
            tl_body_container.find('.tl-body-content:nth-child(' + (key + 1) + ')').addClass('current').css('left', '100%').show().animate({'left': '36px'});
        }
        else if (direction == 'left') {
            tl_body_container.find('.tl-body-content.current').removeClass('current').animate({'left': '100%'}, function(){
                $(this).hide().css('left', '36px');
            }); 
            tl_body_container.find('.tl-body-content:nth-child(' + (key + 1) + ')').addClass('current').css('left', '-100%').show().animate({'left': '36px'});
        }
        else {
            tl_body_container.find('.tl-body-content.current').removeClass('current').fadeOut(300);
            tl_body_container.find('.tl-body-content:nth-child(' + (key + 1) + ')').addClass('current').fadeIn();
        }
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
      this.focusContent(current_key+1, 'right');
      this.focusScale(current_key+1);
    };
    
    this.focusPrev = function() {
      var current_key = this.getCurrentKey();
      this.focusContent(current_key-1, 'left');
      this.focusScale(current_key-1);
    };
    
    btn_next.click(function() {
      that.focusNext();
    });
    
    btn_prev.click(function() {
      that.focusPrev();
    });
  
    // Draw Time Axis.
    this.drawTimeAxis = function() {
        var scale_point = 0;
        // Draw month axis
        for(var i=0; i<diff; i++){
          scale_point = min_point - additional + i;
          var month_scale = $('<div class="scale scale-month"></div>');
          month_scale.append('<div class="label-month">' + month_short_names[this.getMonthFromPoint(scale_point)] + '</div>');
          month_scale.css({left: i*ratio +'px'});
          
          if( scale_point % 12 === 0){
            var year = this.getYearFromPoint(scale_point);
            month_scale.removeClass('scale-month').addClass('scale-year');
            label_year = $('<div class="label-year">'+year+'</div>');
            month_scale.append(label_year);
            
            if(year % 10 == 0 || i == 0) {
                var decade = $('<option value="'+Math.floor(year/10)*10+'">'+Math.floor(year/10)*10+'s</option>')
                select_decade.append(decade);
            }
            select_year.append('<option value="'+year+'">'+year+'</option>');
          }
          tl_timeaxis.append(month_scale);
          
          // Draw date axis (Will be slow if the period is longer than 100 years).
          if (opts.show_date_axis) {
              var num_of_date_axis_in_one_month = 1;
              if (opts.ratio >= 240) {
                  num_of_date_axis_in_one_month = 30;
              }
              if (opts.ratio >= 120) {
                  num_of_date_axis_in_one_month = 10;
              }
              else if (opts.ratio >= 40) {
                  num_of_date_axis_in_one_month = 4;
              }
              else if (opts.ratio >= 20) {
                  num_of_date_axis_in_one_month = 4;
              }
              else if (opts.ratio >= 8) {
                  num_of_date_axis_in_one_month = 2;
              }
              else {
                  num_of_date_axis_in_one_month = 1;
              }
              for (var j = 0; j < num_of_date_axis_in_one_month - 1; j ++) {
                  var date_scale = $('<div class="scale scale-date"></div>');
                  date_scale.css({left: i*ratio+(j+1)*ratio/num_of_date_axis_in_one_month +'px'});
                  
                  tl_timeaxis.append(date_scale);
              }
          }
          
        }
        
        $.mobiscroll.themes['ios'] = {
            rows: 3,
            height: 30,
            showLabel: false
        };
        select_decade.mobiscroll().select({
            theme: 'ios',
            width: 80,
            display: 'inline'
        });
        select_year.mobiscroll().select({
            theme: 'ios',
            width: 80,
            display: 'inline'
        });
    }
    this.drawTimeAxis();
  
    var loaded_year = [];
  
    // Load more time points. 
    this.loadMore = function(left) {
      var screen_year = null;
      if(left === false) {
        screen_year = this.getYearFromPoint(min_point);
        console.log(min_point);
      }else{
        // formula: W / (max -min + 2a ) == (-init_left + w/2) / a
        var init_left = $(that).width() / 2  - additional * tl_timescale.width() / (max_point - min_point + 2 * additional);
        // formula: (-init_left + w/2) / a == (- new_left + w/2) / (new_point - min_point + a)
        var new_point = (-left + $(that).width()/ 2) * additional / (-init_left + $(that).width() / 2) + min_point - additional; 
        screen_year = this.getYearFromPoint(new_point);
      }
      if( -1 !== $.inArray(screen_year, loaded_year) ) {
        return;
      }
   
      $.ajax({
        url: 'server/fixture.php',
        type: 'GET',
        data: { 
            start: screen_year-1+'-01-01'
            , end: (screen_year+2)+'-01-01'
            // , sleep:1 
        },
        dataType: 'json',
        beforeSend: function() {
            $('.msg-box').html('Loading...').show();
        }
      }).done(function(data){
        $('.msg-box').html('').fadeOut();
        var load_data = [];
        $.each(data, function(i, n) {
          var parts = n.date.split('-');
          if( screen_year == parts[0] ) {
            load_data.push(n);
          }
        }); 

        that.loadContent(load_data, false);
        that.loadTimescale(load_data, false);
        // Prevent duplicate event. @todo
        that.bindEvents();
        loaded_year.push(screen_year);
         if( left === false ) {
           that.focusContent(0);
           that.focusScale(0);
         }
      });
      
    };
    // Bind the events after new timepoints are loaded.
    this.bindEvents = function() {
      // $(".tl-timescale-container span").tooltip();
      $(".tl-timescale-container").bind('click', function(){
        var key = parseInt($(this).attr('key')); 
        that.focusContent(key);
        that.focusScale(key);
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
    tl_timescale.mousewheel(function(event){
        var new_position = parseInt($(this).css('left')) + event.deltaY * event.deltaFactor / 2;
        if (new_position < 0 && new_position > (-diff * ratio+opts.width)) {
            $(this).css('left', new_position+'px');
        }
        event.preventDefault();
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
  
    // Plugin defaults
    $.fn.timeline.defaults = {
        width: "600",
        min_date:'1906-01-13',
        max_date:'2001-11-05',
        ratio: 80,
        show_date_axis: false,
        show_roller: false
    };
})(jQuery);

