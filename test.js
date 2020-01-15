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
         ffidefine, fficall, ffitostring,
         RTLD_NOW, RTLD_DEFAULT } from "./ffi.so";

var h;
var r;
console.log("Hello World");
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
ffidefine("malloc", malloc, null, "void *", "size_t");
ffidefine("free", free, null, "void", "void *");

/* p = malloc(10); display pointer, free(p)
 */
var p;
p = fficall("malloc", 10);
console.log(p);
fficall("free", p);

/* n = strlen("hello"); which should result in 5
 */
var strlen;
strlen = dlsym(RTLD_DEFAULT, "strlen");
if (strlen == null)
  console.log(dlerror());
ffidefine("strlen", strlen, null, "int", "char *");

var n;
debug();
n = fficall("strlen", "hello");
/* We expect 5 */
console.log(n);

/* p = strdup("dup this").
 */
var strdup;
strdup = dlsym(RTLD_DEFAULT, "strdup");
if (strdup == null)
  console.log(dlerror());
ffidefine("strdup", strdup, null, "char *", "char *");

p = fficall("strdup", "dup this");

/* Convert strdup() result into a string (shoul display 
 * dup this 8
 */
var s;
s = ffitostring(p);
console.log(s, fficall("strlen", p));

fficall("free", p);

