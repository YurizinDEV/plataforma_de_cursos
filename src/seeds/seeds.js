import mongoose from "mongoose";
import DbConnect from "../config/DbConnect.js";
import usuariosSeed from "./usuarioSeeds.js";
import cursosSeed from "./cursoSeeds.js";
import aulasSeed from "./aulaSeeds.js";
import questionariosSeed from "./questionarioSeeds.js";
import alternativasSeed from "./alternativaSeeds.js";
import certificadosSeed from "./certificadoSeeds.js";
import {
    criarRotasSeeds,
    criarGruposSeeds
} from "./permissionSeeds.js";

await DbConnect.conectar();

try {
    console.log(`[${new Date().toLocaleString()}] - Iniciando criação das seeds...`);

    await criarRotasSeeds();
    await criarGruposSeeds();
    await usuariosSeed();
    await cursosSeed();
    await aulasSeed();
    await questionariosSeed();
    await alternativasSeed();
    await certificadosSeed();

    console.log(`[${new Date().toLocaleString()}] - Seeds criadas com sucesso!`);
} catch (error) {
    console.error("Erro ao criar seeds:", error);
} finally {
    mongoose.connection.close();
    process.exit(0);
};