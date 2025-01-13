import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

export const autoInstallModules = (sourceCode: string): void => {
    const importRegex = /import\s+(?:.*?\s+from\s+)?["']([^"']+)["'];?/g;
    const matches = [...sourceCode.matchAll(importRegex)];

    const missingModules = new Set<string>();

    matches.forEach((match) => {
        const importPath = match[1];
        const isRelativeOrAbsolutePath = importPath.startsWith('.') || path.isAbsolute(importPath);
        if (!isRelativeOrAbsolutePath) {
            const libraryName = _getLibraryName(importPath);
            console.log({ libraryName });
            console.log({ missingModules }, _isModuleInstalled(libraryName));
            if (!_isModuleInstalled(libraryName)) {
                missingModules.add(libraryName);
            }
        }
    });
    if (missingModules.size > 0) {
        console.log("Installing missing libraries:", [...missingModules].join(", "));
        missingModules.forEach((module) => _installModule(module));
    } else {
        console.log("No missing libraries detected.");
    }

    console.log("Installation process completed!");
};

const _getLibraryName = (importPath: string): string => {
    if (importPath.startsWith('@')) {
        const parts = importPath.split('/');
        return parts.length > 1 ? `${parts[0]}/${parts[1]}` : parts[0];
    }
    return importPath.split('/')[0];
};

const _isModuleInstalled = (moduleName: string): boolean => {
    const modulePath = path.join(process.cwd(), 'node_modules', moduleName);
    console.log({modulePath})
    if (fs.existsSync(modulePath))
        return true;
    return false;
};

const _installModule = (moduleName: string): void => {
    try {
        console.log(`Attempting to install ${moduleName} using yarn...`);
        execSync(`yarn add ${moduleName}`, { stdio: "inherit" });
        console.log(`Successfully installed ${moduleName} using yarn.`);
    } catch (yarnError) {
        console.error(`Yarn failed to install ${moduleName}:`, (yarnError as Error).message || yarnError);
        console.log("Trying npm...");

        try {
            execSync(`npm install ${moduleName}`, { stdio: "inherit" });
            console.log(`Successfully installed ${moduleName} using npm.`);
        } catch (npmError) {
            console.error(`Failed to install ${moduleName} using both yarn and npm:`, (npmError as Error).message || npmError);
        }
    }
};
