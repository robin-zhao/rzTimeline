<?php
// GET parameters.
$start = $_GET['start']; // Format: 1969-01-01
$end = $_GET['end'];

// Generate sample data.
$time_start = strtotime($start);
$time_end = strtotime($end);

if ($time_end < $time_start) {
    exit('What the hell?');
}

$data = array();
$time = $time_start;
while ($time <= $time_end) {
    // @NOTE: Use the date as a key to identify whether data for one day is loaded or not.
    // @NOTE: Use an array for each date to support multiple events in the same day.
    $data[$time][] = array(
        'date' => date('Y-m-d', $time),
        'title' => 'Lorem Ipsum ' . uniqid(),
        'desc' => 'A very long description here.',
        'thumbnail' => 'http://placehold.it/100x75',
        'link' => 'http://google.com',
    );
    
    $time += rand(0, 40) * 3600 * 24;
}
$result = json_encode($data);
header('Content-Type: application/json');
echo $result;

/*****
 * The json looks like:
{
    "543168000": [
        {
        "date": "1987-03-20",
        "title": "Lorem Ipsum 52ac116e1297f",
        "desc": "A very long description here.",
        "thumbnail": "http://placehold.it/100x75",
        "link": "http://google.com"
        }
    ],
    "546019200": [
        {
        "date": "1987-04-22",
        "title": "Lorem Ipsum 52ac116e12994",
        "desc": "A very long description here.",
        "thumbnail": "http://placehold.it/100x75",
        "link": "http://google.com"
        },
        {
        "date": "1987-04-22",
        "title": "Lorem Ipsum 52ac116e129a2",
        "desc": "A very long description here.",
        "thumbnail": "http://placehold.it/100x75",
        "link": "http://google.com"
        }
    ],
    "547833600": [
        {
        "date": "1987-05-13",
        "title": "Lorem Ipsum 52ac116e129ae",
        "desc": "A very long description here.",
        "thumbnail": "http://placehold.it/100x75",
        "link": "http://google.com"
        }
    ],
    "548265600": [
        {
        "date": "1987-05-18",
        "title": "Lorem Ipsum 52ac116e129bb",
        "desc": "A very long description here.",
        "thumbnail": "http://placehold.it/100x75",
        "link": "http://google.com"
        }
    ]
}
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */

