rzTimeline
==========

A jQuery timeline plugin supporting lazy loading.

Usage:
    $('#your-timeline').rztimeline();


Options:
    source: "server/fix.fixture.php",
    width: "600px", // "90%"
    startDate:'1906-01-13',
    endDate:'2001-11-05',
    dayWidth: 2, // a day's width in pixels
    showDetail: 'always' // always|click|never

Methods:
    $.fn.timeline.resize();
    $.fn.timeline.scrollToDate(obj Date);

Callbacks:
