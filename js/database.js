//
// Define your database
//
var db = new Dexie("publishcation_database");
d3.tsv("data/publication.tsv", function (error, data_) {
    if (error) throw error;
    // data = data_.filter(d => +d.Time >= minYear);
    data = data_;
    let db_keys = Object.keys(data_).join(',');
    db.version(1).stores({
        publication: db_keys
    });
    db.publication.bulkPut(data_,data_.map(d=>d.Id))
})