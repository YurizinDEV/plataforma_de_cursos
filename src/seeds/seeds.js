import DbConnect from "../config/DbConnect.js";
import usuarioSeed from "./usuarioSeeds.js";
import cursoSeed from "./cursoSeeds.js";
import aulaSeed from "./aulaSeeds.js";
import questionarioSeed from "./questionarioSeeds.js";
import alternativaSeed from "./alternativaSeeds.js";
import certificadoSeed from "./certificadoSeeds.js";

DbConnect.conectar();

await usuarioSeed();
await cursoSeed();
await aulaSeed();
await questionarioSeed();
await alternativaSeed();
await certificadoSeed();
console.log("Seeds executados com sucesso");

DbConnect.desconectar();
