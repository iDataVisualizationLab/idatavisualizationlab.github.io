<?php 
$activePage = 'paper.php';
include 'header.php';
 ?>
<?php $thisPage="Paper info"; ?>


<div id="site_content">
    <div id="top_border"></div>
      <div class="content fullPage paperInfo">
         <?php
          $id =  urldecode($_GET["id"]);
                        $counter = 0;
                        $xmls=simplexml_load_file("./xml/publications.xml") or die("Error: Cannot create object");
                        foreach ($xmls as $xml) { 
                          if($counter == $id){
                          echo "<li>" . $xml->paperInfo->asXml() ."</li><br/><br/>";
                          echo '<div class="paperDes">' . $xml->description->asXml() . "</div>";
                          }
                          $counter++;
                        }
          ?>

      </div>
   
      </div> 
    </div>



<?php include 'footer.php'; ?>
  </div>