qjs-ffi
=======

## What is it? ##
**qjs-ffi** is a simple interface to ffi from quickjs
<https://bellard.org/quickjs/>.

libffi and libdl are required. This has only been run on Linux x86_64 (Fedora 31).

See test.js for simple example and testing. libdl is needed to link to external shared objects (.so files). See the man pages for dlopen, dlerror, dlclose and dlsym.

## How to use it? ##
Use dlopen() and dlsym() to get a function pointer to a desired function, use ffidefine() to create a ffi link to the function, then call() to execute the function:

```
	import { dlsym,
	         define, call, toString, toArrayBuffer,
	         RTLD_DEFAULT } from "./ffi.so";

	var fp;
	fp = dlsym(RTLD_DEFAULT, "strdup");
	define("strdup", fp, null, "char *", "char *");
	var p;
	p = call("strdup", "hello");
```
define(name, function_pointer, abi, ret_type, types...)

name is the name you want to refer to the function as, function_pointer is obtained from dlsym(), abi is abi (if null, use default), ret_type is the return type and types... are the types (prototype).

n = call(name, params...) calls the function with the parameters.

s = toString(p) converts a pointer p to a string.

b = toArrayBuffer(p, n) converts pointer p, length n to ArrayBuffer.

## Installation ##
Installing qjs-ffi easy.

```
$ ./BUILD
```

## ABI ##

ABI is the call type for a function pointer. The following values are allowed (define). Note that null is the same as "default". On Windows, "fastcall", "stdcall", "ms_cdecl" and "win64" may be useful.

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
Types define parameter and return types. NOTE: structure passing by value is not yet supported. "void" is only useful as a return type. There are also C-like aliases, and a "string" semantic type. These types are used in define to declare the prototype for each function.

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

*   "string" ("pointer", for JavaScript string)
*   "buffer" ("pointer", for ArrayBuffer)

Since call converts JavaScript strings into a pointer to the string data, "string" can be used as a parameter type to indicate that this is the intended behaviour (call with a C string constant).

## Default Function Pointer ##
If a null is passed as the function pointer to define, define will convert the null into a pointer to the following C function. This will display "dummy function in ffi" on stderr when fficall is used.

```
    static int dummy_() {
	    warn("dummy function in ffi");
	    return 0;
    }
```

## Available imports ##
```
  import { debug, dlopen, dlerror, dlclose, dlsym,
           define, call, toString, toArrayBuffer,
           errno, JSContext,
           RTLD_LAZY, RTLD_NOW, RTLD_GLOBAL, RTLD_LOCAL,
           RTLD_NODELETE, RTLD_NOLOAD, RTLD_DEEPBIND,
           RTLD_DEFAULT, RTLD_NEXT } from "./ffi.so";
```

## dlopen, dlerror, dlclose, dlsym, errno ##

These functions are described in the **man** pages. The **man** pages also describe the constant RTLD_* that are available.

Note that errno() is a function.

## define, call, toString, toArrayBuffer ##

define() defines a prototype for a FFI C function. Given a function pointer, it produces a callable function:

```
  f = define(name, fp, abi, return, parameters...)
```
define() returns true or false -- true if the function has been defined, false otherwise. name is a string by which the function will be referenced. fp is a function pointer, usually derived from dlsym(). abi is the type of call (usually null meaning default abi), return is the return type, and parameters are the types of parameters.

For example:
```
  var malloc;
  malloc = dlsym(RTLD_DEFAULT, "malloc");
  if (malloc == null)
    console.log(dlerror());
  else {
    if (define("malloc", malloc, null, "void *", "size_t");
      console.log("malloc defined");
    else
      console.log("define failed");
  }
```
Up to 30 parameters can be defined.

```
  result = call(name, actual parameters...)
```
call() calls an external function previously defined by define().

For example:
```
  var p;
  p = call("malloc", 10);
```
call() converts JavaScript strings (eg. "string") into a pointer to the C string. These strings **cannot** be altered by the FFI function. Use malloc to get memory that can be written. ArrayBuffer is converted to pointer as well, and the ArrayBuffer contents *can* be written.

call() always returns a double. This presumes that **all integers and pointers fit into 52 bits**.

If call() detects a problem before the actual invocation, it will return an exception. This happens if the function is not yet defined, or a parameter cannot be converted.

true and false are converted to integer 1 and 0, null to pointer 0 (NULL), integers and float as defined by the types specified in the definition. Strings are copied, and a pointer to the copy is passed. These are the standard conversions. As well, libffi may do additional conversions as needed to execute the call. ArrayBuffer will be converted to a pointer, and the C function can change that memory.

Some FFI functions will return or produce a pointer to a C string. toString() will convert that pointer into a JavaScript string:
```
  console.log(toString(p));
```

If we have a pointer to memory, and a length, toArrayBuffer will create an ArrayBuffer with a copy of the storage.

## JSContext ##

Returns the current JSContext *ctx. This allow functions within the
QuickJS C API to be called from within a js module. This allows for
limited "introspection".

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

## Changes ##

* Wed Jan 22 10:34:55 EST 2020
* Note endian in Limitations
* ArrayBuffer can be passed (converted to pointer like string)
* Add ffitoarraybuffer(p, size)
* Add type "buffer"
* Add errno function
* Only publish RTLD_ constants if available
* Fri Jan 24 11:57:09 EST 2020
* Add JSContext() to allow "introspective" functions
* Rename ffidefine to define, fficall to call, ffitostring to toString and ffitoarraybuffer to toArrayBuffer
* Add util.mjs and test2.js to illustrate how to use ffi a bit better.


## Limitations ##

* Only **double** is returned
* No structure pass by value
* No C to JavaScript (without specific code for this, C function qsort() cannot be used with a JavaScript comparision function, for example).
* Only little-endian (I don't have a big-endian test system)

## TODO ##

ffi.so is useful, but some features would be worthwhile to add. I haven't needed these as yet (YAGNI)

* JavaScript function to C function pointer
* C structure access via pointer -- define setters/getters by type
* Define and pass structures by value (new "types")
* Expand return to return true 64 bit integers and pointers
* Allow other endian
