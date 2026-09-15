<?php
// Array operators combine or compare arrays
$array1 = ["a" => "apple", "b" => "banana"];
$array2 = ["b" => "blueberry", "c" => "cherry"];

$union = $array1 + $array2; // + keeps keys from the FIRST array when duplicates exist
print_r($union);
echo "<br>";

var_dump($array1 == $array2);  // true if same key/value pairs (order doesn't matter)
var_dump($array1 === $array2); // true if same key/value pairs in the SAME order and type
?>
