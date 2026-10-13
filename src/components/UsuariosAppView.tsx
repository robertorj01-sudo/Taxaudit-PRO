import React, { useState } from 'react';
import { UsuarioApp, PerfilUsuarioApp } from '../types/fiscal';
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  Mail,
  Phone,
  Briefcase,
  Building,
  KeyRound,
  LogIn,
  SlidersHorizontal,
  X
} from 'lucide-react';

interface UsuariosAppViewProps {
  usuarios: UsuarioApp[];
  setUsuarios: React.Dispatch<React.SetStateAction<UsuarioApp[]>>;
  usuarioAtual: UsuarioApp;
  setUsuarioAtual: (usuario: UsuarioApp) => void;
  onSalvar?: (usuariosAtualizados: UsuarioApp[]) => void;
}

export const UsuariosAppView: React.FC<UsuariosAppViewProps> = ({
  usuarios,
  setUsuarios,
  usuarioAtual,
  setUsuarioAtual,
  onSalvar
}) => {
  const [busca, setBusca] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState<string>('TODOS');
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEmEdicao, setUsuarioEmEdicao] = useState<UsuarioApp | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Formulário de Cadastro/Edição
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState('');
  const [departamento, setDepartamento] = useState('Escrituração & Auditoria Fiscal');
  const [telefone, setTelefone] = useState('');
  const [perfil, setPerfil] = useState<PerfilUsuarioApp>('ANALISTA_FISCAL');
  const [ativo, setAtivo] = useState(true);

  const abrirNovoUsuarioModal = () => {
    setUsuarioEmEdicao(null);
    setNome('');
    setEmail('');
    setCargo('Analista Fiscal');
    setDepartamento('Escrituração & Tributos');
    setTelefone('');
    setPerfil('ANALISTA_FISCAL');
    setAtivo(true);
    setModalAberto(true);
  };

  const abrirEditarUsuarioModal = (u: UsuarioApp) => {
    setUsuarioEmEdicao(u);
    setNome(u.nome);
    setEmail(u.email);
    setCargo(u.cargo);
    setDepartamento(u.departamento);
    setTelefone(u.telefone || '');
    setPerfil(u.perfil);
    setAtivo(u.ativo);
    setModalAberto(true);
  };

  const handleSalvarUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) return;

    if (usuarioEmEdicao) {
      // Atualizar existente
      const atualizados = usuarios.map(u =>
        u.id === usuarioEmEdicao.id
          ? {
              ...u,
              nome,
              email,
              cargo,
              departamento,
              telefone,
              perfil,
              ativo
            }
          : u
      );
      setUsuarios(atualizados);
      if (usuarioAtual.id === usuarioEmEdicao.id) {
        setUsuarioAtual({
          ...usuarioAtual,
          nome,
          email,
          cargo,
          departamento,
          telefone,
          perfil,
          ativo
        });
      }
      if (onSalvar) onSalvar(atualizados);
      mostrarFeedback('Usuário atualizado com sucesso!');
    } else {
      // Criar novo usuário
      const novo: UsuarioApp = {
        id: `USR-${String(usuarios.length + 1).padStart(3, '0')}`,
        nome,
        email,
        cargo,
        departamento,
        telefone,
        perfil,
        ativo,
        dataCadastro: new Date().toISOString().slice(0, 10),
        ultimoAcesso: 'Nunca acessou'
      };
      const listaAtualizada = [...usuarios, novo];
      setUsuarios(listaAtualizada);
      if (onSalvar) onSalvar(listaAtualizada);
      mostrarFeedback('Novo usuário cadastrado com sucesso!');
    }

    setModalAberto(false);
  };

  const handleExcluirUsuario = (id: string) => {
    if (usuarios.length <= 1) {
      alert('Não é possível excluir o único usuário do sistema.');
      return;
    }
    if (usuarioAtual.id === id) {
      alert('Você não pode excluir o usuário que está atualmente em uso.');
      return;
    }
    if (confirm('Deseja realmente remover este usuário do sistema?')) {
      const filtrados = usuarios.filter(u => u.id !== id);
      setUsuarios(filtrados);
      if (onSalvar) onSalvar(filtrados);
      mostrarFeedback('Usuário removido.');
    }
  };

  const handleAlternarStatus = (id: string) => {
    const atualizados = usuarios.map(u => (u.id === id ? { ...u, ativo: !u.ativo } : u));
    setUsuarios(atualizados);
    if (onSalvar) onSalvar(atualizados);
    mostrarFeedback('Status do usuário atualizado.');
  };

  const handleTrocarUsuarioAtivo = (u: UsuarioApp) => {
    setUsuarioAtual(u);
    mostrarFeedback(`Sessão alternada para: ${u.nome}`);
  };

  const mostrarFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const usuariosFiltrados = usuarios.filter(u => {
    const atendeBusca =
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase()) ||
      u.cargo.toLowerCase().includes(busca.toLowerCase());
    const atendePerfil = filtroPerfil === 'TODOS' || u.perfil === filtroPerfil;
    return atendeBusca && atendePerfil;
  });

  const getPerfilBadge = (p: PerfilUsuarioApp) => {
    switch (p) {
      case 'ADMIN_MASTER':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
            Administrador Master
          </span>
        );
      case 'ANALISTA_FISCAL':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
            Analista Fiscal
          </span>
        );
      case 'AUDITOR_TRIBUTARIO':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Auditor Tributário
          </span>
        );
      case 'OPERADOR_FISCAL':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
            Operador Fiscal
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner de Cabeçalho */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 rounded-2xl text-white shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold uppercase tracking-wider border border-purple-500/30">
            <Users className="w-3.5 h-3.5" />
            Controle de Acessos & Equipe Fiscal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <span>Gestão de Usuários do APP</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Cadastre os membros da equipe contábil e fiscal da sua empresa. Defina permissões granulares entre Administradores, Analistas Fiscais, Auditores Tributários e Operadores para aprovação de notas e escrituração no SPED.
          </p>
        </div>

        <button
          onClick={abrirNovoUsuarioModal}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-md shrink-0 border border-emerald-400/40"
        >
          <UserPlus className="w-4 h-4 text-emerald-100" />
          <span>Cadastrar Novo Usuário</span>
        </button>
      </div>

      {/* Alerta de Feedback */}
      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total de Usuários</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{usuarios.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Membros Cadastrados</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/20 shadow-2xs">
          <div className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">Administradores</div>
          <div className="text-2xl font-black text-purple-900 mt-1">
            {usuarios.filter(u => u.perfil === 'ADMIN_MASTER').length}
          </div>
          <div className="text-[10px] text-purple-700 mt-0.5">Acesso Total & Certificado</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-2xs">
          <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Analistas & Auditores</div>
          <div className="text-2xl font-black text-blue-900 mt-1">
            {usuarios.filter(u => u.perfil === 'ANALISTA_FISCAL' || u.perfil === 'AUDITOR_TRIBUTARIO').length}
          </div>
          <div className="text-[10px] text-blue-700 mt-0.5">Auditoria & Aprovação SPED</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Usuários Ativos</div>
          <div className="text-2xl font-black text-emerald-900 mt-1">
            {usuarios.filter(u => u.ativo).length}
          </div>
          <div className="text-[10px] text-emerald-700 mt-0.5">Habilitados para Operar</div>
        </div>
      </div>

      {/* Caixa do Usuário Conectado Atualmente */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
            {usuarioAtual.nome.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold uppercase">Operando no momento como:</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <h3 className="font-bold text-slate-900 text-base leading-tight mt-0.5">
              {usuarioAtual.nome}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>{usuarioAtual.cargo}</span>
              <span>&bull;</span>
              <span className="font-mono text-[11px]">{usuarioAtual.email}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getPerfilBadge(usuarioAtual.perfil)}
          <span className="text-xs text-slate-500 font-medium px-2.5 py-1 rounded-lg bg-slate-100">
            Sessão Ativa
          </span>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por nome, cargo ou e-mail..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500">Perfil:</span>
          <select
            value={filtroPerfil}
            onChange={e => setFiltroPerfil(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 font-semibold text-slate-700 focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
          >
            <option value="TODOS">Todos os Perfis</option>
            <option value="ADMIN_MASTER">Administradores Master</option>
            <option value="ANALISTA_FISCAL">Analistas Fiscais</option>
            <option value="AUDITOR_TRIBUTARIO">Auditores Tributários</option>
            <option value="OPERADOR_FISCAL">Operadores Fiscais</option>
          </select>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Usuário / Nome</th>
                <th className="px-4 py-3.5">Cargo & Departamento</th>
                <th className="px-4 py-3.5">Perfil de Acesso</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Último Acesso</th>
                <th className="px-5 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuariosFiltrados.map(u => {
                const isCurrentUser = u.id === usuarioAtual.id;
                return (
                  <tr
                    key={u.id}
                    className={`hover:bg-slate-50/80 transition ${
                      isCurrentUser ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {u.nome.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{u.nome}</span>
                            {isCurrentUser && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-600 text-white">
                                VOCÊ
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">{u.cargo}</div>
                      <div className="text-[10px] text-slate-400">{u.departamento}</div>
                    </td>

                    <td className="px-4 py-3.5">{getPerfilBadge(u.perfil)}</td>

                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleAlternarStatus(u.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition ${
                          u.ativo
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        title="Clique para ativar/desativar este usuário"
                      >
                        {u.ativo ? (
                          <>
                            <UserCheck className="w-3 h-3" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3" />
                            Inativo
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                      {u.ultimoAcesso || 'Recente'}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isCurrentUser && (
                          <button
                            onClick={() => handleTrocarUsuarioAtivo(u)}
                            className="px-2.5 py-1 text-[11px] font-bold text-purple-700 hover:bg-purple-50 rounded-lg border border-purple-200 flex items-center gap-1 transition"
                            title="Operar o sistema como este usuário (Simulação de Sessão)"
                          >
                            <LogIn className="w-3 h-3" />
                            <span>Alternar</span>
                          </button>
                        )}

                        <button
                          onClick={() => abrirEditarUsuarioModal(u)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                          title="Editar Dados do Usuário"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleExcluirUsuario(u.id)}
                          disabled={isCurrentUser}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-30 disabled:hover:text-slate-400"
                          title="Excluir Usuário"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro/Edição de Usuário */}
      {modalAberto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {usuarioEmEdicao ? 'Editar Usuário' : 'Novo Usuário do Sistema'}
                  </h3>
                  <p className="text-xs text-slate-500">Defina os dados e o nível de acesso do colaborador</p>
                </div>
              </div>
              <button
                onClick={() => setModalAberto(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarUsuario} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Ex: Carlos Silva"
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">E-mail Corporativo *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="carlos.silva@empresa.com.br"
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Cargo / Função *</label>
                  <input
                    type="text"
                    required
                    value={cargo}
                    onChange={e => setCargo(e.target.value)}
                    placeholder="Analista Fiscal Sênior"
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Departamento</label>
                  <input
                    type="text"
                    value={departamento}
                    onChange={e => setDepartamento(e.target.value)}
                    placeholder="Controladoria"
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Telefone / Ramal</label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={e => setTelefone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Perfil de Acesso *</label>
                  <select
                    value={perfil}
                    onChange={e => setPerfil(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
                  >
                    <option value="ADMIN_MASTER">Administrador Master</option>
                    <option value="ANALISTA_FISCAL">Analista Fiscal Sênior</option>
                    <option value="AUDITOR_TRIBUTARIO">Auditor Tributário</option>
                    <option value="OPERADOR_FISCAL">Operador Fiscal</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Status da Conta</div>
                  <div className="text-[11px] text-slate-500">Permitir que este usuário acesse o aplicativo</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ativo}
                    onChange={e => setAtivo(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md transition"
                >
                  {usuarioEmEdicao ? 'Salvar Alterações' : 'Cadastrar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
