import { ethers, Wallet } from "ethers";
import * as fs from "fs";
import { run, artifacts } from "hardhat";

export const getProvider = () => {
    const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) {
        throw new Error("RPC_URL is not defined in the environment variables.");
    }
    return new ethers.providers.JsonRpcProvider(rpcUrl);
};

export const getSigner = () => {
    const wallet = Wallet.createRandom();
    const privateKey = wallet.privateKey;
    if (!privateKey) {
        throw new Error("PRIVATE_KEY is not defined in the environment variables.");
    }
    const provider = getProvider();
    return new ethers.Wallet(privateKey, provider);
};

export const extractContractName = (sourceCode: string): string => {
    const match = sourceCode.match(/contract\s+(\w+)/);
    if (!match) {
        throw new Error("No contract found in the source code.");
    }
    return match[1];
};

export const cleanSourceCode = (sourceCode: string): string => {
    // Remove the leading "```solidity" and trailing "```"
    let cleanedCode = sourceCode.replace(/```solidity|```/g,
        sourceCode.includes("SPDX-License-Identifier:") ? "" : "//SPDX-License-Identifier: MIT").trim();

    return cleanedCode;
};

export const cleanTestScript = (sourceCode: string): string => {
    // Remove the leading "```solidity" and trailing "```"
    let cleanedCode = sourceCode.replace(/```typescript|```/g, "").trim();

    return cleanedCode;
};


export const parseTestError = (stderr: string): string => {
    console.log("Parsing stderr for errors...");
    const errorLines = stderr.split("\n");
    const relevantErrors = errorLines
        .filter(line => line.includes("FAIL") || line.includes("Error"))
        .join("\n");
    return relevantErrors || "Unable to determine the exact error.";
};

export const cleanTestOutput = (stderr: string): string => {
    // Patterns to remove unnecessary lines
    const unnecessaryPatterns = [
        /^\(node:\d+\).*/, // Matches lines starting with (node:...
        /Ran all test suites.*/, // Matches lines mentioning "Ran all test suites"
        /^\(Use `node.*/
    ];

    // Split the stderr into lines and filter out unnecessary lines
    const cleanedLines = stderr
        .split('\n')
        .filter(line => !unnecessaryPatterns.some(pattern => pattern.test(line)));

    // Join the remaining lines into a single string and return
    return cleanedLines.join('\n');
}

export const clearContract = (contractPath: string) => {
    try {
        run("clean")
        if (artifacts.clearCache) {
            console.log("clearCache")
            artifacts.clearCache()
        }
        console.log("cleaned")
        if (fs.existsSync(contractPath)) {
            fs.unlinkSync(contractPath);
        }
        console.log(`Contract file ${contractPath} has been deleted.`);
    } catch (error) {
        console.error(`Error deleting contract file ${contractPath}:`, error);
    }
}

