// /src/seeds/globalFakeMapping.js

import fakebr from 'faker-br';
import mongoose from 'mongoose';
import {
    v4 as uuid
} from 'uuid';
import TokenUtil from '../utils/TokenUtil.js';
import loadModels from './loadModels.js';


import Alternativa from '../models/Alternativa';
import Curso from '../models/Curso';
import Aula from '../models/Aula';
import Certificado from '../models/Certificado';
import Questionario from '../models/Questionario';
import Usuario from '../models/Usuario';


/**
 * Estrutura de mappings organizada por model.
 */
const fakeMappings = {
    // Campos comuns a vários models
    common: {
        titulo: () => fakerbr.lorem.words(3),
        descricao: () => fakerbr.lorem.paragraph(),
        criadoEm: () => fakerbr.date.past(),
        thumbnail: () => fakerbr.image.imageUrl(640, 480, "education", true),
        tags: () => fakerbr.random.arrayElements(["js", "node", "db", "ux", "devops"], 3),
        materialComplementar: () => [],
    },

    /* ---------- USUARIO ---------- */
    Usuario: {
        nome: () => fakerbr.name.firstName() + " " + fakerbr.name.lastName(),
        senha: () => gerarSenha(),
        email: () => fakerbr.internet.email().toLowerCase(),
        ehAdmin: () => fakerbr.random.boolean(),
        cursosIds: () => [new mongoose.Types.ObjectId()],
        progresso: () => [{
            percentual_conclusao: fakerbr.datatype.number({
                min: 0,
                max: 100
            }) + "%",
            curso: new mongoose.Types.ObjectId(),
        }, ],
    },

    /* ---------- CURSO ---------- */
    Curso: {
        cargaHorariaTotal: () => fakerbr.datatype.number({
            min: 5,
            max: 40
        }),
        professores: () => [fakerbr.name.findName()],
        criadoPorId: () => new mongoose.Types.ObjectId(),
    },

    /* ---------- AULA ---------- */
    Aula: {
        conteudoURL: () => fakerbr.internet.url(),
        cargaHoraria: () => fakerbr.datatype.number({
            min: 1,
            max: 3
        }),
        cursoId: () => new mongoose.Types.ObjectId(),
        criadoPorId: () => new mongoose.Types.ObjectId(),
    },

    /* ---------- QUESTIONARIO ---------- */
    Questionario: {
        enunciado: () => fakerbr.lorem.sentence(),
        numeroRespostaCorreta: () => fakerbr.datatype.number({
            min: 0,
            max: 3
        }),
        alternativas: () => [],
        aulaId: () => new mongoose.Types.ObjectId(),
    },

    /* ---------- ALTERNATIVA ---------- */
    Alternativa: {
        texto: () => fakerbr.lorem.words(3),
        numeroResposta: () => fakerbr.datatype.number({
            min: 0,
            max: 3
        }),
        questionarioId: () => new mongoose.Types.ObjectId(),
    },

    /* ---------- CERTIFICADO ---------- */
    Certificado: {
        dataEmissao: () => fakerbr.date.past(),
        usuarioId: () => new mongoose.Types.ObjectId(),
        cursoId: () => new mongoose.Types.ObjectId(),
    },
};


export async function getGlobalFakeMapping() {
    const models = await loadModels();
    let globalMapping = {
        ...fakeMappings.common
    };

    models.forEach(({
        name
    }) => {
        if (fakeMappings[name]) {
            globalMapping = {
                ...globalMapping,
                ...fakeMappings[name],
            };
        }
    });

    return globalMapping;
}


function getSchemaFieldNames(schema) {
    const fieldNames = new Set();
    Object.keys(schema.paths).forEach((key) => {
        if (['_id', '__v', 'createdAt', 'updatedAt'].includes(key)) return;
        const topLevel = key.split('.')[0];
        fieldNames.add(topLevel);
    });
    return Array.from(fieldNames);
}


function validateModelMapping(model, modelName, mapping) {
    const fields = getSchemaFieldNames(model.schema);
    const missing = fields.filter((field) => !(field in mapping));
    if (missing.length > 0) {
        console.error(
            `Model ${modelName} está faltando mapeamento para os campos: ${missing.join(', ')}`
        );
    } else {
        console.log(`Model ${modelName} possui mapeamento para todos os campos.`);
    }
    return missing;
}


function getSchemaFieldNames(schema) {
    const ignore = ["_id", "__v", "createdAt", "updatedAt"];
    const set = new Set();
    Object.keys(schema.paths).forEach((k) => {
        if (ignore.includes(k)) return;
        set.add(k.split(".")[0]);
    });
    return [...set];
}

function validateModelMapping(model, modelName, mapping) {
    const fields = getSchemaFieldNames(model.schema);
    const missing = fields.filter((f) => !(f in mapping));
    if (missing.length)
        console.error(
            `⚠️  Model ${modelName} sem mapping para: ${missing.join(", ")}`
        );
    else console.log(`✅ Model ${modelName} coberto.`);
    return missing;
}


export async function getGlobalFakeMapping() {
    const models = await loadModels(); // [{ model, name }]
    let global = {
        ...fakeMappings.common
    };

    models.forEach(({
        name
    }) => {
        if (fakeMappings[name]) global = {
            ...global,
            ...fakeMappings[name]
        };
    });

    return global;
}


(async () => {
    const models = await loadModels();
    let ok = true;

    models.forEach(({
        model,
        name
    }) => {
        const mapping = {
            ...fakeMappings.common,
            ...(fakeMappings[name] || {})
        };
        const missing = validateModelMapping(model, name, mapping);
        if (missing.length) ok = false;
    });

    if (!ok) {
        console.error("❌  Corrija os mappings antes de prosseguir.");
        process.exit(1);
    } else {
        console.log("🌱  globalFakeMapping pronto para uso.");
    }
})();

export default getGlobalFakeMapping;