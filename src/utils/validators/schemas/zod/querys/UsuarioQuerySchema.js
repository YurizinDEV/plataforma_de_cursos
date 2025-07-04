import {
    z
} from "zod";
import mongoose from 'mongoose';

export const UsuarioIdSchema = z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "ID inválido",
});

export const UsuarioQuerySchema = z.object({
    nome: z
        .string()
        .optional()
        .refine((val) => !val || val.trim().length > 0, {
            message: "Nome não pode ser vazio",
        })
        .transform((val) => val?.trim()),
    email: z
        .union([z.string().email("Formato de email inválido"), z.undefined()])
        .optional(),
    ativo: z
        .string()
        .optional()
        .refine((value) => !value || value === "true" || value === "false", {
            message: "Ativo deve ser 'true' ou 'false'",
        }),
    ehAdmin: z
        .string()
        .optional()
        .refine((value) => !value || value === "true" || value === "false", {
            message: "ehAdmin deve ser 'true' ou 'false'",
        }),
    dataInicio: z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Date.parse(val)), {
            message: "dataInicio deve ser uma data válida (YYYY-MM-DD)",
        }),
    dataFim: z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Date.parse(val)), {
            message: "dataFim deve ser uma data válida (YYYY-MM-DD)",
        }),
    ordenarPor: z
        .string()
        .optional()
        .refine((value) => !value || ["nome", "email", "createdAt", "updatedAt"].includes(value), {
            message: "ordenarPor deve ser um dos valores: nome, email, createdAt, updatedAt",
        }),
    direcao: z
        .string()
        .optional()
        .refine((value) => !value || ["asc", "desc"].includes(value.toLowerCase()), {
            message: "direcao deve ser 'asc' ou 'desc'",
        }),
    grupo: z.string().optional().transform((val) => val?.trim()),
    unidade: z.string().optional().transform((val) => val?.trim()),
    page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1))
        .refine((val) => Number.isInteger(val) && val > 0, {
            message: "Page deve ser um número inteiro maior que 0",
        }),
    limite: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10))
        .refine((val) => Number.isInteger(val) && val > 0 && val <= 100, {
            message: "Limite deve ser um número inteiro entre 1 e 100",
        }),
});