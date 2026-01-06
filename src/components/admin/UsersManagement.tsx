import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2, Plus, Upload, X } from 'lucide-react';
import { useUsers, type User } from '@/context/UsersContext';

export const UsersManagement = () => {
  const { users, addUser, updateUser, deleteUser } = useUsers();

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    whatsapp: '',
    profession: '',
    username: '',
    password: '',
    profileImage: undefined as string | undefined,
  });

  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setImagePreview(imageUrl);
        setFormData(prev => ({
          ...prev,
          profileImage: imageUrl,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(undefined);
    setFormData(prev => ({
      ...prev,
      profileImage: undefined,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.age || !formData.email || !formData.whatsapp || !formData.profession || !formData.username || !formData.password) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    if (editingId) {
      const updatedUser: User = {
        id: editingId,
        name: formData.name,
        age: parseInt(formData.age),
        email: formData.email,
        whatsapp: formData.whatsapp,
        profession: formData.profession,
        username: formData.username,
        password: formData.password,
        profileImage: formData.profileImage,
      };
      updateUser(editingId, updatedUser);
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
        profileImage: formData.profileImage,
      };
      addUser(newUser);
    }

    setFormData({
      name: '',
      age: '',
      email: '',
      whatsapp: '',
      profession: '',
      username: '',
      password: '',
      profileImage: undefined,
    });
    setImagePreview(undefined);
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
      profileImage: user.profileImage,
    });
    setImagePreview(user.profileImage);
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
      age: '',
      email: '',
      whatsapp: '',
      profession: '',
      username: '',
      password: '',
      profileImage: undefined,
    });
    setImagePreview(undefined);
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

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Image Upload Section */}
            <div className="space-y-4 pb-6 border-b border-border">
              <label className="block text-sm font-medium text-foreground">Foto de Perfil</label>
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  {imagePreview ? (
                    <div className="relative w-full h-48 rounded-lg border border-border overflow-hidden bg-muted/30 flex items-center justify-center">
                      <img
                        src={imagePreview}
                        alt="Prévia do perfil"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-destructive/90 hover:bg-destructive text-white p-2 rounded-lg transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-48 rounded-lg border-2 border-dashed border-border bg-muted/30 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-gold/30 mb-2">👤</div>
                        <p className="text-sm text-muted-foreground">Nenhuma imagem selecionada</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="md:w-64 flex flex-col justify-center">
                  <label className="flex items-center justify-center w-full h-32 px-4 py-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-gold transition-colors bg-muted/30">
                    <div className="flex flex-col items-center justify-center text-center">
                      <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium text-foreground">Carregar foto</span>
                      <span className="text-xs text-muted-foreground">PNG, JPG até 5MB</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
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
