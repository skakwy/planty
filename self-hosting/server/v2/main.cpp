#include <iostream>
#include <string>
#include <sstream>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <json/json.h>
#include <list>
#include <fstream>
#include "lib/extension.h"
#include <thread>
#include <sqlite3.h>
#include <algorithm>
using std::string;
const int PORT = 25555;

static int ExecCallbackJsonResponse(void *data, int argc, char **argv, char **columnNames)
{

    Json::Value *jsonResponse = static_cast<Json::Value *>(data);

    for (int i = 0; i < argc; i++)
    {
        try
        {
            (*jsonResponse)[columnNames[i]] = argv[i];
        }
        catch (...)
        {
            std::cerr << "Failed to add " << columnNames[i] << " to json response" << std::endl;
        }
    }
    return 0;
}

std::map<string, string> splitArguments(string str)
{
    char delimiter = '&';
    std::list<string> list;
    std::map<string, string> map;
    str = str.substr(0, str.find("HTTP/1"));
    while (str.find(delimiter) != std::string::npos)
    {
        int found = str.find(delimiter);
        list.push_back(str.substr(0, found));

        str = str.substr(found + 1, str.size());
    }
    // letzen einfügen
    list.push_back(str);
    while (!list.empty())
    {

        string key = list.front().substr(0, list.front().find("="));
        string value = list.front().substr(list.front().find("=") + 1, list.front().size());
        try
        {
            value = value.replace(value.find("%20"), 3, " ");
        }
        catch (...)
        {
            // std::cerr << "Failed to replace %20" << std::endl;
        }
        while (!value.empty() && std::isspace(value.back()))
        {
            value.pop_back();
        }
        map[key] = value;
        list.pop_front();
    }
    return map;
}
string setDoc(string jsonString)
{

    Json::Value jsonData;
    Json::CharReaderBuilder reader;
    Json::CharReader *jsonReader = reader.newCharReader();
    std::string errors;

    // Parse the JSON and check for errors
    bool parsingSuccessful = jsonReader->parse(jsonString.c_str(), jsonString.c_str() + jsonString.size(), &jsonData, &errors);
    delete jsonReader;

    if (parsingSuccessful)
    {
        std::cout << "JSON is valid!\n";
        // You can access the JSON data here if needed.
    }
    else
    {
        std::cerr << "Error parsing JSON: " << errors << "\n";
        return "Error parsing JSON";
    }

    sqlite3 *db;
    char *zErrMsg = 0;
    int rc;
    rc = sqlite3_open("data.db", &db);
    std::cout << "setDoc" << std::endl;
    std::string sql = "INSERT INTO users (data) VALUES ('" + jsonString + "')";
    rc = sqlite3_exec(db, sql.c_str(), NULL, 0, &zErrMsg);
    return "setDoc";
}
string getDoc()
{
    sqlite3 *db;
    char *zErrMsg = 0;
    Json::Value jsonData;
    int rc;
    rc = sqlite3_open("data.db", &db);
    std::string sql = "SELECT data FROM users";
    std::string data;
    rc = sqlite3_exec(db, sql.c_str(), ExecCallbackJsonResponse, &jsonData, &zErrMsg);
    if (rc != SQLITE_OK)
    {
        std::cout << "SQL error: " << zErrMsg << std::endl;
        sqlite3_free(zErrMsg);
    }
    else
    {
        std::cout << "Data inserted successfully" << std::endl;
    }
    sqlite3_close(db);
    return jsonData.asString();
}

string getToken()
{
    sqlite3 *db;
    char *zErrMsg = 0;
    Json::Value jsonData;
    int rc;
    rc = sqlite3_open("data.db", &db);
    std::string sql = "SELECT token FROM users";
    std::string data;
    rc = sqlite3_exec(db, sql.c_str(), ExecCallbackJsonResponse, &jsonData, &zErrMsg);
    return jsonData["token"].asString();
}
std::string generateResponse(std::map<string, string> argumentList, string request)
{
    std::cout << "generateResponse" << std::endl;
    string requestType = request.substr(request.find("GET") + 5, request.find_first_of("?"));
    requestType = requestType.substr(0, requestType.find("/"));
    requestType = requestType.substr(0, requestType.find("?"));
    bool validToken = false;
    try
    {
        std::stringstream response;
        response << "Access-Control-Allow-Origin: *\r\n";
        response << "Content-Type: application/json\r\n";
        string jsonString;
        if (argumentList["token"] == getToken())
        {
            validToken = true;
            if (requestType == "getDoc")
            {
                response << "HTTP/1.1 200 OK\r\n";
                jsonString = getDoc();
            }
            response << "Content-Length: " << jsonString.size() << "\r\n";
            if (jsonString.size() > 0)
            {
                response << jsonString;
                response << "\r\n";
                return response.str();
            }
            if (requestType == "isServer")
            {
                return "HTTP/1.1 200 OK\r\n"
                       "Content-Length: 0\r\n"
                       "\r\n";
            }
        }
    }
    catch (const std::exception &e)
    {
        std::cerr << e.what() << '\n';
        return "HTTP/1.1 400";
    }

    return "HTTP/1.1 400";
}

int main()
{

    int serverSocket = socket(AF_INET, SOCK_STREAM, 0);
    int reuse = 1;
    if (setsockopt(serverSocket, SOL_SOCKET, SO_REUSEADDR, &reuse, sizeof(reuse)) < 0)
    {
        std::cerr << "Failed to set SO_REUSEADDR option" << std::endl;
        close(serverSocket);
        return 1;
    }

    if (serverSocket < 0)
    {
        std::cerr << "Failed to create socket" << std::endl;
        return -1;
    }

    struct sockaddr_in serverAddress;
    serverAddress.sin_family = AF_INET;
    serverAddress.sin_addr.s_addr = INADDR_ANY;
    serverAddress.sin_port = htons(PORT);

    if (bind(serverSocket, (struct sockaddr *)&serverAddress, sizeof(serverAddress)) < 0)
    {
        std::cerr << "Failed to bind socket" << std::endl;
        return -1;
    }

    if (listen(serverSocket, 10) < 0)
    {
        std::cerr << "Failed to listen on socket" << std::endl;
        return -1;
    }

    std::cout << "Server listening on port " << PORT << std::endl;

    while (true)
    {
        int clientSocket = accept(serverSocket, nullptr, nullptr);
        if (clientSocket < 0)
        {
            std::cerr << "Failed to accept client connection" << std::endl;
            continue;
        }

        // get request url
        char buffer[1024];
        recv(clientSocket, buffer, 1024, 0);
        std::string request = buffer;
        std::stringstream requestStream(request);

        int endOfArguments = request.find("HTTP/1.1");
        int startOfArguments = request.find_first_of("?");
        string category = request.substr(request.find_first_of("/") + 1, startOfArguments);
        // std::thread documentThread = std::thread(isDocumentRequest(request));

        std::map<string, string> argumentList = splitArguments(request.substr(startOfArguments + 1, endOfArguments - 6));

        // get token

        if (request.find("GET /favicon.ico") == string::npos)
        {
            std::string response = generateResponse(argumentList, request);
            // print all arguments to console
            // for (const auto &[key, value] : argumentList)
            // {
            //     std::cout << key << " " << value << std::endl;
            // }

            if (send(clientSocket, response.c_str(), response.size(), 0) < 0)
            {
                std::cerr << "Failed to send response" << std::endl;
            }
        }
        close(clientSocket);
    }

    close(serverSocket);

    return 0;
}