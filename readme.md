## CRUD based Contact Database Application ##

This started out as a personal exercise to put into practice skills that I have learnt in the last few months. It consists of a form based HTML front-end that connects to the server based Node.js back-end that talks to either a MYSQL database or SQLite using SQL queries. The main form user interface is a bit primitive and clunky at the moment but it is useable and I will come back to it a later date. At present it just stores first name, last name, phone number, email address, website address and a comment per person.

The HTML form UI uses javascript and AJAX requests to talk to the back-end using the following RESTFUL API.

<table class="c10">
   <tbody>
      <tr class="c6">
         <td class="c5 c7" colspan="1" rowspan="1">
            <p class="c4"><span class="c7 c8">HTTP Method</span></p>
         </td>
         <td class="c3 c7" colspan="1" rowspan="1">
            <p class="c4"><span class="c8 c7">URI</span></p>
         </td>
         <td class="c0 c7" colspan="1" rowspan="1">
            <p class="c4"><span class="c8 c7">Action</span></p>
         </td>
      </tr>
      <tr class="c6">
         <td class="c5" colspan="1" rowspan="1">
            <p class="c4"><span class="c2">GET</span></p>
         </td>
         <td class="c3" colspan="1" rowspan="1">
            <p class="c4"><span class="c2">http://[hostname]/contacts</span></p>
         </td>
         <td class="c0" colspan="1" rowspan="1">
            <p class="c4"><span class="c2">Retrieve list of contacts</span></p>
         </td>
      </tr>
      <tr class="c6">
         <td class="c5" colspan="1" rowspan="1">
            <p class="c4"><span class="c2">GET</span></p>
         </td>
         <td class="c3" colspan="1" rowspan="1">
            <p class="c4"><span class="c2">http://[hostname]/contacts/contactID</span></p>
         </td>
         <td class="c0" colspan="1" rowspan="1">
            <p class="c4"><span class="c2">Retrieve a contact</span></p>
         </td>
      </tr>
      <tr class="c6">
         <td class="c5" colspan="1" rowspan="1">
            <p class="c4"><span class="c2">POST</span></p>
         </td>
         <td class="c3" colspan="1" rowspan="1">
            <p class="c4"><span class="c2">http://[hostname]/contacts</span></p>
         </td>
         <td class="c0" colspan="1" rowspan="1">
            <p class="c4"><span class="c2">Create a new contact</span></p>
         </td>
      </tr>
      <tr class="c6">
         <td class="c5" colspan="1" rowspan="1">
            <p class="c4"><span class="c2">PUT</span></p>
         </td>
         <td class="c3" colspan="1" rowspan="1">
            <p class="c4"><span class="c2">http://[hostname]/contacts/contactID</span></p>
         </td>
         <td class="c0" colspan="1" rowspan="1">
            <p class="c4"><span class="c2">Update an existing contact</span></p>
         </td>
      </tr>
      <tr class="c6">
         <td class="c5" colspan="1" rowspan="1">
            <p class="c4"><span class="c2">DELETE</span></p>
         </td>
         <td class="c3" colspan="1" rowspan="1">
            <p class="c4"><span class="c2">http://[hostname]/contacts/contactID</span></p>
         </td>
         <td class="c0" colspan="1" rowspan="1">
            <p class="c4"><span class="c2">Delete a contact</span></p>
            <p class="c4 c11"><span class="c2"></span></p>
         </td>
      </tr>
   </tbody>
</table>

There is currently a choice of two  SQL options available for storing the data; MySQL and SQLite (which is the default). A small source code change is needed in main.js to switch and also the MySQL database details and user credentials need to be specified by creating a file called login.json in the working directory that has contents

{ "dbServer" : "", "dbUserName" : "", "dbPassword" : "", "databaseName" : "contacts_db" 

This example is still a work in progress and I intend to modify it as and when necessary i.e. If I find that its not quite RESTFUL and changes need to be made. At present it doesn't use JQuery on the client side but that is one modification that is penciled in for the future along with using another database back-end like MongoDB (the client side UI has now been converted to use JQuery).

## FastCGI C++ back-end ##

As part of this project I have written a C++ FastCGI back-end program that slots into the server side as a replacement for the node.js solution. No build instructions are provided and it is left as an exercise to the reader to achieve. They  require the Boost C++ library for JSON parsing, MYSQL libraries and headers, FastCGI libraries and headers and the light weight logging package clog from GitHub.

The program was built and tested out on a raspberry pi using the NGINX web server by copying the forms directory to the web server root and adding the following to the NGINX web server configuration file.

	location /contacts {

	       fastcgi_pass   127.0.0.1:8000;

           fastcgi_param  GATEWAY_INTERFACE  CGI/1.1;
           fastcgi_param  SERVER_SOFTWARE    nginx;
           fastcgi_param  QUERY_STRING       $query_string;
           fastcgi_param  REQUEST_METHOD     $request_method;
           fastcgi_param  CONTENT_TYPE       $content_type;
           fastcgi_param  CONTENT_LENGTH     $content_length;
           fastcgi_param  SCRIPT_FILENAME    $document_root$fastcgi_script_name;
           fastcgi_param  SCRIPT_NAME        $fastcgi_script_name;
           fastcgi_param  REQUEST_URI        $request_uri;
           fastcgi_param  DOCUMENT_URI       $document_uri;
           fastcgi_param  DOCUMENT_ROOT      $document_root;
           fastcgi_param  SERVER_PROTOCOL    $server_protocol;
           fastcgi_param  REMOTE_ADDR        $remote_addr;
           fastcgi_param  REMOTE_PORT        $remote_port;

         }

 This basically tells the server to pass any requests made using the URL "http://[localhost]/contacts" to what ever service is running on port 8000. This could be the contactscgi program which was be run using the command  spawn-fcgi -p 8000 contactscgi (spawn-fcgi may have to be installed in the environment that you are running on). This program can be set up on any webserver that has FastCGI support but it has been left as an exercise to the reader again to find how this can be achieved.


