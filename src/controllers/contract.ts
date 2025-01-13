import contractService from "../services/contract";

const contractController = {
    deploy: async (req: any, res: any) => {
        try {
            const { contractCode } = req.body;
            if (!contractCode) {
                return res.status(400).json({ success: false, message: "Source code is required." });
            }
            const {abi, bytecode} = await contractService.deploy(contractCode);
            res.status(200).json({ success: true, abi, bytecode });
        } catch (error: any) {
            console.error("Error deploying contract:", error.message);
            res.status(500).json({ success: false, message: "Deployment failed", error: error.message });
        }
    }
}

export default contractController;