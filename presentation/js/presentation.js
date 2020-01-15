let dataPresent;
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
            dataPresent = pL;
            pL.forEach(d=>{
                d.avatar = (data.find(e=>e.Id===d.name)||{img:'images/noavatar.jpg'}).img;
            });
            let mainC = d3.select('#presentList');
            let itemL = mainC.select('ul.collection')
                .selectAll('.collection-item')
                .data(pL)
                .enter().append('li')
                .attr('class','collection-item avatar')
                .html(function(d,i){ return `<img src="${d.avatar}" alt="" class="circle">
                <span class="title">${d.name}</span>
                <ul style="list-style-type: circle;margin-left: 20px">${d.contents.map(e=>`<li style="list-style-type: unset;">${e.shortTitle||e.title}</li>`).join('')}
                </ul>
                <a href="#!" class="secondary-content" onClick="playItem(${i})"><i class="material-icons">play_circle_filled</i></a>`});
            playItem(0);
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
function playItem(i){
    d3.select('#presentList').select('ul.collection')
        .selectAll('.collection-item').select('.secondary-content i').classed('dis',true).html('stop');
    d3.select('#presentList').select('ul.collection')
        .selectAll('.collection-item').filter((d,it)=>i===it).select('.secondary-content i').classed('dis',false).html('play_circle_filled');
    let data = dataPresent[i];
    let holder = d3.select('.presentCard')
    holder.select('.avatar img').attr('src',data.avatar);
    holder.select('.name').html(`${data.name} <span class="new badge ${data.tag?'blue':'red'}" data-badge-caption=${data.tag?"MS":"PhD"}></span>`);
    holder.select('.presentContentList').selectAll('li').remove();
    holder.select('.presentContentList').selectAll('li')
        .data(data.contents).enter()
        .append('li')
        .attr('class','presentContentList_item row')
        .html(d=>`<a href="${d.link}" ${d.link==="#!"?target="_blank":''}>
                    <img class="col" src="${d.img}" width="200" height="100">
                    <h5 class="col" style="display: inline-block; max-width: calc(100% - 250px) ">
                            ${d.title}
                    </h5>
                </a>`);
}