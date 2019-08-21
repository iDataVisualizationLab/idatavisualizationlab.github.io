<?php 
$activePage = 'news.php';
include 'header.php';
 ?>
<?php $thisPage="News"; ?>


<div id="site_content">
    <div id="top_border"></div>
    <?php include 'newsSidebar.php'?>

      <div class="content newsBox">
         <?php
          $id =  urldecode($_GET["id"]);
                        $counter = 0;
                        $xmls=simplexml_load_file("./xml/newsArchive.xml") or die("Error: Cannot create object");
                        foreach ($xmls as $xml) { 
                          if($counter == $id){
                          echo "<h4>" . $xml->headline->asXml() . "</h4>";
                          echo "<h5>" . $xml->date->asXml() . "</h5>";
                          echo "<p>" . $xml->fullNews->asXml() . "</p>";
                          }
                          $counter++;
                        }
          ?>

      </div>
   
      </div> 
    </div>



<?php include 'footer.php'; ?>
  </div>