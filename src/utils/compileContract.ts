import { artifacts, run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

export const compileContract = async (contractCode: string, contractName: string): Promise<any> => {
    const contractPath = path.join(__dirname, "../../contracts", `${contractName}.sol`);

    // Store original console.error
    const originalConsoleError = console.error;
    let compilationErrors = '';

    // Intercept console.error calls
    console.error = (...args) => {
        compilationErrors += args.join(' ') + '\n';
        originalConsoleError.apply(console, args);
    };

    try {
        fs.mkdirSync(path.dirname(contractPath), { recursive: true });
        fs.writeFileSync(contractPath, contractCode);

        console.log("Running Hardhat compile...");
        await run("compile");
        
        const contractArtifact = await artifacts.readArtifact(contractName);
        return { abi: contractArtifact.abi, bytecode: contractArtifact.bytecode };
    } catch (error: any) {

        console.log("compilationErrors", compilationErrors);
        return { 
            error: compilationErrors,
        };
    } finally {
        // Restore original console.error
        console.error = originalConsoleError;
        
        if (fs.existsSync(contractPath)) {
            fs.unlinkSync(contractPath);
        }
    }
};
