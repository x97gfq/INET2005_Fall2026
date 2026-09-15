<?php
// Demonstrating common built-in PHP string functions
$course = "  INET2005 Web Programming  ";

echo strlen($course) . "<br>";           // length of the string (including spaces)
echo trim($course) . "<br>";             // removes whitespace from both ends
echo strtoupper($course) . "<br>";       // converts to UPPERCASE
echo strtolower($course) . "<br>";       // converts to lowercase
echo substr(trim($course), 0, 8) . "<br>"; // extracts a portion of the string (8 chars starting at 0)
echo str_replace("Web", "Cloud", $course) . "<br>"; // replaces text
echo strrev("PHP") . "<br>";             // reverses a string
?>
