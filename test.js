/* test.js
 *
 * Test harness for JavaScript ffi
 *
 * Tektonics:
 *
 *   Build shared object:
 *
 *   gcc -g -fPIC -DJS_SHARED_LIBRARY -c ffi.c
 *   gcc -g -shared -o ffi.so ffi.o -lffi -ldl
 *
 *   Debug shared object:
 *
 *   gdb qjs
 *     set args test.js
 *     b js_debug
 *     run
 *
 *   This will stop in gdb on the first debug(); call.
 *
 */

import * as std from "std";
import * as os from "os";
import { debug, dlopen, dlerror, dlclose, dlsym,
         define, call, toString, toArrayBuffer,
         errno, JSContext,
         RTLD_LAZY, RTLD_NOW, RTLD_GLOBAL, RTLD_LOCAL,
         RTLD_NODELETE, RTLD_NOLOAD, RTLD_DEEPBIND,
         RTLD_DEFAULT, RTLD_NEXT } from "./ffi.so";

var h;
var r;
console.log("Hello World");
debug();
console.log("RTLD_NOW = ", RTLD_NOW);
/* Expect an error -- libc.so is (usually) a linker script */
console.log("dlopen = ", r = dlopen("libc.so", RTLD_NOW));
if (r == null)
  console.log("dlerror = ", dlerror());
/* But, using libc.so.6 should work */
console.log("dlopen = ", h = dlopen("libc.so.6", RTLD_NOW));
if (h == null)
  console.log("dlerror = ", dlerror());
console.log("dlsym = ", r = dlsym(h, "malloc"));
if (r == null)
  console.log("dlerror = ", dlerror());
console.log("dlclose = ", r = dlclose(h));
if (r != 0)
  console.log("dlerror = ", dlerror());
console.log("dlopen = ", h = dlopen(null, RTLD_NOW));
if (h == null)
  console.log("dlerror = ", dlerror());
console.log("dlsym = ", r = dlsym(h, "malloc"));
if (r == null)
  console.log("dlerror = ", dlerror());
console.log("dlclose = ", r = dlclose(h));
if (r != 0)
  console.log("dlerror = ", dlerror());
var malloc;
console.log("dlsym = ", malloc = dlsym(RTLD_DEFAULT, "malloc"));
if (malloc == null)
  console.log("dlerror = ", dlerror());
var free;
console.log("dlsym = ", free = dlsym(RTLD_DEFAULT, "free"));
if (free == null)
  console.log("dlerror = ", dlerror());

/* We have function pointers to malloc and free -- define the ffi
 * functions
 */
define("malloc", malloc, null, "void *", "size_t");
define("free", free, null, "void", "void *");

/* p = malloc(10); display pointer, free(p)
 */
var p;
p = call("malloc", 10);
console.log(p);
call("free", p);

/* n = strlen("hello"); which should result in 5
 */
var strlen;
strlen = dlsym(RTLD_DEFAULT, "strlen");
if (strlen == null)
  console.log(dlerror());
define("strlen", strlen, null, "int", "char *");

var n;
n = call("strlen", "hello");
/* We expect 5 */
console.log(n);

/* p = strdup("dup this").
 */
var strdup;
strdup = dlsym(RTLD_DEFAULT, "strdup");
if (strdup == null)
  console.log(dlerror());
define("strdup", strdup, null, "char *", "char *");

p = call("strdup", "dup this");

/* Convert strdup() result into a string (should display 
 * dup this 8
 */
var s;
s = toString(p);
console.log(s, call("strlen", p));


console.log();
console.log('testing test.so functions');
h = dlopen('./test.so', RTLD_NOW);
if (h == null)
  console.log("can't load ./test.so: ", dlerror());
var fp;
fp = dlsym(h, "test1");
if (fp == null)
  console.log("can't find symbol test1: ", dlerror());
if (!define("test1", fp, null, "int", "void *"))
  console.log("can't define test1");
/* test1 takes a buffer but a string will work -- changes to the string
 * are lost, because a writable buffer is passed, but discarded before
 * the return.
 */
r = call("test1", "abc");
console.log("should be 5: ", r);
/* pass buffer to test1 -- test1 changes the buffer in place, and this
 * is reflected in quickjs
 */
var b;
b = new ArrayBuffer(8);
var u;
u = new Uint8Array(b);
u[0] = 1;
u[1] = 2;
u[2] = 3;
console.log("should print 1 2 3");
r = call("test1", b);
console.log("should print 3,2,1,0,0,0,0,0");
console.log(u);

/* p is a pointer to "dup this" -- 9 bytes of memory
 */
b = toArrayBuffer(p, 9);
u = new Uint8Array(b);
console.log(u);

call("free", p);

fp = dlsym(RTLD_DEFAULT, "strtoul");
if (fp == null)
  console.log(dlerror());
define("strtoul", fp, null, "ulong", "string", "string", "int");
n = call("strtoul", "1234", null, 0);
console.log(n, "Should be 1234");
call("strtoul", '1234567890123456789012345678901234567890', null, 0);
console.log(errno(), "should be 34 (ERANGE)");

p = JSContext();
console.log("jscontext = ", p);

