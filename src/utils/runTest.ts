import { exec, execSync } from "child_process";
import { promisify } from "util";
import fs from "fs";
import { artifacts, run } from "hardhat";
import { cleanTestOutput, cleanTestScript, clearContract } from "./index";
import { makeNewCode } from "./writeCode";

const execAsync = promisify(exec);

export const runTests = async (testCode: string, contractCode: string, contractName: string): Promise<any> => {
    const testPath = await makeNewCode(testCode, contractName, "test");
    const contractPath = await makeNewCode(contractCode, contractName, "contracts");
    if (!testPath || !contractPath) {
        return {
            error: "Contract not found",
        };
    }
    try {

        execSync("npx cross-env FORCE_COLOR=1 hardhat compile", {
            encoding: "utf-8",
            stdio: "pipe"
        });
        const { stdout, stderr } = await execAsync(`yarn test ${testPath}`);

        if (stderr) {
            return { success: false, error: stderr };
        }

        console.log("Test Execution Completed Successfully");
        return { success: true, output: stdout };
    } catch (error: any) {

        console.error("Error during Test Execution:", cleanTestOutput(error.stderr));
        return {
            success: false,
            error: cleanTestOutput(error.stderr) || error.message,
        };
    } finally {
        clearContract(contractPath);
    }
};
