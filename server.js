    import "dotenv/config";
    import app from "./src/app.js";

    const port = process.env.PORT || 5010;

    app.listen(port, () => {
        console.log(`Servidor escutando em http://localhost:${port}`)
    })