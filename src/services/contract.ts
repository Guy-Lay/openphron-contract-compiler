import { compileContract } from "../utils/compileContract";
import { cleanSourceCode, extractContractName } from "../utils";
import { autoInstallModules } from "../utils/installModules";
import { runTests } from "../utils/runTest";

const contractService = {
    compile: async (contractCode: string): Promise<any> => {
        try {
            const contractName = extractContractName(contractCode);
            await autoInstallModules(contractCode);
            const result = await compileContract(cleanSourceCode(contractCode), contractName);
            return result;
        } catch (error: any) {
            console.log("contractService Error: ", error);

        }
    },
    testCode: async (testCode: string, contractCode: string): Promise<any> => {
        const contractName = extractContractName(contractCode);
        const result = await runTests(testCode, cleanSourceCode(contractCode), contractName);
        return result;
    }
}

export default contractService
