#include <iostream>
#include <string>
#include <sstream>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <json/json.h>
#include <list>
/// usr/local/Cellar/
//    ${vcpkgRoot}/x64-osx/include
// fof reading html file
#include <fstream>
#include "lib/extension.h"
#include <thread>
#include <sqlite3.h>
using std::string;

const int PORT = 25565;
const int numberOfFiles = 1;
const string filePath = "/Users/skakwy/Documents/GitHub/planty/html/";
sqlite3 *db;
char *errMsg;
int rc = sqlite3_open("data.db", &db);
// html files array with key value pair

std::string htmlFiles[numberOfFiles][2] = {
    {"index.html", ""}};
int readFiles()
{

    for (int i = 0; i < numberOfFiles; i++)
    {
        std::ifstream file(filePath + htmlFiles[i][0]);
        if (file.fail())
        {
            std::cerr << "Failed to open file: " << htmlFiles[i][0] << std::endl;
            return -1;
        }
        std::string str;
        while (std::getline(file, str))
        {
            htmlFiles[i][1] += str;
        }
        file.close();
    }
    return 1;
}
string getCurrentTime()
{
    // get current time
    time_t now = time(0);
    tm *ltm = localtime(&now);
    string currentTime = std::to_string(1900 + ltm->tm_year) + "-" + std::to_string(1 + ltm->tm_mon) + "-" + std::to_string(ltm->tm_mday) + " " + std::to_string(ltm->tm_hour) + ":" + std::to_string(ltm->tm_min) + ":" + std::to_string(ltm->tm_sec);
    return currentTime;
}
int callback(void *data, int argc, char **argv, char **columnNames)
{
    // Callback function implementation
    return 0;
}
int ExecCallback(void *data, int argc, char **argv, char **columnNames)
{
    bool *validPtr = static_cast<bool *>(data);
    *validPtr = true;
    return 0;
}
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
static int ExecCallbackJsonResponseMultiple(void *data, int argc, char **argv, char **columnNames)
{

    Json::Value *jsonResponse = static_cast<Json::Value *>(data);
    Json::Value tempRes;
    for (int i = 0; i < argc; i++)
    {
        try
        {
            (tempRes)[columnNames[i]] = argv[i] ? argv[i] : "";
        }
        catch (...)
        {
            std::cerr << "Failed to add " << columnNames[i] << " to json response" << std::endl;
        }
    }
    (*jsonResponse).append(tempRes);
    return 0;
}

bool checkToken(const string token)
{
    bool valid = false;
    std::string query = "SELECT * FROM accounts WHERE token = '" + token + "';";
    const char *selectDataSQL = query.c_str();
    char *errMsg;

    int rc = sqlite3_exec(db, selectDataSQL, ExecCallback, &valid, &errMsg);

    if (rc != SQLITE_OK)
    {
        // Handle the error if necessary
        std::cerr << "Error executing SQL query: " << errMsg << std::endl;
        sqlite3_free(errMsg);
        return false;
    }

    return valid;
}
Json::Value getRoom(string roomName)
{
    Json::Value jsonResponse;
    // Clean up string
    while (!roomName.empty() && std::isspace(roomName.back()))
    {
        roomName.pop_back();
    }
    roomName = toLowercase(roomName);

    std::string query = "SELECT * FROM rooms WHERE LOWER(name) = '" + roomName + "';";

    const char *selectDataSQL = query.c_str();
    char *errMsg;

    int rc = sqlite3_exec(db, selectDataSQL, ExecCallbackJsonResponse, &jsonResponse, &errMsg);

    return jsonResponse;
}
Json::Value getRoom(int roomId)
{
    Json::Value jsonResponse;
    // Clean up string

    std::string query = "SELECT * FROM rooms WHERE id = '" + std::to_string(roomId) + "';";
    const char *selectDataSQL = query.c_str();
    char *errMsg;

    int rc = sqlite3_exec(db, selectDataSQL, ExecCallbackJsonResponse, &jsonResponse, &errMsg);

    return jsonResponse;
}

bool addPlant(string roomName, string pflanzenArt)
{
    Json::Value jsonResponse;
    if (roomName.empty() || pflanzenArt.empty())
    {
        return 0;
    }
    Json::Reader reader;
    Json::Value oldFlowers;
    Json::FastWriter fastWriter;
    int newId;
    // Clean up string
    while (!roomName.empty() && std::isspace(roomName.back()))
    {
        roomName.pop_back();
    }
    roomName = toLowercase(roomName);
    // get Id
    std::string query = "SELECT * FROM plants ORDER BY id DESC LIMIT 1;";

    const char *selectDataSQL = query.c_str();
    char *errMsg;

    int rc = sqlite3_exec(db, selectDataSQL, ExecCallbackJsonResponse, &jsonResponse, &errMsg);
    if (rc != SQLITE_OK)
    {
        std::cerr << "Error upadting row: " << errMsg << std::endl;
        sqlite3_free(errMsg);
        return false;
    }
    // set new id
    try
    {
        newId = std::stoi(jsonResponse["id"].asString()) + 1;
    }
    catch (...)
    {
        newId = 1;
    }

    // change room table
    reader.parse((getRoom(roomName)["flowers"]).asString(), oldFlowers);
    oldFlowers.append(newId);
    query = "UPDATE rooms SET flowers = '" + fastWriter.write(oldFlowers) + "' WHERE LOWER(name) = '" + roomName + "';";
    const char *selectDataSQL2 = query.c_str();

    rc = sqlite3_exec(db, selectDataSQL2, callback, nullptr, &errMsg);
    if (rc != SQLITE_OK)
    {
        std::cerr << "Error upadting row: " << errMsg << std::endl;
        sqlite3_free(errMsg);
        return false;
    }
    // change plants table
    string currentTime = getCurrentTime();
    pflanzenArt = toLowercase(pflanzenArt);
    query = "INSERT INTO plants (name, last_updated, room,type) VALUES ('" + pflanzenArt + std::to_string(newId) + "', '" + getCurrentTime() + "', '" + roomName + "','" + pflanzenArt + "');";
    const char *selectDataSQL3 = query.c_str();
    rc = sqlite3_exec(db, selectDataSQL3, callback, nullptr, &errMsg);
    if (rc != SQLITE_OK)
    {
        std::cerr << "Error upadting row: " << errMsg << std::endl;
        sqlite3_free(errMsg);
        return false;
    }
    return true;
}
Json::Value getPlant(int id)
{
    Json::Value jsonResponse;
    // Clean up string

    std::string query = "SELECT * FROM plants WHERE id = '" + std::to_string(id) + "';";
    const char *selectDataSQL = query.c_str();
    char *errMsg;

    int rc = sqlite3_exec(db, selectDataSQL, ExecCallbackJsonResponse, &jsonResponse, &errMsg);

    return jsonResponse;
}
Json::Value getPlant(string roomName)
{
    Json::Value jsonResponse;
    // Clean up string
    roomName = toLowercase(roomName);
    std::string query = "SELECT * FROM plants WHERE LOWER(room) = '" + roomName + "';";
    std::cout << query << std::endl;
    const char *selectDataSQL = query.c_str();
    char *errMsg;

    int rc = sqlite3_exec(db, selectDataSQL, ExecCallbackJsonResponseMultiple, &jsonResponse, &errMsg);
    return jsonResponse;
}
Json::Value getPlant(string type, bool isType)
{
    Json::Value jsonResponse;
    // Clean up string
    type = toLowercase(type);
    std::string query = "SELECT * FROM plants WHERE LOWER(type) = '" + type + "';";
    std::cout << query << std::endl;
    const char *selectDataSQL = query.c_str();
    char *errMsg;

    int rc = sqlite3_exec(db, selectDataSQL, ExecCallbackJsonResponseMultiple, &jsonResponse, &errMsg);
    return jsonResponse;
}
Json::Value updatePlant(int id, string state)
{
    Json::Value jsonResponse;
    // Clean up string

    std::string query = "UPDATE plants SET state ='" + state + "'WHERE id=" + std::to_string(id) + ";";
    const char *selectDataSQL = query.c_str();
    char *errMsg;

    int rc = sqlite3_exec(db, selectDataSQL, ExecCallbackJsonResponse, &jsonResponse, &errMsg);
    if (rc == SQLITE_OK)
    {
        jsonResponse["success"] = "true";
    }

    return jsonResponse;
}
Json::Value updatePlants(string roomName, string state)
{
    Json::Value jsonResponse;
    // Clean up string

    std::string query = "UPDATE plants SET state ='" + state + "'WHERE room='" + roomName + "';";
    const char *selectDataSQL = query.c_str();
    char *errMsg;

    int rc = sqlite3_exec(db, selectDataSQL, ExecCallbackJsonResponse, &jsonResponse, &errMsg);
    if (rc == SQLITE_OK)
    {
        jsonResponse["success"] = "true";
    }

    return jsonResponse;
}
Json::Value updatePlants(string type, string state, bool byType)
{
    Json::Value jsonResponse;
    // Clean up string

    std::string query = "UPDATE plants SET state ='" + state + "'WHERE type='" + type + "';";
    const char *selectDataSQL = query.c_str();
    char *errMsg;

    int rc = sqlite3_exec(db, selectDataSQL, ExecCallbackJsonResponse, &jsonResponse, &errMsg);
    if (rc == SQLITE_OK)
    {
        jsonResponse["success"] = "true";
    }

    return jsonResponse;
}
Json::Value addRoom(string roomName)
{
    Json::Value jsonResponse;
    // Clean up string
    while (!roomName.empty() && std::isspace(roomName.back()))
    {
        roomName.pop_back();
    }
    roomName = toLowercase(roomName);
    std::string query = "SELECT * FROM rooms WHERE LOWER(name) = '" + roomName + "';";
    const char *selectDataSQL1 = query.c_str();
    char *errMsg;

    int rc = sqlite3_exec(db, selectDataSQL1, ExecCallbackJsonResponse, &jsonResponse, &errMsg);
    std::cout << jsonResponse << std::endl;
    if(jsonResponse != Json::Value::null){
        std::cout << "room already exists" << std::endl;
        jsonResponse.clear();
        jsonResponse["success"] = "false";
        jsonResponse["error"] = "room already exists";
        return jsonResponse;
    }
    roomName = toLowercase(roomName);
    query = "INSERT INTO rooms (name, last_updated, flowers) VALUES ('" + roomName + "', '" + getCurrentTime() + "', '[]');";
    const char *selectDataSQL = query.c_str();
    *errMsg;

     rc = sqlite3_exec(db, selectDataSQL, ExecCallbackJsonResponse, &jsonResponse, &errMsg);
    if (rc == SQLITE_OK)
    {
        jsonResponse["success"] = "true";
    }

    return jsonResponse;
}
std::string generateResponse(std::map<string, string> argumentList, string request)
{


    string requestType = request.substr(request.find("GET") + 5, request.find_first_of("?"));
    requestType = requestType.substr(0, requestType.find("/"));
    requestType = requestType.substr(0, requestType.find("?"));

    // standard response
    std::stringstream response;
    Json::Value jsonResponse;

    response << "HTTP/1.1 200 OK\r\n";
    response << "Access-Control-Allow-Origin: *\r\n";
    response << "Content-Type: application/json\r\n";

    if (!checkToken(argumentList["token"]))
    {

        return "HTTP/1.1 401 Unauthorized\r\n"
               "Content-Length: 0\r\n"
               "\r\n";
    }
    if (requestType == "rooms")
    {

        if (!argumentList["id"].empty())
        {

            jsonResponse = getRoom(std::stoi(argumentList["id"]));
        }
        else
        {
            jsonResponse = getRoom(argumentList["name"]);
        }
    }
    else if (requestType == "addPlant")
    {
        bool success = addPlant(argumentList["room"], argumentList["type"]);
        if (success)
        {
            jsonResponse["success"] = "true";
        }
    }
    else if (requestType == "getPlant")
    {
        if (!argumentList["id"].empty())
        {
            jsonResponse = getPlant(std::stoi(argumentList["id"]));
        }
        else if (!argumentList["type"].empty())
        {
            jsonResponse = getPlant(argumentList["type"], true);
        }
        else if (!argumentList["room"].empty())
        {
            jsonResponse = getPlant(argumentList["room"]);
            std::cout << argumentList["room"] << std::endl;
        }
    }
    else if (requestType == "updatePlant")
    {
        if (!argumentList["id"].empty() && !argumentList["state"].empty())
        {
            jsonResponse = updatePlant(std::stoi(argumentList["id"]), argumentList["state"]);
        }
    }
    else if (requestType == "updatePlants")
    {
        if (!argumentList["room"].empty() && !argumentList["state"].empty())
        {
            jsonResponse = updatePlants(argumentList["room"], argumentList["state"]);
        }
        else if (!argumentList["type"].empty() && !argumentList["state"].empty())
        {
            jsonResponse = updatePlants(argumentList["type"], argumentList["state"], true);
        }
    }
    else if (requestType == "addRoom")
    {
        if (!argumentList["room"].empty())
        {
        
            jsonResponse = addRoom(argumentList["room"]);
        }
        // standard repsonse end ----------------------------------------------
    }
    if (jsonResponse.empty())
    {

        return "HTTP/1.1 400 Bad Request\r\n"
               "Content-Length: 0\r\n"
               "\r\n";
    }

    std::string jsonString = jsonResponse.toStyledString();

    response << "Content-Length: " << jsonString.size() << "\r\n";
    response << "\r\n";
    response << jsonString;
    response << "\r\n";

    return response.str();
}

// split arguments to a map
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

bool isDocumentRequest(string request)
{
    request = request.substr(request.find("Sec-Fetch-Dest:"), request.size());
    string line;

    while (std::getline(std::stringstream(request), line))
    {
        if (line.find("document") != std::string::npos)
        {
            return true;
        }
        if (line.find("image") != std::string::npos)
        {
            return false;
        }
    }
    return false;
}

int threadTimeOut()
{
    std::this_thread::sleep_for(std::chrono::seconds(5));
    std::cout << "Thread timed out" << std::endl;
    return 0;
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