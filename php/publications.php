<?php 
$activePage = 'publications.php';
include 'header.php'; 
?>


  <div id="site_content">
    <div id="top_border"></div>
    <div class="content fullPage publicationPage">

      <!--  <h4>IN PREPARATION</h4>
       <ul>
       <li>Sonia Baee, Tommy Dang, and Md. Yasin Kabir. Submitting a paper to VAHC 2017 on May 31.</li><br>
            <li>Vinh Nguyen and Tommy Dang. Submitting a paper to GLBIO 2017 on March 13.</li><br> 
        </ul>-->
      <!--<h4>IN SUBMISSION</h4>
        <ul>
          <li>Vinh Nguyen and Tommy Dang. VDS 2017.</li><br>
          <li>Vinh Nguyen and Tommy Dang. VAMrE 2017.</li><br>
          <li>Long Nguyen and Tommy Dang. VAST challenge.</li><br>
          <li>Tommy Dang, Paul Murray, and Angus Forbes. VOILA 2017.</li><br>
        </ul>

          <div class="Border"></div> -->
           <!-- <ul>

                <?php
                        $xmls=simplexml_load_file("./xml/publications.xml") or die("Error: Cannot create object");
                        $i = 0;
                        foreach ($xmls as $xml) { 
                          echo "<li>" . $xml->paperInfo->asXml();
                          // echo "<p>" . $xml->description->asXml() . "</p>";
                          // echo "<p>" . $xml->gitRepo->asXml() . "</p>";
                           echo '<a href="paper.php?id=' .$i.'">' . 'View more</a>' . "</li>";
                           $i++;
                          }
                ?> 
           <ul> -->

          

          

            <?PHP
              function readCSV($csvFile){
                  $file_handle = fopen($csvFile, 'r');
                  while (!feof($file_handle) ) {
                      $line_of_text[] = fgetcsv($file_handle);
                  }
                  fclose($file_handle);
                  return $line_of_text;
              }


              // Set path to CSV file
              $csvFile = './xml/publications.csv';

              $csv = readCSV($csvFile);
              $len1 = count($csv);
              $len2 = count($csv[0]);
          for($i=1;$i<$len1;$i++){
              ?>
              <div class="publicationArea">
              <table style="width:100%; margin-left: 20px;">
              <tr>
                  <th class="paperThumb" width="15%">
                      <?php echo '<img src="' .$csv[$i][11].'"'?> width="200" height="100">
                  </th>
                  <th width="85%" style="padding-left: 25px;"> 
                      <font color="#e78ac3">[<?php echo $csv[$i][0] ?>]</font>
                      <i><?php echo $csv[$i][1] ?></i><br/>
                      <?php echo $csv[$i][2] ?><br/>
                      <?php echo $csv[$i][3] ?>, <?php echo '<a href="' .$csv[$i][5].'">'; echo $csv[$i][4] ?></a>.<br/>
                      <?php echo '<a href="' .$csv[$i][6].'">'?> <img src="images/icons/pdf.png" height="18"></a>
                      <?php echo '<a href="' .$csv[$i][7].'">'?> <img src="images/icons/movie.png" height="19"></a>
                      <?php echo '<a href="' .$csv[$i][8].'">'?> <img src="images/icons/github.png" height="18"></a>
                      <?php echo '<a href="' .$csv[$i][10].'"'?>  class="button">DOI</a>
                      <?php echo '<a href="' .$csv[$i][9].'">'?> <img src="images/icons/bibtex.png" height="13"></a> 
                      
                  </th>
              </tr>
              </table>
              </div>
              <?php                
          }
            ?>  
              <br/>
            <p>For papers before 2017, please visit <a href="http://www.myweb.ttu.edu/tnhondan/publications.html">director's website</a>.</p>        
      </div>
</div>
<?php include 'footer.php'; ?>