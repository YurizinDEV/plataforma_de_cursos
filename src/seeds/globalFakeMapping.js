import fakebr from 'faker-br';
import mongoose from 'mongoose';
import {
    v4 as uuid
} from 'uuid';
import TokenUtil from '../utils/TokenUtil.js';
import loadModels from './loadModels.js';
import bcrypt from 'bcrypt';

function gerarSenha() {
    return bcrypt.hashSync("1234Teste@", 12);
}

export const fakeMappings = {
    // Campos comuns a vários models
    common: {
        titulo: () => fakebr.lorem.words(3),
        descricao: () => fakebr.lorem.paragraph(),
        criadoEm: () => fakebr.date.past(),
        thumbnail: () => fakebr.image.imageUrl(640, 480, "education", true),
        tags: () => fakebr.random.arrayElements(["js", "node", "db", "ux", "devops"], 3),
        materialComplementar: () => [],
        ativo: () => fakebr.random.boolean(),
    },

    /* ---------- USUARIO ---------- */
    Usuario: {
        nome: () => fakebr.name.firstName() + " " + fakebr.name.lastName(),
        senha: () => gerarSenha(),
        email: () => fakebr.internet.email().toLowerCase(),
        grupos: () => [],
        cursosIds: () => [],
        progresso: () => [],
        ativo: () => fakebr.random.boolean(),
        tokenUnico: () => TokenUtil.generateAccessToken(new mongoose.Types.ObjectId().toString()),
        codigo_recupera_senha: () => fakebr.random.alphaNumeric(6),
        exp_codigo_recupera_senha: () => fakebr.date.future(),
        refreshtoken: () => TokenUtil.generateRefreshToken(new mongoose.Types.ObjectId().toString()),
        accesstoken: () => TokenUtil.generateAccessToken(new mongoose.Types.ObjectId().toString()),
        permissoes: () => [],
    },

    /* ---------- CURSO ---------- */
    Curso: {
        cargaHorariaTotal: () => fakebr.random.number({
            min: 5,
            max: 40
        }),
        professores: () => [fakebr.name.findName()],
        criadoPorId: () => new mongoose.Types.ObjectId(),
        status: () => fakebr.random.arrayElement(['ativo', 'inativo', 'rascunho', 'arquivado']),
    },

    /* ---------- AULA ---------- */
    Aula: {
        conteudoURL: () => fakebr.internet.url(),
        cargaHoraria: () => fakebr.random.number({
            min: 1,
            max: 3
        }),
        cursoId: () => new mongoose.Types.ObjectId(),
        criadoPorId: () => new mongoose.Types.ObjectId(),
    },

    /* ---------- QUESTIONARIO ---------- */
    Questionario: {
        enunciado: () => fakebr.lorem.sentence(),
        numeroRespostaCorreta: () => fakebr.random.number({
            min: 0,
            max: 3
        }),
        alternativas: () => [],
        aulaId: () => new mongoose.Types.ObjectId(),
    },

    /* ---------- ALTERNATIVA ---------- */
    Alternativa: {
        texto: () => fakebr.lorem.words(3),
        numeroResposta: () => fakebr.random.number({
            min: 0,
            max: 3
        }),
        questionarioId: () => new mongoose.Types.ObjectId(),
    },

    /* ---------- CERTIFICADO ---------- */
    Certificado: {
        dataEmissao: () => fakebr.date.past(),
        usuarioId: () => new mongoose.Types.ObjectId(),
        cursoId: () => new mongoose.Types.ObjectId(),
    },

    /* ---------- GRUPO ---------- */
    Grupo: {
        nome: () => fakebr.company.companyName(),
        permissoes: () => [],
    },

    /* ---------- ROTA ---------- */
    Rota: {
        rota: () => fakebr.lorem.word(10),
        dominio: () => fakebr.internet.url(),
        buscar: () => fakebr.random.boolean(),
        enviar: () => fakebr.random.boolean(),
        substituir: () => fakebr.random.boolean(),
        modificar: () => fakebr.random.boolean(),
        excluir: () => fakebr.random.boolean(),
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
        };
    });

    return globalMapping;
};

function getSchemaFieldNames(schema) {
    const fieldNames = new Set();

    Object.keys(schema.paths).forEach((key) => {
        if (['_id', '__v', 'createdAt', 'updatedAt'].includes(key)) return;
        const topLevel = key.split('.')[0];
        fieldNames.add(topLevel);
    });

    return Array.from(fieldNames);
};


function validateModelMapping(model, modelName, mapping) {
    const fields = getSchemaFieldNames(model.schema);
    const missing = fields.filter((field) => !(field in mapping));

    if (missing.length > 0) {
        console.error(
            `Model ${modelName} está faltando mapeamento para os campos: ${missing.join(', ')}`
        );
    } else {
        console.log(`Model ${modelName} possui mapeamento para todos os campos.`);
    };

    return missing;
};

async function validateAllMappings() {
    const models = await loadModels();
    let totalMissing = {};

    models.forEach(({
        model,
        name
    }) => {
        const mapping = {
            ...fakeMappings.common,
            ...(fakeMappings[name] || {}),
        };
        const missing = validateModelMapping(model, name, mapping);
        if (missing.length > 0) {
            totalMissing[name] = missing;
        };
    });

    if (Object.keys(totalMissing).length === 0) {
        console.log('globalFakeMapping cobre todos os campos de todos os models.');
        return true;
    } else {
        console.warn('Faltam mapeamentos para os seguintes models:', totalMissing);
        return false;
    };
};


validateAllMappings()
    .then((valid) => {
        if (valid) {
            console.log('Podemos acessar globalFakeMapping com segurança.');
        } else {
            throw new Error('globalFakeMapping não possui todos os mapeamentos necessários.');
        };
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })

export default getGlobalFakeMapping;