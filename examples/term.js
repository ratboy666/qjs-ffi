import { dlsym, define, call, RTLD_DEFAULT } from 'ffi.so';

export const _IOC = (a, b, c, d) => (a << 30) | (b << 8) | c | (d << 16);
export const _IOC_NONE = 0;
export const _IOC_WRITE = 1;
export const _IOC_READ = 2;

export const _IO = (a, b) => _IOC(_IOC_NONE, a, b, 0);
//export const _IOW = (a, b, c) => _IOC(_IOC_WRITE, a, b, sizeof(c));
//export const _IOR = (a, b, c) => _IOC(_IOC_READ, a, b, sizeof(c));
//export const _IOWR = (a, b, c) => _IOC(_IOC_READ | _IOC_WRITE, a, b, sizeof(c));

/* c_iflag bits */
export const IGNBRK = 0x01;
export const BRKINT = 0x02;
export const IGNPAR = 0x04;
export const PARMRK = 0x08;
export const INPCK = 0x10;
export const ISTRIP = 0x20;
export const INLCR = 0x40;
export const IGNCR = 0x80;
export const ICRNL = 0x0100;
export const IUCLC = 0x0200;
export const IXON = 0x0400;
export const IXANY = 0x0800;
export const IXOFF = 0x1000;
export const IMAXBEL = 0x2000;
export const IUTF8 = 0x4000;

/* c_oflag bits */
export const OPOST = 0x01;
export const OLCUC = 0x02;
export const ONLCR = 0x04;
export const OCRNL = 0x08;
export const ONOCR = 0x10;
export const ONLRET = 0x20;
export const OFILL = 0x40;
export const OFDEL = 0x80;
export const NLDLY = 0x0100;
export const NL0 = 0x00;
export const NL1 = 0x0100;
export const CRDLY = 0x0600;
export const CR0 = 0x00;
export const CR1 = 0x0200;
export const CR2 = 0x0400;
export const CR3 = 0x0600;
export const TABDLY = 0x1800;
export const TAB0 = 0x00;
export const TAB1 = 0x0800;
export const TAB2 = 0x1000;
export const TAB3 = 0x1800;
export const XTABS = 0x1800;
export const BSDLY = 0x2000;
export const BS0 = 0x00;
export const BS1 = 0x2000;
export const VTDLY = 0x4000;
export const VT0 = 0x00;
export const VT1 = 0x4000;
export const FFDLY = 0x8000;
export const FF0 = 0x00;
export const FF1 = 0x8000;

/* c_cflag bit meaning */
export const CBAUD = 0x100f;
export const B0 = 0x00; /* hang up */
export const B50 = 0x01;
export const B75 = 0x02;
export const B110 = 0x03;
export const B134 = 0x04;
export const B150 = 0x05;
export const B200 = 0x06;
export const B300 = 0x07;
export const B600 = 0x08;
export const B1200 = 0x09;
export const B1800 = 0x0a;
export const B2400 = 0x0b;
export const B4800 = 0x0c;
export const B9600 = 0x0d;
export const B19200 = 0x0e;
export const B38400 = 0x0f;
export const EXTA = B19200;
export const EXTB = B38400;
export const CSIZE = 0x30;
export const CS5 = 0x00;
export const CS6 = 0x10;
export const CS7 = 0x20;
export const CS8 = 0x30;
export const CSTOPB = 0x40;
export const CREAD = 0x80;
export const PARENB = 0x0100;
export const PARODD = 0x0200;
export const HUPCL = 0x0400;
export const CLOCAL = 0x0800;
export const CBAUDEX = 0x1000;
export const B57600 = 0x1001;
export const B115200 = 0x1002;
export const B230400 = 0x1003;
export const B460800 = 0x1004;
export const B500000 = 0x1005;
export const B576000 = 0x1006;
export const B921600 = 0x1007;
export const B1000000 = 0x1008;
export const B1152000 = 0x1009;
export const B1500000 = 0x100a;
export const B2000000 = 0x100b;
export const B2500000 = 0x100c;
export const B3000000 = 0x100d;
export const B3500000 = 0x100e;
export const B4000000 = 0x100f;
export const CIBAUD = 0x100f0000; /* input baud rate (not used) */
export const CMSPAR = 0x40000000; /* mark or space (stick) parity */
export const CRTSCTS = '0x80000000'; /* flow control */

/* c_lflag bits */
export const ISIG = 0x01;
export const ICANON = 0x02;
export const XCASE = 0x04;
export const ECHO = 0x08;
export const ECHOE = 0x10;
export const ECHOK = 0x20;
export const ECHONL = 0x40;
export const NOFLSH = 0x80;
export const ECHOCTL = 0x0200;
export const ECHOPRT = 0x0400;
export const ECHOKE = 0x0800;

export const TOSTOP = 0x0100;
export const FLUSHO = 0x1000;
export const IEXTEN = 0x8000;
export const PENDIN = 0x4000;

/* tcflow() and TCXONC use these */
export const TCOOFF = 0;
export const TCOON = 1;
export const TCIOFF = 2;
export const TCION = 3;

/* tcflush() and TCFLSH use these */
export const TCIFLUSH = 0;
export const TCOFLUSH = 1;
export const TCIOFLUSH = 2;

/* tcsetattr uses these */
export const TCSANOW = 0;
export const TCSADRAIN = 1;
export const TCSAFLUSH = 2;

export const TCGETS = 0x5401;
export const TCSETS = 0x5402;
export const TCSETSW = 0x5403;
export const TCSETSF = 0x5404;
export const TCGETA = 0x5405;
export const TCSETA = 0x5406;
export const TCSETAW = 0x5407;
export const TCSETAF = 0x5408;
export const TCSBRK = 0x5409;
export const TCXONC = 0x540a;
export const TCFLSH = 0x540b;
export const TIOCEXCL = 0x540c;
export const TIOCNXCL = 0x540d;
export const TIOCSCTTY = 0x540e;
export const TIOCGPGRP = 0x540f;
export const TIOCSPGRP = 0x5410;
export const TIOCOUTQ = 0x5411;
export const TIOCSTI = 0x5412;
export const TIOCGWINSZ = 0x5413;
export const TIOCSWINSZ = 0x5414;
export const TIOCMGET = 0x5415;
export const TIOCMBIS = 0x5416;
export const TIOCMBIC = 0x5417;
export const TIOCMSET = 0x5418;
export const TIOCGSOFTCAR = 0x5419;
export const TIOCSSOFTCAR = 0x541a;
export const FIONREAD = 0x541b;
export const TIOCINQ = FIONREAD;
export const TIOCLINUX = 0x541c;
export const TIOCCONS = 0x541d;
export const TIOCGSERIAL = 0x541e;
export const TIOCSSERIAL = 0x541f;
export const TIOCPKT = 0x5420;
export const FIONBIO = 0x5421;
export const TIOCNOTTY = 0x5422;
export const TIOCSETD = 0x5423;
export const TIOCGETD = 0x5424;
export const TCSBRKP = 0x5425;
export const TIOCSBRK = 0x5427;
export const TIOCCBRK = 0x5428;
export const TIOCGSID = 0x5429;
export const TIOCGRS485 = 0x542e;
export const TIOCSRS485 = 0x542f;
export const TIOCGPTN = '0x80045430';
export const TIOCSPTLCK = 0x40045431;
export const TIOCGDEV = '0x80045432';
export const TCGETX = 0x5432;
export const TCSETX = 0x5433;
export const TCSETXF = 0x5434;
export const TCSETXW = 0x5435;
export const TIOCSIG = 0x40045436;
export const TIOCVHANGUP = 0x5437;
export const TIOCGPKT = '0x80045438';
export const TIOCGPTLCK = '0x80045439';
export const TIOCGEXCL = '0x80045440';
export const TIOCGPTPEER = 0x5441;

export const FIONCLEX = 0x5450;
export const FIOCLEX = 0x5451;
export const FIOASYNC = 0x5452;
export const TIOCSERCONFIG = 0x5453;
export const TIOCSERGWILD = 0x5454;
export const TIOCSERSWILD = 0x5455;
export const TIOCGLCKTRMIOS = 0x5456;
export const TIOCSLCKTRMIOS = 0x5457;
export const TIOCSERGSTRUCT = 0x5458;
export const TIOCSERGETLSR = 0x5459;
export const TIOCSERGETMULTI = 0x545a;
export const TIOCSERSETMULTI = 0x545b;

export const TIOCMIWAIT = 0x545c;
export const TIOCGICOUNT = 0x545d;
export const FIOQSIZE = 0x5460;

export const TIOCPKT_DATA = 0;
export const TIOCPKT_FLUSHREAD = 1;
export const TIOCPKT_FLUSHWRITE = 2;
export const TIOCPKT_STOP = 4;
export const TIOCPKT_START = 8;
export const TIOCPKT_NOSTOP = 16;
export const TIOCPKT_DOSTOP = 32;
export const TIOCPKT_IOCTL = 64;

export const TIOCSER_TEMT = 0x01;

/*struct winsize {
	unsigned short ws_row;
	unsigned short ws_col;
	unsigned short ws_xpixel;
	unsigned short ws_ypixel;
};*/

export const TIOCM_LE = 0x0001;
export const TIOCM_DTR = 0x0002;
export const TIOCM_RTS = 0x0004;
export const TIOCM_ST = 0x0008;
export const TIOCM_SR = 0x0010;
export const TIOCM_CTS = 0x0020;
export const TIOCM_CAR = 0x0040;
export const TIOCM_RNG = 0x0080;
export const TIOCM_DSR = 0x0100;
export const TIOCM_CD = TIOCM_CAR;
export const TIOCM_RI = TIOCM_RNG;
export const TIOCM_OUT1 = 0x2000;
export const TIOCM_OUT2 = 0x4000;
export const TIOCM_LOOP = 0x8000;

export const N_TTY = 0;
export const N_SLIP = 1;
export const N_MOUSE = 2;
export const N_PPP = 3;
export const N_STRIP = 4;
export const N_AX25 = 5;
export const N_X25 = 6; /* X.25 async */
export const N_6PACK = 7;
export const N_MASC = 8; /* Reserved for Mobitex module <kaz@cafe.net> */
export const N_R3964 = 9; /* Reserved for Simatic R3964 module */
export const N_PROFIBUS_FDL = 10; /* Reserved for Profibus <Dave@mvhi.com> */
export const N_IRDA = 11; /* Linux IR - http://irda.sourceforge.net/ */
export const N_SMSBLOCK = 12; /* SMS block mode - for talking to GSM data cards about SMS messages */
export const N_HDLC = 13; /* synchronous HDLC */
export const N_SYNC_PPP = 14; /* synchronous PPP */
export const N_HCI = 15; /* Bluetooth HCI UART */

export const FIOSETOWN = 0x8901;
export const SIOCSPGRP = 0x8902;
export const FIOGETOWN = 0x8903;
export const SIOCGPGRP = 0x8904;
export const SIOCATMARK = 0x8905;
export const SIOCGSTAMP = 0x8906;
export const SIOCGSTAMPNS = 0x8907;

export const SIOCADDRT = 0x890b;
export const SIOCDELRT = 0x890c;
export const SIOCRTMSG = 0x890d;

export const SIOCGIFNAME = 0x8910;
export const SIOCSIFLINK = 0x8911;
export const SIOCGIFCONF = 0x8912;
export const SIOCGIFFLAGS = 0x8913;
export const SIOCSIFFLAGS = 0x8914;
export const SIOCGIFADDR = 0x8915;
export const SIOCSIFADDR = 0x8916;
export const SIOCGIFDSTADDR = 0x8917;
export const SIOCSIFDSTADDR = 0x8918;
export const SIOCGIFBRDADDR = 0x8919;
export const SIOCSIFBRDADDR = 0x891a;
export const SIOCGIFNETMASK = 0x891b;
export const SIOCSIFNETMASK = 0x891c;
export const SIOCGIFMETRIC = 0x891d;
export const SIOCSIFMETRIC = 0x891e;
export const SIOCGIFMEM = 0x891f;
export const SIOCSIFMEM = 0x8920;
export const SIOCGIFMTU = 0x8921;
export const SIOCSIFMTU = 0x8922;
export const SIOCSIFNAME = 0x8923;
export const SIOCSIFHWADDR = 0x8924;
export const SIOCGIFENCAP = 0x8925;
export const SIOCSIFENCAP = 0x8926;
export const SIOCGIFHWADDR = 0x8927;
export const SIOCGIFSLAVE = 0x8929;
export const SIOCSIFSLAVE = 0x8930;
export const SIOCADDMULTI = 0x8931;
export const SIOCDELMULTI = 0x8932;
export const SIOCGIFINDEX = 0x8933;
export const SIOGIFINDEX = SIOCGIFINDEX;
export const SIOCSIFPFLAGS = 0x8934;
export const SIOCGIFPFLAGS = 0x8935;
export const SIOCDIFADDR = 0x8936;
export const SIOCSIFHWBROADCAST = 0x8937;
export const SIOCGIFCOUNT = 0x8938;

export const SIOCGIFBR = 0x8940;
export const SIOCSIFBR = 0x8941;

export const SIOCGIFTXQLEN = 0x8942;
export const SIOCSIFTXQLEN = 0x8943;

export const SIOCDARP = 0x8953;
export const SIOCGARP = 0x8954;
export const SIOCSARP = 0x8955;

export const SIOCDRARP = 0x8960;
export const SIOCGRARP = 0x8961;
export const SIOCSRARP = 0x8962;

export const SIOCGIFMAP = 0x8970;
export const SIOCSIFMAP = 0x8971;

export const SIOCADDDLCI = 0x8980;
export const SIOCDELDLCI = 0x8981;

export const SIOCDEVPRIVATE = 0x89f0;
export const SIOCPROTOPRIVATE = 0x89e0;

export const NCC = 8;
export const NCCS = 19;

/*export const TIOCM_DTR = 0x0002; 
export const TIOCM_RTS = 0x0004; 
export const TIOCM_ST = 0x0008; 
export const TIOCM_SR = 0x0010; 
export const TIOCM_CTS = 0x0020; 
export const TIOCM_CAR = 0x0040; 
export const TIOCM_RNG = 0x0080; 
export const TIOCM_DSR = 0x0100; 
export const TIOCM_CD = TIOCM_CAR; 
export const TIOCM_RI = TIOCM_RNG; 
export const TIOCM_OUT1 = 0x2000; 
export const TIOCM_OUT2 = 0x4000; 
export const TIOCM_LOOP = 0x8000; */

export const _POSIX_VDISABLE = '\0';
export const VINTR = 0;
export const VQUIT = 1;
export const VERASE = 2;
export const VKILL = 3;
export const VEOF = 4;
export const VTIME = 5;
export const VMIN = 6;
export const VSWTC = 7;
export const VSTART = 8;
export const VSTOP = 9;
export const VSUSP = 10;
export const VEOL = 11;
export const VREPRINT = 12;
export const VDISCARD = 13;
export const VWERASE = 14;
export const VLNEXT = 15;
export const VEOL2 = 16;

const cterm = [ 'tcdrain', 'tcgetsid', 'tcsendbreak', 'tcsetattr', 'tcflow', 'tcsetpgrp', 'tcflush', 'tcgetattr', 'tcgetpgrp', 'cfgetospeed', 'cfsetospeed', 'cfgetispeed', 'cfsetispeed' ].reduce((o, s) => { let fp = dlsym(RTLD_DEFAULT, s);
    if(fp == null) {
        console.log(dlerror());
        return o;
    }
    return { ...o, [s]: fp };
}, {});

function def(name, abi, ...params) {
    let defined = false;
    return (...args) => {
        if(!defined) {
            define(name, cterm[name], abi, ...params);
            defined = true;
        }
        return call(name, ...args);
    };
}

/* int tcgetattr(int fd, struct termios *termios_p); */
export const tcgetattr = def('tcgetattr', null, 'int', 'int', 'buffer');

/* int tcsetattr(int fd, int optional_actions, struct termios *termios_p); */
export const tcsetattr = def('tcsetattr', null, 'int', 'int', 'int', 'buffer');

/* int tcflush(int fd, int queue_selector); */
export const tcflush = def('tcflush', null, 'int', 'int', 'int');

/* int tcdrain(int fd); */
export const tcdrain = def('tcdrain', null, 'int', 'int');

/* int tcflow(int fd, int action); */
export const tcflow = def('tcflow', null, 'int', 'int', 'int');

/* int tcsendbreak(int fd, int duration); */
export const tcsendbreak = def('tcsendbreak', null, 'int', 'int', 'int');

/* pid_t tcgetsid(int fd); */
export const tcgetsid = def('tcgetsid', null, 'int', 'int');

/* pid_t tcgetpgrp(int fd); */
export const tcgetpgrp = def('tcgetpgrp', null, 'int', 'int');

/* int tcsetpgrp(int fd, pid_t pgrpid); */
export const tcsetpgrp = def('tcsetpgrp', null, 'int', 'int', 'int');

/* speed_t cfgetospeed(const struct termios *termios_p); */
export const cfgetospeed = def('cfgetospeed', null, 'int', 'buffer');

/* int cfsetospeed(struct termios *termios_p, speed_t speed); */
export const cfsetospeed = def('cfsetospeed', null, 'int', 'buffer', 'int');

/* speed_t cfgetispeed(const struct termios *termios_p); */
export const cfgetispeed = def('cfgetispeed', null, 'int', 'buffer');

/* int cfsetispeed(struct termios *termios_p, speed_t speed); */
export const cfsetispeed = def('cfsetispeed', null, 'int', 'buffer', 'int');

export class winsize extends ArrayBuffer {
    constructor(row, col, x, y) {
        super(4 * 2);

        this.ws_row = row | 0;
        this.ws_col = col | 0;
        this.ws_xpixel = x | 0;
        this.ws_ypixel = y | 0;
    }
    get ws_row() { return new Uint16Array(this, 0)[0]; }
    set ws_row(v) { new Uint16Array(this, 0)[0] = v >>> 0; }
    get ws_col() { return new Uint16Array(this, 2)[0]; }
    set ws_col(v) { new Uint16Array(this, 2)[0] = v >>> 0; }
    get ws_xpixel() { return new Uint16Array(this, 4)[0]; }
    set ws_xpixel(v) { new Uint16Array(this, 4)[0] = v >>> 0; }
    get ws_ypixel() { return new Uint16Array(this, 6)[0]; }
    set ws_ypixel(v) { new Uint16Array(this, 6)[0] = v >>> 0; }
}

export class termio extends ArrayBuffer {
    static fields = Uint16Array;
    constructor() {
        super(18);
    }
    get c_iflag() { return new termio.fields(this, 0)[0]; }
    set c_iflag(v) { new termio.fields(this, 0)[0] = v >>> 0; }
    get c_oflag() { return new termio.fields(this, 2)[0]; }
    set c_oflag(v) { new termio.fields(this, 2)[0] = v >>> 0; }
    get c_cflag() { return new termio.fields(this, 4)[0]; }
    set c_cflag(v) { new termio.fields(this, 4)[0] = v >>> 0; }
    get c_lflag() { return new termio.fields(this, 6)[0]; }
    set c_lflag(v) { new termio.fields(this, 6)[0] = v >>> 0; }
    get c_line() { return new Uint8Array(this, 8)[0]; }
    set c_line(v) { new Uint8Array(this, 8)[0] =  typeof(v) == 'string' ? v.charCodeAt(0) : v; }
    get c_cc() { return new Uint8Array(this, 9).slice(0,NCC); }
    set c_cc(v) { const a = new Uint8Array(this, 9, NCC); const n = Math.min(v.length, a.length); for(let i = 0; i < n; i++) a[i] = typeof(v[i]) == 'string' ? v[i].charCodeAt(0) : v[i]; }
}

export class termios extends ArrayBuffer {
    static fields = Uint32Array;
    constructor() {
        super(60);
    }
    get c_iflag() { return new termios.fields(this, 0)[0]; }
    set c_iflag(v) { new termios.fields(this, 0)[0] = v >>> 0; }
    get c_oflag() { return new termios.fields(this, 4)[0]; }
    set c_oflag(v) { new termios.fields(this, 4)[0] = v >>> 0; }
    get c_cflag() { return new termios.fields(this, 8)[0]; }
    set c_cflag(v) { new termios.fields(this, 8)[0] = v >>> 0; }
    get c_lflag() { return new termios.fields(this, 12)[0]; }
    set c_lflag(v) { new termios.fields(this, 12)[0] = v >>> 0; }
    get c_line() { return new Uint8Array(this, 16)[0]; }
    set c_line(v) { new Uint8Array(this, 16)[0] = v >>> 0; }
    get c_cc() { return new Uint8Array(this, 17, NCCS)/*.map(c => String.fromCharCode(c))*/; }
    set c_cc(v) { const a = new Uint8Array(this, 17, NCCS); const n = Math.min(v.length, a.length); for(let i = 0; i < n; i++) a[i] =  typeof(v[i]) == 'string' ? v[i].charCodeAt(0) : v[i]; }

    /* prettier-ignore */
    toString() {
return `{ .c_iflag=${this.c_iflag}, .c_oflag=${this.c_oflag}, .c_cflag=${this.c_cflag}, .c_lflag=${this.c_lflag}, .c_line=${this.c_line}, .c_cc=${this.c_cc} }`;
		const i = termios.flags(this.c_iflag, { IGNBRK, BRKINT, IGNPAR, PARMRK, INPCK, ISTRIP, INLCR, IGNCR, ICRNL, IUCLC, IXON, IXANY, IXOFF, IMAXBEL, IUTF8 });
		const o = termios.flags(this.c_oflag, { OPOST, OLCUC, ONLCR, OCRNL, ONOCR, ONLRET, OFILL, OFDEL, NLDLY, NL0, NL1, CRDLY: [b => b & CRDLY, { CR0, CR1, CR2, CR3 }], TABDLY: [b => b & TABDLY, { TAB0, TAB1, TAB2, TAB3, XTABS }], BSDLY: [b => b & BSDLY, { BS0, BS1 }], VTDLY: [b => b & VTDLY, { VT0, VT1 }], FFDLY: [b => b & FFDLY, { FF0, FF1 }] });
		const c = termios.flags(this.c_cflag, { EXT: [b => b & CBAUD, { EXTA, EXTB }], CSIZE: [b => b & CSIZE, { CS5, CS6, CS7, CS8 }], CSTOPB, CREAD, PARENB, PARODD, HUPCL, CLOCAL, CMSPAR, CRTSCTS, BAUD: [b => b & CBAUD, termios.rates] });
		const l = termios.flags(this.c_lflag, { ISIG, ICANON, XCASE, ECHO, ECHOE, ECHOK, ECHONL, NOFLSH, ECHOCTL, ECHOPRT, ECHOKE, TOSTOP, FLUSHO, IEXTEN, PENDIN });

		return '{\n' + [
			'iflag = ' + i,
			'oflag = ' + o,
			'cflag = ' + c,
			'lflag = ' + l,
			'line = ' + this.c_line,
			`cc = [\n${[...this.c_cc].map((ch,i) => ((['VINTR', 'VQUIT', 'VERASE', 'VKILL', 'VEOF', 'VTIME', 'VMIN', 'VSWTC', 'VSTART', 'VSTOP', 'VSUSP', 'VEOL', 'VREPRINT', 'VDISCARD', 'VWERASE', 'VLNEXT', 'VEOL2'][i]||`[${i}]`)+': ').padStart(12)+ (('00'+ch.toString(16).toUpperCase()).slice(-2))).join("\n")}\n  ]`
		].map(s => `  .c_${s}`).join(',\n') + '\n}';
	}

    static rates = {
        [B0]: 0,
        [B50]: 50,
        [B75]: 75,
        [B110]: 110,
        [B134]: 134,
        [B150]: 150,
        [B200]: 200,
        [B300]: 300,
        [B600]: 600,
        [B1200]: 1200,
        [B1800]: 1800,
        [B2400]: 2400,
        [B4800]: 4800,
        [B9600]: 9600,
        [B19200]: 19200,
        [B38400]: 38400,
        [B57600]: 57600,
        [B115200]: 115200,
        [B230400]: 230400,
        [B460800]: 460800,
        [B500000]: 500000,
        [B576000]: 576000,
        [B921600]: 921600,
        [B1000000]: 1000000,
        [B1152000]: 1152000,
        [B1500000]: 1500000,
        [B2000000]: 2000000,
        [B2500000]: 2500000,
        [B3000000]: 3000000,
        [B3500000]: 3500000,
        [B4000000]: 4000000
    };

    static flags(flags, obj) {
        const r = [];
        for(const name in obj) {
            const bit = obj[name];
            if(typeof bit[0] == 'function') {
                const [mask, o] = bit;
                const h = mask(flags);
                const e = Object.entries(o).find(([name, b]) => mask(b) == h);
                if(e) r.push(e[0]);
            } else {
                if(countBits(bit) > 1) throw new Error(`flags name=${name} bit=0x${bit.toString(16)}`);
                if(flags & bit) r.push(name);
            }
        }
        return r.join(' | ') || 0;
    }
}

function countBits(num) {
    return num
        .toString(2)
        .split('')
        .map(n => +n)
        .reduce((a, b) => a + b, 0);
}

function NumberToHex(n, b = 2) {
    let s = (+n).toString(16);
    return '0x' + '0'.repeat(Math.ceil(s.length / b) * b - s.length) + s;
}

/* prettier-ignore */
export default { _IOC, _IOC_NONE, _IOC_WRITE, _IOC_READ, _IO,/* _IOW, _IOR, _IOWR,*/ IGNBRK, BRKINT, IGNPAR, PARMRK, INPCK, ISTRIP, INLCR, IGNCR, ICRNL, IUCLC, IXON, IXANY, IXOFF, IMAXBEL, IUTF8, OPOST, OLCUC, ONLCR, OCRNL, ONOCR, ONLRET, OFILL, OFDEL, NLDLY, NL0, NL1, CRDLY, CR0, CR1, CR2, CR3, TABDLY, TAB0, TAB1, TAB2, TAB3, XTABS, BSDLY, BS0, BS1, VTDLY, VT0, VT1, FFDLY, FF0, FF1, CBAUD, B0, B50, B75, B110, B134, B150, B200, B300, B600, B1200, B1800, B2400, B4800, B9600, B19200, B38400, EXTA, EXTB, CSIZE, CS5, CS6, CS7, CS8, CSTOPB, CREAD, PARENB, PARODD, HUPCL, CLOCAL, CBAUDEX, B57600, B115200, B230400, B460800, B500000, B576000, B921600, B1000000, B1152000, B1500000, B2000000, B2500000, B3000000, B3500000, B4000000, CIBAUD, CMSPAR, CRTSCTS, ISIG, ICANON, XCASE, ECHO, ECHOE, ECHOK, ECHONL, NOFLSH, ECHOCTL, ECHOPRT, ECHOKE, TOSTOP, FLUSHO, IEXTEN, PENDIN, TCOOFF, TCOON, TCIOFF, TCION, TCIFLUSH, TCOFLUSH, TCIOFLUSH, TCSANOW, TCSADRAIN, TCSAFLUSH, TCGETS, TCSETS, TCSETSW, TCSETSF, TCGETA, TCSETA, TCSETAW, TCSETAF, TCSBRK, TCXONC, TCFLSH, TIOCEXCL, TIOCNXCL, TIOCSCTTY, TIOCGPGRP, TIOCSPGRP, TIOCOUTQ, TIOCSTI, TIOCGWINSZ, TIOCSWINSZ, TIOCMGET, TIOCMBIS, TIOCMBIC, TIOCMSET, TIOCGSOFTCAR, TIOCSSOFTCAR, FIONREAD, TIOCINQ, TIOCLINUX, TIOCCONS, TIOCGSERIAL, TIOCSSERIAL, TIOCPKT, FIONBIO, TIOCNOTTY, TIOCSETD, TIOCGETD, TCSBRKP, TIOCSBRK, TIOCCBRK, TIOCGSID, TIOCGRS485, TIOCSRS485, TIOCGPTN, TIOCSPTLCK, TIOCGDEV, TCGETX, TCSETX, TCSETXF, TCSETXW, TIOCSIG, TIOCVHANGUP, TIOCGPKT, TIOCGPTLCK, TIOCGEXCL, TIOCGPTPEER, FIONCLEX, FIOCLEX, FIOASYNC, TIOCSERCONFIG, TIOCSERGWILD, TIOCSERSWILD, TIOCGLCKTRMIOS, TIOCSLCKTRMIOS, TIOCSERGSTRUCT, TIOCSERGETLSR, TIOCSERGETMULTI, TIOCSERSETMULTI, TIOCMIWAIT, TIOCGICOUNT, FIOQSIZE, TIOCPKT_DATA, TIOCPKT_FLUSHREAD, TIOCPKT_FLUSHWRITE, TIOCPKT_STOP, TIOCPKT_START, TIOCPKT_NOSTOP, TIOCPKT_DOSTOP, TIOCPKT_IOCTL, TIOCSER_TEMT, TIOCM_LE, TIOCM_DTR, TIOCM_RTS, TIOCM_ST, TIOCM_SR, TIOCM_CTS, TIOCM_CAR, TIOCM_RNG, TIOCM_DSR, TIOCM_CD, TIOCM_RI, TIOCM_OUT1, TIOCM_OUT2, TIOCM_LOOP, N_TTY, N_SLIP, N_MOUSE, N_PPP, N_STRIP, N_AX25, N_X25, N_6PACK, N_MASC, N_R3964, N_PROFIBUS_FDL, N_IRDA, N_SMSBLOCK, N_HDLC, N_SYNC_PPP, N_HCI, FIOSETOWN, SIOCSPGRP, FIOGETOWN, SIOCGPGRP, SIOCATMARK, SIOCGSTAMP, SIOCGSTAMPNS, SIOCADDRT, SIOCDELRT, SIOCRTMSG, SIOCGIFNAME, SIOCSIFLINK, SIOCGIFCONF, SIOCGIFFLAGS, SIOCSIFFLAGS, SIOCGIFADDR, SIOCSIFADDR, SIOCGIFDSTADDR, SIOCSIFDSTADDR, SIOCGIFBRDADDR, SIOCSIFBRDADDR, SIOCGIFNETMASK, SIOCSIFNETMASK, SIOCGIFMETRIC, SIOCSIFMETRIC, SIOCGIFMEM, SIOCSIFMEM, SIOCGIFMTU, SIOCSIFMTU, SIOCSIFNAME, SIOCSIFHWADDR, SIOCGIFENCAP, SIOCSIFENCAP, SIOCGIFHWADDR, SIOCGIFSLAVE, SIOCSIFSLAVE, SIOCADDMULTI, SIOCDELMULTI, SIOCGIFINDEX, SIOGIFINDEX, SIOCSIFPFLAGS, SIOCGIFPFLAGS, SIOCDIFADDR, SIOCSIFHWBROADCAST, SIOCGIFCOUNT, SIOCGIFBR, SIOCSIFBR, SIOCGIFTXQLEN, SIOCSIFTXQLEN, SIOCDARP, SIOCGARP, SIOCSARP, SIOCDRARP, SIOCGRARP, SIOCSRARP, SIOCGIFMAP, SIOCSIFMAP, SIOCADDDLCI, SIOCDELDLCI, SIOCDEVPRIVATE, SIOCPROTOPRIVATE, NCC, NCCS, TIOCM_RTS, TIOCM_ST, TIOCM_SR, TIOCM_CTS, TIOCM_CAR, TIOCM_RNG, TIOCM_DSR, TIOCM_CD, TIOCM_RI, TIOCM_OUT1, TIOCM_OUT2, TIOCM_LOOP, _POSIX_VDISABLE, VINTR, VQUIT, VERASE, VKILL, VEOF, VTIME, VMIN, VSWTC, VSTART, VSTOP, VSUSP, VEOL, VREPRINT, VDISCARD, VWERASE, VLNEXT, VEOL2, tcgetattr, tcsetattr, tcflush, tcdrain, tcflow, tcsendbreak, tcgetsid, tcgetpgrp, tcsetpgrp, winsize, termio, termio };
