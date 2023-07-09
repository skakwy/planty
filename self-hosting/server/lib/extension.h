#include <string>
#include <sqlite3.h>
using std::string;


//extension files with useful functions for future projects
int findNextLetterIndex(string str, int start, char target){
    int index = start;
    string line;
    str = str.substr(index,str.size());
    index = str.find(target);
     
    return index + start;
}
string toLowercase(string str){
    std::transform(str.begin(), str.end(), str.begin(), [](unsigned char c) {
        return std::tolower(c);
    });
    return str;
}
bool isNumber(const std::string& str) {
    for (char c : str) {
        if (!std::isdigit(c)) {
            return false;
        }
    }
    return true;
}
//project specific extension
