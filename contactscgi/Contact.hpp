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

#ifndef CONTACT_HPP
#define CONTACT_HPP

class Contact {
private:
    void getJSONString(FCGX_Request * request, std::stringstream *jsonString);
    void populate(FCGX_Request *request);
    
public:
    
    std::string firstName;
    std::string lastName;
    std::string phoneNumber;
    std::string emailAddress;
    std::string webSiteAddress;
    std::string comments;

    Contact (FCGX_Request *request);
    Contact () {};
    void updateQuery(FCGX_Request *request, std::string& query);
    void insertQuery(FCGX_Request *request, std::string& query);
    void deleteQuery(FCGX_Request *request, std::string& query);
    void getQuery(FCGX_Request *request, std::string& query);
};

#endif /* CONTACT_HPP */

