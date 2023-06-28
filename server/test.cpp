#include <iostream>
#include <string>
#include <sqlite3.h>

using std::string;
sqlite3 *db;
char *errMsg;
int rc = sqlite3_open("data.db", &db);

void createTables(sqlite3 *db)
{
    const char *roomsTable = "CREATE TABLE IF NOT EXISTS rooms (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, last_updated TEXT NOT NULL, flowers JSON);";
    const char *plantsTable = "CREATE TABLE IF NOT EXISTS plants (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, last_updated TEXT NOT NULL, room TEXT NOT NULL,state DEFAULT 'not planted');";
    const char *devicesTable = "CREATE TABLE IF NOT EXISTS devices (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, flowerId INT , room TEXT NOT NULL);";
    const char *accountsTable = "CREATE TABLE IF NOT EXISTS accounts (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, password TEXT NOT NULL,token TEXT NOT NULL, canEdit BOOLEAN);";
    char *errMsg;
    rc = sqlite3_exec(db, roomsTable, NULL, NULL, &errMsg);
    if (rc != SQLITE_OK)
    {

        std::cerr << "Failed to insert data: " << errMsg << std::endl;
        sqlite3_free(errMsg);
        sqlite3_close(db);
    }
    rc = sqlite3_exec(db, plantsTable, NULL, NULL, &errMsg);
    rc = sqlite3_exec(db, devicesTable, NULL, NULL, &errMsg);
    rc = sqlite3_exec(db, accountsTable, NULL, NULL, &errMsg);
}
void insertEampleData(sqlite3 *db)
{
    
    const char *insertRoom = "INSERT INTO rooms (name, last_updated, flowers) VALUES ('Living Room', '2020-12-12 12:12:12', '[{\"name\":\"Plant 1\",\"id\":0},{\"name\":\"Plant 2\",\"id\":1}]');";
    const char *insertPlant = "INSERT INTO plants (name, last_updated, room) VALUES ('Plant 1', '2020-12-12 12:12:12', 'Living Room');";
    const char *insertAccount = "INSERT INTO accounts (username, password, token, canEdit) VALUES ('admin', 'admin', '1234', 1);";
    char *errMsg;
    rc = sqlite3_exec(db, insertRoom, NULL, NULL, &errMsg);
    rc = sqlite3_exec(db, insertPlant, NULL, NULL, &errMsg);
    rc = sqlite3_exec(db, insertAccount, NULL, NULL, &errMsg);
}
int main()
{
    const char *selectDataSQL = "SELECT * FROM rooms";
    rc = sqlite3_exec(
        db, selectDataSQL, [](void *data, int argc, char **argv, char **columnNames) -> int
        { 
            for (int i = 0; i < argc; i++)
            {
                std::cout << columnNames[i] << ": " << argv[i] << std::endl;
            }
            std::cout << argv[1] << std::endl;
         return 0; },
        nullptr, &errMsg);
    return 0;
}