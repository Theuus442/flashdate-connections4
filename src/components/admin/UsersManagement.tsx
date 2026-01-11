import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2, Plus, Upload, X, UserCircle2 } from 'lucide-react';
import { useUsers, type User } from '@/context/UsersContext';
import { useToast } from '@/hooks/use-toast';

export const UsersManagement = () => {
  const { users, addUser, updateUser, deleteUser } = useUsers();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    whatsapp: '',
    gender: 'Outro' as 'M' | 'F' | 'Outro',
    password: '',
  });

  const [selectedImageFile, setSelectedImageFile] = useState<File | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setImagePreview(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImageFile(undefined);
    setImagePreview(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[UsersManagement] Form submitted with data:', formData);
    setIsLoading(true);

    if (!formData.name || !formData.username || !formData.email || !formData.whatsapp || !formData.password) {
      console.warn('[UsersManagement] Validation failed - missing fields:', {
        name: !!formData.name,
        username: !!formData.username,
        email: !!formData.email,
        whatsapp: !!formData.whatsapp,
        password: !!formData.password,
      });
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos (Nome, Apelido, Email, Telefone, Senha)',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      if (editingId) {
        console.log('[UsersManagement] Updating user:', editingId);
        const result = await updateUser(editingId, {
          name: formData.name,
          username: formData.username,
          email: formData.email,
          whatsapp: formData.whatsapp,
          gender: formData.gender,
          password: formData.password,
          role: 'client',
        }, selectedImageFile);

        console.log('[UsersManagement] Update result:', result);
        if (result) {
          toast({
            title: 'Sucesso',
            description: 'Usuário atualizado com sucesso!',
          });
          setEditingId(null);
        } else {
          toast({
            title: 'Erro',
            description: 'Falha ao atualizar usuário',
            variant: 'destructive',
          });
        }
      } else {
        console.log('[UsersManagement] Creating new user with data:', formData);
        const result = await addUser({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          whatsapp: formData.whatsapp,
          gender: formData.gender,
          role: 'client',
        }, selectedImageFile);

        console.log('[UsersManagement] Add user result:', result);
        if (result) {
          toast({
            title: 'Sucesso',
            description: 'Usuário cadastrado com sucesso!',
          });
        } else {
          console.error('[UsersManagement] Failed to add user - no result returned');
          toast({
            title: 'Erro',
            description: 'Falha ao cadastrar usuário - verifique o console para detalhes',
            variant: 'destructive',
          });
        }
      }

      setFormData({
        name: '',
        username: '',
        email: '',
        whatsapp: '',
        gender: 'Outro',
      });
      setSelectedImageFile(undefined);
      setImagePreview(undefined);
      setShowForm(false);
    } catch (error) {
      console.error('[UsersManagement] Error submitting form:', error);
      toast({
        title: 'Erro',
        description: `Erro ao processar formulário: ${error instanceof Error ? error.message : 'Desconhecido'}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      whatsapp: user.whatsapp,
      gender: user.gender,
    });
    setImagePreview(user.profileImage);
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar este usuário?')) {
      setIsLoading(true);
      try {
        const result = await deleteUser(id);
        if (result) {
          toast({
            title: 'Sucesso',
            description: 'Usuário deletado com sucesso!',
          });
        } else {
          toast({
            title: 'Erro',
            description: 'Falha ao deletar usuário',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao deletar usuário',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
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
      gender: 'Outro',
    });
    setSelectedImageFile(undefined);
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
            disabled={isLoading}
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
                        <UserCircle2 size={64} className="text-gold/30 mb-2 mx-auto" />
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

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Gênero
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'M' | 'F' | 'Outro' }))}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                >
                  <option value="Outro">Outro</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                Cancelar
              </Button>
              <Button variant="gold" type="submit" disabled={isLoading}>
                {isLoading ? (editingId ? 'Atualizando...' : 'Cadastrando...') : (editingId ? 'Atualizar' : 'Cadastrar')}
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gold">Apelido</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gold">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gold">Telefone</th>
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
                  <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{user.whatsapp}</td>
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
