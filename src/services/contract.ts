import { compileContract } from "../utils/compileContract";
import { cleanSourceCode, extractContractName } from "../utils";
import { runTests } from "../utils/runTest";
import { verifyContract } from "../utils/verifyContract";

const contractService = {
    compile: async (contractCode: string): Promise<any> => {
        const contractName = extractContractName(contractCode);

        // await autoInstallModules(contractCode);
        const result = await compileContract(cleanSourceCode(contractCode), contractName);
        return result;
    },
    testCode: async (testCode: string, contractCode: string): Promise<any> => {
        const contractName = extractContractName(contractCode);
        const result = await runTests(testCode, cleanSourceCode(contractCode), contractName);
        return result;
    },
    verify: async (contractAddress: string, constructorArguments: any[], chainId: number, contractCode: string): Promise<any> => {

        const result = await verifyContract(contractAddress, constructorArguments, chainId, cleanSourceCode(contractCode));
        return result;
    }
}

export default contractService
