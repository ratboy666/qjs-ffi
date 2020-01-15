qjs-ffi
=======

## What is it? ##
**qjs-ffi** is a simple interface to ffi from quickjs
<https://bellard.org/quickjs/>.

libffi and libdl are required. This has only been run on Linux x86_64
(Fedora 31).

See test.js for simple example and testing. libdl is needed to link to
external shared objects (.so files). See the man pages for dlopen,
dlerror, dlclose and dlsym.

## How to use it? ##
Use dlopen() and dlsym() to get a function pointer to a desired
function, use ffidefine() to create a ffi link to the function,
then fficall() to execute the function:

	import { dlsym,
	         ffidefine, fficall, ffitostring,
	         RTLD_DEFAULT } from "./ffi.so";

	var fp;
	fp = dlsym(RTLD_DEFAULT, "strdup");
	ffidefine("strdup", fp, null, "char *", "char *");
	var p;
	p = fficall("strdup", "hello");

ffidefine(name, function_pointer, abi, ret_type, types...) 

name is the name you want to refer to the function as, function_pointer
is obtained from dlsym(), abi is abi (if null, use default), ret_type
is the return type and types... are the types (prototype).

n = fficall(name, params...) calls the function with the parameters.

s = ffitostring(p) converts a pointer p to a string.

## Installation ##
Installing qjs-ffi easy.

```
$ ./BUILD
```
