<?php
// GET parameters.
$start = $_GET['start']; // Format: 1969-01-01
$end = $_GET['end'];

$sleep = null;
if(isset($_GET['slee'])) {
    $sleep = $_GET['sleep']; // for test loading slow
}
if($sleep) {
    sleep($sleep);    
}

// Generate sample data.
$time_start = strtotime($start);
$time_end = strtotime($end);

if ($time_end < $time_start) {
    exit('What the hell?');
}

$data = array();
$time = $time_start;
while ($time <= $time_end) {
    $data[] = array(
        'timestamp' => $time,
        'date' => date('Y-m-d', $time),
        'title' => 'Lorem Ipsum ' . uniqid(),
        'desc' => 'A very long description here.',
        'thumbnail' => 'http://placehold.it/100x75',
        'thumbnail_small' => 'http://placehold.it/22x22',
        'link' => 'http://google.com',
    );
    
    $time += rand(2, 5) * 3600 * 24;
}
$result = json_encode($data);
header('Content-Type: application/json');
echo $result;

/*****
 * The json looks like:
[
    {
    "timestamp": 543168000,
    "date": "1987-03-20",
    "title": "Lorem Ipsum 52ac218b2d30f",
    "desc": "A very long description here.",
    "thumbnail": "http://placehold.it/100x75",
    "link": "http://google.com"
    },
    {
    "timestamp": 546364800,
    "date": "1987-04-26",
    "title": "Lorem Ipsum 52ac218b2d654",
    "desc": "A very long description here.",
    "thumbnail": "http://placehold.it/100x75",
    "link": "http://google.com"
    },
    {
    "timestamp": 547401600,
    "date": "1987-05-08",
    "title": "Lorem Ipsum 52ac218b2d666",
    "desc": "A very long description here.",
    "thumbnail": "http://placehold.it/100x75",
    "link": "http://google.com"
    },
    {
    "timestamp": 547747200,
    "date": "1987-05-12",
    "title": "Lorem Ipsum 52ac218b2d673",
    "desc": "A very long description here.",
    "thumbnail": "http://placehold.it/100x75",
    "link": "http://google.com"
    },
    {
    "timestamp": 547747200,
    "date": "1987-05-12",
    "title": "Lorem Ipsum 52ac218b2d67f",
    "desc": "A very long description here.",
    "thumbnail": "http://placehold.it/100x75",
    "link": "http://google.com"
    },
    {
    "timestamp": 548179200,
    "date": "1987-05-17",
    "title": "Lorem Ipsum 52ac218b2d68d",
    "desc": "A very long description here.",
    "thumbnail": "http://placehold.it/100x75",
    "link": "http://google.com"
    },
    {
    "timestamp": 548265600,
    "date": "1987-05-18",
    "title": "Lorem Ipsum 52ac218b2d698",
    "desc": "A very long description here.",
    "thumbnail": "http://placehold.it/100x75",
    "link": "http://google.com"
    },
    {
    "timestamp": 550425600,
    "date": "1987-06-12",
    "title": "Lorem Ipsum 52ac218b2d6a4",
    "desc": "A very long description here.",
    "thumbnail": "http://placehold.it/100x75",
    "link": "http://google.com"
    }
]
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */

