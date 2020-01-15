
$(document).ready(function() {
    d3.csv("data/people.csv").then(people_data=>{
        data = people_data.slice();
        data.push({Id:"noavatar",img:"images/noavatar.jpg"})
        imagerange=[2019]
        imagerange.forEach(i=>{
            data.push({Id:`${'Tommy Dang '}${i}`,img:`images/people/Tommy_pics/${i}.png`})
        });
        // initAvatar(data);

        d3.json('presentation/data/presentList.json').then(pL=>{
            let mainC = d3.select('#presentList');
            mainC.select('ul.collection')
                .selectAll('.collection-item')
                .data(pL)
                .enter().append('li')
                .attr('class','collection-item avatar')
                .html(d=>`<img src="${(data.find(e=>e.Id===d.name)||{img:'images/noavatar.jpg'}).img}" alt="" class="circle">
                <span class="title">${d.name}</span>
                <ul style="list-style-type: circle;margin-left: 20px">${d.contents.map(e=>`<li style="list-style-type: unset;">${e.shortTitle||e.title}</li>`).join('')}
                </ul>
                <a href="#!" class="secondary-content"><i class="material-icons">grade</i></a>`)
        })
    });

})

function initAvatar(data) {
    var pattern = svg.selectAll("defs")
        .data(data)
        .enter()
        .append('defs')
        .append("pattern")
        .attr("id", function(d){return "node_avatar" + fixstring(d.Id)})
        .attr("width", 1)
        .attr("height", 1)
        .attr("patternContentUnits", "objectBoundingBox").on('error',function(){console.log(this.src)});
    pattern.append("svg:rect")
        .attr("width", 1)
        .attr("height", 1)
        .attr("fill", "#eee");
    pattern
        .append("svg:image")
        .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
        .attr("xlink:href",function(d){return d.img})
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 1)
        .attr("height", 1)
        .attr("preserveAspectRatio", "xMinYMin slice")
        .on("error", function(){
            setTimeout(()=>{
                let el = d3.select(this);
                el.attr("xlink:href", "images/noavatar.jpg");
                el.on("error", null);
            },100)
        })
}
function fixstring(str){
    return str.toLowerCase().replace(/ /g,'_');
}