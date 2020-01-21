let idList = null;
let svg = null;
let category = {};
let year = {};
let yearDistance = 0;
let isGroup = true;

let bubbleChartSettings = {
    width: parseFloat(d3.select('#chart-container').style('width').replace('px', '')),
    height: parseFloat(d3.select('#chart-container').style('width').replace('px', '')),
    bubbleRadius: parseFloat(d3.select('#chart-container').style('width').replace('px', '')) / 30,
};

function createBubbleChart(data, svg, settings) {
    // let color = d3.scaleOrdinal(colors);
    let displayType = 'group-all';

    let width = settings.width, height = settings.height;
    let center = {x: width / 2, y: height / 2};
    let forceStrength = 0.04;
    let bubbles = null;
    let rAreaCluster = {}, yearCluster = {}, textCluster = {};
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
        textCluster = createTextCluster('Text', height / 2);

        console.log(textCluster);

        year = yearCluster;

        chartData.forEach(function (d) {
            calculateTimelinePosition(d);
        });

        chartData = calculateTextPosition(chartData);

        console.log(chartData);

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

        svg.select('.timeline')
            .append('line')
            .attr('x1', 0)
            .attr('y1', height - 30)
            .attr('x2', width)
            .attr('y2', height - 30)
            .attr('stroke-width', 2)
            .attr('stroke', 'gray');

        let nodes = createNodes();

        let rectG = svg.append('g').attr('class', 'shadow-container');

        rectG
            .selectAll('circle')
            .data(nodes)
            .enter()
            .append('g')
            .attr("transform", d => `translate(${d.data.textX},${d.data.textY})`)
            .append('circle')
            .attr('r', d => d.radius)
            .attr('fill', 'gray');

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
                return colors[d.data.ResearchArea];
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

    function changeToAreaCluster() {
        isGroup = false;
        let clusterArr = Object.keys(rAreaCluster);
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

    function changeToTextCluster() {
        svg.selectAll('.cluster').remove();
        d3.selectAll('circle').attr('r', 8);
        simulation
            // .force('x', d3.forceX().strength(forceStrength).x(d => d.data.isInTimeline ? d.data.timelineX : d.data.textX))
            // .force('y', d3.forceY().strength(forceStrength).y(d => d.data.isInTimeline ? d.data.timelineY : d.data.textY))
            // .force('collision', d3.forceCollide().radius(d => d.data.isInTimeline ? d.radius : 8))
            // .force('charge', d3.forceManyBody().strength(0));
            .force('x', d3.forceX().strength(forceStrength).x(d => d.data.textX))
            .force('y', d3.forceY().strength(forceStrength).y(d => d.data.textY))
            .force('collision', d3.forceCollide().radius(8))
            .force('charge', d3.forceManyBody().strength(0));
        simulation.alpha(1).restart();
    }

    function checkCurrentDisplay(d) {
        let res = {x: center.x, y: center.y};
        switch (displayType) {
            case "area":
                res.x = rAreaCluster[d.data.ResearchArea].x;
                res.y = rAreaCluster[d.data.ResearchArea].y;
                break;
            case "group-all":
                res.x = center.x;
                res.y = center.y;
                break;
            case "text":
                res.x = d.data.textX;
                res.y = d.data.textY;
                break;
            default:
                break;
        }
        return res;
    }

    chart.updateBubble = function () {
        simulation.force('x', d3.forceX().strength(forceStrength).x(d => {
            let pos = checkCurrentDisplay(d);
            if (d.data.isInTimeline) {
                return d.data.timelineX;
            } else {
                return pos.x;
            }
        })).force('y', d3.forceY().strength(forceStrength).y(d => {
            let pos = checkCurrentDisplay(d);
            if (d.data.isInTimeline) {
                return d.data.timelineY;
            } else {
                return pos.y;
            }
        })).force('collision', d3.forceCollide().radius(function (d) {
            if (d.data.isInTimeline || displayType === 'text') {
                return 8;
            } else {
                return d.radius;
            }
        })).force('charge', d3.forceManyBody().strength(d => {
            if (d.data.isInTimeline || displayType === 'text') {
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
        })).force('y', d3.forceY().strength(forceStrength).y(center.y))
            .force('collision', d3.forceCollide().radius(function (d) {
                return d.radius;
            })).force('charge', d3.forceManyBody().strength(charge));
        simulation.alpha(1).restart();
    };

    function groupBubbles() {
        isGroup = true;
        svg.selectAll('.cluster').remove();
        svg.selectAll('circle').attr('r', d => d.data.isInTimeline ? 8 : bubbleRadius);

        simulation
            .force('x', d3.forceX().strength(forceStrength).x(d => d.data.isInTimeline ? d.data.timelineX : center.x))
            .force('y', d3.forceY().strength(forceStrength).y(d => d.data.isInTimeline ? d.data.timelineY : center.y))
            .force('collision', d3.forceCollide().radius(d => d.data.isInTimeline ? 8 : bubbleRadius))
            .force('charge', d3.forceManyBody().strength(d => d.data.isInTimeline ? 0 : charge(d)));
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

    function createTextCluster(clusterType, yPosition) {
        let clusterName = ['I', 'D', 'V', 'L'];
        let clusters = {};

        let numOfClusters = clusterName.length;
        let distance = (width - 100) / (numOfClusters - 1);

        for (let i = 0; i < numOfClusters; i++) {
            clusters[clusterName[i]] = {x: distance * i + 50, y: yPosition}
        }

        return clusters;
    }

    chart.toggleDisplay = function () {
        switch (displayType) {
            case "area":
                changeToTextCluster();
                displayType = 'text';
                break;
            case "group-all":
                changeToAreaCluster();
                displayType = 'area';
                break;
            case "text":
                groupBubbles();
                displayType = "group-all";
                break;
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

    //calculate bubbles position in text
    function calculateTextPosition(chartData) {
        //Calculate 'I'
        chartData[0].textX = textCluster['I'].x;
        chartData[0].textY = textCluster['I'].y - 60;
        chartData[1].textX = textCluster['I'].x;
        chartData[1].textY = textCluster['I'].y - 30;
        chartData[2].textX = textCluster['I'].x;
        chartData[2].textY = textCluster['I'].y;
        chartData[3].textX = textCluster['I'].x;
        chartData[3].textY = textCluster['I'].y + 30;
        chartData[4].textX = textCluster['I'].x;
        chartData[4].textY = textCluster['I'].y + 60;

        //Calculate 'D'
        chartData[5].textX = textCluster['D'].x - 30;
        chartData[5].textY = textCluster['D'].y - 60;
        chartData[6].textX = textCluster['D'].x - 30;
        chartData[6].textY = textCluster['D'].y - 30;
        chartData[7].textX = textCluster['D'].x - 30;
        chartData[7].textY = textCluster['D'].y;
        chartData[8].textX = textCluster['D'].x - 30;
        chartData[8].textY = textCluster['D'].y + 30;
        chartData[9].textX = textCluster['D'].x - 30;
        chartData[9].textY = textCluster['D'].y + 60;
        chartData[10].textX = textCluster['D'].x;
        chartData[10].textY = textCluster['D'].y - 45;
        chartData[11].textX = textCluster['D'].x;
        chartData[11].textY = textCluster['D'].y + 45;
        chartData[12].textX = textCluster['D'].x + 30;
        chartData[12].textY = textCluster['D'].y - 30;
        chartData[13].textX = textCluster['D'].x + 30;
        chartData[13].textY = textCluster['D'].y + 30;
        chartData[14].textX = textCluster['D'].x + 30;
        chartData[14].textY = textCluster['D'].y;

        //Calculate 'V'
        chartData[15].textX = textCluster['V'].x - 40;
        chartData[15].textY = textCluster['V'].y - 60;
        chartData[16].textX = textCluster['V'].x - 30;
        chartData[16].textY = textCluster['V'].y - 30;
        chartData[17].textX = textCluster['V'].x - 20;
        chartData[17].textY = textCluster['V'].y;
        chartData[18].textX = textCluster['V'].x - 10;
        chartData[18].textY = textCluster['V'].y + 30;
        chartData[19].textX = textCluster['V'].x;
        chartData[19].textY = textCluster['V'].y + 60;
        chartData[20].textX = textCluster['V'].x + 10;
        chartData[20].textY = textCluster['V'].y + 30;
        chartData[21].textX = textCluster['V'].x + 20;
        chartData[21].textY = textCluster['V'].y;
        chartData[22].textX = textCluster['V'].x + 30;
        chartData[22].textY = textCluster['V'].y - 30;
        chartData[23].textX = textCluster['V'].x + 40;
        chartData[23].textY = textCluster['V'].y - 60;

        //Calculate 'L'
        chartData[24].textX = textCluster['L'].x - 30;
        chartData[24].textY = textCluster['L'].y - 60;
        chartData[25].textX = textCluster['L'].x - 30;
        chartData[25].textY = textCluster['L'].y - 30;
        chartData[26].textX = textCluster['L'].x - 30;
        chartData[26].textY = textCluster['L'].y;
        chartData[27].textX = textCluster['L'].x - 30;
        chartData[27].textY = textCluster['L'].y + 30;
        chartData[28].textX = textCluster['L'].x - 30;
        chartData[28].textY = textCluster['L'].y + 60;

        chartData[29].textX = textCluster['L'].x - 10;
        chartData[29].textY = textCluster['L'].y + 60;
        chartData[30].textX = textCluster['L'].x + 10;
        chartData[30].textY = textCluster['L'].y + 60;
        chartData[31].textX = textCluster['L'].x + 30;
        chartData[31].textY = textCluster['L'].y + 60;

        //Calculate more for 'I'
        chartData[32].textX = textCluster['I'].x;
        chartData[32].textY = textCluster['I'].y - 60;
        chartData[33].textX = textCluster['I'].x;
        chartData[33].textY = textCluster['I'].y - 30;
        chartData[34].textX = textCluster['I'].x;
        chartData[34].textY = textCluster['I'].y;
        chartData[35].textX = textCluster['I'].x;
        chartData[35].textY = textCluster['I'].y + 30;
        chartData[36].textX = textCluster['I'].x;
        chartData[36].textY = textCluster['I'].y + 60;

        for (let i = 37; i < chartData.length; i++) {
            chartData[i].textX = 0;
            chartData[i].textY = 0;
        }

        return chartData;
    }

    function createMultilineText(clusterArr) {
        let texts = svg.select('.chart-tags').selectAll('text').data(clusterArr)
            .enter()
            .append('text')
            .attr('class', 'cluster')
            .attr('x', d => rAreaCluster[d].x)
            .attr('y', d => rAreaCluster[d].y / 5)
            .attr('text-anchor', 'middle')
            .style('fill', d => colors[d])
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