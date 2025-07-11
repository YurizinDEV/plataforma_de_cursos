import {
    execSync
} from 'child_process';

const port = process.env.PORT || 5010;

try {
    const result = execSync(`lsof -i :${port} -t`, {
        encoding: 'utf-8'
    });

    if (result.trim()) {
        const pids = result.trim().split('\n');

        console.log(`\x1b[33mEncontrando ${pids.length} processo(s) na porta ${port}...\x1b[0m`);

        pids.forEach(pid => {
            pid = pid.trim();
            if (pid) {
                try {
                    console.log(`\x1b[33mMatando processo ${pid} na porta ${port}...\x1b[0m`);
                    execSync(`kill -9 ${pid}`);
                    console.log(`\x1b[32mProcesso ${pid} encerrado com sucesso!\x1b[0m`);
                } catch (err) {
                    console.error(`\x1b[31mErro ao matar processo ${pid}: ${err.message}\x1b[0m`);
                }
            }
        });

        console.log('\x1b[36mAguardando encerramento dos processos...\x1b[0m');
        execSync('sleep 1');
    } else {
        console.log(`\x1b[32mNenhum processo encontrado na porta ${port}\x1b[0m`);
    }
} catch (err) {
    if (!err.message.includes('Command failed')) {
        console.error(`\x1b[31mErro ao verificar processos: ${err.message}\x1b[0m`);
    } else {
        console.log(`\x1b[32mNenhum processo encontrado na porta ${port}\x1b[0m`);
    }
}

console.log(`\x1b[36mIniciando servidor na porta ${port}...\x1b[0m`);