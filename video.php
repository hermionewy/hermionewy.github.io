<?php
$servername = "fdb14.awardspace.net";
$username = "2213944_wuyan3";
$password = "123456aBC";
$database = "2213944_wuyan3";
$port = "3306";

// Create connection
$conn = mysqli_connect($servername, $username, $password, $database, $port);

// Check connection
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

$sql = "SELECT * FROM videos";
$result = $conn->query($sql);

if ($result->num_rows > 0) {

  // output data of each row: a single player with picture and name

  while($row = $result->fetch_assoc()) {

    // create table structure
    echo "<div class='span6'>";
    echo "<h3>".$row["vName"]. "</h3>";
    echo "<p>" .$row["vDesp"]. " </p>";
    echo " <iframe width='560' height='315' src=' " . $row["vUrl"] . "'frameborder='0' allowfullscreen></iframe>";
    echo "</div>";
    }
    }

  else{
          echo "no rows";
  }
?>
