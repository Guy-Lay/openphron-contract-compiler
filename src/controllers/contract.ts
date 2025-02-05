import contractService from "../services/contract";
import { addToQueue } from "../utils/requestQueue";

const contractController = {
    compile: async (req: any, res: any) => {
        addToQueue(req, res, async (req, res) => {
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
                res.json({ success: false, error: error.message });
                console.error("compile Error:", error.message);
            }
        });
    },
    testContrat: async (req: any, res: any) => {
        addToQueue(req, res, async (req, res) => {
            try {
                const { testCode, contractCode } = req.body;
                const result = await contractService.testCode(testCode, contractCode);
                res.json(result);
            } catch (error: any) {
                res.json({ success: false, error: error.message });
            }
        }
    }
}

export default contractController;