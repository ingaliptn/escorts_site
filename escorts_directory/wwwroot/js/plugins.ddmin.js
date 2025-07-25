!(function () {
    "use strict";
    function t(o) {
        if (!o) throw new Error("No options passed to Waypoint constructor");
        if (!o.element) throw new Error("No element option passed to Waypoint constructor");
        if (!o.handler) throw new Error("No handler option passed to Waypoint constructor");
        (this.key = "waypoint-" + e),
            (this.options = t.Adapter.extend({}, t.defaults, o)),
            (this.element = this.options.element),
            (this.adapter = new t.Adapter(this.element)),
            (this.callback = o.handler),
            (this.axis = this.options.horizontal ? "horizontal" : "vertical"),
            (this.enabled = this.options.enabled),
            (this.triggerPoint = null),
            (this.group = t.Group.findOrCreate({ name: this.options.group, axis: this.axis })),
            (this.context = t.Context.findOrCreateByElement(this.options.context)),
            t.offsetAliases[this.options.offset] && (this.options.offset = t.offsetAliases[this.options.offset]),
            this.group.add(this),
            this.context.add(this),
            (i[this.key] = this),
            (e += 1);
    }
    var e = 0,
        i = {};
    (t.prototype.queueTrigger = function (t) {
        this.group.queueTrigger(this, t);
    }),
        (t.prototype.trigger = function (t) {
            this.enabled && this.callback && this.callback.apply(this, t);
        }),
        (t.prototype.destroy = function () {
            this.context.remove(this), this.group.remove(this), delete i[this.key];
        }),
        (t.prototype.disable = function () {
            return (this.enabled = !1), this;
        }),
        (t.prototype.enable = function () {
            return this.context.refresh(), (this.enabled = !0), this;
        }),
        (t.prototype.next = function () {
            return this.group.next(this);
        }),
        (t.prototype.previous = function () {
            return this.group.previous(this);
        }),
        (t.invokeAll = function (t) {
            var e = [];
            for (var o in i) e.push(i[o]);
            for (var s = 0, n = e.length; n > s; s++) e[s][t]();
        }),
        (t.destroyAll = function () {
            t.invokeAll("destroy");
        }),
        (t.disableAll = function () {
            t.invokeAll("disable");
        }),
        (t.enableAll = function () {
            t.Context.refreshAll();
            for (var e in i) i[e].enabled = !0;
            return this;
        }),
        (t.refreshAll = function () {
            t.Context.refreshAll();
        }),
        (t.viewportHeight = function () {
            return window.innerHeight || document.documentElement.clientHeight;
        }),
        (t.viewportWidth = function () {
            return document.documentElement.clientWidth;
        }),
        (t.adapters = []),
        (t.defaults = { context: window, continuous: !0, enabled: !0, group: "default", horizontal: !1, offset: 0 }),
        (t.offsetAliases = {
            "bottom-in-view": function () {
                return this.context.innerHeight() - this.adapter.outerHeight();
            },
            "right-in-view": function () {
                return this.context.innerWidth() - this.adapter.outerWidth();
            },
        }),
        (window.Waypoint = t);
})(),
    (function () {
        "use strict";
        function t(s) {
            (this.element = s),
                (this.Adapter = o.Adapter),
                (this.adapter = new this.Adapter(s)),
                (this.key = "waypoint-context-" + e),
                (this.didScroll = !1),
                (this.didResize = !1),
                (this.oldScroll = { x: this.adapter.scrollLeft(), y: this.adapter.scrollTop() }),
                (this.waypoints = { vertical: {}, horizontal: {} }),
                (s.waypointContextKey = this.key),
                (i[s.waypointContextKey] = this),
                (e += 1),
                o.windowContext || ((o.windowContext = !0), (o.windowContext = new t(window))),
                this.createThrottledScrollHandler(),
                this.createThrottledResizeHandler();
        }
        var e = 0,
            i = {},
            o = window.Waypoint,
            s = window.onload;
        (t.prototype.add = function (t) {
            var e = t.options.horizontal ? "horizontal" : "vertical";
            (this.waypoints[e][t.key] = t), this.refresh();
        }),
            (t.prototype.checkEmpty = function () {
                var t = this.Adapter.isEmptyObject(this.waypoints.horizontal),
                    e = this.Adapter.isEmptyObject(this.waypoints.vertical),
                    o = this.element == this.element.window;
                t && e && !o && (this.adapter.off(".waypoints"), delete i[this.key]);
            }),
            (t.prototype.createThrottledResizeHandler = function () {
                function t() {
                    e.handleResize(), (e.didResize = !1);
                }
                var e = this;
                this.adapter.on("resize.waypoints", function () {
                    e.didResize || ((e.didResize = !0), o.requestAnimationFrame(t));
                });
            }),
            (t.prototype.createThrottledScrollHandler = function () {
                function t() {
                    e.handleScroll(), (e.didScroll = !1);
                }
                var e = this;
                this.adapter.on("scroll.waypoints", function () {
                    (!e.didScroll || o.isTouch) && ((e.didScroll = !0), o.requestAnimationFrame(t));
                });
            }),
            (t.prototype.handleResize = function () {
                o.Context.refreshAll();
            }),
            (t.prototype.handleScroll = function () {
                var t = {},
                    e = {
                        horizontal: { newScroll: this.adapter.scrollLeft(), oldScroll: this.oldScroll.x, forward: "right", backward: "left" },
                        vertical: { newScroll: this.adapter.scrollTop(), oldScroll: this.oldScroll.y, forward: "down", backward: "up" },
                    };
                for (var i in e) {
                    var o = e[i],
                        s = o.newScroll > o.oldScroll ? o.forward : o.backward;
                    for (var n in this.waypoints[i]) {
                        var r = this.waypoints[i][n];
                        if (null !== r.triggerPoint) {
                            var a = o.oldScroll < r.triggerPoint,
                                h = o.newScroll >= r.triggerPoint;
                            ((a && h) || (!a && !h)) && (r.queueTrigger(s), (t[r.group.id] = r.group));
                        }
                    }
                }
                for (var l in t) t[l].flushTriggers();
                this.oldScroll = { x: e.horizontal.newScroll, y: e.vertical.newScroll };
            }),
            (t.prototype.innerHeight = function () {
                return this.element == this.element.window ? o.viewportHeight() : this.adapter.innerHeight();
            }),
            (t.prototype.remove = function (t) {
                delete this.waypoints[t.axis][t.key], this.checkEmpty();
            }),
            (t.prototype.innerWidth = function () {
                return this.element == this.element.window ? o.viewportWidth() : this.adapter.innerWidth();
            }),
            (t.prototype.destroy = function () {
                var t = [];
                for (var e in this.waypoints) for (var i in this.waypoints[e]) t.push(this.waypoints[e][i]);
                for (var o = 0, s = t.length; s > o; o++) t[o].destroy();
            }),
            (t.prototype.refresh = function () {
                var t,
                    e = this.element == this.element.window,
                    i = e ? void 0 : this.adapter.offset(),
                    s = {};
                this.handleScroll(),
                    (t = {
                        horizontal: { contextOffset: e ? 0 : i.left, contextScroll: e ? 0 : this.oldScroll.x, contextDimension: this.innerWidth(), oldScroll: this.oldScroll.x, forward: "right", backward: "left", offsetProp: "left" },
                        vertical: { contextOffset: e ? 0 : i.top, contextScroll: e ? 0 : this.oldScroll.y, contextDimension: this.innerHeight(), oldScroll: this.oldScroll.y, forward: "down", backward: "up", offsetProp: "top" },
                    });
                for (var n in t) {
                    var r = t[n];
                    for (var a in this.waypoints[n]) {
                        var h,
                            l,
                            p,
                            c,
                            d,
                            u = this.waypoints[n][a],
                            m = u.options.offset,
                            f = u.triggerPoint,
                            g = 0,
                            w = null == f;
                        u.element !== u.element.window && (g = u.adapter.offset()[r.offsetProp]),
                            "function" == typeof m ? (m = m.apply(u)) : "string" == typeof m && ((m = parseFloat(m)), u.options.offset.indexOf("%") > -1 && (m = Math.ceil((r.contextDimension * m) / 100))),
                            (h = r.contextScroll - r.contextOffset),
                            (u.triggerPoint = Math.floor(g + h - m)),
                            (l = f < r.oldScroll),
                            (p = u.triggerPoint >= r.oldScroll),
                            (c = l && p),
                            (d = !l && !p),
                            !w && c
                                ? (u.queueTrigger(r.backward), (s[u.group.id] = u.group))
                                : !w && d
                                ? (u.queueTrigger(r.forward), (s[u.group.id] = u.group))
                                : w && r.oldScroll >= u.triggerPoint && (u.queueTrigger(r.forward), (s[u.group.id] = u.group));
                    }
                }
                return (
                    o.requestAnimationFrame(function () {
                        for (var t in s) s[t].flushTriggers();
                    }),
                    this
                );
            }),
            (t.findOrCreateByElement = function (e) {
                return t.findByElement(e) || new t(e);
            }),
            (t.refreshAll = function () {
                for (var t in i) i[t].refresh();
            }),
            (t.findByElement = function (t) {
                return i[t.waypointContextKey];
            }),
            (window.onload = function () {
                s && s(), t.refreshAll();
            }),
            (o.requestAnimationFrame = function (t) {
                (
                    window.requestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    function (t) {
                        window.setTimeout(t, 1e3 / 60);
                    }
                ).call(window, t);
            }),
            (o.Context = t);
    })(),
    (function () {
        "use strict";
        function t(t, e) {
            return t.triggerPoint - e.triggerPoint;
        }
        function e(t, e) {
            return e.triggerPoint - t.triggerPoint;
        }
        function i(t) {
            (this.name = t.name), (this.axis = t.axis), (this.id = this.name + "-" + this.axis), (this.waypoints = []), this.clearTriggerQueues(), (o[this.axis][this.name] = this);
        }
        var o = { vertical: {}, horizontal: {} },
            s = window.Waypoint;
        (i.prototype.add = function (t) {
            this.waypoints.push(t);
        }),
            (i.prototype.clearTriggerQueues = function () {
                this.triggerQueues = { up: [], down: [], left: [], right: [] };
            }),
            (i.prototype.flushTriggers = function () {
                for (var i in this.triggerQueues) {
                    var o = this.triggerQueues[i],
                        s = "up" === i || "left" === i;
                    o.sort(s ? e : t);
                    for (var n = 0, r = o.length; r > n; n += 1) {
                        var a = o[n];
                        (a.options.continuous || n === o.length - 1) && a.trigger([i]);
                    }
                }
                this.clearTriggerQueues();
            }),
            (i.prototype.next = function (e) {
                this.waypoints.sort(t);
                var i = s.Adapter.inArray(e, this.waypoints);
                return i === this.waypoints.length - 1 ? null : this.waypoints[i + 1];
            }),
            (i.prototype.previous = function (e) {
                this.waypoints.sort(t);
                var i = s.Adapter.inArray(e, this.waypoints);
                return i ? this.waypoints[i - 1] : null;
            }),
            (i.prototype.queueTrigger = function (t, e) {
                this.triggerQueues[e].push(t);
            }),
            (i.prototype.remove = function (t) {
                var e = s.Adapter.inArray(t, this.waypoints);
                e > -1 && this.waypoints.splice(e, 1);
            }),
            (i.prototype.first = function () {
                return this.waypoints[0];
            }),
            (i.prototype.last = function () {
                return this.waypoints[this.waypoints.length - 1];
            }),
            (i.findOrCreate = function (t) {
                return o[t.axis][t.name] || new i(t);
            }),
            (s.Group = i);
    })(),
    (function () {
        "use strict";
        function t(t) {
            this.$element = e(t);
        }
        var e = window.jQuery,
            i = window.Waypoint;
        e.each(["innerHeight", "innerWidth", "off", "offset", "on", "outerHeight", "outerWidth", "scrollLeft", "scrollTop"], function (e, i) {
            t.prototype[i] = function () {
                var t = Array.prototype.slice.call(arguments);
                return this.$element[i].apply(this.$element, t);
            };
        }),
            e.each(["extend", "inArray", "isEmptyObject"], function (i, o) {
                t[o] = e[o];
            }),
            i.adapters.push({ name: "jquery", Adapter: t }),
            (i.Adapter = t);
    })(),
    (function () {
        "use strict";
        function t(t) {
            return function () {
                var i = [],
                    o = arguments[0];
                return (
                    t.isFunction(arguments[0]) && ((o = t.extend({}, arguments[1])), (o.handler = arguments[0])),
                    this.each(function () {
                        var s = t.extend({}, o, { element: this });
                        "string" == typeof s.context && (s.context = t(this).closest(s.context)[0]), i.push(new e(s));
                    }),
                    i
                );
            };
        }
        var e = window.Waypoint;
        window.jQuery && (window.jQuery.fn.waypoint = t(window.jQuery)), window.Zepto && (window.Zepto.fn.waypoint = t(window.Zepto));
    })(),
    (function (t) {
        t.fn.hoverIntent = function (e, i, o) {
            var s = { interval: 100, sensitivity: 7, timeout: 0 };
            s = "object" == typeof e ? t.extend(s, e) : t.isFunction(i) ? t.extend(s, { over: e, out: i, selector: o }) : t.extend(s, { over: e, out: e, selector: i });
            var n,
                r,
                a,
                h,
                l = function (t) {
                    (n = t.pageX), (r = t.pageY);
                },
                p = function (e, i) {
                    if (((i.hoverIntent_t = clearTimeout(i.hoverIntent_t)), Math.abs(a - n) + Math.abs(h - r) < s.sensitivity)) return t(i).off("mousemove.hoverIntent", l), (i.hoverIntent_s = 1), s.over.apply(i, [e]);
                    (a = n),
                        (h = r),
                        (i.hoverIntent_t = setTimeout(function () {
                            p(e, i);
                        }, s.interval));
                },
                c = function (e) {
                    var i = jQuery.extend({}, e),
                        o = this;
                    o.hoverIntent_t && (o.hoverIntent_t = clearTimeout(o.hoverIntent_t)),
                        "mouseenter" == e.type
                            ? ((a = i.pageX),
                              (h = i.pageY),
                              t(o).on("mousemove.hoverIntent", l),
                              1 != o.hoverIntent_s &&
                                  (o.hoverIntent_t = setTimeout(function () {
                                      p(i, o);
                                  }, s.interval)))
                            : (t(o).off("mousemove.hoverIntent", l),
                              1 == o.hoverIntent_s &&
                                  (o.hoverIntent_t = setTimeout(function () {
                                      !(function (t, e) {
                                          (e.hoverIntent_t = clearTimeout(e.hoverIntent_t)), (e.hoverIntent_s = 0), s.out.apply(e, [t]);
                                      })(i, o);
                                  }, s.timeout)));
                };
            return this.on({ "mouseenter.hoverIntent": c, "mouseleave.hoverIntent": c }, s.selector);
        };
    })(jQuery),
    (function (t) {
        "function" == typeof define && define.amd
            ? define(["jquery"], t)
            : "object" == typeof module && module.exports
            ? (module.exports = function (e, i) {
                  return void 0 === i && (i = "undefined" != typeof window ? require("jquery") : require("jquery")(e)), t(i), i;
              })
            : t(jQuery);
    })(function (t) {
        "use strict";
        var e = 0;
        t.fn.TouchSpin = function (i) {
            var o = {
                    min: 0,
                    max: 100,
                    initval: "",
                    replacementval: "",
                    step: 1,
                    decimals: 0,
                    stepinterval: 100,
                    forcestepdivisibility: "round",
                    stepintervaldelay: 500,
                    verticalbuttons: !1,
                    verticalup: "+",
                    verticaldown: "-",
                    verticalupclass: "",
                    verticaldownclass: "",
                    prefix: "",
                    postfix: "",
                    prefix_extraclass: "",
                    postfix_extraclass: "",
                    booster: !0,
                    boostat: 10,
                    maxboostedstep: !1,
                    mousewheel: !0,
                    buttondown_class: "btn btn-primary",
                    buttonup_class: "btn btn-primary",
                    buttondown_txt: "-",
                    buttonup_txt: "+",
                    callback_before_calculation: function (t) {
                        return t;
                    },
                    callback_after_calculation: function (t) {
                        return t;
                    },
                },
                s = {
                    min: "min",
                    max: "max",
                    initval: "init-val",
                    replacementval: "replacement-val",
                    step: "step",
                    decimals: "decimals",
                    stepinterval: "step-interval",
                    verticalbuttons: "vertical-buttons",
                    verticalupclass: "vertical-up-class",
                    verticaldownclass: "vertical-down-class",
                    forcestepdivisibility: "force-step-divisibility",
                    stepintervaldelay: "step-interval-delay",
                    prefix: "prefix",
                    postfix: "postfix",
                    prefix_extraclass: "prefix-extra-class",
                    postfix_extraclass: "postfix-extra-class",
                    booster: "booster",
                    boostat: "boostat",
                    maxboostedstep: "max-boosted-step",
                    mousewheel: "mouse-wheel",
                    buttondown_class: "button-down-class",
                    buttonup_class: "button-up-class",
                    buttondown_txt: "button-down-txt",
                    buttonup_txt: "button-up-txt",
                };
            return this.each(function () {
                function n() {
                    "" === u.prefix && (m = w.prefix.detach()), "" === u.postfix && (f = w.postfix.detach());
                }
                function r() {
                    var t, e, i;
                    "" !== (t = u.callback_before_calculation(_.val()))
                        ? (0 < u.decimals && "." === t) ||
                          ((e = parseFloat(t)),
                          isNaN(e) && (e = "" !== u.replacementval ? u.replacementval : 0),
                          (i = e).toString() !== t && (i = e),
                          null !== u.min && e < u.min && (i = u.min),
                          null !== u.max && e > u.max && (i = u.max),
                          (i = (function (t) {
                              switch (u.forcestepdivisibility) {
                                  case "round":
                                      return (Math.round(t / u.step) * u.step).toFixed(u.decimals);
                                  case "floor":
                                      return (Math.floor(t / u.step) * u.step).toFixed(u.decimals);
                                  case "ceil":
                                      return (Math.ceil(t / u.step) * u.step).toFixed(u.decimals);
                                  default:
                                      return t;
                              }
                          })(i)),
                          Number(t).toString() !== i.toString() && (_.val(i), _.trigger("change")))
                        : "" !== u.replacementval && (_.val(u.replacementval), _.trigger("change"));
                }
                function a() {
                    if (u.booster) {
                        var t = Math.pow(2, Math.floor(T / u.boostat)) * u.step;
                        return u.maxboostedstep && t > u.maxboostedstep && ((t = u.maxboostedstep), (v = Math.round(v / t) * t)), Math.max(u.step, t);
                    }
                    return u.step;
                }
                function h() {
                    r(), (v = parseFloat(u.callback_before_calculation(w.input.val()))), isNaN(v) && (v = 0);
                    var t = v,
                        e = a();
                    (v += e), null !== u.max && v > u.max && ((v = u.max), _.trigger("touchspin.on.max"), d()), w.input.val(u.callback_after_calculation(Number(v).toFixed(u.decimals))), t !== v && _.trigger("change");
                }
                function l() {
                    r(), (v = parseFloat(u.callback_before_calculation(w.input.val()))), isNaN(v) && (v = 0);
                    var t = v,
                        e = a();
                    (v -= e), null !== u.min && v < u.min && ((v = u.min), _.trigger("touchspin.on.min"), d()), w.input.val(u.callback_after_calculation(Number(v).toFixed(u.decimals))), t !== v && _.trigger("change");
                }
                function p() {
                    d(),
                        (T = 0),
                        (W = "down"),
                        _.trigger("touchspin.on.startspin"),
                        _.trigger("touchspin.on.startdownspin"),
                        (x = setTimeout(function () {
                            y = setInterval(function () {
                                T++, l();
                            }, u.stepinterval);
                        }, u.stepintervaldelay));
                }
                function c() {
                    d(),
                        (T = 0),
                        (W = "up"),
                        _.trigger("touchspin.on.startspin"),
                        _.trigger("touchspin.on.startupspin"),
                        (b = setTimeout(function () {
                            z = setInterval(function () {
                                T++, h();
                            }, u.stepinterval);
                        }, u.stepintervaldelay));
                }
                function d() {
                    switch ((clearTimeout(x), clearTimeout(b), clearInterval(y), clearInterval(z), W)) {
                        case "up":
                            _.trigger("touchspin.on.stopupspin"), _.trigger("touchspin.on.stopspin");
                            break;
                        case "down":
                            _.trigger("touchspin.on.stopdownspin"), _.trigger("touchspin.on.stopspin");
                    }
                    (T = 0), (W = !1);
                }
                var u,
                    m,
                    f,
                    g,
                    w,
                    v,
                    y,
                    z,
                    x,
                    b,
                    _ = t(this),
                    C = _.data(),
                    T = 0,
                    W = !1;
                !(function () {
                    if (!_.data("alreadyinitialized")) {
                        if ((_.data("alreadyinitialized", !0), (e += 1), _.data("spinnerid", e), !_.is("input"))) return console.log("Must be an input.");
                        "" !==
                            (u = t.extend(
                                {},
                                o,
                                C,
                                ((a = {}),
                                t.each(s, function (t, e) {
                                    var i = "bts-" + e;
                                    _.is("[data-" + i + "]") && (a[t] = _.data(i));
                                }),
                                a),
                                i
                            )).initval &&
                            "" === _.val() &&
                            _.val(u.initval),
                            r(),
                            (function () {
                                var e = _.val(),
                                    i = _.parent();
                                "" !== e && (e = u.callback_after_calculation(Number(e).toFixed(u.decimals))),
                                    _.data("initvalue", e).val(e),
                                    _.addClass("form-control"),
                                    i.hasClass("input-group")
                                        ? (function (e) {
                                              e.addClass("bootstrap-touchspin");
                                              var i,
                                                  o,
                                                  s = _.prev(),
                                                  n = _.next(),
                                                  r =
                                                      '<span class="input-group-addon input-group-prepend bootstrap-touchspin-prefix input-group-prepend bootstrap-touchspin-injected"><span class="input-group-text">' +
                                                      u.prefix +
                                                      "</span></span>",
                                                  a =
                                                      '<span class="input-group-addon input-group-append bootstrap-touchspin-postfix input-group-append bootstrap-touchspin-injected"><span class="input-group-text">' +
                                                      u.postfix +
                                                      "</span></span>";
                                              s.hasClass("input-group-btn") || s.hasClass("input-group-prepend")
                                                  ? ((i = '<button class="' + u.buttondown_class + ' bootstrap-touchspin-down bootstrap-touchspin-injected" type="button">' + u.buttondown_txt + "</button>"), s.append(i))
                                                  : ((i =
                                                        '<span class="input-group-btn input-group-prepend bootstrap-touchspin-injected"><button class="' +
                                                        u.buttondown_class +
                                                        ' bootstrap-touchspin-down" type="button">' +
                                                        u.buttondown_txt +
                                                        "</button></span>"),
                                                    t(i).insertBefore(_)),
                                                  n.hasClass("input-group-btn") || n.hasClass("input-group-append")
                                                      ? ((o = '<button class="' + u.buttonup_class + ' bootstrap-touchspin-up bootstrap-touchspin-injected" type="button">' + u.buttonup_txt + "</button>"), n.prepend(o))
                                                      : ((o =
                                                            '<span class="input-group-btn input-group-append bootstrap-touchspin-injected"><button class="' +
                                                            u.buttonup_class +
                                                            ' bootstrap-touchspin-up" type="button">' +
                                                            u.buttonup_txt +
                                                            "</button></span>"),
                                                        t(o).insertAfter(_)),
                                                  t(r).insertBefore(_),
                                                  t(a).insertAfter(_),
                                                  (g = e);
                                          })(i)
                                        : (function () {
                                              var e,
                                                  i = "";
                                              _.hasClass("input-sm") && (i = "input-group-sm"),
                                                  _.hasClass("input-lg") && (i = "input-group-lg"),
                                                  (e = u.verticalbuttons
                                                      ? '<div class="input-group ' +
                                                        i +
                                                        ' bootstrap-touchspin bootstrap-touchspin-injected"><span class="input-group-addon input-group-prepend bootstrap-touchspin-prefix"><span class="input-group-text">' +
                                                        u.prefix +
                                                        '</span></span><span class="input-group-addon bootstrap-touchspin-postfix input-group-append"><span class="input-group-text">' +
                                                        u.postfix +
                                                        '</span></span><span class="input-group-btn-vertical"><button class="' +
                                                        u.buttondown_class +
                                                        " bootstrap-touchspin-up " +
                                                        u.verticalupclass +
                                                        '" type="button">' +
                                                        u.verticalup +
                                                        '</button><button class="' +
                                                        u.buttonup_class +
                                                        " bootstrap-touchspin-down " +
                                                        u.verticaldownclass +
                                                        '" type="button">' +
                                                        u.verticaldown +
                                                        "</button></span></div>"
                                                      : '<div class="input-group bootstrap-touchspin bootstrap-touchspin-injected"><span class="input-group-btn input-group-prepend"><button class="' +
                                                        u.buttondown_class +
                                                        ' bootstrap-touchspin-down" type="button">' +
                                                        u.buttondown_txt +
                                                        '</button></span><span class="input-group-addon bootstrap-touchspin-prefix input-group-prepend"><span class="input-group-text">' +
                                                        u.prefix +
                                                        '</span></span><span class="input-group-addon bootstrap-touchspin-postfix input-group-append"><span class="input-group-text">' +
                                                        u.postfix +
                                                        '</span></span><span class="input-group-btn input-group-append"><button class="' +
                                                        u.buttonup_class +
                                                        ' bootstrap-touchspin-up" type="button">' +
                                                        u.buttonup_txt +
                                                        "</button></span></div>"),
                                                  (g = t(e).insertBefore(_)),
                                                  t(".bootstrap-touchspin-prefix", g).after(_),
                                                  _.hasClass("input-sm") ? g.addClass("input-group-sm") : _.hasClass("input-lg") && g.addClass("input-group-lg");
                                          })();
                            })(),
                            (w = {
                                down: t(".bootstrap-touchspin-down", g),
                                up: t(".bootstrap-touchspin-up", g),
                                input: t("input", g),
                                prefix: t(".bootstrap-touchspin-prefix", g).addClass(u.prefix_extraclass),
                                postfix: t(".bootstrap-touchspin-postfix", g).addClass(u.postfix_extraclass),
                            }),
                            n(),
                            _.on("keydown.touchspin", function (t) {
                                var e = t.keyCode || t.which;
                                38 === e ? ("up" !== W && (h(), c()), t.preventDefault()) : 40 === e && ("down" !== W && (l(), p()), t.preventDefault());
                            }),
                            _.on("keyup.touchspin", function (t) {
                                var e = t.keyCode || t.which;
                                38 === e ? d() : 40 === e && d();
                            }),
                            _.on("blur.touchspin", function () {
                                r(), _.val(u.callback_after_calculation(_.val()));
                            }),
                            w.down.on("keydown", function (t) {
                                var e = t.keyCode || t.which;
                                (32 !== e && 13 !== e) || ("down" !== W && (l(), p()), t.preventDefault());
                            }),
                            w.down.on("keyup.touchspin", function (t) {
                                var e = t.keyCode || t.which;
                                (32 !== e && 13 !== e) || d();
                            }),
                            w.up.on("keydown.touchspin", function (t) {
                                var e = t.keyCode || t.which;
                                (32 !== e && 13 !== e) || ("up" !== W && (h(), c()), t.preventDefault());
                            }),
                            w.up.on("keyup.touchspin", function (t) {
                                var e = t.keyCode || t.which;
                                (32 !== e && 13 !== e) || d();
                            }),
                            w.down.on("mousedown.touchspin", function (t) {
                                w.down.off("touchstart.touchspin"), _.is(":disabled") || (l(), p(), t.preventDefault(), t.stopPropagation());
                            }),
                            w.down.on("touchstart.touchspin", function (t) {
                                w.down.off("mousedown.touchspin"), _.is(":disabled") || (l(), p(), t.preventDefault(), t.stopPropagation());
                            }),
                            w.up.on("mousedown.touchspin", function (t) {
                                w.up.off("touchstart.touchspin"), _.is(":disabled") || (h(), c(), t.preventDefault(), t.stopPropagation());
                            }),
                            w.up.on("touchstart.touchspin", function (t) {
                                w.up.off("mousedown.touchspin"), _.is(":disabled") || (h(), c(), t.preventDefault(), t.stopPropagation());
                            }),
                            w.up.on("mouseup.touchspin mouseout.touchspin touchleave.touchspin touchend.touchspin touchcancel.touchspin", function (t) {
                                W && (t.stopPropagation(), d());
                            }),
                            w.down.on("mouseup.touchspin mouseout.touchspin touchleave.touchspin touchend.touchspin touchcancel.touchspin", function (t) {
                                W && (t.stopPropagation(), d());
                            }),
                            w.down.on("mousemove.touchspin touchmove.touchspin", function (t) {
                                W && (t.stopPropagation(), t.preventDefault());
                            }),
                            w.up.on("mousemove.touchspin touchmove.touchspin", function (t) {
                                W && (t.stopPropagation(), t.preventDefault());
                            }),
                            _.on("mousewheel.touchspin DOMMouseScroll.touchspin", function (t) {
                                if (u.mousewheel && _.is(":focus")) {
                                    var e = t.originalEvent.wheelDelta || -t.originalEvent.deltaY || -t.originalEvent.detail;
                                    t.stopPropagation(), t.preventDefault(), e < 0 ? l() : h();
                                }
                            }),
                            _.on("touchspin.destroy", function () {
                                var e;
                                (e = _.parent()),
                                    d(),
                                    _.off(".touchspin"),
                                    e.hasClass("bootstrap-touchspin-injected") ? (_.siblings().remove(), _.unwrap()) : (t(".bootstrap-touchspin-injected", e).remove(), e.removeClass("bootstrap-touchspin")),
                                    _.data("alreadyinitialized", !1);
                            }),
                            _.on("touchspin.uponce", function () {
                                d(), h();
                            }),
                            _.on("touchspin.downonce", function () {
                                d(), l();
                            }),
                            _.on("touchspin.startupspin", function () {
                                c();
                            }),
                            _.on("touchspin.startdownspin", function () {
                                p();
                            }),
                            _.on("touchspin.stopspin", function () {
                                d();
                            }),
                            _.on("touchspin.updatesettings", function (e, i) {
                                !(function (e) {
                                    (function (e) {
                                        if (((u = t.extend({}, u, e)), e.postfix)) {
                                            0 === _.parent().find(".bootstrap-touchspin-postfix").length && f.insertAfter(_), _.parent().find(".bootstrap-touchspin-postfix .input-group-text").text(e.postfix);
                                        }
                                        if (e.prefix) {
                                            0 === _.parent().find(".bootstrap-touchspin-prefix").length && m.insertBefore(_), _.parent().find(".bootstrap-touchspin-prefix .input-group-text").text(e.prefix);
                                        }
                                        n();
                                    })(e),
                                        r();
                                    var i = w.input.val();
                                    "" !== i && ((i = Number(u.callback_before_calculation(w.input.val()))), w.input.val(u.callback_after_calculation(Number(i).toFixed(u.decimals))));
                                })(i);
                            });
                        var a;
                    }
                })();
            });
        };
    }),
    (function (t) {
        "function" == typeof define && define.amd ? define(["jquery"], t) : t("object" == typeof exports ? require("jquery") : jQuery);
    })(function (t) {
        var e = function (i, o) {
            (this.$element = t(i)), (this.options = t.extend({}, e.DEFAULTS, this.dataOptions(), o)), this.init();
        };
        (e.DEFAULTS = {
            from: 0,
            to: 0,
            speed: 1e3,
            refreshInterval: 100,
            decimals: 0,
            formatter: function (t, e) {
                return t.toFixed(e.decimals);
            },
            onUpdate: null,
            onComplete: null,
        }),
            (e.prototype.init = function () {
                (this.value = this.options.from), (this.loops = Math.ceil(this.options.speed / this.options.refreshInterval)), (this.loopCount = 0), (this.increment = (this.options.to - this.options.from) / this.loops);
            }),
            (e.prototype.dataOptions = function () {
                var t = { from: this.$element.data("from"), to: this.$element.data("to"), speed: this.$element.data("speed"), refreshInterval: this.$element.data("refresh-interval"), decimals: this.$element.data("decimals") },
                    e = Object.keys(t);
                for (var i in e) {
                    var o = e[i];
                    void 0 === t[o] && delete t[o];
                }
                return t;
            }),
            (e.prototype.update = function () {
                (this.value += this.increment),
                    this.loopCount++,
                    this.render(),
                    "function" == typeof this.options.onUpdate && this.options.onUpdate.call(this.$element, this.value),
                    this.loopCount >= this.loops && (clearInterval(this.interval), (this.value = this.options.to), "function" == typeof this.options.onComplete && this.options.onComplete.call(this.$element, this.value));
            }),
            (e.prototype.render = function () {
                var t = this.options.formatter.call(this.$element, this.value, this.options);
                this.$element.text(t);
            }),
            (e.prototype.restart = function () {
                this.stop(), this.init(), this.start();
            }),
            (e.prototype.start = function () {
                this.stop(), this.render(), (this.interval = setInterval(this.update.bind(this), this.options.refreshInterval));
            }),
            (e.prototype.stop = function () {
                this.interval && clearInterval(this.interval);
            }),
            (e.prototype.toggle = function () {
                this.interval ? this.stop() : this.start();
            }),
            (t.fn.countTo = function (i) {
                return this.each(function () {
                    var o = t(this),
                        s = o.data("countTo"),
                        n = "object" == typeof i ? i : {},
                        r = "string" == typeof i ? i : "start";
                    (!s || "object" == typeof i) && (s && s.stop(), o.data("countTo", (s = new e(this, n)))), s[r].call(s);
                });
            });
    }),
    (function (t) {
        "function" == typeof define && define.amd ? define(["jquery"], t) : t("object" == typeof exports ? require("jquery") : window.jQuery || window.Zepto);
    })(function (t) {
        var e,
            i,
            o,
            s,
            n,
            r,
            a = "Close",
            h = "BeforeClose",
            l = "MarkupParse",
            p = "Open",
            c = "Change",
            d = "mfp",
            u = "." + d,
            m = "mfp-ready",
            f = "mfp-removing",
            g = "mfp-prevent-close",
            w = function () {},
            v = !!window.jQuery,
            y = t(window),
            z = function (t, i) {
                e.ev.on(d + t + u, i);
            },
            x = function (e, i, o, s) {
                var n = document.createElement("div");
                return (n.className = "mfp-" + e), o && (n.innerHTML = o), s ? i && i.appendChild(n) : ((n = t(n)), i && n.appendTo(i)), n;
            },
            b = function (i, o) {
                e.ev.triggerHandler(d + i, o), e.st.callbacks && ((i = i.charAt(0).toLowerCase() + i.slice(1)), e.st.callbacks[i] && e.st.callbacks[i].apply(e, t.isArray(o) ? o : [o]));
            },
            _ = function (i) {
                return (i === r && e.currTemplate.closeBtn) || ((e.currTemplate.closeBtn = t(e.st.closeMarkup.replace("%title%", e.st.tClose))), (r = i)), e.currTemplate.closeBtn;
            },
            C = function () {
                t.magnificPopup.instance || ((e = new w()).init(), (t.magnificPopup.instance = e));
            };
        (w.prototype = {
            constructor: w,
            init: function () {
                var i = navigator.appVersion;
                (e.isLowIE = e.isIE8 = document.all && !document.addEventListener),
                    (e.isAndroid = /android/gi.test(i)),
                    (e.isIOS = /iphone|ipad|ipod/gi.test(i)),
                    (e.supportsTransition = (function () {
                        var t = document.createElement("p").style,
                            e = ["ms", "O", "Moz", "Webkit"];
                        if (void 0 !== t.transition) return !0;
                        for (; e.length; ) if (e.pop() + "Transition" in t) return !0;
                        return !1;
                    })()),
                    (e.probablyMobile = e.isAndroid || e.isIOS || /(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(navigator.userAgent)),
                    (o = t(document)),
                    (e.popupsCache = {});
            },
            open: function (i) {
                var s;
                if (!1 === i.isObj) {
                    (e.items = i.items.toArray()), (e.index = 0);
                    var r,
                        a = i.items;
                    for (s = 0; s < a.length; s++)
                        if (((r = a[s]).parsed && (r = r.el[0]), r === i.el[0])) {
                            e.index = s;
                            break;
                        }
                } else (e.items = t.isArray(i.items) ? i.items : [i.items]), (e.index = i.index || 0);
                {
                    if (!e.isOpen) {
                        (e.types = []),
                            (n = ""),
                            i.mainEl && i.mainEl.length ? (e.ev = i.mainEl.eq(0)) : (e.ev = o),
                            i.key ? (e.popupsCache[i.key] || (e.popupsCache[i.key] = {}), (e.currTemplate = e.popupsCache[i.key])) : (e.currTemplate = {}),
                            (e.st = t.extend(!0, {}, t.magnificPopup.defaults, i)),
                            (e.fixedContentPos = "auto" === e.st.fixedContentPos ? !e.probablyMobile : e.st.fixedContentPos),
                            e.st.modal && ((e.st.closeOnContentClick = !1), (e.st.closeOnBgClick = !1), (e.st.showCloseBtn = !1), (e.st.enableEscapeKey = !1)),
                            e.bgOverlay ||
                                ((e.bgOverlay = x("bg").on("click" + u, function () {
                                    e.close();
                                })),
                                (e.wrap = x("wrap")
                                    .attr("tabindex", -1)
                                    .on("click" + u, function (t) {
                                        e._checkIfClose(t.target) && e.close();
                                    })),
                                (e.container = x("container", e.wrap))),
                            (e.contentContainer = x("content")),
                            e.st.preloader && (e.preloader = x("preloader", e.container, e.st.tLoading));
                        var h = t.magnificPopup.modules;
                        for (s = 0; s < h.length; s++) {
                            var c = h[s];
                            (c = c.charAt(0).toUpperCase() + c.slice(1)), e["init" + c].call(e);
                        }
                        b("BeforeOpen"),
                            e.st.showCloseBtn &&
                                (e.st.closeBtnInside
                                    ? (z(l, function (t, e, i, o) {
                                          i.close_replaceWith = _(o.type);
                                      }),
                                      (n += " mfp-close-btn-in"))
                                    : e.wrap.append(_())),
                            e.st.alignTop && (n += " mfp-align-top"),
                            e.fixedContentPos ? e.wrap.css({ overflow: e.st.overflowY, overflowX: "hidden", overflowY: e.st.overflowY }) : e.wrap.css({ top: y.scrollTop(), position: "absolute" }),
                            (!1 === e.st.fixedBgPos || ("auto" === e.st.fixedBgPos && !e.fixedContentPos)) && e.bgOverlay.css({ height: o.height(), position: "absolute" }),
                            e.st.enableEscapeKey &&
                                o.on("keyup" + u, function (t) {
                                    27 === t.keyCode && e.close();
                                }),
                            y.on("resize" + u, function () {
                                e.updateSize();
                            }),
                            e.st.closeOnContentClick || (n += " mfp-auto-cursor"),
                            n && e.wrap.addClass(n);
                        var d = (e.wH = y.height()),
                            f = {};
                        if (e.fixedContentPos && e._hasScrollBar(d)) {
                            var g = e._getScrollbarSize();
                            g && (f.marginRight = g);
                        }
                        e.fixedContentPos && (e.isIE7 ? t("body, html").css("overflow", "hidden") : (f.overflow = "hidden"));
                        var w = e.st.mainClass;
                        return (
                            e.isIE7 && (w += " mfp-ie7"),
                            w && e._addClassToMFP(w),
                            e.updateItemHTML(),
                            b("BuildControls"),
                            t("html").css(f),
                            e.bgOverlay.add(e.wrap).prependTo(e.st.prependTo || t(document.body)),
                            (e._lastFocusedEl = document.activeElement),
                            setTimeout(function () {
                                e.content ? (e._addClassToMFP(m), e._setFocus()) : e.bgOverlay.addClass(m), o.on("focusin" + u, e._onFocusIn);
                            }, 16),
                            (e.isOpen = !0),
                            e.updateSize(d),
                            b(p),
                            i
                        );
                    }
                    e.updateItemHTML();
                }
            },
            close: function () {
                e.isOpen &&
                    (b(h),
                    (e.isOpen = !1),
                    e.st.removalDelay && !e.isLowIE && e.supportsTransition
                        ? (e._addClassToMFP(f),
                          setTimeout(function () {
                              e._close();
                          }, e.st.removalDelay))
                        : e._close());
            },
            _close: function () {
                b(a);
                var i = f + " " + m + " ";
                if ((e.bgOverlay.detach(), e.wrap.detach(), e.container.empty(), e.st.mainClass && (i += e.st.mainClass + " "), e._removeClassFromMFP(i), e.fixedContentPos)) {
                    var s = { marginRight: "" };
                    e.isIE7 ? t("body, html").css("overflow", "") : (s.overflow = ""), t("html").css(s);
                }
                o.off("keyup.mfp focusin" + u),
                    e.ev.off(u),
                    e.wrap.attr("class", "mfp-wrap").removeAttr("style"),
                    e.bgOverlay.attr("class", "mfp-bg"),
                    e.container.attr("class", "mfp-container"),
                    !e.st.showCloseBtn || (e.st.closeBtnInside && !0 !== e.currTemplate[e.currItem.type]) || (e.currTemplate.closeBtn && e.currTemplate.closeBtn.detach()),
                    e.st.autoFocusLast && e._lastFocusedEl && t(e._lastFocusedEl).focus(),
                    (e.currItem = null),
                    (e.content = null),
                    (e.currTemplate = null),
                    (e.prevHeight = 0),
                    b("AfterClose");
            },
            updateSize: function (t) {
                if (e.isIOS) {
                    var i = document.documentElement.clientWidth / window.innerWidth,
                        o = window.innerHeight * i;
                    e.wrap.css("height", o), (e.wH = o);
                } else e.wH = t || y.height();
                e.fixedContentPos || e.wrap.css("height", e.wH), b("Resize");
            },
            updateItemHTML: function () {
                var i = e.items[e.index];
                e.contentContainer.detach(), e.content && e.content.detach(), i.parsed || (i = e.parseEl(e.index));
                var o = i.type;
                if ((b("BeforeChange", [e.currItem ? e.currItem.type : "", o]), (e.currItem = i), !e.currTemplate[o])) {
                    var n = !!e.st[o] && e.st[o].markup;
                    b("FirstMarkupParse", n), (e.currTemplate[o] = !n || t(n));
                }
                s && s !== i.type && e.container.removeClass("mfp-" + s + "-holder");
                var r = e["get" + o.charAt(0).toUpperCase() + o.slice(1)](i, e.currTemplate[o]);
                e.appendContent(r, o), (i.preloaded = !0), b(c, i), (s = i.type), e.container.prepend(e.contentContainer), b("AfterChange");
            },
            appendContent: function (t, i) {
                (e.content = t),
                    t ? (e.st.showCloseBtn && e.st.closeBtnInside && !0 === e.currTemplate[i] ? e.content.find(".mfp-close").length || e.content.append(_()) : (e.content = t)) : (e.content = ""),
                    b("BeforeAppend"),
                    e.container.addClass("mfp-" + i + "-holder"),
                    e.contentContainer.append(e.content);
            },
            parseEl: function (i) {
                var o,
                    s = e.items[i];
                if ((s.tagName ? (s = { el: t(s) }) : ((o = s.type), (s = { data: s, src: s.src })), s.el)) {
                    for (var n = e.types, r = 0; r < n.length; r++)
                        if (s.el.hasClass("mfp-" + n[r])) {
                            o = n[r];
                            break;
                        }
                    (s.src = s.el.attr("data-mfp-src")), s.src || (s.src = s.el.attr("href"));
                }
                return (s.type = o || e.st.type || "inline"), (s.index = i), (s.parsed = !0), (e.items[i] = s), b("ElementParse", s), e.items[i];
            },
            addGroup: function (t, i) {
                var o = function (o) {
                    (o.mfpEl = this), e._openClick(o, t, i);
                };
                i || (i = {});
                var s = "click.magnificPopup";
                (i.mainEl = t), i.items ? ((i.isObj = !0), t.off(s).on(s, o)) : ((i.isObj = !1), i.delegate ? t.off(s).on(s, i.delegate, o) : ((i.items = t), t.off(s).on(s, o)));
            },
            _openClick: function (i, o, s) {
                if ((void 0 !== s.midClick ? s.midClick : t.magnificPopup.defaults.midClick) || !(2 === i.which || i.ctrlKey || i.metaKey || i.altKey || i.shiftKey)) {
                    var n = void 0 !== s.disableOn ? s.disableOn : t.magnificPopup.defaults.disableOn;
                    if (n)
                        if (t.isFunction(n)) {
                            if (!n.call(e)) return !0;
                        } else if (y.width() < n) return !0;
                    i.type && (i.preventDefault(), e.isOpen && i.stopPropagation()), (s.el = t(i.mfpEl)), s.delegate && (s.items = o.find(s.delegate)), e.open(s);
                }
            },
            updateStatus: function (t, o) {
                if (e.preloader) {
                    i !== t && e.container.removeClass("mfp-s-" + i), o || "loading" !== t || (o = e.st.tLoading);
                    var s = { status: t, text: o };
                    b("UpdateStatus", s),
                        (t = s.status),
                        (o = s.text),
                        e.preloader.html(o),
                        e.preloader.find("a").on("click", function (t) {
                            t.stopImmediatePropagation();
                        }),
                        e.container.addClass("mfp-s-" + t),
                        (i = t);
                }
            },
            _checkIfClose: function (i) {
                if (!t(i).hasClass(g)) {
                    var o = e.st.closeOnContentClick,
                        s = e.st.closeOnBgClick;
                    if (o && s) return !0;
                    if (!e.content || t(i).hasClass("mfp-close") || (e.preloader && i === e.preloader[0])) return !0;
                    if (i === e.content[0] || t.contains(e.content[0], i)) {
                        if (o) return !0;
                    } else if (s && t.contains(document, i)) return !0;
                    return !1;
                }
            },
            _addClassToMFP: function (t) {
                e.bgOverlay.addClass(t), e.wrap.addClass(t);
            },
            _removeClassFromMFP: function (t) {
                this.bgOverlay.removeClass(t), e.wrap.removeClass(t);
            },
            _hasScrollBar: function (t) {
                return (e.isIE7 ? o.height() : document.body.scrollHeight) > (t || y.height());
            },
            _setFocus: function () {
                (e.st.focus ? e.content.find(e.st.focus).eq(0) : e.wrap).focus();
            },
            _onFocusIn: function (i) {
                return i.target === e.wrap[0] || t.contains(e.wrap[0], i.target) ? void 0 : (e._setFocus(), !1);
            },
            _parseMarkup: function (e, i, o) {
                var s;
                o.data && (i = t.extend(o.data, i)),
                    b(l, [e, i, o]),
                    t.each(i, function (i, o) {
                        if (void 0 === o || !1 === o) return !0;
                        if ((s = i.split("_")).length > 1) {
                            var n = e.find(u + "-" + s[0]);
                            if (n.length > 0) {
                                var r = s[1];
                                "replaceWith" === r ? n[0] !== o[0] && n.replaceWith(o) : "img" === r ? (n.is("img") ? n.attr("src", o) : n.replaceWith(t("<img>").attr("src", o).attr("class", n.attr("class")))) : n.attr(s[1], o);
                            }
                        } else e.find(u + "-" + i).html(o);
                    });
            },
            _getScrollbarSize: function () {
                if (void 0 === e.scrollbarSize) {
                    var t = document.createElement("div");
                    (t.style.cssText = "width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;"), document.body.appendChild(t), (e.scrollbarSize = t.offsetWidth - t.clientWidth), document.body.removeChild(t);
                }
                return e.scrollbarSize;
            },
        }),
            (t.magnificPopup = {
                instance: null,
                proto: w.prototype,
                modules: [],
                open: function (e, i) {
                    return C(), (e = e ? t.extend(!0, {}, e) : {}), (e.isObj = !0), (e.index = i || 0), this.instance.open(e);
                },
                close: function () {
                    return t.magnificPopup.instance && t.magnificPopup.instance.close();
                },
                registerModule: function (e, i) {
                    i.options && (t.magnificPopup.defaults[e] = i.options), t.extend(this.proto, i.proto), this.modules.push(e);
                },
                defaults: {
                    disableOn: 0,
                    key: null,
                    midClick: !1,
                    mainClass: "",
                    preloader: !0,
                    focus: "",
                    closeOnContentClick: !1,
                    closeOnBgClick: !0,
                    closeBtnInside: !0,
                    showCloseBtn: !0,
                    enableEscapeKey: !0,
                    modal: !1,
                    alignTop: !1,
                    removalDelay: 0,
                    prependTo: null,
                    fixedContentPos: "auto",
                    fixedBgPos: "auto",
                    overflowY: "auto",
                    closeMarkup: '<button title="%title%" type="button" class="mfp-close">&#215;</button>',
                    tClose: "Close (Esc)",
                    tLoading: "Loading...",
                    autoFocusLast: !0,
                },
            }),
            (t.fn.magnificPopup = function (i) {
                C();
                var o = t(this);
                if ("string" == typeof i)
                    if ("open" === i) {
                        var s,
                            n = v ? o.data("magnificPopup") : o[0].magnificPopup,
                            r = parseInt(arguments[1], 10) || 0;
                        n.items ? (s = n.items[r]) : ((s = o), n.delegate && (s = s.find(n.delegate)), (s = s.eq(r))), e._openClick({ mfpEl: s }, o, n);
                    } else e.isOpen && e[i].apply(e, Array.prototype.slice.call(arguments, 1));
                else (i = t.extend(!0, {}, i)), v ? o.data("magnificPopup", i) : (o[0].magnificPopup = i), e.addGroup(o, i);
                return o;
            });
        var T,
            W,
            S,
            k = "inline",
            L = function () {
                S && (W.after(S.addClass(T)).detach(), (S = null));
            };
        t.magnificPopup.registerModule(k, {
            options: { hiddenClass: "hide", markup: "", tNotFound: "Content not found" },
            proto: {
                initInline: function () {
                    e.types.push(k),
                        z(a + "." + k, function () {
                            L();
                        });
                },
                getInline: function (i, o) {
                    if ((L(), i.src)) {
                        var s = e.st.inline,
                            n = t(i.src);
                        if (n.length) {
                            var r = n[0].parentNode;
                            r && r.tagName && (W || ((T = s.hiddenClass), (W = x(T)), (T = "mfp-" + T)), (S = n.after(W).detach().removeClass(T))), e.updateStatus("ready");
                        } else e.updateStatus("error", s.tNotFound), (n = t("<div>"));
                        return (i.inlineElement = n), n;
                    }
                    return e.updateStatus("ready"), e._parseMarkup(o, {}, i), o;
                },
            },
        });
        var H,
            I = "ajax",
            $ = function () {
                H && t(document.body).removeClass(H);
            },
            O = function () {
                $(), e.req && e.req.abort();
            };
        t.magnificPopup.registerModule(I, {
            options: { settings: null, cursor: "mfp-ajax-cur", tError: '<a href="%url%">The content</a> could not be loaded.' },
            proto: {
                initAjax: function () {
                    e.types.push(I), (H = e.st.ajax.cursor), z(a + "." + I, O), z("BeforeChange." + I, O);
                },
                getAjax: function (i) {
                    H && t(document.body).addClass(H), e.updateStatus("loading");
                    var o = t.extend(
                        {
                            url: i.src,
                            success: function (o, s, n) {
                                var r = { data: o, xhr: n };
                                b("ParseAjax", r),
                                    e.appendContent(t(r.data), I),
                                    (i.finished = !0),
                                    $(),
                                    e._setFocus(),
                                    setTimeout(function () {
                                        e.wrap.addClass(m);
                                    }, 16),
                                    e.updateStatus("ready"),
                                    b("AjaxContentAdded");
                            },
                            error: function () {
                                $(), (i.finished = i.loadError = !0), e.updateStatus("error", e.st.ajax.tError.replace("%url%", i.src));
                            },
                        },
                        e.st.ajax.settings
                    );
                    return (e.req = t.ajax(o)), "";
                },
            },
        });
        var P;
        t.magnificPopup.registerModule("image", {
            options: {
                markup:
                    '<div class="mfp-figure"><div class="mfp-close"></div><figure><div class="mfp-img"></div><figcaption><div class="mfp-bottom-bar"><div class="mfp-title"></div><div class="mfp-counter"></div></div></figcaption></figure></div>',
                cursor: "mfp-zoom-out-cur",
                titleSrc: "title",
                verticalFit: !0,
                tError: '<a href="%url%">The image</a> could not be loaded.',
            },
            proto: {
                initImage: function () {
                    var i = e.st.image,
                        o = ".image";
                    e.types.push("image"),
                        z(p + o, function () {
                            "image" === e.currItem.type && i.cursor && t(document.body).addClass(i.cursor);
                        }),
                        z(a + o, function () {
                            i.cursor && t(document.body).removeClass(i.cursor), y.off("resize" + u);
                        }),
                        z("Resize" + o, e.resizeImage),
                        e.isLowIE && z("AfterChange", e.resizeImage);
                },
                resizeImage: function () {
                    var t = e.currItem;
                    if (t && t.img && e.st.image.verticalFit) {
                        var i = 0;
                        e.isLowIE && (i = parseInt(t.img.css("padding-top"), 10) + parseInt(t.img.css("padding-bottom"), 10)), t.img.css("max-height", e.wH - i);
                    }
                },
                _onImageHasSize: function (t) {
                    t.img && ((t.hasSize = !0), P && clearInterval(P), (t.isCheckingImgSize = !1), b("ImageHasSize", t), t.imgHidden && (e.content && e.content.removeClass("mfp-loading"), (t.imgHidden = !1)));
                },
                findImageSize: function (t) {
                    var i = 0,
                        o = t.img[0],
                        s = function (n) {
                            P && clearInterval(P),
                                (P = setInterval(function () {
                                    return o.naturalWidth > 0 ? void e._onImageHasSize(t) : (i > 200 && clearInterval(P), void (3 === ++i ? s(10) : 40 === i ? s(50) : 100 === i && s(500)));
                                }, n));
                        };
                    s(1);
                },
                getImage: function (i, o) {
                    var s = 0,
                        n = function () {
                            i &&
                                (i.img[0].complete
                                    ? (i.img.off(".mfploader"), i === e.currItem && (e._onImageHasSize(i), e.updateStatus("ready")), (i.hasSize = !0), (i.loaded = !0), b("ImageLoadComplete"))
                                    : 200 > ++s
                                    ? setTimeout(n, 100)
                                    : r());
                        },
                        r = function () {
                            i && (i.img.off(".mfploader"), i === e.currItem && (e._onImageHasSize(i), e.updateStatus("error", a.tError.replace("%url%", i.src))), (i.hasSize = !0), (i.loaded = !0), (i.loadError = !0));
                        },
                        a = e.st.image,
                        h = o.find(".mfp-img");
                    if (h.length) {
                        var l = document.createElement("img");
                        (l.className = "mfp-img"),
                            i.el && i.el.find("img").length && (l.alt = i.el.find("img").attr("alt")),
                            (i.img = t(l).on("load.mfploader", n).on("error.mfploader", r)),
                            (l.src = i.src),
                            h.is("img") && (i.img = i.img.clone()),
                            (l = i.img[0]).naturalWidth > 0 ? (i.hasSize = !0) : l.width || (i.hasSize = !1);
                    }
                    return (
                        e._parseMarkup(
                            o,
                            {
                                title: (function (i) {
                                    if (i.data && void 0 !== i.data.title) return i.data.title;
                                    var o = e.st.image.titleSrc;
                                    if (o) {
                                        if (t.isFunction(o)) return o.call(e, i);
                                        if (i.el) return i.el.attr(o) || "";
                                    }
                                    return "";
                                })(i),
                                img_replaceWith: i.img,
                            },
                            i
                        ),
                        e.resizeImage(),
                        i.hasSize
                            ? (P && clearInterval(P), i.loadError ? (o.addClass("mfp-loading"), e.updateStatus("error", a.tError.replace("%url%", i.src))) : (o.removeClass("mfp-loading"), e.updateStatus("ready")), o)
                            : (e.updateStatus("loading"), (i.loading = !0), i.hasSize || ((i.imgHidden = !0), o.addClass("mfp-loading"), e.findImageSize(i)), o)
                    );
                },
            },
        });
        var E;
        t.magnificPopup.registerModule("zoom", {
            options: {
                enabled: !1,
                easing: "ease-in-out",
                duration: 300,
                opener: function (t) {
                    return t.is("img") ? t : t.find("img");
                },
            },
            proto: {
                initZoom: function () {
                    var t,
                        i = e.st.zoom,
                        o = ".zoom";
                    if (i.enabled && e.supportsTransition) {
                        var s,
                            n,
                            r = i.duration,
                            l = function (t) {
                                var e = t.clone().removeAttr("style").removeAttr("class").addClass("mfp-animated-image"),
                                    o = "all " + i.duration / 1e3 + "s " + i.easing,
                                    s = { position: "fixed", zIndex: 9999, left: 0, top: 0, "-webkit-backface-visibility": "hidden" },
                                    n = "transition";
                                return (s["-webkit-" + n] = s["-moz-" + n] = s["-o-" + n] = s[n] = o), e.css(s), e;
                            },
                            p = function () {
                                e.content.css("visibility", "visible");
                            };
                        z("BuildControls" + o, function () {
                            if (e._allowZoom()) {
                                if ((clearTimeout(s), e.content.css("visibility", "hidden"), !(t = e._getItemToZoom()))) return void p();
                                (n = l(t)).css(e._getOffset()),
                                    e.wrap.append(n),
                                    (s = setTimeout(function () {
                                        n.css(e._getOffset(!0)),
                                            (s = setTimeout(function () {
                                                p(),
                                                    setTimeout(function () {
                                                        n.remove(), (t = n = null), b("ZoomAnimationEnded");
                                                    }, 16);
                                            }, r));
                                    }, 16));
                            }
                        }),
                            z(h + o, function () {
                                if (e._allowZoom()) {
                                    if ((clearTimeout(s), (e.st.removalDelay = r), !t)) {
                                        if (!(t = e._getItemToZoom())) return;
                                        n = l(t);
                                    }
                                    n.css(e._getOffset(!0)),
                                        e.wrap.append(n),
                                        e.content.css("visibility", "hidden"),
                                        setTimeout(function () {
                                            n.css(e._getOffset());
                                        }, 16);
                                }
                            }),
                            z(a + o, function () {
                                e._allowZoom() && (p(), n && n.remove(), (t = null));
                            });
                    }
                },
                _allowZoom: function () {
                    return "image" === e.currItem.type;
                },
                _getItemToZoom: function () {
                    return !!e.currItem.hasSize && e.currItem.img;
                },
                _getOffset: function (i) {
                    var o,
                        s = (o = i ? e.currItem.img : e.st.zoom.opener(e.currItem.el || e.currItem)).offset(),
                        n = parseInt(o.css("padding-top"), 10),
                        r = parseInt(o.css("padding-bottom"), 10);
                    s.top -= t(window).scrollTop() - n;
                    var a = { width: o.width(), height: (v ? o.innerHeight() : o[0].offsetHeight) - r - n };
                    return void 0 === E && (E = void 0 !== document.createElement("p").style.MozTransform), E ? (a["-moz-transform"] = a.transform = "translate(" + s.left + "px," + s.top + "px)") : ((a.left = s.left), (a.top = s.top)), a;
                },
            },
        });
        var A = "iframe",
            M = function (t) {
                if (e.currTemplate[A]) {
                    var i = e.currTemplate[A].find("iframe");
                    i.length && (t || (i[0].src = "//about:blank"), e.isIE8 && i.css("display", t ? "block" : "none"));
                }
            };
        t.magnificPopup.registerModule(A, {
            options: {
                markup: '<div class="mfp-iframe-scaler"><div class="mfp-close"></div><iframe class="mfp-iframe" src="//about:blank" frameborder="0" allowfullscreen></iframe></div>',
                srcAction: "iframe_src",
                patterns: {
                    youtube: { index: "youtube.com", id: "v=", src: "//www.youtube.com/embed/%id%?autoplay=1" },
                    vimeo: { index: "vimeo.com/", id: "/", src: "//player.vimeo.com/video/%id%?autoplay=1" },
                    gmaps: { index: "//maps.google.", src: "%id%&output=embed" },
                },
            },
            proto: {
                initIframe: function () {
                    e.types.push(A),
                        z("BeforeChange", function (t, e, i) {
                            e !== i && (e === A ? M() : i === A && M(!0));
                        }),
                        z(a + "." + A, function () {
                            M();
                        });
                },
                getIframe: function (i, o) {
                    var s = i.src,
                        n = e.st.iframe;
                    t.each(n.patterns, function () {
                        return s.indexOf(this.index) > -1 ? (this.id && (s = "string" == typeof this.id ? s.substr(s.lastIndexOf(this.id) + this.id.length, s.length) : this.id.call(this, s)), (s = this.src.replace("%id%", s)), !1) : void 0;
                    });
                    var r = {};
                    return n.srcAction && (r[n.srcAction] = s), e._parseMarkup(o, r, i), e.updateStatus("ready"), o;
                },
            },
        });
        var j = function (t) {
                var i = e.items.length;
                return t > i - 1 ? t - i : 0 > t ? i + t : t;
            },
            B = function (t, e, i) {
                return t.replace(/%curr%/gi, e + 1).replace(/%total%/gi, i);
            };
        t.magnificPopup.registerModule("gallery", {
            options: {
                enabled: !1,
                arrowMarkup: '<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>',
                preload: [0, 2],
                navigateByImgClick: !0,
                arrows: !0,
                tPrev: "Previous (Left arrow key)",
                tNext: "Next (Right arrow key)",
                tCounter: "%curr% of %total%",
            },
            proto: {
                initGallery: function () {
                    var i = e.st.gallery,
                        s = ".mfp-gallery";
                    return (
                        (e.direction = !0),
                        !(!i || !i.enabled) &&
                            ((n += " mfp-gallery"),
                            z(p + s, function () {
                                i.navigateByImgClick &&
                                    e.wrap.on("click" + s, ".mfp-img", function () {
                                        return e.items.length > 1 ? (e.next(), !1) : void 0;
                                    }),
                                    o.on("keydown" + s, function (t) {
                                        37 === t.keyCode ? e.prev() : 39 === t.keyCode && e.next();
                                    });
                            }),
                            z("UpdateStatus" + s, function (t, i) {
                                i.text && (i.text = B(i.text, e.currItem.index, e.items.length));
                            }),
                            z(l + s, function (t, o, s, n) {
                                var r = e.items.length;
                                s.counter = r > 1 ? B(i.tCounter, n.index, r) : "";
                            }),
                            z("BuildControls" + s, function () {
                                if (e.items.length > 1 && i.arrows && !e.arrowLeft) {
                                    var o = i.arrowMarkup,
                                        s = (e.arrowLeft = t(o.replace(/%title%/gi, i.tPrev).replace(/%dir%/gi, "left")).addClass(g)),
                                        n = (e.arrowRight = t(o.replace(/%title%/gi, i.tNext).replace(/%dir%/gi, "right")).addClass(g));
                                    s.click(function () {
                                        e.prev();
                                    }),
                                        n.click(function () {
                                            e.next();
                                        }),
                                        e.container.append(s.add(n));
                                }
                            }),
                            z(c + s, function () {
                                e._preloadTimeout && clearTimeout(e._preloadTimeout),
                                    (e._preloadTimeout = setTimeout(function () {
                                        e.preloadNearbyImages(), (e._preloadTimeout = null);
                                    }, 16));
                            }),
                            void z(a + s, function () {
                                o.off(s), e.wrap.off("click" + s), (e.arrowRight = e.arrowLeft = null);
                            }))
                    );
                },
                next: function () {
                    (e.direction = !0), (e.index = j(e.index + 1)), e.updateItemHTML();
                },
                prev: function () {
                    (e.direction = !1), (e.index = j(e.index - 1)), e.updateItemHTML();
                },
                goTo: function (t) {
                    (e.direction = t >= e.index), (e.index = t), e.updateItemHTML();
                },
                preloadNearbyImages: function () {
                    var t,
                        i = e.st.gallery.preload,
                        o = Math.min(i[0], e.items.length),
                        s = Math.min(i[1], e.items.length);
                    for (t = 1; t <= (e.direction ? s : o); t++) e._preloadItem(e.index + t);
                    for (t = 1; t <= (e.direction ? o : s); t++) e._preloadItem(e.index - t);
                },
                _preloadItem: function (i) {
                    if (((i = j(i)), !e.items[i].preloaded)) {
                        var o = e.items[i];
                        o.parsed || (o = e.parseEl(i)),
                            b("LazyLoad", o),
                            "image" === o.type &&
                                (o.img = t('<img class="mfp-img" />')
                                    .on("load.mfploader", function () {
                                        o.hasSize = !0;
                                    })
                                    .on("error.mfploader", function () {
                                        (o.hasSize = !0), (o.loadError = !0), b("LazyLoadError", o);
                                    })
                                    .attr("src", o.src)),
                            (o.preloaded = !0);
                    }
                },
            },
        });
        var D = "retina";
        t.magnificPopup.registerModule(D, {
            options: {
                replaceSrc: function (t) {
                    return t.src.replace(/\.\w+$/, function (t) {
                        return "@2x" + t;
                    });
                },
                ratio: 1,
            },
            proto: {
                initRetina: function () {
                    if (window.devicePixelRatio > 1) {
                        var t = e.st.retina,
                            i = t.ratio;
                        (i = isNaN(i) ? i() : i) > 1 &&
                            (z("ImageHasSize." + D, function (t, e) {
                                e.img.css({ "max-width": e.img[0].naturalWidth / i, width: "100%" });
                            }),
                            z("ElementParse." + D, function (e, o) {
                                o.src = t.replaceSrc(o, i);
                            }));
                    }
                },
            },
        }),
            C();
    }),
    (function (t, e, i, o) {
        function s(e, i) {
            (this.settings = null),
                (this.options = t.extend({}, s.Defaults, i)),
                (this.$element = t(e)),
                (this._handlers = {}),
                (this._plugins = {}),
                (this._supress = {}),
                (this._current = null),
                (this._speed = null),
                (this._coordinates = []),
                (this._breakpoint = null),
                (this._width = null),
                (this._items = []),
                (this._clones = []),
                (this._mergers = []),
                (this._widths = []),
                (this._invalidated = {}),
                (this._pipe = []),
                (this._drag = { time: null, target: null, pointer: null, stage: { start: null, current: null }, direction: null }),
                (this._states = { current: {}, tags: { initializing: ["busy"], animating: ["busy"], dragging: ["interacting"] } }),
                t.each(
                    ["onResize", "onThrottledResize"],
                    t.proxy(function (e, i) {
                        this._handlers[i] = t.proxy(this[i], this);
                    }, this)
                ),
                t.each(
                    s.Plugins,
                    t.proxy(function (t, e) {
                        this._plugins[t.charAt(0).toLowerCase() + t.slice(1)] = new e(this);
                    }, this)
                ),
                t.each(
                    s.Workers,
                    t.proxy(function (e, i) {
                        this._pipe.push({ filter: i.filter, run: t.proxy(i.run, this) });
                    }, this)
                ),
                this.setup(),
                this.initialize();
        }
        (s.Defaults = {
            items: 3,
            loop: !1,
            center: !1,
            rewind: !1,
            checkVisibility: !0,
            mouseDrag: !0,
            touchDrag: !0,
            pullDrag: !0,
            freeDrag: !1,
            margin: 0,
            stagePadding: 0,
            merge: !1,
            mergeFit: !0,
            autoWidth: !1,
            startPosition: 0,
            rtl: !1,
            smartSpeed: 250,
            fluidSpeed: !1,
            dragEndSpeed: !1,
            responsive: {},
            responsiveRefreshRate: 200,
            responsiveBaseElement: e,
            fallbackEasing: "swing",
            slideTransition: "",
            info: !1,
            nestedItemSelector: !1,
            itemElement: "div",
            stageElement: "div",
            refreshClass: "owl-refresh",
            loadedClass: "owl-loaded",
            loadingClass: "owl-loading",
            rtlClass: "owl-rtl",
            responsiveClass: "owl-responsive",
            dragClass: "owl-drag",
            itemClass: "owl-item",
            stageClass: "owl-stage",
            stageOuterClass: "owl-stage-outer",
            grabClass: "owl-grab",
        }),
            (s.Width = { Default: "default", Inner: "inner", Outer: "outer" }),
            (s.Type = { Event: "event", State: "state" }),
            (s.Plugins = {}),
            (s.Workers = [
                {
                    filter: ["width", "settings"],
                    run: function () {
                        this._width = this.$element.width();
                    },
                },
                {
                    filter: ["width", "items", "settings"],
                    run: function (t) {
                        t.current = this._items && this._items[this.relative(this._current)];
                    },
                },
                {
                    filter: ["items", "settings"],
                    run: function () {
                        this.$stage.children(".cloned").remove();
                    },
                },
                {
                    filter: ["width", "items", "settings"],
                    run: function (t) {
                        var e = this.settings.margin || "",
                            i = !this.settings.autoWidth,
                            o = this.settings.rtl,
                            s = { width: "auto", "margin-left": o ? e : "", "margin-right": o ? "" : e };
                        !i && this.$stage.children().css(s), (t.css = s);
                    },
                },
                {
                    filter: ["width", "items", "settings"],
                    run: function (t) {
                        var e = (this.width() / this.settings.items).toFixed(3) - this.settings.margin,
                            i = null,
                            o = this._items.length,
                            s = !this.settings.autoWidth,
                            n = [];
                        for (t.items = { merge: !1, width: e }; o--; )
                            (i = this._mergers[o]), (i = (this.settings.mergeFit && Math.min(i, this.settings.items)) || i), (t.items.merge = i > 1 || t.items.merge), (n[o] = s ? e * i : this._items[o].width());
                        this._widths = n;
                    },
                },
                {
                    filter: ["items", "settings"],
                    run: function () {
                        var e = [],
                            i = this._items,
                            o = this.settings,
                            s = Math.max(2 * o.items, 4),
                            n = 2 * Math.ceil(i.length / 2),
                            r = o.loop && i.length ? (o.rewind ? s : Math.max(s, n)) : 0,
                            a = "",
                            h = "";
                        for (r /= 2; r > 0; )
                            e.push(this.normalize(e.length / 2, !0)), (a += i[e[e.length - 1]][0].outerHTML), e.push(this.normalize(i.length - 1 - (e.length - 1) / 2, !0)), (h = i[e[e.length - 1]][0].outerHTML + h), (r -= 1);
                        (this._clones = e), t(a).addClass("cloned").appendTo(this.$stage), t(h).addClass("cloned").prependTo(this.$stage);
                    },
                },
                {
                    filter: ["width", "items", "settings"],
                    run: function () {
                        for (var t = this.settings.rtl ? 1 : -1, e = this._clones.length + this._items.length, i = -1, o = 0, s = 0, n = []; ++i < e; )
                            (o = n[i - 1] || 0), (s = this._widths[this.relative(i)] + this.settings.margin), n.push(o + s * t);
                        this._coordinates = n;
                    },
                },
                {
                    filter: ["width", "items", "settings"],
                    run: function () {
                        var t = this.settings.stagePadding,
                            e = this._coordinates,
                            i = { width: Math.ceil(Math.abs(e[e.length - 1])) + 2 * t, "padding-left": t || "", "padding-right": t || "" };
                        this.$stage.css(i);
                    },
                },
                {
                    filter: ["width", "items", "settings"],
                    run: function (t) {
                        var e = this._coordinates.length,
                            i = !this.settings.autoWidth,
                            o = this.$stage.children();
                        if (i && t.items.merge) for (; e--; ) (t.css.width = this._widths[this.relative(e)]), o.eq(e).css(t.css);
                        else i && ((t.css.width = t.items.width), o.css(t.css));
                    },
                },
                {
                    filter: ["items"],
                    run: function () {
                        this._coordinates.length < 1 && this.$stage.removeAttr("style");
                    },
                },
                {
                    filter: ["width", "items", "settings"],
                    run: function (t) {
                        (t.current = t.current ? this.$stage.children().index(t.current) : 0), (t.current = Math.max(this.minimum(), Math.min(this.maximum(), t.current))), this.reset(t.current);
                    },
                },
                {
                    filter: ["position"],
                    run: function () {
                        this.animate(this.coordinates(this._current));
                    },
                },
                {
                    filter: ["width", "position", "items", "settings"],
                    run: function () {
                        var t,
                            e,
                            i,
                            o,
                            s = this.settings.rtl ? 1 : -1,
                            n = 2 * this.settings.stagePadding,
                            r = this.coordinates(this.current()) + n,
                            a = r + this.width() * s,
                            h = [];
                        for (i = 0, o = this._coordinates.length; i < o; i++)
                            (t = this._coordinates[i - 1] || 0), (e = Math.abs(this._coordinates[i]) + n * s), ((this.op(t, "<=", r) && this.op(t, ">", a)) || (this.op(e, "<", r) && this.op(e, ">", a))) && h.push(i);
                        this.$stage.children(".active").removeClass("active"),
                            this.$stage.children(":eq(" + h.join("), :eq(") + ")").addClass("active"),
                            this.$stage.children(".center").removeClass("center"),
                            this.settings.center && this.$stage.children().eq(this.current()).addClass("center");
                    },
                },
            ]),
            (s.prototype.initializeStage = function () {
                (this.$stage = this.$element.find("." + this.settings.stageClass)),
                    this.$stage.length ||
                        (this.$element.addClass(this.options.loadingClass),
                        (this.$stage = t("<" + this.settings.stageElement + ">", { class: this.settings.stageClass }).wrap(t("<div/>", { class: this.settings.stageOuterClass }))),
                        this.$element.append(this.$stage.parent()));
            }),
            (s.prototype.initializeItems = function () {
                var e = this.$element.find(".owl-item");
                if (e.length)
                    return (
                        (this._items = e.get().map(function (e) {
                            return t(e);
                        })),
                        (this._mergers = this._items.map(function () {
                            return 1;
                        })),
                        void this.refresh()
                    );
                this.replace(this.$element.children().not(this.$stage.parent())), this.isVisible() ? this.refresh() : this.invalidate("width"), this.$element.removeClass(this.options.loadingClass).addClass(this.options.loadedClass);
            }),
            (s.prototype.initialize = function () {
                if ((this.enter("initializing"), this.trigger("initialize"), this.$element.toggleClass(this.settings.rtlClass, this.settings.rtl), this.settings.autoWidth && !this.is("pre-loading"))) {
                    var t, e, i;
                    (t = this.$element.find("img")), (e = this.settings.nestedItemSelector ? "." + this.settings.nestedItemSelector : o), (i = this.$element.children(e).width()), t.length && i <= 0 && this.preloadAutoWidthImages(t);
                }
                this.initializeStage(), this.initializeItems(), this.registerEventHandlers(), this.leave("initializing"), this.trigger("initialized");
            }),
            (s.prototype.isVisible = function () {
                return !this.settings.checkVisibility || this.$element.is(":visible");
            }),
            (s.prototype.setup = function () {
                var e = this.viewport(),
                    i = this.options.responsive,
                    o = -1,
                    s = null;
                i
                    ? (t.each(i, function (t) {
                          t <= e && t > o && (o = Number(t));
                      }),
                      "function" == typeof (s = t.extend({}, this.options, i[o])).stagePadding && (s.stagePadding = s.stagePadding()),
                      delete s.responsive,
                      s.responsiveClass && this.$element.attr("class", this.$element.attr("class").replace(new RegExp("(" + this.options.responsiveClass + "-)\\S+\\s", "g"), "$1" + o)))
                    : (s = t.extend({}, this.options)),
                    this.trigger("change", { property: { name: "settings", value: s } }),
                    (this._breakpoint = o),
                    (this.settings = s),
                    this.invalidate("settings"),
                    this.trigger("changed", { property: { name: "settings", value: this.settings } });
            }),
            (s.prototype.optionsLogic = function () {
                this.settings.autoWidth && ((this.settings.stagePadding = !1), (this.settings.merge = !1));
            }),
            (s.prototype.prepare = function (e) {
                var i = this.trigger("prepare", { content: e });
                return (
                    i.data ||
                        (i.data = t("<" + this.settings.itemElement + "/>")
                            .addClass(this.options.itemClass)
                            .append(e)),
                    this.trigger("prepared", { content: i.data }),
                    i.data
                );
            }),
            (s.prototype.update = function () {
                for (
                    var e = 0,
                        i = this._pipe.length,
                        o = t.proxy(function (t) {
                            return this[t];
                        }, this._invalidated),
                        s = {};
                    e < i;

                )
                    (this._invalidated.all || t.grep(this._pipe[e].filter, o).length > 0) && this._pipe[e].run(s), e++;
                (this._invalidated = {}), !this.is("valid") && this.enter("valid");
            }),
            (s.prototype.width = function (t) {
                switch ((t = t || s.Width.Default)) {
                    case s.Width.Inner:
                    case s.Width.Outer:
                        return this._width;
                    default:
                        return this._width - 2 * this.settings.stagePadding + this.settings.margin;
                }
            }),
            (s.prototype.refresh = function () {
                this.enter("refreshing"),
                    this.trigger("refresh"),
                    this.setup(),
                    this.optionsLogic(),
                    this.$element.addClass(this.options.refreshClass),
                    this.update(),
                    this.$element.removeClass(this.options.refreshClass),
                    this.leave("refreshing"),
                    this.trigger("refreshed");
            }),
            (s.prototype.onThrottledResize = function () {
                e.clearTimeout(this.resizeTimer), (this.resizeTimer = e.setTimeout(this._handlers.onResize, this.settings.responsiveRefreshRate));
            }),
            (s.prototype.onResize = function () {
                return (
                    !!this._items.length &&
                    this._width !== this.$element.width() &&
                    !!this.isVisible() &&
                    (this.enter("resizing"), this.trigger("resize").isDefaultPrevented() ? (this.leave("resizing"), !1) : (this.invalidate("width"), this.refresh(), this.leave("resizing"), void this.trigger("resized")))
                );
            }),
            (s.prototype.registerEventHandlers = function () {
                t.support.transition && this.$stage.on(t.support.transition.end + ".owl.core", t.proxy(this.onTransitionEnd, this)),
                    !1 !== this.settings.responsive && this.on(e, "resize", this._handlers.onThrottledResize),
                    this.settings.mouseDrag &&
                        (this.$element.addClass(this.options.dragClass),
                        this.$stage.on("mousedown.owl.core", t.proxy(this.onDragStart, this)),
                        this.$stage.on("dragstart.owl.core selectstart.owl.core", function () {
                            return !1;
                        })),
                    this.settings.touchDrag && (this.$stage.on("touchstart.owl.core", t.proxy(this.onDragStart, this)), this.$stage.on("touchcancel.owl.core", t.proxy(this.onDragEnd, this)));
            }),
            (s.prototype.onDragStart = function (e) {
                var o = null;
                3 !== e.which &&
                    (t.support.transform
                        ? ((o = this.$stage
                              .css("transform")
                              .replace(/.*\(|\)| /g, "")
                              .split(",")),
                          (o = { x: o[16 === o.length ? 12 : 4], y: o[16 === o.length ? 13 : 5] }))
                        : ((o = this.$stage.position()), (o = { x: this.settings.rtl ? o.left + this.$stage.width() - this.width() + this.settings.margin : o.left, y: o.top })),
                    this.is("animating") && (t.support.transform ? this.animate(o.x) : this.$stage.stop(), this.invalidate("position")),
                    this.$element.toggleClass(this.options.grabClass, "mousedown" === e.type),
                    this.speed(0),
                    (this._drag.time = new Date().getTime()),
                    (this._drag.target = t(e.target)),
                    (this._drag.stage.start = o),
                    (this._drag.stage.current = o),
                    (this._drag.pointer = this.pointer(e)),
                    t(i).on("mouseup.owl.core touchend.owl.core", t.proxy(this.onDragEnd, this)),
                    t(i).one(
                        "mousemove.owl.core touchmove.owl.core",
                        t.proxy(function (e) {
                            var o = this.difference(this._drag.pointer, this.pointer(e));
                            t(i).on("mousemove.owl.core touchmove.owl.core", t.proxy(this.onDragMove, this)), (Math.abs(o.x) < Math.abs(o.y) && this.is("valid")) || (e.preventDefault(), this.enter("dragging"), this.trigger("drag"));
                        }, this)
                    ));
            }),
            (s.prototype.onDragMove = function (t) {
                var e = null,
                    i = null,
                    o = null,
                    s = this.difference(this._drag.pointer, this.pointer(t)),
                    n = this.difference(this._drag.stage.start, s);
                this.is("dragging") &&
                    (t.preventDefault(),
                    this.settings.loop
                        ? ((e = this.coordinates(this.minimum())), (i = this.coordinates(this.maximum() + 1) - e), (n.x = ((((n.x - e) % i) + i) % i) + e))
                        : ((e = this.settings.rtl ? this.coordinates(this.maximum()) : this.coordinates(this.minimum())),
                          (i = this.settings.rtl ? this.coordinates(this.minimum()) : this.coordinates(this.maximum())),
                          (o = this.settings.pullDrag ? (-1 * s.x) / 5 : 0),
                          (n.x = Math.max(Math.min(n.x, e + o), i + o))),
                    (this._drag.stage.current = n),
                    this.animate(n.x));
            }),
            (s.prototype.onDragEnd = function (e) {
                var o = this.difference(this._drag.pointer, this.pointer(e)),
                    s = this._drag.stage.current,
                    n = (o.x > 0) ^ this.settings.rtl ? "left" : "right";
                t(i).off(".owl.core"),
                    this.$element.removeClass(this.options.grabClass),
                    ((0 !== o.x && this.is("dragging")) || !this.is("valid")) &&
                        (this.speed(this.settings.dragEndSpeed || this.settings.smartSpeed),
                        this.current(this.closest(s.x, 0 !== o.x ? n : this._drag.direction)),
                        this.invalidate("position"),
                        this.update(),
                        (this._drag.direction = n),
                        (Math.abs(o.x) > 3 || new Date().getTime() - this._drag.time > 300) &&
                            this._drag.target.one("click.owl.core", function () {
                                return !1;
                            })),
                    this.is("dragging") && (this.leave("dragging"), this.trigger("dragged"));
            }),
            (s.prototype.closest = function (e, i) {
                var s = -1,
                    n = this.width(),
                    r = this.coordinates();
                return (
                    this.settings.freeDrag ||
                        t.each(
                            r,
                            t.proxy(function (t, a) {
                                return (
                                    "left" === i && e > a - 30 && e < a + 30
                                        ? (s = t)
                                        : "right" === i && e > a - n - 30 && e < a - n + 30
                                        ? (s = t + 1)
                                        : this.op(e, "<", a) && this.op(e, ">", r[t + 1] !== o ? r[t + 1] : a - n) && (s = "left" === i ? t + 1 : t),
                                    -1 === s
                                );
                            }, this)
                        ),
                    this.settings.loop || (this.op(e, ">", r[this.minimum()]) ? (s = e = this.minimum()) : this.op(e, "<", r[this.maximum()]) && (s = e = this.maximum())),
                    s
                );
            }),
            (s.prototype.animate = function (e) {
                var i = this.speed() > 0;
                this.is("animating") && this.onTransitionEnd(),
                    i && (this.enter("animating"), this.trigger("translate")),
                    t.support.transform3d && t.support.transition
                        ? this.$stage.css({ transform: "translate3d(" + e + "px,0px,0px)", transition: this.speed() / 1e3 + "s" + (this.settings.slideTransition ? " " + this.settings.slideTransition : "") })
                        : i
                        ? this.$stage.animate({ left: e + "px" }, this.speed(), this.settings.fallbackEasing, t.proxy(this.onTransitionEnd, this))
                        : this.$stage.css({ left: e + "px" });
            }),
            (s.prototype.is = function (t) {
                return this._states.current[t] && this._states.current[t] > 0;
            }),
            (s.prototype.current = function (t) {
                if (t === o) return this._current;
                if (0 === this._items.length) return o;
                if (((t = this.normalize(t)), this._current !== t)) {
                    var e = this.trigger("change", { property: { name: "position", value: t } });
                    e.data !== o && (t = this.normalize(e.data)), (this._current = t), this.invalidate("position"), this.trigger("changed", { property: { name: "position", value: this._current } });
                }
                return this._current;
            }),
            (s.prototype.invalidate = function (e) {
                return (
                    "string" === t.type(e) && ((this._invalidated[e] = !0), this.is("valid") && this.leave("valid")),
                    t.map(this._invalidated, function (t, e) {
                        return e;
                    })
                );
            }),
            (s.prototype.reset = function (t) {
                (t = this.normalize(t)) !== o && ((this._speed = 0), (this._current = t), this.suppress(["translate", "translated"]), this.animate(this.coordinates(t)), this.release(["translate", "translated"]));
            }),
            (s.prototype.normalize = function (t, e) {
                var i = this._items.length,
                    s = e ? 0 : this._clones.length;
                return !this.isNumeric(t) || i < 1 ? (t = o) : (t < 0 || t >= i + s) && (t = ((((t - s / 2) % i) + i) % i) + s / 2), t;
            }),
            (s.prototype.relative = function (t) {
                return (t -= this._clones.length / 2), this.normalize(t, !0);
            }),
            (s.prototype.maximum = function (t) {
                var e,
                    i,
                    o,
                    s = this.settings,
                    n = this._coordinates.length;
                if (s.loop) n = this._clones.length / 2 + this._items.length - 1;
                else if (s.autoWidth || s.merge) {
                    if ((e = this._items.length)) for (i = this._items[--e].width(), o = this.$element.width(); e-- && !((i += this._items[e].width() + this.settings.margin) > o); );
                    n = e + 1;
                } else n = s.center ? this._items.length - 1 : this._items.length - s.items;
                return t && (n -= this._clones.length / 2), Math.max(n, 0);
            }),
            (s.prototype.minimum = function (t) {
                return t ? 0 : this._clones.length / 2;
            }),
            (s.prototype.items = function (t) {
                return t === o ? this._items.slice() : ((t = this.normalize(t, !0)), this._items[t]);
            }),
            (s.prototype.mergers = function (t) {
                return t === o ? this._mergers.slice() : ((t = this.normalize(t, !0)), this._mergers[t]);
            }),
            (s.prototype.clones = function (e) {
                var i = this._clones.length / 2,
                    s = i + this._items.length,
                    n = function (t) {
                        return t % 2 == 0 ? s + t / 2 : i - (t + 1) / 2;
                    };
                return e === o
                    ? t.map(this._clones, function (t, e) {
                          return n(e);
                      })
                    : t.map(this._clones, function (t, i) {
                          return t === e ? n(i) : null;
                      });
            }),
            (s.prototype.speed = function (t) {
                return t !== o && (this._speed = t), this._speed;
            }),
            (s.prototype.coordinates = function (e) {
                var i,
                    s = 1,
                    n = e - 1;
                return e === o
                    ? t.map(
                          this._coordinates,
                          t.proxy(function (t, e) {
                              return this.coordinates(e);
                          }, this)
                      )
                    : (this.settings.center ? (this.settings.rtl && ((s = -1), (n = e + 1)), (i = this._coordinates[e]), (i += ((this.width() - i + (this._coordinates[n] || 0)) / 2) * s)) : (i = this._coordinates[n] || 0),
                      (i = Math.ceil(i)));
            }),
            (s.prototype.duration = function (t, e, i) {
                return 0 === i ? 0 : Math.min(Math.max(Math.abs(e - t), 1), 6) * Math.abs(i || this.settings.smartSpeed);
            }),
            (s.prototype.to = function (t, e) {
                var i = this.current(),
                    o = null,
                    s = t - this.relative(i),
                    n = (s > 0) - (s < 0),
                    r = this._items.length,
                    a = this.minimum(),
                    h = this.maximum();
                this.settings.loop
                    ? (!this.settings.rewind && Math.abs(s) > r / 2 && (s += -1 * n * r), (t = i + s), (o = ((((t - a) % r) + r) % r) + a) !== t && o - s <= h && o - s > 0 && ((i = o - s), (t = o), this.reset(i)))
                    : this.settings.rewind
                    ? ((h += 1), (t = ((t % h) + h) % h))
                    : (t = Math.max(a, Math.min(h, t))),
                    this.speed(this.duration(i, t, e)),
                    this.current(t),
                    this.isVisible() && this.update();
            }),
            (s.prototype.next = function (t) {
                (t = t || !1), this.to(this.relative(this.current()) + 1, t);
            }),
            (s.prototype.prev = function (t) {
                (t = t || !1), this.to(this.relative(this.current()) - 1, t);
            }),
            (s.prototype.onTransitionEnd = function (t) {
                if (t !== o && (t.stopPropagation(), (t.target || t.srcElement || t.originalTarget) !== this.$stage.get(0))) return !1;
                this.leave("animating"), this.trigger("translated");
            }),
            (s.prototype.viewport = function () {
                var o;
                return (
                    this.options.responsiveBaseElement !== e
                        ? (o = t(this.options.responsiveBaseElement).width())
                        : e.innerWidth
                        ? (o = e.innerWidth)
                        : i.documentElement && i.documentElement.clientWidth
                        ? (o = i.documentElement.clientWidth)
                        : console.warn("Can not detect viewport width."),
                    o
                );
            }),
            (s.prototype.replace = function (e) {
                this.$stage.empty(),
                    (this._items = []),
                    e && (e = e instanceof jQuery ? e : t(e)),
                    this.settings.nestedItemSelector && (e = e.find("." + this.settings.nestedItemSelector)),
                    e
                        .filter(function () {
                            return 1 === this.nodeType;
                        })
                        .each(
                            t.proxy(function (t, e) {
                                (e = this.prepare(e)), this.$stage.append(e), this._items.push(e), this._mergers.push(1 * e.find("[data-merge]").addBack("[data-merge]").attr("data-merge") || 1);
                            }, this)
                        ),
                    this.reset(this.isNumeric(this.settings.startPosition) ? this.settings.startPosition : 0),
                    this.invalidate("items");
            }),
            (s.prototype.add = function (e, i) {
                var s = this.relative(this._current);
                (i = i === o ? this._items.length : this.normalize(i, !0)),
                    (e = e instanceof jQuery ? e : t(e)),
                    this.trigger("add", { content: e, position: i }),
                    (e = this.prepare(e)),
                    0 === this._items.length || i === this._items.length
                        ? (0 === this._items.length && this.$stage.append(e),
                          0 !== this._items.length && this._items[i - 1].after(e),
                          this._items.push(e),
                          this._mergers.push(1 * e.find("[data-merge]").addBack("[data-merge]").attr("data-merge") || 1))
                        : (this._items[i].before(e), this._items.splice(i, 0, e), this._mergers.splice(i, 0, 1 * e.find("[data-merge]").addBack("[data-merge]").attr("data-merge") || 1)),
                    this._items[s] && this.reset(this._items[s].index()),
                    this.invalidate("items"),
                    this.trigger("added", { content: e, position: i });
            }),
            (s.prototype.remove = function (t) {
                (t = this.normalize(t, !0)) !== o &&
                    (this.trigger("remove", { content: this._items[t], position: t }),
                    this._items[t].remove(),
                    this._items.splice(t, 1),
                    this._mergers.splice(t, 1),
                    this.invalidate("items"),
                    this.trigger("removed", { content: null, position: t }));
            }),
            (s.prototype.preloadAutoWidthImages = function (e) {
                e.each(
                    t.proxy(function (e, i) {
                        this.enter("pre-loading"),
                            (i = t(i)),
                            t(new Image())
                                .one(
                                    "load",
                                    t.proxy(function (t) {
                                        i.attr("src", t.target.src), i.css("opacity", 1), this.leave("pre-loading"), !this.is("pre-loading") && !this.is("initializing") && this.refresh();
                                    }, this)
                                )
                                .attr("src", i.attr("src") || i.attr("data-src") || i.attr("data-src-retina"));
                    }, this)
                );
            }),
            (s.prototype.destroy = function () {
                this.$element.off(".owl.core"), this.$stage.off(".owl.core"), t(i).off(".owl.core"), !1 !== this.settings.responsive && (e.clearTimeout(this.resizeTimer), this.off(e, "resize", this._handlers.onThrottledResize));
                for (var o in this._plugins) this._plugins[o].destroy();
                this.$stage.children(".cloned").remove(),
                    this.$stage.unwrap(),
                    this.$stage.children().contents().unwrap(),
                    this.$stage.children().unwrap(),
                    this.$stage.remove(),
                    this.$element
                        .removeClass(this.options.refreshClass)
                        .removeClass(this.options.loadingClass)
                        .removeClass(this.options.loadedClass)
                        .removeClass(this.options.rtlClass)
                        .removeClass(this.options.dragClass)
                        .removeClass(this.options.grabClass)
                        .attr("class", this.$element.attr("class").replace(new RegExp(this.options.responsiveClass + "-\\S+\\s", "g"), ""))
                        .removeData("owl.carousel");
            }),
            (s.prototype.op = function (t, e, i) {
                var o = this.settings.rtl;
                switch (e) {
                    case "<":
                        return o ? t > i : t < i;
                    case ">":
                        return o ? t < i : t > i;
                    case ">=":
                        return o ? t <= i : t >= i;
                    case "<=":
                        return o ? t >= i : t <= i;
                }
            }),
            (s.prototype.on = function (t, e, i, o) {
                t.addEventListener ? t.addEventListener(e, i, o) : t.attachEvent && t.attachEvent("on" + e, i);
            }),
            (s.prototype.off = function (t, e, i, o) {
                t.removeEventListener ? t.removeEventListener(e, i, o) : t.detachEvent && t.detachEvent("on" + e, i);
            }),
            (s.prototype.trigger = function (e, i, o, n, r) {
                var a = { item: { count: this._items.length, index: this.current() } },
                    h = t.camelCase(
                        t
                            .grep(["on", e, o], function (t) {
                                return t;
                            })
                            .join("-")
                            .toLowerCase()
                    ),
                    l = t.Event([e, "owl", o || "carousel"].join(".").toLowerCase(), t.extend({ relatedTarget: this }, a, i));
                return (
                    this._supress[e] ||
                        (t.each(this._plugins, function (t, e) {
                            e.onTrigger && e.onTrigger(l);
                        }),
                        this.register({ type: s.Type.Event, name: e }),
                        this.$element.trigger(l),
                        this.settings && "function" == typeof this.settings[h] && this.settings[h].call(this, l)),
                    l
                );
            }),
            (s.prototype.enter = function (e) {
                t.each(
                    [e].concat(this._states.tags[e] || []),
                    t.proxy(function (t, e) {
                        this._states.current[e] === o && (this._states.current[e] = 0), this._states.current[e]++;
                    }, this)
                );
            }),
            (s.prototype.leave = function (e) {
                t.each(
                    [e].concat(this._states.tags[e] || []),
                    t.proxy(function (t, e) {
                        this._states.current[e]--;
                    }, this)
                );
            }),
            (s.prototype.register = function (e) {
                if (e.type === s.Type.Event) {
                    if ((t.event.special[e.name] || (t.event.special[e.name] = {}), !t.event.special[e.name].owl)) {
                        var i = t.event.special[e.name]._default;
                        (t.event.special[e.name]._default = function (t) {
                            return !i || !i.apply || (t.namespace && -1 !== t.namespace.indexOf("owl")) ? t.namespace && t.namespace.indexOf("owl") > -1 : i.apply(this, arguments);
                        }),
                            (t.event.special[e.name].owl = !0);
                    }
                } else
                    e.type === s.Type.State &&
                        (this._states.tags[e.name] ? (this._states.tags[e.name] = this._states.tags[e.name].concat(e.tags)) : (this._states.tags[e.name] = e.tags),
                        (this._states.tags[e.name] = t.grep(
                            this._states.tags[e.name],
                            t.proxy(function (i, o) {
                                return t.inArray(i, this._states.tags[e.name]) === o;
                            }, this)
                        )));
            }),
            (s.prototype.suppress = function (e) {
                t.each(
                    e,
                    t.proxy(function (t, e) {
                        this._supress[e] = !0;
                    }, this)
                );
            }),
            (s.prototype.release = function (e) {
                t.each(
                    e,
                    t.proxy(function (t, e) {
                        delete this._supress[e];
                    }, this)
                );
            }),
            (s.prototype.pointer = function (t) {
                var i = { x: null, y: null };
                return (
                    (t = t.originalEvent || t || e.event),
                    (t = t.touches && t.touches.length ? t.touches[0] : t.changedTouches && t.changedTouches.length ? t.changedTouches[0] : t).pageX ? ((i.x = t.pageX), (i.y = t.pageY)) : ((i.x = t.clientX), (i.y = t.clientY)),
                    i
                );
            }),
            (s.prototype.isNumeric = function (t) {
                return !isNaN(parseFloat(t));
            }),
            (s.prototype.difference = function (t, e) {
                return { x: t.x - e.x, y: t.y - e.y };
            }),
            (t.fn.owlCarousel = function (e) {
                var i = Array.prototype.slice.call(arguments, 1);
                return this.each(function () {
                    var o = t(this),
                        n = o.data("owl.carousel");
                    n ||
                        ((n = new s(this, "object" == typeof e && e)),
                        o.data("owl.carousel", n),
                        t.each(["next", "prev", "to", "destroy", "refresh", "replace", "add", "remove"], function (e, i) {
                            n.register({ type: s.Type.Event, name: i }),
                                n.$element.on(
                                    i + ".owl.carousel.core",
                                    t.proxy(function (t) {
                                        t.namespace && t.relatedTarget !== this && (this.suppress([i]), n[i].apply(this, [].slice.call(arguments, 1)), this.release([i]));
                                    }, n)
                                );
                        })),
                        "string" == typeof e && "_" !== e.charAt(0) && n[e].apply(n, i);
                });
            }),
            (t.fn.owlCarousel.Constructor = s);
    })(window.Zepto || window.jQuery, window, document),
    (function (t, e, i, o) {
        var s = function (e) {
            (this._core = e),
                (this._interval = null),
                (this._visible = null),
                (this._handlers = {
                    "initialized.owl.carousel": t.proxy(function (t) {
                        t.namespace && this._core.settings.autoRefresh && this.watch();
                    }, this),
                }),
                (this._core.options = t.extend({}, s.Defaults, this._core.options)),
                this._core.$element.on(this._handlers);
        };
        (s.Defaults = { autoRefresh: !0, autoRefreshInterval: 500 }),
            (s.prototype.watch = function () {
                this._interval || ((this._visible = this._core.isVisible()), (this._interval = e.setInterval(t.proxy(this.refresh, this), this._core.settings.autoRefreshInterval)));
            }),
            (s.prototype.refresh = function () {
                this._core.isVisible() !== this._visible && ((this._visible = !this._visible), this._core.$element.toggleClass("owl-hidden", !this._visible), this._visible && this._core.invalidate("width") && this._core.refresh());
            }),
            (s.prototype.destroy = function () {
                var t, i;
                e.clearInterval(this._interval);
                for (t in this._handlers) this._core.$element.off(t, this._handlers[t]);
                for (i in Object.getOwnPropertyNames(this)) "function" != typeof this[i] && (this[i] = null);
            }),
            (t.fn.owlCarousel.Constructor.Plugins.AutoRefresh = s);
    })(window.Zepto || window.jQuery, window, document),
    (function (t, e, i, o) {
        var s = function (e) {
            (this._core = e),
                (this._loaded = []),
                (this._handlers = {
                    "initialized.owl.carousel change.owl.carousel resized.owl.carousel": t.proxy(function (e) {
                        if (e.namespace && this._core.settings && this._core.settings.lazyLoad && ((e.property && "position" == e.property.name) || "initialized" == e.type)) {
                            var i = this._core.settings,
                                o = (i.center && Math.ceil(i.items / 2)) || i.items,
                                s = (i.center && -1 * o) || 0,
                                n = (e.property && void 0 !== e.property.value ? e.property.value : this._core.current()) + s,
                                r = this._core.clones().length,
                                a = t.proxy(function (t, e) {
                                    this.load(e);
                                }, this);
                            for (i.lazyLoadEager > 0 && ((o += i.lazyLoadEager), i.loop && ((n -= i.lazyLoadEager), o++)); s++ < o; ) this.load(r / 2 + this._core.relative(n)), r && t.each(this._core.clones(this._core.relative(n)), a), n++;
                        }
                    }, this),
                }),
                (this._core.options = t.extend({}, s.Defaults, this._core.options)),
                this._core.$element.on(this._handlers);
        };
        (s.Defaults = { lazyLoad: !1, lazyLoadEager: 0 }),
            (s.prototype.load = function (i) {
                var o = this._core.$stage.children().eq(i),
                    s = o && o.find(".owl-lazy");
                !s ||
                    t.inArray(o.get(0), this._loaded) > -1 ||
                    (s.each(
                        t.proxy(function (i, o) {
                            var s,
                                n = t(o),
                                r = (e.devicePixelRatio > 1 && n.attr("data-src-retina")) || n.attr("data-src") || n.attr("data-srcset");
                            this._core.trigger("load", { element: n, url: r }, "lazy"),
                                n.is("img")
                                    ? n
                                          .one(
                                              "load.owl.lazy",
                                              t.proxy(function () {
                                                  n.css("opacity", 1), this._core.trigger("loaded", { element: n, url: r }, "lazy");
                                              }, this)
                                          )
                                          .attr("src", r)
                                    : n.is("source")
                                    ? n
                                          .one(
                                              "load.owl.lazy",
                                              t.proxy(function () {
                                                  this._core.trigger("loaded", { element: n, url: r }, "lazy");
                                              }, this)
                                          )
                                          .attr("srcset", r)
                                    : ((s = new Image()),
                                      (s.onload = t.proxy(function () {
                                          n.css({ "background-image": 'url("' + r + '")', opacity: "1" }), this._core.trigger("loaded", { element: n, url: r }, "lazy");
                                      }, this)),
                                      (s.src = r));
                        }, this)
                    ),
                    this._loaded.push(o.get(0)));
            }),
            (s.prototype.destroy = function () {
                var t, e;
                for (t in this.handlers) this._core.$element.off(t, this.handlers[t]);
                for (e in Object.getOwnPropertyNames(this)) "function" != typeof this[e] && (this[e] = null);
            }),
            (t.fn.owlCarousel.Constructor.Plugins.Lazy = s);
    })(window.Zepto || window.jQuery, window, document),
    (function (t, e, i, o) {
        var s = function (i) {
            (this._core = i),
                (this._previousHeight = null),
                (this._handlers = {
                    "initialized.owl.carousel refreshed.owl.carousel": t.proxy(function (t) {
                        t.namespace && this._core.settings.autoHeight && this.update();
                    }, this),
                    "changed.owl.carousel": t.proxy(function (t) {
                        t.namespace && this._core.settings.autoHeight && "position" === t.property.name && this.update();
                    }, this),
                    "loaded.owl.lazy": t.proxy(function (t) {
                        t.namespace && this._core.settings.autoHeight && t.element.closest("." + this._core.settings.itemClass).index() === this._core.current() && this.update();
                    }, this),
                }),
                (this._core.options = t.extend({}, s.Defaults, this._core.options)),
                this._core.$element.on(this._handlers),
                (this._intervalId = null);
            var o = this;
            t(e).on("load", function () {
                o._core.settings.autoHeight && o.update();
            }),
                t(e).resize(function () {
                    o._core.settings.autoHeight &&
                        (null != o._intervalId && clearTimeout(o._intervalId),
                        (o._intervalId = setTimeout(function () {
                            o.update();
                        }, 250)));
                });
        };
        (s.Defaults = { autoHeight: !1, autoHeightClass: "owl-height" }),
            (s.prototype.update = function () {
                var e = this._core._current,
                    i = e + this._core.settings.items,
                    o = this._core.settings.lazyLoad,
                    s = this._core.$stage.children().toArray().slice(e, i),
                    n = [],
                    r = 0;
                t.each(s, function (e, i) {
                    n.push(t(i).height());
                }),
                    (r = Math.max.apply(null, n)) <= 1 && o && this._previousHeight && (r = this._previousHeight),
                    (this._previousHeight = r),
                    this._core.$stage.parent().height(r).addClass(this._core.settings.autoHeightClass);
            }),
            (s.prototype.destroy = function () {
                var t, e;
                for (t in this._handlers) this._core.$element.off(t, this._handlers[t]);
                for (e in Object.getOwnPropertyNames(this)) "function" != typeof this[e] && (this[e] = null);
            }),
            (t.fn.owlCarousel.Constructor.Plugins.AutoHeight = s);
    })(window.Zepto || window.jQuery, window, document),
    (function (t, e, i, o) {
        var s = function (e) {
            (this._core = e),
                (this._videos = {}),
                (this._playing = null),
                (this._handlers = {
                    "initialized.owl.carousel": t.proxy(function (t) {
                        t.namespace && this._core.register({ type: "state", name: "playing", tags: ["interacting"] });
                    }, this),
                    "resize.owl.carousel": t.proxy(function (t) {
                        t.namespace && this._core.settings.video && this.isInFullScreen() && t.preventDefault();
                    }, this),
                    "refreshed.owl.carousel": t.proxy(function (t) {
                        t.namespace && this._core.is("resizing") && this._core.$stage.find(".cloned .owl-video-frame").remove();
                    }, this),
                    "changed.owl.carousel": t.proxy(function (t) {
                        t.namespace && "position" === t.property.name && this._playing && this.stop();
                    }, this),
                    "prepared.owl.carousel": t.proxy(function (e) {
                        if (e.namespace) {
                            var i = t(e.content).find(".owl-video");
                            i.length && (i.css("display", "none"), this.fetch(i, t(e.content)));
                        }
                    }, this),
                }),
                (this._core.options = t.extend({}, s.Defaults, this._core.options)),
                this._core.$element.on(this._handlers),
                this._core.$element.on(
                    "click.owl.video",
                    ".owl-video-play-icon",
                    t.proxy(function (t) {
                        this.play(t);
                    }, this)
                );
        };
        (s.Defaults = { video: !1, videoHeight: !1, videoWidth: !1 }),
            (s.prototype.fetch = function (t, e) {
                var i = t.attr("data-vimeo-id") ? "vimeo" : t.attr("data-vzaar-id") ? "vzaar" : "youtube",
                    o = t.attr("data-vimeo-id") || t.attr("data-youtube-id") || t.attr("data-vzaar-id"),
                    s = t.attr("data-width") || this._core.settings.videoWidth,
                    n = t.attr("data-height") || this._core.settings.videoHeight,
                    r = t.attr("href");
                if (!r) throw new Error("Missing video URL.");
                if (
                    (o = r.match(
                        /(http:|https:|)\/\/(player.|www.|app.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com|be\-nocookie\.com)|vzaar\.com)\/(video\/|videos\/|embed\/|channels\/.+\/|groups\/.+\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/
                    ))[3].indexOf("youtu") > -1
                )
                    i = "youtube";
                else if (o[3].indexOf("vimeo") > -1) i = "vimeo";
                else {
                    if (!(o[3].indexOf("vzaar") > -1)) throw new Error("Video URL not supported.");
                    i = "vzaar";
                }
                (o = o[6]), (this._videos[r] = { type: i, id: o, width: s, height: n }), e.attr("data-video", r), this.thumbnail(t, this._videos[r]);
            }),
            (s.prototype.thumbnail = function (e, i) {
                var o,
                    s,
                    n,
                    r = i.width && i.height ? "width:" + i.width + "px;height:" + i.height + "px;" : "",
                    a = e.find("img"),
                    h = "src",
                    l = "",
                    p = this._core.settings,
                    c = function (i) {
                        (s = '<div class="owl-video-play-icon"></div>'),
                            (o = p.lazyLoad ? t("<div/>", { class: "owl-video-tn " + l, srcType: i }) : t("<div/>", { class: "owl-video-tn", style: "opacity:1;background-image:url(" + i + ")" })),
                            e.after(o),
                            e.after(s);
                    };
                if ((e.wrap(t("<div/>", { class: "owl-video-wrapper", style: r })), this._core.settings.lazyLoad && ((h = "data-src"), (l = "owl-lazy")), a.length)) return c(a.attr(h)), a.remove(), !1;
                "youtube" === i.type
                    ? ((n = "//img.youtube.com/vi/" + i.id + "/hqdefault.jpg"), c(n))
                    : "vimeo" === i.type
                    ? t.ajax({
                          type: "GET",
                          url: "//vimeo.com/api/v2/video/" + i.id + ".json",
                          jsonp: "callback",
                          dataType: "jsonp",
                          success: function (t) {
                              (n = t[0].thumbnail_large), c(n);
                          },
                      })
                    : "vzaar" === i.type &&
                      t.ajax({
                          type: "GET",
                          url: "//vzaar.com/api/videos/" + i.id + ".json",
                          jsonp: "callback",
                          dataType: "jsonp",
                          success: function (t) {
                              (n = t.framegrab_url), c(n);
                          },
                      });
            }),
            (s.prototype.stop = function () {
                this._core.trigger("stop", null, "video"),
                    this._playing.find(".owl-video-frame").remove(),
                    this._playing.removeClass("owl-video-playing"),
                    (this._playing = null),
                    this._core.leave("playing"),
                    this._core.trigger("stopped", null, "video");
            }),
            (s.prototype.play = function (e) {
                var i,
                    o = t(e.target).closest("." + this._core.settings.itemClass),
                    s = this._videos[o.attr("data-video")],
                    n = s.width || "100%",
                    r = s.height || this._core.$stage.height();
                this._playing ||
                    (this._core.enter("playing"),
                    this._core.trigger("play", null, "video"),
                    (o = this._core.items(this._core.relative(o.index()))),
                    this._core.reset(o.index()),
                    (i = t('<iframe frameborder="0" allowfullscreen mozallowfullscreen webkitAllowFullScreen ></iframe>')).attr("height", r),
                    i.attr("width", n),
                    "youtube" === s.type
                        ? i.attr("src", "//www.youtube.com/embed/" + s.id + "?autoplay=1&rel=0&v=" + s.id)
                        : "vimeo" === s.type
                        ? i.attr("src", "//player.vimeo.com/video/" + s.id + "?autoplay=1")
                        : "vzaar" === s.type && i.attr("src", "//view.vzaar.com/" + s.id + "/player?autoplay=true"),
                    t(i).wrap('<div class="owl-video-frame" />').insertAfter(o.find(".owl-video")),
                    (this._playing = o.addClass("owl-video-playing")));
            }),
            (s.prototype.isInFullScreen = function () {
                var e = i.fullscreenElement || i.mozFullScreenElement || i.webkitFullscreenElement;
                return e && t(e).parent().hasClass("owl-video-frame");
            }),
            (s.prototype.destroy = function () {
                var t, e;
                this._core.$element.off("click.owl.video");
                for (t in this._handlers) this._core.$element.off(t, this._handlers[t]);
                for (e in Object.getOwnPropertyNames(this)) "function" != typeof this[e] && (this[e] = null);
            }),
            (t.fn.owlCarousel.Constructor.Plugins.Video = s);
    })(window.Zepto || window.jQuery, window, document),
    (function (t, e, i, o) {
        var s = function (e) {
            (this.core = e),
                (this.core.options = t.extend({}, s.Defaults, this.core.options)),
                (this.swapping = !0),
                (this.previous = o),
                (this.next = o),
                (this.handlers = {
                    "change.owl.carousel": t.proxy(function (t) {
                        t.namespace && "position" == t.property.name && ((this.previous = this.core.current()), (this.next = t.property.value));
                    }, this),
                    "drag.owl.carousel dragged.owl.carousel translated.owl.carousel": t.proxy(function (t) {
                        t.namespace && (this.swapping = "translated" == t.type);
                    }, this),
                    "translate.owl.carousel": t.proxy(function (t) {
                        t.namespace && this.swapping && (this.core.options.animateOut || this.core.options.animateIn) && this.swap();
                    }, this),
                }),
                this.core.$element.on(this.handlers);
        };
        (s.Defaults = { animateOut: !1, animateIn: !1 }),
            (s.prototype.swap = function () {
                if (1 === this.core.settings.items && t.support.animation && t.support.transition) {
                    this.core.speed(0);
                    var e,
                        i = t.proxy(this.clear, this),
                        o = this.core.$stage.children().eq(this.previous),
                        s = this.core.$stage.children().eq(this.next),
                        n = this.core.settings.animateIn,
                        r = this.core.settings.animateOut;
                    this.core.current() !== this.previous &&
                        (r &&
                            ((e = this.core.coordinates(this.previous) - this.core.coordinates(this.next)),
                            o
                                .one(t.support.animation.end, i)
                                .css({ left: e + "px" })
                                .addClass("animated owl-animated-out")
                                .addClass(r)),
                        n && s.one(t.support.animation.end, i).addClass("animated owl-animated-in").addClass(n));
                }
            }),
            (s.prototype.clear = function (e) {
                t(e.target).css({ left: "" }).removeClass("animated owl-animated-out owl-animated-in").removeClass(this.core.settings.animateIn).removeClass(this.core.settings.animateOut), this.core.onTransitionEnd();
            }),
            (s.prototype.destroy = function () {
                var t, e;
                for (t in this.handlers) this.core.$element.off(t, this.handlers[t]);
                for (e in Object.getOwnPropertyNames(this)) "function" != typeof this[e] && (this[e] = null);
            }),
            (t.fn.owlCarousel.Constructor.Plugins.Animate = s);
    })(window.Zepto || window.jQuery, window, document),
    (function (t, e, i, o) {
        var s = function (e) {
            (this._core = e),
                (this._call = null),
                (this._time = 0),
                (this._timeout = 0),
                (this._paused = !0),
                (this._handlers = {
                    "changed.owl.carousel": t.proxy(function (t) {
                        t.namespace && "settings" === t.property.name ? (this._core.settings.autoplay ? this.play() : this.stop()) : t.namespace && "position" === t.property.name && this._paused && (this._time = 0);
                    }, this),
                    "initialized.owl.carousel": t.proxy(function (t) {
                        t.namespace && this._core.settings.autoplay && this.play();
                    }, this),
                    "play.owl.autoplay": t.proxy(function (t, e, i) {
                        t.namespace && this.play(e, i);
                    }, this),
                    "stop.owl.autoplay": t.proxy(function (t) {
                        t.namespace && this.stop();
                    }, this),
                    "mouseover.owl.autoplay": t.proxy(function () {
                        this._core.settings.autoplayHoverPause && this._core.is("rotating") && this.pause();
                    }, this),
                    "mouseleave.owl.autoplay": t.proxy(function () {
                        this._core.settings.autoplayHoverPause && this._core.is("rotating") && this.play();
                    }, this),
                    "touchstart.owl.core": t.proxy(function () {
                        this._core.settings.autoplayHoverPause && this._core.is("rotating") && this.pause();
                    }, this),
                    "touchend.owl.core": t.proxy(function () {
                        this._core.settings.autoplayHoverPause && this.play();
                    }, this),
                }),
                this._core.$element.on(this._handlers),
                (this._core.options = t.extend({}, s.Defaults, this._core.options));
        };
        (s.Defaults = { autoplay: !1, autoplayTimeout: 5e3, autoplayHoverPause: !1, autoplaySpeed: !1 }),
            (s.prototype._next = function (o) {
                (this._call = e.setTimeout(t.proxy(this._next, this, o), this._timeout * (Math.round(this.read() / this._timeout) + 1) - this.read())),
                    this._core.is("interacting") || i.hidden || this._core.next(o || this._core.settings.autoplaySpeed);
            }),
            (s.prototype.read = function () {
                return new Date().getTime() - this._time;
            }),
            (s.prototype.play = function (i, o) {
                var s;
                this._core.is("rotating") || this._core.enter("rotating"),
                    (i = i || this._core.settings.autoplayTimeout),
                    (s = Math.min(this._time % (this._timeout || i), i)),
                    this._paused ? ((this._time = this.read()), (this._paused = !1)) : e.clearTimeout(this._call),
                    (this._time += (this.read() % i) - s),
                    (this._timeout = i),
                    (this._call = e.setTimeout(t.proxy(this._next, this, o), i - s));
            }),
            (s.prototype.stop = function () {
                this._core.is("rotating") && ((this._time = 0), (this._paused = !0), e.clearTimeout(this._call), this._core.leave("rotating"));
            }),
            (s.prototype.pause = function () {
                this._core.is("rotating") && !this._paused && ((this._time = this.read()), (this._paused = !0), e.clearTimeout(this._call));
            }),
            (s.prototype.destroy = function () {
                var t, e;
                this.stop();
                for (t in this._handlers) this._core.$element.off(t, this._handlers[t]);
                for (e in Object.getOwnPropertyNames(this)) "function" != typeof this[e] && (this[e] = null);
            }),
            (t.fn.owlCarousel.Constructor.Plugins.autoplay = s);
    })(window.Zepto || window.jQuery, window, document),
    (function (t, e, i, o) {
        "use strict";
        var s = function (e) {
            (this._core = e),
                (this._initialized = !1),
                (this._pages = []),
                (this._controls = {}),
                (this._templates = []),
                (this.$element = this._core.$element),
                (this._overrides = { next: this._core.next, prev: this._core.prev, to: this._core.to }),
                (this._handlers = {
                    "prepared.owl.carousel": t.proxy(function (e) {
                        e.namespace && this._core.settings.dotsData && this._templates.push('<div class="' + this._core.settings.dotClass + '">' + t(e.content).find("[data-dot]").addBack("[data-dot]").attr("data-dot") + "</div>");
                    }, this),
                    "added.owl.carousel": t.proxy(function (t) {
                        t.namespace && this._core.settings.dotsData && this._templates.splice(t.position, 0, this._templates.pop());
                    }, this),
                    "remove.owl.carousel": t.proxy(function (t) {
                        t.namespace && this._core.settings.dotsData && this._templates.splice(t.position, 1);
                    }, this),
                    "changed.owl.carousel": t.proxy(function (t) {
                        t.namespace && "position" == t.property.name && this.draw();
                    }, this),
                    "initialized.owl.carousel": t.proxy(function (t) {
                        t.namespace &&
                            !this._initialized &&
                            (this._core.trigger("initialize", null, "navigation"), this.initialize(), this.update(), this.draw(), (this._initialized = !0), this._core.trigger("initialized", null, "navigation"));
                    }, this),
                    "refreshed.owl.carousel": t.proxy(function (t) {
                        t.namespace && this._initialized && (this._core.trigger("refresh", null, "navigation"), this.update(), this.draw(), this._core.trigger("refreshed", null, "navigation"));
                    }, this),
                }),
                (this._core.options = t.extend({}, s.Defaults, this._core.options)),
                this.$element.on(this._handlers);
        };
        (s.Defaults = {
            nav: !1,
            navText: ['<span aria-label="Previous">&#x2039;</span>', '<span aria-label="Next">&#x203a;</span>'],
            navSpeed: !1,
            navElement: 'button type="button" role="presentation"',
            navContainer: !1,
            navContainerClass: "owl-nav",
            navClass: ["owl-prev", "owl-next"],
            slideBy: 1,
            dotClass: "owl-dot",
            dotsClass: "owl-dots",
            dots: !0,
            dotsEach: !1,
            dotsData: !1,
            dotsSpeed: !1,
            dotsContainer: !1,
        }),
            (s.prototype.initialize = function () {
                var e,
                    i = this._core.settings;
                (this._controls.$relative = (i.navContainer ? t(i.navContainer) : t("<div>").addClass(i.navContainerClass).appendTo(this.$element)).addClass("disabled")),
                    (this._controls.$previous = t("<" + i.navElement + ">")
                        .addClass(i.navClass[0])
                        .html(i.navText[0])
                        .prependTo(this._controls.$relative)
                        .on(
                            "click",
                            t.proxy(function (t) {
                                this.prev(i.navSpeed);
                            }, this)
                        )),
                    (this._controls.$next = t("<" + i.navElement + ">")
                        .addClass(i.navClass[1])
                        .html(i.navText[1])
                        .appendTo(this._controls.$relative)
                        .on(
                            "click",
                            t.proxy(function (t) {
                                this.next(i.navSpeed);
                            }, this)
                        )),
                    i.dotsData || (this._templates = [t('<button role="button">').addClass(i.dotClass).append(t("<span>")).prop("outerHTML")]),
                    (this._controls.$absolute = (i.dotsContainer ? t(i.dotsContainer) : t("<div>").addClass(i.dotsClass).appendTo(this.$element)).addClass("disabled")),
                    this._controls.$absolute.on(
                        "click",
                        "button",
                        t.proxy(function (e) {
                            var o = t(e.target).parent().is(this._controls.$absolute) ? t(e.target).index() : t(e.target).parent().index();
                            e.preventDefault(), this.to(o, i.dotsSpeed);
                        }, this)
                    );
                for (e in this._overrides) this._core[e] = t.proxy(this[e], this);
            }),
            (s.prototype.destroy = function () {
                var t, e, i, o, s;
                s = this._core.settings;
                for (t in this._handlers) this.$element.off(t, this._handlers[t]);
                for (e in this._controls) "$relative" === e && s.navContainer ? this._controls[e].html("") : this._controls[e].remove();
                for (o in this.overides) this._core[o] = this._overrides[o];
                for (i in Object.getOwnPropertyNames(this)) "function" != typeof this[i] && (this[i] = null);
            }),
            (s.prototype.update = function () {
                var t,
                    e,
                    i = this._core.clones().length / 2,
                    o = i + this._core.items().length,
                    s = this._core.maximum(!0),
                    n = this._core.settings,
                    r = n.center || n.autoWidth || n.dotsData ? 1 : n.dotsEach || n.items;
                if (("page" !== n.slideBy && (n.slideBy = Math.min(n.slideBy, n.items)), n.dots || "page" == n.slideBy))
                    for (this._pages = [], t = i, e = 0, 0; t < o; t++) {
                        if (e >= r || 0 === e) {
                            if ((this._pages.push({ start: Math.min(s, t - i), end: t - i + r - 1 }), Math.min(s, t - i) === s)) break;
                            (e = 0), 0;
                        }
                        e += this._core.mergers(this._core.relative(t));
                    }
            }),
            (s.prototype.draw = function () {
                var e,
                    i = this._core.settings,
                    o = this._core.items().length <= i.items,
                    s = this._core.relative(this._core.current()),
                    n = i.loop || i.rewind;
                this._controls.$relative.toggleClass("disabled", !i.nav || o),
                    i.nav && (this._controls.$previous.toggleClass("disabled", !n && s <= this._core.minimum(!0)), this._controls.$next.toggleClass("disabled", !n && s >= this._core.maximum(!0))),
                    this._controls.$absolute.toggleClass("disabled", !i.dots || o),
                    i.dots &&
                        ((e = this._pages.length - this._controls.$absolute.children().length),
                        i.dotsData && 0 !== e
                            ? this._controls.$absolute.html(this._templates.join(""))
                            : e > 0
                            ? this._controls.$absolute.append(new Array(e + 1).join(this._templates[0]))
                            : e < 0 && this._controls.$absolute.children().slice(e).remove(),
                        this._controls.$absolute.find(".active").removeClass("active"),
                        this._controls.$absolute.children().eq(t.inArray(this.current(), this._pages)).addClass("active"));
            }),
            (s.prototype.onTrigger = function (e) {
                var i = this._core.settings;
                e.page = { index: t.inArray(this.current(), this._pages), count: this._pages.length, size: i && (i.center || i.autoWidth || i.dotsData ? 1 : i.dotsEach || i.items) };
            }),
            (s.prototype.current = function () {
                var e = this._core.relative(this._core.current());
                return t
                    .grep(
                        this._pages,
                        t.proxy(function (t, i) {
                            return t.start <= e && t.end >= e;
                        }, this)
                    )
                    .pop();
            }),
            (s.prototype.getPosition = function (e) {
                var i,
                    o,
                    s = this._core.settings;
                return (
                    "page" == s.slideBy
                        ? ((i = t.inArray(this.current(), this._pages)), (o = this._pages.length), e ? ++i : --i, (i = this._pages[((i % o) + o) % o].start))
                        : ((i = this._core.relative(this._core.current())), (o = this._core.items().length), e ? (i += s.slideBy) : (i -= s.slideBy)),
                    i
                );
            }),
            (s.prototype.next = function (e) {
                t.proxy(this._overrides.to, this._core)(this.getPosition(!0), e);
            }),
            (s.prototype.prev = function (e) {
                t.proxy(this._overrides.to, this._core)(this.getPosition(!1), e);
            }),
            (s.prototype.to = function (e, i, o) {
                var s;
                !o && this._pages.length ? ((s = this._pages.length), t.proxy(this._overrides.to, this._core)(this._pages[((e % s) + s) % s].start, i)) : t.proxy(this._overrides.to, this._core)(e, i);
            }),
            (t.fn.owlCarousel.Constructor.Plugins.Navigation = s);
    })(window.Zepto || window.jQuery, window, document),
    (function (t, e, i, o) {
        "use strict";
        var s = function (i) {
            (this._core = i),
                (this._hashes = {}),
                (this.$element = this._core.$element),
                (this._handlers = {
                    "initialized.owl.carousel": t.proxy(function (i) {
                        i.namespace && "URLHash" === this._core.settings.startPosition && t(e).trigger("hashchange.owl.navigation");
                    }, this),
                    "prepared.owl.carousel": t.proxy(function (e) {
                        if (e.namespace) {
                            var i = t(e.content).find("[data-hash]").addBack("[data-hash]").attr("data-hash");
                            if (!i) return;
                            this._hashes[i] = e.content;
                        }
                    }, this),
                    "changed.owl.carousel": t.proxy(function (i) {
                        if (i.namespace && "position" === i.property.name) {
                            var o = this._core.items(this._core.relative(this._core.current())),
                                s = t
                                    .map(this._hashes, function (t, e) {
                                        return t === o ? e : null;
                                    })
                                    .join();
                            if (!s || e.location.hash.slice(1) === s) return;
                            e.location.hash = s;
                        }
                    }, this),
                }),
                (this._core.options = t.extend({}, s.Defaults, this._core.options)),
                this.$element.on(this._handlers),
                t(e).on(
                    "hashchange.owl.navigation",
                    t.proxy(function (t) {
                        var i = e.location.hash.substring(1),
                            o = this._core.$stage.children(),
                            s = this._hashes[i] && o.index(this._hashes[i]);
                        void 0 !== s && s !== this._core.current() && this._core.to(this._core.relative(s), !1, !0);
                    }, this)
                );
        };
        (s.Defaults = { URLhashListener: !1 }),
            (s.prototype.destroy = function () {
                var i, o;
                t(e).off("hashchange.owl.navigation");
                for (i in this._handlers) this._core.$element.off(i, this._handlers[i]);
                for (o in Object.getOwnPropertyNames(this)) "function" != typeof this[o] && (this[o] = null);
            }),
            (t.fn.owlCarousel.Constructor.Plugins.Hash = s);
    })(window.Zepto || window.jQuery, window, document),
    (function (t, e, i, o) {
        function s(e, i) {
            var s = !1,
                n = e.charAt(0).toUpperCase() + e.slice(1);
            return (
                t.each((e + " " + a.join(n + " ") + n).split(" "), function (t, e) {
                    if (r[e] !== o) return (s = !i || e), !1;
                }),
                s
            );
        }
        function n(t) {
            return s(t, !0);
        }
        var r = t("<support>").get(0).style,
            a = "Webkit Moz O ms".split(" "),
            h = {
                transition: { end: { WebkitTransition: "webkitTransitionEnd", MozTransition: "transitionend", OTransition: "oTransitionEnd", transition: "transitionend" } },
                animation: { end: { WebkitAnimation: "webkitAnimationEnd", MozAnimation: "animationend", OAnimation: "oAnimationEnd", animation: "animationend" } },
            },
            l = {
                csstransforms: function () {
                    return !!s("transform");
                },
                csstransforms3d: function () {
                    return !!s("perspective");
                },
                csstransitions: function () {
                    return !!s("transition");
                },
                cssanimations: function () {
                    return !!s("animation");
                },
            };
        l.csstransitions() && ((t.support.transition = new String(n("transition"))), (t.support.transition.end = h.transition.end[t.support.transition])),
            l.cssanimations() && ((t.support.animation = new String(n("animation"))), (t.support.animation.end = h.animation.end[t.support.animation])),
            l.csstransforms() && ((t.support.transform = new String(n("transform"))), (t.support.transform3d = l.csstransforms3d()));
    })(window.Zepto || window.jQuery, window, document),
    (function () {
        "use strict";
        function t(o) {
            (this.options = e.extend({}, i.defaults, t.defaults, o)), (this.element = this.options.element), (this.$element = e(this.element)), this.createWrapper(), this.createWaypoint();
        }
        var e = window.jQuery,
            i = window.Waypoint;
        (t.prototype.createWaypoint = function () {
            var t = this.options.handler;
            this.waypoint = new i(
                e.extend({}, this.options, {
                    element: this.wrapper,
                    handler: e.proxy(function (e) {
                        var i = this.options.direction.indexOf(e) > -1,
                            o = i ? this.$element.outerHeight(!0) : "";
                        this.$wrapper.height(o), this.$element.toggleClass(this.options.stuckClass, i), t && t.call(this, e);
                    }, this),
                })
            );
        }),
            (t.prototype.createWrapper = function () {
                this.options.wrapper && this.$element.wrap(this.options.wrapper), (this.$wrapper = this.$element.parent()), (this.wrapper = this.$wrapper[0]);
            }),
            (t.prototype.destroy = function () {
                this.$element.parent()[0] === this.wrapper && (this.waypoint.destroy(), this.$element.removeClass(this.options.stuckClass), this.options.wrapper && this.$element.unwrap());
            }),
            (t.defaults = { wrapper: '<div class="sticky-wrapper" />', stuckClass: "stuck", direction: "down right" }),
            (i.Sticky = t);
    })(),
    (function (t, e) {
        "use strict";
        var i = (function () {
            var i = { bcClass: "sf-breadcrumb", menuClass: "sf-js-enabled", anchorClass: "sf-with-ul", menuArrowClass: "sf-arrows" },
                o = (function () {
                    var e = /^(?![\w\W]*Windows Phone)[\w\W]*(iPhone|iPad|iPod)/i.test(navigator.userAgent);
                    return e && t("html").css("cursor", "pointer").on("click", t.noop), e;
                })(),
                s = (function () {
                    var t = document.documentElement.style;
                    return "behavior" in t && "fill" in t && /iemobile/i.test(navigator.userAgent);
                })(),
                n = !!e.PointerEvent,
                r = function (t, e, o) {
                    var s = i.menuClass;
                    e.cssArrows && (s += " " + i.menuArrowClass), t[o ? "addClass" : "removeClass"](s);
                },
                a = function (t, e) {
                    var o = e ? "addClass" : "removeClass";
                    t.children("a")[o](i.anchorClass);
                },
                h = function (t) {
                    var e = t.css("ms-touch-action"),
                        i = t.css("touch-action");
                    (i = "pan-y" === (i = i || e) ? "auto" : "pan-y"), t.css({ "ms-touch-action": i, "touch-action": i });
                },
                l = function (t) {
                    return t.closest("." + i.menuClass);
                },
                p = function (t) {
                    return l(t).data("sfOptions");
                },
                c = function () {
                    var e = t(this),
                        i = p(e);
                    clearTimeout(i.sfTimer), e.siblings().superfish("hide").end().superfish("show");
                },
                d = function (e) {
                    (e.retainPath = t.inArray(this[0], e.$path) > -1), this.superfish("hide"), this.parents("." + e.hoverClass).length || (e.onIdle.call(l(this)), e.$path.length && t.proxy(c, e.$path)());
                },
                u = function () {
                    var e = t(this),
                        i = p(e);
                    o ? t.proxy(d, e, i)() : (clearTimeout(i.sfTimer), (i.sfTimer = setTimeout(t.proxy(d, e, i), i.delay)));
                },
                m = function (e) {
                    var i = t(this),
                        o = p(i),
                        s = i.siblings(e.data.popUpSelector);
                    return !1 === o.onHandleTouch.call(s)
                        ? this
                        : void (s.length > 0 && s.is(":hidden") && (i.one("click.superfish", !1), "MSPointerDown" === e.type || "pointerdown" === e.type ? i.trigger("focus") : t.proxy(c, i.parent("li"))()));
                },
                f = function (e, i) {
                    var r = "li:has(" + i.popUpSelector + ")";
                    t.fn.hoverIntent && !i.disableHI ? e.hoverIntent(c, u, r) : e.on("mouseenter.superfish", r, c).on("mouseleave.superfish", r, u);
                    var a = "MSPointerDown.superfish";
                    n && (a = "pointerdown.superfish"), o || (a += " touchend.superfish"), s && (a += " mousedown.superfish"), e.on("focusin.superfish", "li", c).on("focusout.superfish", "li", u).on(a, "a", i, m);
                };
            return {
                hide: function (e) {
                    if (this.length) {
                        var i = p(this);
                        if (!i) return this;
                        var o = !0 === i.retainPath ? i.$path : "",
                            s = this.find("li." + i.hoverClass)
                                .add(this)
                                .not(o)
                                .removeClass(i.hoverClass)
                                .children(i.popUpSelector),
                            n = i.speedOut;
                        if ((e && (s.show(), (n = 0)), (i.retainPath = !1), !1 === i.onBeforeHide.call(s))) return this;
                        s.stop(!0, !0).animate(i.animationOut, n, function () {
                            var e = t(this);
                            i.onHide.call(e);
                        });
                    }
                    return this;
                },
                show: function () {
                    var t = p(this);
                    if (!t) return this;
                    var e = this.addClass(t.hoverClass).children(t.popUpSelector);
                    return !1 === t.onBeforeShow.call(e)
                        ? this
                        : (e.stop(!0, !0).animate(t.animation, t.speed, function () {
                              t.onShow.call(e);
                          }),
                          this);
                },
                destroy: function () {
                    return this.each(function () {
                        var e,
                            o = t(this),
                            s = o.data("sfOptions");
                        return (
                            !!s &&
                            ((e = o.find(s.popUpSelector).parent("li")),
                            clearTimeout(s.sfTimer),
                            r(o, s),
                            a(e),
                            h(o),
                            o.off(".superfish").off(".hoverIntent"),
                            e.children(s.popUpSelector).attr("style", function (t, e) {
                                if (void 0 !== e) return e.replace(/display[^;]+;?/g, "");
                            }),
                            s.$path.removeClass(s.hoverClass + " " + i.bcClass).addClass(s.pathClass),
                            o.find("." + s.hoverClass).removeClass(s.hoverClass),
                            s.onDestroy.call(o),
                            void o.removeData("sfOptions"))
                        );
                    });
                },
                init: function (e) {
                    return this.each(function () {
                        var o = t(this);
                        if (o.data("sfOptions")) return !1;
                        var s = t.extend({}, t.fn.superfish.defaults, e),
                            n = o.find(s.popUpSelector).parent("li");
                        (s.$path = (function (e, o) {
                            return e
                                .find("li." + o.pathClass)
                                .slice(0, o.pathLevels)
                                .addClass(o.hoverClass + " " + i.bcClass)
                                .filter(function () {
                                    return t(this).children(o.popUpSelector).hide().show().length;
                                })
                                .removeClass(o.pathClass);
                        })(o, s)),
                            o.data("sfOptions", s),
                            r(o, s, !0),
                            a(n, !0),
                            h(o),
                            f(o, s),
                            n.not("." + i.bcClass).superfish("hide", !0),
                            s.onInit.call(this);
                    });
                },
            };
        })();
        (t.fn.superfish = function (e, o) {
            return i[e] ? i[e].apply(this, Array.prototype.slice.call(arguments, 1)) : "object" != typeof e && e ? t.error("Method " + e + " does not exist on jQuery.fn.superfish") : i.init.apply(this, arguments);
        }),
            (t.fn.superfish.defaults = {
                popUpSelector: "ul,.sf-mega",
                hoverClass: "sfHover",
                pathClass: "overrideThisToUse",
                pathLevels: 1,
                delay: 800,
                animation: { opacity: "show" },
                animationOut: { opacity: "hide" },
                speed: "normal",
                speedOut: "fast",
                cssArrows: !0,
                disableHI: !1,
                onInit: t.noop,
                onBeforeShow: t.noop,
                onShow: t.noop,
                onBeforeHide: t.noop,
                onHide: t.noop,
                onIdle: t.noop,
                onDestroy: t.noop,
                onHandleTouch: t.noop,
            });
    })(jQuery, window),
    "function" != typeof Object.create &&
        (Object.create = function (t) {
            function e() {}
            return (e.prototype = t), new e();
        }),
    (function (t, e, i, o) {
        var s = {
            init: function (e, i) {
                var o = this;
                (o.elem = i),
                    (o.$elem = t(i)),
                    (o.imageSrc = o.$elem.data("zoom-image") ? o.$elem.data("zoom-image") : o.$elem.attr("src")),
                    (o.options = t.extend({}, t.fn.elevateZoom.options, e)),
                    o.options.tint && ((o.options.lensColour = "none"), (o.options.lensOpacity = "1")),
                    "inner" == o.options.zoomType && (o.options.showLens = !1),
                    o.options.zoomContainer ? (o.$container = t(o.options.zoomContainer)) : (o.$container = t("body")),
                    o.$elem.parent().removeAttr("title").removeAttr("alt"),
                    (o.zoomImage = o.imageSrc),
                    o.refresh(1),
                    t("#" + o.options.gallery + " a").click(function (e) {
                        return (
                            o.options.galleryActiveClass && (t("#" + o.options.gallery + " a").removeClass(o.options.galleryActiveClass), t(this).addClass(o.options.galleryActiveClass)),
                            e.preventDefault(),
                            t(this).data("zoom-image") ? (o.zoomImagePre = t(this).data("zoom-image")) : (o.zoomImagePre = t(this).data("image")),
                            o.swaptheimage(t(this).data("image"), o.zoomImagePre),
                            !1
                        );
                    });
            },
            refresh: function (t) {
                var e = this;
                setTimeout(function () {
                    e.fetch(e.imageSrc);
                }, t || e.options.refresh);
            },
            fetch: function (t) {
                var e = this,
                    i = new Image();
                (i.onload = function () {
                    (e.largeWidth = i.width), (e.largeHeight = i.height), e.startZoom(), (e.currentImage = e.imageSrc), e.options.onZoomedImageLoaded(e.$elem);
                }),
                    (i.src = t);
            },
            startZoom: function () {
                var e = this;
                if (
                    ((e.nzWidth = e.$elem.width()),
                    (e.nzHeight = e.$elem.height()),
                    (e.isWindowActive = !1),
                    (e.isLensActive = !1),
                    (e.isTintActive = !1),
                    (e.overWindow = !1),
                    e.options.imageCrossfade && ((e.zoomWrap = e.$elem.wrap('<div style="height:' + e.nzHeight + "px;width:" + e.nzWidth + 'px;" class="zoomWrapper" />')), e.$elem.css("position", "absolute")),
                    (e.zoomLock = 1),
                    (e.scrollingLock = !1),
                    (e.changeBgSize = !1),
                    (e.currentZoomLevel = e.options.zoomLevel),
                    (e.nzOffset = e.$elem.offset()),
                    (e.ctOffset = e.$container.offset()),
                    (e.widthRatio = e.largeWidth / e.currentZoomLevel / e.nzWidth),
                    (e.heightRatio = e.largeHeight / e.currentZoomLevel / e.nzHeight),
                    "window" == e.options.zoomType &&
                        (e.zoomWindowStyle =
                            "overflow: hidden;background-position: 0px 0px;text-align:center;background-color: " +
                            String(e.options.zoomWindowBgColour) +
                            ";width: " +
                            String(e.options.zoomWindowWidth) +
                            "px;height: " +
                            String(e.options.zoomWindowHeight) +
                            "px;float: left;background-size: " +
                            e.largeWidth / e.currentZoomLevel +
                            "px " +
                            e.largeHeight / e.currentZoomLevel +
                            "px;display: none;z-index:100;border: " +
                            String(e.options.borderSize) +
                            "px solid " +
                            e.options.borderColour +
                            ";background-repeat: no-repeat;position: absolute;"),
                    "inner" == e.options.zoomType)
                ) {
                    var i = e.$elem.css("border-left-width");
                    e.zoomWindowStyle =
                        "overflow: hidden;margin-left: " +
                        String(i) +
                        ";margin-top: " +
                        String(i) +
                        ";background-position: 0px 0px;width: " +
                        String(e.nzWidth) +
                        "px;height: " +
                        String(e.nzHeight) +
                        "px;px;float: left;display: none;cursor:" +
                        e.options.cursor +
                        ";px solid " +
                        e.options.borderColour +
                        ";background-repeat: no-repeat;position: absolute;";
                }
                "window" == e.options.zoomType &&
                    (e.nzHeight < e.options.zoomWindowWidth / e.widthRatio ? (lensHeight = e.nzHeight) : (lensHeight = String(e.options.zoomWindowHeight / e.heightRatio)),
                    e.largeWidth < e.options.zoomWindowWidth ? (lensWidth = e.nzWidth) : (lensWidth = e.options.zoomWindowWidth / e.widthRatio),
                    (e.lensStyle =
                        "background-position: 0px 0px;width: " +
                        String(e.options.zoomWindowWidth / e.widthRatio) +
                        "px;height: " +
                        String(e.options.zoomWindowHeight / e.heightRatio) +
                        "px;float: right;display: none;overflow: hidden;z-index: 999;-webkit-transform: translateZ(0);opacity:" +
                        e.options.lensOpacity +
                        ";filter: alpha(opacity = " +
                        100 * e.options.lensOpacity +
                        "); zoom:1;width:" +
                        lensWidth +
                        "px;height:" +
                        lensHeight +
                        "px;background-color:" +
                        e.options.lensColour +
                        ";cursor:" +
                        e.options.cursor +
                        ";border: " +
                        e.options.lensBorderSize +
                        "px solid " +
                        e.options.lensBorderColour +
                        ";background-repeat: no-repeat;position: absolute;")),
                    (e.tintStyle = "display: block;position: absolute;background-color: " + e.options.tintColour + ";filter:alpha(opacity=0);opacity: 0;width: " + e.nzWidth + "px;height: " + e.nzHeight + "px;"),
                    (e.lensRound = ""),
                    "lens" == e.options.zoomType &&
                        (e.lensStyle =
                            "background-position: 0px 0px;float: left;display: none;border: " +
                            String(e.options.borderSize) +
                            "px solid " +
                            e.options.borderColour +
                            ";width:" +
                            String(e.options.lensSize) +
                            "px;height:" +
                            String(e.options.lensSize) +
                            "px;background-repeat: no-repeat;position: absolute;"),
                    "round" == e.options.lensShape &&
                        (e.lensRound =
                            "border-top-left-radius: " +
                            String(e.options.lensSize / 2 + e.options.borderSize) +
                            "px;border-top-right-radius: " +
                            String(e.options.lensSize / 2 + e.options.borderSize) +
                            "px;border-bottom-left-radius: " +
                            String(e.options.lensSize / 2 + e.options.borderSize) +
                            "px;border-bottom-right-radius: " +
                            String(e.options.lensSize / 2 + e.options.borderSize) +
                            "px;"),
                    void 0 !== e.ctOffset &&
                        ((e.zoomContainer = t(
                            '<div class="zoomContainer" style="-webkit-transform: translateZ(0);position:absolute;left:' +
                                (e.nzOffset.left - e.ctOffset.left) +
                                "px;top:" +
                                (e.nzOffset.top - e.ctOffset.top) +
                                "px;height:" +
                                e.nzHeight +
                                "px;width:" +
                                e.nzWidth +
                                'px;"></div>'
                        )),
                        e.$container.append(e.zoomContainer),
                        e.options.containLensZoom && "lens" == e.options.zoomType && e.zoomContainer.css("overflow", "hidden"),
                        "inner" != e.options.zoomType &&
                            ((e.zoomLens = t("<div class='zoomLens' style='" + e.lensStyle + e.lensRound + "'>&nbsp;</div>")
                                .appendTo(e.zoomContainer)
                                .click(function () {
                                    e.$elem.trigger("click");
                                })),
                            e.options.tint &&
                                ((e.tintContainer = t("<div/>").addClass("tintContainer")),
                                (e.zoomTint = t("<div class='zoomTint' style='" + e.tintStyle + "'></div>")),
                                e.zoomLens.wrap(e.tintContainer),
                                (e.zoomTintcss = e.zoomLens.after(e.zoomTint)),
                                (e.zoomTintImage = t('<img style="position: absolute; left: 0px; top: 0px; max-width: none; width: ' + e.nzWidth + "px; height: " + e.nzHeight + 'px;" src="' + e.imageSrc + '">')
                                    .appendTo(e.zoomLens)
                                    .click(function () {
                                        e.$elem.trigger("click");
                                    })))),
                        isNaN(e.options.zoomWindowPosition)
                            ? (e.zoomWindow = t("<div style='z-index:999;left:" + e.windowOffsetLeft + "px;top:" + e.windowOffsetTop + "px;" + e.zoomWindowStyle + "' class='zoomWindow'>&nbsp;</div>")
                                  .appendTo("body")
                                  .click(function () {
                                      e.$elem.trigger("click");
                                  }))
                            : (e.zoomWindow = t("<div style='z-index:999;left:" + e.windowOffsetLeft + "px;top:" + e.windowOffsetTop + "px;" + e.zoomWindowStyle + "' class='zoomWindow'>&nbsp;</div>")
                                  .appendTo(e.zoomContainer)
                                  .click(function () {
                                      e.$elem.trigger("click");
                                  })),
                        (e.zoomWindowContainer = t("<div/>").addClass("zoomWindowContainer").css("width", e.options.zoomWindowWidth)),
                        e.zoomWindow.wrap(e.zoomWindowContainer),
                        "lens" == e.options.zoomType && e.zoomLens.css({ backgroundImage: "url('" + e.imageSrc + "')" }),
                        "window" == e.options.zoomType && e.zoomWindow.css({ backgroundImage: "url('" + e.imageSrc + "')" }),
                        "inner" == e.options.zoomType && e.zoomWindow.css({ backgroundImage: "url('" + e.imageSrc + "')" }),
                        e.$elem.bind("touchmove", function (t) {
                            t.preventDefault();
                            var i = t.originalEvent.touches[0] || t.originalEvent.changedTouches[0];
                            e.setPosition(i);
                        }),
                        e.zoomContainer.bind("touchmove", function (t) {
                            "inner" == e.options.zoomType && e.showHideWindow("show"), t.preventDefault();
                            var i = t.originalEvent.touches[0] || t.originalEvent.changedTouches[0];
                            e.setPosition(i);
                        }),
                        e.zoomContainer.bind("touchend", function (t) {
                            e.showHideWindow("hide"), e.options.showLens && e.showHideLens("hide"), e.options.tint && "inner" != e.options.zoomType && e.showHideTint("hide");
                        }),
                        e.$elem.bind("touchend", function (t) {
                            e.showHideWindow("hide"), e.options.showLens && e.showHideLens("hide"), e.options.tint && "inner" != e.options.zoomType && e.showHideTint("hide");
                        }),
                        e.options.showLens &&
                            (e.zoomLens.bind("touchmove", function (t) {
                                t.preventDefault();
                                var i = t.originalEvent.touches[0] || t.originalEvent.changedTouches[0];
                                e.setPosition(i);
                            }),
                            e.zoomLens.bind("touchend", function (t) {
                                e.showHideWindow("hide"), e.options.showLens && e.showHideLens("hide"), e.options.tint && "inner" != e.options.zoomType && e.showHideTint("hide");
                            })),
                        e.$elem.bind("mousemove", function (t) {
                            0 == e.overWindow && e.setElements("show"), (e.lastX === t.clientX && e.lastY === t.clientY) || (e.setPosition(t), (e.currentLoc = t)), (e.lastX = t.clientX), (e.lastY = t.clientY);
                        }),
                        e.zoomContainer.bind("mousemove", function (t) {
                            0 == e.overWindow && e.setElements("show"), (e.lastX === t.clientX && e.lastY === t.clientY) || (e.setPosition(t), (e.currentLoc = t)), (e.lastX = t.clientX), (e.lastY = t.clientY);
                        }),
                        "inner" != e.options.zoomType &&
                            e.zoomLens.bind("mousemove", function (t) {
                                (e.lastX === t.clientX && e.lastY === t.clientY) || (e.setPosition(t), (e.currentLoc = t)), (e.lastX = t.clientX), (e.lastY = t.clientY);
                            }),
                        e.options.tint &&
                            "inner" != e.options.zoomType &&
                            e.zoomTint.bind("mousemove", function (t) {
                                (e.lastX === t.clientX && e.lastY === t.clientY) || (e.setPosition(t), (e.currentLoc = t)), (e.lastX = t.clientX), (e.lastY = t.clientY);
                            }),
                        "inner" == e.options.zoomType &&
                            e.zoomWindow.bind("mousemove", function (t) {
                                (e.lastX === t.clientX && e.lastY === t.clientY) || (e.setPosition(t), (e.currentLoc = t)), (e.lastX = t.clientX), (e.lastY = t.clientY);
                            }),
                        e.zoomContainer
                            .add(e.$elem)
                            .mouseenter(function () {
                                0 == e.overWindow && e.setElements("show");
                            })
                            .mouseleave(function () {
                                e.scrollLock || (e.setElements("hide"), e.options.onDestroy(e.$elem));
                            }),
                        "inner" != e.options.zoomType &&
                            e.zoomWindow
                                .mouseenter(function () {
                                    (e.overWindow = !0), e.setElements("hide");
                                })
                                .mouseleave(function () {
                                    e.overWindow = !1;
                                }),
                        e.options.zoomLevel,
                        e.options.minZoomLevel ? (e.minZoomLevel = e.options.minZoomLevel) : (e.minZoomLevel = 2 * e.options.scrollZoomIncrement),
                        e.options.scrollZoom &&
                            e.zoomContainer.add(e.$elem).bind("mousewheel DOMMouseScroll MozMousePixelScroll", function (i) {
                                (e.scrollLock = !0),
                                    clearTimeout(t.data(this, "timer")),
                                    t.data(
                                        this,
                                        "timer",
                                        setTimeout(function () {
                                            e.scrollLock = !1;
                                        }, 250)
                                    );
                                var o = i.originalEvent.wheelDelta || -1 * i.originalEvent.detail;
                                return (
                                    i.stopImmediatePropagation(),
                                    i.stopPropagation(),
                                    i.preventDefault(),
                                    o / 120 > 0
                                        ? e.currentZoomLevel >= e.minZoomLevel && e.changeZoomLevel(e.currentZoomLevel - e.options.scrollZoomIncrement)
                                        : e.options.maxZoomLevel
                                        ? e.currentZoomLevel <= e.options.maxZoomLevel && e.changeZoomLevel(parseFloat(e.currentZoomLevel) + e.options.scrollZoomIncrement)
                                        : e.changeZoomLevel(parseFloat(e.currentZoomLevel) + e.options.scrollZoomIncrement),
                                    !1
                                );
                            }));
            },
            setElements: function (t) {
                if (!this.options.zoomEnabled) return !1;
                "show" == t &&
                    this.isWindowSet &&
                    ("inner" == this.options.zoomType && this.showHideWindow("show"),
                    "window" == this.options.zoomType && this.showHideWindow("show"),
                    this.options.showLens && this.showHideLens("show"),
                    this.options.tint && "inner" != this.options.zoomType && this.showHideTint("show")),
                    "hide" == t &&
                        ("window" == this.options.zoomType && this.showHideWindow("hide"),
                        this.options.tint || this.showHideWindow("hide"),
                        this.options.showLens && this.showHideLens("hide"),
                        this.options.tint && this.showHideTint("hide"));
            },
            setPosition: function (t) {
                if (!this.options.zoomEnabled) return !1;
                (this.nzHeight = this.$elem.height()),
                    (this.nzWidth = this.$elem.width()),
                    (this.nzOffset = this.$elem.offset()),
                    (this.ctOffset = this.$container.offset()),
                    this.options.tint && "inner" != this.options.zoomType && (this.zoomTint.css({ top: 0 }), this.zoomTint.css({ left: 0 })),
                    this.options.responsive &&
                        !this.options.scrollZoom &&
                        this.options.showLens &&
                        (this.nzHeight < this.options.zoomWindowWidth / this.widthRatio ? (lensHeight = this.nzHeight) : (lensHeight = String(this.options.zoomWindowHeight / this.heightRatio)),
                        this.largeWidth < this.options.zoomWindowWidth ? (lensWidth = this.nzWidth) : (lensWidth = this.options.zoomWindowWidth / this.widthRatio),
                        (this.widthRatio = this.largeWidth / this.nzWidth),
                        (this.heightRatio = this.largeHeight / this.nzHeight),
                        "lens" != this.options.zoomType &&
                            (this.nzHeight < this.options.zoomWindowWidth / this.widthRatio ? (lensHeight = this.nzHeight) : (lensHeight = String(this.options.zoomWindowHeight / this.heightRatio)),
                            this.nzWidth < this.options.zoomWindowHeight / this.heightRatio ? (lensWidth = this.nzWidth) : (lensWidth = String(this.options.zoomWindowWidth / this.widthRatio)),
                            this.zoomLens.css("width", lensWidth),
                            this.zoomLens.css("height", lensHeight),
                            this.options.tint && (this.zoomTintImage.css("width", this.nzWidth), this.zoomTintImage.css("height", this.nzHeight))),
                        "lens" == this.options.zoomType && this.zoomLens.css({ width: String(this.options.lensSize) + "px", height: String(this.options.lensSize) + "px" })),
                    this.zoomContainer.css({ top: this.nzOffset.top - this.ctOffset.top }),
                    this.zoomContainer.css({ left: this.nzOffset.left - this.ctOffset.left }),
                    (this.mouseLeft = parseInt(t.pageX - this.nzOffset.left)),
                    (this.mouseTop = parseInt(t.pageY - this.nzOffset.top)),
                    "window" == this.options.zoomType &&
                        ((this.Etoppos = this.mouseTop < this.zoomLens.height() / 2),
                        (this.Eboppos = this.mouseTop > this.nzHeight - this.zoomLens.height() / 2 - 2 * this.options.lensBorderSize),
                        (this.Eloppos = this.mouseLeft < 0 + this.zoomLens.width() / 2),
                        (this.Eroppos = this.mouseLeft > this.nzWidth - this.zoomLens.width() / 2 - 2 * this.options.lensBorderSize)),
                    "inner" == this.options.zoomType &&
                        ((this.Etoppos = this.mouseTop < this.nzHeight / 2 / this.heightRatio),
                        (this.Eboppos = this.mouseTop > this.nzHeight - this.nzHeight / 2 / this.heightRatio),
                        (this.Eloppos = this.mouseLeft < 0 + this.nzWidth / 2 / this.widthRatio),
                        (this.Eroppos = this.mouseLeft > this.nzWidth - this.nzWidth / 2 / this.widthRatio - 2 * this.options.lensBorderSize)),
                    this.mouseLeft < 0 || this.mouseTop < 0 || this.mouseLeft > this.nzWidth || this.mouseTop > this.nzHeight
                        ? this.setElements("hide")
                        : (this.options.showLens && ((this.lensLeftPos = String(Math.floor(this.mouseLeft - this.zoomLens.width() / 2))), (this.lensTopPos = String(Math.floor(this.mouseTop - this.zoomLens.height() / 2)))),
                          this.Etoppos && (this.lensTopPos = 0),
                          this.Eloppos && ((this.windowLeftPos = 0), (this.lensLeftPos = 0), (this.tintpos = 0)),
                          "window" == this.options.zoomType &&
                              (this.Eboppos && (this.lensTopPos = Math.max(this.nzHeight - this.zoomLens.height() - 2 * this.options.lensBorderSize, 0)),
                              this.Eroppos && (this.lensLeftPos = this.nzWidth - this.zoomLens.width() - 2 * this.options.lensBorderSize)),
                          "inner" == this.options.zoomType &&
                              (this.Eboppos && (this.lensTopPos = Math.max(this.nzHeight - 2 * this.options.lensBorderSize, 0)), this.Eroppos && (this.lensLeftPos = this.nzWidth - this.nzWidth - 2 * this.options.lensBorderSize)),
                          "lens" == this.options.zoomType &&
                              ((this.windowLeftPos = String(-1 * ((t.pageX - this.nzOffset.left) * this.widthRatio - this.zoomLens.width() / 2))),
                              (this.windowTopPos = String(-1 * ((t.pageY - this.nzOffset.top) * this.heightRatio - this.zoomLens.height() / 2))),
                              this.zoomLens.css({ backgroundPosition: this.windowLeftPos + "px " + this.windowTopPos + "px" }),
                              this.changeBgSize &&
                                  (this.nzHeight > this.nzWidth
                                      ? ("lens" == this.options.zoomType && this.zoomLens.css({ "background-size": this.largeWidth / this.newvalueheight + "px " + this.largeHeight / this.newvalueheight + "px" }),
                                        this.zoomWindow.css({ "background-size": this.largeWidth / this.newvalueheight + "px " + this.largeHeight / this.newvalueheight + "px" }))
                                      : ("lens" == this.options.zoomType && this.zoomLens.css({ "background-size": this.largeWidth / this.newvaluewidth + "px " + this.largeHeight / this.newvaluewidth + "px" }),
                                        this.zoomWindow.css({ "background-size": this.largeWidth / this.newvaluewidth + "px " + this.largeHeight / this.newvaluewidth + "px" })),
                                  (this.changeBgSize = !1)),
                              this.setWindowPostition(t)),
                          this.options.tint && "inner" != this.options.zoomType && this.setTintPosition(t),
                          "window" == this.options.zoomType && this.setWindowPostition(t),
                          "inner" == this.options.zoomType && this.setWindowPostition(t),
                          this.options.showLens && (this.fullwidth && "lens" != this.options.zoomType && (this.lensLeftPos = 0), this.zoomLens.css({ left: this.lensLeftPos + "px", top: this.lensTopPos + "px" })));
            },
            showHideWindow: function (t) {
                var e = this;
                "show" == t && (e.isWindowActive || (e.options.zoomWindowFadeIn ? e.zoomWindow.stop(!0, !0, !1).fadeIn(e.options.zoomWindowFadeIn) : e.zoomWindow.show(), (e.isWindowActive = !0))),
                    "hide" == t &&
                        e.isWindowActive &&
                        (e.options.zoomWindowFadeOut
                            ? e.zoomWindow.stop(!0, !0).fadeOut(e.options.zoomWindowFadeOut, function () {
                                  e.loop && (clearInterval(e.loop), (e.loop = !1));
                              })
                            : e.zoomWindow.hide(),
                        (e.isWindowActive = !1));
            },
            showHideLens: function (t) {
                "show" == t && (this.isLensActive || (this.options.lensFadeIn ? this.zoomLens.stop(!0, !0, !1).fadeIn(this.options.lensFadeIn) : this.zoomLens.show(), (this.isLensActive = !0))),
                    "hide" == t && this.isLensActive && (this.options.lensFadeOut ? this.zoomLens.stop(!0, !0).fadeOut(this.options.lensFadeOut) : this.zoomLens.hide(), (this.isLensActive = !1));
            },
            showHideTint: function (t) {
                "show" == t &&
                    (this.isTintActive ||
                        (this.options.zoomTintFadeIn
                            ? this.zoomTint.css({ opacity: this.options.tintOpacity }).animate().stop(!0, !0).fadeIn("slow")
                            : (this.zoomTint.css({ opacity: this.options.tintOpacity }).animate(), this.zoomTint.show()),
                        (this.isTintActive = !0))),
                    "hide" == t && this.isTintActive && (this.options.zoomTintFadeOut ? this.zoomTint.stop(!0, !0).fadeOut(this.options.zoomTintFadeOut) : this.zoomTint.hide(), (this.isTintActive = !1));
            },
            setLensPostition: function (t) {},
            setWindowPostition: function (e) {
                var i = this;
                if (isNaN(i.options.zoomWindowPosition))
                    (i.externalContainer = t("#" + i.options.zoomWindowPosition)),
                        (i.externalContainerWidth = i.externalContainer.width()),
                        (i.externalContainerHeight = i.externalContainer.height()),
                        (i.externalContainerOffset = i.externalContainer.offset()),
                        (i.windowOffsetTop = i.externalContainerOffset.top),
                        (i.windowOffsetLeft = i.externalContainerOffset.left);
                else
                    switch (i.options.zoomWindowPosition) {
                        case 1:
                            (i.windowOffsetTop = i.options.zoomWindowOffety), (i.windowOffsetLeft = +i.nzWidth);
                            break;
                        case 2:
                            i.options.zoomWindowHeight > i.nzHeight && ((i.windowOffsetTop = -1 * (i.options.zoomWindowHeight / 2 - i.nzHeight / 2)), (i.windowOffsetLeft = i.nzWidth));
                            break;
                        case 3:
                            (i.windowOffsetTop = i.nzHeight - i.zoomWindow.height() - 2 * i.options.borderSize), (i.windowOffsetLeft = i.nzWidth);
                            break;
                        case 4:
                            (i.windowOffsetTop = i.nzHeight), (i.windowOffsetLeft = i.nzWidth);
                            break;
                        case 5:
                            (i.windowOffsetTop = i.nzHeight), (i.windowOffsetLeft = i.nzWidth - i.zoomWindow.width() - 2 * i.options.borderSize);
                            break;
                        case 6:
                            i.options.zoomWindowHeight > i.nzHeight && ((i.windowOffsetTop = i.nzHeight), (i.windowOffsetLeft = -1 * (i.options.zoomWindowWidth / 2 - i.nzWidth / 2 + 2 * i.options.borderSize)));
                            break;
                        case 7:
                            (i.windowOffsetTop = i.nzHeight), (i.windowOffsetLeft = 0);
                            break;
                        case 8:
                            (i.windowOffsetTop = i.nzHeight), (i.windowOffsetLeft = -1 * (i.zoomWindow.width() + 2 * i.options.borderSize));
                            break;
                        case 9:
                            (i.windowOffsetTop = i.nzHeight - i.zoomWindow.height() - 2 * i.options.borderSize), (i.windowOffsetLeft = -1 * (i.zoomWindow.width() + 2 * i.options.borderSize));
                            break;
                        case 10:
                            i.options.zoomWindowHeight > i.nzHeight && ((i.windowOffsetTop = -1 * (i.options.zoomWindowHeight / 2 - i.nzHeight / 2)), (i.windowOffsetLeft = -1 * (i.zoomWindow.width() + 2 * i.options.borderSize)));
                            break;
                        case 11:
                            (i.windowOffsetTop = i.options.zoomWindowOffety), (i.windowOffsetLeft = -1 * (i.zoomWindow.width() + 2 * i.options.borderSize));
                            break;
                        case 12:
                            (i.windowOffsetTop = -1 * (i.zoomWindow.height() + 2 * i.options.borderSize)), (i.windowOffsetLeft = -1 * (i.zoomWindow.width() + 2 * i.options.borderSize));
                            break;
                        case 13:
                            (i.windowOffsetTop = -1 * (i.zoomWindow.height() + 2 * i.options.borderSize)), (i.windowOffsetLeft = 0);
                            break;
                        case 14:
                            i.options.zoomWindowHeight > i.nzHeight &&
                                ((i.windowOffsetTop = -1 * (i.zoomWindow.height() + 2 * i.options.borderSize)), (i.windowOffsetLeft = -1 * (i.options.zoomWindowWidth / 2 - i.nzWidth / 2 + 2 * i.options.borderSize)));
                            break;
                        case 15:
                            (i.windowOffsetTop = -1 * (i.zoomWindow.height() + 2 * i.options.borderSize)), (i.windowOffsetLeft = i.nzWidth - i.zoomWindow.width() - 2 * i.options.borderSize);
                            break;
                        case 16:
                            (i.windowOffsetTop = -1 * (i.zoomWindow.height() + 2 * i.options.borderSize)), (i.windowOffsetLeft = i.nzWidth);
                            break;
                        default:
                            (i.windowOffsetTop = i.options.zoomWindowOffety), (i.windowOffsetLeft = i.nzWidth);
                    }
                (i.isWindowSet = !0),
                    (i.windowOffsetTop = i.windowOffsetTop + i.options.zoomWindowOffety),
                    (i.windowOffsetLeft = i.windowOffsetLeft + i.options.zoomWindowOffetx),
                    i.zoomWindow.css({ top: i.windowOffsetTop }),
                    i.zoomWindow.css({ left: i.windowOffsetLeft }),
                    "inner" == i.options.zoomType && (i.zoomWindow.css({ top: 0 }), i.zoomWindow.css({ left: 0 })),
                    (i.windowLeftPos = String(-1 * ((e.pageX - i.nzOffset.left) * i.widthRatio - i.zoomWindow.width() / 2))),
                    (i.windowTopPos = String(-1 * ((e.pageY - i.nzOffset.top) * i.heightRatio - i.zoomWindow.height() / 2))),
                    i.Etoppos && (i.windowTopPos = 0),
                    i.Eloppos && (i.windowLeftPos = 0),
                    i.Eboppos && (i.windowTopPos = -1 * (i.largeHeight / i.currentZoomLevel - i.zoomWindow.height())),
                    i.Eroppos && (i.windowLeftPos = -1 * (i.largeWidth / i.currentZoomLevel - i.zoomWindow.width())),
                    i.fullheight && (i.windowTopPos = 0),
                    i.fullwidth && (i.windowLeftPos = 0),
                    ("window" != i.options.zoomType && "inner" != i.options.zoomType) ||
                        (1 == i.zoomLock && (i.widthRatio <= 1 && (i.windowLeftPos = 0), i.heightRatio <= 1 && (i.windowTopPos = 0)),
                        "window" == i.options.zoomType && (i.largeHeight < i.options.zoomWindowHeight && (i.windowTopPos = 0), i.largeWidth < i.options.zoomWindowWidth && (i.windowLeftPos = 0)),
                        i.options.easing
                            ? (i.xp || (i.xp = 0),
                              i.yp || (i.yp = 0),
                              i.loop ||
                                  (i.loop = setInterval(function () {
                                      (i.xp += (i.windowLeftPos - i.xp) / i.options.easingAmount),
                                          (i.yp += (i.windowTopPos - i.yp) / i.options.easingAmount),
                                          i.scrollingLock
                                              ? (clearInterval(i.loop),
                                                (i.xp = i.windowLeftPos),
                                                (i.yp = i.windowTopPos),
                                                (i.xp = -1 * ((e.pageX - i.nzOffset.left) * i.widthRatio - i.zoomWindow.width() / 2)),
                                                (i.yp = -1 * ((e.pageY - i.nzOffset.top) * i.heightRatio - i.zoomWindow.height() / 2)),
                                                i.changeBgSize &&
                                                    (i.nzHeight > i.nzWidth
                                                        ? ("lens" == i.options.zoomType && i.zoomLens.css({ "background-size": i.largeWidth / i.newvalueheight + "px " + i.largeHeight / i.newvalueheight + "px" }),
                                                          i.zoomWindow.css({ "background-size": i.largeWidth / i.newvalueheight + "px " + i.largeHeight / i.newvalueheight + "px" }))
                                                        : ("lens" != i.options.zoomType && i.zoomLens.css({ "background-size": i.largeWidth / i.newvaluewidth + "px " + i.largeHeight / i.newvalueheight + "px" }),
                                                          i.zoomWindow.css({ "background-size": i.largeWidth / i.newvaluewidth + "px " + i.largeHeight / i.newvaluewidth + "px" })),
                                                    (i.changeBgSize = !1)),
                                                i.zoomWindow.css({ backgroundPosition: i.windowLeftPos + "px " + i.windowTopPos + "px" }),
                                                (i.scrollingLock = !1),
                                                (i.loop = !1))
                                              : Math.round(Math.abs(i.xp - i.windowLeftPos) + Math.abs(i.yp - i.windowTopPos)) < 1
                                              ? (clearInterval(i.loop), i.zoomWindow.css({ backgroundPosition: i.windowLeftPos + "px " + i.windowTopPos + "px" }), (i.loop = !1))
                                              : (i.changeBgSize &&
                                                    (i.nzHeight > i.nzWidth
                                                        ? ("lens" == i.options.zoomType && i.zoomLens.css({ "background-size": i.largeWidth / i.newvalueheight + "px " + i.largeHeight / i.newvalueheight + "px" }),
                                                          i.zoomWindow.css({ "background-size": i.largeWidth / i.newvalueheight + "px " + i.largeHeight / i.newvalueheight + "px" }))
                                                        : ("lens" != i.options.zoomType && i.zoomLens.css({ "background-size": i.largeWidth / i.newvaluewidth + "px " + i.largeHeight / i.newvaluewidth + "px" }),
                                                          i.zoomWindow.css({ "background-size": i.largeWidth / i.newvaluewidth + "px " + i.largeHeight / i.newvaluewidth + "px" })),
                                                    (i.changeBgSize = !1)),
                                                i.zoomWindow.css({ backgroundPosition: i.xp + "px " + i.yp + "px" }));
                                  }, 16)))
                            : (i.changeBgSize &&
                                  (i.nzHeight > i.nzWidth
                                      ? ("lens" == i.options.zoomType && i.zoomLens.css({ "background-size": i.largeWidth / i.newvalueheight + "px " + i.largeHeight / i.newvalueheight + "px" }),
                                        i.zoomWindow.css({ "background-size": i.largeWidth / i.newvalueheight + "px " + i.largeHeight / i.newvalueheight + "px" }))
                                      : ("lens" == i.options.zoomType && i.zoomLens.css({ "background-size": i.largeWidth / i.newvaluewidth + "px " + i.largeHeight / i.newvaluewidth + "px" }),
                                        i.largeHeight / i.newvaluewidth < i.options.zoomWindowHeight
                                            ? i.zoomWindow.css({ "background-size": i.largeWidth / i.newvaluewidth + "px " + i.largeHeight / i.newvaluewidth + "px" })
                                            : i.zoomWindow.css({ "background-size": i.largeWidth / i.newvalueheight + "px " + i.largeHeight / i.newvalueheight + "px" })),
                                  (i.changeBgSize = !1)),
                              i.zoomWindow.css({ backgroundPosition: i.windowLeftPos + "px " + i.windowTopPos + "px" })));
            },
            setTintPosition: function (t) {
                (this.nzOffset = this.$elem.offset()),
                    (this.tintpos = String(-1 * (t.pageX - this.nzOffset.left - this.zoomLens.width() / 2))),
                    (this.tintposy = String(-1 * (t.pageY - this.nzOffset.top - this.zoomLens.height() / 2))),
                    this.Etoppos && (this.tintposy = 0),
                    this.Eloppos && (this.tintpos = 0),
                    this.Eboppos && (this.tintposy = -1 * (this.nzHeight - this.zoomLens.height() - 2 * this.options.lensBorderSize)),
                    this.Eroppos && (this.tintpos = -1 * (this.nzWidth - this.zoomLens.width() - 2 * this.options.lensBorderSize)),
                    this.options.tint && (this.fullheight && (this.tintposy = 0), this.fullwidth && (this.tintpos = 0), this.zoomTintImage.css({ left: this.tintpos + "px" }), this.zoomTintImage.css({ top: this.tintposy + "px" }));
            },
            swaptheimage: function (e, i) {
                var o = this,
                    s = new Image();
                o.options.loadingIcon &&
                    ((o.spinner = t(
                        "<div style=\"background: url('" + o.options.loadingIcon + "') no-repeat center;height:" + o.nzHeight + "px;width:" + o.nzWidth + 'px;z-index: 2000;position: absolute; background-position: center center;"></div>'
                    )),
                    o.$elem.after(o.spinner)),
                    o.options.onImageSwap(o.$elem),
                    (s.onload = function () {
                        (o.largeWidth = s.width), (o.largeHeight = s.height), (o.zoomImage = i), o.zoomWindow.css({ "background-size": o.largeWidth + "px " + o.largeHeight + "px" }), o.swapAction(e, i);
                    }),
                    (s.src = i);
            },
            swapAction: function (e, i) {
                var o = this,
                    s = new Image();
                if (
                    ((s.onload = function () {
                        (o.nzHeight = s.height), (o.nzWidth = s.width), o.options.onImageSwapComplete(o.$elem), o.doneCallback();
                    }),
                    (s.src = e),
                    (o.currentZoomLevel = o.options.zoomLevel),
                    (o.options.maxZoomLevel = !1),
                    "lens" == o.options.zoomType && o.zoomLens.css({ backgroundImage: "url('" + i + "')" }),
                    "window" == o.options.zoomType && o.zoomWindow.css({ backgroundImage: "url('" + i + "')" }),
                    "inner" == o.options.zoomType && o.zoomWindow.css({ backgroundImage: "url('" + i + "')" }),
                    (o.currentImage = i),
                    o.options.imageCrossfade)
                ) {
                    var n = o.$elem,
                        r = n.clone();
                    if (
                        (o.$elem.attr("src", e),
                        o.$elem.after(r),
                        r.stop(!0).fadeOut(o.options.imageCrossfade, function () {
                            t(this).remove();
                        }),
                        o.$elem.width("auto").removeAttr("width"),
                        o.$elem.height("auto").removeAttr("height"),
                        n.fadeIn(o.options.imageCrossfade),
                        o.options.tint && "inner" != o.options.zoomType)
                    ) {
                        var a = o.zoomTintImage,
                            h = a.clone();
                        o.zoomTintImage.attr("src", i),
                            o.zoomTintImage.after(h),
                            h.stop(!0).fadeOut(o.options.imageCrossfade, function () {
                                t(this).remove();
                            }),
                            a.fadeIn(o.options.imageCrossfade),
                            o.zoomTint.css({ height: o.$elem.height() }),
                            o.zoomTint.css({ width: o.$elem.width() });
                    }
                    o.zoomContainer.css("height", o.$elem.height()),
                        o.zoomContainer.css("width", o.$elem.width()),
                        "inner" == o.options.zoomType &&
                            (o.options.constrainType ||
                                (o.zoomWrap.parent().css("height", o.$elem.height()), o.zoomWrap.parent().css("width", o.$elem.width()), o.zoomWindow.css("height", o.$elem.height()), o.zoomWindow.css("width", o.$elem.width()))),
                        o.options.imageCrossfade && (o.zoomWrap.css("height", o.$elem.height()), o.zoomWrap.css("width", o.$elem.width()));
                } else
                    o.$elem.attr("src", e),
                        o.options.tint && (o.zoomTintImage.attr("src", i), o.zoomTintImage.attr("height", o.$elem.height()), o.zoomTintImage.css({ height: o.$elem.height() }), o.zoomTint.css({ height: o.$elem.height() })),
                        o.zoomContainer.css("height", o.$elem.height()),
                        o.zoomContainer.css("width", o.$elem.width()),
                        o.options.imageCrossfade && (o.zoomWrap.css("height", o.$elem.height()), o.zoomWrap.css("width", o.$elem.width()));
                o.options.constrainType &&
                    ("height" == o.options.constrainType &&
                        (o.zoomContainer.css("height", o.options.constrainSize),
                        o.zoomContainer.css("width", "auto"),
                        o.options.imageCrossfade
                            ? (o.zoomWrap.css("height", o.options.constrainSize), o.zoomWrap.css("width", "auto"), (o.constwidth = o.zoomWrap.width()))
                            : (o.$elem.css("height", o.options.constrainSize), o.$elem.css("width", "auto"), (o.constwidth = o.$elem.width())),
                        "inner" == o.options.zoomType &&
                            (o.zoomWrap.parent().css("height", o.options.constrainSize), o.zoomWrap.parent().css("width", o.constwidth), o.zoomWindow.css("height", o.options.constrainSize), o.zoomWindow.css("width", o.constwidth)),
                        o.options.tint &&
                            (o.tintContainer.css("height", o.options.constrainSize),
                            o.tintContainer.css("width", o.constwidth),
                            o.zoomTint.css("height", o.options.constrainSize),
                            o.zoomTint.css("width", o.constwidth),
                            o.zoomTintImage.css("height", o.options.constrainSize),
                            o.zoomTintImage.css("width", o.constwidth))),
                    "width" == o.options.constrainType &&
                        (o.zoomContainer.css("height", "auto"),
                        o.zoomContainer.css("width", o.options.constrainSize),
                        o.options.imageCrossfade
                            ? (o.zoomWrap.css("height", "auto"), o.zoomWrap.css("width", o.options.constrainSize), (o.constheight = o.zoomWrap.height()))
                            : (o.$elem.css("height", "auto"), o.$elem.css("width", o.options.constrainSize), (o.constheight = o.$elem.height())),
                        "inner" == o.options.zoomType &&
                            (o.zoomWrap.parent().css("height", o.constheight), o.zoomWrap.parent().css("width", o.options.constrainSize), o.zoomWindow.css("height", o.constheight), o.zoomWindow.css("width", o.options.constrainSize)),
                        o.options.tint &&
                            (o.tintContainer.css("height", o.constheight),
                            o.tintContainer.css("width", o.options.constrainSize),
                            o.zoomTint.css("height", o.constheight),
                            o.zoomTint.css("width", o.options.constrainSize),
                            o.zoomTintImage.css("height", o.constheight),
                            o.zoomTintImage.css("width", o.options.constrainSize))));
            },
            doneCallback: function () {
                this.options.loadingIcon && this.spinner.hide(),
                    (this.nzOffset = this.$elem.offset()),
                    (this.nzWidth = this.$elem.width()),
                    (this.nzHeight = this.$elem.height()),
                    (this.currentZoomLevel = this.options.zoomLevel),
                    (this.widthRatio = this.largeWidth / this.nzWidth),
                    (this.heightRatio = this.largeHeight / this.nzHeight),
                    "window" == this.options.zoomType &&
                        (this.nzHeight < this.options.zoomWindowWidth / this.widthRatio ? (lensHeight = this.nzHeight) : (lensHeight = String(this.options.zoomWindowHeight / this.heightRatio)),
                        this.options.zoomWindowWidth < this.options.zoomWindowWidth ? (lensWidth = this.nzWidth) : (lensWidth = this.options.zoomWindowWidth / this.widthRatio),
                        this.zoomLens && (this.zoomLens.css("width", lensWidth), this.zoomLens.css("height", lensHeight)));
            },
            getCurrentImage: function () {
                return this.zoomImage;
            },
            getGalleryList: function () {
                var e = this;
                return (
                    (e.gallerylist = []),
                    e.options.gallery
                        ? t("#" + e.options.gallery + " a").each(function () {
                              var i = "";
                              t(this).data("zoom-image") ? (i = t(this).data("zoom-image")) : t(this).data("image") && (i = t(this).data("image")),
                                  i == e.zoomImage ? e.gallerylist.unshift({ href: "" + i, title: t(this).find("img").attr("title") }) : e.gallerylist.push({ href: "" + i, title: t(this).find("img").attr("title") });
                          })
                        : e.gallerylist.push({ href: "" + e.zoomImage, title: t(this).find("img").attr("title") }),
                    e.gallerylist
                );
            },
            changeZoomLevel: function (t) {
                (this.scrollingLock = !0),
                    (this.newvalue = parseFloat(t).toFixed(2)),
                    (newvalue = parseFloat(t).toFixed(2)),
                    (maxheightnewvalue = this.largeHeight / ((this.options.zoomWindowHeight / this.nzHeight) * this.nzHeight)),
                    (maxwidthtnewvalue = this.largeWidth / ((this.options.zoomWindowWidth / this.nzWidth) * this.nzWidth)),
                    "inner" != this.options.zoomType &&
                        (maxheightnewvalue <= newvalue
                            ? ((this.heightRatio = this.largeHeight / maxheightnewvalue / this.nzHeight), (this.newvalueheight = maxheightnewvalue), (this.fullheight = !0))
                            : ((this.heightRatio = this.largeHeight / newvalue / this.nzHeight), (this.newvalueheight = newvalue), (this.fullheight = !1)),
                        maxwidthtnewvalue <= newvalue
                            ? ((this.widthRatio = this.largeWidth / maxwidthtnewvalue / this.nzWidth), (this.newvaluewidth = maxwidthtnewvalue), (this.fullwidth = !0))
                            : ((this.widthRatio = this.largeWidth / newvalue / this.nzWidth), (this.newvaluewidth = newvalue), (this.fullwidth = !1)),
                        "lens" == this.options.zoomType &&
                            (maxheightnewvalue <= newvalue
                                ? ((this.fullwidth = !0), (this.newvaluewidth = maxheightnewvalue))
                                : ((this.widthRatio = this.largeWidth / newvalue / this.nzWidth), (this.newvaluewidth = newvalue), (this.fullwidth = !1)))),
                    "inner" == this.options.zoomType &&
                        ((maxheightnewvalue = parseFloat(this.largeHeight / this.nzHeight).toFixed(2)),
                        (maxwidthtnewvalue = parseFloat(this.largeWidth / this.nzWidth).toFixed(2)),
                        newvalue > maxheightnewvalue && (newvalue = maxheightnewvalue),
                        newvalue > maxwidthtnewvalue && (newvalue = maxwidthtnewvalue),
                        maxheightnewvalue <= newvalue
                            ? ((this.heightRatio = this.largeHeight / newvalue / this.nzHeight), newvalue > maxheightnewvalue ? (this.newvalueheight = maxheightnewvalue) : (this.newvalueheight = newvalue), (this.fullheight = !0))
                            : ((this.heightRatio = this.largeHeight / newvalue / this.nzHeight), newvalue > maxheightnewvalue ? (this.newvalueheight = maxheightnewvalue) : (this.newvalueheight = newvalue), (this.fullheight = !1)),
                        maxwidthtnewvalue <= newvalue
                            ? ((this.widthRatio = this.largeWidth / newvalue / this.nzWidth), newvalue > maxwidthtnewvalue ? (this.newvaluewidth = maxwidthtnewvalue) : (this.newvaluewidth = newvalue), (this.fullwidth = !0))
                            : ((this.widthRatio = this.largeWidth / newvalue / this.nzWidth), (this.newvaluewidth = newvalue), (this.fullwidth = !1))),
                    (scrcontinue = !1),
                    "inner" == this.options.zoomType &&
                        (this.nzWidth >= this.nzHeight && (this.newvaluewidth <= maxwidthtnewvalue ? (scrcontinue = !0) : ((scrcontinue = !1), (this.fullheight = !0), (this.fullwidth = !0))),
                        this.nzHeight > this.nzWidth && (this.newvaluewidth <= maxwidthtnewvalue ? (scrcontinue = !0) : ((scrcontinue = !1), (this.fullheight = !0), (this.fullwidth = !0)))),
                    "inner" != this.options.zoomType && (scrcontinue = !0),
                    scrcontinue &&
                        ((this.zoomLock = 0),
                        (this.changeZoom = !0),
                        this.options.zoomWindowHeight / this.heightRatio <= this.nzHeight &&
                            ((this.currentZoomLevel = this.newvalueheight),
                            "lens" != this.options.zoomType && "inner" != this.options.zoomType && ((this.changeBgSize = !0), this.zoomLens.css({ height: String(this.options.zoomWindowHeight / this.heightRatio) + "px" })),
                            ("lens" != this.options.zoomType && "inner" != this.options.zoomType) || (this.changeBgSize = !0)),
                        this.options.zoomWindowWidth / this.widthRatio <= this.nzWidth &&
                            ("inner" != this.options.zoomType && this.newvaluewidth > this.newvalueheight && (this.currentZoomLevel = this.newvaluewidth),
                            "lens" != this.options.zoomType && "inner" != this.options.zoomType && ((this.changeBgSize = !0), this.zoomLens.css({ width: String(this.options.zoomWindowWidth / this.widthRatio) + "px" })),
                            ("lens" != this.options.zoomType && "inner" != this.options.zoomType) || (this.changeBgSize = !0)),
                        "inner" == this.options.zoomType &&
                            ((this.changeBgSize = !0), this.nzWidth > this.nzHeight && (this.currentZoomLevel = this.newvaluewidth), this.nzHeight > this.nzWidth && (this.currentZoomLevel = this.newvaluewidth))),
                    this.setPosition(this.currentLoc);
            },
            closeAll: function () {
                self.zoomWindow && self.zoomWindow.hide(), self.zoomLens && self.zoomLens.hide(), self.zoomTint && self.zoomTint.hide();
            },
            changeState: function (t) {
                "enable" == t && (this.options.zoomEnabled = !0), "disable" == t && (this.options.zoomEnabled = !1);
            },
        };
        (t.fn.elevateZoom = function (e) {
            return this.each(function () {
                var i = Object.create(s);
                i.init(e, this), t.data(this, "elevateZoom", i);
            });
        }),
            (t.fn.elevateZoom.options = {
                zoomActivation: "hover",
                zoomEnabled: !0,
                preloading: 1,
                zoomLevel: 1,
                scrollZoom: !1,
                scrollZoomIncrement: 0.1,
                minZoomLevel: !1,
                maxZoomLevel: !1,
                easing: !1,
                easingAmount: 12,
                lensSize: 200,
                zoomWindowWidth: 400,
                zoomWindowHeight: 400,
                zoomWindowOffetx: 0,
                zoomWindowOffety: 0,
                zoomWindowPosition: 1,
                zoomWindowBgColour: "#fff",
                lensFadeIn: !1,
                lensFadeOut: !1,
                debug: !1,
                zoomWindowFadeIn: !1,
                zoomWindowFadeOut: !1,
                zoomWindowAlwaysShow: !1,
                zoomTintFadeIn: !1,
                zoomTintFadeOut: !1,
                borderSize: 4,
                showLens: !0,
                borderColour: "#888",
                lensBorderSize: 1,
                lensBorderColour: "#000",
                lensShape: "square",
                zoomType: "window",
                containLensZoom: !1,
                lensColour: "white",
                lensOpacity: 0.4,
                lenszoom: !1,
                tint: !1,
                tintColour: "#333",
                tintOpacity: 0.4,
                gallery: !1,
                galleryActiveClass: "zoomGalleryActive",
                imageCrossfade: !1,
                constrainType: !1,
                constrainSize: !1,
                loadingIcon: !1,
                cursor: "default",
                responsive: !0,
                onComplete: t.noop,
                onDestroy: function () {},
                onZoomedImageLoaded: function () {},
                onImageSwap: t.noop,
                onImageSwapComplete: t.noop,
            });
    })(jQuery, window, document),
    function (t, e) {
        (e.fn.themePin = function (t) {
            var i = 0,
                o = 0,
                s = [],
                n = !1,
                r = e(window),
                a = [],
                h = [];
            t = t || {};
            var l = function () {
                    for (var i = 0, o = s.length; i < o; i++) {
                        var a = s[i];
                        if (t.minWidth && r.width() <= t.minWidth)
                            a.parent().is(".pin-wrapper") && a.unwrap(),
                                a.css({ width: "", left: "", top: "", position: "" }),
                                t.activeClass && a.removeClass(t.activeClass),
                                a.removeClass("sticky-transition"),
                                a.removeClass("sticky-absolute"),
                                (n = !0);
                        else {
                            n = !1;
                            var h = t.containerSelector ? (a.closest(t.containerSelector).length ? a.closest(t.containerSelector) : e(t.containerSelector)) : e(document.body),
                                l = a.offset(),
                                p = h.offset();
                            if (void 0 !== p) {
                                var c = a.parent().offset();
                                a.parent().is(".pin-wrapper") || a.wrap("<div class='pin-wrapper'>");
                                var d = e.extend({ top: 0, bottom: 0 }, t.padding || {}),
                                    u = parseInt(a.parent().parent().css("padding-top")),
                                    m = parseInt(a.parent().parent().css("padding-bottom"));
                                t.autoInit &&
                                    (e("#header").hasClass("header-side") ? ((d.top = 0), e(".page-top.fixed-pos").length && (d.top += e(".page-top.fixed-pos").height())) : (d.top = 0),
                                    void 0 !== t.paddingOffsetTop ? (d.top += parseInt(t.paddingOffsetTop, 10)) : (d.top += 0),
                                    void 0 !== t.paddingOffsetBottom ? (d.bottom = parseInt(t.paddingOffsetBottom, 10)) : (d.bottom = 0));
                                var f = a.css("border-bottom"),
                                    g = a.outerHeight();
                                a.css("border-bottom", "1px solid transparent");
                                var w = a.outerHeight() - g - 1;
                                a.css("border-bottom", f),
                                    a.css({ width: a.outerWidth() <= a.parent().width() ? a.outerWidth() : a.parent().width() }),
                                    a.parent().css("height", a.outerHeight() + w),
                                    (!t.autoFit && !t.fitToBottom) || a.outerHeight() <= r.height()
                                        ? a.data("themePin", { pad: d, from: (t.containerSelector ? p.top : l.top) - d.top + u, pb: m, parentTop: c.top - u, offset: w })
                                        : a.data("themePin", {
                                              pad: d,
                                              fromFitTop: (t.containerSelector ? p.top : l.top) - d.top + u,
                                              from: (t.containerSelector ? p.top : l.top) + a.outerHeight() - e(window).height() + u,
                                              pb: m,
                                              parentTop: c.top - u,
                                              offset: w,
                                          });
                            }
                        }
                    }
                },
                p = function () {
                    if (!n) {
                        i = r.scrollTop();
                        for (var l = window.innerHeight || r.height(), p = 0, c = s.length; p < c; p++) {
                            var d,
                                u = e(s[p]),
                                m = u.data("themePin"),
                                f = m.to;
                            if (m) {
                                var g = t.containerSelector ? (u.closest(t.containerSelector).length ? u.closest(t.containerSelector) : e(t.containerSelector)) : e(document.body),
                                    w = u.outerHeight() + m.pad.top <= l;
                                if (
                                    ((m.end = g.offset().top + g.height()),
                                    w ? (m.to = g.offset().top + g.height() - u.outerHeight() - m.pad.bottom - m.pb) : ((m.to = g.offset().top + g.height() - l - m.pb), (m.to2 = g.height() - u.outerHeight() - m.pad.bottom - m.pb)),
                                    w)
                                ) {
                                    var v = m.from - m.pad.bottom,
                                        y = m.to - m.pad.top - m.offset;
                                    if ((void 0 !== m.fromFitTop && m.fromFitTop && (v = m.fromFitTop - m.pad.bottom), v + u.outerHeight() > m.end || v >= y)) {
                                        u.css({ position: "", top: "", left: "" }), t.activeClass && u.removeClass(t.activeClass), u.removeClass("sticky-transition"), u.removeClass("sticky-absolute");
                                        continue;
                                    }
                                    i > v && i < y
                                        ? (!("fixed" == u.css("position")) && u.css({ left: u.offset().left, top: m.pad.top }).css("position", "fixed"),
                                          t.activeClass && u.addClass(t.activeClass),
                                          u.removeClass("sticky-transition"),
                                          u.removeClass("sticky-absolute"))
                                        : i >= y
                                        ? (u.css({ left: "", top: y - m.parentTop + m.pad.top }).css("position", "absolute"),
                                          t.activeClass && u.addClass(t.activeClass),
                                          u.hasClass("sticky-absolute") && u.addClass("sticky-transition"),
                                          u.addClass("sticky-absolute"))
                                        : (u.css({ position: "", top: "", left: "" }), t.activeClass && u.removeClass(t.activeClass), u.removeClass("sticky-transition"), u.removeClass("sticky-absolute"));
                                } else if ((f != m.to && (a[p] = h[p] = !1), u.height() + m.pad.top + m.pad.bottom > l || a[p] || h[p])) {
                                    var z = parseInt(u.parent().parent().css("padding-top"));
                                    i + m.pad.top - z <= m.parentTop
                                        ? (u.css({ position: "", top: "", bottom: "", left: "" }), (a[p] = h[p] = !1))
                                        : i >= m.to
                                        ? (u.css({ left: "", top: m.to2, bottom: "" }).css("position", "absolute"),
                                          t.activeClass && u.addClass(t.activeClass),
                                          u.hasClass("sticky-absolute") && u.addClass("sticky-transition"),
                                          u.addClass("sticky-absolute"))
                                        : i >= o
                                        ? a[p]
                                            ? ((a[p] = !1),
                                              (d = u.offset().top - m.parentTop),
                                              u.css({ left: "", top: d, bottom: "" }).css("position", "absolute"),
                                              t.activeClass && u.addClass(t.activeClass),
                                              u.hasClass("sticky-absolute") && u.addClass("sticky-transition"),
                                              u.addClass("sticky-absolute"))
                                            : !h[p] &&
                                              u.height() + u.offset().top + m.pad.bottom < i + l &&
                                              ((h[p] = !0),
                                              !("fixed" == u.css("position")) && u.css({ left: u.offset().left, bottom: m.pad.bottom, top: "" }).css("position", "fixed"),
                                              t.activeClass && u.addClass(t.activeClass),
                                              u.removeClass("sticky-transition"),
                                              u.removeClass("sticky-absolute"))
                                        : i < o &&
                                          (h[p]
                                              ? ((h[p] = !1),
                                                (d = u.offset().top - m.parentTop),
                                                u.css({ left: "", top: d, bottom: "" }).css("position", "absolute"),
                                                t.activeClass && u.addClass(t.activeClass),
                                                u.hasClass("sticky-absolute") && u.addClass("sticky-transition"),
                                                u.addClass("sticky-absolute"))
                                              : !a[p] &&
                                                u.offset().top >= i + m.pad.top &&
                                                ((a[p] = !0),
                                                !("fixed" == u.css("position")) && u.css({ left: u.offset().left, top: m.pad.top, bottom: "" }).css("position", "fixed"),
                                                t.activeClass && u.addClass(t.activeClass),
                                                u.removeClass("sticky-transition"),
                                                u.removeClass("sticky-absolute")));
                                } else i >= m.parentTop - m.pad.top ? u.css({ position: "fixed", top: m.pad.top }) : u.css({ position: "", top: "", bottom: "", left: "" }), (a[p] = h[p] = !1);
                            }
                        }
                        o = i;
                    }
                },
                c = function () {
                    l(), p();
                };
            return (
                this.each(function () {
                    var t = e(this),
                        i = e(this).data("themePin") || {};
                    (i && i.update) || (s.push(t), e("img", this).one("load", l), (i.update = c), e(this).data("themePin", i), a.push(!1), h.push(!1));
                }),
                e(window).on("smartresize", function () {
                    l(), p();
                }),
                e(window).on("touchmove scroll", p),
                l(),
                e(this).bind("recalc.pin", function () {
                    l(), p();
                }),
                this
            );
        }),
            (t = t || {});
        var i = function (t, e) {
            return this.initialize(t, e);
        };
        (i.defaults = { autoInit: !1, minWidth: 767, activeClass: "sticky-active", padding: { top: 0, bottom: 0 }, offsetTop: 0, offsetBottom: 0, autoFit: !1, fitToBottom: !1 }),
            (i.prototype = {
                initialize: function (t, e) {
                    return t.data("__sticky") ? this : ((this.$el = t), this.setData().setOptions(e).build(), this);
                },
                setData: function () {
                    return this.$el.data("__sticky", this), this;
                },
                setOptions: function (t) {
                    return (this.options = e.extend(!0, {}, i.defaults, t, { wrapper: this.$el })), this;
                },
                build: function () {
                    if (!e.isFunction(e.fn.themePin)) return this;
                    var t = this.options.wrapper;
                    return (
                        t.themePin(this.options),
                        e(window).on("resize", function () {
                            setTimeout(function () {
                                t.trigger("recalc.pin");
                            }, 800);
                            var e = t.parent();
                            t.outerWidth(e.width()), "fixed" == t.css("position") && t.css("left", e.offset().left);
                        }),
                        this
                    );
                },
            }),
            e.extend(t, { Sticky: i }),
            (e.fn.themeSticky = function (i) {
                return this.map(function () {
                    var o = e(this);
                    return o.data("__sticky")
                        ? (o.trigger("recalc.pin"),
                          setTimeout(function () {
                              o.trigger("recalc.pin");
                          }, 800),
                          o.data("__sticky"))
                        : new t.Sticky(o, i);
                });
            });
    }.apply(this, [window.theme, jQuery]);




!(function (e) {
         "use strict";
         var o = {
                  initialised: !1,
                  mobile: !1,
                  init: function () {
				   this.initialised ||
							((this.initialised = !0),
							this.checkMobile(),
							this.stickyHeader(),
							this.PixaAccordion_Nav(),
							this.headerSearchToggle(),
							this.mMenuIcons(),
							this.mMenuToggle(),
							this.mobileMenu(),
							e.fn.superfish && this.menuInit(),
							e.fn.owlCarousel && this.owlCarousels(),
							e.fn.themeSticky && this.stickySidebar());
                  },
                  checkMobile: function () {
                     /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? (this.mobile = !0) : (this.mobile = !1);
                  },
				  
                  menuInit: function () {
                     e(".MenuPixa_Horizontal").superfish({ popUpSelector: "ul, .megaMenu_PiBlock", hoverClass: "show", delay: 0, speed: 80, speedOut: 80, autoArrows: !0 });
                  },
				  
                  stickyHeader: function () {
					   if (e(".sticky_headerPixaOne").length) {
							new Waypoint.Sticky({ element: e(".sticky_headerPixaOne")[0], stuckClass: "fixed", offset: -10 });
							if (!e(".header_block_bottom").find(".BrandLogo_Block, .cartProductList_Dropdown").length) {
									 var o = e(".header_block_bottom").find(".container");
									 e(".header_panel").find(".BrandLogo_Block, .cartProductList_Dropdown").clone(!0).prependTo(o);
							}
					   }
					   e("PixaMain_nav")
							.find(".sticky_headerPixaOne")
							.each(function () {
									 new Waypoint.Sticky({ element: e(this), stuckClass: "fixed-nav" });
							});
                  },
                  headerSearchToggle: function () {
                           e(".search-toggle").on("click", function (o) {
                                e(".header_block_search_wrapper").toggleClass("show"), o.preventDefault();
                           }),
								e("body").on("click", function (o) {
										 e(".header_block_search_wrapper").hasClass("show") && (e(".header_block_search_wrapper").removeClass("show"), e("body").removeClass("is-search-active"));
								}),
								e(".header_block_search").on("click", function (e) {
										 e.stopPropagation();
								});
                  },
				  
                  mMenuToggle: function () {
                           e(".mobile-menu-toggler").on("click", function (o) {
                                e("body").toggleClass("mmenu-active"), e(this).toggleClass("active"), o.preventDefault();
                           }),
								e(".mobile-menu-overlay, .mobile-menu-close").on("click", function (o) {
										 e("body").removeClass("mmenu-active"), e(".menu-toggler").removeClass("active"), o.preventDefault();
								});
                  },
				  
                  mMenuIcons: function () {
                           e(".mobile_MenuExtranal")
								.find("li")
								.each(function () {
										var o = e(this);
										o.find("ul").length && e("<span/>", { class: "mobileNav_DropdownBtn" }).appendTo(o.children("a"));
								});
                  },
				  
                  mobileMenu: function () {
                            e(".mobileNav_DropdownBtn").on("click", function (o) {
                                var t = e(this).closest("li"),
									n = t.find("ul").eq(0),
									i = t.siblings(".open");
									i
									.find("ul")
									.eq(0)
									.slideUp(300, function () {
											  i.removeClass("open");
									}),
									t.hasClass("open")
										? n.slideUp(300, function () {
										t.removeClass("open");
									})
									: n.slideDown(300, function () {
										t.addClass("open");
									}),
									
									o.stopPropagation(),
									o.preventDefault();
                            });
                  },
				  
				  PixaAccordion_Nav: function () {
					e(".PixaAccordion_Nav")
						.on("shown.bs.collapse", function (o) {
							var t = e(o.target).closest("li");
							t.hasClass("open") || t.addClass("open");
						})
						.on("hidden.bs.collapse", function (o) {
							var t = e(o.target).closest("li");
							t.hasClass("open") && t.removeClass("open");
						});
				},
				  
				  stickySidebar: function () {
					e(".sidebar-wrapper, .sticky-slider").themeSticky({ autoInit: !0, minWidth: 991, containerSelector: ".row, .container", autoFit: !0, paddingOffsetBottom: 10, paddingOffsetTop: 60 });
				},
				
				
				owlCarousels: function () {
					var o = {
							loop: !0,
							margin: 0,
							responsiveClass: !0,
							nav: !1,
							navText: ['<i class="fa fa-chevron-left"></i>', '<i class="fa fa-chevron-right"></i>'],
							dots:true,
							autoplay: !0,
							autoplayTimeout: 10e3,
							items: 1
						},
						t = e(".OwlHomeSlider");
						t.owlCarousel(e.extend(!0, {}, o, {
							lazyLoad: !0,
							autoplayHoverPause:true,
							autoplayTimeout: 1e4,
							animateOut: "fadeOut",
							nav:true,
							dots: false,
							items:1
						})),
						t = e(".OwlHomeSlider_Full");
						t.owlCarousel(e.extend(!0, {}, o, {
							lazyLoad: !0,
							nav: true,
							dots:false,
							autoplayHoverPause:true,
							autoplayTimeout: 1e4,
							animateOut: "fadeOut"
						})),
                        t = e(".OwlCarousel_SingleItem");
                        t.owlCarousel(e.extend(!0, {}, o, {
                            lazyLoad: !0,
                            nav: true,
                            dots:false,
                            autoplayHoverPause:true,
                            autoplayTimeout: 1e4,
                            animateOut: "fadeOut"
                        })),
                        t = e(".OwlCarousel_RightInfinite");
                        t.owlCarousel(e.extend(!0, {}, o, {
                            lazyLoad: !0,
                            nav: true,
                            dots:false,
                            autoplayHoverPause:true,
                            autoplayTimeout: 1e4,
                            animateOut: "fadeOut",
                            loop: !1,
                            margin:10,
                            autoplay: true,
                            responsive: {
                                0: {
                                    items: 1
                                },
                                480: {
                                    items: 2
                                },
                                768: {
                                    items: 3
                                },
                                992: {
                                    items: 3
                                },
                                1200: {
                                    items: 4
                                }
                            }
                        })),
                        t = e(".OwlCarousel_FullWidth");
                        t.owlCarousel(e.extend(!0, {}, o, {
                            lazyLoad: !0,
                            nav: true,
                            dots:false,
                            autoplayHoverPause:true,
                            autoplayTimeout: 1e4,
                            animateOut: "fadeOut",
                            loop: !1,
                            margin:10,
                            autoplay: true,
                            responsive: {
                                0: {
                                    items: 1
                                },
                                480: {
                                    items: 2
                                },
                                768: {
                                    items: 3
                                },
                                992: {
                                    items: 3
                                },
                                1200: {
                                    items: 4
                                }
                            }
                        })),
						t.on("loaded.owl.lazy", function(o) {
						e(o.element).closest(".Owl_SlideShow").addClass("loaded")
							
					}), e(".featured-products").owlCarousel(e.extend(!0, {}, o, {
						loop: !1,
						margin:10,
						autoplay: !1,
						responsive: {
							0: {
								items: 1
							},
							480: {
								items: 2
							},
							768: {
								items: 3
							},
							992: {
								items: 3
							},
							1200: {
								items: 4
							}
						}
					})),
					
					e(".new-products").owlCarousel(e.extend(!0, {}, o, {
						margin: 30,
						dots:false,
						autoplay: !1,
						responsive: {
							0: {
								items: 1
							},
							480: {
								items: 2
							},
							768: {
								items: 3
							},
							992: {
								items: 4
							},
							1200: {
								items: 5
							}
						}
					})), e(".hot-deals-products").owlCarousel(e.extend(!0, {}, o, {
						margin: 30,
						autoplay: !1,
						responsive: {
							0: {
								items: 2
							},
							480: {
								items: 2
							},
							768: {
								items: 3
							},
							992: {
								items: 4
							},
							1200: {
								items: 5
							}
						}
					})), e(".partners-carousel").owlCarousel(e.extend(!0, {}, o, {
						margin: 20,
						nav: !0,
						dots: !1,
						autoHeight: !0,
						autoplay: !1,
						responsive: {
							0: {
								items: 1,
								margin: 0
							},
							480: {
								items: 2
							},
							768: {
								items: 3
							},
							992: {
								items: 4
							},
							1200: {
								items: 5
							}
						}
					})), e(".blog-carousel").owlCarousel(e.extend(!0, {}, o, {
						loop: !1,
						margin: 30,
						navText: ['<i class="icon-angle-left">', '<i class="icon-angle-right">'],
						dots: !1,
						autoHeight: !0,
						autoplay: !1,
						responsive: {
							0: {
								items: 1,
								margin: 0
							},
							480: {
								items: 2
							},
							768: {
								items: 3
							},
							992: {
								items: 3
							},
							1200: {
								items: 4
							}
						}
					})), e(".widget-featured-products").owlCarousel(e.extend(!0, {}, o, {
						nav: !0,
						navText: ['<i class="icon-angle-left">', '<i class="icon-angle-right">'],
						dots: !1,
						autoHeight: !0
					})), e(".testimonials-carousel").owlCarousel(e.extend(!0, {}, o, {
						navText: ['<i class="icon-angle-left">', '<i class="icon-angle-right">'],
						autoHeight: !0,
						responsive: {
							0: {
								items: 1
							},
							992: {
								items: 2
							}
						}
					})), e(".entry-slider").each(function() {
						e(this).owlCarousel(e.extend(!0, {}, o, {
							margin: 2
						}))
					}), e(".related-posts-carousel").owlCarousel(e.extend(!0, {}, o, {
						loop: !1,
						margin: 30,
						autoplay: !1,
						responsive: {
							0: {
								items: 1
							},
							480: {
								items: 2
							},
							1200: {
								items: 3
							}
						}
					})), e(".boxed-slider").owlCarousel(e.extend(!0, {}, o, {
						animateOut: "fadeOut",
						lazyLoad: !0
					})), e(".boxed-slider").on("loaded.owl.lazy", function(o) {
						e(o.element).closest(".category-slide").addClass("loaded")
					}), e(".product-single-default .product-single-carousel").owlCarousel(e.extend(!0, {}, o, {
						nav: !0,
						navText: ['<i class="icon-angle-left">', '<i class="icon-angle-right">'],
						dotsContainer: "#carousel-custom-dots",
						autoplay: !1,
						onInitialized: function() {
							var o = this.$element;
							e.fn.elevateZoom && o.find("img").each(function() {
								var o = e(this),
									t = {
										responsive: !0,
										zoomWindowFadeIn: 350,
										zoomWindowFadeOut: 200,
										borderSize: 0,
										zoomContainer: o.parent(),
										zoomType: "inner",
										cursor: "grab"
									};
								o.elevateZoom(t)
							})
						},
						onRefreshed: function() {
							var o = this.$element;
							e.fn.elevateZoom && o.find("img").each(function() {
								var o = e(this).data("elevateZoom");
								o && o.startZoom()
							})
						}
					})), e(".product-single-extended .product-single-carousel").owlCarousel(e.extend(!0, {}, o, {
						dots: !1,
						autoplay: !1,
						responsive: {
							0: {
								items: 1
							},
							480: {
								items: 2
							},
							1200: {
								items: 3
							}
						}
					})), e("#carousel-custom-dots .owl-dot").click(function() {
						e(".product-single-carousel").trigger("to.owl.carousel", [e(this).index(), 300])
					})
				},
				  
				  
         };
		 
		 

		
		//e("body").prepend('<div class="loading-overlay"><div class="bounce-loader"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div></div>');
		
		//var t = e(".loadmore .btn");
		jQuery(document).ready(function () {
			o.init();
		});
       /* e(window).on("load", function () {
            e("body").addClass("loaded"), o.scrollBtnAppear();
        }),
        e(window).on("scroll", function () {
            o.scrollBtnAppear();
        });
		*/
	  
})(jQuery);
