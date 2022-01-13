/* eslint-env node */
module.exports = {
  root: true,
  extends: ["eslint:recommended", "p5js"],
  env: {
    browser: true,
    es6: true, // allows es6 globals
  },
  parserOptions: {
    ecmaVersion: 13, // allows es13 syntax
    sourceType: "module",
    ecmaFeatures: {
      impliedStrict: true,
    },
  },
  globals: {},
  rules: {
    "no-unused-vars": [
      "error",
      {
        vars: "all",
        args: "none",
      },
    ],
    "no-unused-expressions": [
      "error",
      { allowShortCircuit: true, allowTernary: true },
    ],

    // Possible Problems
    "array-callback-return": "error",
    "no-await-in-loop": "error",
    "no-constructor-return": "error",
    "no-duplicate-imports": "error",
    "no-promise-executor-return": "error",
    "no-self-compare": "error",
    "no-template-curly-in-string": "error",
    "no-unmodified-loop-condition": "error",
    "no-unreachable-loop": "error",
    "no-unused-private-class-members": "error",
    "no-use-before-define": "off",
    "require-atomic-updates": "error",

    // Suggestions
    "accessor-pairs": "error", //	Enforce getter and setter pairs in objects and classes
    "arrow-body-style": "error", //	Require braces around arrow function bodies
    "block-scoped-var": "error", //	Enforce the use of variables within the scope they are defined
    camelcase: "off", //	Enforce camelcase naming convention
    "capitalized-comments": "off", //	Enforce or disallow capitalization of the first letter of a comment
    "class-methods-use-this": "error", //	Enforce that class methods utilize `this`
    complexity: "error", //	Enforce a maximum cyclomatic complexity allowed in a program
    "consistent-return": "error", //	Require `return` statements to either always or never specify values
    "consistent-this": "error", //	Enforce consistent naming when capturing the current execution context
    curly: "off", //	Enforce consistent brace style for all control statements
    "default-case": "error", //	Require `default` cases in `switch` statements
    "default-case-last": "error", //	Enforce default clauses in switch statements to be last
    "default-param-last": "error", //	Enforce default parameters to be last
    "dot-notation": "error", //	Enforce dot notation whenever possible
    eqeqeq: "error", //	Require the use of `===` and `!==`
    "func-name-matching": "error", //	Require function names to match the name of the variable or property to which they are assigned
    // "func-names": "error", //	Require or disallow named `function` expressions
    "func-style": "off", //	Enforce the consistent use of either `function` declarations or expressions
    "grouped-accessor-pairs": "error", //	Require grouped accessor pairs in object literals and classes
    "guard-for-in": "error", //	Require `for-in` loops to include an `if` statement
    "id-denylist": "error", //	Disallow specified identifiers
    "id-length": "off", //	Enforce minimum and maximum identifier lengths
    "id-match": "error", //	Require identifiers to match a specified regular expression
    "init-declarations": "off", //	Require or disallow initialization in variable declarations
    "max-classes-per-file": "off", //	Enforce a maximum number of classes per file
    "max-depth": "error", //	Enforce a maximum depth that blocks can be nested
    // "max-lines": "error", //	Enforce a maximum number of lines per file
    // "max-lines-per-function": "error", //	Enforce a maximum number of lines of code in a function
    "max-nested-callbacks": "error", //	Enforce a maximum depth that callbacks can be nested
    "max-params": "off", //	Enforce a maximum number of parameters in function definitions
    // "max-statements": "error", //	Enforce a maximum number of statements allowed in function blocks
    "multiline-comment-style": "off", //	Enforce a particular style for multiline comments
    "new-cap": "error", //	Require constructor names to begin with a capital letter
    "no-alert": "error", //	Disallow the use of `alert`, `confirm`, and `prompt`
    "no-array-constructor": "error", //	Disallow `Array` constructors
    // "no-bitwise": "error", //	Disallow bitwise operators
    "no-caller": "error", //	Disallow the use of `arguments.caller` or `arguments.callee`
    "no-confusing-arrow": "error", //	Disallow arrow functions where they could be confused with comparisons
    "no-console": "error", //	Disallow the use of `console`
    // "no-continue": "error", //	Disallow `continue` statements
    "no-div-regex": "error", //	Disallow division operators explicitly at the beginning of regular expressions
    // "no-else-return": "error", //	Disallow `else` blocks after `return` statements in `if` statements
    // "no-empty-function": "error", //	Disallow empty functions
    "no-eq-null": "error", //	Disallow `null` comparisons without type-checking operators
    "no-eval": "error", //	Disallow the use of `eval()`
    "no-extend-native": "error", //	Disallow extending native types
    "no-extra-bind": "error", //	Disallow unnecessary calls to `.bind()`
    "no-extra-label": "error", //	Disallow unnecessary labels
    "no-floating-decimal": "error", //	Disallow leading or trailing decimal points in numeric literalsglobal variables
    "no-implicit-coercion": "error", //	Disallow shorthand type conversions
    // "no-implicit-globals": "error", //	Disallow declarations in the global scope
    "no-implied-eval": "error", //	Disallow the use of `eval()`-like methods
    "no-inline-comments": "off", //	Disallow inline comments after code
    "no-invalid-this": "error", //	Disallow `this` keywords outside of classes or class-like objects
    "no-iterator": "error", //	Disallow the use of the `__iterator__` property
    "no-label-var": "error", //	Disallow labels that share a name with a variable
    "no-labels": "error", //	Disallow labeled statements
    "no-lone-blocks": "error", //	Disallow unnecessary nested blocks
    "no-lonely-if": "error", //	Disallow `if` statements as the only statement in `else` blocks
    "no-loop-func": "error", //	Disallow function declarations that contain unsafe references inside loop statements
    "no-magic-numbers": "off", //	Disallow magic numbers
    // "no-mixed-operators": "error", //	Disallow mixed binary operators
    "no-multi-assign": "error", //	Disallow use of chained assignment expressions
    "no-multi-str": "error", //	Disallow multiline strings
    "no-negated-condition": "error", //	Disallow negated conditions
    "no-nested-ternary": "error", //	Disallow nested ternary expressions
    "no-new": "error", //	Disallow `new` operators outside of assignments or comparisons
    "no-new-func": "error", //	Disallow `new` operators with the `Function` object
    "no-new-object": "error", //	Disallow `Object` constructors
    "no-new-wrappers": "error", //	Disallow `new` operators with the `String`, `Number`, and `Boolean` objectsstring literals
    "no-octal-escape": "error", //	Disallow octal escape sequences in string literals
    "no-param-reassign": "error", //	Disallow reassigning `function` parameters
    // "no-plusplus": "error", //	Disallow the unary operators `++` and `--`
    "no-proto": "error", //	Disallow the use of the `__proto__` property
    "no-restricted-exports": "error", //	Disallow specified names in exports
    "no-restricted-globals": "error", //	Disallow specified global variables
    "no-restricted-imports": "error", //	Disallow specified modules when loaded by `import`
    "no-restricted-properties": "error", //	Disallow certain properties on certain objects
    "no-restricted-syntax": "error", //	Disallow specified syntax
    "no-return-assign": "error", //	Disallow assignment operators in `return` statements
    "no-return-await": "error", //	Disallow unnecessary `return await`
    "no-script-url": "error", //	Disallow `javascript:` urls
    "no-sequences": "error", //	Disallow comma operators
    // "no-shadow": "error", //	Disallow variable declarations from shadowing variables declared in the outer scoperestricted names
    // "no-ternary": "error", //	Disallow ternary operators
    "no-throw-literal": "error", //	Disallow throwing literals as exceptions
    "no-undef-init": "error", //	Disallow initializing variables to `undefined`
    // "no-undefined": "error", //	Disallow the use of `undefined` as an identifier
    // "no-underscore-dangle": "error", //	Disallow dangling underscores in identifiers
    "no-unneeded-ternary": "error", //	Disallow ternary operators when simpler alternatives exist
    // "no-unused-expressions": "error", //	Disallow unused expressions
    "no-useless-call": "error", //	Disallow unnecessary calls to `.call()` and `.apply()`
    "no-useless-computed-key": "error", //	Disallow unnecessary computed property keys in objects and classes
    "no-useless-concat": "error", //	Disallow unnecessary concatenation of literals or template literals
    "no-useless-constructor": "error", //	Disallow unnecessary constructors
    "no-useless-rename": "error", //	Disallow renaming import, export, and destructured assignments to the same name
    "no-useless-return": "error", //	Disallow redundant return statements
    "no-var": "error", //	Require `let` or `const` instead of `var`
    "no-void": "error", //	Disallow `void` operators
    "no-warning-comments": "error", //	Disallow specified warning terms in comments
    "object-shorthand": "error", //	Require or disallow method and property shorthand syntax for object literals
    // "one-var": "error", //	Enforce variables to be declared either together or separately in functions
    "one-var-declaration-per-line": "error", //	Require or disallow newlines around variable declarations
    "operator-assignment": "error", //	Require or disallow assignment operator shorthand where possible
    "prefer-arrow-callback": "error", //	Require using arrow functions for callbacks
    "prefer-const": "error", //	Require `const` declarations for variables that are never reassigned after declared
    "prefer-destructuring": "error", //	Require destructuring from arrays and/or objects
    "prefer-exponentiation-operator": "error", //	Disallow the use of `Math.pow` in favor of the `**` operator
    "prefer-named-capture-group": "error", //	Enforce using named capture group in regular expression
    "prefer-numeric-literals": "error", //	Disallow `parseInt()` and `Number.parseInt()` in favor of binary, octal, and hexadecimal literals
    "prefer-object-spread": "error", //	Disallow using Object.assign with an object literal as the first argument and prefer the use of object spread instead.
    "prefer-promise-reject-errors": "error", //	Require using Error objects as Promise rejection reasons
    "prefer-regex-literals": "error", //	Disallow use of the `RegExp` constructor in favor of regular expression literals
    "prefer-rest-params": "error", //	Require rest parameters instead of `arguments`
    "prefer-spread": "error", //	Require spread operators instead of `.apply()`
    // "prefer-template": "error", //	Require template literals instead of string concatenation
    "quote-props": "off", //	Require quotes around object literal property names
    radix: "error", //	Enforce the consistent use of the radix argument when using `parseInt()`
    "require-await": "error", //	Disallow async functions which have no `await` expression
    "require-unicode-regexp": "error", //	Enforce the use of `u` flag on RegExp
    // "sort-imports": "error", //	Enforce sorted import declarations within modules
    "sort-keys": "off", //	Require object keys to be sorted
    "sort-vars": "off", //	Require variables within the same declaration block to be sorted
    // "spaced-comment": "error", //	Enforce consistent spacing after the `//` or `/*` in a comment
    // strict: "error", //	Require or disallow strict mode directives
    "symbol-description": "error", //	Require symbol descriptions
    "vars-on-top": "error", //	Require `var` declarations be placed at the top of their containing scope
    yoda: "error", //	Require or disallow "Yoda" conditions
  },
};
