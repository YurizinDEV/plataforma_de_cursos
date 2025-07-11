import fakerbr from "faker-br";
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

    const statusOptions = ['ativo', 'inativo', 'rascunho', 'arquivado'];

    for (let i = 0; i < 20; i++) {
        const criador = usuarios[Math.floor(Math.random() * usuarios.length)];

        const numTags = fakerbr.random.number({
            min: 1,
            max: 3
        });
        const tagsEscolhidas = fakerbr.random.arrayElements(tags, numTags);

        let titulo;
        do {
            titulo = `Curso de ${fakerbr.company.catchPhraseNoun()}`;
        } while (titulosUsados.has(titulo));
        titulosUsados.add(titulo);

        let status;
        if (i < 3) {
            status = null;
        } else {
            const probabilidade = fakerbr.random.number({
                min: 1,
                max: 100
            });
            if (probabilidade <= 60) {
                status = 'ativo';
            } else {
                status = fakerbr.random.arrayElement(['inativo', 'rascunho', 'arquivado']);
            }
        }

        const cargaHoraria = fakerbr.random.number({
            min: 10,
            max: 480
        });

        let materialComplementar;
        if (i % 3 === 0) {
            materialComplementar = [];
        } else if (i % 3 === 1) {
            materialComplementar = undefined;
        } else {
            materialComplementar = [
                `https://exemplo.com/material-${i}.pdf`
            ];
        }

        const thumbnail = i % 5 === 0 ? "" : fakerbr.image.imageUrl();

        const numProfessores = fakerbr.random.number({
            min: 1,
            max: 2
        });
        const professoresEscolhidos = fakerbr.random.arrayElements(professores, numProfessores);

        const curso = {
            titulo,
            descricao: fakerbr.lorem.paragraph(),
            thumbnail,
            cargaHorariaTotal: cargaHoraria,
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
        const numCursos = fakerbr.random.number({
            min: 1,
            max: 3
        });
        const cursosEscolhidos = fakerbr.random.arrayElements(inserted, numCursos);

        for (const curso of cursosEscolhidos) {
            usuario.cursosIds.push(curso._id);
            const temProgresso = fakerbr.random.number({
                min: 1,
                max: 100
            }) <= 70;
            if (temProgresso) {
                usuario.progresso.push({
                    percentual_conclusao: fakerbr.random.number({
                        min: 0,
                        max: 100
                    }).toString(),
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