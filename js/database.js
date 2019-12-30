//
// Define your database
//
var db = new Dexie("idvl_database");
d3.csv("data/people.csv", function(error,people_data){
    data = people_data.slice();
    data.push({Id:"noavatar",img:"images/noavatar.jpg"})
    imagerange.forEach(i=>{
        data.push({Id:`${'Tommy Dang '}${i}`,img:`images/people/Tommy_pics/${i}.png`})
    })
    initAvatar(data);
    d3.tsv("data/publication.tsv", function (error, data_) {
        if (error) throw error;
        // data = data_.filter(d => +d.Time >= minYear);
        data_.forEach(d=>(d.Authors = d.Authors.split(',').map(e=>e.trim()),d.tags = d.tags.split(',').map(e=>e.trim())));
        db.version(1).stores({
            people: Object.keys(people_data[0]).join(','),
            publication: 'Id,Code,Level,Time,Venue,VenueId,Title,*Authors,pubURL,pdf,video,github,bib,doi,image,*tags,Rate'
        });

        db.people.bulkPut(people_data);
        db.publication.bulkPut(data_).then(()=>
            (data=data_,updatefilter(),data2timearc(data)))

    })
});

function updatefilter(){
    d3.select('#pub_num').text(data.length)
}