$('.carousel').carousel();
let profileList = [], personPubMap = {}, publicationList = [];

d3.csv('data/members.csv').then(function (data) {
    d3.tsv('data/publication.tsv').then(function (publications) {
        profileList = data;
        publicationList = publications;
        mapPubToPerson();

        console.log(publications);

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
            .attr('class', 'carousel-caption d-none d-md-block')

        carouselCaption
            .append('h3')
            .text(d => d.first_name + " " + d.last_name);

        carouselCaption.append('h4')
            .text(d => d.program);

        d3.select('.carousel-indicators').selectAll('li')
            .data(data)
            .enter()
            .append('li')
            .attr('data-target', '#carousel-thumb')
            .attr('data-slide-to', (d, i) => i)
            .attr('class', (d, i) => i === 0 ? 'active' : '')
            .append('img')
            .attr('src', d => d.image);
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


function addPublications(selector, publication) {
    let tr = selector.append('div')
        .attr('class', 'publicationArea')
        .append('table')
        .append('tr');

    tr.append('th')
        .attr('class', 'paperThumb')
        .attr('width', '15%')
        .append('img')
        .attr('src', publication.image)
        .attr('width', 200)
        .attr('height', 100);

    tr.append('th')
        .attr('width', '85%')
        .style('padding-left', '25px')
        .append('th').attr('width', '85%')
        .html(`<font color="${getColor(publication.Code)}">[${publication.Id}]</font>
                        <i>${publication.Title}</i><br>
                        ${arrayToAuthor(publication.Authors.split(',').map(e => e.trim()))} <br>
                        ${publication.Venue}<br>
                        <a  ef="${publication.pubURL}">${publication.VenueId}</a> <br>
                        <a href="${publication.pdf}"> <img src="images/icons/pdf.png" height="18"></a>
                        <a href="${publication.video}"> <img src="images/icons/movie.png" height="19"></a>
                        <a href="${publication.github}"> <img src="images/icons/github.png" height="18"></a>
                        <a href="${publication.doi}" class="button">DOI</a>
                        <a href="${publication.bib}"> <img src="images/icons/bibtex.png" height="13"></a>`);

    function arrayToAuthor(a) {
        let lasta = a.pop();
        if (a.length) {
            return a.join(', ') + ' and ' + lasta;
        }
        return lasta;
    }


    function getColor(category) {
        if (category == "C")
            return "#66c2a5"
        else if (category == "S")
            return "#078ac3"
        else if (category == "J")
            return "#fc8d62"
        else if (category == "W")
            return "#e78ac3"
        else if (category == "A")
            return "#dd4444"
        else {
            return "#1c1c1c";
        }
    }
}

function updatePublications(profile) {
    let publications = d3.select('.publications');
    publications.selectAll('*').remove();
    profile.name_on_pub.split(',').forEach(function (d) {
        let name = d.trim();
        if (name && personPubMap[name]) {
            console.log(name);
            personPubMap[name].forEach(function (pub) {
                addPublications(publications, pub)
            })
        }
    })
}

$('#carousel-thumb').on('slide.bs.carousel', function (e) {
    let id = e.relatedTarget.id;
    let profile = profileList[id[id.length - 1]];

    d3.select('.shortInfo').text(profile.introduction);
    updatePersonal(profile);
    updatePublications(profile);
});