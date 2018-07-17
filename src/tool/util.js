
/*
 * DOM selector
 *
 * Usage:
 *   $('div');
 *   $('#name');
 *   $('.name');
 *
 * Copyright (C) 2011 Jed Schmidt <http://jed.is> - WTFPL
 * More: https://gist.github.com/991057
 */

export function $$(
    a,                         // take a simple selector like "TagName", "#ID", or ".ClassName", and
    b                          // an optional context, and
  )
  {
    a = a.match(/^(\W)?(.*)/); // split the selector into name and symbol.
    return(                    // return an element or list, from within the scope of
      b                        // the passed context
      || document              // or document,
    )[
      "getElement" + (         // obtained by the appropriate method calculated by
        a[1]
          ? a[1] == "#"
            ? "ById"           // the node by ID,
            : "sByClassName"   // the nodes by class name, or
          : "sByTagName"       // the nodes by tag name,
      )
    ](
      a[2]                     // called with the name.
    )
  }

// ======================

export function strCompare(a,b)
{
  if(a==null) return 1;
  else if(b==null) return -1;
  var la = a.length, lb = b.length;
  if(typeof a == "Number" && typeof b == "Number") return a - b;
  if(a.match(/^[+\-]?[0-9]+(\.[0-9]+)?$/) && b.match(/^[+\-]?[0-9]+(\.[0-9]+)?$/)) return a - b;
  if(a < b) return -1;
  else if(a > b) return 1;
  else return 0;
}

export function checkFilter(list, combine, fn)
{
  var i, len = list.length, flt = new Array(len);
  for(i=0;i<len;i++)
  {
    var item = list[i], tmp = item.value.trim().toLowerCase();
    if(tmp=='') flt[i] = 'z'; // X = match, Y = no match, Z = empty
      else flt[i] = fn(item.type,tmp);
  }
  var res = flt.join('');
  return res == 'z'.repeat(len) || (combine!=0 && res.indexOf('y') == -1) || (combine==0 && res.indexOf('x') != -1);
}

export function round(number, precision = 2)
{
  const factor = 10 ** precision;
  return Math.round(number * factor) / factor;
}

