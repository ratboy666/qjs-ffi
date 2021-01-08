import { strerror, err, out, exit, open, loadFile } from 'std';
import { read, signal, ttySetRaw, write } from 'os';
import { errno, toString, toArrayBuffer, toPointer, argSize, ptrSize } from 'ffi';
import { Socket, socket, socklen_t, AF_INET, SOCK_STREAM, IPPROTO_UDP, ndelay, connect, sockaddr_in, select, fd_set, timeval, FD_SET, FD_CLR, FD_ISSET, FD_ZERO, errnos, send, recv } from './socket.js';
import { termios, tcgetattr, tcsetattr, TCSANOW, IGNPAR, IMAXBEL, IUTF8, OPOST, ONLCR, CR0, TAB0, BS0, VT0, FF0, EXTB, CS8, CREAD, ISIG, ECHOE, ECHOK, ECHOCTL, ECHOKE, VINTR, cfgetospeed, cfsetospeed, B57600, B115200 } from './term.js';

function not(n) {
    return ~n >>> 0;
}

const STDIN_FILENO = 0, STDOUT_FILENO = 1, STDERR_FILENO = 2;

let log = err;

function debug(fmt, ...args) {
    log.printf(fmt + '\n', ...args);
    log.flush();
}

function main(...args) {
    if(/^-o/.test(args[0])) {
        let arg = args[0].length == 2 ? (args.shift(), args.shift()) : args.shift().slice(2);
        log = open(arg, 'a+');
    } else {
        log = open('debug.log', 'w+');
    }

    debug('%s started (%s) [%s]', scriptArgs[0].replace(/.*\//g, ''), args, new Date().toISOString());

    const resolvConf = loadFile('/etc/resolv.conf');
    const servers = resolvConf .split(/\n/g) .filter(l => /^\s*nameserver/.test(l)) .map(l => l.replace(/^\s*nameserver\s*([^\s]+).*/g, '$1'));

    debug('servers: %s', servers.join('\n'));

    const addr = servers[0], port = 53;

    debug('addr: %s, port: %u', addr, port);

    for(let arg of args) {
        out.printf('%s -> %s\n', arg, lookup(arg));
    }

    function lookup(domain) {
        let local = new sockaddr_in(AF_INET, Math.floor(Math.random() * 65535 - 1024) + 1024, '0.0.0.0');

        let remote = new sockaddr_in();

        remote.sin_family = AF_INET;
        remote.sin_port = port;
        remote.sin_addr = addr;

        let sock = new Socket(IPPROTO_UDP);
        debug('socket() fd = %d', +sock);

        let ret = sock.bind(local);
        ReturnValue(ret, `sock.bind(${local})`);

        /*ret = sock.connect(addr, port);

        ReturnValue(ret, `sock.connect(${addr}, ${port})`);*/

        let inLen = 0, inBuf = new ArrayBuffer(128);
        let outLen = 0, outBuf = new ArrayBuffer(1024);

        const rfds = new fd_set();
        const wfds = new fd_set();

        outLen = Copy(new Uint8Array(outBuf), [
            0xff,
            0xff,
            0x01,
            0x00,
            0x00,
            0x01,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            ...ToDomain(domain),
            0x00,
            0x00,
            0x01,
            0x00,
            0x01
        ]);
        new DataView(outBuf).setUint16(0, outLen - 2, false);

        do {
            FD_ZERO(rfds);
            FD_ZERO(wfds);
            FD_CLR(+sock, wfds);

            FD_SET(+sock, rfds);

            if(outLen) FD_SET(+sock, wfds);
            else if(inLen < inBuf.byteLength) FD_SET(+sock, rfds);

            const timeout = new timeval(5, 0);
            //console.log('select:', sock + 1);

            ret = select(sock + 1, rfds, wfds, null, timeout);

            if(FD_ISSET(+sock, wfds)) {
                if(outLen > 0) {
                    //console.log('outBuf:', BufferToString(outBuf));
                    if(sock.sendto(outBuf, outLen, 0, remote) > 0) {
                        outLen = 0;
                    }
                }
            }

            if(FD_ISSET(+sock, rfds)) {
                let length;
                debug('socket readable %s %u', remote, remote.byteLength);

                const data = new ArrayBuffer(1024);
                const slen = new socklen_t(remote.byteLength);
                length = sock.recvfrom(data, data.byteLength, 0, remote, slen);

                if(length > 0) {
                    let u8 = new Uint8Array(data, 0, length);
                    let header = new DataView(data, 0, 12);
                    debug('Num answers: %u', header.getUint16(6, false));
                    let addr = u8.slice(-4).join('.');
                    debug('Received data from socket: %s', ArrayToBytes(u8));

                    sock.close();
                    return addr;
                }
                console.log(`Received ${length} bytes from socket`);
            }
        } while(!sock.destroyed);
    }

    debug('end');
}

function ReturnValue(ret, ...args) {
    const r = [-1, 0].indexOf(ret) != -1 ? ret + '' : '0x' + NumberToHex(ret, ptrSize * 2);
    debug('%s ret = %s%s%s', args, r, ...(ret == -1 ? [' errno =', errno(), ' error =', strerror(errno())] : ['', '']));
}

function NumberToHex(n, b = 2) {
    let s = (+n).toString(16);
    return '0'.repeat(Math.ceil(s.length / b) * b - s.length) + s;
}
/*
function EscapeString(str) {
    let r = '';
    let codeAt = typeof str == 'string' ? i => str.charCodeAt(i) : i => str[i];
    for(let i = 0; i < str.length; i++) {
        const code = codeAt(i);

        if(code == 0x0a) r += '\\n';
        else if(code == 0x0d) r += '\\r';
        else if(code == 0x09) r += '\\t';
        else if(code <= 3) r += '\\0';
        else if(code < 32 || code >= 128)
            r += `\\${('00' + code.toString(8)).slice(-3)}`;
        else r += str[i];
    }
    return r;
}
*/
function BufferToArray(buf, offset, length) {
    let len, arr = new Uint8Array(buf, offset !== undefined ? offset : 0, length !== undefined ? length : buf.byteLength);
    //   arr = [...arr];
    if((len = arr.indexOf(0)) != -1) arr = arr.slice(0, len);
    return arr;
}

function BufferToString(buf, offset, length) {
    return BufferToArray(buf, offset, length).reduce((s, code) => s + String.fromCharCode(code), '');
}

function BufferToBytes(buf, offset = 0, len) {
    const u8 = new Uint8Array(buf, typeof offset == 'number' ? offset : 0, typeof len == 'number' ? len : buf.byteLength );
    return ArrayToBytes(u8);
}

function ArrayToBytes(arr, delim = ', ', bytes = 1) {
    return ('[' +
        arr.reduce((s, code) =>
                (s != '' ? s + delim : '') + '0x' + ('000000000000000' + code.toString(16)).slice(-(bytes * 2)),
            ''
        ) +
        ']'
    );
}

function AvailableBytes(buf, numBytes) {
    return buf.byteLength - numBytes;
}

function Copy(dst, src, len) {
    if(len === undefined) len = src.length;
    if(dst.length < len) throw new RangeError(`dst.length (${dst.length}) < len (${len})`);
    for(let i = 0; i < len; i++) dst[i] = src[i];
    return len;
}

function ToDomain(str, alpha = false) {
    return str
        .split('.')
        .reduce(alpha
                ? (a, s) => a + String.fromCharCode(s.length) + s
                : (a, s) => a.concat([s.length, ...s.split('').map(ch => ch.charCodeAt(0))]),
            alpha ? '' : []
        );
}

function Append(buf, numBytes, ...chars) {
    let n = chars.reduce((a, c) => (typeof c == 'number' ? a + 1 : a + c.length), 0);
    if(AvailableBytes(buf, numBytes) < n) buf = CloneBuf(buf, numBytes + n);
    let a = new Uint8Array(buf, numBytes, n);
    let p = 0;
    for(let i = 0; i < chars.length; i++) {
        if(typeof chars[i] == 'number') {
            a[p++] = chars[i];
        } else if(typeof chars[i] == 'string') {
            const s = chars[i];
            const m = s.length;
            for(let j = 0; j < m; j++) a[p++] = s[j].charCodeAt(0);
        }
    }
    return [buf, numBytes + n];
}

function Dump(buf, numBytes) {
    return BufferToBytes(numBytes !== undefined ? buf.slice(0, numBytes) : buf);
} /*

function CloneBuf(buf, newLen) {
    let n = newLen !== undefined ? newLen : buf.byteLength;
    let p = toPointer(buf);
    return toArrayBuffer(p, n);
}

function Once(fn, thisArg) {
    let ran = false;
    let ret;

    return function(...args) {
        if(!ran) {
            ret = fn.call(thisArg, ...args);
            ran = true;
        }
        return ret;
    };
}
*/
function StringToBuffer(str) {
    return Uint8Array.from(str.split('').map(ch => ch.charCodeAt(0))).buffer;
}

main(...scriptArgs.slice(1));
