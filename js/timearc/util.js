var diameter = 1000,
    radius = diameter / 2,
    innerRadius = radius - 120;

// var cList = ["Multiple publications","Workshop","Short paper","Conference","Journal","Award"]
var cList = ["Workshop","Short paper","Conference","Journal","Award"]
// var typeList = ["O","W","S","C","J","A"];
var typeList = ["W","S","C","J","A"];
var positions = [{role:"Msc program", yearStart:0, years: 2, color: "#0ff", opacity: 0.1},
    {role:"PhD program", yearStart:2, years: 4, color: "#0f0", opacity: 0.1},
    {role:"Post-doc", yearStart:6, years: 2, color: "#ff0", opacity: 0.1},
    {role:"Assitant Professor", yearStart:8, years: 5, color: "#f00", opacity: 0.1},];
function drawColorLegend() {
  var x1 = xStep;
  var y1 = 10;
  var yStep = 15;

  svg.selectAll(".arcLegend").data(typeList).enter()
    .append("line")
      .attr("class", "arcLegend")
      .attr("x1", function(l,i){
        return x1;
      })
      .attr("y1", function(l,i){
        return y1+yStep*i;
      })
      .attr("x2", function(l,i){
        return x1+12;
      })
      .attr("y2", function(l,i){
        return y1+yStep*i;
      })
      .style("stroke-width", function (d) {
        if (d=="O")
          return 2;
        else  
          return 1;
      }) 
      .style("stroke-opacity", 1)   
      .style("stroke", function (d) {
        return getColor(d);
      }); 

   svg.selectAll(".textLegend").data(typeList).enter()
    .append("text")
      .attr("class", "textLegend")
      .attr("x", function(l,i){
        return x1+15;
      })
      .attr("y", function(l,i){
        return y1+yStep*i+5;
      })
      .text(function (d,i) {
        return cList[i];
      })
      .attr("font-family", "sans-serif")
      .attr("font-size", "13px")
      .style("text-anchor", "left")
      //.style("font-weight", "bold")
      .style("fill-opacity", 1)   
      .style("fill", function (d) {
        return getColor(d);
      });
}

function drawBackground(){
    svg.selectAll(".rectBackground")
        .data(positions).enter()
        .append("rect")
        .attr("class", "rectBackground")
        .attr("x", function(d,i){
            var xx = xStep+xScale((d.yearStart));
            return xx;
        })
        .attr("y", function(l,i){
            return 0;
        })
        .attr("width", function(d){
            return wBin*d.years;
        })
        .attr("height", function(l,i){
            return height;
        })
        .style("stroke-width", 1)
        .style("stroke-opacity", 1)
        .style("fill", function (d) {
            return d.color;
        })
        .style("fill-opacity", 0);

    svg.selectAll(".textBackground")
        .data(positions).enter()
        .append("text")
        .attr("class", "textBackground")
        .attr("x", function(d,i){
            var xx = xStep+xScale((d.yearStart));
            return xx + wBin/2*d.years;
        })
        .attr("y", function(l,i){
            return height-30;
        })
        .style("fill", function (d) {
            return d.color;
        })
        .style("fill-opacity", 0)
        .style("text-anchor","middle")
        .style("text-shadow", "1px 1px 0 rgba(0, 0, 0, 1")
        .attr("font-family", "times")
        .attr("font-size", "30px")
        .text(function (d) { return d.role; });
}
function setBackground(){
    svg.selectAll(".rectBackground")
        .transition().duration(1500)
        .style("fill-opacity", 0.12);
    svg.selectAll(".textBackground")
        .transition().duration(1500)
        .style("fill-opacity", 0.15);
}

function removeColorLegend() {
 svg.selectAll(".nodeLegend").remove();
}
function drawTimeLegend() {
  for (var i=minYear+1; i<maxYear;i++){
    var xx = xStep+xScale((i-minYear));
    svg.append("line")
        .attr('class','grid')
      .style("stroke", "#818181")
      .style("stroke-dasharray", ("1, 2"))
      .style("fill-opacity", 1)   
      .style("stroke-opacity", 1)
      .style("stroke-width", 0.2)
      .attr("x1", function(d){ return xx; })
      .attr("x2", function(d){ return xx; })
      .attr("y1", function(d){ return 0; })
      .attr("y2", function(d){ return height; });
     svg.append("text")
      .attr("class", "timeLegend")
      .style("fill", "#888")
      .style("fill-opacity", 1)   
      .style("text-anchor","start")
      .style("text-shadow", "1px 1px 0 rgba(55, 55, 55, 0.6")
      .attr("x", xx)
      .attr("y", height-8)
      .attr("dy", ".21em")
      .attr("font-family", "sans-serif")
      .attr("font-size", "12px")
      //.style("font-weight", "bold")  
      .text(i);  
  }
}  

function getColor(category) {
  var sat = 200;
  if (category=="C")
    return "#66c2a5"
  else if (category=="S")
    return "#078ac3"
  else if (category=="J")
    return "#fc8d62"
  else if (category=="W")
    return "#e78ac3"
  else if (category=="A")
    return "#dd4444"
  else{
    return "#eee";    
  }
}

function colorFaded(d) {
  var minSat = 80;
  var maxSat = 200;
  var step = (maxSat-minSat)/maxDepth;
  var sat = Math.round(maxSat-d.depth*step);
 
  //console.log("maxDepth = "+maxDepth+"  sat="+sat+" d.depth = "+d.depth+" step="+step);
  return d._children ? "rgb("+sat+", "+sat+", "+sat+")"  // collapsed package
    : d.children ? "rgb("+sat+", "+sat+", "+sat+")" // expanded package
    : "#aaaacc"; // leaf node
}


function getBranchingAngle1(radius3, numChild) {
  if (numChild<=2){
    return Math.pow(radius3,2);
  }  
  else
    return Math.pow(radius3,1);
 } 

function getRadius(d) {
 // console.log("scaleCircle = "+scaleCircle +" scaleRadius="+scaleRadius);
return d._children ? scaleCircle*Math.pow(d.childCount1, scaleRadius)// collapsed package
      : d.children ? scaleCircle*Math.pow(d.childCount1, scaleRadius) // expanded package
      : scaleCircle;
     // : 1; // leaf node
}


function childCount1(level, n) {
    count = 0;
    if(n.children && n.children.length > 0) {
      count += n.children.length;
      n.children.forEach(function(d) {
        count += childCount1(level + 1, d);
      });
      n.childCount1 = count;
    }
    else{
       n.childCount1 = 0;
    }
    return count;
};

function childCount2(level, n) {
    var arr = [];
    if(n.children && n.children.length > 0) {
      n.children.forEach(function(d) {
        arr.push(d);
      });
    }
    arr.sort(function(a,b) { return parseFloat(a.childCount1) - parseFloat(b.childCount1) } );
    var arr2 = [];
    arr.forEach(function(d, i) {
        d.order1 = i;
        arr2.splice(arr2.length/2,0, d);
    });
    arr2.forEach(function(d, i) {
        d.order2 = i;
        childCount2(level + 1, d);
        d.idDFS = nodeDFSCount++;   // this set DFS id for nodes
    });

};

d3.select(self.frameElement).style("height", diameter + "px");




// Toggle children on click.
function click(d) {
/*  if (d3.event.defaultPrevented) return; // ignore drag
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  console.log("Clicking on = "+d.name+ " d.depth = "+d.depth);
  
 update();*/
}

/*
function collide(alpha) {
  var quadtree = d3.geom.quadtree(tree_nodes);
  return function(d) {
    quadtree.visit(function(quad, x1, y1, x2, y2) {
    if (quad.point && (quad.point !== d) && (quad.point !== d.parent) && (quad.point.parent !== d)) {
         var rb = getRadius(d) + getRadius(quad.point),
        nx1 = d.x - rb,
        nx2 = d.x + rb,
        ny1 = d.y - rb,
        ny2 = d.y + rb;

        var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y);
          if (l < rb) {
          l = (l - rb) / l * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
      }
      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    });
  };
}
*/
function initAvatar(data) {
    var pattern = svg.selectAll("defs")
        .data(data)
        .enter()
        .append('defs')
        .append("pattern")
        .attr("id", function(d){return "node_avatar" + fixstring(d.ID)})
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
            let el = d3.select(this);
            el.attr("xlink:href", "images/noavatar.jpg");
            el.on("error", null);
        })
}
function fixstring(str){
    return str.toLowerCase().replace(' ','_');
}