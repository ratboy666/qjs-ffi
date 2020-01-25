/* test2.js
 */

import * as os from "os";
import * as std from "std";
import * as util from "./util.mjs";

var pid;
var status;

pid = util.fork();
if (pid == 0) {
  console.log("in child: ", pid, "my pid is", util.getpid());
  console.log("parent is:", util.getppid());
  console.log("_exit:", util._exit);
  /* _exit() does not call any atexit function, etc. bail out fast!
   * std.exit() can be used as well.
   */
  util._exit(5);
} else {
  console.log("in parent, child pid: ", pid, "my pid is", util.getpid());
  os.sleep(1000);
  status = os.waitpid(pid, 0);
  console.log(status, status[1] >> 8, "should be 5");
}
