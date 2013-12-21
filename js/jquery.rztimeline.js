/**
 * rzTimeline
 * A jQuery timeline plugin
 * 
 * https://github.com/robin-zhao/rzTimeline
 */

(function ( $, document, window ) {
    var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
        monthShortNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
        $timeline,
        publicMethod;
        
    // ****************
    // HELPER FUNCTIONS
    // ****************
    
    // Month is 1 based
    function daysInMonth(month, year) {
        return new Date(year, month, 0).getDate();
    }

    /**
     * Parses string formatted as YYYY-MM-DD to a Date object.
     * If the supplied string does not match the format, an
     * invalid Date (value NaN) is returned.
     * @param {string} dateStringInRange format YYYY | YYYY-MM | YYYY-MM-DD, with year in
     * range of 0000-9999, inclusive.
     * @return {Date} Date object representing the string.
     */
    function parseISO8601(dateStringInRange) {
        var date = new Date(NaN), 
            month, 
            parts = dateStringInRange.split('-');

        if (parts) {
            if ( typeof (parts[1]) === 'undefined') {
                parts[1] = 1;
            }
            if ( typeof (parts[2]) === 'undefined') {
                parts[2] = 1;
            }

            month = +parts[1];
            date.setFullYear(parts[0], month - 1, parts[2]);
            if (month != date.getMonth() + 1) {
                date.setTime(NaN);
            }
        }
        return date;
    }

    // ****************
    // PUBLIC FUNCTIONS
    // Usage format: $.timeline.scrollToDate('1997-07-01');
    // ****************
    publicMethod = $.fn.timeline = $.timeline = function(options, callback) {
        // Iterate each matched element.
        var $this = $timeline = $(this);
    
        // Extend our default options with those provided.
        // Note that the first argument to extend is an empty
        // object – this is to keep from overriding our "defaults" object.
        var opts = $.extend({}, $.fn.timeline.defaults, options);
        
        // Prepare to redraw.
        $this.empty();
        var that = $this;
        
        // Cache variables.
        $this.screenWidth = opts.width;
        $this.startDate = parseISO8601(opts.startDate);
        $this.endDate = parseISO8601(opts.endDate);
        $this.startDateTime = $this.startDate.getTime();
        $this.endDateTime = $this.endDate.getTime();
        $this.fullWidth = ( $this.endDate - $this.startDate ) / 86400000 * opts.dayWidth;
        $this.screenDays = $this.paddingDays = Math.ceil($this.screenWidth / opts.dayWidth);
        $this.totalStartDateTime = $this.startDateTime - 86400000 * $this.paddingDays;
        $this.totalEndDateTime = $this.endDateTime + 86400000 * $this.paddingDays;
        $this.totalStartDate = new Date($this.totalStartDateTime);
        $this.totalEndDate = new Date($this.totalEndDateTime);
        $this.paddingWidth = $this.paddingDays * opts.dayWidth;
        $this.totalWidth = $this.fullWidth + 2 * $this.paddingWidth;
        
        // Initial screen variables.
        $this.screenStartDate = new Date($this.startDate - $this.screenDays / 2 * 86400000);
        $this.screenStartDateTime = $this.screenStartDate.getTime();
        $this.screenEndDateTime = $this.screenStartDateTime + 86400000 * $this.screenDays;
        $this.screenEndDate = new Date($this.screenEndDateTime);
        
        $this.updateScreenDate = function() {
            var scalePosition = parseInt(tl_timescale.css('left'));
            $this.screenStartDate = $this.calDateFromPixel(-scalePosition);
            $this.screenStartDateTime = $this.screenStartDate.getTime();
            $this.screenEndDateTime = $this.screenStartDateTime + 86400000 * $this.screenDays;
            $this.screenEndDate = new Date($this.screenEndDateTime);
        };
        
        $this.calPixelFromDate = function( date ) {
            return (date - $this.startDate) / 86400000 * opts.dayWidth + $this.paddingWidth;
        };
        
        $this.calDateFromPixel = function( pixel ) {
            return new Date($this.startDate + (pixel - $this.paddingWidth) / opts.dayWidth * 86400000);
        };
        
        $this.calPixelFromDateString = function( dateString ) {
            var date = parseISO8601(dateString);
            return $this.calPixelFromDate(date);
        };

        // Get String Month representation from a point value.
        $this.getMonthFromPoint = function(points) {
            var rtn = parseInt(points % 12);
            return rtn;
        };
        // Get String Month representation from a point value.
        $this.getYearFromPoint = function(points) {
            var rtn = parseInt(points / 12);
            return rtn;
        };

        // Set widget width.
        $this.css({
            width : opts.width + 'px'
        });

        // Add skeleton HTML.
        var container = $('<div class="rztimeline-container"></div>');
        var tl_body = $('<div id="tl-body" class="timeline-box"></div>');

        var btn_prev = $('<div class="btn-prev"></div>');
        var tl_body_container = $('<div class="tl-body-container"></div>');
        var btn_next = $('<div class="btn-next"></div>');
        var msg_box = $('<div class="msg-box"></div>');
        tl_body.append(btn_prev).append(tl_body_container).append(btn_next).append(msg_box);

        var tl_timescale = $('<div id="tl-timescale"></div>');
        $this.timeScale = tl_timescale;
        tl_timescale.css('left', '-' + $this.calPixelFromDate($this.screenStartDate) + 'px');
        var tl_scaleband = $('<div class="tl-scaleband"></div>');
        var tl_timeaxis = $('<div class="tl-timeaxis"></div>');
        tl_timescale.append(tl_scaleband);
        tl_timescale.append(tl_timeaxis);
        var tl_slider = $('<div id="tl-slider"></div>');
        var tl_middle_line = $('<div id="tl-middle-line"></div>');
        $this.append(container);
        container.append(tl_middle_line);
        container.append(tl_body);
        container.append(tl_timescale);
        container.append(tl_slider);

        var ratio = opts.ratio;
        tl_timescale.css({
            width : $this.totalWidth + 'px'
        });

        // Adjust the timescale.
        $this.moveTimeScale = function(target_left) {
            var current_left = parseInt(tl_timescale.css('left'));
            if (isNaN(current_left)) {
                current_left = 0;
            }
            var moved = target_left - current_left;
            moved = (moved > 0 ? "+=" : "-=") + Math.abs(moved);
            tl_timescale.animate({
                left : moved
            });
        };

        // Adjust the slider.
        $this.moveSlider = function(target_left) {
            var slide_ratio = Math.abs(target_left) / tl_timescale.width();
            $("#tl-slider .ui-slider-handle").css({
                left : (slide_ratio * 100) + '%'
            });
        };

        // Load content to top area.
        $this.loadContent = function(dates, redraw) {
            if (redraw) {
                $('.tl-body-content').remove();
            }
            $.each(dates, function(i, n) {
                var key = $('.tl-body-content').length;
                var tl_body_content = $('<div class="tl-body-content" key="' + key + '"></div>');
                tl_body_content.append('<div class="tl-body-content-thumbnail"><img src="' + n.thumbnail + '" /></div>');
                tl_body_content.append('<div class="tl-body-content-right-col"><div class="tl-body-content-date">' + new Date(n.date).toDateString() + '</div>' + '<div class="tl-body-content-title"><a href="' + n.link + '">' + n.title + '</a></div>' + '<div class="tl-body-content-desc">' + n.desc + '</div></div>');
                tl_body_container.append(tl_body_content);
            });
        };

        // Load timepoints to scale.
        $this.loadTimescale = function(dates, redraw) {
            if (redraw) {
                $('.tl-timescale-container').remove();
            }
            $.each(dates, function(i, n) {
                var left = that.calPixelFromDateString(n.date);
                var key = $('.tl-timescale-container').length;
                var timescale_row = key % 3;
                var tl_timescale_container = $('<div rel= "' + n.date + '" class="tl-timescale-container timescale-row-' + timescale_row + '" title="' + n.title + '" key="' + key + '">' + n.date + '</div>');
                tl_timescale_container.append('<span class="" title="' + n.title + '"></span>');
                tl_timescale_container.css({
                    left : left + 'px'
                });
                tl_scaleband.append(tl_timescale_container);
            });
        }; 
        
        // Focus to a scale
        $this.focusScale = function(key) {
            $(".tl-timescale-container").removeClass('current');
            $(".tl-timescale-container[key="+key+"]").addClass('current');
        };
        
        // Focus to a specific time point, provied by key value.
        $this.focusContent = function(key, direction) {
            var max_key = $this.getKeyCount() - 1;
            if (key < 0 || key > max_key) {
                ;
            } else {
                if (key == 0) {
                    btn_prev.fadeOut();
                } else if (key == max_key) {
                    btn_next.fadeOut();
                } else {
                    btn_prev.fadeIn();
                    btn_next.fadeIn();
                }
                var point_left = $('.tl-timescale-container[key="' + key + '"]').css('left');
                var targetDateString = $('.tl-timescale-container[key="' + key + '"]').attr('rel');
                var targetDate = parseISO8601(targetDateString);
                // adjust timescale.
                publicMethod.scrollToDate(targetDate);

                // Show current time point detail in top area.
                if (direction == 'right') {
                    tl_body_container.find('.tl-body-content.current').removeClass('current').animate({
                        'left' : '-100%'
                    }, function() {
                        $(this).hide().css('left', '36px');
                    });
                    tl_body_container.find('.tl-body-content:nth-child(' + (key + 1) + ')').addClass('current').css('left', '100%').show().animate({
                        'left' : '36px'
                    });
                } else if (direction == 'left') {
                    tl_body_container.find('.tl-body-content.current').removeClass('current').animate({
                        'left' : '100%'
                    }, function() {
                        $(this).hide().css('left', '36px');
                    });
                    tl_body_container.find('.tl-body-content:nth-child(' + (key + 1) + ')').addClass('current').css('left', '-100%').show().animate({
                        'left' : '36px'
                    });
                } else {
                    tl_body_container.find('.tl-body-content.current').removeClass('current').fadeOut(300);
                    tl_body_container.find('.tl-body-content:nth-child(' + (key + 1) + ')').addClass('current').fadeIn();
                }
                // adjust slider.
                // that.moveSlider(target_left);
                tl_body_container.attr('ref', key);
            }
        }; 

        // Get which key frame is showing in the detail box.
        $this.getCurrentKey = function() {
            return parseInt(tl_body_container.attr('ref') ? tl_body_container.attr('ref') : 0);
        };

        $this.getKeyCount = function() {
            return $('.tl-timescale-container').length;
        };

        $this.focusNext = function() {
            var current_key = $this.getCurrentKey();
            $this.focusContent(current_key + 1, 'right');
            $this.focusScale(current_key + 1);
        };

        $this.focusPrev = function() {
            var current_key = $this.getCurrentKey();
            $this.focusContent(current_key - 1, 'left');
            $this.focusScale(current_key - 1);
        };

        btn_next.click(function() {
            $this.focusNext();
        });

        btn_prev.click(function() {
            $this.focusPrev();
        }); 
  
        // Draw Time Axis.
        $this.drawTimeAxis = function() {
            var pointDateTime = $this.totalStartDateTime;

            while (pointDateTime <= $this.totalEndDateTime) {
                var pointDate = new Date(pointDateTime);
                pointDate.setDate(1);
                var currentPointDate = pointDate;
                var monthString = monthShortNames[pointDate.getMonth()];
                
                var position = $this.calPixelFromDate(pointDate);
                
                var month_scale = $('<div class="scale scale-month"></div>');
                month_scale.append('<div class="label-month">' + monthString + '</div>');
                month_scale.css({
                    left : position + 'px'
                });
                
                if (pointDate.getMonth() == 0) {
                    month_scale.removeClass('scale-month').addClass('scale-year');
                    label_year = $('<div class="label-year">' + pointDate.getFullYear() + '</div>');
                    month_scale.append(label_year);
                }
                
                // Loop finish, goto next month
                pointDate.setMonth(pointDate.getMonth() + 1);
                pointDateTime = pointDate.getTime();
                
                // Draw date axis (Will be slow if the period is longer than 100 years).
                if (opts.show_date_axis) {
                    var nextMonthPosition = $this.calPixelFromDate(pointDate);
                    
                    var num_of_date_axis_in_one_month = 1;
                    if (opts.dayWidth >= 8) {
                        num_of_date_axis_in_one_month = daysInMonth(currentPointDate.getMonth() + 1, currentPointDate.getFullYear());
                    } else if (opts.dayWidth >= 4) {
                        num_of_date_axis_in_one_month = 10;
                    } else if (opts.dayWidth >= 1) {
                        num_of_date_axis_in_one_month = 4;
                    } else if (opts.dayWidth >= 0.6) {
                        num_of_date_axis_in_one_month = 3;
                    } else if (opts.dayWidth >= 0.1) {
                        num_of_date_axis_in_one_month = 2;
                    } else {
                        num_of_date_axis_in_one_month = 1;
                    }
                    for (var j = 0; j < num_of_date_axis_in_one_month - 1; j++) {
                        var date_scale = $('<div class="scale scale-date"></div>');
                        date_scale.css({
                            left : position + (nextMonthPosition - position) * (j + 1) / num_of_date_axis_in_one_month + 'px'
                        });

                        tl_timeaxis.append(date_scale);
                    }
                }

                tl_timeaxis.append(month_scale);
            }
        };
        
        $this.drawTimeAxis();
  
        var loadedDate = [];

        // Load more time points.
        $this.loadData = function(callback) {
            var fetchBufferDays = $this.screenDays;
            var fetchStartDate = new Date($this.screenStartDate - fetchBufferDays * 86400000);
            var fetchEndDate = new Date($this.screenEndDate + fetchBufferDays * 86400000);
            
            var fetchStartDateString = fetchStartDate.getFullYear() + '-' + (fetchStartDate.getMonth() + 1) + '-' + fetchStartDate.getDate();
            var fetchEndDateString = fetchEndDate.getFullYear() + '-' + (fetchEndDate.getMonth() + 1) + '-' + fetchEndDate.getDate();
            
            $.ajax({
                url : 'server/fixture.php',
                type : 'GET',
                data : {
                    start : fetchStartDateString,
                    end : fetchEndDateString
                    // , sleep:1
                },
                dataType : 'json',
                beforeSend : function() {
                    $('.msg-box').html('Loading...').show();
                }
            }).done(function(data) {
                $('.msg-box').html('').fadeOut();
                var load_data = [];
                $.each(data, function(i, n) {
                    var dateDate = parseISO8601(n.date);
                    if (dateDate >= $this.startDate && dateDate <= $this.endDate) {
                        load_data.push(n);
                    }
                }); 

                that.loadContent(load_data, false);
                that.loadTimescale(load_data, false);
                // Prevent duplicate event. @todo
                that.bindEvents();
                if(typeof(callback) == 'function') {
                    callback();
                }
            }); 

        }; 

        // Bind the events after new timepoints are loaded.
        $this.bindEvents = function() {
            $(".tl-timescale-container").bind('click', function() {
                var key = parseInt($(this).attr('key'));
                $this.focusContent(key);
                $this.focusScale(key);
            });
        }; 
  
        $this.loadData(function(){
            $this.focusContent(0);
            $this.focusScale(0);
        });

        // Make timeline draggable.
        tl_timescale.draggable({
            axis : "x",
            stop : function(event, ui) {
                // var final_left = ui.position.left;
                // var right = $this.width() - $(that).width() + ui.position.left;
                // if (ui.position.left > $(that).width() / 2 - additional * ratio) {
                    // $this.animate({
                        // left : "-=" + (ui.position.left - $(that).width() / 2 + additional * ratio)
                    // });
                // } else if (right < 0) {
                    // $this.animate({
                        // left : "+=" + (-right)
                    // });
                // }
                // that.moveSlider(final_left);
                $this.updateScreenDate();
                that.loadData();
            }
        }); 

        tl_timescale.mousewheel(function(event){
            var new_position = parseInt($(this).css('left')) + event.deltaY * event.deltaFactor / 2;
            if (new_position <= 0 && new_position > (-$this.fullWidth)) {
                $(this).css('left', new_position+'px');
            }
            event.preventDefault();
        });
      
      /*
        tl_slider.slider({
            min:0,
            max:diff + additional * 2,
            value: additional,
            stop: function(event, ui) {
                var slider_ratio = ui.value / (diff + additional * 2);
                var new_left = slider_ratio * tl_timescale.width() - $(that).width() / 2;
                that.moveTimeScale(-new_left);
                that.loadData();
            }
        });
        */
    };
    
    publicMethod.scrollToDate = function(date) {
        var $this = $timeline;
        var targetPosition = $this.calPixelFromDate(date);
        var scalePosition = - (targetPosition - $this.screenWidth / 2);
        
        $this.timeScale.animate({
            left : scalePosition + 'px'
        });
        
        $this.updateScreenDate();
    };
    
    // Plugin defaults
    $.fn.timeline.defaults = {
        width: "600",
        startDate:'1906-01-13',
        endDate:'2001-11-05',
        dayWidth: 2,
        show_date_axis: false
    };
})(jQuery);

