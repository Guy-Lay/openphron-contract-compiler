import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path, { format } from "path";
import { cleanTestScript } from "./index";

const execAsync = promisify(exec);

export const runTests = async (testCode: string): Promise<any> => {
    const testPath = path.join(__dirname, "../../test", "runTest.test.ts");
    console.log("testPath:", testPath);

    fs.mkdirSync(path.dirname(testPath), { recursive: true });
    fs.writeFileSync(testPath, cleanTestScript(testCode));

    try {
        console.log("Executing Command: yarn test", testPath);

        const { stdout, stderr } = await execAsync(`yarn test ${testPath}`);

        if (stderr) {
            return { success: false, error: stderr };
        }

        console.log("Test Execution Completed Successfully");
        return { success: true, output: stdout };
    } catch (error: any) {

        console.error("Error during Test Execution:", error.message);
        return {
            success: false,
            error: `Unexpected error: ${error.message}`,
        };
    } finally {
        if (fs.existsSync(testPath)) {
            fs.unlinkSync(testPath);
        }
    }
};
