// Utilitário JavaScript para verificar e aplicar sistema de usuários via frontend
import { supabase } from '../services/supabase.js';

const verificarSistemaUsuarios = async () => {
    try {
        console.log('� Verificando sistema de usuários...');

        // Verificar se as tabelas existem
        const { data: usuarios, error: errorUsuarios } = await supabase
            .from('usuarios_sistema')
            .select('count')
            .limit(1);

        const { data: lojas, error: errorLojas } = await supabase
            .from('lojas')
            .select('count')
            .limit(1);

        if (errorUsuarios || errorLojas) {
            console.log('❌ Tabelas do sistema de usuários não encontradas');
            console.log('📋 Execute o script SQL: sql/15_aplicar_sistema_usuarios.sql');
            return false;
        }

        console.log('✅ Sistema de usuários verificado!');
        return true;

    } catch (error) {
        console.error('❌ Erro ao verificar sistema de usuários:', error);
        return false;
    }
};

const criarUsuarioTeste = async (email, senha, nome, role = 'cliente', lojaId = null) => {
    try {
        console.log(`🔧 Criando usuário teste: ${email} (${role})`);

        if (role === 'cliente') {
            // Criar como cliente na tabela clientes_fast
            const { data, error } = await supabase
                .from('clientes_fast')
                .insert({
                    email,
                    senha,
                    nome,
                    cpf_cnpj: `000.000.000-${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`,
                    tipo: 'CPF',
                    role: 'cliente'
                });

            if (error) throw error;
        } else {
            // Criar como admin/gerente na tabela usuarios_sistema
            const { data, error } = await supabase
                .from('usuarios_sistema')
                .insert({
                    email,
                    senha,
                    nome,
                    role,
                    loja_id: lojaId
                });

            if (error) throw error;
        }

        console.log(`✅ Usuário ${email} criado com sucesso!`);
        return true;

    } catch (error) {
        console.error(`❌ Erro ao criar usuário ${email}:`, error);
        return false;
    }
};

const listarUsuarios = async () => {
    try {
        console.log('📋 Listando usuários do sistema...');

        // Buscar usuários administrativos
        const { data: admins, error: errorAdmins } = await supabase
            .from('usuarios_sistema')
            .select(`
        *,
        lojas (nome, cidade)
      `)
            .order('created_at', { ascending: false });

        // Buscar clientes com email
        const { data: clientes, error: errorClientes } = await supabase
            .from('clientes_fast')
            .select('id, nome, email, role, created_at')
            .not('email', 'is', null)
            .order('created_at', { ascending: false });

        if (!errorAdmins && admins) {
            console.log('👥 Usuários Administrativos:');
            admins.forEach(user => {
                const loja = user.lojas ? ` (${user.lojas.nome})` : '';
                console.log(`  • ${user.nome} - ${user.email} - ${user.role}${loja}`);
            });
        }

        if (!errorClientes && clientes) {
            console.log('👤 Clientes com Email:');
            clientes.slice(0, 5).forEach(cliente => {
                console.log(`  • ${cliente.nome} - ${cliente.email} - ${cliente.role || 'cliente'}`);
            });
            if (clientes.length > 5) {
                console.log(`  ... e mais ${clientes.length - 5} clientes`);
            }
        }

        return { admins, clientes };

    } catch (error) {
        console.error('❌ Erro ao listar usuários:', error);
        return null;
    }
};

// Disponibilizar funções globalmente para uso no console
if (typeof window !== 'undefined') {
    window.verificarSistemaUsuarios = verificarSistemaUsuarios;
    window.criarUsuarioTeste = criarUsuarioTeste;
    window.listarUsuarios = listarUsuarios;
}

export { verificarSistemaUsuarios, criarUsuarioTeste, listarUsuarios };
