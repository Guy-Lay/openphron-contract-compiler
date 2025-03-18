import * as fs from "fs";
import * as path from "path";

export const makeNewCode = (contractCode: string, contractName: string, folderName: string) => {
    const contractPath = path.join(__dirname, `../../${folderName}`, `${contractName}.sol`);
    try {
        fs.mkdirSync(path.dirname(contractPath), { recursive: true });
        fs.writeFileSync(contractPath, contractCode);
        return contractPath;
    } catch (error: any) {
        console.log("makeCode error", error.message);
    }
}