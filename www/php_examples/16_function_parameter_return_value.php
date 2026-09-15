<?php
// A function that takes a parameter AND returns a value
function calculateSquare($number) {
    return $number * $number; // return sends the result back to the caller
}

$result = calculateSquare(6); // the returned value is stored in $result
echo "6 squared is $result<br>";
?>
