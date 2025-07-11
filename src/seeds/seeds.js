import DbConnect from "../config/DbConnect.js";
import usuariosSeed from "./usuarioSeeds.js";
import cursosSeed from "./cursoSeeds.js";
import aulasSeed from "./aulaSeeds.js";
import questionariosSeed from "./questionarioSeeds.js";
import alternativasSeed from "./alternativaSeeds.js";
import certificadosSeed from "./certificadoSeeds.js";
import { criarRotasSeeds, criarGruposSeeds } from "./permissionSeeds.js";

async function runSeeds() {

    DbConnect.conectar();

    await criarRotasSeeds();
    await criarGruposSeeds();
    await usuariosSeed();
    await cursosSeed();
    await aulasSeed();
    await questionariosSeed();
    await alternativasSeed();
    await certificadosSeed();
    console.log("Seeds executados com sucesso");

    DbConnect.desconectar();
}


await runSeeds();