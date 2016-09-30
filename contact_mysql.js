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

// Contact database MySQL module

var mysql = require('mysql');
var pool;

contactSQL = {
    initSQL: function () {

        pool = mysql.createPool({
            connectionLimit: 100, //important
            host: '',
            user: '',
            password: '',
            database: 'contacts_db',
            debug: false
        });
    },
    handleSQLQuery: function (query, req, res) {

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
                    res.json(rows);
                } else {
                    res.json(err);
                }
                res.statusCode = 200;
            });

        });

    },
    termSQL: function () {

    }
};

module.exports = contactSQL;


