/* 
 * The MIT License
 *
 * Copyright 2016 Robert Tizzard.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var  kHOSTSERVER = "http://localhost:8081";

// AJAX request object for talking to server 

var ajaxRequest = new XMLHttpRequest();

// On document load Javascript initialisation code

window.onload = function () {

    // Setup AJAX request object given the browser incompatibilites in this
    // area using a well documented technique.

    try {
        // Opera 8.0+, Firefox, Safari
        ajaxRequest = new XMLHttpRequest();
    } catch (e) {

        // Internet Explorer Browsers
        try {
            ajaxRequest = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {

            try {
                ajaxRequest = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {

                // Something went wrong
                alert("Your browser broke!");
                return false;
            }
        }


    }

    // Get all contacts  on start.

    getAllContacts();

};

// If first and last name empty retun false.

 function validContactData() {

    if (document.getElementById('firstName').value === "" ||
            document.getElementById('lastName').value === "") {
        displayStatus("color:red;", "Error: First and Last names must not be empty.");
        return(false);
    }

    // Data Ok
    
    return(true);
}

// Display a message in satus area.

function displayStatus(style, message) {

    if (style !== "") {
        document.getElementById("serverReply").style = style;
    }
    document.getElementById("serverReply").innerHTML = message;


}

// Clear contact details form

function clearContactDetails() {

    document.getElementById('firstName').value = "";
    document.getElementById('lastName').value = "";
    document.getElementById('phoneNumber').value = "";
    document.getElementById('emailAddress').value = "";
    document.getElementById('webSiteAddress').value = "http://";
    document.getElementById('comments').value = "";

    displayStatus("", "");

}

// Reset contact update form back to add contact form and redisplay
// all contacts.

function cancelContactUpdate() {

    clearContactDetails();

    document.getElementById("firstName").readOnly = false;
    document.getElementById("lastName").readOnly = false;

    document.getElementById("saveForm").value = "Add";
    document.getElementById("saveForm").onclick = createContact;
    document.getElementById("clearForm").value = "Clear";
    document.getElementById("clearForm").onclick = clearContactDetails;

    getAllContacts();

}

// Add contact to database

function createContact() {

    // if contact data invalid then don't send.
    
    if (!validContactData()) {
        return;
    }
    
    // Add contact HTTP response recieved callback

    ajaxRequest.onreadystatechange = function () {

        if (this.readyState === 4) {

            // Unpack JSON response and display any errors.

            var reply = JSON.parse(this.responseText);

            if (reply.affectedRows && (reply.affectedRows === 1)) {
                displayStatus("color:black;", "Create sucessful.");
            } else if (reply.code && reply.errno) {
                displayStatus("color:red;", "SQL Error : " + reply.errno + " (" + reply.code + ").");
            } else if (reply.code && (reply.code === 100)) {
                displayStatus("color:red;", reply.status);
            }

            // Redisplay all contacts including addition

            getAllContacts();
            
        }
    };

    // Make add contact request to server.
    // First extracting form data and creating contact JSON

    var firstName = document.getElementById('firstName').value;
    var lastName = document.getElementById('lastName').value;
    var phoneNumber = document.getElementById('phoneNumber').value;
    var emailAddress = document.getElementById('emailAddress').value;
    var webSiteAddress = document.getElementById('webSiteAddress').value;
    var comments = document.getElementById('comments').value;
    var contactJSON = {firstName: firstName, lastName: lastName, phoneNumber: phoneNumber,
        emailAddress: emailAddress, webSiteAddress: webSiteAddress, comments: comments};

    // POST add contact request with JSON data

    ajaxRequest.open("POST", kHOSTSERVER+"/contacts", true);
    ajaxRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    ajaxRequest.send(JSON.stringify(contactJSON));

}

// Make get all contacts reuqest to server

function getAllContacts()

{
    // Get all contacts HTTP response recieved callback

    ajaxRequest.onreadystatechange = function () {

        if (ajaxRequest.readyState === 4) {

            // Take reponse and convert it to rows of contacts JSON.
            // If there are contacts to display create table and push to page.
            // Also setup action buttons for update and delete.
            // Otherwise display any error reply.

            var rows = JSON.parse(ajaxRequest.responseText);
            var table = "<table align=\"center\" style=\"width:50%\"><tr><th>Last Name</th><th>First Name</th><th>Phone No</th><th>Email</th><th>Web Site</th><th>Action</th></tr>";
            if (rows.length !== 0) {
    		for (var row in rows) {
                    table += "<tr><td>" + rows[row].lastName + "</td>";
                    table += "<td>" + rows[row].firstName + "</td>";
                    table += "<td>" + rows[row].phoneNumber + "</td>";
                    table += "<td>" + rows[row].emailAddress + "</td>";
                    table += "<td>" + rows[row].webSiteAddress + "</td>";
                    table += '<td><button type="button" name="Update" onclick="getContact(' + row + ')">Update</button>';
                    table += '<button type="button" name="Delete" onclick="deleteContact(' + row + ')">Delete</button></td>';
                    table += "</tr>";
                }
                table += "</table>";
                document.getElementById("reply").innerHTML = table;

            } else {
                document.getElementById("reply").innerHTML = table;
            }

        }
    };

    // Make get all contact details GET reuqest.

    ajaxRequest.open("GET", kHOSTSERVER+"/contacts", true);
    ajaxRequest.send(null);


}

// Make delete contact request to server.

function deleteContact(contactID) {

    // Delete contact  HTTP response recieved callback

    ajaxRequest.onreadystatechange = function () {
        if (ajaxRequest.readyState === 4) {
            var reply = JSON.parse(ajaxRequest.responseText);
            console.log(ajaxRequest.responseText);
            if (reply.affectedRows && (reply.affectedRows === 1)) {
                clearContactDetails();
                displayStatus("color:black;", "Delete sucessful.");
            } else if (reply.code && reply.errno) {
                displayStatus("color:red;", "SQL Error : " + reply.errno + " (" + reply.code + ").");
            } else if (reply.code && (reply.code === 100)) {
                displayStatus("color:red;", reply.status);
            }
            getAllContacts();
        }
    };

    // Create contact key JSON and make DELETE reuqest.

    var contactJSON = {firstName: firstName, lastName: lastName};

    ajaxRequest.open("DELETE", kHOSTSERVER+"/contacts/"+contactID, true);
    ajaxRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    ajaxRequest.send(null); 

}

// Make get contact request to server

function getContact(contactID) {

    // Get contact HTTP response received callback

    ajaxRequest.onreadystatechange = function () {

        if (ajaxRequest.readyState === 4) {

            // Create contact JSON data and populate update form.
            // Change buttons to Update/Cancel and the actions

            var contactJSON = JSON.parse(ajaxRequest.responseText);

            document.getElementById('firstName').value = contactJSON[contactID].firstName;
            document.getElementById('lastName').value = contactJSON[contactID].lastName;
            document.getElementById('phoneNumber').value = contactJSON[contactID].phoneNumber;
            document.getElementById('emailAddress').value = contactJSON[contactID].emailAddress;
            document.getElementById('webSiteAddress').value = contactJSON[contactID].webSiteAddress;
            document.getElementById('comments').value = contactJSON[contactID].comments;

            document.getElementById("firstName").readOnly = true;
            document.getElementById("lastName").readOnly = true;
            document.getElementById("reply").innerHTML = "";

            document.getElementById("saveForm").value = "Update";
            document.getElementById("saveForm").onclick = function(){ updateContact(contactID); };
            document.getElementById("clearForm").value = "Cancel";
            document.getElementById("clearForm").onclick = cancelContactUpdate;
        }
    };

    // Create contact key JSON and make GET reuqest.

    ajaxRequest.open("GET", kHOSTSERVER+"/contacts/"+contactID, true);
    ajaxRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    ajaxRequest.send(null);

}

// Make update contact request to server.

function updateContact(contactID) {

    // Update  contact HTTP response received callback

    ajaxRequest.onreadystatechange = function () {

        if (ajaxRequest.readyState === 4) {

            // Create reply JSON.
            // Display status according to success or failure.
            // Switch back form add from update.
            // And display new contacts table.

            var reply = JSON.parse(ajaxRequest.responseText);

            if (reply.affectedRows && (reply.affectedRows === 1)) {
                clearContactDetails();
                displayStatus("color:black;", "Update sucessful.");
            } else if (reply.code && reply.errno) {
                displayStatus("color:red;", "SQL Error : " + reply.errno + " (" + reply.code + ").");
            } else if (reply.code && (reply.code === 100)) {
                displayStatus("color:red;", reply.status);
            }
            
            document.getElementById("firstName").readOnly = false;
            document.getElementById("lastName").readOnly = false;

            document.getElementById("saveForm").value = "Add";
            document.getElementById("saveForm").onclick = createContact;
            document.getElementById("clearForm").value = "Clear";
            document.getElementById("clearForm").onclick = clearContactDetails;

            getAllContacts();
            
        }
    };

    // Make update contact request to server.
    // First extracting form data and creating contact JSON

    var firstName = document.getElementById('firstName').value;
    var lastName = document.getElementById('lastName').value;
    var phoneNumber = document.getElementById('phoneNumber').value;
    var emailAddress = document.getElementById('emailAddress').value;
    var webSiteAddress = document.getElementById('webSiteAddress').value;
    var comments = document.getElementById('comments').value;
    var contactJSON = { firstName: firstName, lastName: lastName, phoneNumber: phoneNumber,
        emailAddress: emailAddress, webSiteAddress: webSiteAddress, comments: comments};

    ajaxRequest.open("PUT", kHOSTSERVER+"/contacts/"+contactID, true);
    ajaxRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    ajaxRequest.send(JSON.stringify(contactJSON));

}