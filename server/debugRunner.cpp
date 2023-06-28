
#include <cstdlib> // For system()

int main() {
    // Run a command in the command line
    system("g++ -o program main.cpp -std=c++2a -ljsoncpp -lsqlite3");
    system("./program");
    return 0;
}