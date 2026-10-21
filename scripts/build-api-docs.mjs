// Generates docs/api.md from the public API types in src/types.ts.
//
//   npm run docs
//
// The page is docs/api-intro.md (hand-written) followed by a reference for
// every function, built from the JSDoc in src/types.ts. Edit those, not
// docs/api.md.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const typesPath = path.join(root, "src/types.ts");
const introPath = path.join(root, "docs/api-intro.md");
const outPath = path.join(root, "docs/api.md");

const source = ts.createSourceFile(
  typesPath,
  fs.readFileSync(typesPath, "utf8"),
  ts.ScriptTarget.Latest,
  true
);

function findDeclaration(name) {
  let found;
  source.forEachChild((node) => {
    if (
      (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) &&
      node.name.text === name
    ) {
      found = node;
    }
  });
  if (!found) throw new Error(`${name} not found in src/types.ts`);
  return found;
}

function docText(comment) {
  return (ts.getTextOfJSDocComment(comment) ?? "").trim();
}

// the description, @param, @returns, @throws, and @deprecated of a node
function jsDoc(node) {
  const doc = { description: "", params: [], returns: "", throws: "", deprecated: null };
  for (const jsdoc of ts.getJSDocCommentsAndTags(node)) {
    if (!ts.isJSDoc(jsdoc)) continue;
    doc.description = docText(jsdoc.comment);
    for (const tag of jsdoc.tags ?? []) {
      const text = docText(tag.comment);
      if (ts.isJSDocParameterTag(tag)) {
        doc.params.push({ name: tag.name.getText(source), text });
      } else if (tag.tagName.text === "returns") {
        doc.returns = text;
      } else if (tag.tagName.text === "throws") {
        doc.throws = text;
      } else if (tag.tagName.text === "deprecated") {
        doc.deprecated = text;
      }
    }
  }
  return doc;
}

// a method signature as one line of code, without its JSDoc
function signature(member, prefix) {
  const text = member
    .getText(source)
    .replace(/\s+/g, " ")
    .replace(/\( /g, "(")
    .replace(/,? \)/g, ")")
    .replace(/;$/, "");
  return prefix + text;
}

function renderInterface(name, prefix) {
  const declaration = findDeclaration(name);
  const groups = new Map(); // overloads share a name
  for (const member of declaration.members) {
    if (!ts.isMethodSignature(member)) continue;
    const key = member.name.getText(source);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(member);
  }

  const out = [];
  for (const [key, members] of groups) {
    out.push(`### ${prefix}${key}()`, "");
    const first = jsDoc(members[0]);
    if (first.deprecated !== null) {
      out.push(`**Deprecated.** ${first.deprecated}`, "");
    }
    out.push("```ts", ...members.map((m) => signature(m, prefix)), "```", "");
    for (const member of members) {
      const doc = jsDoc(member);
      if (doc.description) out.push(doc.description, "");
      for (const param of doc.params) {
        out.push(`- \`${param.name}\`: ${param.text}`);
      }
      if (doc.params.length) out.push("");
      if (doc.returns) out.push(`Returns: ${doc.returns}`, "");
      if (doc.throws) out.push(`Throws: ${doc.throws}`, "");
    }
  }
  return out.join("\n");
}

function renderTypes(names) {
  const out = [];
  for (const name of names) {
    const declaration = findDeclaration(name);
    const doc = jsDoc(declaration);
    out.push(`### ${name}`, "");
    if (doc.description) out.push(doc.description, "");
    out.push(
      "```ts",
      declaration.getText(source).replace(/^export /, ""),
      "```",
      ""
    );
  }
  return out.join("\n");
}

const api = findDeclaration("P5PartyAPI");
const functions = findDeclaration("P5PartyFunctions");

const page = [
  fs.readFileSync(introPath, "utf8").trimEnd(),
  "",
  "## p5party (with or without p5.js)",
  "",
  jsDoc(api).description,
  "",
  renderInterface("P5PartyAPI", "p5party."),
  "## p5.js functions",
  "",
  jsDoc(functions).description,
  "",
  renderInterface("P5PartyFunctions", ""),
  "## Types",
  "",
  renderTypes(["JSONValue", "JSONObject", "WatchCallback", "EventCallback"]),
].join("\n");

fs.writeFileSync(outPath, page.trimEnd() + "\n");
console.log(`wrote ${path.relative(root, outPath)}`);
