let idList = null;
let svg = null;
let category = {};
let year = {};

function createBubbleChart(svg, settings) {
    let color = d3.scaleOrdinal(d3.schemeCategory10);
    let displayType = 'group-all';

    let width = settings.width, height = settings.height;
    let center = {x: width / 2, y: height / 2};
    let forceStrength = 0.04;
    let bubbles = null;
    let clusters = {};
    let simulation = null;
    let bubbleRadius = settings.bubbleRadius;

    svg.attr('width', width).attr('height', height);

    let defs = svg.append("defs");

    let chart = function (data) {
        createCluster(data);

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
            .attr('class', 'node')
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
            .alphaTarget(0.3)
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

    function splitBubbles() {
        var clusterArr = Object.keys(clusters);

        createMultilineText(clusterArr);

        simulation.force('x', d3.forceX().strength(forceStrength).x(d => clusters[d.data.ResearchArea].x));
        simulation.alpha(1).restart();
    }

    function groupBubbles() {
        svg.selectAll('.cluster').remove();

        simulation.force('x', d3.forceX().strength(forceStrength).x(center.x));
        simulation.alpha(1).restart();
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

    function createCluster(data) {
        let clusterName = [];
        data.forEach(function (d) {
            if (!clusterName.includes(d.ResearchArea)) {
                clusterName.push(d.ResearchArea)
            }
        });

        let numOfClusters = clusterName.length;
        let distance = width / (numOfClusters + 1);
        for (let i = 0; i < numOfClusters; i++) {
            clusters[clusterName[i]] = {x: distance * (i + 1), y: height / 2}
        }
    }

    chart.toggleDisplay = function () {
        if (displayType === 'split') {
            groupBubbles();
            displayType = 'group';
        } else {
            splitBubbles();
            displayType = 'split';
        }
    };

    function createMultilineText(clusterArr) {
        let texts = svg.selectAll('text').data(clusterArr)
            .enter()
            .append('text')
            .attr('class', 'cluster')
            .attr('x', d => clusters[d].x)
            .attr('y', d => clusters[d].y / 5)
            .attr('text-anchor', 'middle')
            .style('fill', d => color(d))
            .text(d => d);

        let width = 200;

        texts.each(function () {
            let text = d3.select(this),
                words = text.text().split(/\s+|\//).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                x = text.attr("x"),
                y = text.attr("y"),
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y);
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + "em").text(word);
                }
            }
        });
    }
    return chart;
}

function createTimeline() {

}

d3.tsv('data/publication.tsv').then(function (data) {
    d3.json('data/tags.json').then(function (tags) {
        category = Object.assign(tags.ResearchArea, tags.Application);
        let filteredYearData = data.filter(d => Date.parse(d.Time) > Date.parse("2017"));
        // year =

        let bubbleChartSettings = {
            bubbleRadius: 20,
            width: 500,
            height: 500
        };
        svg = d3.select('#main-svg');
        let bubbleChart = createBubbleChart(svg, bubbleChartSettings);

        idList = filteredYearData.map(d => {
            let chips = [];
            d.ResearchArea.split(',').forEach(s => {
                if (s !== "")
                    chips.push({
                        short: s,
                        type: "Research Area",
                        full: category[s]
                    })
            });
            d.Application.split(',').forEach(s => {
                if (s !== "")
                    chips.push({
                        short: s,
                        type: "Application",
                        full: category[s]
                    })
            });
            return {id: d.Id, image: d.image, title: d.Title, chips: chips}
        });
        bubbleChart(filteredYearData);
        $('#chart-toggle').on('click', function () {
            bubbleChart.toggleDisplay();
        })
    });
}).then(async function () {
    let idx = 0;
    let panelImg = d3.select('#paper-img');
    let panelInfo = d3.select('#paper-info');
    while (true) {
        await sleep(5000).then(function () {
            svg.selectAll('.node').attr('opacity', 0.15);
            svg.select(`#data-${idList[idx].id}`).attr('opacity', 1);
            panelImg.attr('src', idList[idx].image);
            panelInfo.selectAll('*').remove();
            panelInfo.append('p').attr('class', 'panel-text').text(idList[idx].title);
            updateChips(idList[idx]);
            if (idx === idList.length - 1) {
                idx = 0;
            } else {
                idx++;
            }
        })
    }

    function updateChips(info) {
        panelInfo.selectAll('.chip').remove();
        panelInfo.selectAll('.chip').data(info.chips)
            .enter().append('div').attr('class', 'chip')
            .html(d => category[d.short]);

    }
});

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
};