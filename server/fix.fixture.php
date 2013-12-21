<?php
$fix_data = file_get_contents('./fixture.1800-2020.json');
$fix_arr = json_decode($fix_data, true);

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

foreach ($fix_arr as $v) {
    if ($v['timestamp'] >= $time_start && $v['timestamp'] <= $time_end) {
        $data[] = $v;
    }
}

$result = json_encode($data);
header('Content-Type: application/json');
echo $result;
