var jsonFile = "static/data/earthquake.geojson"

function buildTable(sample) {

    d3.json(jsonFile, function(data) {

    features = data.features

    features.forEach(x => {

        var properties = x.properties
        // var results = properties.filter(x => x[ID] === sample)
        // console.log(results)
        var tableDiv = d3.select("#earthquake-info")  
        
        Object.entries(properties).forEach(function([key, value]) {
            var row = tableDiv.append("tr")
            var cell = row.append("td")
            cell.text(value)
    
        })

        })


    })
}

buildTable(11)