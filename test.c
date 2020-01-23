/**********************************************************************
 *                                                                    *
 * test.c                                                             *
 *                                                                    *
 **********************************************************************/

/* test functions for qjs-ffi
 */

#include <stdio.h>
#include <stdlib.h>

int test1(unsigned char *p) {
  printf("%d %d %d\n", p[0], p[1], p[2]);
  p[0] = 3;
  p[1] = 2;
  p[2] = 1;
  return 5;
}

/* ce: .mc; */
