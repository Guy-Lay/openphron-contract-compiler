import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path, { format } from "path";
import { cleanTestScript } from "./index";
import { artifacts } from "hardhat";

const execAsync = promisify(exec);

export const runTests = async (testCode: string, contractCode: string, contractName: string): Promise<any> => {
    const testPath = path.join(__dirname, "../../test", "runTest.test.ts");
    const contractPath = path.join(__dirname, "../../contracts", `${contractName}.sol`);
    console.log("testPath:", testPath);

    try {
        fs.mkdirSync(path.dirname(testPath), { recursive: true });
        fs.writeFileSync(testPath, cleanTestScript(testCode));

        fs.mkdirSync(path.dirname(contractPath), { recursive: true });
        fs.writeFileSync(contractPath, contractCode);

        console.log("Executing Command: yarn test", testPath);

        const { stdout, stderr } = await execAsync(`yarn test ${testPath}`);

        if (stderr) {
            return { success: false, error: stderr };
        }

        console.log("Test Execution Completed Successfully");
        return { success: true, output: stdout };
    } catch (error: any) {

        console.error("Error during Test Execution:", error.stderr);
        return {
            success: false,
            error: error.stderr,
        };
    } finally {
        if (fs.existsSync(testPath)) {
            fs.unlinkSync(testPath);
        }
        if (fs.existsSync(contractPath)) {
            fs.unlinkSync(contractPath);
        }
    }
};
