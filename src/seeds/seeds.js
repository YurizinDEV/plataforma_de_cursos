import dontenv from 'dotenv';
import faker from 'faker';
import mongoose from 'mongoose';
import DbConnect from '../config/dbConnect';

import Alternativa from '../models/Alternativa';
import Curso from '../models/Curso';
import Aula from '../models/Aula';
import Certificado from '../models/Certificado';
import Questionario from '../models/Questionario';
import Usuario from '../models/Usuario';

import "dotenv/config";

import usuariosSeed from "./usuariosSeed.js";
import cursosSeed from "./cursosSeed.js";
import aulasSeed from "./aulasSeed.js";
import questionariosSeed from "./questionariosSeed.js";
import alternativasSeed from "./alternativasSeed.js";
import certificadosSeed from "./certificadosSeed.js";

import {
    conectarBanco,
    desconectarBanco
} from "../config/dbConnect.js"; 

async function seed() {
    try {
        await conectarBanco(); 

        await usuariosSeed(); 
        await cursosSeed(); 
        await aulasSeed(); 
        await questionariosSeed(); 
        await alternativasSeed();
        await certificadosSeed(); 

        console.log("🌱  Seed executado com sucesso!");
    } catch (err) {
        console.error("❌  Ocorreu um erro durante o seed:", err);
    } finally {
        await desconectarBanco?.(); 
        process.exit();
    }
}

seed();