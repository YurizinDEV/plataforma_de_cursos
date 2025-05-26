import { z } from 'zod';

export const CertificadoSchema = z.object({
  usuarioId: z.string().regex(/^[0-9a-fA-F]{24}$/, "ID de usuário inválido"),
  cursoId: z.string().regex(/^[0-9a-fA-F]{24}$/, "ID de curso inválido"),
  dataEmissao: z.date().optional()
});