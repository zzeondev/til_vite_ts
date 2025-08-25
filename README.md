# Vite Typescript 프로젝트 셋팅

## 프로젝트 생성

```bash
npm create vite@latest .
> React 선택
> TypeScript 선택
```

## npm 설치

```bash
npm i
npm run dev
```

## React 18 마이그레이션

### 1. React 18 타입스크립트

```bash
npm i react@^18.3.1 react-dom@^18.3.1
npm i -D @types/react@^18.3.5 @types/react-dom@^18.3.0
```

### 2. ESLint 버전 8.x

```bash
npm i -D eslint@^8.57.0 eslint-plugin-react@^7.37.5 eslint-plugin-react-hooks@^4.6.2 eslint-plugin-jsx-a11y@^6.10.0 eslint-plugin-import@^2.31.0
npm i -D @typescript-eslint/parser@^7.18.0 @typescript-eslint/eslint-plugin@^7.18.0
```

- 위 사항 설정시 오류 발생 처리 (버전 충돌)

```bash
npm remove typescript-eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

```bash
npm i -D eslint@^8.57.0 \
  @typescript-eslint/parser@^7.18.0 \
  @typescript-eslint/eslint-plugin@^7.18.0
```

### 3. Prettier 안정 버전 (3.x)

```bash
npm i -D prettier@^3.3.3 eslint-config-prettier@^9.1.0
```

### 4. ESLint/Prettier 설정

- `.eslintrc.json` 생성

```json
{
  "root": true,
  "env": { "browser": true, "es2022": true, "node": true },
  "parser": "@typescript-eslint/parser",
  "parserOptions": { "ecmaVersion": "latest", "sourceType": "module" },
  "settings": { "react": { "version": "detect" } },
  "plugins": ["react", "react-hooks", "@typescript-eslint", "jsx-a11y", "import"],
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off"
  }
}
```

- `.prettierrc` 생성

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "avoid"
}
```

- `eslint.config.js` 삭제
- `.eslintignore` 생성 : ESLint 검사 제외 작성

```
node_modules
build
dist
```

## VSCode 환경 설정(팀이 공유)

- `.vscode` 폴더 생성
- `settings.json` 파일 생성

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": "explicit"
  },
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"]
}
```

## npm 재 설치

- `package-lock.json` 파일 제거
- `node_modules ` 폴더 제거

```bash
npm i
npm run dev
```

## VSCode 재 실행 권장

## ESLint rulse 및 tsconfig 환경 설정

### 1. ESLint rules

- `.eslintrc.json` rulse 추가

```json
  "rules": {
    "react/react-in-jsx-scope": "off",
    "no-unused-vars": "off",
    "prettier/prettier": "warn",
    "@typescript-eslint/no-unused-vars": "off"
  }
```

### 2. tsconfig 에서는 `tsconfig.app.json` 관리

```json
"compilerOptions": {
  ...
   /* Linting */
    "noUnusedParameters": false,
    "erasableSyntaxOnly": true,
}
```

### 3. 최종 셋팅 결과물

- `.eslintrc.json`

```json
{
  "root": true,
  "env": { "browser": true, "es2022": true, "node": true },
  "parser": "@typescript-eslint/parser",
  "parserOptions": { "ecmaVersion": "latest", "sourceType": "module" },
  "settings": { "react": { "version": "detect" } },
  "plugins": ["react", "react-hooks", "@typescript-eslint", "jsx-a11y", "import", "prettier"],
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "no-unused-vars": "off",
    "prettier/prettier": "warn",
    "@typescript-eslint/no-unused-vars": "off"
  }
}
```

- `tsconfig.app.json`

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

- App.tsx

```tsx
function App() {
  const unuse = 1;
  return <div>App</div>;
}

export default App;
```

# 깃 설정

```bash
git init
git remote add origin 주소
git add .
git commit -m "[docs] 프로젝트 셋팅"
git push origin main
```
