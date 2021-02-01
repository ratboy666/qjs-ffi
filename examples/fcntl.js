import { dlsym, define, call, RTLD_DEFAULT } from 'ffi.so';

export const F_DUPFD = 0;
export const F_GETFD = 1;
export const F_SETFD = 2;
export const F_GETFL = 3;
export const F_SETFL = 4;
export const F_GETLK = 5;
export const F_SETLK = 6;
export const F_SETLKW = 7;
export const F_GETLK64 = 8;
export const F_SETLK64 = 9;
export const F_SETLKW64 = 10;
export const F_GETOWN = 11;
export const F_SETOWN = 12;
export const F_SETSIG = 13;
export const F_GETSIG = 14;
export const O_RDONLY = 0x0;
export const O_WRONLY = 0x1;
export const O_RDWR = 0x2;
export const O_ACCMODE = 0x3;
export const O_CREAT = 0x40;
export const O_EXCL = 0x80;
export const O_NOCTTY = 0x100;
export const O_TRUNC = 0x200;
export const O_APPEND = 0x400;
export const O_NDELAY = 0x800;
export const O_NONBLOCK = 0x800;
export const O_DSYNC = 0x1000;
export const O_ASYNC = 0x2000;
export const O_DIRECTORY = 0x10000;
export const O_NOFOLLOW = 0x20000;
export const O_CLOEXEC = 0x80000;
export const O_RSYNC = 0x101000;
export const O_SYNC = 0x101000;
export const O_LARGEFILE = 0x8000;
export const O_NOATIME = 0x00040000;

const fp = dlsym(RTLD_DEFAULT, 'fcntl');

define('fcntl', fp, null, 'int', 'int', 'int', 'int');

export function fcntl(fd, cmd, arg) {
    return call('fcntl', fd, cmd, arg);
}

export default fcntl;
