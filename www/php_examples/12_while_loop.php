<?php
// while loop repeats code as long as a condition is true
$tickets = 3;

while ($tickets > 0) {
    echo "Tickets remaining: $tickets<br>";
    $tickets--; // must change the condition variable, or the loop never ends
}
?>
