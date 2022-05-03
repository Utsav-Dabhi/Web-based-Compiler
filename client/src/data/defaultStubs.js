const stubs = {};

stubs.cpp = `#include <iostream>

int main() {
  std::cout<<"Hello C++";
  
  return 0;
}
`;

stubs.py = `print("Hello Py")`;

stubs.java = `class Main {
  public static void main(String[] args) {
    System.out.println("Hello Java");
  }
}`;

export default stubs;
