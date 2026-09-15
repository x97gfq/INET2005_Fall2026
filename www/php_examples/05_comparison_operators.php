<?php
// Comparison operators compare two values and return true or false
$x = 5;
$y = "5";

var_dump($x == $y);   // true  - equal value
var_dump($x === $y);  // false - equal value AND same type
var_dump($x != $y);   // false - not equal value
var_dump($x !== $y);  // true  - not equal value or not same type
var_dump($x > 3);     // true  - greater than
var_dump($x < 3);     // false - less than
var_dump($x >= 5);    // true  - greater than or equal to
?>
