const validateEnv = () => {
    const requiredEnv = [
        "GEMINI_API_KEY",
        "PORT",
        "NODE_ENV"
    ];

    const missingEnv = requiredEnv.filter(key => !process.env[key]);
    
    if (missingEnv.length > 0) {
        throw new Error(`Missing environment variables: ${missingEnv.join(", ")}`);
    }
};

module.exports = { validateEnv };