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
function Field({ label, hint, full, children }) {
  return /* @__PURE__ */ React.createElement("div", { className: "field" + (full ? " full" : "") }, /* @__PURE__ */ React.createElement("label", null, label), children, hint ? /* @__PURE__ */ React.createElement("span", { className: "hint" }, hint) : null);
}
function SelectControl({ value, onChange, options }) {
  return /* @__PURE__ */ React.createElement("div", { className: "control has-caret" }, /* @__PURE__ */ React.createElement("select", { value, onChange: (e) => onChange(e.target.value) }, options.map((o) => /* @__PURE__ */ React.createElement("option", { key: o.value, value: o.value }, o.label))));
}
function TextControl({ value, onChange, type, placeholder, prefix }) {
  return /* @__PURE__ */ React.createElement("div", { className: "control" + (prefix ? " with-prefix" : "") }, prefix ? /* @__PURE__ */ React.createElement("span", { className: "prefix" }, prefix) : null, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: type || "text",
      value,
      placeholder: placeholder || "",
      onChange: (e) => onChange(e.target.value)
    }
  ));
}
function Segmented({ value, onChange, options }) {
  return /* @__PURE__ */ React.createElement("div", { className: "seg" }, options.map((o) => /* @__PURE__ */ React.createElement(
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
function Slider({ value, onChange, min, max, step, format }) {
  return /* @__PURE__ */ React.createElement("div", { className: "range-row" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "range",
      min,
      max,
      step: step || 1,
      value,
      onChange: (e) => onChange(Number(e.target.value))
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "range-val" }, format ? format(value) : value));
}
function Chips({ selected, onToggle, options }) {
  const set = new Set(selected);
  return /* @__PURE__ */ React.createElement("div", { className: "chips" }, options.map((o) => /* @__PURE__ */ React.createElement(
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
Object.assign(window, {
  isoToFlag,
  fmt,
  Field,
  SelectControl,
  TextControl,
  Segmented,
  Slider,
  Chips,
  destroyGlobe
});

/* ===== ui/BackgroundGlobe.jsx ===== */
const BG_GLOBE_TEXTURE = "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";
const BG_BUMP_URL = "https://unpkg.com/three-globe/example/img/earth-topology.png";
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
    const host = hostRef.current;
    if (!host || globeRef.current) return;
    const world = window.Globe()(host).width(host.clientWidth).height(host.clientHeight).backgroundColor("rgba(0,0,0,0)").globeImageUrl(BG_GLOBE_TEXTURE).bumpImageUrl(BG_BUMP_URL).showAtmosphere(true).atmosphereColor("#4a8c80").atmosphereAltitude(0.22);
    world.controls().autoRotate = true;
    world.controls().autoRotateSpeed = 0.35;
    world.controls().enableZoom = false;
    world.controls().enableRotate = false;
    world.controls().enablePan = false;
    world.pointOfView({ lat: 20, lng: 10, altitude: 1.1 }, 0);
    globeRef.current = world;
    const onResize = () => {
      world.width(host.clientWidth).height(host.clientHeight);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      destroyGlobe(world, host);
      globeRef.current = null;
    };
  }, []);
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
function Questionnaire({ t, lang, profile, setProfile, onSubmit, onBack, dirty, onReset }) {
  const D = window.VISA_DATA;
  const set = (k, v) => setProfile((p) => Object.assign({}, p, { [k]: v }));
  const toggleIn = (k, v) => setProfile((p) => {
    const arr = p[k] || [];
    const next = arr.includes(v) ? arr.filter((x) => x !== v) : arr.concat(v);
    return Object.assign({}, p, { [k]: next });
  });
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
  const visaOpts = D.VISA_TYPE_IDS.map((id) => ({
    value: id,
    label: t("vt_" + id),
    vt: D.VISA_TYPES[id].icon
  }));
  return /* @__PURE__ */ React.createElement("div", { className: "q-scroll" }, /* @__PURE__ */ React.createElement(BackgroundGlobe, null), /* @__PURE__ */ React.createElement("div", { className: "q-wrap" }, /* @__PURE__ */ React.createElement("div", { className: "q-head" }, onBack ? /* @__PURE__ */ React.createElement("div", { className: "q-back-wrap" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "q-back-btn",
      disabled: dirty,
      onClick: dirty ? void 0 : onBack
    },
    /* @__PURE__ */ React.createElement("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M19 12H5M11 18l-6-6 6-6", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" })),
    t("q_back_map")
  ), dirty ? /* @__PURE__ */ React.createElement("p", { className: "q-back-hint" }, t("q_back_dirty")) : null) : null, /* @__PURE__ */ React.createElement("span", { className: "q-eyebrow" }, /* @__PURE__ */ React.createElement("span", { className: "dot" }), t("g_simulated")), /* @__PURE__ */ React.createElement("h1", null, t("q_title")), /* @__PURE__ */ React.createElement("p", null, t("q_sub"))), /* @__PURE__ */ React.createElement("section", { className: "section" }, /* @__PURE__ */ React.createElement("div", { className: "section-head" }, /* @__PURE__ */ React.createElement("span", { className: "section-num" }, "01"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", null, t("sec_identity")), /* @__PURE__ */ React.createElement("p", null, t("sec_identity_sub")))), /* @__PURE__ */ React.createElement("div", { className: "grid" }, /* @__PURE__ */ React.createElement(Field, { label: t("f_nationality") }, /* @__PURE__ */ React.createElement(SelectControl, { value: profile.nationality, onChange: (v) => set("nationality", v), options: passportOpts })), /* @__PURE__ */ React.createElement(Field, { label: t("f_residence") }, /* @__PURE__ */ React.createElement(SelectControl, { value: profile.currentResidence, onChange: (v) => set("currentResidence", v), options: residenceOpts })), /* @__PURE__ */ React.createElement(Field, { label: t("f_age") }, /* @__PURE__ */ React.createElement(
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
  )))), /* @__PURE__ */ React.createElement("section", { className: "section" }, /* @__PURE__ */ React.createElement("div", { className: "section-head" }, /* @__PURE__ */ React.createElement("span", { className: "section-num" }, "04"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", null, t("sec_intent")), /* @__PURE__ */ React.createElement("p", null, t("sec_intent_sub")))), /* @__PURE__ */ React.createElement("div", { className: "grid" }, /* @__PURE__ */ React.createElement(Field, { label: t("f_visas"), hint: t("f_visas_hint"), full: true }, /* @__PURE__ */ React.createElement(Chips, { selected: profile.visaTypes, onToggle: (v) => toggleIn("visaTypes", v), options: visaOpts })))), /* @__PURE__ */ React.createElement("div", { className: "submitbar" }, /* @__PURE__ */ React.createElement("button", { className: "btn-primary", onClick: onSubmit }, t("submit"), /* @__PURE__ */ React.createElement("svg", { className: "arr", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none" }, /* @__PURE__ */ React.createElement("path", { d: "M5 12h14M13 6l6 6-6 6", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" }))), /* @__PURE__ */ React.createElement("p", { className: "disclaimer-short" }, t("disclaimer_short")), onReset ? /* @__PURE__ */ React.createElement("button", { type: "button", className: "q-reset-link", onClick: onReset }, t("q_reset")) : null)));
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
const GEOJSON_URL = "https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson";
const MICRO_DEST_COORDS = {
  SG: { lat: 1.35, lng: 103.82 },
  MT: { lat: 35.94, lng: 14.38 },
  LI: { lat: 47.16, lng: 9.55 }
};
const GLOBE_TEXTURES = {
  textured: "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
  night: "https://unpkg.com/three-globe/example/img/earth-night.jpg",
  dark: "https://unpkg.com/three-globe/example/img/earth-dark.jpg"
};
const BUMP_URL = "https://unpkg.com/three-globe/example/img/earth-topology.png";
const STATUS_RGB = {
  eligible: [38, 140, 90],
  /* sage-teal green — softer than #1f9d57     */
  partial: [190, 130, 30],
  /* warm ochre — less saturated amber         */
  ineligible: [170, 85, 55]
  /* muted terracotta                          */
};
const statusColor = (s, a) => {
  const c = STATUS_RGB[s] || [120, 130, 128];
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
};
const NAME_ISO_FIX = { France: "FR", Norway: "NO", Kosovo: "XK", "N. Cyprus": "CY", Somaliland: "SO" };
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
function GlobeView({ t, lang, profile, onEditProfile, globeStyle }) {
  const hostRef = React.useRef(null);
  const globeRef = React.useRef(null);
  const [features, setFeatures] = React.useState(null);
  const [results, setResults] = React.useState(null);
  const [micros, setMicros] = React.useState([]);
  const [eligError, setEligError] = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const [hoverIdx, setHoverIdx] = React.useState(null);
  const [hoverData, setHoverData] = React.useState(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const revealRef = React.useRef(1.01);
  const [revealNum, setRevealNum] = React.useState(null);
  const [compareIso, setCompareIso] = React.useState(null);
  const selRef = React.useRef(null);
  const hoverRef = React.useRef(null);
  const mousePosRef = React.useRef({ x: 0, y: 0 });
  React.useEffect(() => {
    let alive = true;
    (window.__WAYFARE_GEOJSON ? Promise.resolve(window.__WAYFARE_GEOJSON) : fetch(GEOJSON_URL).then((r) => r.json()).then((gj) => window.__WAYFARE_GEOJSON = gj)).then((gj) => {
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
    }).catch((e) => console.error("GeoJSON load failed", e));
    return () => {
      alive = false;
    };
  }, []);
  React.useEffect(() => {
    if (!features || !results || !hostRef.current || globeRef.current) return;
    const host = hostRef.current;
    const G = window.Globe;
    const world = G()(host).width(host.clientWidth).height(host.clientHeight).backgroundColor("rgba(0,0,0,0)").globeImageUrl(GLOBE_TEXTURES[globeStyle] || GLOBE_TEXTURES.textured).bumpImageUrl(BUMP_URL).showAtmosphere(true).atmosphereColor("#7ab8d4").atmosphereAltitude(0.26).polygonsData(features).polygonCapColor(capColor).polygonSideColor(() => "rgba(0,0,0,0.06)").polygonStrokeColor(strokeColor).polygonAltitude(altOf).polygonsTransitionDuration(220).onPolygonHover((d) => {
      hoverRef.current = d;
      setHoverIdx(d ? d.__id : null);
      host.style.cursor = d ? "pointer" : "grab";
      world.polygonAltitude(altOf).polygonCapColor(capColor).polygonStrokeColor(strokeColor);
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
    }).onPolygonClick((d) => selectFeature(d)).labelsData(micros).labelLat((d) => d.lat).labelLng((d) => d.lng).labelText((d) => countryName(d.iso, lang) || d.iso).labelSize(0.65).labelDotRadius(0.42).labelAltitude(8e-3).labelResolution(2).labelColor((d) => d.r && !d.r.synthetic ? statusColor(d.r.status, 0.95) : "rgba(148,163,160,0.85)").onLabelHover((d) => {
      host.style.cursor = d ? "pointer" : "grab";
      if (d) {
        setHoverData({
          name: countryName(d.iso, lang) || d.iso,
          iso: d.iso,
          status: d.r ? d.r.status : null,
          x: mousePosRef.current.x,
          y: mousePosRef.current.y
        });
      } else {
        setHoverData(null);
      }
    }).onLabelClick((d) => {
      if (!d.r) return;
      selRef.current = null;
      setSelected(Object.assign({}, d.r, { iso: d.iso }));
      setDetailOpen(true);
      world.controls().autoRotate = false;
      world.pointOfView({ lat: d.lat, lng: d.lng - 12, altitude: 1.2 }, 900);
    });
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
        let eligible = 0, partial = 0;
        features.forEach((f) => {
          if (f.__rev <= revealRef.current) {
            const r = results[f.__id];
            if (r && !r.synthetic) {
              if (r.status === "eligible") eligible++;
              else if (r.status === "partial") partial++;
            }
          }
        });
        setRevealNum({ eligible, partial, done: p >= 1 });
        if (p < 1) {
          revealTimer = setTimeout(tick, 90);
        } else {
          revealRef.current = 1.01;
          world.polygonCapColor(capColor);
          revealTimer = setTimeout(() => setRevealNum(null), 4500);
        }
      };
      tick();
    }
    globeRef.current = world;
    globeRef.current.__select = (d) => selectFeature(d);
    globeRef.current.__byIso = (iso) => features.find((f) => f.__iso === iso);
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
    const onResize = () => {
      world.width(host.clientWidth).height(host.clientHeight);
    };
    window.addEventListener("resize", onResize);
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
      const real = r && !r.synthetic && window.Eligibility.hasRealRules(d.__iso || r.iso);
      if (!real) return `rgba(148,163,160,${isSel ? 0.45 : isHov ? 0.32 : 0.1})`;
      return statusColor(r.status, isSel ? 0.88 : isHov ? 0.75 : 0.62);
    }
    function selectFeature(d) {
      selRef.current = d;
      const r = results[d.__id];
      setSelected(r ? Object.assign({}, r, { iso: d.__iso || r.iso }) : null);
      setDetailOpen(true);
      world.controls().autoRotate = false;
      world.polygonAltitude(altOf).polygonCapColor(capColor).polygonStrokeColor(strokeColor);
      try {
        const coords = featureCentroid(d);
        if (coords) {
          world.pointOfView({ lat: coords[1], lng: coords[0] - 12, altitude: 1.4 }, 900);
        }
      } catch (e) {
      }
    }
    return () => {
      host.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      if (revealTimer) clearTimeout(revealTimer);
      destroyGlobe(world, host);
      globeRef.current = null;
    };
  }, [features, results]);
  React.useEffect(() => {
    if (globeRef.current) {
      globeRef.current.globeImageUrl(GLOBE_TEXTURES[globeStyle] || GLOBE_TEXTURES.textured);
    }
  }, [globeStyle]);
  React.useEffect(() => {
    if (globeRef.current && results) {
      globeRef.current.polygonCapColor(globeRef.current.polygonCapColor());
    }
  }, [hoverIdx]);
  const tally = results ? window.Eligibility.tally(results) : null;
  const recs = results ? window.Eligibility.topRecommendations(results, 6) : [];
  const pickIso = (iso) => {
    const f = globeRef.current && globeRef.current.__byIso(iso);
    if (f && globeRef.current.__select) globeRef.current.__select(f);
  };
  const closeDetail = () => {
    selRef.current = null;
    setSelected(null);
    setDetailOpen(false);
    if (globeRef.current) {
      if (globeRef.current.__deselect) globeRef.current.__deselect();
      globeRef.current.pointOfView({ lat: 20, lng: 10, altitude: 1.7 }, 900);
    }
  };
  return /* @__PURE__ */ React.createElement("div", { className: "globe-stage" + (detailOpen ? " detail-open" : "") }, /* @__PURE__ */ React.createElement(GlobeStars, null), /* @__PURE__ */ React.createElement("div", { className: "globe-host" + (detailOpen ? " globe-host--shifted" : ""), ref: hostRef }), hoverData && !detailOpen ? /* @__PURE__ */ React.createElement("div", { className: "globe-tooltip", style: { left: hoverData.x, top: hoverData.y }, "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("span", { className: "gt-flag" }, isoToFlag(hoverData.iso)), /* @__PURE__ */ React.createElement("span", { className: "gt-name" }, countryName(hoverData.iso, lang) || hoverData.name)) : null, revealNum && !detailOpen ? /* @__PURE__ */ React.createElement("div", { className: "reveal-counter" + (revealNum.done ? " reveal-counter--done" : "") }, revealNum.eligible > 0 ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "rc-num" }, revealNum.eligible), " ", t("rv_eligible")) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "rc-num" }, revealNum.partial), " ", t("rv_partial"))) : null, !detailOpen ? eligError ? /* @__PURE__ */ React.createElement("div", { className: "globe-hint globe-hint--error" }, /* @__PURE__ */ React.createElement("span", { className: "pin pin--error" }), t("elg_load_error")) : !features ? /* @__PURE__ */ React.createElement("div", { className: "globe-hint" }, /* @__PURE__ */ React.createElement("span", { className: "pin" }), t("p_title"), "\u2026") : /* @__PURE__ */ React.createElement("div", { className: "globe-hint" }, /* @__PURE__ */ React.createElement("span", { className: "pin" }), t("g_click_hint")) : null, tally && !detailOpen ? /* @__PURE__ */ React.createElement("div", { className: "legend" }, /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("span", { className: "sw", style: { background: statusColor("eligible", 1) } }), t("g_legend_eligible")), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("span", { className: "sw", style: { background: statusColor("partial", 1) } }), t("g_legend_partial")), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("span", { className: "sw", style: { background: statusColor("ineligible", 1) } }), t("g_legend_unlikely")), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("span", { className: "sw", style: { background: "rgba(148,163,160,0.55)" } }), t("g_legend_nodata"))) : null, selected && detailOpen ? /* @__PURE__ */ React.createElement("aside", { className: "detail-panel" }, /* @__PURE__ */ React.createElement("div", { className: "detail-panel-inner" }, /* @__PURE__ */ React.createElement("button", { className: "detail-panel-close", onClick: closeDetail, "aria-label": "Close" }, /* @__PURE__ */ React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", style: { pointerEvents: "none" } }, /* @__PURE__ */ React.createElement("path", { d: "M18 6L6 18M6 6l12 12", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round" }))), /* @__PURE__ */ React.createElement(
    CountryDetail,
    {
      t,
      lang,
      result: selected,
      profile,
      onCompare: () => setCompareIso(selected.iso === "NZ" ? "AU" : "NZ")
    }
  ))) : null, selected && compareIso ? /* @__PURE__ */ React.createElement(
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
  const D = window.VISA_DATA;
  const opciones = D.COUNTRIES.filter((c) => c.iso !== isoA && window.Eligibility.hasRealRules(c.iso)).map((c) => ({ iso: c.iso, nombre: countryName(c.iso, lang) || c.name })).sort((a, b) => a.nombre.localeCompare(b.nombre));
  const res = window.Eligibility.evaluateAll(
    [{ id: "a", iso: isoA, name: isoA }, { id: "b", iso: isoB, name: isoB }],
    profile
  );
  const A = res.a, B = res.b;
  const tipos = [];
  for (const v of (A.visas || []).concat(B.visas || [])) {
    if (!tipos.includes(v.type)) tipos.push(v.type);
  }
  const celda = (r, tipo) => {
    const v = (r.visas || []).find((x) => x.type === tipo);
    if (!v) return /* @__PURE__ */ React.createElement("div", { className: "cmp-cell cmp-cell--empty" }, "\u2014");
    const sk = v.status === "eligible" ? "st_eligible" : v.status === "partial" ? "st_partial" : "st_ineligible";
    return /* @__PURE__ */ React.createElement("div", { className: "cmp-cell" }, /* @__PURE__ */ React.createElement("span", { className: "cmp-pill", style: {
      background: `rgba(${STATUS_RGB[v.status].join(",")},0.16)`,
      color: statusColor(v.status, 1)
    } }, /* @__PURE__ */ React.createElement("span", { className: "sw", style: { background: statusColor(v.status, 1) } }), t(sk), " \xB7 ", v.score), /* @__PURE__ */ React.createElement("span", { className: "cmp-name" }, v.officialName || t("vt_" + v.type)));
  };
  return /* @__PURE__ */ React.createElement("div", { className: "cmp-overlay", onClick: (e) => {
    if (e.target === e.currentTarget) onClose();
  } }, /* @__PURE__ */ React.createElement("div", { className: "cmp-card", role: "dialog", "aria-label": t("cmp_title") }, /* @__PURE__ */ React.createElement("button", { className: "detail-panel-close", onClick: onClose, "aria-label": "Close" }, /* @__PURE__ */ React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", style: { pointerEvents: "none" } }, /* @__PURE__ */ React.createElement("path", { d: "M18 6L6 18M6 6l12 12", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round" }))), /* @__PURE__ */ React.createElement("h2", { className: "cmp-title" }, t("cmp_title")), /* @__PURE__ */ React.createElement("div", { className: "cmp-grid" }, /* @__PURE__ */ React.createElement("div", { className: "cmp-head" }), /* @__PURE__ */ React.createElement("div", { className: "cmp-head" }, isoToFlag(isoA), " ", countryName(isoA, lang) || isoA), /* @__PURE__ */ React.createElement("div", { className: "cmp-head" }, /* @__PURE__ */ React.createElement(
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
  function tx(value) {
    if (!value) return "";
    var translated = t(value);
    return translated && translated !== value ? translated : value;
  }
  var isMobile = typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(max-width: 560px)").matches : false;
  function secOpen(kind, v) {
    if (!isMobile) return true;
    if (kind === "missing") return !!(v.missing && v.missing.length);
    return false;
  }
  const statusKey = result.status === "eligible" ? "st_eligible" : result.status === "partial" ? "st_partial" : "st_ineligible";
  const pillColor = STATUS_RGB[result.status];
  return (
    /* v1.39.0 — pulso de celebración cuando el destino es «probablemente elegible» */
    /* @__PURE__ */ React.createElement("div", { className: "cd-root" + (result.status === "eligible" ? " detail-celebrate" : "") }, /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "detail-flag-banner",
        "aria-hidden": "true",
        style: { backgroundImage: "linear-gradient(to right, rgba(8,16,14,0.94) 0%, rgba(8,16,14,0.62) 42%, rgba(8,16,14,0.12) 78%, rgba(8,16,14,0) 100%),url(assets/flags/" + String(result.iso || "").toLowerCase() + ".svg)" }
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "detail-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "nm" }, countryName(result.iso, lang) || result.name), /* @__PURE__ */ React.createElement("div", { className: "rg" }, t("rg_" + (result.region || "other"))), /* @__PURE__ */ React.createElement("span", { className: "status-pill", style: {
      background: `linear-gradient(rgba(${pillColor[0]},${pillColor[1]},${pillColor[2]},0.20), rgba(${pillColor[0]},${pillColor[1]},${pillColor[2]},0.20)), rgba(8,16,14,0.78)`,
      color: statusColor(result.status, 1)
    } }, /* @__PURE__ */ React.createElement("span", { className: "sw", style: { background: statusColor(result.status, 1) } }), t(statusKey)))), (() => {
      const sa = profile && window.Eligibility.specialAccess(profile.nationality, result.iso);
      if (!sa) return null;
      return /* @__PURE__ */ React.createElement("div", { className: "special-access-note" }, /* @__PURE__ */ React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", style: { flexShrink: 0, marginTop: "2px" } }, /* @__PURE__ */ React.createElement("path", { d: "M5 12l5 5L19 7", stroke: "currentColor", strokeWidth: "2.6", strokeLinecap: "round", strokeLinejoin: "round" })), /* @__PURE__ */ React.createElement("span", null, t("sa_" + sa)));
    })(), onCompare ? /* @__PURE__ */ React.createElement("button", { type: "button", className: "cmp-open-btn", onClick: onCompare }, /* @__PURE__ */ React.createElement("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M8 3v18M16 3v18M3 8h5M3 16h5M16 8h5M16 16h5", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })), t("cmp_btn")) : null, /* @__PURE__ */ React.createElement("div", { className: "sub-label" }, t("g_visas_here")), result.visas.map((v, i) => {
      const vStatusKey = v.status === "eligible" ? "st_eligible" : v.status === "partial" ? "st_partial" : "st_ineligible";
      return (
        /* v1.39.0 — entrada escalonada de las tarjetas */
        /* @__PURE__ */ React.createElement("div", { className: "visa-card", key: v.type + i, style: { animationDelay: i * 80 + "ms" } }, /* @__PURE__ */ React.createElement("div", { className: "vc-head" }, /* @__PURE__ */ React.createElement("span", { className: "vc-icon" }, window.VISA_DATA.VISA_TYPES[v.type].icon), /* @__PURE__ */ React.createElement("span", { className: "vc-name" }, v.officialName ? tx(v.officialName) : t("vt_" + v.type)), /* @__PURE__ */ React.createElement("span", { className: "vc-stat", style: { background: statusColor(v.status, 1) } })), /* @__PURE__ */ React.createElement("div", { className: "vc-meta" }, /* @__PURE__ */ React.createElement("span", { className: "vc-meta-status", style: { color: statusColor(v.status, 1) } }, t(vStatusKey)), /* @__PURE__ */ React.createElement("span", { className: "vc-meta-score" }, t("g_score"), ": ", v.score)), v.matched && v.matched.length ? /* @__PURE__ */ React.createElement("details", { className: "vc-acc", open: secOpen("matched", v) }, /* @__PURE__ */ React.createElement("summary", { className: "vc-acc-sum" }, /* @__PURE__ */ React.createElement("span", { className: "vc-acc-label" }, t("g_matched")), /* @__PURE__ */ React.createElement("span", { className: "vc-acc-count" }, v.matched.length)), /* @__PURE__ */ React.createElement("div", { className: "vc-acc-body vc-matched" }, v.matched.map((m, mi) => /* @__PURE__ */ React.createElement(
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
    }), result.synthetic ? /* @__PURE__ */ React.createElement("div", { className: "synthetic-note" }, /* @__PURE__ */ React.createElement("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none" }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "2" }), /* @__PURE__ */ React.createElement("path", { d: "M12 8v5M12 16.5v.5", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })), t("g_simulated")) : null, /* @__PURE__ */ React.createElement(DataFreshness, { t, lang, iso: result.iso, synthetic: result.synthetic }), /* @__PURE__ */ React.createElement("div", { className: "disclaimer-long" }, /* @__PURE__ */ React.createElement("svg", { width: "11", height: "11", viewBox: "0 0 24 24", fill: "none", style: { flexShrink: 0, marginTop: "1px" } }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "2" }), /* @__PURE__ */ React.createElement("path", { d: "M12 8v5M12 16.5v.5", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })), t("disclaimer_long")))
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
  )), open ? /* @__PURE__ */ React.createElement("div", { className: "ev-panel" }, /* @__PURE__ */ React.createElement("div", { className: "ev-quote" }, "\u201C", fact.x, "\u201D"), /* @__PURE__ */ React.createElement("div", { className: "ev-meta" }, /* @__PURE__ */ React.createElement("a", { href: fact.u, target: "_blank", rel: "noopener noreferrer" }, t("ev_source"), " \u2197"), dateStr ? /* @__PURE__ */ React.createElement("span", null, " \xB7 ", t("ev_captured"), dateStr) : null, fact.r ? /* @__PURE__ */ React.createElement("span", { className: "ev-review" }, " \xB7 ", t("ev_review")) : null)) : null);
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
  return /* @__PURE__ */ React.createElement("div", { className: "verified-note" }, /* @__PURE__ */ React.createElement("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", style: { flexShrink: 0, marginTop: "1px" } }, /* @__PURE__ */ React.createElement("path", { d: "M5 12l5 5L19 7", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", strokeLinejoin: "round" })), /* @__PURE__ */ React.createElement("span", null, t("g_verified_prefix"), dateStr, v.monitored ? " \xB7 " + t("g_verified_monitor") : "", " \xB7 ", /* @__PURE__ */ React.createElement("a", { className: "method-link", href: "seo/como-verificamos.html", target: "_blank", rel: "noopener noreferrer" }, t("g_method_link"))));
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
    "accent": "#1f6f63",
    "globeStyle": "textured",
    "autoRotate": true
  }
);
const ACCENTS = ["#1f6f63", "#2a6fdb", "#5b54e6", "#c2410c", "#0e7490"];
function defaultProfile() {
  return {
    nationality: "ES",
    currentResidence: "ES",
    age: 28,
    situation: "alone",
    education: "university_plus",
    english: "b2",
    savings: 15e3,
    remoteWork: false,
    monthlyIncome: 0,
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
  const [lang, setLang] = React.useState("en");
  const [screen, setScreen] = React.useState("questionnaire");
  const [profile, setProfile] = React.useState(() => Object.assign(defaultProfile(), loadStored(STORE_PROFILE) || {}));
  const [submitted, setSubmitted] = React.useState(() => {
    const s = loadStored(STORE_SUBMITTED);
    return s && s.profile && s.version ? s : null;
  });
  React.useEffect(() => {
    saveStored(STORE_PROFILE, profile);
  }, [profile]);
  React.useEffect(() => {
    saveStored(STORE_SUBMITTED, submitted);
  }, [submitted]);
  const resetAll = React.useCallback(() => {
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
  const tr = React.useCallback((key) => {
    const tbl = window.I18N[lang] || window.I18N.en;
    return tbl[key] != null ? tbl[key] : key;
  }, [lang]);
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", t.accent);
    root.style.setProperty("--accent-deep", shade(t.accent, -0.22));
    root.style.setProperty("--accent-tint", tint(t.accent, 0.9));
  }, [t.accent]);
  const onStage = screen === "globe" || screen === "processing";
  return /* @__PURE__ */ React.createElement("div", { className: "app" }, /* @__PURE__ */ React.createElement("header", { className: "topbar" + (onStage ? " on-stage" : "") }, /* @__PURE__ */ React.createElement("div", { className: "brand" }, /* @__PURE__ */ React.createElement("span", { className: "brand-mark" }), tr("brand"), /* @__PURE__ */ React.createElement(
    "span",
    {
      className: "version-badge",
      title: "Versi\xF3n de la app \u2014 ver VERSIONS.md",
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
        setSubmitted({ profile: Object.assign({}, profile), version: (submitted ? submitted.version : 0) + 1 });
        setScreen("processing");
      },
      onBack: submitted ? backToMap : null,
      dirty: submitted ? JSON.stringify(profile) !== JSON.stringify(submitted.profile) : false,
      onReset: resetAll
    }
  ), screen === "processing" && /* @__PURE__ */ React.createElement(Processing, { t: tr, onDone: () => setScreen("globe") }), submitted && screen !== "processing" && /* @__PURE__ */ React.createElement("div", { style: { display: screen === "globe" ? "contents" : "none" } }, /* @__PURE__ */ React.createElement(
    GlobeView,
    {
      key: submitted.version,
      t: tr,
      lang,
      profile: submitted.profile,
      globeStyle: t.globeStyle,
      onEditProfile: () => setScreen("questionnaire")
    }
  ))), /* @__PURE__ */ React.createElement(TweaksPanel, null, /* @__PURE__ */ React.createElement(TweakSection, { label: "Brand" }), /* @__PURE__ */ React.createElement(
    TweakColor,
    {
      label: "Accent",
      value: t.accent,
      options: ACCENTS,
      onChange: (v) => setTweak("accent", v)
    }
  ), /* @__PURE__ */ React.createElement(TweakSection, { label: "Globe" }), /* @__PURE__ */ React.createElement(
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
ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));

