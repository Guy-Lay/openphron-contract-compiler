import contractService from "../services/contract";

const contractController = {
    compile: async (req: any, res: any) => {
        try {
            const { contractCode } = req.body;
            if (!contractCode) {
                return res.status(400).json({ success: false, message: "Source code is required." });
            }
            const result = await contractService.compile(contractCode);
            if (result.error) {
                res.json({ success: false, error: result.error });
                return;
            }
            res.json({ success: true, abi: result.abi, bytecode: result.bytecode });
        } catch (error: any) {
            console.error("Error deploying contract:", error.message);
        }
    },
    testContrat: async (req: any, res: any) => {
        try {
            const { testCode } = req.body;
            const result = await contractService.testCode(testCode);
            res.json(result);
        } catch (error: any) {
            res.json({ success: false, error: error.message });
        }
    }
}

export default contractController;