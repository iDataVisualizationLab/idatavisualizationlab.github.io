//
// Define your database
//
var minYear = 2006;
var maxYear = 2022;

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
        data_.forEach(d=>{
            d.Authors = d.Authors.split(',').map(e=>e.trim());
            d.ResearchArea = d.ResearchArea.split(',').filter(s=>s!==""?s:false).map(s=>"ResearchArea_"+s);
            d.Application = d.Application.split(',').filter(s=>s!==""?s:false).map(s=>"Application_"+s);
            if (d.Application.length===0)
                d.Application = ['Application_other']
        });
        db.version(1).stores({
            people: Object.keys(people_data[0]).join(','),
            publication: 'Id,Code,Level,Time,Venue,VenueId,Title,*Authors,pubURL,pdf,video,github,bib,doi,image,*tags,Rate,*ResearchArea,*Application'
        });

        db.people.bulkPut(people_data);
        db.publication.bulkPut(data_).then(()=>{
            data=data_;
            loadCategories();
            setupHandlers();
            updatefilter();
            data2timearc(data);
        });

    })
});
// Updates the set of displayed entries based on current filter values
function updateDisplayedEntries(){
    // Also, remove the tooltips
    $(".tooltip").remove();

    // Get the set of active filters
    var activeFilters = {};
    $(".category-entry.active:not(.category-other)").each(function(){
        var category = $(this).data("entry");
        var parent = categoriesMap[category].parentCategory;
        if (!activeFilters[parent])
            activeFilters[parent] = [];
        activeFilters[parent].push(category);
    });

console.log(activeFilters)
    // Get the time filter range
    var indices = $("#timeFilter").val();
    // var yearMin = timeFilterEntries[parseInt(indices[0])];
    // var yearMax = timeFilterEntries[parseInt(indices[1])];
    var yearMin = minYear;
    var yearMax = maxYear;

    // Filter the entries and sort the resulting array
    let query = db.publication.where('Code').anyOf(activeFilters["publication-venue"]);
    _.without(d3.keys(activeFilters),'publication-venue').forEach(k=>{
        query = query.and(function(d){return d[k].find(e=>d3.values(activeFilters[k]).indexOf(e)!==-1)});
    });
    query.toArray()
        .then(d=>{
            data = d;
            if (!data.length) {
                // container.append("<p class=\"text-muted\">No eligible entries found</p>");
                data2timearc(data);
            } else {
                updatefilter();
                data2timearc(data);
            }
        })

    // updateTimeChart(data);
}
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
        // add color to filter
        d3.select('.category-item[data-category=publication-venue')
            .selectAll('.category-entry').each(function(){
            const target = d3.select(this);
            target.style('color',getColor(target.attr('data-entry')));
        })


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
        var element = $("<button type=\"button\" class=\"btn btn-default category-entry flat-primary-inner-butt active\""
            + "data-tooltip=\"tooltip\"></button>");
        element.attr("data-entry", item.title);
        element.prop("title", item.description);
        element.append(item.content);

        currentContainer.append(element);
        currentContainer.append(" ");
    }

}
function onFilterToggle(){
    var element = $(this);

    if (!element.hasClass("active"))
        element.addClass("active");
    else
        element.removeClass("active");

    updateCategoryResetButton(element);
    updateDisplayedEntries();
}
function updateCategoryResetButton(element){
    var container = element.parent();
    var resetButton = container.parent().find(".reset-category-filter");

    if (container.children(".category-entry:not(.active)").length > 0)
        resetButton.removeClass("hidden");
    else
        resetButton.addClass("hidden");
}
function onCategoryFilterReset(){
    var element = $(this);

    element.parent().next(".category-entries-container").children(".category-entry").addClass("active");
    element.addClass("hidden");

    updateDisplayedEntries();
}
function setupHandlers(){
    // $(".search-clear").on("click", onSearchClear);
    // $("#searchField").on("keyup", onSearch);

    $("#categoriesList")
        .on("click", ".category-entry", onFilterToggle)
        .on("click", ".reset-category-filter", onCategoryFilterReset);
    //
    // $("#entriesContainer").on("click", ".content-entry", onEntryClick);

    // $(window).on("resize", function(){
    //     if ($("#aboutModal").hasClass("in"))
    //         onAboutModalShown();
    // });

}
function updatefilter(){
    d3.select('#pub_num').text(data.length)
}
