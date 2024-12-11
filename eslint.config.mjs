import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.node, // Ajoute les globales Node.js comme `require` et `__dirname`
        ...globals.jasmine, // Ajoute les globales Jasmine comme `describe`, `it`, `expect`
      },
      ecmaVersion: 2021, // Spécifie la version ECMAScript
      sourceType: "module" // Support pour les modules ES
    },
    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^next$" }], // Ignore les variables `next` inutilisées
      "no-undef": "error" // Affiche une erreur pour les variables non définies
    }
  },
  pluginJs.configs.recommended
];
