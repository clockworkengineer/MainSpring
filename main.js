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

// Import and setup express framework

var express = require('express');
var app = express();

// Import HTML Body parser middleware

var bodyParser = require('body-parser');

// Import and setup SQL interface.
// 
// ./contact_mysql.js  = MYSQL
// ./contact_sqlite.js = SQLITE

var contactSQL = require("./contact_sqlite.js");

// Reply with unmodified JSON rows

function jsonNULLModifier(rows) {

    return(rows);

}

// Modify rows to be format { ContactID : {"firstName" : firstName, ...},
//                            ContactID : {"firstName" : firstName, ...}, ...

function jsonModifier(rows) {

    var jsonRows = {};
    for (var i = 0; i < rows.length; i++) {
        var obj = rows[i];
        jsonRows[obj.contactID] = {"firstName": obj.firstName, "lastName": obj.lastName,
            "phoneNumber": obj.phoneNumber, "emailAddress": obj.emailAddress,
            "webSiteAddress": obj.webSiteAddress, "comments": obj.comments};
    }
    return(jsonRows);

}

// Create express static HTML server.

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('forms'));

// Create new contact handler

app.post("/contacts", function (req, res) {

    var query = "INSERT INTO contacts (firstName, lastName, phoneNumber, emailAddress, webSiteAddress, comments) VALUES ('"
            + req.body.firstName + "','"
            + req.body.lastName + "','"
            + req.body.phoneNumber + "','"
            + req.body.emailAddress + "','"
            + req.body.webSiteAddress + "','"
            + req.body.comments + "');";

    contactSQL.handleSQLQuery(query, req, res, jsonNULLModifier);

});

// Get all contacts handler

app.get("/contacts", function (req, res) {

    var query = "SELECT * FROM contacts";

    contactSQL.handleSQLQuery(query, req, res, jsonModifier);

});

// Delete contact handler

app.delete("/contacts/:contactID", function (req, res) {

    var query = "DELETE FROM contacts WHERE contactID = " + req.params.contactID;

    contactSQL.handleSQLQuery(query, req, res, jsonNULLModifier);

});

// Get contact details handler

app.get("/contacts/:contactID", function (req, res) {

    var query = "SELECT * FROM contacts WHERE contactID = " + req.params.contactID;

    contactSQL.handleSQLQuery(query, req, res, jsonModifier);

});

// Update contact handler

app.put("/contacts/:contactID", function (req, res) {

    var query = "UPDATE contacts  SET "
            + "firstName='" + req.body.firstName
            + "',lastName='" + req.body.lastName
            + "',phoneNumber='" + req.body.phoneNumber
            + "', emailAddress='" + req.body.emailAddress
            + "',webSiteAddress='" + req.body.webSiteAddress
            + "',comments='" + req.body.comments
            + "' WHERE contactID = " + req.params.contactID;

    contactSQL.handleSQLQuery(query, req, res, undefined);

});

// Start server.

var server = app.listen(8081, function () {

    var host = server.address().address;
    var port = server.address().port;

    contactSQL.initSQL();

    console.log("Contact DB App listening at http://%s:%s", host, port);

});