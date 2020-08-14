(function (win, doc) {
    if (win.$wt) {
      console.log("WTINFO:load running twice");
      return;
    }
  
    win.isIE = function () {
      var ie =
      /*@cc_on!@*/
      0;
  
      if (ie) {
        var v = 3;
        var div = doc.createElement("div");
        var all = div.getElementsByTagName("i");
  
        while (div.innerHTML = "<!--[if gt IE " + ++v + "]><i></i><![endif]-->", all[0]) {}
  
        return v > 4 ? v :
        /*@cc_on!@*/
        false;
      }
  
      return ie;
    }();
  
    win.$wt = {
      _version: "1.0.0",
      _path: "//europa.eu/webtools",
      _js: "/js.php?widgets=",
      _css: "/css.php?widgets=",
      _jsonp: "/jsonp.php?url=",
      _analytics: '{"root":{"ec.europa.eu":["ec.europa.eu\/index*","ec.europa.eu\/about_*","ec.europa.eu\/represent_*","ec.europa.eu\/info","ec.europa.eu\/priorities","ec.europa.eu\/commission","ec.europa.eu\/about","ec.europa.eu\/atwork","ec.europa.eu\/policies","ec.europa.eu\/contracts_grants","ec.europa.eu\/news","ec.europa.eu\/legislation","ec.europa.eu\/geninfo\/europa_analytics_*","ec.europa.eu\/geninfo\/legal_notices_*","ec.europa.eu\/green-papers","ec.europa.eu\/white-papers","ec.europa.eu\/cookies","ec.europa.eu\/contact","ec.europa.eu\/services","ec.europa.eu\/your-rights","ec.europa.eu\/visits","ec.europa.eu\/sitemap"],"europa.eu":["europa.eu\/index*","europa.eu\/european-union"]},"ec.europa.eu":{"url":"https:\/\/webanalytics.ec.europa.eu\/","status":true},"europa.eu":{"url":"https:\/\/webanalytics.europa.eu\/","status":true},"testing":{"url":"https:\/\/webgate.ec.europa.eu\/fpfis\/piwik\/","status":true}}',
      _service_binding: {
        "twitter": "smk",
        "chart": "charts",
        "share": "sbkm",
        "maps": "map"
      },
      extend: function (o) {
        for (var i in o) {
          $wt[i] = o[i];
        }
      },
      ready: function (fn) {
        var done = false;
        var top = true;
        var root = doc.documentElement;
        var modern = doc.addEventListener;
        var add = modern ? "addEventListener" : "attachEvent";
        var rem = modern ? "removeEventListener" : "detachEvent";
        var pre = modern ? "" : "on";
  
        var init = function (e) {
          if (e.type === "readystatechange" && doc.readyState !== "complete") {
            return;
          }
  
          (e.type === "load" ? win : doc)[rem](pre + e.type, init, false);
  
          if (!done && (done = true)) {
            fn.call(win, e.type || e);
          }
        };
  
        var poll = function () {
          try {
            root.doScroll("left");
          } catch (e) {
            setTimeout(poll, 50);
            return;
          }
  
          init("poll");
        };
  
        if (doc.readyState === "complete") {
          fn.call(win, "lazy");
        } else {
          if (!modern && root.doScroll) {
            try {
              top = !win.frameElement;
            } catch (e) {}
  
            if (top) {
              poll();
            }
          }
  
          doc[add](pre + "DOMContentLoaded", init, false);
          doc[add](pre + "readystatechange", init, false);
          win[add](pre + "load", init, false);
        }
      },
      addEvent: function (o, e, f) {
        if (e === "load" && doc.readyState === "complete") {
          f();
          return;
        }
  
        if (o.addEventListener) {
          o.addEventListener(e, f, false);
        } else if (o.attachEvent) {
          o.attachEvent("on" + e, f);
        }
      },
      removeEvent: function (o, e, f) {
        if (o.removeEventListener) {
          o.removeEventListener(e, f, false);
        } else if (o.detachEvent) {
          o.detachEvent("on" + e, f);
        }
      },
      trigger: function (d, n) {
        var e,
            v = document.createEvent;
  
        if (v) {
          e = document.createEvent("HTMLEvents");
          e.initEvent(n, true, true);
        } else {
          e = document.createEventObject();
          e.eventType = n;
        }
  
        e.eventName = n;
  
        if (v) {
          d.dispatchEvent(e);
        } else {
          d.fireEvent("on" + e.eventType, e);
        }
      },
      getExtension: function (s) {
        if (!s) {
          return;
        }
  
        s = s.toLowerCase().split("#")[0].split("?")[0];
        return (/[.]/.exec(s) ? /[^.]+$/.exec(s) : undefined) + "";
      },
      before: function (newElm, targetElm) {
        var p,
            t = targetElm;
        var n = newElm;
  
        if (t) {
          p = t.parentNode;
  
          if (p) {
            p.insertBefore(n, t);
          }
        }
      },
      after: function (newElm, targetElm) {
        var p,
            t = targetElm;
        var n = newElm;
  
        if (t) {
          p = t.parentNode;
  
          if (p.lastchild === t) {
            p.appendChild(n);
          } else {
            p.insertBefore(n, t.nextSibling);
          }
        }
      },
      remove: function (elm) {
        if (elm) {
          if (elm.parentNode) {
            elm.parentNode.removeChild(elm);
          }
        }
      },
      getDocLang: function (useDefault) {
        if (doc.lang) {
          return doc.lang;
        }
  
        var l = useDefault || "en";
        var a = doc.getElementsByTagName("html");
        var n = doc.querySelectorAll("meta[http-equiv='Content-Language']");
        var g = (win.location + "").replace(/(.*)(_|-|::|=|\/)([a-zA-Z]{2})(\.|&|#|$|\?|\/)(.*)/ig, "$3");
  
        if (a[0] && a[0].lang) {
          l = a[0].lang.split("_")[0].split("-")[0];
        } else if (n[0]) {
          l = n[0].content;
        } else if (g.length === 2) {
          l = g.toLowerCase();
        }
  
        doc.lang = l;
        return l;
      },
      include: function (srcFile, callback, ext, forceReload, async) {
        if (!$wt.isLoad) {
          $wt.isLoad = [];
        }
  
        var i,
            s = srcFile;
        var f = callback;
        var t = $wt.isLoad[s] ? true : false;
        var j, e, h, r;
  
        if (t === false || forceReload) {
          e = ext ? ext : $wt.getExtension(s);
  
          if (e === "css") {
            i = doc.createElement("link");
            i.setAttribute("type", "text/css");
            i.setAttribute("rel", "stylesheet");
            i.setAttribute("media", "all");
            i.setAttribute("href", s);
            h = doc.getElementsByTagName("head")[0];
          } else {
            i = doc.createElement("script");
            i.setAttribute("type", "text/javascript");
            i.setAttribute("src", s);
            h = doc.getElementsByTagName("body")[0];
          }
  
          if (typeof f === "function") {
            if (isIE) {
              i.onreadystatechange = function () {
                j = this.readyState;
  
                if (j === "loaded" || j === "complete") {
                  f(i);
                }
              };
            } else {
              i.onload = f;
            }
  
            i.onerror = function () {
              f("error");
            };
          }
  
          if (h) {
            if (async) {
              i.setAttribute("async", "async");
            }
  
            h.appendChild(i);
          }
  
          $wt.isLoad[s] = i;
        } else if (typeof f === "function") {
          f();
        }
  
        return i;
      },
      load: function (srcFiles, callback) {
        var toLoad = typeof srcFiles === "string" ? [srcFiles] : srcFiles;
        $wt.include(toLoad[0], function () {
          toLoad.shift();
  
          if (toLoad.length === 0) {
            if (typeof callback === "function") {
              callback();
            }
  
            return;
          }
  
          $wt.load(toLoad, callback);
        }, $wt.getExtension(toLoad[0]), true);
      },
      getUrlParams: function (s) {
        var p = {};
        (s || window.location.search).replace(/[?&]+([^=&]+)=([^&]*)/gi, function (str, key, value) {
          value = decodeURIComponent(value);
  
          if (key.indexOf("[") !== -1) {
            var k = key.replace("[]", "");
  
            if (!p[k]) {
              p[k] = [];
            }
  
            p[k].push(value);
          } else {
            p[key] = value;
          }
        });
        return p;
      },
      regenerate: function (n, c) {
        for (var x in $wt._nameRef) {
          if ($wt[$wt._nameRef[x]]) {
            if (typeof $wt[$wt._nameRef[x]].onRemove === "function") {
              var domToClean = $wt[$wt._nameRef[x]].onRemove();
  
              for (var i = 0, l = domToClean.length; i < l; i++) {
                $wt.remove(domToClean[i]);
              }
            }
          }
        }
  
        for (var x in $wt._store) {
          $wt.remove($wt._store[x]);
        }
  
        $wt._store = [];
        $wt._domRef = [];
        $wt.remove(window.wtJS);
        $wt.remove(window.wtCSS);
        window.wtJS = false;
        window.wtCSS = false;
  
        $wt._collect();
      },
      refresh: function (n, c) {
        this.regenerate(n, c);
      },
      _store: [],
      _inProgress: false,
      _domRef: [],
      _nameRef: [],
      components: [],
      _isVisible: function (e) {
        var c = e.getBoundingClientRect();
        return c.top >= 0 && c.top <= (window.innerHeight || document.documentElement.clientHeight);
      },
      _getSnippet: function () {
        var n = [];
        var a = document.getElementsByTagName("script");
  
        for (var i = 0, l = a.length; i < l; i++) {
          if (a[i].type === "application/json") {
            n.push(a[i]);
          }
        }
  
        return n;
      },
      _queue: function (c) {
        if (c === "next") {
          $wt._inProgress = false;
          var c = win.wtCurrentProcess;
          c.className = c.className.split(" ")[0] + " wtWidgets wtEnd";
  
          try {
            window[c.params.events.onready](c);
          } catch (e) {}
        }
  
        if (!$wt._inProgress) {
          clearTimeout($wt.timeOut);
          $wt.timeOut = setTimeout($wt._process, 9);
        }
      },
      _collect: function () {
        if (!doc.querySelectorAll) {
          return;
        }
  
        var n = $wt._getSnippet();
  
        var c = [];
  
        if (n.length || $wt.urlParams["wtpanel"]) {
          for (var x = 0, l = n.length; x < l; x++) {
            var j = {};
  
            try {
              j = JSON.parse(n[x].innerHTML);
            } catch (e) {
              console.log("WTERROR:[UEC] Invalid / malformed JSON object");
            }
  
            if (j["service"]) {
              if ($wt._service_binding[j["service"]]) {
                j["service"] = $wt._service_binding[j["service"]];
              }
  
              var v = j["version"] ? j["version"] + "/" : "";
              var a = j["lang"] ? "-" + j["lang"] : "";
              var t = doc.createElement("div");
              var u = j["renderTo"] ? document.getElementById(j["renderTo"]) : false;
  
              $wt._domRef.push(t);
  
              t.ref = n[x];
              t.script = n[x];
              t.params = j;
              t.className = j["service"] + " wtWidgets wtWaiting";
  
              if (u) {
                u.innerHTML = "";
                u.appendChild(t);
              } else {
                $wt.before(t, n[x]);
              }
  
              $wt._store.push(t);
  
              if (c.indexOf(v + j["service"] + a) === -1) {
                c.push(v + j["service"] + a);
              }
  
              $wt._nameRef[j["service"]] = j["service"];
              n[x].container = t;
              n[x].params = j;
              $wt.components[j["name"] || x] = n[x];
            }
          }
  
          if (c.length || $wt.urlParams["wtpanel"]) {
            var p = $wt.urlParams;
            var ko = c.join(",");
            var u = p["wtpanel"] && p["wtpanel"] === "true" ? ko + ",debug" : ko;
            u += "&lang=" + $wt.getDocLang();
            u += p["wtdebug"] ? "&wtdebug=true" : "";
            window.wtJS = $wt.include($wt._path + $wt._js + u, function () {
              $wt._queue();
  
              if (!window.wtEvents) {
                $wt.addEvent(win, "scroll", $wt._queue);
                $wt.addEvent(win, "resize", $wt._queue);
                $wt.addEvent(win, "orientationchange", $wt._queue);
                window.wtEvents = true;
              }
            }, "js", true);
  
            if (!window.wtCSS) {
              window.wtCSS = $wt.include($wt._path + $wt._css + u.replace(/\-[a-z]{2}(&)?/ig, "$1"), null, "css", true);
            }
          }
        }
      },
      _process: function () {
        for (var i = 0, l = $wt._store.length; i < l; i++) {
          var k = $wt._store[i];
          var scrp = k.className.split(" ")[0];
          $wt[scrp] = $wt[scrp] || {};
          var forceProcess = false;
  
          if (typeof $wt[scrp].initialize === "function") {
            forceProcess = $wt[scrp].initialize(k);
          } else if ($wt[scrp].initialize) {
            forceProcess = $wt[scrp].initialize;
          } else if (k) {
            if (k.params) {
              forceProcess = k.params.render;
            }
          }
  
          if ($wt._isVisible(k) || forceProcess) {
            k.className = scrp + " wtWidgets wtLoading";
            win.wtCurrentProcess = k;
  
            $wt._store.splice(i, 1);
  
            $wt._inProgress = true;
  
            try {
              $wt[scrp].run(k);
            } catch (e) {
              $wt._queue("next");
  
              k.innerHTML = "<b>" + scrp + ".js</b>:" + e;
              k.className = scrp + " wtWidgets wtError";
            }
  
            break;
          }
        }
      },
      _utility: function (byPass) {
        if (!doc.querySelectorAll) {
          $wt.include("//europa.eu/webtools/services/piwik/piwik_old.js");
          return;
        }
  
        var n = $wt._getSnippet();
  
        for (var x = 0, l = n.length; x < l; x++) {
          var j = n[x].parse || {};
  
          if (!n[x].parse) {
            try {
              j = JSON.parse(n[x].innerHTML);
              n[x].parse = j;
            } catch (e) {
              console.log("WTERROR:[UEC] Invalid / malformed JSON object");
            }
          }
  
          if (j["utility"]) {
            $wt.components[j.utility] = j;
            var pa = j;
            var nm = j["utility"];
            var ve = j["version"] ? j["version"] + "/" : "";
            $wt.include($wt._path + "/services/" + nm + "/" + ve + "" + nm + ".js", function (json, error) {
              if ($wt[nm] && typeof $wt[nm].run === "function") {
                $wt[nm].run(pa);
              } else {
                console.log("WTERROR:[UTILITY] - ", nm, " was not loaded correctly!");
              }
            });
          }
        }
      },
      frame: {
        init: function () {
          if (top.window !== window) {
            if (window.name.indexOf("WT_FRAME_") !== -1) {
              var O = {
                position: "absolute",
                left: 0,
                right: 0,
                display: "inline-block",
                margin: 0,
                overflow: "hidden"
              };
  
              for (var x in O) {
                document.body.style[x] = O[x];
              }
  
              $wt.addEvent(window, "load", function () {
                $wt.frame.resize();
                $wt.addEvent(window, "resize", $wt.frame.resize);
                $wt.addEvent(window, "orientationchange", $wt.frame.resize);
  
                if ("MutationObserver" in window) {
                  var O = new MutationObserver($wt.frame.resize);
                  O.observe(document.body, {
                    childList: true
                  });
                }
              });
              $wt.addEvent(window, "message", $wt.frame.piwik);
            }
          } else {
            $wt.addEvent(window, "message", $wt.frame.parent);
          }
        },
        resize: function () {
          if (top.window === window && !parent.postMessage) {
            return;
          }
  
          parent.postMessage({
            service: "frame",
            name: window.name,
            height: document.body.offsetHeight
          }, "*");
        },
        piwik: function (e) {
          if (!window._paq) {
            $wt.include($wt._path + "/services/piwik/piwik.js", function () {
              $wt.piwik.run(e.data);
              setTimeout(function () {
                if ($wt.trackLinks) {
                  $wt.trackLinks(document.body);
                }
              }, 500);
            });
          }
        },
        parent: function (e) {
          if (e.data && e.data.service === "frame") {
            var x = e.data.name;
            var h = e.data.height;
            var d = 0;
            var I = document.querySelectorAll("iframe[name='" + x + "']")[0];
            var W = I.offsetWidth;
            var P = I.previousWidth;
  
            if (W === P && I.offsetHeight === h) {
              I.previousHeight = h;
              I.previousWidth = W;
            } else {
              if (W > P && I.previousHeight) {
                d = Math.round((W - P) * (h / W));
                h = I.previousHeight - d;
              }
  
              I.previousHeight = h;
              I.previousWidth = I.offsetWidth;
              I.height = h;
            }
          }
  
          var p = $wt.components["piwik"];
  
          if (p) {
            if (!win.frames[x].already) {
              win.frames[x].already = true;
              p._frame = true;
              win.frames[x].postMessage(p, "*");
            }
          }
        }
      }
    };
    $wt.urlParams = $wt.getUrlParams();
    $wt.ready($wt._utility);
    $wt.addEvent(win, "load", function () {
      $wt._collect();
  
      if ($wt.urlParams["widgets"] === "gnav") {
        $wt.include($wt._path + "/services/gnav/gnav.js", function () {
          $wt.gnav.run();
        });
      }
  
      ;
    });
    $wt.frame.init();
  })(window, document);