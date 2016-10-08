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

//  C++ Standard Library
#include <string>
#include <iostream>
#include <cstdlib>

// BOOST JSON and format 
#include <boost/property_tree/ptree.hpp>
#include <boost/property_tree/json_parser.hpp>
#include <boost/format.hpp>

// FastCGI API
#include "fcgio.h"
#include "fcgi_config.h"

static const long MAX_STDIN = 10240; // Maximum to read for content

using namespace std;

#include "Contact.hpp"

// Construct contact object from request data

Contact::Contact(FCGX_Request *request) {

    populate(request);

}

// Parse content of HTTP request to extract JSON

void Contact::getJSONString(FCGX_Request * request, std::stringstream *jsonString) {

    char * jsonLenStr = FCGX_GetParam("CONTENT_LENGTH", request->envp);
    unsigned long jsonLen = MAX_STDIN;
    char *json;

    if (jsonLenStr) {

        jsonLen = strtol(jsonLenStr, &jsonLenStr, 10);
        if (*jsonLenStr) {
            // clog_error(CLOG(MY_LOGGER), "can't parse \"CONTENT_LENGTH=%s", FCGX_GetParam("CONTENT_LENGTH", request->envp));
            jsonLen = MAX_STDIN;
        }

        // *always* put a cap on the amount of data that will be read
        if (jsonLen > MAX_STDIN) jsonLen = MAX_STDIN;

        json = new char[jsonLen + 1];
        memset(json, 0x0, jsonLen + 1);

        cin.read(json, jsonLen);
        *jsonString << json;

        if (json) delete []json;

    }

}

// From extracted JSON string convert and populate fields.

void Contact::populate(FCGX_Request *request) {

    std::stringstream jsonString;
    boost::property_tree::ptree pt;

    getJSONString(request, &jsonString);
    boost::property_tree::read_json(jsonString, pt);

    this->firstName = pt.get<std::string>("firstName");
    this->lastName = pt.get<std::string>("lastName");
    this->phoneNumber = pt.get<std::string>("phoneNumber");
    this->emailAddress = pt.get<std::string>("emailAddress");
    this->webSiteAddress = pt.get<std::string>("webSiteAddress");
    this->comments = pt.get<std::string>("comments");

}

// From contact object make UPDATE query.

void Contact::updateQuery(FCGX_Request *request, std::string& query) {

    char *uri;

    uri = FCGX_GetParam("REQUEST_URI", request->envp);
    if (strncmp(uri, "/contacts/", strlen("/contacts/")) == 0) {
        query = boost::str(boost::format("UPDATE contacts SET firstName=\"%s\", lastName=\"%s\", phoneNumber=\"%s\", emailAddress=\"%s\", webSiteAddress=\"%s\", comments=\"%s\" WHERE contactID=%s") %
                this->firstName.c_str() % this->lastName.c_str() % this->phoneNumber.c_str() % this->emailAddress.c_str() % this->webSiteAddress.c_str() % this->comments.c_str() % &uri[10]);
    }

}

// From contact object make INSERT query.

void Contact::insertQuery(FCGX_Request *request, std::string& query) {

    query = boost::str(boost::format("INSERT INTO contacts (firstName, lastName, phoneNumber, emailAddress, webSiteAddress, comments) VALUES (\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\")") %
            this->firstName.c_str() % this->lastName.c_str() % this->phoneNumber.c_str() % this->emailAddress.c_str() % this->webSiteAddress.c_str() % this->comments.c_str());
}

// From contact object make DELETE query.

void Contact::deleteQuery(FCGX_Request *request, std::string& query) {

    char *uri;

    uri = FCGX_GetParam("REQUEST_URI", request->envp);
    if (strncmp(uri, "/contacts/", strlen("/contacts/")) == 0) {
        query = "DELETE FROM contacts WHERE contactID = ";
        query += std::string(&uri[10]);
    }

}

// From contact object make SELECT query for all or a particular row.

void Contact::getQuery(FCGX_Request *request, std::string& query) {

    char *uri;
    
    uri = FCGX_GetParam("REQUEST_URI", request->envp);

    if ((strcmp(uri, "/contacts") == 0) || (strcmp(uri, "/contacts/") == 0)) {
        query = "SELECT * FROM contacts";
    } else if (strncmp(uri, "/contacts/", strlen("/contacts/")) == 0) {
        query = "SELECT * FROM contacts WHERE contactID = ";
        query += std::string(&uri[10]);
    }

}