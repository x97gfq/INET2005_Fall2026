<?php
// Logical operators combine multiple true/false conditions
$age = 20;
$hasID = true;

var_dump($age >= 19 && $hasID);  // AND - true only if BOTH are true
var_dump($age >= 19 || $hasID);  // OR  - true if AT LEAST ONE is true
var_dump(!$hasID);               // NOT - reverses true/false
?>
