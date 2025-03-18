import { run, artifacts } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { makeNewCode } from "./writeCode";
import { clearContract } from ".";

export const compileContract = async (contractCode: string, contractName: string): Promise<any> => {
    const contractPath = await makeNewCode(contractCode, contractName, "contracts");
    if (!contractPath) {
        return {
            error: "Contract not found",
        };
    }
    try {
        execSync("npx cross-env FORCE_COLOR=1 hardhat compile", {
            encoding: "utf-8",
            stdio: "pipe"
        });
        console.log(`compile done for ${contractName}`);

        const contractArtifact = await artifacts.readArtifact(contractName);
        return { abi: contractArtifact.abi, bytecode: contractArtifact.bytecode };
    } catch (error: any) {
        const errorMessage = error.stderr?.toString() || error.stdout?.toString() || error.message;
        console.log("compileContract error", errorMessage);
        return {
            error: errorMessage,
        };
    } finally {
        clearContract(contractPath);
    }
};
