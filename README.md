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
$ git clone https://github.com/allinurl/gwsocket.git
$ cd gwsocket
$ autoreconf -fiv
$ ./configure
$ make
# make install
```

## Data Modes ##
In order to establish a channel between your application and the client's
browser, gwsocket provides two methods that allow the user to send data in and
out. The first one is through the use of the standard input (stdin), and the
standard output (stdout). The second method is through a fixed-size header
followed by the payload. See options below for more details.

### STDIN/STDOUT ###
The standard input/output is the simplest way of sending/receiving data to/from
a client. However, it's limited to broadcasting messages to all clients. To
send messages to or receive from a specific client, use the strict mode in the
next section. See language specific examples [here](http://gwsocket.io/).

### Strict Mode ###
gwsocket implements its own tiny protocol for sending/receiving data. In
contrast to the **stdin/stdout** mode, the strict mode allows you to
send/receive data to/from specific connected clients as well as to keep track
of who opened/closed a WebSocket connection. It also gives you the ability to
pack and send as much data as you would like on a single message. See language
specific examples [here](http://gwsocket.io/).

## Command Line / Config Options ##
The following options can be supplied to the command line.


| Command Line Option          | Description                                                         |
| ---------------------------- | --------------------------------------------------------------------|
| `-p --port`                  | Specifies the port to bind.                                         |
| `-h --help`                  | Command line help.                                                  |
| `-V --version`               | Display version information and exit.                               |
| `--access-log=<path/file>`   | Specifies the path/file for the access log.                         |
| `--addr=<addr>`              | Specifies the address to bind.                                      |
| `--echo-mode`                | Set the server to echo all received messages.                       |
| `--max-frame-size=<bytes>`   | Maximum size of a websocket frame.                                  |
| `--origin=<origin>`          | Ensure clients send the specified origin header upon handshake.     |
| `--pipein=<path/file>`       | Creates a named pipe (FIFO) that reads from on the given path/file. |
| `--pipeout=<path/file>`      | Creates a named pipe (FIFO) that writes to the given path/file.     |
| `--strict`                   | Parse messages using strict mode. See man page for more details.    |
| `--ssl-cert=<cert.crt>`      | Path to SSL certificate.                                            |
| `--ssl-key=<priv.key>`       | Path to SSL private key.                                            |

## Roadmap ##
* Support for `epoll` and `kqueue`
* Add more command line options
* Add configuration file
* Please feel free to open an issue to discuss a new feature.

## License ##
MIT Licensed

## Contributing ##

Any help on gwsocket is welcome. The most helpful way is to try it out and give
feedback. Feel free to use the Github issue tracker and pull requests to
discuss and submit code changes.

Enjoy!
