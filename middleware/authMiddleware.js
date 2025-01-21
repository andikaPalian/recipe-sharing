import jwt from 'jsonwebtoken';
import Chef from '../models/chef.model.js';

const authMiddleware = async (req, res, next) => {
    try {
        let token;
        const authHeader = req.headers.Authorization || req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer")) {
            token = authHeader.split(" ")[1];
            jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
                if (err) {
                    return res.status(403).json({message: "Chef is not authorized"});
                }

                const chef = await Chef.findById(decoded.chef?.id || decoded.id);
                if (!chef) {
                    return res.status(404).json({message: "Chef not found"});
                }
                req.chef = {
                    chefId: chef._id,
                    name: chef.name,
                    email: chef.email
                };
                next();
            });
        } else {
            return res.status(403).json({message: "Token is missing or not provided"});
        }
    } catch (error) {
        console.error("Error during auth middleware:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message || "An unexpected error occurred",
        });
    }
}

export default authMiddleware;