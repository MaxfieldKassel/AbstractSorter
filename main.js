function openFileDialog() {
    //Get the file path
    var filePath = document.getElementById("filePath").value;
    console.log(filePath);
    var errorText = document.getElementById("errorText");
    //Check if the file path is empty
    if (filePath == "") {
        errorText.innerHTML = "Please select a file!";
        return;
    }
    //Check if the file path is valid
    if (!filePath.endsWith(".csv")) {
        errorText.innerHTML = "Please select a csv file!";
        return;
    }

    //Read the file as a CSV into an array
    var file = new File(filePath);
    var reader = new FileReader();
    reader.onload = function (e) {
        var data = e.target.result;
        var lines = data.split("\r");

        var result = [];
        var headers = lines[0].split(",");
        for (var i = 1; i < lines.length; i++) {
            var obj = {};
            var currentLine = lines[i].split(",");
            for (var j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentLine[j];
            }
            result.push(obj);
        }
        //Store the data in the session storage
        sessionStorage.setItem("data", result);
    }

    reader.readAsText(file);
    //Store the file in the session storage
    sessionStorage.setItem("file", file);
    sessionStorage.setItem("currentIndex", 0);
    //Redirect to the sorting page
    //window.location.href = "sorting.html";
}



//Add onload event listener
window.addEventListener("load", function () {

    if (sessionStorage.getItem("fileData") == null) {
        var resumeButton = document.getElementById("resumeButton");
        resumeButton.disabled = true;
    }
    if (sessionStorage.getItem("fileData") != null) {
        //Show the resume button and set the text to <current index> / <total number of rows>
        var resumeButton = document.getElementById("resumeButton");
        resumeButton.style.display = "block";
        resumeButton.innerHTML = "Resume (" + sessionStorage.getItem("currentIndex") + " / " + JSON.parse(sessionStorage.getItem("fileData")).length + ")";

        //Add onclick event listener to the resume button
        resumeButton.addEventListener("click", function () {
            window.location.href = "sorting.html";
        })
    }

    document.getElementById('filePath')
        .addEventListener('change', function () {
            var fr = new FileReader();
            fr.onload = function () {
                sessionStorage.setItem("header", fr.result.split("\r")[0]);
                var data = fr.result.split("\r").slice(1);
                try {
                    sessionStorage.setItem("fileData", JSON.stringify(data));
                } catch (e) {
                    alert("The file is too large!");
                    return
                }
                sessionStorage.setItem("currentIndex", 0);
                window.location.href = "sorting.html";
            }


            fr.readAsText(this.files[0]);
        })
})