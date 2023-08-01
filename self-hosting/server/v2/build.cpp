#include <sqlite3.h>
#include <iostream>
#include <string>
#include <fstream>
// create data.db
// create table users (token text,data JSON)
// insert into users values ("token","data")
int main()
{
    sqlite3 *db;
    char *zErrMsg = 0;
    int rc;
    rc = sqlite3_open("data.db", &db);
    if (rc)
    {
        std::cout << "Can't open database: " << sqlite3_errmsg(db) << std::endl;
        return 0;
    }
    else
    {
        std::cout << "Opened database successfully" << std::endl;
    }
    std::string sql = "create table users (token text,data text)";
    rc = sqlite3_exec(db, sql.c_str(), NULL, 0, &zErrMsg);
    if (rc != SQLITE_OK)
    {
        std::cout << "SQL error: " << zErrMsg << std::endl;
        sqlite3_free(zErrMsg);
    }
    else
    {
        std::cout << "Table created successfully" << std::endl;
    }
    sql = "INSERT INTO users (token, data) VALUES ('planty', '{plants:[],rooms:[],devices:[]}')";
    rc = sqlite3_exec(db, sql.c_str(), NULL, 0, &zErrMsg);
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
    return 0;
}
