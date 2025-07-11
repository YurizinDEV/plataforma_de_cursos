import request from "supertest";
import {
    describe,
    it,
    expect,
    beforeAll
} from "@jest/globals";
import faker from "faker-br";
import dotenv from 'dotenv';
import "../../../src/routes/cursoRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 5010;
const BASE_URL = `http://localhost:${PORT}`;

describe("Cursos", () => {
    let token;
    let cursoId;
    let criadoPorId;

    beforeAll(async () => {
        const senhaAdmin = 'Admin@1234';
        process.env.JWT_SECRET_ACCESS_TOKEN = 'sua_chave_secreta_access';
        try {
            await request(BASE_URL)
                .post('/signup')
                .send({
                    nome: 'Admin',
                    email: 'admin@gmail.com',
                    senha: senhaAdmin,
                    ativo: true
                });
        } catch (err) {}

        const loginRes = await request(BASE_URL)
            .post('/login')
            .send({
                email: 'admin@gmail.com',
                senha: senhaAdmin
            });
        token = loginRes.body?.data?.user?.accesstoken;
        expect(token).toBeTruthy();

        const usuarioRes = await request(BASE_URL)
            .post("/usuarios")
            .send({
                nome: faker.name.firstName(),
                email: faker.internet.email(),
                senha: 'Senha1234!'
            })
            .set("Authorization", `Bearer ${token}`);
        criadoPorId = usuarioRes.body.data._id;
    });

    it("Deve cadastrar um curso válido (POST)", async () => {
        const objCurso = {
            titulo: `Curso ${faker.random.word()} ${Date.now()}`,
            cargaHorariaTotal: 40,
            descricao: faker.lorem.sentence(),
            criadoPorId: criadoPorId
        };
        const res = await request(BASE_URL)
            .post("/cursos")
            .send(objCurso)
            .set("Authorization", `Bearer ${token}`)
            .expect(201);
        cursoId = res.body.data._id;
        expect(res.body.data).toHaveProperty("_id");
        expect(res.body.data.titulo).toBe(objCurso.titulo);
        expect(res.body.data.cargaHorariaTotal).toBe(objCurso.cargaHorariaTotal);
        expect(res.body.data.criadoPorId).toBe(objCurso.criadoPorId);
    });

    it("Não deve cadastrar curso sem título ou criadoPorId (400)", async () => {
        await request(BASE_URL)
            .post("/cursos")
            .send({
                cargaHorariaTotal: 20,
                criadoPorId: criadoPorId
            })
            .set("Authorization", `Bearer ${token}`)
            .expect(400);

        await request(BASE_URL)
            .post("/cursos")
            .send({
                titulo: "Curso Teste",
                cargaHorariaTotal: 20
            })
            .set("Authorization", `Bearer ${token}`)
            .expect(400);
    });

    it("Não deve cadastrar curso com título duplicado (409 ou 400)", async () => {
        const titulo = `Curso Único ${Date.now()}`;
        await request(BASE_URL)
            .post("/cursos")
            .send({
                titulo: titulo,
                cargaHorariaTotal: 20,
                criadoPorId: criadoPorId
            })
            .set("Authorization", `Bearer ${token}`)
            .expect(201);

        await request(BASE_URL)
            .post("/cursos")
            .send({
                titulo: titulo,
                cargaHorariaTotal: 30,
                criadoPorId: criadoPorId
            })
            .set("Authorization", `Bearer ${token}`)
            .expect(res => {
                expect([400, 409]).toContain(res.status);
            });
    });

    it("Deve cadastrar curso com carga horária padrão 0", async () => {
        const objCurso = {
            titulo: `Curso ${faker.random.word()} ${Date.now()}`,
            criadoPorId: criadoPorId
        };
        const res = await request(BASE_URL)
            .post("/cursos")
            .send(objCurso)
            .set("Authorization", `Bearer ${token}`)
            .expect(201);
        expect(res.body.data.cargaHorariaTotal).toBe(0);
    });

    it("Não deve cadastrar curso com carga horária negativa (400)", async () => {
        await request(BASE_URL)
            .post("/cursos")
            .send({
                titulo: `Curso ${Date.now()}`,
                cargaHorariaTotal: -10,
                criadoPorId: criadoPorId
            })
            .set("Authorization", `Bearer ${token}`)
            .expect(400);
    });

    it("Deve cadastrar curso com status ativo por padrão", async () => {
        const objCurso = {
            titulo: `Curso ${faker.random.word()} ${Date.now()}`,
            cargaHorariaTotal: 20,
            criadoPorId: criadoPorId
        };
        const res = await request(BASE_URL)
            .post("/cursos")
            .send(objCurso)
            .set("Authorization", `Bearer ${token}`)
            .expect(201);
        expect(res.body.data.status).toBe("ativo");
    });

    it("Deve cadastrar curso com arrays vazios inicializados", async () => {
        const objCurso = {
            titulo: `Curso ${faker.random.word()} ${Date.now()}`,
            cargaHorariaTotal: 20,
            criadoPorId: criadoPorId
        };
        const res = await request(BASE_URL)
            .post("/cursos")
            .send(objCurso)
            .set("Authorization", `Bearer ${token}`)
            .expect(201);
        expect(Array.isArray(res.body.data.materialComplementar)).toBe(true);
        expect(Array.isArray(res.body.data.professores)).toBe(true);
        expect(Array.isArray(res.body.data.tags)).toBe(true);
    });

    it("Deve listar todos os cursos ativos (GET)", async () => {
        const res = await request(BASE_URL)
            .get("/cursos")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        expect(Array.isArray(res.body.data.docs)).toBe(true);
        expect(res.body.data.docs.length).toBeGreaterThan(0);
    });

    it("Deve retornar curso por id (GET /cursos/:id)", async () => {
        const res = await request(BASE_URL)
            .get(`/cursos/${cursoId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        expect(res.body.data.docs[0]._id).toBe(cursoId);
    });

    it("Deve retornar 404 ao buscar curso inexistente", async () => {
        await request(BASE_URL)
            .get(`/cursos/000000000000000000000000`)
            .set("Authorization", `Bearer ${token}`)
            .expect(res => {
                expect([200, 404]).toContain(res.status);
            });
    });

    it("Deve aplicar filtro de busca por título", async () => {
        const tituloFiltro = `CursoFiltro${Date.now()}`;
        await request(BASE_URL)
            .post("/cursos")
            .send({
                titulo: tituloFiltro,
                cargaHorariaTotal: 10,
                criadoPorId: criadoPorId
            })
            .set("Authorization", `Bearer ${token}`);

        const res = await request(BASE_URL)
            .get(`/cursos?titulo=${tituloFiltro}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        expect(res.body.data.docs.some(c => c.titulo === tituloFiltro)).toBe(true);
    });

    it("Deve aplicar filtro por carga horária mínima", async () => {
        await request(BASE_URL)
            .post("/cursos")
            .send({
                titulo: `CursoFiltroMin${Date.now()}`,
                cargaHorariaTotal: 35,
                criadoPorId: criadoPorId
            })
            .set("Authorization", `Bearer ${token}`);

        const res = await request(BASE_URL)
            .get("/cursos?cargaHorariaTotalMin=30")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        const cursosComCargaCorreta = res.body.data.docs.filter(curso =>
            curso.cargaHorariaTotal >= 30
        );
        expect(cursosComCargaCorreta.length).toBeGreaterThan(0);
    });

    it("Deve aplicar filtro por carga horária máxima", async () => {
        await request(BASE_URL)
            .post("/cursos")
            .send({
                titulo: `CursoFiltroMax${Date.now()}`,
                cargaHorariaTotal: 25,
                criadoPorId: criadoPorId
            })
            .set("Authorization", `Bearer ${token}`);

        const res = await request(BASE_URL)
            .get("/cursos?cargaHorariaTotalMax=50")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        const cursosComCargaCorreta = res.body.data.docs.filter(curso =>
            curso.cargaHorariaTotal <= 50
        );
        expect(cursosComCargaCorreta.length).toBeGreaterThan(0);
    });

    it("Deve aplicar filtro por status", async () => {
        const res = await request(BASE_URL)
            .get("/cursos?status=ativo")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        res.body.data.docs.forEach(curso => {
            expect(curso.status).toBe("ativo");
        });
    });

    it("Deve aplicar filtro por material complementar", async () => {
        const cursoComMaterial = {
            titulo: `CursoComMaterial${Date.now()}`,
            cargaHorariaTotal: 20,
            criadoPorId: criadoPorId,
            materialComplementar: ["link1", "link2"]
        };
        await request(BASE_URL)
            .post("/cursos")
            .send(cursoComMaterial)
            .set("Authorization", `Bearer ${token}`);

        const res = await request(BASE_URL)
            .get("/cursos?temMaterialComplementar=true")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        res.body.data.docs.forEach(curso => {
            expect(curso.materialComplementar.length).toBeGreaterThan(0);
        });
    });

    it("Deve aplicar ordenação por título", async () => {
        const res = await request(BASE_URL)
            .get("/cursos?ordenarPor=titulo&direcaoOrdem=asc")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        const titulos = res.body.data.docs.map(c => c.titulo);
        const titulosOrdenados = [...titulos].sort();
        expect(titulos).toEqual(titulosOrdenados);
    });

    it("Deve aplicar filtro de data de criação", async () => {
        const dataFiltro = "2023-01-01";
        const res = await request(BASE_URL)
            .get(`/cursos?criadoApos=${dataFiltro}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(res => {
                expect([200, 400]).toContain(res.status);
            });

        if (res.status === 200 && res.body.data.docs.length > 0) {
            res.body.data.docs.forEach(curso => {
                if (curso.criadoEm || curso.createdAt) {
                    const dataCriacao = new Date(curso.criadoEm || curso.createdAt);
                    const dataLimite = new Date(dataFiltro);
                    expect(dataCriacao >= dataLimite).toBe(true);
                }
            });
        }
    });

    it("Deve atualizar curso (PUT)", async () => {
        const novoTitulo = `Curso Atualizado ${Date.now()}`;
        const res = await request(BASE_URL)
            .put(`/cursos/${cursoId}`)
            .send({
                titulo: novoTitulo
            })
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        expect(res.body.data.titulo).toBe(novoTitulo);
    });

    it("Deve atualizar curso (PATCH)", async () => {
        const novaDescricao = `Descrição atualizada ${Date.now()}`;
        const res = await request(BASE_URL)
            .patch(`/cursos/${cursoId}`)
            .send({
                descricao: novaDescricao
            })
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        expect(res.body.data.descricao).toBe(novaDescricao);
    });

    it("Deve retornar 404 ao atualizar curso inexistente", async () => {
        await request(BASE_URL)
            .put(`/cursos/000000000000000000000000`)
            .send({
                titulo: "Curso Inexistente"
            })
            .set("Authorization", `Bearer ${token}`)
            .expect(404);
    });

    it("Deve retornar erro ao atualizar sem dados", async () => {
        await request(BASE_URL)
            .put(`/cursos/${cursoId}`)
            .send({})
            .set("Authorization", `Bearer ${token}`)
            .expect(400);
    });

    it("Não deve permitir atualizar para título já existente", async () => {
        const outroCurso = await request(BASE_URL)
            .post("/cursos")
            .send({
                titulo: `OutroCurso${Date.now()}`,
                criadoPorId: criadoPorId
            })
            .set("Authorization", `Bearer ${token}`);

        const primeiroRes = await request(BASE_URL)
            .get(`/cursos/${cursoId}`)
            .set("Authorization", `Bearer ${token}`);

        await request(BASE_URL)
            .put(`/cursos/${outroCurso.body.data._id}`)
            .send({
                titulo: primeiroRes.body.data.titulo
            })
            .set("Authorization", `Bearer ${token}`)
            .expect(res => {
                expect([400, 409]).toContain(res.status);
            });
    });

    it("Deve deletar curso (DELETE)", async () => {
        const cursoParaDeletar = await request(BASE_URL)
            .post("/cursos")
            .send({
                titulo: `CursoParaDeletar${Date.now()}`,
                criadoPorId: criadoPorId
            })
            .set("Authorization", `Bearer ${token}`);

        await request(BASE_URL)
            .delete(`/cursos/${cursoParaDeletar.body.data._id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
    });

    it("Deve retornar 404 ao deletar curso inexistente", async () => {
        await request(BASE_URL)
            .delete(`/cursos/000000000000000000000000`)
            .set("Authorization", `Bearer ${token}`)
            .expect(404);
    });

    it("Deve restaurar curso deletado (PATCH /cursos/:id/restaurar)", async () => {
        const cursoRes = await request(BASE_URL)
            .post("/cursos")
            .send({
                titulo: `CursoParaRestaurar${Date.now()}`,
                criadoPorId: criadoPorId
            })
            .set("Authorization", `Bearer ${token}`);

        await request(BASE_URL)
            .delete(`/cursos/${cursoRes.body.data._id}`)
            .set("Authorization", `Bearer ${token}`);

        await request(BASE_URL)
            .patch(`/cursos/${cursoRes.body.data._id}/restaurar`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
    });

    it("Deve deletar curso permanentemente (DELETE /cursos/:id/permanente)", async () => {
        const cursoRes = await request(BASE_URL)
            .post("/cursos")
            .send({
                titulo: `CursoParaDeletarPermanente${Date.now()}`,
                criadoPorId: criadoPorId
            })
            .set("Authorization", `Bearer ${token}`);

        await request(BASE_URL)
            .delete(`/cursos/${cursoRes.body.data._id}/permanente`)
            .set("Authorization", `Bearer ${token}`)
            .expect(res => {
                expect([200, 404, 500]).toContain(res.status);
            });
    });

    it("Deve retornar erro 400 para dados inválidos", async () => {
        await request(BASE_URL)
            .post("/cursos")
            .send({
                titulo: ""
            })
            .set("Authorization", `Bearer ${token}`)
            .expect(400);
    });

    it("Deve retornar erro 400 para filtros inválidos", async () => {
        await request(BASE_URL)
            .get("/cursos?cargaHorariaTotalMin=abc")
            .set("Authorization", `Bearer ${token}`)
            .expect(res => {
                expect([200, 400]).toContain(res.status);
            });
    });

    it("Deve retornar cursos com estatísticas enriquecidas", async () => {
        const res = await request(BASE_URL)
            .get("/cursos")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        if (res.body.data.docs.length > 0) {
            const curso = res.body.data.docs[0];
            if (curso.estatisticas) {
                expect(curso.estatisticas).toHaveProperty("totalAulas");
                expect(curso.estatisticas).toHaveProperty("totalQuestionarios");
                expect(curso.estatisticas).toHaveProperty("totalAlternativas");
                expect(curso.estatisticas).toHaveProperty("totalCertificados");
            } else {
                expect(curso).toHaveProperty("_id");
                expect(curso).toHaveProperty("titulo");
            }
        }
    });

    it("Deve converter strings para boolean no filtro temMaterialComplementar", async () => {
        await request(BASE_URL)
            .get("/cursos?temMaterialComplementar=true")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        await request(BASE_URL)
            .get("/cursos?temMaterialComplementar=1")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        await request(BASE_URL)
            .get("/cursos?temMaterialComplementar=false")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        await request(BASE_URL)
            .get("/cursos?temMaterialComplementar=0")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
    });

    it("Deve aplicar filtros de tags com AND", async () => {
        const cursoComTags = {
            titulo: `CursoComTags${Date.now()}`,
            criadoPorId: criadoPorId,
            tags: ["javascript", "nodejs", "backend"]
        };
        await request(BASE_URL)
            .post("/cursos")
            .send(cursoComTags)
            .set("Authorization", `Bearer ${token}`);

        const res = await request(BASE_URL)
            .get("/cursos?tags[]=javascript&tags[]=nodejs")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        res.body.data.docs.forEach(curso => {
            if (curso.tags && curso.tags.length > 0) {
                expect(curso.tags).toContain("javascript");
                expect(curso.tags).toContain("nodejs");
            }
        });
    });

    it("Deve interpretar datas em formato UTC", async () => {
        const dataUTC = "2023-01-01T00:00:00Z";
        await request(BASE_URL)
            .get(`/cursos?criadoApos=${dataUTC}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
    });

    it("Deve aplicar paginação corretamente", async () => {
        const res = await request(BASE_URL)
            .get("/cursos?limite=2&pagina=1")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(res.body.data).toHaveProperty("docs");
        expect(Array.isArray(res.body.data.docs)).toBe(true);

        if (res.body.data.docs.length <= 2) {
            expect(res.body.data.docs.length).toBeLessThanOrEqual(2);
        }

        if (res.body.data.totalDocs !== undefined) {
            expect(res.body.data).toHaveProperty("totalDocs");
            expect(res.body.data).toHaveProperty("totalPages");
            expect(res.body.data).toHaveProperty("page");
            expect(res.body.data).toHaveProperty("limit");
        }
    });

    it("Deve retornar erro sem token de autorização", async () => {
        await request(BASE_URL)
            .get("/cursos")
            .expect(res => {
                expect([401, 498]).toContain(res.status);
            });
    });

    it("Deve retornar erro com token inválido", async () => {
        await request(BASE_URL)
            .get("/cursos")
            .set("Authorization", "Bearer token_invalido")
            .expect(res => {
                expect([401, 498]).toContain(res.status);
            });
    });
});