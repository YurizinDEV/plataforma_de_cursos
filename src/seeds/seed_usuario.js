import dontenv from 'dotenv';
import faker from 'faker';
import mongoose from 'mongoose';
import DbConnect from '../config/dbConnect';

import Usuario from '../models/Usuario';

import getGlobalFakeMapping from './globalFakeMapping';

const globalFakeMapping = await getGlobalFakeMapping();

await DbConnect.conectar();


const senhaPura = 123456;;

export function gerarSenha (){
return bcrypt.hashSync(senhaPura, 12);
}