var Nh = e => {
  throw TypeError(e)
}
;
var Wl = (e, t, n) => t.has(e) || Nh("Cannot " + n);
var A = (e, t, n) => (Wl(e, t, "read from private field"),
n ? n.call(e) : t.get(e))
, ee = (e, t, n) => t.has(e) ? Nh("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n)
, G = (e, t, n, r) => (Wl(e, t, "write to private field"),
r ? r.call(e, n) : t.set(e, n),
n)
, Le = (e, t, n) => (Wl(e, t, "access private method"),
n);
var Es = (e, t, n, r) => ({
  set _(i) {
      G(e, t, i, n)
  },
  get _() {
      return A(e, t, r)
  }
});
function Ob(e, t) {
  for (var n = 0; n < t.length; n++) {
      const r = t[n];
      if (typeof r != "string" && !Array.isArray(r)) {
          for (const i in r)
              if (i !== "default" && !(i in e)) {
                  const o = Object.getOwnPropertyDescriptor(r, i);
                  o && Object.defineProperty(e, i, o.get ? o : {
                      enumerable: !0,
                      get: () => r[i]
                  })
              }
      }
  }
  return Object.freeze(Object.defineProperty(e, Symbol.toStringTag, {
      value: "Module"
  }))
}
(function() {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload"))
      return;
  for (const i of document.querySelectorAll('link[rel="modulepreload"]'))
      r(i);
  new MutationObserver(i => {
      for (const o of i)
          if (o.type === "childList")
              for (const s of o.addedNodes)
                  s.tagName === "LINK" && s.rel === "modulepreload" && r(s)
  }
  ).observe(document, {
      childList: !0,
      subtree: !0
  });
  function n(i) {
      const o = {};
      return i.integrity && (o.integrity = i.integrity),
      i.referrerPolicy && (o.referrerPolicy = i.referrerPolicy),
      i.crossOrigin === "use-credentials" ? o.credentials = "include" : i.crossOrigin === "anonymous" ? o.credentials = "omit" : o.credentials = "same-origin",
      o
  }
  function r(i) {
      if (i.ep)
          return;
      i.ep = !0;
      const o = n(i);
      fetch(i.href, o)
  }
}
)();
function Yg(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e
}
var Zg = {
  exports: {}
}
, nl = {}
, Xg = {
  exports: {}
}
, Z = {};
/**
* @license React
* react.production.min.js
*
* Copyright (c) Facebook, Inc. and its affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var ls = Symbol.for("react.element")
, zb = Symbol.for("react.portal")
, _b = Symbol.for("react.fragment")
, Vb = Symbol.for("react.strict_mode")
, Fb = Symbol.for("react.profiler")
, Bb = Symbol.for("react.provider")
, $b = Symbol.for("react.context")
, Ub = Symbol.for("react.forward_ref")
, Wb = Symbol.for("react.suspense")
, Hb = Symbol.for("react.memo")
, Kb = Symbol.for("react.lazy")
, Rh = Symbol.iterator;
function qb(e) {
  return e === null || typeof e != "object" ? null : (e = Rh && e[Rh] || e["@@iterator"],
  typeof e == "function" ? e : null)
}
var Jg = {
  isMounted: function() {
      return !1
  },
  enqueueForceUpdate: function() {},
  enqueueReplaceState: function() {},
  enqueueSetState: function() {}
}
, ey = Object.assign
, ty = {};
function Ui(e, t, n) {
  this.props = e,
  this.context = t,
  this.refs = ty,
  this.updater = n || Jg
}
Ui.prototype.isReactComponent = {};
Ui.prototype.setState = function(e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null)
      throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
  this.updater.enqueueSetState(this, e, t, "setState")
}
;
Ui.prototype.forceUpdate = function(e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate")
}
;
function ny() {}
ny.prototype = Ui.prototype;
function bd(e, t, n) {
  this.props = e,
  this.context = t,
  this.refs = ty,
  this.updater = n || Jg
}
var Sd = bd.prototype = new ny;
Sd.constructor = bd;
ey(Sd, Ui.prototype);
Sd.isPureReactComponent = !0;
var jh = Array.isArray
, ry = Object.prototype.hasOwnProperty
, Cd = {
  current: null
}
, iy = {
  key: !0,
  ref: !0,
  __self: !0,
  __source: !0
};
function oy(e, t, n) {
  var r, i = {}, o = null, s = null;
  if (t != null)
      for (r in t.ref !== void 0 && (s = t.ref),
      t.key !== void 0 && (o = "" + t.key),
      t)
          ry.call(t, r) && !iy.hasOwnProperty(r) && (i[r] = t[r]);
  var a = arguments.length - 2;
  if (a === 1)
      i.children = n;
  else if (1 < a) {
      for (var l = Array(a), c = 0; c < a; c++)
          l[c] = arguments[c + 2];
      i.children = l
  }
  if (e && e.defaultProps)
      for (r in a = e.defaultProps,
      a)
          i[r] === void 0 && (i[r] = a[r]);
  return {
      $$typeof: ls,
      type: e,
      key: o,
      ref: s,
      props: i,
      _owner: Cd.current
  }
}
function Gb(e, t) {
  return {
      $$typeof: ls,
      type: e.type,
      key: t,
      ref: e.ref,
      props: e.props,
      _owner: e._owner
  }
}
function kd(e) {
  return typeof e == "object" && e !== null && e.$$typeof === ls
}
function Qb(e) {
  var t = {
      "=": "=0",
      ":": "=2"
  };
  return "$" + e.replace(/[=:]/g, function(n) {
      return t[n]
  })
}
var Mh = /\/+/g;
function Hl(e, t) {
  return typeof e == "object" && e !== null && e.key != null ? Qb("" + e.key) : t.toString(36)
}
function Xs(e, t, n, r, i) {
  var o = typeof e;
  (o === "undefined" || o === "boolean") && (e = null);
  var s = !1;
  if (e === null)
      s = !0;
  else
      switch (o) {
      case "string":
      case "number":
          s = !0;
          break;
      case "object":
          switch (e.$$typeof) {
          case ls:
          case zb:
              s = !0
          }
      }
  if (s)
      return s = e,
      i = i(s),
      e = r === "" ? "." + Hl(s, 0) : r,
      jh(i) ? (n = "",
      e != null && (n = e.replace(Mh, "$&/") + "/"),
      Xs(i, t, n, "", function(c) {
          return c
      })) : i != null && (kd(i) && (i = Gb(i, n + (!i.key || s && s.key === i.key ? "" : ("" + i.key).replace(Mh, "$&/") + "/") + e)),
      t.push(i)),
      1;
  if (s = 0,
  r = r === "" ? "." : r + ":",
  jh(e))
      for (var a = 0; a < e.length; a++) {
          o = e[a];
          var l = r + Hl(o, a);
          s += Xs(o, t, n, l, i)
      }
  else if (l = qb(e),
  typeof l == "function")
      for (e = l.call(e),
      a = 0; !(o = e.next()).done; )
          o = o.value,
          l = r + Hl(o, a++),
          s += Xs(o, t, n, l, i);
  else if (o === "object")
      throw t = String(e),
      Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
  return s
}
function Ps(e, t, n) {
  if (e == null)
      return e;
  var r = []
    , i = 0;
  return Xs(e, r, "", "", function(o) {
      return t.call(n, o, i++)
  }),
  r
}
function Yb(e) {
  if (e._status === -1) {
      var t = e._result;
      t = t(),
      t.then(function(n) {
          (e._status === 0 || e._status === -1) && (e._status = 1,
          e._result = n)
      }, function(n) {
          (e._status === 0 || e._status === -1) && (e._status = 2,
          e._result = n)
      }),
      e._status === -1 && (e._status = 0,
      e._result = t)
  }
  if (e._status === 1)
      return e._result.default;
  throw e._result
}
var Qe = {
  current: null
}
, Js = {
  transition: null
}
, Zb = {
  ReactCurrentDispatcher: Qe,
  ReactCurrentBatchConfig: Js,
  ReactCurrentOwner: Cd
};
function sy() {
  throw Error("act(...) is not supported in production builds of React.")
}
Z.Children = {
  map: Ps,
  forEach: function(e, t, n) {
      Ps(e, function() {
          t.apply(this, arguments)
      }, n)
  },
  count: function(e) {
      var t = 0;
      return Ps(e, function() {
          t++
      }),
      t
  },
  toArray: function(e) {
      return Ps(e, function(t) {
          return t
      }) || []
  },
  only: function(e) {
      if (!kd(e))
          throw Error("React.Children.only expected to receive a single React element child.");
      return e
  }
};
Z.Component = Ui;
Z.Fragment = _b;
Z.Profiler = Fb;
Z.PureComponent = bd;
Z.StrictMode = Vb;
Z.Suspense = Wb;
Z.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Zb;
Z.act = sy;
Z.cloneElement = function(e, t, n) {
  if (e == null)
      throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
  var r = ey({}, e.props)
    , i = e.key
    , o = e.ref
    , s = e._owner;
  if (t != null) {
      if (t.ref !== void 0 && (o = t.ref,
      s = Cd.current),
      t.key !== void 0 && (i = "" + t.key),
      e.type && e.type.defaultProps)
          var a = e.type.defaultProps;
      for (l in t)
          ry.call(t, l) && !iy.hasOwnProperty(l) && (r[l] = t[l] === void 0 && a !== void 0 ? a[l] : t[l])
  }
  var l = arguments.length - 2;
  if (l === 1)
      r.children = n;
  else if (1 < l) {
      a = Array(l);
      for (var c = 0; c < l; c++)
          a[c] = arguments[c + 2];
      r.children = a
  }
  return {
      $$typeof: ls,
      type: e.type,
      key: i,
      ref: o,
      props: r,
      _owner: s
  }
}
;
Z.createContext = function(e) {
  return e = {
      $$typeof: $b,
      _currentValue: e,
      _currentValue2: e,
      _threadCount: 0,
      Provider: null,
      Consumer: null,
      _defaultValue: null,
      _globalName: null
  },
  e.Provider = {
      $$typeof: Bb,
      _context: e
  },
  e.Consumer = e
}
;
Z.createElement = oy;
Z.createFactory = function(e) {
  var t = oy.bind(null, e);
  return t.type = e,
  t
}
;
Z.createRef = function() {
  return {
      current: null
  }
}
;
Z.forwardRef = function(e) {
  return {
      $$typeof: Ub,
      render: e
  }
}
;
Z.isValidElement = kd;
Z.lazy = function(e) {
  return {
      $$typeof: Kb,
      _payload: {
          _status: -1,
          _result: e
      },
      _init: Yb
  }
}
;
Z.memo = function(e, t) {
  return {
      $$typeof: Hb,
      type: e,
      compare: t === void 0 ? null : t
  }
}
;
Z.startTransition = function(e) {
  var t = Js.transition;
  Js.transition = {};
  try {
      e()
  } finally {
      Js.transition = t
  }
}
;
Z.unstable_act = sy;
Z.useCallback = function(e, t) {
  return Qe.current.useCallback(e, t)
}
;
Z.useContext = function(e) {
  return Qe.current.useContext(e)
}
;
Z.useDebugValue = function() {}
;
Z.useDeferredValue = function(e) {
  return Qe.current.useDeferredValue(e)
}
;
Z.useEffect = function(e, t) {
  return Qe.current.useEffect(e, t)
}
;
Z.useId = function() {
  return Qe.current.useId()
}
;
Z.useImperativeHandle = function(e, t, n) {
  return Qe.current.useImperativeHandle(e, t, n)
}
;
Z.useInsertionEffect = function(e, t) {
  return Qe.current.useInsertionEffect(e, t)
}
;
Z.useLayoutEffect = function(e, t) {
  return Qe.current.useLayoutEffect(e, t)
}
;
Z.useMemo = function(e, t) {
  return Qe.current.useMemo(e, t)
}
;
Z.useReducer = function(e, t, n) {
  return Qe.current.useReducer(e, t, n)
}
;
Z.useRef = function(e) {
  return Qe.current.useRef(e)
}
;
Z.useState = function(e) {
  return Qe.current.useState(e)
}
;
Z.useSyncExternalStore = function(e, t, n) {
  return Qe.current.useSyncExternalStore(e, t, n)
}
;
Z.useTransition = function() {
  return Qe.current.useTransition()
}
;
Z.version = "18.3.1";
Xg.exports = Z;
var x = Xg.exports;
const M = Yg(x)
, Ed = Ob({
  __proto__: null,
  default: M
}, [x]);
/**
* @license React
* react-jsx-runtime.production.min.js
*
* Copyright (c) Facebook, Inc. and its affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var Xb = x
, Jb = Symbol.for("react.element")
, eS = Symbol.for("react.fragment")
, tS = Object.prototype.hasOwnProperty
, nS = Xb.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner
, rS = {
  key: !0,
  ref: !0,
  __self: !0,
  __source: !0
};
function ay(e, t, n) {
  var r, i = {}, o = null, s = null;
  n !== void 0 && (o = "" + n),
  t.key !== void 0 && (o = "" + t.key),
  t.ref !== void 0 && (s = t.ref);
  for (r in t)
      tS.call(t, r) && !rS.hasOwnProperty(r) && (i[r] = t[r]);
  if (e && e.defaultProps)
      for (r in t = e.defaultProps,
      t)
          i[r] === void 0 && (i[r] = t[r]);
  return {
      $$typeof: Jb,
      type: e,
      key: o,
      ref: s,
      props: i,
      _owner: nS.current
  }
}
nl.Fragment = eS;
nl.jsx = ay;
nl.jsxs = ay;
Zg.exports = nl;
var h = Zg.exports
, ly = {
  exports: {}
}
, dt = {}
, cy = {
  exports: {}
}
, uy = {};
/**
* @license React
* scheduler.production.min.js
*
* Copyright (c) Facebook, Inc. and its affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
(function(e) {
  function t(T, N) {
      var O = T.length;
      T.push(N);
      e: for (; 0 < O; ) {
          var H = O - 1 >>> 1
            , U = T[H];
          if (0 < i(U, N))
              T[H] = N,
              T[O] = U,
              O = H;
          else
              break e
      }
  }
  function n(T) {
      return T.length === 0 ? null : T[0]
  }
  function r(T) {
      if (T.length === 0)
          return null;
      var N = T[0]
        , O = T.pop();
      if (O !== N) {
          T[0] = O;
          e: for (var H = 0, U = T.length, Y = U >>> 1; H < Y; ) {
              var X = 2 * (H + 1) - 1
                , Se = T[X]
                , Ie = X + 1
                , te = T[Ie];
              if (0 > i(Se, O))
                  Ie < U && 0 > i(te, Se) ? (T[H] = te,
                  T[Ie] = O,
                  H = Ie) : (T[H] = Se,
                  T[X] = O,
                  H = X);
              else if (Ie < U && 0 > i(te, O))
                  T[H] = te,
                  T[Ie] = O,
                  H = Ie;
              else
                  break e
          }
      }
      return N
  }
  function i(T, N) {
      var O = T.sortIndex - N.sortIndex;
      return O !== 0 ? O : T.id - N.id
  }
  if (typeof performance == "object" && typeof performance.now == "function") {
      var o = performance;
      e.unstable_now = function() {
          return o.now()
      }
  } else {
      var s = Date
        , a = s.now();
      e.unstable_now = function() {
          return s.now() - a
      }
  }
  var l = []
    , c = []
    , u = 1
    , d = null
    , f = 3
    , p = !1
    , b = !1
    , y = !1
    , w = typeof setTimeout == "function" ? setTimeout : null
    , m = typeof clearTimeout == "function" ? clearTimeout : null
    , g = typeof setImmediate < "u" ? setImmediate : null;
  typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function v(T) {
      for (var N = n(c); N !== null; ) {
          if (N.callback === null)
              r(c);
          else if (N.startTime <= T)
              r(c),
              N.sortIndex = N.expirationTime,
              t(l, N);
          else
              break;
          N = n(c)
      }
  }
  function S(T) {
      if (y = !1,
      v(T),
      !b)
          if (n(l) !== null)
              b = !0,
              $(C);
          else {
              var N = n(c);
              N !== null && V(S, N.startTime - T)
          }
  }
  function C(T, N) {
      b = !1,
      y && (y = !1,
      m(P),
      P = -1),
      p = !0;
      var O = f;
      try {
          for (v(N),
          d = n(l); d !== null && (!(d.expirationTime > N) || T && !z()); ) {
              var H = d.callback;
              if (typeof H == "function") {
                  d.callback = null,
                  f = d.priorityLevel;
                  var U = H(d.expirationTime <= N);
                  N = e.unstable_now(),
                  typeof U == "function" ? d.callback = U : d === n(l) && r(l),
                  v(N)
              } else
                  r(l);
              d = n(l)
          }
          if (d !== null)
              var Y = !0;
          else {
              var X = n(c);
              X !== null && V(S, X.startTime - N),
              Y = !1
          }
          return Y
      } finally {
          d = null,
          f = O,
          p = !1
      }
  }
  var k = !1
    , E = null
    , P = -1
    , j = 5
    , R = -1;
  function z() {
      return !(e.unstable_now() - R < j)
  }
  function L() {
      if (E !== null) {
          var T = e.unstable_now();
          R = T;
          var N = !0;
          try {
              N = E(!0, T)
          } finally {
              N ? W() : (k = !1,
              E = null)
          }
      } else
          k = !1
  }
  var W;
  if (typeof g == "function")
      W = function() {
          g(L)
      }
      ;
  else if (typeof MessageChannel < "u") {
      var I = new MessageChannel
        , K = I.port2;
      I.port1.onmessage = L,
      W = function() {
          K.postMessage(null)
      }
  } else
      W = function() {
          w(L, 0)
      }
      ;
  function $(T) {
      E = T,
      k || (k = !0,
      W())
  }
  function V(T, N) {
      P = w(function() {
          T(e.unstable_now())
      }, N)
  }
  e.unstable_IdlePriority = 5,
  e.unstable_ImmediatePriority = 1,
  e.unstable_LowPriority = 4,
  e.unstable_NormalPriority = 3,
  e.unstable_Profiling = null,
  e.unstable_UserBlockingPriority = 2,
  e.unstable_cancelCallback = function(T) {
      T.callback = null
  }
  ,
  e.unstable_continueExecution = function() {
      b || p || (b = !0,
      $(C))
  }
  ,
  e.unstable_forceFrameRate = function(T) {
      0 > T || 125 < T ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : j = 0 < T ? Math.floor(1e3 / T) : 5
  }
  ,
  e.unstable_getCurrentPriorityLevel = function() {
      return f
  }
  ,
  e.unstable_getFirstCallbackNode = function() {
      return n(l)
  }
  ,
  e.unstable_next = function(T) {
      switch (f) {
      case 1:
      case 2:
      case 3:
          var N = 3;
          break;
      default:
          N = f
      }
      var O = f;
      f = N;
      try {
          return T()
      } finally {
          f = O
      }
  }
  ,
  e.unstable_pauseExecution = function() {}
  ,
  e.unstable_requestPaint = function() {}
  ,
  e.unstable_runWithPriority = function(T, N) {
      switch (T) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
          break;
      default:
          T = 3
      }
      var O = f;
      f = T;
      try {
          return N()
      } finally {
          f = O
      }
  }
  ,
  e.unstable_scheduleCallback = function(T, N, O) {
      var H = e.unstable_now();
      switch (typeof O == "object" && O !== null ? (O = O.delay,
      O = typeof O == "number" && 0 < O ? H + O : H) : O = H,
      T) {
      case 1:
          var U = -1;
          break;
      case 2:
          U = 250;
          break;
      case 5:
          U = 1073741823;
          break;
      case 4:
          U = 1e4;
          break;
      default:
          U = 5e3
      }
      return U = O + U,
      T = {
          id: u++,
          callback: N,
          priorityLevel: T,
          startTime: O,
          expirationTime: U,
          sortIndex: -1
      },
      O > H ? (T.sortIndex = O,
      t(c, T),
      n(l) === null && T === n(c) && (y ? (m(P),
      P = -1) : y = !0,
      V(S, O - H))) : (T.sortIndex = U,
      t(l, T),
      b || p || (b = !0,
      $(C))),
      T
  }
  ,
  e.unstable_shouldYield = z,
  e.unstable_wrapCallback = function(T) {
      var N = f;
      return function() {
          var O = f;
          f = N;
          try {
              return T.apply(this, arguments)
          } finally {
              f = O
          }
      }
  }
}
)(uy);
cy.exports = uy;
var iS = cy.exports;
/**
* @license React
* react-dom.production.min.js
*
* Copyright (c) Facebook, Inc. and its affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var oS = x
, ct = iS;
function D(e) {
  for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1; n < arguments.length; n++)
      t += "&args[]=" + encodeURIComponent(arguments[n]);
  return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
}
var dy = new Set
, Io = {};
function $r(e, t) {
  ji(e, t),
  ji(e + "Capture", t)
}
function ji(e, t) {
  for (Io[e] = t,
  e = 0; e < t.length; e++)
      dy.add(t[e])
}
var gn = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u")
, Fc = Object.prototype.hasOwnProperty
, sS = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/
, Dh = {}
, Ih = {};
function aS(e) {
  return Fc.call(Ih, e) ? !0 : Fc.call(Dh, e) ? !1 : sS.test(e) ? Ih[e] = !0 : (Dh[e] = !0,
  !1)
}
function lS(e, t, n, r) {
  if (n !== null && n.type === 0)
      return !1;
  switch (typeof t) {
  case "function":
  case "symbol":
      return !0;
  case "boolean":
      return r ? !1 : n !== null ? !n.acceptsBooleans : (e = e.toLowerCase().slice(0, 5),
      e !== "data-" && e !== "aria-");
  default:
      return !1
  }
}
function cS(e, t, n, r) {
  if (t === null || typeof t > "u" || lS(e, t, n, r))
      return !0;
  if (r)
      return !1;
  if (n !== null)
      switch (n.type) {
      case 3:
          return !t;
      case 4:
          return t === !1;
      case 5:
          return isNaN(t);
      case 6:
          return isNaN(t) || 1 > t
      }
  return !1
}
function Ye(e, t, n, r, i, o, s) {
  this.acceptsBooleans = t === 2 || t === 3 || t === 4,
  this.attributeName = r,
  this.attributeNamespace = i,
  this.mustUseProperty = n,
  this.propertyName = e,
  this.type = t,
  this.sanitizeURL = o,
  this.removeEmptyString = s
}
var De = {};
"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e) {
  De[e] = new Ye(e,0,!1,e,null,!1,!1)
});
[["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(e) {
  var t = e[0];
  De[t] = new Ye(t,1,!1,e[1],null,!1,!1)
});
["contentEditable", "draggable", "spellCheck", "value"].forEach(function(e) {
  De[e] = new Ye(e,2,!1,e.toLowerCase(),null,!1,!1)
});
["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(e) {
  De[e] = new Ye(e,2,!1,e,null,!1,!1)
});
"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e) {
  De[e] = new Ye(e,3,!1,e.toLowerCase(),null,!1,!1)
});
["checked", "multiple", "muted", "selected"].forEach(function(e) {
  De[e] = new Ye(e,3,!0,e,null,!1,!1)
});
["capture", "download"].forEach(function(e) {
  De[e] = new Ye(e,4,!1,e,null,!1,!1)
});
["cols", "rows", "size", "span"].forEach(function(e) {
  De[e] = new Ye(e,6,!1,e,null,!1,!1)
});
["rowSpan", "start"].forEach(function(e) {
  De[e] = new Ye(e,5,!1,e.toLowerCase(),null,!1,!1)
});
var Pd = /[\-:]([a-z])/g;
function Td(e) {
  return e[1].toUpperCase()
}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e) {
  var t = e.replace(Pd, Td);
  De[t] = new Ye(t,1,!1,e,null,!1,!1)
});
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e) {
  var t = e.replace(Pd, Td);
  De[t] = new Ye(t,1,!1,e,"http://www.w3.org/1999/xlink",!1,!1)
});
["xml:base", "xml:lang", "xml:space"].forEach(function(e) {
  var t = e.replace(Pd, Td);
  De[t] = new Ye(t,1,!1,e,"http://www.w3.org/XML/1998/namespace",!1,!1)
});
["tabIndex", "crossOrigin"].forEach(function(e) {
  De[e] = new Ye(e,1,!1,e.toLowerCase(),null,!1,!1)
});
De.xlinkHref = new Ye("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);
["src", "href", "action", "formAction"].forEach(function(e) {
  De[e] = new Ye(e,1,!1,e.toLowerCase(),null,!0,!0)
});
function Ad(e, t, n, r) {
  var i = De.hasOwnProperty(t) ? De[t] : null;
  (i !== null ? i.type !== 0 : r || !(2 < t.length) || t[0] !== "o" && t[0] !== "O" || t[1] !== "n" && t[1] !== "N") && (cS(t, n, i, r) && (n = null),
  r || i === null ? aS(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n)) : i.mustUseProperty ? e[i.propertyName] = n === null ? i.type === 3 ? !1 : "" : n : (t = i.attributeName,
  r = i.attributeNamespace,
  n === null ? e.removeAttribute(t) : (i = i.type,
  n = i === 3 || i === 4 && n === !0 ? "" : "" + n,
  r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))))
}
var Cn = oS.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
, Ts = Symbol.for("react.element")
, Zr = Symbol.for("react.portal")
, Xr = Symbol.for("react.fragment")
, Nd = Symbol.for("react.strict_mode")
, Bc = Symbol.for("react.profiler")
, fy = Symbol.for("react.provider")
, hy = Symbol.for("react.context")
, Rd = Symbol.for("react.forward_ref")
, $c = Symbol.for("react.suspense")
, Uc = Symbol.for("react.suspense_list")
, jd = Symbol.for("react.memo")
, Ln = Symbol.for("react.lazy")
, py = Symbol.for("react.offscreen")
, Lh = Symbol.iterator;
function no(e) {
  return e === null || typeof e != "object" ? null : (e = Lh && e[Lh] || e["@@iterator"],
  typeof e == "function" ? e : null)
}
var ye = Object.assign, Kl;
function po(e) {
  if (Kl === void 0)
      try {
          throw Error()
      } catch (n) {
          var t = n.stack.trim().match(/\n( *(at )?)/);
          Kl = t && t[1] || ""
      }
  return `
` + Kl + e
}
var ql = !1;
function Gl(e, t) {
  if (!e || ql)
      return "";
  ql = !0;
  var n = Error.prepareStackTrace;
  Error.prepareStackTrace = void 0;
  try {
      if (t)
          if (t = function() {
              throw Error()
          }
          ,
          Object.defineProperty(t.prototype, "props", {
              set: function() {
                  throw Error()
              }
          }),
          typeof Reflect == "object" && Reflect.construct) {
              try {
                  Reflect.construct(t, [])
              } catch (c) {
                  var r = c
              }
              Reflect.construct(e, [], t)
          } else {
              try {
                  t.call()
              } catch (c) {
                  r = c
              }
              e.call(t.prototype)
          }
      else {
          try {
              throw Error()
          } catch (c) {
              r = c
          }
          e()
      }
  } catch (c) {
      if (c && r && typeof c.stack == "string") {
          for (var i = c.stack.split(`
`), o = r.stack.split(`
`), s = i.length - 1, a = o.length - 1; 1 <= s && 0 <= a && i[s] !== o[a]; )
              a--;
          for (; 1 <= s && 0 <= a; s--,
          a--)
              if (i[s] !== o[a]) {
                  if (s !== 1 || a !== 1)
                      do
                          if (s--,
                          a--,
                          0 > a || i[s] !== o[a]) {
                              var l = `
` + i[s].replace(" at new ", " at ");
                              return e.displayName && l.includes("<anonymous>") && (l = l.replace("<anonymous>", e.displayName)),
                              l
                          }
                      while (1 <= s && 0 <= a);
                  break
              }
      }
  } finally {
      ql = !1,
      Error.prepareStackTrace = n
  }
  return (e = e ? e.displayName || e.name : "") ? po(e) : ""
}
function uS(e) {
  switch (e.tag) {
  case 5:
      return po(e.type);
  case 16:
      return po("Lazy");
  case 13:
      return po("Suspense");
  case 19:
      return po("SuspenseList");
  case 0:
  case 2:
  case 15:
      return e = Gl(e.type, !1),
      e;
  case 11:
      return e = Gl(e.type.render, !1),
      e;
  case 1:
      return e = Gl(e.type, !0),
      e;
  default:
      return ""
  }
}
function Wc(e) {
  if (e == null)
      return null;
  if (typeof e == "function")
      return e.displayName || e.name || null;
  if (typeof e == "string")
      return e;
  switch (e) {
  case Xr:
      return "Fragment";
  case Zr:
      return "Portal";
  case Bc:
      return "Profiler";
  case Nd:
      return "StrictMode";
  case $c:
      return "Suspense";
  case Uc:
      return "SuspenseList"
  }
  if (typeof e == "object")
      switch (e.$$typeof) {
      case hy:
          return (e.displayName || "Context") + ".Consumer";
      case fy:
          return (e._context.displayName || "Context") + ".Provider";
      case Rd:
          var t = e.render;
          return e = e.displayName,
          e || (e = t.displayName || t.name || "",
          e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"),
          e;
      case jd:
          return t = e.displayName || null,
          t !== null ? t : Wc(e.type) || "Memo";
      case Ln:
          t = e._payload,
          e = e._init;
          try {
              return Wc(e(t))
          } catch {}
      }
  return null
}
function dS(e) {
  var t = e.type;
  switch (e.tag) {
  case 24:
      return "Cache";
  case 9:
      return (t.displayName || "Context") + ".Consumer";
  case 10:
      return (t._context.displayName || "Context") + ".Provider";
  case 18:
      return "DehydratedFragment";
  case 11:
      return e = t.render,
      e = e.displayName || e.name || "",
      t.displayName || (e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef");
  case 7:
      return "Fragment";
  case 5:
      return t;
  case 4:
      return "Portal";
  case 3:
      return "Root";
  case 6:
      return "Text";
  case 16:
      return Wc(t);
  case 8:
      return t === Nd ? "StrictMode" : "Mode";
  case 22:
      return "Offscreen";
  case 12:
      return "Profiler";
  case 21:
      return "Scope";
  case 13:
      return "Suspense";
  case 19:
      return "SuspenseList";
  case 25:
      return "TracingMarker";
  case 1:
  case 0:
  case 17:
  case 2:
  case 14:
  case 15:
      if (typeof t == "function")
          return t.displayName || t.name || null;
      if (typeof t == "string")
          return t
  }
  return null
}
function rr(e) {
  switch (typeof e) {
  case "boolean":
  case "number":
  case "string":
  case "undefined":
      return e;
  case "object":
      return e;
  default:
      return ""
  }
}
function my(e) {
  var t = e.type;
  return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio")
}
function fS(e) {
  var t = my(e) ? "checked" : "value"
    , n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t)
    , r = "" + e[t];
  if (!e.hasOwnProperty(t) && typeof n < "u" && typeof n.get == "function" && typeof n.set == "function") {
      var i = n.get
        , o = n.set;
      return Object.defineProperty(e, t, {
          configurable: !0,
          get: function() {
              return i.call(this)
          },
          set: function(s) {
              r = "" + s,
              o.call(this, s)
          }
      }),
      Object.defineProperty(e, t, {
          enumerable: n.enumerable
      }),
      {
          getValue: function() {
              return r
          },
          setValue: function(s) {
              r = "" + s
          },
          stopTracking: function() {
              e._valueTracker = null,
              delete e[t]
          }
      }
  }
}
function As(e) {
  e._valueTracker || (e._valueTracker = fS(e))
}
function gy(e) {
  if (!e)
      return !1;
  var t = e._valueTracker;
  if (!t)
      return !0;
  var n = t.getValue()
    , r = "";
  return e && (r = my(e) ? e.checked ? "true" : "false" : e.value),
  e = r,
  e !== n ? (t.setValue(e),
  !0) : !1
}
function ya(e) {
  if (e = e || (typeof document < "u" ? document : void 0),
  typeof e > "u")
      return null;
  try {
      return e.activeElement || e.body
  } catch {
      return e.body
  }
}
function Hc(e, t) {
  var n = t.checked;
  return ye({}, t, {
      defaultChecked: void 0,
      defaultValue: void 0,
      value: void 0,
      checked: n ?? e._wrapperState.initialChecked
  })
}
function Oh(e, t) {
  var n = t.defaultValue == null ? "" : t.defaultValue
    , r = t.checked != null ? t.checked : t.defaultChecked;
  n = rr(t.value != null ? t.value : n),
  e._wrapperState = {
      initialChecked: r,
      initialValue: n,
      controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null
  }
}
function yy(e, t) {
  t = t.checked,
  t != null && Ad(e, "checked", t, !1)
}
function Kc(e, t) {
  yy(e, t);
  var n = rr(t.value)
    , r = t.type;
  if (n != null)
      r === "number" ? (n === 0 && e.value === "" || e.value != n) && (e.value = "" + n) : e.value !== "" + n && (e.value = "" + n);
  else if (r === "submit" || r === "reset") {
      e.removeAttribute("value");
      return
  }
  t.hasOwnProperty("value") ? qc(e, t.type, n) : t.hasOwnProperty("defaultValue") && qc(e, t.type, rr(t.defaultValue)),
  t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked)
}
function zh(e, t, n) {
  if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
      var r = t.type;
      if (!(r !== "submit" && r !== "reset" || t.value !== void 0 && t.value !== null))
          return;
      t = "" + e._wrapperState.initialValue,
      n || t === e.value || (e.value = t),
      e.defaultValue = t
  }
  n = e.name,
  n !== "" && (e.name = ""),
  e.defaultChecked = !!e._wrapperState.initialChecked,
  n !== "" && (e.name = n)
}
function qc(e, t, n) {
  (t !== "number" || ya(e.ownerDocument) !== e) && (n == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + n && (e.defaultValue = "" + n))
}
var mo = Array.isArray;
function hi(e, t, n, r) {
  if (e = e.options,
  t) {
      t = {};
      for (var i = 0; i < n.length; i++)
          t["$" + n[i]] = !0;
      for (n = 0; n < e.length; n++)
          i = t.hasOwnProperty("$" + e[n].value),
          e[n].selected !== i && (e[n].selected = i),
          i && r && (e[n].defaultSelected = !0)
  } else {
      for (n = "" + rr(n),
      t = null,
      i = 0; i < e.length; i++) {
          if (e[i].value === n) {
              e[i].selected = !0,
              r && (e[i].defaultSelected = !0);
              return
          }
          t !== null || e[i].disabled || (t = e[i])
      }
      t !== null && (t.selected = !0)
  }
}
function Gc(e, t) {
  if (t.dangerouslySetInnerHTML != null)
      throw Error(D(91));
  return ye({}, t, {
      value: void 0,
      defaultValue: void 0,
      children: "" + e._wrapperState.initialValue
  })
}
function _h(e, t) {
  var n = t.value;
  if (n == null) {
      if (n = t.children,
      t = t.defaultValue,
      n != null) {
          if (t != null)
              throw Error(D(92));
          if (mo(n)) {
              if (1 < n.length)
                  throw Error(D(93));
              n = n[0]
          }
          t = n
      }
      t == null && (t = ""),
      n = t
  }
  e._wrapperState = {
      initialValue: rr(n)
  }
}
function vy(e, t) {
  var n = rr(t.value)
    , r = rr(t.defaultValue);
  n != null && (n = "" + n,
  n !== e.value && (e.value = n),
  t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)),
  r != null && (e.defaultValue = "" + r)
}
function Vh(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t)
}
function xy(e) {
  switch (e) {
  case "svg":
      return "http://www.w3.org/2000/svg";
  case "math":
      return "http://www.w3.org/1998/Math/MathML";
  default:
      return "http://www.w3.org/1999/xhtml"
  }
}
function Qc(e, t) {
  return e == null || e === "http://www.w3.org/1999/xhtml" ? xy(t) : e === "http://www.w3.org/2000/svg" && t === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e
}
var Ns, wy = function(e) {
  return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(t, n, r, i) {
      MSApp.execUnsafeLocalFunction(function() {
          return e(t, n, r, i)
      })
  }
  : e
}(function(e, t) {
  if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML"in e)
      e.innerHTML = t;
  else {
      for (Ns = Ns || document.createElement("div"),
      Ns.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>",
      t = Ns.firstChild; e.firstChild; )
          e.removeChild(e.firstChild);
      for (; t.firstChild; )
          e.appendChild(t.firstChild)
  }
});
function Lo(e, t) {
  if (t) {
      var n = e.firstChild;
      if (n && n === e.lastChild && n.nodeType === 3) {
          n.nodeValue = t;
          return
      }
  }
  e.textContent = t
}
var wo = {
  animationIterationCount: !0,
  aspectRatio: !0,
  borderImageOutset: !0,
  borderImageSlice: !0,
  borderImageWidth: !0,
  boxFlex: !0,
  boxFlexGroup: !0,
  boxOrdinalGroup: !0,
  columnCount: !0,
  columns: !0,
  flex: !0,
  flexGrow: !0,
  flexPositive: !0,
  flexShrink: !0,
  flexNegative: !0,
  flexOrder: !0,
  gridArea: !0,
  gridRow: !0,
  gridRowEnd: !0,
  gridRowSpan: !0,
  gridRowStart: !0,
  gridColumn: !0,
  gridColumnEnd: !0,
  gridColumnSpan: !0,
  gridColumnStart: !0,
  fontWeight: !0,
  lineClamp: !0,
  lineHeight: !0,
  opacity: !0,
  order: !0,
  orphans: !0,
  tabSize: !0,
  widows: !0,
  zIndex: !0,
  zoom: !0,
  fillOpacity: !0,
  floodOpacity: !0,
  stopOpacity: !0,
  strokeDasharray: !0,
  strokeDashoffset: !0,
  strokeMiterlimit: !0,
  strokeOpacity: !0,
  strokeWidth: !0
}
, hS = ["Webkit", "ms", "Moz", "O"];
Object.keys(wo).forEach(function(e) {
  hS.forEach(function(t) {
      t = t + e.charAt(0).toUpperCase() + e.substring(1),
      wo[t] = wo[e]
  })
});
function by(e, t, n) {
  return t == null || typeof t == "boolean" || t === "" ? "" : n || typeof t != "number" || t === 0 || wo.hasOwnProperty(e) && wo[e] ? ("" + t).trim() : t + "px"
}
function Sy(e, t) {
  e = e.style;
  for (var n in t)
      if (t.hasOwnProperty(n)) {
          var r = n.indexOf("--") === 0
            , i = by(n, t[n], r);
          n === "float" && (n = "cssFloat"),
          r ? e.setProperty(n, i) : e[n] = i
      }
}
var pS = ye({
  menuitem: !0
}, {
  area: !0,
  base: !0,
  br: !0,
  col: !0,
  embed: !0,
  hr: !0,
  img: !0,
  input: !0,
  keygen: !0,
  link: !0,
  meta: !0,
  param: !0,
  source: !0,
  track: !0,
  wbr: !0
});
function Yc(e, t) {
  if (t) {
      if (pS[e] && (t.children != null || t.dangerouslySetInnerHTML != null))
          throw Error(D(137, e));
      if (t.dangerouslySetInnerHTML != null) {
          if (t.children != null)
              throw Error(D(60));
          if (typeof t.dangerouslySetInnerHTML != "object" || !("__html"in t.dangerouslySetInnerHTML))
              throw Error(D(61))
      }
      if (t.style != null && typeof t.style != "object")
          throw Error(D(62))
  }
}
function Zc(e, t) {
  if (e.indexOf("-") === -1)
      return typeof t.is == "string";
  switch (e) {
  case "annotation-xml":
  case "color-profile":
  case "font-face":
  case "font-face-src":
  case "font-face-uri":
  case "font-face-format":
  case "font-face-name":
  case "missing-glyph":
      return !1;
  default:
      return !0
  }
}
var Xc = null;
function Md(e) {
  return e = e.target || e.srcElement || window,
  e.correspondingUseElement && (e = e.correspondingUseElement),
  e.nodeType === 3 ? e.parentNode : e
}
var Jc = null
, pi = null
, mi = null;
function Fh(e) {
  if (e = ds(e)) {
      if (typeof Jc != "function")
          throw Error(D(280));
      var t = e.stateNode;
      t && (t = al(t),
      Jc(e.stateNode, e.type, t))
  }
}
function Cy(e) {
  pi ? mi ? mi.push(e) : mi = [e] : pi = e
}
function ky() {
  if (pi) {
      var e = pi
        , t = mi;
      if (mi = pi = null,
      Fh(e),
      t)
          for (e = 0; e < t.length; e++)
              Fh(t[e])
  }
}
function Ey(e, t) {
  return e(t)
}
function Py() {}
var Ql = !1;
function Ty(e, t, n) {
  if (Ql)
      return e(t, n);
  Ql = !0;
  try {
      return Ey(e, t, n)
  } finally {
      Ql = !1,
      (pi !== null || mi !== null) && (Py(),
      ky())
  }
}
function Oo(e, t) {
  var n = e.stateNode;
  if (n === null)
      return null;
  var r = al(n);
  if (r === null)
      return null;
  n = r[t];
  e: switch (t) {
  case "onClick":
  case "onClickCapture":
  case "onDoubleClick":
  case "onDoubleClickCapture":
  case "onMouseDown":
  case "onMouseDownCapture":
  case "onMouseMove":
  case "onMouseMoveCapture":
  case "onMouseUp":
  case "onMouseUpCapture":
  case "onMouseEnter":
      (r = !r.disabled) || (e = e.type,
      r = !(e === "button" || e === "input" || e === "select" || e === "textarea")),
      e = !r;
      break e;
  default:
      e = !1
  }
  if (e)
      return null;
  if (n && typeof n != "function")
      throw Error(D(231, t, typeof n));
  return n
}
var eu = !1;
if (gn)
  try {
      var ro = {};
      Object.defineProperty(ro, "passive", {
          get: function() {
              eu = !0
          }
      }),
      window.addEventListener("test", ro, ro),
      window.removeEventListener("test", ro, ro)
  } catch {
      eu = !1
  }
function mS(e, t, n, r, i, o, s, a, l) {
  var c = Array.prototype.slice.call(arguments, 3);
  try {
      t.apply(n, c)
  } catch (u) {
      this.onError(u)
  }
}
var bo = !1
, va = null
, xa = !1
, tu = null
, gS = {
  onError: function(e) {
      bo = !0,
      va = e
  }
};
function yS(e, t, n, r, i, o, s, a, l) {
  bo = !1,
  va = null,
  mS.apply(gS, arguments)
}
function vS(e, t, n, r, i, o, s, a, l) {
  if (yS.apply(this, arguments),
  bo) {
      if (bo) {
          var c = va;
          bo = !1,
          va = null
      } else
          throw Error(D(198));
      xa || (xa = !0,
      tu = c)
  }
}
function Ur(e) {
  var t = e
    , n = e;
  if (e.alternate)
      for (; t.return; )
          t = t.return;
  else {
      e = t;
      do
          t = e,
          t.flags & 4098 && (n = t.return),
          e = t.return;
      while (e)
  }
  return t.tag === 3 ? n : null
}
function Ay(e) {
  if (e.tag === 13) {
      var t = e.memoizedState;
      if (t === null && (e = e.alternate,
      e !== null && (t = e.memoizedState)),
      t !== null)
          return t.dehydrated
  }
  return null
}
function Bh(e) {
  if (Ur(e) !== e)
      throw Error(D(188))
}
function xS(e) {
  var t = e.alternate;
  if (!t) {
      if (t = Ur(e),
      t === null)
          throw Error(D(188));
      return t !== e ? null : e
  }
  for (var n = e, r = t; ; ) {
      var i = n.return;
      if (i === null)
          break;
      var o = i.alternate;
      if (o === null) {
          if (r = i.return,
          r !== null) {
              n = r;
              continue
          }
          break
      }
      if (i.child === o.child) {
          for (o = i.child; o; ) {
              if (o === n)
                  return Bh(i),
                  e;
              if (o === r)
                  return Bh(i),
                  t;
              o = o.sibling
          }
          throw Error(D(188))
      }
      if (n.return !== r.return)
          n = i,
          r = o;
      else {
          for (var s = !1, a = i.child; a; ) {
              if (a === n) {
                  s = !0,
                  n = i,
                  r = o;
                  break
              }
              if (a === r) {
                  s = !0,
                  r = i,
                  n = o;
                  break
              }
              a = a.sibling
          }
          if (!s) {
              for (a = o.child; a; ) {
                  if (a === n) {
                      s = !0,
                      n = o,
                      r = i;
                      break
                  }
                  if (a === r) {
                      s = !0,
                      r = o,
                      n = i;
                      break
                  }
                  a = a.sibling
              }
              if (!s)
                  throw Error(D(189))
          }
      }
      if (n.alternate !== r)
          throw Error(D(190))
  }
  if (n.tag !== 3)
      throw Error(D(188));
  return n.stateNode.current === n ? e : t
}
function Ny(e) {
  return e = xS(e),
  e !== null ? Ry(e) : null
}
function Ry(e) {
  if (e.tag === 5 || e.tag === 6)
      return e;
  for (e = e.child; e !== null; ) {
      var t = Ry(e);
      if (t !== null)
          return t;
      e = e.sibling
  }
  return null
}
var jy = ct.unstable_scheduleCallback
, $h = ct.unstable_cancelCallback
, wS = ct.unstable_shouldYield
, bS = ct.unstable_requestPaint
, we = ct.unstable_now
, SS = ct.unstable_getCurrentPriorityLevel
, Dd = ct.unstable_ImmediatePriority
, My = ct.unstable_UserBlockingPriority
, wa = ct.unstable_NormalPriority
, CS = ct.unstable_LowPriority
, Dy = ct.unstable_IdlePriority
, rl = null
, Zt = null;
function kS(e) {
  if (Zt && typeof Zt.onCommitFiberRoot == "function")
      try {
          Zt.onCommitFiberRoot(rl, e, void 0, (e.current.flags & 128) === 128)
      } catch {}
}
var zt = Math.clz32 ? Math.clz32 : TS
, ES = Math.log
, PS = Math.LN2;
function TS(e) {
  return e >>>= 0,
  e === 0 ? 32 : 31 - (ES(e) / PS | 0) | 0
}
var Rs = 64
, js = 4194304;
function go(e) {
  switch (e & -e) {
  case 1:
      return 1;
  case 2:
      return 2;
  case 4:
      return 4;
  case 8:
      return 8;
  case 16:
      return 16;
  case 32:
      return 32;
  case 64:
  case 128:
  case 256:
  case 512:
  case 1024:
  case 2048:
  case 4096:
  case 8192:
  case 16384:
  case 32768:
  case 65536:
  case 131072:
  case 262144:
  case 524288:
  case 1048576:
  case 2097152:
      return e & 4194240;
  case 4194304:
  case 8388608:
  case 16777216:
  case 33554432:
  case 67108864:
      return e & 130023424;
  case 134217728:
      return 134217728;
  case 268435456:
      return 268435456;
  case 536870912:
      return 536870912;
  case 1073741824:
      return 1073741824;
  default:
      return e
  }
}
function ba(e, t) {
  var n = e.pendingLanes;
  if (n === 0)
      return 0;
  var r = 0
    , i = e.suspendedLanes
    , o = e.pingedLanes
    , s = n & 268435455;
  if (s !== 0) {
      var a = s & ~i;
      a !== 0 ? r = go(a) : (o &= s,
      o !== 0 && (r = go(o)))
  } else
      s = n & ~i,
      s !== 0 ? r = go(s) : o !== 0 && (r = go(o));
  if (r === 0)
      return 0;
  if (t !== 0 && t !== r && !(t & i) && (i = r & -r,
  o = t & -t,
  i >= o || i === 16 && (o & 4194240) !== 0))
      return t;
  if (r & 4 && (r |= n & 16),
  t = e.entangledLanes,
  t !== 0)
      for (e = e.entanglements,
      t &= r; 0 < t; )
          n = 31 - zt(t),
          i = 1 << n,
          r |= e[n],
          t &= ~i;
  return r
}
function AS(e, t) {
  switch (e) {
  case 1:
  case 2:
  case 4:
      return t + 250;
  case 8:
  case 16:
  case 32:
  case 64:
  case 128:
  case 256:
  case 512:
  case 1024:
  case 2048:
  case 4096:
  case 8192:
  case 16384:
  case 32768:
  case 65536:
  case 131072:
  case 262144:
  case 524288:
  case 1048576:
  case 2097152:
      return t + 5e3;
  case 4194304:
  case 8388608:
  case 16777216:
  case 33554432:
  case 67108864:
      return -1;
  case 134217728:
  case 268435456:
  case 536870912:
  case 1073741824:
      return -1;
  default:
      return -1
  }
}
function NS(e, t) {
  for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, o = e.pendingLanes; 0 < o; ) {
      var s = 31 - zt(o)
        , a = 1 << s
        , l = i[s];
      l === -1 ? (!(a & n) || a & r) && (i[s] = AS(a, t)) : l <= t && (e.expiredLanes |= a),
      o &= ~a
  }
}
function nu(e) {
  return e = e.pendingLanes & -1073741825,
  e !== 0 ? e : e & 1073741824 ? 1073741824 : 0
}
function Iy() {
  var e = Rs;
  return Rs <<= 1,
  !(Rs & 4194240) && (Rs = 64),
  e
}
function Yl(e) {
  for (var t = [], n = 0; 31 > n; n++)
      t.push(e);
  return t
}
function cs(e, t, n) {
  e.pendingLanes |= t,
  t !== 536870912 && (e.suspendedLanes = 0,
  e.pingedLanes = 0),
  e = e.eventTimes,
  t = 31 - zt(t),
  e[t] = n
}
function RS(e, t) {
  var n = e.pendingLanes & ~t;
  e.pendingLanes = t,
  e.suspendedLanes = 0,
  e.pingedLanes = 0,
  e.expiredLanes &= t,
  e.mutableReadLanes &= t,
  e.entangledLanes &= t,
  t = e.entanglements;
  var r = e.eventTimes;
  for (e = e.expirationTimes; 0 < n; ) {
      var i = 31 - zt(n)
        , o = 1 << i;
      t[i] = 0,
      r[i] = -1,
      e[i] = -1,
      n &= ~o
  }
}
function Id(e, t) {
  var n = e.entangledLanes |= t;
  for (e = e.entanglements; n; ) {
      var r = 31 - zt(n)
        , i = 1 << r;
      i & t | e[r] & t && (e[r] |= t),
      n &= ~i
  }
}
var re = 0;
function Ly(e) {
  return e &= -e,
  1 < e ? 4 < e ? e & 268435455 ? 16 : 536870912 : 4 : 1
}
var Oy, Ld, zy, _y, Vy, ru = !1, Ms = [], Gn = null, Qn = null, Yn = null, zo = new Map, _o = new Map, zn = [], jS = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
function Uh(e, t) {
  switch (e) {
  case "focusin":
  case "focusout":
      Gn = null;
      break;
  case "dragenter":
  case "dragleave":
      Qn = null;
      break;
  case "mouseover":
  case "mouseout":
      Yn = null;
      break;
  case "pointerover":
  case "pointerout":
      zo.delete(t.pointerId);
      break;
  case "gotpointercapture":
  case "lostpointercapture":
      _o.delete(t.pointerId)
  }
}
function io(e, t, n, r, i, o) {
  return e === null || e.nativeEvent !== o ? (e = {
      blockedOn: t,
      domEventName: n,
      eventSystemFlags: r,
      nativeEvent: o,
      targetContainers: [i]
  },
  t !== null && (t = ds(t),
  t !== null && Ld(t)),
  e) : (e.eventSystemFlags |= r,
  t = e.targetContainers,
  i !== null && t.indexOf(i) === -1 && t.push(i),
  e)
}
function MS(e, t, n, r, i) {
  switch (t) {
  case "focusin":
      return Gn = io(Gn, e, t, n, r, i),
      !0;
  case "dragenter":
      return Qn = io(Qn, e, t, n, r, i),
      !0;
  case "mouseover":
      return Yn = io(Yn, e, t, n, r, i),
      !0;
  case "pointerover":
      var o = i.pointerId;
      return zo.set(o, io(zo.get(o) || null, e, t, n, r, i)),
      !0;
  case "gotpointercapture":
      return o = i.pointerId,
      _o.set(o, io(_o.get(o) || null, e, t, n, r, i)),
      !0
  }
  return !1
}
function Fy(e) {
  var t = Sr(e.target);
  if (t !== null) {
      var n = Ur(t);
      if (n !== null) {
          if (t = n.tag,
          t === 13) {
              if (t = Ay(n),
              t !== null) {
                  e.blockedOn = t,
                  Vy(e.priority, function() {
                      zy(n)
                  });
                  return
              }
          } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
              e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
              return
          }
      }
  }
  e.blockedOn = null
}
function ea(e) {
  if (e.blockedOn !== null)
      return !1;
  for (var t = e.targetContainers; 0 < t.length; ) {
      var n = iu(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
      if (n === null) {
          n = e.nativeEvent;
          var r = new n.constructor(n.type,n);
          Xc = r,
          n.target.dispatchEvent(r),
          Xc = null
      } else
          return t = ds(n),
          t !== null && Ld(t),
          e.blockedOn = n,
          !1;
      t.shift()
  }
  return !0
}
function Wh(e, t, n) {
  ea(e) && n.delete(t)
}
function DS() {
  ru = !1,
  Gn !== null && ea(Gn) && (Gn = null),
  Qn !== null && ea(Qn) && (Qn = null),
  Yn !== null && ea(Yn) && (Yn = null),
  zo.forEach(Wh),
  _o.forEach(Wh)
}
function oo(e, t) {
  e.blockedOn === t && (e.blockedOn = null,
  ru || (ru = !0,
  ct.unstable_scheduleCallback(ct.unstable_NormalPriority, DS)))
}
function Vo(e) {
  function t(i) {
      return oo(i, e)
  }
  if (0 < Ms.length) {
      oo(Ms[0], e);
      for (var n = 1; n < Ms.length; n++) {
          var r = Ms[n];
          r.blockedOn === e && (r.blockedOn = null)
      }
  }
  for (Gn !== null && oo(Gn, e),
  Qn !== null && oo(Qn, e),
  Yn !== null && oo(Yn, e),
  zo.forEach(t),
  _o.forEach(t),
  n = 0; n < zn.length; n++)
      r = zn[n],
      r.blockedOn === e && (r.blockedOn = null);
  for (; 0 < zn.length && (n = zn[0],
  n.blockedOn === null); )
      Fy(n),
      n.blockedOn === null && zn.shift()
}
var gi = Cn.ReactCurrentBatchConfig
, Sa = !0;
function IS(e, t, n, r) {
  var i = re
    , o = gi.transition;
  gi.transition = null;
  try {
      re = 1,
      Od(e, t, n, r)
  } finally {
      re = i,
      gi.transition = o
  }
}
function LS(e, t, n, r) {
  var i = re
    , o = gi.transition;
  gi.transition = null;
  try {
      re = 4,
      Od(e, t, n, r)
  } finally {
      re = i,
      gi.transition = o
  }
}
function Od(e, t, n, r) {
  if (Sa) {
      var i = iu(e, t, n, r);
      if (i === null)
          sc(e, t, r, Ca, n),
          Uh(e, r);
      else if (MS(i, e, t, n, r))
          r.stopPropagation();
      else if (Uh(e, r),
      t & 4 && -1 < jS.indexOf(e)) {
          for (; i !== null; ) {
              var o = ds(i);
              if (o !== null && Oy(o),
              o = iu(e, t, n, r),
              o === null && sc(e, t, r, Ca, n),
              o === i)
                  break;
              i = o
          }
          i !== null && r.stopPropagation()
      } else
          sc(e, t, r, null, n)
  }
}
var Ca = null;
function iu(e, t, n, r) {
  if (Ca = null,
  e = Md(r),
  e = Sr(e),
  e !== null)
      if (t = Ur(e),
      t === null)
          e = null;
      else if (n = t.tag,
      n === 13) {
          if (e = Ay(t),
          e !== null)
              return e;
          e = null
      } else if (n === 3) {
          if (t.stateNode.current.memoizedState.isDehydrated)
              return t.tag === 3 ? t.stateNode.containerInfo : null;
          e = null
      } else
          t !== e && (e = null);
  return Ca = e,
  null
}
function By(e) {
  switch (e) {
  case "cancel":
  case "click":
  case "close":
  case "contextmenu":
  case "copy":
  case "cut":
  case "auxclick":
  case "dblclick":
  case "dragend":
  case "dragstart":
  case "drop":
  case "focusin":
  case "focusout":
  case "input":
  case "invalid":
  case "keydown":
  case "keypress":
  case "keyup":
  case "mousedown":
  case "mouseup":
  case "paste":
  case "pause":
  case "play":
  case "pointercancel":
  case "pointerdown":
  case "pointerup":
  case "ratechange":
  case "reset":
  case "resize":
  case "seeked":
  case "submit":
  case "touchcancel":
  case "touchend":
  case "touchstart":
  case "volumechange":
  case "change":
  case "selectionchange":
  case "textInput":
  case "compositionstart":
  case "compositionend":
  case "compositionupdate":
  case "beforeblur":
  case "afterblur":
  case "beforeinput":
  case "blur":
  case "fullscreenchange":
  case "focus":
  case "hashchange":
  case "popstate":
  case "select":
  case "selectstart":
      return 1;
  case "drag":
  case "dragenter":
  case "dragexit":
  case "dragleave":
  case "dragover":
  case "mousemove":
  case "mouseout":
  case "mouseover":
  case "pointermove":
  case "pointerout":
  case "pointerover":
  case "scroll":
  case "toggle":
  case "touchmove":
  case "wheel":
  case "mouseenter":
  case "mouseleave":
  case "pointerenter":
  case "pointerleave":
      return 4;
  case "message":
      switch (SS()) {
      case Dd:
          return 1;
      case My:
          return 4;
      case wa:
      case CS:
          return 16;
      case Dy:
          return 536870912;
      default:
          return 16
      }
  default:
      return 16
  }
}
var Wn = null
, zd = null
, ta = null;
function $y() {
  if (ta)
      return ta;
  var e, t = zd, n = t.length, r, i = "value"in Wn ? Wn.value : Wn.textContent, o = i.length;
  for (e = 0; e < n && t[e] === i[e]; e++)
      ;
  var s = n - e;
  for (r = 1; r <= s && t[n - r] === i[o - r]; r++)
      ;
  return ta = i.slice(e, 1 < r ? 1 - r : void 0)
}
function na(e) {
  var t = e.keyCode;
  return "charCode"in e ? (e = e.charCode,
  e === 0 && t === 13 && (e = 13)) : e = t,
  e === 10 && (e = 13),
  32 <= e || e === 13 ? e : 0
}
function Ds() {
  return !0
}
function Hh() {
  return !1
}
function ft(e) {
  function t(n, r, i, o, s) {
      this._reactName = n,
      this._targetInst = i,
      this.type = r,
      this.nativeEvent = o,
      this.target = s,
      this.currentTarget = null;
      for (var a in e)
          e.hasOwnProperty(a) && (n = e[a],
          this[a] = n ? n(o) : o[a]);
      return this.isDefaultPrevented = (o.defaultPrevented != null ? o.defaultPrevented : o.returnValue === !1) ? Ds : Hh,
      this.isPropagationStopped = Hh,
      this
  }
  return ye(t.prototype, {
      preventDefault: function() {
          this.defaultPrevented = !0;
          var n = this.nativeEvent;
          n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = !1),
          this.isDefaultPrevented = Ds)
      },
      stopPropagation: function() {
          var n = this.nativeEvent;
          n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0),
          this.isPropagationStopped = Ds)
      },
      persist: function() {},
      isPersistent: Ds
  }),
  t
}
var Wi = {
  eventPhase: 0,
  bubbles: 0,
  cancelable: 0,
  timeStamp: function(e) {
      return e.timeStamp || Date.now()
  },
  defaultPrevented: 0,
  isTrusted: 0
}, _d = ft(Wi), us = ye({}, Wi, {
  view: 0,
  detail: 0
}), OS = ft(us), Zl, Xl, so, il = ye({}, us, {
  screenX: 0,
  screenY: 0,
  clientX: 0,
  clientY: 0,
  pageX: 0,
  pageY: 0,
  ctrlKey: 0,
  shiftKey: 0,
  altKey: 0,
  metaKey: 0,
  getModifierState: Vd,
  button: 0,
  buttons: 0,
  relatedTarget: function(e) {
      return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget
  },
  movementX: function(e) {
      return "movementX"in e ? e.movementX : (e !== so && (so && e.type === "mousemove" ? (Zl = e.screenX - so.screenX,
      Xl = e.screenY - so.screenY) : Xl = Zl = 0,
      so = e),
      Zl)
  },
  movementY: function(e) {
      return "movementY"in e ? e.movementY : Xl
  }
}), Kh = ft(il), zS = ye({}, il, {
  dataTransfer: 0
}), _S = ft(zS), VS = ye({}, us, {
  relatedTarget: 0
}), Jl = ft(VS), FS = ye({}, Wi, {
  animationName: 0,
  elapsedTime: 0,
  pseudoElement: 0
}), BS = ft(FS), $S = ye({}, Wi, {
  clipboardData: function(e) {
      return "clipboardData"in e ? e.clipboardData : window.clipboardData
  }
}), US = ft($S), WS = ye({}, Wi, {
  data: 0
}), qh = ft(WS), HS = {
  Esc: "Escape",
  Spacebar: " ",
  Left: "ArrowLeft",
  Up: "ArrowUp",
  Right: "ArrowRight",
  Down: "ArrowDown",
  Del: "Delete",
  Win: "OS",
  Menu: "ContextMenu",
  Apps: "ContextMenu",
  Scroll: "ScrollLock",
  MozPrintableKey: "Unidentified"
}, KS = {
  8: "Backspace",
  9: "Tab",
  12: "Clear",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  19: "Pause",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  45: "Insert",
  46: "Delete",
  112: "F1",
  113: "F2",
  114: "F3",
  115: "F4",
  116: "F5",
  117: "F6",
  118: "F7",
  119: "F8",
  120: "F9",
  121: "F10",
  122: "F11",
  123: "F12",
  144: "NumLock",
  145: "ScrollLock",
  224: "Meta"
}, qS = {
  Alt: "altKey",
  Control: "ctrlKey",
  Meta: "metaKey",
  Shift: "shiftKey"
};
function GS(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = qS[e]) ? !!t[e] : !1
}
function Vd() {
  return GS
}
var QS = ye({}, us, {
  key: function(e) {
      if (e.key) {
          var t = HS[e.key] || e.key;
          if (t !== "Unidentified")
              return t
      }
      return e.type === "keypress" ? (e = na(e),
      e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? KS[e.keyCode] || "Unidentified" : ""
  },
  code: 0,
  location: 0,
  ctrlKey: 0,
  shiftKey: 0,
  altKey: 0,
  metaKey: 0,
  repeat: 0,
  locale: 0,
  getModifierState: Vd,
  charCode: function(e) {
      return e.type === "keypress" ? na(e) : 0
  },
  keyCode: function(e) {
      return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0
  },
  which: function(e) {
      return e.type === "keypress" ? na(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0
  }
})
, YS = ft(QS)
, ZS = ye({}, il, {
  pointerId: 0,
  width: 0,
  height: 0,
  pressure: 0,
  tangentialPressure: 0,
  tiltX: 0,
  tiltY: 0,
  twist: 0,
  pointerType: 0,
  isPrimary: 0
})
, Gh = ft(ZS)
, XS = ye({}, us, {
  touches: 0,
  targetTouches: 0,
  changedTouches: 0,
  altKey: 0,
  metaKey: 0,
  ctrlKey: 0,
  shiftKey: 0,
  getModifierState: Vd
})
, JS = ft(XS)
, eC = ye({}, Wi, {
  propertyName: 0,
  elapsedTime: 0,
  pseudoElement: 0
})
, tC = ft(eC)
, nC = ye({}, il, {
  deltaX: function(e) {
      return "deltaX"in e ? e.deltaX : "wheelDeltaX"in e ? -e.wheelDeltaX : 0
  },
  deltaY: function(e) {
      return "deltaY"in e ? e.deltaY : "wheelDeltaY"in e ? -e.wheelDeltaY : "wheelDelta"in e ? -e.wheelDelta : 0
  },
  deltaZ: 0,
  deltaMode: 0
})
, rC = ft(nC)
, iC = [9, 13, 27, 32]
, Fd = gn && "CompositionEvent"in window
, So = null;
gn && "documentMode"in document && (So = document.documentMode);
var oC = gn && "TextEvent"in window && !So
, Uy = gn && (!Fd || So && 8 < So && 11 >= So)
, Qh = " "
, Yh = !1;
function Wy(e, t) {
  switch (e) {
  case "keyup":
      return iC.indexOf(t.keyCode) !== -1;
  case "keydown":
      return t.keyCode !== 229;
  case "keypress":
  case "mousedown":
  case "focusout":
      return !0;
  default:
      return !1
  }
}
function Hy(e) {
  return e = e.detail,
  typeof e == "object" && "data"in e ? e.data : null
}
var Jr = !1;
function sC(e, t) {
  switch (e) {
  case "compositionend":
      return Hy(t);
  case "keypress":
      return t.which !== 32 ? null : (Yh = !0,
      Qh);
  case "textInput":
      return e = t.data,
      e === Qh && Yh ? null : e;
  default:
      return null
  }
}
function aC(e, t) {
  if (Jr)
      return e === "compositionend" || !Fd && Wy(e, t) ? (e = $y(),
      ta = zd = Wn = null,
      Jr = !1,
      e) : null;
  switch (e) {
  case "paste":
      return null;
  case "keypress":
      if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
          if (t.char && 1 < t.char.length)
              return t.char;
          if (t.which)
              return String.fromCharCode(t.which)
      }
      return null;
  case "compositionend":
      return Uy && t.locale !== "ko" ? null : t.data;
  default:
      return null
  }
}
var lC = {
  color: !0,
  date: !0,
  datetime: !0,
  "datetime-local": !0,
  email: !0,
  month: !0,
  number: !0,
  password: !0,
  range: !0,
  search: !0,
  tel: !0,
  text: !0,
  time: !0,
  url: !0,
  week: !0
};
function Zh(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === "input" ? !!lC[e.type] : t === "textarea"
}
function Ky(e, t, n, r) {
  Cy(r),
  t = ka(t, "onChange"),
  0 < t.length && (n = new _d("onChange","change",null,n,r),
  e.push({
      event: n,
      listeners: t
  }))
}
var Co = null
, Fo = null;
function cC(e) {
  rv(e, 0)
}
function ol(e) {
  var t = ni(e);
  if (gy(t))
      return e
}
function uC(e, t) {
  if (e === "change")
      return t
}
var qy = !1;
if (gn) {
  var ec;
  if (gn) {
      var tc = "oninput"in document;
      if (!tc) {
          var Xh = document.createElement("div");
          Xh.setAttribute("oninput", "return;"),
          tc = typeof Xh.oninput == "function"
      }
      ec = tc
  } else
      ec = !1;
  qy = ec && (!document.documentMode || 9 < document.documentMode)
}
function Jh() {
  Co && (Co.detachEvent("onpropertychange", Gy),
  Fo = Co = null)
}
function Gy(e) {
  if (e.propertyName === "value" && ol(Fo)) {
      var t = [];
      Ky(t, Fo, e, Md(e)),
      Ty(cC, t)
  }
}
function dC(e, t, n) {
  e === "focusin" ? (Jh(),
  Co = t,
  Fo = n,
  Co.attachEvent("onpropertychange", Gy)) : e === "focusout" && Jh()
}
function fC(e) {
  if (e === "selectionchange" || e === "keyup" || e === "keydown")
      return ol(Fo)
}
function hC(e, t) {
  if (e === "click")
      return ol(t)
}
function pC(e, t) {
  if (e === "input" || e === "change")
      return ol(t)
}
function mC(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t
}
var Vt = typeof Object.is == "function" ? Object.is : mC;
function Bo(e, t) {
  if (Vt(e, t))
      return !0;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null)
      return !1;
  var n = Object.keys(e)
    , r = Object.keys(t);
  if (n.length !== r.length)
      return !1;
  for (r = 0; r < n.length; r++) {
      var i = n[r];
      if (!Fc.call(t, i) || !Vt(e[i], t[i]))
          return !1
  }
  return !0
}
function ep(e) {
  for (; e && e.firstChild; )
      e = e.firstChild;
  return e
}
function tp(e, t) {
  var n = ep(e);
  e = 0;
  for (var r; n; ) {
      if (n.nodeType === 3) {
          if (r = e + n.textContent.length,
          e <= t && r >= t)
              return {
                  node: n,
                  offset: t - e
              };
          e = r
      }
      e: {
          for (; n; ) {
              if (n.nextSibling) {
                  n = n.nextSibling;
                  break e
              }
              n = n.parentNode
          }
          n = void 0
      }
      n = ep(n)
  }
}
function Qy(e, t) {
  return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Qy(e, t.parentNode) : "contains"in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1
}
function Yy() {
  for (var e = window, t = ya(); t instanceof e.HTMLIFrameElement; ) {
      try {
          var n = typeof t.contentWindow.location.href == "string"
      } catch {
          n = !1
      }
      if (n)
          e = t.contentWindow;
      else
          break;
      t = ya(e.document)
  }
  return t
}
function Bd(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true")
}
function gC(e) {
  var t = Yy()
    , n = e.focusedElem
    , r = e.selectionRange;
  if (t !== n && n && n.ownerDocument && Qy(n.ownerDocument.documentElement, n)) {
      if (r !== null && Bd(n)) {
          if (t = r.start,
          e = r.end,
          e === void 0 && (e = t),
          "selectionStart"in n)
              n.selectionStart = t,
              n.selectionEnd = Math.min(e, n.value.length);
          else if (e = (t = n.ownerDocument || document) && t.defaultView || window,
          e.getSelection) {
              e = e.getSelection();
              var i = n.textContent.length
                , o = Math.min(r.start, i);
              r = r.end === void 0 ? o : Math.min(r.end, i),
              !e.extend && o > r && (i = r,
              r = o,
              o = i),
              i = tp(n, o);
              var s = tp(n, r);
              i && s && (e.rangeCount !== 1 || e.anchorNode !== i.node || e.anchorOffset !== i.offset || e.focusNode !== s.node || e.focusOffset !== s.offset) && (t = t.createRange(),
              t.setStart(i.node, i.offset),
              e.removeAllRanges(),
              o > r ? (e.addRange(t),
              e.extend(s.node, s.offset)) : (t.setEnd(s.node, s.offset),
              e.addRange(t)))
          }
      }
      for (t = [],
      e = n; e = e.parentNode; )
          e.nodeType === 1 && t.push({
              element: e,
              left: e.scrollLeft,
              top: e.scrollTop
          });
      for (typeof n.focus == "function" && n.focus(),
      n = 0; n < t.length; n++)
          e = t[n],
          e.element.scrollLeft = e.left,
          e.element.scrollTop = e.top
  }
}
var yC = gn && "documentMode"in document && 11 >= document.documentMode
, ei = null
, ou = null
, ko = null
, su = !1;
function np(e, t, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  su || ei == null || ei !== ya(r) || (r = ei,
  "selectionStart"in r && Bd(r) ? r = {
      start: r.selectionStart,
      end: r.selectionEnd
  } : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(),
  r = {
      anchorNode: r.anchorNode,
      anchorOffset: r.anchorOffset,
      focusNode: r.focusNode,
      focusOffset: r.focusOffset
  }),
  ko && Bo(ko, r) || (ko = r,
  r = ka(ou, "onSelect"),
  0 < r.length && (t = new _d("onSelect","select",null,t,n),
  e.push({
      event: t,
      listeners: r
  }),
  t.target = ei)))
}
function Is(e, t) {
  var n = {};
  return n[e.toLowerCase()] = t.toLowerCase(),
  n["Webkit" + e] = "webkit" + t,
  n["Moz" + e] = "moz" + t,
  n
}
var ti = {
  animationend: Is("Animation", "AnimationEnd"),
  animationiteration: Is("Animation", "AnimationIteration"),
  animationstart: Is("Animation", "AnimationStart"),
  transitionend: Is("Transition", "TransitionEnd")
}
, nc = {}
, Zy = {};
gn && (Zy = document.createElement("div").style,
"AnimationEvent"in window || (delete ti.animationend.animation,
delete ti.animationiteration.animation,
delete ti.animationstart.animation),
"TransitionEvent"in window || delete ti.transitionend.transition);
function sl(e) {
  if (nc[e])
      return nc[e];
  if (!ti[e])
      return e;
  var t = ti[e], n;
  for (n in t)
      if (t.hasOwnProperty(n) && n in Zy)
          return nc[e] = t[n];
  return e
}
var Xy = sl("animationend")
, Jy = sl("animationiteration")
, ev = sl("animationstart")
, tv = sl("transitionend")
, nv = new Map
, rp = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
function ur(e, t) {
  nv.set(e, t),
  $r(t, [e])
}
for (var rc = 0; rc < rp.length; rc++) {
  var ic = rp[rc]
    , vC = ic.toLowerCase()
    , xC = ic[0].toUpperCase() + ic.slice(1);
  ur(vC, "on" + xC)
}
ur(Xy, "onAnimationEnd");
ur(Jy, "onAnimationIteration");
ur(ev, "onAnimationStart");
ur("dblclick", "onDoubleClick");
ur("focusin", "onFocus");
ur("focusout", "onBlur");
ur(tv, "onTransitionEnd");
ji("onMouseEnter", ["mouseout", "mouseover"]);
ji("onMouseLeave", ["mouseout", "mouseover"]);
ji("onPointerEnter", ["pointerout", "pointerover"]);
ji("onPointerLeave", ["pointerout", "pointerover"]);
$r("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
$r("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
$r("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
$r("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
$r("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
$r("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
var yo = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" ")
, wC = new Set("cancel close invalid load scroll toggle".split(" ").concat(yo));
function ip(e, t, n) {
  var r = e.type || "unknown-event";
  e.currentTarget = n,
  vS(r, t, void 0, e),
  e.currentTarget = null
}
function rv(e, t) {
  t = (t & 4) !== 0;
  for (var n = 0; n < e.length; n++) {
      var r = e[n]
        , i = r.event;
      r = r.listeners;
      e: {
          var o = void 0;
          if (t)
              for (var s = r.length - 1; 0 <= s; s--) {
                  var a = r[s]
                    , l = a.instance
                    , c = a.currentTarget;
                  if (a = a.listener,
                  l !== o && i.isPropagationStopped())
                      break e;
                  ip(i, a, c),
                  o = l
              }
          else
              for (s = 0; s < r.length; s++) {
                  if (a = r[s],
                  l = a.instance,
                  c = a.currentTarget,
                  a = a.listener,
                  l !== o && i.isPropagationStopped())
                      break e;
                  ip(i, a, c),
                  o = l
              }
      }
  }
  if (xa)
      throw e = tu,
      xa = !1,
      tu = null,
      e
}
function le(e, t) {
  var n = t[du];
  n === void 0 && (n = t[du] = new Set);
  var r = e + "__bubble";
  n.has(r) || (iv(t, e, 2, !1),
  n.add(r))
}
function oc(e, t, n) {
  var r = 0;
  t && (r |= 4),
  iv(n, e, r, t)
}
var Ls = "_reactListening" + Math.random().toString(36).slice(2);
function $o(e) {
  if (!e[Ls]) {
      e[Ls] = !0,
      dy.forEach(function(n) {
          n !== "selectionchange" && (wC.has(n) || oc(n, !1, e),
          oc(n, !0, e))
      });
      var t = e.nodeType === 9 ? e : e.ownerDocument;
      t === null || t[Ls] || (t[Ls] = !0,
      oc("selectionchange", !1, t))
  }
}
function iv(e, t, n, r) {
  switch (By(t)) {
  case 1:
      var i = IS;
      break;
  case 4:
      i = LS;
      break;
  default:
      i = Od
  }
  n = i.bind(null, t, n, e),
  i = void 0,
  !eu || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0),
  r ? i !== void 0 ? e.addEventListener(t, n, {
      capture: !0,
      passive: i
  }) : e.addEventListener(t, n, !0) : i !== void 0 ? e.addEventListener(t, n, {
      passive: i
  }) : e.addEventListener(t, n, !1)
}
function sc(e, t, n, r, i) {
  var o = r;
  if (!(t & 1) && !(t & 2) && r !== null)
      e: for (; ; ) {
          if (r === null)
              return;
          var s = r.tag;
          if (s === 3 || s === 4) {
              var a = r.stateNode.containerInfo;
              if (a === i || a.nodeType === 8 && a.parentNode === i)
                  break;
              if (s === 4)
                  for (s = r.return; s !== null; ) {
                      var l = s.tag;
                      if ((l === 3 || l === 4) && (l = s.stateNode.containerInfo,
                      l === i || l.nodeType === 8 && l.parentNode === i))
                          return;
                      s = s.return
                  }
              for (; a !== null; ) {
                  if (s = Sr(a),
                  s === null)
                      return;
                  if (l = s.tag,
                  l === 5 || l === 6) {
                      r = o = s;
                      continue e
                  }
                  a = a.parentNode
              }
          }
          r = r.return
      }
  Ty(function() {
      var c = o
        , u = Md(n)
        , d = [];
      e: {
          var f = nv.get(e);
          if (f !== void 0) {
              var p = _d
                , b = e;
              switch (e) {
              case "keypress":
                  if (na(n) === 0)
                      break e;
              case "keydown":
              case "keyup":
                  p = YS;
                  break;
              case "focusin":
                  b = "focus",
                  p = Jl;
                  break;
              case "focusout":
                  b = "blur",
                  p = Jl;
                  break;
              case "beforeblur":
              case "afterblur":
                  p = Jl;
                  break;
              case "click":
                  if (n.button === 2)
                      break e;
              case "auxclick":
              case "dblclick":
              case "mousedown":
              case "mousemove":
              case "mouseup":
              case "mouseout":
              case "mouseover":
              case "contextmenu":
                  p = Kh;
                  break;
              case "drag":
              case "dragend":
              case "dragenter":
              case "dragexit":
              case "dragleave":
              case "dragover":
              case "dragstart":
              case "drop":
                  p = _S;
                  break;
              case "touchcancel":
              case "touchend":
              case "touchmove":
              case "touchstart":
                  p = JS;
                  break;
              case Xy:
              case Jy:
              case ev:
                  p = BS;
                  break;
              case tv:
                  p = tC;
                  break;
              case "scroll":
                  p = OS;
                  break;
              case "wheel":
                  p = rC;
                  break;
              case "copy":
              case "cut":
              case "paste":
                  p = US;
                  break;
              case "gotpointercapture":
              case "lostpointercapture":
              case "pointercancel":
              case "pointerdown":
              case "pointermove":
              case "pointerout":
              case "pointerover":
              case "pointerup":
                  p = Gh
              }
              var y = (t & 4) !== 0
                , w = !y && e === "scroll"
                , m = y ? f !== null ? f + "Capture" : null : f;
              y = [];
              for (var g = c, v; g !== null; ) {
                  v = g;
                  var S = v.stateNode;
                  if (v.tag === 5 && S !== null && (v = S,
                  m !== null && (S = Oo(g, m),
                  S != null && y.push(Uo(g, S, v)))),
                  w)
                      break;
                  g = g.return
              }
              0 < y.length && (f = new p(f,b,null,n,u),
              d.push({
                  event: f,
                  listeners: y
              }))
          }
      }
      if (!(t & 7)) {
          e: {
              if (f = e === "mouseover" || e === "pointerover",
              p = e === "mouseout" || e === "pointerout",
              f && n !== Xc && (b = n.relatedTarget || n.fromElement) && (Sr(b) || b[yn]))
                  break e;
              if ((p || f) && (f = u.window === u ? u : (f = u.ownerDocument) ? f.defaultView || f.parentWindow : window,
              p ? (b = n.relatedTarget || n.toElement,
              p = c,
              b = b ? Sr(b) : null,
              b !== null && (w = Ur(b),
              b !== w || b.tag !== 5 && b.tag !== 6) && (b = null)) : (p = null,
              b = c),
              p !== b)) {
                  if (y = Kh,
                  S = "onMouseLeave",
                  m = "onMouseEnter",
                  g = "mouse",
                  (e === "pointerout" || e === "pointerover") && (y = Gh,
                  S = "onPointerLeave",
                  m = "onPointerEnter",
                  g = "pointer"),
                  w = p == null ? f : ni(p),
                  v = b == null ? f : ni(b),
                  f = new y(S,g + "leave",p,n,u),
                  f.target = w,
                  f.relatedTarget = v,
                  S = null,
                  Sr(u) === c && (y = new y(m,g + "enter",b,n,u),
                  y.target = v,
                  y.relatedTarget = w,
                  S = y),
                  w = S,
                  p && b)
                      t: {
                          for (y = p,
                          m = b,
                          g = 0,
                          v = y; v; v = Yr(v))
                              g++;
                          for (v = 0,
                          S = m; S; S = Yr(S))
                              v++;
                          for (; 0 < g - v; )
                              y = Yr(y),
                              g--;
                          for (; 0 < v - g; )
                              m = Yr(m),
                              v--;
                          for (; g--; ) {
                              if (y === m || m !== null && y === m.alternate)
                                  break t;
                              y = Yr(y),
                              m = Yr(m)
                          }
                          y = null
                      }
                  else
                      y = null;
                  p !== null && op(d, f, p, y, !1),
                  b !== null && w !== null && op(d, w, b, y, !0)
              }
          }
          e: {
              if (f = c ? ni(c) : window,
              p = f.nodeName && f.nodeName.toLowerCase(),
              p === "select" || p === "input" && f.type === "file")
                  var C = uC;
              else if (Zh(f))
                  if (qy)
                      C = pC;
                  else {
                      C = fC;
                      var k = dC
                  }
              else
                  (p = f.nodeName) && p.toLowerCase() === "input" && (f.type === "checkbox" || f.type === "radio") && (C = hC);
              if (C && (C = C(e, c))) {
                  Ky(d, C, n, u);
                  break e
              }
              k && k(e, f, c),
              e === "focusout" && (k = f._wrapperState) && k.controlled && f.type === "number" && qc(f, "number", f.value)
          }
          switch (k = c ? ni(c) : window,
          e) {
          case "focusin":
              (Zh(k) || k.contentEditable === "true") && (ei = k,
              ou = c,
              ko = null);
              break;
          case "focusout":
              ko = ou = ei = null;
              break;
          case "mousedown":
              su = !0;
              break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
              su = !1,
              np(d, n, u);
              break;
          case "selectionchange":
              if (yC)
                  break;
          case "keydown":
          case "keyup":
              np(d, n, u)
          }
          var E;
          if (Fd)
              e: {
                  switch (e) {
                  case "compositionstart":
                      var P = "onCompositionStart";
                      break e;
                  case "compositionend":
                      P = "onCompositionEnd";
                      break e;
                  case "compositionupdate":
                      P = "onCompositionUpdate";
                      break e
                  }
                  P = void 0
              }
          else
              Jr ? Wy(e, n) && (P = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (P = "onCompositionStart");
          P && (Uy && n.locale !== "ko" && (Jr || P !== "onCompositionStart" ? P === "onCompositionEnd" && Jr && (E = $y()) : (Wn = u,
          zd = "value"in Wn ? Wn.value : Wn.textContent,
          Jr = !0)),
          k = ka(c, P),
          0 < k.length && (P = new qh(P,e,null,n,u),
          d.push({
              event: P,
              listeners: k
          }),
          E ? P.data = E : (E = Hy(n),
          E !== null && (P.data = E)))),
          (E = oC ? sC(e, n) : aC(e, n)) && (c = ka(c, "onBeforeInput"),
          0 < c.length && (u = new qh("onBeforeInput","beforeinput",null,n,u),
          d.push({
              event: u,
              listeners: c
          }),
          u.data = E))
      }
      rv(d, t)
  })
}
function Uo(e, t, n) {
  return {
      instance: e,
      listener: t,
      currentTarget: n
  }
}
function ka(e, t) {
  for (var n = t + "Capture", r = []; e !== null; ) {
      var i = e
        , o = i.stateNode;
      i.tag === 5 && o !== null && (i = o,
      o = Oo(e, n),
      o != null && r.unshift(Uo(e, o, i)),
      o = Oo(e, t),
      o != null && r.push(Uo(e, o, i))),
      e = e.return
  }
  return r
}
function Yr(e) {
  if (e === null)
      return null;
  do
      e = e.return;
  while (e && e.tag !== 5);
  return e || null
}
function op(e, t, n, r, i) {
  for (var o = t._reactName, s = []; n !== null && n !== r; ) {
      var a = n
        , l = a.alternate
        , c = a.stateNode;
      if (l !== null && l === r)
          break;
      a.tag === 5 && c !== null && (a = c,
      i ? (l = Oo(n, o),
      l != null && s.unshift(Uo(n, l, a))) : i || (l = Oo(n, o),
      l != null && s.push(Uo(n, l, a)))),
      n = n.return
  }
  s.length !== 0 && e.push({
      event: t,
      listeners: s
  })
}
var bC = /\r\n?/g
, SC = /\u0000|\uFFFD/g;
function sp(e) {
  return (typeof e == "string" ? e : "" + e).replace(bC, `
`).replace(SC, "")
}
function Os(e, t, n) {
  if (t = sp(t),
  sp(e) !== t && n)
      throw Error(D(425))
}
function Ea() {}
var au = null
, lu = null;
function cu(e, t) {
  return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null
}
var uu = typeof setTimeout == "function" ? setTimeout : void 0
, CC = typeof clearTimeout == "function" ? clearTimeout : void 0
, ap = typeof Promise == "function" ? Promise : void 0
, kC = typeof queueMicrotask == "function" ? queueMicrotask : typeof ap < "u" ? function(e) {
  return ap.resolve(null).then(e).catch(EC)
}
: uu;
function EC(e) {
  setTimeout(function() {
      throw e
  })
}
function ac(e, t) {
  var n = t
    , r = 0;
  do {
      var i = n.nextSibling;
      if (e.removeChild(n),
      i && i.nodeType === 8)
          if (n = i.data,
          n === "/$") {
              if (r === 0) {
                  e.removeChild(i),
                  Vo(t);
                  return
              }
              r--
          } else
              n !== "$" && n !== "$?" && n !== "$!" || r++;
      n = i
  } while (n);
  Vo(t)
}
function Zn(e) {
  for (; e != null; e = e.nextSibling) {
      var t = e.nodeType;
      if (t === 1 || t === 3)
          break;
      if (t === 8) {
          if (t = e.data,
          t === "$" || t === "$!" || t === "$?")
              break;
          if (t === "/$")
              return null
      }
  }
  return e
}
function lp(e) {
  e = e.previousSibling;
  for (var t = 0; e; ) {
      if (e.nodeType === 8) {
          var n = e.data;
          if (n === "$" || n === "$!" || n === "$?") {
              if (t === 0)
                  return e;
              t--
          } else
              n === "/$" && t++
      }
      e = e.previousSibling
  }
  return null
}
var Hi = Math.random().toString(36).slice(2)
, Qt = "__reactFiber$" + Hi
, Wo = "__reactProps$" + Hi
, yn = "__reactContainer$" + Hi
, du = "__reactEvents$" + Hi
, PC = "__reactListeners$" + Hi
, TC = "__reactHandles$" + Hi;
function Sr(e) {
  var t = e[Qt];
  if (t)
      return t;
  for (var n = e.parentNode; n; ) {
      if (t = n[yn] || n[Qt]) {
          if (n = t.alternate,
          t.child !== null || n !== null && n.child !== null)
              for (e = lp(e); e !== null; ) {
                  if (n = e[Qt])
                      return n;
                  e = lp(e)
              }
          return t
      }
      e = n,
      n = e.parentNode
  }
  return null
}
function ds(e) {
  return e = e[Qt] || e[yn],
  !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e
}
function ni(e) {
  if (e.tag === 5 || e.tag === 6)
      return e.stateNode;
  throw Error(D(33))
}
function al(e) {
  return e[Wo] || null
}
var fu = []
, ri = -1;
function dr(e) {
  return {
      current: e
  }
}
function ce(e) {
  0 > ri || (e.current = fu[ri],
  fu[ri] = null,
  ri--)
}
function se(e, t) {
  ri++,
  fu[ri] = e.current,
  e.current = t
}
var ir = {}
, Be = dr(ir)
, et = dr(!1)
, Or = ir;
function Mi(e, t) {
  var n = e.type.contextTypes;
  if (!n)
      return ir;
  var r = e.stateNode;
  if (r && r.__reactInternalMemoizedUnmaskedChildContext === t)
      return r.__reactInternalMemoizedMaskedChildContext;
  var i = {}, o;
  for (o in n)
      i[o] = t[o];
  return r && (e = e.stateNode,
  e.__reactInternalMemoizedUnmaskedChildContext = t,
  e.__reactInternalMemoizedMaskedChildContext = i),
  i
}
function tt(e) {
  return e = e.childContextTypes,
  e != null
}
function Pa() {
  ce(et),
  ce(Be)
}
function cp(e, t, n) {
  if (Be.current !== ir)
      throw Error(D(168));
  se(Be, t),
  se(et, n)
}
function ov(e, t, n) {
  var r = e.stateNode;
  if (t = t.childContextTypes,
  typeof r.getChildContext != "function")
      return n;
  r = r.getChildContext();
  for (var i in r)
      if (!(i in t))
          throw Error(D(108, dS(e) || "Unknown", i));
  return ye({}, n, r)
}
function Ta(e) {
  return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || ir,
  Or = Be.current,
  se(Be, e),
  se(et, et.current),
  !0
}
function up(e, t, n) {
  var r = e.stateNode;
  if (!r)
      throw Error(D(169));
  n ? (e = ov(e, t, Or),
  r.__reactInternalMemoizedMergedChildContext = e,
  ce(et),
  ce(Be),
  se(Be, e)) : ce(et),
  se(et, n)
}
var un = null
, ll = !1
, lc = !1;
function sv(e) {
  un === null ? un = [e] : un.push(e)
}
function AC(e) {
  ll = !0,
  sv(e)
}
function fr() {
  if (!lc && un !== null) {
      lc = !0;
      var e = 0
        , t = re;
      try {
          var n = un;
          for (re = 1; e < n.length; e++) {
              var r = n[e];
              do
                  r = r(!0);
              while (r !== null)
          }
          un = null,
          ll = !1
      } catch (i) {
          throw un !== null && (un = un.slice(e + 1)),
          jy(Dd, fr),
          i
      } finally {
          re = t,
          lc = !1
      }
  }
  return null
}
var ii = []
, oi = 0
, Aa = null
, Na = 0
, gt = []
, yt = 0
, zr = null
, fn = 1
, hn = "";
function xr(e, t) {
  ii[oi++] = Na,
  ii[oi++] = Aa,
  Aa = e,
  Na = t
}
function av(e, t, n) {
  gt[yt++] = fn,
  gt[yt++] = hn,
  gt[yt++] = zr,
  zr = e;
  var r = fn;
  e = hn;
  var i = 32 - zt(r) - 1;
  r &= ~(1 << i),
  n += 1;
  var o = 32 - zt(t) + i;
  if (30 < o) {
      var s = i - i % 5;
      o = (r & (1 << s) - 1).toString(32),
      r >>= s,
      i -= s,
      fn = 1 << 32 - zt(t) + i | n << i | r,
      hn = o + e
  } else
      fn = 1 << o | n << i | r,
      hn = e
}
function $d(e) {
  e.return !== null && (xr(e, 1),
  av(e, 1, 0))
}
function Ud(e) {
  for (; e === Aa; )
      Aa = ii[--oi],
      ii[oi] = null,
      Na = ii[--oi],
      ii[oi] = null;
  for (; e === zr; )
      zr = gt[--yt],
      gt[yt] = null,
      hn = gt[--yt],
      gt[yt] = null,
      fn = gt[--yt],
      gt[yt] = null
}
var at = null
, st = null
, fe = !1
, Ot = null;
function lv(e, t) {
  var n = vt(5, null, null, 0);
  n.elementType = "DELETED",
  n.stateNode = t,
  n.return = e,
  t = e.deletions,
  t === null ? (e.deletions = [n],
  e.flags |= 16) : t.push(n)
}
function dp(e, t) {
  switch (e.tag) {
  case 5:
      var n = e.type;
      return t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t,
      t !== null ? (e.stateNode = t,
      at = e,
      st = Zn(t.firstChild),
      !0) : !1;
  case 6:
      return t = e.pendingProps === "" || t.nodeType !== 3 ? null : t,
      t !== null ? (e.stateNode = t,
      at = e,
      st = null,
      !0) : !1;
  case 13:
      return t = t.nodeType !== 8 ? null : t,
      t !== null ? (n = zr !== null ? {
          id: fn,
          overflow: hn
      } : null,
      e.memoizedState = {
          dehydrated: t,
          treeContext: n,
          retryLane: 1073741824
      },
      n = vt(18, null, null, 0),
      n.stateNode = t,
      n.return = e,
      e.child = n,
      at = e,
      st = null,
      !0) : !1;
  default:
      return !1
  }
}
function hu(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0
}
function pu(e) {
  if (fe) {
      var t = st;
      if (t) {
          var n = t;
          if (!dp(e, t)) {
              if (hu(e))
                  throw Error(D(418));
              t = Zn(n.nextSibling);
              var r = at;
              t && dp(e, t) ? lv(r, n) : (e.flags = e.flags & -4097 | 2,
              fe = !1,
              at = e)
          }
      } else {
          if (hu(e))
              throw Error(D(418));
          e.flags = e.flags & -4097 | 2,
          fe = !1,
          at = e
      }
  }
}
function fp(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; )
      e = e.return;
  at = e
}
function zs(e) {
  if (e !== at)
      return !1;
  if (!fe)
      return fp(e),
      fe = !0,
      !1;
  var t;
  if ((t = e.tag !== 3) && !(t = e.tag !== 5) && (t = e.type,
  t = t !== "head" && t !== "body" && !cu(e.type, e.memoizedProps)),
  t && (t = st)) {
      if (hu(e))
          throw cv(),
          Error(D(418));
      for (; t; )
          lv(e, t),
          t = Zn(t.nextSibling)
  }
  if (fp(e),
  e.tag === 13) {
      if (e = e.memoizedState,
      e = e !== null ? e.dehydrated : null,
      !e)
          throw Error(D(317));
      e: {
          for (e = e.nextSibling,
          t = 0; e; ) {
              if (e.nodeType === 8) {
                  var n = e.data;
                  if (n === "/$") {
                      if (t === 0) {
                          st = Zn(e.nextSibling);
                          break e
                      }
                      t--
                  } else
                      n !== "$" && n !== "$!" && n !== "$?" || t++
              }
              e = e.nextSibling
          }
          st = null
      }
  } else
      st = at ? Zn(e.stateNode.nextSibling) : null;
  return !0
}
function cv() {
  for (var e = st; e; )
      e = Zn(e.nextSibling)
}
function Di() {
  st = at = null,
  fe = !1
}
function Wd(e) {
  Ot === null ? Ot = [e] : Ot.push(e)
}
var NC = Cn.ReactCurrentBatchConfig;
function ao(e, t, n) {
  if (e = n.ref,
  e !== null && typeof e != "function" && typeof e != "object") {
      if (n._owner) {
          if (n = n._owner,
          n) {
              if (n.tag !== 1)
                  throw Error(D(309));
              var r = n.stateNode
          }
          if (!r)
              throw Error(D(147, e));
          var i = r
            , o = "" + e;
          return t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === o ? t.ref : (t = function(s) {
              var a = i.refs;
              s === null ? delete a[o] : a[o] = s
          }
          ,
          t._stringRef = o,
          t)
      }
      if (typeof e != "string")
          throw Error(D(284));
      if (!n._owner)
          throw Error(D(290, e))
  }
  return e
}
function _s(e, t) {
  throw e = Object.prototype.toString.call(t),
  Error(D(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e))
}
function hp(e) {
  var t = e._init;
  return t(e._payload)
}
function uv(e) {
  function t(m, g) {
      if (e) {
          var v = m.deletions;
          v === null ? (m.deletions = [g],
          m.flags |= 16) : v.push(g)
      }
  }
  function n(m, g) {
      if (!e)
          return null;
      for (; g !== null; )
          t(m, g),
          g = g.sibling;
      return null
  }
  function r(m, g) {
      for (m = new Map; g !== null; )
          g.key !== null ? m.set(g.key, g) : m.set(g.index, g),
          g = g.sibling;
      return m
  }
  function i(m, g) {
      return m = tr(m, g),
      m.index = 0,
      m.sibling = null,
      m
  }
  function o(m, g, v) {
      return m.index = v,
      e ? (v = m.alternate,
      v !== null ? (v = v.index,
      v < g ? (m.flags |= 2,
      g) : v) : (m.flags |= 2,
      g)) : (m.flags |= 1048576,
      g)
  }
  function s(m) {
      return e && m.alternate === null && (m.flags |= 2),
      m
  }
  function a(m, g, v, S) {
      return g === null || g.tag !== 6 ? (g = mc(v, m.mode, S),
      g.return = m,
      g) : (g = i(g, v),
      g.return = m,
      g)
  }
  function l(m, g, v, S) {
      var C = v.type;
      return C === Xr ? u(m, g, v.props.children, S, v.key) : g !== null && (g.elementType === C || typeof C == "object" && C !== null && C.$$typeof === Ln && hp(C) === g.type) ? (S = i(g, v.props),
      S.ref = ao(m, g, v),
      S.return = m,
      S) : (S = ca(v.type, v.key, v.props, null, m.mode, S),
      S.ref = ao(m, g, v),
      S.return = m,
      S)
  }
  function c(m, g, v, S) {
      return g === null || g.tag !== 4 || g.stateNode.containerInfo !== v.containerInfo || g.stateNode.implementation !== v.implementation ? (g = gc(v, m.mode, S),
      g.return = m,
      g) : (g = i(g, v.children || []),
      g.return = m,
      g)
  }
  function u(m, g, v, S, C) {
      return g === null || g.tag !== 7 ? (g = Ir(v, m.mode, S, C),
      g.return = m,
      g) : (g = i(g, v),
      g.return = m,
      g)
  }
  function d(m, g, v) {
      if (typeof g == "string" && g !== "" || typeof g == "number")
          return g = mc("" + g, m.mode, v),
          g.return = m,
          g;
      if (typeof g == "object" && g !== null) {
          switch (g.$$typeof) {
          case Ts:
              return v = ca(g.type, g.key, g.props, null, m.mode, v),
              v.ref = ao(m, null, g),
              v.return = m,
              v;
          case Zr:
              return g = gc(g, m.mode, v),
              g.return = m,
              g;
          case Ln:
              var S = g._init;
              return d(m, S(g._payload), v)
          }
          if (mo(g) || no(g))
              return g = Ir(g, m.mode, v, null),
              g.return = m,
              g;
          _s(m, g)
      }
      return null
  }
  function f(m, g, v, S) {
      var C = g !== null ? g.key : null;
      if (typeof v == "string" && v !== "" || typeof v == "number")
          return C !== null ? null : a(m, g, "" + v, S);
      if (typeof v == "object" && v !== null) {
          switch (v.$$typeof) {
          case Ts:
              return v.key === C ? l(m, g, v, S) : null;
          case Zr:
              return v.key === C ? c(m, g, v, S) : null;
          case Ln:
              return C = v._init,
              f(m, g, C(v._payload), S)
          }
          if (mo(v) || no(v))
              return C !== null ? null : u(m, g, v, S, null);
          _s(m, v)
      }
      return null
  }
  function p(m, g, v, S, C) {
      if (typeof S == "string" && S !== "" || typeof S == "number")
          return m = m.get(v) || null,
          a(g, m, "" + S, C);
      if (typeof S == "object" && S !== null) {
          switch (S.$$typeof) {
          case Ts:
              return m = m.get(S.key === null ? v : S.key) || null,
              l(g, m, S, C);
          case Zr:
              return m = m.get(S.key === null ? v : S.key) || null,
              c(g, m, S, C);
          case Ln:
              var k = S._init;
              return p(m, g, v, k(S._payload), C)
          }
          if (mo(S) || no(S))
              return m = m.get(v) || null,
              u(g, m, S, C, null);
          _s(g, S)
      }
      return null
  }
  function b(m, g, v, S) {
      for (var C = null, k = null, E = g, P = g = 0, j = null; E !== null && P < v.length; P++) {
          E.index > P ? (j = E,
          E = null) : j = E.sibling;
          var R = f(m, E, v[P], S);
          if (R === null) {
              E === null && (E = j);
              break
          }
          e && E && R.alternate === null && t(m, E),
          g = o(R, g, P),
          k === null ? C = R : k.sibling = R,
          k = R,
          E = j
      }
      if (P === v.length)
          return n(m, E),
          fe && xr(m, P),
          C;
      if (E === null) {
          for (; P < v.length; P++)
              E = d(m, v[P], S),
              E !== null && (g = o(E, g, P),
              k === null ? C = E : k.sibling = E,
              k = E);
          return fe && xr(m, P),
          C
      }
      for (E = r(m, E); P < v.length; P++)
          j = p(E, m, P, v[P], S),
          j !== null && (e && j.alternate !== null && E.delete(j.key === null ? P : j.key),
          g = o(j, g, P),
          k === null ? C = j : k.sibling = j,
          k = j);
      return e && E.forEach(function(z) {
          return t(m, z)
      }),
      fe && xr(m, P),
      C
  }
  function y(m, g, v, S) {
      var C = no(v);
      if (typeof C != "function")
          throw Error(D(150));
      if (v = C.call(v),
      v == null)
          throw Error(D(151));
      for (var k = C = null, E = g, P = g = 0, j = null, R = v.next(); E !== null && !R.done; P++,
      R = v.next()) {
          E.index > P ? (j = E,
          E = null) : j = E.sibling;
          var z = f(m, E, R.value, S);
          if (z === null) {
              E === null && (E = j);
              break
          }
          e && E && z.alternate === null && t(m, E),
          g = o(z, g, P),
          k === null ? C = z : k.sibling = z,
          k = z,
          E = j
      }
      if (R.done)
          return n(m, E),
          fe && xr(m, P),
          C;
      if (E === null) {
          for (; !R.done; P++,
          R = v.next())
              R = d(m, R.value, S),
              R !== null && (g = o(R, g, P),
              k === null ? C = R : k.sibling = R,
              k = R);
          return fe && xr(m, P),
          C
      }
      for (E = r(m, E); !R.done; P++,
      R = v.next())
          R = p(E, m, P, R.value, S),
          R !== null && (e && R.alternate !== null && E.delete(R.key === null ? P : R.key),
          g = o(R, g, P),
          k === null ? C = R : k.sibling = R,
          k = R);
      return e && E.forEach(function(L) {
          return t(m, L)
      }),
      fe && xr(m, P),
      C
  }
  function w(m, g, v, S) {
      if (typeof v == "object" && v !== null && v.type === Xr && v.key === null && (v = v.props.children),
      typeof v == "object" && v !== null) {
          switch (v.$$typeof) {
          case Ts:
              e: {
                  for (var C = v.key, k = g; k !== null; ) {
                      if (k.key === C) {
                          if (C = v.type,
                          C === Xr) {
                              if (k.tag === 7) {
                                  n(m, k.sibling),
                                  g = i(k, v.props.children),
                                  g.return = m,
                                  m = g;
                                  break e
                              }
                          } else if (k.elementType === C || typeof C == "object" && C !== null && C.$$typeof === Ln && hp(C) === k.type) {
                              n(m, k.sibling),
                              g = i(k, v.props),
                              g.ref = ao(m, k, v),
                              g.return = m,
                              m = g;
                              break e
                          }
                          n(m, k);
                          break
                      } else
                          t(m, k);
                      k = k.sibling
                  }
                  v.type === Xr ? (g = Ir(v.props.children, m.mode, S, v.key),
                  g.return = m,
                  m = g) : (S = ca(v.type, v.key, v.props, null, m.mode, S),
                  S.ref = ao(m, g, v),
                  S.return = m,
                  m = S)
              }
              return s(m);
          case Zr:
              e: {
                  for (k = v.key; g !== null; ) {
                      if (g.key === k)
                          if (g.tag === 4 && g.stateNode.containerInfo === v.containerInfo && g.stateNode.implementation === v.implementation) {
                              n(m, g.sibling),
                              g = i(g, v.children || []),
                              g.return = m,
                              m = g;
                              break e
                          } else {
                              n(m, g);
                              break
                          }
                      else
                          t(m, g);
                      g = g.sibling
                  }
                  g = gc(v, m.mode, S),
                  g.return = m,
                  m = g
              }
              return s(m);
          case Ln:
              return k = v._init,
              w(m, g, k(v._payload), S)
          }
          if (mo(v))
              return b(m, g, v, S);
          if (no(v))
              return y(m, g, v, S);
          _s(m, v)
      }
      return typeof v == "string" && v !== "" || typeof v == "number" ? (v = "" + v,
      g !== null && g.tag === 6 ? (n(m, g.sibling),
      g = i(g, v),
      g.return = m,
      m = g) : (n(m, g),
      g = mc(v, m.mode, S),
      g.return = m,
      m = g),
      s(m)) : n(m, g)
  }
  return w
}
var Ii = uv(!0)
, dv = uv(!1)
, Ra = dr(null)
, ja = null
, si = null
, Hd = null;
function Kd() {
  Hd = si = ja = null
}
function qd(e) {
  var t = Ra.current;
  ce(Ra),
  e._currentValue = t
}
function mu(e, t, n) {
  for (; e !== null; ) {
      var r = e.alternate;
      if ((e.childLanes & t) !== t ? (e.childLanes |= t,
      r !== null && (r.childLanes |= t)) : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t),
      e === n)
          break;
      e = e.return
  }
}
function yi(e, t) {
  ja = e,
  Hd = si = null,
  e = e.dependencies,
  e !== null && e.firstContext !== null && (e.lanes & t && (Je = !0),
  e.firstContext = null)
}
function St(e) {
  var t = e._currentValue;
  if (Hd !== e)
      if (e = {
          context: e,
          memoizedValue: t,
          next: null
      },
      si === null) {
          if (ja === null)
              throw Error(D(308));
          si = e,
          ja.dependencies = {
              lanes: 0,
              firstContext: e
          }
      } else
          si = si.next = e;
  return t
}
var Cr = null;
function Gd(e) {
  Cr === null ? Cr = [e] : Cr.push(e)
}
function fv(e, t, n, r) {
  var i = t.interleaved;
  return i === null ? (n.next = n,
  Gd(t)) : (n.next = i.next,
  i.next = n),
  t.interleaved = n,
  vn(e, r)
}
function vn(e, t) {
  e.lanes |= t;
  var n = e.alternate;
  for (n !== null && (n.lanes |= t),
  n = e,
  e = e.return; e !== null; )
      e.childLanes |= t,
      n = e.alternate,
      n !== null && (n.childLanes |= t),
      n = e,
      e = e.return;
  return n.tag === 3 ? n.stateNode : null
}
var On = !1;
function Qd(e) {
  e.updateQueue = {
      baseState: e.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: {
          pending: null,
          interleaved: null,
          lanes: 0
      },
      effects: null
  }
}
function hv(e, t) {
  e = e.updateQueue,
  t.updateQueue === e && (t.updateQueue = {
      baseState: e.baseState,
      firstBaseUpdate: e.firstBaseUpdate,
      lastBaseUpdate: e.lastBaseUpdate,
      shared: e.shared,
      effects: e.effects
  })
}
function mn(e, t) {
  return {
      eventTime: e,
      lane: t,
      tag: 0,
      payload: null,
      callback: null,
      next: null
  }
}
function Xn(e, t, n) {
  var r = e.updateQueue;
  if (r === null)
      return null;
  if (r = r.shared,
  J & 2) {
      var i = r.pending;
      return i === null ? t.next = t : (t.next = i.next,
      i.next = t),
      r.pending = t,
      vn(e, n)
  }
  return i = r.interleaved,
  i === null ? (t.next = t,
  Gd(r)) : (t.next = i.next,
  i.next = t),
  r.interleaved = t,
  vn(e, n)
}
function ra(e, t, n) {
  if (t = t.updateQueue,
  t !== null && (t = t.shared,
  (n & 4194240) !== 0)) {
      var r = t.lanes;
      r &= e.pendingLanes,
      n |= r,
      t.lanes = n,
      Id(e, n)
  }
}
function pp(e, t) {
  var n = e.updateQueue
    , r = e.alternate;
  if (r !== null && (r = r.updateQueue,
  n === r)) {
      var i = null
        , o = null;
      if (n = n.firstBaseUpdate,
      n !== null) {
          do {
              var s = {
                  eventTime: n.eventTime,
                  lane: n.lane,
                  tag: n.tag,
                  payload: n.payload,
                  callback: n.callback,
                  next: null
              };
              o === null ? i = o = s : o = o.next = s,
              n = n.next
          } while (n !== null);
          o === null ? i = o = t : o = o.next = t
      } else
          i = o = t;
      n = {
          baseState: r.baseState,
          firstBaseUpdate: i,
          lastBaseUpdate: o,
          shared: r.shared,
          effects: r.effects
      },
      e.updateQueue = n;
      return
  }
  e = n.lastBaseUpdate,
  e === null ? n.firstBaseUpdate = t : e.next = t,
  n.lastBaseUpdate = t
}
function Ma(e, t, n, r) {
  var i = e.updateQueue;
  On = !1;
  var o = i.firstBaseUpdate
    , s = i.lastBaseUpdate
    , a = i.shared.pending;
  if (a !== null) {
      i.shared.pending = null;
      var l = a
        , c = l.next;
      l.next = null,
      s === null ? o = c : s.next = c,
      s = l;
      var u = e.alternate;
      u !== null && (u = u.updateQueue,
      a = u.lastBaseUpdate,
      a !== s && (a === null ? u.firstBaseUpdate = c : a.next = c,
      u.lastBaseUpdate = l))
  }
  if (o !== null) {
      var d = i.baseState;
      s = 0,
      u = c = l = null,
      a = o;
      do {
          var f = a.lane
            , p = a.eventTime;
          if ((r & f) === f) {
              u !== null && (u = u.next = {
                  eventTime: p,
                  lane: 0,
                  tag: a.tag,
                  payload: a.payload,
                  callback: a.callback,
                  next: null
              });
              e: {
                  var b = e
                    , y = a;
                  switch (f = t,
                  p = n,
                  y.tag) {
                  case 1:
                      if (b = y.payload,
                      typeof b == "function") {
                          d = b.call(p, d, f);
                          break e
                      }
                      d = b;
                      break e;
                  case 3:
                      b.flags = b.flags & -65537 | 128;
                  case 0:
                      if (b = y.payload,
                      f = typeof b == "function" ? b.call(p, d, f) : b,
                      f == null)
                          break e;
                      d = ye({}, d, f);
                      break e;
                  case 2:
                      On = !0
                  }
              }
              a.callback !== null && a.lane !== 0 && (e.flags |= 64,
              f = i.effects,
              f === null ? i.effects = [a] : f.push(a))
          } else
              p = {
                  eventTime: p,
                  lane: f,
                  tag: a.tag,
                  payload: a.payload,
                  callback: a.callback,
                  next: null
              },
              u === null ? (c = u = p,
              l = d) : u = u.next = p,
              s |= f;
          if (a = a.next,
          a === null) {
              if (a = i.shared.pending,
              a === null)
                  break;
              f = a,
              a = f.next,
              f.next = null,
              i.lastBaseUpdate = f,
              i.shared.pending = null
          }
      } while (!0);
      if (u === null && (l = d),
      i.baseState = l,
      i.firstBaseUpdate = c,
      i.lastBaseUpdate = u,
      t = i.shared.interleaved,
      t !== null) {
          i = t;
          do
              s |= i.lane,
              i = i.next;
          while (i !== t)
      } else
          o === null && (i.shared.lanes = 0);
      Vr |= s,
      e.lanes = s,
      e.memoizedState = d
  }
}
function mp(e, t, n) {
  if (e = t.effects,
  t.effects = null,
  e !== null)
      for (t = 0; t < e.length; t++) {
          var r = e[t]
            , i = r.callback;
          if (i !== null) {
              if (r.callback = null,
              r = n,
              typeof i != "function")
                  throw Error(D(191, i));
              i.call(r)
          }
      }
}
var fs = {}
, Xt = dr(fs)
, Ho = dr(fs)
, Ko = dr(fs);
function kr(e) {
  if (e === fs)
      throw Error(D(174));
  return e
}
function Yd(e, t) {
  switch (se(Ko, t),
  se(Ho, e),
  se(Xt, fs),
  e = t.nodeType,
  e) {
  case 9:
  case 11:
      t = (t = t.documentElement) ? t.namespaceURI : Qc(null, "");
      break;
  default:
      e = e === 8 ? t.parentNode : t,
      t = e.namespaceURI || null,
      e = e.tagName,
      t = Qc(t, e)
  }
  ce(Xt),
  se(Xt, t)
}
function Li() {
  ce(Xt),
  ce(Ho),
  ce(Ko)
}
function pv(e) {
  kr(Ko.current);
  var t = kr(Xt.current)
    , n = Qc(t, e.type);
  t !== n && (se(Ho, e),
  se(Xt, n))
}
function Zd(e) {
  Ho.current === e && (ce(Xt),
  ce(Ho))
}
var pe = dr(0);
function Da(e) {
  for (var t = e; t !== null; ) {
      if (t.tag === 13) {
          var n = t.memoizedState;
          if (n !== null && (n = n.dehydrated,
          n === null || n.data === "$?" || n.data === "$!"))
              return t
      } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
          if (t.flags & 128)
              return t
      } else if (t.child !== null) {
          t.child.return = t,
          t = t.child;
          continue
      }
      if (t === e)
          break;
      for (; t.sibling === null; ) {
          if (t.return === null || t.return === e)
              return null;
          t = t.return
      }
      t.sibling.return = t.return,
      t = t.sibling
  }
  return null
}
var cc = [];
function Xd() {
  for (var e = 0; e < cc.length; e++)
      cc[e]._workInProgressVersionPrimary = null;
  cc.length = 0
}
var ia = Cn.ReactCurrentDispatcher
, uc = Cn.ReactCurrentBatchConfig
, _r = 0
, ge = null
, Pe = null
, Ae = null
, Ia = !1
, Eo = !1
, qo = 0
, RC = 0;
function Oe() {
  throw Error(D(321))
}
function Jd(e, t) {
  if (t === null)
      return !1;
  for (var n = 0; n < t.length && n < e.length; n++)
      if (!Vt(e[n], t[n]))
          return !1;
  return !0
}
function ef(e, t, n, r, i, o) {
  if (_r = o,
  ge = t,
  t.memoizedState = null,
  t.updateQueue = null,
  t.lanes = 0,
  ia.current = e === null || e.memoizedState === null ? IC : LC,
  e = n(r, i),
  Eo) {
      o = 0;
      do {
          if (Eo = !1,
          qo = 0,
          25 <= o)
              throw Error(D(301));
          o += 1,
          Ae = Pe = null,
          t.updateQueue = null,
          ia.current = OC,
          e = n(r, i)
      } while (Eo)
  }
  if (ia.current = La,
  t = Pe !== null && Pe.next !== null,
  _r = 0,
  Ae = Pe = ge = null,
  Ia = !1,
  t)
      throw Error(D(300));
  return e
}
function tf() {
  var e = qo !== 0;
  return qo = 0,
  e
}
function Ht() {
  var e = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null
  };
  return Ae === null ? ge.memoizedState = Ae = e : Ae = Ae.next = e,
  Ae
}
function Ct() {
  if (Pe === null) {
      var e = ge.alternate;
      e = e !== null ? e.memoizedState : null
  } else
      e = Pe.next;
  var t = Ae === null ? ge.memoizedState : Ae.next;
  if (t !== null)
      Ae = t,
      Pe = e;
  else {
      if (e === null)
          throw Error(D(310));
      Pe = e,
      e = {
          memoizedState: Pe.memoizedState,
          baseState: Pe.baseState,
          baseQueue: Pe.baseQueue,
          queue: Pe.queue,
          next: null
      },
      Ae === null ? ge.memoizedState = Ae = e : Ae = Ae.next = e
  }
  return Ae
}
function Go(e, t) {
  return typeof t == "function" ? t(e) : t
}
function dc(e) {
  var t = Ct()
    , n = t.queue;
  if (n === null)
      throw Error(D(311));
  n.lastRenderedReducer = e;
  var r = Pe
    , i = r.baseQueue
    , o = n.pending;
  if (o !== null) {
      if (i !== null) {
          var s = i.next;
          i.next = o.next,
          o.next = s
      }
      r.baseQueue = i = o,
      n.pending = null
  }
  if (i !== null) {
      o = i.next,
      r = r.baseState;
      var a = s = null
        , l = null
        , c = o;
      do {
          var u = c.lane;
          if ((_r & u) === u)
              l !== null && (l = l.next = {
                  lane: 0,
                  action: c.action,
                  hasEagerState: c.hasEagerState,
                  eagerState: c.eagerState,
                  next: null
              }),
              r = c.hasEagerState ? c.eagerState : e(r, c.action);
          else {
              var d = {
                  lane: u,
                  action: c.action,
                  hasEagerState: c.hasEagerState,
                  eagerState: c.eagerState,
                  next: null
              };
              l === null ? (a = l = d,
              s = r) : l = l.next = d,
              ge.lanes |= u,
              Vr |= u
          }
          c = c.next
      } while (c !== null && c !== o);
      l === null ? s = r : l.next = a,
      Vt(r, t.memoizedState) || (Je = !0),
      t.memoizedState = r,
      t.baseState = s,
      t.baseQueue = l,
      n.lastRenderedState = r
  }
  if (e = n.interleaved,
  e !== null) {
      i = e;
      do
          o = i.lane,
          ge.lanes |= o,
          Vr |= o,
          i = i.next;
      while (i !== e)
  } else
      i === null && (n.lanes = 0);
  return [t.memoizedState, n.dispatch]
}
function fc(e) {
  var t = Ct()
    , n = t.queue;
  if (n === null)
      throw Error(D(311));
  n.lastRenderedReducer = e;
  var r = n.dispatch
    , i = n.pending
    , o = t.memoizedState;
  if (i !== null) {
      n.pending = null;
      var s = i = i.next;
      do
          o = e(o, s.action),
          s = s.next;
      while (s !== i);
      Vt(o, t.memoizedState) || (Je = !0),
      t.memoizedState = o,
      t.baseQueue === null && (t.baseState = o),
      n.lastRenderedState = o
  }
  return [o, r]
}
function mv() {}
function gv(e, t) {
  var n = ge
    , r = Ct()
    , i = t()
    , o = !Vt(r.memoizedState, i);
  if (o && (r.memoizedState = i,
  Je = !0),
  r = r.queue,
  nf(xv.bind(null, n, r, e), [e]),
  r.getSnapshot !== t || o || Ae !== null && Ae.memoizedState.tag & 1) {
      if (n.flags |= 2048,
      Qo(9, vv.bind(null, n, r, i, t), void 0, null),
      Ne === null)
          throw Error(D(349));
      _r & 30 || yv(n, t, i)
  }
  return i
}
function yv(e, t, n) {
  e.flags |= 16384,
  e = {
      getSnapshot: t,
      value: n
  },
  t = ge.updateQueue,
  t === null ? (t = {
      lastEffect: null,
      stores: null
  },
  ge.updateQueue = t,
  t.stores = [e]) : (n = t.stores,
  n === null ? t.stores = [e] : n.push(e))
}
function vv(e, t, n, r) {
  t.value = n,
  t.getSnapshot = r,
  wv(t) && bv(e)
}
function xv(e, t, n) {
  return n(function() {
      wv(t) && bv(e)
  })
}
function wv(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
      var n = t();
      return !Vt(e, n)
  } catch {
      return !0
  }
}
function bv(e) {
  var t = vn(e, 1);
  t !== null && _t(t, e, 1, -1)
}
function gp(e) {
  var t = Ht();
  return typeof e == "function" && (e = e()),
  t.memoizedState = t.baseState = e,
  e = {
      pending: null,
      interleaved: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: Go,
      lastRenderedState: e
  },
  t.queue = e,
  e = e.dispatch = DC.bind(null, ge, e),
  [t.memoizedState, e]
}
function Qo(e, t, n, r) {
  return e = {
      tag: e,
      create: t,
      destroy: n,
      deps: r,
      next: null
  },
  t = ge.updateQueue,
  t === null ? (t = {
      lastEffect: null,
      stores: null
  },
  ge.updateQueue = t,
  t.lastEffect = e.next = e) : (n = t.lastEffect,
  n === null ? t.lastEffect = e.next = e : (r = n.next,
  n.next = e,
  e.next = r,
  t.lastEffect = e)),
  e
}
function Sv() {
  return Ct().memoizedState
}
function oa(e, t, n, r) {
  var i = Ht();
  ge.flags |= e,
  i.memoizedState = Qo(1 | t, n, void 0, r === void 0 ? null : r)
}
function cl(e, t, n, r) {
  var i = Ct();
  r = r === void 0 ? null : r;
  var o = void 0;
  if (Pe !== null) {
      var s = Pe.memoizedState;
      if (o = s.destroy,
      r !== null && Jd(r, s.deps)) {
          i.memoizedState = Qo(t, n, o, r);
          return
      }
  }
  ge.flags |= e,
  i.memoizedState = Qo(1 | t, n, o, r)
}
function yp(e, t) {
  return oa(8390656, 8, e, t)
}
function nf(e, t) {
  return cl(2048, 8, e, t)
}
function Cv(e, t) {
  return cl(4, 2, e, t)
}
function kv(e, t) {
  return cl(4, 4, e, t)
}
function Ev(e, t) {
  if (typeof t == "function")
      return e = e(),
      t(e),
      function() {
          t(null)
      }
      ;
  if (t != null)
      return e = e(),
      t.current = e,
      function() {
          t.current = null
      }
}
function Pv(e, t, n) {
  return n = n != null ? n.concat([e]) : null,
  cl(4, 4, Ev.bind(null, t, e), n)
}
function rf() {}
function Tv(e, t) {
  var n = Ct();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && Jd(t, r[1]) ? r[0] : (n.memoizedState = [e, t],
  e)
}
function Av(e, t) {
  var n = Ct();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && Jd(t, r[1]) ? r[0] : (e = e(),
  n.memoizedState = [e, t],
  e)
}
function Nv(e, t, n) {
  return _r & 21 ? (Vt(n, t) || (n = Iy(),
  ge.lanes |= n,
  Vr |= n,
  e.baseState = !0),
  t) : (e.baseState && (e.baseState = !1,
  Je = !0),
  e.memoizedState = n)
}
function jC(e, t) {
  var n = re;
  re = n !== 0 && 4 > n ? n : 4,
  e(!0);
  var r = uc.transition;
  uc.transition = {};
  try {
      e(!1),
      t()
  } finally {
      re = n,
      uc.transition = r
  }
}
function Rv() {
  return Ct().memoizedState
}
function MC(e, t, n) {
  var r = er(e);
  if (n = {
      lane: r,
      action: n,
      hasEagerState: !1,
      eagerState: null,
      next: null
  },
  jv(e))
      Mv(t, n);
  else if (n = fv(e, t, n, r),
  n !== null) {
      var i = Ge();
      _t(n, e, r, i),
      Dv(n, t, r)
  }
}
function DC(e, t, n) {
  var r = er(e)
    , i = {
      lane: r,
      action: n,
      hasEagerState: !1,
      eagerState: null,
      next: null
  };
  if (jv(e))
      Mv(t, i);
  else {
      var o = e.alternate;
      if (e.lanes === 0 && (o === null || o.lanes === 0) && (o = t.lastRenderedReducer,
      o !== null))
          try {
              var s = t.lastRenderedState
                , a = o(s, n);
              if (i.hasEagerState = !0,
              i.eagerState = a,
              Vt(a, s)) {
                  var l = t.interleaved;
                  l === null ? (i.next = i,
                  Gd(t)) : (i.next = l.next,
                  l.next = i),
                  t.interleaved = i;
                  return
              }
          } catch {} finally {}
      n = fv(e, t, i, r),
      n !== null && (i = Ge(),
      _t(n, e, r, i),
      Dv(n, t, r))
  }
}
function jv(e) {
  var t = e.alternate;
  return e === ge || t !== null && t === ge
}
function Mv(e, t) {
  Eo = Ia = !0;
  var n = e.pending;
  n === null ? t.next = t : (t.next = n.next,
  n.next = t),
  e.pending = t
}
function Dv(e, t, n) {
  if (n & 4194240) {
      var r = t.lanes;
      r &= e.pendingLanes,
      n |= r,
      t.lanes = n,
      Id(e, n)
  }
}
var La = {
  readContext: St,
  useCallback: Oe,
  useContext: Oe,
  useEffect: Oe,
  useImperativeHandle: Oe,
  useInsertionEffect: Oe,
  useLayoutEffect: Oe,
  useMemo: Oe,
  useReducer: Oe,
  useRef: Oe,
  useState: Oe,
  useDebugValue: Oe,
  useDeferredValue: Oe,
  useTransition: Oe,
  useMutableSource: Oe,
  useSyncExternalStore: Oe,
  useId: Oe,
  unstable_isNewReconciler: !1
}
, IC = {
  readContext: St,
  useCallback: function(e, t) {
      return Ht().memoizedState = [e, t === void 0 ? null : t],
      e
  },
  useContext: St,
  useEffect: yp,
  useImperativeHandle: function(e, t, n) {
      return n = n != null ? n.concat([e]) : null,
      oa(4194308, 4, Ev.bind(null, t, e), n)
  },
  useLayoutEffect: function(e, t) {
      return oa(4194308, 4, e, t)
  },
  useInsertionEffect: function(e, t) {
      return oa(4, 2, e, t)
  },
  useMemo: function(e, t) {
      var n = Ht();
      return t = t === void 0 ? null : t,
      e = e(),
      n.memoizedState = [e, t],
      e
  },
  useReducer: function(e, t, n) {
      var r = Ht();
      return t = n !== void 0 ? n(t) : t,
      r.memoizedState = r.baseState = t,
      e = {
          pending: null,
          interleaved: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: e,
          lastRenderedState: t
      },
      r.queue = e,
      e = e.dispatch = MC.bind(null, ge, e),
      [r.memoizedState, e]
  },
  useRef: function(e) {
      var t = Ht();
      return e = {
          current: e
      },
      t.memoizedState = e
  },
  useState: gp,
  useDebugValue: rf,
  useDeferredValue: function(e) {
      return Ht().memoizedState = e
  },
  useTransition: function() {
      var e = gp(!1)
        , t = e[0];
      return e = jC.bind(null, e[1]),
      Ht().memoizedState = e,
      [t, e]
  },
  useMutableSource: function() {},
  useSyncExternalStore: function(e, t, n) {
      var r = ge
        , i = Ht();
      if (fe) {
          if (n === void 0)
              throw Error(D(407));
          n = n()
      } else {
          if (n = t(),
          Ne === null)
              throw Error(D(349));
          _r & 30 || yv(r, t, n)
      }
      i.memoizedState = n;
      var o = {
          value: n,
          getSnapshot: t
      };
      return i.queue = o,
      yp(xv.bind(null, r, o, e), [e]),
      r.flags |= 2048,
      Qo(9, vv.bind(null, r, o, n, t), void 0, null),
      n
  },
  useId: function() {
      var e = Ht()
        , t = Ne.identifierPrefix;
      if (fe) {
          var n = hn
            , r = fn;
          n = (r & ~(1 << 32 - zt(r) - 1)).toString(32) + n,
          t = ":" + t + "R" + n,
          n = qo++,
          0 < n && (t += "H" + n.toString(32)),
          t += ":"
      } else
          n = RC++,
          t = ":" + t + "r" + n.toString(32) + ":";
      return e.memoizedState = t
  },
  unstable_isNewReconciler: !1
}
, LC = {
  readContext: St,
  useCallback: Tv,
  useContext: St,
  useEffect: nf,
  useImperativeHandle: Pv,
  useInsertionEffect: Cv,
  useLayoutEffect: kv,
  useMemo: Av,
  useReducer: dc,
  useRef: Sv,
  useState: function() {
      return dc(Go)
  },
  useDebugValue: rf,
  useDeferredValue: function(e) {
      var t = Ct();
      return Nv(t, Pe.memoizedState, e)
  },
  useTransition: function() {
      var e = dc(Go)[0]
        , t = Ct().memoizedState;
      return [e, t]
  },
  useMutableSource: mv,
  useSyncExternalStore: gv,
  useId: Rv,
  unstable_isNewReconciler: !1
}
, OC = {
  readContext: St,
  useCallback: Tv,
  useContext: St,
  useEffect: nf,
  useImperativeHandle: Pv,
  useInsertionEffect: Cv,
  useLayoutEffect: kv,
  useMemo: Av,
  useReducer: fc,
  useRef: Sv,
  useState: function() {
      return fc(Go)
  },
  useDebugValue: rf,
  useDeferredValue: function(e) {
      var t = Ct();
      return Pe === null ? t.memoizedState = e : Nv(t, Pe.memoizedState, e)
  },
  useTransition: function() {
      var e = fc(Go)[0]
        , t = Ct().memoizedState;
      return [e, t]
  },
  useMutableSource: mv,
  useSyncExternalStore: gv,
  useId: Rv,
  unstable_isNewReconciler: !1
};
function jt(e, t) {
  if (e && e.defaultProps) {
      t = ye({}, t),
      e = e.defaultProps;
      for (var n in e)
          t[n] === void 0 && (t[n] = e[n]);
      return t
  }
  return t
}
function gu(e, t, n, r) {
  t = e.memoizedState,
  n = n(r, t),
  n = n == null ? t : ye({}, t, n),
  e.memoizedState = n,
  e.lanes === 0 && (e.updateQueue.baseState = n)
}
var ul = {
  isMounted: function(e) {
      return (e = e._reactInternals) ? Ur(e) === e : !1
  },
  enqueueSetState: function(e, t, n) {
      e = e._reactInternals;
      var r = Ge()
        , i = er(e)
        , o = mn(r, i);
      o.payload = t,
      n != null && (o.callback = n),
      t = Xn(e, o, i),
      t !== null && (_t(t, e, i, r),
      ra(t, e, i))
  },
  enqueueReplaceState: function(e, t, n) {
      e = e._reactInternals;
      var r = Ge()
        , i = er(e)
        , o = mn(r, i);
      o.tag = 1,
      o.payload = t,
      n != null && (o.callback = n),
      t = Xn(e, o, i),
      t !== null && (_t(t, e, i, r),
      ra(t, e, i))
  },
  enqueueForceUpdate: function(e, t) {
      e = e._reactInternals;
      var n = Ge()
        , r = er(e)
        , i = mn(n, r);
      i.tag = 2,
      t != null && (i.callback = t),
      t = Xn(e, i, r),
      t !== null && (_t(t, e, r, n),
      ra(t, e, r))
  }
};
function vp(e, t, n, r, i, o, s) {
  return e = e.stateNode,
  typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, o, s) : t.prototype && t.prototype.isPureReactComponent ? !Bo(n, r) || !Bo(i, o) : !0
}
function Iv(e, t, n) {
  var r = !1
    , i = ir
    , o = t.contextType;
  return typeof o == "object" && o !== null ? o = St(o) : (i = tt(t) ? Or : Be.current,
  r = t.contextTypes,
  o = (r = r != null) ? Mi(e, i) : ir),
  t = new t(n,o),
  e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null,
  t.updater = ul,
  e.stateNode = t,
  t._reactInternals = e,
  r && (e = e.stateNode,
  e.__reactInternalMemoizedUnmaskedChildContext = i,
  e.__reactInternalMemoizedMaskedChildContext = o),
  t
}
function xp(e, t, n, r) {
  e = t.state,
  typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r),
  typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r),
  t.state !== e && ul.enqueueReplaceState(t, t.state, null)
}
function yu(e, t, n, r) {
  var i = e.stateNode;
  i.props = n,
  i.state = e.memoizedState,
  i.refs = {},
  Qd(e);
  var o = t.contextType;
  typeof o == "object" && o !== null ? i.context = St(o) : (o = tt(t) ? Or : Be.current,
  i.context = Mi(e, o)),
  i.state = e.memoizedState,
  o = t.getDerivedStateFromProps,
  typeof o == "function" && (gu(e, t, o, n),
  i.state = e.memoizedState),
  typeof t.getDerivedStateFromProps == "function" || typeof i.getSnapshotBeforeUpdate == "function" || typeof i.UNSAFE_componentWillMount != "function" && typeof i.componentWillMount != "function" || (t = i.state,
  typeof i.componentWillMount == "function" && i.componentWillMount(),
  typeof i.UNSAFE_componentWillMount == "function" && i.UNSAFE_componentWillMount(),
  t !== i.state && ul.enqueueReplaceState(i, i.state, null),
  Ma(e, n, i, r),
  i.state = e.memoizedState),
  typeof i.componentDidMount == "function" && (e.flags |= 4194308)
}
function Oi(e, t) {
  try {
      var n = ""
        , r = t;
      do
          n += uS(r),
          r = r.return;
      while (r);
      var i = n
  } catch (o) {
      i = `
Error generating stack: ` + o.message + `
` + o.stack
  }
  return {
      value: e,
      source: t,
      stack: i,
      digest: null
  }
}
function hc(e, t, n) {
  return {
      value: e,
      source: null,
      stack: n ?? null,
      digest: t ?? null
  }
}
function vu(e, t) {
  try {
      console.error(t.value)
  } catch (n) {
      setTimeout(function() {
          throw n
      })
  }
}
var zC = typeof WeakMap == "function" ? WeakMap : Map;
function Lv(e, t, n) {
  n = mn(-1, n),
  n.tag = 3,
  n.payload = {
      element: null
  };
  var r = t.value;
  return n.callback = function() {
      za || (za = !0,
      Au = r),
      vu(e, t)
  }
  ,
  n
}
function Ov(e, t, n) {
  n = mn(-1, n),
  n.tag = 3;
  var r = e.type.getDerivedStateFromError;
  if (typeof r == "function") {
      var i = t.value;
      n.payload = function() {
          return r(i)
      }
      ,
      n.callback = function() {
          vu(e, t)
      }
  }
  var o = e.stateNode;
  return o !== null && typeof o.componentDidCatch == "function" && (n.callback = function() {
      vu(e, t),
      typeof r != "function" && (Jn === null ? Jn = new Set([this]) : Jn.add(this));
      var s = t.stack;
      this.componentDidCatch(t.value, {
          componentStack: s !== null ? s : ""
      })
  }
  ),
  n
}
function wp(e, t, n) {
  var r = e.pingCache;
  if (r === null) {
      r = e.pingCache = new zC;
      var i = new Set;
      r.set(t, i)
  } else
      i = r.get(t),
      i === void 0 && (i = new Set,
      r.set(t, i));
  i.has(n) || (i.add(n),
  e = ZC.bind(null, e, t, n),
  t.then(e, e))
}
function bp(e) {
  do {
      var t;
      if ((t = e.tag === 13) && (t = e.memoizedState,
      t = t !== null ? t.dehydrated !== null : !0),
      t)
          return e;
      e = e.return
  } while (e !== null);
  return null
}
function Sp(e, t, n, r, i) {
  return e.mode & 1 ? (e.flags |= 65536,
  e.lanes = i,
  e) : (e === t ? e.flags |= 65536 : (e.flags |= 128,
  n.flags |= 131072,
  n.flags &= -52805,
  n.tag === 1 && (n.alternate === null ? n.tag = 17 : (t = mn(-1, 1),
  t.tag = 2,
  Xn(n, t, 1))),
  n.lanes |= 1),
  e)
}
var _C = Cn.ReactCurrentOwner
, Je = !1;
function We(e, t, n, r) {
  t.child = e === null ? dv(t, null, n, r) : Ii(t, e.child, n, r)
}
function Cp(e, t, n, r, i) {
  n = n.render;
  var o = t.ref;
  return yi(t, i),
  r = ef(e, t, n, r, o, i),
  n = tf(),
  e !== null && !Je ? (t.updateQueue = e.updateQueue,
  t.flags &= -2053,
  e.lanes &= ~i,
  xn(e, t, i)) : (fe && n && $d(t),
  t.flags |= 1,
  We(e, t, r, i),
  t.child)
}
function kp(e, t, n, r, i) {
  if (e === null) {
      var o = n.type;
      return typeof o == "function" && !ff(o) && o.defaultProps === void 0 && n.compare === null && n.defaultProps === void 0 ? (t.tag = 15,
      t.type = o,
      zv(e, t, o, r, i)) : (e = ca(n.type, null, r, t, t.mode, i),
      e.ref = t.ref,
      e.return = t,
      t.child = e)
  }
  if (o = e.child,
  !(e.lanes & i)) {
      var s = o.memoizedProps;
      if (n = n.compare,
      n = n !== null ? n : Bo,
      n(s, r) && e.ref === t.ref)
          return xn(e, t, i)
  }
  return t.flags |= 1,
  e = tr(o, r),
  e.ref = t.ref,
  e.return = t,
  t.child = e
}
function zv(e, t, n, r, i) {
  if (e !== null) {
      var o = e.memoizedProps;
      if (Bo(o, r) && e.ref === t.ref)
          if (Je = !1,
          t.pendingProps = r = o,
          (e.lanes & i) !== 0)
              e.flags & 131072 && (Je = !0);
          else
              return t.lanes = e.lanes,
              xn(e, t, i)
  }
  return xu(e, t, n, r, i)
}
function _v(e, t, n) {
  var r = t.pendingProps
    , i = r.children
    , o = e !== null ? e.memoizedState : null;
  if (r.mode === "hidden")
      if (!(t.mode & 1))
          t.memoizedState = {
              baseLanes: 0,
              cachePool: null,
              transitions: null
          },
          se(li, it),
          it |= n;
      else {
          if (!(n & 1073741824))
              return e = o !== null ? o.baseLanes | n : n,
              t.lanes = t.childLanes = 1073741824,
              t.memoizedState = {
                  baseLanes: e,
                  cachePool: null,
                  transitions: null
              },
              t.updateQueue = null,
              se(li, it),
              it |= e,
              null;
          t.memoizedState = {
              baseLanes: 0,
              cachePool: null,
              transitions: null
          },
          r = o !== null ? o.baseLanes : n,
          se(li, it),
          it |= r
      }
  else
      o !== null ? (r = o.baseLanes | n,
      t.memoizedState = null) : r = n,
      se(li, it),
      it |= r;
  return We(e, t, i, n),
  t.child
}
function Vv(e, t) {
  var n = t.ref;
  (e === null && n !== null || e !== null && e.ref !== n) && (t.flags |= 512,
  t.flags |= 2097152)
}
function xu(e, t, n, r, i) {
  var o = tt(n) ? Or : Be.current;
  return o = Mi(t, o),
  yi(t, i),
  n = ef(e, t, n, r, o, i),
  r = tf(),
  e !== null && !Je ? (t.updateQueue = e.updateQueue,
  t.flags &= -2053,
  e.lanes &= ~i,
  xn(e, t, i)) : (fe && r && $d(t),
  t.flags |= 1,
  We(e, t, n, i),
  t.child)
}
function Ep(e, t, n, r, i) {
  if (tt(n)) {
      var o = !0;
      Ta(t)
  } else
      o = !1;
  if (yi(t, i),
  t.stateNode === null)
      sa(e, t),
      Iv(t, n, r),
      yu(t, n, r, i),
      r = !0;
  else if (e === null) {
      var s = t.stateNode
        , a = t.memoizedProps;
      s.props = a;
      var l = s.context
        , c = n.contextType;
      typeof c == "object" && c !== null ? c = St(c) : (c = tt(n) ? Or : Be.current,
      c = Mi(t, c));
      var u = n.getDerivedStateFromProps
        , d = typeof u == "function" || typeof s.getSnapshotBeforeUpdate == "function";
      d || typeof s.UNSAFE_componentWillReceiveProps != "function" && typeof s.componentWillReceiveProps != "function" || (a !== r || l !== c) && xp(t, s, r, c),
      On = !1;
      var f = t.memoizedState;
      s.state = f,
      Ma(t, r, s, i),
      l = t.memoizedState,
      a !== r || f !== l || et.current || On ? (typeof u == "function" && (gu(t, n, u, r),
      l = t.memoizedState),
      (a = On || vp(t, n, a, r, f, l, c)) ? (d || typeof s.UNSAFE_componentWillMount != "function" && typeof s.componentWillMount != "function" || (typeof s.componentWillMount == "function" && s.componentWillMount(),
      typeof s.UNSAFE_componentWillMount == "function" && s.UNSAFE_componentWillMount()),
      typeof s.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof s.componentDidMount == "function" && (t.flags |= 4194308),
      t.memoizedProps = r,
      t.memoizedState = l),
      s.props = r,
      s.state = l,
      s.context = c,
      r = a) : (typeof s.componentDidMount == "function" && (t.flags |= 4194308),
      r = !1)
  } else {
      s = t.stateNode,
      hv(e, t),
      a = t.memoizedProps,
      c = t.type === t.elementType ? a : jt(t.type, a),
      s.props = c,
      d = t.pendingProps,
      f = s.context,
      l = n.contextType,
      typeof l == "object" && l !== null ? l = St(l) : (l = tt(n) ? Or : Be.current,
      l = Mi(t, l));
      var p = n.getDerivedStateFromProps;
      (u = typeof p == "function" || typeof s.getSnapshotBeforeUpdate == "function") || typeof s.UNSAFE_componentWillReceiveProps != "function" && typeof s.componentWillReceiveProps != "function" || (a !== d || f !== l) && xp(t, s, r, l),
      On = !1,
      f = t.memoizedState,
      s.state = f,
      Ma(t, r, s, i);
      var b = t.memoizedState;
      a !== d || f !== b || et.current || On ? (typeof p == "function" && (gu(t, n, p, r),
      b = t.memoizedState),
      (c = On || vp(t, n, c, r, f, b, l) || !1) ? (u || typeof s.UNSAFE_componentWillUpdate != "function" && typeof s.componentWillUpdate != "function" || (typeof s.componentWillUpdate == "function" && s.componentWillUpdate(r, b, l),
      typeof s.UNSAFE_componentWillUpdate == "function" && s.UNSAFE_componentWillUpdate(r, b, l)),
      typeof s.componentDidUpdate == "function" && (t.flags |= 4),
      typeof s.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof s.componentDidUpdate != "function" || a === e.memoizedProps && f === e.memoizedState || (t.flags |= 4),
      typeof s.getSnapshotBeforeUpdate != "function" || a === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024),
      t.memoizedProps = r,
      t.memoizedState = b),
      s.props = r,
      s.state = b,
      s.context = l,
      r = c) : (typeof s.componentDidUpdate != "function" || a === e.memoizedProps && f === e.memoizedState || (t.flags |= 4),
      typeof s.getSnapshotBeforeUpdate != "function" || a === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024),
      r = !1)
  }
  return wu(e, t, n, r, o, i)
}
function wu(e, t, n, r, i, o) {
  Vv(e, t);
  var s = (t.flags & 128) !== 0;
  if (!r && !s)
      return i && up(t, n, !1),
      xn(e, t, o);
  r = t.stateNode,
  _C.current = t;
  var a = s && typeof n.getDerivedStateFromError != "function" ? null : r.render();
  return t.flags |= 1,
  e !== null && s ? (t.child = Ii(t, e.child, null, o),
  t.child = Ii(t, null, a, o)) : We(e, t, a, o),
  t.memoizedState = r.state,
  i && up(t, n, !0),
  t.child
}
function Fv(e) {
  var t = e.stateNode;
  t.pendingContext ? cp(e, t.pendingContext, t.pendingContext !== t.context) : t.context && cp(e, t.context, !1),
  Yd(e, t.containerInfo)
}
function Pp(e, t, n, r, i) {
  return Di(),
  Wd(i),
  t.flags |= 256,
  We(e, t, n, r),
  t.child
}
var bu = {
  dehydrated: null,
  treeContext: null,
  retryLane: 0
};
function Su(e) {
  return {
      baseLanes: e,
      cachePool: null,
      transitions: null
  }
}
function Bv(e, t, n) {
  var r = t.pendingProps, i = pe.current, o = !1, s = (t.flags & 128) !== 0, a;
  if ((a = s) || (a = e !== null && e.memoizedState === null ? !1 : (i & 2) !== 0),
  a ? (o = !0,
  t.flags &= -129) : (e === null || e.memoizedState !== null) && (i |= 1),
  se(pe, i & 1),
  e === null)
      return pu(t),
      e = t.memoizedState,
      e !== null && (e = e.dehydrated,
      e !== null) ? (t.mode & 1 ? e.data === "$!" ? t.lanes = 8 : t.lanes = 1073741824 : t.lanes = 1,
      null) : (s = r.children,
      e = r.fallback,
      o ? (r = t.mode,
      o = t.child,
      s = {
          mode: "hidden",
          children: s
      },
      !(r & 1) && o !== null ? (o.childLanes = 0,
      o.pendingProps = s) : o = hl(s, r, 0, null),
      e = Ir(e, r, n, null),
      o.return = t,
      e.return = t,
      o.sibling = e,
      t.child = o,
      t.child.memoizedState = Su(n),
      t.memoizedState = bu,
      e) : of(t, s));
  if (i = e.memoizedState,
  i !== null && (a = i.dehydrated,
  a !== null))
      return VC(e, t, s, r, a, i, n);
  if (o) {
      o = r.fallback,
      s = t.mode,
      i = e.child,
      a = i.sibling;
      var l = {
          mode: "hidden",
          children: r.children
      };
      return !(s & 1) && t.child !== i ? (r = t.child,
      r.childLanes = 0,
      r.pendingProps = l,
      t.deletions = null) : (r = tr(i, l),
      r.subtreeFlags = i.subtreeFlags & 14680064),
      a !== null ? o = tr(a, o) : (o = Ir(o, s, n, null),
      o.flags |= 2),
      o.return = t,
      r.return = t,
      r.sibling = o,
      t.child = r,
      r = o,
      o = t.child,
      s = e.child.memoizedState,
      s = s === null ? Su(n) : {
          baseLanes: s.baseLanes | n,
          cachePool: null,
          transitions: s.transitions
      },
      o.memoizedState = s,
      o.childLanes = e.childLanes & ~n,
      t.memoizedState = bu,
      r
  }
  return o = e.child,
  e = o.sibling,
  r = tr(o, {
      mode: "visible",
      children: r.children
  }),
  !(t.mode & 1) && (r.lanes = n),
  r.return = t,
  r.sibling = null,
  e !== null && (n = t.deletions,
  n === null ? (t.deletions = [e],
  t.flags |= 16) : n.push(e)),
  t.child = r,
  t.memoizedState = null,
  r
}
function of(e, t) {
  return t = hl({
      mode: "visible",
      children: t
  }, e.mode, 0, null),
  t.return = e,
  e.child = t
}
function Vs(e, t, n, r) {
  return r !== null && Wd(r),
  Ii(t, e.child, null, n),
  e = of(t, t.pendingProps.children),
  e.flags |= 2,
  t.memoizedState = null,
  e
}
function VC(e, t, n, r, i, o, s) {
  if (n)
      return t.flags & 256 ? (t.flags &= -257,
      r = hc(Error(D(422))),
      Vs(e, t, s, r)) : t.memoizedState !== null ? (t.child = e.child,
      t.flags |= 128,
      null) : (o = r.fallback,
      i = t.mode,
      r = hl({
          mode: "visible",
          children: r.children
      }, i, 0, null),
      o = Ir(o, i, s, null),
      o.flags |= 2,
      r.return = t,
      o.return = t,
      r.sibling = o,
      t.child = r,
      t.mode & 1 && Ii(t, e.child, null, s),
      t.child.memoizedState = Su(s),
      t.memoizedState = bu,
      o);
  if (!(t.mode & 1))
      return Vs(e, t, s, null);
  if (i.data === "$!") {
      if (r = i.nextSibling && i.nextSibling.dataset,
      r)
          var a = r.dgst;
      return r = a,
      o = Error(D(419)),
      r = hc(o, r, void 0),
      Vs(e, t, s, r)
  }
  if (a = (s & e.childLanes) !== 0,
  Je || a) {
      if (r = Ne,
      r !== null) {
          switch (s & -s) {
          case 4:
              i = 2;
              break;
          case 16:
              i = 8;
              break;
          case 64:
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
          case 67108864:
              i = 32;
              break;
          case 536870912:
              i = 268435456;
              break;
          default:
              i = 0
          }
          i = i & (r.suspendedLanes | s) ? 0 : i,
          i !== 0 && i !== o.retryLane && (o.retryLane = i,
          vn(e, i),
          _t(r, e, i, -1))
      }
      return df(),
      r = hc(Error(D(421))),
      Vs(e, t, s, r)
  }
  return i.data === "$?" ? (t.flags |= 128,
  t.child = e.child,
  t = XC.bind(null, e),
  i._reactRetry = t,
  null) : (e = o.treeContext,
  st = Zn(i.nextSibling),
  at = t,
  fe = !0,
  Ot = null,
  e !== null && (gt[yt++] = fn,
  gt[yt++] = hn,
  gt[yt++] = zr,
  fn = e.id,
  hn = e.overflow,
  zr = t),
  t = of(t, r.children),
  t.flags |= 4096,
  t)
}
function Tp(e, t, n) {
  e.lanes |= t;
  var r = e.alternate;
  r !== null && (r.lanes |= t),
  mu(e.return, t, n)
}
function pc(e, t, n, r, i) {
  var o = e.memoizedState;
  o === null ? e.memoizedState = {
      isBackwards: t,
      rendering: null,
      renderingStartTime: 0,
      last: r,
      tail: n,
      tailMode: i
  } : (o.isBackwards = t,
  o.rendering = null,
  o.renderingStartTime = 0,
  o.last = r,
  o.tail = n,
  o.tailMode = i)
}
function $v(e, t, n) {
  var r = t.pendingProps
    , i = r.revealOrder
    , o = r.tail;
  if (We(e, t, r.children, n),
  r = pe.current,
  r & 2)
      r = r & 1 | 2,
      t.flags |= 128;
  else {
      if (e !== null && e.flags & 128)
          e: for (e = t.child; e !== null; ) {
              if (e.tag === 13)
                  e.memoizedState !== null && Tp(e, n, t);
              else if (e.tag === 19)
                  Tp(e, n, t);
              else if (e.child !== null) {
                  e.child.return = e,
                  e = e.child;
                  continue
              }
              if (e === t)
                  break e;
              for (; e.sibling === null; ) {
                  if (e.return === null || e.return === t)
                      break e;
                  e = e.return
              }
              e.sibling.return = e.return,
              e = e.sibling
          }
      r &= 1
  }
  if (se(pe, r),
  !(t.mode & 1))
      t.memoizedState = null;
  else
      switch (i) {
      case "forwards":
          for (n = t.child,
          i = null; n !== null; )
              e = n.alternate,
              e !== null && Da(e) === null && (i = n),
              n = n.sibling;
          n = i,
          n === null ? (i = t.child,
          t.child = null) : (i = n.sibling,
          n.sibling = null),
          pc(t, !1, i, n, o);
          break;
      case "backwards":
          for (n = null,
          i = t.child,
          t.child = null; i !== null; ) {
              if (e = i.alternate,
              e !== null && Da(e) === null) {
                  t.child = i;
                  break
              }
              e = i.sibling,
              i.sibling = n,
              n = i,
              i = e
          }
          pc(t, !0, n, null, o);
          break;
      case "together":
          pc(t, !1, null, null, void 0);
          break;
      default:
          t.memoizedState = null
      }
  return t.child
}
function sa(e, t) {
  !(t.mode & 1) && e !== null && (e.alternate = null,
  t.alternate = null,
  t.flags |= 2)
}
function xn(e, t, n) {
  if (e !== null && (t.dependencies = e.dependencies),
  Vr |= t.lanes,
  !(n & t.childLanes))
      return null;
  if (e !== null && t.child !== e.child)
      throw Error(D(153));
  if (t.child !== null) {
      for (e = t.child,
      n = tr(e, e.pendingProps),
      t.child = n,
      n.return = t; e.sibling !== null; )
          e = e.sibling,
          n = n.sibling = tr(e, e.pendingProps),
          n.return = t;
      n.sibling = null
  }
  return t.child
}
function FC(e, t, n) {
  switch (t.tag) {
  case 3:
      Fv(t),
      Di();
      break;
  case 5:
      pv(t);
      break;
  case 1:
      tt(t.type) && Ta(t);
      break;
  case 4:
      Yd(t, t.stateNode.containerInfo);
      break;
  case 10:
      var r = t.type._context
        , i = t.memoizedProps.value;
      se(Ra, r._currentValue),
      r._currentValue = i;
      break;
  case 13:
      if (r = t.memoizedState,
      r !== null)
          return r.dehydrated !== null ? (se(pe, pe.current & 1),
          t.flags |= 128,
          null) : n & t.child.childLanes ? Bv(e, t, n) : (se(pe, pe.current & 1),
          e = xn(e, t, n),
          e !== null ? e.sibling : null);
      se(pe, pe.current & 1);
      break;
  case 19:
      if (r = (n & t.childLanes) !== 0,
      e.flags & 128) {
          if (r)
              return $v(e, t, n);
          t.flags |= 128
      }
      if (i = t.memoizedState,
      i !== null && (i.rendering = null,
      i.tail = null,
      i.lastEffect = null),
      se(pe, pe.current),
      r)
          break;
      return null;
  case 22:
  case 23:
      return t.lanes = 0,
      _v(e, t, n)
  }
  return xn(e, t, n)
}
var Uv, Cu, Wv, Hv;
Uv = function(e, t) {
  for (var n = t.child; n !== null; ) {
      if (n.tag === 5 || n.tag === 6)
          e.appendChild(n.stateNode);
      else if (n.tag !== 4 && n.child !== null) {
          n.child.return = n,
          n = n.child;
          continue
      }
      if (n === t)
          break;
      for (; n.sibling === null; ) {
          if (n.return === null || n.return === t)
              return;
          n = n.return
      }
      n.sibling.return = n.return,
      n = n.sibling
  }
}
;
Cu = function() {}
;
Wv = function(e, t, n, r) {
  var i = e.memoizedProps;
  if (i !== r) {
      e = t.stateNode,
      kr(Xt.current);
      var o = null;
      switch (n) {
      case "input":
          i = Hc(e, i),
          r = Hc(e, r),
          o = [];
          break;
      case "select":
          i = ye({}, i, {
              value: void 0
          }),
          r = ye({}, r, {
              value: void 0
          }),
          o = [];
          break;
      case "textarea":
          i = Gc(e, i),
          r = Gc(e, r),
          o = [];
          break;
      default:
          typeof i.onClick != "function" && typeof r.onClick == "function" && (e.onclick = Ea)
      }
      Yc(n, r);
      var s;
      n = null;
      for (c in i)
          if (!r.hasOwnProperty(c) && i.hasOwnProperty(c) && i[c] != null)
              if (c === "style") {
                  var a = i[c];
                  for (s in a)
                      a.hasOwnProperty(s) && (n || (n = {}),
                      n[s] = "")
              } else
                  c !== "dangerouslySetInnerHTML" && c !== "children" && c !== "suppressContentEditableWarning" && c !== "suppressHydrationWarning" && c !== "autoFocus" && (Io.hasOwnProperty(c) ? o || (o = []) : (o = o || []).push(c, null));
      for (c in r) {
          var l = r[c];
          if (a = i != null ? i[c] : void 0,
          r.hasOwnProperty(c) && l !== a && (l != null || a != null))
              if (c === "style")
                  if (a) {
                      for (s in a)
                          !a.hasOwnProperty(s) || l && l.hasOwnProperty(s) || (n || (n = {}),
                          n[s] = "");
                      for (s in l)
                          l.hasOwnProperty(s) && a[s] !== l[s] && (n || (n = {}),
                          n[s] = l[s])
                  } else
                      n || (o || (o = []),
                      o.push(c, n)),
                      n = l;
              else
                  c === "dangerouslySetInnerHTML" ? (l = l ? l.__html : void 0,
                  a = a ? a.__html : void 0,
                  l != null && a !== l && (o = o || []).push(c, l)) : c === "children" ? typeof l != "string" && typeof l != "number" || (o = o || []).push(c, "" + l) : c !== "suppressContentEditableWarning" && c !== "suppressHydrationWarning" && (Io.hasOwnProperty(c) ? (l != null && c === "onScroll" && le("scroll", e),
                  o || a === l || (o = [])) : (o = o || []).push(c, l))
      }
      n && (o = o || []).push("style", n);
      var c = o;
      (t.updateQueue = c) && (t.flags |= 4)
  }
}
;
Hv = function(e, t, n, r) {
  n !== r && (t.flags |= 4)
}
;
function lo(e, t) {
  if (!fe)
      switch (e.tailMode) {
      case "hidden":
          t = e.tail;
          for (var n = null; t !== null; )
              t.alternate !== null && (n = t),
              t = t.sibling;
          n === null ? e.tail = null : n.sibling = null;
          break;
      case "collapsed":
          n = e.tail;
          for (var r = null; n !== null; )
              n.alternate !== null && (r = n),
              n = n.sibling;
          r === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null
      }
}
function ze(e) {
  var t = e.alternate !== null && e.alternate.child === e.child
    , n = 0
    , r = 0;
  if (t)
      for (var i = e.child; i !== null; )
          n |= i.lanes | i.childLanes,
          r |= i.subtreeFlags & 14680064,
          r |= i.flags & 14680064,
          i.return = e,
          i = i.sibling;
  else
      for (i = e.child; i !== null; )
          n |= i.lanes | i.childLanes,
          r |= i.subtreeFlags,
          r |= i.flags,
          i.return = e,
          i = i.sibling;
  return e.subtreeFlags |= r,
  e.childLanes = n,
  t
}
function BC(e, t, n) {
  var r = t.pendingProps;
  switch (Ud(t),
  t.tag) {
  case 2:
  case 16:
  case 15:
  case 0:
  case 11:
  case 7:
  case 8:
  case 12:
  case 9:
  case 14:
      return ze(t),
      null;
  case 1:
      return tt(t.type) && Pa(),
      ze(t),
      null;
  case 3:
      return r = t.stateNode,
      Li(),
      ce(et),
      ce(Be),
      Xd(),
      r.pendingContext && (r.context = r.pendingContext,
      r.pendingContext = null),
      (e === null || e.child === null) && (zs(t) ? t.flags |= 4 : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024,
      Ot !== null && (ju(Ot),
      Ot = null))),
      Cu(e, t),
      ze(t),
      null;
  case 5:
      Zd(t);
      var i = kr(Ko.current);
      if (n = t.type,
      e !== null && t.stateNode != null)
          Wv(e, t, n, r, i),
          e.ref !== t.ref && (t.flags |= 512,
          t.flags |= 2097152);
      else {
          if (!r) {
              if (t.stateNode === null)
                  throw Error(D(166));
              return ze(t),
              null
          }
          if (e = kr(Xt.current),
          zs(t)) {
              r = t.stateNode,
              n = t.type;
              var o = t.memoizedProps;
              switch (r[Qt] = t,
              r[Wo] = o,
              e = (t.mode & 1) !== 0,
              n) {
              case "dialog":
                  le("cancel", r),
                  le("close", r);
                  break;
              case "iframe":
              case "object":
              case "embed":
                  le("load", r);
                  break;
              case "video":
              case "audio":
                  for (i = 0; i < yo.length; i++)
                      le(yo[i], r);
                  break;
              case "source":
                  le("error", r);
                  break;
              case "img":
              case "image":
              case "link":
                  le("error", r),
                  le("load", r);
                  break;
              case "details":
                  le("toggle", r);
                  break;
              case "input":
                  Oh(r, o),
                  le("invalid", r);
                  break;
              case "select":
                  r._wrapperState = {
                      wasMultiple: !!o.multiple
                  },
                  le("invalid", r);
                  break;
              case "textarea":
                  _h(r, o),
                  le("invalid", r)
              }
              Yc(n, o),
              i = null;
              for (var s in o)
                  if (o.hasOwnProperty(s)) {
                      var a = o[s];
                      s === "children" ? typeof a == "string" ? r.textContent !== a && (o.suppressHydrationWarning !== !0 && Os(r.textContent, a, e),
                      i = ["children", a]) : typeof a == "number" && r.textContent !== "" + a && (o.suppressHydrationWarning !== !0 && Os(r.textContent, a, e),
                      i = ["children", "" + a]) : Io.hasOwnProperty(s) && a != null && s === "onScroll" && le("scroll", r)
                  }
              switch (n) {
              case "input":
                  As(r),
                  zh(r, o, !0);
                  break;
              case "textarea":
                  As(r),
                  Vh(r);
                  break;
              case "select":
              case "option":
                  break;
              default:
                  typeof o.onClick == "function" && (r.onclick = Ea)
              }
              r = i,
              t.updateQueue = r,
              r !== null && (t.flags |= 4)
          } else {
              s = i.nodeType === 9 ? i : i.ownerDocument,
              e === "http://www.w3.org/1999/xhtml" && (e = xy(n)),
              e === "http://www.w3.org/1999/xhtml" ? n === "script" ? (e = s.createElement("div"),
              e.innerHTML = "<script><\/script>",
              e = e.removeChild(e.firstChild)) : typeof r.is == "string" ? e = s.createElement(n, {
                  is: r.is
              }) : (e = s.createElement(n),
              n === "select" && (s = e,
              r.multiple ? s.multiple = !0 : r.size && (s.size = r.size))) : e = s.createElementNS(e, n),
              e[Qt] = t,
              e[Wo] = r,
              Uv(e, t, !1, !1),
              t.stateNode = e;
              e: {
                  switch (s = Zc(n, r),
                  n) {
                  case "dialog":
                      le("cancel", e),
                      le("close", e),
                      i = r;
                      break;
                  case "iframe":
                  case "object":
                  case "embed":
                      le("load", e),
                      i = r;
                      break;
                  case "video":
                  case "audio":
                      for (i = 0; i < yo.length; i++)
                          le(yo[i], e);
                      i = r;
                      break;
                  case "source":
                      le("error", e),
                      i = r;
                      break;
                  case "img":
                  case "image":
                  case "link":
                      le("error", e),
                      le("load", e),
                      i = r;
                      break;
                  case "details":
                      le("toggle", e),
                      i = r;
                      break;
                  case "input":
                      Oh(e, r),
                      i = Hc(e, r),
                      le("invalid", e);
                      break;
                  case "option":
                      i = r;
                      break;
                  case "select":
                      e._wrapperState = {
                          wasMultiple: !!r.multiple
                      },
                      i = ye({}, r, {
                          value: void 0
                      }),
                      le("invalid", e);
                      break;
                  case "textarea":
                      _h(e, r),
                      i = Gc(e, r),
                      le("invalid", e);
                      break;
                  default:
                      i = r
                  }
                  Yc(n, i),
                  a = i;
                  for (o in a)
                      if (a.hasOwnProperty(o)) {
                          var l = a[o];
                          o === "style" ? Sy(e, l) : o === "dangerouslySetInnerHTML" ? (l = l ? l.__html : void 0,
                          l != null && wy(e, l)) : o === "children" ? typeof l == "string" ? (n !== "textarea" || l !== "") && Lo(e, l) : typeof l == "number" && Lo(e, "" + l) : o !== "suppressContentEditableWarning" && o !== "suppressHydrationWarning" && o !== "autoFocus" && (Io.hasOwnProperty(o) ? l != null && o === "onScroll" && le("scroll", e) : l != null && Ad(e, o, l, s))
                      }
                  switch (n) {
                  case "input":
                      As(e),
                      zh(e, r, !1);
                      break;
                  case "textarea":
                      As(e),
                      Vh(e);
                      break;
                  case "option":
                      r.value != null && e.setAttribute("value", "" + rr(r.value));
                      break;
                  case "select":
                      e.multiple = !!r.multiple,
                      o = r.value,
                      o != null ? hi(e, !!r.multiple, o, !1) : r.defaultValue != null && hi(e, !!r.multiple, r.defaultValue, !0);
                      break;
                  default:
                      typeof i.onClick == "function" && (e.onclick = Ea)
                  }
                  switch (n) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                      r = !!r.autoFocus;
                      break e;
                  case "img":
                      r = !0;
                      break e;
                  default:
                      r = !1
                  }
              }
              r && (t.flags |= 4)
          }
          t.ref !== null && (t.flags |= 512,
          t.flags |= 2097152)
      }
      return ze(t),
      null;
  case 6:
      if (e && t.stateNode != null)
          Hv(e, t, e.memoizedProps, r);
      else {
          if (typeof r != "string" && t.stateNode === null)
              throw Error(D(166));
          if (n = kr(Ko.current),
          kr(Xt.current),
          zs(t)) {
              if (r = t.stateNode,
              n = t.memoizedProps,
              r[Qt] = t,
              (o = r.nodeValue !== n) && (e = at,
              e !== null))
                  switch (e.tag) {
                  case 3:
                      Os(r.nodeValue, n, (e.mode & 1) !== 0);
                      break;
                  case 5:
                      e.memoizedProps.suppressHydrationWarning !== !0 && Os(r.nodeValue, n, (e.mode & 1) !== 0)
                  }
              o && (t.flags |= 4)
          } else
              r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r),
              r[Qt] = t,
              t.stateNode = r
      }
      return ze(t),
      null;
  case 13:
      if (ce(pe),
      r = t.memoizedState,
      e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
          if (fe && st !== null && t.mode & 1 && !(t.flags & 128))
              cv(),
              Di(),
              t.flags |= 98560,
              o = !1;
          else if (o = zs(t),
          r !== null && r.dehydrated !== null) {
              if (e === null) {
                  if (!o)
                      throw Error(D(318));
                  if (o = t.memoizedState,
                  o = o !== null ? o.dehydrated : null,
                  !o)
                      throw Error(D(317));
                  o[Qt] = t
              } else
                  Di(),
                  !(t.flags & 128) && (t.memoizedState = null),
                  t.flags |= 4;
              ze(t),
              o = !1
          } else
              Ot !== null && (ju(Ot),
              Ot = null),
              o = !0;
          if (!o)
              return t.flags & 65536 ? t : null
      }
      return t.flags & 128 ? (t.lanes = n,
      t) : (r = r !== null,
      r !== (e !== null && e.memoizedState !== null) && r && (t.child.flags |= 8192,
      t.mode & 1 && (e === null || pe.current & 1 ? Te === 0 && (Te = 3) : df())),
      t.updateQueue !== null && (t.flags |= 4),
      ze(t),
      null);
  case 4:
      return Li(),
      Cu(e, t),
      e === null && $o(t.stateNode.containerInfo),
      ze(t),
      null;
  case 10:
      return qd(t.type._context),
      ze(t),
      null;
  case 17:
      return tt(t.type) && Pa(),
      ze(t),
      null;
  case 19:
      if (ce(pe),
      o = t.memoizedState,
      o === null)
          return ze(t),
          null;
      if (r = (t.flags & 128) !== 0,
      s = o.rendering,
      s === null)
          if (r)
              lo(o, !1);
          else {
              if (Te !== 0 || e !== null && e.flags & 128)
                  for (e = t.child; e !== null; ) {
                      if (s = Da(e),
                      s !== null) {
                          for (t.flags |= 128,
                          lo(o, !1),
                          r = s.updateQueue,
                          r !== null && (t.updateQueue = r,
                          t.flags |= 4),
                          t.subtreeFlags = 0,
                          r = n,
                          n = t.child; n !== null; )
                              o = n,
                              e = r,
                              o.flags &= 14680066,
                              s = o.alternate,
                              s === null ? (o.childLanes = 0,
                              o.lanes = e,
                              o.child = null,
                              o.subtreeFlags = 0,
                              o.memoizedProps = null,
                              o.memoizedState = null,
                              o.updateQueue = null,
                              o.dependencies = null,
                              o.stateNode = null) : (o.childLanes = s.childLanes,
                              o.lanes = s.lanes,
                              o.child = s.child,
                              o.subtreeFlags = 0,
                              o.deletions = null,
                              o.memoizedProps = s.memoizedProps,
                              o.memoizedState = s.memoizedState,
                              o.updateQueue = s.updateQueue,
                              o.type = s.type,
                              e = s.dependencies,
                              o.dependencies = e === null ? null : {
                                  lanes: e.lanes,
                                  firstContext: e.firstContext
                              }),
                              n = n.sibling;
                          return se(pe, pe.current & 1 | 2),
                          t.child
                      }
                      e = e.sibling
                  }
              o.tail !== null && we() > zi && (t.flags |= 128,
              r = !0,
              lo(o, !1),
              t.lanes = 4194304)
          }
      else {
          if (!r)
              if (e = Da(s),
              e !== null) {
                  if (t.flags |= 128,
                  r = !0,
                  n = e.updateQueue,
                  n !== null && (t.updateQueue = n,
                  t.flags |= 4),
                  lo(o, !0),
                  o.tail === null && o.tailMode === "hidden" && !s.alternate && !fe)
                      return ze(t),
                      null
              } else
                  2 * we() - o.renderingStartTime > zi && n !== 1073741824 && (t.flags |= 128,
                  r = !0,
                  lo(o, !1),
                  t.lanes = 4194304);
          o.isBackwards ? (s.sibling = t.child,
          t.child = s) : (n = o.last,
          n !== null ? n.sibling = s : t.child = s,
          o.last = s)
      }
      return o.tail !== null ? (t = o.tail,
      o.rendering = t,
      o.tail = t.sibling,
      o.renderingStartTime = we(),
      t.sibling = null,
      n = pe.current,
      se(pe, r ? n & 1 | 2 : n & 1),
      t) : (ze(t),
      null);
  case 22:
  case 23:
      return uf(),
      r = t.memoizedState !== null,
      e !== null && e.memoizedState !== null !== r && (t.flags |= 8192),
      r && t.mode & 1 ? it & 1073741824 && (ze(t),
      t.subtreeFlags & 6 && (t.flags |= 8192)) : ze(t),
      null;
  case 24:
      return null;
  case 25:
      return null
  }
  throw Error(D(156, t.tag))
}
function $C(e, t) {
  switch (Ud(t),
  t.tag) {
  case 1:
      return tt(t.type) && Pa(),
      e = t.flags,
      e & 65536 ? (t.flags = e & -65537 | 128,
      t) : null;
  case 3:
      return Li(),
      ce(et),
      ce(Be),
      Xd(),
      e = t.flags,
      e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128,
      t) : null;
  case 5:
      return Zd(t),
      null;
  case 13:
      if (ce(pe),
      e = t.memoizedState,
      e !== null && e.dehydrated !== null) {
          if (t.alternate === null)
              throw Error(D(340));
          Di()
      }
      return e = t.flags,
      e & 65536 ? (t.flags = e & -65537 | 128,
      t) : null;
  case 19:
      return ce(pe),
      null;
  case 4:
      return Li(),
      null;
  case 10:
      return qd(t.type._context),
      null;
  case 22:
  case 23:
      return uf(),
      null;
  case 24:
      return null;
  default:
      return null
  }
}
var Fs = !1
, Ve = !1
, UC = typeof WeakSet == "function" ? WeakSet : Set
, B = null;
function ai(e, t) {
  var n = e.ref;
  if (n !== null)
      if (typeof n == "function")
          try {
              n(null)
          } catch (r) {
              xe(e, t, r)
          }
      else
          n.current = null
}
function ku(e, t, n) {
  try {
      n()
  } catch (r) {
      xe(e, t, r)
  }
}
var Ap = !1;
function WC(e, t) {
  if (au = Sa,
  e = Yy(),
  Bd(e)) {
      if ("selectionStart"in e)
          var n = {
              start: e.selectionStart,
              end: e.selectionEnd
          };
      else
          e: {
              n = (n = e.ownerDocument) && n.defaultView || window;
              var r = n.getSelection && n.getSelection();
              if (r && r.rangeCount !== 0) {
                  n = r.anchorNode;
                  var i = r.anchorOffset
                    , o = r.focusNode;
                  r = r.focusOffset;
                  try {
                      n.nodeType,
                      o.nodeType
                  } catch {
                      n = null;
                      break e
                  }
                  var s = 0
                    , a = -1
                    , l = -1
                    , c = 0
                    , u = 0
                    , d = e
                    , f = null;
                  t: for (; ; ) {
                      for (var p; d !== n || i !== 0 && d.nodeType !== 3 || (a = s + i),
                      d !== o || r !== 0 && d.nodeType !== 3 || (l = s + r),
                      d.nodeType === 3 && (s += d.nodeValue.length),
                      (p = d.firstChild) !== null; )
                          f = d,
                          d = p;
                      for (; ; ) {
                          if (d === e)
                              break t;
                          if (f === n && ++c === i && (a = s),
                          f === o && ++u === r && (l = s),
                          (p = d.nextSibling) !== null)
                              break;
                          d = f,
                          f = d.parentNode
                      }
                      d = p
                  }
                  n = a === -1 || l === -1 ? null : {
                      start: a,
                      end: l
                  }
              } else
                  n = null
          }
      n = n || {
          start: 0,
          end: 0
      }
  } else
      n = null;
  for (lu = {
      focusedElem: e,
      selectionRange: n
  },
  Sa = !1,
  B = t; B !== null; )
      if (t = B,
      e = t.child,
      (t.subtreeFlags & 1028) !== 0 && e !== null)
          e.return = t,
          B = e;
      else
          for (; B !== null; ) {
              t = B;
              try {
                  var b = t.alternate;
                  if (t.flags & 1024)
                      switch (t.tag) {
                      case 0:
                      case 11:
                      case 15:
                          break;
                      case 1:
                          if (b !== null) {
                              var y = b.memoizedProps
                                , w = b.memoizedState
                                , m = t.stateNode
                                , g = m.getSnapshotBeforeUpdate(t.elementType === t.type ? y : jt(t.type, y), w);
                              m.__reactInternalSnapshotBeforeUpdate = g
                          }
                          break;
                      case 3:
                          var v = t.stateNode.containerInfo;
                          v.nodeType === 1 ? v.textContent = "" : v.nodeType === 9 && v.documentElement && v.removeChild(v.documentElement);
                          break;
                      case 5:
                      case 6:
                      case 4:
                      case 17:
                          break;
                      default:
                          throw Error(D(163))
                      }
              } catch (S) {
                  xe(t, t.return, S)
              }
              if (e = t.sibling,
              e !== null) {
                  e.return = t.return,
                  B = e;
                  break
              }
              B = t.return
          }
  return b = Ap,
  Ap = !1,
  b
}
function Po(e, t, n) {
  var r = t.updateQueue;
  if (r = r !== null ? r.lastEffect : null,
  r !== null) {
      var i = r = r.next;
      do {
          if ((i.tag & e) === e) {
              var o = i.destroy;
              i.destroy = void 0,
              o !== void 0 && ku(t, n, o)
          }
          i = i.next
      } while (i !== r)
  }
}
function dl(e, t) {
  if (t = t.updateQueue,
  t = t !== null ? t.lastEffect : null,
  t !== null) {
      var n = t = t.next;
      do {
          if ((n.tag & e) === e) {
              var r = n.create;
              n.destroy = r()
          }
          n = n.next
      } while (n !== t)
  }
}
function Eu(e) {
  var t = e.ref;
  if (t !== null) {
      var n = e.stateNode;
      switch (e.tag) {
      case 5:
          e = n;
          break;
      default:
          e = n
      }
      typeof t == "function" ? t(e) : t.current = e
  }
}
function Kv(e) {
  var t = e.alternate;
  t !== null && (e.alternate = null,
  Kv(t)),
  e.child = null,
  e.deletions = null,
  e.sibling = null,
  e.tag === 5 && (t = e.stateNode,
  t !== null && (delete t[Qt],
  delete t[Wo],
  delete t[du],
  delete t[PC],
  delete t[TC])),
  e.stateNode = null,
  e.return = null,
  e.dependencies = null,
  e.memoizedProps = null,
  e.memoizedState = null,
  e.pendingProps = null,
  e.stateNode = null,
  e.updateQueue = null
}
function qv(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4
}
function Np(e) {
  e: for (; ; ) {
      for (; e.sibling === null; ) {
          if (e.return === null || qv(e.return))
              return null;
          e = e.return
      }
      for (e.sibling.return = e.return,
      e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
          if (e.flags & 2 || e.child === null || e.tag === 4)
              continue e;
          e.child.return = e,
          e = e.child
      }
      if (!(e.flags & 2))
          return e.stateNode
  }
}
function Pu(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6)
      e = e.stateNode,
      t ? n.nodeType === 8 ? n.parentNode.insertBefore(e, t) : n.insertBefore(e, t) : (n.nodeType === 8 ? (t = n.parentNode,
      t.insertBefore(e, n)) : (t = n,
      t.appendChild(e)),
      n = n._reactRootContainer,
      n != null || t.onclick !== null || (t.onclick = Ea));
  else if (r !== 4 && (e = e.child,
  e !== null))
      for (Pu(e, t, n),
      e = e.sibling; e !== null; )
          Pu(e, t, n),
          e = e.sibling
}
function Tu(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6)
      e = e.stateNode,
      t ? n.insertBefore(e, t) : n.appendChild(e);
  else if (r !== 4 && (e = e.child,
  e !== null))
      for (Tu(e, t, n),
      e = e.sibling; e !== null; )
          Tu(e, t, n),
          e = e.sibling
}
var Re = null
, Lt = !1;
function Rn(e, t, n) {
  for (n = n.child; n !== null; )
      Gv(e, t, n),
      n = n.sibling
}
function Gv(e, t, n) {
  if (Zt && typeof Zt.onCommitFiberUnmount == "function")
      try {
          Zt.onCommitFiberUnmount(rl, n)
      } catch {}
  switch (n.tag) {
  case 5:
      Ve || ai(n, t);
  case 6:
      var r = Re
        , i = Lt;
      Re = null,
      Rn(e, t, n),
      Re = r,
      Lt = i,
      Re !== null && (Lt ? (e = Re,
      n = n.stateNode,
      e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n)) : Re.removeChild(n.stateNode));
      break;
  case 18:
      Re !== null && (Lt ? (e = Re,
      n = n.stateNode,
      e.nodeType === 8 ? ac(e.parentNode, n) : e.nodeType === 1 && ac(e, n),
      Vo(e)) : ac(Re, n.stateNode));
      break;
  case 4:
      r = Re,
      i = Lt,
      Re = n.stateNode.containerInfo,
      Lt = !0,
      Rn(e, t, n),
      Re = r,
      Lt = i;
      break;
  case 0:
  case 11:
  case 14:
  case 15:
      if (!Ve && (r = n.updateQueue,
      r !== null && (r = r.lastEffect,
      r !== null))) {
          i = r = r.next;
          do {
              var o = i
                , s = o.destroy;
              o = o.tag,
              s !== void 0 && (o & 2 || o & 4) && ku(n, t, s),
              i = i.next
          } while (i !== r)
      }
      Rn(e, t, n);
      break;
  case 1:
      if (!Ve && (ai(n, t),
      r = n.stateNode,
      typeof r.componentWillUnmount == "function"))
          try {
              r.props = n.memoizedProps,
              r.state = n.memoizedState,
              r.componentWillUnmount()
          } catch (a) {
              xe(n, t, a)
          }
      Rn(e, t, n);
      break;
  case 21:
      Rn(e, t, n);
      break;
  case 22:
      n.mode & 1 ? (Ve = (r = Ve) || n.memoizedState !== null,
      Rn(e, t, n),
      Ve = r) : Rn(e, t, n);
      break;
  default:
      Rn(e, t, n)
  }
}
function Rp(e) {
  var t = e.updateQueue;
  if (t !== null) {
      e.updateQueue = null;
      var n = e.stateNode;
      n === null && (n = e.stateNode = new UC),
      t.forEach(function(r) {
          var i = JC.bind(null, e, r);
          n.has(r) || (n.add(r),
          r.then(i, i))
      })
  }
}
function Tt(e, t) {
  var n = t.deletions;
  if (n !== null)
      for (var r = 0; r < n.length; r++) {
          var i = n[r];
          try {
              var o = e
                , s = t
                , a = s;
              e: for (; a !== null; ) {
                  switch (a.tag) {
                  case 5:
                      Re = a.stateNode,
                      Lt = !1;
                      break e;
                  case 3:
                      Re = a.stateNode.containerInfo,
                      Lt = !0;
                      break e;
                  case 4:
                      Re = a.stateNode.containerInfo,
                      Lt = !0;
                      break e
                  }
                  a = a.return
              }
              if (Re === null)
                  throw Error(D(160));
              Gv(o, s, i),
              Re = null,
              Lt = !1;
              var l = i.alternate;
              l !== null && (l.return = null),
              i.return = null
          } catch (c) {
              xe(i, t, c)
          }
      }
  if (t.subtreeFlags & 12854)
      for (t = t.child; t !== null; )
          Qv(t, e),
          t = t.sibling
}
function Qv(e, t) {
  var n = e.alternate
    , r = e.flags;
  switch (e.tag) {
  case 0:
  case 11:
  case 14:
  case 15:
      if (Tt(t, e),
      Wt(e),
      r & 4) {
          try {
              Po(3, e, e.return),
              dl(3, e)
          } catch (y) {
              xe(e, e.return, y)
          }
          try {
              Po(5, e, e.return)
          } catch (y) {
              xe(e, e.return, y)
          }
      }
      break;
  case 1:
      Tt(t, e),
      Wt(e),
      r & 512 && n !== null && ai(n, n.return);
      break;
  case 5:
      if (Tt(t, e),
      Wt(e),
      r & 512 && n !== null && ai(n, n.return),
      e.flags & 32) {
          var i = e.stateNode;
          try {
              Lo(i, "")
          } catch (y) {
              xe(e, e.return, y)
          }
      }
      if (r & 4 && (i = e.stateNode,
      i != null)) {
          var o = e.memoizedProps
            , s = n !== null ? n.memoizedProps : o
            , a = e.type
            , l = e.updateQueue;
          if (e.updateQueue = null,
          l !== null)
              try {
                  a === "input" && o.type === "radio" && o.name != null && yy(i, o),
                  Zc(a, s);
                  var c = Zc(a, o);
                  for (s = 0; s < l.length; s += 2) {
                      var u = l[s]
                        , d = l[s + 1];
                      u === "style" ? Sy(i, d) : u === "dangerouslySetInnerHTML" ? wy(i, d) : u === "children" ? Lo(i, d) : Ad(i, u, d, c)
                  }
                  switch (a) {
                  case "input":
                      Kc(i, o);
                      break;
                  case "textarea":
                      vy(i, o);
                      break;
                  case "select":
                      var f = i._wrapperState.wasMultiple;
                      i._wrapperState.wasMultiple = !!o.multiple;
                      var p = o.value;
                      p != null ? hi(i, !!o.multiple, p, !1) : f !== !!o.multiple && (o.defaultValue != null ? hi(i, !!o.multiple, o.defaultValue, !0) : hi(i, !!o.multiple, o.multiple ? [] : "", !1))
                  }
                  i[Wo] = o
              } catch (y) {
                  xe(e, e.return, y)
              }
      }
      break;
  case 6:
      if (Tt(t, e),
      Wt(e),
      r & 4) {
          if (e.stateNode === null)
              throw Error(D(162));
          i = e.stateNode,
          o = e.memoizedProps;
          try {
              i.nodeValue = o
          } catch (y) {
              xe(e, e.return, y)
          }
      }
      break;
  case 3:
      if (Tt(t, e),
      Wt(e),
      r & 4 && n !== null && n.memoizedState.isDehydrated)
          try {
              Vo(t.containerInfo)
          } catch (y) {
              xe(e, e.return, y)
          }
      break;
  case 4:
      Tt(t, e),
      Wt(e);
      break;
  case 13:
      Tt(t, e),
      Wt(e),
      i = e.child,
      i.flags & 8192 && (o = i.memoizedState !== null,
      i.stateNode.isHidden = o,
      !o || i.alternate !== null && i.alternate.memoizedState !== null || (lf = we())),
      r & 4 && Rp(e);
      break;
  case 22:
      if (u = n !== null && n.memoizedState !== null,
      e.mode & 1 ? (Ve = (c = Ve) || u,
      Tt(t, e),
      Ve = c) : Tt(t, e),
      Wt(e),
      r & 8192) {
          if (c = e.memoizedState !== null,
          (e.stateNode.isHidden = c) && !u && e.mode & 1)
              for (B = e,
              u = e.child; u !== null; ) {
                  for (d = B = u; B !== null; ) {
                      switch (f = B,
                      p = f.child,
                      f.tag) {
                      case 0:
                      case 11:
                      case 14:
                      case 15:
                          Po(4, f, f.return);
                          break;
                      case 1:
                          ai(f, f.return);
                          var b = f.stateNode;
                          if (typeof b.componentWillUnmount == "function") {
                              r = f,
                              n = f.return;
                              try {
                                  t = r,
                                  b.props = t.memoizedProps,
                                  b.state = t.memoizedState,
                                  b.componentWillUnmount()
                              } catch (y) {
                                  xe(r, n, y)
                              }
                          }
                          break;
                      case 5:
                          ai(f, f.return);
                          break;
                      case 22:
                          if (f.memoizedState !== null) {
                              Mp(d);
                              continue
                          }
                      }
                      p !== null ? (p.return = f,
                      B = p) : Mp(d)
                  }
                  u = u.sibling
              }
          e: for (u = null,
          d = e; ; ) {
              if (d.tag === 5) {
                  if (u === null) {
                      u = d;
                      try {
                          i = d.stateNode,
                          c ? (o = i.style,
                          typeof o.setProperty == "function" ? o.setProperty("display", "none", "important") : o.display = "none") : (a = d.stateNode,
                          l = d.memoizedProps.style,
                          s = l != null && l.hasOwnProperty("display") ? l.display : null,
                          a.style.display = by("display", s))
                      } catch (y) {
                          xe(e, e.return, y)
                      }
                  }
              } else if (d.tag === 6) {
                  if (u === null)
                      try {
                          d.stateNode.nodeValue = c ? "" : d.memoizedProps
                      } catch (y) {
                          xe(e, e.return, y)
                      }
              } else if ((d.tag !== 22 && d.tag !== 23 || d.memoizedState === null || d === e) && d.child !== null) {
                  d.child.return = d,
                  d = d.child;
                  continue
              }
              if (d === e)
                  break e;
              for (; d.sibling === null; ) {
                  if (d.return === null || d.return === e)
                      break e;
                  u === d && (u = null),
                  d = d.return
              }
              u === d && (u = null),
              d.sibling.return = d.return,
              d = d.sibling
          }
      }
      break;
  case 19:
      Tt(t, e),
      Wt(e),
      r & 4 && Rp(e);
      break;
  case 21:
      break;
  default:
      Tt(t, e),
      Wt(e)
  }
}
function Wt(e) {
  var t = e.flags;
  if (t & 2) {
      try {
          e: {
              for (var n = e.return; n !== null; ) {
                  if (qv(n)) {
                      var r = n;
                      break e
                  }
                  n = n.return
              }
              throw Error(D(160))
          }
          switch (r.tag) {
          case 5:
              var i = r.stateNode;
              r.flags & 32 && (Lo(i, ""),
              r.flags &= -33);
              var o = Np(e);
              Tu(e, o, i);
              break;
          case 3:
          case 4:
              var s = r.stateNode.containerInfo
                , a = Np(e);
              Pu(e, a, s);
              break;
          default:
              throw Error(D(161))
          }
      } catch (l) {
          xe(e, e.return, l)
      }
      e.flags &= -3
  }
  t & 4096 && (e.flags &= -4097)
}
function HC(e, t, n) {
  B = e,
  Yv(e)
}
function Yv(e, t, n) {
  for (var r = (e.mode & 1) !== 0; B !== null; ) {
      var i = B
        , o = i.child;
      if (i.tag === 22 && r) {
          var s = i.memoizedState !== null || Fs;
          if (!s) {
              var a = i.alternate
                , l = a !== null && a.memoizedState !== null || Ve;
              a = Fs;
              var c = Ve;
              if (Fs = s,
              (Ve = l) && !c)
                  for (B = i; B !== null; )
                      s = B,
                      l = s.child,
                      s.tag === 22 && s.memoizedState !== null ? Dp(i) : l !== null ? (l.return = s,
                      B = l) : Dp(i);
              for (; o !== null; )
                  B = o,
                  Yv(o),
                  o = o.sibling;
              B = i,
              Fs = a,
              Ve = c
          }
          jp(e)
      } else
          i.subtreeFlags & 8772 && o !== null ? (o.return = i,
          B = o) : jp(e)
  }
}
function jp(e) {
  for (; B !== null; ) {
      var t = B;
      if (t.flags & 8772) {
          var n = t.alternate;
          try {
              if (t.flags & 8772)
                  switch (t.tag) {
                  case 0:
                  case 11:
                  case 15:
                      Ve || dl(5, t);
                      break;
                  case 1:
                      var r = t.stateNode;
                      if (t.flags & 4 && !Ve)
                          if (n === null)
                              r.componentDidMount();
                          else {
                              var i = t.elementType === t.type ? n.memoizedProps : jt(t.type, n.memoizedProps);
                              r.componentDidUpdate(i, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate)
                          }
                      var o = t.updateQueue;
                      o !== null && mp(t, o, r);
                      break;
                  case 3:
                      var s = t.updateQueue;
                      if (s !== null) {
                          if (n = null,
                          t.child !== null)
                              switch (t.child.tag) {
                              case 5:
                                  n = t.child.stateNode;
                                  break;
                              case 1:
                                  n = t.child.stateNode
                              }
                          mp(t, s, n)
                      }
                      break;
                  case 5:
                      var a = t.stateNode;
                      if (n === null && t.flags & 4) {
                          n = a;
                          var l = t.memoizedProps;
                          switch (t.type) {
                          case "button":
                          case "input":
                          case "select":
                          case "textarea":
                              l.autoFocus && n.focus();
                              break;
                          case "img":
                              l.src && (n.src = l.src)
                          }
                      }
                      break;
                  case 6:
                      break;
                  case 4:
                      break;
                  case 12:
                      break;
                  case 13:
                      if (t.memoizedState === null) {
                          var c = t.alternate;
                          if (c !== null) {
                              var u = c.memoizedState;
                              if (u !== null) {
                                  var d = u.dehydrated;
                                  d !== null && Vo(d)
                              }
                          }
                      }
                      break;
                  case 19:
                  case 17:
                  case 21:
                  case 22:
                  case 23:
                  case 25:
                      break;
                  default:
                      throw Error(D(163))
                  }
              Ve || t.flags & 512 && Eu(t)
          } catch (f) {
              xe(t, t.return, f)
          }
      }
      if (t === e) {
          B = null;
          break
      }
      if (n = t.sibling,
      n !== null) {
          n.return = t.return,
          B = n;
          break
      }
      B = t.return
  }
}
function Mp(e) {
  for (; B !== null; ) {
      var t = B;
      if (t === e) {
          B = null;
          break
      }
      var n = t.sibling;
      if (n !== null) {
          n.return = t.return,
          B = n;
          break
      }
      B = t.return
  }
}
function Dp(e) {
  for (; B !== null; ) {
      var t = B;
      try {
          switch (t.tag) {
          case 0:
          case 11:
          case 15:
              var n = t.return;
              try {
                  dl(4, t)
              } catch (l) {
                  xe(t, n, l)
              }
              break;
          case 1:
              var r = t.stateNode;
              if (typeof r.componentDidMount == "function") {
                  var i = t.return;
                  try {
                      r.componentDidMount()
                  } catch (l) {
                      xe(t, i, l)
                  }
              }
              var o = t.return;
              try {
                  Eu(t)
              } catch (l) {
                  xe(t, o, l)
              }
              break;
          case 5:
              var s = t.return;
              try {
                  Eu(t)
              } catch (l) {
                  xe(t, s, l)
              }
          }
      } catch (l) {
          xe(t, t.return, l)
      }
      if (t === e) {
          B = null;
          break
      }
      var a = t.sibling;
      if (a !== null) {
          a.return = t.return,
          B = a;
          break
      }
      B = t.return
  }
}
var KC = Math.ceil
, Oa = Cn.ReactCurrentDispatcher
, sf = Cn.ReactCurrentOwner
, wt = Cn.ReactCurrentBatchConfig
, J = 0
, Ne = null
, ke = null
, Me = 0
, it = 0
, li = dr(0)
, Te = 0
, Yo = null
, Vr = 0
, fl = 0
, af = 0
, To = null
, Xe = null
, lf = 0
, zi = 1 / 0
, cn = null
, za = !1
, Au = null
, Jn = null
, Bs = !1
, Hn = null
, _a = 0
, Ao = 0
, Nu = null
, aa = -1
, la = 0;
function Ge() {
  return J & 6 ? we() : aa !== -1 ? aa : aa = we()
}
function er(e) {
  return e.mode & 1 ? J & 2 && Me !== 0 ? Me & -Me : NC.transition !== null ? (la === 0 && (la = Iy()),
  la) : (e = re,
  e !== 0 || (e = window.event,
  e = e === void 0 ? 16 : By(e.type)),
  e) : 1
}
function _t(e, t, n, r) {
  if (50 < Ao)
      throw Ao = 0,
      Nu = null,
      Error(D(185));
  cs(e, n, r),
  (!(J & 2) || e !== Ne) && (e === Ne && (!(J & 2) && (fl |= n),
  Te === 4 && _n(e, Me)),
  nt(e, r),
  n === 1 && J === 0 && !(t.mode & 1) && (zi = we() + 500,
  ll && fr()))
}
function nt(e, t) {
  var n = e.callbackNode;
  NS(e, t);
  var r = ba(e, e === Ne ? Me : 0);
  if (r === 0)
      n !== null && $h(n),
      e.callbackNode = null,
      e.callbackPriority = 0;
  else if (t = r & -r,
  e.callbackPriority !== t) {
      if (n != null && $h(n),
      t === 1)
          e.tag === 0 ? AC(Ip.bind(null, e)) : sv(Ip.bind(null, e)),
          kC(function() {
              !(J & 6) && fr()
          }),
          n = null;
      else {
          switch (Ly(r)) {
          case 1:
              n = Dd;
              break;
          case 4:
              n = My;
              break;
          case 16:
              n = wa;
              break;
          case 536870912:
              n = Dy;
              break;
          default:
              n = wa
          }
          n = i0(n, Zv.bind(null, e))
      }
      e.callbackPriority = t,
      e.callbackNode = n
  }
}
function Zv(e, t) {
  if (aa = -1,
  la = 0,
  J & 6)
      throw Error(D(327));
  var n = e.callbackNode;
  if (vi() && e.callbackNode !== n)
      return null;
  var r = ba(e, e === Ne ? Me : 0);
  if (r === 0)
      return null;
  if (r & 30 || r & e.expiredLanes || t)
      t = Va(e, r);
  else {
      t = r;
      var i = J;
      J |= 2;
      var o = Jv();
      (Ne !== e || Me !== t) && (cn = null,
      zi = we() + 500,
      Dr(e, t));
      do
          try {
              QC();
              break
          } catch (a) {
              Xv(e, a)
          }
      while (!0);
      Kd(),
      Oa.current = o,
      J = i,
      ke !== null ? t = 0 : (Ne = null,
      Me = 0,
      t = Te)
  }
  if (t !== 0) {
      if (t === 2 && (i = nu(e),
      i !== 0 && (r = i,
      t = Ru(e, i))),
      t === 1)
          throw n = Yo,
          Dr(e, 0),
          _n(e, r),
          nt(e, we()),
          n;
      if (t === 6)
          _n(e, r);
      else {
          if (i = e.current.alternate,
          !(r & 30) && !qC(i) && (t = Va(e, r),
          t === 2 && (o = nu(e),
          o !== 0 && (r = o,
          t = Ru(e, o))),
          t === 1))
              throw n = Yo,
              Dr(e, 0),
              _n(e, r),
              nt(e, we()),
              n;
          switch (e.finishedWork = i,
          e.finishedLanes = r,
          t) {
          case 0:
          case 1:
              throw Error(D(345));
          case 2:
              wr(e, Xe, cn);
              break;
          case 3:
              if (_n(e, r),
              (r & 130023424) === r && (t = lf + 500 - we(),
              10 < t)) {
                  if (ba(e, 0) !== 0)
                      break;
                  if (i = e.suspendedLanes,
                  (i & r) !== r) {
                      Ge(),
                      e.pingedLanes |= e.suspendedLanes & i;
                      break
                  }
                  e.timeoutHandle = uu(wr.bind(null, e, Xe, cn), t);
                  break
              }
              wr(e, Xe, cn);
              break;
          case 4:
              if (_n(e, r),
              (r & 4194240) === r)
                  break;
              for (t = e.eventTimes,
              i = -1; 0 < r; ) {
                  var s = 31 - zt(r);
                  o = 1 << s,
                  s = t[s],
                  s > i && (i = s),
                  r &= ~o
              }
              if (r = i,
              r = we() - r,
              r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * KC(r / 1960)) - r,
              10 < r) {
                  e.timeoutHandle = uu(wr.bind(null, e, Xe, cn), r);
                  break
              }
              wr(e, Xe, cn);
              break;
          case 5:
              wr(e, Xe, cn);
              break;
          default:
              throw Error(D(329))
          }
      }
  }
  return nt(e, we()),
  e.callbackNode === n ? Zv.bind(null, e) : null
}
function Ru(e, t) {
  var n = To;
  return e.current.memoizedState.isDehydrated && (Dr(e, t).flags |= 256),
  e = Va(e, t),
  e !== 2 && (t = Xe,
  Xe = n,
  t !== null && ju(t)),
  e
}
function ju(e) {
  Xe === null ? Xe = e : Xe.push.apply(Xe, e)
}
function qC(e) {
  for (var t = e; ; ) {
      if (t.flags & 16384) {
          var n = t.updateQueue;
          if (n !== null && (n = n.stores,
          n !== null))
              for (var r = 0; r < n.length; r++) {
                  var i = n[r]
                    , o = i.getSnapshot;
                  i = i.value;
                  try {
                      if (!Vt(o(), i))
                          return !1
                  } catch {
                      return !1
                  }
              }
      }
      if (n = t.child,
      t.subtreeFlags & 16384 && n !== null)
          n.return = t,
          t = n;
      else {
          if (t === e)
              break;
          for (; t.sibling === null; ) {
              if (t.return === null || t.return === e)
                  return !0;
              t = t.return
          }
          t.sibling.return = t.return,
          t = t.sibling
      }
  }
  return !0
}
function _n(e, t) {
  for (t &= ~af,
  t &= ~fl,
  e.suspendedLanes |= t,
  e.pingedLanes &= ~t,
  e = e.expirationTimes; 0 < t; ) {
      var n = 31 - zt(t)
        , r = 1 << n;
      e[n] = -1,
      t &= ~r
  }
}
function Ip(e) {
  if (J & 6)
      throw Error(D(327));
  vi();
  var t = ba(e, 0);
  if (!(t & 1))
      return nt(e, we()),
      null;
  var n = Va(e, t);
  if (e.tag !== 0 && n === 2) {
      var r = nu(e);
      r !== 0 && (t = r,
      n = Ru(e, r))
  }
  if (n === 1)
      throw n = Yo,
      Dr(e, 0),
      _n(e, t),
      nt(e, we()),
      n;
  if (n === 6)
      throw Error(D(345));
  return e.finishedWork = e.current.alternate,
  e.finishedLanes = t,
  wr(e, Xe, cn),
  nt(e, we()),
  null
}
function cf(e, t) {
  var n = J;
  J |= 1;
  try {
      return e(t)
  } finally {
      J = n,
      J === 0 && (zi = we() + 500,
      ll && fr())
  }
}
function Fr(e) {
  Hn !== null && Hn.tag === 0 && !(J & 6) && vi();
  var t = J;
  J |= 1;
  var n = wt.transition
    , r = re;
  try {
      if (wt.transition = null,
      re = 1,
      e)
          return e()
  } finally {
      re = r,
      wt.transition = n,
      J = t,
      !(J & 6) && fr()
  }
}
function uf() {
  it = li.current,
  ce(li)
}
function Dr(e, t) {
  e.finishedWork = null,
  e.finishedLanes = 0;
  var n = e.timeoutHandle;
  if (n !== -1 && (e.timeoutHandle = -1,
  CC(n)),
  ke !== null)
      for (n = ke.return; n !== null; ) {
          var r = n;
          switch (Ud(r),
          r.tag) {
          case 1:
              r = r.type.childContextTypes,
              r != null && Pa();
              break;
          case 3:
              Li(),
              ce(et),
              ce(Be),
              Xd();
              break;
          case 5:
              Zd(r);
              break;
          case 4:
              Li();
              break;
          case 13:
              ce(pe);
              break;
          case 19:
              ce(pe);
              break;
          case 10:
              qd(r.type._context);
              break;
          case 22:
          case 23:
              uf()
          }
          n = n.return
      }
  if (Ne = e,
  ke = e = tr(e.current, null),
  Me = it = t,
  Te = 0,
  Yo = null,
  af = fl = Vr = 0,
  Xe = To = null,
  Cr !== null) {
      for (t = 0; t < Cr.length; t++)
          if (n = Cr[t],
          r = n.interleaved,
          r !== null) {
              n.interleaved = null;
              var i = r.next
                , o = n.pending;
              if (o !== null) {
                  var s = o.next;
                  o.next = i,
                  r.next = s
              }
              n.pending = r
          }
      Cr = null
  }
  return e
}
function Xv(e, t) {
  do {
      var n = ke;
      try {
          if (Kd(),
          ia.current = La,
          Ia) {
              for (var r = ge.memoizedState; r !== null; ) {
                  var i = r.queue;
                  i !== null && (i.pending = null),
                  r = r.next
              }
              Ia = !1
          }
          if (_r = 0,
          Ae = Pe = ge = null,
          Eo = !1,
          qo = 0,
          sf.current = null,
          n === null || n.return === null) {
              Te = 1,
              Yo = t,
              ke = null;
              break
          }
          e: {
              var o = e
                , s = n.return
                , a = n
                , l = t;
              if (t = Me,
              a.flags |= 32768,
              l !== null && typeof l == "object" && typeof l.then == "function") {
                  var c = l
                    , u = a
                    , d = u.tag;
                  if (!(u.mode & 1) && (d === 0 || d === 11 || d === 15)) {
                      var f = u.alternate;
                      f ? (u.updateQueue = f.updateQueue,
                      u.memoizedState = f.memoizedState,
                      u.lanes = f.lanes) : (u.updateQueue = null,
                      u.memoizedState = null)
                  }
                  var p = bp(s);
                  if (p !== null) {
                      p.flags &= -257,
                      Sp(p, s, a, o, t),
                      p.mode & 1 && wp(o, c, t),
                      t = p,
                      l = c;
                      var b = t.updateQueue;
                      if (b === null) {
                          var y = new Set;
                          y.add(l),
                          t.updateQueue = y
                      } else
                          b.add(l);
                      break e
                  } else {
                      if (!(t & 1)) {
                          wp(o, c, t),
                          df();
                          break e
                      }
                      l = Error(D(426))
                  }
              } else if (fe && a.mode & 1) {
                  var w = bp(s);
                  if (w !== null) {
                      !(w.flags & 65536) && (w.flags |= 256),
                      Sp(w, s, a, o, t),
                      Wd(Oi(l, a));
                      break e
                  }
              }
              o = l = Oi(l, a),
              Te !== 4 && (Te = 2),
              To === null ? To = [o] : To.push(o),
              o = s;
              do {
                  switch (o.tag) {
                  case 3:
                      o.flags |= 65536,
                      t &= -t,
                      o.lanes |= t;
                      var m = Lv(o, l, t);
                      pp(o, m);
                      break e;
                  case 1:
                      a = l;
                      var g = o.type
                        , v = o.stateNode;
                      if (!(o.flags & 128) && (typeof g.getDerivedStateFromError == "function" || v !== null && typeof v.componentDidCatch == "function" && (Jn === null || !Jn.has(v)))) {
                          o.flags |= 65536,
                          t &= -t,
                          o.lanes |= t;
                          var S = Ov(o, a, t);
                          pp(o, S);
                          break e
                      }
                  }
                  o = o.return
              } while (o !== null)
          }
          t0(n)
      } catch (C) {
          t = C,
          ke === n && n !== null && (ke = n = n.return);
          continue
      }
      break
  } while (!0)
}
function Jv() {
  var e = Oa.current;
  return Oa.current = La,
  e === null ? La : e
}
function df() {
  (Te === 0 || Te === 3 || Te === 2) && (Te = 4),
  Ne === null || !(Vr & 268435455) && !(fl & 268435455) || _n(Ne, Me)
}
function Va(e, t) {
  var n = J;
  J |= 2;
  var r = Jv();
  (Ne !== e || Me !== t) && (cn = null,
  Dr(e, t));
  do
      try {
          GC();
          break
      } catch (i) {
          Xv(e, i)
      }
  while (!0);
  if (Kd(),
  J = n,
  Oa.current = r,
  ke !== null)
      throw Error(D(261));
  return Ne = null,
  Me = 0,
  Te
}
function GC() {
  for (; ke !== null; )
      e0(ke)
}
function QC() {
  for (; ke !== null && !wS(); )
      e0(ke)
}
function e0(e) {
  var t = r0(e.alternate, e, it);
  e.memoizedProps = e.pendingProps,
  t === null ? t0(e) : ke = t,
  sf.current = null
}
function t0(e) {
  var t = e;
  do {
      var n = t.alternate;
      if (e = t.return,
      t.flags & 32768) {
          if (n = $C(n, t),
          n !== null) {
              n.flags &= 32767,
              ke = n;
              return
          }
          if (e !== null)
              e.flags |= 32768,
              e.subtreeFlags = 0,
              e.deletions = null;
          else {
              Te = 6,
              ke = null;
              return
          }
      } else if (n = BC(n, t, it),
      n !== null) {
          ke = n;
          return
      }
      if (t = t.sibling,
      t !== null) {
          ke = t;
          return
      }
      ke = t = e
  } while (t !== null);
  Te === 0 && (Te = 5)
}
function wr(e, t, n) {
  var r = re
    , i = wt.transition;
  try {
      wt.transition = null,
      re = 1,
      YC(e, t, n, r)
  } finally {
      wt.transition = i,
      re = r
  }
  return null
}
function YC(e, t, n, r) {
  do
      vi();
  while (Hn !== null);
  if (J & 6)
      throw Error(D(327));
  n = e.finishedWork;
  var i = e.finishedLanes;
  if (n === null)
      return null;
  if (e.finishedWork = null,
  e.finishedLanes = 0,
  n === e.current)
      throw Error(D(177));
  e.callbackNode = null,
  e.callbackPriority = 0;
  var o = n.lanes | n.childLanes;
  if (RS(e, o),
  e === Ne && (ke = Ne = null,
  Me = 0),
  !(n.subtreeFlags & 2064) && !(n.flags & 2064) || Bs || (Bs = !0,
  i0(wa, function() {
      return vi(),
      null
  })),
  o = (n.flags & 15990) !== 0,
  n.subtreeFlags & 15990 || o) {
      o = wt.transition,
      wt.transition = null;
      var s = re;
      re = 1;
      var a = J;
      J |= 4,
      sf.current = null,
      WC(e, n),
      Qv(n, e),
      gC(lu),
      Sa = !!au,
      lu = au = null,
      e.current = n,
      HC(n),
      bS(),
      J = a,
      re = s,
      wt.transition = o
  } else
      e.current = n;
  if (Bs && (Bs = !1,
  Hn = e,
  _a = i),
  o = e.pendingLanes,
  o === 0 && (Jn = null),
  kS(n.stateNode),
  nt(e, we()),
  t !== null)
      for (r = e.onRecoverableError,
      n = 0; n < t.length; n++)
          i = t[n],
          r(i.value, {
              componentStack: i.stack,
              digest: i.digest
          });
  if (za)
      throw za = !1,
      e = Au,
      Au = null,
      e;
  return _a & 1 && e.tag !== 0 && vi(),
  o = e.pendingLanes,
  o & 1 ? e === Nu ? Ao++ : (Ao = 0,
  Nu = e) : Ao = 0,
  fr(),
  null
}
function vi() {
  if (Hn !== null) {
      var e = Ly(_a)
        , t = wt.transition
        , n = re;
      try {
          if (wt.transition = null,
          re = 16 > e ? 16 : e,
          Hn === null)
              var r = !1;
          else {
              if (e = Hn,
              Hn = null,
              _a = 0,
              J & 6)
                  throw Error(D(331));
              var i = J;
              for (J |= 4,
              B = e.current; B !== null; ) {
                  var o = B
                    , s = o.child;
                  if (B.flags & 16) {
                      var a = o.deletions;
                      if (a !== null) {
                          for (var l = 0; l < a.length; l++) {
                              var c = a[l];
                              for (B = c; B !== null; ) {
                                  var u = B;
                                  switch (u.tag) {
                                  case 0:
                                  case 11:
                                  case 15:
                                      Po(8, u, o)
                                  }
                                  var d = u.child;
                                  if (d !== null)
                                      d.return = u,
                                      B = d;
                                  else
                                      for (; B !== null; ) {
                                          u = B;
                                          var f = u.sibling
                                            , p = u.return;
                                          if (Kv(u),
                                          u === c) {
                                              B = null;
                                              break
                                          }
                                          if (f !== null) {
                                              f.return = p,
                                              B = f;
                                              break
                                          }
                                          B = p
                                      }
                              }
                          }
                          var b = o.alternate;
                          if (b !== null) {
                              var y = b.child;
                              if (y !== null) {
                                  b.child = null;
                                  do {
                                      var w = y.sibling;
                                      y.sibling = null,
                                      y = w
                                  } while (y !== null)
                              }
                          }
                          B = o
                      }
                  }
                  if (o.subtreeFlags & 2064 && s !== null)
                      s.return = o,
                      B = s;
                  else
                      e: for (; B !== null; ) {
                          if (o = B,
                          o.flags & 2048)
                              switch (o.tag) {
                              case 0:
                              case 11:
                              case 15:
                                  Po(9, o, o.return)
                              }
                          var m = o.sibling;
                          if (m !== null) {
                              m.return = o.return,
                              B = m;
                              break e
                          }
                          B = o.return
                      }
              }
              var g = e.current;
              for (B = g; B !== null; ) {
                  s = B;
                  var v = s.child;
                  if (s.subtreeFlags & 2064 && v !== null)
                      v.return = s,
                      B = v;
                  else
                      e: for (s = g; B !== null; ) {
                          if (a = B,
                          a.flags & 2048)
                              try {
                                  switch (a.tag) {
                                  case 0:
                                  case 11:
                                  case 15:
                                      dl(9, a)
                                  }
                              } catch (C) {
                                  xe(a, a.return, C)
                              }
                          if (a === s) {
                              B = null;
                              break e
                          }
                          var S = a.sibling;
                          if (S !== null) {
                              S.return = a.return,
                              B = S;
                              break e
                          }
                          B = a.return
                      }
              }
              if (J = i,
              fr(),
              Zt && typeof Zt.onPostCommitFiberRoot == "function")
                  try {
                      Zt.onPostCommitFiberRoot(rl, e)
                  } catch {}
              r = !0
          }
          return r
      } finally {
          re = n,
          wt.transition = t
      }
  }
  return !1
}
function Lp(e, t, n) {
  t = Oi(n, t),
  t = Lv(e, t, 1),
  e = Xn(e, t, 1),
  t = Ge(),
  e !== null && (cs(e, 1, t),
  nt(e, t))
}
function xe(e, t, n) {
  if (e.tag === 3)
      Lp(e, e, n);
  else
      for (; t !== null; ) {
          if (t.tag === 3) {
              Lp(t, e, n);
              break
          } else if (t.tag === 1) {
              var r = t.stateNode;
              if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (Jn === null || !Jn.has(r))) {
                  e = Oi(n, e),
                  e = Ov(t, e, 1),
                  t = Xn(t, e, 1),
                  e = Ge(),
                  t !== null && (cs(t, 1, e),
                  nt(t, e));
                  break
              }
          }
          t = t.return
      }
}
function ZC(e, t, n) {
  var r = e.pingCache;
  r !== null && r.delete(t),
  t = Ge(),
  e.pingedLanes |= e.suspendedLanes & n,
  Ne === e && (Me & n) === n && (Te === 4 || Te === 3 && (Me & 130023424) === Me && 500 > we() - lf ? Dr(e, 0) : af |= n),
  nt(e, t)
}
function n0(e, t) {
  t === 0 && (e.mode & 1 ? (t = js,
  js <<= 1,
  !(js & 130023424) && (js = 4194304)) : t = 1);
  var n = Ge();
  e = vn(e, t),
  e !== null && (cs(e, t, n),
  nt(e, n))
}
function XC(e) {
  var t = e.memoizedState
    , n = 0;
  t !== null && (n = t.retryLane),
  n0(e, n)
}
function JC(e, t) {
  var n = 0;
  switch (e.tag) {
  case 13:
      var r = e.stateNode
        , i = e.memoizedState;
      i !== null && (n = i.retryLane);
      break;
  case 19:
      r = e.stateNode;
      break;
  default:
      throw Error(D(314))
  }
  r !== null && r.delete(t),
  n0(e, n)
}
var r0;
r0 = function(e, t, n) {
  if (e !== null)
      if (e.memoizedProps !== t.pendingProps || et.current)
          Je = !0;
      else {
          if (!(e.lanes & n) && !(t.flags & 128))
              return Je = !1,
              FC(e, t, n);
          Je = !!(e.flags & 131072)
      }
  else
      Je = !1,
      fe && t.flags & 1048576 && av(t, Na, t.index);
  switch (t.lanes = 0,
  t.tag) {
  case 2:
      var r = t.type;
      sa(e, t),
      e = t.pendingProps;
      var i = Mi(t, Be.current);
      yi(t, n),
      i = ef(null, t, r, e, i, n);
      var o = tf();
      return t.flags |= 1,
      typeof i == "object" && i !== null && typeof i.render == "function" && i.$$typeof === void 0 ? (t.tag = 1,
      t.memoizedState = null,
      t.updateQueue = null,
      tt(r) ? (o = !0,
      Ta(t)) : o = !1,
      t.memoizedState = i.state !== null && i.state !== void 0 ? i.state : null,
      Qd(t),
      i.updater = ul,
      t.stateNode = i,
      i._reactInternals = t,
      yu(t, r, e, n),
      t = wu(null, t, r, !0, o, n)) : (t.tag = 0,
      fe && o && $d(t),
      We(null, t, i, n),
      t = t.child),
      t;
  case 16:
      r = t.elementType;
      e: {
          switch (sa(e, t),
          e = t.pendingProps,
          i = r._init,
          r = i(r._payload),
          t.type = r,
          i = t.tag = tk(r),
          e = jt(r, e),
          i) {
          case 0:
              t = xu(null, t, r, e, n);
              break e;
          case 1:
              t = Ep(null, t, r, e, n);
              break e;
          case 11:
              t = Cp(null, t, r, e, n);
              break e;
          case 14:
              t = kp(null, t, r, jt(r.type, e), n);
              break e
          }
          throw Error(D(306, r, ""))
      }
      return t;
  case 0:
      return r = t.type,
      i = t.pendingProps,
      i = t.elementType === r ? i : jt(r, i),
      xu(e, t, r, i, n);
  case 1:
      return r = t.type,
      i = t.pendingProps,
      i = t.elementType === r ? i : jt(r, i),
      Ep(e, t, r, i, n);
  case 3:
      e: {
          if (Fv(t),
          e === null)
              throw Error(D(387));
          r = t.pendingProps,
          o = t.memoizedState,
          i = o.element,
          hv(e, t),
          Ma(t, r, null, n);
          var s = t.memoizedState;
          if (r = s.element,
          o.isDehydrated)
              if (o = {
                  element: r,
                  isDehydrated: !1,
                  cache: s.cache,
                  pendingSuspenseBoundaries: s.pendingSuspenseBoundaries,
                  transitions: s.transitions
              },
              t.updateQueue.baseState = o,
              t.memoizedState = o,
              t.flags & 256) {
                  i = Oi(Error(D(423)), t),
                  t = Pp(e, t, r, n, i);
                  break e
              } else if (r !== i) {
                  i = Oi(Error(D(424)), t),
                  t = Pp(e, t, r, n, i);
                  break e
              } else
                  for (st = Zn(t.stateNode.containerInfo.firstChild),
                  at = t,
                  fe = !0,
                  Ot = null,
                  n = dv(t, null, r, n),
                  t.child = n; n; )
                      n.flags = n.flags & -3 | 4096,
                      n = n.sibling;
          else {
              if (Di(),
              r === i) {
                  t = xn(e, t, n);
                  break e
              }
              We(e, t, r, n)
          }
          t = t.child
      }
      return t;
  case 5:
      return pv(t),
      e === null && pu(t),
      r = t.type,
      i = t.pendingProps,
      o = e !== null ? e.memoizedProps : null,
      s = i.children,
      cu(r, i) ? s = null : o !== null && cu(r, o) && (t.flags |= 32),
      Vv(e, t),
      We(e, t, s, n),
      t.child;
  case 6:
      return e === null && pu(t),
      null;
  case 13:
      return Bv(e, t, n);
  case 4:
      return Yd(t, t.stateNode.containerInfo),
      r = t.pendingProps,
      e === null ? t.child = Ii(t, null, r, n) : We(e, t, r, n),
      t.child;
  case 11:
      return r = t.type,
      i = t.pendingProps,
      i = t.elementType === r ? i : jt(r, i),
      Cp(e, t, r, i, n);
  case 7:
      return We(e, t, t.pendingProps, n),
      t.child;
  case 8:
      return We(e, t, t.pendingProps.children, n),
      t.child;
  case 12:
      return We(e, t, t.pendingProps.children, n),
      t.child;
  case 10:
      e: {
          if (r = t.type._context,
          i = t.pendingProps,
          o = t.memoizedProps,
          s = i.value,
          se(Ra, r._currentValue),
          r._currentValue = s,
          o !== null)
              if (Vt(o.value, s)) {
                  if (o.children === i.children && !et.current) {
                      t = xn(e, t, n);
                      break e
                  }
              } else
                  for (o = t.child,
                  o !== null && (o.return = t); o !== null; ) {
                      var a = o.dependencies;
                      if (a !== null) {
                          s = o.child;
                          for (var l = a.firstContext; l !== null; ) {
                              if (l.context === r) {
                                  if (o.tag === 1) {
                                      l = mn(-1, n & -n),
                                      l.tag = 2;
                                      var c = o.updateQueue;
                                      if (c !== null) {
                                          c = c.shared;
                                          var u = c.pending;
                                          u === null ? l.next = l : (l.next = u.next,
                                          u.next = l),
                                          c.pending = l
                                      }
                                  }
                                  o.lanes |= n,
                                  l = o.alternate,
                                  l !== null && (l.lanes |= n),
                                  mu(o.return, n, t),
                                  a.lanes |= n;
                                  break
                              }
                              l = l.next
                          }
                      } else if (o.tag === 10)
                          s = o.type === t.type ? null : o.child;
                      else if (o.tag === 18) {
                          if (s = o.return,
                          s === null)
                              throw Error(D(341));
                          s.lanes |= n,
                          a = s.alternate,
                          a !== null && (a.lanes |= n),
                          mu(s, n, t),
                          s = o.sibling
                      } else
                          s = o.child;
                      if (s !== null)
                          s.return = o;
                      else
                          for (s = o; s !== null; ) {
                              if (s === t) {
                                  s = null;
                                  break
                              }
                              if (o = s.sibling,
                              o !== null) {
                                  o.return = s.return,
                                  s = o;
                                  break
                              }
                              s = s.return
                          }
                      o = s
                  }
          We(e, t, i.children, n),
          t = t.child
      }
      return t;
  case 9:
      return i = t.type,
      r = t.pendingProps.children,
      yi(t, n),
      i = St(i),
      r = r(i),
      t.flags |= 1,
      We(e, t, r, n),
      t.child;
  case 14:
      return r = t.type,
      i = jt(r, t.pendingProps),
      i = jt(r.type, i),
      kp(e, t, r, i, n);
  case 15:
      return zv(e, t, t.type, t.pendingProps, n);
  case 17:
      return r = t.type,
      i = t.pendingProps,
      i = t.elementType === r ? i : jt(r, i),
      sa(e, t),
      t.tag = 1,
      tt(r) ? (e = !0,
      Ta(t)) : e = !1,
      yi(t, n),
      Iv(t, r, i),
      yu(t, r, i, n),
      wu(null, t, r, !0, e, n);
  case 19:
      return $v(e, t, n);
  case 22:
      return _v(e, t, n)
  }
  throw Error(D(156, t.tag))
}
;
function i0(e, t) {
  return jy(e, t)
}
function ek(e, t, n, r) {
  this.tag = e,
  this.key = n,
  this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null,
  this.index = 0,
  this.ref = null,
  this.pendingProps = t,
  this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null,
  this.mode = r,
  this.subtreeFlags = this.flags = 0,
  this.deletions = null,
  this.childLanes = this.lanes = 0,
  this.alternate = null
}
function vt(e, t, n, r) {
  return new ek(e,t,n,r)
}
function ff(e) {
  return e = e.prototype,
  !(!e || !e.isReactComponent)
}
function tk(e) {
  if (typeof e == "function")
      return ff(e) ? 1 : 0;
  if (e != null) {
      if (e = e.$$typeof,
      e === Rd)
          return 11;
      if (e === jd)
          return 14
  }
  return 2
}
function tr(e, t) {
  var n = e.alternate;
  return n === null ? (n = vt(e.tag, t, e.key, e.mode),
  n.elementType = e.elementType,
  n.type = e.type,
  n.stateNode = e.stateNode,
  n.alternate = e,
  e.alternate = n) : (n.pendingProps = t,
  n.type = e.type,
  n.flags = 0,
  n.subtreeFlags = 0,
  n.deletions = null),
  n.flags = e.flags & 14680064,
  n.childLanes = e.childLanes,
  n.lanes = e.lanes,
  n.child = e.child,
  n.memoizedProps = e.memoizedProps,
  n.memoizedState = e.memoizedState,
  n.updateQueue = e.updateQueue,
  t = e.dependencies,
  n.dependencies = t === null ? null : {
      lanes: t.lanes,
      firstContext: t.firstContext
  },
  n.sibling = e.sibling,
  n.index = e.index,
  n.ref = e.ref,
  n
}
function ca(e, t, n, r, i, o) {
  var s = 2;
  if (r = e,
  typeof e == "function")
      ff(e) && (s = 1);
  else if (typeof e == "string")
      s = 5;
  else
      e: switch (e) {
      case Xr:
          return Ir(n.children, i, o, t);
      case Nd:
          s = 8,
          i |= 8;
          break;
      case Bc:
          return e = vt(12, n, t, i | 2),
          e.elementType = Bc,
          e.lanes = o,
          e;
      case $c:
          return e = vt(13, n, t, i),
          e.elementType = $c,
          e.lanes = o,
          e;
      case Uc:
          return e = vt(19, n, t, i),
          e.elementType = Uc,
          e.lanes = o,
          e;
      case py:
          return hl(n, i, o, t);
      default:
          if (typeof e == "object" && e !== null)
              switch (e.$$typeof) {
              case fy:
                  s = 10;
                  break e;
              case hy:
                  s = 9;
                  break e;
              case Rd:
                  s = 11;
                  break e;
              case jd:
                  s = 14;
                  break e;
              case Ln:
                  s = 16,
                  r = null;
                  break e
              }
          throw Error(D(130, e == null ? e : typeof e, ""))
      }
  return t = vt(s, n, t, i),
  t.elementType = e,
  t.type = r,
  t.lanes = o,
  t
}
function Ir(e, t, n, r) {
  return e = vt(7, e, r, t),
  e.lanes = n,
  e
}
function hl(e, t, n, r) {
  return e = vt(22, e, r, t),
  e.elementType = py,
  e.lanes = n,
  e.stateNode = {
      isHidden: !1
  },
  e
}
function mc(e, t, n) {
  return e = vt(6, e, null, t),
  e.lanes = n,
  e
}
function gc(e, t, n) {
  return t = vt(4, e.children !== null ? e.children : [], e.key, t),
  t.lanes = n,
  t.stateNode = {
      containerInfo: e.containerInfo,
      pendingChildren: null,
      implementation: e.implementation
  },
  t
}
function nk(e, t, n, r, i) {
  this.tag = t,
  this.containerInfo = e,
  this.finishedWork = this.pingCache = this.current = this.pendingChildren = null,
  this.timeoutHandle = -1,
  this.callbackNode = this.pendingContext = this.context = null,
  this.callbackPriority = 0,
  this.eventTimes = Yl(0),
  this.expirationTimes = Yl(-1),
  this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0,
  this.entanglements = Yl(0),
  this.identifierPrefix = r,
  this.onRecoverableError = i,
  this.mutableSourceEagerHydrationData = null
}
function hf(e, t, n, r, i, o, s, a, l) {
  return e = new nk(e,t,n,a,l),
  t === 1 ? (t = 1,
  o === !0 && (t |= 8)) : t = 0,
  o = vt(3, null, null, t),
  e.current = o,
  o.stateNode = e,
  o.memoizedState = {
      element: r,
      isDehydrated: n,
      cache: null,
      transitions: null,
      pendingSuspenseBoundaries: null
  },
  Qd(o),
  e
}
function rk(e, t, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return {
      $$typeof: Zr,
      key: r == null ? null : "" + r,
      children: e,
      containerInfo: t,
      implementation: n
  }
}
function o0(e) {
  if (!e)
      return ir;
  e = e._reactInternals;
  e: {
      if (Ur(e) !== e || e.tag !== 1)
          throw Error(D(170));
      var t = e;
      do {
          switch (t.tag) {
          case 3:
              t = t.stateNode.context;
              break e;
          case 1:
              if (tt(t.type)) {
                  t = t.stateNode.__reactInternalMemoizedMergedChildContext;
                  break e
              }
          }
          t = t.return
      } while (t !== null);
      throw Error(D(171))
  }
  if (e.tag === 1) {
      var n = e.type;
      if (tt(n))
          return ov(e, n, t)
  }
  return t
}
function s0(e, t, n, r, i, o, s, a, l) {
  return e = hf(n, r, !0, e, i, o, s, a, l),
  e.context = o0(null),
  n = e.current,
  r = Ge(),
  i = er(n),
  o = mn(r, i),
  o.callback = t ?? null,
  Xn(n, o, i),
  e.current.lanes = i,
  cs(e, i, r),
  nt(e, r),
  e
}
function pl(e, t, n, r) {
  var i = t.current
    , o = Ge()
    , s = er(i);
  return n = o0(n),
  t.context === null ? t.context = n : t.pendingContext = n,
  t = mn(o, s),
  t.payload = {
      element: e
  },
  r = r === void 0 ? null : r,
  r !== null && (t.callback = r),
  e = Xn(i, t, s),
  e !== null && (_t(e, i, s, o),
  ra(e, i, s)),
  s
}
function Fa(e) {
  if (e = e.current,
  !e.child)
      return null;
  switch (e.child.tag) {
  case 5:
      return e.child.stateNode;
  default:
      return e.child.stateNode
  }
}
function Op(e, t) {
  if (e = e.memoizedState,
  e !== null && e.dehydrated !== null) {
      var n = e.retryLane;
      e.retryLane = n !== 0 && n < t ? n : t
  }
}
function pf(e, t) {
  Op(e, t),
  (e = e.alternate) && Op(e, t)
}
function ik() {
  return null
}
var a0 = typeof reportError == "function" ? reportError : function(e) {
  console.error(e)
}
;
function mf(e) {
  this._internalRoot = e
}
ml.prototype.render = mf.prototype.render = function(e) {
  var t = this._internalRoot;
  if (t === null)
      throw Error(D(409));
  pl(e, t, null, null)
}
;
ml.prototype.unmount = mf.prototype.unmount = function() {
  var e = this._internalRoot;
  if (e !== null) {
      this._internalRoot = null;
      var t = e.containerInfo;
      Fr(function() {
          pl(null, e, null, null)
      }),
      t[yn] = null
  }
}
;
function ml(e) {
  this._internalRoot = e
}
ml.prototype.unstable_scheduleHydration = function(e) {
  if (e) {
      var t = _y();
      e = {
          blockedOn: null,
          target: e,
          priority: t
      };
      for (var n = 0; n < zn.length && t !== 0 && t < zn[n].priority; n++)
          ;
      zn.splice(n, 0, e),
      n === 0 && Fy(e)
  }
}
;
function gf(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11)
}
function gl(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "))
}
function zp() {}
function ok(e, t, n, r, i) {
  if (i) {
      if (typeof r == "function") {
          var o = r;
          r = function() {
              var c = Fa(s);
              o.call(c)
          }
      }
      var s = s0(t, r, e, 0, null, !1, !1, "", zp);
      return e._reactRootContainer = s,
      e[yn] = s.current,
      $o(e.nodeType === 8 ? e.parentNode : e),
      Fr(),
      s
  }
  for (; i = e.lastChild; )
      e.removeChild(i);
  if (typeof r == "function") {
      var a = r;
      r = function() {
          var c = Fa(l);
          a.call(c)
      }
  }
  var l = hf(e, 0, !1, null, null, !1, !1, "", zp);
  return e._reactRootContainer = l,
  e[yn] = l.current,
  $o(e.nodeType === 8 ? e.parentNode : e),
  Fr(function() {
      pl(t, l, n, r)
  }),
  l
}
function yl(e, t, n, r, i) {
  var o = n._reactRootContainer;
  if (o) {
      var s = o;
      if (typeof i == "function") {
          var a = i;
          i = function() {
              var l = Fa(s);
              a.call(l)
          }
      }
      pl(t, s, e, i)
  } else
      s = ok(n, t, e, i, r);
  return Fa(s)
}
Oy = function(e) {
  switch (e.tag) {
  case 3:
      var t = e.stateNode;
      if (t.current.memoizedState.isDehydrated) {
          var n = go(t.pendingLanes);
          n !== 0 && (Id(t, n | 1),
          nt(t, we()),
          !(J & 6) && (zi = we() + 500,
          fr()))
      }
      break;
  case 13:
      Fr(function() {
          var r = vn(e, 1);
          if (r !== null) {
              var i = Ge();
              _t(r, e, 1, i)
          }
      }),
      pf(e, 1)
  }
}
;
Ld = function(e) {
  if (e.tag === 13) {
      var t = vn(e, 134217728);
      if (t !== null) {
          var n = Ge();
          _t(t, e, 134217728, n)
      }
      pf(e, 134217728)
  }
}
;
zy = function(e) {
  if (e.tag === 13) {
      var t = er(e)
        , n = vn(e, t);
      if (n !== null) {
          var r = Ge();
          _t(n, e, t, r)
      }
      pf(e, t)
  }
}
;
_y = function() {
  return re
}
;
Vy = function(e, t) {
  var n = re;
  try {
      return re = e,
      t()
  } finally {
      re = n
  }
}
;
Jc = function(e, t, n) {
  switch (t) {
  case "input":
      if (Kc(e, n),
      t = n.name,
      n.type === "radio" && t != null) {
          for (n = e; n.parentNode; )
              n = n.parentNode;
          for (n = n.querySelectorAll("input[name=" + JSON.stringify("" + t) + '][type="radio"]'),
          t = 0; t < n.length; t++) {
              var r = n[t];
              if (r !== e && r.form === e.form) {
                  var i = al(r);
                  if (!i)
                      throw Error(D(90));
                  gy(r),
                  Kc(r, i)
              }
          }
      }
      break;
  case "textarea":
      vy(e, n);
      break;
  case "select":
      t = n.value,
      t != null && hi(e, !!n.multiple, t, !1)
  }
}
;
Ey = cf;
Py = Fr;
var sk = {
  usingClientEntryPoint: !1,
  Events: [ds, ni, al, Cy, ky, cf]
}
, co = {
  findFiberByHostInstance: Sr,
  bundleType: 0,
  version: "18.3.1",
  rendererPackageName: "react-dom"
}
, ak = {
  bundleType: co.bundleType,
  version: co.version,
  rendererPackageName: co.rendererPackageName,
  rendererConfig: co.rendererConfig,
  overrideHookState: null,
  overrideHookStateDeletePath: null,
  overrideHookStateRenamePath: null,
  overrideProps: null,
  overridePropsDeletePath: null,
  overridePropsRenamePath: null,
  setErrorHandler: null,
  setSuspenseHandler: null,
  scheduleUpdate: null,
  currentDispatcherRef: Cn.ReactCurrentDispatcher,
  findHostInstanceByFiber: function(e) {
      return e = Ny(e),
      e === null ? null : e.stateNode
  },
  findFiberByHostInstance: co.findFiberByHostInstance || ik,
  findHostInstancesForRefresh: null,
  scheduleRefresh: null,
  scheduleRoot: null,
  setRefreshHandler: null,
  getCurrentFiber: null,
  reconcilerVersion: "18.3.1-next-f1338f8080-20240426"
};
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var $s = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!$s.isDisabled && $s.supportsFiber)
      try {
          rl = $s.inject(ak),
          Zt = $s
      } catch {}
}
dt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = sk;
dt.createPortal = function(e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!gf(t))
      throw Error(D(200));
  return rk(e, t, null, n)
}
;
dt.createRoot = function(e, t) {
  if (!gf(e))
      throw Error(D(299));
  var n = !1
    , r = ""
    , i = a0;
  return t != null && (t.unstable_strictMode === !0 && (n = !0),
  t.identifierPrefix !== void 0 && (r = t.identifierPrefix),
  t.onRecoverableError !== void 0 && (i = t.onRecoverableError)),
  t = hf(e, 1, !1, null, null, n, !1, r, i),
  e[yn] = t.current,
  $o(e.nodeType === 8 ? e.parentNode : e),
  new mf(t)
}
;
dt.findDOMNode = function(e) {
  if (e == null)
      return null;
  if (e.nodeType === 1)
      return e;
  var t = e._reactInternals;
  if (t === void 0)
      throw typeof e.render == "function" ? Error(D(188)) : (e = Object.keys(e).join(","),
      Error(D(268, e)));
  return e = Ny(t),
  e = e === null ? null : e.stateNode,
  e
}
;
dt.flushSync = function(e) {
  return Fr(e)
}
;
dt.hydrate = function(e, t, n) {
  if (!gl(t))
      throw Error(D(200));
  return yl(null, e, t, !0, n)
}
;
dt.hydrateRoot = function(e, t, n) {
  if (!gf(e))
      throw Error(D(405));
  var r = n != null && n.hydratedSources || null
    , i = !1
    , o = ""
    , s = a0;
  if (n != null && (n.unstable_strictMode === !0 && (i = !0),
  n.identifierPrefix !== void 0 && (o = n.identifierPrefix),
  n.onRecoverableError !== void 0 && (s = n.onRecoverableError)),
  t = s0(t, null, e, 1, n ?? null, i, !1, o, s),
  e[yn] = t.current,
  $o(e),
  r)
      for (e = 0; e < r.length; e++)
          n = r[e],
          i = n._getVersion,
          i = i(n._source),
          t.mutableSourceEagerHydrationData == null ? t.mutableSourceEagerHydrationData = [n, i] : t.mutableSourceEagerHydrationData.push(n, i);
  return new ml(t)
}
;
dt.render = function(e, t, n) {
  if (!gl(t))
      throw Error(D(200));
  return yl(null, e, t, !1, n)
}
;
dt.unmountComponentAtNode = function(e) {
  if (!gl(e))
      throw Error(D(40));
  return e._reactRootContainer ? (Fr(function() {
      yl(null, null, e, !1, function() {
          e._reactRootContainer = null,
          e[yn] = null
      })
  }),
  !0) : !1
}
;
dt.unstable_batchedUpdates = cf;
dt.unstable_renderSubtreeIntoContainer = function(e, t, n, r) {
  if (!gl(n))
      throw Error(D(200));
  if (e == null || e._reactInternals === void 0)
      throw Error(D(38));
  return yl(e, t, n, !1, r)
}
;
dt.version = "18.3.1-next-f1338f8080-20240426";
function l0() {
  if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(l0)
      } catch (e) {
          console.error(e)
      }
}
l0(),
ly.exports = dt;
var hs = ly.exports;
const c0 = Yg(hs);
var u0, _p = hs;
u0 = _p.createRoot,
_p.hydrateRoot;
const lk = 1
, ck = 1e6;
let yc = 0;
function uk() {
  return yc = (yc + 1) % Number.MAX_SAFE_INTEGER,
  yc.toString()
}
const vc = new Map
, Vp = e => {
  if (vc.has(e))
      return;
  const t = setTimeout( () => {
      vc.delete(e),
      No({
          type: "REMOVE_TOAST",
          toastId: e
      })
  }
  , ck);
  vc.set(e, t)
}
, dk = (e, t) => {
  switch (t.type) {
  case "ADD_TOAST":
      return {
          ...e,
          toasts: [t.toast, ...e.toasts].slice(0, lk)
      };
  case "UPDATE_TOAST":
      return {
          ...e,
          toasts: e.toasts.map(n => n.id === t.toast.id ? {
              ...n,
              ...t.toast
          } : n)
      };
  case "DISMISS_TOAST":
      {
          const {toastId: n} = t;
          return n ? Vp(n) : e.toasts.forEach(r => {
              Vp(r.id)
          }
          ),
          {
              ...e,
              toasts: e.toasts.map(r => r.id === n || n === void 0 ? {
                  ...r,
                  open: !1
              } : r)
          }
      }
  case "REMOVE_TOAST":
      return t.toastId === void 0 ? {
          ...e,
          toasts: []
      } : {
          ...e,
          toasts: e.toasts.filter(n => n.id !== t.toastId)
      }
  }
}
, ua = [];
let da = {
  toasts: []
};
function No(e) {
  da = dk(da, e),
  ua.forEach(t => {
      t(da)
  }
  )
}
function fk({...e}) {
  const t = uk()
    , n = i => No({
      type: "UPDATE_TOAST",
      toast: {
          ...i,
          id: t
      }
  })
    , r = () => No({
      type: "DISMISS_TOAST",
      toastId: t
  });
  return No({
      type: "ADD_TOAST",
      toast: {
          ...e,
          id: t,
          open: !0,
          onOpenChange: i => {
              i || r()
          }
      }
  }),
  {
      id: t,
      dismiss: r,
      update: n
  }
}
function hk() {
  const [e,t] = x.useState(da);
  return x.useEffect( () => (ua.push(t),
  () => {
      const n = ua.indexOf(t);
      n > -1 && ua.splice(n, 1)
  }
  ), [e]),
  {
      ...e,
      toast: fk,
      dismiss: n => No({
          type: "DISMISS_TOAST",
          toastId: n
      })
  }
}
function ne(e, t, {checkForDefaultPrevented: n=!0}={}) {
  return function(i) {
      if (e == null || e(i),
      n === !1 || !i.defaultPrevented)
          return t == null ? void 0 : t(i)
  }
}
function Fp(e, t) {
  if (typeof e == "function")
      return e(t);
  e != null && (e.current = t)
}
function d0(...e) {
  return t => {
      let n = !1;
      const r = e.map(i => {
          const o = Fp(i, t);
          return !n && typeof o == "function" && (n = !0),
          o
      }
      );
      if (n)
          return () => {
              for (let i = 0; i < r.length; i++) {
                  const o = r[i];
                  typeof o == "function" ? o() : Fp(e[i], null)
              }
          }
  }
}
function be(...e) {
  return x.useCallback(d0(...e), e)
}
function hr(e, t=[]) {
  let n = [];
  function r(o, s) {
      const a = x.createContext(s)
        , l = n.length;
      n = [...n, s];
      const c = d => {
          var m;
          const {scope: f, children: p, ...b} = d
            , y = ((m = f == null ? void 0 : f[e]) == null ? void 0 : m[l]) || a
            , w = x.useMemo( () => b, Object.values(b));
          return h.jsx(y.Provider, {
              value: w,
              children: p
          })
      }
      ;
      c.displayName = o + "Provider";
      function u(d, f) {
          var y;
          const p = ((y = f == null ? void 0 : f[e]) == null ? void 0 : y[l]) || a
            , b = x.useContext(p);
          if (b)
              return b;
          if (s !== void 0)
              return s;
          throw new Error(`\`${d}\` must be used within \`${o}\``)
      }
      return [c, u]
  }
  const i = () => {
      const o = n.map(s => x.createContext(s));
      return function(a) {
          const l = (a == null ? void 0 : a[e]) || o;
          return x.useMemo( () => ({
              [`__scope${e}`]: {
                  ...a,
                  [e]: l
              }
          }), [a, l])
      }
  }
  ;
  return i.scopeName = e,
  [r, pk(i, ...t)]
}
function pk(...e) {
  const t = e[0];
  if (e.length === 1)
      return t;
  const n = () => {
      const r = e.map(i => ({
          useScope: i(),
          scopeName: i.scopeName
      }));
      return function(o) {
          const s = r.reduce( (a, {useScope: l, scopeName: c}) => {
              const d = l(o)[`__scope${c}`];
              return {
                  ...a,
                  ...d
              }
          }
          , {});
          return x.useMemo( () => ({
              [`__scope${t.scopeName}`]: s
          }), [s])
      }
  }
  ;
  return n.scopeName = t.scopeName,
  n
}
function Mu(e) {
  const t = mk(e)
    , n = x.forwardRef( (r, i) => {
      const {children: o, ...s} = r
        , a = x.Children.toArray(o)
        , l = a.find(yk);
      if (l) {
          const c = l.props.children
            , u = a.map(d => d === l ? x.Children.count(c) > 1 ? x.Children.only(null) : x.isValidElement(c) ? c.props.children : null : d);
          return h.jsx(t, {
              ...s,
              ref: i,
              children: x.isValidElement(c) ? x.cloneElement(c, void 0, u) : null
          })
      }
      return h.jsx(t, {
          ...s,
          ref: i,
          children: o
      })
  }
  );
  return n.displayName = `${e}.Slot`,
  n
}
function mk(e) {
  const t = x.forwardRef( (n, r) => {
      const {children: i, ...o} = n;
      if (x.isValidElement(i)) {
          const s = xk(i)
            , a = vk(o, i.props);
          return i.type !== x.Fragment && (a.ref = r ? d0(r, s) : s),
          x.cloneElement(i, a)
      }
      return x.Children.count(i) > 1 ? x.Children.only(null) : null
  }
  );
  return t.displayName = `${e}.SlotClone`,
  t
}
var f0 = Symbol("radix.slottable");
function gk(e) {
  const t = ({children: n}) => h.jsx(h.Fragment, {
      children: n
  });
  return t.displayName = `${e}.Slottable`,
  t.__radixId = f0,
  t
}
function yk(e) {
  return x.isValidElement(e) && typeof e.type == "function" && "__radixId"in e.type && e.type.__radixId === f0
}
function vk(e, t) {
  const n = {
      ...t
  };
  for (const r in t) {
      const i = e[r]
        , o = t[r];
      /^on[A-Z]/.test(r) ? i && o ? n[r] = (...a) => {
          const l = o(...a);
          return i(...a),
          l
      }
      : i && (n[r] = i) : r === "style" ? n[r] = {
          ...i,
          ...o
      } : r === "className" && (n[r] = [i, o].filter(Boolean).join(" "))
  }
  return {
      ...e,
      ...n
  }
}
function xk(e) {
  var r, i;
  let t = (r = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : r.get
    , n = t && "isReactWarning"in t && t.isReactWarning;
  return n ? e.ref : (t = (i = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : i.get,
  n = t && "isReactWarning"in t && t.isReactWarning,
  n ? e.props.ref : e.props.ref || e.ref)
}
function yf(e) {
  const t = e + "CollectionProvider"
    , [n,r] = hr(t)
    , [i,o] = n(t, {
      collectionRef: {
          current: null
      },
      itemMap: new Map
  })
    , s = y => {
      const {scope: w, children: m} = y
        , g = M.useRef(null)
        , v = M.useRef(new Map).current;
      return h.jsx(i, {
          scope: w,
          itemMap: v,
          collectionRef: g,
          children: m
      })
  }
  ;
  s.displayName = t;
  const a = e + "CollectionSlot"
    , l = Mu(a)
    , c = M.forwardRef( (y, w) => {
      const {scope: m, children: g} = y
        , v = o(a, m)
        , S = be(w, v.collectionRef);
      return h.jsx(l, {
          ref: S,
          children: g
      })
  }
  );
  c.displayName = a;
  const u = e + "CollectionItemSlot"
    , d = "data-radix-collection-item"
    , f = Mu(u)
    , p = M.forwardRef( (y, w) => {
      const {scope: m, children: g, ...v} = y
        , S = M.useRef(null)
        , C = be(w, S)
        , k = o(u, m);
      return M.useEffect( () => (k.itemMap.set(S, {
          ref: S,
          ...v
      }),
      () => void k.itemMap.delete(S))),
      h.jsx(f, {
          [d]: "",
          ref: C,
          children: g
      })
  }
  );
  p.displayName = u;
  function b(y) {
      const w = o(e + "CollectionConsumer", y);
      return M.useCallback( () => {
          const g = w.collectionRef.current;
          if (!g)
              return [];
          const v = Array.from(g.querySelectorAll(`[${d}]`));
          return Array.from(w.itemMap.values()).sort( (k, E) => v.indexOf(k.ref.current) - v.indexOf(E.ref.current))
      }
      , [w.collectionRef, w.itemMap])
  }
  return [{
      Provider: s,
      Slot: c,
      ItemSlot: p
  }, b, r]
}
var wk = ["a", "button", "div", "form", "h2", "h3", "img", "input", "label", "li", "nav", "ol", "p", "select", "span", "svg", "ul"]
, oe = wk.reduce( (e, t) => {
  const n = Mu(`Primitive.${t}`)
    , r = x.forwardRef( (i, o) => {
      const {asChild: s, ...a} = i
        , l = s ? n : t;
      return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0),
      h.jsx(l, {
          ...a,
          ref: o
      })
  }
  );
  return r.displayName = `Primitive.${t}`,
  {
      ...e,
      [t]: r
  }
}
, {});
function h0(e, t) {
  e && hs.flushSync( () => e.dispatchEvent(t))
}
function or(e) {
  const t = x.useRef(e);
  return x.useEffect( () => {
      t.current = e
  }
  ),
  x.useMemo( () => (...n) => {
      var r;
      return (r = t.current) == null ? void 0 : r.call(t, ...n)
  }
  , [])
}
function bk(e, t=globalThis == null ? void 0 : globalThis.document) {
  const n = or(e);
  x.useEffect( () => {
      const r = i => {
          i.key === "Escape" && n(i)
      }
      ;
      return t.addEventListener("keydown", r, {
          capture: !0
      }),
      () => t.removeEventListener("keydown", r, {
          capture: !0
      })
  }
  , [n, t])
}
var Sk = "DismissableLayer", Du = "dismissableLayer.update", Ck = "dismissableLayer.pointerDownOutside", kk = "dismissableLayer.focusOutside", Bp, p0 = x.createContext({
  layers: new Set,
  layersWithOutsidePointerEventsDisabled: new Set,
  branches: new Set
}), vf = x.forwardRef( (e, t) => {
  const {disableOutsidePointerEvents: n=!1, onEscapeKeyDown: r, onPointerDownOutside: i, onFocusOutside: o, onInteractOutside: s, onDismiss: a, ...l} = e
    , c = x.useContext(p0)
    , [u,d] = x.useState(null)
    , f = (u == null ? void 0 : u.ownerDocument) ?? (globalThis == null ? void 0 : globalThis.document)
    , [,p] = x.useState({})
    , b = be(t, E => d(E))
    , y = Array.from(c.layers)
    , [w] = [...c.layersWithOutsidePointerEventsDisabled].slice(-1)
    , m = y.indexOf(w)
    , g = u ? y.indexOf(u) : -1
    , v = c.layersWithOutsidePointerEventsDisabled.size > 0
    , S = g >= m
    , C = Pk(E => {
      const P = E.target
        , j = [...c.branches].some(R => R.contains(P));
      !S || j || (i == null || i(E),
      s == null || s(E),
      E.defaultPrevented || a == null || a())
  }
  , f)
    , k = Tk(E => {
      const P = E.target;
      [...c.branches].some(R => R.contains(P)) || (o == null || o(E),
      s == null || s(E),
      E.defaultPrevented || a == null || a())
  }
  , f);
  return bk(E => {
      g === c.layers.size - 1 && (r == null || r(E),
      !E.defaultPrevented && a && (E.preventDefault(),
      a()))
  }
  , f),
  x.useEffect( () => {
      if (u)
          return n && (c.layersWithOutsidePointerEventsDisabled.size === 0 && (Bp = f.body.style.pointerEvents,
          f.body.style.pointerEvents = "none"),
          c.layersWithOutsidePointerEventsDisabled.add(u)),
          c.layers.add(u),
          $p(),
          () => {
              n && c.layersWithOutsidePointerEventsDisabled.size === 1 && (f.body.style.pointerEvents = Bp)
          }
  }
  , [u, f, n, c]),
  x.useEffect( () => () => {
      u && (c.layers.delete(u),
      c.layersWithOutsidePointerEventsDisabled.delete(u),
      $p())
  }
  , [u, c]),
  x.useEffect( () => {
      const E = () => p({});
      return document.addEventListener(Du, E),
      () => document.removeEventListener(Du, E)
  }
  , []),
  h.jsx(oe.div, {
      ...l,
      ref: b,
      style: {
          pointerEvents: v ? S ? "auto" : "none" : void 0,
          ...e.style
      },
      onFocusCapture: ne(e.onFocusCapture, k.onFocusCapture),
      onBlurCapture: ne(e.onBlurCapture, k.onBlurCapture),
      onPointerDownCapture: ne(e.onPointerDownCapture, C.onPointerDownCapture)
  })
}
);
vf.displayName = Sk;
var Ek = "DismissableLayerBranch"
, m0 = x.forwardRef( (e, t) => {
  const n = x.useContext(p0)
    , r = x.useRef(null)
    , i = be(t, r);
  return x.useEffect( () => {
      const o = r.current;
      if (o)
          return n.branches.add(o),
          () => {
              n.branches.delete(o)
          }
  }
  , [n.branches]),
  h.jsx(oe.div, {
      ...e,
      ref: i
  })
}
);
m0.displayName = Ek;
function Pk(e, t=globalThis == null ? void 0 : globalThis.document) {
  const n = or(e)
    , r = x.useRef(!1)
    , i = x.useRef( () => {}
  );
  return x.useEffect( () => {
      const o = a => {
          if (a.target && !r.current) {
              let l = function() {
                  g0(Ck, n, c, {
                      discrete: !0
                  })
              };
              const c = {
                  originalEvent: a
              };
              a.pointerType === "touch" ? (t.removeEventListener("click", i.current),
              i.current = l,
              t.addEventListener("click", i.current, {
                  once: !0
              })) : l()
          } else
              t.removeEventListener("click", i.current);
          r.current = !1
      }
        , s = window.setTimeout( () => {
          t.addEventListener("pointerdown", o)
      }
      , 0);
      return () => {
          window.clearTimeout(s),
          t.removeEventListener("pointerdown", o),
          t.removeEventListener("click", i.current)
      }
  }
  , [t, n]),
  {
      onPointerDownCapture: () => r.current = !0
  }
}
function Tk(e, t=globalThis == null ? void 0 : globalThis.document) {
  const n = or(e)
    , r = x.useRef(!1);
  return x.useEffect( () => {
      const i = o => {
          o.target && !r.current && g0(kk, n, {
              originalEvent: o
          }, {
              discrete: !1
          })
      }
      ;
      return t.addEventListener("focusin", i),
      () => t.removeEventListener("focusin", i)
  }
  , [t, n]),
  {
      onFocusCapture: () => r.current = !0,
      onBlurCapture: () => r.current = !1
  }
}
function $p() {
  const e = new CustomEvent(Du);
  document.dispatchEvent(e)
}
function g0(e, t, n, {discrete: r}) {
  const i = n.originalEvent.target
    , o = new CustomEvent(e,{
      bubbles: !1,
      cancelable: !0,
      detail: n
  });
  t && i.addEventListener(e, t, {
      once: !0
  }),
  r ? h0(i, o) : i.dispatchEvent(o)
}
var Ak = vf
, Nk = m0
, nn = globalThis != null && globalThis.document ? x.useLayoutEffect : () => {}
, Rk = "Portal"
, y0 = x.forwardRef( (e, t) => {
  var a;
  const {container: n, ...r} = e
    , [i,o] = x.useState(!1);
  nn( () => o(!0), []);
  const s = n || i && ((a = globalThis == null ? void 0 : globalThis.document) == null ? void 0 : a.body);
  return s ? c0.createPortal(h.jsx(oe.div, {
      ...r,
      ref: t
  }), s) : null
}
);
y0.displayName = Rk;
function jk(e, t) {
  return x.useReducer( (n, r) => t[n][r] ?? n, e)
}
var ps = e => {
  const {present: t, children: n} = e
    , r = Mk(t)
    , i = typeof n == "function" ? n({
      present: r.isPresent
  }) : x.Children.only(n)
    , o = be(r.ref, Dk(i));
  return typeof n == "function" || r.isPresent ? x.cloneElement(i, {
      ref: o
  }) : null
}
;
ps.displayName = "Presence";
function Mk(e) {
  const [t,n] = x.useState()
    , r = x.useRef(null)
    , i = x.useRef(e)
    , o = x.useRef("none")
    , s = e ? "mounted" : "unmounted"
    , [a,l] = jk(s, {
      mounted: {
          UNMOUNT: "unmounted",
          ANIMATION_OUT: "unmountSuspended"
      },
      unmountSuspended: {
          MOUNT: "mounted",
          ANIMATION_END: "unmounted"
      },
      unmounted: {
          MOUNT: "mounted"
      }
  });
  return x.useEffect( () => {
      const c = Us(r.current);
      o.current = a === "mounted" ? c : "none"
  }
  , [a]),
  nn( () => {
      const c = r.current
        , u = i.current;
      if (u !== e) {
          const f = o.current
            , p = Us(c);
          e ? l("MOUNT") : p === "none" || (c == null ? void 0 : c.display) === "none" ? l("UNMOUNT") : l(u && f !== p ? "ANIMATION_OUT" : "UNMOUNT"),
          i.current = e
      }
  }
  , [e, l]),
  nn( () => {
      if (t) {
          let c;
          const u = t.ownerDocument.defaultView ?? window
            , d = p => {
              const y = Us(r.current).includes(p.animationName);
              if (p.target === t && y && (l("ANIMATION_END"),
              !i.current)) {
                  const w = t.style.animationFillMode;
                  t.style.animationFillMode = "forwards",
                  c = u.setTimeout( () => {
                      t.style.animationFillMode === "forwards" && (t.style.animationFillMode = w)
                  }
                  )
              }
          }
            , f = p => {
              p.target === t && (o.current = Us(r.current))
          }
          ;
          return t.addEventListener("animationstart", f),
          t.addEventListener("animationcancel", d),
          t.addEventListener("animationend", d),
          () => {
              u.clearTimeout(c),
              t.removeEventListener("animationstart", f),
              t.removeEventListener("animationcancel", d),
              t.removeEventListener("animationend", d)
          }
      } else
          l("ANIMATION_END")
  }
  , [t, l]),
  {
      isPresent: ["mounted", "unmountSuspended"].includes(a),
      ref: x.useCallback(c => {
          r.current = c ? getComputedStyle(c) : null,
          n(c)
      }
      , [])
  }
}
function Us(e) {
  return (e == null ? void 0 : e.animationName) || "none"
}
function Dk(e) {
  var r, i;
  let t = (r = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : r.get
    , n = t && "isReactWarning"in t && t.isReactWarning;
  return n ? e.ref : (t = (i = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : i.get,
  n = t && "isReactWarning"in t && t.isReactWarning,
  n ? e.props.ref : e.props.ref || e.ref)
}
var Ik = Ed[" useInsertionEffect ".trim().toString()] || nn;
function Ki({prop: e, defaultProp: t, onChange: n= () => {}
, caller: r}) {
  const [i,o,s] = Lk({
      defaultProp: t,
      onChange: n
  })
    , a = e !== void 0
    , l = a ? e : i;
  {
      const u = x.useRef(e !== void 0);
      x.useEffect( () => {
          const d = u.current;
          d !== a && console.warn(`${r} is changing from ${d ? "controlled" : "uncontrolled"} to ${a ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`),
          u.current = a
      }
      , [a, r])
  }
  const c = x.useCallback(u => {
      var d;
      if (a) {
          const f = Ok(u) ? u(e) : u;
          f !== e && ((d = s.current) == null || d.call(s, f))
      } else
          o(u)
  }
  , [a, e, o, s]);
  return [l, c]
}
function Lk({defaultProp: e, onChange: t}) {
  const [n,r] = x.useState(e)
    , i = x.useRef(n)
    , o = x.useRef(t);
  return Ik( () => {
      o.current = t
  }
  , [t]),
  x.useEffect( () => {
      var s;
      i.current !== n && ((s = o.current) == null || s.call(o, n),
      i.current = n)
  }
  , [n, i]),
  [n, r, o]
}
function Ok(e) {
  return typeof e == "function"
}
var zk = Object.freeze({
  position: "absolute",
  border: 0,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  wordWrap: "normal"
})
, _k = "VisuallyHidden"
, vl = x.forwardRef( (e, t) => h.jsx(oe.span, {
  ...e,
  ref: t,
  style: {
      ...zk,
      ...e.style
  }
}));
vl.displayName = _k;
var Vk = vl
, xf = "ToastProvider"
, [wf,Fk,Bk] = yf("Toast")
, [v0,SI] = hr("Toast", [Bk])
, [$k,xl] = v0(xf)
, x0 = e => {
  const {__scopeToast: t, label: n="Notification", duration: r=5e3, swipeDirection: i="right", swipeThreshold: o=50, children: s} = e
    , [a,l] = x.useState(null)
    , [c,u] = x.useState(0)
    , d = x.useRef(!1)
    , f = x.useRef(!1);
  return n.trim() || console.error(`Invalid prop \`label\` supplied to \`${xf}\`. Expected non-empty \`string\`.`),
  h.jsx(wf.Provider, {
      scope: t,
      children: h.jsx($k, {
          scope: t,
          label: n,
          duration: r,
          swipeDirection: i,
          swipeThreshold: o,
          toastCount: c,
          viewport: a,
          onViewportChange: l,
          onToastAdd: x.useCallback( () => u(p => p + 1), []),
          onToastRemove: x.useCallback( () => u(p => p - 1), []),
          isFocusedToastEscapeKeyDownRef: d,
          isClosePausedRef: f,
          children: s
      })
  })
}
;
x0.displayName = xf;
var w0 = "ToastViewport"
, Uk = ["F8"]
, Iu = "toast.viewportPause"
, Lu = "toast.viewportResume"
, b0 = x.forwardRef( (e, t) => {
  const {__scopeToast: n, hotkey: r=Uk, label: i="Notifications ({hotkey})", ...o} = e
    , s = xl(w0, n)
    , a = Fk(n)
    , l = x.useRef(null)
    , c = x.useRef(null)
    , u = x.useRef(null)
    , d = x.useRef(null)
    , f = be(t, d, s.onViewportChange)
    , p = r.join("+").replace(/Key/g, "").replace(/Digit/g, "")
    , b = s.toastCount > 0;
  x.useEffect( () => {
      const w = m => {
          var v;
          r.length !== 0 && r.every(S => m[S] || m.code === S) && ((v = d.current) == null || v.focus())
      }
      ;
      return document.addEventListener("keydown", w),
      () => document.removeEventListener("keydown", w)
  }
  , [r]),
  x.useEffect( () => {
      const w = l.current
        , m = d.current;
      if (b && w && m) {
          const g = () => {
              if (!s.isClosePausedRef.current) {
                  const k = new CustomEvent(Iu);
                  m.dispatchEvent(k),
                  s.isClosePausedRef.current = !0
              }
          }
            , v = () => {
              if (s.isClosePausedRef.current) {
                  const k = new CustomEvent(Lu);
                  m.dispatchEvent(k),
                  s.isClosePausedRef.current = !1
              }
          }
            , S = k => {
              !w.contains(k.relatedTarget) && v()
          }
            , C = () => {
              w.contains(document.activeElement) || v()
          }
          ;
          return w.addEventListener("focusin", g),
          w.addEventListener("focusout", S),
          w.addEventListener("pointermove", g),
          w.addEventListener("pointerleave", C),
          window.addEventListener("blur", g),
          window.addEventListener("focus", v),
          () => {
              w.removeEventListener("focusin", g),
              w.removeEventListener("focusout", S),
              w.removeEventListener("pointermove", g),
              w.removeEventListener("pointerleave", C),
              window.removeEventListener("blur", g),
              window.removeEventListener("focus", v)
          }
      }
  }
  , [b, s.isClosePausedRef]);
  const y = x.useCallback( ({tabbingDirection: w}) => {
      const g = a().map(v => {
          const S = v.ref.current
            , C = [S, ...nE(S)];
          return w === "forwards" ? C : C.reverse()
      }
      );
      return (w === "forwards" ? g.reverse() : g).flat()
  }
  , [a]);
  return x.useEffect( () => {
      const w = d.current;
      if (w) {
          const m = g => {
              var C, k, E;
              const v = g.altKey || g.ctrlKey || g.metaKey;
              if (g.key === "Tab" && !v) {
                  const P = document.activeElement
                    , j = g.shiftKey;
                  if (g.target === w && j) {
                      (C = c.current) == null || C.focus();
                      return
                  }
                  const L = y({
                      tabbingDirection: j ? "backwards" : "forwards"
                  })
                    , W = L.findIndex(I => I === P);
                  xc(L.slice(W + 1)) ? g.preventDefault() : j ? (k = c.current) == null || k.focus() : (E = u.current) == null || E.focus()
              }
          }
          ;
          return w.addEventListener("keydown", m),
          () => w.removeEventListener("keydown", m)
      }
  }
  , [a, y]),
  h.jsxs(Nk, {
      ref: l,
      role: "region",
      "aria-label": i.replace("{hotkey}", p),
      tabIndex: -1,
      style: {
          pointerEvents: b ? void 0 : "none"
      },
      children: [b && h.jsx(Ou, {
          ref: c,
          onFocusFromOutsideViewport: () => {
              const w = y({
                  tabbingDirection: "forwards"
              });
              xc(w)
          }
      }), h.jsx(wf.Slot, {
          scope: n,
          children: h.jsx(oe.ol, {
              tabIndex: -1,
              ...o,
              ref: f
          })
      }), b && h.jsx(Ou, {
          ref: u,
          onFocusFromOutsideViewport: () => {
              const w = y({
                  tabbingDirection: "backwards"
              });
              xc(w)
          }
      })]
  })
}
);
b0.displayName = w0;
var S0 = "ToastFocusProxy"
, Ou = x.forwardRef( (e, t) => {
  const {__scopeToast: n, onFocusFromOutsideViewport: r, ...i} = e
    , o = xl(S0, n);
  return h.jsx(vl, {
      "aria-hidden": !0,
      tabIndex: 0,
      ...i,
      ref: t,
      style: {
          position: "fixed"
      },
      onFocus: s => {
          var c;
          const a = s.relatedTarget;
          !((c = o.viewport) != null && c.contains(a)) && r()
      }
  })
}
);
Ou.displayName = S0;
var ms = "Toast"
, Wk = "toast.swipeStart"
, Hk = "toast.swipeMove"
, Kk = "toast.swipeCancel"
, qk = "toast.swipeEnd"
, C0 = x.forwardRef( (e, t) => {
  const {forceMount: n, open: r, defaultOpen: i, onOpenChange: o, ...s} = e
    , [a,l] = Ki({
      prop: r,
      defaultProp: i ?? !0,
      onChange: o,
      caller: ms
  });
  return h.jsx(ps, {
      present: n || a,
      children: h.jsx(Yk, {
          open: a,
          ...s,
          ref: t,
          onClose: () => l(!1),
          onPause: or(e.onPause),
          onResume: or(e.onResume),
          onSwipeStart: ne(e.onSwipeStart, c => {
              c.currentTarget.setAttribute("data-swipe", "start")
          }
          ),
          onSwipeMove: ne(e.onSwipeMove, c => {
              const {x: u, y: d} = c.detail.delta;
              c.currentTarget.setAttribute("data-swipe", "move"),
              c.currentTarget.style.setProperty("--radix-toast-swipe-move-x", `${u}px`),
              c.currentTarget.style.setProperty("--radix-toast-swipe-move-y", `${d}px`)
          }
          ),
          onSwipeCancel: ne(e.onSwipeCancel, c => {
              c.currentTarget.setAttribute("data-swipe", "cancel"),
              c.currentTarget.style.removeProperty("--radix-toast-swipe-move-x"),
              c.currentTarget.style.removeProperty("--radix-toast-swipe-move-y"),
              c.currentTarget.style.removeProperty("--radix-toast-swipe-end-x"),
              c.currentTarget.style.removeProperty("--radix-toast-swipe-end-y")
          }
          ),
          onSwipeEnd: ne(e.onSwipeEnd, c => {
              const {x: u, y: d} = c.detail.delta;
              c.currentTarget.setAttribute("data-swipe", "end"),
              c.currentTarget.style.removeProperty("--radix-toast-swipe-move-x"),
              c.currentTarget.style.removeProperty("--radix-toast-swipe-move-y"),
              c.currentTarget.style.setProperty("--radix-toast-swipe-end-x", `${u}px`),
              c.currentTarget.style.setProperty("--radix-toast-swipe-end-y", `${d}px`),
              l(!1)
          }
          )
      })
  })
}
);
C0.displayName = ms;
var [Gk,Qk] = v0(ms, {
  onClose() {}
})
, Yk = x.forwardRef( (e, t) => {
  const {__scopeToast: n, type: r="foreground", duration: i, open: o, onClose: s, onEscapeKeyDown: a, onPause: l, onResume: c, onSwipeStart: u, onSwipeMove: d, onSwipeCancel: f, onSwipeEnd: p, ...b} = e
    , y = xl(ms, n)
    , [w,m] = x.useState(null)
    , g = be(t, I => m(I))
    , v = x.useRef(null)
    , S = x.useRef(null)
    , C = i || y.duration
    , k = x.useRef(0)
    , E = x.useRef(C)
    , P = x.useRef(0)
    , {onToastAdd: j, onToastRemove: R} = y
    , z = or( () => {
      var K;
      (w == null ? void 0 : w.contains(document.activeElement)) && ((K = y.viewport) == null || K.focus()),
      s()
  }
  )
    , L = x.useCallback(I => {
      !I || I === 1 / 0 || (window.clearTimeout(P.current),
      k.current = new Date().getTime(),
      P.current = window.setTimeout(z, I))
  }
  , [z]);
  x.useEffect( () => {
      const I = y.viewport;
      if (I) {
          const K = () => {
              L(E.current),
              c == null || c()
          }
            , $ = () => {
              const V = new Date().getTime() - k.current;
              E.current = E.current - V,
              window.clearTimeout(P.current),
              l == null || l()
          }
          ;
          return I.addEventListener(Iu, $),
          I.addEventListener(Lu, K),
          () => {
              I.removeEventListener(Iu, $),
              I.removeEventListener(Lu, K)
          }
      }
  }
  , [y.viewport, C, l, c, L]),
  x.useEffect( () => {
      o && !y.isClosePausedRef.current && L(C)
  }
  , [o, C, y.isClosePausedRef, L]),
  x.useEffect( () => (j(),
  () => R()), [j, R]);
  const W = x.useMemo( () => w ? R0(w) : null, [w]);
  return y.viewport ? h.jsxs(h.Fragment, {
      children: [W && h.jsx(Zk, {
          __scopeToast: n,
          role: "status",
          "aria-live": r === "foreground" ? "assertive" : "polite",
          "aria-atomic": !0,
          children: W
      }), h.jsx(Gk, {
          scope: n,
          onClose: z,
          children: hs.createPortal(h.jsx(wf.ItemSlot, {
              scope: n,
              children: h.jsx(Ak, {
                  asChild: !0,
                  onEscapeKeyDown: ne(a, () => {
                      y.isFocusedToastEscapeKeyDownRef.current || z(),
                      y.isFocusedToastEscapeKeyDownRef.current = !1
                  }
                  ),
                  children: h.jsx(oe.li, {
                      role: "status",
                      "aria-live": "off",
                      "aria-atomic": !0,
                      tabIndex: 0,
                      "data-state": o ? "open" : "closed",
                      "data-swipe-direction": y.swipeDirection,
                      ...b,
                      ref: g,
                      style: {
                          userSelect: "none",
                          touchAction: "none",
                          ...e.style
                      },
                      onKeyDown: ne(e.onKeyDown, I => {
                          I.key === "Escape" && (a == null || a(I.nativeEvent),
                          I.nativeEvent.defaultPrevented || (y.isFocusedToastEscapeKeyDownRef.current = !0,
                          z()))
                      }
                      ),
                      onPointerDown: ne(e.onPointerDown, I => {
                          I.button === 0 && (v.current = {
                              x: I.clientX,
                              y: I.clientY
                          })
                      }
                      ),
                      onPointerMove: ne(e.onPointerMove, I => {
                          if (!v.current)
                              return;
                          const K = I.clientX - v.current.x
                            , $ = I.clientY - v.current.y
                            , V = !!S.current
                            , T = ["left", "right"].includes(y.swipeDirection)
                            , N = ["left", "up"].includes(y.swipeDirection) ? Math.min : Math.max
                            , O = T ? N(0, K) : 0
                            , H = T ? 0 : N(0, $)
                            , U = I.pointerType === "touch" ? 10 : 2
                            , Y = {
                              x: O,
                              y: H
                          }
                            , X = {
                              originalEvent: I,
                              delta: Y
                          };
                          V ? (S.current = Y,
                          Ws(Hk, d, X, {
                              discrete: !1
                          })) : Up(Y, y.swipeDirection, U) ? (S.current = Y,
                          Ws(Wk, u, X, {
                              discrete: !1
                          }),
                          I.target.setPointerCapture(I.pointerId)) : (Math.abs(K) > U || Math.abs($) > U) && (v.current = null)
                      }
                      ),
                      onPointerUp: ne(e.onPointerUp, I => {
                          const K = S.current
                            , $ = I.target;
                          if ($.hasPointerCapture(I.pointerId) && $.releasePointerCapture(I.pointerId),
                          S.current = null,
                          v.current = null,
                          K) {
                              const V = I.currentTarget
                                , T = {
                                  originalEvent: I,
                                  delta: K
                              };
                              Up(K, y.swipeDirection, y.swipeThreshold) ? Ws(qk, p, T, {
                                  discrete: !0
                              }) : Ws(Kk, f, T, {
                                  discrete: !0
                              }),
                              V.addEventListener("click", N => N.preventDefault(), {
                                  once: !0
                              })
                          }
                      }
                      )
                  })
              })
          }), y.viewport)
      })]
  }) : null
}
)
, Zk = e => {
  const {__scopeToast: t, children: n, ...r} = e
    , i = xl(ms, t)
    , [o,s] = x.useState(!1)
    , [a,l] = x.useState(!1);
  return eE( () => s(!0)),
  x.useEffect( () => {
      const c = window.setTimeout( () => l(!0), 1e3);
      return () => window.clearTimeout(c)
  }
  , []),
  a ? null : h.jsx(y0, {
      asChild: !0,
      children: h.jsx(vl, {
          ...r,
          children: o && h.jsxs(h.Fragment, {
              children: [i.label, " ", n]
          })
      })
  })
}
, Xk = "ToastTitle"
, k0 = x.forwardRef( (e, t) => {
  const {__scopeToast: n, ...r} = e;
  return h.jsx(oe.div, {
      ...r,
      ref: t
  })
}
);
k0.displayName = Xk;
var Jk = "ToastDescription"
, E0 = x.forwardRef( (e, t) => {
  const {__scopeToast: n, ...r} = e;
  return h.jsx(oe.div, {
      ...r,
      ref: t
  })
}
);
E0.displayName = Jk;
var P0 = "ToastAction"
, T0 = x.forwardRef( (e, t) => {
  const {altText: n, ...r} = e;
  return n.trim() ? h.jsx(N0, {
      altText: n,
      asChild: !0,
      children: h.jsx(bf, {
          ...r,
          ref: t
      })
  }) : (console.error(`Invalid prop \`altText\` supplied to \`${P0}\`. Expected non-empty \`string\`.`),
  null)
}
);
T0.displayName = P0;
var A0 = "ToastClose"
, bf = x.forwardRef( (e, t) => {
  const {__scopeToast: n, ...r} = e
    , i = Qk(A0, n);
  return h.jsx(N0, {
      asChild: !0,
      children: h.jsx(oe.button, {
          type: "button",
          ...r,
          ref: t,
          onClick: ne(e.onClick, i.onClose)
      })
  })
}
);
bf.displayName = A0;
var N0 = x.forwardRef( (e, t) => {
  const {__scopeToast: n, altText: r, ...i} = e;
  return h.jsx(oe.div, {
      "data-radix-toast-announce-exclude": "",
      "data-radix-toast-announce-alt": r || void 0,
      ...i,
      ref: t
  })
}
);
function R0(e) {
  const t = [];
  return Array.from(e.childNodes).forEach(r => {
      if (r.nodeType === r.TEXT_NODE && r.textContent && t.push(r.textContent),
      tE(r)) {
          const i = r.ariaHidden || r.hidden || r.style.display === "none"
            , o = r.dataset.radixToastAnnounceExclude === "";
          if (!i)
              if (o) {
                  const s = r.dataset.radixToastAnnounceAlt;
                  s && t.push(s)
              } else
                  t.push(...R0(r))
      }
  }
  ),
  t
}
function Ws(e, t, n, {discrete: r}) {
  const i = n.originalEvent.currentTarget
    , o = new CustomEvent(e,{
      bubbles: !0,
      cancelable: !0,
      detail: n
  });
  t && i.addEventListener(e, t, {
      once: !0
  }),
  r ? h0(i, o) : i.dispatchEvent(o)
}
var Up = (e, t, n=0) => {
  const r = Math.abs(e.x)
    , i = Math.abs(e.y)
    , o = r > i;
  return t === "left" || t === "right" ? o && r > n : !o && i > n
}
;
function eE(e= () => {}
) {
  const t = or(e);
  nn( () => {
      let n = 0
        , r = 0;
      return n = window.requestAnimationFrame( () => r = window.requestAnimationFrame(t)),
      () => {
          window.cancelAnimationFrame(n),
          window.cancelAnimationFrame(r)
      }
  }
  , [t])
}
function tE(e) {
  return e.nodeType === e.ELEMENT_NODE
}
function nE(e) {
  const t = []
    , n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
      acceptNode: r => {
          const i = r.tagName === "INPUT" && r.type === "hidden";
          return r.disabled || r.hidden || i ? NodeFilter.FILTER_SKIP : r.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
      }
  });
  for (; n.nextNode(); )
      t.push(n.currentNode);
  return t
}
function xc(e) {
  const t = document.activeElement;
  return e.some(n => n === t ? !0 : (n.focus(),
  document.activeElement !== t))
}
var rE = x0
, j0 = b0
, M0 = C0
, D0 = k0
, I0 = E0
, L0 = T0
, O0 = bf;
function z0(e) {
  var t, n, r = "";
  if (typeof e == "string" || typeof e == "number")
      r += e;
  else if (typeof e == "object")
      if (Array.isArray(e)) {
          var i = e.length;
          for (t = 0; t < i; t++)
              e[t] && (n = z0(e[t])) && (r && (r += " "),
              r += n)
      } else
          for (n in e)
              e[n] && (r && (r += " "),
              r += n);
  return r
}
function _0() {
  for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++)
      (e = arguments[n]) && (t = z0(e)) && (r && (r += " "),
      r += t);
  return r
}
const Wp = e => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e
, Hp = _0
, iE = (e, t) => n => {
  var r;
  if ((t == null ? void 0 : t.variants) == null)
      return Hp(e, n == null ? void 0 : n.class, n == null ? void 0 : n.className);
  const {variants: i, defaultVariants: o} = t
    , s = Object.keys(i).map(c => {
      const u = n == null ? void 0 : n[c]
        , d = o == null ? void 0 : o[c];
      if (u === null)
          return null;
      const f = Wp(u) || Wp(d);
      return i[c][f]
  }
  )
    , a = n && Object.entries(n).reduce( (c, u) => {
      let[d,f] = u;
      return f === void 0 || (c[d] = f),
      c
  }
  , {})
    , l = t == null || (r = t.compoundVariants) === null || r === void 0 ? void 0 : r.reduce( (c, u) => {
      let {class: d, className: f, ...p} = u;
      return Object.entries(p).every(b => {
          let[y,w] = b;
          return Array.isArray(w) ? w.includes({
              ...o,
              ...a
          }[y]) : {
              ...o,
              ...a
          }[y] === w
      }
      ) ? [...c, d, f] : c
  }
  , []);
  return Hp(e, s, l, n == null ? void 0 : n.class, n == null ? void 0 : n.className)
}
;
/**
* @license lucide-react v0.462.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const oE = e => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()
, V0 = (...e) => e.filter( (t, n, r) => !!t && t.trim() !== "" && r.indexOf(t) === n).join(" ").trim();
/**
* @license lucide-react v0.462.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var sE = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
/**
* @license lucide-react v0.462.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const aE = x.forwardRef( ({color: e="currentColor", size: t=24, strokeWidth: n=2, absoluteStrokeWidth: r, className: i="", children: o, iconNode: s, ...a}, l) => x.createElement("svg", {
  ref: l,
  ...sE,
  width: t,
  height: t,
  stroke: e,
  strokeWidth: r ? Number(n) * 24 / Number(t) : n,
  className: V0("lucide", i),
  ...a
}, [...s.map( ([c,u]) => x.createElement(c, u)), ...Array.isArray(o) ? o : [o]]));
/**
* @license lucide-react v0.462.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const $e = (e, t) => {
  const n = x.forwardRef( ({className: r, ...i}, o) => x.createElement(aE, {
      ref: o,
      iconNode: t,
      className: V0(`lucide-${oE(e)}`, r),
      ...i
  }));
  return n.displayName = `${e}`,
  n
}
;
/**
* @license lucide-react v0.462.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const lE = $e("ArrowDown", [["path", {
  d: "M12 5v14",
  key: "s699le"
}], ["path", {
  d: "m19 12-7 7-7-7",
  key: "1idqje"
}]]);
/**
* @license lucide-react v0.462.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const F0 = $e("ArrowRight", [["path", {
  d: "M5 12h14",
  key: "1ays0h"
}], ["path", {
  d: "m12 5 7 7-7 7",
  key: "xquz4c"
}]]);
/**
* @license lucide-react v0.462.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const cE = $e("Calculator", [["rect", {
  width: "16",
  height: "20",
  x: "4",
  y: "2",
  rx: "2",
  key: "1nb95v"
}], ["line", {
  x1: "8",
  x2: "16",
  y1: "6",
  y2: "6",
  key: "x4nwl0"
}], ["line", {
  x1: "16",
  x2: "16",
  y1: "14",
  y2: "18",
  key: "wjye3r"
}], ["path", {
  d: "M16 10h.01",
  key: "1m94wz"
}], ["path", {
  d: "M12 10h.01",
  key: "1nrarc"
}], ["path", {
  d: "M8 10h.01",
  key: "19clt8"
}], ["path", {
  d: "M12 14h.01",
  key: "1etili"
}], ["path", {
  d: "M8 14h.01",
  key: "6423bh"
}], ["path", {
  d: "M12 18h.01",
  key: "mhygvu"
}], ["path", {
  d: "M8 18h.01",
  key: "lrp35t"
}]]);
/**
* @license lucide-react v0.462.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const pn = $e("Check", [["path", {
  d: "M20 6 9 17l-5-5",
  key: "1gmf2c"
}]]);
/**
* @license lucide-react v0.462.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const uE = $e("ChevronDown", [["path", {
  d: "m6 9 6 6 6-6",
  key: "qrunsl"
}]]);
/**
* @license lucide-react v0.462.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const dE = $e("Clock", [["circle", {
  cx: "12",
  cy: "12",
  r: "10",
  key: "1mglay"
}], ["polyline", {
  points: "12 6 12 12 16 14",
  key: "68esgv"
}]]);
/**
* @license lucide-react v0.462.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const fE = $e("Gift", [["rect", {
  x: "3",
  y: "8",
  width: "18",
  height: "4",
  rx: "1",
  key: "bkv52"
}], ["path", {
  d: "M12 8v13",
  key: "1c76mn"
}], ["path", {
  d: "M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7",
  key: "6wjy6b"
}], ["path", {
  d: "M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5",
  key: "1ihvrl"
}]]);
/**
* @license lucide-react v0.462.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const hE = $e("Menu", [["line", {
  x1: "4",
  x2: "20",
  y1: "12",
  y2: "12",
  key: "1e0a9i"
}], ["line", {
  x1: "4",
  x2: "20",
  y1: "6",
  y2: "6",
  key: "1owob3"
}], ["line", {
  x1: "4",
  x2: "20",
  y1: "18",
  y2: "18",
  key: "yk5zj1"
}]]);
/**
* @license lucide-react v0.462.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const pE = $e("Quote", [["path", {
  d: "M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z",
  key: "rib7q0"
}], ["path", {
  d: "M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z",
  key: "1ymkrd"
}]]);
/**
* @license lucide-react v0.462.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const _i = $e("Sparkles", [["path", {
  d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
  key: "4pj2yx"
}], ["path", {
  d: "M20 3v4",
  key: "1olli1"
}], ["path", {
  d: "M22 5h-4",
  key: "1gvqau"
}], ["path", {
  d: "M4 17v2",
  key: "vumght"
}], ["path", {
  d: "M5 18H3",
  key: "zchphs"
}]]);
/**
* @license lucide-react v0.462.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const mE = $e("Star", [["path", {
  d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
  key: "r04s7s"
}]]);
/**
* @license lucide-react v0.462.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const gE = $e("TrendingUp", [["polyline", {
  points: "22 7 13.5 15.5 8.5 10.5 2 17",
  key: "126l90"
}], ["polyline", {
  points: "16 7 22 7 22 13",
  key: "kwv8wd"
}]]);
/**
* @license lucide-react v0.462.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const B0 = $e("Users", [["path", {
  d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
  key: "1yyitq"
}], ["circle", {
  cx: "9",
  cy: "7",
  r: "4",
  key: "nufk8"
}], ["path", {
  d: "M22 21v-2a4 4 0 0 0-3-3.87",
  key: "kshegd"
}], ["path", {
  d: "M16 3.13a4 4 0 0 1 0 7.75",
  key: "1da9ce"
}]]);
/**
* @license lucide-react v0.462.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const yE = $e("Wallet", [["path", {
  d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1",
  key: "18etb6"
}], ["path", {
  d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4",
  key: "xoc0q4"
}]]);
/**
* @license lucide-react v0.462.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const Sf = $e("X", [["path", {
  d: "M18 6 6 18",
  key: "1bl5f8"
}], ["path", {
  d: "m6 6 12 12",
  key: "d8bk6v"
}]]);
/**
* @license lucide-react v0.462.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const $0 = $e("Zap", [["path", {
  d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
  key: "1xq2db"
}]])
, Cf = "-"
, vE = e => {
  const t = wE(e)
    , {conflictingClassGroups: n, conflictingClassGroupModifiers: r} = e;
  return {
      getClassGroupId: s => {
          const a = s.split(Cf);
          return a[0] === "" && a.length !== 1 && a.shift(),
          U0(a, t) || xE(s)
      }
      ,
      getConflictingClassGroupIds: (s, a) => {
          const l = n[s] || [];
          return a && r[s] ? [...l, ...r[s]] : l
      }
  }
}
, U0 = (e, t) => {
  var s;
  if (e.length === 0)
      return t.classGroupId;
  const n = e[0]
    , r = t.nextPart.get(n)
    , i = r ? U0(e.slice(1), r) : void 0;
  if (i)
      return i;
  if (t.validators.length === 0)
      return;
  const o = e.join(Cf);
  return (s = t.validators.find( ({validator: a}) => a(o))) == null ? void 0 : s.classGroupId
}
, Kp = /^\[(.+)\]$/
, xE = e => {
  if (Kp.test(e)) {
      const t = Kp.exec(e)[1]
        , n = t == null ? void 0 : t.substring(0, t.indexOf(":"));
      if (n)
          return "arbitrary.." + n
  }
}
, wE = e => {
  const {theme: t, prefix: n} = e
    , r = {
      nextPart: new Map,
      validators: []
  };
  return SE(Object.entries(e.classGroups), n).forEach( ([o,s]) => {
      zu(s, r, o, t)
  }
  ),
  r
}
, zu = (e, t, n, r) => {
  e.forEach(i => {
      if (typeof i == "string") {
          const o = i === "" ? t : qp(t, i);
          o.classGroupId = n;
          return
      }
      if (typeof i == "function") {
          if (bE(i)) {
              zu(i(r), t, n, r);
              return
          }
          t.validators.push({
              validator: i,
              classGroupId: n
          });
          return
      }
      Object.entries(i).forEach( ([o,s]) => {
          zu(s, qp(t, o), n, r)
      }
      )
  }
  )
}
, qp = (e, t) => {
  let n = e;
  return t.split(Cf).forEach(r => {
      n.nextPart.has(r) || n.nextPart.set(r, {
          nextPart: new Map,
          validators: []
      }),
      n = n.nextPart.get(r)
  }
  ),
  n
}
, bE = e => e.isThemeGetter
, SE = (e, t) => t ? e.map( ([n,r]) => {
  const i = r.map(o => typeof o == "string" ? t + o : typeof o == "object" ? Object.fromEntries(Object.entries(o).map( ([s,a]) => [t + s, a])) : o);
  return [n, i]
}
) : e
, CE = e => {
  if (e < 1)
      return {
          get: () => {}
          ,
          set: () => {}
      };
  let t = 0
    , n = new Map
    , r = new Map;
  const i = (o, s) => {
      n.set(o, s),
      t++,
      t > e && (t = 0,
      r = n,
      n = new Map)
  }
  ;
  return {
      get(o) {
          let s = n.get(o);
          if (s !== void 0)
              return s;
          if ((s = r.get(o)) !== void 0)
              return i(o, s),
              s
      },
      set(o, s) {
          n.has(o) ? n.set(o, s) : i(o, s)
      }
  }
}
, W0 = "!"
, kE = e => {
  const {separator: t, experimentalParseClassName: n} = e
    , r = t.length === 1
    , i = t[0]
    , o = t.length
    , s = a => {
      const l = [];
      let c = 0, u = 0, d;
      for (let w = 0; w < a.length; w++) {
          let m = a[w];
          if (c === 0) {
              if (m === i && (r || a.slice(w, w + o) === t)) {
                  l.push(a.slice(u, w)),
                  u = w + o;
                  continue
              }
              if (m === "/") {
                  d = w;
                  continue
              }
          }
          m === "[" ? c++ : m === "]" && c--
      }
      const f = l.length === 0 ? a : a.substring(u)
        , p = f.startsWith(W0)
        , b = p ? f.substring(1) : f
        , y = d && d > u ? d - u : void 0;
      return {
          modifiers: l,
          hasImportantModifier: p,
          baseClassName: b,
          maybePostfixModifierPosition: y
      }
  }
  ;
  return n ? a => n({
      className: a,
      parseClassName: s
  }) : s
}
, EE = e => {
  if (e.length <= 1)
      return e;
  const t = [];
  let n = [];
  return e.forEach(r => {
      r[0] === "[" ? (t.push(...n.sort(), r),
      n = []) : n.push(r)
  }
  ),
  t.push(...n.sort()),
  t
}
, PE = e => ({
  cache: CE(e.cacheSize),
  parseClassName: kE(e),
  ...vE(e)
})
, TE = /\s+/
, AE = (e, t) => {
  const {parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i} = t
    , o = []
    , s = e.trim().split(TE);
  let a = "";
  for (let l = s.length - 1; l >= 0; l -= 1) {
      const c = s[l]
        , {modifiers: u, hasImportantModifier: d, baseClassName: f, maybePostfixModifierPosition: p} = n(c);
      let b = !!p
        , y = r(b ? f.substring(0, p) : f);
      if (!y) {
          if (!b) {
              a = c + (a.length > 0 ? " " + a : a);
              continue
          }
          if (y = r(f),
          !y) {
              a = c + (a.length > 0 ? " " + a : a);
              continue
          }
          b = !1
      }
      const w = EE(u).join(":")
        , m = d ? w + W0 : w
        , g = m + y;
      if (o.includes(g))
          continue;
      o.push(g);
      const v = i(y, b);
      for (let S = 0; S < v.length; ++S) {
          const C = v[S];
          o.push(m + C)
      }
      a = c + (a.length > 0 ? " " + a : a)
  }
  return a
}
;
function NE() {
  let e = 0, t, n, r = "";
  for (; e < arguments.length; )
      (t = arguments[e++]) && (n = H0(t)) && (r && (r += " "),
      r += n);
  return r
}
const H0 = e => {
  if (typeof e == "string")
      return e;
  let t, n = "";
  for (let r = 0; r < e.length; r++)
      e[r] && (t = H0(e[r])) && (n && (n += " "),
      n += t);
  return n
}
;
function RE(e, ...t) {
  let n, r, i, o = s;
  function s(l) {
      const c = t.reduce( (u, d) => d(u), e());
      return n = PE(c),
      r = n.cache.get,
      i = n.cache.set,
      o = a,
      a(l)
  }
  function a(l) {
      const c = r(l);
      if (c)
          return c;
      const u = AE(l, n);
      return i(l, u),
      u
  }
  return function() {
      return o(NE.apply(null, arguments))
  }
}
const ae = e => {
  const t = n => n[e] || [];
  return t.isThemeGetter = !0,
  t
}
, K0 = /^\[(?:([a-z-]+):)?(.+)\]$/i
, jE = /^\d+\/\d+$/
, ME = new Set(["px", "full", "screen"])
, DE = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/
, IE = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/
, LE = /^(rgba?|hsla?|hwb|(ok)?(lab|lch))\(.+\)$/
, OE = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/
, zE = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/
, an = e => xi(e) || ME.has(e) || jE.test(e)
, jn = e => qi(e, "length", HE)
, xi = e => !!e && !Number.isNaN(Number(e))
, wc = e => qi(e, "number", xi)
, uo = e => !!e && Number.isInteger(Number(e))
, _E = e => e.endsWith("%") && xi(e.slice(0, -1))
, Q = e => K0.test(e)
, Mn = e => DE.test(e)
, VE = new Set(["length", "size", "percentage"])
, FE = e => qi(e, VE, q0)
, BE = e => qi(e, "position", q0)
, $E = new Set(["image", "url"])
, UE = e => qi(e, $E, qE)
, WE = e => qi(e, "", KE)
, fo = () => !0
, qi = (e, t, n) => {
  const r = K0.exec(e);
  return r ? r[1] ? typeof t == "string" ? r[1] === t : t.has(r[1]) : n(r[2]) : !1
}
, HE = e => IE.test(e) && !LE.test(e)
, q0 = () => !1
, KE = e => OE.test(e)
, qE = e => zE.test(e)
, GE = () => {
  const e = ae("colors")
    , t = ae("spacing")
    , n = ae("blur")
    , r = ae("brightness")
    , i = ae("borderColor")
    , o = ae("borderRadius")
    , s = ae("borderSpacing")
    , a = ae("borderWidth")
    , l = ae("contrast")
    , c = ae("grayscale")
    , u = ae("hueRotate")
    , d = ae("invert")
    , f = ae("gap")
    , p = ae("gradientColorStops")
    , b = ae("gradientColorStopPositions")
    , y = ae("inset")
    , w = ae("margin")
    , m = ae("opacity")
    , g = ae("padding")
    , v = ae("saturate")
    , S = ae("scale")
    , C = ae("sepia")
    , k = ae("skew")
    , E = ae("space")
    , P = ae("translate")
    , j = () => ["auto", "contain", "none"]
    , R = () => ["auto", "hidden", "clip", "visible", "scroll"]
    , z = () => ["auto", Q, t]
    , L = () => [Q, t]
    , W = () => ["", an, jn]
    , I = () => ["auto", xi, Q]
    , K = () => ["bottom", "center", "left", "left-bottom", "left-top", "right", "right-bottom", "right-top", "top"]
    , $ = () => ["solid", "dashed", "dotted", "double", "none"]
    , V = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"]
    , T = () => ["start", "end", "center", "between", "around", "evenly", "stretch"]
    , N = () => ["", "0", Q]
    , O = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"]
    , H = () => [xi, Q];
  return {
      cacheSize: 500,
      separator: ":",
      theme: {
          colors: [fo],
          spacing: [an, jn],
          blur: ["none", "", Mn, Q],
          brightness: H(),
          borderColor: [e],
          borderRadius: ["none", "", "full", Mn, Q],
          borderSpacing: L(),
          borderWidth: W(),
          contrast: H(),
          grayscale: N(),
          hueRotate: H(),
          invert: N(),
          gap: L(),
          gradientColorStops: [e],
          gradientColorStopPositions: [_E, jn],
          inset: z(),
          margin: z(),
          opacity: H(),
          padding: L(),
          saturate: H(),
          scale: H(),
          sepia: N(),
          skew: H(),
          space: L(),
          translate: L()
      },
      classGroups: {
          aspect: [{
              aspect: ["auto", "square", "video", Q]
          }],
          container: ["container"],
          columns: [{
              columns: [Mn]
          }],
          "break-after": [{
              "break-after": O()
          }],
          "break-before": [{
              "break-before": O()
          }],
          "break-inside": [{
              "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"]
          }],
          "box-decoration": [{
              "box-decoration": ["slice", "clone"]
          }],
          box: [{
              box: ["border", "content"]
          }],
          display: ["block", "inline-block", "inline", "flex", "inline-flex", "table", "inline-table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row-group", "table-row", "flow-root", "grid", "inline-grid", "contents", "list-item", "hidden"],
          float: [{
              float: ["right", "left", "none", "start", "end"]
          }],
          clear: [{
              clear: ["left", "right", "both", "none", "start", "end"]
          }],
          isolation: ["isolate", "isolation-auto"],
          "object-fit": [{
              object: ["contain", "cover", "fill", "none", "scale-down"]
          }],
          "object-position": [{
              object: [...K(), Q]
          }],
          overflow: [{
              overflow: R()
          }],
          "overflow-x": [{
              "overflow-x": R()
          }],
          "overflow-y": [{
              "overflow-y": R()
          }],
          overscroll: [{
              overscroll: j()
          }],
          "overscroll-x": [{
              "overscroll-x": j()
          }],
          "overscroll-y": [{
              "overscroll-y": j()
          }],
          position: ["static", "fixed", "absolute", "relative", "sticky"],
          inset: [{
              inset: [y]
          }],
          "inset-x": [{
              "inset-x": [y]
          }],
          "inset-y": [{
              "inset-y": [y]
          }],
          start: [{
              start: [y]
          }],
          end: [{
              end: [y]
          }],
          top: [{
              top: [y]
          }],
          right: [{
              right: [y]
          }],
          bottom: [{
              bottom: [y]
          }],
          left: [{
              left: [y]
          }],
          visibility: ["visible", "invisible", "collapse"],
          z: [{
              z: ["auto", uo, Q]
          }],
          basis: [{
              basis: z()
          }],
          "flex-direction": [{
              flex: ["row", "row-reverse", "col", "col-reverse"]
          }],
          "flex-wrap": [{
              flex: ["wrap", "wrap-reverse", "nowrap"]
          }],
          flex: [{
              flex: ["1", "auto", "initial", "none", Q]
          }],
          grow: [{
              grow: N()
          }],
          shrink: [{
              shrink: N()
          }],
          order: [{
              order: ["first", "last", "none", uo, Q]
          }],
          "grid-cols": [{
              "grid-cols": [fo]
          }],
          "col-start-end": [{
              col: ["auto", {
                  span: ["full", uo, Q]
              }, Q]
          }],
          "col-start": [{
              "col-start": I()
          }],
          "col-end": [{
              "col-end": I()
          }],
          "grid-rows": [{
              "grid-rows": [fo]
          }],
          "row-start-end": [{
              row: ["auto", {
                  span: [uo, Q]
              }, Q]
          }],
          "row-start": [{
              "row-start": I()
          }],
          "row-end": [{
              "row-end": I()
          }],
          "grid-flow": [{
              "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"]
          }],
          "auto-cols": [{
              "auto-cols": ["auto", "min", "max", "fr", Q]
          }],
          "auto-rows": [{
              "auto-rows": ["auto", "min", "max", "fr", Q]
          }],
          gap: [{
              gap: [f]
          }],
          "gap-x": [{
              "gap-x": [f]
          }],
          "gap-y": [{
              "gap-y": [f]
          }],
          "justify-content": [{
              justify: ["normal", ...T()]
          }],
          "justify-items": [{
              "justify-items": ["start", "end", "center", "stretch"]
          }],
          "justify-self": [{
              "justify-self": ["auto", "start", "end", "center", "stretch"]
          }],
          "align-content": [{
              content: ["normal", ...T(), "baseline"]
          }],
          "align-items": [{
              items: ["start", "end", "center", "baseline", "stretch"]
          }],
          "align-self": [{
              self: ["auto", "start", "end", "center", "stretch", "baseline"]
          }],
          "place-content": [{
              "place-content": [...T(), "baseline"]
          }],
          "place-items": [{
              "place-items": ["start", "end", "center", "baseline", "stretch"]
          }],
          "place-self": [{
              "place-self": ["auto", "start", "end", "center", "stretch"]
          }],
          p: [{
              p: [g]
          }],
          px: [{
              px: [g]
          }],
          py: [{
              py: [g]
          }],
          ps: [{
              ps: [g]
          }],
          pe: [{
              pe: [g]
          }],
          pt: [{
              pt: [g]
          }],
          pr: [{
              pr: [g]
          }],
          pb: [{
              pb: [g]
          }],
          pl: [{
              pl: [g]
          }],
          m: [{
              m: [w]
          }],
          mx: [{
              mx: [w]
          }],
          my: [{
              my: [w]
          }],
          ms: [{
              ms: [w]
          }],
          me: [{
              me: [w]
          }],
          mt: [{
              mt: [w]
          }],
          mr: [{
              mr: [w]
          }],
          mb: [{
              mb: [w]
          }],
          ml: [{
              ml: [w]
          }],
          "space-x": [{
              "space-x": [E]
          }],
          "space-x-reverse": ["space-x-reverse"],
          "space-y": [{
              "space-y": [E]
          }],
          "space-y-reverse": ["space-y-reverse"],
          w: [{
              w: ["auto", "min", "max", "fit", "svw", "lvw", "dvw", Q, t]
          }],
          "min-w": [{
              "min-w": [Q, t, "min", "max", "fit"]
          }],
          "max-w": [{
              "max-w": [Q, t, "none", "full", "min", "max", "fit", "prose", {
                  screen: [Mn]
              }, Mn]
          }],
          h: [{
              h: [Q, t, "auto", "min", "max", "fit", "svh", "lvh", "dvh"]
          }],
          "min-h": [{
              "min-h": [Q, t, "min", "max", "fit", "svh", "lvh", "dvh"]
          }],
          "max-h": [{
              "max-h": [Q, t, "min", "max", "fit", "svh", "lvh", "dvh"]
          }],
          size: [{
              size: [Q, t, "auto", "min", "max", "fit"]
          }],
          "font-size": [{
              text: ["base", Mn, jn]
          }],
          "font-smoothing": ["antialiased", "subpixel-antialiased"],
          "font-style": ["italic", "not-italic"],
          "font-weight": [{
              font: ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black", wc]
          }],
          "font-family": [{
              font: [fo]
          }],
          "fvn-normal": ["normal-nums"],
          "fvn-ordinal": ["ordinal"],
          "fvn-slashed-zero": ["slashed-zero"],
          "fvn-figure": ["lining-nums", "oldstyle-nums"],
          "fvn-spacing": ["proportional-nums", "tabular-nums"],
          "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
          tracking: [{
              tracking: ["tighter", "tight", "normal", "wide", "wider", "widest", Q]
          }],
          "line-clamp": [{
              "line-clamp": ["none", xi, wc]
          }],
          leading: [{
              leading: ["none", "tight", "snug", "normal", "relaxed", "loose", an, Q]
          }],
          "list-image": [{
              "list-image": ["none", Q]
          }],
          "list-style-type": [{
              list: ["none", "disc", "decimal", Q]
          }],
          "list-style-position": [{
              list: ["inside", "outside"]
          }],
          "placeholder-color": [{
              placeholder: [e]
          }],
          "placeholder-opacity": [{
              "placeholder-opacity": [m]
          }],
          "text-alignment": [{
              text: ["left", "center", "right", "justify", "start", "end"]
          }],
          "text-color": [{
              text: [e]
          }],
          "text-opacity": [{
              "text-opacity": [m]
          }],
          "text-decoration": ["underline", "overline", "line-through", "no-underline"],
          "text-decoration-style": [{
              decoration: [...$(), "wavy"]
          }],
          "text-decoration-thickness": [{
              decoration: ["auto", "from-font", an, jn]
          }],
          "underline-offset": [{
              "underline-offset": ["auto", an, Q]
          }],
          "text-decoration-color": [{
              decoration: [e]
          }],
          "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"],
          "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
          "text-wrap": [{
              text: ["wrap", "nowrap", "balance", "pretty"]
          }],
          indent: [{
              indent: L()
          }],
          "vertical-align": [{
              align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", Q]
          }],
          whitespace: [{
              whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"]
          }],
          break: [{
              break: ["normal", "words", "all", "keep"]
          }],
          hyphens: [{
              hyphens: ["none", "manual", "auto"]
          }],
          content: [{
              content: ["none", Q]
          }],
          "bg-attachment": [{
              bg: ["fixed", "local", "scroll"]
          }],
          "bg-clip": [{
              "bg-clip": ["border", "padding", "content", "text"]
          }],
          "bg-opacity": [{
              "bg-opacity": [m]
          }],
          "bg-origin": [{
              "bg-origin": ["border", "padding", "content"]
          }],
          "bg-position": [{
              bg: [...K(), BE]
          }],
          "bg-repeat": [{
              bg: ["no-repeat", {
                  repeat: ["", "x", "y", "round", "space"]
              }]
          }],
          "bg-size": [{
              bg: ["auto", "cover", "contain", FE]
          }],
          "bg-image": [{
              bg: ["none", {
                  "gradient-to": ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
              }, UE]
          }],
          "bg-color": [{
              bg: [e]
          }],
          "gradient-from-pos": [{
              from: [b]
          }],
          "gradient-via-pos": [{
              via: [b]
          }],
          "gradient-to-pos": [{
              to: [b]
          }],
          "gradient-from": [{
              from: [p]
          }],
          "gradient-via": [{
              via: [p]
          }],
          "gradient-to": [{
              to: [p]
          }],
          rounded: [{
              rounded: [o]
          }],
          "rounded-s": [{
              "rounded-s": [o]
          }],
          "rounded-e": [{
              "rounded-e": [o]
          }],
          "rounded-t": [{
              "rounded-t": [o]
          }],
          "rounded-r": [{
              "rounded-r": [o]
          }],
          "rounded-b": [{
              "rounded-b": [o]
          }],
          "rounded-l": [{
              "rounded-l": [o]
          }],
          "rounded-ss": [{
              "rounded-ss": [o]
          }],
          "rounded-se": [{
              "rounded-se": [o]
          }],
          "rounded-ee": [{
              "rounded-ee": [o]
          }],
          "rounded-es": [{
              "rounded-es": [o]
          }],
          "rounded-tl": [{
              "rounded-tl": [o]
          }],
          "rounded-tr": [{
              "rounded-tr": [o]
          }],
          "rounded-br": [{
              "rounded-br": [o]
          }],
          "rounded-bl": [{
              "rounded-bl": [o]
          }],
          "border-w": [{
              border: [a]
          }],
          "border-w-x": [{
              "border-x": [a]
          }],
          "border-w-y": [{
              "border-y": [a]
          }],
          "border-w-s": [{
              "border-s": [a]
          }],
          "border-w-e": [{
              "border-e": [a]
          }],
          "border-w-t": [{
              "border-t": [a]
          }],
          "border-w-r": [{
              "border-r": [a]
          }],
          "border-w-b": [{
              "border-b": [a]
          }],
          "border-w-l": [{
              "border-l": [a]
          }],
          "border-opacity": [{
              "border-opacity": [m]
          }],
          "border-style": [{
              border: [...$(), "hidden"]
          }],
          "divide-x": [{
              "divide-x": [a]
          }],
          "divide-x-reverse": ["divide-x-reverse"],
          "divide-y": [{
              "divide-y": [a]
          }],
          "divide-y-reverse": ["divide-y-reverse"],
          "divide-opacity": [{
              "divide-opacity": [m]
          }],
          "divide-style": [{
              divide: $()
          }],
          "border-color": [{
              border: [i]
          }],
          "border-color-x": [{
              "border-x": [i]
          }],
          "border-color-y": [{
              "border-y": [i]
          }],
          "border-color-s": [{
              "border-s": [i]
          }],
          "border-color-e": [{
              "border-e": [i]
          }],
          "border-color-t": [{
              "border-t": [i]
          }],
          "border-color-r": [{
              "border-r": [i]
          }],
          "border-color-b": [{
              "border-b": [i]
          }],
          "border-color-l": [{
              "border-l": [i]
          }],
          "divide-color": [{
              divide: [i]
          }],
          "outline-style": [{
              outline: ["", ...$()]
          }],
          "outline-offset": [{
              "outline-offset": [an, Q]
          }],
          "outline-w": [{
              outline: [an, jn]
          }],
          "outline-color": [{
              outline: [e]
          }],
          "ring-w": [{
              ring: W()
          }],
          "ring-w-inset": ["ring-inset"],
          "ring-color": [{
              ring: [e]
          }],
          "ring-opacity": [{
              "ring-opacity": [m]
          }],
          "ring-offset-w": [{
              "ring-offset": [an, jn]
          }],
          "ring-offset-color": [{
              "ring-offset": [e]
          }],
          shadow: [{
              shadow: ["", "inner", "none", Mn, WE]
          }],
          "shadow-color": [{
              shadow: [fo]
          }],
          opacity: [{
              opacity: [m]
          }],
          "mix-blend": [{
              "mix-blend": [...V(), "plus-lighter", "plus-darker"]
          }],
          "bg-blend": [{
              "bg-blend": V()
          }],
          filter: [{
              filter: ["", "none"]
          }],
          blur: [{
              blur: [n]
          }],
          brightness: [{
              brightness: [r]
          }],
          contrast: [{
              contrast: [l]
          }],
          "drop-shadow": [{
              "drop-shadow": ["", "none", Mn, Q]
          }],
          grayscale: [{
              grayscale: [c]
          }],
          "hue-rotate": [{
              "hue-rotate": [u]
          }],
          invert: [{
              invert: [d]
          }],
          saturate: [{
              saturate: [v]
          }],
          sepia: [{
              sepia: [C]
          }],
          "backdrop-filter": [{
              "backdrop-filter": ["", "none"]
          }],
          "backdrop-blur": [{
              "backdrop-blur": [n]
          }],
          "backdrop-brightness": [{
              "backdrop-brightness": [r]
          }],
          "backdrop-contrast": [{
              "backdrop-contrast": [l]
          }],
          "backdrop-grayscale": [{
              "backdrop-grayscale": [c]
          }],
          "backdrop-hue-rotate": [{
              "backdrop-hue-rotate": [u]
          }],
          "backdrop-invert": [{
              "backdrop-invert": [d]
          }],
          "backdrop-opacity": [{
              "backdrop-opacity": [m]
          }],
          "backdrop-saturate": [{
              "backdrop-saturate": [v]
          }],
          "backdrop-sepia": [{
              "backdrop-sepia": [C]
          }],
          "border-collapse": [{
              border: ["collapse", "separate"]
          }],
          "border-spacing": [{
              "border-spacing": [s]
          }],
          "border-spacing-x": [{
              "border-spacing-x": [s]
          }],
          "border-spacing-y": [{
              "border-spacing-y": [s]
          }],
          "table-layout": [{
              table: ["auto", "fixed"]
          }],
          caption: [{
              caption: ["top", "bottom"]
          }],
          transition: [{
              transition: ["none", "all", "", "colors", "opacity", "shadow", "transform", Q]
          }],
          duration: [{
              duration: H()
          }],
          ease: [{
              ease: ["linear", "in", "out", "in-out", Q]
          }],
          delay: [{
              delay: H()
          }],
          animate: [{
              animate: ["none", "spin", "ping", "pulse", "bounce", Q]
          }],
          transform: [{
              transform: ["", "gpu", "none"]
          }],
          scale: [{
              scale: [S]
          }],
          "scale-x": [{
              "scale-x": [S]
          }],
          "scale-y": [{
              "scale-y": [S]
          }],
          rotate: [{
              rotate: [uo, Q]
          }],
          "translate-x": [{
              "translate-x": [P]
          }],
          "translate-y": [{
              "translate-y": [P]
          }],
          "skew-x": [{
              "skew-x": [k]
          }],
          "skew-y": [{
              "skew-y": [k]
          }],
          "transform-origin": [{
              origin: ["center", "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left", "top-left", Q]
          }],
          accent: [{
              accent: ["auto", e]
          }],
          appearance: [{
              appearance: ["none", "auto"]
          }],
          cursor: [{
              cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", Q]
          }],
          "caret-color": [{
              caret: [e]
          }],
          "pointer-events": [{
              "pointer-events": ["none", "auto"]
          }],
          resize: [{
              resize: ["none", "y", "x", ""]
          }],
          "scroll-behavior": [{
              scroll: ["auto", "smooth"]
          }],
          "scroll-m": [{
              "scroll-m": L()
          }],
          "scroll-mx": [{
              "scroll-mx": L()
          }],
          "scroll-my": [{
              "scroll-my": L()
          }],
          "scroll-ms": [{
              "scroll-ms": L()
          }],
          "scroll-me": [{
              "scroll-me": L()
          }],
          "scroll-mt": [{
              "scroll-mt": L()
          }],
          "scroll-mr": [{
              "scroll-mr": L()
          }],
          "scroll-mb": [{
              "scroll-mb": L()
          }],
          "scroll-ml": [{
              "scroll-ml": L()
          }],
          "scroll-p": [{
              "scroll-p": L()
          }],
          "scroll-px": [{
              "scroll-px": L()
          }],
          "scroll-py": [{
              "scroll-py": L()
          }],
          "scroll-ps": [{
              "scroll-ps": L()
          }],
          "scroll-pe": [{
              "scroll-pe": L()
          }],
          "scroll-pt": [{
              "scroll-pt": L()
          }],
          "scroll-pr": [{
              "scroll-pr": L()
          }],
          "scroll-pb": [{
              "scroll-pb": L()
          }],
          "scroll-pl": [{
              "scroll-pl": L()
          }],
          "snap-align": [{
              snap: ["start", "end", "center", "align-none"]
          }],
          "snap-stop": [{
              snap: ["normal", "always"]
          }],
          "snap-type": [{
              snap: ["none", "x", "y", "both"]
          }],
          "snap-strictness": [{
              snap: ["mandatory", "proximity"]
          }],
          touch: [{
              touch: ["auto", "none", "manipulation"]
          }],
          "touch-x": [{
              "touch-pan": ["x", "left", "right"]
          }],
          "touch-y": [{
              "touch-pan": ["y", "up", "down"]
          }],
          "touch-pz": ["touch-pinch-zoom"],
          select: [{
              select: ["none", "text", "all", "auto"]
          }],
          "will-change": [{
              "will-change": ["auto", "scroll", "contents", "transform", Q]
          }],
          fill: [{
              fill: [e, "none"]
          }],
          "stroke-w": [{
              stroke: [an, jn, wc]
          }],
          stroke: [{
              stroke: [e, "none"]
          }],
          sr: ["sr-only", "not-sr-only"],
          "forced-color-adjust": [{
              "forced-color-adjust": ["auto", "none"]
          }]
      },
      conflictingClassGroups: {
          overflow: ["overflow-x", "overflow-y"],
          overscroll: ["overscroll-x", "overscroll-y"],
          inset: ["inset-x", "inset-y", "start", "end", "top", "right", "bottom", "left"],
          "inset-x": ["right", "left"],
          "inset-y": ["top", "bottom"],
          flex: ["basis", "grow", "shrink"],
          gap: ["gap-x", "gap-y"],
          p: ["px", "py", "ps", "pe", "pt", "pr", "pb", "pl"],
          px: ["pr", "pl"],
          py: ["pt", "pb"],
          m: ["mx", "my", "ms", "me", "mt", "mr", "mb", "ml"],
          mx: ["mr", "ml"],
          my: ["mt", "mb"],
          size: ["w", "h"],
          "font-size": ["leading"],
          "fvn-normal": ["fvn-ordinal", "fvn-slashed-zero", "fvn-figure", "fvn-spacing", "fvn-fraction"],
          "fvn-ordinal": ["fvn-normal"],
          "fvn-slashed-zero": ["fvn-normal"],
          "fvn-figure": ["fvn-normal"],
          "fvn-spacing": ["fvn-normal"],
          "fvn-fraction": ["fvn-normal"],
          "line-clamp": ["display", "overflow"],
          rounded: ["rounded-s", "rounded-e", "rounded-t", "rounded-r", "rounded-b", "rounded-l", "rounded-ss", "rounded-se", "rounded-ee", "rounded-es", "rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"],
          "rounded-s": ["rounded-ss", "rounded-es"],
          "rounded-e": ["rounded-se", "rounded-ee"],
          "rounded-t": ["rounded-tl", "rounded-tr"],
          "rounded-r": ["rounded-tr", "rounded-br"],
          "rounded-b": ["rounded-br", "rounded-bl"],
          "rounded-l": ["rounded-tl", "rounded-bl"],
          "border-spacing": ["border-spacing-x", "border-spacing-y"],
          "border-w": ["border-w-s", "border-w-e", "border-w-t", "border-w-r", "border-w-b", "border-w-l"],
          "border-w-x": ["border-w-r", "border-w-l"],
          "border-w-y": ["border-w-t", "border-w-b"],
          "border-color": ["border-color-s", "border-color-e", "border-color-t", "border-color-r", "border-color-b", "border-color-l"],
          "border-color-x": ["border-color-r", "border-color-l"],
          "border-color-y": ["border-color-t", "border-color-b"],
          "scroll-m": ["scroll-mx", "scroll-my", "scroll-ms", "scroll-me", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml"],
          "scroll-mx": ["scroll-mr", "scroll-ml"],
          "scroll-my": ["scroll-mt", "scroll-mb"],
          "scroll-p": ["scroll-px", "scroll-py", "scroll-ps", "scroll-pe", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl"],
          "scroll-px": ["scroll-pr", "scroll-pl"],
          "scroll-py": ["scroll-pt", "scroll-pb"],
          touch: ["touch-x", "touch-y", "touch-pz"],
          "touch-x": ["touch"],
          "touch-y": ["touch"],
          "touch-pz": ["touch"]
      },
      conflictingClassGroupModifiers: {
          "font-size": ["leading"]
      }
  }
}
, QE = RE(GE);
function ut(...e) {
  return QE(_0(e))
}
const YE = rE
, G0 = x.forwardRef( ({className: e, ...t}, n) => h.jsx(j0, {
  ref: n,
  className: ut("fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]", e),
  ...t
}));
G0.displayName = j0.displayName;
const ZE = iE("group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full", {
  variants: {
      variant: {
          default: "border bg-background text-foreground",
          destructive: "destructive group border-destructive bg-destructive text-destructive-foreground"
      }
  },
  defaultVariants: {
      variant: "default"
  }
})
, Q0 = x.forwardRef( ({className: e, variant: t, ...n}, r) => h.jsx(M0, {
  ref: r,
  className: ut(ZE({
      variant: t
  }), e),
  ...n
}));
Q0.displayName = M0.displayName;
const XE = x.forwardRef( ({className: e, ...t}, n) => h.jsx(L0, {
  ref: n,
  className: ut("inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors group-[.destructive]:border-muted/40 hover:bg-secondary group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 group-[.destructive]:focus:ring-destructive disabled:pointer-events-none disabled:opacity-50", e),
  ...t
}));
XE.displayName = L0.displayName;
const Y0 = x.forwardRef( ({className: e, ...t}, n) => h.jsx(O0, {
  ref: n,
  className: ut("absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 group-[.destructive]:text-red-300 hover:text-foreground group-[.destructive]:hover:text-red-50 focus:opacity-100 focus:outline-none focus:ring-2 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600", e),
  "toast-close": "",
  ...t,
  children: h.jsx(Sf, {
      className: "h-4 w-4"
  })
}));
Y0.displayName = O0.displayName;
const Z0 = x.forwardRef( ({className: e, ...t}, n) => h.jsx(D0, {
  ref: n,
  className: ut("text-sm font-semibold", e),
  ...t
}));
Z0.displayName = D0.displayName;
const X0 = x.forwardRef( ({className: e, ...t}, n) => h.jsx(I0, {
  ref: n,
  className: ut("text-sm opacity-90", e),
  ...t
}));
X0.displayName = I0.displayName;
function JE() {
  const {toasts: e} = hk();
  return h.jsxs(YE, {
      children: [e.map(function({id: t, title: n, description: r, action: i, ...o}) {
          return h.jsxs(Q0, {
              ...o,
              children: [h.jsxs("div", {
                  className: "grid gap-1",
                  children: [n && h.jsx(Z0, {
                      children: n
                  }), r && h.jsx(X0, {
                      children: r
                  })]
              }), i, h.jsx(Y0, {})]
          }, t)
      }), h.jsx(G0, {})]
  })
}
var Gp = ["light", "dark"]
, eP = "(prefers-color-scheme: dark)"
, tP = x.createContext(void 0)
, nP = {
  setTheme: e => {}
  ,
  themes: []
}
, rP = () => {
  var e;
  return (e = x.useContext(tP)) != null ? e : nP
}
;
x.memo( ({forcedTheme: e, storageKey: t, attribute: n, enableSystem: r, enableColorScheme: i, defaultTheme: o, value: s, attrs: a, nonce: l}) => {
  let c = o === "system"
    , u = n === "class" ? `var d=document.documentElement,c=d.classList;${`c.remove(${a.map(b => `'${b}'`).join(",")})`};` : `var d=document.documentElement,n='${n}',s='setAttribute';`
    , d = i ? Gp.includes(o) && o ? `if(e==='light'||e==='dark'||!e)d.style.colorScheme=e||'${o}'` : "if(e==='light'||e==='dark')d.style.colorScheme=e" : ""
    , f = (b, y=!1, w=!0) => {
      let m = s ? s[b] : b
        , g = y ? b + "|| ''" : `'${m}'`
        , v = "";
      return i && w && !y && Gp.includes(b) && (v += `d.style.colorScheme = '${b}';`),
      n === "class" ? y || m ? v += `c.add(${g})` : v += "null" : m && (v += `d[s](n,${g})`),
      v
  }
    , p = e ? `!function(){${u}${f(e)}}()` : r ? `!function(){try{${u}var e=localStorage.getItem('${t}');if('system'===e||(!e&&${c})){var t='${eP}',m=window.matchMedia(t);if(m.media!==t||m.matches){${f("dark")}}else{${f("light")}}}else if(e){${s ? `var x=${JSON.stringify(s)};` : ""}${f(s ? "x[e]" : "e", !0)}}${c ? "" : "else{" + f(o, !1, !1) + "}"}${d}}catch(e){}}()` : `!function(){try{${u}var e=localStorage.getItem('${t}');if(e){${s ? `var x=${JSON.stringify(s)};` : ""}${f(s ? "x[e]" : "e", !0)}}else{${f(o, !1, !1)};}${d}}catch(t){}}();`;
  return x.createElement("script", {
      nonce: l,
      dangerouslySetInnerHTML: {
          __html: p
      }
  })
}
);
var iP = e => {
  switch (e) {
  case "success":
      return aP;
  case "info":
      return cP;
  case "warning":
      return lP;
  case "error":
      return uP;
  default:
      return null
  }
}
, oP = Array(12).fill(0)
, sP = ({visible: e, className: t}) => M.createElement("div", {
  className: ["sonner-loading-wrapper", t].filter(Boolean).join(" "),
  "data-visible": e
}, M.createElement("div", {
  className: "sonner-spinner"
}, oP.map( (n, r) => M.createElement("div", {
  className: "sonner-loading-bar",
  key: `spinner-bar-${r}`
}))))
, aP = M.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 20 20",
  fill: "currentColor",
  height: "20",
  width: "20"
}, M.createElement("path", {
  fillRule: "evenodd",
  d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z",
  clipRule: "evenodd"
}))
, lP = M.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "currentColor",
  height: "20",
  width: "20"
}, M.createElement("path", {
  fillRule: "evenodd",
  d: "M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z",
  clipRule: "evenodd"
}))
, cP = M.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 20 20",
  fill: "currentColor",
  height: "20",
  width: "20"
}, M.createElement("path", {
  fillRule: "evenodd",
  d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z",
  clipRule: "evenodd"
}))
, uP = M.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 20 20",
  fill: "currentColor",
  height: "20",
  width: "20"
}, M.createElement("path", {
  fillRule: "evenodd",
  d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z",
  clipRule: "evenodd"
}))
, dP = M.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: "12",
  height: "12",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.5",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, M.createElement("line", {
  x1: "18",
  y1: "6",
  x2: "6",
  y2: "18"
}), M.createElement("line", {
  x1: "6",
  y1: "6",
  x2: "18",
  y2: "18"
}))
, fP = () => {
  let[e,t] = M.useState(document.hidden);
  return M.useEffect( () => {
      let n = () => {
          t(document.hidden)
      }
      ;
      return document.addEventListener("visibilitychange", n),
      () => window.removeEventListener("visibilitychange", n)
  }
  , []),
  e
}
, _u = 1
, hP = class {
  constructor() {
      this.subscribe = e => (this.subscribers.push(e),
      () => {
          let t = this.subscribers.indexOf(e);
          this.subscribers.splice(t, 1)
      }
      ),
      this.publish = e => {
          this.subscribers.forEach(t => t(e))
      }
      ,
      this.addToast = e => {
          this.publish(e),
          this.toasts = [...this.toasts, e]
      }
      ,
      this.create = e => {
          var t;
          let {message: n, ...r} = e
            , i = typeof (e == null ? void 0 : e.id) == "number" || ((t = e.id) == null ? void 0 : t.length) > 0 ? e.id : _u++
            , o = this.toasts.find(a => a.id === i)
            , s = e.dismissible === void 0 ? !0 : e.dismissible;
          return this.dismissedToasts.has(i) && this.dismissedToasts.delete(i),
          o ? this.toasts = this.toasts.map(a => a.id === i ? (this.publish({
              ...a,
              ...e,
              id: i,
              title: n
          }),
          {
              ...a,
              ...e,
              id: i,
              dismissible: s,
              title: n
          }) : a) : this.addToast({
              title: n,
              ...r,
              dismissible: s,
              id: i
          }),
          i
      }
      ,
      this.dismiss = e => (this.dismissedToasts.add(e),
      e || this.toasts.forEach(t => {
          this.subscribers.forEach(n => n({
              id: t.id,
              dismiss: !0
          }))
      }
      ),
      this.subscribers.forEach(t => t({
          id: e,
          dismiss: !0
      })),
      e),
      this.message = (e, t) => this.create({
          ...t,
          message: e
      }),
      this.error = (e, t) => this.create({
          ...t,
          message: e,
          type: "error"
      }),
      this.success = (e, t) => this.create({
          ...t,
          type: "success",
          message: e
      }),
      this.info = (e, t) => this.create({
          ...t,
          type: "info",
          message: e
      }),
      this.warning = (e, t) => this.create({
          ...t,
          type: "warning",
          message: e
      }),
      this.loading = (e, t) => this.create({
          ...t,
          type: "loading",
          message: e
      }),
      this.promise = (e, t) => {
          if (!t)
              return;
          let n;
          t.loading !== void 0 && (n = this.create({
              ...t,
              promise: e,
              type: "loading",
              message: t.loading,
              description: typeof t.description != "function" ? t.description : void 0
          }));
          let r = e instanceof Promise ? e : e(), i = n !== void 0, o, s = r.then(async l => {
              if (o = ["resolve", l],
              M.isValidElement(l))
                  i = !1,
                  this.create({
                      id: n,
                      type: "default",
                      message: l
                  });
              else if (mP(l) && !l.ok) {
                  i = !1;
                  let c = typeof t.error == "function" ? await t.error(`HTTP error! status: ${l.status}`) : t.error
                    , u = typeof t.description == "function" ? await t.description(`HTTP error! status: ${l.status}`) : t.description;
                  this.create({
                      id: n,
                      type: "error",
                      message: c,
                      description: u
                  })
              } else if (t.success !== void 0) {
                  i = !1;
                  let c = typeof t.success == "function" ? await t.success(l) : t.success
                    , u = typeof t.description == "function" ? await t.description(l) : t.description;
                  this.create({
                      id: n,
                      type: "success",
                      message: c,
                      description: u
                  })
              }
          }
          ).catch(async l => {
              if (o = ["reject", l],
              t.error !== void 0) {
                  i = !1;
                  let c = typeof t.error == "function" ? await t.error(l) : t.error
                    , u = typeof t.description == "function" ? await t.description(l) : t.description;
                  this.create({
                      id: n,
                      type: "error",
                      message: c,
                      description: u
                  })
              }
          }
          ).finally( () => {
              var l;
              i && (this.dismiss(n),
              n = void 0),
              (l = t.finally) == null || l.call(t)
          }
          ), a = () => new Promise( (l, c) => s.then( () => o[0] === "reject" ? c(o[1]) : l(o[1])).catch(c));
          return typeof n != "string" && typeof n != "number" ? {
              unwrap: a
          } : Object.assign(n, {
              unwrap: a
          })
      }
      ,
      this.custom = (e, t) => {
          let n = (t == null ? void 0 : t.id) || _u++;
          return this.create({
              jsx: e(n),
              id: n,
              ...t
          }),
          n
      }
      ,
      this.getActiveToasts = () => this.toasts.filter(e => !this.dismissedToasts.has(e.id)),
      this.subscribers = [],
      this.toasts = [],
      this.dismissedToasts = new Set
  }
}
, Ze = new hP
, pP = (e, t) => {
  let n = (t == null ? void 0 : t.id) || _u++;
  return Ze.addToast({
      title: e,
      ...t,
      id: n
  }),
  n
}
, mP = e => e && typeof e == "object" && "ok"in e && typeof e.ok == "boolean" && "status"in e && typeof e.status == "number"
, gP = pP
, yP = () => Ze.toasts
, vP = () => Ze.getActiveToasts();
Object.assign(gP, {
  success: Ze.success,
  info: Ze.info,
  warning: Ze.warning,
  error: Ze.error,
  custom: Ze.custom,
  message: Ze.message,
  promise: Ze.promise,
  dismiss: Ze.dismiss,
  loading: Ze.loading
}, {
  getHistory: yP,
  getToasts: vP
});
function xP(e, {insertAt: t}={}) {
  if (typeof document > "u")
      return;
  let n = document.head || document.getElementsByTagName("head")[0]
    , r = document.createElement("style");
  r.type = "text/css",
  t === "top" && n.firstChild ? n.insertBefore(r, n.firstChild) : n.appendChild(r),
  r.styleSheet ? r.styleSheet.cssText = e : r.appendChild(document.createTextNode(e))
}
xP(`:where(html[dir="ltr"]),:where([data-sonner-toaster][dir="ltr"]){--toast-icon-margin-start: -3px;--toast-icon-margin-end: 4px;--toast-svg-margin-start: -1px;--toast-svg-margin-end: 0px;--toast-button-margin-start: auto;--toast-button-margin-end: 0;--toast-close-button-start: 0;--toast-close-button-end: unset;--toast-close-button-transform: translate(-35%, -35%)}:where(html[dir="rtl"]),:where([data-sonner-toaster][dir="rtl"]){--toast-icon-margin-start: 4px;--toast-icon-margin-end: -3px;--toast-svg-margin-start: 0px;--toast-svg-margin-end: -1px;--toast-button-margin-start: 0;--toast-button-margin-end: auto;--toast-close-button-start: unset;--toast-close-button-end: 0;--toast-close-button-transform: translate(35%, -35%)}:where([data-sonner-toaster]){position:fixed;width:var(--width);font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;--gray1: hsl(0, 0%, 99%);--gray2: hsl(0, 0%, 97.3%);--gray3: hsl(0, 0%, 95.1%);--gray4: hsl(0, 0%, 93%);--gray5: hsl(0, 0%, 90.9%);--gray6: hsl(0, 0%, 88.7%);--gray7: hsl(0, 0%, 85.8%);--gray8: hsl(0, 0%, 78%);--gray9: hsl(0, 0%, 56.1%);--gray10: hsl(0, 0%, 52.3%);--gray11: hsl(0, 0%, 43.5%);--gray12: hsl(0, 0%, 9%);--border-radius: 8px;box-sizing:border-box;padding:0;margin:0;list-style:none;outline:none;z-index:999999999;transition:transform .4s ease}:where([data-sonner-toaster][data-lifted="true"]){transform:translateY(-10px)}@media (hover: none) and (pointer: coarse){:where([data-sonner-toaster][data-lifted="true"]){transform:none}}:where([data-sonner-toaster][data-x-position="right"]){right:var(--offset-right)}:where([data-sonner-toaster][data-x-position="left"]){left:var(--offset-left)}:where([data-sonner-toaster][data-x-position="center"]){left:50%;transform:translate(-50%)}:where([data-sonner-toaster][data-y-position="top"]){top:var(--offset-top)}:where([data-sonner-toaster][data-y-position="bottom"]){bottom:var(--offset-bottom)}:where([data-sonner-toast]){--y: translateY(100%);--lift-amount: calc(var(--lift) * var(--gap));z-index:var(--z-index);position:absolute;opacity:0;transform:var(--y);filter:blur(0);touch-action:none;transition:transform .4s,opacity .4s,height .4s,box-shadow .2s;box-sizing:border-box;outline:none;overflow-wrap:anywhere}:where([data-sonner-toast][data-styled="true"]){padding:16px;background:var(--normal-bg);border:1px solid var(--normal-border);color:var(--normal-text);border-radius:var(--border-radius);box-shadow:0 4px 12px #0000001a;width:var(--width);font-size:13px;display:flex;align-items:center;gap:6px}:where([data-sonner-toast]:focus-visible){box-shadow:0 4px 12px #0000001a,0 0 0 2px #0003}:where([data-sonner-toast][data-y-position="top"]){top:0;--y: translateY(-100%);--lift: 1;--lift-amount: calc(1 * var(--gap))}:where([data-sonner-toast][data-y-position="bottom"]){bottom:0;--y: translateY(100%);--lift: -1;--lift-amount: calc(var(--lift) * var(--gap))}:where([data-sonner-toast]) :where([data-description]){font-weight:400;line-height:1.4;color:inherit}:where([data-sonner-toast]) :where([data-title]){font-weight:500;line-height:1.5;color:inherit}:where([data-sonner-toast]) :where([data-icon]){display:flex;height:16px;width:16px;position:relative;justify-content:flex-start;align-items:center;flex-shrink:0;margin-left:var(--toast-icon-margin-start);margin-right:var(--toast-icon-margin-end)}:where([data-sonner-toast][data-promise="true"]) :where([data-icon])>svg{opacity:0;transform:scale(.8);transform-origin:center;animation:sonner-fade-in .3s ease forwards}:where([data-sonner-toast]) :where([data-icon])>*{flex-shrink:0}:where([data-sonner-toast]) :where([data-icon]) svg{margin-left:var(--toast-svg-margin-start);margin-right:var(--toast-svg-margin-end)}:where([data-sonner-toast]) :where([data-content]){display:flex;flex-direction:column;gap:2px}[data-sonner-toast][data-styled=true] [data-button]{border-radius:4px;padding-left:8px;padding-right:8px;height:24px;font-size:12px;color:var(--normal-bg);background:var(--normal-text);margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end);border:none;cursor:pointer;outline:none;display:flex;align-items:center;flex-shrink:0;transition:opacity .4s,box-shadow .2s}:where([data-sonner-toast]) :where([data-button]):focus-visible{box-shadow:0 0 0 2px #0006}:where([data-sonner-toast]) :where([data-button]):first-of-type{margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end)}:where([data-sonner-toast]) :where([data-cancel]){color:var(--normal-text);background:rgba(0,0,0,.08)}:where([data-sonner-toast][data-theme="dark"]) :where([data-cancel]){background:rgba(255,255,255,.3)}:where([data-sonner-toast]) :where([data-close-button]){position:absolute;left:var(--toast-close-button-start);right:var(--toast-close-button-end);top:0;height:20px;width:20px;display:flex;justify-content:center;align-items:center;padding:0;color:var(--gray12);border:1px solid var(--gray4);transform:var(--toast-close-button-transform);border-radius:50%;cursor:pointer;z-index:1;transition:opacity .1s,background .2s,border-color .2s}[data-sonner-toast] [data-close-button]{background:var(--gray1)}:where([data-sonner-toast]) :where([data-close-button]):focus-visible{box-shadow:0 4px 12px #0000001a,0 0 0 2px #0003}:where([data-sonner-toast]) :where([data-disabled="true"]){cursor:not-allowed}:where([data-sonner-toast]):hover :where([data-close-button]):hover{background:var(--gray2);border-color:var(--gray5)}:where([data-sonner-toast][data-swiping="true"]):before{content:"";position:absolute;left:-50%;right:-50%;height:100%;z-index:-1}:where([data-sonner-toast][data-y-position="top"][data-swiping="true"]):before{bottom:50%;transform:scaleY(3) translateY(50%)}:where([data-sonner-toast][data-y-position="bottom"][data-swiping="true"]):before{top:50%;transform:scaleY(3) translateY(-50%)}:where([data-sonner-toast][data-swiping="false"][data-removed="true"]):before{content:"";position:absolute;inset:0;transform:scaleY(2)}:where([data-sonner-toast]):after{content:"";position:absolute;left:0;height:calc(var(--gap) + 1px);bottom:100%;width:100%}:where([data-sonner-toast][data-mounted="true"]){--y: translateY(0);opacity:1}:where([data-sonner-toast][data-expanded="false"][data-front="false"]){--scale: var(--toasts-before) * .05 + 1;--y: translateY(calc(var(--lift-amount) * var(--toasts-before))) scale(calc(-1 * var(--scale)));height:var(--front-toast-height)}:where([data-sonner-toast])>*{transition:opacity .4s}:where([data-sonner-toast][data-expanded="false"][data-front="false"][data-styled="true"])>*{opacity:0}:where([data-sonner-toast][data-visible="false"]){opacity:0;pointer-events:none}:where([data-sonner-toast][data-mounted="true"][data-expanded="true"]){--y: translateY(calc(var(--lift) * var(--offset)));height:var(--initial-height)}:where([data-sonner-toast][data-removed="true"][data-front="true"][data-swipe-out="false"]){--y: translateY(calc(var(--lift) * -100%));opacity:0}:where([data-sonner-toast][data-removed="true"][data-front="false"][data-swipe-out="false"][data-expanded="true"]){--y: translateY(calc(var(--lift) * var(--offset) + var(--lift) * -100%));opacity:0}:where([data-sonner-toast][data-removed="true"][data-front="false"][data-swipe-out="false"][data-expanded="false"]){--y: translateY(40%);opacity:0;transition:transform .5s,opacity .2s}:where([data-sonner-toast][data-removed="true"][data-front="false"]):before{height:calc(var(--initial-height) + 20%)}[data-sonner-toast][data-swiping=true]{transform:var(--y) translateY(var(--swipe-amount-y, 0px)) translate(var(--swipe-amount-x, 0px));transition:none}[data-sonner-toast][data-swiped=true]{user-select:none}[data-sonner-toast][data-swipe-out=true][data-y-position=bottom],[data-sonner-toast][data-swipe-out=true][data-y-position=top]{animation-duration:.2s;animation-timing-function:ease-out;animation-fill-mode:forwards}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=left]{animation-name:swipe-out-left}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=right]{animation-name:swipe-out-right}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=up]{animation-name:swipe-out-up}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=down]{animation-name:swipe-out-down}@keyframes swipe-out-left{0%{transform:var(--y) translate(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translate(calc(var(--swipe-amount-x) - 100%));opacity:0}}@keyframes swipe-out-right{0%{transform:var(--y) translate(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translate(calc(var(--swipe-amount-x) + 100%));opacity:0}}@keyframes swipe-out-up{0%{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) - 100%));opacity:0}}@keyframes swipe-out-down{0%{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) + 100%));opacity:0}}@media (max-width: 600px){[data-sonner-toaster]{position:fixed;right:var(--mobile-offset-right);left:var(--mobile-offset-left);width:100%}[data-sonner-toaster][dir=rtl]{left:calc(var(--mobile-offset-left) * -1)}[data-sonner-toaster] [data-sonner-toast]{left:0;right:0;width:calc(100% - var(--mobile-offset-left) * 2)}[data-sonner-toaster][data-x-position=left]{left:var(--mobile-offset-left)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--mobile-offset-bottom)}[data-sonner-toaster][data-y-position=top]{top:var(--mobile-offset-top)}[data-sonner-toaster][data-x-position=center]{left:var(--mobile-offset-left);right:var(--mobile-offset-right);transform:none}}[data-sonner-toaster][data-theme=light]{--normal-bg: #fff;--normal-border: var(--gray4);--normal-text: var(--gray12);--success-bg: hsl(143, 85%, 96%);--success-border: hsl(145, 92%, 91%);--success-text: hsl(140, 100%, 27%);--info-bg: hsl(208, 100%, 97%);--info-border: hsl(221, 91%, 91%);--info-text: hsl(210, 92%, 45%);--warning-bg: hsl(49, 100%, 97%);--warning-border: hsl(49, 91%, 91%);--warning-text: hsl(31, 92%, 45%);--error-bg: hsl(359, 100%, 97%);--error-border: hsl(359, 100%, 94%);--error-text: hsl(360, 100%, 45%)}[data-sonner-toaster][data-theme=light] [data-sonner-toast][data-invert=true]{--normal-bg: #000;--normal-border: hsl(0, 0%, 20%);--normal-text: var(--gray1)}[data-sonner-toaster][data-theme=dark] [data-sonner-toast][data-invert=true]{--normal-bg: #fff;--normal-border: var(--gray3);--normal-text: var(--gray12)}[data-sonner-toaster][data-theme=dark]{--normal-bg: #000;--normal-bg-hover: hsl(0, 0%, 12%);--normal-border: hsl(0, 0%, 20%);--normal-border-hover: hsl(0, 0%, 25%);--normal-text: var(--gray1);--success-bg: hsl(150, 100%, 6%);--success-border: hsl(147, 100%, 12%);--success-text: hsl(150, 86%, 65%);--info-bg: hsl(215, 100%, 6%);--info-border: hsl(223, 100%, 12%);--info-text: hsl(216, 87%, 65%);--warning-bg: hsl(64, 100%, 6%);--warning-border: hsl(60, 100%, 12%);--warning-text: hsl(46, 87%, 65%);--error-bg: hsl(358, 76%, 10%);--error-border: hsl(357, 89%, 16%);--error-text: hsl(358, 100%, 81%)}[data-sonner-toaster][data-theme=dark] [data-sonner-toast] [data-close-button]{background:var(--normal-bg);border-color:var(--normal-border);color:var(--normal-text)}[data-sonner-toaster][data-theme=dark] [data-sonner-toast] [data-close-button]:hover{background:var(--normal-bg-hover);border-color:var(--normal-border-hover)}[data-rich-colors=true][data-sonner-toast][data-type=success],[data-rich-colors=true][data-sonner-toast][data-type=success] [data-close-button]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=info],[data-rich-colors=true][data-sonner-toast][data-type=info] [data-close-button]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning],[data-rich-colors=true][data-sonner-toast][data-type=warning] [data-close-button]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=error],[data-rich-colors=true][data-sonner-toast][data-type=error] [data-close-button]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}.sonner-loading-wrapper{--size: 16px;height:var(--size);width:var(--size);position:absolute;inset:0;z-index:10}.sonner-loading-wrapper[data-visible=false]{transform-origin:center;animation:sonner-fade-out .2s ease forwards}.sonner-spinner{position:relative;top:50%;left:50%;height:var(--size);width:var(--size)}.sonner-loading-bar{animation:sonner-spin 1.2s linear infinite;background:var(--gray11);border-radius:6px;height:8%;left:-10%;position:absolute;top:-3.9%;width:24%}.sonner-loading-bar:nth-child(1){animation-delay:-1.2s;transform:rotate(.0001deg) translate(146%)}.sonner-loading-bar:nth-child(2){animation-delay:-1.1s;transform:rotate(30deg) translate(146%)}.sonner-loading-bar:nth-child(3){animation-delay:-1s;transform:rotate(60deg) translate(146%)}.sonner-loading-bar:nth-child(4){animation-delay:-.9s;transform:rotate(90deg) translate(146%)}.sonner-loading-bar:nth-child(5){animation-delay:-.8s;transform:rotate(120deg) translate(146%)}.sonner-loading-bar:nth-child(6){animation-delay:-.7s;transform:rotate(150deg) translate(146%)}.sonner-loading-bar:nth-child(7){animation-delay:-.6s;transform:rotate(180deg) translate(146%)}.sonner-loading-bar:nth-child(8){animation-delay:-.5s;transform:rotate(210deg) translate(146%)}.sonner-loading-bar:nth-child(9){animation-delay:-.4s;transform:rotate(240deg) translate(146%)}.sonner-loading-bar:nth-child(10){animation-delay:-.3s;transform:rotate(270deg) translate(146%)}.sonner-loading-bar:nth-child(11){animation-delay:-.2s;transform:rotate(300deg) translate(146%)}.sonner-loading-bar:nth-child(12){animation-delay:-.1s;transform:rotate(330deg) translate(146%)}@keyframes sonner-fade-in{0%{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}@keyframes sonner-fade-out{0%{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.8)}}@keyframes sonner-spin{0%{opacity:1}to{opacity:.15}}@media (prefers-reduced-motion){[data-sonner-toast],[data-sonner-toast]>*,.sonner-loading-bar{transition:none!important;animation:none!important}}.sonner-loader{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);transform-origin:center;transition:opacity .2s,transform .2s}.sonner-loader[data-visible=false]{opacity:0;transform:scale(.8) translate(-50%,-50%)}
`);
function Hs(e) {
  return e.label !== void 0
}
var wP = 3
, bP = "32px"
, SP = "16px"
, Qp = 4e3
, CP = 356
, kP = 14
, EP = 20
, PP = 200;
function At(...e) {
  return e.filter(Boolean).join(" ")
}
function TP(e) {
  let[t,n] = e.split("-")
    , r = [];
  return t && r.push(t),
  n && r.push(n),
  r
}
var AP = e => {
  var t, n, r, i, o, s, a, l, c, u, d;
  let {invert: f, toast: p, unstyled: b, interacting: y, setHeights: w, visibleToasts: m, heights: g, index: v, toasts: S, expanded: C, removeToast: k, defaultRichColors: E, closeButton: P, style: j, cancelButtonStyle: R, actionButtonStyle: z, className: L="", descriptionClassName: W="", duration: I, position: K, gap: $, loadingIcon: V, expandByDefault: T, classNames: N, icons: O, closeButtonAriaLabel: H="Close toast", pauseWhenPageIsHidden: U} = e
    , [Y,X] = M.useState(null)
    , [Se,Ie] = M.useState(null)
    , [te,Wr] = M.useState(!1)
    , [kn,mr] = M.useState(!1)
    , [En,Hr] = M.useState(!1)
    , [Pn,Ss] = M.useState(!1)
    , [Fl,Cs] = M.useState(!1)
    , [Bl,eo] = M.useState(0)
    , [Kr,Ch] = M.useState(0)
    , to = M.useRef(p.duration || I || Qp)
    , kh = M.useRef(null)
    , gr = M.useRef(null)
    , Tb = v === 0
    , Ab = v + 1 <= m
    , ht = p.type
    , qr = p.dismissible !== !1
    , Nb = p.className || ""
    , Rb = p.descriptionClassName || ""
    , ks = M.useMemo( () => g.findIndex(q => q.toastId === p.id) || 0, [g, p.id])
    , jb = M.useMemo( () => {
      var q;
      return (q = p.closeButton) != null ? q : P
  }
  , [p.closeButton, P])
    , Eh = M.useMemo( () => p.duration || I || Qp, [p.duration, I])
    , $l = M.useRef(0)
    , Gr = M.useRef(0)
    , Ph = M.useRef(0)
    , Qr = M.useRef(null)
    , [Mb,Db] = K.split("-")
    , Th = M.useMemo( () => g.reduce( (q, ie, de) => de >= ks ? q : q + ie.height, 0), [g, ks])
    , Ah = fP()
    , Ib = p.invert || f
    , Ul = ht === "loading";
  Gr.current = M.useMemo( () => ks * $ + Th, [ks, Th]),
  M.useEffect( () => {
      to.current = Eh
  }
  , [Eh]),
  M.useEffect( () => {
      Wr(!0)
  }
  , []),
  M.useEffect( () => {
      let q = gr.current;
      if (q) {
          let ie = q.getBoundingClientRect().height;
          return Ch(ie),
          w(de => [{
              toastId: p.id,
              height: ie,
              position: p.position
          }, ...de]),
          () => w(de => de.filter(kt => kt.toastId !== p.id))
      }
  }
  , [w, p.id]),
  M.useLayoutEffect( () => {
      if (!te)
          return;
      let q = gr.current
        , ie = q.style.height;
      q.style.height = "auto";
      let de = q.getBoundingClientRect().height;
      q.style.height = ie,
      Ch(de),
      w(kt => kt.find(Et => Et.toastId === p.id) ? kt.map(Et => Et.toastId === p.id ? {
          ...Et,
          height: de
      } : Et) : [{
          toastId: p.id,
          height: de,
          position: p.position
      }, ...kt])
  }
  , [te, p.title, p.description, w, p.id]);
  let Tn = M.useCallback( () => {
      mr(!0),
      eo(Gr.current),
      w(q => q.filter(ie => ie.toastId !== p.id)),
      setTimeout( () => {
          k(p)
      }
      , PP)
  }
  , [p, k, w, Gr]);
  M.useEffect( () => {
      if (p.promise && ht === "loading" || p.duration === 1 / 0 || p.type === "loading")
          return;
      let q;
      return C || y || U && Ah ? ( () => {
          if (Ph.current < $l.current) {
              let ie = new Date().getTime() - $l.current;
              to.current = to.current - ie
          }
          Ph.current = new Date().getTime()
      }
      )() : to.current !== 1 / 0 && ($l.current = new Date().getTime(),
      q = setTimeout( () => {
          var ie;
          (ie = p.onAutoClose) == null || ie.call(p, p),
          Tn()
      }
      , to.current)),
      () => clearTimeout(q)
  }
  , [C, y, p, ht, U, Ah, Tn]),
  M.useEffect( () => {
      p.delete && Tn()
  }
  , [Tn, p.delete]);
  function Lb() {
      var q, ie, de;
      return O != null && O.loading ? M.createElement("div", {
          className: At(N == null ? void 0 : N.loader, (q = p == null ? void 0 : p.classNames) == null ? void 0 : q.loader, "sonner-loader"),
          "data-visible": ht === "loading"
      }, O.loading) : V ? M.createElement("div", {
          className: At(N == null ? void 0 : N.loader, (ie = p == null ? void 0 : p.classNames) == null ? void 0 : ie.loader, "sonner-loader"),
          "data-visible": ht === "loading"
      }, V) : M.createElement(sP, {
          className: At(N == null ? void 0 : N.loader, (de = p == null ? void 0 : p.classNames) == null ? void 0 : de.loader),
          visible: ht === "loading"
      })
  }
  return M.createElement("li", {
      tabIndex: 0,
      ref: gr,
      className: At(L, Nb, N == null ? void 0 : N.toast, (t = p == null ? void 0 : p.classNames) == null ? void 0 : t.toast, N == null ? void 0 : N.default, N == null ? void 0 : N[ht], (n = p == null ? void 0 : p.classNames) == null ? void 0 : n[ht]),
      "data-sonner-toast": "",
      "data-rich-colors": (r = p.richColors) != null ? r : E,
      "data-styled": !(p.jsx || p.unstyled || b),
      "data-mounted": te,
      "data-promise": !!p.promise,
      "data-swiped": Fl,
      "data-removed": kn,
      "data-visible": Ab,
      "data-y-position": Mb,
      "data-x-position": Db,
      "data-index": v,
      "data-front": Tb,
      "data-swiping": En,
      "data-dismissible": qr,
      "data-type": ht,
      "data-invert": Ib,
      "data-swipe-out": Pn,
      "data-swipe-direction": Se,
      "data-expanded": !!(C || T && te),
      style: {
          "--index": v,
          "--toasts-before": v,
          "--z-index": S.length - v,
          "--offset": `${kn ? Bl : Gr.current}px`,
          "--initial-height": T ? "auto" : `${Kr}px`,
          ...j,
          ...p.style
      },
      onDragEnd: () => {
          Hr(!1),
          X(null),
          Qr.current = null
      }
      ,
      onPointerDown: q => {
          Ul || !qr || (kh.current = new Date,
          eo(Gr.current),
          q.target.setPointerCapture(q.pointerId),
          q.target.tagName !== "BUTTON" && (Hr(!0),
          Qr.current = {
              x: q.clientX,
              y: q.clientY
          }))
      }
      ,
      onPointerUp: () => {
          var q, ie, de, kt;
          if (Pn || !qr)
              return;
          Qr.current = null;
          let Et = Number(((q = gr.current) == null ? void 0 : q.style.getPropertyValue("--swipe-amount-x").replace("px", "")) || 0)
            , An = Number(((ie = gr.current) == null ? void 0 : ie.style.getPropertyValue("--swipe-amount-y").replace("px", "")) || 0)
            , yr = new Date().getTime() - ((de = kh.current) == null ? void 0 : de.getTime())
            , Pt = Y === "x" ? Et : An
            , Nn = Math.abs(Pt) / yr;
          if (Math.abs(Pt) >= EP || Nn > .11) {
              eo(Gr.current),
              (kt = p.onDismiss) == null || kt.call(p, p),
              Ie(Y === "x" ? Et > 0 ? "right" : "left" : An > 0 ? "down" : "up"),
              Tn(),
              Ss(!0),
              Cs(!1);
              return
          }
          Hr(!1),
          X(null)
      }
      ,
      onPointerMove: q => {
          var ie, de, kt, Et;
          if (!Qr.current || !qr || ((ie = window.getSelection()) == null ? void 0 : ie.toString().length) > 0)
              return;
          let An = q.clientY - Qr.current.y
            , yr = q.clientX - Qr.current.x
            , Pt = (de = e.swipeDirections) != null ? de : TP(K);
          !Y && (Math.abs(yr) > 1 || Math.abs(An) > 1) && X(Math.abs(yr) > Math.abs(An) ? "x" : "y");
          let Nn = {
              x: 0,
              y: 0
          };
          Y === "y" ? (Pt.includes("top") || Pt.includes("bottom")) && (Pt.includes("top") && An < 0 || Pt.includes("bottom") && An > 0) && (Nn.y = An) : Y === "x" && (Pt.includes("left") || Pt.includes("right")) && (Pt.includes("left") && yr < 0 || Pt.includes("right") && yr > 0) && (Nn.x = yr),
          (Math.abs(Nn.x) > 0 || Math.abs(Nn.y) > 0) && Cs(!0),
          (kt = gr.current) == null || kt.style.setProperty("--swipe-amount-x", `${Nn.x}px`),
          (Et = gr.current) == null || Et.style.setProperty("--swipe-amount-y", `${Nn.y}px`)
      }
  }, jb && !p.jsx ? M.createElement("button", {
      "aria-label": H,
      "data-disabled": Ul,
      "data-close-button": !0,
      onClick: Ul || !qr ? () => {}
      : () => {
          var q;
          Tn(),
          (q = p.onDismiss) == null || q.call(p, p)
      }
      ,
      className: At(N == null ? void 0 : N.closeButton, (i = p == null ? void 0 : p.classNames) == null ? void 0 : i.closeButton)
  }, (o = O == null ? void 0 : O.close) != null ? o : dP) : null, p.jsx || x.isValidElement(p.title) ? p.jsx ? p.jsx : typeof p.title == "function" ? p.title() : p.title : M.createElement(M.Fragment, null, ht || p.icon || p.promise ? M.createElement("div", {
      "data-icon": "",
      className: At(N == null ? void 0 : N.icon, (s = p == null ? void 0 : p.classNames) == null ? void 0 : s.icon)
  }, p.promise || p.type === "loading" && !p.icon ? p.icon || Lb() : null, p.type !== "loading" ? p.icon || (O == null ? void 0 : O[ht]) || iP(ht) : null) : null, M.createElement("div", {
      "data-content": "",
      className: At(N == null ? void 0 : N.content, (a = p == null ? void 0 : p.classNames) == null ? void 0 : a.content)
  }, M.createElement("div", {
      "data-title": "",
      className: At(N == null ? void 0 : N.title, (l = p == null ? void 0 : p.classNames) == null ? void 0 : l.title)
  }, typeof p.title == "function" ? p.title() : p.title), p.description ? M.createElement("div", {
      "data-description": "",
      className: At(W, Rb, N == null ? void 0 : N.description, (c = p == null ? void 0 : p.classNames) == null ? void 0 : c.description)
  }, typeof p.description == "function" ? p.description() : p.description) : null), x.isValidElement(p.cancel) ? p.cancel : p.cancel && Hs(p.cancel) ? M.createElement("button", {
      "data-button": !0,
      "data-cancel": !0,
      style: p.cancelButtonStyle || R,
      onClick: q => {
          var ie, de;
          Hs(p.cancel) && qr && ((de = (ie = p.cancel).onClick) == null || de.call(ie, q),
          Tn())
      }
      ,
      className: At(N == null ? void 0 : N.cancelButton, (u = p == null ? void 0 : p.classNames) == null ? void 0 : u.cancelButton)
  }, p.cancel.label) : null, x.isValidElement(p.action) ? p.action : p.action && Hs(p.action) ? M.createElement("button", {
      "data-button": !0,
      "data-action": !0,
      style: p.actionButtonStyle || z,
      onClick: q => {
          var ie, de;
          Hs(p.action) && ((de = (ie = p.action).onClick) == null || de.call(ie, q),
          !q.defaultPrevented && Tn())
      }
      ,
      className: At(N == null ? void 0 : N.actionButton, (d = p == null ? void 0 : p.classNames) == null ? void 0 : d.actionButton)
  }, p.action.label) : null))
}
;
function Yp() {
  if (typeof window > "u" || typeof document > "u")
      return "ltr";
  let e = document.documentElement.getAttribute("dir");
  return e === "auto" || !e ? window.getComputedStyle(document.documentElement).direction : e
}
function NP(e, t) {
  let n = {};
  return [e, t].forEach( (r, i) => {
      let o = i === 1
        , s = o ? "--mobile-offset" : "--offset"
        , a = o ? SP : bP;
      function l(c) {
          ["top", "right", "bottom", "left"].forEach(u => {
              n[`${s}-${u}`] = typeof c == "number" ? `${c}px` : c
          }
          )
      }
      typeof r == "number" || typeof r == "string" ? l(r) : typeof r == "object" ? ["top", "right", "bottom", "left"].forEach(c => {
          r[c] === void 0 ? n[`${s}-${c}`] = a : n[`${s}-${c}`] = typeof r[c] == "number" ? `${r[c]}px` : r[c]
      }
      ) : l(a)
  }
  ),
  n
}
var RP = x.forwardRef(function(e, t) {
  let {invert: n, position: r="bottom-right", hotkey: i=["altKey", "KeyT"], expand: o, closeButton: s, className: a, offset: l, mobileOffset: c, theme: u="light", richColors: d, duration: f, style: p, visibleToasts: b=wP, toastOptions: y, dir: w=Yp(), gap: m=kP, loadingIcon: g, icons: v, containerAriaLabel: S="Notifications", pauseWhenPageIsHidden: C} = e
    , [k,E] = M.useState([])
    , P = M.useMemo( () => Array.from(new Set([r].concat(k.filter(U => U.position).map(U => U.position)))), [k, r])
    , [j,R] = M.useState([])
    , [z,L] = M.useState(!1)
    , [W,I] = M.useState(!1)
    , [K,$] = M.useState(u !== "system" ? u : typeof window < "u" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    , V = M.useRef(null)
    , T = i.join("+").replace(/Key/g, "").replace(/Digit/g, "")
    , N = M.useRef(null)
    , O = M.useRef(!1)
    , H = M.useCallback(U => {
      E(Y => {
          var X;
          return (X = Y.find(Se => Se.id === U.id)) != null && X.delete || Ze.dismiss(U.id),
          Y.filter( ({id: Se}) => Se !== U.id)
      }
      )
  }
  , []);
  return M.useEffect( () => Ze.subscribe(U => {
      if (U.dismiss) {
          E(Y => Y.map(X => X.id === U.id ? {
              ...X,
              delete: !0
          } : X));
          return
      }
      setTimeout( () => {
          c0.flushSync( () => {
              E(Y => {
                  let X = Y.findIndex(Se => Se.id === U.id);
                  return X !== -1 ? [...Y.slice(0, X), {
                      ...Y[X],
                      ...U
                  }, ...Y.slice(X + 1)] : [U, ...Y]
              }
              )
          }
          )
      }
      )
  }
  ), []),
  M.useEffect( () => {
      if (u !== "system") {
          $(u);
          return
      }
      if (u === "system" && (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? $("dark") : $("light")),
      typeof window > "u")
          return;
      let U = window.matchMedia("(prefers-color-scheme: dark)");
      try {
          U.addEventListener("change", ({matches: Y}) => {
              $(Y ? "dark" : "light")
          }
          )
      } catch {
          U.addListener( ({matches: X}) => {
              try {
                  $(X ? "dark" : "light")
              } catch (Se) {
                  console.error(Se)
              }
          }
          )
      }
  }
  , [u]),
  M.useEffect( () => {
      k.length <= 1 && L(!1)
  }
  , [k]),
  M.useEffect( () => {
      let U = Y => {
          var X, Se;
          i.every(Ie => Y[Ie] || Y.code === Ie) && (L(!0),
          (X = V.current) == null || X.focus()),
          Y.code === "Escape" && (document.activeElement === V.current || (Se = V.current) != null && Se.contains(document.activeElement)) && L(!1)
      }
      ;
      return document.addEventListener("keydown", U),
      () => document.removeEventListener("keydown", U)
  }
  , [i]),
  M.useEffect( () => {
      if (V.current)
          return () => {
              N.current && (N.current.focus({
                  preventScroll: !0
              }),
              N.current = null,
              O.current = !1)
          }
  }
  , [V.current]),
  M.createElement("section", {
      ref: t,
      "aria-label": `${S} ${T}`,
      tabIndex: -1,
      "aria-live": "polite",
      "aria-relevant": "additions text",
      "aria-atomic": "false",
      suppressHydrationWarning: !0
  }, P.map( (U, Y) => {
      var X;
      let[Se,Ie] = U.split("-");
      return k.length ? M.createElement("ol", {
          key: U,
          dir: w === "auto" ? Yp() : w,
          tabIndex: -1,
          ref: V,
          className: a,
          "data-sonner-toaster": !0,
          "data-theme": K,
          "data-y-position": Se,
          "data-lifted": z && k.length > 1 && !o,
          "data-x-position": Ie,
          style: {
              "--front-toast-height": `${((X = j[0]) == null ? void 0 : X.height) || 0}px`,
              "--width": `${CP}px`,
              "--gap": `${m}px`,
              ...p,
              ...NP(l, c)
          },
          onBlur: te => {
              O.current && !te.currentTarget.contains(te.relatedTarget) && (O.current = !1,
              N.current && (N.current.focus({
                  preventScroll: !0
              }),
              N.current = null))
          }
          ,
          onFocus: te => {
              te.target instanceof HTMLElement && te.target.dataset.dismissible === "false" || O.current || (O.current = !0,
              N.current = te.relatedTarget)
          }
          ,
          onMouseEnter: () => L(!0),
          onMouseMove: () => L(!0),
          onMouseLeave: () => {
              W || L(!1)
          }
          ,
          onDragEnd: () => L(!1),
          onPointerDown: te => {
              te.target instanceof HTMLElement && te.target.dataset.dismissible === "false" || I(!0)
          }
          ,
          onPointerUp: () => I(!1)
      }, k.filter(te => !te.position && Y === 0 || te.position === U).map( (te, Wr) => {
          var kn, mr;
          return M.createElement(AP, {
              key: te.id,
              icons: v,
              index: Wr,
              toast: te,
              defaultRichColors: d,
              duration: (kn = y == null ? void 0 : y.duration) != null ? kn : f,
              className: y == null ? void 0 : y.className,
              descriptionClassName: y == null ? void 0 : y.descriptionClassName,
              invert: n,
              visibleToasts: b,
              closeButton: (mr = y == null ? void 0 : y.closeButton) != null ? mr : s,
              interacting: W,
              position: U,
              style: y == null ? void 0 : y.style,
              unstyled: y == null ? void 0 : y.unstyled,
              classNames: y == null ? void 0 : y.classNames,
              cancelButtonStyle: y == null ? void 0 : y.cancelButtonStyle,
              actionButtonStyle: y == null ? void 0 : y.actionButtonStyle,
              removeToast: H,
              toasts: k.filter(En => En.position == te.position),
              heights: j.filter(En => En.position == te.position),
              setHeights: R,
              expandByDefault: o,
              gap: m,
              loadingIcon: g,
              expanded: z,
              pauseWhenPageIsHidden: C,
              swipeDirections: e.swipeDirections
          })
      }
      )) : null
  }
  ))
});
const jP = ({...e}) => {
  const {theme: t="system"} = rP();
  return h.jsx(RP, {
      theme: t,
      className: "toaster group",
      toastOptions: {
          classNames: {
              toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
              description: "group-[.toast]:text-muted-foreground",
              actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
              cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
          }
      },
      ...e
  })
}
;
var MP = Ed[" useId ".trim().toString()] || ( () => {}
)
, DP = 0;
function J0(e) {
  const [t,n] = x.useState(MP());
  return nn( () => {
      n(r => r ?? String(DP++))
  }
  , [e]),
  t ? `radix-${t}` : ""
}
const IP = ["top", "right", "bottom", "left"]
, sr = Math.min
, ot = Math.max
, Ba = Math.round
, Ks = Math.floor
, Jt = e => ({
  x: e,
  y: e
})
, LP = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
}
, OP = {
  start: "end",
  end: "start"
};
function Vu(e, t, n) {
  return ot(e, sr(t, n))
}
function wn(e, t) {
  return typeof e == "function" ? e(t) : e
}
function bn(e) {
  return e.split("-")[0]
}
function Gi(e) {
  return e.split("-")[1]
}
function kf(e) {
  return e === "x" ? "y" : "x"
}
function Ef(e) {
  return e === "y" ? "height" : "width"
}
const zP = new Set(["top", "bottom"]);
function Yt(e) {
  return zP.has(bn(e)) ? "y" : "x"
}
function Pf(e) {
  return kf(Yt(e))
}
function _P(e, t, n) {
  n === void 0 && (n = !1);
  const r = Gi(e)
    , i = Pf(e)
    , o = Ef(i);
  let s = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
  return t.reference[o] > t.floating[o] && (s = $a(s)),
  [s, $a(s)]
}
function VP(e) {
  const t = $a(e);
  return [Fu(e), t, Fu(t)]
}
function Fu(e) {
  return e.replace(/start|end/g, t => OP[t])
}
const Zp = ["left", "right"]
, Xp = ["right", "left"]
, FP = ["top", "bottom"]
, BP = ["bottom", "top"];
function $P(e, t, n) {
  switch (e) {
  case "top":
  case "bottom":
      return n ? t ? Xp : Zp : t ? Zp : Xp;
  case "left":
  case "right":
      return t ? FP : BP;
  default:
      return []
  }
}
function UP(e, t, n, r) {
  const i = Gi(e);
  let o = $P(bn(e), n === "start", r);
  return i && (o = o.map(s => s + "-" + i),
  t && (o = o.concat(o.map(Fu)))),
  o
}
function $a(e) {
  return e.replace(/left|right|bottom|top/g, t => LP[t])
}
function WP(e) {
  return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      ...e
  }
}
function ex(e) {
  return typeof e != "number" ? WP(e) : {
      top: e,
      right: e,
      bottom: e,
      left: e
  }
}
function Ua(e) {
  const {x: t, y: n, width: r, height: i} = e;
  return {
      width: r,
      height: i,
      top: n,
      left: t,
      right: t + r,
      bottom: n + i,
      x: t,
      y: n
  }
}
function Jp(e, t, n) {
  let {reference: r, floating: i} = e;
  const o = Yt(t)
    , s = Pf(t)
    , a = Ef(s)
    , l = bn(t)
    , c = o === "y"
    , u = r.x + r.width / 2 - i.width / 2
    , d = r.y + r.height / 2 - i.height / 2
    , f = r[a] / 2 - i[a] / 2;
  let p;
  switch (l) {
  case "top":
      p = {
          x: u,
          y: r.y - i.height
      };
      break;
  case "bottom":
      p = {
          x: u,
          y: r.y + r.height
      };
      break;
  case "right":
      p = {
          x: r.x + r.width,
          y: d
      };
      break;
  case "left":
      p = {
          x: r.x - i.width,
          y: d
      };
      break;
  default:
      p = {
          x: r.x,
          y: r.y
      }
  }
  switch (Gi(t)) {
  case "start":
      p[s] -= f * (n && c ? -1 : 1);
      break;
  case "end":
      p[s] += f * (n && c ? -1 : 1);
      break
  }
  return p
}
const HP = async (e, t, n) => {
  const {placement: r="bottom", strategy: i="absolute", middleware: o=[], platform: s} = n
    , a = o.filter(Boolean)
    , l = await (s.isRTL == null ? void 0 : s.isRTL(t));
  let c = await s.getElementRects({
      reference: e,
      floating: t,
      strategy: i
  })
    , {x: u, y: d} = Jp(c, r, l)
    , f = r
    , p = {}
    , b = 0;
  for (let y = 0; y < a.length; y++) {
      const {name: w, fn: m} = a[y]
        , {x: g, y: v, data: S, reset: C} = await m({
          x: u,
          y: d,
          initialPlacement: r,
          placement: f,
          strategy: i,
          middlewareData: p,
          rects: c,
          platform: s,
          elements: {
              reference: e,
              floating: t
          }
      });
      u = g ?? u,
      d = v ?? d,
      p = {
          ...p,
          [w]: {
              ...p[w],
              ...S
          }
      },
      C && b <= 50 && (b++,
      typeof C == "object" && (C.placement && (f = C.placement),
      C.rects && (c = C.rects === !0 ? await s.getElementRects({
          reference: e,
          floating: t,
          strategy: i
      }) : C.rects),
      {x: u, y: d} = Jp(c, f, l)),
      y = -1)
  }
  return {
      x: u,
      y: d,
      placement: f,
      strategy: i,
      middlewareData: p
  }
}
;
async function Zo(e, t) {
  var n;
  t === void 0 && (t = {});
  const {x: r, y: i, platform: o, rects: s, elements: a, strategy: l} = e
    , {boundary: c="clippingAncestors", rootBoundary: u="viewport", elementContext: d="floating", altBoundary: f=!1, padding: p=0} = wn(t, e)
    , b = ex(p)
    , w = a[f ? d === "floating" ? "reference" : "floating" : d]
    , m = Ua(await o.getClippingRect({
      element: (n = await (o.isElement == null ? void 0 : o.isElement(w))) == null || n ? w : w.contextElement || await (o.getDocumentElement == null ? void 0 : o.getDocumentElement(a.floating)),
      boundary: c,
      rootBoundary: u,
      strategy: l
  }))
    , g = d === "floating" ? {
      x: r,
      y: i,
      width: s.floating.width,
      height: s.floating.height
  } : s.reference
    , v = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(a.floating))
    , S = await (o.isElement == null ? void 0 : o.isElement(v)) ? await (o.getScale == null ? void 0 : o.getScale(v)) || {
      x: 1,
      y: 1
  } : {
      x: 1,
      y: 1
  }
    , C = Ua(o.convertOffsetParentRelativeRectToViewportRelativeRect ? await o.convertOffsetParentRelativeRectToViewportRelativeRect({
      elements: a,
      rect: g,
      offsetParent: v,
      strategy: l
  }) : g);
  return {
      top: (m.top - C.top + b.top) / S.y,
      bottom: (C.bottom - m.bottom + b.bottom) / S.y,
      left: (m.left - C.left + b.left) / S.x,
      right: (C.right - m.right + b.right) / S.x
  }
}
const KP = e => ({
  name: "arrow",
  options: e,
  async fn(t) {
      const {x: n, y: r, placement: i, rects: o, platform: s, elements: a, middlewareData: l} = t
        , {element: c, padding: u=0} = wn(e, t) || {};
      if (c == null)
          return {};
      const d = ex(u)
        , f = {
          x: n,
          y: r
      }
        , p = Pf(i)
        , b = Ef(p)
        , y = await s.getDimensions(c)
        , w = p === "y"
        , m = w ? "top" : "left"
        , g = w ? "bottom" : "right"
        , v = w ? "clientHeight" : "clientWidth"
        , S = o.reference[b] + o.reference[p] - f[p] - o.floating[b]
        , C = f[p] - o.reference[p]
        , k = await (s.getOffsetParent == null ? void 0 : s.getOffsetParent(c));
      let E = k ? k[v] : 0;
      (!E || !await (s.isElement == null ? void 0 : s.isElement(k))) && (E = a.floating[v] || o.floating[b]);
      const P = S / 2 - C / 2
        , j = E / 2 - y[b] / 2 - 1
        , R = sr(d[m], j)
        , z = sr(d[g], j)
        , L = R
        , W = E - y[b] - z
        , I = E / 2 - y[b] / 2 + P
        , K = Vu(L, I, W)
        , $ = !l.arrow && Gi(i) != null && I !== K && o.reference[b] / 2 - (I < L ? R : z) - y[b] / 2 < 0
        , V = $ ? I < L ? I - L : I - W : 0;
      return {
          [p]: f[p] + V,
          data: {
              [p]: K,
              centerOffset: I - K - V,
              ...$ && {
                  alignmentOffset: V
              }
          },
          reset: $
      }
  }
})
, qP = function(e) {
  return e === void 0 && (e = {}),
  {
      name: "flip",
      options: e,
      async fn(t) {
          var n, r;
          const {placement: i, middlewareData: o, rects: s, initialPlacement: a, platform: l, elements: c} = t
            , {mainAxis: u=!0, crossAxis: d=!0, fallbackPlacements: f, fallbackStrategy: p="bestFit", fallbackAxisSideDirection: b="none", flipAlignment: y=!0, ...w} = wn(e, t);
          if ((n = o.arrow) != null && n.alignmentOffset)
              return {};
          const m = bn(i)
            , g = Yt(a)
            , v = bn(a) === a
            , S = await (l.isRTL == null ? void 0 : l.isRTL(c.floating))
            , C = f || (v || !y ? [$a(a)] : VP(a))
            , k = b !== "none";
          !f && k && C.push(...UP(a, y, b, S));
          const E = [a, ...C]
            , P = await Zo(t, w)
            , j = [];
          let R = ((r = o.flip) == null ? void 0 : r.overflows) || [];
          if (u && j.push(P[m]),
          d) {
              const I = _P(i, s, S);
              j.push(P[I[0]], P[I[1]])
          }
          if (R = [...R, {
              placement: i,
              overflows: j
          }],
          !j.every(I => I <= 0)) {
              var z, L;
              const I = (((z = o.flip) == null ? void 0 : z.index) || 0) + 1
                , K = E[I];
              if (K && (!(d === "alignment" ? g !== Yt(K) : !1) || R.every(T => T.overflows[0] > 0 && Yt(T.placement) === g)))
                  return {
                      data: {
                          index: I,
                          overflows: R
                      },
                      reset: {
                          placement: K
                      }
                  };
              let $ = (L = R.filter(V => V.overflows[0] <= 0).sort( (V, T) => V.overflows[1] - T.overflows[1])[0]) == null ? void 0 : L.placement;
              if (!$)
                  switch (p) {
                  case "bestFit":
                      {
                          var W;
                          const V = (W = R.filter(T => {
                              if (k) {
                                  const N = Yt(T.placement);
                                  return N === g || N === "y"
                              }
                              return !0
                          }
                          ).map(T => [T.placement, T.overflows.filter(N => N > 0).reduce( (N, O) => N + O, 0)]).sort( (T, N) => T[1] - N[1])[0]) == null ? void 0 : W[0];
                          V && ($ = V);
                          break
                      }
                  case "initialPlacement":
                      $ = a;
                      break
                  }
              if (i !== $)
                  return {
                      reset: {
                          placement: $
                      }
                  }
          }
          return {}
      }
  }
};
function em(e, t) {
  return {
      top: e.top - t.height,
      right: e.right - t.width,
      bottom: e.bottom - t.height,
      left: e.left - t.width
  }
}
function tm(e) {
  return IP.some(t => e[t] >= 0)
}
const GP = function(e) {
  return e === void 0 && (e = {}),
  {
      name: "hide",
      options: e,
      async fn(t) {
          const {rects: n} = t
            , {strategy: r="referenceHidden", ...i} = wn(e, t);
          switch (r) {
          case "referenceHidden":
              {
                  const o = await Zo(t, {
                      ...i,
                      elementContext: "reference"
                  })
                    , s = em(o, n.reference);
                  return {
                      data: {
                          referenceHiddenOffsets: s,
                          referenceHidden: tm(s)
                      }
                  }
              }
          case "escaped":
              {
                  const o = await Zo(t, {
                      ...i,
                      altBoundary: !0
                  })
                    , s = em(o, n.floating);
                  return {
                      data: {
                          escapedOffsets: s,
                          escaped: tm(s)
                      }
                  }
              }
          default:
              return {}
          }
      }
  }
}
, tx = new Set(["left", "top"]);
async function QP(e, t) {
  const {placement: n, platform: r, elements: i} = e
    , o = await (r.isRTL == null ? void 0 : r.isRTL(i.floating))
    , s = bn(n)
    , a = Gi(n)
    , l = Yt(n) === "y"
    , c = tx.has(s) ? -1 : 1
    , u = o && l ? -1 : 1
    , d = wn(t, e);
  let {mainAxis: f, crossAxis: p, alignmentAxis: b} = typeof d == "number" ? {
      mainAxis: d,
      crossAxis: 0,
      alignmentAxis: null
  } : {
      mainAxis: d.mainAxis || 0,
      crossAxis: d.crossAxis || 0,
      alignmentAxis: d.alignmentAxis
  };
  return a && typeof b == "number" && (p = a === "end" ? b * -1 : b),
  l ? {
      x: p * u,
      y: f * c
  } : {
      x: f * c,
      y: p * u
  }
}
const YP = function(e) {
  return e === void 0 && (e = 0),
  {
      name: "offset",
      options: e,
      async fn(t) {
          var n, r;
          const {x: i, y: o, placement: s, middlewareData: a} = t
            , l = await QP(t, e);
          return s === ((n = a.offset) == null ? void 0 : n.placement) && (r = a.arrow) != null && r.alignmentOffset ? {} : {
              x: i + l.x,
              y: o + l.y,
              data: {
                  ...l,
                  placement: s
              }
          }
      }
  }
}
, ZP = function(e) {
  return e === void 0 && (e = {}),
  {
      name: "shift",
      options: e,
      async fn(t) {
          const {x: n, y: r, placement: i} = t
            , {mainAxis: o=!0, crossAxis: s=!1, limiter: a={
              fn: w => {
                  let {x: m, y: g} = w;
                  return {
                      x: m,
                      y: g
                  }
              }
          }, ...l} = wn(e, t)
            , c = {
              x: n,
              y: r
          }
            , u = await Zo(t, l)
            , d = Yt(bn(i))
            , f = kf(d);
          let p = c[f]
            , b = c[d];
          if (o) {
              const w = f === "y" ? "top" : "left"
                , m = f === "y" ? "bottom" : "right"
                , g = p + u[w]
                , v = p - u[m];
              p = Vu(g, p, v)
          }
          if (s) {
              const w = d === "y" ? "top" : "left"
                , m = d === "y" ? "bottom" : "right"
                , g = b + u[w]
                , v = b - u[m];
              b = Vu(g, b, v)
          }
          const y = a.fn({
              ...t,
              [f]: p,
              [d]: b
          });
          return {
              ...y,
              data: {
                  x: y.x - n,
                  y: y.y - r,
                  enabled: {
                      [f]: o,
                      [d]: s
                  }
              }
          }
      }
  }
}
, XP = function(e) {
  return e === void 0 && (e = {}),
  {
      options: e,
      fn(t) {
          const {x: n, y: r, placement: i, rects: o, middlewareData: s} = t
            , {offset: a=0, mainAxis: l=!0, crossAxis: c=!0} = wn(e, t)
            , u = {
              x: n,
              y: r
          }
            , d = Yt(i)
            , f = kf(d);
          let p = u[f]
            , b = u[d];
          const y = wn(a, t)
            , w = typeof y == "number" ? {
              mainAxis: y,
              crossAxis: 0
          } : {
              mainAxis: 0,
              crossAxis: 0,
              ...y
          };
          if (l) {
              const v = f === "y" ? "height" : "width"
                , S = o.reference[f] - o.floating[v] + w.mainAxis
                , C = o.reference[f] + o.reference[v] - w.mainAxis;
              p < S ? p = S : p > C && (p = C)
          }
          if (c) {
              var m, g;
              const v = f === "y" ? "width" : "height"
                , S = tx.has(bn(i))
                , C = o.reference[d] - o.floating[v] + (S && ((m = s.offset) == null ? void 0 : m[d]) || 0) + (S ? 0 : w.crossAxis)
                , k = o.reference[d] + o.reference[v] + (S ? 0 : ((g = s.offset) == null ? void 0 : g[d]) || 0) - (S ? w.crossAxis : 0);
              b < C ? b = C : b > k && (b = k)
          }
          return {
              [f]: p,
              [d]: b
          }
      }
  }
}
, JP = function(e) {
  return e === void 0 && (e = {}),
  {
      name: "size",
      options: e,
      async fn(t) {
          var n, r;
          const {placement: i, rects: o, platform: s, elements: a} = t
            , {apply: l= () => {}
          , ...c} = wn(e, t)
            , u = await Zo(t, c)
            , d = bn(i)
            , f = Gi(i)
            , p = Yt(i) === "y"
            , {width: b, height: y} = o.floating;
          let w, m;
          d === "top" || d === "bottom" ? (w = d,
          m = f === (await (s.isRTL == null ? void 0 : s.isRTL(a.floating)) ? "start" : "end") ? "left" : "right") : (m = d,
          w = f === "end" ? "top" : "bottom");
          const g = y - u.top - u.bottom
            , v = b - u.left - u.right
            , S = sr(y - u[w], g)
            , C = sr(b - u[m], v)
            , k = !t.middlewareData.shift;
          let E = S
            , P = C;
          if ((n = t.middlewareData.shift) != null && n.enabled.x && (P = v),
          (r = t.middlewareData.shift) != null && r.enabled.y && (E = g),
          k && !f) {
              const R = ot(u.left, 0)
                , z = ot(u.right, 0)
                , L = ot(u.top, 0)
                , W = ot(u.bottom, 0);
              p ? P = b - 2 * (R !== 0 || z !== 0 ? R + z : ot(u.left, u.right)) : E = y - 2 * (L !== 0 || W !== 0 ? L + W : ot(u.top, u.bottom))
          }
          await l({
              ...t,
              availableWidth: P,
              availableHeight: E
          });
          const j = await s.getDimensions(a.floating);
          return b !== j.width || y !== j.height ? {
              reset: {
                  rects: !0
              }
          } : {}
      }
  }
};
function wl() {
  return typeof window < "u"
}
function Qi(e) {
  return nx(e) ? (e.nodeName || "").toLowerCase() : "#document"
}
function lt(e) {
  var t;
  return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window
}
function sn(e) {
  var t;
  return (t = (nx(e) ? e.ownerDocument : e.document) || window.document) == null ? void 0 : t.documentElement
}
function nx(e) {
  return wl() ? e instanceof Node || e instanceof lt(e).Node : !1
}
function Ft(e) {
  return wl() ? e instanceof Element || e instanceof lt(e).Element : !1
}
function rn(e) {
  return wl() ? e instanceof HTMLElement || e instanceof lt(e).HTMLElement : !1
}
function nm(e) {
  return !wl() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof lt(e).ShadowRoot
}
const eT = new Set(["inline", "contents"]);
function gs(e) {
  const {overflow: t, overflowX: n, overflowY: r, display: i} = Bt(e);
  return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && !eT.has(i)
}
const tT = new Set(["table", "td", "th"]);
function nT(e) {
  return tT.has(Qi(e))
}
const rT = [":popover-open", ":modal"];
function bl(e) {
  return rT.some(t => {
      try {
          return e.matches(t)
      } catch {
          return !1
      }
  }
  )
}
const iT = ["transform", "translate", "scale", "rotate", "perspective"]
, oT = ["transform", "translate", "scale", "rotate", "perspective", "filter"]
, sT = ["paint", "layout", "strict", "content"];
function Tf(e) {
  const t = Af()
    , n = Ft(e) ? Bt(e) : e;
  return iT.some(r => n[r] ? n[r] !== "none" : !1) || (n.containerType ? n.containerType !== "normal" : !1) || !t && (n.backdropFilter ? n.backdropFilter !== "none" : !1) || !t && (n.filter ? n.filter !== "none" : !1) || oT.some(r => (n.willChange || "").includes(r)) || sT.some(r => (n.contain || "").includes(r))
}
function aT(e) {
  let t = ar(e);
  for (; rn(t) && !Vi(t); ) {
      if (Tf(t))
          return t;
      if (bl(t))
          return null;
      t = ar(t)
  }
  return null
}
function Af() {
  return typeof CSS > "u" || !CSS.supports ? !1 : CSS.supports("-webkit-backdrop-filter", "none")
}
const lT = new Set(["html", "body", "#document"]);
function Vi(e) {
  return lT.has(Qi(e))
}
function Bt(e) {
  return lt(e).getComputedStyle(e)
}
function Sl(e) {
  return Ft(e) ? {
      scrollLeft: e.scrollLeft,
      scrollTop: e.scrollTop
  } : {
      scrollLeft: e.scrollX,
      scrollTop: e.scrollY
  }
}
function ar(e) {
  if (Qi(e) === "html")
      return e;
  const t = e.assignedSlot || e.parentNode || nm(e) && e.host || sn(e);
  return nm(t) ? t.host : t
}
function rx(e) {
  const t = ar(e);
  return Vi(t) ? e.ownerDocument ? e.ownerDocument.body : e.body : rn(t) && gs(t) ? t : rx(t)
}
function Xo(e, t, n) {
  var r;
  t === void 0 && (t = []),
  n === void 0 && (n = !0);
  const i = rx(e)
    , o = i === ((r = e.ownerDocument) == null ? void 0 : r.body)
    , s = lt(i);
  if (o) {
      const a = Bu(s);
      return t.concat(s, s.visualViewport || [], gs(i) ? i : [], a && n ? Xo(a) : [])
  }
  return t.concat(i, Xo(i, [], n))
}
function Bu(e) {
  return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null
}
function ix(e) {
  const t = Bt(e);
  let n = parseFloat(t.width) || 0
    , r = parseFloat(t.height) || 0;
  const i = rn(e)
    , o = i ? e.offsetWidth : n
    , s = i ? e.offsetHeight : r
    , a = Ba(n) !== o || Ba(r) !== s;
  return a && (n = o,
  r = s),
  {
      width: n,
      height: r,
      $: a
  }
}
function Nf(e) {
  return Ft(e) ? e : e.contextElement
}
function wi(e) {
  const t = Nf(e);
  if (!rn(t))
      return Jt(1);
  const n = t.getBoundingClientRect()
    , {width: r, height: i, $: o} = ix(t);
  let s = (o ? Ba(n.width) : n.width) / r
    , a = (o ? Ba(n.height) : n.height) / i;
  return (!s || !Number.isFinite(s)) && (s = 1),
  (!a || !Number.isFinite(a)) && (a = 1),
  {
      x: s,
      y: a
  }
}
const cT = Jt(0);
function ox(e) {
  const t = lt(e);
  return !Af() || !t.visualViewport ? cT : {
      x: t.visualViewport.offsetLeft,
      y: t.visualViewport.offsetTop
  }
}
function uT(e, t, n) {
  return t === void 0 && (t = !1),
  !n || t && n !== lt(e) ? !1 : t
}
function Br(e, t, n, r) {
  t === void 0 && (t = !1),
  n === void 0 && (n = !1);
  const i = e.getBoundingClientRect()
    , o = Nf(e);
  let s = Jt(1);
  t && (r ? Ft(r) && (s = wi(r)) : s = wi(e));
  const a = uT(o, n, r) ? ox(o) : Jt(0);
  let l = (i.left + a.x) / s.x
    , c = (i.top + a.y) / s.y
    , u = i.width / s.x
    , d = i.height / s.y;
  if (o) {
      const f = lt(o)
        , p = r && Ft(r) ? lt(r) : r;
      let b = f
        , y = Bu(b);
      for (; y && r && p !== b; ) {
          const w = wi(y)
            , m = y.getBoundingClientRect()
            , g = Bt(y)
            , v = m.left + (y.clientLeft + parseFloat(g.paddingLeft)) * w.x
            , S = m.top + (y.clientTop + parseFloat(g.paddingTop)) * w.y;
          l *= w.x,
          c *= w.y,
          u *= w.x,
          d *= w.y,
          l += v,
          c += S,
          b = lt(y),
          y = Bu(b)
      }
  }
  return Ua({
      width: u,
      height: d,
      x: l,
      y: c
  })
}
function Rf(e, t) {
  const n = Sl(e).scrollLeft;
  return t ? t.left + n : Br(sn(e)).left + n
}
function sx(e, t, n) {
  n === void 0 && (n = !1);
  const r = e.getBoundingClientRect()
    , i = r.left + t.scrollLeft - (n ? 0 : Rf(e, r))
    , o = r.top + t.scrollTop;
  return {
      x: i,
      y: o
  }
}
function dT(e) {
  let {elements: t, rect: n, offsetParent: r, strategy: i} = e;
  const o = i === "fixed"
    , s = sn(r)
    , a = t ? bl(t.floating) : !1;
  if (r === s || a && o)
      return n;
  let l = {
      scrollLeft: 0,
      scrollTop: 0
  }
    , c = Jt(1);
  const u = Jt(0)
    , d = rn(r);
  if ((d || !d && !o) && ((Qi(r) !== "body" || gs(s)) && (l = Sl(r)),
  rn(r))) {
      const p = Br(r);
      c = wi(r),
      u.x = p.x + r.clientLeft,
      u.y = p.y + r.clientTop
  }
  const f = s && !d && !o ? sx(s, l, !0) : Jt(0);
  return {
      width: n.width * c.x,
      height: n.height * c.y,
      x: n.x * c.x - l.scrollLeft * c.x + u.x + f.x,
      y: n.y * c.y - l.scrollTop * c.y + u.y + f.y
  }
}
function fT(e) {
  return Array.from(e.getClientRects())
}
function hT(e) {
  const t = sn(e)
    , n = Sl(e)
    , r = e.ownerDocument.body
    , i = ot(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth)
    , o = ot(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight);
  let s = -n.scrollLeft + Rf(e);
  const a = -n.scrollTop;
  return Bt(r).direction === "rtl" && (s += ot(t.clientWidth, r.clientWidth) - i),
  {
      width: i,
      height: o,
      x: s,
      y: a
  }
}
function pT(e, t) {
  const n = lt(e)
    , r = sn(e)
    , i = n.visualViewport;
  let o = r.clientWidth
    , s = r.clientHeight
    , a = 0
    , l = 0;
  if (i) {
      o = i.width,
      s = i.height;
      const c = Af();
      (!c || c && t === "fixed") && (a = i.offsetLeft,
      l = i.offsetTop)
  }
  return {
      width: o,
      height: s,
      x: a,
      y: l
  }
}
const mT = new Set(["absolute", "fixed"]);
function gT(e, t) {
  const n = Br(e, !0, t === "fixed")
    , r = n.top + e.clientTop
    , i = n.left + e.clientLeft
    , o = rn(e) ? wi(e) : Jt(1)
    , s = e.clientWidth * o.x
    , a = e.clientHeight * o.y
    , l = i * o.x
    , c = r * o.y;
  return {
      width: s,
      height: a,
      x: l,
      y: c
  }
}
function rm(e, t, n) {
  let r;
  if (t === "viewport")
      r = pT(e, n);
  else if (t === "document")
      r = hT(sn(e));
  else if (Ft(t))
      r = gT(t, n);
  else {
      const i = ox(e);
      r = {
          x: t.x - i.x,
          y: t.y - i.y,
          width: t.width,
          height: t.height
      }
  }
  return Ua(r)
}
function ax(e, t) {
  const n = ar(e);
  return n === t || !Ft(n) || Vi(n) ? !1 : Bt(n).position === "fixed" || ax(n, t)
}
function yT(e, t) {
  const n = t.get(e);
  if (n)
      return n;
  let r = Xo(e, [], !1).filter(a => Ft(a) && Qi(a) !== "body")
    , i = null;
  const o = Bt(e).position === "fixed";
  let s = o ? ar(e) : e;
  for (; Ft(s) && !Vi(s); ) {
      const a = Bt(s)
        , l = Tf(s);
      !l && a.position === "fixed" && (i = null),
      (o ? !l && !i : !l && a.position === "static" && !!i && mT.has(i.position) || gs(s) && !l && ax(e, s)) ? r = r.filter(u => u !== s) : i = a,
      s = ar(s)
  }
  return t.set(e, r),
  r
}
function vT(e) {
  let {element: t, boundary: n, rootBoundary: r, strategy: i} = e;
  const s = [...n === "clippingAncestors" ? bl(t) ? [] : yT(t, this._c) : [].concat(n), r]
    , a = s[0]
    , l = s.reduce( (c, u) => {
      const d = rm(t, u, i);
      return c.top = ot(d.top, c.top),
      c.right = sr(d.right, c.right),
      c.bottom = sr(d.bottom, c.bottom),
      c.left = ot(d.left, c.left),
      c
  }
  , rm(t, a, i));
  return {
      width: l.right - l.left,
      height: l.bottom - l.top,
      x: l.left,
      y: l.top
  }
}
function xT(e) {
  const {width: t, height: n} = ix(e);
  return {
      width: t,
      height: n
  }
}
function wT(e, t, n) {
  const r = rn(t)
    , i = sn(t)
    , o = n === "fixed"
    , s = Br(e, !0, o, t);
  let a = {
      scrollLeft: 0,
      scrollTop: 0
  };
  const l = Jt(0);
  function c() {
      l.x = Rf(i)
  }
  if (r || !r && !o)
      if ((Qi(t) !== "body" || gs(i)) && (a = Sl(t)),
      r) {
          const p = Br(t, !0, o, t);
          l.x = p.x + t.clientLeft,
          l.y = p.y + t.clientTop
      } else
          i && c();
  o && !r && i && c();
  const u = i && !r && !o ? sx(i, a) : Jt(0)
    , d = s.left + a.scrollLeft - l.x - u.x
    , f = s.top + a.scrollTop - l.y - u.y;
  return {
      x: d,
      y: f,
      width: s.width,
      height: s.height
  }
}
function bc(e) {
  return Bt(e).position === "static"
}
function im(e, t) {
  if (!rn(e) || Bt(e).position === "fixed")
      return null;
  if (t)
      return t(e);
  let n = e.offsetParent;
  return sn(e) === n && (n = n.ownerDocument.body),
  n
}
function lx(e, t) {
  const n = lt(e);
  if (bl(e))
      return n;
  if (!rn(e)) {
      let i = ar(e);
      for (; i && !Vi(i); ) {
          if (Ft(i) && !bc(i))
              return i;
          i = ar(i)
      }
      return n
  }
  let r = im(e, t);
  for (; r && nT(r) && bc(r); )
      r = im(r, t);
  return r && Vi(r) && bc(r) && !Tf(r) ? n : r || aT(e) || n
}
const bT = async function(e) {
  const t = this.getOffsetParent || lx
    , n = this.getDimensions
    , r = await n(e.floating);
  return {
      reference: wT(e.reference, await t(e.floating), e.strategy),
      floating: {
          x: 0,
          y: 0,
          width: r.width,
          height: r.height
      }
  }
};
function ST(e) {
  return Bt(e).direction === "rtl"
}
const CT = {
  convertOffsetParentRelativeRectToViewportRelativeRect: dT,
  getDocumentElement: sn,
  getClippingRect: vT,
  getOffsetParent: lx,
  getElementRects: bT,
  getClientRects: fT,
  getDimensions: xT,
  getScale: wi,
  isElement: Ft,
  isRTL: ST
};
function cx(e, t) {
  return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height
}
function kT(e, t) {
  let n = null, r;
  const i = sn(e);
  function o() {
      var a;
      clearTimeout(r),
      (a = n) == null || a.disconnect(),
      n = null
  }
  function s(a, l) {
      a === void 0 && (a = !1),
      l === void 0 && (l = 1),
      o();
      const c = e.getBoundingClientRect()
        , {left: u, top: d, width: f, height: p} = c;
      if (a || t(),
      !f || !p)
          return;
      const b = Ks(d)
        , y = Ks(i.clientWidth - (u + f))
        , w = Ks(i.clientHeight - (d + p))
        , m = Ks(u)
        , v = {
          rootMargin: -b + "px " + -y + "px " + -w + "px " + -m + "px",
          threshold: ot(0, sr(1, l)) || 1
      };
      let S = !0;
      function C(k) {
          const E = k[0].intersectionRatio;
          if (E !== l) {
              if (!S)
                  return s();
              E ? s(!1, E) : r = setTimeout( () => {
                  s(!1, 1e-7)
              }
              , 1e3)
          }
          E === 1 && !cx(c, e.getBoundingClientRect()) && s(),
          S = !1
      }
      try {
          n = new IntersectionObserver(C,{
              ...v,
              root: i.ownerDocument
          })
      } catch {
          n = new IntersectionObserver(C,v)
      }
      n.observe(e)
  }
  return s(!0),
  o
}
function ET(e, t, n, r) {
  r === void 0 && (r = {});
  const {ancestorScroll: i=!0, ancestorResize: o=!0, elementResize: s=typeof ResizeObserver == "function", layoutShift: a=typeof IntersectionObserver == "function", animationFrame: l=!1} = r
    , c = Nf(e)
    , u = i || o ? [...c ? Xo(c) : [], ...Xo(t)] : [];
  u.forEach(m => {
      i && m.addEventListener("scroll", n, {
          passive: !0
      }),
      o && m.addEventListener("resize", n)
  }
  );
  const d = c && a ? kT(c, n) : null;
  let f = -1
    , p = null;
  s && (p = new ResizeObserver(m => {
      let[g] = m;
      g && g.target === c && p && (p.unobserve(t),
      cancelAnimationFrame(f),
      f = requestAnimationFrame( () => {
          var v;
          (v = p) == null || v.observe(t)
      }
      )),
      n()
  }
  ),
  c && !l && p.observe(c),
  p.observe(t));
  let b, y = l ? Br(e) : null;
  l && w();
  function w() {
      const m = Br(e);
      y && !cx(y, m) && n(),
      y = m,
      b = requestAnimationFrame(w)
  }
  return n(),
  () => {
      var m;
      u.forEach(g => {
          i && g.removeEventListener("scroll", n),
          o && g.removeEventListener("resize", n)
      }
      ),
      d == null || d(),
      (m = p) == null || m.disconnect(),
      p = null,
      l && cancelAnimationFrame(b)
  }
}
const PT = YP
, TT = ZP
, AT = qP
, NT = JP
, RT = GP
, om = KP
, jT = XP
, MT = (e, t, n) => {
  const r = new Map
    , i = {
      platform: CT,
      ...n
  }
    , o = {
      ...i.platform,
      _c: r
  };
  return HP(e, t, {
      ...i,
      platform: o
  })
}
;
var DT = typeof document < "u"
, IT = function() {}
, fa = DT ? x.useLayoutEffect : IT;
function Wa(e, t) {
  if (e === t)
      return !0;
  if (typeof e != typeof t)
      return !1;
  if (typeof e == "function" && e.toString() === t.toString())
      return !0;
  let n, r, i;
  if (e && t && typeof e == "object") {
      if (Array.isArray(e)) {
          if (n = e.length,
          n !== t.length)
              return !1;
          for (r = n; r-- !== 0; )
              if (!Wa(e[r], t[r]))
                  return !1;
          return !0
      }
      if (i = Object.keys(e),
      n = i.length,
      n !== Object.keys(t).length)
          return !1;
      for (r = n; r-- !== 0; )
          if (!{}.hasOwnProperty.call(t, i[r]))
              return !1;
      for (r = n; r-- !== 0; ) {
          const o = i[r];
          if (!(o === "_owner" && e.$$typeof) && !Wa(e[o], t[o]))
              return !1
      }
      return !0
  }
  return e !== e && t !== t
}
function ux(e) {
  return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1
}
function sm(e, t) {
  const n = ux(e);
  return Math.round(t * n) / n
}
function Sc(e) {
  const t = x.useRef(e);
  return fa( () => {
      t.current = e
  }
  ),
  t
}
function LT(e) {
  e === void 0 && (e = {});
  const {placement: t="bottom", strategy: n="absolute", middleware: r=[], platform: i, elements: {reference: o, floating: s}={}, transform: a=!0, whileElementsMounted: l, open: c} = e
    , [u,d] = x.useState({
      x: 0,
      y: 0,
      strategy: n,
      placement: t,
      middlewareData: {},
      isPositioned: !1
  })
    , [f,p] = x.useState(r);
  Wa(f, r) || p(r);
  const [b,y] = x.useState(null)
    , [w,m] = x.useState(null)
    , g = x.useCallback(T => {
      T !== k.current && (k.current = T,
      y(T))
  }
  , [])
    , v = x.useCallback(T => {
      T !== E.current && (E.current = T,
      m(T))
  }
  , [])
    , S = o || b
    , C = s || w
    , k = x.useRef(null)
    , E = x.useRef(null)
    , P = x.useRef(u)
    , j = l != null
    , R = Sc(l)
    , z = Sc(i)
    , L = Sc(c)
    , W = x.useCallback( () => {
      if (!k.current || !E.current)
          return;
      const T = {
          placement: t,
          strategy: n,
          middleware: f
      };
      z.current && (T.platform = z.current),
      MT(k.current, E.current, T).then(N => {
          const O = {
              ...N,
              isPositioned: L.current !== !1
          };
          I.current && !Wa(P.current, O) && (P.current = O,
          hs.flushSync( () => {
              d(O)
          }
          ))
      }
      )
  }
  , [f, t, n, z, L]);
  fa( () => {
      c === !1 && P.current.isPositioned && (P.current.isPositioned = !1,
      d(T => ({
          ...T,
          isPositioned: !1
      })))
  }
  , [c]);
  const I = x.useRef(!1);
  fa( () => (I.current = !0,
  () => {
      I.current = !1
  }
  ), []),
  fa( () => {
      if (S && (k.current = S),
      C && (E.current = C),
      S && C) {
          if (R.current)
              return R.current(S, C, W);
          W()
      }
  }
  , [S, C, W, R, j]);
  const K = x.useMemo( () => ({
      reference: k,
      floating: E,
      setReference: g,
      setFloating: v
  }), [g, v])
    , $ = x.useMemo( () => ({
      reference: S,
      floating: C
  }), [S, C])
    , V = x.useMemo( () => {
      const T = {
          position: n,
          left: 0,
          top: 0
      };
      if (!$.floating)
          return T;
      const N = sm($.floating, u.x)
        , O = sm($.floating, u.y);
      return a ? {
          ...T,
          transform: "translate(" + N + "px, " + O + "px)",
          ...ux($.floating) >= 1.5 && {
              willChange: "transform"
          }
      } : {
          position: n,
          left: N,
          top: O
      }
  }
  , [n, a, $.floating, u.x, u.y]);
  return x.useMemo( () => ({
      ...u,
      update: W,
      refs: K,
      elements: $,
      floatingStyles: V
  }), [u, W, K, $, V])
}
const OT = e => {
  function t(n) {
      return {}.hasOwnProperty.call(n, "current")
  }
  return {
      name: "arrow",
      options: e,
      fn(n) {
          const {element: r, padding: i} = typeof e == "function" ? e(n) : e;
          return r && t(r) ? r.current != null ? om({
              element: r.current,
              padding: i
          }).fn(n) : {} : r ? om({
              element: r,
              padding: i
          }).fn(n) : {}
      }
  }
}
, zT = (e, t) => ({
  ...PT(e),
  options: [e, t]
})
, _T = (e, t) => ({
  ...TT(e),
  options: [e, t]
})
, VT = (e, t) => ({
  ...jT(e),
  options: [e, t]
})
, FT = (e, t) => ({
  ...AT(e),
  options: [e, t]
})
, BT = (e, t) => ({
  ...NT(e),
  options: [e, t]
})
, $T = (e, t) => ({
  ...RT(e),
  options: [e, t]
})
, UT = (e, t) => ({
  ...OT(e),
  options: [e, t]
});
var WT = "Arrow"
, dx = x.forwardRef( (e, t) => {
  const {children: n, width: r=10, height: i=5, ...o} = e;
  return h.jsx(oe.svg, {
      ...o,
      ref: t,
      width: r,
      height: i,
      viewBox: "0 0 30 10",
      preserveAspectRatio: "none",
      children: e.asChild ? n : h.jsx("polygon", {
          points: "0,0 30,0 15,10"
      })
  })
}
);
dx.displayName = WT;
var HT = dx;
function jf(e) {
  const [t,n] = x.useState(void 0);
  return nn( () => {
      if (e) {
          n({
              width: e.offsetWidth,
              height: e.offsetHeight
          });
          const r = new ResizeObserver(i => {
              if (!Array.isArray(i) || !i.length)
                  return;
              const o = i[0];
              let s, a;
              if ("borderBoxSize"in o) {
                  const l = o.borderBoxSize
                    , c = Array.isArray(l) ? l[0] : l;
                  s = c.inlineSize,
                  a = c.blockSize
              } else
                  s = e.offsetWidth,
                  a = e.offsetHeight;
              n({
                  width: s,
                  height: a
              })
          }
          );
          return r.observe(e, {
              box: "border-box"
          }),
          () => r.unobserve(e)
      } else
          n(void 0)
  }
  , [e]),
  t
}
var fx = "Popper"
, [hx,px] = hr(fx)
, [CI,mx] = hx(fx)
, gx = "PopperAnchor"
, yx = x.forwardRef( (e, t) => {
  const {__scopePopper: n, virtualRef: r, ...i} = e
    , o = mx(gx, n)
    , s = x.useRef(null)
    , a = be(t, s);
  return x.useEffect( () => {
      o.onAnchorChange((r == null ? void 0 : r.current) || s.current)
  }
  ),
  r ? null : h.jsx(oe.div, {
      ...i,
      ref: a
  })
}
);
yx.displayName = gx;
var Mf = "PopperContent"
, [KT,qT] = hx(Mf)
, vx = x.forwardRef( (e, t) => {
  var te, Wr, kn, mr, En, Hr;
  const {__scopePopper: n, side: r="bottom", sideOffset: i=0, align: o="center", alignOffset: s=0, arrowPadding: a=0, avoidCollisions: l=!0, collisionBoundary: c=[], collisionPadding: u=0, sticky: d="partial", hideWhenDetached: f=!1, updatePositionStrategy: p="optimized", onPlaced: b, ...y} = e
    , w = mx(Mf, n)
    , [m,g] = x.useState(null)
    , v = be(t, Pn => g(Pn))
    , [S,C] = x.useState(null)
    , k = jf(S)
    , E = (k == null ? void 0 : k.width) ?? 0
    , P = (k == null ? void 0 : k.height) ?? 0
    , j = r + (o !== "center" ? "-" + o : "")
    , R = typeof u == "number" ? u : {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      ...u
  }
    , z = Array.isArray(c) ? c : [c]
    , L = z.length > 0
    , W = {
      padding: R,
      boundary: z.filter(QT),
      altBoundary: L
  }
    , {refs: I, floatingStyles: K, placement: $, isPositioned: V, middlewareData: T} = LT({
      strategy: "fixed",
      placement: j,
      whileElementsMounted: (...Pn) => ET(...Pn, {
          animationFrame: p === "always"
      }),
      elements: {
          reference: w.anchor
      },
      middleware: [zT({
          mainAxis: i + P,
          alignmentAxis: s
      }), l && _T({
          mainAxis: !0,
          crossAxis: !1,
          limiter: d === "partial" ? VT() : void 0,
          ...W
      }), l && FT({
          ...W
      }), BT({
          ...W,
          apply: ({elements: Pn, rects: Ss, availableWidth: Fl, availableHeight: Cs}) => {
              const {width: Bl, height: eo} = Ss.reference
                , Kr = Pn.floating.style;
              Kr.setProperty("--radix-popper-available-width", `${Fl}px`),
              Kr.setProperty("--radix-popper-available-height", `${Cs}px`),
              Kr.setProperty("--radix-popper-anchor-width", `${Bl}px`),
              Kr.setProperty("--radix-popper-anchor-height", `${eo}px`)
          }
      }), S && UT({
          element: S,
          padding: a
      }), YT({
          arrowWidth: E,
          arrowHeight: P
      }), f && $T({
          strategy: "referenceHidden",
          ...W
      })]
  })
    , [N,O] = bx($)
    , H = or(b);
  nn( () => {
      V && (H == null || H())
  }
  , [V, H]);
  const U = (te = T.arrow) == null ? void 0 : te.x
    , Y = (Wr = T.arrow) == null ? void 0 : Wr.y
    , X = ((kn = T.arrow) == null ? void 0 : kn.centerOffset) !== 0
    , [Se,Ie] = x.useState();
  return nn( () => {
      m && Ie(window.getComputedStyle(m).zIndex)
  }
  , [m]),
  h.jsx("div", {
      ref: I.setFloating,
      "data-radix-popper-content-wrapper": "",
      style: {
          ...K,
          transform: V ? K.transform : "translate(0, -200%)",
          minWidth: "max-content",
          zIndex: Se,
          "--radix-popper-transform-origin": [(mr = T.transformOrigin) == null ? void 0 : mr.x, (En = T.transformOrigin) == null ? void 0 : En.y].join(" "),
          ...((Hr = T.hide) == null ? void 0 : Hr.referenceHidden) && {
              visibility: "hidden",
              pointerEvents: "none"
          }
      },
      dir: e.dir,
      children: h.jsx(KT, {
          scope: n,
          placedSide: N,
          onArrowChange: C,
          arrowX: U,
          arrowY: Y,
          shouldHideArrow: X,
          children: h.jsx(oe.div, {
              "data-side": N,
              "data-align": O,
              ...y,
              ref: v,
              style: {
                  ...y.style,
                  animation: V ? void 0 : "none"
              }
          })
      })
  })
}
);
vx.displayName = Mf;
var xx = "PopperArrow"
, GT = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right"
}
, wx = x.forwardRef(function(t, n) {
  const {__scopePopper: r, ...i} = t
    , o = qT(xx, r)
    , s = GT[o.placedSide];
  return h.jsx("span", {
      ref: o.onArrowChange,
      style: {
          position: "absolute",
          left: o.arrowX,
          top: o.arrowY,
          [s]: 0,
          transformOrigin: {
              top: "",
              right: "0 0",
              bottom: "center 0",
              left: "100% 0"
          }[o.placedSide],
          transform: {
              top: "translateY(100%)",
              right: "translateY(50%) rotate(90deg) translateX(-50%)",
              bottom: "rotate(180deg)",
              left: "translateY(50%) rotate(-90deg) translateX(50%)"
          }[o.placedSide],
          visibility: o.shouldHideArrow ? "hidden" : void 0
      },
      children: h.jsx(HT, {
          ...i,
          ref: n,
          style: {
              ...i.style,
              display: "block"
          }
      })
  })
});
wx.displayName = xx;
function QT(e) {
  return e !== null
}
var YT = e => ({
  name: "transformOrigin",
  options: e,
  fn(t) {
      var w, m, g;
      const {placement: n, rects: r, middlewareData: i} = t
        , s = ((w = i.arrow) == null ? void 0 : w.centerOffset) !== 0
        , a = s ? 0 : e.arrowWidth
        , l = s ? 0 : e.arrowHeight
        , [c,u] = bx(n)
        , d = {
          start: "0%",
          center: "50%",
          end: "100%"
      }[u]
        , f = (((m = i.arrow) == null ? void 0 : m.x) ?? 0) + a / 2
        , p = (((g = i.arrow) == null ? void 0 : g.y) ?? 0) + l / 2;
      let b = ""
        , y = "";
      return c === "bottom" ? (b = s ? d : `${f}px`,
      y = `${-l}px`) : c === "top" ? (b = s ? d : `${f}px`,
      y = `${r.floating.height + l}px`) : c === "right" ? (b = `${-l}px`,
      y = s ? d : `${p}px`) : c === "left" && (b = `${r.floating.width + l}px`,
      y = s ? d : `${p}px`),
      {
          data: {
              x: b,
              y
          }
      }
  }
});
function bx(e) {
  const [t,n="center"] = e.split("-");
  return [t, n]
}
var ZT = yx
, XT = vx
, JT = wx
, [Cl,kI] = hr("Tooltip", [px])
, Df = px()
, Sx = "TooltipProvider"
, e2 = 700
, am = "tooltip.open"
, [t2,Cx] = Cl(Sx)
, kx = e => {
  const {__scopeTooltip: t, delayDuration: n=e2, skipDelayDuration: r=300, disableHoverableContent: i=!1, children: o} = e
    , s = x.useRef(!0)
    , a = x.useRef(!1)
    , l = x.useRef(0);
  return x.useEffect( () => {
      const c = l.current;
      return () => window.clearTimeout(c)
  }
  , []),
  h.jsx(t2, {
      scope: t,
      isOpenDelayedRef: s,
      delayDuration: n,
      onOpen: x.useCallback( () => {
          window.clearTimeout(l.current),
          s.current = !1
      }
      , []),
      onClose: x.useCallback( () => {
          window.clearTimeout(l.current),
          l.current = window.setTimeout( () => s.current = !0, r)
      }
      , [r]),
      isPointerInTransitRef: a,
      onPointerInTransitChange: x.useCallback(c => {
          a.current = c
      }
      , []),
      disableHoverableContent: i,
      children: o
  })
}
;
kx.displayName = Sx;
var Ex = "Tooltip"
, [EI,kl] = Cl(Ex)
, $u = "TooltipTrigger"
, n2 = x.forwardRef( (e, t) => {
  const {__scopeTooltip: n, ...r} = e
    , i = kl($u, n)
    , o = Cx($u, n)
    , s = Df(n)
    , a = x.useRef(null)
    , l = be(t, a, i.onTriggerChange)
    , c = x.useRef(!1)
    , u = x.useRef(!1)
    , d = x.useCallback( () => c.current = !1, []);
  return x.useEffect( () => () => document.removeEventListener("pointerup", d), [d]),
  h.jsx(ZT, {
      asChild: !0,
      ...s,
      children: h.jsx(oe.button, {
          "aria-describedby": i.open ? i.contentId : void 0,
          "data-state": i.stateAttribute,
          ...r,
          ref: l,
          onPointerMove: ne(e.onPointerMove, f => {
              f.pointerType !== "touch" && !u.current && !o.isPointerInTransitRef.current && (i.onTriggerEnter(),
              u.current = !0)
          }
          ),
          onPointerLeave: ne(e.onPointerLeave, () => {
              i.onTriggerLeave(),
              u.current = !1
          }
          ),
          onPointerDown: ne(e.onPointerDown, () => {
              i.open && i.onClose(),
              c.current = !0,
              document.addEventListener("pointerup", d, {
                  once: !0
              })
          }
          ),
          onFocus: ne(e.onFocus, () => {
              c.current || i.onOpen()
          }
          ),
          onBlur: ne(e.onBlur, i.onClose),
          onClick: ne(e.onClick, i.onClose)
      })
  })
}
);
n2.displayName = $u;
var r2 = "TooltipPortal"
, [PI,i2] = Cl(r2, {
  forceMount: void 0
})
, Fi = "TooltipContent"
, Px = x.forwardRef( (e, t) => {
  const n = i2(Fi, e.__scopeTooltip)
    , {forceMount: r=n.forceMount, side: i="top", ...o} = e
    , s = kl(Fi, e.__scopeTooltip);
  return h.jsx(ps, {
      present: r || s.open,
      children: s.disableHoverableContent ? h.jsx(Tx, {
          side: i,
          ...o,
          ref: t
      }) : h.jsx(o2, {
          side: i,
          ...o,
          ref: t
      })
  })
}
)
, o2 = x.forwardRef( (e, t) => {
  const n = kl(Fi, e.__scopeTooltip)
    , r = Cx(Fi, e.__scopeTooltip)
    , i = x.useRef(null)
    , o = be(t, i)
    , [s,a] = x.useState(null)
    , {trigger: l, onClose: c} = n
    , u = i.current
    , {onPointerInTransitChange: d} = r
    , f = x.useCallback( () => {
      a(null),
      d(!1)
  }
  , [d])
    , p = x.useCallback( (b, y) => {
      const w = b.currentTarget
        , m = {
          x: b.clientX,
          y: b.clientY
      }
        , g = u2(m, w.getBoundingClientRect())
        , v = d2(m, g)
        , S = f2(y.getBoundingClientRect())
        , C = p2([...v, ...S]);
      a(C),
      d(!0)
  }
  , [d]);
  return x.useEffect( () => () => f(), [f]),
  x.useEffect( () => {
      if (l && u) {
          const b = w => p(w, u)
            , y = w => p(w, l);
          return l.addEventListener("pointerleave", b),
          u.addEventListener("pointerleave", y),
          () => {
              l.removeEventListener("pointerleave", b),
              u.removeEventListener("pointerleave", y)
          }
      }
  }
  , [l, u, p, f]),
  x.useEffect( () => {
      if (s) {
          const b = y => {
              const w = y.target
                , m = {
                  x: y.clientX,
                  y: y.clientY
              }
                , g = (l == null ? void 0 : l.contains(w)) || (u == null ? void 0 : u.contains(w))
                , v = !h2(m, s);
              g ? f() : v && (f(),
              c())
          }
          ;
          return document.addEventListener("pointermove", b),
          () => document.removeEventListener("pointermove", b)
      }
  }
  , [l, u, s, c, f]),
  h.jsx(Tx, {
      ...e,
      ref: o
  })
}
)
, [s2,a2] = Cl(Ex, {
  isInside: !1
})
, l2 = gk("TooltipContent")
, Tx = x.forwardRef( (e, t) => {
  const {__scopeTooltip: n, children: r, "aria-label": i, onEscapeKeyDown: o, onPointerDownOutside: s, ...a} = e
    , l = kl(Fi, n)
    , c = Df(n)
    , {onClose: u} = l;
  return x.useEffect( () => (document.addEventListener(am, u),
  () => document.removeEventListener(am, u)), [u]),
  x.useEffect( () => {
      if (l.trigger) {
          const d = f => {
              const p = f.target;
              p != null && p.contains(l.trigger) && u()
          }
          ;
          return window.addEventListener("scroll", d, {
              capture: !0
          }),
          () => window.removeEventListener("scroll", d, {
              capture: !0
          })
      }
  }
  , [l.trigger, u]),
  h.jsx(vf, {
      asChild: !0,
      disableOutsidePointerEvents: !1,
      onEscapeKeyDown: o,
      onPointerDownOutside: s,
      onFocusOutside: d => d.preventDefault(),
      onDismiss: u,
      children: h.jsxs(XT, {
          "data-state": l.stateAttribute,
          ...c,
          ...a,
          ref: t,
          style: {
              ...a.style,
              "--radix-tooltip-content-transform-origin": "var(--radix-popper-transform-origin)",
              "--radix-tooltip-content-available-width": "var(--radix-popper-available-width)",
              "--radix-tooltip-content-available-height": "var(--radix-popper-available-height)",
              "--radix-tooltip-trigger-width": "var(--radix-popper-anchor-width)",
              "--radix-tooltip-trigger-height": "var(--radix-popper-anchor-height)"
          },
          children: [h.jsx(l2, {
              children: r
          }), h.jsx(s2, {
              scope: n,
              isInside: !0,
              children: h.jsx(Vk, {
                  id: l.contentId,
                  role: "tooltip",
                  children: i || r
              })
          })]
      })
  })
}
);
Px.displayName = Fi;
var Ax = "TooltipArrow"
, c2 = x.forwardRef( (e, t) => {
  const {__scopeTooltip: n, ...r} = e
    , i = Df(n);
  return a2(Ax, n).isInside ? null : h.jsx(JT, {
      ...i,
      ...r,
      ref: t
  })
}
);
c2.displayName = Ax;
function u2(e, t) {
  const n = Math.abs(t.top - e.y)
    , r = Math.abs(t.bottom - e.y)
    , i = Math.abs(t.right - e.x)
    , o = Math.abs(t.left - e.x);
  switch (Math.min(n, r, i, o)) {
  case o:
      return "left";
  case i:
      return "right";
  case n:
      return "top";
  case r:
      return "bottom";
  default:
      throw new Error("unreachable")
  }
}
function d2(e, t, n=5) {
  const r = [];
  switch (t) {
  case "top":
      r.push({
          x: e.x - n,
          y: e.y + n
      }, {
          x: e.x + n,
          y: e.y + n
      });
      break;
  case "bottom":
      r.push({
          x: e.x - n,
          y: e.y - n
      }, {
          x: e.x + n,
          y: e.y - n
      });
      break;
  case "left":
      r.push({
          x: e.x + n,
          y: e.y - n
      }, {
          x: e.x + n,
          y: e.y + n
      });
      break;
  case "right":
      r.push({
          x: e.x - n,
          y: e.y - n
      }, {
          x: e.x - n,
          y: e.y + n
      });
      break
  }
  return r
}
function f2(e) {
  const {top: t, right: n, bottom: r, left: i} = e;
  return [{
      x: i,
      y: t
  }, {
      x: n,
      y: t
  }, {
      x: n,
      y: r
  }, {
      x: i,
      y: r
  }]
}
function h2(e, t) {
  const {x: n, y: r} = e;
  let i = !1;
  for (let o = 0, s = t.length - 1; o < t.length; s = o++) {
      const a = t[o]
        , l = t[s]
        , c = a.x
        , u = a.y
        , d = l.x
        , f = l.y;
      u > r != f > r && n < (d - c) * (r - u) / (f - u) + c && (i = !i)
  }
  return i
}
function p2(e) {
  const t = e.slice();
  return t.sort( (n, r) => n.x < r.x ? -1 : n.x > r.x ? 1 : n.y < r.y ? -1 : n.y > r.y ? 1 : 0),
  m2(t)
}
function m2(e) {
  if (e.length <= 1)
      return e.slice();
  const t = [];
  for (let r = 0; r < e.length; r++) {
      const i = e[r];
      for (; t.length >= 2; ) {
          const o = t[t.length - 1]
            , s = t[t.length - 2];
          if ((o.x - s.x) * (i.y - s.y) >= (o.y - s.y) * (i.x - s.x))
              t.pop();
          else
              break
      }
      t.push(i)
  }
  t.pop();
  const n = [];
  for (let r = e.length - 1; r >= 0; r--) {
      const i = e[r];
      for (; n.length >= 2; ) {
          const o = n[n.length - 1]
            , s = n[n.length - 2];
          if ((o.x - s.x) * (i.y - s.y) >= (o.y - s.y) * (i.x - s.x))
              n.pop();
          else
              break
      }
      n.push(i)
  }
  return n.pop(),
  t.length === 1 && n.length === 1 && t[0].x === n[0].x && t[0].y === n[0].y ? t : t.concat(n)
}
var g2 = kx
, Nx = Px;
const y2 = g2
, v2 = x.forwardRef( ({className: e, sideOffset: t=4, ...n}, r) => h.jsx(Nx, {
  ref: r,
  sideOffset: t,
  className: ut("z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", e),
  ...n
}));
v2.displayName = Nx.displayName;
var El = class {
  constructor() {
      this.listeners = new Set,
      this.subscribe = this.subscribe.bind(this)
  }
  subscribe(e) {
      return this.listeners.add(e),
      this.onSubscribe(),
      () => {
          this.listeners.delete(e),
          this.onUnsubscribe()
      }
  }
  hasListeners() {
      return this.listeners.size > 0
  }
  onSubscribe() {}
  onUnsubscribe() {}
}
, Pl = typeof window > "u" || "Deno"in globalThis;
function Mt() {}
function x2(e, t) {
  return typeof e == "function" ? e(t) : e
}
function w2(e) {
  return typeof e == "number" && e >= 0 && e !== 1 / 0
}
function b2(e, t) {
  return Math.max(e + (t || 0) - Date.now(), 0)
}
function Uu(e, t) {
  return typeof e == "function" ? e(t) : e
}
function S2(e, t) {
  return typeof e == "function" ? e(t) : e
}
function lm(e, t) {
  const {type: n="all", exact: r, fetchStatus: i, predicate: o, queryKey: s, stale: a} = e;
  if (s) {
      if (r) {
          if (t.queryHash !== If(s, t.options))
              return !1
      } else if (!es(t.queryKey, s))
          return !1
  }
  if (n !== "all") {
      const l = t.isActive();
      if (n === "active" && !l || n === "inactive" && l)
          return !1
  }
  return !(typeof a == "boolean" && t.isStale() !== a || i && i !== t.state.fetchStatus || o && !o(t))
}
function cm(e, t) {
  const {exact: n, status: r, predicate: i, mutationKey: o} = e;
  if (o) {
      if (!t.options.mutationKey)
          return !1;
      if (n) {
          if (Jo(t.options.mutationKey) !== Jo(o))
              return !1
      } else if (!es(t.options.mutationKey, o))
          return !1
  }
  return !(r && t.state.status !== r || i && !i(t))
}
function If(e, t) {
  return ((t == null ? void 0 : t.queryKeyHashFn) || Jo)(e)
}
function Jo(e) {
  return JSON.stringify(e, (t, n) => Wu(n) ? Object.keys(n).sort().reduce( (r, i) => (r[i] = n[i],
  r), {}) : n)
}
function es(e, t) {
  return e === t ? !0 : typeof e != typeof t ? !1 : e && t && typeof e == "object" && typeof t == "object" ? Object.keys(t).every(n => es(e[n], t[n])) : !1
}
function Rx(e, t) {
  if (e === t)
      return e;
  const n = um(e) && um(t);
  if (n || Wu(e) && Wu(t)) {
      const r = n ? e : Object.keys(e)
        , i = r.length
        , o = n ? t : Object.keys(t)
        , s = o.length
        , a = n ? [] : {}
        , l = new Set(r);
      let c = 0;
      for (let u = 0; u < s; u++) {
          const d = n ? u : o[u];
          (!n && l.has(d) || n) && e[d] === void 0 && t[d] === void 0 ? (a[d] = void 0,
          c++) : (a[d] = Rx(e[d], t[d]),
          a[d] === e[d] && e[d] !== void 0 && c++)
      }
      return i === s && c === i ? e : a
  }
  return t
}
function um(e) {
  return Array.isArray(e) && e.length === Object.keys(e).length
}
function Wu(e) {
  if (!dm(e))
      return !1;
  const t = e.constructor;
  if (t === void 0)
      return !0;
  const n = t.prototype;
  return !(!dm(n) || !n.hasOwnProperty("isPrototypeOf") || Object.getPrototypeOf(e) !== Object.prototype)
}
function dm(e) {
  return Object.prototype.toString.call(e) === "[object Object]"
}
function C2(e) {
  return new Promise(t => {
      setTimeout(t, e)
  }
  )
}
function k2(e, t, n) {
  return typeof n.structuralSharing == "function" ? n.structuralSharing(e, t) : n.structuralSharing !== !1 ? Rx(e, t) : t
}
function E2(e, t, n=0) {
  const r = [...e, t];
  return n && r.length > n ? r.slice(1) : r
}
function P2(e, t, n=0) {
  const r = [t, ...e];
  return n && r.length > n ? r.slice(0, -1) : r
}
var Lf = Symbol();
function jx(e, t) {
  return !e.queryFn && (t != null && t.initialPromise) ? () => t.initialPromise : !e.queryFn || e.queryFn === Lf ? () => Promise.reject(new Error(`Missing queryFn: '${e.queryHash}'`)) : e.queryFn
}
var Tr, Vn, Ci, $g, T2 = ($g = class extends El {
  constructor() {
      super();
      ee(this, Tr);
      ee(this, Vn);
      ee(this, Ci);
      G(this, Ci, t => {
          if (!Pl && window.addEventListener) {
              const n = () => t();
              return window.addEventListener("visibilitychange", n, !1),
              () => {
                  window.removeEventListener("visibilitychange", n)
              }
          }
      }
      )
  }
  onSubscribe() {
      A(this, Vn) || this.setEventListener(A(this, Ci))
  }
  onUnsubscribe() {
      var t;
      this.hasListeners() || ((t = A(this, Vn)) == null || t.call(this),
      G(this, Vn, void 0))
  }
  setEventListener(t) {
      var n;
      G(this, Ci, t),
      (n = A(this, Vn)) == null || n.call(this),
      G(this, Vn, t(r => {
          typeof r == "boolean" ? this.setFocused(r) : this.onFocus()
      }
      ))
  }
  setFocused(t) {
      A(this, Tr) !== t && (G(this, Tr, t),
      this.onFocus())
  }
  onFocus() {
      const t = this.isFocused();
      this.listeners.forEach(n => {
          n(t)
      }
      )
  }
  isFocused() {
      var t;
      return typeof A(this, Tr) == "boolean" ? A(this, Tr) : ((t = globalThis.document) == null ? void 0 : t.visibilityState) !== "hidden"
  }
}
,
Tr = new WeakMap,
Vn = new WeakMap,
Ci = new WeakMap,
$g), Mx = new T2, ki, Fn, Ei, Ug, A2 = (Ug = class extends El {
  constructor() {
      super();
      ee(this, ki, !0);
      ee(this, Fn);
      ee(this, Ei);
      G(this, Ei, t => {
          if (!Pl && window.addEventListener) {
              const n = () => t(!0)
                , r = () => t(!1);
              return window.addEventListener("online", n, !1),
              window.addEventListener("offline", r, !1),
              () => {
                  window.removeEventListener("online", n),
                  window.removeEventListener("offline", r)
              }
          }
      }
      )
  }
  onSubscribe() {
      A(this, Fn) || this.setEventListener(A(this, Ei))
  }
  onUnsubscribe() {
      var t;
      this.hasListeners() || ((t = A(this, Fn)) == null || t.call(this),
      G(this, Fn, void 0))
  }
  setEventListener(t) {
      var n;
      G(this, Ei, t),
      (n = A(this, Fn)) == null || n.call(this),
      G(this, Fn, t(this.setOnline.bind(this)))
  }
  setOnline(t) {
      A(this, ki) !== t && (G(this, ki, t),
      this.listeners.forEach(r => {
          r(t)
      }
      ))
  }
  isOnline() {
      return A(this, ki)
  }
}
,
ki = new WeakMap,
Fn = new WeakMap,
Ei = new WeakMap,
Ug), Ha = new A2;
function N2() {
  let e, t;
  const n = new Promise( (i, o) => {
      e = i,
      t = o
  }
  );
  n.status = "pending",
  n.catch( () => {}
  );
  function r(i) {
      Object.assign(n, i),
      delete n.resolve,
      delete n.reject
  }
  return n.resolve = i => {
      r({
          status: "fulfilled",
          value: i
      }),
      e(i)
  }
  ,
  n.reject = i => {
      r({
          status: "rejected",
          reason: i
      }),
      t(i)
  }
  ,
  n
}
function R2(e) {
  return Math.min(1e3 * 2 ** e, 3e4)
}
function Dx(e) {
  return (e ?? "online") === "online" ? Ha.isOnline() : !0
}
var Ix = class extends Error {
  constructor(e) {
      super("CancelledError"),
      this.revert = e == null ? void 0 : e.revert,
      this.silent = e == null ? void 0 : e.silent
  }
}
;
function Cc(e) {
  return e instanceof Ix
}
function Lx(e) {
  let t = !1, n = 0, r = !1, i;
  const o = N2()
    , s = y => {
      var w;
      r || (f(new Ix(y)),
      (w = e.abort) == null || w.call(e))
  }
    , a = () => {
      t = !0
  }
    , l = () => {
      t = !1
  }
    , c = () => Mx.isFocused() && (e.networkMode === "always" || Ha.isOnline()) && e.canRun()
    , u = () => Dx(e.networkMode) && e.canRun()
    , d = y => {
      var w;
      r || (r = !0,
      (w = e.onSuccess) == null || w.call(e, y),
      i == null || i(),
      o.resolve(y))
  }
    , f = y => {
      var w;
      r || (r = !0,
      (w = e.onError) == null || w.call(e, y),
      i == null || i(),
      o.reject(y))
  }
    , p = () => new Promise(y => {
      var w;
      i = m => {
          (r || c()) && y(m)
      }
      ,
      (w = e.onPause) == null || w.call(e)
  }
  ).then( () => {
      var y;
      i = void 0,
      r || (y = e.onContinue) == null || y.call(e)
  }
  )
    , b = () => {
      if (r)
          return;
      let y;
      const w = n === 0 ? e.initialPromise : void 0;
      try {
          y = w ?? e.fn()
      } catch (m) {
          y = Promise.reject(m)
      }
      Promise.resolve(y).then(d).catch(m => {
          var k;
          if (r)
              return;
          const g = e.retry ?? (Pl ? 0 : 3)
            , v = e.retryDelay ?? R2
            , S = typeof v == "function" ? v(n, m) : v
            , C = g === !0 || typeof g == "number" && n < g || typeof g == "function" && g(n, m);
          if (t || !C) {
              f(m);
              return
          }
          n++,
          (k = e.onFail) == null || k.call(e, n, m),
          C2(S).then( () => c() ? void 0 : p()).then( () => {
              t ? f(m) : b()
          }
          )
      }
      )
  }
  ;
  return {
      promise: o,
      cancel: s,
      continue: () => (i == null || i(),
      o),
      cancelRetry: a,
      continueRetry: l,
      canStart: u,
      start: () => (u() ? b() : p().then(b),
      o)
  }
}
var j2 = e => setTimeout(e, 0);
function M2() {
  let e = []
    , t = 0
    , n = a => {
      a()
  }
    , r = a => {
      a()
  }
    , i = j2;
  const o = a => {
      t ? e.push(a) : i( () => {
          n(a)
      }
      )
  }
    , s = () => {
      const a = e;
      e = [],
      a.length && i( () => {
          r( () => {
              a.forEach(l => {
                  n(l)
              }
              )
          }
          )
      }
      )
  }
  ;
  return {
      batch: a => {
          let l;
          t++;
          try {
              l = a()
          } finally {
              t--,
              t || s()
          }
          return l
      }
      ,
      batchCalls: a => (...l) => {
          o( () => {
              a(...l)
          }
          )
      }
      ,
      schedule: o,
      setNotifyFunction: a => {
          n = a
      }
      ,
      setBatchNotifyFunction: a => {
          r = a
      }
      ,
      setScheduler: a => {
          i = a
      }
  }
}
var He = M2(), Ar, Wg, Ox = (Wg = class {
  constructor() {
      ee(this, Ar)
  }
  destroy() {
      this.clearGcTimeout()
  }
  scheduleGc() {
      this.clearGcTimeout(),
      w2(this.gcTime) && G(this, Ar, setTimeout( () => {
          this.optionalRemove()
      }
      , this.gcTime))
  }
  updateGcTime(e) {
      this.gcTime = Math.max(this.gcTime || 0, e ?? (Pl ? 1 / 0 : 5 * 60 * 1e3))
  }
  clearGcTimeout() {
      A(this, Ar) && (clearTimeout(A(this, Ar)),
      G(this, Ar, void 0))
  }
}
,
Ar = new WeakMap,
Wg), Pi, Nr, mt, Rr, _e, ss, jr, Dt, ln, Hg, D2 = (Hg = class extends Ox {
  constructor(t) {
      super();
      ee(this, Dt);
      ee(this, Pi);
      ee(this, Nr);
      ee(this, mt);
      ee(this, Rr);
      ee(this, _e);
      ee(this, ss);
      ee(this, jr);
      G(this, jr, !1),
      G(this, ss, t.defaultOptions),
      this.setOptions(t.options),
      this.observers = [],
      G(this, Rr, t.client),
      G(this, mt, A(this, Rr).getQueryCache()),
      this.queryKey = t.queryKey,
      this.queryHash = t.queryHash,
      G(this, Pi, L2(this.options)),
      this.state = t.state ?? A(this, Pi),
      this.scheduleGc()
  }
  get meta() {
      return this.options.meta
  }
  get promise() {
      var t;
      return (t = A(this, _e)) == null ? void 0 : t.promise
  }
  setOptions(t) {
      this.options = {
          ...A(this, ss),
          ...t
      },
      this.updateGcTime(this.options.gcTime)
  }
  optionalRemove() {
      !this.observers.length && this.state.fetchStatus === "idle" && A(this, mt).remove(this)
  }
  setData(t, n) {
      const r = k2(this.state.data, t, this.options);
      return Le(this, Dt, ln).call(this, {
          data: r,
          type: "success",
          dataUpdatedAt: n == null ? void 0 : n.updatedAt,
          manual: n == null ? void 0 : n.manual
      }),
      r
  }
  setState(t, n) {
      Le(this, Dt, ln).call(this, {
          type: "setState",
          state: t,
          setStateOptions: n
      })
  }
  cancel(t) {
      var r, i;
      const n = (r = A(this, _e)) == null ? void 0 : r.promise;
      return (i = A(this, _e)) == null || i.cancel(t),
      n ? n.then(Mt).catch(Mt) : Promise.resolve()
  }
  destroy() {
      super.destroy(),
      this.cancel({
          silent: !0
      })
  }
  reset() {
      this.destroy(),
      this.setState(A(this, Pi))
  }
  isActive() {
      return this.observers.some(t => S2(t.options.enabled, this) !== !1)
  }
  isDisabled() {
      return this.getObserversCount() > 0 ? !this.isActive() : this.options.queryFn === Lf || this.state.dataUpdateCount + this.state.errorUpdateCount === 0
  }
  isStatic() {
      return this.getObserversCount() > 0 ? this.observers.some(t => Uu(t.options.staleTime, this) === "static") : !1
  }
  isStale() {
      return this.getObserversCount() > 0 ? this.observers.some(t => t.getCurrentResult().isStale) : this.state.data === void 0 || this.state.isInvalidated
  }
  isStaleByTime(t=0) {
      return this.state.data === void 0 ? !0 : t === "static" ? !1 : this.state.isInvalidated ? !0 : !b2(this.state.dataUpdatedAt, t)
  }
  onFocus() {
      var n;
      const t = this.observers.find(r => r.shouldFetchOnWindowFocus());
      t == null || t.refetch({
          cancelRefetch: !1
      }),
      (n = A(this, _e)) == null || n.continue()
  }
  onOnline() {
      var n;
      const t = this.observers.find(r => r.shouldFetchOnReconnect());
      t == null || t.refetch({
          cancelRefetch: !1
      }),
      (n = A(this, _e)) == null || n.continue()
  }
  addObserver(t) {
      this.observers.includes(t) || (this.observers.push(t),
      this.clearGcTimeout(),
      A(this, mt).notify({
          type: "observerAdded",
          query: this,
          observer: t
      }))
  }
  removeObserver(t) {
      this.observers.includes(t) && (this.observers = this.observers.filter(n => n !== t),
      this.observers.length || (A(this, _e) && (A(this, jr) ? A(this, _e).cancel({
          revert: !0
      }) : A(this, _e).cancelRetry()),
      this.scheduleGc()),
      A(this, mt).notify({
          type: "observerRemoved",
          query: this,
          observer: t
      }))
  }
  getObserversCount() {
      return this.observers.length
  }
  invalidate() {
      this.state.isInvalidated || Le(this, Dt, ln).call(this, {
          type: "invalidate"
      })
  }
  fetch(t, n) {
      var c, u, d;
      if (this.state.fetchStatus !== "idle") {
          if (this.state.data !== void 0 && (n != null && n.cancelRefetch))
              this.cancel({
                  silent: !0
              });
          else if (A(this, _e))
              return A(this, _e).continueRetry(),
              A(this, _e).promise
      }
      if (t && this.setOptions(t),
      !this.options.queryFn) {
          const f = this.observers.find(p => p.options.queryFn);
          f && this.setOptions(f.options)
      }
      const r = new AbortController
        , i = f => {
          Object.defineProperty(f, "signal", {
              enumerable: !0,
              get: () => (G(this, jr, !0),
              r.signal)
          })
      }
        , o = () => {
          const f = jx(this.options, n)
            , b = ( () => {
              const y = {
                  client: A(this, Rr),
                  queryKey: this.queryKey,
                  meta: this.meta
              };
              return i(y),
              y
          }
          )();
          return G(this, jr, !1),
          this.options.persister ? this.options.persister(f, b, this) : f(b)
      }
        , a = ( () => {
          const f = {
              fetchOptions: n,
              options: this.options,
              queryKey: this.queryKey,
              client: A(this, Rr),
              state: this.state,
              fetchFn: o
          };
          return i(f),
          f
      }
      )();
      (c = this.options.behavior) == null || c.onFetch(a, this),
      G(this, Nr, this.state),
      (this.state.fetchStatus === "idle" || this.state.fetchMeta !== ((u = a.fetchOptions) == null ? void 0 : u.meta)) && Le(this, Dt, ln).call(this, {
          type: "fetch",
          meta: (d = a.fetchOptions) == null ? void 0 : d.meta
      });
      const l = f => {
          var p, b, y, w;
          Cc(f) && f.silent || Le(this, Dt, ln).call(this, {
              type: "error",
              error: f
          }),
          Cc(f) || ((b = (p = A(this, mt).config).onError) == null || b.call(p, f, this),
          (w = (y = A(this, mt).config).onSettled) == null || w.call(y, this.state.data, f, this)),
          this.scheduleGc()
      }
      ;
      return G(this, _e, Lx({
          initialPromise: n == null ? void 0 : n.initialPromise,
          fn: a.fetchFn,
          abort: r.abort.bind(r),
          onSuccess: f => {
              var p, b, y, w;
              if (f === void 0) {
                  l(new Error(`${this.queryHash} data is undefined`));
                  return
              }
              try {
                  this.setData(f)
              } catch (m) {
                  l(m);
                  return
              }
              (b = (p = A(this, mt).config).onSuccess) == null || b.call(p, f, this),
              (w = (y = A(this, mt).config).onSettled) == null || w.call(y, f, this.state.error, this),
              this.scheduleGc()
          }
          ,
          onError: l,
          onFail: (f, p) => {
              Le(this, Dt, ln).call(this, {
                  type: "failed",
                  failureCount: f,
                  error: p
              })
          }
          ,
          onPause: () => {
              Le(this, Dt, ln).call(this, {
                  type: "pause"
              })
          }
          ,
          onContinue: () => {
              Le(this, Dt, ln).call(this, {
                  type: "continue"
              })
          }
          ,
          retry: a.options.retry,
          retryDelay: a.options.retryDelay,
          networkMode: a.options.networkMode,
          canRun: () => !0
      })),
      A(this, _e).start()
  }
}
,
Pi = new WeakMap,
Nr = new WeakMap,
mt = new WeakMap,
Rr = new WeakMap,
_e = new WeakMap,
ss = new WeakMap,
jr = new WeakMap,
Dt = new WeakSet,
ln = function(t) {
  const n = r => {
      switch (t.type) {
      case "failed":
          return {
              ...r,
              fetchFailureCount: t.failureCount,
              fetchFailureReason: t.error
          };
      case "pause":
          return {
              ...r,
              fetchStatus: "paused"
          };
      case "continue":
          return {
              ...r,
              fetchStatus: "fetching"
          };
      case "fetch":
          return {
              ...r,
              ...I2(r.data, this.options),
              fetchMeta: t.meta ?? null
          };
      case "success":
          return G(this, Nr, void 0),
          {
              ...r,
              data: t.data,
              dataUpdateCount: r.dataUpdateCount + 1,
              dataUpdatedAt: t.dataUpdatedAt ?? Date.now(),
              error: null,
              isInvalidated: !1,
              status: "success",
              ...!t.manual && {
                  fetchStatus: "idle",
                  fetchFailureCount: 0,
                  fetchFailureReason: null
              }
          };
      case "error":
          const i = t.error;
          return Cc(i) && i.revert && A(this, Nr) ? {
              ...A(this, Nr),
              fetchStatus: "idle"
          } : {
              ...r,
              error: i,
              errorUpdateCount: r.errorUpdateCount + 1,
              errorUpdatedAt: Date.now(),
              fetchFailureCount: r.fetchFailureCount + 1,
              fetchFailureReason: i,
              fetchStatus: "idle",
              status: "error"
          };
      case "invalidate":
          return {
              ...r,
              isInvalidated: !0
          };
      case "setState":
          return {
              ...r,
              ...t.state
          }
      }
  }
  ;
  this.state = n(this.state),
  He.batch( () => {
      this.observers.forEach(r => {
          r.onQueryUpdate()
      }
      ),
      A(this, mt).notify({
          query: this,
          type: "updated",
          action: t
      })
  }
  )
}
,
Hg);
function I2(e, t) {
  return {
      fetchFailureCount: 0,
      fetchFailureReason: null,
      fetchStatus: Dx(t.networkMode) ? "fetching" : "paused",
      ...e === void 0 && {
          error: null,
          status: "pending"
      }
  }
}
function L2(e) {
  const t = typeof e.initialData == "function" ? e.initialData() : e.initialData
    , n = t !== void 0
    , r = n ? typeof e.initialDataUpdatedAt == "function" ? e.initialDataUpdatedAt() : e.initialDataUpdatedAt : 0;
  return {
      data: t,
      dataUpdateCount: 0,
      dataUpdatedAt: n ? r ?? Date.now() : 0,
      error: null,
      errorUpdateCount: 0,
      errorUpdatedAt: 0,
      fetchFailureCount: 0,
      fetchFailureReason: null,
      fetchMeta: null,
      isInvalidated: !1,
      status: n ? "success" : "pending",
      fetchStatus: "idle"
  }
}
var Kt, Kg, O2 = (Kg = class extends El {
  constructor(t={}) {
      super();
      ee(this, Kt);
      this.config = t,
      G(this, Kt, new Map)
  }
  build(t, n, r) {
      const i = n.queryKey
        , o = n.queryHash ?? If(i, n);
      let s = this.get(o);
      return s || (s = new D2({
          client: t,
          queryKey: i,
          queryHash: o,
          options: t.defaultQueryOptions(n),
          state: r,
          defaultOptions: t.getQueryDefaults(i)
      }),
      this.add(s)),
      s
  }
  add(t) {
      A(this, Kt).has(t.queryHash) || (A(this, Kt).set(t.queryHash, t),
      this.notify({
          type: "added",
          query: t
      }))
  }
  remove(t) {
      const n = A(this, Kt).get(t.queryHash);
      n && (t.destroy(),
      n === t && A(this, Kt).delete(t.queryHash),
      this.notify({
          type: "removed",
          query: t
      }))
  }
  clear() {
      He.batch( () => {
          this.getAll().forEach(t => {
              this.remove(t)
          }
          )
      }
      )
  }
  get(t) {
      return A(this, Kt).get(t)
  }
  getAll() {
      return [...A(this, Kt).values()]
  }
  find(t) {
      const n = {
          exact: !0,
          ...t
      };
      return this.getAll().find(r => lm(n, r))
  }
  findAll(t={}) {
      const n = this.getAll();
      return Object.keys(t).length > 0 ? n.filter(r => lm(t, r)) : n
  }
  notify(t) {
      He.batch( () => {
          this.listeners.forEach(n => {
              n(t)
          }
          )
      }
      )
  }
  onFocus() {
      He.batch( () => {
          this.getAll().forEach(t => {
              t.onFocus()
          }
          )
      }
      )
  }
  onOnline() {
      He.batch( () => {
          this.getAll().forEach(t => {
              t.onOnline()
          }
          )
      }
      )
  }
}
,
Kt = new WeakMap,
Kg), qt, Ue, Mr, Gt, Dn, qg, z2 = (qg = class extends Ox {
  constructor(t) {
      super();
      ee(this, Gt);
      ee(this, qt);
      ee(this, Ue);
      ee(this, Mr);
      this.mutationId = t.mutationId,
      G(this, Ue, t.mutationCache),
      G(this, qt, []),
      this.state = t.state || _2(),
      this.setOptions(t.options),
      this.scheduleGc()
  }
  setOptions(t) {
      this.options = t,
      this.updateGcTime(this.options.gcTime)
  }
  get meta() {
      return this.options.meta
  }
  addObserver(t) {
      A(this, qt).includes(t) || (A(this, qt).push(t),
      this.clearGcTimeout(),
      A(this, Ue).notify({
          type: "observerAdded",
          mutation: this,
          observer: t
      }))
  }
  removeObserver(t) {
      G(this, qt, A(this, qt).filter(n => n !== t)),
      this.scheduleGc(),
      A(this, Ue).notify({
          type: "observerRemoved",
          mutation: this,
          observer: t
      })
  }
  optionalRemove() {
      A(this, qt).length || (this.state.status === "pending" ? this.scheduleGc() : A(this, Ue).remove(this))
  }
  continue() {
      var t;
      return ((t = A(this, Mr)) == null ? void 0 : t.continue()) ?? this.execute(this.state.variables)
  }
  async execute(t) {
      var o, s, a, l, c, u, d, f, p, b, y, w, m, g, v, S, C, k, E, P;
      const n = () => {
          Le(this, Gt, Dn).call(this, {
              type: "continue"
          })
      }
      ;
      G(this, Mr, Lx({
          fn: () => this.options.mutationFn ? this.options.mutationFn(t) : Promise.reject(new Error("No mutationFn found")),
          onFail: (j, R) => {
              Le(this, Gt, Dn).call(this, {
                  type: "failed",
                  failureCount: j,
                  error: R
              })
          }
          ,
          onPause: () => {
              Le(this, Gt, Dn).call(this, {
                  type: "pause"
              })
          }
          ,
          onContinue: n,
          retry: this.options.retry ?? 0,
          retryDelay: this.options.retryDelay,
          networkMode: this.options.networkMode,
          canRun: () => A(this, Ue).canRun(this)
      }));
      const r = this.state.status === "pending"
        , i = !A(this, Mr).canStart();
      try {
          if (r)
              n();
          else {
              Le(this, Gt, Dn).call(this, {
                  type: "pending",
                  variables: t,
                  isPaused: i
              }),
              await ((s = (o = A(this, Ue).config).onMutate) == null ? void 0 : s.call(o, t, this));
              const R = await ((l = (a = this.options).onMutate) == null ? void 0 : l.call(a, t));
              R !== this.state.context && Le(this, Gt, Dn).call(this, {
                  type: "pending",
                  context: R,
                  variables: t,
                  isPaused: i
              })
          }
          const j = await A(this, Mr).start();
          return await ((u = (c = A(this, Ue).config).onSuccess) == null ? void 0 : u.call(c, j, t, this.state.context, this)),
          await ((f = (d = this.options).onSuccess) == null ? void 0 : f.call(d, j, t, this.state.context)),
          await ((b = (p = A(this, Ue).config).onSettled) == null ? void 0 : b.call(p, j, null, this.state.variables, this.state.context, this)),
          await ((w = (y = this.options).onSettled) == null ? void 0 : w.call(y, j, null, t, this.state.context)),
          Le(this, Gt, Dn).call(this, {
              type: "success",
              data: j
          }),
          j
      } catch (j) {
          try {
              throw await ((g = (m = A(this, Ue).config).onError) == null ? void 0 : g.call(m, j, t, this.state.context, this)),
              await ((S = (v = this.options).onError) == null ? void 0 : S.call(v, j, t, this.state.context)),
              await ((k = (C = A(this, Ue).config).onSettled) == null ? void 0 : k.call(C, void 0, j, this.state.variables, this.state.context, this)),
              await ((P = (E = this.options).onSettled) == null ? void 0 : P.call(E, void 0, j, t, this.state.context)),
              j
          } finally {
              Le(this, Gt, Dn).call(this, {
                  type: "error",
                  error: j
              })
          }
      } finally {
          A(this, Ue).runNext(this)
      }
  }
}
,
qt = new WeakMap,
Ue = new WeakMap,
Mr = new WeakMap,
Gt = new WeakSet,
Dn = function(t) {
  const n = r => {
      switch (t.type) {
      case "failed":
          return {
              ...r,
              failureCount: t.failureCount,
              failureReason: t.error
          };
      case "pause":
          return {
              ...r,
              isPaused: !0
          };
      case "continue":
          return {
              ...r,
              isPaused: !1
          };
      case "pending":
          return {
              ...r,
              context: t.context,
              data: void 0,
              failureCount: 0,
              failureReason: null,
              error: null,
              isPaused: t.isPaused,
              status: "pending",
              variables: t.variables,
              submittedAt: Date.now()
          };
      case "success":
          return {
              ...r,
              data: t.data,
              failureCount: 0,
              failureReason: null,
              error: null,
              status: "success",
              isPaused: !1
          };
      case "error":
          return {
              ...r,
              data: void 0,
              error: t.error,
              failureCount: r.failureCount + 1,
              failureReason: t.error,
              isPaused: !1,
              status: "error"
          }
      }
  }
  ;
  this.state = n(this.state),
  He.batch( () => {
      A(this, qt).forEach(r => {
          r.onMutationUpdate(t)
      }
      ),
      A(this, Ue).notify({
          mutation: this,
          type: "updated",
          action: t
      })
  }
  )
}
,
qg);
function _2() {
  return {
      context: void 0,
      data: void 0,
      error: null,
      failureCount: 0,
      failureReason: null,
      isPaused: !1,
      status: "idle",
      variables: void 0,
      submittedAt: 0
  }
}
var dn, It, as, Gg, V2 = (Gg = class extends El {
  constructor(t={}) {
      super();
      ee(this, dn);
      ee(this, It);
      ee(this, as);
      this.config = t,
      G(this, dn, new Set),
      G(this, It, new Map),
      G(this, as, 0)
  }
  build(t, n, r) {
      const i = new z2({
          mutationCache: this,
          mutationId: ++Es(this, as)._,
          options: t.defaultMutationOptions(n),
          state: r
      });
      return this.add(i),
      i
  }
  add(t) {
      A(this, dn).add(t);
      const n = qs(t);
      if (typeof n == "string") {
          const r = A(this, It).get(n);
          r ? r.push(t) : A(this, It).set(n, [t])
      }
      this.notify({
          type: "added",
          mutation: t
      })
  }
  remove(t) {
      if (A(this, dn).delete(t)) {
          const n = qs(t);
          if (typeof n == "string") {
              const r = A(this, It).get(n);
              if (r)
                  if (r.length > 1) {
                      const i = r.indexOf(t);
                      i !== -1 && r.splice(i, 1)
                  } else
                      r[0] === t && A(this, It).delete(n)
          }
      }
      this.notify({
          type: "removed",
          mutation: t
      })
  }
  canRun(t) {
      const n = qs(t);
      if (typeof n == "string") {
          const r = A(this, It).get(n)
            , i = r == null ? void 0 : r.find(o => o.state.status === "pending");
          return !i || i === t
      } else
          return !0
  }
  runNext(t) {
      var r;
      const n = qs(t);
      if (typeof n == "string") {
          const i = (r = A(this, It).get(n)) == null ? void 0 : r.find(o => o !== t && o.state.isPaused);
          return (i == null ? void 0 : i.continue()) ?? Promise.resolve()
      } else
          return Promise.resolve()
  }
  clear() {
      He.batch( () => {
          A(this, dn).forEach(t => {
              this.notify({
                  type: "removed",
                  mutation: t
              })
          }
          ),
          A(this, dn).clear(),
          A(this, It).clear()
      }
      )
  }
  getAll() {
      return Array.from(A(this, dn))
  }
  find(t) {
      const n = {
          exact: !0,
          ...t
      };
      return this.getAll().find(r => cm(n, r))
  }
  findAll(t={}) {
      return this.getAll().filter(n => cm(t, n))
  }
  notify(t) {
      He.batch( () => {
          this.listeners.forEach(n => {
              n(t)
          }
          )
      }
      )
  }
  resumePausedMutations() {
      const t = this.getAll().filter(n => n.state.isPaused);
      return He.batch( () => Promise.all(t.map(n => n.continue().catch(Mt))))
  }
}
,
dn = new WeakMap,
It = new WeakMap,
as = new WeakMap,
Gg);
function qs(e) {
  var t;
  return (t = e.options.scope) == null ? void 0 : t.id
}
function fm(e) {
  return {
      onFetch: (t, n) => {
          var u, d, f, p, b;
          const r = t.options
            , i = (f = (d = (u = t.fetchOptions) == null ? void 0 : u.meta) == null ? void 0 : d.fetchMore) == null ? void 0 : f.direction
            , o = ((p = t.state.data) == null ? void 0 : p.pages) || []
            , s = ((b = t.state.data) == null ? void 0 : b.pageParams) || [];
          let a = {
              pages: [],
              pageParams: []
          }
            , l = 0;
          const c = async () => {
              let y = !1;
              const w = v => {
                  Object.defineProperty(v, "signal", {
                      enumerable: !0,
                      get: () => (t.signal.aborted ? y = !0 : t.signal.addEventListener("abort", () => {
                          y = !0
                      }
                      ),
                      t.signal)
                  })
              }
                , m = jx(t.options, t.fetchOptions)
                , g = async (v, S, C) => {
                  if (y)
                      return Promise.reject();
                  if (S == null && v.pages.length)
                      return Promise.resolve(v);
                  const E = ( () => {
                      const z = {
                          client: t.client,
                          queryKey: t.queryKey,
                          pageParam: S,
                          direction: C ? "backward" : "forward",
                          meta: t.options.meta
                      };
                      return w(z),
                      z
                  }
                  )()
                    , P = await m(E)
                    , {maxPages: j} = t.options
                    , R = C ? P2 : E2;
                  return {
                      pages: R(v.pages, P, j),
                      pageParams: R(v.pageParams, S, j)
                  }
              }
              ;
              if (i && o.length) {
                  const v = i === "backward"
                    , S = v ? F2 : hm
                    , C = {
                      pages: o,
                      pageParams: s
                  }
                    , k = S(r, C);
                  a = await g(C, k, v)
              } else {
                  const v = e ?? o.length;
                  do {
                      const S = l === 0 ? s[0] ?? r.initialPageParam : hm(r, a);
                      if (l > 0 && S == null)
                          break;
                      a = await g(a, S),
                      l++
                  } while (l < v)
              }
              return a
          }
          ;
          t.options.persister ? t.fetchFn = () => {
              var y, w;
              return (w = (y = t.options).persister) == null ? void 0 : w.call(y, c, {
                  client: t.client,
                  queryKey: t.queryKey,
                  meta: t.options.meta,
                  signal: t.signal
              }, n)
          }
          : t.fetchFn = c
      }
  }
}
function hm(e, {pages: t, pageParams: n}) {
  const r = t.length - 1;
  return t.length > 0 ? e.getNextPageParam(t[r], t, n[r], n) : void 0
}
function F2(e, {pages: t, pageParams: n}) {
  var r;
  return t.length > 0 ? (r = e.getPreviousPageParam) == null ? void 0 : r.call(e, t[0], t, n[0], n) : void 0
}
var ve, Bn, $n, Ti, Ai, Un, Ni, Ri, Qg, B2 = (Qg = class {
  constructor(e={}) {
      ee(this, ve);
      ee(this, Bn);
      ee(this, $n);
      ee(this, Ti);
      ee(this, Ai);
      ee(this, Un);
      ee(this, Ni);
      ee(this, Ri);
      G(this, ve, e.queryCache || new O2),
      G(this, Bn, e.mutationCache || new V2),
      G(this, $n, e.defaultOptions || {}),
      G(this, Ti, new Map),
      G(this, Ai, new Map),
      G(this, Un, 0)
  }
  mount() {
      Es(this, Un)._++,
      A(this, Un) === 1 && (G(this, Ni, Mx.subscribe(async e => {
          e && (await this.resumePausedMutations(),
          A(this, ve).onFocus())
      }
      )),
      G(this, Ri, Ha.subscribe(async e => {
          e && (await this.resumePausedMutations(),
          A(this, ve).onOnline())
      }
      )))
  }
  unmount() {
      var e, t;
      Es(this, Un)._--,
      A(this, Un) === 0 && ((e = A(this, Ni)) == null || e.call(this),
      G(this, Ni, void 0),
      (t = A(this, Ri)) == null || t.call(this),
      G(this, Ri, void 0))
  }
  isFetching(e) {
      return A(this, ve).findAll({
          ...e,
          fetchStatus: "fetching"
      }).length
  }
  isMutating(e) {
      return A(this, Bn).findAll({
          ...e,
          status: "pending"
      }).length
  }
  getQueryData(e) {
      var n;
      const t = this.defaultQueryOptions({
          queryKey: e
      });
      return (n = A(this, ve).get(t.queryHash)) == null ? void 0 : n.state.data
  }
  ensureQueryData(e) {
      const t = this.defaultQueryOptions(e)
        , n = A(this, ve).build(this, t)
        , r = n.state.data;
      return r === void 0 ? this.fetchQuery(e) : (e.revalidateIfStale && n.isStaleByTime(Uu(t.staleTime, n)) && this.prefetchQuery(t),
      Promise.resolve(r))
  }
  getQueriesData(e) {
      return A(this, ve).findAll(e).map( ({queryKey: t, state: n}) => {
          const r = n.data;
          return [t, r]
      }
      )
  }
  setQueryData(e, t, n) {
      const r = this.defaultQueryOptions({
          queryKey: e
      })
        , i = A(this, ve).get(r.queryHash)
        , o = i == null ? void 0 : i.state.data
        , s = x2(t, o);
      if (s !== void 0)
          return A(this, ve).build(this, r).setData(s, {
              ...n,
              manual: !0
          })
  }
  setQueriesData(e, t, n) {
      return He.batch( () => A(this, ve).findAll(e).map( ({queryKey: r}) => [r, this.setQueryData(r, t, n)]))
  }
  getQueryState(e) {
      var n;
      const t = this.defaultQueryOptions({
          queryKey: e
      });
      return (n = A(this, ve).get(t.queryHash)) == null ? void 0 : n.state
  }
  removeQueries(e) {
      const t = A(this, ve);
      He.batch( () => {
          t.findAll(e).forEach(n => {
              t.remove(n)
          }
          )
      }
      )
  }
  resetQueries(e, t) {
      const n = A(this, ve);
      return He.batch( () => (n.findAll(e).forEach(r => {
          r.reset()
      }
      ),
      this.refetchQueries({
          type: "active",
          ...e
      }, t)))
  }
  cancelQueries(e, t={}) {
      const n = {
          revert: !0,
          ...t
      }
        , r = He.batch( () => A(this, ve).findAll(e).map(i => i.cancel(n)));
      return Promise.all(r).then(Mt).catch(Mt)
  }
  invalidateQueries(e, t={}) {
      return He.batch( () => (A(this, ve).findAll(e).forEach(n => {
          n.invalidate()
      }
      ),
      (e == null ? void 0 : e.refetchType) === "none" ? Promise.resolve() : this.refetchQueries({
          ...e,
          type: (e == null ? void 0 : e.refetchType) ?? (e == null ? void 0 : e.type) ?? "active"
      }, t)))
  }
  refetchQueries(e, t={}) {
      const n = {
          ...t,
          cancelRefetch: t.cancelRefetch ?? !0
      }
        , r = He.batch( () => A(this, ve).findAll(e).filter(i => !i.isDisabled() && !i.isStatic()).map(i => {
          let o = i.fetch(void 0, n);
          return n.throwOnError || (o = o.catch(Mt)),
          i.state.fetchStatus === "paused" ? Promise.resolve() : o
      }
      ));
      return Promise.all(r).then(Mt)
  }
  fetchQuery(e) {
      const t = this.defaultQueryOptions(e);
      t.retry === void 0 && (t.retry = !1);
      const n = A(this, ve).build(this, t);
      return n.isStaleByTime(Uu(t.staleTime, n)) ? n.fetch(t) : Promise.resolve(n.state.data)
  }
  prefetchQuery(e) {
      return this.fetchQuery(e).then(Mt).catch(Mt)
  }
  fetchInfiniteQuery(e) {
      return e.behavior = fm(e.pages),
      this.fetchQuery(e)
  }
  prefetchInfiniteQuery(e) {
      return this.fetchInfiniteQuery(e).then(Mt).catch(Mt)
  }
  ensureInfiniteQueryData(e) {
      return e.behavior = fm(e.pages),
      this.ensureQueryData(e)
  }
  resumePausedMutations() {
      return Ha.isOnline() ? A(this, Bn).resumePausedMutations() : Promise.resolve()
  }
  getQueryCache() {
      return A(this, ve)
  }
  getMutationCache() {
      return A(this, Bn)
  }
  getDefaultOptions() {
      return A(this, $n)
  }
  setDefaultOptions(e) {
      G(this, $n, e)
  }
  setQueryDefaults(e, t) {
      A(this, Ti).set(Jo(e), {
          queryKey: e,
          defaultOptions: t
      })
  }
  getQueryDefaults(e) {
      const t = [...A(this, Ti).values()]
        , n = {};
      return t.forEach(r => {
          es(e, r.queryKey) && Object.assign(n, r.defaultOptions)
      }
      ),
      n
  }
  setMutationDefaults(e, t) {
      A(this, Ai).set(Jo(e), {
          mutationKey: e,
          defaultOptions: t
      })
  }
  getMutationDefaults(e) {
      const t = [...A(this, Ai).values()]
        , n = {};
      return t.forEach(r => {
          es(e, r.mutationKey) && Object.assign(n, r.defaultOptions)
      }
      ),
      n
  }
  defaultQueryOptions(e) {
      if (e._defaulted)
          return e;
      const t = {
          ...A(this, $n).queries,
          ...this.getQueryDefaults(e.queryKey),
          ...e,
          _defaulted: !0
      };
      return t.queryHash || (t.queryHash = If(t.queryKey, t)),
      t.refetchOnReconnect === void 0 && (t.refetchOnReconnect = t.networkMode !== "always"),
      t.throwOnError === void 0 && (t.throwOnError = !!t.suspense),
      !t.networkMode && t.persister && (t.networkMode = "offlineFirst"),
      t.queryFn === Lf && (t.enabled = !1),
      t
  }
  defaultMutationOptions(e) {
      return e != null && e._defaulted ? e : {
          ...A(this, $n).mutations,
          ...(e == null ? void 0 : e.mutationKey) && this.getMutationDefaults(e.mutationKey),
          ...e,
          _defaulted: !0
      }
  }
  clear() {
      A(this, ve).clear(),
      A(this, Bn).clear()
  }
}
,
ve = new WeakMap,
Bn = new WeakMap,
$n = new WeakMap,
Ti = new WeakMap,
Ai = new WeakMap,
Un = new WeakMap,
Ni = new WeakMap,
Ri = new WeakMap,
Qg), $2 = x.createContext(void 0), U2 = ({client: e, children: t}) => (x.useEffect( () => (e.mount(),
() => {
  e.unmount()
}
), [e]),
h.jsx($2.Provider, {
  value: e,
  children: t
}));
/**
* @remix-run/router v1.23.0
*
* Copyright (c) Remix Software Inc.
*
* This source code is licensed under the MIT license found in the
* LICENSE.md file in the root directory of this source tree.
*
* @license MIT
*/
function Ka() {
  return Ka = Object.assign ? Object.assign.bind() : function(e) {
      for (var t = 1; t < arguments.length; t++) {
          var n = arguments[t];
          for (var r in n)
              Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
      }
      return e
  }
  ,
  Ka.apply(this, arguments)
}
var Kn;
(function(e) {
  e.Pop = "POP",
  e.Push = "PUSH",
  e.Replace = "REPLACE"
}
)(Kn || (Kn = {}));
const pm = "popstate";
function W2(e) {
  e === void 0 && (e = {});
  function t(r, i) {
      let {pathname: o, search: s, hash: a} = r.location;
      return Hu("", {
          pathname: o,
          search: s,
          hash: a
      }, i.state && i.state.usr || null, i.state && i.state.key || "default")
  }
  function n(r, i) {
      return typeof i == "string" ? i : _x(i)
  }
  return K2(t, n, null, e)
}
function rt(e, t) {
  if (e === !1 || e === null || typeof e > "u")
      throw new Error(t)
}
function zx(e, t) {
  if (!e) {
      typeof console < "u" && console.warn(t);
      try {
          throw new Error(t)
      } catch {}
  }
}
function H2() {
  return Math.random().toString(36).substr(2, 8)
}
function mm(e, t) {
  return {
      usr: e.state,
      key: e.key,
      idx: t
  }
}
function Hu(e, t, n, r) {
  return n === void 0 && (n = null),
  Ka({
      pathname: typeof e == "string" ? e : e.pathname,
      search: "",
      hash: ""
  }, typeof t == "string" ? Tl(t) : t, {
      state: n,
      key: t && t.key || r || H2()
  })
}
function _x(e) {
  let {pathname: t="/", search: n="", hash: r=""} = e;
  return n && n !== "?" && (t += n.charAt(0) === "?" ? n : "?" + n),
  r && r !== "#" && (t += r.charAt(0) === "#" ? r : "#" + r),
  t
}
function Tl(e) {
  let t = {};
  if (e) {
      let n = e.indexOf("#");
      n >= 0 && (t.hash = e.substr(n),
      e = e.substr(0, n));
      let r = e.indexOf("?");
      r >= 0 && (t.search = e.substr(r),
      e = e.substr(0, r)),
      e && (t.pathname = e)
  }
  return t
}
function K2(e, t, n, r) {
  r === void 0 && (r = {});
  let {window: i=document.defaultView, v5Compat: o=!1} = r
    , s = i.history
    , a = Kn.Pop
    , l = null
    , c = u();
  c == null && (c = 0,
  s.replaceState(Ka({}, s.state, {
      idx: c
  }), ""));
  function u() {
      return (s.state || {
          idx: null
      }).idx
  }
  function d() {
      a = Kn.Pop;
      let w = u()
        , m = w == null ? null : w - c;
      c = w,
      l && l({
          action: a,
          location: y.location,
          delta: m
      })
  }
  function f(w, m) {
      a = Kn.Push;
      let g = Hu(y.location, w, m);
      c = u() + 1;
      let v = mm(g, c)
        , S = y.createHref(g);
      try {
          s.pushState(v, "", S)
      } catch (C) {
          if (C instanceof DOMException && C.name === "DataCloneError")
              throw C;
          i.location.assign(S)
      }
      o && l && l({
          action: a,
          location: y.location,
          delta: 1
      })
  }
  function p(w, m) {
      a = Kn.Replace;
      let g = Hu(y.location, w, m);
      c = u();
      let v = mm(g, c)
        , S = y.createHref(g);
      s.replaceState(v, "", S),
      o && l && l({
          action: a,
          location: y.location,
          delta: 0
      })
  }
  function b(w) {
      let m = i.location.origin !== "null" ? i.location.origin : i.location.href
        , g = typeof w == "string" ? w : _x(w);
      return g = g.replace(/ $/, "%20"),
      rt(m, "No window.location.(origin|href) available to create URL for href: " + g),
      new URL(g,m)
  }
  let y = {
      get action() {
          return a
      },
      get location() {
          return e(i, s)
      },
      listen(w) {
          if (l)
              throw new Error("A history only accepts one active listener");
          return i.addEventListener(pm, d),
          l = w,
          () => {
              i.removeEventListener(pm, d),
              l = null
          }
      },
      createHref(w) {
          return t(i, w)
      },
      createURL: b,
      encodeLocation(w) {
          let m = b(w);
          return {
              pathname: m.pathname,
              search: m.search,
              hash: m.hash
          }
      },
      push: f,
      replace: p,
      go(w) {
          return s.go(w)
      }
  };
  return y
}
var gm;
(function(e) {
  e.data = "data",
  e.deferred = "deferred",
  e.redirect = "redirect",
  e.error = "error"
}
)(gm || (gm = {}));
function q2(e, t, n) {
  return n === void 0 && (n = "/"),
  G2(e, t, n, !1)
}
function G2(e, t, n, r) {
  let i = typeof t == "string" ? Tl(t) : t
    , o = Bx(i.pathname || "/", n);
  if (o == null)
      return null;
  let s = Vx(e);
  Q2(s);
  let a = null;
  for (let l = 0; a == null && l < s.length; ++l) {
      let c = sA(o);
      a = iA(s[l], c, r)
  }
  return a
}
function Vx(e, t, n, r) {
  t === void 0 && (t = []),
  n === void 0 && (n = []),
  r === void 0 && (r = "");
  let i = (o, s, a) => {
      let l = {
          relativePath: a === void 0 ? o.path || "" : a,
          caseSensitive: o.caseSensitive === !0,
          childrenIndex: s,
          route: o
      };
      l.relativePath.startsWith("/") && (rt(l.relativePath.startsWith(r), 'Absolute route path "' + l.relativePath + '" nested under path ' + ('"' + r + '" is not valid. An absolute child route path ') + "must start with the combined path of all its parent routes."),
      l.relativePath = l.relativePath.slice(r.length));
      let c = bi([r, l.relativePath])
        , u = n.concat(l);
      o.children && o.children.length > 0 && (rt(o.index !== !0, "Index routes must not have child routes. Please remove " + ('all child routes from route path "' + c + '".')),
      Vx(o.children, t, u, c)),
      !(o.path == null && !o.index) && t.push({
          path: c,
          score: nA(c, o.index),
          routesMeta: u
      })
  }
  ;
  return e.forEach( (o, s) => {
      var a;
      if (o.path === "" || !((a = o.path) != null && a.includes("?")))
          i(o, s);
      else
          for (let l of Fx(o.path))
              i(o, s, l)
  }
  ),
  t
}
function Fx(e) {
  let t = e.split("/");
  if (t.length === 0)
      return [];
  let[n,...r] = t
    , i = n.endsWith("?")
    , o = n.replace(/\?$/, "");
  if (r.length === 0)
      return i ? [o, ""] : [o];
  let s = Fx(r.join("/"))
    , a = [];
  return a.push(...s.map(l => l === "" ? o : [o, l].join("/"))),
  i && a.push(...s),
  a.map(l => e.startsWith("/") && l === "" ? "/" : l)
}
function Q2(e) {
  e.sort( (t, n) => t.score !== n.score ? n.score - t.score : rA(t.routesMeta.map(r => r.childrenIndex), n.routesMeta.map(r => r.childrenIndex)))
}
const Y2 = /^:[\w-]+$/
, Z2 = 3
, X2 = 2
, J2 = 1
, eA = 10
, tA = -2
, ym = e => e === "*";
function nA(e, t) {
  let n = e.split("/")
    , r = n.length;
  return n.some(ym) && (r += tA),
  t && (r += X2),
  n.filter(i => !ym(i)).reduce( (i, o) => i + (Y2.test(o) ? Z2 : o === "" ? J2 : eA), r)
}
function rA(e, t) {
  return e.length === t.length && e.slice(0, -1).every( (r, i) => r === t[i]) ? e[e.length - 1] - t[t.length - 1] : 0
}
function iA(e, t, n) {
  let {routesMeta: r} = e
    , i = {}
    , o = "/"
    , s = [];
  for (let a = 0; a < r.length; ++a) {
      let l = r[a]
        , c = a === r.length - 1
        , u = o === "/" ? t : t.slice(o.length) || "/"
        , d = vm({
          path: l.relativePath,
          caseSensitive: l.caseSensitive,
          end: c
      }, u)
        , f = l.route;
      if (!d && c && n && !r[r.length - 1].route.index && (d = vm({
          path: l.relativePath,
          caseSensitive: l.caseSensitive,
          end: !1
      }, u)),
      !d)
          return null;
      Object.assign(i, d.params),
      s.push({
          params: i,
          pathname: bi([o, d.pathname]),
          pathnameBase: aA(bi([o, d.pathnameBase])),
          route: f
      }),
      d.pathnameBase !== "/" && (o = bi([o, d.pathnameBase]))
  }
  return s
}
function vm(e, t) {
  typeof e == "string" && (e = {
      path: e,
      caseSensitive: !1,
      end: !0
  });
  let[n,r] = oA(e.path, e.caseSensitive, e.end)
    , i = t.match(n);
  if (!i)
      return null;
  let o = i[0]
    , s = o.replace(/(.)\/+$/, "$1")
    , a = i.slice(1);
  return {
      params: r.reduce( (c, u, d) => {
          let {paramName: f, isOptional: p} = u;
          if (f === "*") {
              let y = a[d] || "";
              s = o.slice(0, o.length - y.length).replace(/(.)\/+$/, "$1")
          }
          const b = a[d];
          return p && !b ? c[f] = void 0 : c[f] = (b || "").replace(/%2F/g, "/"),
          c
      }
      , {}),
      pathname: o,
      pathnameBase: s,
      pattern: e
  }
}
function oA(e, t, n) {
  t === void 0 && (t = !1),
  n === void 0 && (n = !0),
  zx(e === "*" || !e.endsWith("*") || e.endsWith("/*"), 'Route path "' + e + '" will be treated as if it were ' + ('"' + e.replace(/\*$/, "/*") + '" because the `*` character must ') + "always follow a `/` in the pattern. To get rid of this warning, " + ('please change the route path to "' + e.replace(/\*$/, "/*") + '".'));
  let r = []
    , i = "^" + e.replace(/\/*\*?$/, "").replace(/^\/*/, "/").replace(/[\\.*+^${}|()[\]]/g, "\\$&").replace(/\/:([\w-]+)(\?)?/g, (s, a, l) => (r.push({
      paramName: a,
      isOptional: l != null
  }),
  l ? "/?([^\\/]+)?" : "/([^\\/]+)"));
  return e.endsWith("*") ? (r.push({
      paramName: "*"
  }),
  i += e === "*" || e === "/*" ? "(.*)$" : "(?:\\/(.+)|\\/*)$") : n ? i += "\\/*$" : e !== "" && e !== "/" && (i += "(?:(?=\\/|$))"),
  [new RegExp(i,t ? void 0 : "i"), r]
}
function sA(e) {
  try {
      return e.split("/").map(t => decodeURIComponent(t).replace(/\//g, "%2F")).join("/")
  } catch (t) {
      return zx(!1, 'The URL path "' + e + '" could not be decoded because it is is a malformed URL segment. This is probably due to a bad percent ' + ("encoding (" + t + ").")),
      e
  }
}
function Bx(e, t) {
  if (t === "/")
      return e;
  if (!e.toLowerCase().startsWith(t.toLowerCase()))
      return null;
  let n = t.endsWith("/") ? t.length - 1 : t.length
    , r = e.charAt(n);
  return r && r !== "/" ? null : e.slice(n) || "/"
}
const bi = e => e.join("/").replace(/\/\/+/g, "/")
, aA = e => e.replace(/\/+$/, "").replace(/^\/*/, "/");
function lA(e) {
  return e != null && typeof e.status == "number" && typeof e.statusText == "string" && typeof e.internal == "boolean" && "data"in e
}
const $x = ["post", "put", "patch", "delete"];
new Set($x);
const cA = ["get", ...$x];
new Set(cA);
/**
* React Router v6.30.1
*
* Copyright (c) Remix Software Inc.
*
* This source code is licensed under the MIT license found in the
* LICENSE.md file in the root directory of this source tree.
*
* @license MIT
*/
function qa() {
  return qa = Object.assign ? Object.assign.bind() : function(e) {
      for (var t = 1; t < arguments.length; t++) {
          var n = arguments[t];
          for (var r in n)
              Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
      }
      return e
  }
  ,
  qa.apply(this, arguments)
}
const uA = x.createContext(null)
, dA = x.createContext(null)
, Ux = x.createContext(null)
, Al = x.createContext(null)
, Nl = x.createContext({
  outlet: null,
  matches: [],
  isDataRoute: !1
})
, Wx = x.createContext(null);
function Of() {
  return x.useContext(Al) != null
}
function Hx() {
  return Of() || rt(!1),
  x.useContext(Al).location
}
function fA(e, t) {
  return hA(e, t)
}
function hA(e, t, n, r) {
  Of() || rt(!1);
  let {navigator: i} = x.useContext(Ux)
    , {matches: o} = x.useContext(Nl)
    , s = o[o.length - 1]
    , a = s ? s.params : {};
  s && s.pathname;
  let l = s ? s.pathnameBase : "/";
  s && s.route;
  let c = Hx(), u;
  if (t) {
      var d;
      let w = typeof t == "string" ? Tl(t) : t;
      l === "/" || (d = w.pathname) != null && d.startsWith(l) || rt(!1),
      u = w
  } else
      u = c;
  let f = u.pathname || "/"
    , p = f;
  if (l !== "/") {
      let w = l.replace(/^\//, "").split("/");
      p = "/" + f.replace(/^\//, "").split("/").slice(w.length).join("/")
  }
  let b = q2(e, {
      pathname: p
  })
    , y = vA(b && b.map(w => Object.assign({}, w, {
      params: Object.assign({}, a, w.params),
      pathname: bi([l, i.encodeLocation ? i.encodeLocation(w.pathname).pathname : w.pathname]),
      pathnameBase: w.pathnameBase === "/" ? l : bi([l, i.encodeLocation ? i.encodeLocation(w.pathnameBase).pathname : w.pathnameBase])
  })), o, n, r);
  return t && y ? x.createElement(Al.Provider, {
      value: {
          location: qa({
              pathname: "/",
              search: "",
              hash: "",
              state: null,
              key: "default"
          }, u),
          navigationType: Kn.Pop
      }
  }, y) : y
}
function pA() {
  let e = SA()
    , t = lA(e) ? e.status + " " + e.statusText : e instanceof Error ? e.message : JSON.stringify(e)
    , n = e instanceof Error ? e.stack : null
    , i = {
      padding: "0.5rem",
      backgroundColor: "rgba(200,200,200, 0.5)"
  };
  return x.createElement(x.Fragment, null, x.createElement("h2", null, "Unexpected Application Error!"), x.createElement("h3", {
      style: {
          fontStyle: "italic"
      }
  }, t), n ? x.createElement("pre", {
      style: i
  }, n) : null, null)
}
const mA = x.createElement(pA, null);
class gA extends x.Component {
  constructor(t) {
      super(t),
      this.state = {
          location: t.location,
          revalidation: t.revalidation,
          error: t.error
      }
  }
  static getDerivedStateFromError(t) {
      return {
          error: t
      }
  }
  static getDerivedStateFromProps(t, n) {
      return n.location !== t.location || n.revalidation !== "idle" && t.revalidation === "idle" ? {
          error: t.error,
          location: t.location,
          revalidation: t.revalidation
      } : {
          error: t.error !== void 0 ? t.error : n.error,
          location: n.location,
          revalidation: t.revalidation || n.revalidation
      }
  }
  componentDidCatch(t, n) {
      console.error("React Router caught the following error during render", t, n)
  }
  render() {
      return this.state.error !== void 0 ? x.createElement(Nl.Provider, {
          value: this.props.routeContext
      }, x.createElement(Wx.Provider, {
          value: this.state.error,
          children: this.props.component
      })) : this.props.children
  }
}
function yA(e) {
  let {routeContext: t, match: n, children: r} = e
    , i = x.useContext(uA);
  return i && i.static && i.staticContext && (n.route.errorElement || n.route.ErrorBoundary) && (i.staticContext._deepestRenderedBoundaryId = n.route.id),
  x.createElement(Nl.Provider, {
      value: t
  }, r)
}
function vA(e, t, n, r) {
  var i;
  if (t === void 0 && (t = []),
  n === void 0 && (n = null),
  r === void 0 && (r = null),
  e == null) {
      var o;
      if (!n)
          return null;
      if (n.errors)
          e = n.matches;
      else if ((o = r) != null && o.v7_partialHydration && t.length === 0 && !n.initialized && n.matches.length > 0)
          e = n.matches;
      else
          return null
  }
  let s = e
    , a = (i = n) == null ? void 0 : i.errors;
  if (a != null) {
      let u = s.findIndex(d => d.route.id && (a == null ? void 0 : a[d.route.id]) !== void 0);
      u >= 0 || rt(!1),
      s = s.slice(0, Math.min(s.length, u + 1))
  }
  let l = !1
    , c = -1;
  if (n && r && r.v7_partialHydration)
      for (let u = 0; u < s.length; u++) {
          let d = s[u];
          if ((d.route.HydrateFallback || d.route.hydrateFallbackElement) && (c = u),
          d.route.id) {
              let {loaderData: f, errors: p} = n
                , b = d.route.loader && f[d.route.id] === void 0 && (!p || p[d.route.id] === void 0);
              if (d.route.lazy || b) {
                  l = !0,
                  c >= 0 ? s = s.slice(0, c + 1) : s = [s[0]];
                  break
              }
          }
      }
  return s.reduceRight( (u, d, f) => {
      let p, b = !1, y = null, w = null;
      n && (p = a && d.route.id ? a[d.route.id] : void 0,
      y = d.route.errorElement || mA,
      l && (c < 0 && f === 0 ? (b = !0,
      w = null) : c === f && (b = !0,
      w = d.route.hydrateFallbackElement || null)));
      let m = t.concat(s.slice(0, f + 1))
        , g = () => {
          let v;
          return p ? v = y : b ? v = w : d.route.Component ? v = x.createElement(d.route.Component, null) : d.route.element ? v = d.route.element : v = u,
          x.createElement(yA, {
              match: d,
              routeContext: {
                  outlet: u,
                  matches: m,
                  isDataRoute: n != null
              },
              children: v
          })
      }
      ;
      return n && (d.route.ErrorBoundary || d.route.errorElement || f === 0) ? x.createElement(gA, {
          location: n.location,
          revalidation: n.revalidation,
          component: y,
          error: p,
          children: g(),
          routeContext: {
              outlet: null,
              matches: m,
              isDataRoute: !0
          }
      }) : g()
  }
  , null)
}
var Ku = function(e) {
  return e.UseBlocker = "useBlocker",
  e.UseLoaderData = "useLoaderData",
  e.UseActionData = "useActionData",
  e.UseRouteError = "useRouteError",
  e.UseNavigation = "useNavigation",
  e.UseRouteLoaderData = "useRouteLoaderData",
  e.UseMatches = "useMatches",
  e.UseRevalidator = "useRevalidator",
  e.UseNavigateStable = "useNavigate",
  e.UseRouteId = "useRouteId",
  e
}(Ku || {});
function xA(e) {
  let t = x.useContext(dA);
  return t || rt(!1),
  t
}
function wA(e) {
  let t = x.useContext(Nl);
  return t || rt(!1),
  t
}
function bA(e) {
  let t = wA()
    , n = t.matches[t.matches.length - 1];
  return n.route.id || rt(!1),
  n.route.id
}
function SA() {
  var e;
  let t = x.useContext(Wx)
    , n = xA(Ku.UseRouteError)
    , r = bA(Ku.UseRouteError);
  return t !== void 0 ? t : (e = n.errors) == null ? void 0 : e[r]
}
function CA(e, t) {
  e == null || e.v7_startTransition,
  e == null || e.v7_relativeSplatPath
}
function qu(e) {
  rt(!1)
}
function kA(e) {
  let {basename: t="/", children: n=null, location: r, navigationType: i=Kn.Pop, navigator: o, static: s=!1, future: a} = e;
  Of() && rt(!1);
  let l = t.replace(/^\/*/, "/")
    , c = x.useMemo( () => ({
      basename: l,
      navigator: o,
      static: s,
      future: qa({
          v7_relativeSplatPath: !1
      }, a)
  }), [l, a, o, s]);
  typeof r == "string" && (r = Tl(r));
  let {pathname: u="/", search: d="", hash: f="", state: p=null, key: b="default"} = r
    , y = x.useMemo( () => {
      let w = Bx(u, l);
      return w == null ? null : {
          location: {
              pathname: w,
              search: d,
              hash: f,
              state: p,
              key: b
          },
          navigationType: i
      }
  }
  , [l, u, d, f, p, b, i]);
  return y == null ? null : x.createElement(Ux.Provider, {
      value: c
  }, x.createElement(Al.Provider, {
      children: n,
      value: y
  }))
}
function EA(e) {
  let {children: t, location: n} = e;
  return fA(Gu(t), n)
}
new Promise( () => {}
);
function Gu(e, t) {
  t === void 0 && (t = []);
  let n = [];
  return x.Children.forEach(e, (r, i) => {
      if (!x.isValidElement(r))
          return;
      let o = [...t, i];
      if (r.type === x.Fragment) {
          n.push.apply(n, Gu(r.props.children, o));
          return
      }
      r.type !== qu && rt(!1),
      !r.props.index || !r.props.children || rt(!1);
      let s = {
          id: r.props.id || o.join("-"),
          caseSensitive: r.props.caseSensitive,
          element: r.props.element,
          Component: r.props.Component,
          index: r.props.index,
          path: r.props.path,
          loader: r.props.loader,
          action: r.props.action,
          errorElement: r.props.errorElement,
          ErrorBoundary: r.props.ErrorBoundary,
          hasErrorBoundary: r.props.ErrorBoundary != null || r.props.errorElement != null,
          shouldRevalidate: r.props.shouldRevalidate,
          handle: r.props.handle,
          lazy: r.props.lazy
      };
      r.props.children && (s.children = Gu(r.props.children, o)),
      n.push(s)
  }
  ),
  n
}
/**
* React Router DOM v6.30.1
*
* Copyright (c) Remix Software Inc.
*
* This source code is licensed under the MIT license found in the
* LICENSE.md file in the root directory of this source tree.
*
* @license MIT
*/
const PA = "6";
try {
  window.__reactRouterVersion = PA
} catch {}
const TA = "startTransition"
, xm = Ed[TA];
function AA(e) {
  let {basename: t, children: n, future: r, window: i} = e
    , o = x.useRef();
  o.current == null && (o.current = W2({
      window: i,
      v5Compat: !0
  }));
  let s = o.current
    , [a,l] = x.useState({
      action: s.action,
      location: s.location
  })
    , {v7_startTransition: c} = r || {}
    , u = x.useCallback(d => {
      c && xm ? xm( () => l(d)) : l(d)
  }
  , [l, c]);
  return x.useLayoutEffect( () => s.listen(u), [s, u]),
  x.useEffect( () => CA(r), [r]),
  x.createElement(kA, {
      basename: t,
      children: n,
      location: a.location,
      navigationType: a.action,
      navigator: s,
      future: r
  })
}
var wm;
(function(e) {
  e.UseScrollRestoration = "useScrollRestoration",
  e.UseSubmit = "useSubmit",
  e.UseSubmitFetcher = "useSubmitFetcher",
  e.UseFetcher = "useFetcher",
  e.useViewTransitionState = "useViewTransitionState"
}
)(wm || (wm = {}));
var bm;
(function(e) {
  e.UseFetcher = "useFetcher",
  e.UseFetchers = "useFetchers",
  e.UseScrollRestoration = "useScrollRestoration"
}
)(bm || (bm = {}));
const zf = x.createContext({});
function _f(e) {
  const t = x.useRef(null);
  return t.current === null && (t.current = e()),
  t.current
}
const Kx = typeof window < "u"
, qx = Kx ? x.useLayoutEffect : x.useEffect
, Rl = x.createContext(null);
function Vf(e, t) {
  e.indexOf(t) === -1 && e.push(t)
}
function Ff(e, t) {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1)
}
const on = (e, t, n) => n > t ? t : n < e ? e : n;
let jl = () => {}
, Bi = () => {}
;
const Sn = {}
, Gx = e => /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(e);
function Qx(e) {
  return typeof e == "object" && e !== null
}
const Yx = e => /^0[^.\s]+$/u.test(e);
function Bf(e) {
  let t;
  return () => (t === void 0 && (t = e()),
  t)
}
const bt = e => e
, NA = (e, t) => n => t(e(n))
, ys = (...e) => e.reduce(NA)
, ts = (e, t, n) => {
  const r = t - e;
  return r === 0 ? 1 : (n - e) / r
}
;
class $f {
  constructor() {
      this.subscriptions = []
  }
  add(t) {
      return Vf(this.subscriptions, t),
      () => Ff(this.subscriptions, t)
  }
  notify(t, n, r) {
      const i = this.subscriptions.length;
      if (i)
          if (i === 1)
              this.subscriptions[0](t, n, r);
          else
              for (let o = 0; o < i; o++) {
                  const s = this.subscriptions[o];
                  s && s(t, n, r)
              }
  }
  getSize() {
      return this.subscriptions.length
  }
  clear() {
      this.subscriptions.length = 0
  }
}
const en = e => e * 1e3
, xt = e => e / 1e3;
function Zx(e, t) {
  return t ? e * (1e3 / t) : 0
}
const Xx = (e, t, n) => (((1 - 3 * n + 3 * t) * e + (3 * n - 6 * t)) * e + 3 * t) * e
, RA = 1e-7
, jA = 12;
function MA(e, t, n, r, i) {
  let o, s, a = 0;
  do
      s = t + (n - t) / 2,
      o = Xx(s, r, i) - e,
      o > 0 ? n = s : t = s;
  while (Math.abs(o) > RA && ++a < jA);
  return s
}
function vs(e, t, n, r) {
  if (e === t && n === r)
      return bt;
  const i = o => MA(o, 0, 1, e, n);
  return o => o === 0 || o === 1 ? o : Xx(i(o), t, r)
}
const Jx = e => t => t <= .5 ? e(2 * t) / 2 : (2 - e(2 * (1 - t))) / 2
, ew = e => t => 1 - e(1 - t)
, tw = vs(.33, 1.53, .69, .99)
, Uf = ew(tw)
, nw = Jx(Uf)
, rw = e => (e *= 2) < 1 ? .5 * Uf(e) : .5 * (2 - Math.pow(2, -10 * (e - 1)))
, Wf = e => 1 - Math.sin(Math.acos(e))
, iw = ew(Wf)
, ow = Jx(Wf)
, DA = vs(.42, 0, 1, 1)
, IA = vs(0, 0, .58, 1)
, sw = vs(.42, 0, .58, 1)
, LA = e => Array.isArray(e) && typeof e[0] != "number"
, aw = e => Array.isArray(e) && typeof e[0] == "number"
, Sm = {
  linear: bt,
  easeIn: DA,
  easeInOut: sw,
  easeOut: IA,
  circIn: Wf,
  circInOut: ow,
  circOut: iw,
  backIn: Uf,
  backInOut: nw,
  backOut: tw,
  anticipate: rw
}
, OA = e => typeof e == "string"
, Cm = e => {
  if (aw(e)) {
      Bi(e.length === 4, "Cubic bezier arrays must contain four numerical values.", "cubic-bezier-length");
      const [t,n,r,i] = e;
      return vs(t, n, r, i)
  } else if (OA(e))
      return Bi(Sm[e] !== void 0, `Invalid easing type '${e}'`, "invalid-easing-type"),
      Sm[e];
  return e
}
, Gs = ["setup", "read", "resolveKeyframes", "preUpdate", "update", "preRender", "render", "postRender"]
, km = {
  value: null,
  addProjectionMetrics: null
};
function zA(e, t) {
  let n = new Set
    , r = new Set
    , i = !1
    , o = !1;
  const s = new WeakSet;
  let a = {
      delta: 0,
      timestamp: 0,
      isProcessing: !1
  }
    , l = 0;
  function c(d) {
      s.has(d) && (u.schedule(d),
      e()),
      l++,
      d(a)
  }
  const u = {
      schedule: (d, f=!1, p=!1) => {
          const y = p && i ? n : r;
          return f && s.add(d),
          y.has(d) || y.add(d),
          d
      }
      ,
      cancel: d => {
          r.delete(d),
          s.delete(d)
      }
      ,
      process: d => {
          if (a = d,
          i) {
              o = !0;
              return
          }
          i = !0,
          [n,r] = [r, n],
          n.forEach(c),
          t && km.value && km.value.frameloop[t].push(l),
          l = 0,
          n.clear(),
          i = !1,
          o && (o = !1,
          u.process(d))
      }
  };
  return u
}
const _A = 40;
function lw(e, t) {
  let n = !1
    , r = !0;
  const i = {
      delta: 0,
      timestamp: 0,
      isProcessing: !1
  }
    , o = () => n = !0
    , s = Gs.reduce( (v, S) => (v[S] = zA(o, t ? S : void 0),
  v), {})
    , {setup: a, read: l, resolveKeyframes: c, preUpdate: u, update: d, preRender: f, render: p, postRender: b} = s
    , y = () => {
      const v = Sn.useManualTiming ? i.timestamp : performance.now();
      n = !1,
      Sn.useManualTiming || (i.delta = r ? 1e3 / 60 : Math.max(Math.min(v - i.timestamp, _A), 1)),
      i.timestamp = v,
      i.isProcessing = !0,
      a.process(i),
      l.process(i),
      c.process(i),
      u.process(i),
      d.process(i),
      f.process(i),
      p.process(i),
      b.process(i),
      i.isProcessing = !1,
      n && t && (r = !1,
      e(y))
  }
    , w = () => {
      n = !0,
      r = !0,
      i.isProcessing || e(y)
  }
  ;
  return {
      schedule: Gs.reduce( (v, S) => {
          const C = s[S];
          return v[S] = (k, E=!1, P=!1) => (n || w(),
          C.schedule(k, E, P)),
          v
      }
      , {}),
      cancel: v => {
          for (let S = 0; S < Gs.length; S++)
              s[Gs[S]].cancel(v)
      }
      ,
      state: i,
      steps: s
  }
}
const {schedule: ue, cancel: lr, state: je, steps: kc} = lw(typeof requestAnimationFrame < "u" ? requestAnimationFrame : bt, !0);
let ha;
function VA() {
  ha = void 0
}
const Ke = {
  now: () => (ha === void 0 && Ke.set(je.isProcessing || Sn.useManualTiming ? je.timestamp : performance.now()),
  ha),
  set: e => {
      ha = e,
      queueMicrotask(VA)
  }
}
, cw = e => t => typeof t == "string" && t.startsWith(e)
, uw = cw("--")
, FA = cw("var(--")
, Hf = e => FA(e) ? BA.test(e.split("/*")[0].trim()) : !1
, BA = /var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;
function Em(e) {
  return typeof e != "string" ? !1 : e.split("/*")[0].includes("var(--")
}
const Yi = {
  test: e => typeof e == "number",
  parse: parseFloat,
  transform: e => e
}
, ns = {
  ...Yi,
  transform: e => on(0, 1, e)
}
, Qs = {
  ...Yi,
  default: 1
}
, Ro = e => Math.round(e * 1e5) / 1e5
, Kf = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu;
function $A(e) {
  return e == null
}
const UA = /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu
, qf = (e, t) => n => !!(typeof n == "string" && UA.test(n) && n.startsWith(e) || t && !$A(n) && Object.prototype.hasOwnProperty.call(n, t))
, dw = (e, t, n) => r => {
  if (typeof r != "string")
      return r;
  const [i,o,s,a] = r.match(Kf);
  return {
      [e]: parseFloat(i),
      [t]: parseFloat(o),
      [n]: parseFloat(s),
      alpha: a !== void 0 ? parseFloat(a) : 1
  }
}
, WA = e => on(0, 255, e)
, Ec = {
  ...Yi,
  transform: e => Math.round(WA(e))
}
, Er = {
  test: qf("rgb", "red"),
  parse: dw("red", "green", "blue"),
  transform: ({red: e, green: t, blue: n, alpha: r=1}) => "rgba(" + Ec.transform(e) + ", " + Ec.transform(t) + ", " + Ec.transform(n) + ", " + Ro(ns.transform(r)) + ")"
};
function HA(e) {
  let t = ""
    , n = ""
    , r = ""
    , i = "";
  return e.length > 5 ? (t = e.substring(1, 3),
  n = e.substring(3, 5),
  r = e.substring(5, 7),
  i = e.substring(7, 9)) : (t = e.substring(1, 2),
  n = e.substring(2, 3),
  r = e.substring(3, 4),
  i = e.substring(4, 5),
  t += t,
  n += n,
  r += r,
  i += i),
  {
      red: parseInt(t, 16),
      green: parseInt(n, 16),
      blue: parseInt(r, 16),
      alpha: i ? parseInt(i, 16) / 255 : 1
  }
}
const Qu = {
  test: qf("#"),
  parse: HA,
  transform: Er.transform
}
, xs = e => ({
  test: t => typeof t == "string" && t.endsWith(e) && t.split(" ").length === 1,
  parse: parseFloat,
  transform: t => `${t}${e}`
})
, In = xs("deg")
, tn = xs("%")
, F = xs("px")
, KA = xs("vh")
, qA = xs("vw")
, Pm = {
  ...tn,
  parse: e => tn.parse(e) / 100,
  transform: e => tn.transform(e * 100)
}
, ci = {
  test: qf("hsl", "hue"),
  parse: dw("hue", "saturation", "lightness"),
  transform: ({hue: e, saturation: t, lightness: n, alpha: r=1}) => "hsla(" + Math.round(e) + ", " + tn.transform(Ro(t)) + ", " + tn.transform(Ro(n)) + ", " + Ro(ns.transform(r)) + ")"
}
, Ce = {
  test: e => Er.test(e) || Qu.test(e) || ci.test(e),
  parse: e => Er.test(e) ? Er.parse(e) : ci.test(e) ? ci.parse(e) : Qu.parse(e),
  transform: e => typeof e == "string" ? e : e.hasOwnProperty("red") ? Er.transform(e) : ci.transform(e),
  getAnimatableNone: e => {
      const t = Ce.parse(e);
      return t.alpha = 0,
      Ce.transform(t)
  }
}
, GA = /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;
function QA(e) {
  var t, n;
  return isNaN(e) && typeof e == "string" && (((t = e.match(Kf)) == null ? void 0 : t.length) || 0) + (((n = e.match(GA)) == null ? void 0 : n.length) || 0) > 0
}
const fw = "number"
, hw = "color"
, YA = "var"
, ZA = "var("
, Tm = "${}"
, XA = /var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;
function rs(e) {
  const t = e.toString()
    , n = []
    , r = {
      color: [],
      number: [],
      var: []
  }
    , i = [];
  let o = 0;
  const a = t.replace(XA, l => (Ce.test(l) ? (r.color.push(o),
  i.push(hw),
  n.push(Ce.parse(l))) : l.startsWith(ZA) ? (r.var.push(o),
  i.push(YA),
  n.push(l)) : (r.number.push(o),
  i.push(fw),
  n.push(parseFloat(l))),
  ++o,
  Tm)).split(Tm);
  return {
      values: n,
      split: a,
      indexes: r,
      types: i
  }
}
function pw(e) {
  return rs(e).values
}
function mw(e) {
  const {split: t, types: n} = rs(e)
    , r = t.length;
  return i => {
      let o = "";
      for (let s = 0; s < r; s++)
          if (o += t[s],
          i[s] !== void 0) {
              const a = n[s];
              a === fw ? o += Ro(i[s]) : a === hw ? o += Ce.transform(i[s]) : o += i[s]
          }
      return o
  }
}
const JA = e => typeof e == "number" ? 0 : Ce.test(e) ? Ce.getAnimatableNone(e) : e;
function eN(e) {
  const t = pw(e);
  return mw(e)(t.map(JA))
}
const cr = {
  test: QA,
  parse: pw,
  createTransformer: mw,
  getAnimatableNone: eN
};
function Pc(e, t, n) {
  return n < 0 && (n += 1),
  n > 1 && (n -= 1),
  n < 1 / 6 ? e + (t - e) * 6 * n : n < 1 / 2 ? t : n < 2 / 3 ? e + (t - e) * (2 / 3 - n) * 6 : e
}
function tN({hue: e, saturation: t, lightness: n, alpha: r}) {
  e /= 360,
  t /= 100,
  n /= 100;
  let i = 0
    , o = 0
    , s = 0;
  if (!t)
      i = o = s = n;
  else {
      const a = n < .5 ? n * (1 + t) : n + t - n * t
        , l = 2 * n - a;
      i = Pc(l, a, e + 1 / 3),
      o = Pc(l, a, e),
      s = Pc(l, a, e - 1 / 3)
  }
  return {
      red: Math.round(i * 255),
      green: Math.round(o * 255),
      blue: Math.round(s * 255),
      alpha: r
  }
}
function Ga(e, t) {
  return n => n > 0 ? t : e
}
const me = (e, t, n) => e + (t - e) * n
, Tc = (e, t, n) => {
  const r = e * e
    , i = n * (t * t - r) + r;
  return i < 0 ? 0 : Math.sqrt(i)
}
, nN = [Qu, Er, ci]
, rN = e => nN.find(t => t.test(e));
function Am(e) {
  const t = rN(e);
  if (jl(!!t, `'${e}' is not an animatable color. Use the equivalent color code instead.`, "color-not-animatable"),
  !t)
      return !1;
  let n = t.parse(e);
  return t === ci && (n = tN(n)),
  n
}
const Nm = (e, t) => {
  const n = Am(e)
    , r = Am(t);
  if (!n || !r)
      return Ga(e, t);
  const i = {
      ...n
  };
  return o => (i.red = Tc(n.red, r.red, o),
  i.green = Tc(n.green, r.green, o),
  i.blue = Tc(n.blue, r.blue, o),
  i.alpha = me(n.alpha, r.alpha, o),
  Er.transform(i))
}
, Yu = new Set(["none", "hidden"]);
function iN(e, t) {
  return Yu.has(e) ? n => n <= 0 ? e : t : n => n >= 1 ? t : e
}
function oN(e, t) {
  return n => me(e, t, n)
}
function Gf(e) {
  return typeof e == "number" ? oN : typeof e == "string" ? Hf(e) ? Ga : Ce.test(e) ? Nm : lN : Array.isArray(e) ? gw : typeof e == "object" ? Ce.test(e) ? Nm : sN : Ga
}
function gw(e, t) {
  const n = [...e]
    , r = n.length
    , i = e.map( (o, s) => Gf(o)(o, t[s]));
  return o => {
      for (let s = 0; s < r; s++)
          n[s] = i[s](o);
      return n
  }
}
function sN(e, t) {
  const n = {
      ...e,
      ...t
  }
    , r = {};
  for (const i in n)
      e[i] !== void 0 && t[i] !== void 0 && (r[i] = Gf(e[i])(e[i], t[i]));
  return i => {
      for (const o in r)
          n[o] = r[o](i);
      return n
  }
}
function aN(e, t) {
  const n = []
    , r = {
      color: 0,
      var: 0,
      number: 0
  };
  for (let i = 0; i < t.values.length; i++) {
      const o = t.types[i]
        , s = e.indexes[o][r[o]]
        , a = e.values[s] ?? 0;
      n[i] = a,
      r[o]++
  }
  return n
}
const lN = (e, t) => {
  const n = cr.createTransformer(t)
    , r = rs(e)
    , i = rs(t);
  return r.indexes.var.length === i.indexes.var.length && r.indexes.color.length === i.indexes.color.length && r.indexes.number.length >= i.indexes.number.length ? Yu.has(e) && !i.values.length || Yu.has(t) && !r.values.length ? iN(e, t) : ys(gw(aN(r, i), i.values), n) : (jl(!0, `Complex values '${e}' and '${t}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`, "complex-values-different"),
  Ga(e, t))
}
;
function yw(e, t, n) {
  return typeof e == "number" && typeof t == "number" && typeof n == "number" ? me(e, t, n) : Gf(e)(e, t)
}
const cN = e => {
  const t = ({timestamp: n}) => e(n);
  return {
      start: (n=!0) => ue.update(t, n),
      stop: () => lr(t),
      now: () => je.isProcessing ? je.timestamp : Ke.now()
  }
}
, vw = (e, t, n=10) => {
  let r = "";
  const i = Math.max(Math.round(t / n), 2);
  for (let o = 0; o < i; o++)
      r += Math.round(e(o / (i - 1)) * 1e4) / 1e4 + ", ";
  return `linear(${r.substring(0, r.length - 2)})`
}
, Qa = 2e4;
function Qf(e) {
  let t = 0;
  const n = 50;
  let r = e.next(t);
  for (; !r.done && t < Qa; )
      t += n,
      r = e.next(t);
  return t >= Qa ? 1 / 0 : t
}
function uN(e, t=100, n) {
  const r = n({
      ...e,
      keyframes: [0, t]
  })
    , i = Math.min(Qf(r), Qa);
  return {
      type: "keyframes",
      ease: o => r.next(i * o).value / t,
      duration: xt(i)
  }
}
const dN = 5;
function xw(e, t, n) {
  const r = Math.max(t - dN, 0);
  return Zx(n - e(r), t - r)
}
const he = {
  stiffness: 100,
  damping: 10,
  mass: 1,
  velocity: 0,
  duration: 800,
  bounce: .3,
  visualDuration: .3,
  restSpeed: {
      granular: .01,
      default: 2
  },
  restDelta: {
      granular: .005,
      default: .5
  },
  minDuration: .01,
  maxDuration: 10,
  minDamping: .05,
  maxDamping: 1
}
, Ac = .001;
function fN({duration: e=he.duration, bounce: t=he.bounce, velocity: n=he.velocity, mass: r=he.mass}) {
  let i, o;
  jl(e <= en(he.maxDuration), "Spring duration must be 10 seconds or less", "spring-duration-limit");
  let s = 1 - t;
  s = on(he.minDamping, he.maxDamping, s),
  e = on(he.minDuration, he.maxDuration, xt(e)),
  s < 1 ? (i = c => {
      const u = c * s
        , d = u * e
        , f = u - n
        , p = Zu(c, s)
        , b = Math.exp(-d);
      return Ac - f / p * b
  }
  ,
  o = c => {
      const d = c * s * e
        , f = d * n + n
        , p = Math.pow(s, 2) * Math.pow(c, 2) * e
        , b = Math.exp(-d)
        , y = Zu(Math.pow(c, 2), s);
      return (-i(c) + Ac > 0 ? -1 : 1) * ((f - p) * b) / y
  }
  ) : (i = c => {
      const u = Math.exp(-c * e)
        , d = (c - n) * e + 1;
      return -Ac + u * d
  }
  ,
  o = c => {
      const u = Math.exp(-c * e)
        , d = (n - c) * (e * e);
      return u * d
  }
  );
  const a = 5 / e
    , l = pN(i, o, a);
  if (e = en(e),
  isNaN(l))
      return {
          stiffness: he.stiffness,
          damping: he.damping,
          duration: e
      };
  {
      const c = Math.pow(l, 2) * r;
      return {
          stiffness: c,
          damping: s * 2 * Math.sqrt(r * c),
          duration: e
      }
  }
}
const hN = 12;
function pN(e, t, n) {
  let r = n;
  for (let i = 1; i < hN; i++)
      r = r - e(r) / t(r);
  return r
}
function Zu(e, t) {
  return e * Math.sqrt(1 - t * t)
}
const mN = ["duration", "bounce"]
, gN = ["stiffness", "damping", "mass"];
function Rm(e, t) {
  return t.some(n => e[n] !== void 0)
}
function yN(e) {
  let t = {
      velocity: he.velocity,
      stiffness: he.stiffness,
      damping: he.damping,
      mass: he.mass,
      isResolvedFromDuration: !1,
      ...e
  };
  if (!Rm(e, gN) && Rm(e, mN))
      if (e.visualDuration) {
          const n = e.visualDuration
            , r = 2 * Math.PI / (n * 1.2)
            , i = r * r
            , o = 2 * on(.05, 1, 1 - (e.bounce || 0)) * Math.sqrt(i);
          t = {
              ...t,
              mass: he.mass,
              stiffness: i,
              damping: o
          }
      } else {
          const n = fN(e);
          t = {
              ...t,
              ...n,
              mass: he.mass
          },
          t.isResolvedFromDuration = !0
      }
  return t
}
function Ya(e=he.visualDuration, t=he.bounce) {
  const n = typeof e != "object" ? {
      visualDuration: e,
      keyframes: [0, 1],
      bounce: t
  } : e;
  let {restSpeed: r, restDelta: i} = n;
  const o = n.keyframes[0]
    , s = n.keyframes[n.keyframes.length - 1]
    , a = {
      done: !1,
      value: o
  }
    , {stiffness: l, damping: c, mass: u, duration: d, velocity: f, isResolvedFromDuration: p} = yN({
      ...n,
      velocity: -xt(n.velocity || 0)
  })
    , b = f || 0
    , y = c / (2 * Math.sqrt(l * u))
    , w = s - o
    , m = xt(Math.sqrt(l / u))
    , g = Math.abs(w) < 5;
  r || (r = g ? he.restSpeed.granular : he.restSpeed.default),
  i || (i = g ? he.restDelta.granular : he.restDelta.default);
  let v;
  if (y < 1) {
      const C = Zu(m, y);
      v = k => {
          const E = Math.exp(-y * m * k);
          return s - E * ((b + y * m * w) / C * Math.sin(C * k) + w * Math.cos(C * k))
      }
  } else if (y === 1)
      v = C => s - Math.exp(-m * C) * (w + (b + m * w) * C);
  else {
      const C = m * Math.sqrt(y * y - 1);
      v = k => {
          const E = Math.exp(-y * m * k)
            , P = Math.min(C * k, 300);
          return s - E * ((b + y * m * w) * Math.sinh(P) + C * w * Math.cosh(P)) / C
      }
  }
  const S = {
      calculatedDuration: p && d || null,
      next: C => {
          const k = v(C);
          if (p)
              a.done = C >= d;
          else {
              let E = C === 0 ? b : 0;
              y < 1 && (E = C === 0 ? en(b) : xw(v, C, k));
              const P = Math.abs(E) <= r
                , j = Math.abs(s - k) <= i;
              a.done = P && j
          }
          return a.value = a.done ? s : k,
          a
      }
      ,
      toString: () => {
          const C = Math.min(Qf(S), Qa)
            , k = vw(E => S.next(C * E).value, C, 30);
          return C + "ms " + k
      }
      ,
      toTransition: () => {}
  };
  return S
}
Ya.applyToOptions = e => {
  const t = uN(e, 100, Ya);
  return e.ease = t.ease,
  e.duration = en(t.duration),
  e.type = "keyframes",
  e
}
;
function Xu({keyframes: e, velocity: t=0, power: n=.8, timeConstant: r=325, bounceDamping: i=10, bounceStiffness: o=500, modifyTarget: s, min: a, max: l, restDelta: c=.5, restSpeed: u}) {
  const d = e[0]
    , f = {
      done: !1,
      value: d
  }
    , p = P => a !== void 0 && P < a || l !== void 0 && P > l
    , b = P => a === void 0 ? l : l === void 0 || Math.abs(a - P) < Math.abs(l - P) ? a : l;
  let y = n * t;
  const w = d + y
    , m = s === void 0 ? w : s(w);
  m !== w && (y = m - d);
  const g = P => -y * Math.exp(-P / r)
    , v = P => m + g(P)
    , S = P => {
      const j = g(P)
        , R = v(P);
      f.done = Math.abs(j) <= c,
      f.value = f.done ? m : R
  }
  ;
  let C, k;
  const E = P => {
      p(f.value) && (C = P,
      k = Ya({
          keyframes: [f.value, b(f.value)],
          velocity: xw(v, P, f.value),
          damping: i,
          stiffness: o,
          restDelta: c,
          restSpeed: u
      }))
  }
  ;
  return E(0),
  {
      calculatedDuration: null,
      next: P => {
          let j = !1;
          return !k && C === void 0 && (j = !0,
          S(P),
          E(P)),
          C !== void 0 && P >= C ? k.next(P - C) : (!j && S(P),
          f)
      }
  }
}
function vN(e, t, n) {
  const r = []
    , i = n || Sn.mix || yw
    , o = e.length - 1;
  for (let s = 0; s < o; s++) {
      let a = i(e[s], e[s + 1]);
      if (t) {
          const l = Array.isArray(t) ? t[s] || bt : t;
          a = ys(l, a)
      }
      r.push(a)
  }
  return r
}
function xN(e, t, {clamp: n=!0, ease: r, mixer: i}={}) {
  const o = e.length;
  if (Bi(o === t.length, "Both input and output ranges must be the same length", "range-length"),
  o === 1)
      return () => t[0];
  if (o === 2 && t[0] === t[1])
      return () => t[1];
  const s = e[0] === e[1];
  e[0] > e[o - 1] && (e = [...e].reverse(),
  t = [...t].reverse());
  const a = vN(t, r, i)
    , l = a.length
    , c = u => {
      if (s && u < e[0])
          return t[0];
      let d = 0;
      if (l > 1)
          for (; d < e.length - 2 && !(u < e[d + 1]); d++)
              ;
      const f = ts(e[d], e[d + 1], u);
      return a[d](f)
  }
  ;
  return n ? u => c(on(e[0], e[o - 1], u)) : c
}
function wN(e, t) {
  const n = e[e.length - 1];
  for (let r = 1; r <= t; r++) {
      const i = ts(0, t, r);
      e.push(me(n, 1, i))
  }
}
function bN(e) {
  const t = [0];
  return wN(t, e.length - 1),
  t
}
function SN(e, t) {
  return e.map(n => n * t)
}
function CN(e, t) {
  return e.map( () => t || sw).splice(0, e.length - 1)
}
function jo({duration: e=300, keyframes: t, times: n, ease: r="easeInOut"}) {
  const i = LA(r) ? r.map(Cm) : Cm(r)
    , o = {
      done: !1,
      value: t[0]
  }
    , s = SN(n && n.length === t.length ? n : bN(t), e)
    , a = xN(s, t, {
      ease: Array.isArray(i) ? i : CN(t, i)
  });
  return {
      calculatedDuration: e,
      next: l => (o.value = a(l),
      o.done = l >= e,
      o)
  }
}
const kN = e => e !== null;
function Yf(e, {repeat: t, repeatType: n="loop"}, r, i=1) {
  const o = e.filter(kN)
    , a = i < 0 || t && n !== "loop" && t % 2 === 1 ? 0 : o.length - 1;
  return !a || r === void 0 ? o[a] : r
}
const EN = {
  decay: Xu,
  inertia: Xu,
  tween: jo,
  keyframes: jo,
  spring: Ya
};
function ww(e) {
  typeof e.type == "string" && (e.type = EN[e.type])
}
class Zf {
  constructor() {
      this.updateFinished()
  }
  get finished() {
      return this._finished
  }
  updateFinished() {
      this._finished = new Promise(t => {
          this.resolve = t
      }
      )
  }
  notifyFinished() {
      this.resolve()
  }
  then(t, n) {
      return this.finished.then(t, n)
  }
}
const PN = e => e / 100;
class Xf extends Zf {
  constructor(t) {
      super(),
      this.state = "idle",
      this.startTime = null,
      this.isStopped = !1,
      this.currentTime = 0,
      this.holdTime = null,
      this.playbackSpeed = 1,
      this.stop = () => {
          var r, i;
          const {motionValue: n} = this.options;
          n && n.updatedAt !== Ke.now() && this.tick(Ke.now()),
          this.isStopped = !0,
          this.state !== "idle" && (this.teardown(),
          (i = (r = this.options).onStop) == null || i.call(r))
      }
      ,
      this.options = t,
      this.initAnimation(),
      this.play(),
      t.autoplay === !1 && this.pause()
  }
  initAnimation() {
      const {options: t} = this;
      ww(t);
      const {type: n=jo, repeat: r=0, repeatDelay: i=0, repeatType: o, velocity: s=0} = t;
      let {keyframes: a} = t;
      const l = n || jo;
      l !== jo && typeof a[0] != "number" && (this.mixKeyframes = ys(PN, yw(a[0], a[1])),
      a = [0, 100]);
      const c = l({
          ...t,
          keyframes: a
      });
      o === "mirror" && (this.mirroredGenerator = l({
          ...t,
          keyframes: [...a].reverse(),
          velocity: -s
      })),
      c.calculatedDuration === null && (c.calculatedDuration = Qf(c));
      const {calculatedDuration: u} = c;
      this.calculatedDuration = u,
      this.resolvedDuration = u + i,
      this.totalDuration = this.resolvedDuration * (r + 1) - i,
      this.generator = c
  }
  updateTime(t) {
      const n = Math.round(t - this.startTime) * this.playbackSpeed;
      this.holdTime !== null ? this.currentTime = this.holdTime : this.currentTime = n
  }
  tick(t, n=!1) {
      const {generator: r, totalDuration: i, mixKeyframes: o, mirroredGenerator: s, resolvedDuration: a, calculatedDuration: l} = this;
      if (this.startTime === null)
          return r.next(0);
      const {delay: c=0, keyframes: u, repeat: d, repeatType: f, repeatDelay: p, type: b, onUpdate: y, finalKeyframe: w} = this.options;
      this.speed > 0 ? this.startTime = Math.min(this.startTime, t) : this.speed < 0 && (this.startTime = Math.min(t - i / this.speed, this.startTime)),
      n ? this.currentTime = t : this.updateTime(t);
      const m = this.currentTime - c * (this.playbackSpeed >= 0 ? 1 : -1)
        , g = this.playbackSpeed >= 0 ? m < 0 : m > i;
      this.currentTime = Math.max(m, 0),
      this.state === "finished" && this.holdTime === null && (this.currentTime = i);
      let v = this.currentTime
        , S = r;
      if (d) {
          const P = Math.min(this.currentTime, i) / a;
          let j = Math.floor(P)
            , R = P % 1;
          !R && P >= 1 && (R = 1),
          R === 1 && j--,
          j = Math.min(j, d + 1),
          !!(j % 2) && (f === "reverse" ? (R = 1 - R,
          p && (R -= p / a)) : f === "mirror" && (S = s)),
          v = on(0, 1, R) * a
      }
      const C = g ? {
          done: !1,
          value: u[0]
      } : S.next(v);
      o && (C.value = o(C.value));
      let {done: k} = C;
      !g && l !== null && (k = this.playbackSpeed >= 0 ? this.currentTime >= i : this.currentTime <= 0);
      const E = this.holdTime === null && (this.state === "finished" || this.state === "running" && k);
      return E && b !== Xu && (C.value = Yf(u, this.options, w, this.speed)),
      y && y(C.value),
      E && this.finish(),
      C
  }
  then(t, n) {
      return this.finished.then(t, n)
  }
  get duration() {
      return xt(this.calculatedDuration)
  }
  get iterationDuration() {
      const {delay: t=0} = this.options || {};
      return this.duration + xt(t)
  }
  get time() {
      return xt(this.currentTime)
  }
  set time(t) {
      var n;
      t = en(t),
      this.currentTime = t,
      this.startTime === null || this.holdTime !== null || this.playbackSpeed === 0 ? this.holdTime = t : this.driver && (this.startTime = this.driver.now() - t / this.playbackSpeed),
      (n = this.driver) == null || n.start(!1)
  }
  get speed() {
      return this.playbackSpeed
  }
  set speed(t) {
      this.updateTime(Ke.now());
      const n = this.playbackSpeed !== t;
      this.playbackSpeed = t,
      n && (this.time = xt(this.currentTime))
  }
  play() {
      var i, o;
      if (this.isStopped)
          return;
      const {driver: t=cN, startTime: n} = this.options;
      this.driver || (this.driver = t(s => this.tick(s))),
      (o = (i = this.options).onPlay) == null || o.call(i);
      const r = this.driver.now();
      this.state === "finished" ? (this.updateFinished(),
      this.startTime = r) : this.holdTime !== null ? this.startTime = r - this.holdTime : this.startTime || (this.startTime = n ?? r),
      this.state === "finished" && this.speed < 0 && (this.startTime += this.calculatedDuration),
      this.holdTime = null,
      this.state = "running",
      this.driver.start()
  }
  pause() {
      this.state = "paused",
      this.updateTime(Ke.now()),
      this.holdTime = this.currentTime
  }
  complete() {
      this.state !== "running" && this.play(),
      this.state = "finished",
      this.holdTime = null
  }
  finish() {
      var t, n;
      this.notifyFinished(),
      this.teardown(),
      this.state = "finished",
      (n = (t = this.options).onComplete) == null || n.call(t)
  }
  cancel() {
      var t, n;
      this.holdTime = null,
      this.startTime = 0,
      this.tick(0),
      this.teardown(),
      (n = (t = this.options).onCancel) == null || n.call(t)
  }
  teardown() {
      this.state = "idle",
      this.stopDriver(),
      this.startTime = this.holdTime = null
  }
  stopDriver() {
      this.driver && (this.driver.stop(),
      this.driver = void 0)
  }
  sample(t) {
      return this.startTime = 0,
      this.tick(t, !0)
  }
  attachTimeline(t) {
      var n;
      return this.options.allowFlatten && (this.options.type = "keyframes",
      this.options.ease = "linear",
      this.initAnimation()),
      (n = this.driver) == null || n.stop(),
      t.observe(this)
  }
}
function TN(e) {
  for (let t = 1; t < e.length; t++)
      e[t] ?? (e[t] = e[t - 1])
}
const Pr = e => e * 180 / Math.PI
, Ju = e => {
  const t = Pr(Math.atan2(e[1], e[0]));
  return ed(t)
}
, AN = {
  x: 4,
  y: 5,
  translateX: 4,
  translateY: 5,
  scaleX: 0,
  scaleY: 3,
  scale: e => (Math.abs(e[0]) + Math.abs(e[3])) / 2,
  rotate: Ju,
  rotateZ: Ju,
  skewX: e => Pr(Math.atan(e[1])),
  skewY: e => Pr(Math.atan(e[2])),
  skew: e => (Math.abs(e[1]) + Math.abs(e[2])) / 2
}
, ed = e => (e = e % 360,
e < 0 && (e += 360),
e)
, jm = Ju
, Mm = e => Math.sqrt(e[0] * e[0] + e[1] * e[1])
, Dm = e => Math.sqrt(e[4] * e[4] + e[5] * e[5])
, NN = {
  x: 12,
  y: 13,
  z: 14,
  translateX: 12,
  translateY: 13,
  translateZ: 14,
  scaleX: Mm,
  scaleY: Dm,
  scale: e => (Mm(e) + Dm(e)) / 2,
  rotateX: e => ed(Pr(Math.atan2(e[6], e[5]))),
  rotateY: e => ed(Pr(Math.atan2(-e[2], e[0]))),
  rotateZ: jm,
  rotate: jm,
  skewX: e => Pr(Math.atan(e[4])),
  skewY: e => Pr(Math.atan(e[1])),
  skew: e => (Math.abs(e[1]) + Math.abs(e[4])) / 2
};
function td(e) {
  return e.includes("scale") ? 1 : 0
}
function nd(e, t) {
  if (!e || e === "none")
      return td(t);
  const n = e.match(/^matrix3d\(([-\d.e\s,]+)\)$/u);
  let r, i;
  if (n)
      r = NN,
      i = n;
  else {
      const a = e.match(/^matrix\(([-\d.e\s,]+)\)$/u);
      r = AN,
      i = a
  }
  if (!i)
      return td(t);
  const o = r[t]
    , s = i[1].split(",").map(jN);
  return typeof o == "function" ? o(s) : s[o]
}
const RN = (e, t) => {
  const {transform: n="none"} = getComputedStyle(e);
  return nd(n, t)
}
;
function jN(e) {
  return parseFloat(e.trim())
}
const Zi = ["transformPerspective", "x", "y", "z", "translateX", "translateY", "translateZ", "scale", "scaleX", "scaleY", "rotate", "rotateX", "rotateY", "rotateZ", "skew", "skewX", "skewY"]
, Xi = new Set(Zi)
, Im = e => e === Yi || e === F
, MN = new Set(["x", "y", "z"])
, DN = Zi.filter(e => !MN.has(e));
function IN(e) {
  const t = [];
  return DN.forEach(n => {
      const r = e.getValue(n);
      r !== void 0 && (t.push([n, r.get()]),
      r.set(n.startsWith("scale") ? 1 : 0))
  }
  ),
  t
}
const qn = {
  width: ({x: e}, {paddingLeft: t="0", paddingRight: n="0"}) => e.max - e.min - parseFloat(t) - parseFloat(n),
  height: ({y: e}, {paddingTop: t="0", paddingBottom: n="0"}) => e.max - e.min - parseFloat(t) - parseFloat(n),
  top: (e, {top: t}) => parseFloat(t),
  left: (e, {left: t}) => parseFloat(t),
  bottom: ({y: e}, {top: t}) => parseFloat(t) + (e.max - e.min),
  right: ({x: e}, {left: t}) => parseFloat(t) + (e.max - e.min),
  x: (e, {transform: t}) => nd(t, "x"),
  y: (e, {transform: t}) => nd(t, "y")
};
qn.translateX = qn.x;
qn.translateY = qn.y;
const Lr = new Set;
let rd = !1
, id = !1
, od = !1;
function bw() {
  if (id) {
      const e = Array.from(Lr).filter(r => r.needsMeasurement)
        , t = new Set(e.map(r => r.element))
        , n = new Map;
      t.forEach(r => {
          const i = IN(r);
          i.length && (n.set(r, i),
          r.render())
      }
      ),
      e.forEach(r => r.measureInitialState()),
      t.forEach(r => {
          r.render();
          const i = n.get(r);
          i && i.forEach( ([o,s]) => {
              var a;
              (a = r.getValue(o)) == null || a.set(s)
          }
          )
      }
      ),
      e.forEach(r => r.measureEndState()),
      e.forEach(r => {
          r.suspendedScrollY !== void 0 && window.scrollTo(0, r.suspendedScrollY)
      }
      )
  }
  id = !1,
  rd = !1,
  Lr.forEach(e => e.complete(od)),
  Lr.clear()
}
function Sw() {
  Lr.forEach(e => {
      e.readKeyframes(),
      e.needsMeasurement && (id = !0)
  }
  )
}
function LN() {
  od = !0,
  Sw(),
  bw(),
  od = !1
}
class Jf {
  constructor(t, n, r, i, o, s=!1) {
      this.state = "pending",
      this.isAsync = !1,
      this.needsMeasurement = !1,
      this.unresolvedKeyframes = [...t],
      this.onComplete = n,
      this.name = r,
      this.motionValue = i,
      this.element = o,
      this.isAsync = s
  }
  scheduleResolve() {
      this.state = "scheduled",
      this.isAsync ? (Lr.add(this),
      rd || (rd = !0,
      ue.read(Sw),
      ue.resolveKeyframes(bw))) : (this.readKeyframes(),
      this.complete())
  }
  readKeyframes() {
      const {unresolvedKeyframes: t, name: n, element: r, motionValue: i} = this;
      if (t[0] === null) {
          const o = i == null ? void 0 : i.get()
            , s = t[t.length - 1];
          if (o !== void 0)
              t[0] = o;
          else if (r && n) {
              const a = r.readValue(n, s);
              a != null && (t[0] = a)
          }
          t[0] === void 0 && (t[0] = s),
          i && o === void 0 && i.set(t[0])
      }
      TN(t)
  }
  setFinalKeyframe() {}
  measureInitialState() {}
  renderEndStyles() {}
  measureEndState() {}
  complete(t=!1) {
      this.state = "complete",
      this.onComplete(this.unresolvedKeyframes, this.finalKeyframe, t),
      Lr.delete(this)
  }
  cancel() {
      this.state === "scheduled" && (Lr.delete(this),
      this.state = "pending")
  }
  resume() {
      this.state === "pending" && this.scheduleResolve()
  }
}
const ON = e => e.startsWith("--");
function zN(e, t, n) {
  ON(t) ? e.style.setProperty(t, n) : e.style[t] = n
}
const _N = Bf( () => window.ScrollTimeline !== void 0)
, VN = {};
function FN(e, t) {
  const n = Bf(e);
  return () => VN[t] ?? n()
}
const Cw = FN( () => {
  try {
      document.createElement("div").animate({
          opacity: 0
      }, {
          easing: "linear(0, 1)"
      })
  } catch {
      return !1
  }
  return !0
}
, "linearEasing")
, vo = ([e,t,n,r]) => `cubic-bezier(${e}, ${t}, ${n}, ${r})`
, Lm = {
  linear: "linear",
  ease: "ease",
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",
  circIn: vo([0, .65, .55, 1]),
  circOut: vo([.55, 0, 1, .45]),
  backIn: vo([.31, .01, .66, -.59]),
  backOut: vo([.33, 1.53, .69, .99])
};
function kw(e, t) {
  if (e)
      return typeof e == "function" ? Cw() ? vw(e, t) : "ease-out" : aw(e) ? vo(e) : Array.isArray(e) ? e.map(n => kw(n, t) || Lm.easeOut) : Lm[e]
}
function BN(e, t, n, {delay: r=0, duration: i=300, repeat: o=0, repeatType: s="loop", ease: a="easeOut", times: l}={}, c=void 0) {
  const u = {
      [t]: n
  };
  l && (u.offset = l);
  const d = kw(a, i);
  Array.isArray(d) && (u.easing = d);
  const f = {
      delay: r,
      duration: i,
      easing: Array.isArray(d) ? "linear" : d,
      fill: "both",
      iterations: o + 1,
      direction: s === "reverse" ? "alternate" : "normal"
  };
  return c && (f.pseudoElement = c),
  e.animate(u, f)
}
function Ew(e) {
  return typeof e == "function" && "applyToOptions"in e
}
function $N({type: e, ...t}) {
  return Ew(e) && Cw() ? e.applyToOptions(t) : (t.duration ?? (t.duration = 300),
  t.ease ?? (t.ease = "easeOut"),
  t)
}
class UN extends Zf {
  constructor(t) {
      if (super(),
      this.finishedTime = null,
      this.isStopped = !1,
      this.manualStartTime = null,
      !t)
          return;
      const {element: n, name: r, keyframes: i, pseudoElement: o, allowFlatten: s=!1, finalKeyframe: a, onComplete: l} = t;
      this.isPseudoElement = !!o,
      this.allowFlatten = s,
      this.options = t,
      Bi(typeof t.type != "string", `Mini animate() doesn't support "type" as a string.`, "mini-spring");
      const c = $N(t);
      this.animation = BN(n, r, i, c, o),
      c.autoplay === !1 && this.animation.pause(),
      this.animation.onfinish = () => {
          if (this.finishedTime = this.time,
          !o) {
              const u = Yf(i, this.options, a, this.speed);
              this.updateMotionValue ? this.updateMotionValue(u) : zN(n, r, u),
              this.animation.cancel()
          }
          l == null || l(),
          this.notifyFinished()
      }
  }
  play() {
      this.isStopped || (this.manualStartTime = null,
      this.animation.play(),
      this.state === "finished" && this.updateFinished())
  }
  pause() {
      this.animation.pause()
  }
  complete() {
      var t, n;
      (n = (t = this.animation).finish) == null || n.call(t)
  }
  cancel() {
      try {
          this.animation.cancel()
      } catch {}
  }
  stop() {
      if (this.isStopped)
          return;
      this.isStopped = !0;
      const {state: t} = this;
      t === "idle" || t === "finished" || (this.updateMotionValue ? this.updateMotionValue() : this.commitStyles(),
      this.isPseudoElement || this.cancel())
  }
  commitStyles() {
      var t, n;
      this.isPseudoElement || (n = (t = this.animation).commitStyles) == null || n.call(t)
  }
  get duration() {
      var n, r;
      const t = ((r = (n = this.animation.effect) == null ? void 0 : n.getComputedTiming) == null ? void 0 : r.call(n).duration) || 0;
      return xt(Number(t))
  }
  get iterationDuration() {
      const {delay: t=0} = this.options || {};
      return this.duration + xt(t)
  }
  get time() {
      return xt(Number(this.animation.currentTime) || 0)
  }
  set time(t) {
      this.manualStartTime = null,
      this.finishedTime = null,
      this.animation.currentTime = en(t)
  }
  get speed() {
      return this.animation.playbackRate
  }
  set speed(t) {
      t < 0 && (this.finishedTime = null),
      this.animation.playbackRate = t
  }
  get state() {
      return this.finishedTime !== null ? "finished" : this.animation.playState
  }
  get startTime() {
      return this.manualStartTime ?? Number(this.animation.startTime)
  }
  set startTime(t) {
      this.manualStartTime = this.animation.startTime = t
  }
  attachTimeline({timeline: t, observe: n}) {
      var r;
      return this.allowFlatten && ((r = this.animation.effect) == null || r.updateTiming({
          easing: "linear"
      })),
      this.animation.onfinish = null,
      t && _N() ? (this.animation.timeline = t,
      bt) : n(this)
  }
}
const Pw = {
  anticipate: rw,
  backInOut: nw,
  circInOut: ow
};
function WN(e) {
  return e in Pw
}
function HN(e) {
  typeof e.ease == "string" && WN(e.ease) && (e.ease = Pw[e.ease])
}
const Nc = 10;
class KN extends UN {
  constructor(t) {
      HN(t),
      ww(t),
      super(t),
      t.startTime !== void 0 && (this.startTime = t.startTime),
      this.options = t
  }
  updateMotionValue(t) {
      const {motionValue: n, onUpdate: r, onComplete: i, element: o, ...s} = this.options;
      if (!n)
          return;
      if (t !== void 0) {
          n.set(t);
          return
      }
      const a = new Xf({
          ...s,
          autoplay: !1
      })
        , l = Math.max(Nc, Ke.now() - this.startTime)
        , c = on(0, Nc, l - Nc);
      n.setWithVelocity(a.sample(Math.max(0, l - c)).value, a.sample(l).value, c),
      a.stop()
  }
}
const Om = (e, t) => t === "zIndex" ? !1 : !!(typeof e == "number" || Array.isArray(e) || typeof e == "string" && (cr.test(e) || e === "0") && !e.startsWith("url("));
function qN(e) {
  const t = e[0];
  if (e.length === 1)
      return !0;
  for (let n = 0; n < e.length; n++)
      if (e[n] !== t)
          return !0
}
function GN(e, t, n, r) {
  const i = e[0];
  if (i === null)
      return !1;
  if (t === "display" || t === "visibility")
      return !0;
  const o = e[e.length - 1]
    , s = Om(i, t)
    , a = Om(o, t);
  return jl(s === a, `You are trying to animate ${t} from "${i}" to "${o}". "${s ? o : i}" is not an animatable value.`, "value-not-animatable"),
  !s || !a ? !1 : qN(e) || (n === "spring" || Ew(n)) && r
}
function sd(e) {
  e.duration = 0,
  e.type = "keyframes"
}
const QN = new Set(["opacity", "clipPath", "filter", "transform"])
, YN = Bf( () => Object.hasOwnProperty.call(Element.prototype, "animate"));
function ZN(e) {
  var u;
  const {motionValue: t, name: n, repeatDelay: r, repeatType: i, damping: o, type: s} = e;
  if (!(((u = t == null ? void 0 : t.owner) == null ? void 0 : u.current)instanceof HTMLElement))
      return !1;
  const {onUpdate: l, transformTemplate: c} = t.owner.getProps();
  return YN() && n && QN.has(n) && (n !== "transform" || !c) && !l && !r && i !== "mirror" && o !== 0 && s !== "inertia"
}
const XN = 40;
class JN extends Zf {
  constructor({autoplay: t=!0, delay: n=0, type: r="keyframes", repeat: i=0, repeatDelay: o=0, repeatType: s="loop", keyframes: a, name: l, motionValue: c, element: u, ...d}) {
      var b;
      super(),
      this.stop = () => {
          var y, w;
          this._animation && (this._animation.stop(),
          (y = this.stopTimeline) == null || y.call(this)),
          (w = this.keyframeResolver) == null || w.cancel()
      }
      ,
      this.createdAt = Ke.now();
      const f = {
          autoplay: t,
          delay: n,
          type: r,
          repeat: i,
          repeatDelay: o,
          repeatType: s,
          name: l,
          motionValue: c,
          element: u,
          ...d
      }
        , p = (u == null ? void 0 : u.KeyframeResolver) || Jf;
      this.keyframeResolver = new p(a, (y, w, m) => this.onKeyframesResolved(y, w, f, !m),l,c,u),
      (b = this.keyframeResolver) == null || b.scheduleResolve()
  }
  onKeyframesResolved(t, n, r, i) {
      var w, m;
      this.keyframeResolver = void 0;
      const {name: o, type: s, velocity: a, delay: l, isHandoff: c, onUpdate: u} = r;
      this.resolvedAt = Ke.now(),
      GN(t, o, s, a) || ((Sn.instantAnimations || !l) && (u == null || u(Yf(t, r, n))),
      t[0] = t[t.length - 1],
      sd(r),
      r.repeat = 0);
      const f = {
          startTime: i ? this.resolvedAt ? this.resolvedAt - this.createdAt > XN ? this.resolvedAt : this.createdAt : this.createdAt : void 0,
          finalKeyframe: n,
          ...r,
          keyframes: t
      }
        , p = !c && ZN(f)
        , b = (m = (w = f.motionValue) == null ? void 0 : w.owner) == null ? void 0 : m.current
        , y = p ? new KN({
          ...f,
          element: b
      }) : new Xf(f);
      y.finished.then( () => {
          this.notifyFinished()
      }
      ).catch(bt),
      this.pendingTimeline && (this.stopTimeline = y.attachTimeline(this.pendingTimeline),
      this.pendingTimeline = void 0),
      this._animation = y
  }
  get finished() {
      return this._animation ? this.animation.finished : this._finished
  }
  then(t, n) {
      return this.finished.finally(t).then( () => {}
      )
  }
  get animation() {
      var t;
      return this._animation || ((t = this.keyframeResolver) == null || t.resume(),
      LN()),
      this._animation
  }
  get duration() {
      return this.animation.duration
  }
  get iterationDuration() {
      return this.animation.iterationDuration
  }
  get time() {
      return this.animation.time
  }
  set time(t) {
      this.animation.time = t
  }
  get speed() {
      return this.animation.speed
  }
  get state() {
      return this.animation.state
  }
  set speed(t) {
      this.animation.speed = t
  }
  get startTime() {
      return this.animation.startTime
  }
  attachTimeline(t) {
      return this._animation ? this.stopTimeline = this.animation.attachTimeline(t) : this.pendingTimeline = t,
      () => this.stop()
  }
  play() {
      this.animation.play()
  }
  pause() {
      this.animation.pause()
  }
  complete() {
      this.animation.complete()
  }
  cancel() {
      var t;
      this._animation && this.animation.cancel(),
      (t = this.keyframeResolver) == null || t.cancel()
  }
}
function Tw(e, t, n, r=0, i=1) {
  const o = Array.from(e).sort( (c, u) => c.sortNodePosition(u)).indexOf(t)
    , s = e.size
    , a = (s - 1) * r;
  return typeof n == "function" ? n(o, s) : i === 1 ? o * r : a - o * r
}
const eR = /^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u;
function tR(e) {
  const t = eR.exec(e);
  if (!t)
      return [, ];
  const [,n,r,i] = t;
  return [`--${n ?? r}`, i]
}
const nR = 4;
function Aw(e, t, n=1) {
  Bi(n <= nR, `Max CSS variable fallback depth detected in property "${e}". This may indicate a circular fallback dependency.`, "max-css-var-depth");
  const [r,i] = tR(e);
  if (!r)
      return;
  const o = window.getComputedStyle(t).getPropertyValue(r);
  if (o) {
      const s = o.trim();
      return Gx(s) ? parseFloat(s) : s
  }
  return Hf(i) ? Aw(i, t, n + 1) : i
}
const rR = {
  type: "spring",
  stiffness: 500,
  damping: 25,
  restSpeed: 10
}
, iR = e => ({
  type: "spring",
  stiffness: 550,
  damping: e === 0 ? 2 * Math.sqrt(550) : 30,
  restSpeed: 10
})
, oR = {
  type: "keyframes",
  duration: .8
}
, sR = {
  type: "keyframes",
  ease: [.25, .1, .35, 1],
  duration: .3
}
, aR = (e, {keyframes: t}) => t.length > 2 ? oR : Xi.has(e) ? e.startsWith("scale") ? iR(t[1]) : rR : sR
, lR = e => e !== null;
function cR(e, {repeat: t, repeatType: n="loop"}, r) {
  const i = e.filter(lR)
    , o = t && n !== "loop" && t % 2 === 1 ? 0 : i.length - 1;
  return !o || r === void 0 ? i[o] : r
}
function eh(e, t) {
  return (e == null ? void 0 : e[t]) ?? (e == null ? void 0 : e.default) ?? e
}
function uR({when: e, delay: t, delayChildren: n, staggerChildren: r, staggerDirection: i, repeat: o, repeatType: s, repeatDelay: a, from: l, elapsed: c, ...u}) {
  return !!Object.keys(u).length
}
const th = (e, t, n, r={}, i, o) => s => {
  const a = eh(r, e) || {}
    , l = a.delay || r.delay || 0;
  let {elapsed: c=0} = r;
  c = c - en(l);
  const u = {
      keyframes: Array.isArray(n) ? n : [null, n],
      ease: "easeOut",
      velocity: t.getVelocity(),
      ...a,
      delay: -c,
      onUpdate: f => {
          t.set(f),
          a.onUpdate && a.onUpdate(f)
      }
      ,
      onComplete: () => {
          s(),
          a.onComplete && a.onComplete()
      }
      ,
      name: e,
      motionValue: t,
      element: o ? void 0 : i
  };
  uR(a) || Object.assign(u, aR(e, u)),
  u.duration && (u.duration = en(u.duration)),
  u.repeatDelay && (u.repeatDelay = en(u.repeatDelay)),
  u.from !== void 0 && (u.keyframes[0] = u.from);
  let d = !1;
  if ((u.type === !1 || u.duration === 0 && !u.repeatDelay) && (sd(u),
  u.delay === 0 && (d = !0)),
  (Sn.instantAnimations || Sn.skipAnimations) && (d = !0,
  sd(u),
  u.delay = 0),
  u.allowFlatten = !a.type && !a.ease,
  d && !o && t.get() !== void 0) {
      const f = cR(u.keyframes, a);
      if (f !== void 0) {
          ue.update( () => {
              u.onUpdate(f),
              u.onComplete()
          }
          );
          return
      }
  }
  return a.isSync ? new Xf(u) : new JN(u)
}
;
function zm(e) {
  const t = [{}, {}];
  return e == null || e.values.forEach( (n, r) => {
      t[0][r] = n.get(),
      t[1][r] = n.getVelocity()
  }
  ),
  t
}
function nh(e, t, n, r) {
  if (typeof t == "function") {
      const [i,o] = zm(r);
      t = t(n !== void 0 ? n : e.custom, i, o)
  }
  if (typeof t == "string" && (t = e.variants && e.variants[t]),
  typeof t == "function") {
      const [i,o] = zm(r);
      t = t(n !== void 0 ? n : e.custom, i, o)
  }
  return t
}
function Si(e, t, n) {
  const r = e.getProps();
  return nh(r, t, n !== void 0 ? n : r.custom, e)
}
const Nw = new Set(["width", "height", "top", "left", "right", "bottom", ...Zi])
, _m = 30
, dR = e => !isNaN(parseFloat(e));
class fR {
  constructor(t, n={}) {
      this.canTrackVelocity = null,
      this.events = {},
      this.updateAndNotify = r => {
          var o;
          const i = Ke.now();
          if (this.updatedAt !== i && this.setPrevFrameValue(),
          this.prev = this.current,
          this.setCurrent(r),
          this.current !== this.prev && ((o = this.events.change) == null || o.notify(this.current),
          this.dependents))
              for (const s of this.dependents)
                  s.dirty()
      }
      ,
      this.hasAnimated = !1,
      this.setCurrent(t),
      this.owner = n.owner
  }
  setCurrent(t) {
      this.current = t,
      this.updatedAt = Ke.now(),
      this.canTrackVelocity === null && t !== void 0 && (this.canTrackVelocity = dR(this.current))
  }
  setPrevFrameValue(t=this.current) {
      this.prevFrameValue = t,
      this.prevUpdatedAt = this.updatedAt
  }
  onChange(t) {
      return this.on("change", t)
  }
  on(t, n) {
      this.events[t] || (this.events[t] = new $f);
      const r = this.events[t].add(n);
      return t === "change" ? () => {
          r(),
          ue.read( () => {
              this.events.change.getSize() || this.stop()
          }
          )
      }
      : r
  }
  clearListeners() {
      for (const t in this.events)
          this.events[t].clear()
  }
  attach(t, n) {
      this.passiveEffect = t,
      this.stopPassiveEffect = n
  }
  set(t) {
      this.passiveEffect ? this.passiveEffect(t, this.updateAndNotify) : this.updateAndNotify(t)
  }
  setWithVelocity(t, n, r) {
      this.set(n),
      this.prev = void 0,
      this.prevFrameValue = t,
      this.prevUpdatedAt = this.updatedAt - r
  }
  jump(t, n=!0) {
      this.updateAndNotify(t),
      this.prev = t,
      this.prevUpdatedAt = this.prevFrameValue = void 0,
      n && this.stop(),
      this.stopPassiveEffect && this.stopPassiveEffect()
  }
  dirty() {
      var t;
      (t = this.events.change) == null || t.notify(this.current)
  }
  addDependent(t) {
      this.dependents || (this.dependents = new Set),
      this.dependents.add(t)
  }
  removeDependent(t) {
      this.dependents && this.dependents.delete(t)
  }
  get() {
      return this.current
  }
  getPrevious() {
      return this.prev
  }
  getVelocity() {
      const t = Ke.now();
      if (!this.canTrackVelocity || this.prevFrameValue === void 0 || t - this.updatedAt > _m)
          return 0;
      const n = Math.min(this.updatedAt - this.prevUpdatedAt, _m);
      return Zx(parseFloat(this.current) - parseFloat(this.prevFrameValue), n)
  }
  start(t) {
      return this.stop(),
      new Promise(n => {
          this.hasAnimated = !0,
          this.animation = t(n),
          this.events.animationStart && this.events.animationStart.notify()
      }
      ).then( () => {
          this.events.animationComplete && this.events.animationComplete.notify(),
          this.clearAnimation()
      }
      )
  }
  stop() {
      this.animation && (this.animation.stop(),
      this.events.animationCancel && this.events.animationCancel.notify()),
      this.clearAnimation()
  }
  isAnimating() {
      return !!this.animation
  }
  clearAnimation() {
      delete this.animation
  }
  destroy() {
      var t, n;
      (t = this.dependents) == null || t.clear(),
      (n = this.events.destroy) == null || n.notify(),
      this.clearListeners(),
      this.stop(),
      this.stopPassiveEffect && this.stopPassiveEffect()
  }
}
function $i(e, t) {
  return new fR(e,t)
}
const ad = e => Array.isArray(e);
function hR(e, t, n) {
  e.hasValue(t) ? e.getValue(t).set(n) : e.addValue(t, $i(n))
}
function pR(e) {
  return ad(e) ? e[e.length - 1] || 0 : e
}
function mR(e, t) {
  const n = Si(e, t);
  let {transitionEnd: r={}, transition: i={}, ...o} = n || {};
  o = {
      ...o,
      ...r
  };
  for (const s in o) {
      const a = pR(o[s]);
      hR(e, s, a)
  }
}
const Fe = e => !!(e && e.getVelocity);
function gR(e) {
  return !!(Fe(e) && e.add)
}
function ld(e, t) {
  const n = e.getValue("willChange");
  if (gR(n))
      return n.add(t);
  if (!n && Sn.WillChange) {
      const r = new Sn.WillChange("auto");
      e.addValue("willChange", r),
      r.add(t)
  }
}
function rh(e) {
  return e.replace(/([A-Z])/g, t => `-${t.toLowerCase()}`)
}
const yR = "framerAppearId"
, Rw = "data-" + rh(yR);
function jw(e) {
  return e.props[Rw]
}
function vR({protectedKeys: e, needsAnimating: t}, n) {
  const r = e.hasOwnProperty(n) && t[n] !== !0;
  return t[n] = !1,
  r
}
function Mw(e, t, {delay: n=0, transitionOverride: r, type: i}={}) {
  let {transition: o=e.getDefaultTransition(), transitionEnd: s, ...a} = t;
  r && (o = r);
  const l = []
    , c = i && e.animationState && e.animationState.getState()[i];
  for (const u in a) {
      const d = e.getValue(u, e.latestValues[u] ?? null)
        , f = a[u];
      if (f === void 0 || c && vR(c, u))
          continue;
      const p = {
          delay: n,
          ...eh(o || {}, u)
      }
        , b = d.get();
      if (b !== void 0 && !d.isAnimating && !Array.isArray(f) && f === b && !p.velocity)
          continue;
      let y = !1;
      if (window.MotionHandoffAnimation) {
          const m = jw(e);
          if (m) {
              const g = window.MotionHandoffAnimation(m, u, ue);
              g !== null && (p.startTime = g,
              y = !0)
          }
      }
      ld(e, u),
      d.start(th(u, d, f, e.shouldReduceMotion && Nw.has(u) ? {
          type: !1
      } : p, e, y));
      const w = d.animation;
      w && l.push(w)
  }
  return s && Promise.all(l).then( () => {
      ue.update( () => {
          s && mR(e, s)
      }
      )
  }
  ),
  l
}
function cd(e, t, n={}) {
  var l;
  const r = Si(e, t, n.type === "exit" ? (l = e.presenceContext) == null ? void 0 : l.custom : void 0);
  let {transition: i=e.getDefaultTransition() || {}} = r || {};
  n.transitionOverride && (i = n.transitionOverride);
  const o = r ? () => Promise.all(Mw(e, r, n)) : () => Promise.resolve()
    , s = e.variantChildren && e.variantChildren.size ? (c=0) => {
      const {delayChildren: u=0, staggerChildren: d, staggerDirection: f} = i;
      return xR(e, t, c, u, d, f, n)
  }
  : () => Promise.resolve()
    , {when: a} = i;
  if (a) {
      const [c,u] = a === "beforeChildren" ? [o, s] : [s, o];
      return c().then( () => u())
  } else
      return Promise.all([o(), s(n.delay)])
}
function xR(e, t, n=0, r=0, i=0, o=1, s) {
  const a = [];
  for (const l of e.variantChildren)
      l.notify("AnimationStart", t),
      a.push(cd(l, t, {
          ...s,
          delay: n + (typeof r == "function" ? 0 : r) + Tw(e.variantChildren, l, r, i, o)
      }).then( () => l.notify("AnimationComplete", t)));
  return Promise.all(a)
}
function wR(e, t, n={}) {
  e.notify("AnimationStart", t);
  let r;
  if (Array.isArray(t)) {
      const i = t.map(o => cd(e, o, n));
      r = Promise.all(i)
  } else if (typeof t == "string")
      r = cd(e, t, n);
  else {
      const i = typeof t == "function" ? Si(e, t, n.custom) : t;
      r = Promise.all(Mw(e, i, n))
  }
  return r.then( () => {
      e.notify("AnimationComplete", t)
  }
  )
}
const bR = {
  test: e => e === "auto",
  parse: e => e
}
, Dw = e => t => t.test(e)
, Iw = [Yi, F, tn, In, qA, KA, bR]
, Vm = e => Iw.find(Dw(e));
function SR(e) {
  return typeof e == "number" ? e === 0 : e !== null ? e === "none" || e === "0" || Yx(e) : !0
}
const CR = new Set(["brightness", "contrast", "saturate", "opacity"]);
function kR(e) {
  const [t,n] = e.slice(0, -1).split("(");
  if (t === "drop-shadow")
      return e;
  const [r] = n.match(Kf) || [];
  if (!r)
      return e;
  const i = n.replace(r, "");
  let o = CR.has(t) ? 1 : 0;
  return r !== n && (o *= 100),
  t + "(" + o + i + ")"
}
const ER = /\b([a-z-]*)\(.*?\)/gu
, ud = {
  ...cr,
  getAnimatableNone: e => {
      const t = e.match(ER);
      return t ? t.map(kR).join(" ") : e
  }
}
, Fm = {
  ...Yi,
  transform: Math.round
}
, PR = {
  rotate: In,
  rotateX: In,
  rotateY: In,
  rotateZ: In,
  scale: Qs,
  scaleX: Qs,
  scaleY: Qs,
  scaleZ: Qs,
  skew: In,
  skewX: In,
  skewY: In,
  distance: F,
  translateX: F,
  translateY: F,
  translateZ: F,
  x: F,
  y: F,
  z: F,
  perspective: F,
  transformPerspective: F,
  opacity: ns,
  originX: Pm,
  originY: Pm,
  originZ: F
}
, ih = {
  borderWidth: F,
  borderTopWidth: F,
  borderRightWidth: F,
  borderBottomWidth: F,
  borderLeftWidth: F,
  borderRadius: F,
  radius: F,
  borderTopLeftRadius: F,
  borderTopRightRadius: F,
  borderBottomRightRadius: F,
  borderBottomLeftRadius: F,
  width: F,
  maxWidth: F,
  height: F,
  maxHeight: F,
  top: F,
  right: F,
  bottom: F,
  left: F,
  inset: F,
  insetBlock: F,
  insetBlockStart: F,
  insetBlockEnd: F,
  insetInline: F,
  insetInlineStart: F,
  insetInlineEnd: F,
  padding: F,
  paddingTop: F,
  paddingRight: F,
  paddingBottom: F,
  paddingLeft: F,
  paddingBlock: F,
  paddingBlockStart: F,
  paddingBlockEnd: F,
  paddingInline: F,
  paddingInlineStart: F,
  paddingInlineEnd: F,
  margin: F,
  marginTop: F,
  marginRight: F,
  marginBottom: F,
  marginLeft: F,
  marginBlock: F,
  marginBlockStart: F,
  marginBlockEnd: F,
  marginInline: F,
  marginInlineStart: F,
  marginInlineEnd: F,
  backgroundPositionX: F,
  backgroundPositionY: F,
  ...PR,
  zIndex: Fm,
  fillOpacity: ns,
  strokeOpacity: ns,
  numOctaves: Fm
}
, TR = {
  ...ih,
  color: Ce,
  backgroundColor: Ce,
  outlineColor: Ce,
  fill: Ce,
  stroke: Ce,
  borderColor: Ce,
  borderTopColor: Ce,
  borderRightColor: Ce,
  borderBottomColor: Ce,
  borderLeftColor: Ce,
  filter: ud,
  WebkitFilter: ud
}
, Lw = e => TR[e];
function Ow(e, t) {
  let n = Lw(e);
  return n !== ud && (n = cr),
  n.getAnimatableNone ? n.getAnimatableNone(t) : void 0
}
const AR = new Set(["auto", "none", "0"]);
function NR(e, t, n) {
  let r = 0, i;
  for (; r < e.length && !i; ) {
      const o = e[r];
      typeof o == "string" && !AR.has(o) && rs(o).values.length && (i = e[r]),
      r++
  }
  if (i && n)
      for (const o of t)
          e[o] = Ow(n, i)
}
class RR extends Jf {
  constructor(t, n, r, i, o) {
      super(t, n, r, i, o, !0)
  }
  readKeyframes() {
      const {unresolvedKeyframes: t, element: n, name: r} = this;
      if (!n || !n.current)
          return;
      super.readKeyframes();
      for (let u = 0; u < t.length; u++) {
          let d = t[u];
          if (typeof d == "string" && (d = d.trim(),
          Hf(d))) {
              const f = Aw(d, n.current);
              f !== void 0 && (t[u] = f),
              u === t.length - 1 && (this.finalKeyframe = d)
          }
      }
      if (this.resolveNoneKeyframes(),
      !Nw.has(r) || t.length !== 2)
          return;
      const [i,o] = t
        , s = Vm(i)
        , a = Vm(o)
        , l = Em(i)
        , c = Em(o);
      if (l !== c && qn[r]) {
          this.needsMeasurement = !0;
          return
      }
      if (s !== a)
          if (Im(s) && Im(a))
              for (let u = 0; u < t.length; u++) {
                  const d = t[u];
                  typeof d == "string" && (t[u] = parseFloat(d))
              }
          else
              qn[r] && (this.needsMeasurement = !0)
  }
  resolveNoneKeyframes() {
      const {unresolvedKeyframes: t, name: n} = this
        , r = [];
      for (let i = 0; i < t.length; i++)
          (t[i] === null || SR(t[i])) && r.push(i);
      r.length && NR(t, r, n)
  }
  measureInitialState() {
      const {element: t, unresolvedKeyframes: n, name: r} = this;
      if (!t || !t.current)
          return;
      r === "height" && (this.suspendedScrollY = window.pageYOffset),
      this.measuredOrigin = qn[r](t.measureViewportBox(), window.getComputedStyle(t.current)),
      n[0] = this.measuredOrigin;
      const i = n[n.length - 1];
      i !== void 0 && t.getValue(r, i).jump(i, !1)
  }
  measureEndState() {
      var a;
      const {element: t, name: n, unresolvedKeyframes: r} = this;
      if (!t || !t.current)
          return;
      const i = t.getValue(n);
      i && i.jump(this.measuredOrigin, !1);
      const o = r.length - 1
        , s = r[o];
      r[o] = qn[n](t.measureViewportBox(), window.getComputedStyle(t.current)),
      s !== null && this.finalKeyframe === void 0 && (this.finalKeyframe = s),
      (a = this.removedTransforms) != null && a.length && this.removedTransforms.forEach( ([l,c]) => {
          t.getValue(l).set(c)
      }
      ),
      this.resolveNoneKeyframes()
  }
}
function zw(e, t, n) {
  if (e instanceof EventTarget)
      return [e];
  if (typeof e == "string") {
      const i = document.querySelectorAll(e);
      return i ? Array.from(i) : []
  }
  return Array.from(e)
}
const _w = (e, t) => t && typeof e == "number" ? t.transform(e) : e;
function Vw(e) {
  return Qx(e) && "offsetHeight"in e
}
const {schedule: oh, cancel: TI} = lw(queueMicrotask, !1)
, Rt = {
  x: !1,
  y: !1
};
function Fw() {
  return Rt.x || Rt.y
}
function jR(e) {
  return e === "x" || e === "y" ? Rt[e] ? null : (Rt[e] = !0,
  () => {
      Rt[e] = !1
  }
  ) : Rt.x || Rt.y ? null : (Rt.x = Rt.y = !0,
  () => {
      Rt.x = Rt.y = !1
  }
  )
}
function Bw(e, t) {
  const n = zw(e)
    , r = new AbortController
    , i = {
      passive: !0,
      ...t,
      signal: r.signal
  };
  return [n, i, () => r.abort()]
}
function Bm(e) {
  return !(e.pointerType === "touch" || Fw())
}
function MR(e, t, n={}) {
  const [r,i,o] = Bw(e, n)
    , s = a => {
      if (!Bm(a))
          return;
      const {target: l} = a
        , c = t(l, a);
      if (typeof c != "function" || !l)
          return;
      const u = d => {
          Bm(d) && (c(d),
          l.removeEventListener("pointerleave", u))
      }
      ;
      l.addEventListener("pointerleave", u, i)
  }
  ;
  return r.forEach(a => {
      a.addEventListener("pointerenter", s, i)
  }
  ),
  o
}
const $w = (e, t) => t ? e === t ? !0 : $w(e, t.parentElement) : !1
, sh = e => e.pointerType === "mouse" ? typeof e.button != "number" || e.button <= 0 : e.isPrimary !== !1
, DR = new Set(["BUTTON", "INPUT", "SELECT", "TEXTAREA", "A"]);
function Uw(e) {
  return DR.has(e.tagName) || e.isContentEditable === !0
}
const pa = new WeakSet;
function $m(e) {
  return t => {
      t.key === "Enter" && e(t)
  }
}
function Rc(e, t) {
  e.dispatchEvent(new PointerEvent("pointer" + t,{
      isPrimary: !0,
      bubbles: !0
  }))
}
const IR = (e, t) => {
  const n = e.currentTarget;
  if (!n)
      return;
  const r = $m( () => {
      if (pa.has(n))
          return;
      Rc(n, "down");
      const i = $m( () => {
          Rc(n, "up")
      }
      )
        , o = () => Rc(n, "cancel");
      n.addEventListener("keyup", i, t),
      n.addEventListener("blur", o, t)
  }
  );
  n.addEventListener("keydown", r, t),
  n.addEventListener("blur", () => n.removeEventListener("keydown", r), t)
}
;
function Um(e) {
  return sh(e) && !Fw()
}
function LR(e, t, n={}) {
  const [r,i,o] = Bw(e, n)
    , s = a => {
      const l = a.currentTarget;
      if (!Um(a))
          return;
      pa.add(l);
      const c = t(l, a)
        , u = (p, b) => {
          window.removeEventListener("pointerup", d),
          window.removeEventListener("pointercancel", f),
          pa.has(l) && pa.delete(l),
          Um(p) && typeof c == "function" && c(p, {
              success: b
          })
      }
        , d = p => {
          u(p, l === window || l === document || n.useGlobalTarget || $w(l, p.target))
      }
        , f = p => {
          u(p, !1)
      }
      ;
      window.addEventListener("pointerup", d, i),
      window.addEventListener("pointercancel", f, i)
  }
  ;
  return r.forEach(a => {
      (n.useGlobalTarget ? window : a).addEventListener("pointerdown", s, i),
      Vw(a) && (a.addEventListener("focus", c => IR(c, i)),
      !Uw(a) && !a.hasAttribute("tabindex") && (a.tabIndex = 0))
  }
  ),
  o
}
function Ww(e) {
  return Qx(e) && "ownerSVGElement"in e
}
function OR(e) {
  return Ww(e) && e.tagName === "svg"
}
const zR = [...Iw, Ce, cr]
, _R = e => zR.find(Dw(e))
, Wm = () => ({
  translate: 0,
  scale: 1,
  origin: 0,
  originPoint: 0
})
, ui = () => ({
  x: Wm(),
  y: Wm()
})
, Hm = () => ({
  min: 0,
  max: 0
})
, Ee = () => ({
  x: Hm(),
  y: Hm()
})
, dd = {
  current: null
}
, Hw = {
  current: !1
}
, VR = typeof window < "u";
function FR() {
  if (Hw.current = !0,
  !!VR)
      if (window.matchMedia) {
          const e = window.matchMedia("(prefers-reduced-motion)")
            , t = () => dd.current = e.matches;
          e.addEventListener("change", t),
          t()
      } else
          dd.current = !1
}
const BR = new WeakMap;
function Ml(e) {
  return e !== null && typeof e == "object" && typeof e.start == "function"
}
function is(e) {
  return typeof e == "string" || Array.isArray(e)
}
const ah = ["animate", "whileInView", "whileFocus", "whileHover", "whileTap", "whileDrag", "exit"]
, lh = ["initial", ...ah];
function Dl(e) {
  return Ml(e.animate) || lh.some(t => is(e[t]))
}
function Kw(e) {
  return !!(Dl(e) || e.variants)
}
function $R(e, t, n) {
  for (const r in t) {
      const i = t[r]
        , o = n[r];
      if (Fe(i))
          e.addValue(r, i);
      else if (Fe(o))
          e.addValue(r, $i(i, {
              owner: e
          }));
      else if (o !== i)
          if (e.hasValue(r)) {
              const s = e.getValue(r);
              s.liveStyle === !0 ? s.jump(i) : s.hasAnimated || s.set(i)
          } else {
              const s = e.getStaticValue(r);
              e.addValue(r, $i(s !== void 0 ? s : i, {
                  owner: e
              }))
          }
  }
  for (const r in n)
      t[r] === void 0 && e.removeValue(r);
  return t
}
const Km = ["AnimationStart", "AnimationComplete", "Update", "BeforeLayoutMeasure", "LayoutMeasure", "LayoutAnimationStart", "LayoutAnimationComplete"];
let Za = {};
function qw(e) {
  Za = e
}
function UR() {
  return Za
}
class WR {
  scrapeMotionValuesFromProps(t, n, r) {
      return {}
  }
  constructor({parent: t, props: n, presenceContext: r, reducedMotionConfig: i, blockInitialAnimation: o, visualState: s}, a={}) {
      this.current = null,
      this.children = new Set,
      this.isVariantNode = !1,
      this.isControllingVariants = !1,
      this.shouldReduceMotion = null,
      this.values = new Map,
      this.KeyframeResolver = Jf,
      this.features = {},
      this.valueSubscriptions = new Map,
      this.prevMotionValues = {},
      this.events = {},
      this.propEventSubscriptions = {},
      this.notifyUpdate = () => this.notify("Update", this.latestValues),
      this.render = () => {
          this.current && (this.triggerBuild(),
          this.renderInstance(this.current, this.renderState, this.props.style, this.projection))
      }
      ,
      this.renderScheduledAt = 0,
      this.scheduleRender = () => {
          const f = Ke.now();
          this.renderScheduledAt < f && (this.renderScheduledAt = f,
          ue.render(this.render, !1, !0))
      }
      ;
      const {latestValues: l, renderState: c} = s;
      this.latestValues = l,
      this.baseTarget = {
          ...l
      },
      this.initialValues = n.initial ? {
          ...l
      } : {},
      this.renderState = c,
      this.parent = t,
      this.props = n,
      this.presenceContext = r,
      this.depth = t ? t.depth + 1 : 0,
      this.reducedMotionConfig = i,
      this.options = a,
      this.blockInitialAnimation = !!o,
      this.isControllingVariants = Dl(n),
      this.isVariantNode = Kw(n),
      this.isVariantNode && (this.variantChildren = new Set),
      this.manuallyAnimateOnMount = !!(t && t.current);
      const {willChange: u, ...d} = this.scrapeMotionValuesFromProps(n, {}, this);
      for (const f in d) {
          const p = d[f];
          l[f] !== void 0 && Fe(p) && p.set(l[f])
      }
  }
  mount(t) {
      var n;
      this.current = t,
      BR.set(t, this),
      this.projection && !this.projection.instance && this.projection.mount(t),
      this.parent && this.isVariantNode && !this.isControllingVariants && (this.removeFromVariantTree = this.parent.addVariantChild(this)),
      this.values.forEach( (r, i) => this.bindToMotionValue(i, r)),
      this.reducedMotionConfig === "never" ? this.shouldReduceMotion = !1 : this.reducedMotionConfig === "always" ? this.shouldReduceMotion = !0 : (Hw.current || FR(),
      this.shouldReduceMotion = dd.current),
      (n = this.parent) == null || n.addChild(this),
      this.update(this.props, this.presenceContext)
  }
  unmount() {
      var t;
      this.projection && this.projection.unmount(),
      lr(this.notifyUpdate),
      lr(this.render),
      this.valueSubscriptions.forEach(n => n()),
      this.valueSubscriptions.clear(),
      this.removeFromVariantTree && this.removeFromVariantTree(),
      (t = this.parent) == null || t.removeChild(this);
      for (const n in this.events)
          this.events[n].clear();
      for (const n in this.features) {
          const r = this.features[n];
          r && (r.unmount(),
          r.isMounted = !1)
      }
      this.current = null
  }
  addChild(t) {
      this.children.add(t),
      this.enteringChildren ?? (this.enteringChildren = new Set),
      this.enteringChildren.add(t)
  }
  removeChild(t) {
      this.children.delete(t),
      this.enteringChildren && this.enteringChildren.delete(t)
  }
  bindToMotionValue(t, n) {
      this.valueSubscriptions.has(t) && this.valueSubscriptions.get(t)();
      const r = Xi.has(t);
      r && this.onBindTransform && this.onBindTransform();
      const i = n.on("change", s => {
          this.latestValues[t] = s,
          this.props.onUpdate && ue.preRender(this.notifyUpdate),
          r && this.projection && (this.projection.isTransformDirty = !0),
          this.scheduleRender()
      }
      );
      let o;
      typeof window < "u" && window.MotionCheckAppearSync && (o = window.MotionCheckAppearSync(this, t, n)),
      this.valueSubscriptions.set(t, () => {
          i(),
          o && o(),
          n.owner && n.stop()
      }
      )
  }
  sortNodePosition(t) {
      return !this.current || !this.sortInstanceNodePosition || this.type !== t.type ? 0 : this.sortInstanceNodePosition(this.current, t.current)
  }
  updateFeatures() {
      let t = "animation";
      for (t in Za) {
          const n = Za[t];
          if (!n)
              continue;
          const {isEnabled: r, Feature: i} = n;
          if (!this.features[t] && i && r(this.props) && (this.features[t] = new i(this)),
          this.features[t]) {
              const o = this.features[t];
              o.isMounted ? o.update() : (o.mount(),
              o.isMounted = !0)
          }
      }
  }
  triggerBuild() {
      this.build(this.renderState, this.latestValues, this.props)
  }
  measureViewportBox() {
      return this.current ? this.measureInstanceViewportBox(this.current, this.props) : Ee()
  }
  getStaticValue(t) {
      return this.latestValues[t]
  }
  setStaticValue(t, n) {
      this.latestValues[t] = n
  }
  update(t, n) {
      (t.transformTemplate || this.props.transformTemplate) && this.scheduleRender(),
      this.prevProps = this.props,
      this.props = t,
      this.prevPresenceContext = this.presenceContext,
      this.presenceContext = n;
      for (let r = 0; r < Km.length; r++) {
          const i = Km[r];
          this.propEventSubscriptions[i] && (this.propEventSubscriptions[i](),
          delete this.propEventSubscriptions[i]);
          const o = "on" + i
            , s = t[o];
          s && (this.propEventSubscriptions[i] = this.on(i, s))
      }
      this.prevMotionValues = $R(this, this.scrapeMotionValuesFromProps(t, this.prevProps || {}, this), this.prevMotionValues),
      this.handleChildMotionValue && this.handleChildMotionValue()
  }
  getProps() {
      return this.props
  }
  getVariant(t) {
      return this.props.variants ? this.props.variants[t] : void 0
  }
  getDefaultTransition() {
      return this.props.transition
  }
  getTransformPagePoint() {
      return this.props.transformPagePoint
  }
  getClosestVariantNode() {
      return this.isVariantNode ? this : this.parent ? this.parent.getClosestVariantNode() : void 0
  }
  addVariantChild(t) {
      const n = this.getClosestVariantNode();
      if (n)
          return n.variantChildren && n.variantChildren.add(t),
          () => n.variantChildren.delete(t)
  }
  addValue(t, n) {
      const r = this.values.get(t);
      n !== r && (r && this.removeValue(t),
      this.bindToMotionValue(t, n),
      this.values.set(t, n),
      this.latestValues[t] = n.get())
  }
  removeValue(t) {
      this.values.delete(t);
      const n = this.valueSubscriptions.get(t);
      n && (n(),
      this.valueSubscriptions.delete(t)),
      delete this.latestValues[t],
      this.removeValueFromRenderState(t, this.renderState)
  }
  hasValue(t) {
      return this.values.has(t)
  }
  getValue(t, n) {
      if (this.props.values && this.props.values[t])
          return this.props.values[t];
      let r = this.values.get(t);
      return r === void 0 && n !== void 0 && (r = $i(n === null ? void 0 : n, {
          owner: this
      }),
      this.addValue(t, r)),
      r
  }
  readValue(t, n) {
      let r = this.latestValues[t] !== void 0 || !this.current ? this.latestValues[t] : this.getBaseTargetFromProps(this.props, t) ?? this.readValueFromInstance(this.current, t, this.options);
      return r != null && (typeof r == "string" && (Gx(r) || Yx(r)) ? r = parseFloat(r) : !_R(r) && cr.test(n) && (r = Ow(t, n)),
      this.setBaseTarget(t, Fe(r) ? r.get() : r)),
      Fe(r) ? r.get() : r
  }
  setBaseTarget(t, n) {
      this.baseTarget[t] = n
  }
  getBaseTarget(t) {
      var o;
      const {initial: n} = this.props;
      let r;
      if (typeof n == "string" || typeof n == "object") {
          const s = nh(this.props, n, (o = this.presenceContext) == null ? void 0 : o.custom);
          s && (r = s[t])
      }
      if (n && r !== void 0)
          return r;
      const i = this.getBaseTargetFromProps(this.props, t);
      return i !== void 0 && !Fe(i) ? i : this.initialValues[t] !== void 0 && r === void 0 ? void 0 : this.baseTarget[t]
  }
  on(t, n) {
      return this.events[t] || (this.events[t] = new $f),
      this.events[t].add(n)
  }
  notify(t, ...n) {
      this.events[t] && this.events[t].notify(...n)
  }
  scheduleRenderMicrotask() {
      oh.render(this.render)
  }
}
class Gw extends WR {
  constructor() {
      super(...arguments),
      this.KeyframeResolver = RR
  }
  sortInstanceNodePosition(t, n) {
      return t.compareDocumentPosition(n) & 2 ? 1 : -1
  }
  getBaseTargetFromProps(t, n) {
      const r = t.style;
      return r ? r[n] : void 0
  }
  removeValueFromRenderState(t, {vars: n, style: r}) {
      delete n[t],
      delete r[t]
  }
  handleChildMotionValue() {
      this.childSubscription && (this.childSubscription(),
      delete this.childSubscription);
      const {children: t} = this.props;
      Fe(t) && (this.childSubscription = t.on("change", n => {
          this.current && (this.current.textContent = `${n}`)
      }
      ))
  }
}
class pr {
  constructor(t) {
      this.isMounted = !1,
      this.node = t
  }
  update() {}
}
function Qw({top: e, left: t, right: n, bottom: r}) {
  return {
      x: {
          min: t,
          max: n
      },
      y: {
          min: e,
          max: r
      }
  }
}
function HR({x: e, y: t}) {
  return {
      top: t.min,
      right: e.max,
      bottom: t.max,
      left: e.min
  }
}
function KR(e, t) {
  if (!t)
      return e;
  const n = t({
      x: e.left,
      y: e.top
  })
    , r = t({
      x: e.right,
      y: e.bottom
  });
  return {
      top: n.y,
      left: n.x,
      bottom: r.y,
      right: r.x
  }
}
function jc(e) {
  return e === void 0 || e === 1
}
function fd({scale: e, scaleX: t, scaleY: n}) {
  return !jc(e) || !jc(t) || !jc(n)
}
function br(e) {
  return fd(e) || Yw(e) || e.z || e.rotate || e.rotateX || e.rotateY || e.skewX || e.skewY
}
function Yw(e) {
  return qm(e.x) || qm(e.y)
}
function qm(e) {
  return e && e !== "0%"
}
function Xa(e, t, n) {
  const r = e - n
    , i = t * r;
  return n + i
}
function Gm(e, t, n, r, i) {
  return i !== void 0 && (e = Xa(e, i, r)),
  Xa(e, n, r) + t
}
function hd(e, t=0, n=1, r, i) {
  e.min = Gm(e.min, t, n, r, i),
  e.max = Gm(e.max, t, n, r, i)
}
function Zw(e, {x: t, y: n}) {
  hd(e.x, t.translate, t.scale, t.originPoint),
  hd(e.y, n.translate, n.scale, n.originPoint)
}
const Qm = .999999999999
, Ym = 1.0000000000001;
function qR(e, t, n, r=!1) {
  const i = n.length;
  if (!i)
      return;
  t.x = t.y = 1;
  let o, s;
  for (let a = 0; a < i; a++) {
      o = n[a],
      s = o.projectionDelta;
      const {visualElement: l} = o.options;
      l && l.props.style && l.props.style.display === "contents" || (r && o.options.layoutScroll && o.scroll && o !== o.root && fi(e, {
          x: -o.scroll.offset.x,
          y: -o.scroll.offset.y
      }),
      s && (t.x *= s.x.scale,
      t.y *= s.y.scale,
      Zw(e, s)),
      r && br(o.latestValues) && fi(e, o.latestValues))
  }
  t.x < Ym && t.x > Qm && (t.x = 1),
  t.y < Ym && t.y > Qm && (t.y = 1)
}
function di(e, t) {
  e.min = e.min + t,
  e.max = e.max + t
}
function Zm(e, t, n, r, i=.5) {
  const o = me(e.min, e.max, i);
  hd(e, t, n, o, r)
}
function fi(e, t) {
  Zm(e.x, t.x, t.scaleX, t.scale, t.originX),
  Zm(e.y, t.y, t.scaleY, t.scale, t.originY)
}
function Xw(e, t) {
  return Qw(KR(e.getBoundingClientRect(), t))
}
function GR(e, t, n) {
  const r = Xw(e, n)
    , {scroll: i} = t;
  return i && (di(r.x, i.offset.x),
  di(r.y, i.offset.y)),
  r
}
const QR = {
  x: "translateX",
  y: "translateY",
  z: "translateZ",
  transformPerspective: "perspective"
}
, YR = Zi.length;
function ZR(e, t, n) {
  let r = ""
    , i = !0;
  for (let o = 0; o < YR; o++) {
      const s = Zi[o]
        , a = e[s];
      if (a === void 0)
          continue;
      let l = !0;
      if (typeof a == "number" ? l = a === (s.startsWith("scale") ? 1 : 0) : l = parseFloat(a) === 0,
      !l || n) {
          const c = _w(a, ih[s]);
          if (!l) {
              i = !1;
              const u = QR[s] || s;
              r += `${u}(${c}) `
          }
          n && (t[s] = c)
      }
  }
  return r = r.trim(),
  n ? r = n(t, i ? "" : r) : i && (r = "none"),
  r
}
function ch(e, t, n) {
  const {style: r, vars: i, transformOrigin: o} = e;
  let s = !1
    , a = !1;
  for (const l in t) {
      const c = t[l];
      if (Xi.has(l)) {
          s = !0;
          continue
      } else if (uw(l)) {
          i[l] = c;
          continue
      } else {
          const u = _w(c, ih[l]);
          l.startsWith("origin") ? (a = !0,
          o[l] = u) : r[l] = u
      }
  }
  if (t.transform || (s || n ? r.transform = ZR(t, e.transform, n) : r.transform && (r.transform = "none")),
  a) {
      const {originX: l="50%", originY: c="50%", originZ: u=0} = o;
      r.transformOrigin = `${l} ${c} ${u}`
  }
}
function Jw(e, {style: t, vars: n}, r, i) {
  const o = e.style;
  let s;
  for (s in t)
      o[s] = t[s];
  i == null || i.applyProjectionStyles(o, r);
  for (s in n)
      o.setProperty(s, n[s])
}
function Xm(e, t) {
  return t.max === t.min ? 0 : e / (t.max - t.min) * 100
}
const ho = {
  correct: (e, t) => {
      if (!t.target)
          return e;
      if (typeof e == "string")
          if (F.test(e))
              e = parseFloat(e);
          else
              return e;
      const n = Xm(e, t.target.x)
        , r = Xm(e, t.target.y);
      return `${n}% ${r}%`
  }
}
, XR = {
  correct: (e, {treeScale: t, projectionDelta: n}) => {
      const r = e
        , i = cr.parse(e);
      if (i.length > 5)
          return r;
      const o = cr.createTransformer(e)
        , s = typeof i[0] != "number" ? 1 : 0
        , a = n.x.scale * t.x
        , l = n.y.scale * t.y;
      i[0 + s] /= a,
      i[1 + s] /= l;
      const c = me(a, l, .5);
      return typeof i[2 + s] == "number" && (i[2 + s] /= c),
      typeof i[3 + s] == "number" && (i[3 + s] /= c),
      o(i)
  }
}
, pd = {
  borderRadius: {
      ...ho,
      applyTo: ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius"]
  },
  borderTopLeftRadius: ho,
  borderTopRightRadius: ho,
  borderBottomLeftRadius: ho,
  borderBottomRightRadius: ho,
  boxShadow: XR
};
function e1(e, {layout: t, layoutId: n}) {
  return Xi.has(e) || e.startsWith("origin") || (t || n !== void 0) && (!!pd[e] || e === "opacity")
}
function uh(e, t, n) {
  var s;
  const r = e.style
    , i = t == null ? void 0 : t.style
    , o = {};
  if (!r)
      return o;
  for (const a in r)
      (Fe(r[a]) || i && Fe(i[a]) || e1(a, e) || ((s = n == null ? void 0 : n.getValue(a)) == null ? void 0 : s.liveStyle) !== void 0) && (o[a] = r[a]);
  return o
}
function JR(e) {
  return window.getComputedStyle(e)
}
class ej extends Gw {
  constructor() {
      super(...arguments),
      this.type = "html",
      this.renderInstance = Jw
  }
  readValueFromInstance(t, n) {
      var r;
      if (Xi.has(n))
          return (r = this.projection) != null && r.isProjecting ? td(n) : RN(t, n);
      {
          const i = JR(t)
            , o = (uw(n) ? i.getPropertyValue(n) : i[n]) || 0;
          return typeof o == "string" ? o.trim() : o
      }
  }
  measureInstanceViewportBox(t, {transformPagePoint: n}) {
      return Xw(t, n)
  }
  build(t, n, r) {
      ch(t, n, r.transformTemplate)
  }
  scrapeMotionValuesFromProps(t, n, r) {
      return uh(t, n, r)
  }
}
const tj = {
  offset: "stroke-dashoffset",
  array: "stroke-dasharray"
}
, nj = {
  offset: "strokeDashoffset",
  array: "strokeDasharray"
};
function rj(e, t, n=1, r=0, i=!0) {
  e.pathLength = 1;
  const o = i ? tj : nj;
  e[o.offset] = F.transform(-r);
  const s = F.transform(t)
    , a = F.transform(n);
  e[o.array] = `${s} ${a}`
}
const ij = ["offsetDistance", "offsetPath", "offsetRotate", "offsetAnchor"];
function t1(e, {attrX: t, attrY: n, attrScale: r, pathLength: i, pathSpacing: o=1, pathOffset: s=0, ...a}, l, c, u) {
  if (ch(e, a, c),
  l) {
      e.style.viewBox && (e.attrs.viewBox = e.style.viewBox);
      return
  }
  e.attrs = e.style,
  e.style = {};
  const {attrs: d, style: f} = e;
  d.transform && (f.transform = d.transform,
  delete d.transform),
  (f.transform || d.transformOrigin) && (f.transformOrigin = d.transformOrigin ?? "50% 50%",
  delete d.transformOrigin),
  f.transform && (f.transformBox = (u == null ? void 0 : u.transformBox) ?? "fill-box",
  delete d.transformBox);
  for (const p of ij)
      d[p] !== void 0 && (f[p] = d[p],
      delete d[p]);
  t !== void 0 && (d.x = t),
  n !== void 0 && (d.y = n),
  r !== void 0 && (d.scale = r),
  i !== void 0 && rj(d, i, o, s, !1)
}
const n1 = new Set(["baseFrequency", "diffuseConstant", "kernelMatrix", "kernelUnitLength", "keySplines", "keyTimes", "limitingConeAngle", "markerHeight", "markerWidth", "numOctaves", "targetX", "targetY", "surfaceScale", "specularConstant", "specularExponent", "stdDeviation", "tableValues", "viewBox", "gradientTransform", "pathLength", "startOffset", "textLength", "lengthAdjust"])
, r1 = e => typeof e == "string" && e.toLowerCase() === "svg";
function oj(e, t, n, r) {
  Jw(e, t, void 0, r);
  for (const i in t.attrs)
      e.setAttribute(n1.has(i) ? i : rh(i), t.attrs[i])
}
function i1(e, t, n) {
  const r = uh(e, t, n);
  for (const i in e)
      if (Fe(e[i]) || Fe(t[i])) {
          const o = Zi.indexOf(i) !== -1 ? "attr" + i.charAt(0).toUpperCase() + i.substring(1) : i;
          r[o] = e[i]
      }
  return r
}
class sj extends Gw {
  constructor() {
      super(...arguments),
      this.type = "svg",
      this.isSVGTag = !1,
      this.measureInstanceViewportBox = Ee
  }
  getBaseTargetFromProps(t, n) {
      return t[n]
  }
  readValueFromInstance(t, n) {
      if (Xi.has(n)) {
          const r = Lw(n);
          return r && r.default || 0
      }
      return n = n1.has(n) ? n : rh(n),
      t.getAttribute(n)
  }
  scrapeMotionValuesFromProps(t, n, r) {
      return i1(t, n, r)
  }
  build(t, n, r) {
      t1(t, n, this.isSVGTag, r.transformTemplate, r.style)
  }
  renderInstance(t, n, r, i) {
      oj(t, n, r, i)
  }
  mount(t) {
      this.isSVGTag = r1(t.tagName),
      super.mount(t)
  }
}
const aj = lh.length;
function o1(e) {
  if (!e)
      return;
  if (!e.isControllingVariants) {
      const n = e.parent ? o1(e.parent) || {} : {};
      return e.props.initial !== void 0 && (n.initial = e.props.initial),
      n
  }
  const t = {};
  for (let n = 0; n < aj; n++) {
      const r = lh[n]
        , i = e.props[r];
      (is(i) || i === !1) && (t[r] = i)
  }
  return t
}
function s1(e, t) {
  if (!Array.isArray(t))
      return !1;
  const n = t.length;
  if (n !== e.length)
      return !1;
  for (let r = 0; r < n; r++)
      if (t[r] !== e[r])
          return !1;
  return !0
}
const lj = [...ah].reverse()
, cj = ah.length;
function uj(e) {
  return t => Promise.all(t.map( ({animation: n, options: r}) => wR(e, n, r)))
}
function dj(e) {
  let t = uj(e)
    , n = Jm()
    , r = !0;
  const i = l => (c, u) => {
      var f;
      const d = Si(e, u, l === "exit" ? (f = e.presenceContext) == null ? void 0 : f.custom : void 0);
      if (d) {
          const {transition: p, transitionEnd: b, ...y} = d;
          c = {
              ...c,
              ...y,
              ...b
          }
      }
      return c
  }
  ;
  function o(l) {
      t = l(e)
  }
  function s(l) {
      const {props: c} = e
        , u = o1(e.parent) || {}
        , d = []
        , f = new Set;
      let p = {}
        , b = 1 / 0;
      for (let w = 0; w < cj; w++) {
          const m = lj[w]
            , g = n[m]
            , v = c[m] !== void 0 ? c[m] : u[m]
            , S = is(v)
            , C = m === l ? g.isActive : null;
          C === !1 && (b = w);
          let k = v === u[m] && v !== c[m] && S;
          if (k && r && e.manuallyAnimateOnMount && (k = !1),
          g.protectedKeys = {
              ...p
          },
          !g.isActive && C === null || !v && !g.prevProp || Ml(v) || typeof v == "boolean")
              continue;
          const E = fj(g.prevProp, v);
          let P = E || m === l && g.isActive && !k && S || w > b && S
            , j = !1;
          const R = Array.isArray(v) ? v : [v];
          let z = R.reduce(i(m), {});
          C === !1 && (z = {});
          const {prevResolvedValues: L={}} = g
            , W = {
              ...L,
              ...z
          }
            , I = V => {
              P = !0,
              f.has(V) && (j = !0,
              f.delete(V)),
              g.needsAnimating[V] = !0;
              const T = e.getValue(V);
              T && (T.liveStyle = !1)
          }
          ;
          for (const V in W) {
              const T = z[V]
                , N = L[V];
              if (p.hasOwnProperty(V))
                  continue;
              let O = !1;
              ad(T) && ad(N) ? O = !s1(T, N) : O = T !== N,
              O ? T != null ? I(V) : f.add(V) : T !== void 0 && f.has(V) ? I(V) : g.protectedKeys[V] = !0
          }
          g.prevProp = v,
          g.prevResolvedValues = z,
          g.isActive && (p = {
              ...p,
              ...z
          }),
          r && e.blockInitialAnimation && (P = !1);
          const K = k && E;
          P && (!K || j) && d.push(...R.map(V => {
              const T = {
                  type: m
              };
              if (typeof V == "string" && r && !K && e.manuallyAnimateOnMount && e.parent) {
                  const {parent: N} = e
                    , O = Si(N, V);
                  if (N.enteringChildren && O) {
                      const {delayChildren: H} = O.transition || {};
                      T.delay = Tw(N.enteringChildren, e, H)
                  }
              }
              return {
                  animation: V,
                  options: T
              }
          }
          ))
      }
      if (f.size) {
          const w = {};
          if (typeof c.initial != "boolean") {
              const m = Si(e, Array.isArray(c.initial) ? c.initial[0] : c.initial);
              m && m.transition && (w.transition = m.transition)
          }
          f.forEach(m => {
              const g = e.getBaseTarget(m)
                , v = e.getValue(m);
              v && (v.liveStyle = !0),
              w[m] = g ?? null
          }
          ),
          d.push({
              animation: w
          })
      }
      let y = !!d.length;
      return r && (c.initial === !1 || c.initial === c.animate) && !e.manuallyAnimateOnMount && (y = !1),
      r = !1,
      y ? t(d) : Promise.resolve()
  }
  function a(l, c) {
      var d;
      if (n[l].isActive === c)
          return Promise.resolve();
      (d = e.variantChildren) == null || d.forEach(f => {
          var p;
          return (p = f.animationState) == null ? void 0 : p.setActive(l, c)
      }
      ),
      n[l].isActive = c;
      const u = s(l);
      for (const f in n)
          n[f].protectedKeys = {};
      return u
  }
  return {
      animateChanges: s,
      setActive: a,
      setAnimateFunction: o,
      getState: () => n,
      reset: () => {
          n = Jm()
      }
  }
}
function fj(e, t) {
  return typeof t == "string" ? t !== e : Array.isArray(t) ? !s1(t, e) : !1
}
function vr(e=!1) {
  return {
      isActive: e,
      protectedKeys: {},
      needsAnimating: {},
      prevResolvedValues: {}
  }
}
function Jm() {
  return {
      animate: vr(!0),
      whileInView: vr(),
      whileHover: vr(),
      whileTap: vr(),
      whileDrag: vr(),
      whileFocus: vr(),
      exit: vr()
  }
}
function eg(e, t) {
  e.min = t.min,
  e.max = t.max
}
function Nt(e, t) {
  eg(e.x, t.x),
  eg(e.y, t.y)
}
function tg(e, t) {
  e.translate = t.translate,
  e.scale = t.scale,
  e.originPoint = t.originPoint,
  e.origin = t.origin
}
const a1 = 1e-4
, hj = 1 - a1
, pj = 1 + a1
, l1 = .01
, mj = 0 - l1
, gj = 0 + l1;
function qe(e) {
  return e.max - e.min
}
function yj(e, t, n) {
  return Math.abs(e - t) <= n
}
function ng(e, t, n, r=.5) {
  e.origin = r,
  e.originPoint = me(t.min, t.max, e.origin),
  e.scale = qe(n) / qe(t),
  e.translate = me(n.min, n.max, e.origin) - e.originPoint,
  (e.scale >= hj && e.scale <= pj || isNaN(e.scale)) && (e.scale = 1),
  (e.translate >= mj && e.translate <= gj || isNaN(e.translate)) && (e.translate = 0)
}
function Mo(e, t, n, r) {
  ng(e.x, t.x, n.x, r ? r.originX : void 0),
  ng(e.y, t.y, n.y, r ? r.originY : void 0)
}
function rg(e, t, n) {
  e.min = n.min + t.min,
  e.max = e.min + qe(t)
}
function vj(e, t, n) {
  rg(e.x, t.x, n.x),
  rg(e.y, t.y, n.y)
}
function ig(e, t, n) {
  e.min = t.min - n.min,
  e.max = e.min + qe(t)
}
function Ja(e, t, n) {
  ig(e.x, t.x, n.x),
  ig(e.y, t.y, n.y)
}
function og(e, t, n, r, i) {
  return e -= t,
  e = Xa(e, 1 / n, r),
  i !== void 0 && (e = Xa(e, 1 / i, r)),
  e
}
function xj(e, t=0, n=1, r=.5, i, o=e, s=e) {
  if (tn.test(t) && (t = parseFloat(t),
  t = me(s.min, s.max, t / 100) - s.min),
  typeof t != "number")
      return;
  let a = me(o.min, o.max, r);
  e === o && (a -= t),
  e.min = og(e.min, t, n, a, i),
  e.max = og(e.max, t, n, a, i)
}
function sg(e, t, [n,r,i], o, s) {
  xj(e, t[n], t[r], t[i], t.scale, o, s)
}
const wj = ["x", "scaleX", "originX"]
, bj = ["y", "scaleY", "originY"];
function ag(e, t, n, r) {
  sg(e.x, t, wj, n ? n.x : void 0, r ? r.x : void 0),
  sg(e.y, t, bj, n ? n.y : void 0, r ? r.y : void 0)
}
function lg(e) {
  return e.translate === 0 && e.scale === 1
}
function c1(e) {
  return lg(e.x) && lg(e.y)
}
function cg(e, t) {
  return e.min === t.min && e.max === t.max
}
function Sj(e, t) {
  return cg(e.x, t.x) && cg(e.y, t.y)
}
function ug(e, t) {
  return Math.round(e.min) === Math.round(t.min) && Math.round(e.max) === Math.round(t.max)
}
function u1(e, t) {
  return ug(e.x, t.x) && ug(e.y, t.y)
}
function dg(e) {
  return qe(e.x) / qe(e.y)
}
function fg(e, t) {
  return e.translate === t.translate && e.scale === t.scale && e.originPoint === t.originPoint
}
function pt(e) {
  return [e("x"), e("y")]
}
function Cj(e, t, n) {
  let r = "";
  const i = e.x.translate / t.x
    , o = e.y.translate / t.y
    , s = (n == null ? void 0 : n.z) || 0;
  if ((i || o || s) && (r = `translate3d(${i}px, ${o}px, ${s}px) `),
  (t.x !== 1 || t.y !== 1) && (r += `scale(${1 / t.x}, ${1 / t.y}) `),
  n) {
      const {transformPerspective: c, rotate: u, rotateX: d, rotateY: f, skewX: p, skewY: b} = n;
      c && (r = `perspective(${c}px) ${r}`),
      u && (r += `rotate(${u}deg) `),
      d && (r += `rotateX(${d}deg) `),
      f && (r += `rotateY(${f}deg) `),
      p && (r += `skewX(${p}deg) `),
      b && (r += `skewY(${b}deg) `)
  }
  const a = e.x.scale * t.x
    , l = e.y.scale * t.y;
  return (a !== 1 || l !== 1) && (r += `scale(${a}, ${l})`),
  r || "none"
}
const d1 = ["TopLeft", "TopRight", "BottomLeft", "BottomRight"]
, kj = d1.length
, hg = e => typeof e == "string" ? parseFloat(e) : e
, pg = e => typeof e == "number" || F.test(e);
function Ej(e, t, n, r, i, o) {
  i ? (e.opacity = me(0, n.opacity ?? 1, Pj(r)),
  e.opacityExit = me(t.opacity ?? 1, 0, Tj(r))) : o && (e.opacity = me(t.opacity ?? 1, n.opacity ?? 1, r));
  for (let s = 0; s < kj; s++) {
      const a = `border${d1[s]}Radius`;
      let l = mg(t, a)
        , c = mg(n, a);
      if (l === void 0 && c === void 0)
          continue;
      l || (l = 0),
      c || (c = 0),
      l === 0 || c === 0 || pg(l) === pg(c) ? (e[a] = Math.max(me(hg(l), hg(c), r), 0),
      (tn.test(c) || tn.test(l)) && (e[a] += "%")) : e[a] = c
  }
  (t.rotate || n.rotate) && (e.rotate = me(t.rotate || 0, n.rotate || 0, r))
}
function mg(e, t) {
  return e[t] !== void 0 ? e[t] : e.borderRadius
}
const Pj = f1(0, .5, iw)
, Tj = f1(.5, .95, bt);
function f1(e, t, n) {
  return r => r < e ? 0 : r > t ? 1 : n(ts(e, t, r))
}
function Aj(e, t, n) {
  const r = Fe(e) ? e : $i(e);
  return r.start(th("", r, t, n)),
  r.animation
}
function os(e, t, n, r={
  passive: !0
}) {
  return e.addEventListener(t, n, r),
  () => e.removeEventListener(t, n)
}
const Nj = (e, t) => e.depth - t.depth;
class Rj {
  constructor() {
      this.children = [],
      this.isDirty = !1
  }
  add(t) {
      Vf(this.children, t),
      this.isDirty = !0
  }
  remove(t) {
      Ff(this.children, t),
      this.isDirty = !0
  }
  forEach(t) {
      this.isDirty && this.children.sort(Nj),
      this.isDirty = !1,
      this.children.forEach(t)
  }
}
function jj(e, t) {
  const n = Ke.now()
    , r = ({timestamp: i}) => {
      const o = i - n;
      o >= t && (lr(r),
      e(o - t))
  }
  ;
  return ue.setup(r, !0),
  () => lr(r)
}
function ma(e) {
  return Fe(e) ? e.get() : e
}
class Mj {
  constructor() {
      this.members = []
  }
  add(t) {
      Vf(this.members, t),
      t.scheduleRender()
  }
  remove(t) {
      if (Ff(this.members, t),
      t === this.prevLead && (this.prevLead = void 0),
      t === this.lead) {
          const n = this.members[this.members.length - 1];
          n && this.promote(n)
      }
  }
  relegate(t) {
      const n = this.members.findIndex(i => t === i);
      if (n === 0)
          return !1;
      let r;
      for (let i = n; i >= 0; i--) {
          const o = this.members[i];
          if (o.isPresent !== !1) {
              r = o;
              break
          }
      }
      return r ? (this.promote(r),
      !0) : !1
  }
  promote(t, n) {
      const r = this.lead;
      if (t !== r && (this.prevLead = r,
      this.lead = t,
      t.show(),
      r)) {
          r.instance && r.scheduleRender(),
          t.scheduleRender(),
          t.resumeFrom = r,
          n && (t.resumeFrom.preserveOpacity = !0),
          r.snapshot && (t.snapshot = r.snapshot,
          t.snapshot.latestValues = r.animationValues || r.latestValues),
          t.root && t.root.isUpdating && (t.isLayoutDirty = !0);
          const {crossfade: i} = t.options;
          i === !1 && r.hide()
      }
  }
  exitAnimationComplete() {
      this.members.forEach(t => {
          const {options: n, resumingFrom: r} = t;
          n.onExitComplete && n.onExitComplete(),
          r && r.options.onExitComplete && r.options.onExitComplete()
      }
      )
  }
  scheduleRender() {
      this.members.forEach(t => {
          t.instance && t.scheduleRender(!1)
      }
      )
  }
  removeLeadSnapshot() {
      this.lead && this.lead.snapshot && (this.lead.snapshot = void 0)
  }
}
const ga = {
  hasAnimatedSinceResize: !0,
  hasEverUpdated: !1
}
, Mc = ["", "X", "Y", "Z"]
, Dj = 1e3;
let Ij = 0;
function Dc(e, t, n, r) {
  const {latestValues: i} = t;
  i[e] && (n[e] = i[e],
  t.setStaticValue(e, 0),
  r && (r[e] = 0))
}
function h1(e) {
  if (e.hasCheckedOptimisedAppear = !0,
  e.root === e)
      return;
  const {visualElement: t} = e.options;
  if (!t)
      return;
  const n = jw(t);
  if (window.MotionHasOptimisedAnimation(n, "transform")) {
      const {layout: i, layoutId: o} = e.options;
      window.MotionCancelOptimisedAnimation(n, "transform", ue, !(i || o))
  }
  const {parent: r} = e;
  r && !r.hasCheckedOptimisedAppear && h1(r)
}
function p1({attachResizeListener: e, defaultParent: t, measureScroll: n, checkIsScrollRoot: r, resetTransform: i}) {
  return class {
      constructor(s={}, a=t == null ? void 0 : t()) {
          this.id = Ij++,
          this.animationId = 0,
          this.animationCommitId = 0,
          this.children = new Set,
          this.options = {},
          this.isTreeAnimating = !1,
          this.isAnimationBlocked = !1,
          this.isLayoutDirty = !1,
          this.isProjectionDirty = !1,
          this.isSharedProjectionDirty = !1,
          this.isTransformDirty = !1,
          this.updateManuallyBlocked = !1,
          this.updateBlockedByResize = !1,
          this.isUpdating = !1,
          this.isSVG = !1,
          this.needsReset = !1,
          this.shouldResetTransform = !1,
          this.hasCheckedOptimisedAppear = !1,
          this.treeScale = {
              x: 1,
              y: 1
          },
          this.eventHandlers = new Map,
          this.hasTreeAnimated = !1,
          this.layoutVersion = 0,
          this.updateScheduled = !1,
          this.scheduleUpdate = () => this.update(),
          this.projectionUpdateScheduled = !1,
          this.checkUpdateFailed = () => {
              this.isUpdating && (this.isUpdating = !1,
              this.clearAllSnapshots())
          }
          ,
          this.updateProjection = () => {
              this.projectionUpdateScheduled = !1,
              this.nodes.forEach(zj),
              this.nodes.forEach(Bj),
              this.nodes.forEach($j),
              this.nodes.forEach(_j)
          }
          ,
          this.resolvedRelativeTargetAt = 0,
          this.linkedParentVersion = 0,
          this.hasProjected = !1,
          this.isVisible = !0,
          this.animationProgress = 0,
          this.sharedNodes = new Map,
          this.latestValues = s,
          this.root = a ? a.root || a : this,
          this.path = a ? [...a.path, a] : [],
          this.parent = a,
          this.depth = a ? a.depth + 1 : 0;
          for (let l = 0; l < this.path.length; l++)
              this.path[l].shouldResetTransform = !0;
          this.root === this && (this.nodes = new Rj)
      }
      addEventListener(s, a) {
          return this.eventHandlers.has(s) || this.eventHandlers.set(s, new $f),
          this.eventHandlers.get(s).add(a)
      }
      notifyListeners(s, ...a) {
          const l = this.eventHandlers.get(s);
          l && l.notify(...a)
      }
      hasListeners(s) {
          return this.eventHandlers.has(s)
      }
      mount(s) {
          if (this.instance)
              return;
          this.isSVG = Ww(s) && !OR(s),
          this.instance = s;
          const {layoutId: a, layout: l, visualElement: c} = this.options;
          if (c && !c.current && c.mount(s),
          this.root.nodes.add(this),
          this.parent && this.parent.children.add(this),
          this.root.hasTreeAnimated && (l || a) && (this.isLayoutDirty = !0),
          e) {
              let u, d = 0;
              const f = () => this.root.updateBlockedByResize = !1;
              ue.read( () => {
                  d = window.innerWidth
              }
              ),
              e(s, () => {
                  const p = window.innerWidth;
                  p !== d && (d = p,
                  this.root.updateBlockedByResize = !0,
                  u && u(),
                  u = jj(f, 250),
                  ga.hasAnimatedSinceResize && (ga.hasAnimatedSinceResize = !1,
                  this.nodes.forEach(vg)))
              }
              )
          }
          a && this.root.registerSharedNode(a, this),
          this.options.animate !== !1 && c && (a || l) && this.addEventListener("didUpdate", ({delta: u, hasLayoutChanged: d, hasRelativeLayoutChanged: f, layout: p}) => {
              if (this.isTreeAnimationBlocked()) {
                  this.target = void 0,
                  this.relativeTarget = void 0;
                  return
              }
              const b = this.options.transition || c.getDefaultTransition() || qj
                , {onLayoutAnimationStart: y, onLayoutAnimationComplete: w} = c.getProps()
                , m = !this.targetLayout || !u1(this.targetLayout, p)
                , g = !d && f;
              if (this.options.layoutRoot || this.resumeFrom || g || d && (m || !this.currentAnimation)) {
                  this.resumeFrom && (this.resumingFrom = this.resumeFrom,
                  this.resumingFrom.resumingFrom = void 0);
                  const v = {
                      ...eh(b, "layout"),
                      onPlay: y,
                      onComplete: w
                  };
                  (c.shouldReduceMotion || this.options.layoutRoot) && (v.delay = 0,
                  v.type = !1),
                  this.startAnimation(v),
                  this.setAnimationOrigin(u, g)
              } else
                  d || vg(this),
                  this.isLead() && this.options.onExitComplete && this.options.onExitComplete();
              this.targetLayout = p
          }
          )
      }
      unmount() {
          this.options.layoutId && this.willUpdate(),
          this.root.nodes.remove(this);
          const s = this.getStack();
          s && s.remove(this),
          this.parent && this.parent.children.delete(this),
          this.instance = void 0,
          this.eventHandlers.clear(),
          lr(this.updateProjection)
      }
      blockUpdate() {
          this.updateManuallyBlocked = !0
      }
      unblockUpdate() {
          this.updateManuallyBlocked = !1
      }
      isUpdateBlocked() {
          return this.updateManuallyBlocked || this.updateBlockedByResize
      }
      isTreeAnimationBlocked() {
          return this.isAnimationBlocked || this.parent && this.parent.isTreeAnimationBlocked() || !1
      }
      startUpdate() {
          this.isUpdateBlocked() || (this.isUpdating = !0,
          this.nodes && this.nodes.forEach(Uj),
          this.animationId++)
      }
      getTransformTemplate() {
          const {visualElement: s} = this.options;
          return s && s.getProps().transformTemplate
      }
      willUpdate(s=!0) {
          if (this.root.hasTreeAnimated = !0,
          this.root.isUpdateBlocked()) {
              this.options.onExitComplete && this.options.onExitComplete();
              return
          }
          if (window.MotionCancelOptimisedAnimation && !this.hasCheckedOptimisedAppear && h1(this),
          !this.root.isUpdating && this.root.startUpdate(),
          this.isLayoutDirty)
              return;
          this.isLayoutDirty = !0;
          for (let u = 0; u < this.path.length; u++) {
              const d = this.path[u];
              d.shouldResetTransform = !0,
              d.updateScroll("snapshot"),
              d.options.layoutRoot && d.willUpdate(!1)
          }
          const {layoutId: a, layout: l} = this.options;
          if (a === void 0 && !l)
              return;
          const c = this.getTransformTemplate();
          this.prevTransformTemplateValue = c ? c(this.latestValues, "") : void 0,
          this.updateSnapshot(),
          s && this.notifyListeners("willUpdate")
      }
      update() {
          if (this.updateScheduled = !1,
          this.isUpdateBlocked()) {
              this.unblockUpdate(),
              this.clearAllSnapshots(),
              this.nodes.forEach(gg);
              return
          }
          if (this.animationId <= this.animationCommitId) {
              this.nodes.forEach(yg);
              return
          }
          this.animationCommitId = this.animationId,
          this.isUpdating ? (this.isUpdating = !1,
          this.nodes.forEach(Fj),
          this.nodes.forEach(Lj),
          this.nodes.forEach(Oj)) : this.nodes.forEach(yg),
          this.clearAllSnapshots();
          const a = Ke.now();
          je.delta = on(0, 1e3 / 60, a - je.timestamp),
          je.timestamp = a,
          je.isProcessing = !0,
          kc.update.process(je),
          kc.preRender.process(je),
          kc.render.process(je),
          je.isProcessing = !1
      }
      didUpdate() {
          this.updateScheduled || (this.updateScheduled = !0,
          oh.read(this.scheduleUpdate))
      }
      clearAllSnapshots() {
          this.nodes.forEach(Vj),
          this.sharedNodes.forEach(Wj)
      }
      scheduleUpdateProjection() {
          this.projectionUpdateScheduled || (this.projectionUpdateScheduled = !0,
          ue.preRender(this.updateProjection, !1, !0))
      }
      scheduleCheckAfterUnmount() {
          ue.postRender( () => {
              this.isLayoutDirty ? this.root.didUpdate() : this.root.checkUpdateFailed()
          }
          )
      }
      updateSnapshot() {
          this.snapshot || !this.instance || (this.snapshot = this.measure(),
          this.snapshot && !qe(this.snapshot.measuredBox.x) && !qe(this.snapshot.measuredBox.y) && (this.snapshot = void 0))
      }
      updateLayout() {
          if (!this.instance || (this.updateScroll(),
          !(this.options.alwaysMeasureLayout && this.isLead()) && !this.isLayoutDirty))
              return;
          if (this.resumeFrom && !this.resumeFrom.instance)
              for (let l = 0; l < this.path.length; l++)
                  this.path[l].updateScroll();
          const s = this.layout;
          this.layout = this.measure(!1),
          this.layoutVersion++,
          this.layoutCorrected = Ee(),
          this.isLayoutDirty = !1,
          this.projectionDelta = void 0,
          this.notifyListeners("measure", this.layout.layoutBox);
          const {visualElement: a} = this.options;
          a && a.notify("LayoutMeasure", this.layout.layoutBox, s ? s.layoutBox : void 0)
      }
      updateScroll(s="measure") {
          let a = !!(this.options.layoutScroll && this.instance);
          if (this.scroll && this.scroll.animationId === this.root.animationId && this.scroll.phase === s && (a = !1),
          a && this.instance) {
              const l = r(this.instance);
              this.scroll = {
                  animationId: this.root.animationId,
                  phase: s,
                  isRoot: l,
                  offset: n(this.instance),
                  wasRoot: this.scroll ? this.scroll.isRoot : l
              }
          }
      }
      resetTransform() {
          if (!i)
              return;
          const s = this.isLayoutDirty || this.shouldResetTransform || this.options.alwaysMeasureLayout
            , a = this.projectionDelta && !c1(this.projectionDelta)
            , l = this.getTransformTemplate()
            , c = l ? l(this.latestValues, "") : void 0
            , u = c !== this.prevTransformTemplateValue;
          s && this.instance && (a || br(this.latestValues) || u) && (i(this.instance, c),
          this.shouldResetTransform = !1,
          this.scheduleRender())
      }
      measure(s=!0) {
          const a = this.measurePageBox();
          let l = this.removeElementScroll(a);
          return s && (l = this.removeTransform(l)),
          Gj(l),
          {
              animationId: this.root.animationId,
              measuredBox: a,
              layoutBox: l,
              latestValues: {},
              source: this.id
          }
      }
      measurePageBox() {
          var c;
          const {visualElement: s} = this.options;
          if (!s)
              return Ee();
          const a = s.measureViewportBox();
          if (!(((c = this.scroll) == null ? void 0 : c.wasRoot) || this.path.some(Qj))) {
              const {scroll: u} = this.root;
              u && (di(a.x, u.offset.x),
              di(a.y, u.offset.y))
          }
          return a
      }
      removeElementScroll(s) {
          var l;
          const a = Ee();
          if (Nt(a, s),
          (l = this.scroll) != null && l.wasRoot)
              return a;
          for (let c = 0; c < this.path.length; c++) {
              const u = this.path[c]
                , {scroll: d, options: f} = u;
              u !== this.root && d && f.layoutScroll && (d.wasRoot && Nt(a, s),
              di(a.x, d.offset.x),
              di(a.y, d.offset.y))
          }
          return a
      }
      applyTransform(s, a=!1) {
          const l = Ee();
          Nt(l, s);
          for (let c = 0; c < this.path.length; c++) {
              const u = this.path[c];
              !a && u.options.layoutScroll && u.scroll && u !== u.root && fi(l, {
                  x: -u.scroll.offset.x,
                  y: -u.scroll.offset.y
              }),
              br(u.latestValues) && fi(l, u.latestValues)
          }
          return br(this.latestValues) && fi(l, this.latestValues),
          l
      }
      removeTransform(s) {
          const a = Ee();
          Nt(a, s);
          for (let l = 0; l < this.path.length; l++) {
              const c = this.path[l];
              if (!c.instance || !br(c.latestValues))
                  continue;
              fd(c.latestValues) && c.updateSnapshot();
              const u = Ee()
                , d = c.measurePageBox();
              Nt(u, d),
              ag(a, c.latestValues, c.snapshot ? c.snapshot.layoutBox : void 0, u)
          }
          return br(this.latestValues) && ag(a, this.latestValues),
          a
      }
      setTargetDelta(s) {
          this.targetDelta = s,
          this.root.scheduleUpdateProjection(),
          this.isProjectionDirty = !0
      }
      setOptions(s) {
          this.options = {
              ...this.options,
              ...s,
              crossfade: s.crossfade !== void 0 ? s.crossfade : !0
          }
      }
      clearMeasurements() {
          this.scroll = void 0,
          this.layout = void 0,
          this.snapshot = void 0,
          this.prevTransformTemplateValue = void 0,
          this.targetDelta = void 0,
          this.target = void 0,
          this.isLayoutDirty = !1
      }
      forceRelativeParentToResolveTarget() {
          this.relativeParent && this.relativeParent.resolvedRelativeTargetAt !== je.timestamp && this.relativeParent.resolveTargetDelta(!0)
      }
      resolveTargetDelta(s=!1) {
          var p;
          const a = this.getLead();
          this.isProjectionDirty || (this.isProjectionDirty = a.isProjectionDirty),
          this.isTransformDirty || (this.isTransformDirty = a.isTransformDirty),
          this.isSharedProjectionDirty || (this.isSharedProjectionDirty = a.isSharedProjectionDirty);
          const l = !!this.resumingFrom || this !== a;
          if (!(s || l && this.isSharedProjectionDirty || this.isProjectionDirty || (p = this.parent) != null && p.isProjectionDirty || this.attemptToResolveRelativeTarget || this.root.updateBlockedByResize))
              return;
          const {layout: u, layoutId: d} = this.options;
          if (!this.layout || !(u || d))
              return;
          this.resolvedRelativeTargetAt = je.timestamp;
          const f = this.getClosestProjectingParent();
          f && this.linkedParentVersion !== f.layoutVersion && !f.options.layoutRoot && this.removeRelativeTarget(),
          !this.targetDelta && !this.relativeTarget && (f && f.layout ? this.createRelativeTarget(f, this.layout.layoutBox, f.layout.layoutBox) : this.removeRelativeTarget()),
          !(!this.relativeTarget && !this.targetDelta) && (this.target || (this.target = Ee(),
          this.targetWithTransforms = Ee()),
          this.relativeTarget && this.relativeTargetOrigin && this.relativeParent && this.relativeParent.target ? (this.forceRelativeParentToResolveTarget(),
          vj(this.target, this.relativeTarget, this.relativeParent.target)) : this.targetDelta ? (this.resumingFrom ? this.target = this.applyTransform(this.layout.layoutBox) : Nt(this.target, this.layout.layoutBox),
          Zw(this.target, this.targetDelta)) : Nt(this.target, this.layout.layoutBox),
          this.attemptToResolveRelativeTarget && (this.attemptToResolveRelativeTarget = !1,
          f && !!f.resumingFrom == !!this.resumingFrom && !f.options.layoutScroll && f.target && this.animationProgress !== 1 ? this.createRelativeTarget(f, this.target, f.target) : this.relativeParent = this.relativeTarget = void 0))
      }
      getClosestProjectingParent() {
          if (!(!this.parent || fd(this.parent.latestValues) || Yw(this.parent.latestValues)))
              return this.parent.isProjecting() ? this.parent : this.parent.getClosestProjectingParent()
      }
      isProjecting() {
          return !!((this.relativeTarget || this.targetDelta || this.options.layoutRoot) && this.layout)
      }
      createRelativeTarget(s, a, l) {
          this.relativeParent = s,
          this.linkedParentVersion = s.layoutVersion,
          this.forceRelativeParentToResolveTarget(),
          this.relativeTarget = Ee(),
          this.relativeTargetOrigin = Ee(),
          Ja(this.relativeTargetOrigin, a, l),
          Nt(this.relativeTarget, this.relativeTargetOrigin)
      }
      removeRelativeTarget() {
          this.relativeParent = this.relativeTarget = void 0
      }
      calcProjection() {
          var b;
          const s = this.getLead()
            , a = !!this.resumingFrom || this !== s;
          let l = !0;
          if ((this.isProjectionDirty || (b = this.parent) != null && b.isProjectionDirty) && (l = !1),
          a && (this.isSharedProjectionDirty || this.isTransformDirty) && (l = !1),
          this.resolvedRelativeTargetAt === je.timestamp && (l = !1),
          l)
              return;
          const {layout: c, layoutId: u} = this.options;
          if (this.isTreeAnimating = !!(this.parent && this.parent.isTreeAnimating || this.currentAnimation || this.pendingAnimation),
          this.isTreeAnimating || (this.targetDelta = this.relativeTarget = void 0),
          !this.layout || !(c || u))
              return;
          Nt(this.layoutCorrected, this.layout.layoutBox);
          const d = this.treeScale.x
            , f = this.treeScale.y;
          qR(this.layoutCorrected, this.treeScale, this.path, a),
          s.layout && !s.target && (this.treeScale.x !== 1 || this.treeScale.y !== 1) && (s.target = s.layout.layoutBox,
          s.targetWithTransforms = Ee());
          const {target: p} = s;
          if (!p) {
              this.prevProjectionDelta && (this.createProjectionDeltas(),
              this.scheduleRender());
              return
          }
          !this.projectionDelta || !this.prevProjectionDelta ? this.createProjectionDeltas() : (tg(this.prevProjectionDelta.x, this.projectionDelta.x),
          tg(this.prevProjectionDelta.y, this.projectionDelta.y)),
          Mo(this.projectionDelta, this.layoutCorrected, p, this.latestValues),
          (this.treeScale.x !== d || this.treeScale.y !== f || !fg(this.projectionDelta.x, this.prevProjectionDelta.x) || !fg(this.projectionDelta.y, this.prevProjectionDelta.y)) && (this.hasProjected = !0,
          this.scheduleRender(),
          this.notifyListeners("projectionUpdate", p))
      }
      hide() {
          this.isVisible = !1
      }
      show() {
          this.isVisible = !0
      }
      scheduleRender(s=!0) {
          var a;
          if ((a = this.options.visualElement) == null || a.scheduleRender(),
          s) {
              const l = this.getStack();
              l && l.scheduleRender()
          }
          this.resumingFrom && !this.resumingFrom.instance && (this.resumingFrom = void 0)
      }
      createProjectionDeltas() {
          this.prevProjectionDelta = ui(),
          this.projectionDelta = ui(),
          this.projectionDeltaWithTransform = ui()
      }
      setAnimationOrigin(s, a=!1) {
          const l = this.snapshot
            , c = l ? l.latestValues : {}
            , u = {
              ...this.latestValues
          }
            , d = ui();
          (!this.relativeParent || !this.relativeParent.options.layoutRoot) && (this.relativeTarget = this.relativeTargetOrigin = void 0),
          this.attemptToResolveRelativeTarget = !a;
          const f = Ee()
            , p = l ? l.source : void 0
            , b = this.layout ? this.layout.source : void 0
            , y = p !== b
            , w = this.getStack()
            , m = !w || w.members.length <= 1
            , g = !!(y && !m && this.options.crossfade === !0 && !this.path.some(Kj));
          this.animationProgress = 0;
          let v;
          this.mixTargetDelta = S => {
              const C = S / 1e3;
              xg(d.x, s.x, C),
              xg(d.y, s.y, C),
              this.setTargetDelta(d),
              this.relativeTarget && this.relativeTargetOrigin && this.layout && this.relativeParent && this.relativeParent.layout && (Ja(f, this.layout.layoutBox, this.relativeParent.layout.layoutBox),
              Hj(this.relativeTarget, this.relativeTargetOrigin, f, C),
              v && Sj(this.relativeTarget, v) && (this.isProjectionDirty = !1),
              v || (v = Ee()),
              Nt(v, this.relativeTarget)),
              y && (this.animationValues = u,
              Ej(u, c, this.latestValues, C, g, m)),
              this.root.scheduleUpdateProjection(),
              this.scheduleRender(),
              this.animationProgress = C
          }
          ,
          this.mixTargetDelta(this.options.layoutRoot ? 1e3 : 0)
      }
      startAnimation(s) {
          var a, l, c;
          this.notifyListeners("animationStart"),
          (a = this.currentAnimation) == null || a.stop(),
          (c = (l = this.resumingFrom) == null ? void 0 : l.currentAnimation) == null || c.stop(),
          this.pendingAnimation && (lr(this.pendingAnimation),
          this.pendingAnimation = void 0),
          this.pendingAnimation = ue.update( () => {
              ga.hasAnimatedSinceResize = !0,
              this.motionValue || (this.motionValue = $i(0)),
              this.currentAnimation = Aj(this.motionValue, [0, 1e3], {
                  ...s,
                  velocity: 0,
                  isSync: !0,
                  onUpdate: u => {
                      this.mixTargetDelta(u),
                      s.onUpdate && s.onUpdate(u)
                  }
                  ,
                  onStop: () => {}
                  ,
                  onComplete: () => {
                      s.onComplete && s.onComplete(),
                      this.completeAnimation()
                  }
              }),
              this.resumingFrom && (this.resumingFrom.currentAnimation = this.currentAnimation),
              this.pendingAnimation = void 0
          }
          )
      }
      completeAnimation() {
          this.resumingFrom && (this.resumingFrom.currentAnimation = void 0,
          this.resumingFrom.preserveOpacity = void 0);
          const s = this.getStack();
          s && s.exitAnimationComplete(),
          this.resumingFrom = this.currentAnimation = this.animationValues = void 0,
          this.notifyListeners("animationComplete")
      }
      finishAnimation() {
          this.currentAnimation && (this.mixTargetDelta && this.mixTargetDelta(Dj),
          this.currentAnimation.stop()),
          this.completeAnimation()
      }
      applyTransformsToTarget() {
          const s = this.getLead();
          let {targetWithTransforms: a, target: l, layout: c, latestValues: u} = s;
          if (!(!a || !l || !c)) {
              if (this !== s && this.layout && c && m1(this.options.animationType, this.layout.layoutBox, c.layoutBox)) {
                  l = this.target || Ee();
                  const d = qe(this.layout.layoutBox.x);
                  l.x.min = s.target.x.min,
                  l.x.max = l.x.min + d;
                  const f = qe(this.layout.layoutBox.y);
                  l.y.min = s.target.y.min,
                  l.y.max = l.y.min + f
              }
              Nt(a, l),
              fi(a, u),
              Mo(this.projectionDeltaWithTransform, this.layoutCorrected, a, u)
          }
      }
      registerSharedNode(s, a) {
          this.sharedNodes.has(s) || this.sharedNodes.set(s, new Mj),
          this.sharedNodes.get(s).add(a);
          const c = a.options.initialPromotionConfig;
          a.promote({
              transition: c ? c.transition : void 0,
              preserveFollowOpacity: c && c.shouldPreserveFollowOpacity ? c.shouldPreserveFollowOpacity(a) : void 0
          })
      }
      isLead() {
          const s = this.getStack();
          return s ? s.lead === this : !0
      }
      getLead() {
          var a;
          const {layoutId: s} = this.options;
          return s ? ((a = this.getStack()) == null ? void 0 : a.lead) || this : this
      }
      getPrevLead() {
          var a;
          const {layoutId: s} = this.options;
          return s ? (a = this.getStack()) == null ? void 0 : a.prevLead : void 0
      }
      getStack() {
          const {layoutId: s} = this.options;
          if (s)
              return this.root.sharedNodes.get(s)
      }
      promote({needsReset: s, transition: a, preserveFollowOpacity: l}={}) {
          const c = this.getStack();
          c && c.promote(this, l),
          s && (this.projectionDelta = void 0,
          this.needsReset = !0),
          a && this.setOptions({
              transition: a
          })
      }
      relegate() {
          const s = this.getStack();
          return s ? s.relegate(this) : !1
      }
      resetSkewAndRotation() {
          const {visualElement: s} = this.options;
          if (!s)
              return;
          let a = !1;
          const {latestValues: l} = s;
          if ((l.z || l.rotate || l.rotateX || l.rotateY || l.rotateZ || l.skewX || l.skewY) && (a = !0),
          !a)
              return;
          const c = {};
          l.z && Dc("z", s, c, this.animationValues);
          for (let u = 0; u < Mc.length; u++)
              Dc(`rotate${Mc[u]}`, s, c, this.animationValues),
              Dc(`skew${Mc[u]}`, s, c, this.animationValues);
          s.render();
          for (const u in c)
              s.setStaticValue(u, c[u]),
              this.animationValues && (this.animationValues[u] = c[u]);
          s.scheduleRender()
      }
      applyProjectionStyles(s, a) {
          if (!this.instance || this.isSVG)
              return;
          if (!this.isVisible) {
              s.visibility = "hidden";
              return
          }
          const l = this.getTransformTemplate();
          if (this.needsReset) {
              this.needsReset = !1,
              s.visibility = "",
              s.opacity = "",
              s.pointerEvents = ma(a == null ? void 0 : a.pointerEvents) || "",
              s.transform = l ? l(this.latestValues, "") : "none";
              return
          }
          const c = this.getLead();
          if (!this.projectionDelta || !this.layout || !c.target) {
              this.options.layoutId && (s.opacity = this.latestValues.opacity !== void 0 ? this.latestValues.opacity : 1,
              s.pointerEvents = ma(a == null ? void 0 : a.pointerEvents) || ""),
              this.hasProjected && !br(this.latestValues) && (s.transform = l ? l({}, "") : "none",
              this.hasProjected = !1);
              return
          }
          s.visibility = "";
          const u = c.animationValues || c.latestValues;
          this.applyTransformsToTarget();
          let d = Cj(this.projectionDeltaWithTransform, this.treeScale, u);
          l && (d = l(u, d)),
          s.transform = d;
          const {x: f, y: p} = this.projectionDelta;
          s.transformOrigin = `${f.origin * 100}% ${p.origin * 100}% 0`,
          c.animationValues ? s.opacity = c === this ? u.opacity ?? this.latestValues.opacity ?? 1 : this.preserveOpacity ? this.latestValues.opacity : u.opacityExit : s.opacity = c === this ? u.opacity !== void 0 ? u.opacity : "" : u.opacityExit !== void 0 ? u.opacityExit : 0;
          for (const b in pd) {
              if (u[b] === void 0)
                  continue;
              const {correct: y, applyTo: w, isCSSVariable: m} = pd[b]
                , g = d === "none" ? u[b] : y(u[b], c);
              if (w) {
                  const v = w.length;
                  for (let S = 0; S < v; S++)
                      s[w[S]] = g
              } else
                  m ? this.options.visualElement.renderState.vars[b] = g : s[b] = g
          }
          this.options.layoutId && (s.pointerEvents = c === this ? ma(a == null ? void 0 : a.pointerEvents) || "" : "none")
      }
      clearSnapshot() {
          this.resumeFrom = this.snapshot = void 0
      }
      resetTree() {
          this.root.nodes.forEach(s => {
              var a;
              return (a = s.currentAnimation) == null ? void 0 : a.stop()
          }
          ),
          this.root.nodes.forEach(gg),
          this.root.sharedNodes.clear()
      }
  }
}
function Lj(e) {
  e.updateLayout()
}
function Oj(e) {
  var n;
  const t = ((n = e.resumeFrom) == null ? void 0 : n.snapshot) || e.snapshot;
  if (e.isLead() && e.layout && t && e.hasListeners("didUpdate")) {
      const {layoutBox: r, measuredBox: i} = e.layout
        , {animationType: o} = e.options
        , s = t.source !== e.layout.source;
      o === "size" ? pt(d => {
          const f = s ? t.measuredBox[d] : t.layoutBox[d]
            , p = qe(f);
          f.min = r[d].min,
          f.max = f.min + p
      }
      ) : m1(o, t.layoutBox, r) && pt(d => {
          const f = s ? t.measuredBox[d] : t.layoutBox[d]
            , p = qe(r[d]);
          f.max = f.min + p,
          e.relativeTarget && !e.currentAnimation && (e.isProjectionDirty = !0,
          e.relativeTarget[d].max = e.relativeTarget[d].min + p)
      }
      );
      const a = ui();
      Mo(a, r, t.layoutBox);
      const l = ui();
      s ? Mo(l, e.applyTransform(i, !0), t.measuredBox) : Mo(l, r, t.layoutBox);
      const c = !c1(a);
      let u = !1;
      if (!e.resumeFrom) {
          const d = e.getClosestProjectingParent();
          if (d && !d.resumeFrom) {
              const {snapshot: f, layout: p} = d;
              if (f && p) {
                  const b = Ee();
                  Ja(b, t.layoutBox, f.layoutBox);
                  const y = Ee();
                  Ja(y, r, p.layoutBox),
                  u1(b, y) || (u = !0),
                  d.options.layoutRoot && (e.relativeTarget = y,
                  e.relativeTargetOrigin = b,
                  e.relativeParent = d)
              }
          }
      }
      e.notifyListeners("didUpdate", {
          layout: r,
          snapshot: t,
          delta: l,
          layoutDelta: a,
          hasLayoutChanged: c,
          hasRelativeLayoutChanged: u
      })
  } else if (e.isLead()) {
      const {onExitComplete: r} = e.options;
      r && r()
  }
  e.options.transition = void 0
}
function zj(e) {
  e.parent && (e.isProjecting() || (e.isProjectionDirty = e.parent.isProjectionDirty),
  e.isSharedProjectionDirty || (e.isSharedProjectionDirty = !!(e.isProjectionDirty || e.parent.isProjectionDirty || e.parent.isSharedProjectionDirty)),
  e.isTransformDirty || (e.isTransformDirty = e.parent.isTransformDirty))
}
function _j(e) {
  e.isProjectionDirty = e.isSharedProjectionDirty = e.isTransformDirty = !1
}
function Vj(e) {
  e.clearSnapshot()
}
function gg(e) {
  e.clearMeasurements()
}
function yg(e) {
  e.isLayoutDirty = !1
}
function Fj(e) {
  const {visualElement: t} = e.options;
  t && t.getProps().onBeforeLayoutMeasure && t.notify("BeforeLayoutMeasure"),
  e.resetTransform()
}
function vg(e) {
  e.finishAnimation(),
  e.targetDelta = e.relativeTarget = e.target = void 0,
  e.isProjectionDirty = !0
}
function Bj(e) {
  e.resolveTargetDelta()
}
function $j(e) {
  e.calcProjection()
}
function Uj(e) {
  e.resetSkewAndRotation()
}
function Wj(e) {
  e.removeLeadSnapshot()
}
function xg(e, t, n) {
  e.translate = me(t.translate, 0, n),
  e.scale = me(t.scale, 1, n),
  e.origin = t.origin,
  e.originPoint = t.originPoint
}
function wg(e, t, n, r) {
  e.min = me(t.min, n.min, r),
  e.max = me(t.max, n.max, r)
}
function Hj(e, t, n, r) {
  wg(e.x, t.x, n.x, r),
  wg(e.y, t.y, n.y, r)
}
function Kj(e) {
  return e.animationValues && e.animationValues.opacityExit !== void 0
}
const qj = {
  duration: .45,
  ease: [.4, 0, .1, 1]
}
, bg = e => typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().includes(e)
, Sg = bg("applewebkit/") && !bg("chrome/") ? Math.round : bt;
function Cg(e) {
  e.min = Sg(e.min),
  e.max = Sg(e.max)
}
function Gj(e) {
  Cg(e.x),
  Cg(e.y)
}
function m1(e, t, n) {
  return e === "position" || e === "preserve-aspect" && !yj(dg(t), dg(n), .2)
}
function Qj(e) {
  var t;
  return e !== e.root && ((t = e.scroll) == null ? void 0 : t.wasRoot)
}
const Yj = p1({
  attachResizeListener: (e, t) => os(e, "resize", t),
  measureScroll: () => ({
      x: document.documentElement.scrollLeft || document.body.scrollLeft,
      y: document.documentElement.scrollTop || document.body.scrollTop
  }),
  checkIsScrollRoot: () => !0
})
, Ic = {
  current: void 0
}
, g1 = p1({
  measureScroll: e => ({
      x: e.scrollLeft,
      y: e.scrollTop
  }),
  defaultParent: () => {
      if (!Ic.current) {
          const e = new Yj({});
          e.mount(window),
          e.setOptions({
              layoutScroll: !0
          }),
          Ic.current = e
      }
      return Ic.current
  }
  ,
  resetTransform: (e, t) => {
      e.style.transform = t !== void 0 ? t : "none"
  }
  ,
  checkIsScrollRoot: e => window.getComputedStyle(e).position === "fixed"
})
, dh = x.createContext({
  transformPagePoint: e => e,
  isStatic: !1,
  reducedMotion: "never"
});
function kg(e, t) {
  if (typeof e == "function")
      return e(t);
  e != null && (e.current = t)
}
function Zj(...e) {
  return t => {
      let n = !1;
      const r = e.map(i => {
          const o = kg(i, t);
          return !n && typeof o == "function" && (n = !0),
          o
      }
      );
      if (n)
          return () => {
              for (let i = 0; i < r.length; i++) {
                  const o = r[i];
                  typeof o == "function" ? o() : kg(e[i], null)
              }
          }
  }
}
function Xj(...e) {
  return x.useCallback(Zj(...e), e)
}
class Jj extends x.Component {
  getSnapshotBeforeUpdate(t) {
      const n = this.props.childRef.current;
      if (n && t.isPresent && !this.props.isPresent) {
          const r = n.offsetParent
            , i = Vw(r) && r.offsetWidth || 0
            , o = this.props.sizeRef.current;
          o.height = n.offsetHeight || 0,
          o.width = n.offsetWidth || 0,
          o.top = n.offsetTop,
          o.left = n.offsetLeft,
          o.right = i - o.width - o.left
      }
      return null
  }
  componentDidUpdate() {}
  render() {
      return this.props.children
  }
}
function eM({children: e, isPresent: t, anchorX: n, root: r}) {
  var u;
  const i = x.useId()
    , o = x.useRef(null)
    , s = x.useRef({
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      right: 0
  })
    , {nonce: a} = x.useContext(dh)
    , l = ((u = e.props) == null ? void 0 : u.ref) ?? (e == null ? void 0 : e.ref)
    , c = Xj(o, l);
  return x.useInsertionEffect( () => {
      const {width: d, height: f, top: p, left: b, right: y} = s.current;
      if (t || !o.current || !d || !f)
          return;
      const w = n === "left" ? `left: ${b}` : `right: ${y}`;
      o.current.dataset.motionPopId = i;
      const m = document.createElement("style");
      a && (m.nonce = a);
      const g = r ?? document.head;
      return g.appendChild(m),
      m.sheet && m.sheet.insertRule(`
        [data-motion-pop-id="${i}"] {
          position: absolute !important;
          width: ${d}px !important;
          height: ${f}px !important;
          ${w}px !important;
          top: ${p}px !important;
        }
      `),
      () => {
          g.contains(m) && g.removeChild(m)
      }
  }
  , [t]),
  h.jsx(Jj, {
      isPresent: t,
      childRef: o,
      sizeRef: s,
      children: x.cloneElement(e, {
          ref: c
      })
  })
}
const tM = ({children: e, initial: t, isPresent: n, onExitComplete: r, custom: i, presenceAffectsLayout: o, mode: s, anchorX: a, root: l}) => {
  const c = _f(nM)
    , u = x.useId();
  let d = !0
    , f = x.useMemo( () => (d = !1,
  {
      id: u,
      initial: t,
      isPresent: n,
      custom: i,
      onExitComplete: p => {
          c.set(p, !0);
          for (const b of c.values())
              if (!b)
                  return;
          r && r()
      }
      ,
      register: p => (c.set(p, !1),
      () => c.delete(p))
  }), [n, c, r]);
  return o && d && (f = {
      ...f
  }),
  x.useMemo( () => {
      c.forEach( (p, b) => c.set(b, !1))
  }
  , [n]),
  x.useEffect( () => {
      !n && !c.size && r && r()
  }
  , [n]),
  s === "popLayout" && (e = h.jsx(eM, {
      isPresent: n,
      anchorX: a,
      root: l,
      children: e
  })),
  h.jsx(Rl.Provider, {
      value: f,
      children: e
  })
}
;
function nM() {
  return new Map
}
function y1(e=!0) {
  const t = x.useContext(Rl);
  if (t === null)
      return [!0, null];
  const {isPresent: n, onExitComplete: r, register: i} = t
    , o = x.useId();
  x.useEffect( () => {
      if (e)
          return i(o)
  }
  , [e]);
  const s = x.useCallback( () => e && r && r(o), [o, r, e]);
  return !n && r ? [!1, s] : [!0]
}
const Ys = e => e.key || "";
function Eg(e) {
  const t = [];
  return x.Children.forEach(e, n => {
      x.isValidElement(n) && t.push(n)
  }
  ),
  t
}
const rM = ({children: e, custom: t, initial: n=!0, onExitComplete: r, presenceAffectsLayout: i=!0, mode: o="sync", propagate: s=!1, anchorX: a="left", root: l}) => {
  const [c,u] = y1(s)
    , d = x.useMemo( () => Eg(e), [e])
    , f = s && !c ? [] : d.map(Ys)
    , p = x.useRef(!0)
    , b = x.useRef(d)
    , y = _f( () => new Map)
    , w = x.useRef(new Set)
    , [m,g] = x.useState(d)
    , [v,S] = x.useState(d);
  qx( () => {
      p.current = !1,
      b.current = d;
      for (let E = 0; E < v.length; E++) {
          const P = Ys(v[E]);
          f.includes(P) ? (y.delete(P),
          w.current.delete(P)) : y.get(P) !== !0 && y.set(P, !1)
      }
  }
  , [v, f.length, f.join("-")]);
  const C = [];
  if (d !== m) {
      let E = [...d];
      for (let P = 0; P < v.length; P++) {
          const j = v[P]
            , R = Ys(j);
          f.includes(R) || (E.splice(P, 0, j),
          C.push(j))
      }
      return o === "wait" && C.length && (E = C),
      S(Eg(E)),
      g(d),
      null
  }
  const {forceRender: k} = x.useContext(zf);
  return h.jsx(h.Fragment, {
      children: v.map(E => {
          const P = Ys(E)
            , j = s && !c ? !1 : d === v || f.includes(P)
            , R = () => {
              if (w.current.has(P))
                  return;
              if (w.current.add(P),
              y.has(P))
                  y.set(P, !0);
              else
                  return;
              let z = !0;
              y.forEach(L => {
                  L || (z = !1)
              }
              ),
              z && (k == null || k(),
              S(b.current),
              s && (u == null || u()),
              r && r())
          }
          ;
          return h.jsx(tM, {
              isPresent: j,
              initial: !p.current || n ? void 0 : !1,
              custom: t,
              presenceAffectsLayout: i,
              mode: o,
              root: l,
              onExitComplete: j ? void 0 : R,
              anchorX: a,
              children: E
          }, P)
      }
      )
  })
}
, v1 = x.createContext({
  strict: !1
})
, Pg = {
  animation: ["animate", "variants", "whileHover", "whileTap", "exit", "whileInView", "whileFocus", "whileDrag"],
  exit: ["exit"],
  drag: ["drag", "dragControls"],
  focus: ["whileFocus"],
  hover: ["whileHover", "onHoverStart", "onHoverEnd"],
  tap: ["whileTap", "onTap", "onTapStart", "onTapCancel"],
  pan: ["onPan", "onPanStart", "onPanSessionStart", "onPanEnd"],
  inView: ["whileInView", "onViewportEnter", "onViewportLeave"],
  layout: ["layout", "layoutId"]
};
let Tg = !1;
function iM() {
  if (Tg)
      return;
  const e = {};
  for (const t in Pg)
      e[t] = {
          isEnabled: n => Pg[t].some(r => !!n[r])
      };
  qw(e),
  Tg = !0
}
function x1() {
  return iM(),
  UR()
}
function oM(e) {
  const t = x1();
  for (const n in e)
      t[n] = {
          ...t[n],
          ...e[n]
      };
  qw(t)
}
const sM = new Set(["animate", "exit", "variants", "initial", "style", "values", "variants", "transition", "transformTemplate", "custom", "inherit", "onBeforeLayoutMeasure", "onAnimationStart", "onAnimationComplete", "onUpdate", "onDragStart", "onDrag", "onDragEnd", "onMeasureDragConstraints", "onDirectionLock", "onDragTransitionEnd", "_dragX", "_dragY", "onHoverStart", "onHoverEnd", "onViewportEnter", "onViewportLeave", "globalTapTarget", "ignoreStrict", "viewport"]);
function el(e) {
  return e.startsWith("while") || e.startsWith("drag") && e !== "draggable" || e.startsWith("layout") || e.startsWith("onTap") || e.startsWith("onPan") || e.startsWith("onLayout") || sM.has(e)
}
let w1 = e => !el(e);
function aM(e) {
  typeof e == "function" && (w1 = t => t.startsWith("on") ? !el(t) : e(t))
}
try {
  aM(require("@emotion/is-prop-valid").default)
} catch {}
function lM(e, t, n) {
  const r = {};
  for (const i in e)
      i === "values" && typeof e.values == "object" || (w1(i) || n === !0 && el(i) || !t && !el(i) || e.draggable && i.startsWith("onDrag")) && (r[i] = e[i]);
  return r
}
const Il = x.createContext({});
function cM(e, t) {
  if (Dl(e)) {
      const {initial: n, animate: r} = e;
      return {
          initial: n === !1 || is(n) ? n : void 0,
          animate: is(r) ? r : void 0
      }
  }
  return e.inherit !== !1 ? t : {}
}
function uM(e) {
  const {initial: t, animate: n} = cM(e, x.useContext(Il));
  return x.useMemo( () => ({
      initial: t,
      animate: n
  }), [Ag(t), Ag(n)])
}
function Ag(e) {
  return Array.isArray(e) ? e.join(" ") : e
}
const fh = () => ({
  style: {},
  transform: {},
  transformOrigin: {},
  vars: {}
});
function b1(e, t, n) {
  for (const r in t)
      !Fe(t[r]) && !e1(r, n) && (e[r] = t[r])
}
function dM({transformTemplate: e}, t) {
  return x.useMemo( () => {
      const n = fh();
      return ch(n, t, e),
      Object.assign({}, n.vars, n.style)
  }
  , [t])
}
function fM(e, t) {
  const n = e.style || {}
    , r = {};
  return b1(r, n, e),
  Object.assign(r, dM(e, t)),
  r
}
function hM(e, t) {
  const n = {}
    , r = fM(e, t);
  return e.drag && e.dragListener !== !1 && (n.draggable = !1,
  r.userSelect = r.WebkitUserSelect = r.WebkitTouchCallout = "none",
  r.touchAction = e.drag === !0 ? "none" : `pan-${e.drag === "x" ? "y" : "x"}`),
  e.tabIndex === void 0 && (e.onTap || e.onTapStart || e.whileTap) && (n.tabIndex = 0),
  n.style = r,
  n
}
const S1 = () => ({
  ...fh(),
  attrs: {}
});
function pM(e, t, n, r) {
  const i = x.useMemo( () => {
      const o = S1();
      return t1(o, t, r1(r), e.transformTemplate, e.style),
      {
          ...o.attrs,
          style: {
              ...o.style
          }
      }
  }
  , [t]);
  if (e.style) {
      const o = {};
      b1(o, e.style, e),
      i.style = {
          ...o,
          ...i.style
      }
  }
  return i
}
const mM = ["animate", "circle", "defs", "desc", "ellipse", "g", "image", "line", "filter", "marker", "mask", "metadata", "path", "pattern", "polygon", "polyline", "rect", "stop", "switch", "symbol", "svg", "text", "tspan", "use", "view"];
function hh(e) {
  return typeof e != "string" || e.includes("-") ? !1 : !!(mM.indexOf(e) > -1 || /[A-Z]/u.test(e))
}
function gM(e, t, n, {latestValues: r}, i, o=!1, s) {
  const l = (s ?? hh(e) ? pM : hM)(t, r, i, e)
    , c = lM(t, typeof e == "string", o)
    , u = e !== x.Fragment ? {
      ...c,
      ...l,
      ref: n
  } : {}
    , {children: d} = t
    , f = x.useMemo( () => Fe(d) ? d.get() : d, [d]);
  return x.createElement(e, {
      ...u,
      children: f
  })
}
function yM({scrapeMotionValuesFromProps: e, createRenderState: t}, n, r, i) {
  return {
      latestValues: vM(n, r, i, e),
      renderState: t()
  }
}
function vM(e, t, n, r) {
  const i = {}
    , o = r(e, {});
  for (const f in o)
      i[f] = ma(o[f]);
  let {initial: s, animate: a} = e;
  const l = Dl(e)
    , c = Kw(e);
  t && c && !l && e.inherit !== !1 && (s === void 0 && (s = t.initial),
  a === void 0 && (a = t.animate));
  let u = n ? n.initial === !1 : !1;
  u = u || s === !1;
  const d = u ? a : s;
  if (d && typeof d != "boolean" && !Ml(d)) {
      const f = Array.isArray(d) ? d : [d];
      for (let p = 0; p < f.length; p++) {
          const b = nh(e, f[p]);
          if (b) {
              const {transitionEnd: y, transition: w, ...m} = b;
              for (const g in m) {
                  let v = m[g];
                  if (Array.isArray(v)) {
                      const S = u ? v.length - 1 : 0;
                      v = v[S]
                  }
                  v !== null && (i[g] = v)
              }
              for (const g in y)
                  i[g] = y[g]
          }
      }
  }
  return i
}
const C1 = e => (t, n) => {
  const r = x.useContext(Il)
    , i = x.useContext(Rl)
    , o = () => yM(e, t, r, i);
  return n ? o() : _f(o)
}
, xM = C1({
  scrapeMotionValuesFromProps: uh,
  createRenderState: fh
})
, wM = C1({
  scrapeMotionValuesFromProps: i1,
  createRenderState: S1
})
, bM = Symbol.for("motionComponentSymbol");
function SM(e, t, n) {
  const r = x.useRef(n);
  x.useInsertionEffect( () => {
      r.current = n
  }
  );
  const i = x.useRef(null);
  return x.useCallback(o => {
      var a;
      o && ((a = e.onMount) == null || a.call(e, o)),
      t && (o ? t.mount(o) : t.unmount());
      const s = r.current;
      if (typeof s == "function")
          if (o) {
              const l = s(o);
              typeof l == "function" && (i.current = l)
          } else
              i.current ? (i.current(),
              i.current = null) : s(o);
      else
          s && (s.current = o)
  }
  , [t])
}
const k1 = x.createContext({});
function xo(e) {
  return e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "current")
}
function CM(e, t, n, r, i, o) {
  var w, m;
  const {visualElement: s} = x.useContext(Il)
    , a = x.useContext(v1)
    , l = x.useContext(Rl)
    , c = x.useContext(dh).reducedMotion
    , u = x.useRef(null);
  r = r || a.renderer,
  !u.current && r && (u.current = r(e, {
      visualState: t,
      parent: s,
      props: n,
      presenceContext: l,
      blockInitialAnimation: l ? l.initial === !1 : !1,
      reducedMotionConfig: c,
      isSVG: o
  }));
  const d = u.current
    , f = x.useContext(k1);
  d && !d.projection && i && (d.type === "html" || d.type === "svg") && kM(u.current, n, i, f);
  const p = x.useRef(!1);
  x.useInsertionEffect( () => {
      d && p.current && d.update(n, l)
  }
  );
  const b = n[Rw]
    , y = x.useRef(!!b && !((w = window.MotionHandoffIsComplete) != null && w.call(window, b)) && ((m = window.MotionHasOptimisedAnimation) == null ? void 0 : m.call(window, b)));
  return qx( () => {
      d && (p.current = !0,
      window.MotionIsMounted = !0,
      d.updateFeatures(),
      d.scheduleRenderMicrotask(),
      y.current && d.animationState && d.animationState.animateChanges())
  }
  ),
  x.useEffect( () => {
      d && (!y.current && d.animationState && d.animationState.animateChanges(),
      y.current && (queueMicrotask( () => {
          var g;
          (g = window.MotionHandoffMarkAsComplete) == null || g.call(window, b)
      }
      ),
      y.current = !1),
      d.enteringChildren = void 0)
  }
  ),
  d
}
function kM(e, t, n, r) {
  const {layoutId: i, layout: o, drag: s, dragConstraints: a, layoutScroll: l, layoutRoot: c, layoutCrossfade: u} = t;
  e.projection = new n(e.latestValues,t["data-framer-portal-id"] ? void 0 : E1(e.parent)),
  e.projection.setOptions({
      layoutId: i,
      layout: o,
      alwaysMeasureLayout: !!s || a && xo(a),
      visualElement: e,
      animationType: typeof o == "string" ? o : "both",
      initialPromotionConfig: r,
      crossfade: u,
      layoutScroll: l,
      layoutRoot: c
  })
}
function E1(e) {
  if (e)
      return e.options.allowProjection !== !1 ? e.projection : E1(e.parent)
}
function Lc(e, {forwardMotionProps: t=!1, type: n}={}, r, i) {
  r && oM(r);
  const o = n ? n === "svg" : hh(e)
    , s = o ? wM : xM;
  function a(c, u) {
      let d;
      const f = {
          ...x.useContext(dh),
          ...c,
          layoutId: EM(c)
      }
        , {isStatic: p} = f
        , b = uM(c)
        , y = s(c, p);
      if (!p && Kx) {
          PM();
          const w = TM(f);
          d = w.MeasureLayout,
          b.visualElement = CM(e, y, f, i, w.ProjectionNode, o)
      }
      return h.jsxs(Il.Provider, {
          value: b,
          children: [d && b.visualElement ? h.jsx(d, {
              visualElement: b.visualElement,
              ...f
          }) : null, gM(e, c, SM(y, b.visualElement, u), y, p, t, o)]
      })
  }
  a.displayName = `motion.${typeof e == "string" ? e : `create(${e.displayName ?? e.name ?? ""})`}`;
  const l = x.forwardRef(a);
  return l[bM] = e,
  l
}
function EM({layoutId: e}) {
  const t = x.useContext(zf).id;
  return t && e !== void 0 ? t + "-" + e : e
}
function PM(e, t) {
  x.useContext(v1).strict
}
function TM(e) {
  const t = x1()
    , {drag: n, layout: r} = t;
  if (!n && !r)
      return {};
  const i = {
      ...n,
      ...r
  };
  return {
      MeasureLayout: n != null && n.isEnabled(e) || r != null && r.isEnabled(e) ? i.MeasureLayout : void 0,
      ProjectionNode: i.ProjectionNode
  }
}
function AM(e, t) {
  if (typeof Proxy > "u")
      return Lc;
  const n = new Map
    , r = (o, s) => Lc(o, s, e, t)
    , i = (o, s) => r(o, s);
  return new Proxy(i,{
      get: (o, s) => s === "create" ? r : (n.has(s) || n.set(s, Lc(s, void 0, e, t)),
      n.get(s))
  })
}
const NM = (e, t) => t.isSVG ?? hh(e) ? new sj(t) : new ej(t,{
  allowProjection: e !== x.Fragment
});
class RM extends pr {
  constructor(t) {
      super(t),
      t.animationState || (t.animationState = dj(t))
  }
  updateAnimationControlsSubscription() {
      const {animate: t} = this.node.getProps();
      Ml(t) && (this.unmountControls = t.subscribe(this.node))
  }
  mount() {
      this.updateAnimationControlsSubscription()
  }
  update() {
      const {animate: t} = this.node.getProps()
        , {animate: n} = this.node.prevProps || {};
      t !== n && this.updateAnimationControlsSubscription()
  }
  unmount() {
      var t;
      this.node.animationState.reset(),
      (t = this.unmountControls) == null || t.call(this)
  }
}
let jM = 0;
class MM extends pr {
  constructor() {
      super(...arguments),
      this.id = jM++
  }
  update() {
      if (!this.node.presenceContext)
          return;
      const {isPresent: t, onExitComplete: n} = this.node.presenceContext
        , {isPresent: r} = this.node.prevPresenceContext || {};
      if (!this.node.animationState || t === r)
          return;
      const i = this.node.animationState.setActive("exit", !t);
      n && !t && i.then( () => {
          n(this.id)
      }
      )
  }
  mount() {
      const {register: t, onExitComplete: n} = this.node.presenceContext || {};
      n && n(this.id),
      t && (this.unmount = t(this.id))
  }
  unmount() {}
}
const DM = {
  animation: {
      Feature: RM
  },
  exit: {
      Feature: MM
  }
};
function ws(e) {
  return {
      point: {
          x: e.pageX,
          y: e.pageY
      }
  }
}
const IM = e => t => sh(t) && e(t, ws(t));
function Do(e, t, n, r) {
  return os(e, t, IM(n), r)
}
const P1 = ({current: e}) => e ? e.ownerDocument.defaultView : null
, Ng = (e, t) => Math.abs(e - t);
function LM(e, t) {
  const n = Ng(e.x, t.x)
    , r = Ng(e.y, t.y);
  return Math.sqrt(n ** 2 + r ** 2)
}
const Rg = new Set(["auto", "scroll"]);
class T1 {
  constructor(t, n, {transformPagePoint: r, contextWindow: i=window, dragSnapToOrigin: o=!1, distanceThreshold: s=3, element: a}={}) {
      if (this.startEvent = null,
      this.lastMoveEvent = null,
      this.lastMoveEventInfo = null,
      this.handlers = {},
      this.contextWindow = window,
      this.scrollPositions = new Map,
      this.removeScrollListeners = null,
      this.onElementScroll = p => {
          this.handleScroll(p.target)
      }
      ,
      this.onWindowScroll = () => {
          this.handleScroll(window)
      }
      ,
      this.updatePoint = () => {
          if (!(this.lastMoveEvent && this.lastMoveEventInfo))
              return;
          const p = zc(this.lastMoveEventInfo, this.history)
            , b = this.startEvent !== null
            , y = LM(p.offset, {
              x: 0,
              y: 0
          }) >= this.distanceThreshold;
          if (!b && !y)
              return;
          const {point: w} = p
            , {timestamp: m} = je;
          this.history.push({
              ...w,
              timestamp: m
          });
          const {onStart: g, onMove: v} = this.handlers;
          b || (g && g(this.lastMoveEvent, p),
          this.startEvent = this.lastMoveEvent),
          v && v(this.lastMoveEvent, p)
      }
      ,
      this.handlePointerMove = (p, b) => {
          this.lastMoveEvent = p,
          this.lastMoveEventInfo = Oc(b, this.transformPagePoint),
          ue.update(this.updatePoint, !0)
      }
      ,
      this.handlePointerUp = (p, b) => {
          this.end();
          const {onEnd: y, onSessionEnd: w, resumeAnimation: m} = this.handlers;
          if ((this.dragSnapToOrigin || !this.startEvent) && m && m(),
          !(this.lastMoveEvent && this.lastMoveEventInfo))
              return;
          const g = zc(p.type === "pointercancel" ? this.lastMoveEventInfo : Oc(b, this.transformPagePoint), this.history);
          this.startEvent && y && y(p, g),
          w && w(p, g)
      }
      ,
      !sh(t))
          return;
      this.dragSnapToOrigin = o,
      this.handlers = n,
      this.transformPagePoint = r,
      this.distanceThreshold = s,
      this.contextWindow = i || window;
      const l = ws(t)
        , c = Oc(l, this.transformPagePoint)
        , {point: u} = c
        , {timestamp: d} = je;
      this.history = [{
          ...u,
          timestamp: d
      }];
      const {onSessionStart: f} = n;
      f && f(t, zc(c, this.history)),
      this.removeListeners = ys(Do(this.contextWindow, "pointermove", this.handlePointerMove), Do(this.contextWindow, "pointerup", this.handlePointerUp), Do(this.contextWindow, "pointercancel", this.handlePointerUp)),
      a && this.startScrollTracking(a)
  }
  startScrollTracking(t) {
      let n = t.parentElement;
      for (; n; ) {
          const r = getComputedStyle(n);
          (Rg.has(r.overflowX) || Rg.has(r.overflowY)) && this.scrollPositions.set(n, {
              x: n.scrollLeft,
              y: n.scrollTop
          }),
          n = n.parentElement
      }
      this.scrollPositions.set(window, {
          x: window.scrollX,
          y: window.scrollY
      }),
      window.addEventListener("scroll", this.onElementScroll, {
          capture: !0,
          passive: !0
      }),
      window.addEventListener("scroll", this.onWindowScroll, {
          passive: !0
      }),
      this.removeScrollListeners = () => {
          window.removeEventListener("scroll", this.onElementScroll, {
              capture: !0
          }),
          window.removeEventListener("scroll", this.onWindowScroll)
      }
  }
  handleScroll(t) {
      const n = this.scrollPositions.get(t);
      if (!n)
          return;
      const r = t === window
        , i = r ? {
          x: window.scrollX,
          y: window.scrollY
      } : {
          x: t.scrollLeft,
          y: t.scrollTop
      }
        , o = {
          x: i.x - n.x,
          y: i.y - n.y
      };
      o.x === 0 && o.y === 0 || (r ? this.lastMoveEventInfo && (this.lastMoveEventInfo.point.x += o.x,
      this.lastMoveEventInfo.point.y += o.y) : this.history.length > 0 && (this.history[0].x -= o.x,
      this.history[0].y -= o.y),
      this.scrollPositions.set(t, i),
      ue.update(this.updatePoint, !0))
  }
  updateHandlers(t) {
      this.handlers = t
  }
  end() {
      this.removeListeners && this.removeListeners(),
      this.removeScrollListeners && this.removeScrollListeners(),
      this.scrollPositions.clear(),
      lr(this.updatePoint)
  }
}
function Oc(e, t) {
  return t ? {
      point: t(e.point)
  } : e
}
function jg(e, t) {
  return {
      x: e.x - t.x,
      y: e.y - t.y
  }
}
function zc({point: e}, t) {
  return {
      point: e,
      delta: jg(e, A1(t)),
      offset: jg(e, OM(t)),
      velocity: zM(t, .1)
  }
}
function OM(e) {
  return e[0]
}
function A1(e) {
  return e[e.length - 1]
}
function zM(e, t) {
  if (e.length < 2)
      return {
          x: 0,
          y: 0
      };
  let n = e.length - 1
    , r = null;
  const i = A1(e);
  for (; n >= 0 && (r = e[n],
  !(i.timestamp - r.timestamp > en(t))); )
      n--;
  if (!r)
      return {
          x: 0,
          y: 0
      };
  const o = xt(i.timestamp - r.timestamp);
  if (o === 0)
      return {
          x: 0,
          y: 0
      };
  const s = {
      x: (i.x - r.x) / o,
      y: (i.y - r.y) / o
  };
  return s.x === 1 / 0 && (s.x = 0),
  s.y === 1 / 0 && (s.y = 0),
  s
}
function _M(e, {min: t, max: n}, r) {
  return t !== void 0 && e < t ? e = r ? me(t, e, r.min) : Math.max(e, t) : n !== void 0 && e > n && (e = r ? me(n, e, r.max) : Math.min(e, n)),
  e
}
function Mg(e, t, n) {
  return {
      min: t !== void 0 ? e.min + t : void 0,
      max: n !== void 0 ? e.max + n - (e.max - e.min) : void 0
  }
}
function VM(e, {top: t, left: n, bottom: r, right: i}) {
  return {
      x: Mg(e.x, n, i),
      y: Mg(e.y, t, r)
  }
}
function Dg(e, t) {
  let n = t.min - e.min
    , r = t.max - e.max;
  return t.max - t.min < e.max - e.min && ([n,r] = [r, n]),
  {
      min: n,
      max: r
  }
}
function FM(e, t) {
  return {
      x: Dg(e.x, t.x),
      y: Dg(e.y, t.y)
  }
}
function BM(e, t) {
  let n = .5;
  const r = qe(e)
    , i = qe(t);
  return i > r ? n = ts(t.min, t.max - r, e.min) : r > i && (n = ts(e.min, e.max - i, t.min)),
  on(0, 1, n)
}
function $M(e, t) {
  const n = {};
  return t.min !== void 0 && (n.min = t.min - e.min),
  t.max !== void 0 && (n.max = t.max - e.min),
  n
}
const md = .35;
function UM(e=md) {
  return e === !1 ? e = 0 : e === !0 && (e = md),
  {
      x: Ig(e, "left", "right"),
      y: Ig(e, "top", "bottom")
  }
}
function Ig(e, t, n) {
  return {
      min: Lg(e, t),
      max: Lg(e, n)
  }
}
function Lg(e, t) {
  return typeof e == "number" ? e : e[t] || 0
}
const WM = new WeakMap;
class HM {
  constructor(t) {
      this.openDragLock = null,
      this.isDragging = !1,
      this.currentDirection = null,
      this.originPoint = {
          x: 0,
          y: 0
      },
      this.constraints = !1,
      this.hasMutatedConstraints = !1,
      this.elastic = Ee(),
      this.latestPointerEvent = null,
      this.latestPanInfo = null,
      this.visualElement = t
  }
  start(t, {snapToCursor: n=!1, distanceThreshold: r}={}) {
      const {presenceContext: i} = this.visualElement;
      if (i && i.isPresent === !1)
          return;
      const o = d => {
          n ? (this.stopAnimation(),
          this.snapToCursor(ws(d).point)) : this.pauseAnimation()
      }
        , s = (d, f) => {
          this.stopAnimation();
          const {drag: p, dragPropagation: b, onDragStart: y} = this.getProps();
          if (p && !b && (this.openDragLock && this.openDragLock(),
          this.openDragLock = jR(p),
          !this.openDragLock))
              return;
          this.latestPointerEvent = d,
          this.latestPanInfo = f,
          this.isDragging = !0,
          this.currentDirection = null,
          this.resolveConstraints(),
          this.visualElement.projection && (this.visualElement.projection.isAnimationBlocked = !0,
          this.visualElement.projection.target = void 0),
          pt(m => {
              let g = this.getAxisMotionValue(m).get() || 0;
              if (tn.test(g)) {
                  const {projection: v} = this.visualElement;
                  if (v && v.layout) {
                      const S = v.layout.layoutBox[m];
                      S && (g = qe(S) * (parseFloat(g) / 100))
                  }
              }
              this.originPoint[m] = g
          }
          ),
          y && ue.postRender( () => y(d, f)),
          ld(this.visualElement, "transform");
          const {animationState: w} = this.visualElement;
          w && w.setActive("whileDrag", !0)
      }
        , a = (d, f) => {
          this.latestPointerEvent = d,
          this.latestPanInfo = f;
          const {dragPropagation: p, dragDirectionLock: b, onDirectionLock: y, onDrag: w} = this.getProps();
          if (!p && !this.openDragLock)
              return;
          const {offset: m} = f;
          if (b && this.currentDirection === null) {
              this.currentDirection = KM(m),
              this.currentDirection !== null && y && y(this.currentDirection);
              return
          }
          this.updateAxis("x", f.point, m),
          this.updateAxis("y", f.point, m),
          this.visualElement.render(),
          w && w(d, f)
      }
        , l = (d, f) => {
          this.latestPointerEvent = d,
          this.latestPanInfo = f,
          this.stop(d, f),
          this.latestPointerEvent = null,
          this.latestPanInfo = null
      }
        , c = () => pt(d => {
          var f;
          return this.getAnimationState(d) === "paused" && ((f = this.getAxisMotionValue(d).animation) == null ? void 0 : f.play())
      }
      )
        , {dragSnapToOrigin: u} = this.getProps();
      this.panSession = new T1(t,{
          onSessionStart: o,
          onStart: s,
          onMove: a,
          onSessionEnd: l,
          resumeAnimation: c
      },{
          transformPagePoint: this.visualElement.getTransformPagePoint(),
          dragSnapToOrigin: u,
          distanceThreshold: r,
          contextWindow: P1(this.visualElement),
          element: this.visualElement.current
      })
  }
  stop(t, n) {
      const r = t || this.latestPointerEvent
        , i = n || this.latestPanInfo
        , o = this.isDragging;
      if (this.cancel(),
      !o || !i || !r)
          return;
      const {velocity: s} = i;
      this.startAnimation(s);
      const {onDragEnd: a} = this.getProps();
      a && ue.postRender( () => a(r, i))
  }
  cancel() {
      this.isDragging = !1;
      const {projection: t, animationState: n} = this.visualElement;
      t && (t.isAnimationBlocked = !1),
      this.panSession && this.panSession.end(),
      this.panSession = void 0;
      const {dragPropagation: r} = this.getProps();
      !r && this.openDragLock && (this.openDragLock(),
      this.openDragLock = null),
      n && n.setActive("whileDrag", !1)
  }
  updateAxis(t, n, r) {
      const {drag: i} = this.getProps();
      if (!r || !Zs(t, i, this.currentDirection))
          return;
      const o = this.getAxisMotionValue(t);
      let s = this.originPoint[t] + r[t];
      this.constraints && this.constraints[t] && (s = _M(s, this.constraints[t], this.elastic[t])),
      o.set(s)
  }
  resolveConstraints() {
      var o;
      const {dragConstraints: t, dragElastic: n} = this.getProps()
        , r = this.visualElement.projection && !this.visualElement.projection.layout ? this.visualElement.projection.measure(!1) : (o = this.visualElement.projection) == null ? void 0 : o.layout
        , i = this.constraints;
      t && xo(t) ? this.constraints || (this.constraints = this.resolveRefConstraints()) : t && r ? this.constraints = VM(r.layoutBox, t) : this.constraints = !1,
      this.elastic = UM(n),
      i !== this.constraints && r && this.constraints && !this.hasMutatedConstraints && pt(s => {
          this.constraints !== !1 && this.getAxisMotionValue(s) && (this.constraints[s] = $M(r.layoutBox[s], this.constraints[s]))
      }
      )
  }
  resolveRefConstraints() {
      const {dragConstraints: t, onMeasureDragConstraints: n} = this.getProps();
      if (!t || !xo(t))
          return !1;
      const r = t.current;
      Bi(r !== null, "If `dragConstraints` is set as a React ref, that ref must be passed to another component's `ref` prop.", "drag-constraints-ref");
      const {projection: i} = this.visualElement;
      if (!i || !i.layout)
          return !1;
      const o = GR(r, i.root, this.visualElement.getTransformPagePoint());
      let s = FM(i.layout.layoutBox, o);
      if (n) {
          const a = n(HR(s));
          this.hasMutatedConstraints = !!a,
          a && (s = Qw(a))
      }
      return s
  }
  startAnimation(t) {
      const {drag: n, dragMomentum: r, dragElastic: i, dragTransition: o, dragSnapToOrigin: s, onDragTransitionEnd: a} = this.getProps()
        , l = this.constraints || {}
        , c = pt(u => {
          if (!Zs(u, n, this.currentDirection))
              return;
          let d = l && l[u] || {};
          s && (d = {
              min: 0,
              max: 0
          });
          const f = i ? 200 : 1e6
            , p = i ? 40 : 1e7
            , b = {
              type: "inertia",
              velocity: r ? t[u] : 0,
              bounceStiffness: f,
              bounceDamping: p,
              timeConstant: 750,
              restDelta: 1,
              restSpeed: 10,
              ...o,
              ...d
          };
          return this.startAxisValueAnimation(u, b)
      }
      );
      return Promise.all(c).then(a)
  }
  startAxisValueAnimation(t, n) {
      const r = this.getAxisMotionValue(t);
      return ld(this.visualElement, t),
      r.start(th(t, r, 0, n, this.visualElement, !1))
  }
  stopAnimation() {
      pt(t => this.getAxisMotionValue(t).stop())
  }
  pauseAnimation() {
      pt(t => {
          var n;
          return (n = this.getAxisMotionValue(t).animation) == null ? void 0 : n.pause()
      }
      )
  }
  getAnimationState(t) {
      var n;
      return (n = this.getAxisMotionValue(t).animation) == null ? void 0 : n.state
  }
  getAxisMotionValue(t) {
      const n = `_drag${t.toUpperCase()}`
        , r = this.visualElement.getProps()
        , i = r[n];
      return i || this.visualElement.getValue(t, (r.initial ? r.initial[t] : void 0) || 0)
  }
  snapToCursor(t) {
      pt(n => {
          const {drag: r} = this.getProps();
          if (!Zs(n, r, this.currentDirection))
              return;
          const {projection: i} = this.visualElement
            , o = this.getAxisMotionValue(n);
          if (i && i.layout) {
              const {min: s, max: a} = i.layout.layoutBox[n]
                , l = o.get() || 0;
              o.set(t[n] - me(s, a, .5) + l)
          }
      }
      )
  }
  scalePositionWithinConstraints() {
      if (!this.visualElement.current)
          return;
      const {drag: t, dragConstraints: n} = this.getProps()
        , {projection: r} = this.visualElement;
      if (!xo(n) || !r || !this.constraints)
          return;
      this.stopAnimation();
      const i = {
          x: 0,
          y: 0
      };
      pt(s => {
          const a = this.getAxisMotionValue(s);
          if (a && this.constraints !== !1) {
              const l = a.get();
              i[s] = BM({
                  min: l,
                  max: l
              }, this.constraints[s])
          }
      }
      );
      const {transformTemplate: o} = this.visualElement.getProps();
      this.visualElement.current.style.transform = o ? o({}, "") : "none",
      r.root && r.root.updateScroll(),
      r.updateLayout(),
      this.resolveConstraints(),
      pt(s => {
          if (!Zs(s, t, null))
              return;
          const a = this.getAxisMotionValue(s)
            , {min: l, max: c} = this.constraints[s];
          a.set(me(l, c, i[s]))
      }
      )
  }
  addListeners() {
      if (!this.visualElement.current)
          return;
      WM.set(this.visualElement, this);
      const t = this.visualElement.current
        , n = Do(t, "pointerdown", l => {
          const {drag: c, dragListener: u=!0} = this.getProps();
          c && u && !Uw(l.target) && this.start(l)
      }
      )
        , r = () => {
          const {dragConstraints: l} = this.getProps();
          xo(l) && l.current && (this.constraints = this.resolveRefConstraints())
      }
        , {projection: i} = this.visualElement
        , o = i.addEventListener("measure", r);
      i && !i.layout && (i.root && i.root.updateScroll(),
      i.updateLayout()),
      ue.read(r);
      const s = os(window, "resize", () => this.scalePositionWithinConstraints())
        , a = i.addEventListener("didUpdate", ({delta: l, hasLayoutChanged: c}) => {
          this.isDragging && c && (pt(u => {
              const d = this.getAxisMotionValue(u);
              d && (this.originPoint[u] += l[u].translate,
              d.set(d.get() + l[u].translate))
          }
          ),
          this.visualElement.render())
      }
      );
      return () => {
          s(),
          n(),
          o(),
          a && a()
      }
  }
  getProps() {
      const t = this.visualElement.getProps()
        , {drag: n=!1, dragDirectionLock: r=!1, dragPropagation: i=!1, dragConstraints: o=!1, dragElastic: s=md, dragMomentum: a=!0} = t;
      return {
          ...t,
          drag: n,
          dragDirectionLock: r,
          dragPropagation: i,
          dragConstraints: o,
          dragElastic: s,
          dragMomentum: a
      }
  }
}
function Zs(e, t, n) {
  return (t === !0 || t === e) && (n === null || n === e)
}
function KM(e, t=10) {
  let n = null;
  return Math.abs(e.y) > t ? n = "y" : Math.abs(e.x) > t && (n = "x"),
  n
}
class qM extends pr {
  constructor(t) {
      super(t),
      this.removeGroupControls = bt,
      this.removeListeners = bt,
      this.controls = new HM(t)
  }
  mount() {
      const {dragControls: t} = this.node.getProps();
      t && (this.removeGroupControls = t.subscribe(this.controls)),
      this.removeListeners = this.controls.addListeners() || bt
  }
  update() {
      const {dragControls: t} = this.node.getProps()
        , {dragControls: n} = this.node.prevProps || {};
      t !== n && (this.removeGroupControls(),
      t && (this.removeGroupControls = t.subscribe(this.controls)))
  }
  unmount() {
      this.removeGroupControls(),
      this.removeListeners()
  }
}
const Og = e => (t, n) => {
  e && ue.postRender( () => e(t, n))
}
;
class GM extends pr {
  constructor() {
      super(...arguments),
      this.removePointerDownListener = bt
  }
  onPointerDown(t) {
      this.session = new T1(t,this.createPanHandlers(),{
          transformPagePoint: this.node.getTransformPagePoint(),
          contextWindow: P1(this.node)
      })
  }
  createPanHandlers() {
      const {onPanSessionStart: t, onPanStart: n, onPan: r, onPanEnd: i} = this.node.getProps();
      return {
          onSessionStart: Og(t),
          onStart: Og(n),
          onMove: r,
          onEnd: (o, s) => {
              delete this.session,
              i && ue.postRender( () => i(o, s))
          }
      }
  }
  mount() {
      this.removePointerDownListener = Do(this.node.current, "pointerdown", t => this.onPointerDown(t))
  }
  update() {
      this.session && this.session.updateHandlers(this.createPanHandlers())
  }
  unmount() {
      this.removePointerDownListener(),
      this.session && this.session.end()
  }
}
let _c = !1;
class QM extends x.Component {
  componentDidMount() {
      const {visualElement: t, layoutGroup: n, switchLayoutGroup: r, layoutId: i} = this.props
        , {projection: o} = t;
      o && (n.group && n.group.add(o),
      r && r.register && i && r.register(o),
      _c && o.root.didUpdate(),
      o.addEventListener("animationComplete", () => {
          this.safeToRemove()
      }
      ),
      o.setOptions({
          ...o.options,
          onExitComplete: () => this.safeToRemove()
      })),
      ga.hasEverUpdated = !0
  }
  getSnapshotBeforeUpdate(t) {
      const {layoutDependency: n, visualElement: r, drag: i, isPresent: o} = this.props
        , {projection: s} = r;
      return s && (s.isPresent = o,
      _c = !0,
      i || t.layoutDependency !== n || n === void 0 || t.isPresent !== o ? s.willUpdate() : this.safeToRemove(),
      t.isPresent !== o && (o ? s.promote() : s.relegate() || ue.postRender( () => {
          const a = s.getStack();
          (!a || !a.members.length) && this.safeToRemove()
      }
      ))),
      null
  }
  componentDidUpdate() {
      const {projection: t} = this.props.visualElement;
      t && (t.root.didUpdate(),
      oh.postRender( () => {
          !t.currentAnimation && t.isLead() && this.safeToRemove()
      }
      ))
  }
  componentWillUnmount() {
      const {visualElement: t, layoutGroup: n, switchLayoutGroup: r} = this.props
        , {projection: i} = t;
      _c = !0,
      i && (i.scheduleCheckAfterUnmount(),
      n && n.group && n.group.remove(i),
      r && r.deregister && r.deregister(i))
  }
  safeToRemove() {
      const {safeToRemove: t} = this.props;
      t && t()
  }
  render() {
      return null
  }
}
function N1(e) {
  const [t,n] = y1()
    , r = x.useContext(zf);
  return h.jsx(QM, {
      ...e,
      layoutGroup: r,
      switchLayoutGroup: x.useContext(k1),
      isPresent: t,
      safeToRemove: n
  })
}
const YM = {
  pan: {
      Feature: GM
  },
  drag: {
      Feature: qM,
      ProjectionNode: g1,
      MeasureLayout: N1
  }
};
function zg(e, t, n) {
  const {props: r} = e;
  e.animationState && r.whileHover && e.animationState.setActive("whileHover", n === "Start");
  const i = "onHover" + n
    , o = r[i];
  o && ue.postRender( () => o(t, ws(t)))
}
class ZM extends pr {
  mount() {
      const {current: t} = this.node;
      t && (this.unmount = MR(t, (n, r) => (zg(this.node, r, "Start"),
      i => zg(this.node, i, "End"))))
  }
  unmount() {}
}
class XM extends pr {
  constructor() {
      super(...arguments),
      this.isActive = !1
  }
  onFocus() {
      let t = !1;
      try {
          t = this.node.current.matches(":focus-visible")
      } catch {
          t = !0
      }
      !t || !this.node.animationState || (this.node.animationState.setActive("whileFocus", !0),
      this.isActive = !0)
  }
  onBlur() {
      !this.isActive || !this.node.animationState || (this.node.animationState.setActive("whileFocus", !1),
      this.isActive = !1)
  }
  mount() {
      this.unmount = ys(os(this.node.current, "focus", () => this.onFocus()), os(this.node.current, "blur", () => this.onBlur()))
  }
  unmount() {}
}
function _g(e, t, n) {
  const {props: r} = e;
  if (e.current instanceof HTMLButtonElement && e.current.disabled)
      return;
  e.animationState && r.whileTap && e.animationState.setActive("whileTap", n === "Start");
  const i = "onTap" + (n === "End" ? "" : n)
    , o = r[i];
  o && ue.postRender( () => o(t, ws(t)))
}
class JM extends pr {
  mount() {
      const {current: t} = this.node;
      t && (this.unmount = LR(t, (n, r) => (_g(this.node, r, "Start"),
      (i, {success: o}) => _g(this.node, i, o ? "End" : "Cancel")), {
          useGlobalTarget: this.node.props.globalTapTarget
      }))
  }
  unmount() {}
}
const gd = new WeakMap
, Vc = new WeakMap
, eD = e => {
  const t = gd.get(e.target);
  t && t(e)
}
, tD = e => {
  e.forEach(eD)
}
;
function nD({root: e, ...t}) {
  const n = e || document;
  Vc.has(n) || Vc.set(n, {});
  const r = Vc.get(n)
    , i = JSON.stringify(t);
  return r[i] || (r[i] = new IntersectionObserver(tD,{
      root: e,
      ...t
  })),
  r[i]
}
function rD(e, t, n) {
  const r = nD(t);
  return gd.set(e, n),
  r.observe(e),
  () => {
      gd.delete(e),
      r.unobserve(e)
  }
}
const iD = {
  some: 0,
  all: 1
};
class oD extends pr {
  constructor() {
      super(...arguments),
      this.hasEnteredView = !1,
      this.isInView = !1
  }
  startObserver() {
      this.unmount();
      const {viewport: t={}} = this.node.getProps()
        , {root: n, margin: r, amount: i="some", once: o} = t
        , s = {
          root: n ? n.current : void 0,
          rootMargin: r,
          threshold: typeof i == "number" ? i : iD[i]
      }
        , a = l => {
          const {isIntersecting: c} = l;
          if (this.isInView === c || (this.isInView = c,
          o && !c && this.hasEnteredView))
              return;
          c && (this.hasEnteredView = !0),
          this.node.animationState && this.node.animationState.setActive("whileInView", c);
          const {onViewportEnter: u, onViewportLeave: d} = this.node.getProps()
            , f = c ? u : d;
          f && f(l)
      }
      ;
      return rD(this.node.current, s, a)
  }
  mount() {
      this.startObserver()
  }
  update() {
      if (typeof IntersectionObserver > "u")
          return;
      const {props: t, prevProps: n} = this.node;
      ["amount", "margin", "root"].some(sD(t, n)) && this.startObserver()
  }
  unmount() {}
}
function sD({viewport: e={}}, {viewport: t={}}={}) {
  return n => e[n] !== t[n]
}
const aD = {
  inView: {
      Feature: oD
  },
  tap: {
      Feature: JM
  },
  focus: {
      Feature: XM
  },
  hover: {
      Feature: ZM
  }
}
, lD = {
  layout: {
      ProjectionNode: g1,
      MeasureLayout: N1
  }
}
, cD = {
  ...DM,
  ...aD,
  ...YM,
  ...lD
}
, _ = AM(cD, NM)
, uD = {
  some: 0,
  all: 1
};
function dD(e, t, {root: n, margin: r, amount: i="some"}={}) {
  const o = zw(e)
    , s = new WeakMap
    , a = c => {
      c.forEach(u => {
          const d = s.get(u.target);
          if (u.isIntersecting !== !!d)
              if (u.isIntersecting) {
                  const f = t(u.target, u);
                  typeof f == "function" ? s.set(u.target, f) : l.unobserve(u.target)
              } else
                  typeof d == "function" && (d(u),
                  s.delete(u.target))
      }
      )
  }
    , l = new IntersectionObserver(a,{
      root: n,
      rootMargin: r,
      threshold: typeof i == "number" ? i : uD[i]
  });
  return o.forEach(c => l.observe(c)),
  () => l.disconnect()
}
function bs(e, {root: t, margin: n, amount: r, once: i=!1, initial: o=!1}={}) {
  const [s,a] = x.useState(o);
  return x.useEffect( () => {
      if (!e.current || i && s)
          return;
      const l = () => (a(!0),
      i ? void 0 : () => a(!1))
        , c = {
          root: t && t.current || void 0,
          margin: n,
          amount: r
      };
      return dD(e.current, l, c)
  }
  , [t, e, n, i, r]),
  s
}
const fD = {
  nav: {
      features: {
          fr: "Fonctionnalités",
          en: "Features"
      },
      pricing: {
          fr: "Tarifs",
          en: "Pricing"
      },
      faq: {
          fr: "FAQ",
          en: "FAQ"
      },
      waitlist: {
          fr: "Rejoindre la Waitlist",
          en: "Join Waitlist"
      }
  },
  hero: {
      badge: {
          fr: "Lancement Q2 2025",
          en: "Launching Q2 2025"
      },
      headline1: {
          fr: "La plateforme #1",
          en: "The #1 platform"
      },
      headline2: {
          fr: "du closing.",
          en: "for closing."
      },
      rotatingPrefix: {
          fr: "Le CRM tout-en-un pour",
          en: "The all-in-one CRM for"
      },
      rotatingWords: {
          fr: ["Infopreneurs", "Coachs", "Agences", "Closeurs"],
          en: ["Infopreneurs", "Coaches", "Agencies", "Sales Reps"]
      },
      subheadline: {
          fr: "Formulaires intelligents, prise de RDV IA, visio intégrée, CRM simplifié. Remplace ta stack complète et close plus de deals.",
          en: "Smart forms, AI scheduling, integrated video calls, simplified CRM. Replace your entire stack and close more deals."
      },
      ctaPrimary: {
          fr: "Rejoindre la Waitlist",
          en: "Join the Waitlist"
      },
      ctaSecondary: {
          fr: "Calculer mes économies",
          en: "Calculate my savings"
      },
      stats: {
          setup: {
              fr: "Setup en 15 min",
              en: "15min setup"
          },
          saved: {
              fr: "+30% taux de show",
              en: "+30% show rate"
          },
          price: {
              fr: "Dès 97€/mois",
              en: "From 97€/month"
          }
      },
      trustedBy: {
          fr: "Ils nous font déjà confiance",
          en: "Already trusted by"
      }
  },
  calculator: {
      badge: {
          fr: "Calculateur ROI",
          en: "ROI Calculator"
      },
      headline: {
          fr: "Calcule tes économies",
          en: "Calculate your savings"
      },
      headlineSub: {
          fr: "avec KLOZD",
          en: "with KLOZD"
      },
      description: {
          fr: "Compare ta stack actuelle vs KLOZD. Vois combien tu économises chaque mois.",
          en: "Compare your current stack vs KLOZD. See how much you save each month."
      },
      currentStack: {
          fr: "Ta stack actuelle (€/mois)",
          en: "Your current stack (€/month)"
      },
      leadsLabel: {
          fr: "Leads traités par mois",
          en: "Leads processed per month"
      },
      timeSaved: {
          fr: "économisées par mois",
          en: "saved per month"
      },
      moneySaved: {
          fr: "d'économies/an",
          en: "savings/year"
      },
      conversionBoost: {
          fr: "de conversions",
          en: "conversions"
      },
      cta: {
          fr: "Commencer à économiser",
          en: "Start saving"
      },
      note: {
          fr: "*vs stack classique HubSpot + Calendly + Zoom",
          en: "*vs classic HubSpot + Calendly + Zoom stack"
      }
  },
  features: {
      forms: {
          tag: {
              fr: "Formulaires",
              en: "Forms"
          },
          headline: {
              fr: `Capture chaque lead.
Même les abandons.`,
              en: `Capture every lead.
Even abandonments.`
          },
          description: {
              fr: "Formulaires intelligents avec logique conditionnelle, scoring automatique, et capture des leads qui abandonnent. Plus jamais de prospect perdu.",
              en: "Smart forms with conditional logic, automatic scoring, and capture of leads who abandon. Never lose a prospect again."
          },
          benefits: {
              fr: ["Logique conditionnelle : qualifié → calendrier, disqualifié → nurturing", "Capture automatique des abandons (récupère 15-20% des leads)", "Scoring IA pour prioriser les meilleurs prospects"],
              en: ["Conditional logic: qualified → calendar, disqualified → nurturing", "Automatic abandonment capture (recover 15-20% of leads)", "AI scoring to prioritize the best prospects"]
          }
      },
      scheduling: {
          tag: {
              fr: "Scheduling IA",
              en: "AI Scheduling"
          },
          headline: {
              fr: `Attribution intelligente.
Chaque lead au bon closeur.`,
              en: `Smart attribution.
Each lead to the right closer.`
          },
          description: {
              fr: "L'IA analyse le profil du prospect et l'assigne au closeur ayant le meilleur taux de closing pour ce type de deal. Fini le round robin aveugle.",
              en: "AI analyzes the prospect profile and assigns them to the closer with the best closing rate for this type of deal. No more blind round robin."
          },
          benefits: {
              fr: ["Attribution IA basée sur le match profil/closeur", "Confirmations automatiques Email, SMS, WhatsApp", "+30% de taux de show avec rappels intelligents"],
              en: ["AI attribution based on profile/closer match", "Automatic Email, SMS, WhatsApp confirmations", "+30% show rate with smart reminders"]
          }
      },
      video: {
          tag: {
              fr: "Visio Intégrée",
              en: "Integrated Video"
          },
          headline: {
              fr: `Tout en un clic.
Pendant l'appel.`,
              en: `Everything in one click.
During the call.`
          },
          description: {
              fr: "Visio intégrée avec panel latéral : infos prospect, score IA, réponses formulaire, notes en temps réel. Tu as tout sous les yeux pour closer.",
              en: "Integrated video with side panel: prospect info, AI score, form responses, real-time notes. Everything you need to close."
          },
          benefits: {
              fr: ["Panel latéral avec toutes les infos prospect", "Score de probabilité de closing en temps réel", "Logging du résultat en < 30 secondes après l'appel"],
              en: ["Side panel with all prospect info", "Real-time closing probability score", "Result logging in < 30 seconds after the call"]
          }
      },
      crm: {
          tag: {
              fr: "CRM Inbox Zero",
              en: "Inbox Zero CRM"
          },
          headline: {
              fr: `3 vues. Zéro complexité.
Tu sais quoi faire.`,
              en: `3 views. Zero complexity.
You know what to do.`
          },
          description: {
              fr: "Oublie les 15 colonnes Kanban. KLOZD INBOX te dit exactement quoi faire aujourd'hui. Vue Équipe montre qui fait quoi. Pipeline donne la vue d'ensemble.",
              en: "Forget 15 Kanban columns. KLOZD INBOX tells you exactly what to do today. Team View shows who does what. Pipeline gives the overview."
          },
          benefits: {
              fr: ["Ma Inbox : actions du jour, triées par urgence", "Vue Équipe : qui fait quoi en temps réel", "Actions en 1 clic (vs 6 clics sur HubSpot)"],
              en: ["My Inbox: today's actions, sorted by urgency", "Team View: who does what in real-time", "1-click actions (vs 6 clicks on HubSpot)"]
          }
      },
      ai: {
          tag: {
              fr: "IA Prédictive",
              en: "Predictive AI"
          },
          headline: {
              fr: `L'IA te dit qui closer.
Et comment.`,
              en: `AI tells you who to close.
And how.`
          },
          description: {
              fr: "Score de probabilité de closing, suggestions de messages pré-écrits, résumé automatique d'appel. L'IA travaille pour toi, pas l'inverse.",
              en: "Closing probability score, pre-written message suggestions, automatic call summary. AI works for you, not the other way around."
          },
          benefits: {
              fr: ["Prédiction de closing (75% précision)", "Messages suggérés par l'IA selon le contexte", "Résumé auto d'appel avec objections et next steps"],
              en: ["Closing prediction (75% accuracy)", "AI-suggested messages based on context", "Auto call summary with objections and next steps"]
          }
      },
      dashboard: {
          tag: {
              fr: "Dashboard",
              en: "Dashboard"
          },
          headline: {
              fr: `Chaque KPI.
En temps réel.`,
              en: `Every KPI.
In real-time.`
          },
          description: {
              fr: "Dashboard CEO : vue funnel complète, performance par closeur, CA en cours. Dashboard Closeur : tes stats, tes appels du jour, ton classement.",
              en: "CEO Dashboard: complete funnel view, performance by closer, current revenue. Closer Dashboard: your stats, today's calls, your ranking."
          },
          benefits: {
              fr: ["Taux de conversion à chaque étape du funnel", "Performance par closeur avec gamification", "Alertes proactives : deals bloqués, no-shows élevés"],
              en: ["Conversion rate at each funnel stage", "Performance by closer with gamification", "Proactive alerts: stuck deals, high no-shows"]
          }
      },
      gamification: {
          tag: {
              fr: "Gamification",
              en: "Gamification"
          },
          headline: {
              fr: `Motive tes équipes.
Comme un jeu.`,
              en: `Motivate your teams.
Like a game.`
          },
          description: {
              fr: "Classements, badges, objectifs personnalisés. Transforme ton équipe en machine de closing avec une compétition saine et motivante.",
              en: "Leaderboards, badges, personalized goals. Turn your team into a closing machine with healthy and motivating competition."
          },
          benefits: {
              fr: ["Leaderboard temps réel par closeur", "Badges et récompenses automatiques", "Défis hebdo et objectifs personnalisés"],
              en: ["Real-time leaderboard by closer", "Automatic badges and rewards", "Weekly challenges and personalized goals"]
          }
      },
      salesPages: {
          tag: {
              fr: "Pages IA",
              en: "AI Pages"
          },
          headline: {
              fr: `Génère tes pages.
En 2 minutes.`,
              en: `Generate your pages.
In 2 minutes.`
          },
          description: {
              fr: "L'IA génère des pages de vente optimisées pour la conversion. Fini systeme.io et ClickFunnels. Tout intégré nativement.",
              en: "AI generates conversion-optimized sales pages. No more systeme.io and ClickFunnels. Everything natively integrated."
          },
          benefits: {
              fr: ["Génération IA de pages de vente", "Templates optimisés pour la conversion", "Intégration native avec ton CRM"],
              en: ["AI-generated sales pages", "Conversion-optimized templates", "Native integration with your CRM"]
          }
      }
  },
  comparison: {
      badge: {
          fr: "Comparaison",
          en: "Comparison"
      },
      headline: {
          fr: "KLOZD vs Stack",
          en: "KLOZD vs Stack"
      },
      headlineSub: {
          fr: "traditionnelle",
          en: "traditional"
      },
      description: {
          fr: "Pourquoi les infopreneurs passent de 5 outils à KLOZD",
          en: "Why infopreneurs switch from 5 tools to KLOZD"
      },
      featureLabel: {
          fr: "Fonctionnalité",
          en: "Feature"
      },
      traditionalLabel: {
          fr: "Stack classique",
          en: "Classic stack"
      },
      items: {
          fr: ["Formulaires + scoring automatique", "Scheduling avec attribution IA", "Visio intégrée avec panel prospect", "CRM Inbox Zero (3 vues simples)", "IA de prédiction de closing", "Capture des abandons formulaire", "Confirmations multi-canal auto", "Prix tout compris < 300€/mois"],
          en: ["Forms + automatic scoring", "Scheduling with AI attribution", "Integrated video with prospect panel", "Inbox Zero CRM (3 simple views)", "Closing prediction AI", "Form abandonment capture", "Multi-channel auto confirmations", "All-inclusive price < 300€/month"]
      },
      stats: {
          time: {
              value: "5h",
              label: {
                  fr: "Gagnées/semaine",
                  en: "Saved/week"
              }
          },
          show: {
              value: "+30%",
              label: {
                  fr: "Taux de show",
                  en: "Show rate"
              }
          },
          closing: {
              value: "+15%",
              label: {
                  fr: "Taux closing",
                  en: "Closing rate"
              }
          },
          savings: {
              value: "60-80%",
              label: {
                  fr: "Économies",
                  en: "Savings"
              }
          }
      }
  },
  tools: {
      headline: {
          fr: `Arrête de payer 5 outils.
Passe à KLOZD.`,
          en: `Stop paying for 5 tools.
Switch to KLOZD.`
      },
      totalOld: {
          fr: "/mois minimum",
          en: "/month minimum"
      },
      oldTotal: {
          fr: "220€/mois = 2,640€/an",
          en: "220€/month = 2,640€/year"
      },
      klozdPrice: {
          fr: "/mois tout compris",
          en: "/month all-inclusive"
      },
      savings: {
          fr: "Économise 1,600€+/an",
          en: "Save 1,600€+/year"
      },
      items: [{
          name: "Jotform",
          price: "30€",
          category: {
              fr: "Formulaires",
              en: "Forms"
          }
      }, {
          name: "Calendly",
          price: "15€",
          category: {
              fr: "Scheduling",
              en: "Scheduling"
          }
      }, {
          name: "Zoom",
          price: "15€",
          category: {
              fr: "Visio",
              en: "Video"
          }
      }, {
          name: "HubSpot",
          price: "90€",
          category: {
              fr: "CRM",
              en: "CRM"
          }
      }, {
          name: "Twilio",
          price: "30€",
          category: {
              fr: "SMS/WhatsApp",
              en: "SMS/WhatsApp"
          }
      }, {
          name: "Zapier",
          price: "40€",
          category: {
              fr: "Automations",
              en: "Automations"
          }
      }]
  },
  testimonials: {
      badge: {
          fr: "Témoignages",
          en: "Testimonials"
      },
      headline: {
          fr: "Ils ont choisi KLOZD.",
          en: "They chose KLOZD."
      },
      headlineSub: {
          fr: "Et ils en parlent.",
          en: "And they talk about it."
      },
      description: {
          fr: "Rejoins les infopreneurs qui ont simplifié leur gestion commerciale.",
          en: "Join infopreneurs who simplified their sales management."
      },
      waitlistCount: {
          fr: "entrepreneurs sur la waitlist",
          en: "entrepreneurs on the waitlist"
      },
      trustedBy: {
          fr: "Ils nous font confiance",
          en: "They trust us"
      },
      items: {
          fr: [{
              name: "Zineb A.",
              role: "CEO, Coaching Business",
              quote: "Je passais 5h/semaine à jongler entre mes outils. Avec KLOZD, tout est centralisé. Mon équipe de 3 closeuses est enfin synchronisée."
          }, {
              name: "Thomas L.",
              role: "Infopreneur, Formation en ligne",
              quote: "Le taux de show est passé de 65% à 85%. Les rappels automatiques font vraiment la différence. Et l'IA d'attribution est bluffante."
          }, {
              name: "Sarah M.",
              role: "Closeuse, Agence Marketing",
              quote: "L'interface est simple, pas comme HubSpot. Je log mes appels en 30 secondes et je ne rate plus jamais un follow-up."
          }],
          en: [{
              name: "Zineb A.",
              role: "CEO, Coaching Business",
              quote: "I spent 5h/week juggling between my tools. With KLOZD, everything is centralized. My team of 3 closers is finally synchronized."
          }, {
              name: "Thomas L.",
              role: "Infopreneur, Online Training",
              quote: "Show rate went from 65% to 85%. Automatic reminders really make a difference. And the attribution AI is mind-blowing."
          }, {
              name: "Sarah M.",
              role: "Closer, Marketing Agency",
              quote: "The interface is simple, not like HubSpot. I log my calls in 30 seconds and never miss a follow-up anymore."
          }]
      }
  },
  pricing: {
      badge: {
          fr: "Tarifs",
          en: "Pricing"
      },
      headline: {
          fr: "Des tarifs",
          en: "Pricing that"
      },
      headlineSub: {
          fr: "qui ont du sens",
          en: "makes sense"
      },
      description: {
          fr: "Tout inclus. Pas de frais cachés. Passe à l'échelle quand tu veux.",
          en: "All-inclusive. No hidden fees. Scale when you want."
      },
      monthly: {
          fr: "Mensuel",
          en: "Monthly"
      },
      yearly: {
          fr: "Annuel",
          en: "Yearly"
      },
      yearlyDiscount: {
          fr: "-20%",
          en: "-20%"
      },
      billedYearly: {
          fr: "Facturé annuellement",
          en: "Billed annually"
      },
      cta: {
          fr: "Rejoindre la Waitlist",
          en: "Join the Waitlist"
      },
      earlyBird: {
          fr: "Early bird : -50% à vie pour les 500 premiers",
          en: "Early bird: -50% lifetime for the first 500"
      },
      plans: {
          fr: [{
              name: "Starter",
              price: {
                  monthly: 97,
                  yearly: 78
              },
              description: "Pour les solopreneurs qui démarrent",
              features: ["1 utilisateur (closeur)", "500 leads/mois", "Formulaires intelligents", "Scheduling + Visio intégrée", "CRM Inbox Zero", "Confirmations Email", "Support email"]
          }, {
              name: "Pro",
              price: {
                  monthly: 197,
                  yearly: 158
              },
              description: "Pour les équipes sales en croissance",
              features: ["5 utilisateurs", "Leads illimités", "Tout Starter +", "Attribution IA des closeurs", "Prédiction de closing IA", "Confirmations SMS incluses", "Dashboard équipe", "Support prioritaire"],
              isPopular: !0
          }, {
              name: "Business",
              price: {
                  monthly: 297,
                  yearly: 238
              },
              description: "Pour les équipes ambitieuses",
              features: ["Utilisateurs illimités", "Tout Pro +", "WhatsApp confirmations", "API + Intégrations custom", "Rapports avancés", "Onboarding dédié", "Manager dédié"]
          }],
          en: [{
              name: "Starter",
              price: {
                  monthly: 97,
                  yearly: 78
              },
              description: "For solopreneurs getting started",
              features: ["1 user (closer)", "500 leads/month", "Smart forms", "Scheduling + Integrated video", "Inbox Zero CRM", "Email confirmations", "Email support"]
          }, {
              name: "Pro",
              price: {
                  monthly: 197,
                  yearly: 158
              },
              description: "For growing sales teams",
              features: ["5 users", "Unlimited leads", "Everything in Starter +", "AI closer attribution", "AI closing prediction", "SMS confirmations included", "Team dashboard", "Priority support"],
              isPopular: !0
          }, {
              name: "Business",
              price: {
                  monthly: 297,
                  yearly: 238
              },
              description: "For ambitious teams",
              features: ["Unlimited users", "Everything in Pro +", "WhatsApp confirmations", "API + Custom integrations", "Advanced reports", "Dedicated onboarding", "Dedicated manager"]
          }]
      }
  },
  faq: {
      headline: {
          fr: "Questions fréquentes",
          en: "Frequently asked questions"
      },
      items: {
          fr: [{
              question: "Quand KLOZD sera-t-il disponible ?",
              answer: "KLOZD lance en Q2 2025. Rejoins la waitlist maintenant pour bénéficier de -50% à vie et d'un accès prioritaire."
          }, {
              question: "C'est compliqué à mettre en place ?",
              answer: "Pas du tout ! KLOZD est conçu pour la simplicité. La plupart des utilisateurs sont opérationnels en 15 minutes. Notre wizard d'onboarding te guide à chaque étape."
          }, {
              question: "KLOZD remplace vraiment tous mes outils ?",
              answer: "Oui. Formulaires (Jotform), Scheduling (Calendly), Visio (Zoom), CRM (HubSpot), Notifications (Twilio). Tout est intégré nativement."
          }, {
              question: "Comment fonctionne l'IA d'attribution ?",
              answer: "L'IA analyse le profil du prospect (secteur, budget, urgence) et le compare aux forces de chaque closeur pour attribuer au meilleur match. Résultat : +15% de taux de closing."
          }, {
              question: "Est-ce que je peux essayer avant d'acheter ?",
              answer: "Absolument ! Tous les plans incluent 14 jours d'essai gratuit. Pas de carte de crédit requise pour commencer."
          }, {
              question: "Quelle est votre politique de remboursement ?",
              answer: "Garantie satisfait ou remboursé pendant 30 jours. Si KLOZD ne te convient pas, on te rembourse intégralement, sans questions."
          }],
          en: [{
              question: "When will KLOZD be available?",
              answer: "KLOZD launches in Q2 2025. Join the waitlist now to get -50% lifetime and priority access."
          }, {
              question: "Is it complicated to set up?",
              answer: "Not at all! KLOZD is designed for simplicity. Most users are operational in 15 minutes. Our onboarding wizard guides you through every step."
          }, {
              question: "Does KLOZD really replace all my tools?",
              answer: "Yes. Forms (Jotform), Scheduling (Calendly), Video (Zoom), CRM (HubSpot), Notifications (Twilio). Everything is natively integrated."
          }, {
              question: "How does the attribution AI work?",
              answer: "AI analyzes the prospect profile (industry, budget, urgency) and compares it to each closer's strengths to assign the best match. Result: +15% closing rate."
          }, {
              question: "Can I try before I buy?",
              answer: "Absolutely! All plans include a 14-day free trial. No credit card required to start."
          }, {
              question: "What's your refund policy?",
              answer: "30-day money-back guarantee. If KLOZD doesn't work for you, we'll refund you completely, no questions asked."
          }]
      }
  },
  finalCta: {
      badge: {
          fr: "Places limitées",
          en: "Limited spots"
      },
      headline: {
          fr: "Rejoins les",
          en: "Join the first"
      },
      headlineSub: {
          fr: "500 premiers",
          en: "500"
      },
      description: {
          fr: "-50% à vie, accès prioritaire, et influence sur les prochaines fonctionnalités.",
          en: "-50% lifetime, priority access, and influence on upcoming features."
      },
      spotsTaken: {
          fr: "places prises",
          en: "spots taken"
      },
      cta: {
          fr: "Réserver ma place",
          en: "Secure my spot"
      },
      noCreditCard: {
          fr: "Aucune carte de crédit requise",
          en: "No credit card required"
      },
      joinCount: {
          fr: "Rejoins",
          en: "Join"
      },
      entrepreneurs: {
          fr: "entrepreneurs",
          en: "entrepreneurs"
      }
  },
  footer: {
      tagline: {
          fr: "La plateforme sales tout-en-un pour infopreneurs et équipes commerciales.",
          en: "The all-in-one sales platform for infopreneurs and sales teams."
      },
      product: {
          fr: "Produit",
          en: "Product"
      },
      company: {
          fr: "Entreprise",
          en: "Company"
      },
      legal: {
          fr: "Légal",
          en: "Legal"
      },
      features: {
          fr: "Fonctionnalités",
          en: "Features"
      },
      roadmap: {
          fr: "Roadmap",
          en: "Roadmap"
      },
      about: {
          fr: "À propos",
          en: "About"
      },
      blog: {
          fr: "Blog",
          en: "Blog"
      },
      contact: {
          fr: "Contact",
          en: "Contact"
      },
      privacy: {
          fr: "Confidentialité",
          en: "Privacy"
      },
      terms: {
          fr: "CGU",
          en: "Terms"
      },
      copyright: {
          fr: "© 2025 KLOZD. Conçu pour les entrepreneurs qui veulent scaler.",
          en: "© 2025 KLOZD. Built for entrepreneurs who want to scale."
      }
  }
}
, R1 = x.createContext(void 0);
function hD({children: e}) {
  const [t,n] = x.useState("fr");
  return h.jsx(R1.Provider, {
      value: {
          language: t,
          setLanguage: n,
          t: fD
      },
      children: e
  })
}
function j1() {
  const e = x.useContext(R1);
  if (e === void 0)
      throw new Error("useLanguage must be used within a LanguageProvider");
  return e
}
function $t() {
  const {language: e, t} = j1();
  return {
      language: e,
      t,
      getText: r => r[e]
  }
}
const Vg = () => {
  const {language: e, setLanguage: t} = j1();
  return h.jsxs("div", {
      className: "flex items-center gap-1 bg-klozd-gray-100 rounded-full p-1",
      children: [h.jsxs("button", {
          onClick: () => t("fr"),
          className: `relative px-3 py-1 text-sm font-medium rounded-full transition-colors ${e === "fr" ? "text-white" : "text-klozd-gray-600 hover:text-klozd-black"}`,
          children: [e === "fr" && h.jsx(_.div, {
              layoutId: "language-toggle",
              className: "absolute inset-0 bg-klozd-black rounded-full",
              transition: {
                  type: "spring",
                  duration: .3
              }
          }), h.jsx("span", {
              className: "relative z-10",
              children: "FR"
          })]
      }), h.jsxs("button", {
          onClick: () => t("en"),
          className: `relative px-3 py-1 text-sm font-medium rounded-full transition-colors ${e === "en" ? "text-white" : "text-klozd-gray-600 hover:text-klozd-black"}`,
          children: [e === "en" && h.jsx(_.div, {
              layoutId: "language-toggle",
              className: "absolute inset-0 bg-klozd-black rounded-full",
              transition: {
                  type: "spring",
                  duration: .3
              }
          }), h.jsx("span", {
              className: "relative z-10",
              children: "EN"
          })]
      })]
  })
}
, pD = () => {
  const [e,t] = x.useState(!1)
    , [n,r] = x.useState(!1)
    , {language: i, t: o} = $t();
  x.useEffect( () => {
      const a = () => {
          t(window.scrollY > 10)
      }
      ;
      return window.addEventListener("scroll", a),
      () => window.removeEventListener("scroll", a)
  }
  , []);
  const s = [{
      name: o.nav.features[i],
      href: "#features"
  }, {
      name: o.nav.pricing[i],
      href: "#pricing"
  }, {
      name: o.nav.faq[i],
      href: "#faq"
  }];
  return h.jsx(_.nav, {
      initial: {
          y: -100
      },
      animate: {
          y: 0
      },
      transition: {
          duration: .5,
          ease: "easeOut"
      },
      className: `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${e ? "glass-nav" : "bg-transparent"}`,
      children: h.jsxs("div", {
          className: "container-klozd",
          children: [h.jsxs("div", {
              className: "flex items-center justify-between h-16 md:h-20",
              children: [h.jsx("a", {
                  href: "#",
                  className: "flex items-center gap-2",
                  children: h.jsx("span", {
                      className: "text-xl md:text-2xl font-bold text-klozd-black tracking-tight",
                      children: "KLOZD"
                  })
              }), h.jsx("div", {
                  className: "hidden md:flex items-center gap-10",
                  children: s.map(a => h.jsx("a", {
                      href: a.href,
                      className: "text-klozd-gray-600 hover:text-klozd-black transition-colors duration-200 font-medium",
                      children: a.name
                  }, a.name))
              }), h.jsxs("div", {
                  className: "hidden md:flex items-center gap-4",
                  children: [h.jsx(Vg, {}), h.jsx("a", {
                      href: "#waitlist",
                      className: "btn-primary text-sm",
                      children: o.nav.waitlist[i]
                  })]
              }), h.jsxs("div", {
                  className: "flex md:hidden items-center gap-3",
                  children: [h.jsx(Vg, {}), h.jsx("button", {
                      onClick: () => r(!n),
                      className: "p-2 text-klozd-black",
                      children: n ? h.jsx(Sf, {
                          size: 24
                      }) : h.jsx(hE, {
                          size: 24
                      })
                  })]
              })]
          }), n && h.jsx(_.div, {
              initial: {
                  opacity: 0,
                  height: 0
              },
              animate: {
                  opacity: 1,
                  height: "auto"
              },
              exit: {
                  opacity: 0,
                  height: 0
              },
              className: "md:hidden py-4 border-t border-border",
              children: h.jsxs("div", {
                  className: "flex flex-col gap-4",
                  children: [s.map(a => h.jsx("a", {
                      href: a.href,
                      onClick: () => r(!1),
                      className: "text-klozd-gray-600 hover:text-klozd-black transition-colors duration-200 font-medium py-2",
                      children: a.name
                  }, a.name)), h.jsx("a", {
                      href: "#waitlist",
                      onClick: () => r(!1),
                      className: "btn-primary text-center mt-2",
                      children: o.nav.waitlist[i]
                  })]
              })
          })]
      })
  })
}
, M1 = "/assets/mockup-crm-inbox-PKBX4j8L.png"
, mD = () => {
  const {language: e, t} = $t()
    , [n,r] = x.useState(0)
    , i = t.hero.rotatingWords[e];
  x.useEffect( () => {
      const s = setInterval( () => {
          r(a => (a + 1) % i.length)
      }
      , 2500);
      return () => clearInterval(s)
  }
  , [i.length]);
  const o = [{
      icon: pn,
      text: t.hero.stats.setup[e]
  }, {
      icon: pn,
      text: t.hero.stats.saved[e]
  }, {
      icon: pn,
      text: t.hero.stats.price[e]
  }];
  return h.jsx("section", {
      className: "min-h-screen flex items-center pt-20 md:pt-0 overflow-hidden",
      children: h.jsxs("div", {
          className: "container-klozd",
          children: [h.jsxs("div", {
              className: "grid lg:grid-cols-2 gap-12 lg:gap-16 items-center",
              children: [h.jsxs(_.div, {
                  initial: {
                      opacity: 0,
                      y: 30
                  },
                  animate: {
                      opacity: 1,
                      y: 0
                  },
                  transition: {
                      duration: .6,
                      delay: .2
                  },
                  className: "order-2 lg:order-1",
                  children: [h.jsxs(_.div, {
                      initial: {
                          opacity: 0,
                          y: 20
                      },
                      animate: {
                          opacity: 1,
                          y: 0
                      },
                      transition: {
                          duration: .5
                      },
                      className: "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-klozd-yellow/10 text-klozd-yellow text-sm font-medium mb-6",
                      children: [h.jsx(_.span, {
                          animate: {
                              scale: [1, 1.2, 1]
                          },
                          transition: {
                              duration: 2,
                              repeat: 1 / 0
                          },
                          children: h.jsx(_i, {
                              size: 14
                          })
                      }), t.hero.badge[e]]
                  }), h.jsxs("h1", {
                      className: "headline-hero mb-4",
                      children: [t.hero.headline1[e], h.jsx("br", {}), h.jsx("span", {
                          className: "text-klozd-yellow",
                          children: t.hero.headline2[e]
                      })]
                  }), h.jsxs("div", {
                      className: "text-xl md:text-2xl font-medium text-klozd-gray-600 mb-6",
                      children: [t.hero.rotatingPrefix[e], " ", h.jsxs("span", {
                          className: "relative inline-block min-w-[180px] md:min-w-[220px]",
                          children: [h.jsx(rM, {
                              mode: "wait",
                              children: h.jsx(_.span, {
                                  initial: {
                                      opacity: 0,
                                      y: 20
                                  },
                                  animate: {
                                      opacity: 1,
                                      y: 0
                                  },
                                  exit: {
                                      opacity: 0,
                                      y: -20
                                  },
                                  transition: {
                                      duration: .3
                                  },
                                  className: "text-klozd-yellow font-bold absolute left-0",
                                  children: i[n]
                              }, n)
                          }), h.jsx("span", {
                              className: "invisible",
                              children: i[0]
                          })]
                      })]
                  }), h.jsx("p", {
                      className: "body-large max-w-lg mb-8",
                      children: t.hero.subheadline[e]
                  }), h.jsxs("div", {
                      className: "flex flex-col sm:flex-row gap-4 mb-10",
                      children: [h.jsxs(_.a, {
                          href: "#waitlist",
                          className: "btn-primary gap-2 group",
                          whileHover: {
                              scale: 1.02
                          },
                          whileTap: {
                              scale: .98
                          },
                          children: [t.hero.ctaPrimary[e], h.jsx(F0, {
                              size: 18,
                              className: "group-hover:translate-x-1 transition-transform"
                          })]
                      }), h.jsx(_.a, {
                          href: "#calculator",
                          className: "btn-secondary",
                          whileHover: {
                              scale: 1.02
                          },
                          whileTap: {
                              scale: .98
                          },
                          children: t.hero.ctaSecondary[e]
                      })]
                  }), h.jsx("div", {
                      className: "flex flex-wrap gap-6",
                      children: o.map( (s, a) => h.jsxs(_.div, {
                          initial: {
                              opacity: 0,
                              y: 10
                          },
                          animate: {
                              opacity: 1,
                              y: 0
                          },
                          transition: {
                              duration: .4,
                              delay: .5 + a * .1
                          },
                          className: "flex items-center gap-2 text-klozd-gray-600 text-sm",
                          children: [h.jsx(s.icon, {
                              size: 16,
                              className: "text-klozd-yellow"
                          }), h.jsx("span", {
                              children: s.text
                          })]
                      }, a))
                  })]
              }), h.jsx(_.div, {
                  initial: {
                      opacity: 0,
                      x: 50
                  },
                  animate: {
                      opacity: 1,
                      x: 0
                  },
                  transition: {
                      duration: .7,
                      delay: .4
                  },
                  className: "order-1 lg:order-2",
                  children: h.jsxs("div", {
                      className: "relative",
                      children: [h.jsx(_.div, {
                          initial: {
                              opacity: 0,
                              x: -20
                          },
                          animate: {
                              opacity: 1,
                              x: 0
                          },
                          transition: {
                              duration: .5,
                              delay: .8
                          },
                          className: "absolute -left-4 top-1/4 z-10 bg-white rounded-xl shadow-xl p-4 border border-border hidden lg:block",
                          children: h.jsxs("div", {
                              className: "flex items-center gap-3",
                              children: [h.jsx("div", {
                                  className: "w-10 h-10 rounded-full bg-green-100 flex items-center justify-center",
                                  children: h.jsx(pn, {
                                      size: 20,
                                      className: "text-green-600"
                                  })
                              }), h.jsxs("div", {
                                  children: [h.jsx("p", {
                                      className: "font-semibold text-sm text-klozd-black",
                                      children: e === "fr" ? "Lead qualifié" : "Qualified lead"
                                  }), h.jsx("p", {
                                      className: "text-xs text-klozd-gray-600",
                                      children: "Marc D. - 8k€ - E-commerce"
                                  })]
                              })]
                          })
                      }), h.jsx(_.div, {
                          initial: {
                              opacity: 0,
                              x: 20
                          },
                          animate: {
                              opacity: 1,
                              x: 0
                          },
                          transition: {
                              duration: .5,
                              delay: 1
                          },
                          className: "absolute -right-4 bottom-1/3 z-10 bg-white rounded-xl shadow-xl p-4 border border-border hidden lg:block",
                          children: h.jsxs("div", {
                              className: "flex items-center gap-3",
                              children: [h.jsx("div", {
                                  className: "w-10 h-10 rounded-full bg-klozd-yellow/20 flex items-center justify-center",
                                  children: h.jsx(_i, {
                                      size: 20,
                                      className: "text-klozd-yellow"
                                  })
                              }), h.jsxs("div", {
                                  children: [h.jsx("p", {
                                      className: "font-semibold text-sm text-klozd-black",
                                      children: e === "fr" ? "Proba closing" : "Closing prob."
                                  }), h.jsx("p", {
                                      className: "text-xs text-klozd-gray-600",
                                      children: "75% - Julie assignée"
                                  })]
                              })]
                          })
                      }), h.jsx("div", {
                          className: "animate-float",
                          children: h.jsx("img", {
                              src: M1,
                              alt: "KLOZD CRM Inbox Zero",
                              className: "mockup-shadow w-full"
                          })
                      }), h.jsx("div", {
                          className: "absolute inset-0 -z-10 bg-gradient-to-br from-klozd-yellow/20 via-transparent to-transparent blur-3xl scale-150"
                      })]
                  })
              })]
          })]
      })
  })
}
;
function D1(e, [t,n]) {
  return Math.min(n, Math.max(t, e))
}
var gD = x.createContext(void 0);
function I1(e) {
  const t = x.useContext(gD);
  return e || t || "ltr"
}
function L1(e) {
  const t = x.useRef({
      value: e,
      previous: e
  });
  return x.useMemo( () => (t.current.value !== e && (t.current.previous = t.current.value,
  t.current.value = e),
  t.current.previous), [e])
}
var O1 = ["PageUp", "PageDown"]
, z1 = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]
, _1 = {
  "from-left": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-right": ["Home", "PageDown", "ArrowDown", "ArrowRight"],
  "from-bottom": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-top": ["Home", "PageDown", "ArrowUp", "ArrowLeft"]
}
, Ji = "Slider"
, [yd,yD,vD] = yf(Ji)
, [V1,NI] = hr(Ji, [vD])
, [xD,Ll] = V1(Ji)
, F1 = x.forwardRef( (e, t) => {
  const {name: n, min: r=0, max: i=100, step: o=1, orientation: s="horizontal", disabled: a=!1, minStepsBetweenThumbs: l=0, defaultValue: c=[r], value: u, onValueChange: d= () => {}
  , onValueCommit: f= () => {}
  , inverted: p=!1, form: b, ...y} = e
    , w = x.useRef(new Set)
    , m = x.useRef(0)
    , v = s === "horizontal" ? wD : bD
    , [S=[],C] = Ki({
      prop: u,
      defaultProp: c,
      onChange: z => {
          var W;
          (W = [...w.current][m.current]) == null || W.focus(),
          d(z)
      }
  })
    , k = x.useRef(S);
  function E(z) {
      const L = PD(S, z);
      R(z, L)
  }
  function P(z) {
      R(z, m.current)
  }
  function j() {
      const z = k.current[m.current];
      S[m.current] !== z && f(S)
  }
  function R(z, L, {commit: W}={
      commit: !1
  }) {
      const I = RD(o)
        , K = jD(Math.round((z - r) / o) * o + r, I)
        , $ = D1(K, [r, i]);
      C( (V=[]) => {
          const T = kD(V, $, L);
          if (ND(T, l * o)) {
              m.current = T.indexOf($);
              const N = String(T) !== String(V);
              return N && W && f(T),
              N ? T : V
          } else
              return V
      }
      )
  }
  return h.jsx(xD, {
      scope: e.__scopeSlider,
      name: n,
      disabled: a,
      min: r,
      max: i,
      valueIndexToChangeRef: m,
      thumbs: w.current,
      values: S,
      orientation: s,
      form: b,
      children: h.jsx(yd.Provider, {
          scope: e.__scopeSlider,
          children: h.jsx(yd.Slot, {
              scope: e.__scopeSlider,
              children: h.jsx(v, {
                  "aria-disabled": a,
                  "data-disabled": a ? "" : void 0,
                  ...y,
                  ref: t,
                  onPointerDown: ne(y.onPointerDown, () => {
                      a || (k.current = S)
                  }
                  ),
                  min: r,
                  max: i,
                  inverted: p,
                  onSlideStart: a ? void 0 : E,
                  onSlideMove: a ? void 0 : P,
                  onSlideEnd: a ? void 0 : j,
                  onHomeKeyDown: () => !a && R(r, 0, {
                      commit: !0
                  }),
                  onEndKeyDown: () => !a && R(i, S.length - 1, {
                      commit: !0
                  }),
                  onStepKeyDown: ({event: z, direction: L}) => {
                      if (!a) {
                          const K = O1.includes(z.key) || z.shiftKey && z1.includes(z.key) ? 10 : 1
                            , $ = m.current
                            , V = S[$]
                            , T = o * K * L;
                          R(V + T, $, {
                              commit: !0
                          })
                      }
                  }
              })
          })
      })
  })
}
);
F1.displayName = Ji;
var [B1,$1] = V1(Ji, {
  startEdge: "left",
  endEdge: "right",
  size: "width",
  direction: 1
})
, wD = x.forwardRef( (e, t) => {
  const {min: n, max: r, dir: i, inverted: o, onSlideStart: s, onSlideMove: a, onSlideEnd: l, onStepKeyDown: c, ...u} = e
    , [d,f] = x.useState(null)
    , p = be(t, v => f(v))
    , b = x.useRef(void 0)
    , y = I1(i)
    , w = y === "ltr"
    , m = w && !o || !w && o;
  function g(v) {
      const S = b.current || d.getBoundingClientRect()
        , C = [0, S.width]
        , E = ph(C, m ? [n, r] : [r, n]);
      return b.current = S,
      E(v - S.left)
  }
  return h.jsx(B1, {
      scope: e.__scopeSlider,
      startEdge: m ? "left" : "right",
      endEdge: m ? "right" : "left",
      direction: m ? 1 : -1,
      size: "width",
      children: h.jsx(U1, {
          dir: y,
          "data-orientation": "horizontal",
          ...u,
          ref: p,
          style: {
              ...u.style,
              "--radix-slider-thumb-transform": "translateX(-50%)"
          },
          onSlideStart: v => {
              const S = g(v.clientX);
              s == null || s(S)
          }
          ,
          onSlideMove: v => {
              const S = g(v.clientX);
              a == null || a(S)
          }
          ,
          onSlideEnd: () => {
              b.current = void 0,
              l == null || l()
          }
          ,
          onStepKeyDown: v => {
              const C = _1[m ? "from-left" : "from-right"].includes(v.key);
              c == null || c({
                  event: v,
                  direction: C ? -1 : 1
              })
          }
      })
  })
}
)
, bD = x.forwardRef( (e, t) => {
  const {min: n, max: r, inverted: i, onSlideStart: o, onSlideMove: s, onSlideEnd: a, onStepKeyDown: l, ...c} = e
    , u = x.useRef(null)
    , d = be(t, u)
    , f = x.useRef(void 0)
    , p = !i;
  function b(y) {
      const w = f.current || u.current.getBoundingClientRect()
        , m = [0, w.height]
        , v = ph(m, p ? [r, n] : [n, r]);
      return f.current = w,
      v(y - w.top)
  }
  return h.jsx(B1, {
      scope: e.__scopeSlider,
      startEdge: p ? "bottom" : "top",
      endEdge: p ? "top" : "bottom",
      size: "height",
      direction: p ? 1 : -1,
      children: h.jsx(U1, {
          "data-orientation": "vertical",
          ...c,
          ref: d,
          style: {
              ...c.style,
              "--radix-slider-thumb-transform": "translateY(50%)"
          },
          onSlideStart: y => {
              const w = b(y.clientY);
              o == null || o(w)
          }
          ,
          onSlideMove: y => {
              const w = b(y.clientY);
              s == null || s(w)
          }
          ,
          onSlideEnd: () => {
              f.current = void 0,
              a == null || a()
          }
          ,
          onStepKeyDown: y => {
              const m = _1[p ? "from-bottom" : "from-top"].includes(y.key);
              l == null || l({
                  event: y,
                  direction: m ? -1 : 1
              })
          }
      })
  })
}
)
, U1 = x.forwardRef( (e, t) => {
  const {__scopeSlider: n, onSlideStart: r, onSlideMove: i, onSlideEnd: o, onHomeKeyDown: s, onEndKeyDown: a, onStepKeyDown: l, ...c} = e
    , u = Ll(Ji, n);
  return h.jsx(oe.span, {
      ...c,
      ref: t,
      onKeyDown: ne(e.onKeyDown, d => {
          d.key === "Home" ? (s(d),
          d.preventDefault()) : d.key === "End" ? (a(d),
          d.preventDefault()) : O1.concat(z1).includes(d.key) && (l(d),
          d.preventDefault())
      }
      ),
      onPointerDown: ne(e.onPointerDown, d => {
          const f = d.target;
          f.setPointerCapture(d.pointerId),
          d.preventDefault(),
          u.thumbs.has(f) ? f.focus() : r(d)
      }
      ),
      onPointerMove: ne(e.onPointerMove, d => {
          d.target.hasPointerCapture(d.pointerId) && i(d)
      }
      ),
      onPointerUp: ne(e.onPointerUp, d => {
          const f = d.target;
          f.hasPointerCapture(d.pointerId) && (f.releasePointerCapture(d.pointerId),
          o(d))
      }
      )
  })
}
)
, W1 = "SliderTrack"
, H1 = x.forwardRef( (e, t) => {
  const {__scopeSlider: n, ...r} = e
    , i = Ll(W1, n);
  return h.jsx(oe.span, {
      "data-disabled": i.disabled ? "" : void 0,
      "data-orientation": i.orientation,
      ...r,
      ref: t
  })
}
);
H1.displayName = W1;
var vd = "SliderRange"
, K1 = x.forwardRef( (e, t) => {
  const {__scopeSlider: n, ...r} = e
    , i = Ll(vd, n)
    , o = $1(vd, n)
    , s = x.useRef(null)
    , a = be(t, s)
    , l = i.values.length
    , c = i.values.map(f => Q1(f, i.min, i.max))
    , u = l > 1 ? Math.min(...c) : 0
    , d = 100 - Math.max(...c);
  return h.jsx(oe.span, {
      "data-orientation": i.orientation,
      "data-disabled": i.disabled ? "" : void 0,
      ...r,
      ref: a,
      style: {
          ...e.style,
          [o.startEdge]: u + "%",
          [o.endEdge]: d + "%"
      }
  })
}
);
K1.displayName = vd;
var xd = "SliderThumb"
, q1 = x.forwardRef( (e, t) => {
  const n = yD(e.__scopeSlider)
    , [r,i] = x.useState(null)
    , o = be(t, a => i(a))
    , s = x.useMemo( () => r ? n().findIndex(a => a.ref.current === r) : -1, [n, r]);
  return h.jsx(SD, {
      ...e,
      ref: o,
      index: s
  })
}
)
, SD = x.forwardRef( (e, t) => {
  const {__scopeSlider: n, index: r, name: i, ...o} = e
    , s = Ll(xd, n)
    , a = $1(xd, n)
    , [l,c] = x.useState(null)
    , u = be(t, g => c(g))
    , d = l ? s.form || !!l.closest("form") : !0
    , f = jf(l)
    , p = s.values[r]
    , b = p === void 0 ? 0 : Q1(p, s.min, s.max)
    , y = ED(r, s.values.length)
    , w = f == null ? void 0 : f[a.size]
    , m = w ? TD(w, b, a.direction) : 0;
  return x.useEffect( () => {
      if (l)
          return s.thumbs.add(l),
          () => {
              s.thumbs.delete(l)
          }
  }
  , [l, s.thumbs]),
  h.jsxs("span", {
      style: {
          transform: "var(--radix-slider-thumb-transform)",
          position: "absolute",
          [a.startEdge]: `calc(${b}% + ${m}px)`
      },
      children: [h.jsx(yd.ItemSlot, {
          scope: e.__scopeSlider,
          children: h.jsx(oe.span, {
              role: "slider",
              "aria-label": e["aria-label"] || y,
              "aria-valuemin": s.min,
              "aria-valuenow": p,
              "aria-valuemax": s.max,
              "aria-orientation": s.orientation,
              "data-orientation": s.orientation,
              "data-disabled": s.disabled ? "" : void 0,
              tabIndex: s.disabled ? void 0 : 0,
              ...o,
              ref: u,
              style: p === void 0 ? {
                  display: "none"
              } : e.style,
              onFocus: ne(e.onFocus, () => {
                  s.valueIndexToChangeRef.current = r
              }
              )
          })
      }), d && h.jsx(G1, {
          name: i ?? (s.name ? s.name + (s.values.length > 1 ? "[]" : "") : void 0),
          form: s.form,
          value: p
      }, r)]
  })
}
);
q1.displayName = xd;
var CD = "RadioBubbleInput"
, G1 = x.forwardRef( ({__scopeSlider: e, value: t, ...n}, r) => {
  const i = x.useRef(null)
    , o = be(i, r)
    , s = L1(t);
  return x.useEffect( () => {
      const a = i.current;
      if (!a)
          return;
      const l = window.HTMLInputElement.prototype
        , u = Object.getOwnPropertyDescriptor(l, "value").set;
      if (s !== t && u) {
          const d = new Event("input",{
              bubbles: !0
          });
          u.call(a, t),
          a.dispatchEvent(d)
      }
  }
  , [s, t]),
  h.jsx(oe.input, {
      style: {
          display: "none"
      },
      ...n,
      ref: o,
      defaultValue: t
  })
}
);
G1.displayName = CD;
function kD(e=[], t, n) {
  const r = [...e];
  return r[n] = t,
  r.sort( (i, o) => i - o)
}
function Q1(e, t, n) {
  const o = 100 / (n - t) * (e - t);
  return D1(o, [0, 100])
}
function ED(e, t) {
  return t > 2 ? `Value ${e + 1} of ${t}` : t === 2 ? ["Minimum", "Maximum"][e] : void 0
}
function PD(e, t) {
  if (e.length === 1)
      return 0;
  const n = e.map(i => Math.abs(i - t))
    , r = Math.min(...n);
  return n.indexOf(r)
}
function TD(e, t, n) {
  const r = e / 2
    , o = ph([0, 50], [0, r]);
  return (r - o(t) * n) * n
}
function AD(e) {
  return e.slice(0, -1).map( (t, n) => e[n + 1] - t)
}
function ND(e, t) {
  if (t > 0) {
      const n = AD(e);
      return Math.min(...n) >= t
  }
  return !0
}
function ph(e, t) {
  return n => {
      if (e[0] === e[1] || t[0] === t[1])
          return t[0];
      const r = (t[1] - t[0]) / (e[1] - e[0]);
      return t[0] + r * (n - e[0])
  }
}
function RD(e) {
  return (String(e).split(".")[1] || "").length
}
function jD(e, t) {
  const n = Math.pow(10, t);
  return Math.round(e * n) / n
}
var Y1 = F1
, MD = H1
, DD = K1
, ID = q1;
const Z1 = x.forwardRef( ({className: e, ...t}, n) => h.jsxs(Y1, {
  ref: n,
  className: ut("relative flex w-full touch-none select-none items-center", e),
  ...t,
  children: [h.jsx(MD, {
      className: "relative h-2 w-full grow overflow-hidden rounded-full bg-secondary",
      children: h.jsx(DD, {
          className: "absolute h-full bg-primary"
      })
  }), h.jsx(ID, {
      className: "block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
  })]
}));
Z1.displayName = Y1.displayName;
const LD = () => {
  const e = x.useRef(null)
    , t = bs(e, {
      once: !0,
      margin: "-100px"
  })
    , {language: n, t: r} = $t()
    , [i,o] = x.useState([220])
    , s = i[0]
    , l = s - 97
    , c = l * 12;
  return h.jsx("section", {
      id: "calculator",
      ref: e,
      className: "section-padding bg-gradient-to-b from-klozd-gray-100 to-white",
      children: h.jsx("div", {
          className: "container-klozd",
          children: h.jsxs("div", {
              className: "max-w-4xl mx-auto",
              children: [h.jsxs(_.div, {
                  initial: {
                      opacity: 0,
                      y: 20
                  },
                  animate: t ? {
                      opacity: 1,
                      y: 0
                  } : {},
                  transition: {
                      duration: .5
                  },
                  className: "text-center mb-12",
                  children: [h.jsxs("span", {
                      className: "tag-badge mb-4 inline-flex items-center gap-2",
                      children: [h.jsx(cE, {
                          size: 14
                      }), r.calculator.badge[n]]
                  }), h.jsxs("h2", {
                      className: "headline-section mb-4",
                      children: [r.calculator.headline[n], h.jsx("br", {}), h.jsx("span", {
                          className: "text-klozd-yellow",
                          children: r.calculator.headlineSub[n]
                      })]
                  }), h.jsx("p", {
                      className: "body-normal max-w-lg mx-auto",
                      children: r.calculator.description[n]
                  })]
              }), h.jsxs(_.div, {
                  initial: {
                      opacity: 0,
                      y: 30
                  },
                  animate: t ? {
                      opacity: 1,
                      y: 0
                  } : {},
                  transition: {
                      duration: .6,
                      delay: .2
                  },
                  className: "bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-border",
                  children: [h.jsxs("div", {
                      className: "mb-10",
                      children: [h.jsxs("div", {
                          className: "flex justify-between items-center mb-4",
                          children: [h.jsx("label", {
                              className: "text-lg font-semibold text-klozd-black",
                              children: r.calculator.currentStack[n]
                          }), h.jsxs(_.span, {
                              initial: {
                                  scale: 1.2
                              },
                              animate: {
                                  scale: 1
                              },
                              className: "text-3xl font-bold text-klozd-yellow",
                              children: [s, "€"]
                          }, s)]
                      }), h.jsx(Z1, {
                          value: i,
                          onValueChange: o,
                          min: 100,
                          max: 900,
                          step: 10,
                          className: "w-full"
                      }), h.jsxs("div", {
                          className: "flex justify-between text-sm text-klozd-gray-400 mt-2",
                          children: [h.jsx("span", {
                              children: "100€"
                          }), h.jsx("span", {
                              children: "500€"
                          }), h.jsx("span", {
                              children: "900€"
                          })]
                      })]
                  }), h.jsxs("div", {
                      className: "grid md:grid-cols-3 gap-6",
                      children: [h.jsxs(_.div, {
                          initial: {
                              opacity: 0,
                              scale: .95
                          },
                          animate: t ? {
                              opacity: 1,
                              scale: 1
                          } : {},
                          transition: {
                              duration: .4,
                              delay: .3
                          },
                          className: "bg-gradient-to-br from-klozd-yellow/10 to-klozd-yellow/5 rounded-2xl p-6 text-center",
                          children: [h.jsx("div", {
                              className: "w-12 h-12 rounded-full bg-klozd-yellow/20 flex items-center justify-center mx-auto mb-4",
                              children: h.jsx(yE, {
                                  size: 24,
                                  className: "text-klozd-yellow"
                              })
                          }), h.jsxs(_.p, {
                              initial: {
                                  scale: 1.1
                              },
                              animate: {
                                  scale: 1
                              },
                              className: "text-4xl font-bold text-klozd-black mb-1",
                              children: [l, "€"]
                          }, l), h.jsx("p", {
                              className: "text-klozd-gray-600 text-sm",
                              children: n === "fr" ? "économisés/mois" : "saved/month"
                          })]
                      }), h.jsxs(_.div, {
                          initial: {
                              opacity: 0,
                              scale: .95
                          },
                          animate: t ? {
                              opacity: 1,
                              scale: 1
                          } : {},
                          transition: {
                              duration: .4,
                              delay: .4
                          },
                          className: "bg-gradient-to-br from-green-100 to-green-50 rounded-2xl p-6 text-center",
                          children: [h.jsx("div", {
                              className: "w-12 h-12 rounded-full bg-green-200 flex items-center justify-center mx-auto mb-4",
                              children: h.jsx(dE, {
                                  size: 24,
                                  className: "text-green-600"
                              })
                          }), h.jsxs(_.p, {
                              initial: {
                                  scale: 1.1
                              },
                              animate: {
                                  scale: 1
                              },
                              className: "text-4xl font-bold text-klozd-black mb-1",
                              children: [c.toLocaleString(), "€"]
                          }, c), h.jsx("p", {
                              className: "text-klozd-gray-600 text-sm",
                              children: r.calculator.moneySaved[n]
                          })]
                      }), h.jsxs(_.div, {
                          initial: {
                              opacity: 0,
                              scale: .95
                          },
                          animate: t ? {
                              opacity: 1,
                              scale: 1
                          } : {},
                          transition: {
                              duration: .4,
                              delay: .5
                          },
                          className: "bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl p-6 text-center",
                          children: [h.jsx("div", {
                              className: "w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center mx-auto mb-4",
                              children: h.jsx(gE, {
                                  size: 24,
                                  className: "text-blue-600"
                              })
                          }), h.jsxs(_.p, {
                              className: "text-4xl font-bold text-klozd-black mb-1",
                              children: ["+", 30, "%"]
                          }), h.jsx("p", {
                              className: "text-klozd-gray-600 text-sm",
                              children: n === "fr" ? "taux de show" : "show rate"
                          })]
                      })]
                  }), h.jsxs(_.div, {
                      initial: {
                          opacity: 0,
                          y: 20
                      },
                      animate: t ? {
                          opacity: 1,
                          y: 0
                      } : {},
                      transition: {
                          duration: .5,
                          delay: .6
                      },
                      className: "mt-10 text-center",
                      children: [h.jsx("a", {
                          href: "#waitlist",
                          className: "btn-primary gap-2",
                          children: r.calculator.cta[n]
                      }), h.jsx("p", {
                          className: "text-klozd-gray-400 text-sm mt-4",
                          children: r.calculator.note[n]
                      })]
                  })]
              })]
          })
      })
  })
}
, OD = ({featureKey: e, imageSrc: t, imageAlt: n, imageLeft: r=!1, id: i}) => {
  const o = x.useRef(null)
    , s = bs(o, {
      once: !0,
      margin: "-100px"
  })
    , {language: a, t: l} = $t()
    , c = l.features[e]
    , u = c.tag[a]
    , d = c.headline[a]
    , f = c.description[a]
    , p = c.benefits[a];
  return h.jsx("section", {
      id: i,
      ref: o,
      className: "section-padding",
      children: h.jsx("div", {
          className: "container-klozd",
          children: h.jsxs("div", {
              className: `grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${r ? "" : "lg:[direction:rtl]"}`,
              children: [h.jsx(_.div, {
                  initial: {
                      opacity: 0,
                      x: r ? -50 : 50
                  },
                  animate: s ? {
                      opacity: 1,
                      x: 0
                  } : {},
                  transition: {
                      duration: .6,
                      delay: .2
                  },
                  className: "lg:[direction:ltr]",
                  children: h.jsx("img", {
                      src: t,
                      alt: n,
                      className: "mockup-shadow w-full"
                  })
              }), h.jsxs(_.div, {
                  initial: {
                      opacity: 0,
                      y: 30
                  },
                  animate: s ? {
                      opacity: 1,
                      y: 0
                  } : {},
                  transition: {
                      duration: .6
                  },
                  className: "lg:[direction:ltr]",
                  children: [h.jsx("span", {
                      className: "tag-badge mb-6",
                      children: u
                  }), h.jsx("h2", {
                      className: "headline-section mb-6 whitespace-pre-line",
                      children: d
                  }), h.jsx("p", {
                      className: "body-normal mb-8 max-w-md",
                      children: f
                  }), h.jsx("ul", {
                      className: "space-y-4",
                      children: p.map( (b, y) => h.jsxs(_.li, {
                          initial: {
                              opacity: 0,
                              x: -20
                          },
                          animate: s ? {
                              opacity: 1,
                              x: 0
                          } : {},
                          transition: {
                              duration: .4,
                              delay: .3 + y * .1
                          },
                          className: "flex items-start gap-3",
                          children: [h.jsx(pn, {
                              size: 20,
                              className: "text-klozd-yellow mt-0.5 flex-shrink-0"
                          }), h.jsx("span", {
                              className: "text-klozd-gray-600",
                              children: b
                          })]
                      }, y))
                  })]
              })]
          })
      })
  })
}
, zD = () => {
  const e = x.useRef(null)
    , t = bs(e, {
      once: !0,
      margin: "-100px"
  })
    , {language: n, t: r} = $t()
    , i = r.comparison.items[n];
  return h.jsx("section", {
      ref: e,
      className: "section-padding bg-klozd-black overflow-hidden",
      children: h.jsxs("div", {
          className: "container-klozd",
          children: [h.jsxs(_.div, {
              initial: {
                  opacity: 0,
                  y: 20
              },
              animate: t ? {
                  opacity: 1,
                  y: 0
              } : {},
              transition: {
                  duration: .5
              },
              className: "text-center mb-12",
              children: [h.jsxs("span", {
                  className: "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-klozd-yellow/20 text-klozd-yellow text-sm font-medium mb-4",
                  children: [h.jsx($0, {
                      size: 14
                  }), r.comparison.badge[n]]
              }), h.jsxs("h2", {
                  className: "text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white mb-4",
                  children: [r.comparison.headline[n], h.jsx("br", {}), h.jsx("span", {
                      className: "text-klozd-yellow",
                      children: r.comparison.headlineSub[n]
                  })]
              }), h.jsx("p", {
                  className: "text-lg text-klozd-gray-400 max-w-lg mx-auto",
                  children: r.comparison.description[n]
              })]
          }), h.jsxs(_.div, {
              initial: {
                  opacity: 0,
                  y: 30
              },
              animate: t ? {
                  opacity: 1,
                  y: 0
              } : {},
              transition: {
                  duration: .6,
                  delay: .2
              },
              className: "max-w-3xl mx-auto",
              children: [h.jsxs("div", {
                  className: "grid grid-cols-3 gap-4 mb-4 px-4",
                  children: [h.jsx("div", {
                      className: "text-left",
                      children: h.jsx("span", {
                          className: "text-klozd-gray-400 text-sm font-medium",
                          children: r.comparison.featureLabel[n]
                      })
                  }), h.jsx("div", {
                      className: "text-center",
                      children: h.jsx("span", {
                          className: "text-klozd-gray-400 text-sm font-medium",
                          children: r.comparison.traditionalLabel[n]
                      })
                  }), h.jsx("div", {
                      className: "text-center",
                      children: h.jsx("span", {
                          className: "text-klozd-yellow text-sm font-semibold",
                          children: "KLOZD"
                      })
                  })]
              }), h.jsx("div", {
                  className: "bg-white/5 rounded-2xl overflow-hidden backdrop-blur-sm border border-white/10",
                  children: i.map( (o, s) => h.jsxs(_.div, {
                      initial: {
                          opacity: 0,
                          x: -20
                      },
                      animate: t ? {
                          opacity: 1,
                          x: 0
                      } : {},
                      transition: {
                          duration: .4,
                          delay: .3 + s * .05
                      },
                      className: `grid grid-cols-3 gap-4 p-4 items-center ${s !== i.length - 1 ? "border-b border-white/10" : ""}`,
                      children: [h.jsx("div", {
                          className: "text-white text-sm md:text-base",
                          children: o
                      }), h.jsx("div", {
                          className: "flex justify-center",
                          children: h.jsx("div", {
                              className: "w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center",
                              children: h.jsx(Sf, {
                                  size: 16,
                                  className: "text-red-400"
                              })
                          })
                      }), h.jsx("div", {
                          className: "flex justify-center",
                          children: h.jsx(_.div, {
                              initial: {
                                  scale: 0
                              },
                              animate: t ? {
                                  scale: 1
                              } : {},
                              transition: {
                                  duration: .3,
                                  delay: .5 + s * .05,
                                  type: "spring"
                              },
                              className: "w-8 h-8 rounded-full bg-klozd-yellow/20 flex items-center justify-center",
                              children: h.jsx(pn, {
                                  size: 16,
                                  className: "text-klozd-yellow"
                              })
                          })
                      })]
                  }, s))
              })]
          }), h.jsx(_.div, {
              initial: {
                  opacity: 0,
                  y: 20
              },
              animate: t ? {
                  opacity: 1,
                  y: 0
              } : {},
              transition: {
                  duration: .5,
                  delay: .8
              },
              className: "grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto",
              children: [{
                  value: r.comparison.stats.time.value,
                  label: r.comparison.stats.time.label[n]
              }, {
                  value: r.comparison.stats.show.value,
                  label: r.comparison.stats.show.label[n]
              }, {
                  value: r.comparison.stats.closing.value,
                  label: r.comparison.stats.closing.label[n]
              }, {
                  value: r.comparison.stats.savings.value,
                  label: r.comparison.stats.savings.label[n]
              }].map( (o, s) => h.jsxs(_.div, {
                  initial: {
                      opacity: 0,
                      scale: .9
                  },
                  animate: t ? {
                      opacity: 1,
                      scale: 1
                  } : {},
                  transition: {
                      duration: .4,
                      delay: .9 + s * .1
                  },
                  className: "text-center p-4",
                  children: [h.jsx("p", {
                      className: "text-3xl md:text-4xl font-bold text-klozd-yellow mb-1",
                      children: o.value
                  }), h.jsx("p", {
                      className: "text-klozd-gray-400 text-sm",
                      children: o.label
                  })]
              }, o.label))
          })]
      })
  })
}
, _D = () => {
  const e = x.useRef(null)
    , t = bs(e, {
      once: !0,
      margin: "-100px"
  })
    , {language: n, t: r} = $t()
    , i = r.testimonials.items[n]
    , o = ["CoachPro", "AgenceScale", "InfoBusiness", "SalesTeam", "CloseMore", "GrowthLab"];
  return h.jsx("section", {
      ref: e,
      className: "section-padding bg-white overflow-hidden",
      children: h.jsxs("div", {
          className: "container-klozd",
          children: [h.jsxs(_.div, {
              initial: {
                  opacity: 0,
                  y: 20
              },
              animate: t ? {
                  opacity: 1,
                  y: 0
              } : {},
              transition: {
                  duration: .5
              },
              className: "text-center mb-16",
              children: [h.jsx("span", {
                  className: "tag-badge mb-4",
                  children: r.testimonials.badge[n]
              }), h.jsxs("h2", {
                  className: "headline-section mb-4",
                  children: [r.testimonials.headline[n], h.jsx("br", {}), h.jsx("span", {
                      className: "text-klozd-yellow",
                      children: r.testimonials.headlineSub[n]
                  })]
              }), h.jsx("p", {
                  className: "body-normal max-w-lg mx-auto",
                  children: r.testimonials.description[n]
              })]
          }), h.jsx(_.div, {
              initial: {
                  opacity: 0,
                  scale: .95
              },
              animate: t ? {
                  opacity: 1,
                  scale: 1
              } : {},
              transition: {
                  duration: .5,
                  delay: .2
              },
              className: "flex justify-center mb-12",
              children: h.jsxs("div", {
                  className: "inline-flex items-center gap-4 bg-klozd-gray-100 rounded-full px-6 py-3",
                  children: [h.jsx("div", {
                      className: "flex -space-x-2",
                      children: ["ZA", "TL", "SM", "JD", "PL"].map( (s, a) => h.jsx("div", {
                          className: "w-8 h-8 rounded-full bg-klozd-yellow flex items-center justify-center text-xs font-bold text-white border-2 border-white",
                          children: s
                      }, a))
                  }), h.jsxs("div", {
                      className: "text-sm",
                      children: [h.jsx("span", {
                          className: "font-bold text-klozd-black",
                          children: "347+"
                      }), h.jsxs("span", {
                          className: "text-klozd-gray-600",
                          children: [" ", r.testimonials.waitlistCount[n]]
                      })]
                  })]
              })
          }), h.jsx("div", {
              className: "grid md:grid-cols-3 gap-6 lg:gap-8 mb-16",
              children: i.map( (s, a) => h.jsxs(_.div, {
                  initial: {
                      opacity: 0,
                      y: 30
                  },
                  animate: t ? {
                      opacity: 1,
                      y: 0
                  } : {},
                  transition: {
                      duration: .5,
                      delay: .3 + a * .1
                  },
                  className: "bg-klozd-gray-100 rounded-2xl p-6 md:p-8 relative group hover:shadow-lg transition-shadow",
                  children: [h.jsx("div", {
                      className: "absolute top-6 right-6 opacity-10",
                      children: h.jsx(pE, {
                          size: 40,
                          className: "text-klozd-yellow"
                      })
                  }), h.jsx("div", {
                      className: "flex gap-1 mb-4",
                      children: [...Array(5)].map( (l, c) => h.jsx(mE, {
                          size: 16,
                          className: "fill-klozd-yellow text-klozd-yellow"
                      }, c))
                  }), h.jsxs("p", {
                      className: "text-klozd-black text-lg leading-relaxed mb-6",
                      children: ['"', s.quote, '"']
                  }), h.jsxs("div", {
                      className: "flex items-center gap-3",
                      children: [h.jsx("div", {
                          className: "w-12 h-12 rounded-full bg-klozd-yellow flex items-center justify-center text-white font-bold",
                          children: s.name.split(" ").map(l => l[0]).join("")
                      }), h.jsxs("div", {
                          children: [h.jsx("p", {
                              className: "font-semibold text-klozd-black",
                              children: s.name
                          }), h.jsx("p", {
                              className: "text-sm text-klozd-gray-600",
                              children: s.role
                          })]
                      })]
                  })]
              }, s.name))
          })]
      })
  })
}
;
var Ol = "Checkbox"
, [VD,RI] = hr(Ol)
, [FD,mh] = VD(Ol);
function BD(e) {
  const {__scopeCheckbox: t, checked: n, children: r, defaultChecked: i, disabled: o, form: s, name: a, onCheckedChange: l, required: c, value: u="on", internal_do_not_use_render: d} = e
    , [f,p] = Ki({
      prop: n,
      defaultProp: i ?? !1,
      onChange: l,
      caller: Ol
  })
    , [b,y] = x.useState(null)
    , [w,m] = x.useState(null)
    , g = x.useRef(!1)
    , v = b ? !!s || !!b.closest("form") : !0
    , S = {
      checked: f,
      disabled: o,
      setChecked: p,
      control: b,
      setControl: y,
      name: a,
      form: s,
      value: u,
      hasConsumerStoppedPropagationRef: g,
      required: c,
      defaultChecked: nr(i) ? !1 : i,
      isFormControl: v,
      bubbleInput: w,
      setBubbleInput: m
  };
  return h.jsx(FD, {
      scope: t,
      ...S,
      children: $D(d) ? d(S) : r
  })
}
var X1 = "CheckboxTrigger"
, J1 = x.forwardRef( ({__scopeCheckbox: e, onKeyDown: t, onClick: n, ...r}, i) => {
  const {control: o, value: s, disabled: a, checked: l, required: c, setControl: u, setChecked: d, hasConsumerStoppedPropagationRef: f, isFormControl: p, bubbleInput: b} = mh(X1, e)
    , y = be(i, u)
    , w = x.useRef(l);
  return x.useEffect( () => {
      const m = o == null ? void 0 : o.form;
      if (m) {
          const g = () => d(w.current);
          return m.addEventListener("reset", g),
          () => m.removeEventListener("reset", g)
      }
  }
  , [o, d]),
  h.jsx(oe.button, {
      type: "button",
      role: "checkbox",
      "aria-checked": nr(l) ? "mixed" : l,
      "aria-required": c,
      "data-state": ib(l),
      "data-disabled": a ? "" : void 0,
      disabled: a,
      value: s,
      ...r,
      ref: y,
      onKeyDown: ne(t, m => {
          m.key === "Enter" && m.preventDefault()
      }
      ),
      onClick: ne(n, m => {
          d(g => nr(g) ? !0 : !g),
          b && p && (f.current = m.isPropagationStopped(),
          f.current || m.stopPropagation())
      }
      )
  })
}
);
J1.displayName = X1;
var gh = x.forwardRef( (e, t) => {
  const {__scopeCheckbox: n, name: r, checked: i, defaultChecked: o, required: s, disabled: a, value: l, onCheckedChange: c, form: u, ...d} = e;
  return h.jsx(BD, {
      __scopeCheckbox: n,
      checked: i,
      defaultChecked: o,
      disabled: a,
      required: s,
      onCheckedChange: c,
      name: r,
      form: u,
      value: l,
      internal_do_not_use_render: ({isFormControl: f}) => h.jsxs(h.Fragment, {
          children: [h.jsx(J1, {
              ...d,
              ref: t,
              __scopeCheckbox: n
          }), f && h.jsx(rb, {
              __scopeCheckbox: n
          })]
      })
  })
}
);
gh.displayName = Ol;
var eb = "CheckboxIndicator"
, tb = x.forwardRef( (e, t) => {
  const {__scopeCheckbox: n, forceMount: r, ...i} = e
    , o = mh(eb, n);
  return h.jsx(ps, {
      present: r || nr(o.checked) || o.checked === !0,
      children: h.jsx(oe.span, {
          "data-state": ib(o.checked),
          "data-disabled": o.disabled ? "" : void 0,
          ...i,
          ref: t,
          style: {
              pointerEvents: "none",
              ...e.style
          }
      })
  })
}
);
tb.displayName = eb;
var nb = "CheckboxBubbleInput"
, rb = x.forwardRef( ({__scopeCheckbox: e, ...t}, n) => {
  const {control: r, hasConsumerStoppedPropagationRef: i, checked: o, defaultChecked: s, required: a, disabled: l, name: c, value: u, form: d, bubbleInput: f, setBubbleInput: p} = mh(nb, e)
    , b = be(n, p)
    , y = L1(o)
    , w = jf(r);
  x.useEffect( () => {
      const g = f;
      if (!g)
          return;
      const v = window.HTMLInputElement.prototype
        , C = Object.getOwnPropertyDescriptor(v, "checked").set
        , k = !i.current;
      if (y !== o && C) {
          const E = new Event("click",{
              bubbles: k
          });
          g.indeterminate = nr(o),
          C.call(g, nr(o) ? !1 : o),
          g.dispatchEvent(E)
      }
  }
  , [f, y, o, i]);
  const m = x.useRef(nr(o) ? !1 : o);
  return h.jsx(oe.input, {
      type: "checkbox",
      "aria-hidden": !0,
      defaultChecked: s ?? m.current,
      required: a,
      disabled: l,
      name: c,
      value: u,
      form: d,
      ...t,
      tabIndex: -1,
      ref: b,
      style: {
          ...t.style,
          ...w,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0,
          transform: "translateX(-100%)"
      }
  })
}
);
rb.displayName = nb;
function $D(e) {
  return typeof e == "function"
}
function nr(e) {
  return e === "indeterminate"
}
function ib(e) {
  return nr(e) ? "indeterminate" : e ? "checked" : "unchecked"
}
const ob = x.forwardRef( ({className: e, ...t}, n) => h.jsx(gh, {
  ref: n,
  className: ut("peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", e),
  ...t,
  children: h.jsx(tb, {
      className: ut("flex items-center justify-center text-current"),
      children: h.jsx(pn, {
          className: "h-4 w-4"
      })
  })
}));
ob.displayName = gh.displayName;
const UD = () => {
  const e = x.useRef(null)
    , t = bs(e, {
      once: !0,
      margin: "-100px"
  })
    , {language: n} = $t()
    , r = [{
      name: "Jotform / Typeform",
      price: 35,
      category: {
          fr: "Formulaires",
          en: "Forms"
      }
  }, {
      name: "Calendly",
      price: 15,
      category: {
          fr: "Scheduling",
          en: "Scheduling"
      }
  }, {
      name: "Zoom / Google Meet",
      price: 15,
      category: {
          fr: "Visio",
          en: "Video"
      }
  }, {
      name: "HubSpot / Pipedrive",
      price: 90,
      category: {
          fr: "CRM",
          en: "CRM"
      }
  }, {
      name: "Twilio / SMS Tool",
      price: 30,
      category: {
          fr: "SMS/WhatsApp",
          en: "SMS/WhatsApp"
      }
  }, {
      name: "Zapier / Make",
      price: 40,
      category: {
          fr: "Automations",
          en: "Automations"
      }
  }, {
      name: "Systeme.io",
      price: 47,
      category: {
          fr: "Pages de vente",
          en: "Sales pages"
      }
  }, {
      name: "ClickFunnels",
      price: 97,
      category: {
          fr: "Funnels",
          en: "Funnels"
      }
  }]
    , [i,o] = x.useState(r.map(c => c.name))
    , s = c => {
      o(u => u.includes(c) ? u.filter(d => d !== c) : [...u, c])
  }
    , a = r.filter(c => i.includes(c.name)).reduce( (c, u) => c + u.price, 0)
    , l = (a - 97) * 12;
  return h.jsx("section", {
      ref: e,
      className: "section-padding bg-klozd-gray-100",
      children: h.jsx("div", {
          className: "container-klozd",
          children: h.jsxs("div", {
              className: "max-w-4xl mx-auto",
              children: [h.jsxs(_.div, {
                  initial: {
                      opacity: 0,
                      y: 20
                  },
                  animate: t ? {
                      opacity: 1,
                      y: 0
                  } : {},
                  transition: {
                      duration: .5
                  },
                  className: "text-center mb-12",
                  children: [h.jsxs("h2", {
                      className: "headline-section mb-4",
                      children: [n === "fr" ? "Coche les outils que tu payes." : "Check the tools you pay for.", h.jsx("br", {}), h.jsx("span", {
                          className: "text-klozd-yellow",
                          children: n === "fr" ? "Découvre tes économies." : "Discover your savings."
                      })]
                  }), h.jsx("p", {
                      className: "body-normal max-w-lg mx-auto",
                      children: n === "fr" ? "Prix moyens constatés. Sélectionne tes outils actuels." : "Average prices observed. Select your current tools."
                  })]
              }), h.jsx(_.div, {
                  initial: {
                      opacity: 0,
                      y: 20
                  },
                  animate: t ? {
                      opacity: 1,
                      y: 0
                  } : {},
                  transition: {
                      duration: .5,
                      delay: .2
                  },
                  className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-8",
                  children: r.map( (c, u) => {
                      const d = i.includes(c.name);
                      return h.jsxs(_.div, {
                          initial: {
                              opacity: 0,
                              scale: .9
                          },
                          animate: t ? {
                              opacity: 1,
                              scale: 1
                          } : {},
                          transition: {
                              duration: .3,
                              delay: .3 + u * .05
                          },
                          onClick: () => s(c.name),
                          className: `bg-white rounded-xl p-4 shadow-sm border-2 cursor-pointer transition-all duration-200 ${d ? "border-klozd-yellow bg-klozd-yellow/5" : "border-border hover:border-klozd-gray-400"}`,
                          children: [h.jsxs("div", {
                              className: "flex items-start justify-between gap-2 mb-2",
                              children: [h.jsx("span", {
                                  className: "font-semibold text-klozd-black text-sm leading-tight",
                                  children: c.name
                              }), h.jsx(ob, {
                                  checked: d,
                                  onCheckedChange: () => s(c.name),
                                  className: "data-[state=checked]:bg-klozd-yellow data-[state=checked]:border-klozd-yellow"
                              })]
                          }), h.jsxs("span", {
                              className: "block text-klozd-yellow font-bold text-lg",
                              children: ["~", c.price, "€", h.jsxs("span", {
                                  className: "text-klozd-gray-600 text-xs font-normal",
                                  children: ["/", n === "fr" ? "mois" : "mo"]
                              })]
                          }), h.jsx("span", {
                              className: "block text-klozd-gray-400 text-xs mt-1",
                              children: c.category[n]
                          })]
                      }, c.name)
                  }
                  )
              }), h.jsxs(_.div, {
                  initial: {
                      opacity: 0
                  },
                  animate: t ? {
                      opacity: 1
                  } : {},
                  transition: {
                      duration: .5,
                      delay: .5
                  },
                  className: "text-center mb-6",
                  children: [h.jsx("p", {
                      className: "text-klozd-gray-600 text-sm mb-1",
                      children: n === "fr" ? "Ta stack actuelle te coûte" : "Your current stack costs"
                  }), h.jsxs(_.p, {
                      initial: {
                          scale: 1.1
                      },
                      animate: {
                          scale: 1
                      },
                      className: "text-3xl font-bold text-klozd-black line-through decoration-red-500",
                      children: [a, "€/", n === "fr" ? "mois" : "mo"]
                  }, a)]
              }), h.jsx(_.div, {
                  initial: {
                      opacity: 0,
                      y: -10
                  },
                  animate: t ? {
                      opacity: 1,
                      y: 0
                  } : {},
                  transition: {
                      duration: .5,
                      delay: .6
                  },
                  className: "flex justify-center mb-6",
                  children: h.jsx(lE, {
                      size: 32,
                      className: "text-klozd-yellow"
                  })
              }), h.jsxs(_.div, {
                  initial: {
                      opacity: 0,
                      scale: .95
                  },
                  animate: t ? {
                      opacity: 1,
                      scale: 1
                  } : {},
                  transition: {
                      duration: .5,
                      delay: .7
                  },
                  className: "bg-white rounded-2xl p-8 shadow-lg border-2 border-klozd-yellow max-w-md mx-auto relative overflow-hidden",
                  children: [h.jsx("div", {
                      className: "absolute top-0 right-0 w-32 h-32 bg-klozd-yellow/10 rounded-full -translate-y-1/2 translate-x-1/2"
                  }), h.jsxs("div", {
                      className: "relative",
                      children: [h.jsx("span", {
                          className: "text-2xl font-bold text-klozd-black",
                          children: "KLOZD"
                      }), h.jsx("p", {
                          className: "text-klozd-gray-600 text-sm mt-1",
                          children: n === "fr" ? "Tout-en-un : CRM + Formulaires + Visio + Pages IA" : "All-in-one: CRM + Forms + Video + AI Pages"
                      }), h.jsxs("div", {
                          className: "mt-4 mb-4",
                          children: [h.jsx("span", {
                              className: "text-sm text-klozd-gray-600",
                              children: n === "fr" ? "À partir de" : "Starting at"
                          }), h.jsxs("div", {
                              children: [h.jsx("span", {
                                  className: "text-4xl font-bold text-klozd-black",
                                  children: "97€"
                              }), h.jsxs("span", {
                                  className: "text-klozd-gray-600",
                                  children: ["/", n === "fr" ? "mois" : "mo"]
                              })]
                          })]
                      }), a > 97 && h.jsxs(_.div, {
                          initial: {
                              scale: 1.05
                          },
                          animate: {
                              scale: 1
                          },
                          className: "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-semibold",
                          children: [h.jsx(_i, {
                              size: 16
                          }), n === "fr" ? `Économise ${l.toLocaleString()}€/an` : `Save ${l.toLocaleString()}€/year`]
                      }, l), h.jsxs("div", {
                          className: "mt-6 pt-4 border-t border-border",
                          children: [h.jsx("p", {
                              className: "text-xs text-klozd-gray-400 mb-3",
                              children: n === "fr" ? "Inclus dans KLOZD :" : "Included in KLOZD:"
                          }), h.jsx("div", {
                              className: "grid grid-cols-2 gap-2 text-xs text-klozd-gray-600",
                              children: [n === "fr" ? "Formulaires IA" : "AI Forms", n === "fr" ? "Scheduling IA" : "AI Scheduling", n === "fr" ? "Visio intégrée" : "Integrated Video", n === "fr" ? "CRM Inbox Zero" : "Inbox Zero CRM", n === "fr" ? "Pages de vente IA" : "AI Sales Pages", n === "fr" ? "Gamification équipe" : "Team Gamification"].map(c => h.jsxs("div", {
                                  className: "flex items-center gap-1",
                                  children: [h.jsx(pn, {
                                      size: 12,
                                      className: "text-klozd-yellow flex-shrink-0"
                                  }), h.jsx("span", {
                                      children: c
                                  })]
                              }, c))
                          })]
                      })]
                  })]
              }), h.jsx(_.div, {
                  initial: {
                      opacity: 0,
                      y: 10
                  },
                  animate: t ? {
                      opacity: 1,
                      y: 0
                  } : {},
                  transition: {
                      duration: .5,
                      delay: .8
                  },
                  className: "text-center mt-8",
                  children: h.jsx("a", {
                      href: "#waitlist",
                      className: "btn-primary",
                      children: n === "fr" ? "Rejoindre la Waitlist" : "Join the Waitlist"
                  })
              })]
          })
      })
  })
}
, WD = () => {
  const {language: e, t} = $t()
    , n = [{
      name: "Starter",
      description: e === "fr" ? "Pour les solopreneurs" : "For solopreneurs",
      features: e === "fr" ? ["1 utilisateur (closeur)", "500 leads/mois", "Formulaires intelligents", "Scheduling + Visio intégrée", "CRM Inbox Zero", "Confirmations Email"] : ["1 user (closer)", "500 leads/month", "Smart forms", "Scheduling + Integrated video", "Inbox Zero CRM", "Email confirmations"]
  }, {
      name: "Pro",
      description: e === "fr" ? "Pour les équipes sales" : "For sales teams",
      features: e === "fr" ? ["5 utilisateurs", "Leads illimités", "Tout Starter +", "Attribution IA des closeurs", "Prédiction de closing IA", "Confirmations SMS incluses", "Dashboard équipe"] : ["5 users", "Unlimited leads", "Everything in Starter +", "AI closer attribution", "AI closing prediction", "SMS confirmations included", "Team dashboard"],
      isPopular: !0
  }, {
      name: "Business",
      description: e === "fr" ? "Pour les équipes ambitieuses" : "For ambitious teams",
      features: e === "fr" ? ["Utilisateurs illimités", "Tout Pro +", "WhatsApp confirmations", "API + Intégrations custom", "Rapports avancés", "Onboarding dédié"] : ["Unlimited users", "Everything in Pro +", "WhatsApp confirmations", "API + Custom integrations", "Advanced reports", "Dedicated onboarding"]
  }];
  return h.jsx("section", {
      id: "pricing",
      className: "section-padding bg-klozd-gray-100",
      children: h.jsxs("div", {
          className: "container-klozd",
          children: [h.jsxs(_.div, {
              initial: {
                  opacity: 0,
                  y: 20
              },
              whileInView: {
                  opacity: 1,
                  y: 0
              },
              viewport: {
                  once: !0
              },
              transition: {
                  duration: .5
              },
              className: "text-center mb-12",
              children: [h.jsx("span", {
                  className: "tag-badge mb-4",
                  children: t.pricing.badge[e]
              }), h.jsxs("h2", {
                  className: "headline-section mb-4",
                  children: [e === "fr" ? "Tarifs dévoilés" : "Pricing revealed", h.jsx("br", {}), h.jsx("span", {
                      className: "text-klozd-yellow",
                      children: e === "fr" ? "au lancement" : "at launch"
                  })]
              }), h.jsx("p", {
                  className: "body-normal max-w-lg mx-auto",
                  children: e === "fr" ? "Les 100 premiers testeurs bénéficient d'avantages exclusifs." : "The first 100 testers get exclusive benefits."
              })]
          }), h.jsxs(_.div, {
              initial: {
                  opacity: 0,
                  y: 20
              },
              whileInView: {
                  opacity: 1,
                  y: 0
              },
              viewport: {
                  once: !0
              },
              transition: {
                  duration: .5,
                  delay: .1
              },
              className: "grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16",
              children: [h.jsxs("div", {
                  className: "bg-white rounded-2xl border-2 border-klozd-yellow p-6 md:p-8 relative overflow-hidden",
                  children: [h.jsx("div", {
                      className: "absolute top-0 right-0 w-32 h-32 bg-klozd-yellow/10 rounded-full -translate-y-1/2 translate-x-1/2"
                  }), h.jsxs("div", {
                      className: "relative",
                      children: [h.jsx("div", {
                          className: "inline-flex items-center justify-center w-14 h-14 bg-klozd-yellow/10 rounded-2xl mb-4",
                          children: h.jsx(fE, {
                              className: "w-7 h-7 text-klozd-yellow"
                          })
                      }), h.jsx("h3", {
                          className: "text-2xl font-bold text-klozd-black mb-2",
                          children: e === "fr" ? "3 mois gratuits" : "3 months free"
                      }), h.jsx("p", {
                          className: "text-klozd-gray-600",
                          children: e === "fr" ? "Pour les 100 premiers testeurs. Accès complet à toutes les fonctionnalités." : "For the first 100 testers. Full access to all features."
                      }), h.jsxs("div", {
                          className: "mt-4 inline-flex items-center gap-2 text-sm font-medium text-klozd-yellow",
                          children: [h.jsx(B0, {
                              size: 16
                          }), h.jsx("span", {
                              children: e === "fr" ? "Places limitées" : "Limited spots"
                          })]
                      })]
                  })]
              }), h.jsxs("div", {
                  className: "bg-white rounded-2xl border-2 border-klozd-yellow p-6 md:p-8 relative overflow-hidden",
                  children: [h.jsx("div", {
                      className: "absolute top-0 right-0 w-32 h-32 bg-klozd-yellow/10 rounded-full -translate-y-1/2 translate-x-1/2"
                  }), h.jsxs("div", {
                      className: "relative",
                      children: [h.jsx("div", {
                          className: "inline-flex items-center justify-center w-14 h-14 bg-klozd-yellow/10 rounded-2xl mb-4",
                          children: h.jsx($0, {
                              className: "w-7 h-7 text-klozd-yellow"
                          })
                      }), h.jsx("h3", {
                          className: "text-2xl font-bold text-klozd-black mb-2",
                          children: e === "fr" ? "-50% à vie" : "-50% lifetime"
                      }), h.jsx("p", {
                          className: "text-klozd-gray-600",
                          children: e === "fr" ? "Tous les early birds gardent 50% de réduction pour toujours sur tous les plans." : "All early birds keep 50% off forever on all plans."
                      }), h.jsxs("div", {
                          className: "mt-4 inline-flex items-center gap-2 text-sm font-medium text-klozd-yellow",
                          children: [h.jsx(_i, {
                              size: 16
                          }), h.jsx("span", {
                              children: e === "fr" ? "Offre Early Bird" : "Early Bird offer"
                          })]
                      })]
                  })]
              })]
          }), h.jsxs(_.div, {
              initial: {
                  opacity: 0,
                  y: 20
              },
              whileInView: {
                  opacity: 1,
                  y: 0
              },
              viewport: {
                  once: !0
              },
              transition: {
                  duration: .5,
                  delay: .2
              },
              className: "text-center mb-8",
              children: [h.jsx("h3", {
                  className: "text-xl font-semibold text-klozd-black mb-2",
                  children: e === "fr" ? "3 plans disponibles au lancement" : "3 plans available at launch"
              }), h.jsx("p", {
                  className: "text-klozd-gray-600",
                  children: e === "fr" ? "Du solopreneur à l'équipe ambitieuse" : "From solopreneur to ambitious team"
              })]
          }), h.jsx("div", {
              className: "grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto",
              children: n.map( (r, i) => h.jsxs(_.div, {
                  initial: {
                      opacity: 0,
                      y: 30
                  },
                  whileInView: {
                      opacity: 1,
                      y: 0
                  },
                  viewport: {
                      once: !0,
                      margin: "-100px"
                  },
                  transition: {
                      duration: .5,
                      delay: i * .1
                  },
                  className: `relative rounded-2xl p-6 md:p-8 transition-all duration-300 ${r.isPopular ? "bg-white border-2 border-klozd-yellow shadow-xl scale-105 z-10" : "bg-white border border-border hover:shadow-lg"}`,
                  children: [r.isPopular && h.jsxs(_.span, {
                      initial: {
                          scale: 0
                      },
                      whileInView: {
                          scale: 1
                      },
                      viewport: {
                          once: !0
                      },
                      transition: {
                          duration: .3,
                          delay: .3,
                          type: "spring"
                      },
                      className: "absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-4 py-1 rounded-full bg-klozd-yellow text-klozd-black text-xs font-semibold shadow-lg",
                      children: [h.jsx(_i, {
                          size: 12
                      }), e === "fr" ? "Recommandé" : "Recommended"]
                  }), r.isPopular && h.jsx("div", {
                      className: "absolute inset-0 -z-10 bg-klozd-yellow/20 blur-2xl rounded-2xl scale-105"
                  }), h.jsxs("div", {
                      className: "text-center mb-6",
                      children: [h.jsx("h3", {
                          className: "text-lg font-semibold text-klozd-black mb-2",
                          children: r.name
                      }), h.jsx("p", {
                          className: "text-sm text-klozd-gray-600",
                          children: r.description
                      })]
                  }), h.jsxs("div", {
                      className: "text-center mb-6 py-4 bg-klozd-gray-100 rounded-xl",
                      children: [h.jsx("span", {
                          className: "text-lg font-semibold text-klozd-black",
                          children: e === "fr" ? "7 jours d'essai gratuit" : "7-day free trial"
                      }), h.jsx("p", {
                          className: "text-sm text-klozd-gray-600 mt-1",
                          children: e === "fr" ? "Prix révélé au lancement" : "Price revealed at launch"
                      })]
                  }), h.jsx("hr", {
                      className: "border-border mb-6"
                  }), h.jsx("ul", {
                      className: "space-y-4 mb-8",
                      children: r.features.map( (o, s) => h.jsxs(_.li, {
                          initial: {
                              opacity: 0,
                              x: -10
                          },
                          whileInView: {
                              opacity: 1,
                              x: 0
                          },
                          viewport: {
                              once: !0
                          },
                          transition: {
                              duration: .3,
                              delay: .2 + s * .05
                          },
                          className: "flex items-start gap-3",
                          children: [h.jsx(pn, {
                              size: 18,
                              className: `mt-0.5 flex-shrink-0 ${r.isPopular ? "text-klozd-yellow" : "text-green-500"}`
                          }), h.jsx("span", {
                              className: "text-klozd-gray-600 text-sm",
                              children: o
                          })]
                      }, s))
                  }), h.jsx(_.a, {
                      href: "#waitlist",
                      whileHover: {
                          scale: 1.02
                      },
                      whileTap: {
                          scale: .98
                      },
                      className: `block text-center w-full py-3 rounded-full font-medium transition-all duration-300 ${r.isPopular ? "bg-klozd-black text-white hover:shadow-lg" : "border-2 border-klozd-black text-klozd-black hover:bg-klozd-black hover:text-white"}`,
                      children: t.pricing.cta[e]
                  })]
              }, r.name))
          }), h.jsx(_.div, {
              initial: {
                  opacity: 0,
                  y: 10
              },
              whileInView: {
                  opacity: 1,
                  y: 0
              },
              viewport: {
                  once: !0
              },
              transition: {
                  duration: .5,
                  delay: .4
              },
              className: "text-center mt-12",
              children: h.jsxs("div", {
                  className: "inline-flex items-center gap-2 bg-klozd-yellow/10 text-klozd-black px-6 py-3 rounded-full",
                  children: [h.jsx("span", {
                      className: "text-lg",
                      children: "🚀"
                  }), h.jsx("span", {
                      className: "font-medium",
                      children: e === "fr" ? "Rejoins maintenant pour débloquer 3 mois gratuits + 50% à vie" : "Join now to unlock 3 free months + 50% lifetime"
                  })]
              })
          })]
      })
  })
}
;
var zl = "Collapsible"
, [HD,sb] = hr(zl)
, [KD,yh] = HD(zl)
, ab = x.forwardRef( (e, t) => {
  const {__scopeCollapsible: n, open: r, defaultOpen: i, disabled: o, onOpenChange: s, ...a} = e
    , [l,c] = Ki({
      prop: r,
      defaultProp: i ?? !1,
      onChange: s,
      caller: zl
  });
  return h.jsx(KD, {
      scope: n,
      disabled: o,
      contentId: J0(),
      open: l,
      onOpenToggle: x.useCallback( () => c(u => !u), [c]),
      children: h.jsx(oe.div, {
          "data-state": xh(l),
          "data-disabled": o ? "" : void 0,
          ...a,
          ref: t
      })
  })
}
);
ab.displayName = zl;
var lb = "CollapsibleTrigger"
, cb = x.forwardRef( (e, t) => {
  const {__scopeCollapsible: n, ...r} = e
    , i = yh(lb, n);
  return h.jsx(oe.button, {
      type: "button",
      "aria-controls": i.contentId,
      "aria-expanded": i.open || !1,
      "data-state": xh(i.open),
      "data-disabled": i.disabled ? "" : void 0,
      disabled: i.disabled,
      ...r,
      ref: t,
      onClick: ne(e.onClick, i.onOpenToggle)
  })
}
);
cb.displayName = lb;
var vh = "CollapsibleContent"
, ub = x.forwardRef( (e, t) => {
  const {forceMount: n, ...r} = e
    , i = yh(vh, e.__scopeCollapsible);
  return h.jsx(ps, {
      present: n || i.open,
      children: ({present: o}) => h.jsx(qD, {
          ...r,
          ref: t,
          present: o
      })
  })
}
);
ub.displayName = vh;
var qD = x.forwardRef( (e, t) => {
  const {__scopeCollapsible: n, present: r, children: i, ...o} = e
    , s = yh(vh, n)
    , [a,l] = x.useState(r)
    , c = x.useRef(null)
    , u = be(t, c)
    , d = x.useRef(0)
    , f = d.current
    , p = x.useRef(0)
    , b = p.current
    , y = s.open || a
    , w = x.useRef(y)
    , m = x.useRef(void 0);
  return x.useEffect( () => {
      const g = requestAnimationFrame( () => w.current = !1);
      return () => cancelAnimationFrame(g)
  }
  , []),
  nn( () => {
      const g = c.current;
      if (g) {
          m.current = m.current || {
              transitionDuration: g.style.transitionDuration,
              animationName: g.style.animationName
          },
          g.style.transitionDuration = "0s",
          g.style.animationName = "none";
          const v = g.getBoundingClientRect();
          d.current = v.height,
          p.current = v.width,
          w.current || (g.style.transitionDuration = m.current.transitionDuration,
          g.style.animationName = m.current.animationName),
          l(r)
      }
  }
  , [s.open, r]),
  h.jsx(oe.div, {
      "data-state": xh(s.open),
      "data-disabled": s.disabled ? "" : void 0,
      id: s.contentId,
      hidden: !y,
      ...o,
      ref: u,
      style: {
          "--radix-collapsible-content-height": f ? `${f}px` : void 0,
          "--radix-collapsible-content-width": b ? `${b}px` : void 0,
          ...e.style
      },
      children: y && i
  })
}
);
function xh(e) {
  return e ? "open" : "closed"
}
var GD = ab
, QD = cb
, YD = ub
, Ut = "Accordion"
, ZD = ["Home", "End", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"]
, [wh,XD,JD] = yf(Ut)
, [_l,jI] = hr(Ut, [JD, sb])
, bh = sb()
, db = M.forwardRef( (e, t) => {
  const {type: n, ...r} = e
    , i = r
    , o = r;
  return h.jsx(wh.Provider, {
      scope: e.__scopeAccordion,
      children: n === "multiple" ? h.jsx(rI, {
          ...o,
          ref: t
      }) : h.jsx(nI, {
          ...i,
          ref: t
      })
  })
}
);
db.displayName = Ut;
var [fb,eI] = _l(Ut)
, [hb,tI] = _l(Ut, {
  collapsible: !1
})
, nI = M.forwardRef( (e, t) => {
  const {value: n, defaultValue: r, onValueChange: i= () => {}
  , collapsible: o=!1, ...s} = e
    , [a,l] = Ki({
      prop: n,
      defaultProp: r ?? "",
      onChange: i,
      caller: Ut
  });
  return h.jsx(fb, {
      scope: e.__scopeAccordion,
      value: M.useMemo( () => a ? [a] : [], [a]),
      onItemOpen: l,
      onItemClose: M.useCallback( () => o && l(""), [o, l]),
      children: h.jsx(hb, {
          scope: e.__scopeAccordion,
          collapsible: o,
          children: h.jsx(pb, {
              ...s,
              ref: t
          })
      })
  })
}
)
, rI = M.forwardRef( (e, t) => {
  const {value: n, defaultValue: r, onValueChange: i= () => {}
  , ...o} = e
    , [s,a] = Ki({
      prop: n,
      defaultProp: r ?? [],
      onChange: i,
      caller: Ut
  })
    , l = M.useCallback(u => a( (d=[]) => [...d, u]), [a])
    , c = M.useCallback(u => a( (d=[]) => d.filter(f => f !== u)), [a]);
  return h.jsx(fb, {
      scope: e.__scopeAccordion,
      value: s,
      onItemOpen: l,
      onItemClose: c,
      children: h.jsx(hb, {
          scope: e.__scopeAccordion,
          collapsible: !0,
          children: h.jsx(pb, {
              ...o,
              ref: t
          })
      })
  })
}
)
, [iI,Vl] = _l(Ut)
, pb = M.forwardRef( (e, t) => {
  const {__scopeAccordion: n, disabled: r, dir: i, orientation: o="vertical", ...s} = e
    , a = M.useRef(null)
    , l = be(a, t)
    , c = XD(n)
    , d = I1(i) === "ltr"
    , f = ne(e.onKeyDown, p => {
      var P;
      if (!ZD.includes(p.key))
          return;
      const b = p.target
        , y = c().filter(j => {
          var R;
          return !((R = j.ref.current) != null && R.disabled)
      }
      )
        , w = y.findIndex(j => j.ref.current === b)
        , m = y.length;
      if (w === -1)
          return;
      p.preventDefault();
      let g = w;
      const v = 0
        , S = m - 1
        , C = () => {
          g = w + 1,
          g > S && (g = v)
      }
        , k = () => {
          g = w - 1,
          g < v && (g = S)
      }
      ;
      switch (p.key) {
      case "Home":
          g = v;
          break;
      case "End":
          g = S;
          break;
      case "ArrowRight":
          o === "horizontal" && (d ? C() : k());
          break;
      case "ArrowDown":
          o === "vertical" && C();
          break;
      case "ArrowLeft":
          o === "horizontal" && (d ? k() : C());
          break;
      case "ArrowUp":
          o === "vertical" && k();
          break
      }
      const E = g % m;
      (P = y[E].ref.current) == null || P.focus()
  }
  );
  return h.jsx(iI, {
      scope: n,
      disabled: r,
      direction: i,
      orientation: o,
      children: h.jsx(wh.Slot, {
          scope: n,
          children: h.jsx(oe.div, {
              ...s,
              "data-orientation": o,
              ref: l,
              onKeyDown: r ? void 0 : f
          })
      })
  })
}
)
, tl = "AccordionItem"
, [oI,Sh] = _l(tl)
, mb = M.forwardRef( (e, t) => {
  const {__scopeAccordion: n, value: r, ...i} = e
    , o = Vl(tl, n)
    , s = eI(tl, n)
    , a = bh(n)
    , l = J0()
    , c = r && s.value.includes(r) || !1
    , u = o.disabled || e.disabled;
  return h.jsx(oI, {
      scope: n,
      open: c,
      disabled: u,
      triggerId: l,
      children: h.jsx(GD, {
          "data-orientation": o.orientation,
          "data-state": bb(c),
          ...a,
          ...i,
          ref: t,
          disabled: u,
          open: c,
          onOpenChange: d => {
              d ? s.onItemOpen(r) : s.onItemClose(r)
          }
      })
  })
}
);
mb.displayName = tl;
var gb = "AccordionHeader"
, yb = M.forwardRef( (e, t) => {
  const {__scopeAccordion: n, ...r} = e
    , i = Vl(Ut, n)
    , o = Sh(gb, n);
  return h.jsx(oe.h3, {
      "data-orientation": i.orientation,
      "data-state": bb(o.open),
      "data-disabled": o.disabled ? "" : void 0,
      ...r,
      ref: t
  })
}
);
yb.displayName = gb;
var wd = "AccordionTrigger"
, vb = M.forwardRef( (e, t) => {
  const {__scopeAccordion: n, ...r} = e
    , i = Vl(Ut, n)
    , o = Sh(wd, n)
    , s = tI(wd, n)
    , a = bh(n);
  return h.jsx(wh.ItemSlot, {
      scope: n,
      children: h.jsx(QD, {
          "aria-disabled": o.open && !s.collapsible || void 0,
          "data-orientation": i.orientation,
          id: o.triggerId,
          ...a,
          ...r,
          ref: t
      })
  })
}
);
vb.displayName = wd;
var xb = "AccordionContent"
, wb = M.forwardRef( (e, t) => {
  const {__scopeAccordion: n, ...r} = e
    , i = Vl(Ut, n)
    , o = Sh(xb, n)
    , s = bh(n);
  return h.jsx(YD, {
      role: "region",
      "aria-labelledby": o.triggerId,
      "data-orientation": i.orientation,
      ...s,
      ...r,
      ref: t,
      style: {
          "--radix-accordion-content-height": "var(--radix-collapsible-content-height)",
          "--radix-accordion-content-width": "var(--radix-collapsible-content-width)",
          ...e.style
      }
  })
}
);
wb.displayName = xb;
function bb(e) {
  return e ? "open" : "closed"
}
var sI = db
, aI = mb
, lI = yb
, Sb = vb
, Cb = wb;
const cI = sI
, kb = x.forwardRef( ({className: e, ...t}, n) => h.jsx(aI, {
  ref: n,
  className: ut("border-b", e),
  ...t
}));
kb.displayName = "AccordionItem";
const Eb = x.forwardRef( ({className: e, children: t, ...n}, r) => h.jsx(lI, {
  className: "flex",
  children: h.jsxs(Sb, {
      ref: r,
      className: ut("flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180", e),
      ...n,
      children: [t, h.jsx(uE, {
          className: "h-4 w-4 shrink-0 transition-transform duration-200"
      })]
  })
}));
Eb.displayName = Sb.displayName;
const Pb = x.forwardRef( ({className: e, children: t, ...n}, r) => h.jsx(Cb, {
  ref: r,
  className: "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
  ...n,
  children: h.jsx("div", {
      className: ut("pb-4 pt-0", e),
      children: t
  })
}));
Pb.displayName = Cb.displayName;
const uI = () => {
  const {language: e, t} = $t()
    , n = t.faq.items[e];
  return h.jsx("section", {
      id: "faq",
      className: "section-padding bg-klozd-gray-100",
      children: h.jsxs("div", {
          className: "container-klozd",
          children: [h.jsx(_.div, {
              initial: {
                  opacity: 0,
                  y: 20
              },
              whileInView: {
                  opacity: 1,
                  y: 0
              },
              viewport: {
                  once: !0
              },
              transition: {
                  duration: .5
              },
              className: "text-center mb-12",
              children: h.jsx("h2", {
                  className: "headline-section",
                  children: t.faq.headline[e]
              })
          }), h.jsx(_.div, {
              initial: {
                  opacity: 0,
                  y: 20
              },
              whileInView: {
                  opacity: 1,
                  y: 0
              },
              viewport: {
                  once: !0
              },
              transition: {
                  duration: .5,
                  delay: .2
              },
              className: "max-w-2xl mx-auto",
              children: h.jsx(cI, {
                  type: "single",
                  collapsible: !0,
                  className: "space-y-4",
                  children: n.map( (r, i) => h.jsxs(kb, {
                      value: `item-${i}`,
                      className: "border-b border-border bg-transparent",
                      children: [h.jsx(Eb, {
                          className: "text-left font-semibold text-klozd-black hover:no-underline py-5",
                          children: r.question
                      }), h.jsx(Pb, {
                          className: "text-klozd-gray-600 pb-5",
                          children: r.answer
                      })]
                  }, i))
              })
          })]
      })
  })
}
, dI = () => {
  const {language: e, t} = $t()
    , [n] = x.useState(67)
    , r = 500
    , i = n / r * 100
    , [o,s] = x.useState(!1);
  return h.jsxs("section", {
      id: "waitlist",
      className: "section-padding bg-gradient-to-br from-klozd-black via-klozd-gray-900 to-klozd-black relative overflow-hidden",
      children: [h.jsxs("div", {
          className: "absolute inset-0 opacity-30",
          children: [h.jsx("div", {
              className: "absolute top-1/4 left-1/4 w-64 h-64 bg-klozd-yellow/20 rounded-full blur-3xl"
          }), h.jsx("div", {
              className: "absolute bottom-1/4 right-1/4 w-96 h-96 bg-klozd-yellow/10 rounded-full blur-3xl"
          })]
      }), h.jsx("div", {
          className: "container-klozd relative z-10",
          children: h.jsxs("div", {
              className: "max-w-2xl mx-auto text-center",
              children: [h.jsxs(_.div, {
                  initial: {
                      opacity: 0,
                      y: 20
                  },
                  whileInView: {
                      opacity: 1,
                      y: 0
                  },
                  viewport: {
                      once: !0
                  },
                  transition: {
                      duration: .5
                  },
                  className: "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-klozd-yellow/20 text-klozd-yellow text-sm font-medium mb-6",
                  children: [h.jsx(_.span, {
                      animate: {
                          rotate: [0, 15, -15, 0]
                      },
                      transition: {
                          duration: 2,
                          repeat: 1 / 0
                      },
                      children: h.jsx(_i, {
                          size: 14
                      })
                  }), t.finalCta.badge[e]]
              }), h.jsxs(_.h2, {
                  initial: {
                      opacity: 0,
                      y: 20
                  },
                  whileInView: {
                      opacity: 1,
                      y: 0
                  },
                  viewport: {
                      once: !0
                  },
                  transition: {
                      duration: .5,
                      delay: .1
                  },
                  className: "text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6",
                  children: [t.finalCta.headline[e], h.jsx("br", {}), h.jsx("span", {
                      className: "text-klozd-yellow",
                      children: t.finalCta.headlineSub[e]
                  })]
              }), h.jsx(_.p, {
                  initial: {
                      opacity: 0,
                      y: 20
                  },
                  whileInView: {
                      opacity: 1,
                      y: 0
                  },
                  viewport: {
                      once: !0
                  },
                  transition: {
                      duration: .5,
                      delay: .2
                  },
                  className: "text-lg text-klozd-gray-400 mb-10 max-w-md mx-auto",
                  children: t.finalCta.description[e]
              }), h.jsxs(_.div, {
                  initial: {
                      opacity: 0,
                      scale: .95
                  },
                  whileInView: {
                      opacity: 1,
                      scale: 1
                  },
                  viewport: {
                      once: !0
                  },
                  transition: {
                      duration: .5,
                      delay: .3
                  },
                  className: "mb-10",
                  children: [h.jsx("div", {
                      className: "bg-white/10 rounded-full h-4 overflow-hidden mb-3 max-w-md mx-auto backdrop-blur-sm border border-white/10",
                      children: h.jsx(_.div, {
                          initial: {
                              width: 0
                          },
                          whileInView: {
                              width: `${i}%`
                          },
                          viewport: {
                              once: !0
                          },
                          transition: {
                              duration: 1.5,
                              delay: .5,
                              ease: "easeOut"
                          },
                          className: "h-full bg-gradient-to-r from-klozd-yellow to-amber-400 rounded-full relative",
                          children: h.jsx("div", {
                              className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                          })
                      })
                  }), h.jsxs("div", {
                      className: "flex justify-center items-center gap-2 text-klozd-gray-400 text-sm",
                      children: [h.jsx(B0, {
                          size: 16
                      }), h.jsxs("span", {
                          children: [h.jsx("span", {
                              className: "text-white font-semibold",
                              children: n
                          }), "/", r, " ", t.finalCta.spotsTaken[e]]
                      })]
                  })]
              }), h.jsx(_.div, {
                  initial: {
                      opacity: 0,
                      y: 20
                  },
                  whileInView: {
                      opacity: 1,
                      y: 0
                  },
                  viewport: {
                      once: !0
                  },
                  transition: {
                      duration: .5,
                      delay: .4
                  },
                  children: h.jsxs(_.a, {
                      href: "#",
                      onHoverStart: () => s(!0),
                      onHoverEnd: () => s(!1),
                      whileHover: {
                          scale: 1.05
                      },
                      whileTap: {
                          scale: .95
                      },
                      className: "relative inline-flex items-center gap-3 px-10 py-5 bg-white text-klozd-black font-bold text-lg rounded-full transition-all duration-300 shadow-2xl overflow-hidden group",
                      children: [h.jsx("div", {
                          className: "absolute inset-0 bg-gradient-to-r from-transparent via-klozd-yellow/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                      }), h.jsx("span", {
                          className: "relative z-10",
                          children: t.finalCta.cta[e]
                      }), h.jsx(_.span, {
                          animate: {
                              x: o ? 5 : 0
                          },
                          className: "relative z-10",
                          children: h.jsx(F0, {
                              size: 22
                          })
                      })]
                  })
              }), h.jsxs(_.p, {
                  initial: {
                      opacity: 0
                  },
                  whileInView: {
                      opacity: 1
                  },
                  viewport: {
                      once: !0
                  },
                  transition: {
                      duration: .5,
                      delay: .5
                  },
                  className: "text-klozd-gray-400 text-sm mt-6",
                  children: [t.finalCta.noCreditCard[e], " • ", t.finalCta.joinCount[e], " ", n, " ", t.finalCta.entrepreneurs[e]]
              }), h.jsx(_.div, {
                  initial: {
                      opacity: 0,
                      y: 20
                  },
                  whileInView: {
                      opacity: 1,
                      y: 0
                  },
                  viewport: {
                      once: !0
                  },
                  transition: {
                      duration: .5,
                      delay: .6
                  },
                  className: "flex justify-center items-center gap-3 mt-8",
                  children: h.jsx("div", {
                      className: "flex -space-x-2",
                      children: ["ZA", "TL", "SM", "JD", "PL", "CL"].map( (a, l) => h.jsx(_.div, {
                          initial: {
                              scale: 0
                          },
                          whileInView: {
                              scale: 1
                          },
                          viewport: {
                              once: !0
                          },
                          transition: {
                              duration: .3,
                              delay: .7 + l * .05
                          },
                          className: "w-10 h-10 rounded-full bg-klozd-yellow flex items-center justify-center text-xs font-bold text-white border-2 border-klozd-black",
                          children: a
                      }, l))
                  })
              })]
          })
      })]
  })
}
, fI = () => {
  const {language: e, t} = $t()
    , n = {
      product: [{
          name: t.footer.features[e],
          href: "#features"
      }, {
          name: t.nav.pricing[e],
          href: "#pricing"
      }, {
          name: t.nav.faq[e],
          href: "#faq"
      }],
      company: [],
      legal: [{
          name: t.footer.privacy[e],
          href: "/privacy"
      }]
  };
  return h.jsx("footer", {
      className: "bg-klozd-black py-16",
      children: h.jsxs("div", {
          className: "container-klozd",
          children: [h.jsxs("div", {
              className: "grid grid-cols-2 md:grid-cols-3 gap-8 mb-12",
              children: [h.jsxs("div", {
                  className: "col-span-2 md:col-span-1",
                  children: [h.jsx("span", {
                      className: "text-xl font-bold text-white",
                      children: "KLOZD"
                  }), h.jsx("p", {
                      className: "text-klozd-gray-400 text-sm mt-3 max-w-xs",
                      children: t.footer.tagline[e]
                  })]
              }), h.jsxs("div", {
                  children: [h.jsx("h4", {
                      className: "font-semibold text-white mb-4",
                      children: t.footer.product[e]
                  }), h.jsx("ul", {
                      className: "space-y-3",
                      children: n.product.map(r => h.jsx("li", {
                          children: h.jsx("a", {
                              href: r.href,
                              className: "text-klozd-gray-400 hover:text-white transition-colors text-sm",
                              children: r.name
                          })
                      }, r.name))
                  })]
              }), h.jsxs("div", {
                  children: [h.jsx("h4", {
                      className: "font-semibold text-white mb-4",
                      children: t.footer.legal[e]
                  }), h.jsx("ul", {
                      className: "space-y-3",
                      children: n.legal.map(r => h.jsx("li", {
                          children: h.jsx("a", {
                              href: r.href,
                              className: "text-klozd-gray-400 hover:text-white transition-colors text-sm",
                              children: r.name
                          })
                      }, r.name))
                  })]
              })]
          }), h.jsx("div", {
              className: "border-t border-white/10 pt-8",
              children: h.jsx("p", {
                  className: "text-klozd-gray-400 text-sm text-center",
                  children: t.footer.copyright[e]
              })
          })]
      })
  })
}
, Fg = "/assets/mockup-forms-D3TCSpJs.png"
, hI = "/assets/mockup-scheduling-CicBjjrH.png"
, pI = "/assets/mockup-video-CFUvIAfE.png"
, mI = "/assets/mockup-ai-CQemrNr0.png"
, Bg = "/assets/mockup-dashboard-BVSFSSnl.png"
, gI = [{
  featureKey: "forms",
  imageSrc: Fg,
  imageAlt: "KLOZD Smart Forms",
  imageLeft: !1
}, {
  featureKey: "scheduling",
  imageSrc: hI,
  imageAlt: "KLOZD AI Scheduling",
  imageLeft: !0
}, {
  featureKey: "video",
  imageSrc: pI,
  imageAlt: "KLOZD Integrated Video",
  imageLeft: !1
}, {
  featureKey: "crm",
  imageSrc: M1,
  imageAlt: "KLOZD CRM Inbox Zero",
  imageLeft: !0
}, {
  featureKey: "ai",
  imageSrc: mI,
  imageAlt: "KLOZD Predictive AI",
  imageLeft: !1
}, {
  featureKey: "salesPages",
  imageSrc: Fg,
  imageAlt: "KLOZD AI Sales Pages",
  imageLeft: !0
}, {
  featureKey: "dashboard",
  imageSrc: Bg,
  imageAlt: "KLOZD Dashboard",
  imageLeft: !1
}, {
  featureKey: "gamification",
  imageSrc: Bg,
  imageAlt: "KLOZD Team Gamification",
  imageLeft: !0
}]
, yI = () => h.jsx(hD, {
  children: h.jsxs("div", {
      className: "min-h-screen bg-background",
      children: [h.jsx(pD, {}), h.jsx(mD, {}), h.jsx(LD, {}), h.jsx("div", {
          id: "features",
          children: gI.map( (e, t) => h.jsx(OD, {
              ...e
          }, t))
      }), h.jsx(zD, {}), h.jsx(_D, {}), h.jsx(UD, {}), h.jsx(WD, {}), h.jsx(dI, {}), h.jsx(uI, {}), h.jsx(fI, {})]
  })
})
, vI = () => {
  const e = Hx();
  return x.useEffect( () => {
      console.error("404 Error: User attempted to access non-existent route:", e.pathname)
  }
  , [e.pathname]),
  h.jsx("div", {
      className: "flex min-h-screen items-center justify-center bg-muted",
      children: h.jsxs("div", {
          className: "text-center",
          children: [h.jsx("h1", {
              className: "mb-4 text-4xl font-bold",
              children: "404"
          }), h.jsx("p", {
              className: "mb-4 text-xl text-muted-foreground",
              children: "Oops! Page not found"
          }), h.jsx("a", {
              href: "/",
              className: "text-primary underline hover:text-primary/90",
              children: "Return to Home"
          })]
      })
  })
}
, xI = new B2
, wI = () => h.jsx(U2, {
  client: xI,
  children: h.jsxs(y2, {
      children: [h.jsx(JE, {}), h.jsx(jP, {}), h.jsx(AA, {
          children: h.jsxs(EA, {
              children: [h.jsx(qu, {
                  path: "/",
                  element: h.jsx(yI, {})
              }), h.jsx(qu, {
                  path: "*",
                  element: h.jsx(vI, {})
              })]
          })
      })]
  })
});
u0(document.getElementById("root")).render(h.jsx(wI, {}));
