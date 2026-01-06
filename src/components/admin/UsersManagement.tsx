import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2, Plus, Upload, X } from 'lucide-react';

interface User {
  id: string;
  name: string;
  age: number;
  email: string;
  whatsapp: string;
  profession: string;
  username: string;
  password: string;
  profileImage?: string;
}

export const UsersManagement = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Maria Silva',
      age: 32,
      email: 'maria@example.com',
      whatsapp: '(11) 98765-4321',
      profession: 'Advogada',
      username: 'maria.silva',
      password: '123456',
      profileImage: undefined,
    },
    {
      id: '2',
      name: 'João Santos',
      age: 35,
      email: 'joao@example.com',
      whatsapp: '(11) 99876-5432',
      profession: 'Engenheiro',
      username: 'joao.santos',
      password: '123456',
      profileImage: undefined,
    },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    whatsapp: '',
    profession: '',
    username: '',
    password: '',
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.age || !formData.email || !formData.whatsapp || !formData.profession || !formData.username || !formData.password) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    if (editingId) {
      setUsers(users.map(user =>
        user.id === editingId
          ? {
              ...user,
              name: formData.name,
              age: parseInt(formData.age),
              email: formData.email,
              whatsapp: formData.whatsapp,
              profession: formData.profession,
              username: formData.username,
              password: formData.password,
            }
          : user
      ));
      setEditingId(null);
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name,
        age: parseInt(formData.age),
        email: formData.email,
        whatsapp: formData.whatsapp,
        profession: formData.profession,
        username: formData.username,
        password: formData.password,
      };
      setUsers([...users, newUser]);
    }

    setFormData({
      name: '',
      age: '',
      email: '',
      whatsapp: '',
      profession: '',
      username: '',
      password: '',
    });
    setShowForm(false);
  };

  const handleEdit = (user: User) => {
    setFormData({
      name: user.name,
      age: user.age.toString(),
      email: user.email,
      whatsapp: user.whatsapp,
      profession: user.profession,
      username: user.username,
      password: user.password,
    });
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja deletar este usuário?')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      age: '',
      email: '',
      whatsapp: '',
      profession: '',
      username: '',
      password: '',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Gerenciar Usuários</h1>
          <p className="text-muted-foreground mt-2">Cadastre e gerencie os participantes do evento</p>
        </div>
        {!showForm && (
          <Button
            variant="gold"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Usuário
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-8">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
            {editingId ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nome completo"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Idade
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="Idade"
                  min="18"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nome do Usuário
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="nome.usuario"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="(11) 98765-4321"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
              </div>

              {/* Profession */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Profissão
                </label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleInputChange}
                  placeholder="Sua profissão"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button variant="gold" type="submit">
                {editingId ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gold">Nome</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gold">Usuário</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gold">Idade</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gold">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gold">WhatsApp</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gold">Profissão</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{user.username}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{user.age}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{user.whatsapp}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{user.profession}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && !showForm && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum usuário cadastrado ainda</p>
          </div>
        )}
      </div>
    </div>
  );
};
