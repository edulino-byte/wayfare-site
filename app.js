/* ===== tweaks-panel.jsx ===== */
const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;box-sizing:border-box;min-width:0;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === "object" && keyOrEdits !== null ? keyOrEdits : { [keyOrEdits]: val };
    setValues((prev) => ({ ...prev, ...edits }));
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits }, "*");
    window.dispatchEvent(new CustomEvent("tweakchange", { detail: edits }));
  }, []);
  return [values, setTweak];
}
function TweaksPanel({ title = "Tweaks", children }) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({ x: 16, y: 16 });
  const PAD = 16;
  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth, h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + "px";
    panel.style.bottom = offsetRef.current.y + "px";
  }, []);
  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", clampToViewport);
      return () => window.removeEventListener("resize", clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);
  React.useEffect(() => {
    const onMsg = (e) => {
      const t = e?.data?.type;
      if (t === "__activate_edit_mode") setOpen(true);
      else if (t === "__deactivate_edit_mode") setOpen(false);
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);
  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({ type: "__edit_mode_dismissed" }, "*");
  };
  const onDragStart = (e) => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = (ev) => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };
  if (!open) return null;
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("style", null, __TWEAKS_STYLE), /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: dragRef,
      className: "twk-panel",
      "data-omelette-chrome": "",
      style: { right: offsetRef.current.x, bottom: offsetRef.current.y }
    },
    /* @__PURE__ */ React.createElement("div", { className: "twk-hd", onMouseDown: onDragStart }, /* @__PURE__ */ React.createElement("b", null, title), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "twk-x",
        "aria-label": "Close tweaks",
        onMouseDown: (e) => e.stopPropagation(),
        onClick: dismiss
      },
      "\u2715"
    )),
    /* @__PURE__ */ React.createElement("div", { className: "twk-body" }, children)
  ));
}
function TweakSection({ label, children }) {
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "twk-sect" }, label), children);
}
function TweakRow({ label, value, children, inline = false }) {
  return /* @__PURE__ */ React.createElement("div", { className: inline ? "twk-row twk-row-h" : "twk-row" }, /* @__PURE__ */ React.createElement("div", { className: "twk-lbl" }, /* @__PURE__ */ React.createElement("span", null, label), value != null && /* @__PURE__ */ React.createElement("span", { className: "twk-val" }, value)), children);
}
function TweakSlider({ label, value, min = 0, max = 100, step = 1, unit = "", onChange }) {
  return /* @__PURE__ */ React.createElement(TweakRow, { label, value: `${value}${unit}` }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "range",
      className: "twk-slider",
      min,
      max,
      step,
      value,
      onChange: (e) => onChange(Number(e.target.value))
    }
  ));
}
function TweakToggle({ label, value, onChange }) {
  return /* @__PURE__ */ React.createElement("div", { className: "twk-row twk-row-h" }, /* @__PURE__ */ React.createElement("div", { className: "twk-lbl" }, /* @__PURE__ */ React.createElement("span", null, label)), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "twk-toggle",
      "data-on": value ? "1" : "0",
      role: "switch",
      "aria-checked": !!value,
      onClick: () => onChange(!value)
    },
    /* @__PURE__ */ React.createElement("i", null)
  ));
}
function TweakRadio({ label, value, options, onChange }) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const valueRef = React.useRef(value);
  valueRef.current = value;
  const labelLen = (o) => String(typeof o === "object" ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({ 2: 16, 3: 10 }[options.length] ?? 0);
  if (!fitsAsSegments) {
    const resolve = (s) => {
      const m = options.find((o) => String(typeof o === "object" ? o.value : o) === s);
      return m === void 0 ? s : typeof m === "object" ? m.value : m;
    };
    return /* @__PURE__ */ React.createElement(
      TweakSelect,
      {
        label,
        value,
        options,
        onChange: (s) => onChange(resolve(s))
      }
    );
  }
  const opts = options.map((o) => typeof o === "object" ? o : { value: o, label: o });
  const idx = Math.max(0, opts.findIndex((o) => o.value === value));
  const n = opts.length;
  const segAt = (clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = (e) => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = (ev) => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  return /* @__PURE__ */ React.createElement(TweakRow, { label }, /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: trackRef,
      role: "radiogroup",
      onPointerDown,
      className: dragging ? "twk-seg dragging" : "twk-seg"
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "twk-seg-thumb",
        style: {
          left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
          width: `calc((100% - 4px) / ${n})`
        }
      }
    ),
    opts.map((o) => /* @__PURE__ */ React.createElement("button", { key: o.value, type: "button", role: "radio", "aria-checked": o.value === value }, o.label))
  ));
}
function TweakSelect({ label, value, options, onChange }) {
  return /* @__PURE__ */ React.createElement(TweakRow, { label }, /* @__PURE__ */ React.createElement("select", { className: "twk-field", value, onChange: (e) => onChange(e.target.value) }, options.map((o) => {
    const v = typeof o === "object" ? o.value : o;
    const l = typeof o === "object" ? o.label : o;
    return /* @__PURE__ */ React.createElement("option", { key: v, value: v }, l);
  })));
}
function TweakText({ label, value, placeholder, onChange }) {
  return /* @__PURE__ */ React.createElement(TweakRow, { label }, /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "twk-field",
      type: "text",
      value,
      placeholder,
      onChange: (e) => onChange(e.target.value)
    }
  ));
}
function TweakNumber({ label, value, min, max, step = 1, unit = "", onChange }) {
  const clamp = (n) => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({ x: 0, val: 0 });
  const onScrubStart = (e) => {
    e.preventDefault();
    startRef.current = { x: e.clientX, val: value };
    const decimals = (String(step).split(".")[1] || "").length;
    const move = (ev) => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  return /* @__PURE__ */ React.createElement("div", { className: "twk-num" }, /* @__PURE__ */ React.createElement("span", { className: "twk-num-lbl", onPointerDown: onScrubStart }, label), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      value,
      min,
      max,
      step,
      onChange: (e) => onChange(clamp(Number(e.target.value)))
    }
  ), unit && /* @__PURE__ */ React.createElement("span", { className: "twk-num-unit" }, unit));
}
function __twkIsLight(hex) {
  const h = String(hex).replace("#", "");
  const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h.padEnd(6, "0");
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148e3;
}
const __TwkCheck = ({ light }) => /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 14 14", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(
  "path",
  {
    d: "M3 7.2 5.8 10 11 4.2",
    fill: "none",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    stroke: light ? "rgba(0,0,0,.78)" : "#fff"
  }
));
function TweakColor({ label, value, options, onChange }) {
  if (!options || !options.length) {
    return /* @__PURE__ */ React.createElement("div", { className: "twk-row twk-row-h" }, /* @__PURE__ */ React.createElement("div", { className: "twk-lbl" }, /* @__PURE__ */ React.createElement("span", null, label)), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "color",
        className: "twk-swatch",
        value,
        onChange: (e) => onChange(e.target.value)
      }
    ));
  }
  const key = (o) => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return /* @__PURE__ */ React.createElement(TweakRow, { label }, /* @__PURE__ */ React.createElement("div", { className: "twk-chips", role: "radiogroup" }, options.map((o, i) => {
    const colors = Array.isArray(o) ? o : [o];
    const [hero, ...rest] = colors;
    const sup = rest.slice(0, 4);
    const on = key(o) === cur;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: i,
        type: "button",
        className: "twk-chip",
        role: "radio",
        "aria-checked": on,
        "data-on": on ? "1" : "0",
        "aria-label": colors.join(", "),
        title: colors.join(" \xB7 "),
        style: { background: hero },
        onClick: () => onChange(o)
      },
      sup.length > 0 && /* @__PURE__ */ React.createElement("span", null, sup.map((c, j) => /* @__PURE__ */ React.createElement("i", { key: j, style: { background: c } }))),
      on && /* @__PURE__ */ React.createElement(__TwkCheck, { light: __twkIsLight(hero) })
    );
  })));
}
function TweakButton({ label, onClick, secondary = false }) {
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: secondary ? "twk-btn secondary" : "twk-btn",
      onClick
    },
    label
  );
}
Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  TweakText,
  TweakNumber,
  TweakColor,
  TweakButton
});

/* ===== ui/helpers.jsx ===== */
function isoToFlag(iso) {
  if (!iso || iso.length !== 2 || /[^A-Z]/i.test(iso)) return "\u{1F3F3}\uFE0F";
  const A = 127462;
  return String.fromCodePoint(
    A + iso.toUpperCase().charCodeAt(0) - 65,
    A + iso.toUpperCase().charCodeAt(1) - 65
  );
}
const fmt = {
  money: (n) => "$" + Math.round(n).toLocaleString("en-US"),
  int: (n) => Math.round(n).toLocaleString("en-US")
};
let _idField = 0;
function Field({ label, hint, full, children }) {
  const id = React.useMemo(function() {
    return "wf-f" + ++_idField;
  }, []);
  const labelId = id + "-l";
  const hijo = !React.isValidElement(children) ? children : typeof children.type === "function" ? React.cloneElement(children, { controlId: id, labelId }) : React.cloneElement(children, {
    role: children.props.role || "group",
    "aria-labelledby": labelId
  });
  const esControl = React.isValidElement(children) && typeof children.type === "function" && children.type.aceptaControlId === true;
  return /* @__PURE__ */ React.createElement("div", { className: "field" + (full ? " full" : "") }, /* @__PURE__ */ React.createElement("label", { id: labelId, htmlFor: esControl ? id : void 0 }, label), hijo, hint ? /* @__PURE__ */ React.createElement("span", { className: "hint" }, hint) : null);
}
function SelectControl({ value, onChange, options, controlId }) {
  return /* @__PURE__ */ React.createElement("div", { className: "control has-caret" }, /* @__PURE__ */ React.createElement("select", { id: controlId, value, onChange: (e) => onChange(e.target.value) }, options.map((o) => /* @__PURE__ */ React.createElement("option", { key: o.value, value: o.value }, o.label))));
}
SelectControl.aceptaControlId = true;
function TextControl({ value, onChange, type, placeholder, prefix, controlId }) {
  return /* @__PURE__ */ React.createElement("div", { className: "control" + (prefix ? " with-prefix" : "") }, prefix ? /* @__PURE__ */ React.createElement("span", { className: "prefix" }, prefix) : null, /* @__PURE__ */ React.createElement(
    "input",
    {
      id: controlId,
      type: type || "text",
      value,
      placeholder: placeholder || "",
      onChange: (e) => onChange(e.target.value)
    }
  ));
}
TextControl.aceptaControlId = true;
function Segmented({ value, onChange, options, labelId }) {
  return /* @__PURE__ */ React.createElement("div", { className: "seg", role: labelId ? "group" : void 0, "aria-labelledby": labelId }, options.map((o) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: o.value,
      type: "button",
      className: value === o.value ? "active" : "",
      onClick: () => onChange(o.value)
    },
    o.label
  )));
}
function Slider({ value, onChange, min, max, step, format, controlId }) {
  return /* @__PURE__ */ React.createElement("div", { className: "range-row" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      id: controlId,
      type: "range",
      min,
      max,
      step: step || 1,
      value,
      onChange: (e) => onChange(Number(e.target.value))
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "range-val" }, format ? format(value) : value));
}
Slider.aceptaControlId = true;
function Chips({ selected, onToggle, options, labelId }) {
  const set = new Set(selected);
  return /* @__PURE__ */ React.createElement("div", { className: "chips", role: labelId ? "group" : void 0, "aria-labelledby": labelId }, options.map((o) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: o.value,
      type: "button",
      className: "chip" + (set.has(o.value) ? " on" : ""),
      onClick: () => onToggle(o.value)
    },
    o.flag ? /* @__PURE__ */ React.createElement("span", { className: "flag" }, o.flag) : null,
    o.vt ? /* @__PURE__ */ React.createElement("span", { className: "vt" }, o.vt) : null,
    o.label
  )));
}
const WAYFARE_PERF = (() => {
  let lite = false;
  try {
    lite = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    if (/[?&]lite=1/.test(window.location.search)) lite = true;
    if (/[?&]lite=0/.test(window.location.search)) lite = false;
  } catch (e) {
  }
  return {
    lite,
    globeConfig: lite ? { rendererConfig: { antialias: false, powerPreference: "low-power" } } : void 0,
    /* ── v1.179.0 · EL TOPE DE RESOLUCIÓN AHORA VALE TAMBIÉN EN ORDENADOR ──
           Hasta aquí este método salía por la puerta si NO estabas en modo ligero,
           o sea: en ordenador el globo dibujaba a resolución nativa. Medido en una
           ventana de 1440x900 con pantalla Retina, eso era un lienzo de 2880x1800
           — 5,18 MILLONES de píxeles sombreados en cada fotograma. Y el ordenador
           es justo donde las ventanas son más grandes, así que era el sitio donde
           más se notaba y el único sin tope.
    
           POR QUÉ NO SACRIFICA CALIDAD, que es la condición del encargo:
           · El tope solo afecta al LIENZO DEL GLOBO. Los textos, los bordes y toda
             la interfaz son HTML y siguen dibujándose a la resolución nativa: no
             pierden un ápice de nitidez.
           · Lo que hay dentro del lienzo es una FOTOGRAFÍA de la Tierra. En
             imágenes orgánicas la diferencia entre 1,5x y 2x no la ve el ojo; donde
             se nota un tope de resolución es en el texto y en las líneas rectas de
             un píxel, y aquí no hay ninguna de las dos cosas.
           · 1,5x es exactamente el tope que este mismo proyecto lleva usando en
             móviles desde v1.44.0 sin una sola queja.
    
           EL GLOBO DEL CUESTIONARIO SE QUEDA EN 1,5x, NO EN 1x. Escribí primero 1x
           dando por hecho que iba desenfocado detrás del formulario; una captura
           demostró que no: se ve grande y nítido, ocupando la pantalla entera. A 1x
           en una pantalla Retina las costas se habrían ablandado y eso ya no es
           «sin sacrificar calidad». El 1x se mantiene solo en modo ligero, que es
           como estaba desde v1.44.0 y lleva un año sin quejas. */
    topeRatio(esFondo) {
      return esFondo && this.lite ? 1 : 1.5;
    },
    tune(world, esFondo) {
      try {
        world.renderer().setPixelRatio(
          Math.min(window.devicePixelRatio || 1, this.topeRatio(esFondo))
        );
      } catch (e) {
      }
    }
  };
})();
function wfTrack(path) {
  try {
    if (wfTrack._sent[path]) return;
    wfTrack._sent[path] = true;
    let intentos = 0;
    (function enviar() {
      if (window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({ path, event: true });
      } else if (intentos++ < 20) {
        setTimeout(enviar, 500);
      }
    })();
  } catch (e) {
  }
}
wfTrack._sent = {};
function destroyGlobe(world, host) {
  try {
    if (world && typeof world._destructor === "function") {
      world._destructor();
    } else if (world && typeof world.pauseAnimation === "function") {
      world.pauseAnimation();
      if (world.renderer && world.renderer() && world.renderer().dispose) world.renderer().dispose();
      if (world.controls && world.controls() && world.controls().dispose) world.controls().dispose();
    }
  } catch (e) {
  }
  if (host) {
    while (host.firstChild) host.removeChild(host.firstChild);
  }
}
function useGlobeLib() {
  const [ready, setReady] = React.useState(!!window.Globe);
  React.useEffect(() => {
    if (ready) return;
    if (window.Globe) {
      setReady(true);
      return;
    }
    const h = () => setReady(true);
    window.addEventListener("wayfare:globe-ready", h, { once: true });
    let intentos = 0;
    const reloj = setInterval(() => {
      if (window.Globe) {
        clearInterval(reloj);
        setReady(true);
      } else if (++intentos > 40) clearInterval(reloj);
    }, 250);
    return () => {
      clearInterval(reloj);
      window.removeEventListener("wayfare:globe-ready", h);
    };
  }, [ready]);
  return ready;
}
function estampaResultado({ nE, nP, t }) {
  try {
    const S = 1080;
    const cv = document.createElement("canvas");
    cv.width = S;
    cv.height = S;
    const ctx = cv.getContext("2d");
    const F = "'Space Grotesk', 'Helvetica Neue', Helvetica, sans-serif";
    const bg = ctx.createRadialGradient(S * 0.8, S * 0.15, 60, S * 0.5, S * 0.5, S);
    bg.addColorStop(0, "#171b36");
    bg.addColorStop(0.55, "#0b0d1a");
    bg.addColorStop(1, "#05070f");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = "rgba(126,132,245,0.28)";
    ctx.lineWidth = 3;
    const gx = S * 0.78, gy = S * 0.2, gr = 190;
    ctx.beginPath();
    ctx.arc(gx, gy, gr, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(gx, gy, gr * 0.55, gr, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(gx, gy, gr, gr * 0.4, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.save();
    ctx.translate(72, 64);
    ctx.scale(1.5, 1.5);
    ctx.strokeStyle = "#7E84F5";
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke(new Path2D("M22,30 L35,72 L50,46 L65,72 L78,30"));
    ctx.fillStyle = "#7E84F5";
    ctx.fill(new Path2D("M50,8 L53,19 L64,22 L53,25 L50,40 L47,25 L36,22 L47,19 Z"));
    ctx.restore();
    ctx.fillStyle = "#eef3f1";
    ctx.font = "700 76px " + F;
    ctx.fillText("Wayfare", 236, 158);
    ctx.fillStyle = "#9da2f8";
    ctx.font = "700 300px " + F;
    ctx.fillText(String(nE), 72, 600);
    ctx.fillStyle = "#eef3f1";
    ctx.font = "700 64px " + F;
    ctx.fillText(t("g_share_img_countries"), 76, 690);
    ctx.font = "600 40px " + F;
    ctx.fillStyle = "#7fc98f";
    ctx.beginPath();
    ctx.arc(96, 790, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#cdd3ef";
    ctx.fillText(nE + " \xB7 " + t("g_legend_eligible"), 130, 804);
    ctx.fillStyle = "#e8c268";
    ctx.beginPath();
    ctx.arc(96, 866, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#cdd3ef";
    ctx.fillText(nP + " \xB7 " + t("g_legend_partial"), 130, 880);
    ctx.fillStyle = "rgba(154,163,199,0.9)";
    ctx.font = "500 34px " + F;
    ctx.fillText(t("g_share_img_footer"), 72, 972);
    ctx.fillStyle = "#7E84F5";
    ctx.font = "700 36px " + F;
    ctx.fillText("edulino-byte.github.io/wayfare-site", 72, 1022);
    return new Promise((res) => cv.toBlob((b) => res(b), "image/png"));
  } catch (e) {
    return Promise.resolve(null);
  }
}
Object.assign(window, {
  isoToFlag,
  fmt,
  Field,
  SelectControl,
  TextControl,
  Segmented,
  Slider,
  Chips,
  destroyGlobe,
  WAYFARE_PERF,
  wfTrack,
  estampaResultado,
  useGlobeLib
});

/* ===== ui/BackgroundGlobe.jsx ===== */
const BG_GLOBE_TEXTURE = "assets/world/earth-blue-marble.jpg";
const BG_BUMP_URL = "assets/world/earth-topology.png";
function paintStars(canvas) {
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#05090b";
  ctx.fillRect(0, 0, W, H);
  let seed = 42;
  function rnd() {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  }
  const tiers = [
    { count: 180, rMin: 0.5, rMax: 0.9, aMin: 0.18, aMax: 0.45 },
    { count: 70, rMin: 0.8, rMax: 1.3, aMin: 0.35, aMax: 0.65 },
    { count: 30, rMin: 1, rMax: 1.8, aMin: 0.55, aMax: 0.9 }
  ];
  for (const tier of tiers) {
    for (let i = 0; i < tier.count; i++) {
      const x = rnd() * W;
      const y = rnd() * H;
      const r = tier.rMin + rnd() * (tier.rMax - tier.rMin);
      const a = tier.aMin + rnd() * (tier.aMax - tier.aMin);
      const tint = rnd();
      const col = tint < 0.12 ? `rgba(200,218,255,${a.toFixed(2)})` : tint < 0.22 ? `rgba(255,235,200,${a.toFixed(2)})` : `rgba(240,245,255,${a.toFixed(2)})`;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
function BackgroundGlobe() {
  const starsRef = React.useRef(null);
  const hostRef = React.useRef(null);
  const globeRef = React.useRef(null);
  const globeLib = useGlobeLib();
  React.useEffect(() => {
    const canvas = starsRef.current;
    if (!canvas) return;
    function sizeAndPaint() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      paintStars(canvas);
    }
    sizeAndPaint();
    window.addEventListener("resize", sizeAndPaint, { passive: true });
    return () => window.removeEventListener("resize", sizeAndPaint);
  }, []);
  React.useEffect(() => {
    if (!globeLib) return;
    const host = hostRef.current;
    if (!host || globeRef.current) return;
    const world = window.Globe(window.WAYFARE_PERF.globeConfig)(host).width(host.clientWidth).height(host.clientHeight).backgroundColor("rgba(0,0,0,0)").globeImageUrl(BG_GLOBE_TEXTURE).bumpImageUrl(BG_BUMP_URL).showAtmosphere(true).atmosphereColor("#6b71ea").atmosphereAltitude(0.22);
    window.WAYFARE_PERF.tune(world, true);
    world.controls().autoRotate = true;
    world.controls().autoRotateSpeed = 0.35;
    world.controls().enableZoom = false;
    world.controls().enableRotate = false;
    world.controls().enablePan = false;
    world.pointOfView({ lat: 20, lng: 10, altitude: 1.1 }, 0);
    globeRef.current = world;
    let freezeTimer = null;
    if (window.WAYFARE_PERF.lite) {
      freezeTimer = setTimeout(() => {
        world.controls().autoRotate = false;
        world.pauseAnimation();
        world.__wayfareFrozen = true;
      }, 2600);
    }
    const onVis = () => {
      if (document.hidden) world.pauseAnimation();
      else if (!world.__wayfareFrozen) world.resumeAnimation();
    };
    document.addEventListener("visibilitychange", onVis);
    const onResize = () => {
      world.width(host.clientWidth).height(host.clientHeight);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      if (freezeTimer) clearTimeout(freezeTimer);
      destroyGlobe(world, host);
      globeRef.current = null;
    };
  }, [globeLib]);
  return React.createElement(
    React.Fragment,
    null,
    React.createElement("canvas", {
      ref: starsRef,
      className: "bg-stars",
      "aria-hidden": "true"
    }),
    React.createElement("div", {
      ref: hostRef,
      className: "bg-globe-host",
      "aria-hidden": "true"
    })
  );
}
window.BackgroundGlobe = BackgroundGlobe;

/* ===== ui/Questionnaire.jsx ===== */
function Questionnaire({ t, lang, profile, setProfile, onSubmit, onBack, onDiscard, dirty, onReset }) {
  const D = window.VISA_DATA;
  const set = (k, v) => {
    wfTrack("embudo-2-interaccion");
    setProfile((p) => Object.assign({}, p, { [k]: v }));
  };
  const toggleIn = (k, v) => {
    wfTrack("embudo-2-interaccion");
    setProfile((p) => {
      const arr = p[k] || [];
      const next = arr.includes(v) ? arr.filter((x) => x !== v) : arr.concat(v);
      return Object.assign({}, p, { [k]: next });
    });
  };
  const passportOpts = D.PASSPORTS.map((p) => ({ value: p.code, label: isoToFlag(p.code) + "  " + countryName(p.code, lang) })).sort((a, b) => a.label.localeCompare(b.label));
  const residenceSource = D.RESIDENCES || D.PASSPORTS;
  const residenceOpts = residenceSource.map((r) => ({ value: r.code, label: isoToFlag(r.code) + "  " + (countryName(r.code, lang) || r.code) })).sort((a, b) => a.label.localeCompare(b.label));
  const eduOpts = D.EDUCATION.map((e) => ({ value: e, label: t("edu_" + e) }));
  const engOpts = D.ENGLISH.map((e) => ({ value: e, label: t("eng_" + e) }));
  const sitOpts = [
    { value: "alone", label: t("sit_alone") },
    { value: "partner", label: t("sit_partner") },
    { value: "family", label: t("sit_family") }
  ];
  const GOAL_DEFS = [
    { value: "study", types: ["student"], icon: D.VISA_TYPES.student.icon },
    { value: "work", types: ["work", "work_and_holiday"], icon: D.VISA_TYPES.work.icon },
    { value: "tourism", types: ["tourist"], icon: D.VISA_TYPES.tourist.icon },
    { value: "remote", types: ["digital_nomad"], icon: D.VISA_TYPES.digital_nomad.icon }
  ];
  const goalOpts = GOAL_DEFS.map((g) => ({ value: g.value, label: t("goal_" + g.value), vt: g.icon }));
  const [goalError, setGoalError] = React.useState(false);
  const goalsRef = React.useRef(null);
  const trySubmit = () => {
    if (!(profile.visaTypes || []).length) {
      setGoalError(true);
      if (goalsRef.current) goalsRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setGoalError(false);
    onSubmit();
  };
  const goalsSelected = GOAL_DEFS.filter((g) => g.types.some((tp) => (profile.visaTypes || []).includes(tp))).map((g) => g.value);
  const toggleGoal = (goal) => {
    const def = GOAL_DEFS.find((g) => g.value === goal);
    const on = def.types.some((tp) => (profile.visaTypes || []).includes(tp));
    const resto = (profile.visaTypes || []).filter((tp) => !def.types.includes(tp));
    set("visaTypes", on ? resto : resto.concat(def.types));
  };
  const barRef = React.useRef(null);
  React.useEffect(function() {
    const el = barRef.current;
    if (!el) return;
    const medir = function() {
      document.documentElement.style.setProperty("--submitbar-h", el.offsetHeight + "px");
    };
    medir();
    let ro = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(medir);
      ro.observe(el);
    }
    window.addEventListener("resize", medir);
    return function() {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", medir);
    };
  }, []);
  return /* @__PURE__ */ React.createElement("div", { className: "q-scroll" }, /* @__PURE__ */ React.createElement(BackgroundGlobe, null), /* @__PURE__ */ React.createElement("div", { className: "q-wrap" }, /* @__PURE__ */ React.createElement("div", { className: "q-head" }, /* @__PURE__ */ React.createElement("span", { className: "q-eyebrow" }, /* @__PURE__ */ React.createElement("span", { className: "dot" }), t("g_simulated")), /* @__PURE__ */ React.createElement("h1", null, t("q_title")), /* @__PURE__ */ React.createElement("p", null, t("q_sub"))), /* @__PURE__ */ React.createElement("section", { className: "section" }, /* @__PURE__ */ React.createElement("div", { className: "section-head" }, /* @__PURE__ */ React.createElement("span", { className: "section-num" }, "01"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", null, t("sec_identity")), /* @__PURE__ */ React.createElement("p", null, t("sec_identity_sub")))), /* @__PURE__ */ React.createElement("div", { className: "grid" }, /* @__PURE__ */ React.createElement(Field, { label: t("f_nationality") }, /* @__PURE__ */ React.createElement(SelectControl, { value: profile.nationality, onChange: (v) => set("nationality", v), options: passportOpts })), /* @__PURE__ */ React.createElement(Field, { label: t("f_residence") }, /* @__PURE__ */ React.createElement(SelectControl, { value: profile.currentResidence, onChange: (v) => set("currentResidence", v), options: residenceOpts })), /* @__PURE__ */ React.createElement(Field, { label: t("f_age") }, /* @__PURE__ */ React.createElement(
    Slider,
    {
      value: profile.age,
      onChange: (v) => set("age", v),
      min: 16,
      max: 70,
      format: (v) => /* @__PURE__ */ React.createElement("span", null, v, /* @__PURE__ */ React.createElement("small", null, v >= 70 ? "+" : ""))
    }
  )), /* @__PURE__ */ React.createElement(Field, { label: t("f_situation"), full: true }, /* @__PURE__ */ React.createElement(Segmented, { value: profile.situation, onChange: (v) => set("situation", v), options: sitOpts })))), /* @__PURE__ */ React.createElement("section", { className: "section" }, /* @__PURE__ */ React.createElement("div", { className: "section-head" }, /* @__PURE__ */ React.createElement("span", { className: "section-num" }, "02"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", null, t("sec_education")), /* @__PURE__ */ React.createElement("p", null, t("sec_education_sub")))), /* @__PURE__ */ React.createElement("div", { className: "grid" }, /* @__PURE__ */ React.createElement(Field, { label: t("f_education"), full: true }, /* @__PURE__ */ React.createElement(SelectControl, { value: profile.education, onChange: (v) => set("education", v), options: eduOpts })))), /* @__PURE__ */ React.createElement("section", { className: "section" }, /* @__PURE__ */ React.createElement("div", { className: "section-head" }, /* @__PURE__ */ React.createElement("span", { className: "section-num" }, "03"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", null, t("sec_means")), /* @__PURE__ */ React.createElement("p", null, t("sec_means_sub")))), /* @__PURE__ */ React.createElement("div", { className: "grid" }, /* @__PURE__ */ React.createElement(Field, { label: t("f_english"), hint: t("f_english_hint") }, /* @__PURE__ */ React.createElement(Segmented, { value: profile.english, onChange: (v) => set("english", v), options: engOpts })), /* @__PURE__ */ React.createElement(Field, { label: t("f_remote_work"), full: true }, /* @__PURE__ */ React.createElement(
    Segmented,
    {
      value: profile.remoteWork ? "yes" : "no",
      onChange: (v) => set("remoteWork", v === "yes"),
      options: [
        { value: "yes", label: t("remote_yes") },
        { value: "no", label: t("remote_no") }
      ]
    }
  )))), /* @__PURE__ */ React.createElement("section", { className: "section" }, /* @__PURE__ */ React.createElement("div", { className: "section-head" }, /* @__PURE__ */ React.createElement("span", { className: "section-num" }, "04"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", null, t("sec_intent")), /* @__PURE__ */ React.createElement("p", null, t("sec_intent_sub")))), /* @__PURE__ */ React.createElement("div", { className: "grid" }, /* @__PURE__ */ React.createElement(Field, { label: t("f_visas"), hint: t("f_visas_hint"), full: true }, /* @__PURE__ */ React.createElement("div", { ref: goalsRef }, /* @__PURE__ */ React.createElement(Chips, { selected: goalsSelected, onToggle: (g) => {
    setGoalError(false);
    toggleGoal(g);
  }, options: goalOpts }), goalError ? /* @__PURE__ */ React.createElement("p", { className: "goal-error" }, t("goal_required")) : null))))), /* @__PURE__ */ React.createElement("div", { className: "submitbar", ref: barRef }, /* @__PURE__ */ React.createElement("div", { className: "submit-row" }, onBack ? !dirty ? /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn-map-back", onClick: onBack }, /* @__PURE__ */ React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M19 12H5M11 18l-6-6 6-6", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" })), t("q_back_map")) : /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn-map-back btn-map-discard", onClick: onDiscard }, /* @__PURE__ */ React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M9 14l-4-4 4-4M5 10h9a5 5 0 015 5v3", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" })), t("q_discard")) : null, /* @__PURE__ */ React.createElement("button", { className: "btn-primary", onClick: trySubmit }, onBack && dirty ? t("submit_update") : t("submit"), /* @__PURE__ */ React.createElement("svg", { className: "arr", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none" }, /* @__PURE__ */ React.createElement("path", { d: "M5 12h14M13 6l6 6-6 6", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" })))), /* @__PURE__ */ React.createElement("p", { className: "disclaimer-short" }, t("disclaimer_short"), " ", /* @__PURE__ */ React.createElement("span", { className: "legal-links" }, /* @__PURE__ */ React.createElement("a", { href: lang === "en" ? "seo/privacy.html" : "seo/privacidad.html", hrefLang: lang === "en" ? "en" : "es" }, t("legal_privacy")), " \xB7 ", /* @__PURE__ */ React.createElement("a", { href: lang === "en" ? "seo/legal-notice.html" : "seo/aviso-legal.html", hrefLang: lang === "en" ? "en" : "es" }, t("legal_notice")))), onReset ? /* @__PURE__ */ React.createElement("button", { type: "button", className: "q-reset-link", onClick: onReset }, t("q_reset")) : null));
}
function countryName(iso, lang) {
  if (lang === "es" && window.COUNTRY_NAMES && window.COUNTRY_NAMES.es && window.COUNTRY_NAMES.es[iso]) {
    return window.COUNTRY_NAMES.es[iso];
  }
  const c = window.VISA_DATA.COUNTRIES.find((x) => x.iso === iso);
  if (c) return c.name;
  const names = {
    /* Spanish-speaking */
    AR: "Argentina",
    BO: "Bolivia",
    CL: "Chile",
    CO: "Colombia",
    CR: "Costa Rica",
    CU: "Cuba",
    EC: "Ecuador",
    SV: "El Salvador",
    GT: "Guatemala",
    HN: "Honduras",
    MX: "Mexico",
    NI: "Nicaragua",
    PA: "Panama",
    PY: "Paraguay",
    PE: "Peru",
    DO: "Dominican Republic",
    UY: "Uruguay",
    VE: "Venezuela",
    GQ: "Equatorial Guinea",
    /* Europe */
    DE: "Germany",
    AT: "Austria",
    BE: "Belgium",
    BG: "Bulgaria",
    CY: "Cyprus",
    HR: "Croatia",
    DK: "Denmark",
    ES: "Spain",
    EE: "Estonia",
    FI: "Finland",
    FR: "France",
    GE: "Georgia",
    GR: "Greece",
    HU: "Hungary",
    IE: "Ireland",
    IS: "Iceland",
    IT: "Italy",
    LV: "Latvia",
    LT: "Lithuania",
    LU: "Luxembourg",
    NO: "Norway",
    NL: "Netherlands",
    PL: "Poland",
    PT: "Portugal",
    GB: "United Kingdom",
    CZ: "Czech Republic",
    RU: "Russia",
    RS: "Serbia",
    SE: "Sweden",
    CH: "Switzerland",
    TR: "T\xFCrkiye",
    UA: "Ukraine",
    /* Others */
    US: "United States",
    CA: "Canada",
    JP: "Japan",
    CN: "China",
    /* Legacy codes kept for compatibility */
    AU: "Australia",
    KR: "South Korea",
    BR: "Brazil",
    AE: "UAE",
    MY: "Malaysia",
    ZA: "South Africa",
    IN: "India",
    PH: "Philippines",
    NG: "Nigeria",
    PK: "Pakistan",
    EG: "Egypt",
    /* v1.23.0 */
    NZ: "New Zealand",
    TW: "Taiwan",
    HK: "Hong Kong",
    IL: "Israel",
    RO: "Romania",
    SK: "Slovakia",
    SI: "Slovenia",
    MT: "Malta",
    AD: "Andorra",
    LI: "Liechtenstein"
  };
  return names[iso] || iso;
}
Object.assign(window, { Questionnaire, countryName });

/* ===== ui/Processing.jsx ===== */
function Processing({ t, onDone }) {
  const steps = React.useMemo(() => {
    const dest = (window.VERIFICATION || {}).destinations || {};
    let rutas = 0, hechos = 0;
    Object.values(dest).forEach((d) => {
      rutas += d.routes || 0;
      hechos += d.facts || 0;
    });
    const destinos = Object.keys(dest).length;
    return [
      t("p_step1"),
      t("p_live_routes").replace("%N%", rutas || "\u2026"),
      t("p_live_facts").replace("%N%", (hechos || 0).toLocaleString()),
      t("p_live_dest").replace("%N%", destinos || "\u2026")
    ];
  }, [t]);
  const [active, setActive] = React.useState(0);
  React.useEffect(() => {
    const per = 620;
    const timers = steps.map(
      (_, i) => setTimeout(() => setActive(i + 1), per * (i + 1))
    );
    const done = setTimeout(() => onDone(), per * steps.length + 700);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, []);
  return /* @__PURE__ */ React.createElement("div", { className: "processing" }, /* @__PURE__ */ React.createElement("div", { className: "proc-card" }, /* @__PURE__ */ React.createElement("div", { className: "proc-orbit" }, /* @__PURE__ */ React.createElement("div", { className: "ring" }), /* @__PURE__ */ React.createElement("div", { className: "ring r2" }), /* @__PURE__ */ React.createElement("div", { className: "sat" }), /* @__PURE__ */ React.createElement("div", { className: "core" })), /* @__PURE__ */ React.createElement("h2", null, t("p_title")), /* @__PURE__ */ React.createElement("div", { className: "proc-steps" }, steps.map((s, i) => {
    const cls = i < active ? "done" : i === active ? "active" : "";
    return /* @__PURE__ */ React.createElement("div", { key: i, className: "proc-step " + cls }, /* @__PURE__ */ React.createElement("span", { className: "tick" }, /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", fill: "none" }, /* @__PURE__ */ React.createElement("path", { d: "M5 12l5 5L19 7", stroke: "#fff", strokeWidth: "2.6", strokeLinecap: "round", strokeLinejoin: "round" }))), s);
  }))));
}
window.Processing = Processing;

/* ===== ui/Globe.jsx ===== */
const GEOJSON_URL = "assets/world/ne_110m_admin_0_countries.geojson";
const MICRO_DEST_COORDS = {
  SG: { lat: 1.35, lng: 103.82 },
  MT: { lat: 35.94, lng: 14.38 },
  LI: { lat: 47.16, lng: 9.55 }
};
const ADVISORS_APP = window.ADVISORS_APP || {};
const GLOBE_TEXTURES = {
  textured: "assets/world/earth-blue-marble.jpg",
  night: "assets/world/earth-night.jpg",
  dark: "assets/world/earth-dark.jpg"
};
const BUMP_URL = "assets/world/earth-topology.png";
const STATUS_RGB = {
  eligible: [38, 140, 90],
  /* sage-teal green — softer than #1f9d57     */
  partial: [190, 130, 30],
  /* warm ochre — less saturated amber         */
  ineligible: [170, 85, 55],
  /* muted terracotta                          */
  /* v1.155.0 — gris, el mismo de «Aún sin datos» en la leyenda: una tarjeta sin
     fuente capturada no se pinta con el color de un veredicto, porque no lo es. */
  nodata: [148, 163, 160]
};
const statusColor = (s, a) => {
  const c = STATUS_RGB[s] || [120, 130, 128];
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
};
const NAME_ISO_FIX = {
  France: "FR",
  Norway: "NO",
  Kosovo: "XK",
  "N. Cyprus": "XNC",
  Somaliland: "XSL"
};
function fechaCorta(iso, lang) {
  try {
    const [a, m, d] = iso.split("-").map(Number);
    return new Date(Date.UTC(a, m - 1, d)).toLocaleDateString(
      lang === "en" ? "en-GB" : "es-ES",
      { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }
    );
  } catch (e) {
    return iso;
  }
}
function featISO(props) {
  const iso = props.ISO_A2;
  if (iso && iso !== "-99") return iso;
  return NAME_ISO_FIX[props.ADMIN] || NAME_ISO_FIX[props.NAME] || null;
}
function featName(props) {
  return props.ADMIN || props.NAME || props.NAME_LONG || "\u2014";
}
function GlobeStars() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    function paint() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const W = canvas.width, H = canvas.height;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#05090b";
      ctx.fillRect(0, 0, W, H);
      let seed = 42;
      const rnd = () => {
        seed = seed * 16807 % 2147483647;
        return (seed - 1) / 2147483646;
      };
      const tiers = [
        { count: 180, rMin: 0.5, rMax: 0.9, aMin: 0.18, aMax: 0.45 },
        { count: 70, rMin: 0.8, rMax: 1.3, aMin: 0.35, aMax: 0.65 },
        { count: 30, rMin: 1, rMax: 1.8, aMin: 0.55, aMax: 0.9 }
      ];
      for (const tier of tiers) {
        for (let i = 0; i < tier.count; i++) {
          const x = rnd() * W, y = rnd() * H;
          const r = tier.rMin + rnd() * (tier.rMax - tier.rMin);
          const a = tier.aMin + rnd() * (tier.aMax - tier.aMin);
          const t = rnd();
          ctx.fillStyle = t < 0.12 ? `rgba(200,218,255,${a.toFixed(2)})` : t < 0.22 ? `rgba(255,235,200,${a.toFixed(2)})` : `rgba(240,245,255,${a.toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    paint();
    window.addEventListener("resize", paint, { passive: true });
    return () => window.removeEventListener("resize", paint);
  }, []);
  return React.createElement("canvas", {
    ref,
    className: "globe-stars",
    "aria-hidden": "true"
  });
}
const FOV_GLOBO = 50;
function altitudDeEncaje(host, ocupacion) {
  if (!host) return 1.7;
  const w = host.clientWidth, h = host.clientHeight;
  if (!w || !h) return 1.7;
  const tg = Math.tan(FOV_GLOBO * Math.PI / 180 / 2);
  const radios = 1 / (ocupacion || 0.8);
  const distV = radios / tg;
  const distH = radios / (tg * (w / h));
  const dist = Math.max(distV, distH);
  return Math.min(4, Math.max(0.6, dist - 1));
}
function anchoFicha(anchoEscena) {
  const holgado = Math.min(1200, Math.max(520, anchoEscena * 0.62));
  return Math.round(Math.max(320, Math.min(holgado, anchoEscena - 300)));
}
function esEscritorio() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(min-width: 701px)").matches : true;
}
function GlobeView({ t, lang, profile, onEditProfile, globeStyle, visible }) {
  const hostRef = React.useRef(null);
  const globeRef = React.useRef(null);
  const despertarRef = React.useRef(null);
  const arrastrandoRef = React.useRef(false);
  const langRef = React.useRef(lang);
  langRef.current = lang;
  const globeLib = useGlobeLib();
  const [features, setFeatures] = React.useState(null);
  const [results, setResults] = React.useState(null);
  const [micros, setMicros] = React.useState([]);
  const [eligError, setEligError] = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const [hoverIdx, setHoverIdx] = React.useState(null);
  const [hoverData, setHoverData] = React.useState(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const revealRef = React.useRef(1.01);
  const [compareIso, setCompareIso] = React.useState(null);
  const selRef = React.useRef(null);
  const hoverRef = React.useRef(null);
  const pendienteRef = React.useRef(null);
  const mousePosRef = React.useRef({ x: 0, y: 0 });
  React.useEffect(() => {
    let alive = true;
    (window.__WAYFARE_GEOJSON ? Promise.resolve(window.__WAYFARE_GEOJSON) : fetch(GEOJSON_URL).then((r) => {
      if (!r.ok) throw new Error("geojson HTTP " + r.status);
      return r.json();
    }).then((gj) => window.__WAYFARE_GEOJSON = gj)).then((gj) => {
      if (!alive) return;
      if (!window.Eligibility || typeof window.Eligibility.evaluateAll !== "function") {
        console.error("[Wayfare] window.Eligibility.evaluateAll is not available. Check eligibility.js for syntax errors.");
        setEligError(true);
        return;
      }
      const feats = gj.features.filter((f) => featName(f.properties) !== "Antarctica");
      const geoList = feats.map((f, i) => ({
        id: i,
        iso: featISO(f.properties),
        name: featName(f.properties)
      }));
      const res = window.Eligibility.evaluateAll(geoList, profile);
      feats.forEach((f, i) => {
        f.__id = i;
        f.__iso = geoList[i].iso;
      });
      const microIsos = Object.keys(MICRO_DEST_COORDS).filter((iso) => window.Eligibility.hasRealRules(iso) && !feats.some((f) => f.__iso === iso));
      const microRes = window.Eligibility.evaluateAll(
        microIsos.map((iso) => ({ id: "micro_" + iso, iso, name: countryName(iso, "en") || iso })),
        profile
      );
      setMicros(microIsos.map((iso) => Object.assign(
        { iso },
        MICRO_DEST_COORDS[iso],
        { r: microRes["micro_" + iso] }
      )));
      setFeatures(feats);
      setResults(res);
    }).catch((e) => {
      console.error("GeoJSON load failed", e);
      if (alive) setEligError(true);
    });
    return () => {
      alive = false;
    };
  }, []);
  React.useEffect(() => {
    if (!globeLib || !features || !results || !hostRef.current || globeRef.current) return;
    const host = hostRef.current;
    const G = window.Globe;
    const microPills = [];
    const pillData = features.filter((f) => {
      const r = results[f.__id];
      if (!r || r.synthetic) return false;
      return r.status !== "nodata";
    }).map((f) => {
      const c = featureCentroid(f) || [0, 0];
      return { iso: f.__iso, lat: c[1], lng: c[0], r: results[f.__id], f };
    }).concat(micros.map((m) => ({ iso: m.iso, lat: m.lat, lng: m.lng, r: m.r, micro: true })));
    const world = G(window.WAYFARE_PERF.globeConfig)(host).width(host.clientWidth).height(host.clientHeight).backgroundColor("rgba(0,0,0,0)").globeImageUrl(GLOBE_TEXTURES[globeStyle] || GLOBE_TEXTURES.textured).bumpImageUrl(BUMP_URL).showAtmosphere(true).atmosphereColor("#7ab8d4").atmosphereAltitude(0.26).polygonsData(features).polygonCapColor(capColor).polygonSideColor(() => "rgba(0,0,0,0.06)").polygonStrokeColor(strokeColor).polygonAltitude(altOf).polygonsTransitionDuration(220).onPolygonHover((d) => {
      if (arrastrandoRef.current) return;
      hoverRef.current = d;
      setHoverIdx(d ? d.__id : null);
      host.style.cursor = d ? "pointer" : "grab";
      world.polygonAltitude(altOf).polygonCapColor(capColor).polygonStrokeColor(strokeColor);
      if (!window.WAYFARE_PERF.lite) {
        if (d) {
          const r = results[d.__id];
          setHoverData({
            name: featName(d.properties),
            iso: d.__iso,
            status: r ? r.status : null,
            x: mousePosRef.current.x,
            y: mousePosRef.current.y
          });
        } else {
          setHoverData(null);
        }
      }
    }).onPolygonClick((d) => selectFeature(d)).labelsData(micros).labelLat((d) => d.lat).labelLng((d) => d.lng).labelText(() => "").labelSize(0.65).labelDotRadius(0.42).labelAltitude(8e-3).labelResolution(2).labelColor((d) => d.r && !d.r.synthetic ? statusColor(d.r.status, 0.95) : "rgba(148,163,160,0.85)").onLabelHover((d) => {
      host.style.cursor = d ? "pointer" : "grab";
      if (!window.WAYFARE_PERF.lite) {
        if (d) {
          setHoverData({
            name: countryName(d.iso, langRef.current) || d.iso,
            iso: d.iso,
            status: d.r ? d.r.status : null,
            x: mousePosRef.current.x,
            y: mousePosRef.current.y
          });
        } else {
          setHoverData(null);
        }
      }
    }).onLabelClick((d) => abrirMicro(d)).htmlElementsData(pillData).htmlLat((d) => d.lat).htmlLng((d) => d.lng).htmlAltitude(0.012).htmlElement((d) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "micro-flag";
      el.dataset.iso = d.iso;
      el.title = countryName(d.iso, langRef.current) || d.iso;
      if (d.r && !d.r.synthetic) el.style.borderColor = statusColor(d.r.status, 1);
      const img = document.createElement("img");
      img.className = "mf-img";
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      var iso = String(d.iso || "").toLowerCase();
      img.src = "assets/flags-min/" + iso + ".png";
      img.onerror = function() {
        this.onerror = null;
        this.src = "assets/flags/" + iso + ".svg";
      };
      el.appendChild(img);
      const nm = document.createElement("span");
      nm.className = "mf-name";
      nm.textContent = countryName(d.iso, langRef.current) || d.iso;
      el.appendChild(nm);
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (d.f) selectFeature(d.f);
        else abrirMicro(d);
      });
      el.__wfLat = d.lat;
      el.__wfLng = d.lng;
      el.__wfMicro = !!d.micro;
      microPills.push(el);
      return el;
    });
    function abrirMicro(d) {
      if (!d.r) return;
      selRef.current = null;
      setSelected(Object.assign({}, d.r, { iso: d.iso }));
      wfTrack("embudo-5-destino");
      wfTrack("destino-" + d.iso);
      setDetailOpen(true);
      enfocarPais(d.lat, d.lng);
    }
    let ultimaPasadaPills = 0;
    const actualizarMicroPills = () => {
      if (arrastrandoRef.current) return;
      const ahora = performance.now();
      if (ahora - ultimaPasadaPills < 150) return;
      ultimaPasadaPills = ahora;
      const pov = world.pointOfView();
      const alt = pov.altitude;
      const candidatos = [];
      microPills.forEach((el) => {
        let dl = Math.abs(el.__wfLng - pov.lng);
        if (dl > 180) dl = 360 - dl;
        const ang = Math.hypot(
          el.__wfLat - pov.lat,
          dl * Math.cos(pov.lat * Math.PI / 180)
        );
        const verBandera = alt < (el.__wfMicro ? 1.5 : 1.25) && ang < 45;
        el.classList.toggle("micro-flag--on", verBandera);
        if (verBandera) {
          el.__wfAng = ang;
          candidatos.push(el);
        } else el.classList.remove("micro-flag--near");
      });
      const conNombre = alt < 0.9;
      const cajasNombres = [];
      candidatos.sort((a, b) => a.__wfAng - b.__wfAng);
      candidatos.forEach((el) => {
        let ok = conNombre && el.__wfAng < 30;
        if (ok) {
          const r = el.getBoundingClientRect();
          if (!r.width) {
            ok = false;
          } else {
            const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
            const w = 34 + el.title.length * 6.4, h = 26;
            const caja = {
              left: cx - w / 2,
              right: cx + w / 2,
              top: cy - h / 2,
              bottom: cy + h / 2
            };
            ok = !cajasNombres.some((q) => !(caja.right < q.left - 4 || caja.left > q.right + 4 || caja.bottom < q.top - 4 || caja.top > q.bottom + 4));
            if (ok) cajasNombres.push(caja);
          }
        }
        el.classList.toggle("micro-flag--near", ok);
      });
    };
    world.controls().addEventListener("change", actualizarMicroPills);
    const pillTimer = setTimeout(actualizarMicroPills, 700);
    window.WAYFARE_PERF.tune(world);
    window.__WAYFARE_WORLD = world;
    world.controls().autoRotate = true;
    world.controls().autoRotateSpeed = 0.45;
    world.controls().enableZoom = true;
    world.controls().minDistance = 180;
    world.controls().maxDistance = 520;
    world.pointOfView({ lat: 20, lng: 10, altitude: 1.7 }, 0);
    const stop = () => {
      world.controls().autoRotate = false;
    };
    host.addEventListener("pointerdown", stop, { once: true });
    let dormido = false, tempSueno = 0, ultimoAviso = 0;
    const dormir = () => {
      if (dormido) return;
      if (world.controls().autoRotate) return;
      try {
        world.pauseAnimation();
        dormido = true;
      } catch (e) {
      }
    };
    const despertar = (msQuieto) => {
      if (dormido) {
        dormido = false;
        try {
          world.resumeAnimation();
        } catch (e) {
        }
      }
      const ahora = performance.now();
      if (!msQuieto && ahora - ultimoAviso < 200) return;
      ultimoAviso = ahora;
      clearTimeout(tempSueno);
      tempSueno = setTimeout(dormir, msQuieto || 2e3);
    };
    despertarRef.current = despertar;
    world.controls().addEventListener("change", despertar);
    const AL_TOCAR = ["pointerdown", "pointermove", "wheel", "touchstart"];
    const alTocar = () => despertar();
    AL_TOCAR.forEach((ev) => host.addEventListener(ev, alTocar, { passive: true }));
    const alAgarrar = () => {
      arrastrandoRef.current = true;
      setHoverData(null);
    };
    const alSoltarGlobo = () => {
      if (!arrastrandoRef.current) return;
      arrastrandoRef.current = false;
      ultimaPasadaPills = 0;
      actualizarMicroPills();
    };
    host.addEventListener("pointerdown", alAgarrar, { passive: true });
    window.addEventListener("pointerup", alSoltarGlobo, { passive: true });
    window.addEventListener("pointercancel", alSoltarGlobo, { passive: true });
    let revealTimer = null;
    {
      const home = features.find((f) => f.__iso === profile.nationality);
      const hc = home && featureCentroid(home) || [10, 20];
      let maxD = 1;
      features.forEach((f) => {
        const c = featureCentroid(f) || hc;
        let dx = Math.abs(c[0] - hc[0]);
        if (dx > 180) dx = 360 - dx;
        const d = Math.hypot(dx, c[1] - hc[1]);
        f.__revDist = d;
        if (d > maxD) maxD = d;
      });
      features.forEach((f) => {
        f.__rev = f.__revDist / maxD;
      });
      revealRef.current = 0;
      const t0 = performance.now(), DUR = 2600;
      const tick = () => {
        const p = Math.min(1, (performance.now() - t0) / DUR);
        revealRef.current = p * p * (3 - 2 * p);
        world.polygonCapColor(capColor);
        despertar(900);
        if (p < 1) {
          revealTimer = setTimeout(tick, 90);
        } else {
          revealRef.current = 1.01;
          world.polygonCapColor(capColor);
        }
      };
      tick();
    }
    globeRef.current = world;
    globeRef.current.__select = (d) => selectFeature(d);
    globeRef.current.__byIso = (iso) => features.find((f) => f.__iso === iso);
    try {
      window.__wayfareGloboListo = true;
    } catch (e) {
    }
    try {
      window.__wfDiag = Object.assign(window.__wfDiag || {}, { byIso: true });
    } catch (e) {
    }
    if (pendienteRef.current) {
      const pedido = pendienteRef.current;
      pendienteRef.current = null;
      const fp = features.find((f) => f.__iso === pedido);
      if (fp) selectFeature(fp);
    }
    globeRef.current.__deselect = () => {
      world.polygonAltitude(altOf).polygonCapColor(capColor).polygonStrokeColor(strokeColor);
    };
    const onMouseMove = (e) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      if (hoverRef.current) {
        setHoverData((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : prev);
      }
    };
    host.addEventListener("mousemove", onMouseMove, { passive: true });
    let pendiente = 0, ultimoW = host.clientWidth, ultimoH = host.clientHeight;
    let ultimaAplicacion = 0, colaResize = 0;
    const aplicarTamano = () => {
      const w = host.clientWidth, h = host.clientHeight;
      if (!w || !h || w === ultimoW && h === ultimoH) return;
      ultimoW = w;
      ultimoH = h;
      ultimaAplicacion = performance.now();
      world.width(w).height(h);
      despertar(1200);
    };
    const observador = new ResizeObserver(() => {
      if (pendiente) return;
      pendiente = requestAnimationFrame(() => {
        pendiente = 0;
        const espera = 150 - (performance.now() - ultimaAplicacion);
        if (espera <= 0) {
          aplicarTamano();
          return;
        }
        if (!colaResize) colaResize = setTimeout(() => {
          colaResize = 0;
          aplicarTamano();
        }, espera);
      });
    });
    observador.observe(host);
    function altOf(d) {
      if (selRef.current && d.__id === selRef.current.__id) return 0.06;
      if (hoverRef.current && d.__id === hoverRef.current.__id) return 0.025;
      return 6e-3;
    }
    function strokeColor(d) {
      const isSel = selRef.current && d.__id === selRef.current.__id;
      const isHov = hoverRef.current && d.__id === hoverRef.current.__id;
      return isSel ? "rgba(200,228,242,0.85)" : isHov ? "rgba(200,228,242,0.50)" : "rgba(200,228,242,0.22)";
    }
    function capColor(d) {
      if (d.__rev !== void 0 && d.__rev > revealRef.current) {
        return "rgba(148,163,160,0.10)";
      }
      const r = results[d.__id];
      const isSel = selRef.current && d.__id === selRef.current.__id;
      const isHov = hoverRef.current && d.__id === hoverRef.current.__id;
      const real = r && !r.synthetic;
      if (!real) return `rgba(148,163,160,${isSel ? 0.45 : isHov ? 0.32 : 0.1})`;
      return statusColor(r.status, isSel ? 0.88 : isHov ? 0.75 : 0.62);
    }
    function selectFeature(d) {
      selRef.current = d;
      const r = results[d.__id];
      setSelected(r ? Object.assign({}, r, { iso: d.__iso || r.iso }) : null);
      wfTrack("embudo-5-destino");
      if (d.__iso || r && r.iso) wfTrack("destino-" + (d.__iso || r.iso));
      setDetailOpen(true);
      world.controls().autoRotate = false;
      world.polygonAltitude(altOf).polygonCapColor(capColor).polygonStrokeColor(strokeColor);
      try {
        const coords = featureCentroid(d);
        if (coords) enfocarPais(coords[1], coords[0], 1.4);
      } catch (e) {
      }
    }
    return () => {
      host.removeEventListener("mousemove", onMouseMove);
      observador.disconnect();
      if (pendiente) cancelAnimationFrame(pendiente);
      if (colaResize) clearTimeout(colaResize);
      if (revealTimer) clearTimeout(revealTimer);
      clearTimeout(pillTimer);
      clearTimeout(tempSueno);
      if (despertarRef.current === despertar) despertarRef.current = null;
      AL_TOCAR.forEach((ev) => {
        try {
          host.removeEventListener(ev, alTocar);
        } catch (e) {
        }
      });
      arrastrandoRef.current = false;
      try {
        host.removeEventListener("pointerdown", alAgarrar);
      } catch (e) {
      }
      try {
        window.removeEventListener("pointerup", alSoltarGlobo);
      } catch (e) {
      }
      try {
        window.removeEventListener("pointercancel", alSoltarGlobo);
      } catch (e) {
      }
      try {
        world.controls().removeEventListener("change", despertar);
      } catch (e) {
      }
      try {
        world.controls().removeEventListener("change", actualizarMicroPills);
      } catch (e) {
      }
      try {
        host.removeEventListener("pointerdown", stop);
      } catch (e) {
      }
      if (window.__WAYFARE_WORLD === world) {
        try {
          delete window.__WAYFARE_WORLD;
        } catch (e) {
          window.__WAYFARE_WORLD = null;
        }
      }
      destroyGlobe(world, host);
      globeRef.current = null;
    };
  }, [features, results, globeLib]);
  React.useEffect(() => {
    document.querySelectorAll(".micro-flag[data-iso]").forEach((el) => {
      const nombre = countryName(el.dataset.iso, lang) || el.dataset.iso;
      el.title = nombre;
      const nm = el.querySelector(".mf-name");
      if (nm) nm.textContent = nombre;
    });
  }, [lang]);
  React.useEffect(() => {
    if (globeRef.current) {
      globeRef.current.globeImageUrl(GLOBE_TEXTURES[globeStyle] || GLOBE_TEXTURES.textured);
      if (despertarRef.current) despertarRef.current(3e3);
    }
  }, [globeStyle]);
  React.useEffect(() => {
    const w = globeRef.current;
    if (!w) return;
    if (visible === false) {
      w.pauseAnimation();
      w.__wayfarePaused = true;
    } else if (w.__wayfarePaused) {
      w.__wayfarePaused = false;
      if (despertarRef.current) despertarRef.current(2e3);
      else w.resumeAnimation();
    }
  }, [visible, features, results]);
  React.useEffect(() => {
    const onVis = () => {
      const w = globeRef.current;
      if (!w) return;
      if (document.hidden) w.pauseAnimation();
      else if (!w.__wayfarePaused) {
        if (despertarRef.current) despertarRef.current(2e3);
        else w.resumeAnimation();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);
  React.useEffect(() => {
    if (globeRef.current && results) {
      globeRef.current.polygonCapColor(globeRef.current.polygonCapColor());
    }
  }, [hoverIdx]);
  const tally = React.useMemo(
    () => results ? window.Eligibility.tally(results) : null,
    [results]
  );
  const pickIso = (iso) => {
    const f = globeRef.current && globeRef.current.__byIso(iso);
    if (f && globeRef.current.__select) globeRef.current.__select(f);
  };
  const [openGroup, setOpenGroup] = React.useState(null);
  const grupos = React.useMemo(() => {
    if (!features || !results) return null;
    const g = { eligible: [], partial: [], ineligible: [] };
    features.forEach((f) => {
      const r = results[f.__id];
      if (r && !r.synthetic && f.__iso && g[r.status]) {
        g[r.status].push({ iso: f.__iso, name: countryName(f.__iso, lang) || r.name });
      }
    });
    (micros || []).forEach((m) => {
      if (m.r && !m.r.synthetic && g[m.r.status]) {
        g[m.r.status].push({ iso: m.iso, name: countryName(m.iso, lang) || m.iso });
      }
    });
    Object.values(g).forEach((a) => a.sort((x, y) => x.name.localeCompare(y.name)));
    return g;
  }, [features, results, micros, lang]);
  const [shareMsg, setShareMsg] = React.useState(null);
  async function compartirMapa() {
    const nE = grupos ? grupos.eligible.length : 0;
    const nP = grupos ? grupos.partial.length : 0;
    const url = "https://edulino-byte.github.io/wayfare-site/";
    const texto = t("g_share_text").replace("{E}", nE).replace("{P}", nP);
    wfTrack("compartir-mapa");
    let archivo = null;
    try {
      const blob = await window.estampaResultado({ nE, nP, t });
      if (blob) archivo = new File([blob], t("share_filename"), { type: "image/png" });
    } catch (e) {
    }
    try {
      if (archivo && navigator.canShare && navigator.canShare({ files: [archivo] })) {
        await navigator.share({ title: "Wayfare", text: texto + " " + url, files: [archivo] });
      } else if (navigator.share) {
        await navigator.share({ title: "Wayfare", text: texto, url });
      } else {
        let copiado = false;
        try {
          await navigator.clipboard.writeText(texto + " " + url);
          copiado = true;
        } catch (e) {
        }
        if (archivo) {
          const a = document.createElement("a");
          a.href = URL.createObjectURL(archivo);
          a.download = t("share_filename");
          a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 4e3);
        }
        setShareMsg(copiado ? t("g_share_copied") : t("g_share_saved"));
        setTimeout(() => setShareMsg(null), 4e3);
      }
    } catch (e) {
    }
  }
  const irA = (iso) => {
    setOpenGroup(null);
    const f = globeRef.current && globeRef.current.__byIso && globeRef.current.__byIso(iso);
    if (f) {
      pickIso(iso);
      return;
    }
    const m = (micros || []).find((x) => x.iso === iso);
    if (m && m.r) {
      selRef.current = null;
      setSelected(Object.assign({}, m.r, { iso: m.iso }));
      setDetailOpen(true);
      enfocarPais(m.lat, m.lng);
      return;
    }
    pendienteRef.current = iso;
    try {
      window.__wfDiag = Object.assign(window.__wfDiag || {}, { pendiente: iso });
    } catch (e) {
    }
    let intentos = 0;
    const reloj = setInterval(() => {
      if (pendienteRef.current !== iso) {
        clearInterval(reloj);
        return;
      }
      const g = globeRef.current;
      const hallado = g && g.__byIso && g.__byIso(iso);
      if (hallado) {
        clearInterval(reloj);
        pendienteRef.current = null;
        pickIso(iso);
        return;
      }
      if (++intentos > 30) {
        clearInterval(reloj);
        pendienteRef.current = null;
        try {
          window.__wfDiag = Object.assign(window.__wfDiag || {}, { pendienteAgotado: iso });
        } catch (e) {
        }
      }
    }, 100);
  };
  const hojaRef = React.useRef(null);
  const arrastre = React.useRef(null);
  const puedeArrastrar = () => window.matchMedia("(max-width: 700px)").matches;
  const alEmpezar = (e, desdeTirador) => {
    if (!puedeArrastrar()) return;
    const inner = hojaRef.current && hojaRef.current.querySelector(".detail-panel-inner");
    if (!desdeTirador && inner && inner.scrollTop > 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {
    }
    arrastre.current = {
      y0: e.clientY,
      dy: 0,
      t0: Date.now(),
      activo: true,
      id: e.pointerId,
      origen: e.currentTarget
    };
    if (hojaRef.current) {
      hojaRef.current.style.animation = "none";
      hojaRef.current.style.willChange = "transform";
    }
  };
  const alMover = (e) => {
    const a = arrastre.current;
    if (!a || !a.activo || e.pointerId !== a.id) return;
    const dy = e.clientY - a.y0;
    if (dy <= 0) {
      a.dy = 0;
      if (hojaRef.current) hojaRef.current.style.transform = "";
      return;
    }
    a.dy = dy;
    if (hojaRef.current) {
      hojaRef.current.style.transition = "none";
      hojaRef.current.style.transform = "translateY(" + (dy < 120 ? dy : 120 + (dy - 120) * 0.35) + "px)";
      hojaRef.current.style.opacity = String(Math.max(0.55, 1 - dy / 620));
    }
  };
  const alSoltar = (e) => {
    const a = arrastre.current;
    if (a && a.origen && e && e.pointerId != null) {
      try {
        a.origen.releasePointerCapture(e.pointerId);
      } catch (err) {
      }
    }
    arrastre.current = null;
    if (hojaRef.current) hojaRef.current.style.willChange = "";
    if (!a || !a.activo) return;
    const velocidad = a.dy / Math.max(1, Date.now() - a.t0);
    const cerrar = a.dy > 110 || velocidad > 0.55;
    const hoja = hojaRef.current;
    if (!hoja) return;
    if (cerrar) {
      hoja.style.transition = "transform .22s ease, opacity .22s ease";
      hoja.style.transform = "translateY(100%)";
      hoja.style.opacity = "0";
      setTimeout(closeDetail, 180);
    } else {
      hoja.style.transition = "transform .26s cubic-bezier(.2,.8,.2,1), opacity .26s ease";
      hoja.style.transform = "";
      hoja.style.opacity = "";
    }
  };
  const enfocarPais = (lat, lng, altMovil) => {
    const world = globeRef.current, host = hostRef.current;
    if (!world || !host) return;
    world.controls().autoRotate = false;
    if (despertarRef.current) despertarRef.current(1800);
    if (!esEscritorio()) {
      world.pointOfView({ lat, lng: lng - 12, altitude: altMovil || 1.2 }, 900);
      return;
    }
    const anchoEscena = (host.parentElement || host).clientWidth || host.clientWidth;
    world.pointOfView({
      lat,
      lng,
      altitude: altitudDeEncaje(
        { clientWidth: anchoEscena - anchoFicha(anchoEscena), clientHeight: host.clientHeight },
        0.82
      )
    }, 900);
  };
  const closeDetail = () => {
    selRef.current = null;
    setSelected(null);
    setDetailOpen(false);
    if (globeRef.current) {
      if (globeRef.current.__deselect) globeRef.current.__deselect();
      const host = hostRef.current;
      if (despertarRef.current) despertarRef.current(1600);
      if (host && esEscritorio()) {
        const escena = host.parentElement || host;
        const pov = globeRef.current.pointOfView();
        globeRef.current.pointOfView({
          lat: pov.lat,
          lng: pov.lng,
          altitude: altitudDeEncaje(
            { clientWidth: escena.clientWidth, clientHeight: host.clientHeight },
            0.8
          )
        }, 700);
      }
    }
  };
  React.useEffect(() => {
    const publicar = () => {
      if (!window.innerWidth) return;
      document.documentElement.style.setProperty(
        "--ficha-ancho",
        anchoFicha(window.innerWidth) + "px"
      );
    };
    publicar();
    window.addEventListener("resize", publicar, { passive: true });
    document.addEventListener("visibilitychange", publicar);
    return () => {
      window.removeEventListener("resize", publicar);
      document.removeEventListener("visibilitychange", publicar);
    };
  }, []);
  React.useEffect(() => {
    if (!detailOpen) return;
    const alPulsar = (e) => {
      if (e.key === "Escape") closeDetail();
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [detailOpen]);
  return /* @__PURE__ */ React.createElement("div", { className: "globe-stage" + (detailOpen ? " detail-open" : "") }, /* @__PURE__ */ React.createElement(GlobeStars, null), /* @__PURE__ */ React.createElement("div", { className: "globe-host" + (detailOpen ? " globe-host--shifted" : ""), ref: hostRef }), hoverData && !detailOpen ? /* @__PURE__ */ React.createElement("div", { className: "globe-tooltip", style: { left: hoverData.x, top: hoverData.y }, "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("span", { className: "gt-flag" }, isoToFlag(hoverData.iso)), /* @__PURE__ */ React.createElement("span", { className: "gt-name" }, (() => {
    const n = countryName(hoverData.iso, lang);
    return n && n !== hoverData.iso ? n : hoverData.name || n;
  })())) : null, !detailOpen ? eligError ? /* @__PURE__ */ React.createElement("div", { className: "globe-hint globe-hint--error" }, /* @__PURE__ */ React.createElement("span", { className: "pin pin--error" }), t("elg_load_error")) : !features ? /* @__PURE__ */ React.createElement("div", { className: "globe-hint" }, /* @__PURE__ */ React.createElement("span", { className: "pin" }), t("p_title"), "\u2026") : /* @__PURE__ */ React.createElement("div", { className: "globe-hint" }, /* @__PURE__ */ React.createElement("span", { className: "pin" }), t("g_click_hint")) : null, tally && !detailOpen ? /* @__PURE__ */ React.createElement("div", { className: "legend" }, ["eligible", "partial", "ineligible"].map((st) => {
    const lista = grupos && grupos[st] || [];
    const abierto = openGroup === st;
    const label = st === "eligible" ? "g_legend_eligible" : st === "partial" ? "g_legend_partial" : "g_legend_unlikely";
    return /* @__PURE__ */ React.createElement("div", { key: st, className: "lg-group" + (abierto ? " lg-group--open" : "") }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "row lg-row", onClick: () => setOpenGroup(abierto ? null : st) }, /* @__PURE__ */ React.createElement("span", { className: "sw", style: { background: statusColor(st, 1) } }), t(label), /* @__PURE__ */ React.createElement("span", { className: "lg-count", style: { color: statusColor(st, 1) } }, lista.length), /* @__PURE__ */ React.createElement("svg", { className: "lg-caret", width: "10", height: "10", viewBox: "0 0 24 24", fill: "none" }, /* @__PURE__ */ React.createElement("path", { d: "M9 6l6 6-6 6", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", strokeLinejoin: "round" }))), abierto ? /* @__PURE__ */ React.createElement("div", { className: "lg-list" }, lista.length ? lista.map((c) => /* @__PURE__ */ React.createElement("button", { type: "button", key: c.iso, className: "lg-item", onClick: () => irA(c.iso) }, /* @__PURE__ */ React.createElement(
      "img",
      {
        className: "lg-flag",
        alt: "",
        loading: "lazy",
        decoding: "async",
        src: "assets/flags-min/" + c.iso.toLowerCase() + ".png",
        onError: (e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "assets/flags/" + c.iso.toLowerCase() + ".svg";
        }
      }
    ), c.name)) : /* @__PURE__ */ React.createElement("div", { className: "lg-empty" }, "\u2014")) : null);
  }), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("span", { className: "sw", style: { background: "rgba(148,163,160,0.55)" } }), t("g_legend_nodata")), /* @__PURE__ */ React.createElement("button", { type: "button", className: "lg-share", onClick: compartirMapa }, /* @__PURE__ */ React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(
    "path",
    {
      d: "M12 15V3m0 0L7 8m5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6",
      stroke: "currentColor",
      strokeWidth: "2.2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  )), t("g_share_btn")), shareMsg ? /* @__PURE__ */ React.createElement("div", { className: "lg-share-done" }, shareMsg) : null) : null, tally && !detailOpen ? /* @__PURE__ */ React.createElement("button", { type: "button", className: "share-float", onClick: compartirMapa }, /* @__PURE__ */ React.createElement("svg", { width: "17", height: "17", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(
    "path",
    {
      d: "M12 15V3m0 0L7 8m5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6",
      stroke: "currentColor",
      strokeWidth: "2.4",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  )), t("g_share_btn")) : null, shareMsg && !detailOpen ? /* @__PURE__ */ React.createElement("div", { className: "share-float-done" }, shareMsg) : null, selected && detailOpen ? /* @__PURE__ */ React.createElement(
    "aside",
    {
      className: "detail-panel",
      ref: hojaRef,
      onPointerDown: (e) => alEmpezar(e, false),
      onPointerMove: alMover,
      onPointerUp: alSoltar,
      onPointerCancel: alSoltar
    },
    /* @__PURE__ */ React.createElement("div", { className: "detail-panel-inner" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "sheet-grab",
        "aria-label": t("a11y_close"),
        onPointerDown: (e) => {
          e.stopPropagation();
          alEmpezar(e, true);
        },
        onPointerMove: alMover,
        onPointerUp: alSoltar,
        onPointerCancel: alSoltar,
        onClick: () => {
          if (!arrastre.current) closeDetail();
        }
      },
      /* @__PURE__ */ React.createElement("span", { className: "sheet-grab-bar", "aria-hidden": "true" })
    ), /* @__PURE__ */ React.createElement("button", { className: "detail-panel-close", onClick: closeDetail, "aria-label": t("a11y_close") }, /* @__PURE__ */ React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", style: { pointerEvents: "none" } }, /* @__PURE__ */ React.createElement("path", { d: "M18 6L6 18M6 6l12 12", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round" }))), /* @__PURE__ */ React.createElement(
      CountryDetail,
      {
        key: selected.iso,
        t,
        lang,
        result: selected,
        profile,
        onCompare: () => {
          wfTrack("embudo-6-profundiza");
          setCompareIso(selected.iso === "NZ" ? "AU" : "NZ");
        }
      }
    ))
  ) : null, selected && compareIso ? /* @__PURE__ */ React.createElement(
    CompareView,
    {
      t,
      lang,
      profile,
      isoA: selected.iso,
      isoB: compareIso,
      setIsoB: setCompareIso,
      onClose: () => setCompareIso(null)
    }
  ) : null);
}
function CompareView({ t, lang, profile, isoA, isoB, setIsoB, onClose }) {
  React.useEffect(() => {
    const alPulsar = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [onClose]);
  const D = window.VISA_DATA;
  const opciones = React.useMemo(() => D.COUNTRIES.filter((c) => c.iso !== isoA && window.Eligibility.hasRealRules(c.iso)).map((c) => ({ iso: c.iso, nombre: countryName(c.iso, lang) || c.name })).sort((a, b) => a.nombre.localeCompare(b.nombre)), [isoA, lang]);
  const res = React.useMemo(
    () => window.Eligibility.evaluateAll(
      [{ id: "a", iso: isoA, name: isoA }, { id: "b", iso: isoB, name: isoB }],
      profile
    ),
    [isoA, isoB, profile]
  );
  const A = res.a, B = res.b;
  const tipos = [];
  for (const v of (A.visas || []).concat(B.visas || [])) {
    if (!tipos.includes(v.type)) tipos.push(v.type);
  }
  const celda = (r, tipo) => {
    const v = (r.visas || []).find((x) => x.type === tipo);
    if (!v) return /* @__PURE__ */ React.createElement("div", { className: "cmp-cell cmp-cell--empty" }, "\u2014");
    const sk = v.status === "nodata" ? "st_nodata" : v.status === "eligible" ? "st_eligible" : v.status === "partial" ? "st_partial" : "st_ineligible";
    return /* @__PURE__ */ React.createElement("div", { className: "cmp-cell" }, /* @__PURE__ */ React.createElement("span", { className: "cmp-pill", style: {
      background: `rgba(${STATUS_RGB[v.status].join(",")},0.16)`,
      color: statusColor(v.status, 1)
    } }, /* @__PURE__ */ React.createElement("span", { className: "sw", style: { background: statusColor(v.status, 1) } }), t(sk), v.score === null ? "" : " \xB7 " + v.score), /* @__PURE__ */ React.createElement("span", { className: "cmp-name" }, v.officialName || t("vt_" + v.type)));
  };
  return /* @__PURE__ */ React.createElement("div", { className: "cmp-overlay", onClick: (e) => {
    if (e.target === e.currentTarget) onClose();
  } }, /* @__PURE__ */ React.createElement("div", { className: "cmp-card", role: "dialog", "aria-modal": "true", "aria-label": t("cmp_title") }, /* @__PURE__ */ React.createElement("button", { className: "detail-panel-close", onClick: onClose, "aria-label": t("a11y_close") }, /* @__PURE__ */ React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", style: { pointerEvents: "none" } }, /* @__PURE__ */ React.createElement("path", { d: "M18 6L6 18M6 6l12 12", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round" }))), /* @__PURE__ */ React.createElement("h2", { className: "cmp-title" }, t("cmp_title")), /* @__PURE__ */ React.createElement("div", { className: "cmp-grid" }, /* @__PURE__ */ React.createElement("div", { className: "cmp-head" }), /* @__PURE__ */ React.createElement("div", { className: "cmp-head" }, isoToFlag(isoA), " ", countryName(isoA, lang) || isoA), /* @__PURE__ */ React.createElement("div", { className: "cmp-head" }, /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "cmp-select",
      value: isoB,
      onChange: (e) => setIsoB(e.target.value),
      "aria-label": t("cmp_choose")
    },
    opciones.map((o) => /* @__PURE__ */ React.createElement("option", { key: o.iso, value: o.iso }, isoToFlag(o.iso), " ", o.nombre))
  )), tipos.map((tipo) => /* @__PURE__ */ React.createElement(React.Fragment, { key: tipo }, /* @__PURE__ */ React.createElement("div", { className: "cmp-row-label" }, /* @__PURE__ */ React.createElement("span", { className: "vc-icon" }, D.VISA_TYPES[tipo].icon), " ", t("vt_" + tipo)), celda(A, tipo), celda(B, tipo)))), /* @__PURE__ */ React.createElement("p", { className: "cmp-note" }, t("cmp_note"))));
}
function CountryDetail({ t, lang, result, profile, onCompare }) {
  const [, repintar] = React.useReducer((n) => n + 1, 0);
  React.useEffect(() => {
    if (window.EVIDENCE) return;
    if (window.__wayfareCargarEvidencia) window.__wayfareCargarEvidencia();
    const alLlegar = () => repintar();
    window.addEventListener("wayfare:evidencia-lista", alLlegar);
    return () => window.removeEventListener("wayfare:evidencia-lista", alLlegar);
  }, []);
  function tx(value) {
    if (!value) return "";
    var translated = t(value);
    return translated && translated !== value ? translated : value;
  }
  var isMobile = typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(max-width: 560px)").matches : false;
  function secOpen(kind, v) {
    if (!isMobile) return false;
    if (kind === "missing") return !!(v.missing && v.missing.length);
    return false;
  }
  const statusKey = result.status === "eligible" ? "st_eligible" : result.status === "partial" ? "st_partial" : "st_ineligible";
  const pillColor = STATUS_RGB[result.status];
  const advInfo = ADVISORS_APP[result.iso];
  const advRef = React.useRef(null);
  const openAdvisors = () => {
    const el = advRef.current;
    if (!el) return;
    el.open = true;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    wfTrack("embudo-6-profundiza");
    try {
      if (window.goatcounter) window.goatcounter.count({ path: "adv-open-" + result.iso, event: true });
    } catch (e) {
    }
  };
  return (
    /* v1.40.0 — pulso al entrar en CUALQUIER país, del color de su estado */
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "cd-root detail-celebrate",
        style: { "--cele": `rgba(${(STATUS_RGB[result.status] || [148, 163, 160]).join(",")},0.30)` }
      },
      /* @__PURE__ */ React.createElement(
        "div",
        {
          className: "detail-flag-banner",
          "aria-hidden": "true",
          style: { backgroundImage: "linear-gradient(to right, rgba(8,16,14,0.94) 0%, rgba(8,16,14,0.62) 42%, rgba(8,16,14,0.12) 78%, rgba(8,16,14,0) 100%),url(assets/flags/" + String(result.iso || "").toLowerCase() + ".svg)" }
        }
      ),
      /* @__PURE__ */ React.createElement("div", { className: "detail-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "nm" }, (() => {
        const n = countryName(result.iso, lang);
        return n && n !== result.iso ? n : result.name || n;
      })()), /* @__PURE__ */ React.createElement("div", { className: "rg" }, t("rg_" + (result.region || "other"))), /* @__PURE__ */ React.createElement("span", { className: "status-pill", style: {
        background: `linear-gradient(rgba(${pillColor[0]},${pillColor[1]},${pillColor[2]},0.20), rgba(${pillColor[0]},${pillColor[1]},${pillColor[2]},0.20)), rgba(8,16,14,0.78)`,
        color: statusColor(result.status, 1)
      } }, /* @__PURE__ */ React.createElement("span", { className: "sw", style: { background: statusColor(result.status, 1) } }), t(statusKey)))),
      (() => {
        const sa = profile && window.Eligibility.specialAccess(profile.nationality, result.iso);
        if (!sa) return null;
        return /* @__PURE__ */ React.createElement("div", { className: "special-access-note" }, /* @__PURE__ */ React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", style: { flexShrink: 0, marginTop: "2px" } }, /* @__PURE__ */ React.createElement("path", { d: "M5 12l5 5L19 7", stroke: "currentColor", strokeWidth: "2.6", strokeLinecap: "round", strokeLinejoin: "round" })), /* @__PURE__ */ React.createElement("span", null, t("sa_" + sa)));
      })(),
      onCompare ? /* @__PURE__ */ React.createElement("button", { type: "button", className: "cmp-open-btn", onClick: onCompare }, /* @__PURE__ */ React.createElement("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M8 3v18M16 3v18M3 8h5M3 16h5M16 8h5M16 16h5", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })), t("cmp_btn")) : null,
      advInfo && advInfo.advisors.length ? /* @__PURE__ */ React.createElement("button", { type: "button", className: "adv-chip", onClick: openAdvisors }, "\u{1F9D1}\u200D\u{1F4BC} ", t("adv_section"), /* @__PURE__ */ React.createElement("span", { className: "adv-chip-n" }, advInfo.advisors.length)) : null,
      /* @__PURE__ */ React.createElement("div", { className: "sub-label" }, t("g_visas_here")),
      result.visas.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "empty" }, /* @__PURE__ */ React.createElement("h3", null, t("g_no_visas_goal")), /* @__PURE__ */ React.createElement("p", null, t("g_no_visas_goal_sub"))) : null,
      /* @__PURE__ */ React.createElement("div", { className: "vc-list" }, result.visas.map((v, i) => {
        const vStatusKey = v.status === "nodata" ? "st_nodata" : v.status === "eligible" ? "st_eligible" : v.status === "partial" ? "st_partial" : "st_ineligible";
        return (
          /* v1.39.0 — entrada escalonada de las tarjetas */
          /* @__PURE__ */ React.createElement("div", { className: "visa-card", key: v.type + i, style: { animationDelay: i * 80 + "ms" } }, /* @__PURE__ */ React.createElement("div", { className: "vc-head" }, /* @__PURE__ */ React.createElement("span", { className: "vc-icon" }, window.VISA_DATA.VISA_TYPES[v.type].icon), /* @__PURE__ */ React.createElement("span", { className: "vc-name" }, v.officialName ? tx(v.officialName) : t("vt_" + v.type)), window.EVIDENCE && v.status !== "nodata" && !(window.EVIDENCE.routes || {})[result.iso + "|" + (v.route || "")] ? /* @__PURE__ */ React.createElement("span", { className: "vc-modelled", title: t("vc_modelled_title") }, t("vc_modelled")) : null, v.apertura && v.apertura.estado === "cerrada" ? /* @__PURE__ */ React.createElement(
            "span",
            {
              className: "vc-cerrada",
              title: v.apertura.comprobado ? t("ap_comprobado") + v.apertura.comprobado : ""
            },
            v.apertura.fecha ? t("ap_cerrada_abre") + fechaCorta(v.apertura.fecha, lang) : t("ap_cerrada_sin_fecha")
          ) : null, v.apertura && v.apertura.estado === "abierta" ? /* @__PURE__ */ React.createElement(
            "span",
            {
              className: "vc-abierta",
              title: v.apertura.comprobado ? t("ap_comprobado") + v.apertura.comprobado : ""
            },
            t("ap_abierta")
          ) : null, /* @__PURE__ */ React.createElement("span", { className: "vc-stat", style: { background: statusColor(v.status, 1) } })), /* @__PURE__ */ React.createElement("div", { className: "vc-meta" }, /* @__PURE__ */ React.createElement("span", { className: "vc-meta-status", style: { color: statusColor(v.status, 1) } }, t(vStatusKey)), v.score === null ? null : /* @__PURE__ */ React.createElement("span", { className: "vc-meta-score" }, t("g_score"), ": ", v.score)), v.matched && v.matched.length ? /* @__PURE__ */ React.createElement("details", { className: "vc-acc", open: secOpen("matched", v) }, /* @__PURE__ */ React.createElement("summary", { className: "vc-acc-sum" }, /* @__PURE__ */ React.createElement("span", { className: "vc-acc-label" }, t("g_matched")), /* @__PURE__ */ React.createElement("span", { className: "vc-acc-count" }, v.matched.length)), /* @__PURE__ */ React.createElement("div", { className: "vc-acc-body vc-matched" }, v.matched.map((m, mi) => /* @__PURE__ */ React.createElement(
            EvidenceRow,
            {
              className: "vc-match-row",
              key: mi,
              t,
              lang,
              text: tx(m),
              fact: findEvidence(result.iso, v.route, profile && profile.nationality, m),
              icon: /* @__PURE__ */ React.createElement("svg", { width: "11", height: "11", viewBox: "0 0 24 24", fill: "none", style: { flexShrink: 0, marginTop: "1px" } }, /* @__PURE__ */ React.createElement("path", { d: "M5 12l5 5L19 7", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", strokeLinejoin: "round" }))
            }
          )))) : null, v.warnings && v.warnings.length ? /* @__PURE__ */ React.createElement("details", { className: "vc-acc", open: secOpen("warnings", v) }, /* @__PURE__ */ React.createElement("summary", { className: "vc-acc-sum" }, /* @__PURE__ */ React.createElement("span", { className: "vc-acc-label" }, t("g_warnings")), /* @__PURE__ */ React.createElement("span", { className: "vc-acc-count" }, v.warnings.length)), /* @__PURE__ */ React.createElement("div", { className: "vc-acc-body vc-warnings" }, v.warnings.map((w, wi) => /* @__PURE__ */ React.createElement(
            EvidenceRow,
            {
              className: "vc-warn-row",
              key: wi,
              t,
              lang,
              text: tx(w),
              fact: findEvidence(result.iso, v.route, profile && profile.nationality, w),
              icon: /* @__PURE__ */ React.createElement("svg", { width: "11", height: "11", viewBox: "0 0 24 24", fill: "none", style: { flexShrink: 0, marginTop: "1px" } }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "2" }), /* @__PURE__ */ React.createElement("path", { d: "M12 8v4M12 15.5v.5", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" }))
            }
          )))) : null, v.missing && v.missing.length ? /* @__PURE__ */ React.createElement("details", { className: "vc-acc", open: secOpen("missing", v) }, /* @__PURE__ */ React.createElement("summary", { className: "vc-acc-sum" }, /* @__PURE__ */ React.createElement("span", { className: "vc-acc-label" }, t("g_missing")), /* @__PURE__ */ React.createElement("span", { className: "vc-acc-count" }, v.missing.length)), /* @__PURE__ */ React.createElement("div", { className: "vc-acc-body missing" }, /* @__PURE__ */ React.createElement("span", { className: "lbl" }, t("g_missing")), v.missing.map((m) => /* @__PURE__ */ React.createElement("span", { className: "miss-tag", key: m }, t("rq_" + m))))) : null)
        );
      })),
      (() => {
        const adv = advInfo;
        if (!adv || !adv.advisors || !adv.advisors.length) return null;
        return /* @__PURE__ */ React.createElement("div", { className: "visa-card adv-card-app" }, /* @__PURE__ */ React.createElement("details", { className: "vc-acc adv-acc", ref: advRef }, /* @__PURE__ */ React.createElement("summary", { className: "vc-acc-sum" }, /* @__PURE__ */ React.createElement("span", { className: "vc-acc-label" }, "\u{1F9D1}\u200D\u{1F4BC} ", t("adv_section")), /* @__PURE__ */ React.createElement("span", { className: "vc-acc-count" }, adv.advisors.length)), /* @__PURE__ */ React.createElement("div", { className: "vc-acc-body adv-list" }, window.ADVISORS_APP_DEMO ? /* @__PURE__ */ React.createElement("div", { className: "adv-demo-note" }, "\u26A0 ", t("adv_demo_note")) : null, adv.advisors.map((a) => /* @__PURE__ */ React.createElement("div", { className: "adv-mini", key: a.slug }, /* @__PURE__ */ React.createElement("div", { className: "adv-mini-head" }, a.photo ? /* @__PURE__ */ React.createElement("img", { className: "adv-ava", src: a.photo, alt: "", loading: "lazy" }) : /* @__PURE__ */ React.createElement("div", { className: "adv-ava adv-ava-txt", "aria-hidden": "true" }, a.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "adv-mini-name" }, a.name), a.firm || a.city ? /* @__PURE__ */ React.createElement("div", { className: "adv-mini-firm" }, [a.firm, a.city].filter(Boolean).join(" \xB7 ")) : null, a.ratingCount ? /* @__PURE__ */ React.createElement(
          "a",
          {
            className: "adv-mini-stars",
            target: "_blank",
            rel: "noopener noreferrer",
            href: "seo/asesores.html#" + a.slug,
            title: t("adv_reviews_title")
          },
          /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, "\u2605".repeat(Math.round(a.ratingAvg)) + "\u2606".repeat(5 - Math.round(a.ratingAvg))),
          " ",
          lang === "es" ? String(a.ratingAvg).replace(".", ",") : a.ratingAvg,
          " \xB7 ",
          a.ratingCount,
          " ",
          t("adv_reviews")
        ) : null)), /* @__PURE__ */ React.createElement("div", { className: "adv-mini-row" }, /* @__PURE__ */ React.createElement(
          "a",
          {
            className: "adv-mini-lic",
            href: a.licenseUrl,
            target: "_blank",
            rel: "noopener noreferrer",
            title: t("adv_lic_title")
          },
          "\u2713 ",
          a.license,
          " \u2197"
        ), a.web ? /* @__PURE__ */ React.createElement(
          "a",
          {
            className: "adv-mini-web",
            href: a.web,
            target: "_blank",
            rel: "noopener noreferrer nofollow",
            onClick: () => {
              try {
                if (window.goatcounter) window.goatcounter.count({ path: "adv-app-" + result.iso + "-" + a.slug, event: true });
              } catch (e) {
              }
            }
          },
          t("adv_web")
        ) : null), a.langs && a.langs.length ? /* @__PURE__ */ React.createElement("div", { className: "adv-mini-langs" }, t("adv_langs"), a.langs.join(", ")) : null)), /* @__PURE__ */ React.createElement("a", { className: "adv-all", href: "seo/asesores.html#" + adv.anchor, target: "_blank", rel: "noopener noreferrer" }, t("adv_view_all")))));
      })(),
      result.synthetic ? /* @__PURE__ */ React.createElement("div", { className: "synthetic-note" }, /* @__PURE__ */ React.createElement("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none" }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "2" }), /* @__PURE__ */ React.createElement("path", { d: "M12 8v5M12 16.5v.5", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })), t("g_nodata_panel")) : null,
      /* @__PURE__ */ React.createElement(DataFreshness, { t, lang, iso: result.iso, synthetic: result.synthetic }),
      /* @__PURE__ */ React.createElement(AvisoCorreo, { t, iso: result.iso, nombrePais: result.name }),
      /* @__PURE__ */ React.createElement("div", { className: "disclaimer-long" }, /* @__PURE__ */ React.createElement("svg", { width: "11", height: "11", viewBox: "0 0 24 24", fill: "none", style: { flexShrink: 0, marginTop: "1px" } }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "2" }), /* @__PURE__ */ React.createElement("path", { d: "M12 8v5M12 16.5v.5", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })), /* @__PURE__ */ React.createElement("span", null, t("disclaimer_long"), " ", /* @__PURE__ */ React.createElement("span", { className: "legal-links" }, /* @__PURE__ */ React.createElement("a", { href: lang === "en" ? "seo/privacy.html" : "seo/privacidad.html", hrefLang: lang === "en" ? "en" : "es" }, t("legal_privacy")), " \xB7 ", /* @__PURE__ */ React.createElement("a", { href: lang === "en" ? "seo/legal-notice.html" : "seo/aviso-legal.html", hrefLang: lang === "en" ? "en" : "es" }, t("legal_notice")))))
    )
  );
}
function findEvidence(iso, route, natl, line) {
  const facts = ((window.EVIDENCE || {}).routes || {})[iso + "|" + (route || "")];
  if (!facts) return null;
  for (const f of facts) {
    if (f.n && f.n !== natl) continue;
    if (f.m.some((tok) => line.indexOf(tok) !== -1)) return f;
  }
  return null;
}
function EvidenceRow({ t, lang, className, icon, text, fact }) {
  const [open, setOpen] = React.useState(false);
  if (!fact) return /* @__PURE__ */ React.createElement("div", { className }, icon, text);
  const dateStr = fact.d ? (/* @__PURE__ */ new Date(fact.d + "T00:00:00")).toLocaleDateString(
    lang === "es" ? "es-ES" : "en-GB",
    { day: "numeric", month: "short", year: "numeric" }
  ) : null;
  return /* @__PURE__ */ React.createElement("div", { className: className + " ev-row" }, /* @__PURE__ */ React.createElement("div", { className: "ev-line" }, icon, /* @__PURE__ */ React.createElement("span", { className: "ev-text" }, text), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "ev-btn" + (open ? " ev-btn--on" : ""),
      title: t("ev_btn_title"),
      "aria-expanded": open,
      onClick: () => setOpen(!open)
    },
    /* @__PURE__ */ React.createElement("svg", { width: "11", height: "11", viewBox: "0 0 24 24", fill: "none" }, /* @__PURE__ */ React.createElement("path", { d: "M2 4h6a4 4 0 014 4v13a3 3 0 00-3-3H2V4z", stroke: "currentColor", strokeWidth: "2", strokeLinejoin: "round" }), /* @__PURE__ */ React.createElement("path", { d: "M22 4h-6a4 4 0 00-4 4v13a3 3 0 013-3h7V4z", stroke: "currentColor", strokeWidth: "2", strokeLinejoin: "round" }))
  )), open ? /* @__PURE__ */ React.createElement("div", { className: "ev-panel" }, /* @__PURE__ */ React.createElement("div", { className: "ev-quote" }, "\u201C", fact.x, "\u201D"), /* @__PURE__ */ React.createElement("div", { className: "ev-meta" }, /* @__PURE__ */ React.createElement(
    "a",
    {
      href: fact.u,
      target: "_blank",
      rel: "noopener noreferrer",
      onClick: () => wfTrack("embudo-6-profundiza")
    },
    t("ev_source"),
    " \u2197"
  ), dateStr ? /* @__PURE__ */ React.createElement("span", null, " \xB7 ", t("ev_captured"), dateStr) : null, fact.r ? /* @__PURE__ */ React.createElement("span", { className: "ev-review" }, " \xB7 ", t("ev_review")) : null)) : null);
}
function AvisoCorreo({ t, iso, nombrePais }) {
  const API = typeof window !== "undefined" && window.BOLETIN || null;
  const [correo, setCorreo] = React.useState("");
  const [acepta, setAcepta] = React.useState(false);
  const [estado, setEstado] = React.useState("");
  if (!API || !API.visible()) return null;
  const previa = API.esVistaPrevia();
  const valido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo.trim());
  const enviar = (e) => {
    e.preventDefault();
    if (!valido || !acepta || estado === "enviando") return;
    setEstado("enviando");
    API.suscribir(correo.trim(), iso).then(() => {
      setEstado("ok");
      setCorreo("");
      setAcepta(false);
    }).catch(() => setEstado("error"));
  };
  if (estado === "ok") {
    return /* @__PURE__ */ React.createElement("div", { className: "aviso-correo aviso-correo--hecho", role: "status" }, /* @__PURE__ */ React.createElement("strong", null, t("bol_revisa")), /* @__PURE__ */ React.createElement("span", null, t("bol_revisa_pie")));
  }
  return /* @__PURE__ */ React.createElement("form", { className: "aviso-correo" + (previa ? " aviso-correo--previa" : ""), onSubmit: enviar }, previa ? /* @__PURE__ */ React.createElement("div", { className: "ac-previa" }, t("bol_previa")) : null, /* @__PURE__ */ React.createElement("div", { className: "ac-titulo" }, t("bol_titulo").replace("{pais}", nombrePais || "")), /* @__PURE__ */ React.createElement("div", { className: "ac-sub" }, t("bol_sub")), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "email",
      className: "ac-input",
      value: correo,
      inputMode: "email",
      autoComplete: "email",
      placeholder: t("bol_placeholder"),
      "aria-label": t("bol_placeholder"),
      disabled: previa,
      onChange: (e) => {
        setCorreo(e.target.value);
        if (estado) setEstado("");
      }
    }
  ), /* @__PURE__ */ React.createElement("label", { className: "ac-consent" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      checked: acepta,
      disabled: previa,
      onChange: (e) => setAcepta(e.target.checked)
    }
  ), /* @__PURE__ */ React.createElement("span", null, t("bol_consent"), " ", /* @__PURE__ */ React.createElement("a", { href: "seo/privacidad.html", target: "_blank", rel: "noopener" }, t("legal_privacy")), ".")), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      className: "ac-btn",
      disabled: previa || !valido || !acepta || estado === "enviando"
    },
    estado === "enviando" ? t("bol_enviando") : t("bol_boton")
  ), estado === "error" ? /* @__PURE__ */ React.createElement("div", { className: "ac-error", role: "alert" }, t("bol_error")) : null);
}
function DataFreshness({ t, lang, iso, synthetic }) {
  if (synthetic) return null;
  const v = ((window.VERIFICATION || {}).destinations || {})[iso];
  if (!v || !v.lastCheck) {
    return /* @__PURE__ */ React.createElement("div", { className: "verified-note verified-note--demo" }, /* @__PURE__ */ React.createElement("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", style: { flexShrink: 0, marginTop: "1px" } }, /* @__PURE__ */ React.createElement("path", { d: "M12 3L2.5 20h19L12 3z", stroke: "currentColor", strokeWidth: "2", strokeLinejoin: "round" }), /* @__PURE__ */ React.createElement("path", { d: "M12 10v4M12 17v.5", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })), t("g_unverified_note"));
  }
  const dateStr = (/* @__PURE__ */ new Date(v.lastCheck + "T00:00:00")).toLocaleDateString(
    lang === "es" ? "es-ES" : "en-GB",
    { day: "numeric", month: "short", year: "numeric" }
  );
  return /* @__PURE__ */ React.createElement("div", { className: "verified-note" }, /* @__PURE__ */ React.createElement("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", style: { flexShrink: 0, marginTop: "1px" } }, /* @__PURE__ */ React.createElement("path", { d: "M5 12l5 5L19 7", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", strokeLinejoin: "round" })), /* @__PURE__ */ React.createElement("span", null, t("g_verified_prefix"), dateStr));
}
function EmptyState({ t }) {
  return /* @__PURE__ */ React.createElement("div", { className: "empty" }, /* @__PURE__ */ React.createElement("div", { className: "ic" }, /* @__PURE__ */ React.createElement("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none" }, /* @__PURE__ */ React.createElement("circle", { cx: "11", cy: "11", r: "7", stroke: "currentColor", strokeWidth: "1.8" }), /* @__PURE__ */ React.createElement("path", { d: "M16 16l4 4", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" }))), /* @__PURE__ */ React.createElement("h3", null, t("g_no_selection")), /* @__PURE__ */ React.createElement("p", null, t("g_no_selection_sub")));
}
function featureCentroid(f) {
  const g = f.geometry;
  if (!g) return null;
  let ring;
  if (g.type === "Polygon") ring = g.coordinates[0];
  else if (g.type === "MultiPolygon") {
    ring = g.coordinates.map((p) => p[0]).sort((a, b) => b.length - a.length)[0];
  }
  if (!ring || !ring.length) return null;
  let x = 0, y = 0;
  ring.forEach((c) => {
    x += c[0];
    y += c[1];
  });
  return [x / ring.length, y / ring.length];
}
Object.assign(window, { GlobeView });

/* ===== ui/App.jsx ===== */
const TWEAK_DEFAULTS = (
  /*EDITMODE-BEGIN*/
  {
    "globeStyle": "textured",
    "autoRotate": true
  }
);
function sanearPerfil(p) {
  const D = window.VISA_DATA || {};
  const base = defaultProfile();
  const dentro = (lista, v) => Array.isArray(lista) && lista.indexOf(v) !== -1;
  const codigos = (D.PASSPORTS || []).map((x) => x.code);
  const residencias = (D.RESIDENCES || D.PASSPORTS || []).map((x) => x.code);
  const out = Object.assign({}, p);
  if (!dentro(codigos, out.nationality)) out.nationality = base.nationality;
  if (!dentro(residencias, out.currentResidence)) out.currentResidence = base.currentResidence;
  if (!dentro(D.EDUCATION, out.education)) out.education = base.education;
  if (!dentro((D.ENGLISH || []).map((x) => x && x.id || x), out.english)) out.english = base.english;
  if (typeof out.age !== "number" || out.age < 16 || out.age > 70) out.age = base.age;
  if (!Array.isArray(out.visaTypes)) out.visaTypes = [];
  else if (Array.isArray(D.VISA_TYPE_IDS)) {
    out.visaTypes = out.visaTypes.filter((v) => D.VISA_TYPE_IDS.indexOf(v) !== -1);
  }
  return out;
}
function defaultProfile() {
  return {
    nationality: "ES",
    currentResidence: "ES",
    age: 28,
    situation: "alone",
    education: "university_plus",
    english: "b2",
    remoteWork: false,
    visaTypes: []
    /* v1.21.0 — sin preselección (feedback de usuarios); vacío = se evalúan todas */
  };
}
const STORE_PROFILE = "wayfare_profile_v1";
const STORE_SUBMITTED = "wayfare_submitted_v1";
function loadStored(key) {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : null;
  } catch (e) {
    return null;
  }
}
function saveStored(key, value) {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
  }
}
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [lang, setLangState] = React.useState(function() {
    try {
      const g = localStorage.getItem("wayfare_lang_v1");
      if (g === "es" || g === "en") return g;
    } catch (e) {
    }
    try {
      if ((navigator.language || "").toLowerCase().indexOf("es") === 0) return "es";
    } catch (e) {
    }
    return "en";
  });
  const langRef = React.useRef(lang);
  langRef.current = lang;
  const setLang = React.useCallback(function(l) {
    setLangState(l);
    try {
      localStorage.setItem("wayfare_lang_v1", l);
    } catch (e) {
    }
  }, []);
  React.useEffect(function() {
    try {
      document.documentElement.lang = lang;
    } catch (e) {
    }
  }, [lang]);
  const [submitted, setSubmitted] = React.useState(() => {
    const s = loadStored(STORE_SUBMITTED);
    if (s && s.profile && s.version) return s;
    return { profile: defaultProfile(), version: 1, demo: true };
  });
  const [screen, setScreen] = React.useState("globe");
  const [profile, setProfile] = React.useState(() => sanearPerfil(Object.assign(defaultProfile(), loadStored(STORE_PROFILE) || {})));
  React.useEffect(() => {
    const id = setTimeout(() => saveStored(STORE_PROFILE, profile), 250);
    return () => clearTimeout(id);
  }, [profile]);
  React.useEffect(() => {
    if (!(submitted && submitted.demo)) saveStored(STORE_SUBMITTED, submitted);
  }, [submitted]);
  React.useEffect(() => {
    wfTrack(submitted && !submitted.demo ? "embudo-0-retorno" : "embudo-1-cuestionario");
  }, []);
  const resetAll = React.useCallback(() => {
    const tabla = window.I18N && window.I18N[langRef.current] || {};
    const aviso = tabla.q_reset_confirm || "This will delete your saved profile and your map on this device. Continue?";
    if (typeof window.confirm === "function" && !window.confirm(aviso)) return;
    saveStored(STORE_PROFILE, null);
    saveStored(STORE_SUBMITTED, null);
    setProfile(defaultProfile());
    setSubmitted(null);
    setScreen("questionnaire");
    window.scrollTo(0, 0);
  }, []);
  const backToMap = React.useCallback(() => {
    setScreen("globe");
    setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
  }, []);
  const discardAndBack = React.useCallback(() => {
    if (submitted) setProfile(Object.assign({}, submitted.profile));
    backToMap();
  }, [submitted, backToMap]);
  const tr = React.useCallback((key) => {
    const tbl = window.I18N[lang] || window.I18N.en;
    return tbl[key] != null ? tbl[key] : key;
  }, [lang]);
  const onStage = screen === "globe" || screen === "processing";
  return /* @__PURE__ */ React.createElement("div", { className: "app" }, /* @__PURE__ */ React.createElement("header", { className: "topbar" + (onStage ? " on-stage" : "") }, /* @__PURE__ */ React.createElement("div", { className: "brand" }, /* @__PURE__ */ React.createElement("span", { className: "brand-mark" }), tr("brand"), /* @__PURE__ */ React.createElement(
    "span",
    {
      className: "version-badge",
      title: tr("app_version_title"),
      style: {
        marginLeft: 8,
        padding: "1px 7px",
        borderRadius: 999,
        font: "600 10px/1.6 var(--font-body, sans-serif)",
        color: "var(--accent)",
        border: "1px solid var(--accent-deep)",
        background: "var(--accent-tint)",
        letterSpacing: "0.04em",
        verticalAlign: "middle",
        opacity: 0.9
      }
    },
    "v",
    window.WAYFARE_VERSION || "?"
  )), /* @__PURE__ */ React.createElement("div", { className: "topbar-right" }, screen === "globe" && /* @__PURE__ */ React.createElement("button", { className: "btn-edit-topbar", onClick: () => setScreen("questionnaire") }, /* @__PURE__ */ React.createElement("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }), /* @__PURE__ */ React.createElement("path", { d: "M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })), tr("g_restart")), /* @__PURE__ */ React.createElement("div", { className: "lang" }, ["en", "es"].map((l) => /* @__PURE__ */ React.createElement("button", { key: l, className: lang === l ? "active" : "", onClick: () => setLang(l) }, l.toUpperCase()))))), /* @__PURE__ */ React.createElement("div", { className: "screen" }, screen === "questionnaire" && /* @__PURE__ */ React.createElement(
    Questionnaire,
    {
      t: tr,
      lang,
      profile,
      setProfile,
      onSubmit: () => {
        window.scrollTo(0, 0);
        wfTrack(submitted && !submitted.demo ? "embudo-3b-reenvio" : "embudo-3-envio");
        setSubmitted({ profile: Object.assign({}, profile), version: (submitted ? submitted.version : 0) + 1 });
        setScreen("processing");
      },
      onBack: submitted ? backToMap : null,
      onDiscard: submitted ? discardAndBack : null,
      dirty: submitted ? JSON.stringify(profile) !== JSON.stringify(submitted.profile) : false,
      onReset: resetAll
    }
  ), screen === "processing" && /* @__PURE__ */ React.createElement(Processing, { t: tr, onDone: () => {
    wfTrack("embudo-4-mapa");
    setScreen("globe");
  } }), submitted && screen !== "processing" && /* @__PURE__ */ React.createElement(
    "div",
    {
      className: submitted.demo ? "demo-mode" : void 0,
      style: { display: screen === "globe" ? "contents" : "none" }
    },
    /* @__PURE__ */ React.createElement(
      GlobeView,
      {
        key: submitted.version,
        t: tr,
        lang,
        profile: submitted.profile,
        globeStyle: t.globeStyle,
        visible: screen === "globe",
        onEditProfile: () => setScreen("questionnaire")
      }
    ),
    submitted.demo && screen === "globe" ? (() => {
      const empezar = () => {
        wfTrack("ejemplo-cta");
        setScreen("questionnaire");
        window.scrollTo(0, 0);
      };
      return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "demo-banner" }, /* @__PURE__ */ React.createElement("div", { className: "demo-banner-row" }, /* @__PURE__ */ React.createElement("span", { className: "demo-banner-tag" }, tr("demo_map_tag")), /* @__PURE__ */ React.createElement("span", { className: "demo-banner-text" }, tr("demo_map_text"))), /* @__PURE__ */ React.createElement("button", { type: "button", className: "demo-banner-cta", onClick: empezar }, tr("demo_map_cta"), /* @__PURE__ */ React.createElement("span", { className: "cta-arrow", "aria-hidden": "true" }, "\u2192"))), /* @__PURE__ */ React.createElement("button", { type: "button", className: "demo-banner-cta demo-cta-float", onClick: empezar }, tr("demo_map_cta"), /* @__PURE__ */ React.createElement("span", { className: "cta-arrow", "aria-hidden": "true" }, "\u2192")));
    })() : null
  )), /* @__PURE__ */ React.createElement(TweaksPanel, null, /* @__PURE__ */ React.createElement(TweakSection, { label: "Globe" }), /* @__PURE__ */ React.createElement(
    TweakRadio,
    {
      label: "Texture",
      value: t.globeStyle,
      options: ["textured", "night", "dark"],
      onChange: (v) => setTweak("globeStyle", v)
    }
  )));
}
function hexToRgb(h) {
  const m = h.replace("#", "");
  const n = parseInt(m.length === 3 ? m.split("").map((c) => c + c).join("") : m, 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
}
function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");
}
function shade(hex, amt) {
  const [r, g, b] = hexToRgb(hex);
  const f = amt < 0 ? 1 + amt : 1;
  const t2 = amt < 0 ? 0 : 255 * amt;
  return rgbToHex(r * f + t2, g * f + t2, b * f + t2);
}
function tint(hex, amt) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
}
class RedDeSeguridad extends React.Component {
  constructor(props) {
    super(props);
    this.state = { roto: false };
  }
  static getDerivedStateFromError() {
    return { roto: true };
  }
  componentDidCatch(error, info) {
    console.error("[Wayfare] la interfaz lanz\xF3 una excepci\xF3n", error, info);
    try {
      if (window.wfTrack) window.wfTrack("error-pantalla");
    } catch (e) {
    }
  }
  render() {
    if (!this.state.roto) return this.props.children;
    let idioma = "es";
    try {
      const g = localStorage.getItem("wayfare_lang_v1");
      idioma = g === "es" || g === "en" ? g : (navigator.language || "").toLowerCase().indexOf("es") === 0 ? "es" : "en";
    } catch (e) {
    }
    const tabla = window.I18N && window.I18N[idioma] || {};
    const tr = (k, alt) => tabla[k] || alt;
    const empezarDeCero = () => {
      try {
        localStorage.removeItem("wayfare_profile_v1");
        localStorage.removeItem("wayfare_submitted_v1");
      } catch (e) {
      }
      window.location.reload();
    };
    return /* @__PURE__ */ React.createElement("div", { className: "crash-screen", role: "alert" }, /* @__PURE__ */ React.createElement("h1", { className: "crash-title" }, tr("crash_title", "Se ha roto algo por nuestra parte")), /* @__PURE__ */ React.createElement("p", { className: "crash-text" }, tr("crash_text", "Lo sentimos: esta pantalla no ha cargado. Tu perfil guardado est\xE1 intacto.")), /* @__PURE__ */ React.createElement("div", { className: "crash-actions" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn-primary", onClick: () => window.location.reload() }, tr("crash_reload", "Recargar")), /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn-map-back", onClick: empezarDeCero }, tr("crash_reset", "Recargar y empezar de cero"))));
  }
}
ReactDOM.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ React.createElement(RedDeSeguridad, null, /* @__PURE__ */ React.createElement(App, null))
);

