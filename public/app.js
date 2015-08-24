// this function is isolated as easily reusable code to parse our json response
//
function prepareData(data) {
    var parsedData = JSON.parse(data);

    return parsedData
}

// another function isolated so we can reuse it in multiple locations
// it uses a while loop to remove all of the children of an html element.
function removePreviousSearch(attrs) {
    while (attrs.hasChildNodes()) {
        attrs.removeChild(attrs.firstChild);
    }
}

// This is our favorite function. If you look in the 
function favorite(id) {
    var name = prompt("please enter your name", "your name");
    var title = document.getElementsByClassName('Title')[0].childNodes[1].innerHTML;

    if (name == null) {
        return
    }

    var params = "name=" + name + "&title=" + title + "&oid=" + id;
    var url = "/favorite";

    event.preventDefault()
        httpPostAsync(url, params, function(data) {});
}

function expand(id) {
    var url = "/expand?id=" + id;

    event.preventDefault()
        httpGetAsync(url, function (data) {
            var filmData = prepareData(data);
            var filmDisplay = document.getElementById('film-display');
            removePreviousSearch(filmDisplay);

            var div = document.createElement('div');
            var ul = document.createElement('ul');
            var button = document.createElement('button');

            filmDisplay.appendChild(div);
            div.setAttribute("id", filmData["imdbID"]);
            div.setAttribute("class", "movie");
            div.setAttribute("onclick", "favorite(this.id)");
            div.appendChild(ul);

            for (var key in filmData) {
                if (filmData.hasOwnProperty(key)) {
                    var li = document.createElement('li');
                    var text = '<h4>' + key + ": </h4>" + "<span class='val'>" + filmData[key] + "</span>";
                    var movieDiv = document.getElementById(filmData["imdbID"]);

                    li.setAttribute("class", key);
                    movieDiv.firstChild.appendChild(li).innerHTML = text;
                };
            }
        });
}


// The following two functions make aysnchronous requests to the routes we
// defined in app.rb.

// Makes a get request
function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send(null);
}

// makes a post request
function httpPostAsync(theUrl, params, callback) {
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }

    xmlHttp.open("POST", theUrl, true);

    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    // the send function allows to pass the parameters to the route
    xmlHttp.send(params);
}

// the following code will load once the DOM (all of the html) has loaded.
// we need this code to load specifically after because it needs to be able 
// to traverse the dom in and listen for events in order to provide functionality
document.addEventListener('DOMContentLoaded', function() {
    var searchForm = document.querySelector('#movie-search');

    // for example we've added an event listener waiting for the element with 
    // the id `movie-search` to be clicked. once it's clicked it will run the 
    // code contained in the function
    searchForm.addEventListener('click', function(event) {
        var title = document.getElementById('movie-title').value;
        var url = "/get-movies?movie-title=" + title
        event.preventDefault();

        // here we're using our GET function defined above to get data from our
        // routes.
        httpGetAsync(url, function (data) {
            var filmData = prepareData(data);
            var filmDisplay = document.getElementById('film-display');

            // we're going to use another method defined above to clear out any
            // prior searches the user might have made.
            removePreviousSearch(filmDisplay);

            // so now we have access to some data from the OMDB API by way of 
            // the routes we defined. Here we're iterating over a an array of
            // of objects contained in the initial json.
            for (var i = 0; i < filmData["Search"].length; i++) {
                // now we're using some sweet JS DOM methods to create the html
                // we need to display those results in a clear way to the user.
                var div = document.createElement('div');
                var ul = document.createElement('ul');
                var button = document.createElement('button');

                // here we're thinking ahad a little bit and assigning unique
                // id's and classes to the divs we create so when we traverse 
                // the dom later to let users favorite movies we can easily see
                // what they're clicking and pull data from within it.
                filmDisplay.appendChild(div);
                div.setAttribute("id", filmData["Search"][i]["imdbID"]);
                div.setAttribute("class", "movie");

                // here rather than using a listener in our js file 
                // we're using an html listner. This is because the element 
                // doesn't exist when this page first loads so we need to 
                // dynamically set a new listener. You'll see it's going to call
                // the expand method we defined above and pass the id of the div
                // which we cleverly assigned to the id of the movie  on lines 136
                div.setAttribute("onclick", "expand(this.id)");
                div.appendChild(ul);

                for (var key in filmData["Search"][i]) {
                    if (filmData["Search"][i].hasOwnProperty(key)) {
                        var li = document.createElement('li');
                        var text = '<h4>' + key + ": </h4>" + "<span class='val'>" + filmData["Search"][i][key] + "</span>";
                        var movieDiv = document.getElementById(filmData["Search"][i]["imdbID"]);
                        movieDiv.firstChild.appendChild(li).innerHTML = text;
                    };
                }
             }
        })
    });
});
