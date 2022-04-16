const stubs = {};

stubs.cpp = `#include <iostream>

int main() {
  std::cout<<"Hello C++";
  return 0;
}
`;

stubs.py = `print("Hello Py")`;

export default stubs;
