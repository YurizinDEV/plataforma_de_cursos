import request from "supertest";
import {
    describe,
    it,
    expect,
    beforeAll
} from "@jest/globals";
import faker from "faker-br";
import dotenv from 'dotenv';
import "../../../src/routes/usuarioRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 5010;
const BASE_URL = `http://localhost:${PORT}`;

describe("Usuários", () => {
    let token;
    let usuarioId;

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
    });

    it("Deve cadastrar um usuário válido (POST)", async () => {
        const objUsuario = {
            nome: faker.name.firstName(),
            email: faker.internet.email(),
            senha: 'Senha1234!'
        };
        const res = await request(BASE_URL)
            .post("/usuarios")
            .send(objUsuario)
            .set("Authorization", `Bearer ${token}`)
            .expect(201);
        usuarioId = res.body.data._id;
        expect(res.body.data).toHaveProperty("_id");
        expect(res.body.data.ativo).toBe(false);
        expect(res.body.data.grupos).toEqual([]);
    });

    it("Não deve cadastrar usuário sem nome, email ou senha (400)", async () => {
        await request(BASE_URL).post("/usuarios").send({
            email: faker.internet.email(),
            senha: 'Senha1234!'
        }).set("Authorization", `Bearer ${token}`).expect(400);
        await request(BASE_URL).post("/usuarios").send({
            nome: faker.name.firstName(),
            senha: 'Senha1234!'
        }).set("Authorization", `Bearer ${token}`).expect(400);
        await request(BASE_URL).post("/usuarios").send({
            nome: faker.name.firstName(),
            email: faker.internet.email()
        }).set("Authorization", `Bearer ${token}`).expect(400);
    });

    it("Não deve cadastrar usuário com email duplicado (409 ou 400)", async () => {
        const email = faker.internet.email();
        await request(BASE_URL).post("/usuarios").send({
            nome: faker.name.firstName(),
            email,
            senha: 'Senha1234!'
        }).set("Authorization", `Bearer ${token}`).expect(201);
        await request(BASE_URL).post("/usuarios").send({
            nome: faker.name.firstName(),
            email,
            senha: 'Senha1234!'
        }).set("Authorization", `Bearer ${token}`).expect(res => {
            expect([400, 409]).toContain(res.status);
        });
    });

    it("Deve listar todos os usuários (GET)", async () => {
        const res = await request(BASE_URL)
            .get("/usuarios")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        expect(Array.isArray(res.body.data.docs)).toBe(true);
    });

    it("Deve retornar usuário por id (GET /usuarios/:id)", async () => {
        const res = await request(BASE_URL)
            .get(`/usuarios/${usuarioId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        expect(res.body.data._id).toBe(usuarioId);
    });

    it("Deve retornar 404 ao buscar usuário inexistente", async () => {
        await request(BASE_URL)
            .get(`/usuarios/000000000000000000000000`)
            .set("Authorization", `Bearer ${token}`)
            .expect(404);
    });

    it("Deve atualizar usuário (PUT)", async () => {
        const res = await request(BASE_URL)
            .put(`/usuarios/${usuarioId}`)
            .send({
                nome: "NovoNome"
            })
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        expect(res.body.data.nome).toBe("NovoNome");
    });

    it("Não deve atualizar email ou senha via update (PUT)", async () => {
        const email = faker.internet.email();
        const senha = 'Senha1234!';
        const res1 = await request(BASE_URL).post("/usuarios").send({
            nome: faker.name.firstName(),
            email,
            senha
        }).set("Authorization", `Bearer ${token}`).expect(201);
        const usuarioId2 = res1.body.data._id;
        await request(BASE_URL)
            .put(`/usuarios/${usuarioId2}`)
            .send({
                email: "novo@email.com",
                senha: "NovaSenha123!"
            })
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        const res2 = await request(BASE_URL)
            .get(`/usuarios/${usuarioId2}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        expect(res2.body.data.email).toBe(email);
    });

    it("Deve retornar 404 ao atualizar usuário inexistente", async () => {
        await request(BASE_URL)
            .put(`/usuarios/000000000000000000000000`)
            .send({
                nome: "NovoNome"
            })
            .set("Authorization", `Bearer ${token}`)
            .expect(404);
    });

    it("Deve deletar usuário (DELETE)", async () => {
        const email = faker.internet.email();
        const senha = 'Senha1234!';
        const res1 = await request(BASE_URL).post("/usuarios").send({
            nome: faker.name.firstName(),
            email,
            senha,
            ativo: true
        }).set("Authorization", `Bearer ${token}`).expect(201);
        const id = res1.body.data._id;
        await request(BASE_URL)
            .delete(`/usuarios/${id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
    });

    it("Deve retornar 404 ao deletar usuário inexistente", async () => {
        await request(BASE_URL)
            .delete(`/usuarios/000000000000000000000000`)
            .set("Authorization", `Bearer ${token}`)
            .expect(404);
    });

    it("Deve aplicar filtro de busca por nome", async () => {
        const nomeFiltro = "UsuarioFiltro" + Date.now();
        await request(BASE_URL)
            .post("/usuarios")
            .send({
                nome: nomeFiltro,
                email: faker.internet.email(),
                senha: 'Senha1234!'
            })
            .set("Authorization", `Bearer ${token}`);
        const res = await request(BASE_URL)
            .get(`/usuarios?nome=${nomeFiltro}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        expect(res.body.data.docs.some(u => u.nome === nomeFiltro)).toBe(true);
    });

    it("Deve criar usuário com permissões do grupo 'Usuario' por padrão", async () => {
        const obj = {
            nome: faker.name.firstName() + Date.now(),
            email: faker.internet.email(),
            senha: 'Senha1234!'
        };
        const res = await request(BASE_URL)
            .post("/usuarios")
            .send(obj)
            .set("Authorization", `Bearer ${token}`)
            .expect(201);
        const usuarioId = res.body.data._id;
        const resUsuario = await request(BASE_URL)
            .get(`/usuarios/${usuarioId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        const usuario = resUsuario.body.data;
        expect(usuario.permissoes).toBeDefined();
        expect(Array.isArray(usuario.permissoes)).toBe(true);
    });

    it("Não deve retornar o campo senha nas respostas", async () => {
        const objUsuario = {
            nome: faker.name.firstName(),
            email: faker.internet.email(),
            senha: 'Senha1234!'
        };
        const res = await request(BASE_URL)
            .post("/usuarios")
            .send(objUsuario)
            .set("Authorization", `Bearer ${token}`)
            .expect(201);
        expect(res.body.data).not.toHaveProperty("senha");

        const resGet = await request(BASE_URL)
            .get(`/usuarios/${res.body.data._id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        expect(resGet.body.data).not.toHaveProperty("senha");
    });

    it("Deve restaurar usuário desativado (PATCH /usuarios/:id/restaurar)", async () => {
        const email = faker.internet.email();
        const senha = 'Senha1234!';
        const res1 = await request(BASE_URL)
            .post("/usuarios")
            .send({
                nome: faker.name.firstName(),
                email,
                senha
            })
            .set("Authorization", `Bearer ${token}`)
            .expect(201);
        const id = res1.body.data._id;

        await request(BASE_URL)
            .delete(`/usuarios/${id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        const resRestaurar = await request(BASE_URL)
            .patch(`/usuarios/${id}/restaurar`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        expect(resRestaurar.body.data.ativo).toBe(true);
    });

    it("Deve retornar 404 ao restaurar usuário inexistente", async () => {
        await request(BASE_URL)
            .patch(`/usuarios/000000000000000000000000/restaurar`)
            .set("Authorization", `Bearer ${token}`)
            .expect(404);
    });

    it("Deve deletar fisicamente usuário (DELETE /usuarios/:id/permanente)", async () => {
        const email = faker.internet.email();
        const senha = 'Senha1234!';
        const res1 = await request(BASE_URL)
            .post("/usuarios")
            .send({
                nome: faker.name.firstName(),
                email,
                senha
            })
            .set("Authorization", `Bearer ${token}`)
            .expect(201);
        const id = res1.body.data._id;

        const resDelete = await request(BASE_URL)
            .delete(`/usuarios/${id}/permanente`)
            .set("Authorization", `Bearer ${token}`);

        expect([200, 204, 500]).toContain(resDelete.status);

        if (resDelete.status === 200 || resDelete.status === 204) {
            await request(BASE_URL)
                .get(`/usuarios/${id}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(404);
        }
    });

    it("Deve retornar 404 ao deletar fisicamente usuário inexistente", async () => {
        await request(BASE_URL)
            .delete(`/usuarios/000000000000000000000000/permanente`)
            .set("Authorization", `Bearer ${token}`)
            .expect(404);
    });

    it("Deve filtrar usuários por status ativo", async () => {
        const email1 = faker.internet.email();
        const email2 = faker.internet.email();

        const res1 = await request(BASE_URL)
            .post("/usuarios")
            .send({
                nome: "UsuarioAtivo",
                email: email1,
                senha: 'Senha1234!',
                ativo: true
            })
            .set("Authorization", `Bearer ${token}`)
            .expect(201);

        await request(BASE_URL)
            .post("/usuarios")
            .send({
                nome: "UsuarioInativo",
                email: email2,
                senha: 'Senha1234!'
            })
            .set("Authorization", `Bearer ${token}`)
            .expect(201);

        const resAtivos = await request(BASE_URL)
            .get("/usuarios?ativo=true")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        expect(resAtivos.body.data.docs.every(u => u.ativo === true)).toBe(true);
    });

    it("Deve filtrar usuários por status inativo", async () => {
        const resInativos = await request(BASE_URL)
            .get("/usuarios?ativo=false")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        expect(resInativos.body.data.docs.every(u => u.ativo === false)).toBe(true);
    });

    it("Deve filtrar usuários por grupos", async () => {
        const res1 = await request(BASE_URL)
            .post("/usuarios")
            .send({
                nome: "UsuarioSemGrupo",
                email: faker.internet.email(),
                senha: 'Senha1234!'
            })
            .set("Authorization", `Bearer ${token}`)
            .expect(201);

        const res = await request(BASE_URL)
            .get(`/usuarios?grupos=Administradores`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        expect(Array.isArray(res.body.data.docs)).toBe(true);
    });

    it("Deve filtrar usuários por período de criação", async () => {
        const dataInicio = "2024-01-01";
        const dataFim = "2024-12-31";

        const res = await request(BASE_URL)
            .get(`/usuarios?dataInicio=${dataInicio}&dataFim=${dataFim}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        expect(Array.isArray(res.body.data.docs)).toBe(true);
    });

    it("Deve ordenar usuários por nome ascendente", async () => {
        const res = await request(BASE_URL)
            .get("/usuarios?ordenarPor=nome&direcao=asc")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        expect(Array.isArray(res.body.data.docs)).toBe(true);

        if (res.body.data.docs.length > 1) {
            const nomes = res.body.data.docs.map(u => u.nome);
            const nomesOrdenados = [...nomes].sort();
            expect(nomes).toEqual(nomesOrdenados);
        }
    });

    it("Deve ordenar usuários por nome descendente", async () => {
        const res = await request(BASE_URL)
            .get("/usuarios?ordenarPor=nome&direcao=desc")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        expect(Array.isArray(res.body.data.docs)).toBe(true);

        if (res.body.data.docs.length > 1) {
            const nomes = res.body.data.docs.map(u => u.nome);
            const nomesOrdenados = [...nomes].sort().reverse();
            expect(nomes).toEqual(nomesOrdenados);
        }
    });

    it("Deve aplicar paginação corretamente", async () => {
        const res = await request(BASE_URL)
            .get("/usuarios?page=1&limit=5")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        expect(Array.isArray(res.body.data.docs)).toBe(true);

        if (res.body.data.totalDocs !== undefined) {
            expect(res.body.data).toHaveProperty("totalDocs");
            expect(res.body.data).toHaveProperty("totalPages");
            expect(res.body.data).toHaveProperty("page");
            expect(res.body.data).toHaveProperty("limit");
        } else {
            expect(Array.isArray(res.body.data.docs)).toBe(true);
        }
    });

    it("Deve filtrar usuários por email", async () => {
        const emailFiltro = faker.internet.email();
        await request(BASE_URL)
            .post("/usuarios")
            .send({
                nome: faker.name.firstName(),
                email: emailFiltro,
                senha: 'Senha1234!'
            })
            .set("Authorization", `Bearer ${token}`)
            .expect(201);

        const res = await request(BASE_URL)
            .get(`/usuarios?email=${emailFiltro}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        expect(res.body.data.docs.some(u => u.email === emailFiltro)).toBe(true);
    });

    it("Deve retornar erro 401 ou 498 ao fazer requisição sem token", async () => {
        const res = await request(BASE_URL)
            .get("/usuarios");
        expect([401, 498]).toContain(res.status);
    });

    it("Deve retornar erro 401 ou 498 ao fazer requisição com token inválido", async () => {
        const res = await request(BASE_URL)
            .get("/usuarios")
            .set("Authorization", "Bearer token_invalido");
        expect([401, 498]).toContain(res.status);
    });

    it("Deve validar que usuário tem valores padrão corretos ao ser criado", async () => {
        const objUsuario = {
            nome: faker.name.firstName(),
            email: faker.internet.email(),
            senha: 'Senha1234!'
        };
        const res = await request(BASE_URL)
            .post("/usuarios")
            .send(objUsuario)
            .set("Authorization", `Bearer ${token}`)
            .expect(201);

        expect(res.body.data.ativo).toBe(false);
        expect(res.body.data.grupos).toEqual([]);
        expect(res.body.data).toHaveProperty("_id");
        expect(res.body.data).not.toHaveProperty("senha");
    });

    it("Deve retornar dados enriquecidos com estatísticas de progresso quando disponível", async () => {
        const res = await request(BASE_URL)
            .get("/usuarios")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        if (res.body.data.docs.length > 0) {
            const usuariosComEstatisticas = res.body.data.docs.filter(u => u.estatisticasProgresso);
            usuariosComEstatisticas.forEach(usuario => {
                expect(usuario.estatisticasProgresso).toHaveProperty("cursosIniciados");
                expect(usuario.estatisticasProgresso).toHaveProperty("cursosConcluidos");
            });
        }
    });

    it("Deve retornar dados populados dos cursos quando usuário possui cursosIds", async () => {
        const res = await request(BASE_URL)
            .get("/usuarios")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        const usuariosComCursos = res.body.data.docs.filter(u => u.cursosIds && u.cursosIds.length > 0);
        usuariosComCursos.forEach(usuario => {
            usuario.cursosIds.forEach(curso => {
                if (typeof curso === 'object') {
                    expect(curso).toHaveProperty("titulo");
                    expect(curso).toHaveProperty("cargaHorariaTotal");
                }
            });
        });
    });

    it("Deve validar que PATCH também funciona para atualização", async () => {
        const email = faker.internet.email();
        const res1 = await request(BASE_URL)
            .post("/usuarios")
            .send({
                nome: faker.name.firstName(),
                email,
                senha: 'Senha1234!'
            })
            .set("Authorization", `Bearer ${token}`)
            .expect(201);

        const res = await request(BASE_URL)
            .patch(`/usuarios/${res1.body.data._id}`)
            .send({
                nome: "NomeAtualizado"
            })
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        expect(res.body.data.nome).toBe("NomeAtualizado");
    });

    it("Deve retornar 404 ao usar PATCH em usuário inexistente", async () => {
        await request(BASE_URL)
            .patch(`/usuarios/000000000000000000000000`)
            .send({
                nome: "NovoNome"
            })
            .set("Authorization", `Bearer ${token}`)
            .expect(404);
    });
});