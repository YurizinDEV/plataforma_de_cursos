// Script de inicialização do MongoDB Replica Set
try {
    var status = rs.status();
    print("Replica set já está configurado");
} catch (error) {
    print("Configurando replica set...");
    
    var config = {
        _id: "rs0",
        members: [
            {
                _id: 0,
                host: "mongo:27017",
                priority: 1
            }
        ]
    };
    
    var result = rs.initiate(config);
    
    if (result.ok === 1) {
        print("Replica set configurado com sucesso!");
        
        var timeout = 30000; 
        var start = new Date().getTime();
        
        while (true) {
            try {
                var status = rs.status();
                if (status.members && status.members[0].state === 1) {
                    print("Replica set está pronto para uso!");
                    break;
                }
            } catch (e) {
            }
            
            if (new Date().getTime() - start > timeout) {
                print("Timeout aguardando replica set ficar pronto");
                break;
            }
            
            sleep(1000);
        }
    } else {
        print("Erro ao configurar replica set:", result);
    }
}
