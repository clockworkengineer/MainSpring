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

// Logging API
#define CLOG_MAIN
#include "clog.h"

// FastCGI API
#include "fcgio.h"
#include "fcgi_config.h"

// contactcgi classes 
#include "SQLDB.hpp"
#include "Contact.hpp"

// Local constants
static const int MY_LOGGER = 0;     // Unique identifier for logger

using namespace std;

SQLDB * SQLDB::m_pInstance = NULL;  // Instance variable for SQLDB

// PUT request handler.

void handle_put(FCGX_Request *request) {

    clog_info(CLOG(MY_LOGGER), "[PUT REQUEST %s]", FCGX_GetParam("REQUEST_URI", request->envp));

    try {

        Contact cont(request);
        std::string query;

        cont.updateQuery(request, query);

        if (!query.empty()) {
            SQLDB::Instance()->query(query.c_str());
            SQLDB::Instance()->jsonStatus();
        }

    } catch (std::exception const& e) {
        clog_error(CLOG(MY_LOGGER), "%s", e.what());
    }

    clog_info(CLOG(MY_LOGGER), "[PUT REQUEST Exit.]");

}

// POST request handler

void handle_post(FCGX_Request *request) {

    clog_info(CLOG(MY_LOGGER), "[POST REQUEST %s]", FCGX_GetParam("REQUEST_URI", request->envp));

    try {

        Contact cont(request);
        std::string query;
  
        cont.insertQuery(request, query);
    
        if (!query.empty()) {
            SQLDB::Instance()->query(query.c_str());
            SQLDB::Instance()->jsonStatus();
        }

    } catch (std::exception const& e) {
        clog_error(CLOG(MY_LOGGER), "%s", e.what());
    }

    clog_info(CLOG(MY_LOGGER), "[POST REQUEST Exit.]");

}

// DELETE request handler

void handle_delete(FCGX_Request *request) {

 
    clog_info(CLOG(MY_LOGGER), "[DELETE REQUEST %s]", FCGX_GetParam("REQUEST_URI", request->envp));

    try {

        Contact cont;
        std::string query;
         
        cont.deleteQuery(request, query);
        
        if (!query.empty()) {
            SQLDB::Instance()->query(query.c_str());
            SQLDB::Instance()->jsonStatus();
        }

    } catch (std::exception const& e) {
        clog_error(CLOG(MY_LOGGER), "%s", e.what());
    }

    clog_info(CLOG(MY_LOGGER), "[DELETE REQUEST Exit.]");

}

// GET request handler

void handle_get(FCGX_Request *request) {

    clog_info(CLOG(MY_LOGGER), "[GET REQUEST %s]", FCGX_GetParam("REQUEST_URI", request->envp));

    try {

        Contact cont;
        std::string query;
        
        cont.getQuery(request, query);
        
        if (!query.empty()) {
            SQLDB::Instance()->query(query.c_str());
            SQLDB::Instance()->jsonRows();
        }

    } catch (std::exception const& e) {
        clog_error(CLOG(MY_LOGGER), "%s", e.what());
    }

    clog_info(CLOG(MY_LOGGER), "[GET RESUQEST Exit.]");

}

// Router for request handlers
void handle_request(FCGX_Request *request) {

    if (strcmp(FCGX_GetParam("REQUEST_METHOD", request->envp), "GET") == 0) {
        handle_get(request);
    } else if (strcmp(FCGX_GetParam("REQUEST_METHOD", request->envp), "PUT") == 0) {
        handle_put(request);
    } else if (strcmp(FCGX_GetParam("REQUEST_METHOD", request->envp), "POST") == 0) {
        handle_post(request);
    } else if (strcmp(FCGX_GetParam("REQUEST_METHOD", request->envp), "DELETE") == 0) {
        handle_delete(request);
    }

}

int main(int argc, char* argv[]) {

    streambuf * cin_streambuf = cin.rdbuf();
    streambuf * cout_streambuf = cout.rdbuf();
    streambuf * cerr_streambuf = cerr.rdbuf();

    FCGX_Request request;

    // Initialize the logger 

    if (clog_init_path(MY_LOGGER, "contactscgi.txt") != 0) {
        cerr << "Logger initialization failed.\n";
        return (1);
    }

    // Set minimum log level to info (default: debug) 

    clog_set_level(MY_LOGGER, CLOG_INFO);

    clog_info(CLOG(MY_LOGGER), "Starting Contacts CGI ...");

    // Initialise FastCGI 
    
    FCGX_Init();
    FCGX_InitRequest(&request, 0, 0);

    // Connect to SQL Database
    
    SQLDB::Instance()->open();

    // Wait for a request and process
    
    while (FCGX_Accept_r(&request) == 0) {

        // Save away cin/cout/cerr and redirect for FastCGI.
        
        fcgi_streambuf cin_fcgi_streambuf(request.in);
        fcgi_streambuf cout_fcgi_streambuf(request.out);
        fcgi_streambuf cerr_fcgi_streambuf(request.err);

        cin.rdbuf(&cin_fcgi_streambuf);
        cout.rdbuf(&cout_fcgi_streambuf);
        cerr.rdbuf(&cerr_fcgi_streambuf);

        handle_request(&request);   // Handle request

    }

    // Clean up code.

    // Restore cin/cout/cerr buffers.
    
    cin.rdbuf(cin_streambuf);
    cout.rdbuf(cout_streambuf);
    cerr.rdbuf(cerr_streambuf);

    // Close connection to SQL database.
    
    SQLDB::Instance()->close();

    // Close down logger.
    
    clog_info(CLOG(MY_LOGGER), "Closing Down Contacts CGI.");
    clog_free(MY_LOGGER);

    return 0;
}
