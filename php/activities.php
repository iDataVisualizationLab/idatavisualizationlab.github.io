 <?php
$activePage = 'activities.php';
include 'header.php';
?>

<div id="site_content">
    <div id="top_border"></div>
      <div class="content fullPage">
        <div id="activities">
 

             
          <div class="activityList">
              <ul>
                  <?php
                        $xmls=simplexml_load_file("./xml/activities.xml") or die("Error: Cannot create object");
                        $i=0;
                        $count = count($xmls);
                        foreach ($xmls as $xml) { ?>              
                          <?php 
                          echo "<h4>" . $xml->date->asXml() . "</h4>";
                          if($xml->vinh != "")
                          echo "<li>" . $xml->vinh->asXml() . "</li>";
                          if($xml->long != "")
                          echo "<li>" . $xml->long->asXml() . "</li>";
                          if($xml->yasin != "")
                          echo "<li>" . $xml->yasin->asXml() . "</li>";
                          if($xml->amit != "")
                          echo "<li>" . $xml->amit->asXml() . "</li>";
                          if($xml->work5 != "")
                          echo "<li>" . $xml->work5->asXml() . "</li>";
                          if($xml->work5 != "")
                          echo "<li>" . $xml->work6->asXml() . "</li>";
                          $i++;
                         if($i<$count) {?>
                        <div class="activityBorder top_border"></div>
                  <?php } } ?>
              </ul>
          </div>
        </div>
      </div>
    </div>
<?php include 'footer.php'; ?>