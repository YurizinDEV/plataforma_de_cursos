// src/tests/routes/aulaRoutes.test.js
import request from "supertest";
import { describe, it, expect, beforeAll } from "@jest/globals";
import faker from "faker-br";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5010;
const BASE_URL = `http://localhost:${PORT}`;

describe("Aulas", () => {
  let cursoId;
  let usuarioId;
  let aulaId;

  beforeAll(async () => {
    // Cria um usuário admin para autenticar
    const senha = "Admin@1234";
    await request(BASE_URL).post("/signup").send({
      nome: "Admin Aula",
      email: "adminaula@gmail.com",
      senha,
      ativo: true,
    });

    const loginRes = await request(BASE_URL).post("/login").send({
      email: "adminaula@gmail.com",
      senha,
    });
    const token = loginRes.body?.data?.user?.accesstoken;
    expect(token).toBeTruthy();
    usuarioId = loginRes.body?.data?.user?._id;

    // Cria um curso
    const cursoRes = await request(BASE_URL)
  .post("/cursos")
  .send({
    titulo: "Curso de Teste Aula " + Date.now(),
    descricao: "Curso para testes da rota de aula",
    criadoPorId: usuarioId,
  })
  .set("Authorization", `Bearer ${token}`);

cursoId = cursoRes.body?.data?._id;
  });

  it("Deve criar uma nova aula (POST /aulas)", async () => {
    const aula = {
      titulo: "Aula Teste",
      descricao: "Descrição da aula",
      conteudoURL: "https://example.com/aula1",
      cargaHoraria: 2,
      cursoId,
      criadoPorId: usuarioId,
    };

    const res = await request(BASE_URL)
      .post("/aulas")
      .send(aula)
      .expect(201);

    aulaId = res.body?.data?._id;
    expect(res.body.data.titulo).toBe(aula.titulo);
    expect(res.body.data.cursoId).toBe(cursoId);
  });

  it("Deve listar todas as aulas (GET /aulas)", async () => {
    const res = await request(BASE_URL)
      .get("/aulas")
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("Deve retornar uma aula por ID (GET /aulas/:id)", async () => {
    const res = await request(BASE_URL)
      .get(`/aulas/${aulaId}`)
      .expect(200);
    expect(res.body.data._id).toBe(aulaId);
  });

  it("Deve atualizar uma aula (PUT /aulas/:id)", async () => {
    const res = await request(BASE_URL)
      .put(`/aulas/${aulaId}`)
      .send({
        titulo: "Aula Atualizada",
        cargaHoraria: 3,
      })
      .expect(200);
    expect(res.body.data.titulo).toBe("Aula Atualizada");
  });

  it("Deve deletar uma aula (DELETE /aulas/:id)", async () => {
    const res = await request(BASE_URL)
      .delete(`/aulas/${aulaId}`)
      .expect(200);
    expect(res.body.data.mensagem).toBe("Aula removida permanentemente");
  });

  it("Deve retornar 404 ao acessar aula inexistente", async () => {
    await request(BASE_URL)
      .get(`/aulas/000000000000000000000000`)
      .expect(404);
  });

  it("Deve retornar 400 ao tentar criar aula com dados inválidos", async () => {
    await request(BASE_URL)
      .post("/aulas")
      .send({
        titulo: "A",
        conteudoURL: "invalid-url",
        cargaHoraria: -1,
        cursoId: "123",
        criadoPorId: "abc",
      })
      .expect(400);
  });
});
