import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { useUsers, type User } from '@/context/UsersContext';

export const UsersManagement = () => {
  const { users, addUser, updateUser, deleteUser } = useUsers();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    whatsapp: '',
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

    if (!formData.name || !formData.username || !formData.email || !formData.whatsapp) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    if (editingId) {
      const updatedUser: User = {
        id: editingId,
        name: formData.name,
        username: formData.username,
        email: formData.email,
        whatsapp: formData.whatsapp,
      };
      updateUser(editingId, updatedUser);
      setEditingId(null);
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name,
        username: formData.username,
        email: formData.email,
        whatsapp: formData.whatsapp,
      };
      addUser(newUser);
    }

    setFormData({
      name: '',
      username: '',
      email: '',
      whatsapp: '',
    });
    setShowForm(false);
  };

  const handleEdit = (user: User) => {
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      whatsapp: user.whatsapp,
    });
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja deletar este usuário?')) {
      deleteUser(id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      username: '',
      email: '',
      whatsapp: '',
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
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nome Completo
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

              {/* Nickname/Username */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Apelido
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="seu.apelido"
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

              {/* Phone/WhatsApp */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Telefone
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gold">Foto</th>
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
                  <td className="px-6 py-4 text-sm">
                    <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center overflow-hidden">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-gold">{user.name.charAt(0)}</span>
                      )}
                    </div>
                  </td>
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
