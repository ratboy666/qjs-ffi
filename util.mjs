/* util.mjs
 */

import * as std from "std";
import * as os from "os";
import * as ffi from "./ffi.so";


/* Define a function
 */
export function define(so, name, rtype, ...args) {
  if ((so == null) || (so == undefined))
    so = ffi.RTLD_DEFAULT;
  var p = ffi.dlsym(so, name);
  if (p == null) {
    console.log(name, "not in so");
    std.exit(1);
  }
  if (!ffi.define(name, p, null, rtype, ...args)) {
    console.log("define failed");
    std.exit(1);
  }
  return function (...a) {
    return ffi.call(name, ...a);
  }
}

export var getpid = define(null, "getpid", "int");
export var getppid = define(null, "getppid", "int");
export var _exit = define(null, "_exit", "void", "int");
export var fork = define(null, "fork", "int");
