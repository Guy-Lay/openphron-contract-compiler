import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { run } from "hardhat";
import { cleanTestOutput, cleanTestScript } from "./index";

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
        await run("compile")
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
            error: cleanTestOutput(error.stderr),
        };
    } finally {
        if (fs.existsSync(testPath)) {
            fs.unlinkSync(testPath);
        }
        if (fs.existsSync(contractPath)) {
            fs.unlinkSync(contractPath);
        }
        //remove atifacts and cache and contracts and test
        // fs.rmdirSync(path.join(__dirname, "../../artifacts"));
        // fs.rmdirSync(path.join(__dirname, "../../cache"));
        // fs.rmdirSync(path.join(__dirname, "../../contracts"));
        // fs.rmdirSync(path.join(__dirname, "../../test"));
    }
};
