$('.carousel').carousel({
    interval: 5000
});
let profileList = [], personPubMap = {}, publicationList = [];
let bubbleChart = null, svg = null;

let idList = null;
let category = {};
let yearCluster = {};
let yearDistance = 0;

let bubbleChartSettings = {
    width: parseFloat(d3.select('.chart').style('width').replace('px', '')),
    height: parseFloat(d3.select('.chart').style('width').replace('px', '')) / 2,
    bubbleRadius: parseFloat(d3.select('.chart').style('width').replace('px', '')) / 30,
};

function formatTime(d) {
    let time_current = d3.timeParse('%d-%b-%y')(d);
    if (time_current === null)
        time_current = new Date(d);
    return time_current;
}

d3.csv('data/members.csv').then(function (_data) {
    const data = _data.filter(d=>!d.disable);
    d3.tsv('data/publication.tsv').then(function (publications) {
        profileList = data;
        debugger
        data.sort((a, b) => a.alumni - b.alumni);
        alumni =[];
        notalumni = data.filter((d,i) => {
            d.index=i
            if (!d.alumni)
                return true;
            else{
                alumni.push(d)
            }
        });
        alumni[0].marginLeft = '20px';
        if (alumni.length % 2) {
            alumni[Math.round(alumni.length / 2)].text = 'Alumni';
            alumni[Math.round(alumni.length / 2)].left = '50px';
        } else {
            alumni[alumni.length / 2 - 1].text = 'Alumni';
            alumni[alumni.length / 2 - 1].left = '0';
        }
        publicationList = publications;
        mapPubToPerson();
        init();

        let carouselItem = d3.select('.carousel-inner').selectAll('.carousel-item')
            .data(data)
            .enter()
            .append('div')
            .attr('class', (d, i) => i === 0 ? 'carousel-item active' : 'carousel-item')
            .attr('id', (d, i) => `person-id-${i}`);

        carouselItem
            .append('img')
            .attr('class', 'd-block w-100 carousel-image')
            .attr('src', d => d.image)
            .attr('alt', (d, i) => `${i} slide`);

        let carouselCaption = carouselItem
            .append('div')
            .attr('class', 'carousel-caption d-none d-md-block');

        carouselCaption
            .append('h3')
            .text(d => d.first_name + " " + d.last_name);

        carouselCaption.append('h4')
            .text(d => d.program);

        d3.select('.carousel-indicators.current').selectAll('li')
            .data(data)
            .enter()
            .append('li')
            .attr('data-target', '#carousel-thumb')
            .attr('data-slide-to', (d, i) => d.index)
            .attr('class', (d, i) => d.index === 0 ? 'active' : '')
            .style('position', 'relative')
            .style('margin-left',d=>d.marginLeft)
            .append('img')
            .attr('src', d => d.image);
        // const li = d3.select('.carousel-indicators.alumni').selectAll('li')
        //     .data(alumni)
        //     .enter()
        //     .append('li')
        //     .attr('data-target', '#carousel-thumb')
        //     .attr('data-slide-to', (d, i) => d.index)
        //     .attr('class', (d, i) => d.index === 0 ? 'active' : '')
        //     .style('position', 'relative')
        //     .append('img')
        //     .attr('src', d => d.image);


        function init() {
            d3.select('.shortInfo').text(profileList[0].introduction);
            updatePersonal(profileList[0]);
            let personPublications = updatePublications(profileList[0]);

            svg = d3.select('.chart').select('#main-svg');
            let filteredYearData = personPublications.filter(d => formatTime(d.Time) > formatTime("Jan 1 2017")).sort((a, b) => formatTime(a.Time) - formatTime(b.Time));

            bubbleChart = createBubbleChart(filteredYearData, svg, bubbleChartSettings);
            bubbleChart(filteredYearData);
        }
    });
});

function mapPubToPerson() {
    publicationList.forEach(function (d) {
        let authors = d.Authors.split(',');

        authors.forEach(function (author) {
            if (!personPubMap[author.trim()]) {
                personPubMap[author.trim()] = [];
            }
            personPubMap[author.trim()].push(d);
        })
    });
}

function changePersonalLinks(selector, attributeClass, newLink) {
    if (newLink === "") {
        selector
            .select(`.${attributeClass}`)
            .style('display', 'none')
    } else {
        selector
            .select(`.${attributeClass}`)
            .style('display', 'inline-block')
            .attr('href', newLink);
    }
}

function updatePersonal(profile) {
    let personLinks = d3.select('.personInfo').select('.personLinks');

    changePersonalLinks(personLinks, 'cv-link', profile.cv);
    changePersonalLinks(personLinks, 'homepage-link', profile.homepage);
    changePersonalLinks(personLinks, 'linkedin-link', profile.linkedin);
    changePersonalLinks(personLinks, 'github-link', profile.github);
    changePersonalLinks(personLinks, 'scholar-link', profile.scholar);
    changePersonalLinks(personLinks, 'research-gate-link', profile.research_gate);
    changePersonalLinks(personLinks, 'orcid-qr-link', profile.orcid_qr);
    changePersonalLinks(personLinks, 'orcid-link', profile.orcid);
    changePersonalLinks(personLinks, 'researcher-id-link', profile.researcher_id);
    changePersonalLinks(personLinks, 'youtube-link', profile.youtube);
}

function updatePublications(profile) {
    let personPublications = [];
    let publications = d3.select('.publications');
    publications.selectAll('*').remove();
    profile.name_on_pub.split(',').forEach(function (d) {
        let name = d.trim();
        if (name && personPubMap[name]) {
            personPubMap[name].forEach(function (pub) {
                personPublications.push(pub);
                // addPublications(publications, pub)
            })
        }
    });

    return personPublications;
}

$('#carousel-thumb').on('slide.bs.carousel', function (e) {
    let idSplitter = e.relatedTarget.id.split('-');
    let profile = profileList[idSplitter[idSplitter.length - 1]];
    d3.selectAll('.carousel-indicators .active').classed('active',false);
    d3.selectAll('.carousel-indicators li').filter(d=>d.index===+idSplitter[idSplitter.length - 1]).classed('active',true);
    d3.select('.shortInfo').text(profile.introduction);
    updatePersonal(profile);
    let personPublications = updatePublications(profile).filter(d => Date.parse(d.Time) > Date.parse("2017")).sort((a, b) => Date.parse(a.Time) - Date.parse(b.Time));
    bubbleChart.update(personPublications);
});

function createBubbleChart(data, svg, settings) {
    // let color = d3.scaleOrdinal(colors);
    let displayType = 'group-all';

    let width = settings.width, height = settings.height;
    let center = {x: width / 2, y: height / 2};
    let forceStrength = 0.04;
    let bubbles = null;
    let rAreaCluster = {}, textCluster = {};
    let simulation = null;
    let bubbleRadius = settings.bubbleRadius;
    let chartData = data;
    let textBubbleRadius = 8;

    chartData = chartData.map(d => {
        d['year'] = formatTime(d.Time).getFullYear();
        return d;
    });

    svg.attr('width', width).attr('height', height);

    let defs = svg.append("defs");
    yearCluster = createYearCluster('year', height - 20);

    let chart = function () {
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
        // textCluster = createTextCluster('Text', height / 2);

        chartData.forEach(function (d) {
            calculateTimelinePosition(d);
        });

        // chartData = calculateTextPosition(chartData);

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

        svg.selectAll('.node').remove();

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
            .attr('r', 8)
            .attr('fill', function (d) {
                return "url(\"#" + d.id + "\")";
            })
            .attr('stroke', function (d) {
                return colors[d.data.ResearchArea];
            });

        bubbles.merge(bubblesE);

        bubbles.transition(2000)
            .attr('r', d => d.radius);

        simulation = d3.forceSimulation()
            .velocityDecay(0.2)
            .force('x', d3.forceX().strength(forceStrength).x(d => d.data.timelineX))
            .force('y', d3.forceY().strength(forceStrength).y(d => d.data.timelineY))
            .force('charge', d3.forceManyBody().strength(0))
            .force('collision', d3.forceCollide().radius(8))
            .alphaTarget(0.3)
            .on('tick', ticked);

        simulation.alpha(1).restart();

        simulation.nodes(nodes);
    };

    chart.update = function (newData) {
        // width = parseFloat(d3.select('.chart').style('width').replace('px', ''));
        // height = parseFloat(d3.select('.chart').style('height').replace('px', ''));
        //
        // bubbleChartSettings.bubbleRadius = width / 30;
        //
        // center = {x: width / 2, y: height / 2};
        // svg.attr('width', width).attr('height', height);

        chartData = newData;

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

    //calculate bubble position in timeline
    function calculateTimelinePosition(currentItem) {
        let currentItemTime = formatTime(currentItem.Time);
        let currentItemMonth = currentItemTime.getMonth();
        let currentItemYear = currentItemTime.getFullYear();
        let distance = yearDistance / 11;

        currentItem.timelineX = yearCluster[currentItemYear].x + distance * (currentItemMonth);
        currentItem.timelineY = height * 85 / 100;
        currentItem.isInTimeline = true;
    }

    return chart;
}
