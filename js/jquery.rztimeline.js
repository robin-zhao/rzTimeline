/**
 * rzTimeline
 * A jQuery timeline plugin
 * 
 * https://github.com/robin-zhao/rzTimeline
 */

(function ( $, document, window ) {
    var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
        monthShortNames = [ "Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec" ],
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
        
        $this.opts = opts;
        
        // Prepare to redraw.
        $this.empty();
        var that = $this;
        
        $this.data = [];
        
        // Set widget width.
        $this.css({
            width : opts.width
        });
        
        // Cache variables.
        $this.screenWidth = $this.width();
        $this.startDate = parseISO8601(opts.startDate);
        $this.endDate = parseISO8601(opts.endDate);
        $this.startDateTime = $this.startDate.getTime();
        $this.endDateTime = $this.endDate.getTime();
        $this.fullWidth = ( $this.endDate - $this.startDate ) / 86400000 * opts.dayWidth;
        $this.screenDays = Math.ceil($this.screenWidth / opts.dayWidth / 2) * 2;
        $this.paddingDays = 2 * $this.screenDays;
        if (opts.dayWidth > 10) {
            $this.paddingDays = 2 * $this.screenDays;
        }
        $this.totalStartDateTime = $this.startDateTime - 86400000 * $this.paddingDays;
        $this.totalEndDateTime = $this.endDateTime + 86400000 * $this.paddingDays;
        $this.totalStartDate = new Date($this.totalStartDateTime);
        $this.totalEndDate = new Date($this.totalEndDateTime);
        $this.paddingWidth = $this.paddingDays * opts.dayWidth;
        $this.totalWidth = $this.fullWidth + 2 * $this.paddingWidth;
        
        // Initial screen variables.
        $this.screenStartDate = new Date($this.startDate.getTime() - $this.screenDays / 2 * 86400000);
        $this.screenStartDateTime = $this.screenStartDate.getTime();
        $this.screenEndDateTime = $this.screenStartDateTime + 86400000 * $this.screenDays;
        $this.screenEndDate = new Date($this.screenEndDateTime);
        
        $this.updateScreenDate = function() {
            var scalePosition = parseInt(tl_timescale.css('left'));
            $this.screenStartDate = $this.calDateFromPixel(-scalePosition);
            $this.screenStartDate.setHours(0, 0, 0, 0);
            $this.screenStartDateTime = $this.screenStartDate.getTime();
            $this.screenEndDateTime = $this.screenStartDateTime + 86400000 * $this.screenDays;
            $this.screenEndDate = new Date($this.screenEndDateTime);
        };
        
        $this.calPixelFromDate = function( date ) {
            return (date - $this.startDate) / 86400000 * opts.dayWidth + $this.paddingWidth;
        };
        
        $this.calDateFromPixel = function( pixel ) {
            return new Date($this.startDate.getTime() + (pixel - $this.paddingWidth) / opts.dayWidth * 86400000);
        };
        
        $this.calPixelFromDateString = function( dateString ) {
            var date = parseISO8601(dateString);
            return $this.calPixelFromDate(date);
        };

        // Add skeleton HTML.
        var container = $('<div class="rztimeline-container"></div>');
        var tl_middle_line = $('<div id="tl-middle-line"></div>');
        var tlIndicator = $('<div class="tl-indicator"></div>');
        var tl_body = $('<div id="tl-body" class="timeline-box"></div>');
        var tlScaleBox = $('<div class="tl-scalebox"></div>');

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
        
        // Slider
        var tlFooter = $('<div class="tl-footer"></div>');
            tlSliderFlagLabel = $('<div class="tl-sliderflaglabel"></div>');
            tlSlider = $('<div class="tl-slider"></div>');
            tlSliderTicks = $('<div class="tl-sliderticks"></div>');
        tlFooter.append(tlSlider);
        tlFooter.append(tlSliderTicks);
        
        container.append(tl_body);
        tlScaleBox.append(tl_middle_line);
        tlScaleBox.append(tlIndicator);
        tlScaleBox.append(tl_timescale);
        container.append(tlScaleBox);
        container.append(tlFooter);
        $this.append(container);
        
        if (opts.showDetail != 'always') {
            tl_body.hide();
        }

        tl_timescale.css({
            width : $this.totalWidth + 'px'
        });

        $this.updateSliderPosition = function() {
            var targetDate = new Date($this.screenStartDateTime + $this.screenDays * 86400000 / 2);
            var targetYear = parseInt(targetDate.getFullYear());
            tlSlider.slider('value', targetYear);
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
                var tl_timescale_container = $('<div rel= "' + n.date + '" class="tl-timescale-container timescale-row-' + timescale_row + '" title="' + n.title + '" key="' + key + '"></div>');
                var content = n.title + ', ' + monthNames[parseISO8601(n.date).getMonth()] + ' ' + parseISO8601(n.date).getDate() + ', ' + parseISO8601(n.date).getFullYear();
                
                var flag = $('<div class="flag"></div>');
                flag.append('<div class="scale-thumbnail"><img src="' + n.thumbnail_small + '" /></div>');
                flag.append('<div class="scale-content" title="' + n.title + '">' + content + '</div>');
                tl_timescale_container.append(flag);
                tl_timescale_container.append('<div class="line"></div>');
                tl_timescale_container.append('<div class="dot"></div>');
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
                    // btn_prev.fadeOut();
                    $this.loadData(true);
                } else if (key == max_key) {
                    // btn_next.fadeOut();
                    $this.loadData(true);
                } else {
                    btn_prev.fadeIn();
                    btn_next.fadeIn();
                }
                var point_left = $('.tl-timescale-container[key="' + key + '"]').css('left');
                var targetDateString = $('.tl-timescale-container[key="' + key + '"]').attr('rel');
                var targetDate = parseISO8601(targetDateString);
                // adjust timescale.
                publicMethod.scrollToDate(targetDate, false, function(){
                    $this.updateSliderPosition();
                });

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
            // var pointDateTime = $this.totalStartDateTime;
            var pointDateTime = $this.screenStartDateTime - 86400000 * $this.paddingDays;
            tl_timeaxis.html('');

            // while (pointDateTime <= $this.totalEndDateTime) {
            while (pointDateTime <= ($this.screenEndDateTime + 86400000 * $this.paddingDays)) {
                var pointDate = new Date(pointDateTime);
                // pointDate.setDate(1);
                var currentPointDate = pointDate;
                var monthString = monthShortNames[pointDate.getMonth()];
                var dateString = pointDate.getDate();
                
                var position = $this.calPixelFromDate(pointDate);
                
                var dateScale = $('<div class="scale scale-date"></div>');
                dateScale.css({
                    left : position + 'px'
                });
                
                var labelDays = 4;
                if (opts.dayWidth >= 20) {
                    labelDays = 4;
                } else if (opts.dayWidth >= 10) {
                    labelDays = 8;
                } else {
                    labelDays = 15;
                }
                
                if ( ((pointDateTime - $this.totalStartDateTime) / 86400000) % labelDays == 0) {
                	dateScale.removeClass('scale-date').addClass('scale-date-with-label');
	                dateScale.append('<div class="label-date">' + monthString + '. ' + dateString + '</div>');
                }
                
                if(pointDate.getDate() == 1) {
                	dateScale.find('.label-date').remove();
	                dateScale.removeClass('scale-date').addClass('scale-month').append('<div class="label-month">' + monthString.toUpperCase() + '. ' + pointDate.getFullYear() + '</div>');
                }
                
                // Loop finish, goto next month
                pointDate.setDate(pointDate.getDate() + 1);
                pointDateTime = pointDate.getTime();
                
                var nextDayPosition = $this.calPixelFromDate(pointDate);
                
                var dayBlocks = 1;
                if (opts.dayWidth >= 20) {
                    dayBlocks = 4;
                } else if (opts.dayWidth >= 10) {
                    dayBlocks = 2;
                } else {
                    dayBlocks = 1;
                }
                for (var j = 0; j < dayBlocks - 1; j++) {
                    var dateBlockScale = $('<div class="scale scale-date-block"></div>');
                    dateBlockScale.css({
                        left : position + (nextDayPosition - position) * (j + 1) / dayBlocks + 'px'
                    });

                    tl_timeaxis.append(dateBlockScale);
                }

                tl_timeaxis.append(dateScale);
            }
        };
        
        $this.drawTimeAxis();
  
        var loadedDate = [];
        var loadedPeriod = [];

        // Load more time points.
        $this.loadData = function(force, callback) {
            var fetchBufferDays = $this.paddingDays;
            var fetchStartDate = new Date($this.screenStartDateTime - fetchBufferDays * 86400000);
            var fetchEndDate = new Date($this.screenEndDateTime + fetchBufferDays * 86400000);
            
            var fetchStartDateString = fetchStartDate.getFullYear() + '-' + (fetchStartDate.getMonth() + 1) + '-' + fetchStartDate.getDate();
            var fetchEndDateString = fetchEndDate.getFullYear() + '-' + (fetchEndDate.getMonth() + 1) + '-' + fetchEndDate.getDate();
            
            $this.drawTimeAxis();
            
            if (!force) {
                for (x in loadedPeriod) {
                    if ($this.screenStartDateTime >= loadedPeriod[x].start && $this.screenEndDateTime <= loadedPeriod[x].end) {
                        return;
                    }
                }
            }
            
            $.ajax({
                url : 'server/fix.fixture.php',
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
                loadedPeriod.push({'start': fetchStartDate.getTime(), 'end': fetchEndDate.getTime()});
                
                $('.msg-box').html('').fadeOut();
                var newData = [];
                $.each(data, function(i, n) {
                    if( -1 !== $.inArray(n.date, loadedDate) ) {
                        return;
                    }
                    var dateDate = parseISO8601(n.date);
                    if (dateDate >= $this.startDate && dateDate <= $this.endDate) {
                        newData.push(n);
                        loadedDate.push(n.date);
                    }
                });
                
                that.data = $.merge(that.data, newData);
                
                that.loadContent(newData, false);
                that.loadTimescale(newData, false);
                that.bindEvents();
                if(typeof(callback) == 'function') {
                    callback();
                }
            }); 

        }; 

        // Bind the events after new timepoints are loaded.
        $this.bindEvents = function() {
            $(".tl-timescale-container").unbind('click').bind('click', function() {
                var key = parseInt($(this).attr('key'));
                $this.focusContent(key);
                $this.focusScale(key);
                if (opts.showDetail == 'click') {
	                tl_body.slideDown();
                }
            });
        }; 
  
        $this.loadData(false, function(){
            $this.focusContent(0);
            $this.focusScale(0);
        });

        // Make timeline draggable.
        tl_timescale.draggable({
            axis : "x",
            stop : function(event, ui) {
            	if ($this.screenStartDateTime < ( $this.startDateTime) - $this.screenDays / 2 * 86400000 ) {
            		publicMethod.scrollToDate($this.startDate);
            		return;
            	}
            	if ($this.screenEndDateTime > ( $this.endDateTime) + $this.screenDays / 2 * 86400000 ) {
            		publicMethod.scrollToDate($this.endDate);
            		return;
            	}
            	
                $this.updateScreenDate();
                $this.updateSliderPosition();
                that.loadData();
            },
            drag: function() {
                $this.updateScreenDate();
                $this.updateSliderPosition();
            }
        }); 

        tl_timescale.mousewheel(function(event){
        	var startPosition = parseInt($(this).css('left'));
        	var endPosition = startPosition + $this.screenWidth;
        	
            var new_position = parseInt($(this).css('left')) + event.deltaY * event.deltaFactor;
            
            if ((startPosition - $this.screenWidth / 2) <= -$this.calPixelFromDate($this.startDate) && (startPosition - $this.screenWidth / 2) >= -$this.calPixelFromDate($this.endDate)) {
            	
            	if ((new_position - $this.screenWidth / 2) > -$this.calPixelFromDate($this.startDate)) {
	            	new_position = $this.screenWidth / 2 - $this.calPixelFromDate($this.startDate);
	            }
	            
            	if ((new_position - $this.screenWidth / 2) < -$this.calPixelFromDate($this.endDate)) {
	            	new_position = $this.screenWidth / 2 - $this.calPixelFromDate($this.endDate);
	            }
	            
                $(this).css('left', new_position+'px');
            }
            
            $this.updateScreenDate();
            $this.updateSliderPosition();
            $this.loadData();
            event.preventDefault();
        });
      
        tlSliderFlagLabel.html($this.startDate.getFullYear());
        
        tlSlider.slider({
            min: $this.startDate.getFullYear(),
            max: $this.endDate.getFullYear(),
            value: $this.startDate.getFullYear(),
            step: 1,
            slide: function(event, ui) {
                var year = ui.value.toString();
                var targetDate = parseISO8601(year);
                publicMethod.scrollToDate(targetDate, true);
                tlSliderFlagLabel.html(ui.value);
            },
            stop: function(event, ui) {
                that.loadData();
            },
            change: function(event, ui) {
                tlSliderFlagLabel.html(ui.value);
            }
        });
        
        tlSlider.find('.ui-slider-handle').append(tlSliderFlagLabel);
    };
    
    publicMethod.resize = function() {
    	var $this = $timeline;
    	// Cache variables.
        $this.screenWidth = $this.width();
        $this.screenDays = Math.ceil($this.screenWidth / $this.opts.dayWidth / 2) * 2;
        $this.paddingDays = $this.screenDays;
        if ($this.opts.dayWidth > 10) {
            $this.paddingDays = 2 * $this.screenDays;
        }
        $this.totalStartDateTime = $this.startDateTime - 86400000 * $this.paddingDays;
        $this.totalEndDateTime = $this.endDateTime + 86400000 * $this.paddingDays;
        $this.totalStartDate = new Date($this.totalStartDateTime);
        $this.totalEndDate = new Date($this.totalEndDateTime);
        $this.paddingWidth = $this.paddingDays * $this.opts.dayWidth;
        $this.totalWidth = $this.fullWidth + 2 * $this.paddingWidth;
        
        $this.updateScreenDate();
        
        $this.loadContent($this.data, true);
        $this.loadTimescale($this.data, true);
        
        $this.bindEvents();
    };
    
    publicMethod.scrollToDate = function(date, noAnimate, callback) {
        var $this = $timeline;
        var targetPosition = $this.calPixelFromDate(date);
        var scalePosition = - (targetPosition - $this.screenWidth / 2);
        
        if (noAnimate) {
            $this.timeScale.css({
                left : scalePosition + 'px'
            });
            
            $this.updateScreenDate();
            if (typeof(callback) == 'function') {
                callback();
            }
            $this.drawTimeAxis();
        }
        else {
            $this.timeScale.animate({
                left : scalePosition + 'px'
            }, function() {
                $this.updateScreenDate();
                if (typeof(callback) == 'function') {
                    callback();
                }
                $this.drawTimeAxis();
            });
        }
        
    };
    
    // Plugin defaults
    $.fn.timeline.defaults = {
        source: "server/fix.fixture.php",
        width: "600",
        startDate:'1906-01-13',
        endDate:'2001-11-05',
        dayWidth: 2,
        showDetail: 'always' // always|click|never
    };
})(jQuery);

