#include <stdio.h>
#include <curl/curl.h>
#include <json-c/json.h>
#include <string.h>

// Function to convert a single hexadecimal digit to decimal
int hexCharToDecimal(char ch) {
    if (ch >= '0' && ch <= '9') {
        return ch - '0';
    }
    if (ch >= 'a' && ch <= 'f') {
        return 10 + (ch - 'a');
    }
    if (ch >= 'A' && ch <= 'F') {
        return 10 + (ch - 'A');
    }
    return -1; // Invalid hexadecimal character
}

// Function to convert a hexadecimal string to a decimal string
void hexToDecimal(const char *hexString, char *decimalString, int maxDecimalLength) {
    int hexLength = strlen(hexString);
    unsigned long long decimalValue = 0;
    unsigned long long base = 1;
    
    // Skip "0x" or "0X" prefix if present
    int start = 0;
    if (hexLength >= 2 && hexString[0] == '0' && (hexString[1] == 'x' || hexString[1] == 'X')) {
        start = 2;
    }

    for (int i = hexLength - 1; i >= start; i--) {
        int digit = hexCharToDecimal(hexString[i]);

        if (digit == -1) {
            strcpy(decimalString, "Invalid Hex String");
            return;
        }

        decimalValue += digit * base;
        base *= 16;
    }

    snprintf(decimalString, maxDecimalLength, "%llu", decimalValue);
}

// Function to handle the response data
size_t WriteCallback(void *contents, size_t size, size_t nmemb, void *userp) {
    ((char *)userp)[size * nmemb] = '\0';
    strcat((char *)userp, (char *)contents);
    return size * nmemb;
}

// Function to check the balance of an address
const char* checkBalance(const char *address, const char *rpc_url) {
    CURL *curl;
    CURLcode res;
    char readBuffer[1024] = {0};
    char postFields[1024];

    // JSON payload to send in the POST request
    sprintf(postFields, "{\"jsonrpc\":\"2.0\",\"method\":\"hmy_getBalance\",\"params\":[\"%s\", \"latest\"],\"id\":1}", address);

    // Initialize CURL
    curl_global_init(CURL_GLOBAL_DEFAULT);
    curl = curl_easy_init();

    if(curl) {
        struct curl_slist *headers = NULL;
        headers = curl_slist_append(headers, "Content-Type: application/json");

        curl_easy_setopt(curl, CURLOPT_URL, rpc_url);
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, postFields);
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, readBuffer);

        // Perform the request
        res = curl_easy_perform(curl);
        if(res != CURLE_OK) {
            fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
        } else {
            // Parse the response
            json_object *parsed_json;
            json_object *result;

            parsed_json = json_tokener_parse(readBuffer);
            json_object_object_get_ex(parsed_json, "result", &result);

            // printf("Balance: %s\n", json_object_get_string(result));
            return json_object_get_string(result);

            json_object_put(parsed_json);
        }

        // Cleanup
        curl_easy_cleanup(curl);
        curl_slist_free_all(headers);
    }

    curl_global_cleanup();
    return "Balance check failed";
}

int main() {
    // Wallet has 55.4759ONE
    const char *address = "";
    const char *rpc_url = "https://api.s0.t.hmny.io";

    const char *hexBalance = checkBalance(address, rpc_url);
    char decimalBalance[100];

    // hexToDecimal(hexBalance, decimalBalance, sizeof(decimalBalance));
    printf("Balance (hex): %s\n", hexBalance);
    // printf("Balance (dec): %s\n", decimalBalance);

    return 0;
}