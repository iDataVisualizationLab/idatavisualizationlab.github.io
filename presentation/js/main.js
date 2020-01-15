let idList = null;
let svg = null;

function createBubbleChart(svg, settings) {
  let color = d3.scaleOrdinal(d3.schemeCategory10);

  let width = settings.width, height = settings.height;
  let center = {x: width / 2, y: height / 2};
  let forceStrength = 0.02;
  let bubbles = null;
  let clusters = {};
  let simulation = null;
  let bubbleRadius = settings.bubbleRadius;

  svg.attr('width', width).attr('height', height);

  let defs = svg.append("defs");

  let chart = function (data) {
    defs.selectAll("pattern")
      .data(data)
      .enter()
      .append("pattern")
      .attr("id", d => d.Id)
      .attr("width", 1)
      .attr("height", 1)
      .attr("patternContentUnits", "objectBoundingBox")
      .append("image")
      .attr("xlink:href", d => d.image)
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 1)
      .attr("height", 1)
      .attr("preserveAspectRatio", "xMinYMin slice");

    let nodes = createNodes(data);

    bubbles = svg.selectAll(".bubble-container")
      .data(nodes)
      .enter()
      .append('g')
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .attr('id', d => `data-${d.id}`)
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    let bubblesE = bubbles.append('circle')
      .classed('bubble', true)
      .attr('r', d => d.radius)
      .attr('fill', function (d) {
        return "url(\"#" + d.id + "\")";
      })
      .attr('stroke', function (d) {
        return color(d.data.ResearchArea);
      });
    // .on('mouseover', showDetail)
    // .on('mouseout', hideDetail);

    bubbles.merge(bubblesE);

    bubbles.transition(2000)
      .attr('r', d => d.radius);

    simulation = d3.forceSimulation()
      .velocityDecay(0.2)
      .force('x', d3.forceX().strength(forceStrength).x(center.x))
      .force('y', d3.forceY().strength(forceStrength).y(center.y))
      .force('charge', d3.forceManyBody().strength(charge))
      .force('collision', d3.forceCollide().radius(function (d) {
        return d.radius
      }))
      .alphaTarget(0.05)
      .on('tick', ticked);

    simulation.nodes(nodes);

  };

  function createNodes(data) {
    let nodes = data.map(function (d) {
      return {
        radius: bubbleRadius,
        value: 1,
        id: d.Id,
        image: d.image,
        data: d,
        x: Math.random() * 900,
        y: Math.random() * 900
      };
    });
    nodes.sort(function (a, b) {
      return b.value - a.value;
    });

    return nodes;
  }

  function ticked() {
    bubbles.attr("transform", d => `translate(${d.x},${d.y})`);
  }

  function charge(d) {
    return -Math.pow(d.radius, 2.0) * forceStrength;
  }

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3);
    d.fx = null;
    d.fy = null;
  }

  return chart;
}

d3.tsv('data/publication.tsv').then(function (data) {
  let filteredYearData = data.filter(d => Date.parse(d.Time) > Date.parse("2017"));
  console.log(filteredYearData);
  let bubbleChartSettings = {
    bubbleRadius: 20,
    width: 500,
    height: 500
  };
  svg = d3.select('#main-svg');
  let bubbleChart = createBubbleChart(svg, bubbleChartSettings);

  idList = filteredYearData.map(d => {return {id: d.Id, image: d.image, title: d.Title}});

  bubbleChart(filteredYearData);
}).then(async function () {
  let idx = 0;
  let panelImg = d3.select('#paper-img');
  let panelInfo = d3.select('#paper-info');
  while (true) {
    await sleep(5000).then(function () {
      svg.selectAll('g').attr('opacity', 0.15);
      svg.select(`#data-${idList[idx].id}` ).attr('opacity', 1);
      panelImg.attr('src', idList[idx].image);
      panelInfo.selectAll('*').remove();
      panelInfo.append('p').attr('class', 'panel-text').text(idList[idx].title);
      if (idx === idList.length - 1) {
        idx = 0;
      } else {
        idx++;
      }
    })
  }
});

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
};
