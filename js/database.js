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
            (data=data_,loadCategories(),updatefilter(),data2timearc(data)))

    })
});

let categories,categoriesMap,stats,statsMap;
function loadCategories(){
    d3.json("data/categories.json", function(data){
        categories = data;
        categoriesMap = {};

        stats = { description: "idvl publication browser", children: [] };
        statsMap = {};

        var container = $("#categoriesList");


        $.each(categories, function(i,d){
            appendCategoryFilter(d, null, container, stats);
        });
        // initializeFormCategories();
        //
        // loadContent();
    });
}
// Initializes category data and appends the category filter in a recursive fashion
function appendCategoryFilter(item, parent, currentContainer, currentStats){
    // Check if category is disabled
    if (item.disabled)
        return;

    // Set parent category, if provided
    if (parent)
        item.parentCategory = parent;

    // First of all, include item into the maps
    categoriesMap[item.title] = item;

    var statsEntry = { title: item.title, description: item.description, ids: {}};
    statsEntry.topCategory = currentStats.topCategory || item.title;

    currentStats.children.push(statsEntry);

    if (item.type == "category") {
        var element = $("<li class=\"list-group-item category-item\"></li>");
        element.attr("data-category", item.title);
        element.append("<h5 class=\"category-title panel-label\">" + item.description + "</h5>");

        currentContainer.append(element);

        statsEntry.children = [];

        // Check if any non-nested child entries are available
        var childEntries = $.grep(item.entries, function(d){ return d.type == "category-entry"});

        if (childEntries.length > 0) {
            var childrenContainer = $("<div class=\"category-entries-container\"></div>");
            childrenContainer.attr("data-category", item.title);
            element.append(childrenContainer);

            // Add the filter reset button
            var resetButton = $("<button type=\"button\" class=\"btn btn-default btn-xs reset-category-filter hidden\" title=\"Reset filters\">"
                + "<i class=\"fas fa-times\"></i>"
                + "</button>");
            resetButton.attr("data-category", item.title);

            element.children(".category-title").append(resetButton);

            $.each(childEntries, function(i,d){
                // Modify child element, if needed
                if (item.childrenDescription)
                    d.descriptionPrefix = item.childrenDescription;

                appendCategoryFilter(d, item.title, childrenContainer, statsEntry);
            });
        }

        // Check if any nested child entries are available
        var childCategories = $.grep(item.entries, function(d){ return d.type == "category"});

        if (childCategories.length > 0) {
            var childrenContainer = $("<ul class=\"list-group nested-categories-list\"></ul>");
            element.append(childrenContainer);

            $.each(childCategories, function(i,d){
                appendCategoryFilter(d, item.title, childrenContainer, statsEntry);
            });
        }
    } else if (item.type == "category-entry") {
        var element = $("<button type=\"button\" class=\"btn btn-default category-entry active\""
            + "data-tooltip=\"tooltip\"></button>");
        element.attr("data-entry", item.title);
        element.prop("title", item.description);
        element.append(item.content);

        currentContainer.append(element);
        currentContainer.append(" ");
    }

}

function updatefilter(){
    d3.select('#pub_num').text(data.length)
}