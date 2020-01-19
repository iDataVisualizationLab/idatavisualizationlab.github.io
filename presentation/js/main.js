let idList = null;
let svg = null;
let category = {};
let year = {};
let yearDistance = 0;
let isGroup = true;
let colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"];

let bubbleChartSettings = {
    width: parseFloat(d3.select('#chart-container').style('width').replace('px', '')),
    height: parseFloat(d3.select('#chart-container').style('width').replace('px', '')),
    bubbleRadius: parseFloat(d3.select('#chart-container').style('width').replace('px', '')) / 30,
};

function createBubbleChart(data, svg, settings) {
    let color = d3.scaleOrdinal(colors);
    let displayType = 'group-all';

    let width = settings.width, height = settings.height;
    let center = {x: width / 2, y: height / 2};
    let forceStrength = 0.04;
    let bubbles = null;
    let rAreaCluster = {}, yearCluster = {};
    let simulation = null;
    let bubbleRadius = settings.bubbleRadius;
    let chartData = data;

    svg.attr('width', width).attr('height', height);

    let defs = svg.append("defs");

    let chart = function () {
        chartData = chartData.map(d => {
            d['year'] = new Date(d.Time).getFullYear();
            return d;
        });

        defs.selectAll("pattern")
            .data(chartData)
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


        chart.draw();
    };

    chart.draw = function () {
        rAreaCluster = createAreaCluster('ResearchArea', height / 2);
        yearCluster = createYearCluster('year', height - 30);

        year = yearCluster;

        chartData.forEach(function (d) {
            calculateTimelinePosition(d);
        });

        let yearArr = [];
        for (let key in yearCluster) {
            yearArr.push({year: key, x: yearCluster[key].x, y: yearCluster[key].y});
        }

        svg.select('.timeline')
            .selectAll('rect')
            .data(yearArr)
            .enter()
            .append('rect')
            .attr('x', d => {
                return d.x
            })
            .attr('y', d => d.y)
            .attr('width', '2px')
            .attr('height', '5px')
            .attr('stroke', 'gray');

        svg.select('.timeline')
            .selectAll('text')
            .data(yearArr)
            .enter()
            .append('text')
            .attr('x', d => {
                return d.x - 15
            })
            .attr('y', d => d.y + 20)
            .text(d => d.year)
            .attr('stroke', 'gray');

        //                        <line x1="0" y1="570" x2="600" y2="570" stroke-width="2" stroke="gray"></line>
        svg.select('.timeline')
            .append('line')
            .attr('x1', 0)
            .attr('y1', height - 30)
            .attr('x2', width)
            .attr('y2', height - 30)
            .attr('stroke-width', 2)
            .attr('stroke', 'gray');

        let nodes = createNodes();

        bubbles = svg.selectAll(".bubble-container")
            .data(nodes, d => d.data.Id)
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
                return d.radius;
            }))
            .alphaTarget(0.3)
            .on('tick', ticked);

        simulation.nodes(nodes);
    };

    chart.update = function () {
        width = parseFloat(d3.select('#chart-container').style('width').replace('px', ''));
        height = parseFloat(d3.select('#chart-container').style('height').replace('px', ''));

        console.log(width, height);

        bubbleChartSettings.bubbleRadius = width / 30;

        center = {x: width / 2, y: height / 2};
        svg.attr('width', width).attr('height', height);

        chart.draw();
    };

    function createNodes() {
        let nodes = chartData.map(function (d) {
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
        isGroup = false;
        var clusterArr = Object.keys(rAreaCluster);
        createMultilineText(clusterArr);

        simulation.force('x', d3.forceX().strength(forceStrength).x(function (d) {
            if (d.data.isInTimeline) {
                return d.data.timelineX;
            } else {
                return rAreaCluster[d.data.ResearchArea].x;
            }
        }));
        simulation.alpha(1).restart();
    }

    chart.updateBubble = function () {
        simulation.force('x', d3.forceX().strength(forceStrength).x(d => {
            if (d.data.isInTimeline) {
                return d.data.timelineX;
            } else {
                return isGroup ? center.x : rAreaCluster[d.data.ResearchArea].x;
            }
        })).force('y', d3.forceY().strength(forceStrength).y(d => {
            if (d.data.isInTimeline) {
                return d.data.timelineY;
            } else {
                return center.y;
            }
        })).force('collision', d3.forceCollide().radius(function (d) {
            if (d.data.isInTimeline) {
                return 8;
            } else {
                return d.radius;
            }
        })).force('charge', d3.forceManyBody().strength(d => {
            if (d.data.isInTimeline) {
                return 0;
            } else {
                return charge(d);
            }
        }));
        simulation.alpha(1).restart();
    };

    chart.reset = function () {
        simulation.force('x', d3.forceX().strength(forceStrength).x(d => {
            d.data.isInTimeline = false;
            return isGroup ? center.x : rAreaCluster[d.data.ResearchArea].x;
        })).force('y', d3.forceY().strength(forceStrength).y(d => {
            return center.y;
        })).force('collision', d3.forceCollide().radius(function (d) {
            return d.radius;
        })).force('charge', d3.forceManyBody().strength(charge));
        simulation.alpha(1).restart();
    };

    function groupBubbles() {
        isGroup = true;
        svg.selectAll('.cluster').remove();

        simulation.force('x', d3.forceX().strength(forceStrength).x(function (d) {
            if (d.data.isInTimeline) {
                return d.data.timelineX;
            } else {
                return center.x;
            }
        }));
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

    function createAreaCluster(clusterType, yPosition) {
        let clusterName = [];
        let clusters = {};
        chartData.forEach(function (d) {
            if (!clusterName.includes(d[clusterType])) {
                clusterName.push(d[clusterType])
            }
        });

        let numOfClusters = clusterName.length;
        let distance = width / (numOfClusters + 1);
        for (let i = 0; i < numOfClusters; i++) {
            clusters[clusterName[i]] = {x: distance * (i + 1), y: yPosition}
        }

        return clusters;
    }

    function createYearCluster(clusterType, yPosition) {
        let clusterName = [];
        let clusters = {};
        chartData.forEach(function (d) {
            if (!clusterName.includes(d[clusterType])) {
                clusterName.push(d[clusterType])
            }
        });

        clusterName.sort((a, b) => a - b);

        let numOfClusters = clusterName.length;
        let distance = width / (numOfClusters + 1);
        yearDistance = distance;
        for (let i = 0; i < numOfClusters; i++) {
            clusters[clusterName[i]] = {x: distance * (i + 1), y: yPosition}
        }

        return clusters;
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

    //calculate bubble position in timeline
    function calculateTimelinePosition(currentItem) {
        let currentItemTime = new Date(currentItem.Time);
        let currentItemMonth = currentItemTime.getMonth();
        let currentItemYear = currentItemTime.getFullYear();
        let distance = yearDistance / 11;

        currentItem.timelineX = year[currentItemYear].x + distance * (currentItemMonth);
        currentItem.timelineY = height * 85 / 100;
        currentItem.isInTimeline = false;
    }

    function createMultilineText(clusterArr) {
        let texts = svg.select('.chart-tags').selectAll('text').data(clusterArr)
            .enter()
            .append('text')
            .attr('class', 'cluster')
            .attr('x', d => rAreaCluster[d].x)
            .attr('y', d => rAreaCluster[d].y / 5)
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

let bubbleChart = null;

d3.tsv('data/publication.tsv').then(function (data) {
    d3.json('data/tags.json').then(function (tags) {
        category = Object.assign(tags.ResearchArea, tags.Application);
        let filteredYearData = data.filter(d => Date.parse(d.Time) > Date.parse("2017")).sort((a, b) => Date.parse(a.Time) - Date.parse(b.Time));
        svg = d3.select('#main-svg');
        bubbleChart = createBubbleChart(filteredYearData, svg, bubbleChartSettings);

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
        });

    });
}).then(async function () {
    let idx = 0;
    let panelImg = d3.select('#paper-img');
    let panelInfo = d3.select('#paper-info');
    while (true) {
        await sleep(3000).then(function () {

            //update bubble opacity and title
            // svg.selectAll('.node').attr('opacity', 0.3);
            let currentItem = svg.select(`#data-${idList[idx].id}`);
            // currentItem.attr('opacity', 1);
            panelImg.attr('src', idList[idx].image);
            panelInfo.selectAll('*').remove();
            panelInfo.append('p').attr('class', 'panel-text').text(idList[idx].title);

            currentItem.data()[0].data.isInTimeline = true;
            bubbleChart.updateBubble();
            //temp
            // svg.select('.current-show').classed('current-show', false).transition().duration(2000).attr('r', bubbleChartSettings.bubbleRadius);

            currentItem.select('circle').transition().duration(2000).attr('r', 8);
            updateChips(idList[idx]);
            if (idx === idList.length - 1) {
                idx = 0;
            } else {
                idx++;
            }
        });

        if (idx === 0) {
            await sleep(3000).then(function () {
                bubbleChart.reset();
                svg.selectAll('circle').transition().delay((d, i) => 100 * i).duration(500).attr('r', bubbleChartSettings.bubbleRadius);
            });

            await sleep(4000);
        }
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

$(document).ready(function () {
    let width = parseFloat(d3.select('.crop').style('width'));
    d3.select('.crop').style('height', `${width * 60 / 100}px`);
    d3.select('.crop img').style('max-height', `${width * 60 / 100}px`);
});