<?php
// Increment/decrement operators add or subtract 1 from a variable
$count = 5;

echo $count++; // post-increment: shows 5, THEN increases to 6
echo "<br>";
echo $count;   // now 6
echo "<br>";

echo ++$count; // pre-increment: increases to 7 FIRST, then shows 7
echo "<br>";

echo $count--; // post-decrement: shows 7, THEN decreases to 6
echo "<br>";

echo --$count; // pre-decrement: decreases to 5 FIRST, then shows 5
echo "<br>";
?>
