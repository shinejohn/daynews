import { jsx, jsxs } from "react/jsx-runtime";
import "react";
import { renderToString } from "react-dom/server";
import require$$0 from "react-router/dom";
import require$$1 from "react-router";
var dist = { exports: {} };
/**
 * react-router-dom v7.8.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
var hasRequiredDist;
function requireDist() {
  if (hasRequiredDist) return dist.exports;
  hasRequiredDist = 1;
  (function(module) {
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
    var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var index_exports = {};
    __export(index_exports, {
      HydratedRouter: () => import_dom2.HydratedRouter,
      RouterProvider: () => import_dom2.RouterProvider
    });
    module.exports = __toCommonJS(index_exports);
    var import_dom2 = require$$0;
    __reExport(index_exports, require$$1, module.exports);
  })(dist);
  return dist.exports;
}
var distExports = /* @__PURE__ */ requireDist();
const HomePage = () => /* @__PURE__ */ jsx("div", { children: "Home Page" });
const NewsPage = () => /* @__PURE__ */ jsx("div", { children: "News Page" });
const EventsPage = () => /* @__PURE__ */ jsx("div", { children: "Events Page" });
const BusinessPage = () => /* @__PURE__ */ jsx("div", { children: "Business Directory" });
const NotFound = () => /* @__PURE__ */ jsx("div", { children: "404 - Page Not Found" });
function App({ serverData = {} }) {
  return /* @__PURE__ */ jsx("div", { className: "app", children: /* @__PURE__ */ jsxs(distExports.Routes, { children: [
    /* @__PURE__ */ jsx(distExports.Route, { path: "/", element: /* @__PURE__ */ jsx(HomePage, {}) }),
    /* @__PURE__ */ jsx(distExports.Route, { path: "/news", element: /* @__PURE__ */ jsx(NewsPage, {}) }),
    /* @__PURE__ */ jsx(distExports.Route, { path: "/events", element: /* @__PURE__ */ jsx(EventsPage, {}) }),
    /* @__PURE__ */ jsx(distExports.Route, { path: "/businesses", element: /* @__PURE__ */ jsx(BusinessPage, {}) }),
    /* @__PURE__ */ jsx(distExports.Route, { path: "/:community/*", element: /* @__PURE__ */ jsx(CommunityRoutes, {}) }),
    /* @__PURE__ */ jsx(distExports.Route, { path: "*", element: /* @__PURE__ */ jsx(NotFound, {}) })
  ] }) });
}
function CommunityRoutes() {
  return /* @__PURE__ */ jsxs(distExports.Routes, { children: [
    /* @__PURE__ */ jsx(distExports.Route, { path: "/", element: /* @__PURE__ */ jsx(HomePage, {}) }),
    /* @__PURE__ */ jsx(distExports.Route, { path: "/news", element: /* @__PURE__ */ jsx(NewsPage, {}) }),
    /* @__PURE__ */ jsx(distExports.Route, { path: "/events", element: /* @__PURE__ */ jsx(EventsPage, {}) }),
    /* @__PURE__ */ jsx(distExports.Route, { path: "/businesses", element: /* @__PURE__ */ jsx(BusinessPage, {}) }),
    /* @__PURE__ */ jsx(distExports.Route, { path: "*", element: /* @__PURE__ */ jsx(NotFound, {}) })
  ] });
}
function render(url, context = {}) {
  const html = renderToString(
    /* @__PURE__ */ jsx(distExports.StaticRouter, { location: url, children: /* @__PURE__ */ jsx(App, { serverData: context }) })
  );
  return { html, context };
}
export {
  render
};
