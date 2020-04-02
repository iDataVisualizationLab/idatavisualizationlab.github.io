d3.tsv('data/conferences.tsv',function(e,data){
    d3.select('#tableConference tbody').selectAll('tr').data(data)
        .enter().append('tr')
        .attr('bgcolor',d=>d.Color)
        .html(d=>`<td align="left" style="padding:5px;"><a
                    href="${d.Link}">${d.Name}</a></td>
            <td align="left" style="padding:5px;">${d.Acceptance}</td>
            <td align="left" style="padding:5px;">${dateformat(d.When)}</td>
            <td align="left" style="padding:5px;">${d.Where}</td>
            <td align="left" style="padding:5px;">${dateformat(d.Dealine)}</td>
            <td align="left" style="padding:5px;">${dateformat(d.Notification)}</td>
            <td align="left" style="padding:5px;">${d.Poster}</td>`)
})
function dateformat(date){
    return +new Date(date)?d3.timeFormat('%b %d')(new Date(date)):date
}