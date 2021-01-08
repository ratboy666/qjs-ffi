import { strerror, err, out, exit, open } from 'std';
import { read, signal, ttySetRaw, write } from 'os';
import { errno, toString, toArrayBuffer, toPointer, argSize, ptrSize } from 'ffi';
import { Socket, socket, AF_INET, SOCK_STREAM, ndelay, connect, sockaddr_in, select, fd_set, timeval, FD_SET, FD_CLR, FD_ISSET, FD_ZERO, errnos, send, recv } from './socket.js';
import {
  termios,
  tcgetattr,
  tcsetattr,
  TCSANOW,
  IGNPAR,
  IMAXBEL,
  IUTF8,
  OPOST,
  ONLCR,
  CR0,
  TAB0,
  BS0,
  VT0,
  FF0,
  EXTB,
  CS8,
  CREAD,
  ISIG,
  ECHOE,
  ECHOK,
  ECHOCTL,
  ECHOKE,
  VINTR,
  cfgetospeed,
  cfsetospeed,
  B57600,
  B115200
} from './term.js';

function not(n) {
  return ~n >>> 0;
}

const STDIN_FILENO = 0,
  STDOUT_FILENO = 1,
  STDERR_FILENO = 2;

let tattr = new termios();
let log = err;

function debug(fmt, ...args) {
  log.printf(fmt + '\n', ...args);
  log.flush();
}

function main(...args) {
  if (/^-o/.test(args[0])) {
    let arg = args[0].length == 2 ? (args.shift(), args.shift()) : args.shift().slice(2);
    log = open(arg, 'a+');
  }

  debug('%s started (%s) [%s]', scriptArgs[0].replace(/.*\//g, ''), args, new Date().toISOString());

  const SetupTerm = Once(() => {
    //ttySetRaw(STDIN_FILENO);
    ReturnValue(tcgetattr(STDIN_FILENO, tattr), 'tcgetattr');
    debug('tattr: %s', tattr);
    tattr.c_lflag &= not(ISIG | ECHOE | ECHOK | ECHOCTL | ECHOKE);

    ReturnValue(tcsetattr(STDIN_FILENO, TCSANOW, tattr), 'tcsetattr');
    ReturnValue(cfsetospeed(tattr, B115200), 'cfsetospeed');
    ReturnValue(cfgetospeed(tattr), 'cfgetospeed');
  });

  const listen = !!(args[0] == '-l' && args.shift());

  const [addr = '213.136.8.188', port = 23] = args;

  debug('addr: %s, port: %u', addr, port);

  let sock = new Socket();
  let conn;
  debug('socket() fd = %d', +sock);

  let ret;

  if (listen) {
    ret = sock.bind(addr, port);
    ReturnValue(ret, `sock.bind(${addr}, ${port})`);
    ret = sock.listen();
    ReturnValue(ret, `sock.listen())`);
  } else {
    ret = sock.connect(addr, port);

    ReturnValue(ret, `sock.connect(${addr}, ${port})`);
  }

  SetupTerm();

  let inLen = 0,
    inBuf = new ArrayBuffer(128);
  let outLen = 0,
    outBuf = new ArrayBuffer(1024);

  const rfds = new fd_set();
  const wfds = new fd_set();
  let handshake = 0;

  const SendTerm = Once(() => {
    return Send('\xff\xfa\x18\x00XTERM-256COLOR\xff\xf0\x1b[2J');
  });
  const Send = (a, n) => {
    const b = a instanceof ArrayBuffer ? a : StringToBuffer(a);
    if (n === undefined) n = b.byteLength;
    debug('Send -> %s', a instanceof ArrayBuffer ? Dump(b, n, 40) : EscapeString(a));
    return sock.write(b, 0, n);
  };
  debug('errnos: %s', Object.entries(errnos));

  do {
    FD_ZERO(rfds);
    FD_ZERO(wfds);
    FD_CLR(+sock, wfds);

    FD_SET(+sock, rfds);

    if (sock.connecting || outLen) FD_SET(+sock, wfds);
    else if (inLen < inBuf.byteLength) FD_SET(STDIN_FILENO, rfds);

    const timeout = new timeval(5, 0);
    //console.log('select:', sock + 1);

    ret = select(sock + 1, rfds, wfds, null, timeout);

    if (FD_ISSET(+sock, wfds)) {
      if (outLen > 0) {
        //console.log('outBuf:', BufferToString(outBuf));
        if (Send(outBuf, outLen) > 0) {
          outLen = 0;
          if (handshake == 0) {
            ttySetRaw(STDOUT_FILENO);
            signal(2, function () {
              debug('SIGINT');
              [outBuf, outLen] = Append(outBuf, outLen, tattr.c_cc[VINTR]);
            });
            signal(21, function () {
              debug('SIGTTIN');
            });
            signal(22, function () {
              debug('SIGTTOU');
            });
            signal(19, function () {
              debug('SIGSTOP');
            });
            signal(18, function () {
              debug('SIGCONT');
            });
            [outBuf, outLen] = Append(outBuf, outLen, '\x1b[2J');
          }

          if (handshake < 4) handshake++;
        }
      } else {
        conn = sock;
      }
    }
    if (FD_ISSET(+sock, rfds)) {
      if (listen) {
        conn = sock.accept();

        ReturnValue(conn, 'sock.accept()');
      } else {
        conn = sock;
      }
    }

    if (FD_ISSET(+conn, rfds)) {
      let length;
      //debug(`Socket readable handshake=${handshake} ${sock}`);
      if (handshake < 4) {
        length = outLen = sock.read(outBuf, 0, outBuf.byteLength);
      } else {
        const data = new ArrayBuffer(1024);
        length = sock.read(data, 0, data.byteLength);

        if (length > 0) {
          let start = 0;
          let chars = new Uint8Array(data, 0, length);
          if (length >= 2 && chars[0] == 0xff && chars[1] == 0xf2) {
            start += 2;
            length -= 2;
          }
          if (chars[0] == 0xff && chars[1] == 0xfe && chars[2] == 1) {
            start += 3;
            length -= 3;
          }
          let str = BufferToString(data, start, length);
          if (length >= 2 && str.indexOf('\xff\xfe') != -1) {
            SendTerm();
          }
          SetCursor(false);
          // debug('Received data from socket: "%s"', EscapeString(str));
          debug('Recv <- %s', Dump(data, length, 40));
          write(STDOUT_FILENO, data, start, length);
        } else {
          conn = undefined;
        }
      }
      //console.log(`Received ${length} bytes from socket`);
    }
    if (FD_ISSET(STDIN_FILENO, rfds)) {
      let offset, ret;
      again: offset = inLen;
      ret = read(STDIN_FILENO, inBuf, offset, inBuf.byteLength - offset);

      if (ret > 0) {
        inLen += ret;
        let chars = new Uint8Array(inBuf, offset, inLen - offset);
        SetCursor(true);
        for (let i = 0; i < chars.length; i++) {
          //err.printf("char '%c'\n", chars[i]);
          switch (chars[i]) {
            case 0x11: {
              out.printf([/*'\x1bc\x1b[?1000l',*/ '\x1b[?25h', '\r\n', 'Exited\n'].join(''));
              exit(1);
              break;
            }
            case 0xff: {
              if (chars[i + 1] == 0xf2 && chars[i + 2] == 0x03) {
                i += 2;
                [outBuf, outLen] = Append(outBuf, outLen, chars[i]);
                break;
              }
            }
            default: {
              [outBuf, outLen] = Append(outBuf, outLen, chars[i]);
              break;
            }
          }
        }
      }
    }
  } while (!sock.destroyed);
  debug('end');
}

function SetCursor(show) {
  const b = StringToBuffer(show ? '\x1b[34h\x1b[?25h' : '\x1b[?25l');
  write(STDOUT_FILENO, b, 0, b.byteLength);
}

function ReturnValue(ret, ...args) {
  const r = [-1, 0].indexOf(ret) != -1 ? ret + '' : '0x' + NumberToHex(ret, ptrSize * 2);
  debug('%s ret = %s%s%s', args, r, ...(ret == -1 ? [' errno =', errno(), ' error =', strerror(errno())] : ['', '']));
}

function NumberToHex(n, b = 2) {
  let s = (+n).toString(16);
  return '0'.repeat(Math.ceil(s.length / b) * b - s.length) + s;
}

function EscapeString(str) {
  let r = '';
  let codeAt = typeof str == 'string' ? (i) => str.charCodeAt(i) : (i) => str[i];
  for (let i = 0; i < str.length; i++) {
    const code = codeAt(i);

    if (code == 0x0a) r += '\\n';
    else if (code == 0x0d) r += '\\r';
    else if (code == 0x09) r += '\\t';
    else if (code <= 3) r += '\\0';
    else if (code < 32 || code >= 128) r += `\\${('00' + code.toString(8)).slice(-3)}`;
    else r += str[i];
  }
  return r;
}

function BufferToArray(buf, offset, length) {
  let len,
    arr = new Uint8Array(buf, offset !== undefined ? offset : 0, length !== undefined ? length : buf.byteLength);
  //   arr = [...arr];
  if ((len = arr.indexOf(0)) != -1) arr = arr.slice(0, len);
  return arr;
}

function BufferToString(buf, offset, length) {
  return BufferToArray(buf, offset, length).reduce((s, code) => s + String.fromCharCode(code), '');
}

function BufferToBytes(buf, offset = 0, len, limit = Infinity) {
  len = typeof len == 'numer' ? len : buf.byteLength;
  offset = typeof offset == 'numer' ? offset : 0;
  return ArrayToBytes(new Uint8Array(buf, offset, len), undefined, undefined, limit);
}

function ArrayToBytes(arr, delim = ', ', bytes = 1, limit = Infinity) {
  let trail = '';
  delim = typeof delim == 'string' ? delim : ', ';
  bytes = typeof bytes == 'number' ? bytes : 1;

  if (limit !== Infinity) {
    let len = Math.min(arr.length, limit);
    arr = arr.slice(0, len);
    if (len < arr.length) trail = `... ${arr.length - len} more bytes ...`;
  }
  let str = arr.reduce((s, code) => (s != '' ? s + delim : '') + '0x' + ('000000000000000' + code.toString(16)).slice(-(bytes * 2)), '');
  return '[' + str + trail + ']';
}

function AvailableBytes(buf, numBytes) {
  return buf.byteLength - numBytes;
}

function Append(buf, numBytes, ...chars) {
  let n = chars.reduce((a, c) => (typeof c == 'number' ? a + 1 : a + c.length), 0);
  if (AvailableBytes(buf, numBytes) < n) buf = CloneBuf(buf, numBytes + n);
  let a = new Uint8Array(buf, numBytes, n);
  let p = 0;
  for (let i = 0; i < chars.length; i++) {
    if (typeof chars[i] == 'number') {
      a[p++] = chars[i];
    } else if (typeof chars[i] == 'string') {
      const s = chars[i];
      const m = s.length;
      for (let j = 0; j < m; j++) a[p++] = s[j].charCodeAt(0);
    }
  }
  return [buf, numBytes + n];
}

function Dump(buf, numBytes, limit = Infinity) {
  return BufferToBytes(numBytes !== undefined ? buf.slice(0, numBytes) : buf, 0, undefined, limit);
}

function CloneBuf(buf, newLen) {
  let n = newLen !== undefined ? newLen : buf.byteLength;
  let p = toPointer(buf);
  return toArrayBuffer(p, n);
}

function Once(fn, thisArg) {
  let ran = false;
  let ret;

  return function (...args) {
    if (!ran) {
      ret = fn.call(thisArg, ...args);
      ran = true;
    }
    return ret;
  };
}

function StringToBuffer(str) {
  return Uint8Array.from(str.split('').map((ch) => ch.charCodeAt(0))).buffer;
}

main(...scriptArgs.slice(1));
