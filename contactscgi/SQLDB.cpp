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

// MySQL
#include "mysql.h"

// Class definitions
#include "SQLDB.hpp"

using namespace std;

// Return Singleton instance of SQLDB class

SQLDB* SQLDB::Instance(void) {

    if (!m_pInstance) // Only allow one instance of class to be generated.
        m_pInstance = new SQLDB;

    return m_pInstance;

}

// Open connection to MySQL server

void SQLDB::open(void) {

    // Return if already active
    
    if (con) {
        return;
    }
    
    // Read account details and use them in connect
    
    boost::property_tree::ptree pt;
    boost::property_tree::read_json("./login.json", pt);

    string dbServer = pt.get<std::string>("dbServer");
    string dbUserName = pt.get<std::string>("dbUserName");
    string dbPassword = pt.get<std::string>("dbPassword");
    string databaseName = pt.get<std::string>("databaseName");

    con = mysql_init(NULL);

    if (mysql_real_connect(this->con, dbServer.c_str(), dbUserName.c_str(), dbPassword.c_str(),
            databaseName.c_str(), 0, NULL, 0) == NULL) {
        exit(1);
    }

}

// Close MySQL server connection

void SQLDB::close(void) {
    mysql_close(this->con);
}

// Perform SQL query

void SQLDB::query(const char * query) {
    mysql_query(this->con, query);
}

// Return query result JSON to client.

void SQLDB::jsonStatus(void) {
    if (mysql_affected_rows(this->con) == 1) {
        cout << "Content-Type: application/json\r\n\r\n";
        cout << "{\"affectedRows\": 1}";
    } else {
        cout << "Content-Type: application/json\r\n\r\n";
        cout << "{\"affectedRows\": 0}";
    }

}

// Return SQL query rows json to client.

void SQLDB::jsonRows(void) {

    MYSQL_RES *result = mysql_store_result(this->con);
    MYSQL_ROW row;

    cout << "Content-Type: application/json\r\n\r\n";

    boost::property_tree::ptree rows;
    while ((row = mysql_fetch_row(result))) {
        boost::property_tree::ptree jsonROW;
        boost::property_tree::ptree cell;
        cell.put_value(row[1]);
        jsonROW.push_back(std::make_pair("firstName", cell));
        cell.put_value(row[2]);
        jsonROW.push_back(std::make_pair("lastName", cell));        
        cell.put_value(row[3]);
        jsonROW.push_back(std::make_pair("phoneNumber", cell));
        cell.put_value(row[4]);
        jsonROW.push_back(std::make_pair("emailAddress", cell));
        cell.put_value(row[5]);
        jsonROW.push_back(std::make_pair("webSiteAddress", cell));
        cell.put_value("");
        jsonROW.push_back(std::make_pair("comments", cell));
        rows.push_back(std::make_pair(row[0], jsonROW));
    }

    write_json(cout, rows);

    mysql_free_result(result);

}

