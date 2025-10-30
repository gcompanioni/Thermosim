import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { GlobalContextProviders } from "./components/_globalContextProviders";
import Page_0 from "./pages/_index.tsx";
import PageLayout_0 from "./pages/_index.pageLayout.tsx";
import Page_1 from "./pages/simulations.work.tsx";
import PageLayout_1 from "./pages/simulations.work.pageLayout.tsx";
import Page_2 from "./pages/simulations.entropy.tsx";
import PageLayout_2 from "./pages/simulations.entropy.pageLayout.tsx";
import Page_3 from "./pages/simulations.enthalpy.tsx";
import PageLayout_3 from "./pages/simulations.enthalpy.pageLayout.tsx";
import Page_4 from "./pages/simulations.three-laws.tsx";
import PageLayout_4 from "./pages/simulations.three-laws.pageLayout.tsx";
import Page_5 from "./pages/simulations.gibbs-free-energy.tsx";
import PageLayout_5 from "./pages/simulations.gibbs-free-energy.pageLayout.tsx";
import Page_6 from "./pages/simulations.system-surrounding.tsx";
import PageLayout_6 from "./pages/simulations.system-surrounding.pageLayout.tsx";
import Page_7 from "./pages/simulations.reversible-processes.tsx";
import PageLayout_7 from "./pages/simulations.reversible-processes.pageLayout.tsx";
import Page_8 from "./pages/simulations.spontaneous-reactions.tsx";
import PageLayout_8 from "./pages/simulations.spontaneous-reactions.pageLayout.tsx";

if (!window.requestIdleCallback) {
  window.requestIdleCallback = (cb) => {
    setTimeout(cb, 1);
  };
}

import "./base.css";

const fileNameToRoute = new Map([["./pages/_index.tsx","/"],["./pages/simulations.work.tsx","/simulations/work"],["./pages/simulations.entropy.tsx","/simulations/entropy"],["./pages/simulations.enthalpy.tsx","/simulations/enthalpy"],["./pages/simulations.three-laws.tsx","/simulations/three-laws"],["./pages/simulations.gibbs-free-energy.tsx","/simulations/gibbs-free-energy"],["./pages/simulations.system-surrounding.tsx","/simulations/system-surrounding"],["./pages/simulations.reversible-processes.tsx","/simulations/reversible-processes"],["./pages/simulations.spontaneous-reactions.tsx","/simulations/spontaneous-reactions"]]);
const fileNameToComponent = new Map([
    ["./pages/_index.tsx", Page_0],
["./pages/simulations.work.tsx", Page_1],
["./pages/simulations.entropy.tsx", Page_2],
["./pages/simulations.enthalpy.tsx", Page_3],
["./pages/simulations.three-laws.tsx", Page_4],
["./pages/simulations.gibbs-free-energy.tsx", Page_5],
["./pages/simulations.system-surrounding.tsx", Page_6],
["./pages/simulations.reversible-processes.tsx", Page_7],
["./pages/simulations.spontaneous-reactions.tsx", Page_8],
  ]);

function makePageRoute(filename: string) {
  const Component = fileNameToComponent.get(filename);
  return <Component />;
}

function toElement({
  trie,
  fileNameToRoute,
  makePageRoute,
}: {
  trie: LayoutTrie;
  fileNameToRoute: Map<string, string>;
  makePageRoute: (filename: string) => React.ReactNode;
}) {
  return [
    ...trie.topLevel.map((filename) => (
      <Route
        key={fileNameToRoute.get(filename)}
        path={fileNameToRoute.get(filename)}
        element={makePageRoute(filename)}
      />
    )),
    ...Array.from(trie.trie.entries()).map(([Component, child], index) => (
      <Route
        key={index}
        element={
          <Component>
            <Outlet />
          </Component>
        }
      >
        {toElement({ trie: child, fileNameToRoute, makePageRoute })}
      </Route>
    )),
  ];
}

type LayoutTrieNode = Map<
  React.ComponentType<{ children: React.ReactNode }>,
  LayoutTrie
>;
type LayoutTrie = { topLevel: string[]; trie: LayoutTrieNode };
function buildLayoutTrie(layouts: {
  [fileName: string]: React.ComponentType<{ children: React.ReactNode }>[];
}): LayoutTrie {
  const result: LayoutTrie = { topLevel: [], trie: new Map() };
  Object.entries(layouts).forEach(([fileName, components]) => {
    let cur: LayoutTrie = result;
    for (const component of components) {
      if (!cur.trie.has(component)) {
        cur.trie.set(component, {
          topLevel: [],
          trie: new Map(),
        });
      }
      cur = cur.trie.get(component)!;
    }
    cur.topLevel.push(fileName);
  });
  return result;
}

function NotFound() {
  return (
    <div>
      <h1>Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <p>Go back to the <a href="/" style={{ color: 'blue' }}>home page</a>.</p>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <GlobalContextProviders>
        <Routes>
          {toElement({ trie: buildLayoutTrie({
"./pages/_index.tsx": PageLayout_0,
"./pages/simulations.work.tsx": PageLayout_1,
"./pages/simulations.entropy.tsx": PageLayout_2,
"./pages/simulations.enthalpy.tsx": PageLayout_3,
"./pages/simulations.three-laws.tsx": PageLayout_4,
"./pages/simulations.gibbs-free-energy.tsx": PageLayout_5,
"./pages/simulations.system-surrounding.tsx": PageLayout_6,
"./pages/simulations.reversible-processes.tsx": PageLayout_7,
"./pages/simulations.spontaneous-reactions.tsx": PageLayout_8,
}), fileNameToRoute, makePageRoute })} 
          <Route path="*" element={<NotFound />} />
        </Routes>
      </GlobalContextProviders>
    </BrowserRouter>
  );
}
