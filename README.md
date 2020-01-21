qjs-ffi
=======

## What is it? ##
**qjs-ffi** is a simple interface to ffi from quickjs
<https://bellard.org/quickjs/>.

libffi and libdl are required. This has only been run on Linux x86_64 (Fedora 31).

See test.js for simple example and testing. libdl is needed to link to external shared objects (.so files). See the man pages for dlopen, dlerror, dlclose and dlsym.

## How to use it? ##
Use dlopen() and dlsym() to get a function pointer to a desired function, use ffidefine() to create a ffi link to the function, then fficall() to execute the function:

```
	import { dlsym,
	         ffidefine, fficall, ffitostring,
	         RTLD_DEFAULT } from "./ffi.so";

	var fp;
	fp = dlsym(RTLD_DEFAULT, "strdup");
	ffidefine("strdup", fp, null, "char *", "char *");
	var p;
	p = fficall("strdup", "hello");
```
ffidefine(name, function_pointer, abi, ret_type, types...)

name is the name you want to refer to the function as, function_pointer is obtained from dlsym(), abi is abi (if null, use default), ret_type is the return type and types... are the types (prototype).

n = fficall(name, params...) calls the function with the parameters.

s = ffitostring(p) converts a pointer p to a string.

## Installation ##
Installing qjs-ffi easy.

```
$ ./BUILD
```

## ABI ##

ABI is the call type for a function pointer. The following values are allowed (ffidefine). Note that null is the same as "default". On Windows, "fastcall", "stdcall", "ms_cdecl" and "win64" may be useful.

*   null
*   "default"
*   "sysv"
*   "unix64"
*   "stdcall"
*   "thiscall"
*   "fastcall"
*   "ms_cdecl"
*   "win64"

## TYPES ##
Types define parameter and return types. NOTE: structure passing by value is not yet supported. "void" is only useful as a return type. There are also C-like aliases, and a "string" semantic type. These types are used in ffidefine to declare the prototype for each function.

These are the types from libffi:

*   "void"
*   "sint8"
*   "sint16"
*   "sint32"
*   "sint64"
*   "uint8"
*   "uint16"
*   "uint32"
*   "uint64"
*   "float"
*   "double"
*   "schar"
*   "uchar"
*   "sshort"
*   "ushort"
*   "sint"
*   "uint"
*   "slong"
*   "ulong"
*   "longdouble"
*   "pointer"

"C-like" types:

*   "int" ("sint")
*   "long" ("slong")
*   "short" ("sshort")
*   "char" ("schar")
*   "size_t" ("uint")
*   "unsigned char" ("uchar")
*   "unsigned int" ("uint")
*   "unsigned long" ("ulong")
*   "void *" ("pointer")
*   "char *" ("pointer")

Semantic types:

*   "string" ("pointer")

Since fficall converts JavaScript strings into a pointer to the string data, "string" can be used as a parameter type to indicate that this is the intended behaviour (call with a C string constant).

## Default Function Pointer ##
If a null is passed as the function pointer to ffidefine, ffidefine will convert the null into a pointer to the following C function. This will display "dummy function in ffi" on stderr when fficall is used.

```
    static int dummy_() {
	    warn("dummy function in ffi");
	    return 0;
    }
```

## Available imports ##
```
  import { debug, dlopen, dlerror, dlclose, dlsym,
           ffidefine, fficall, ffitostring,
           RTLD_LAZY, RTLD_NOW, RTLD_GLOBAL, RTLD_LOCAL,
           RTLD_NODELETE, RTLD_NOLOAD, RTLD_DEEPBIND,
           RTLD_DEFAULT, RTLD_NEXT } from "./ffi.so";
```

## dlopen, dlerror, dlclose, dlsym ##

These functions are described in the **man** pages. The **man** pages also describe the constant RTLD_* that are available.

## ffidefine, fficall, ffitostring ##

ffidefine() defines a prototype for a FFI C function. Given a function pointer, it produces a callable function:

```
  f = ffidefine(name, fp, abi, return, parameters...)
```
ffidefine() returns true or false -- true if the function has been defined, false otherwise. name is a string by which the function will be referenced. fp is a function pointer, usually derived from dlsym(). abi is the type of call (usually null meaning default abi), return is the return type, and parameters are the types of parameters.

For example:
```
  var malloc;
  malloc = dlsym(RTLD_DEFAULT, "malloc");
  if (malloc == null)
    console.log(dlerror());
  else {
    if (ffidefine("malloc", malloc, null, "void *", "size_t");
      console.log("malloc defined");
    else
      console.log("ffidefine failed");
  }
```
Up to 30 parameters can be defined.

```
  result = fficall(name, actual parameters...)
```
fficall() calls an external function previously defined by ffidefine().

For example:
```
  var p;
  p = fficall("malloc", 10);
```
fficall() converts JavaScript strings (eg. "string") into a pointer to the C string. These strings **cannot** be altered by the FFI function. Use malloc to get memory that can be written.

fficall() always returns a double. This presumes that **all integers and pointers fit into 52 bits**.

If fficall() detects a problem before the actual invocation, it will return an exception. This happens if the function is not yet defined, or a parameter cannot be converted.

true and false are converted to integer 1 and 0, null to pointer 0 (NULL), integers and float as defined by the types specified in the definition. Strings are copied, and a pointer to the copy is passed. These are the standard conversions. As well, libffi may do additional conversions as needed to execute the call.

Some FFI functions will return or produce a pointer to a C string. ffitostring() will convert that pointer into a JavaScript string:
```
  console.log(ffitostring(p));
```

## debug ##

This is provided as a convenience feature, to allow debugging of ffi.so. Since the technique is useful, it is documented here.

If ffi.so is compiled with debug (-g), debugging with gdb can be done:
```
$ gdb qjs
(gdb) set args test.js
(gdb) b js_debug
Function "js_debug" not defined.
Make breakpoint pending on future shared library load? (y or [n]) y
Breakpoint 1 (js_debug) pending.
(gdb) run

Breakpoint 1, js_debug (ctx=0x4d82d0, this_val=..., argc=0, 
    argv=0x7fffffffca10) at ffi.c:494
494	    return JS_NULL;
(gdb)
```
The breakpoint is triggered on the first call to debug() in the JavaScript.

Breakpoints can then be set in other shared objects.

## Limitations ##

* Only **double** is returned
* No structure pass by value
* No C to JavaScript (without specific code for this, C function qsort() cannot be used with a JavaScript compar function, for example).

## TODO ##

ffi.so is useful, but some features would be worthwhile to add. I haven't needed these as yet (YAGNI)

* JavaScript function to C function pointer
* C structure access via pointer -- define setters/getters by type
* Define and pass structures by value (new "types")
* Expand return to return true 64 bit integers and pointers

