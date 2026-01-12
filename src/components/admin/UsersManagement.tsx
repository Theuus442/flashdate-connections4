import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2, Plus, Upload, X, UserCircle2 } from 'lucide-react';
import { useUsers, type User } from '@/context/UsersContext';
import { useToast } from '@/hooks/use-toast';

/**
 * Helper to check if email or username already exists
 */
function checkDuplicateField(users: User[], email: string, username: string, excludeId?: string): { isDuplicate: boolean; field: string; existingUser?: User } {
  for (const user of users) {
    // If we're editing, exclude the current user
    if (excludeId && user.id === excludeId) continue;

    if (user.email === email && user.username === username) {
      return { isDuplicate: true, field: 'email e apelido', existingUser: user };
    } else if (user.email === email) {
      return { isDuplicate: true, field: 'email', existingUser: user };
    } else if (user.username === username) {
      return { isDuplicate: true, field: 'apelido', existingUser: user };
    }
  }
  return { isDuplicate: false, field: '' };
}

export const UsersManagement = () => {
  const { users, addUser, updateUser, deleteUser, deleteAllByRole } = useUsers();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    whatsapp: '',
    gender: 'Outro' as 'M' | 'F' | 'Outro',
    password: '',
    role: 'client' as 'admin' | 'client',
  });

  const [selectedImageFile, setSelectedImageFile] = useState<File | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleteRole, setBulkDeleteRole] = useState<'admin' | 'client'>('client');
  const [bulkDeleteConfirmCount, setBulkDeleteConfirmCount] = useState(0);

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');

    // Limit to 11 digits (Brazilian phone format)
    const limited = cleaned.slice(0, 11);

    // Format: (XX) XXXXX-XXXX or (XX) XXXX-XXX
    if (limited.length === 0) return '';
    if (limited.length <= 2) return `(${limited}`;
    if (limited.length <= 7) return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;

    // Apply phone formatting if it's the whatsapp field
    if (name === 'whatsapp') {
      value = formatPhoneNumber(value);
    }

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

    // Validate required fields
    if (!formData.name || !formData.username || !formData.email || !formData.whatsapp) {
      console.warn('[UsersManagement] Validation failed - missing fields:', {
        name: !!formData.name,
        username: !!formData.username,
        email: !!formData.email,
        whatsapp: !!formData.whatsapp,
        role: !!formData.role,
      });
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos obrigatórios (Nome, Apelido, Email, Telefone)',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    // Validate no duplicates in email or username
    const duplicateCheck = checkDuplicateField(users, formData.email, formData.username, editingId);
    if (duplicateCheck.isDuplicate) {
      console.warn('[UsersManagement] Duplicate field detected:', duplicateCheck);
      toast({
        title: 'Erro',
        description: `Este ${duplicateCheck.field} já está registrado no sistema. Escolha um ${duplicateCheck.field} único.`,
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    // Password is required when creating new user
    if (!editingId && !formData.password) {
      console.warn('[UsersManagement] Password required for new user');
      toast({
        title: 'Erro',
        description: 'Senha é obrigatória para novos usuários',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      if (editingId) {
        console.log('[UsersManagement] Updating user:', editingId);
        // Only include password if it's not empty
        const updates: any = {
          name: formData.name,
          username: formData.username,
          email: formData.email,
          whatsapp: formData.whatsapp,
          gender: formData.gender,
          role: formData.role,
        };

        if (formData.password && formData.password.trim()) {
          updates.password = formData.password;
        }

        const result = await updateUser(editingId, updates, selectedImageFile);

        if (result.data) {
          toast({
            title: 'Sucesso',
            description: 'Usuário atualizado com sucesso!',
          });
          setFormData({
            name: '',
            username: '',
            email: '',
            whatsapp: '',
            gender: 'Outro',
            password: '',
            role: 'client',
          });
          setSelectedImageFile(undefined);
          setImagePreview(undefined);
          setEditingId(null);
          setShowForm(false);
        } else {
          const errorMsg = result.error || 'Falha ao atualizar usuário';

          // User not found is a specific error to handle
          if (errorMsg.includes('not found')) {
            toast({
              title: 'Erro',
              description: 'Usuário não encontrado no banco de dados. Pode ter sido deletado. Recarregue a página.',
              variant: 'destructive',
            });
            // Refresh the users list to sync with DB
            setShowForm(false);
            setEditingId(null);
          } else {
            toast({
              title: 'Erro',
              description: errorMsg,
              variant: 'destructive',
            });
          }
        }
      } else {
        console.log('[UsersManagement] Creating new user with data:', formData);
        const result = await addUser({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          whatsapp: formData.whatsapp,
          gender: formData.gender,
          password: formData.password.trim(),
          role: formData.role,
        }, selectedImageFile);

        console.log('[UsersManagement] Add user result:', result);
        if (result.data) {
          toast({
            title: 'Sucesso',
            description: 'Usuário cadastrado com sucesso!',
          });
          setFormData({
            name: '',
            username: '',
            email: '',
            whatsapp: '',
            gender: 'Outro',
            password: '',
            role: 'client',
          });
          setSelectedImageFile(undefined);
          setImagePreview(undefined);
          setShowForm(false);
        } else {
          console.error('[UsersManagement] Failed to add user:', result.error);
          toast({
            title: 'Erro',
            description: result.error || 'Falha ao cadastrar usuário',
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
        password: '',
        role: 'client',
      });
      setSelectedImageFile(undefined);
      setImagePreview(undefined);
      setShowForm(false);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : (typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error));
      console.error('[UsersManagement] Error submitting form:', errorMessage);
      toast({
        title: 'Erro',
        description: `Erro ao processar formulário: ${errorMessage || 'Desconhecido'}`,
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
      password: '', // Leave empty for optional password change on edit
      role: user.role || 'client',
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
      password: '',
      role: 'client',
    });
    setSelectedImageFile(undefined);
    setImagePreview(undefined);
  };

  const handleOpenBulkDeleteModal = (role: 'admin' | 'client') => {
    const countToDelete = users.filter(u => u.role === role).length;
    if (countToDelete === 0) {
      toast({
        title: 'Nenhum usuário',
        description: `Não há ${role === 'admin' ? 'administradores' : 'clientes'} para deletar`,
        variant: 'destructive',
      });
      return;
    }
    setBulkDeleteRole(role);
    setBulkDeleteConfirmCount(countToDelete);
    setShowBulkDeleteModal(true);
  };

  const handleConfirmBulkDelete = async () => {
    setIsLoading(true);
    try {
      console.log('[UsersManagement] Starting bulk delete for role:', bulkDeleteRole);
      const result = await deleteAllByRole(bulkDeleteRole);

      console.log('[UsersManagement] Bulk delete result:', result);

      if (result.error) {
        const errorMsg = result.error instanceof Error
          ? result.error.message
          : (typeof result.error === 'object' ? JSON.stringify(result.error) : String(result.error));
        console.error('[UsersManagement] Bulk delete error:', errorMsg);
        toast({
          title: 'Erro',
          description: `Erro ao deletar ${bulkDeleteRole === 'admin' ? 'administradores' : 'clientes'}: ${errorMsg}`,
          variant: 'destructive',
        });
      } else if (result.count === 0) {
        console.warn('[UsersManagement] No users were deleted');
        toast({
          title: 'Nenhum usuário deletado',
          description: `Não foi encontrado nenhum ${bulkDeleteRole === 'admin' ? 'administrador' : 'cliente'} para deletar`,
          variant: 'destructive',
        });
      } else {
        console.log('[UsersManagement] Successfully deleted', result.count, 'users');
        toast({
          title: 'Sucesso',
          description: `${result.count} ${bulkDeleteRole === 'admin' ? 'administrador(es)' : 'cliente(s)'} deletado(s) com sucesso!`,
        });
        setShowBulkDeleteModal(false);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[UsersManagement] Error during bulk delete:', errorMsg);
      toast({
        title: 'Erro',
        description: `Erro ao deletar usuários: ${errorMsg}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Button
                variant="destructive"
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Trash2 size={20} />
                Deletar em Massa
              </Button>
              <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <button
                  onClick={() => handleOpenBulkDeleteModal('client')}
                  disabled={isLoading || users.filter(u => u.role === 'client').length === 0}
                  className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-muted/50 first:rounded-t-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Deletar Todos Clientes ({users.filter(u => u.role === 'client').length})
                </button>
                <div className="border-t border-border" />
                <button
                  onClick={() => handleOpenBulkDeleteModal('admin')}
                  disabled={isLoading || users.filter(u => u.role === 'admin').length === 0}
                  className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-muted/50 last:rounded-b-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Deletar Todos Admins ({users.filter(u => u.role === 'admin').length})
                </button>
              </div>
            </div>
            <Button
              variant="gold"
              onClick={() => setShowForm(true)}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Plus size={20} />
              Novo Usuário
            </Button>
          </div>
        )}
      </div>

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-sm mx-4">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
              Confirmação de Exclusão em Massa
            </h2>
            <p className="text-muted-foreground mb-6">
              Você está prestes a deletar <strong>{bulkDeleteConfirmCount}</strong> {bulkDeleteRole === 'admin' ? 'administrador(es)' : 'cliente(s)'}.
              <br /><br />
              <span className="text-destructive font-semibold">Esta ação é irreversível!</span>
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmBulkDelete}
                disabled={isLoading}
              >
                {isLoading ? 'Deletando...' : 'Confirmar Exclusão'}
              </Button>
            </div>
          </div>
        </div>
      )}

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

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Senha {editingId ? '(Opcional)' : '(Obrigatória)'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={editingId ? 'Deixe em branco para manter a senha atual' : 'Insira uma senha segura'}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cargo
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'client' }))}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                >
                  <option value="client">Cliente</option>
                  <option value="admin">Administrador</option>
                </select>
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gold">Cargo</th>
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
                          key={`img-${user.id}-${user.profileImage}`}
                          src={user.profileImage}
                          alt={user.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Show initial instead of broken image
                            (e.target as HTMLImageElement).replaceWith(
                              Object.assign(document.createElement('span'), {
                                className: 'text-lg font-bold text-gold',
                                textContent: user.name.charAt(0)
                              })
                            );
                          }}
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
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'admin'
                        ? 'bg-gold/20 text-gold'
                        : 'bg-secondary/20 text-secondary'
                    }`}>
                      {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                    </span>
                  </td>
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
