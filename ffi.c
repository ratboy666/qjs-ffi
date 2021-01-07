/**********************************************************************
 *                                                                    *
 * ffi.c                                                              *
 *                                                                    *
 **********************************************************************/


#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <errno.h>
#include <quickjs/quickjs.h>
#include <ffi.h>
#include <dlfcn.h>


#define countof(x) (sizeof(x) / sizeof((x)[0]))


struct function_s {
    struct function_s  *next;
    char               *name;
    void               *fp;
    int                 nargs;
    ffi_cif             cif;
    ffi_type          **args;
    ffi_type           *rtype;
};


#define TYPE_INTEGRAL 0
#define TYPE_FLOAT    1
#define TYPE_POINTER  2


struct ffi_type_s {
    struct ffi_type_s *next;
    char              *name;
    ffi_type          *type;
};

union argument_s {
    long long   ll;
    long double ld;
    float       f;
    double      d;
    void       *p;
};
typedef union argument_s argument;


struct typed_argument_s {
  argument arg;
  int      type;
};
typedef struct typed_argument_s typed_argument;


/* FFI types
 */
static struct ffi_type_s *ffi_type_head = NULL;


static void fatal(char *msg) {
    fprintf(stderr, "%s\n", msg);
    exit(2);
}


static void warn(char *msg) {
    fprintf(stderr, "%s\n", msg);
}


/* Find type by name
 */
static ffi_type *find_ffi_type(const char *name) {
    struct ffi_type_s *p = NULL;

    if (name == NULL)
	return NULL;
    for (p = ffi_type_head; p; p = p->next)
	if (strcmp(p->name, name) == 0)
	    return p->type;
    return NULL;
}


/* Add new ffi_type to named types
 */
static void define_ffi_type(char *name, ffi_type *t) {
    struct ffi_type_s *p = NULL;

    /* ignore if already defined */
    if (find_ffi_type(name) != NULL)
	return;

    p = malloc(sizeof (struct ffi_type_s));
    if (p == NULL)
	fatal("define_ffi_type: no memory");
    p->name = strdup(name);
    p->next = ffi_type_head;
    ffi_type_head = p;
    p->type = t;
}


/* Return ABI
 */
static int find_abi(const char *name) {
    if (strcmp(name, "default") == 0)  return FFI_DEFAULT_ABI;
#ifdef FFI_SYSV
    if (strcmp(name, "sysv") == 0)     return FFI_SYSV;
#endif
#ifdef FFI_UNIX64
    if (strcmp(name, "unix64") == 0)   return FFI_UNIX64;
#endif
#ifdef FFI_STDCALL
    if (strcmp(name, "stdcall") == 0)  return FFI_STDCALL;
#endif
#ifdef FFI_THISCALL
    if (strcmp(name, "thiscall") == 0) return FFI_THISCALL;
#endif
#ifdef FFI_FASTCALL
    if (strcmp(name, "fastcall") == 0) return FFI_FASTCALL;
#endif
#ifdef FFI_MS_CDECL
    if (strcmp(name, "ms_cdecl") == 0) return FFI_MS_CDECL;
#endif
#ifdef FFI_WIN64
    if (strcmp(name, "win64") == 0)    return FFI_WIN64;
#endif
                                       return FFI_DEFAULT_ABI;
}


/* Define standard types.
 */
static void define_types(void) {

    /* Standard ffi types
     */
    define_ffi_type("void",       &ffi_type_void      );
    define_ffi_type("sint8",      &ffi_type_sint8     );
    define_ffi_type("sint16",     &ffi_type_sint16    );
    define_ffi_type("sint32",     &ffi_type_sint32    );
    define_ffi_type("sint64",     &ffi_type_sint64    );
    define_ffi_type("uint8",      &ffi_type_uint8     );
    define_ffi_type("uint16",     &ffi_type_uint16    );
    define_ffi_type("uint32",     &ffi_type_uint32    );
    define_ffi_type("uint64",     &ffi_type_uint64    );
    define_ffi_type("float",      &ffi_type_float     );
    define_ffi_type("double",     &ffi_type_double    );
    define_ffi_type("schar",      &ffi_type_schar     );
    define_ffi_type("uchar",      &ffi_type_uchar     );
    define_ffi_type("sshort",     &ffi_type_sshort    );
    define_ffi_type("ushort",     &ffi_type_ushort    );
    define_ffi_type("sint",       &ffi_type_sint      );
    define_ffi_type("uint",       &ffi_type_uint      );
    define_ffi_type("slong",      &ffi_type_slong     );
    define_ffi_type("ulong",      &ffi_type_ulong     );
    define_ffi_type("longdouble", &ffi_type_longdouble);
    define_ffi_type("pointer",    &ffi_type_pointer   );

    /* Closer to C types. Could do these dynamically (YAGNI,
     * we support minimal number of platforms - 64 bit Linux
     * and 64 bit Windows, so any variation will be handled via
     * preprocessor)
     */
    define_ffi_type("int",           &ffi_type_sint   );
    define_ffi_type("long",          &ffi_type_slong  );
    define_ffi_type("short",         &ffi_type_sshort );
    define_ffi_type("char",          &ffi_type_schar  );
    define_ffi_type("size_t",        &ffi_type_uint   );
    define_ffi_type("unsigned char", &ffi_type_uchar  );
    define_ffi_type("unsigned int",  &ffi_type_uint   );
    define_ffi_type("unsigned long", &ffi_type_ulong  );
    define_ffi_type("void *",        &ffi_type_pointer);
    define_ffi_type("char *",        &ffi_type_pointer);

    /* Extra types with more semantics. For now, the semantics are
     * automatic in fficall, but we can use a name in ffidefine to
     * show the intention. string is for JavaScript strings. buffer
     * is for JavaScript ArrayBuffers.
     */
    define_ffi_type("string", &ffi_type_pointer);
    define_ffi_type("buffer", &ffi_type_pointer);
}


/* Defined functions
 */
static struct function_s *function_list = NULL;


static int dummy_() {
    warn("dummy function in ffi");
    return 0;
}


/* Build function ffi
 */
static bool define_function(const char  *name,
                            void  *fp,
                            const char  *abi,
                            const char  *rtype,
                            const char **args) {

    struct function_s *f = NULL;
    int                i = 0;
    char              *s = NULL;

    /* We need a name
     */
    if (name == NULL) {
	warn("define_function: no name");
	return false;
    }

    /* If function is already defined, just return
     */
    for (f = function_list; f; f = f->next)
	if (strcmp(f->name, name) == 0)
	     return true;

    f = malloc(sizeof(struct function_s));
    if (f == NULL)
	fatal("define_function: no memory for function_s");
    f->name = NULL;
    f->args = NULL;

    f->name = strdup(name);
    if (f->name == NULL)
	fatal("define_function: no memory for name");

    /* If fp is not supplied, a dummy function will be used. This is
     * probably not something you want, but is useful when
     * prototyping.
     */
    f->fp = fp;
    if (f->fp == NULL)
	f->fp = dummy_;

    /* If abi is not supplied, use "default"
     */
    if (abi == NULL)
	abi = "default";

    /* Number of arguments (nargs).
     */
    for (f->nargs = 0; args && args[f->nargs]; ++f->nargs)
	;

    /* Initialize argument types
     */
    f->args = NULL;
    if (f->nargs) {
	if (args == NULL) {
	    warn("define_function: no args");
	    goto error;
	}
	f->args = malloc(f->nargs * sizeof (ffi_type *));
	if (f->args == NULL)
	    fatal("define_function: cannot alloc args");
    }

    /* Return type. Default to "void"
     */
    if (rtype == NULL)
	rtype = "void";

    /* Read each argument type. Record each type in f->args[].
     */
    for (i = 0; i < f->nargs; ++i) {
	s = (char *)args[i];
	if ((f->args[i] =
	     find_ffi_type(s)) == NULL) {
	    warn("define_function: no such type");
	    goto error;
	}
    }

    /* Record return type
     */
    f->rtype = find_ffi_type(rtype);
    if (f->rtype == NULL) {
	warn("define_function: no such return type");
	goto error;
    }

    /* Prepare cif. Add prepared function to function list and return
     * true.
     */
    if (ffi_prep_cif(&(f->cif),
                     find_abi(abi),
                     f->nargs,
                     f->rtype,
                     f->args) == FFI_OK) {
	f->next = function_list;
	function_list = f;
	return true;
    }
    warn("define_function: ffi_prep_cif failed");

    /* On failure, return memory.
     */
error:
    free(f->args);
    free(f->name);
    free(f);
    return false;
}


/* We assume little-endian, which means that assigning into "long long"
 * is sufficient to produce data that can be pointed to for char to
 * long long (and unsigned). So, we map all types into 3 types here.
 * 0 for integral, 1 for float, 2 for pointer.
 *
 * For big-endian (or other endian) this will have to be suitably
 * adjusted. Only call_function() is affected.
 */


/* Call function previously defined
 *
 * Note that varargs are not yet supported. A custom function needs
 * to be built. But, we don't yet support deleting a defined function,
 * so varargs are not usable. Also, pass by structure is not supported.
 *
 * These restrictions could be lifted, but YAGNI. FIXME - we can call
 * a vararg, passing the parameter list itself. This would allow most
 * vprintf() etc (passing va_list ap). Structures should be passed by
 * value by defining the size of the structure, and passing a pointer
 * to the value. Structure return should work the same. For return,
 * the caller should supply a suitable area of memory. This should be
 * passed in as the rp parameter. Structures need definition
 * (define_structure(name, size)).
 *
 * All return values are captured into long double -- this must be
 * cast into the actual return.
 */
static bool call_function(const char     *name,
                          typed_argument *args,
                          long double    *rp) {
    struct function_s *f = NULL;
    char              *s = NULL;
    int                i = 0;
    void             **ptrs = NULL;
    void             **pointer_list = NULL;
    int                fl = 0;
    int                pl = 0;
    argument          *arguments = NULL;
    argument           rc;
    double             p = 0.0;
    long double        r = 0.0;
    bool               rv = false;

    if (name == NULL) {
	warn("call_function: no name");
	goto error;
    }
    for (f = function_list; f; f = f->next)
	if (strcmp(f->name, name) == 0)
	     break;
    if (f == NULL) {
	warn("call_function: no such function");
	goto error;
    }

    if (f->nargs) {
	ptrs = malloc(f->nargs * sizeof (void *));
	if (ptrs == NULL)
	    fatal("call_function: no memory for ptrs");
	pointer_list = malloc(f->nargs * sizeof (void *));
	if (pointer_list == NULL)
	    fatal("call_function: no memory for pointer_list");
	arguments = malloc(f->nargs * sizeof (argument));
	if (arguments == NULL)
	    fatal("call_function: no memory for arguments");
	if (args == NULL) {
	    warn("call_function: nargs >= 1 but no args");
	    goto error;
	}
    }

    /* initialize arguments, pointer_list and ptrs
     */
    fl = 0;
    pl = 0;
    for (i = 0; i < f->nargs; ++i) {
	arguments[i].p = NULL;
	pointer_list[i] = NULL;
	ptrs[i] = &(arguments[i]);
    }

    for (i = 0; i < f->nargs; ++i) {
	switch (args[i].type) {

	    case TYPE_INTEGRAL:
		if (f->args[i] == &ffi_type_float)
		    arguments[i].f = (float)args[i].arg.ll;

		else if (f->args[i] == &ffi_type_double)
		    arguments[i].d = (double)args[i].arg.ll;

		else if (f->args[i] == &ffi_type_longdouble)
		    arguments[i].ld = (long double)args[i].arg.ll;

		else if (f->args[i] == &ffi_type_pointer) {
		    pointer_list[pl++] =
			(void *)(long long)args[i].arg.ll;
		    ptrs[i] = &(pointer_list[pl - 1]);

		} else
		    /* This absorbs all ffi_type integral */
		    arguments[i].ll = (long long)args[i].arg.ll;
	        break;

	    case TYPE_FLOAT:
		if (f->args[i] == &ffi_type_float)
		    arguments[i].f = (float)args[i].arg.ld;

		else if (f->args[i] == &ffi_type_double)
		    arguments[i].d = (double)args[i].arg.ld;

		else if (f->args[i] == &ffi_type_longdouble)
		    arguments[i].ld = (long double)args[i].arg.ld;

		else if (f->args[i] == &ffi_type_pointer) {
		    long long t = (long long)args[i].arg.ld;
		    pointer_list[pl++] = (void *)t;
		    ptrs[i] = &(pointer_list[pl - 1]);

		} else
		    arguments[i].ll = (long long)args[i].arg.ld;

	        break;

	    case TYPE_POINTER:
		pointer_list[pl++] = args[i].arg.p;
		ptrs[i] = &(pointer_list[pl - 1]);
		break;

	    default:
		warn("call_function: error, unknown typed parameter");
		goto error;
		
	}
    }

    /* call the function
     */
    ffi_call(&(f->cif), f->fp, &rc, ptrs);

    /* result - simple conversion to float
     *
     * Underlying code assumes that everything is compatible with
     * long double -- but classic JavaScript uses double. This gives
     * us 53 (or 52) bits for integer results -- pray that all
     * pointers fit in 52 bits. This is a reasonable assumption in
     * 2020.
     */
    if (f->rtype == &ffi_type_void)
	r = 0;
    else if (f->rtype == &ffi_type_float)
	r = rc.f;
    else if (f->rtype == &ffi_type_double)
	r = rc.d;
    else if (f->rtype == &ffi_type_longdouble)
	r = rc.ld;
    else if (f->rtype == &ffi_type_pointer)
	r = (double)(long long)rc.p;
    else
	r = rc.ll;

    if (rp)
	*rp = r;
    rv = true;

error:
    if (ptrs)
	free(ptrs);
    if (pointer_list)
	free(pointer_list);
    if (arguments)
	free(arguments);
    return rv;
}


/* debug()
 */
static JSValue js_debug(JSContext *ctx, JSValueConst this_val,
                        int argc, JSValueConst *argv) {
    return JS_NULL;
}


/* errno()
 */
static JSValue js_errno(JSContext *ctx, JSValueConst this_val,
                        int argc, JSValueConst *argv) {
    int e;
    e = errno;
    return JS_NewInt32(ctx, e);
}


/* h = dlopen(name, flags)
 */
static JSValue js_dlopen(JSContext *ctx, JSValueConst this_val,
                         int argc, JSValueConst *argv) {
    const char *s;
    void *res;
    int n;
    if (JS_IsNull(argv[0]))
	s = NULL;
    else {
	s = JS_ToCString(ctx, argv[0]);
	if (!s)
	    return JS_EXCEPTION;
    }
    if (JS_ToUint32(ctx, &n, argv[1]))
        return JS_EXCEPTION;
    res = dlopen(s, n);
    if (s)
	JS_FreeCString(ctx, s);
    if (res == NULL)
	return JS_NULL;
    return JS_NewInt64(ctx, (long long)res);
}


/* s = dlerror()
 */
static JSValue js_dlerror(JSContext *ctx, JSValueConst this_val,
                          int argc, JSValueConst *argv) {
    char *res;
    res = dlerror();
    if (res == NULL)
	return JS_NULL;
    return JS_NewString(ctx, res);
}


/* n = dlclose(h)
 */
static JSValue js_dlclose(JSContext *ctx, JSValueConst this_val,
                          int argc, JSValueConst *argv) {
    int res;
    int64_t n;
    if (JS_ToInt64(ctx, &n, argv[0]))
        return JS_EXCEPTION;
    res = dlclose((void *)n);
    return JS_NewInt32(ctx, res);
}


/* p = dlsym(h, name)
 */
static JSValue js_dlsym(JSContext *ctx, JSValueConst this_val,
                        int argc, JSValueConst *argv) {
    void *res;
    int64_t n;
    const char *s;
    if (JS_ToInt64(ctx, &n, argv[0]))
        return JS_EXCEPTION;
    s = JS_ToCString(ctx, argv[1]);
    if (!s)
	return JS_EXCEPTION;
    res = dlsym((void *)n, s);
    if (s)
	JS_FreeCString(ctx, s);
    if (res == NULL)
	return JS_NULL;
    return JS_NewInt64(ctx, (long long)res);
}

#define MAX_PARAMETERS 30

/* define(name, fp, abi, ret, p1,...pn)
 */
static JSValue js_define(JSContext *ctx, JSValueConst this_val,
                         int argc, JSValueConst *argv) {
    const char *name = NULL;
    int64_t fp = 0;
    const char *abi = NULL;
    const char *rtype = NULL;
    const char *params[MAX_PARAMETERS + 1];
    int i, nparams = 0;
    JSValue r = JS_FALSE;
    name = JS_ToCString(ctx, argv[0]);
    if (!name)
	goto error;
    if (JS_ToInt64(ctx, &fp, argv[1]))
        goto error;
   if (JS_IsNull(argv[2]))
	abi = NULL;
    else {
	abi = JS_ToCString(ctx, argv[2]);
	if (!abi)
	    goto error;
    }
    rtype = JS_ToCString(ctx, argv[3]);
    if (!rtype)
	goto error;
    nparams = 0;
    for (i = 4; (i < argc) && (nparams < MAX_PARAMETERS); ++i)
        params[nparams++] = JS_ToCString(ctx, argv[i]);
    params[nparams] = NULL;

    if (define_function(name,
                        (void *)fp,
                        abi,
                        rtype,
                        params))
	r = JS_TRUE;
    else
	r = JS_FALSE;

error:
    if (name)
	JS_FreeCString(ctx, name);
    if (rtype)
	JS_FreeCString(ctx, rtype);
     if (abi)
	JS_FreeCString(ctx, abi);
    for (i = 0; i < nparams; ++i)
	JS_FreeCString(ctx, params[i]);

    return r;
}

/* For 2020-01-19 support */
static inline JS_BOOL JS_IsInteger(JSValueConst v) {
    int tag = JS_VALUE_GET_TAG(v);
    return tag == JS_TAG_INT || tag == JS_TAG_BIG_INT;
}

/* r = call(name, p1,...pn)
 */
static JSValue js_call(JSContext *ctx, JSValueConst this_val,
                       int argc, JSValueConst *argv) {
    const char *name = NULL;
    JSValue r = JS_EXCEPTION;
    typed_argument args[MAX_PARAMETERS];
    int i;
    long double res = 0;
    const char *strings[MAX_PARAMETERS];
    int fl = 0;
    name = JS_ToCString(ctx, argv[0]);
    if (!name)
	goto error;

    for (i = 0; i < MAX_PARAMETERS; ++i) {
	args[i].arg.ll = 0;
	args[i].type = TYPE_INTEGRAL;
    }
    for (i = 1; (i < argc) && (i <= MAX_PARAMETERS); ++i) {
	if (JS_IsNull(argv[i])) {
	    ;
	} else if (JS_IsBool(argv[i])) {
	    args[i - 1].arg.ll = JS_ToBool(ctx, argv[i]);
	    if (args[i-1].arg.ll < 0)
		goto error;
	} else if (JS_IsInteger(argv[i])) {
	    int64_t v;
	    if (JS_ToInt64(ctx, &v, argv[i]))
		goto error;
	    args[i - 1].arg.ll = v;
	} else if (JS_IsNumber(argv[i])) {
	    double d;
	    if (JS_ToFloat64(ctx, &d, argv[i]))
		goto error;
	    args[i - 1].arg.ld = (long double)d;
	    args[i - 1].type = TYPE_FLOAT;
	} else if (JS_IsString(argv[i])) {
	    const char *s;
	    s = JS_ToCString(ctx, argv[i]);
	    if (!s)
		goto error;
	    strings[fl++] = s;
	    args[i - 1].arg.ll = (long long)s;
	} else {
	    uint8_t *buf;
	    size_t size;
	    buf = JS_GetArrayBuffer(ctx, &size, argv[i]);
	    if (!buf)
		goto error;
	    args[i - 1].arg.ll = (long long)buf;
	}
    }
    if (call_function(name,
                      args,
                      &res)) {
	r = JS_NewFloat64(ctx, res);
    }

error:
    if (name)
	JS_FreeCString(ctx, name);
    while (fl)
	JS_FreeCString(ctx, strings[--fl]);
    return r;
}


/* s = toString(p)
 */
static JSValue js_tostring(JSContext *ctx, JSValueConst this_val,
                           int argc, JSValueConst *argv) {
    const char *s;
    int64_t p;
    if (JS_ToInt64(ctx, &p, argv[0]))
	return JS_EXCEPTION;
    s = (const char *)p;
    return JS_NewString(ctx, s);
}


/* b = toArrayBuffer(p, size)
 */
static JSValue js_toarraybuffer(JSContext *ctx, JSValueConst this_val,
                                int argc, JSValueConst *argv) {
    const uint8_t *buf;
    int64_t p, s;
    size_t size;
    if (JS_ToInt64(ctx, &p, argv[0]))
	return JS_EXCEPTION;
    if (JS_ToInt64(ctx, &s, argv[1]))
	return JS_EXCEPTION;
    if (s < 0)
	return JS_EXCEPTION;
    size = s;
	
    buf = (const uint8_t *)p;
    return JS_NewArrayBufferCopy(ctx, buf, size);
}

/* s = toPointer(ArrayBuffer[, offset])
 *
 * returns string 0xhhhhhhhh which is the base of the ArrayBuffer plus an optional offset.
 * A negative offset can be used, indicating an offset from the end of the buffer.
 */
static JSValue js_topointer(JSContext *ctx, JSValueConst this_val,
                            int argc, JSValueConst *argv) {
    uint8_t *ptr;
    size_t size;
    char buf[64];
    ptr = JS_GetArrayBuffer(ctx, &size, argv[0]);
    if(argc > 1) {
        int64_t off;
        if(JS_ToInt64(ctx, &off, argv[1]))
            return JS_EXCEPTION;
        if(off < 0)
            off += size;
        if(off > size || off < 0)
            return JS_EXCEPTION;
        ptr += off;
    }
    snprintf(buf, sizeof(buf), "%p", ptr);
    return JS_NewString(ctx, buf);
}

/* p = JSContext()
 */
static JSValue js_context(JSContext *ctx, JSValueConst this_val,
                          int argc, JSValueConst *argv) {
    return JS_NewInt64(ctx, (long long)ctx);
}


static const JSCFunctionListEntry js_funcs[] = {
    JS_CFUNC_DEF("debug", 0, js_debug),
    JS_CFUNC_DEF("dlopen", 2, js_dlopen),
    JS_CFUNC_DEF("dlerror", 0, js_dlerror),
    JS_CFUNC_DEF("dlclose", 1, js_dlclose),
    JS_CFUNC_DEF("dlsym", 2, js_dlsym),
    JS_CFUNC_DEF("define", 4, js_define),
    JS_CFUNC_DEF("call", 1, js_call),
    JS_CFUNC_DEF("toString", 1, js_tostring),
    JS_CFUNC_DEF("toArrayBuffer", 2, js_toarraybuffer),
    JS_CFUNC_DEF("toPointer", 1, js_topointer),
    JS_CFUNC_DEF("errno", 0, js_errno),
    JS_CFUNC_DEF("JSContext", 0, js_context),
#ifdef RTLD_LAZY
    JS_PROP_INT32_DEF("RTLD_LAZY", RTLD_LAZY, JS_PROP_CONFIGURABLE),
#endif
#ifdef RTLD_NOW
    JS_PROP_INT32_DEF("RTLD_NOW", RTLD_NOW, JS_PROP_CONFIGURABLE),
#endif
#ifdef RTLD_GLOBAL
    JS_PROP_INT32_DEF("RTLD_GLOBAL", RTLD_GLOBAL, JS_PROP_CONFIGURABLE),
#endif
#ifdef RTLD_LOCAL
    JS_PROP_INT32_DEF("RTLD_LOCAL", RTLD_LOCAL, JS_PROP_CONFIGURABLE),
#endif
#ifdef RTLD_NODELETE
    JS_PROP_INT32_DEF("RTLD_NODELETE", RTLD_NODELETE,
	JS_PROP_CONFIGURABLE),
#endif
#ifdef RTLD_NOLOAD
    JS_PROP_INT32_DEF("RTLD_NOLOAD", RTLD_NOLOAD, JS_PROP_CONFIGURABLE),
#endif
#ifdef RTLD_DEEPBIND
    JS_PROP_INT32_DEF("RTLD_DEEPBIND", RTLD_DEEPBIND,
	JS_PROP_CONFIGURABLE),
#endif
#ifdef RTLD_DEFAULT
    JS_PROP_INT64_DEF("RTLD_DEFAULT", (long)RTLD_DEFAULT,
	JS_PROP_CONFIGURABLE),
#endif
#ifdef RTLD_NEXT
    JS_PROP_INT64_DEF("RTLD_NEXT", (long)RTLD_NEXT,
	JS_PROP_CONFIGURABLE),
#endif
    JS_PROP_INT32_DEF("argSize", FFI_SIZEOF_ARG, JS_PROP_CONFIGURABLE),
    JS_PROP_INT32_DEF("ptrSize", sizeof(void*), JS_PROP_CONFIGURABLE),
#ifdef __BYTE_ORDER__
    JS_PROP_INT32_DEF("littleEndian", __BYTE_ORDER__ == __ORDER_LITTLE_ENDIAN__, JS_PROP_CONFIGURABLE),
#endif
};


static int js_init(JSContext *ctx, JSModuleDef *m) {
    define_types();
    return JS_SetModuleExportList(ctx, m, js_funcs,
                                  countof(js_funcs));
}


#ifdef JS_SHARED_LIBRARY
#define JS_INIT_MODULE js_init_module
#else
#define JS_INIT_MODULE js_init_module_ffi
#endif


JSModuleDef *JS_INIT_MODULE(JSContext *ctx, const char *module_name) {
    JSModuleDef *m;
    m = JS_NewCModule(ctx, module_name, js_init);
    if (!m)
        return NULL;
    JS_AddModuleExportList(ctx, m, js_funcs, countof(js_funcs));

    return m;
}


/* ce: .mc; */
