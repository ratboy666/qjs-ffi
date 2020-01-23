# BUILD
#
gcc -g -fPIC -DJS_SHARED_LIBRARY -c ffi.c
gcc -g -shared -o ffi.so ffi.o -lffi -ldl
#
gcc -g -fPIC -c test.c
gcc -g -shared -o test.so test.o
#
# ce: .mshell;
