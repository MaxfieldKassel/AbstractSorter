var searchTerms = [
    ["Artificial", "Intelligence", "Simulation", "Autonomous", "simulator", "simulated", "simulation"],
    ["Robot", "Robotics", "Robots", "Machine"],
    ["Air", "Land", "Sea", "Boat", "Car", "Train", "Truck", "Vehicle"],
    ["fidelity", "physical", "psychological", "visual", "transfer", "train"],
    ["real", "world"]
]
var colors = ["Orange", "Blue", "Green", "Red", "Pink"]
var radioButtons = document.getElementsByName("sort");



window.addEventListener("keydown", function (e) {
    if (e.key == "ArrowLeft") {
        previous()
    } else if (e.key == "ArrowRight") {
        next()
    } else if (e.key == "ArrowUp") {
        up()
    } else if (e.key == "ArrowDown") {
        down()
    }
})

//Check if the user has unsaved changes
window.addEventListener("beforeunload", function (e) {
    if (!unsaved) {
        return undefined;
    }
    var confirmationMessage = 'It looks like you have been editing something. '
        + 'If you leave before saving, your changes will be lost.';

    (e || window.event).returnValue = confirmationMessage; //Gecko + IE
    return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
});


window.addEventListener("load", function () {
    //Load the data from the session storage
    this.unsaved = this.sessionStorage.getItem("unsaved");
    this.currentIndex = parseInt(this.sessionStorage.getItem("currentIndex"));
    this.data = JSON.parse(this.sessionStorage.getItem("fileData"));

    if (this.data == null) {
        //Alert the user that there is no data to sort
        alert("There is no data to sort. Please upload a file to sort.");
        //Redirect to the upload page
        window.location.href = "main.html";
        return;
    }

    //Disable next and previous buttons if the current index is 0 or the data length - 1
    if (this.currentIndex == 0) {
        document.getElementById("prevButton").disabled = true;
    } else if (this.currentIndex == this.data.length - 1) {
        document.getElementById("nextButton").disabled = true;
    }

    //Set the title to the first index of the current row of the data (along with the current index/total number of rows)
    var row = csvStringToArray(this.data[this.currentIndex])
    document.getElementById("title").innerHTML = row[0] + " (" + (parseInt(this.currentIndex) + 1) + " / " + this.data.length + ")";

    //Get the abstract and highlight the search terms
    var text = row[2].toLowerCase();

    for (var i = 0; i < searchTerms.length; i++) {
        for (var j = 0; j < searchTerms[i].length; j++) {
            text = highlight(text, searchTerms[i][j], colors[i]);
        }
    }

    document.getElementById("text").innerHTML = text;

    //Check if the user has already selected a value for the current row, if so then check the radio button with the same id as the selected value
    if (row[6] != "") {
        var selected = row[6];
        for (var i = 0; i < radioButtons.length; i++) {
            if (radioButtons[i].id == selected) {
                radioButtons[i].checked = true;
                break;
            }
        }
    }
})

//Add the user selected value to the current row of the data and save the data to the session storage
function saveRow() {
    var row = csvStringToArray(this.data[this.currentIndex]);
    var selected = "";

    for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked) {
            selected = radioButtons[i].id;
            break;
        }
    }
    row[6] = selected;
    this.data[this.currentIndex] = row.join(",");
    sessionStorage.setItem("fileData", JSON.stringify(this.data));
    this.unsaved = true;
    sessionStorage.setItem("unsaved", unsaved);
}

//Save the file to the user's computer
function saveFile() {
    this.unsaved = false;
    var header = sessionStorage.getItem("header");
    var data = JSON.parse(sessionStorage.getItem("fileData"));
    var csvContent = "data:text/csv;charset=utf-8," + header + "\r";
    for (var i = 0; i < data.length; i++) {
        csvContent += data[i] + "\r";
    }
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    //Save the file as sorted-<current date/time>.csv
    link.setAttribute("download", "sorted-" + new Date().toISOString().replace(/:/g, "-") + ".csv");
    document.body.appendChild(link); // Required for FF
    //Save the file
    link.click();
    //Remove the link
    document.body.removeChild(link);
}

function reload() {
    this.unsaved = false;
    window.location.reload();
}


function next() {
    saveRow()
    var totalRows = JSON.parse(sessionStorage.getItem("fileData")).length;
    var currentIndex = parseInt(sessionStorage.getItem("currentIndex"));
    if (currentIndex < totalRows - 1) {
        currentIndex++;
        sessionStorage.setItem("currentIndex", currentIndex);
        //Redirect to the sorting page
        reload()
    }
}

function previous() {
    saveRow()
    var currentIndex = parseInt(sessionStorage.getItem("currentIndex"));
    if (currentIndex > 0) {
        currentIndex--;
        sessionStorage.setItem("currentIndex", currentIndex);
        //Redirect to the sorting page
        reload()
    }
}

function up() {
    for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked) {
            if (i != 0) {
                radioButtons[i - 1].checked = true;
                break;
            }
        }
    }
}

function down() {
    for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked) {
            if (i != radioButtons.length - 1) {
                radioButtons[i + 1].checked = true;
                break;
            }
        }
    }
}

function back() {
    //If there are unsaved changes then ask the user if they want to save the file
    if (this.unsaved) {
        var save = confirm("You have unsaved changes. Would you like to save the file?");
        if (save) {
            saveFile();
        }
    }
    //Redirect to the upload page
    window.location.href = "main.html";
}

function highlight(text, searchTerm, color) {
    var index = text.indexOf(searchTerm);
    while (index >= 0) {
        text = text.substring(0, index) + "<span style='background-color: " + color + "'>" + text.substring(index, index + searchTerm.length) + "</span>" + text.substring(index + searchTerm.length);
        index = text.indexOf(searchTerm, index + 1 + ("<span style='background-color: " + color + "'>").length)
    }
    return text
}

function csvStringToArray(text) {
    text = text.replace("\"\"", "");
    var row = [];
    var current = 0;
    for (var j = 0; j < text.length; j++) {
        //Check if the current character is a comma if so take the substring from the last comma to the current comma
        if (text[j] == ",") {
            row.push(text.substring(current, j).replace("", "\"\""));
            current = j + 1;
        } else if (text[j] == "\"") {
            do {
                j++;
            } while (text[j] != "\"");
        }
        if (j == text.length - 1) {
            row.push(text.substring(current, j + 1).replace("", "\"\""));
        }
    }
    return row;

}



function csvArrayToString(array) {
    var text = "";
    for (var i = 0; i < array.length; i++) {
        if (i != 0) {
            text += ",";
        }
        text += array[i];
    }
    return text;
}