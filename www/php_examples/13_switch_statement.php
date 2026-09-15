<?php
// switch compares one value against several possible cases
$dayNumber = 3;

switch ($dayNumber) {
    case 1:
        echo "Monday";
        break; // break stops it from falling into the next case
    case 2:
        echo "Tuesday";
        break;
    case 3:
        echo "Wednesday";
        break;
    default:
        echo "Another day"; // runs if no case matches
}
?>
