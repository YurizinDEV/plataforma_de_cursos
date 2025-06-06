import request from 'supertest';
import {describe, expect, it, test} from '@jest/globals';

it("Deve retornar usuário existente", async () => {
    const resposta = await 
    request('http://localhost:5011')
    .get('/usuarios')
    console.log(resposta);
    expect(resposta.status).toBe(200);
})