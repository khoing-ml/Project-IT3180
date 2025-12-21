import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.node } },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  {
  "rules": {
    // Tắt quy tắc của ESLint (vì quy tắc của TS đã được bật)
    "no-unused-vars": "off", 
    
    // Đặt quy tắc của TypeScript ESLint thành cảnh báo (warn) hoặc tắt (off)
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
    
    // Nếu bạn muốn tắt hẳn:
    // "@typescript-eslint/no-unused-vars": "off" 
  }
}
]);
