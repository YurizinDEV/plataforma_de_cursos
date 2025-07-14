import {
    fakeMappings
} from "./globalFakeMapping.js";
import Curso from "../models/Curso.js";
import Usuario from "../models/Usuario.js";

export default async function cursosSeed() {
    const usuarios = await Usuario.find({});
    await Curso.deleteMany({});

    const cursos = [];
    const titulosUsados = new Set();

    const tags = ['js', 'react', 'node', 'python', 'mongodb', 'vue', 'angular', 'css',
        'html', 'express', 'php', 'laravel', 'docker', 'aws', 'devops', 'data'
    ];

    const professores = [
        'Prof. João Silva', 'Dra. Maria Oliveira', 'Prof. Pedro Lima',
        'Dra. Ana Souza', 'Prof. Carlos Pereira', 'Dra. Juliana Alves'
    ];

    for (let i = 0; i < 20; i++) {
        const criador = usuarios[Math.floor(Math.random() * usuarios.length)];

        const numTags = Math.floor(Math.random() * 3) + 1;
        const tagsEscolhidas = tags.sort(() => 0.5 - Math.random()).slice(0, numTags);

        let titulo;
        do {
            titulo = fakeMappings.common.titulo.apply();
        } while (titulosUsados.has(titulo));
        titulosUsados.add(titulo);

        let status;
        if (i < 3) {
            status = null;
        } else {
            status = fakeMappings.Curso.status.apply();
        }

        let materialComplementar;
        if (i % 3 === 0) {
            materialComplementar = fakeMappings.common.materialComplementar.apply();
        } else if (i % 3 === 1) {
            materialComplementar = undefined;
        } else {
            materialComplementar = [
                `https://exemplo.com/material-${i}.pdf`
            ];
        }

        const thumbnail = i % 5 === 0 ? "" : fakeMappings.common.thumbnail.apply();

        const numProfessores = Math.floor(Math.random() * 2) + 1;
        const professoresEscolhidos = professores.sort(() => 0.5 - Math.random()).slice(0, numProfessores);

        const curso = {
            titulo,
            descricao: fakeMappings.common.descricao.apply(),
            thumbnail,
            cargaHorariaTotal: fakeMappings.Curso.cargaHorariaTotal.apply(),
            professores: professoresEscolhidos,
            tags: tagsEscolhidas,
            criadoPorId: criador._id
        };

        if (status !== null) {
            curso.status = status;
        }
        if (materialComplementar !== undefined) {
            curso.materialComplementar = materialComplementar;
        }

        cursos.push(curso);
    }

    const inserted = await Curso.insertMany(cursos);

    for (const usuario of usuarios) {
        const numCursos = Math.floor(Math.random() * 3) + 1;
        const cursosEscolhidos = inserted.sort(() => 0.5 - Math.random()).slice(0, numCursos);

        for (const curso of cursosEscolhidos) {
            usuario.cursosIds.push(curso._id);
            const temProgresso = Math.floor(Math.random() * 100) + 1 <= 70;
            if (temProgresso) {
                usuario.progresso.push({
                    percentual_conclusao: (Math.floor(Math.random() * 101)).toString(),
                    curso: curso._id
                });
            }
        }

        await usuario.save();
    }

    console.log(`Cursos gerados com sucesso!`);

    return {
        total: inserted.length
    };
}

// cursosSeed();