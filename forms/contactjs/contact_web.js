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

var kHOSTSERVER = "http://localhost:8081";  // server and port for AJAX reuqests

// On document ready initialisation code

$("document").ready(function () {

    // Clear contacts form and initialise buttons.

    cancelContactUpdate();

});

// If first and last name empty return false.

function validContactData() {

    if (($("#firstName").val() === "") || ($("#lastName").val() === "")) {
        displayStatus("red", "Error: First and Last names must not be empty.");
        return(false);
    }

    // Data Ok

    return(true);
}

// Display a message in satus area in in given colour.

function displayStatus(colour, message) {

    if (colour !== "") {
        $("#serverReply").css({"color": colour});
    }
    $("#serverReply").text(message);


}

// Clear contact details form.

function clearContactDetails() {

    $("#firstName").val("");
    $("#lastName").val("");
    $("#phoneNumber").val("");
    $("#emailAddress").val("");
    $("#webSiteAddress").val("http://");
    $("#comments").val("");

    displayStatus("", "");

}

// Reset contact update form back to add contact form and redisplay
// all contacts.

function cancelContactUpdate() {

    clearContactDetails();

    $("#firstName").prop("readonly", false);
    $("#lastName").prop("readonly", false);

    $("#saveForm").val("Add");
    $("#saveForm").unbind();
    $("#saveForm").click(createContact);
    $("#clearForm").val("Clear");
    $("#clearForm").unbind();
    $("#clearForm").click(clearContactDetails);

    getAllContacts();

}

// Make create contact request to server.

function createContact() {

    // If contact data invalid then don't send.

    if (!validContactData()) {
        return;
    }

    // Make create contact request to server.
    // First extracting form data and creating contact JSON.

    var contactJSON = {};

    $('.element').each(function () {
        contactJSON[this.name] = this.value;
    });

    // POST create contact request with JSON data.

    $.ajax({
        url: kHOSTSERVER + "/contacts",
        type: "post",
        data: JSON.stringify(contactJSON),
        dataType: "json",
        contentType: "application/json; charset=utf-8"
    }).done(function (reply) {

        if (reply.affectedRows && (reply.affectedRows === 1)) {
            displayStatus("black", "Create sucessful.");
        } else if (reply.code && reply.errno) {
            displayStatus("red", "SQL Error : " + reply.errno + " (" + reply.code + ").");
        } else if (reply.code && (reply.code === 100)) {
            displayStatus("red", reply.status);
        }

        // Redisplay all contacts including addition

        getAllContacts();

    });
}


// Make get all contacts request to server.

function getAllContacts() {


    $.ajax({
        url: kHOSTSERVER + "/contacts",
        type: "get"
    }).done(function (rows) {

        // Build table from data recieved

        $("#reply").html("");
        var table = "<table id=\"tabletop\" align=\"center\" style=\"width:50%\"><tr><th>Last Name</th><th>First Name</th><th>Phone No</th><th>Email</th><th>Web Site</th><th>Action</th></tr>";
        $("#reply").append(table);
        if (rows.length !== 0) {

            for (var row in rows) {
                table = "<tr><td>" + rows[row].lastName + "</td><td>" + rows[row].firstName + "</td><td>" + rows[row].phoneNumber + "</td><td>" + rows[row].emailAddress + "</td><td>" + rows[row].webSiteAddress + "</td>";
                table += '<td><button type="button" name="Update" onclick="getContact(' + row + ')">Update</button><button type="button" name="Delete" onclick="deleteContact(' + row + ')">Delete</button></td></tr>';
                $("#tabletop").append(table);
            }

        } else {
            $("#reply").html(table);
        }

    });

}

// Make delete contact request to server.

function deleteContact(contactID) {

    $.ajax({
        url: kHOSTSERVER + "/contacts/" + contactID,
        type: "delete"
    }).done(function (reply) {

        if (reply.affectedRows && (reply.affectedRows === 1)) {
            clearContactDetails();
            displayStatus("black", "Delete sucessful.");
        } else if (reply.code && reply.errno) {
            displayStatus("red", "SQL Error : " + reply.errno + " (" + reply.code + ").");
        } else if (reply.code && (reply.code === 100)) {
            displayStatus("red", reply.status);
        }
        getAllContacts();
    });

}

// Make get contact request to server.

function getContact(contactID) {

    // Create contact key JSON and make GET reuqest.

    $.ajax({
        url: kHOSTSERVER + "/contacts/" + contactID,
        type: "get"
    }).done(function (contactJSON) {

        // Populate update form with recieved data.
        // Change buttons to Update/Cancel and the actions

        for (var field in contactJSON[contactID]) {
            $('[name="' + field + '"]').val(contactJSON[contactID][field]);
        }

        $("#firstName").prop("readonly", true);
        $("#lastName").prop("readOnly", true);
        $("#reply").html("");

        $("#saveForm").val("Update");
        $("#saveForm").unbind();
        $("#saveForm").click(function () {
            updateContact(contactID);
        });
        $("#clearForm").val("Cancel");
        $("#clearForm").unbind();
        $("#clearForm").click(cancelContactUpdate);

    });
}

// Make update contact request to server.

function updateContact(contactID) {

    // Make update contact request to server.
    // First extracting form data and creating contact JSON

    var contactJSON = {};

    $('.element').each(function () {
        console.log(this.name + ': ' + this.value);
        contactJSON[this.name] = this.value;
    });

    $.ajax({
        url: kHOSTSERVER + "/contacts/" + contactID,
        type: "put",
        data: JSON.stringify(contactJSON),
        dataType: "json",
        contentType: "application/json; charset=utf-8"
    }).done(function (reply) {

        // Create reply JSON.
        // Display status according to success or failure.
        // Switch back form add from update.
        // And display new contacts table.

        if (reply.affectedRows && (reply.affectedRows === 1)) {
            clearContactDetails();
            displayStatus("black", "Update sucessful.");
        } else if (reply.code && reply.errno) {
            displayStatus("red", "SQL Error : " + reply.errno + " (" + reply.code + ").");
        } else if (reply.code && (reply.code === 100)) {
            displayStatus("red", reply.status);
        }

        $("#firstName").prop("readonly", false);
        $("#lastName").prop("readonly", false);

        $("#saveForm").val("Add");
        $("#saveForm").unbind();
        $("#saveForm").click(createContact);
        $("#clearForm").val("Clear");
        $("#clearForm").unbind();
        $("#clearForm").click(clearContactDetails);

        getAllContacts();

    });
}
