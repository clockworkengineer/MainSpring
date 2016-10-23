'use strict';
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

// File handling module

var fs = require('fs');

// Contact database MySQL module

var mysql = require('mysql');
var pool;

var contactSQL = {
    
    // Create a pool to handle SQL queries. Note SQL server, user and password
    // etc need to be read from a login.json in the same directory as the app.

    initSQL: function () {

        try {
            
            var loginDetails = JSON.parse(fs.readFileSync('./login.json', 'utf8'));

            console.log("Database support with MySQL server");
            
            pool = mysql.createPool({
                connectionLimit: 100, //important
                host: loginDetails.dbServer,
                user: loginDetails.dbUserName,
                password: loginDetails.dbPassword,
                database: loginDetails.databaseName,
                debug: false
            });

        } catch (err) {
            if (err.code === 'ENOENT') {
                console.log('login.json not found.');
                console.log('Contents should be: { "dbServer" : "", "dbUserName" : "", "dbPassword" : "", "databaseName" : "" }');
                process.exit(1);
            } else {
                throw err;
            }
        }
     


    },
    
    // Handle MySQL query.

    handleSQLQuery: function (query, req, res, jsonModifier) {

        pool.getConnection(function (err, connection) {

            if (err) {
                res.statusCode = 400;
                res.json({"code": 100, "status": "Error in connection database"});
                return;
            }

            console.log('connected as id ' + connection.threadId);

            connection.query(query, function (err, rows) {
                connection.release();
                if (!err) {
                    res.json(jsonModifier(rows));
                } else {
                    res.json(err);
                }
                res.statusCode = 200;
            });

        });

    },
    // Not used at present but call when exit handling put in.

    termSQL: function () {

    }
};

module.exports = contactSQL;


