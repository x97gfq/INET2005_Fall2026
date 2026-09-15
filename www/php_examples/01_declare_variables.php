<?php
// Declaring variables in PHP - no data type needed, just start with $
$studentName = "Alex";      // string
$age = 20;                  // integer
$gpa = 3.75;                 // float (decimal number)
$isFullTime = true;          // boolean (true/false)

// Output the variables
echo "Name: $studentName<br>";
echo "Age: $age<br>";
echo "GPA: $gpa<br>";
echo "Full Time: " . ($isFullTime ? "Yes" : "No") . "<br>";
?>
