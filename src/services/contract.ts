import { compileContract } from "../utils/compileContract";
import { cleanSourceCode, extractContractName, getSigner } from "../utils";
import { autoInstallModules } from "../utils/installModules";

const contractService = {
    deploy: async (contractCode: string): Promise<any> => {
        try {
            const contractName = extractContractName(contractCode);
            autoInstallModules(contractCode);
            const { abi, bytecode } = await compileContract(cleanSourceCode(contractCode), contractName);

            return { abi, bytecode }
        } catch (error: any) {
            console.log("contractService Error: ", error.message);
        }
    }
}

export default contractService;