function drawPub(data) {
// seperate year
    var dataByYear = d3.nest().key(k => k.Time.getFullYear()).sortKeys((a, b) => b - a).entries(data);

    var mainContain = d3.select('#paperPlacement');
    var yearContain_i = mainContain.selectAll('div.pubYear').data(dataByYear, d => d.key);
    yearContain_i.exit().remove();
    var yearContain = yearContain_i
        .enter().append('div').attr('class', 'pubYear');
    yearContain.append('br');
    yearContain.append('b').text(d => d.key);
    yearContain.append('div').attr('class', 'site_content');
    yearContain.append('div').attr('class', 'top_border');
    var publicationArea = mainContain.selectAll('div.pubYear').selectAll('div.publicationArea').data(d => d.values)
        .enter().append('div').attr('class', 'publicationArea')
        .append('table').style('width', '100%').style('margin-left', '20px')
        .append('tr');
    publicationArea.append('th').attr('class', 'paperThumb').attr('width', '15%')
        .append('img').attr('src', d => d.image).attr('width', 200).attr('height', 100);
    publicationArea.append('th').attr('width', '85%')
        .html(d => `<font color="${getColor(d.Code)}">[${d.Id}]</font>
                        <i>${d.Title}</i><br>
                        ${arraytoAuthor(d.Authors)} <br>
                        ${d.Venue}<br>
                        <a href="${d.pubURL}">${d.VenueId}</a> <br>
                        <a href="${d.pdf}"> <img src="images/icons/pdf.png" height="18"></a>
                        <a href="${d.video}"> <img src="images/icons/movie.png" height="19"></a>
                        <a href="${d.github}"> <img src="images/icons/github.png" height="18"></a>
                        <a href="${d.doi}" class="button">DOI</a>
                        <a href="${d.bib}"> <img src="images/icons/bibtex.png" height="13"></a>`);
    function arraytoAuthor(a){
        var lasta = a.pop();
        if (a.length){
            return a.join(', ')+' and '+lasta;
        }
        return lasta;
    }
}
let pubCount = 10;
d3.tsv("data/publication.tsv", function (error,data_) {
    if (error) throw error;

    var minYear = 2017;

    datapub = data_.filter(d => new Date(d.Time).getFullYear() >= minYear);

    // preprocess
    datapub.forEach(d=>{
        d.Time = new Date(d.Time);
        d.Authors = d.Authors.split(',').map(n=>n.trim());
    });
    datapub.sort((a,b)=>b.Time-a.Time);

    drawPub(datapub.filter((d,i)=>i<pubCount));
});