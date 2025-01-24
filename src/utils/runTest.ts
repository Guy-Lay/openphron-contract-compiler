import { exec as childExec, execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { cleanTestScript } from "./index";

const exec = promisify(childExec);

export const runTests = async (testCode: string): Promise<any> => {
    const testPath = path.join(__dirname, "../../test", `runTest.test.ts`);

    fs.mkdirSync(path.dirname(testPath), { recursive: true });
    fs.writeFileSync(testPath, cleanTestScript(testCode));

    try {
        console.log("Executing Command: yarn test", testPath);
        const { stdout, stderr } = await exec(`yarn test ${testPath}`);
        console.log("stdout:", stdout, "stderr:", stderr);

        if (stderr) {
            const errorDetails = stderr;
            return { success: false, detail: errorDetails };
        }

        return { success: true, output: stdout };
    } catch (error: any) {
        console.error(`Error during Test Execution: ${error.message}`);
        return {
            success: false,
            detail: `Unexpected error: ${error.message}`,
        };
    }
    finally {
        if (execFile(testPath)) {
            fs.unlinkSync(testPath);
        }
    }
};


