import { globSync } from "glob";
import { basename, resolve } from "path";
import { Project, SyntaxKind, type InterfaceDeclaration, type TypeAliasDeclaration, type TypeLiteralNode } from "ts-morph";

export interface ComponentInfo {
  name: string;
  filePath: string;
  exportType: "named" | "default";
}

export interface PropInfo {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
}

export interface ComponentWithProps extends ComponentInfo {
  props: PropInfo[];
}

const IGNORED_PATTERNS = [
  "**/*.test.*",
  "**/*.spec.*",
  "**/*.stories.*",
  "**/*.d.ts",
  "**/index.ts",
  "**/index.tsx",
  "**/__tests__/**",
];

export function scanComponents(dir: string): ComponentInfo[] {
  const absDir = resolve(dir);
  const files = globSync("**/*.{tsx,ts,jsx}", {
    cwd: absDir,
    absolute: true,
    ignore: IGNORED_PATTERNS,
  });

  const components: ComponentInfo[] = [];
  const project = new Project({ skipAddingFilesFromTsConfig: true });

  for (const file of files) {
    const name = basename(file).replace(/\.(tsx|ts|jsx)$/, "");
    if (name[0] !== name[0].toUpperCase()) continue;

    const sourceFile = project.addSourceFileAtPath(file);

    const defaultExport = sourceFile.getDefaultExportSymbol();
    if (defaultExport) {
      components.push({ name, filePath: file, exportType: "default" });
      continue;
    }

    const namedExports = sourceFile.getExportedDeclarations();
    for (const [exportName, declarations] of namedExports) {
      if (exportName[0] === exportName[0].toUpperCase() && exportName !== "default") {
        const isTypeOnly = declarations.every(
          (d) =>
            d.getKind() === SyntaxKind.InterfaceDeclaration ||
            d.getKind() === SyntaxKind.TypeAliasDeclaration
        );
        if (isTypeOnly) continue;
        components.push({ name: exportName, filePath: file, exportType: "named" });
      }
    }
  }

  return components;
}

export function getComponentProps(filePath: string, componentName: string): PropInfo[] {
  const project = new Project({ skipAddingFilesFromTsConfig: true });
  const sourceFile = project.addSourceFileAtPath(filePath);

  const interfaces = sourceFile.getInterfaces();
  const typeAliases = sourceFile.getTypeAliases();

  const propsDecl = findPropsDeclaration(interfaces, typeAliases, componentName);
  if (!propsDecl) return [];

  if (propsDecl.getKind() === SyntaxKind.InterfaceDeclaration) {
    return extractFromInterface(propsDecl as InterfaceDeclaration);
  }

  if (propsDecl.getKind() === SyntaxKind.TypeAliasDeclaration) {
    return extractFromTypeAlias(propsDecl as TypeAliasDeclaration);
  }

  return [];
}

function findPropsDeclaration(
  interfaces: InterfaceDeclaration[],
  typeAliases: TypeAliasDeclaration[],
  componentName: string
): InterfaceDeclaration | TypeAliasDeclaration | undefined {
  const propsNames = [`${componentName}Props`, "Props"];

  for (const name of propsNames) {
    const iface = interfaces.find((i) => i.getName() === name);
    if (iface) return iface;

    const alias = typeAliases.find((t) => t.getName() === name);
    if (alias) return alias;
  }

  return undefined;
}

function extractFromInterface(iface: InterfaceDeclaration): PropInfo[] {
  return iface.getProperties().map((prop) => ({
    name: prop.getName(),
    type: prop.getType().getText(),
    required: !prop.hasQuestionToken(),
  }));
}

function extractFromTypeAlias(alias: TypeAliasDeclaration): PropInfo[] {
  const typeNode = alias.getTypeNode();
  if (!typeNode || typeNode.getKind() !== SyntaxKind.TypeLiteral) return [];

  const typeLiteral = typeNode as TypeLiteralNode;
  return typeLiteral.getProperties().map((prop) => ({
    name: prop.getName(),
    type: prop.getType().getText(),
    required: !prop.hasQuestionToken(),
  }));
}
