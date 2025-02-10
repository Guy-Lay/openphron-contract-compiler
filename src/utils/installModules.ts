import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

export const autoInstallModules = (sourceCode: string): void => {
    const importRegex = /import\s+(?:.+?\s+from\s+)?["']([^"']+)["'];?/g;
    const matches = [...sourceCode.matchAll(importRegex)];
    console.log("matches:", matches);
    const missingModules = new Set<string>();

    matches.forEach((match) => {
        const importPath = match[1];
        const isRelativeOrAbsolutePath = importPath.startsWith(".") || path.isAbsolute(importPath);
        if (!isRelativeOrAbsolutePath) {
            const libraryName = _getLibraryName(importPath);
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
    if (importPath.startsWith("@")) {
        const parts = importPath.split("/");
        return parts.length > 1 ? `${parts[0]}/${parts[1]}` : parts[0];
    }
    return importPath.split("/")[0];
};

const _isModuleInstalled = (moduleName: string): boolean => {
    try {
        const result = execSync(`yarn list --pattern ${moduleName}`, { stdio: "pipe" });
        
        if (result.toString().includes(moduleName)) {
            console.log(`${moduleName} is already installed.`);
            return true;
        }
        console.log(`${moduleName} is not installed.`);
        return false;
    } catch (error) {
        console.error(`Error checking if ${moduleName} is installed:`, error);
        return false;
    }
};


const _installModule = (moduleName: string): void => {
    try {
        console.log(`Attempting to install ${moduleName} using Yarn...`);
        execSync(`yarn add ${moduleName}`, { stdio: "inherit" });
        console.log(`Successfully installed ${moduleName} using Yarn.`);
    } catch (yarnError) {
        console.error(`Yarn failed to install ${moduleName}:`, yarnError);
        console.log("Trying NPM...");

        try {
            execSync(`npm install ${moduleName}`, { stdio: "inherit" });
            console.log(`Successfully installed ${moduleName} using NPM.`);
        } catch (npmError) {
            console.error(`Failed to install ${moduleName} using both Yarn and NPM:`, npmError);
        }
    }
};
