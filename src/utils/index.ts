import { ethers, Wallet } from "ethers";

export const getProvider = () => {
    const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) {
        throw new Error("RPC_URL is not defined in the environment variables.");
    }
    return new ethers.JsonRpcProvider(rpcUrl);
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
    let cleanedCode = sourceCode.replace(/```solidity|```/g, "").trim();

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



