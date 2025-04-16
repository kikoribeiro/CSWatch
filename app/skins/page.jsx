'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Adicione esta função para validar URLs antes do componente
const isValidImageURL = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
};

export default function SkinsPage() {
  // Estados para gerir os dados e a interatividade da página
  const [skins, setSkins] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para gerenciar modais de CRUD
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentSkin, setCurrentSkin] = useState(null);

  // Estados para o formulário de criação/edição
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    price: 0,
    category: 'Normal',
    rarity: 'Restricted',
  });

  // Opções de raridade para o filtro de dropdown
  const rarityOptions = [
    { id: 'all', name: 'Todas as Raridades' },
    { id: 'Restricted', name: 'Restricted' },
    { id: 'Classified', name: 'Classified' },
    { id: 'Covert', name: 'Covert' },
    { id: 'Contraband', name: 'Contraband' },
  ];

  // Opções de categoria para o filtro de dropdown
  const categoryOptions = [
    { id: 'all', name: 'Todas as Categorias' },
    { id: 'Normal', name: 'Normal' },
    { id: 'StatTrak™', name: 'StatTrak™' },
    { id: 'Souvenir', name: 'Souvenir' },
    { id: '★', name: '★ (Faca)' },
    { id: '★ StatTrak™', name: '★ StatTrak™' },
  ];

  // Hook de efeito para carregar os dados quando a página carrega ou os filtros mudam
  useEffect(() => {
    async function fetchSkins() {
      try {
        setLoading(true);
        setError(null);

        // Constrói o URL da API com parâmetros da consulta baseada nos filtros
        let apiUrl = '/api/rest/skins';
        const params = new URLSearchParams();

        // Adiciona parâmetros de filtro se existirem
        if (searchQuery) params.append('name', searchQuery);
        if (selectedRarity && selectedRarity !== 'all') params.append('rarity', selectedRarity);
        if (selectedCategory && selectedCategory !== 'all')
          params.append('category', selectedCategory);

        const queryString = params.toString();
        if (queryString) {
          apiUrl += `?${queryString}`;
        }

        // Faz a chamada à API
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch skins: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API response:', data);

        // Verifica erros
        if (data && data.error) {
          throw new Error(data.error);
        }

        // Processa os dados recebidos
        if (data && Array.isArray(data.data)) {
          setSkins(data.data);
        } else if (data && Array.isArray(data)) {
          setSkins(data);
        } else {
          throw new Error('Invalid data format received from API');
        }
      } catch (err) {
        console.error('Error fetching skins:', err);
        setError(err.message);
        setSkins([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSkins();
  }, [searchQuery, selectedRarity, selectedCategory]); // Dependências que acionam o recarregamento

  // Filtra as skins baseada na pesquisa
  const filteredSkins = Array.isArray(skins)
    ? skins.filter(
        (skin) => skin && skin.name && skin.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Funções para lidar com mudanças nos filtros de dropdown
  const handleRarityChange = (value) => {
    setSelectedRarity(value);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  // Funções para gerenciar o CRUD
  const openCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      price: 0,
      category: 'Normal',
      rarity: 'Restricted',
    });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (skin) => {
    setCurrentSkin(skin);
    setFormData({
      name: skin.name || '',
      description: skin.description || '',
      image: skin.image || '',
      price: skin.price || 0,
      category: skin.category || 'Normal',
      rarity: skin.rarity?.id || 'Restricted',
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (skin) => {
    setCurrentSkin(skin);
    setIsDeleteModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateSkin = async () => {
    try {
      setLoading(true);

      // Formatação dos dados para a API
      const rarityObject = {
        id: formData.rarity,
        name: rarityOptions.find((r) => r.id === formData.rarity)?.name || formData.rarity,
        color: getRarityColor(formData.rarity),
      };

      const skinData = {
        ...formData,
        rarity: rarityObject,
      };

      // Chamada da API para criar a skin
      const response = await fetch('/api/rest/skins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(skinData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create skin: ${response.status}`);
      }

      const data = await response.json();

      // Atualiza a lista de skins com a nova skin
      setSkins((prev) => [...prev, data]);

      // Fecha o modal e mostra mensagem de sucesso
      setIsCreateModalOpen(false);

      toast.success('Skin criada com sucesso!', {
        description: `${formData.name} foi adicionada à coleção.`,
      });
    } catch (err) {
      console.error('Error creating skin:', err);

      toast.error('Erro ao criar skin', {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSkin = async () => {
    if (!currentSkin?.id) return;

    try {
      setLoading(true);

      // Dados mínimos para teste
      const skinData = {
        name: formData.name,
      };

      const response = await fetch(`/api/rest/skins/${currentSkin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(skinData),
      });

      // Log completo da resposta para diagnóstico
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        throw new Error(`Failed to update skin: ${response.status}`);
      }

      const data = JSON.parse(responseText);

      // Atualiza a lista de skins com os dados atualizados
      setSkins((prev) => prev.map((skin) => (skin.id === currentSkin.id ? data : skin)));

      setIsEditModalOpen(false);
      toast.success('Skin atualizada com sucesso!');
    } catch (err) {
      console.error('Error updating skin:', err);
      toast.error('Erro ao atualizar skin', {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkin = async () => {
    if (!currentSkin?.id) {
      toast.error('Não foi possível excluir: ID da skin não encontrado');
      return;
    }

    try {
      setLoading(true);

      console.log(`Tentando excluir skin com ID: ${currentSkin.id}`);

      // Chamada da API para deletar a skin
      const response = await fetch(`/api/rest/skins/${currentSkin.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        // Tentar analisar o texto como JSON para obter detalhes do erro
        let errorDetail = responseText;
        try {
          const errorJson = JSON.parse(responseText);
          errorDetail = errorJson.error || errorJson.details || responseText;
        } catch (e) {
          // Manter o texto da resposta se não for JSON
        }
        throw new Error(`Failed to delete skin: ${response.status} - ${errorDetail}`);
      }

      // Tentar analisar a resposta como JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.log('Resposta não é JSON válido, usando texto puro');
      }

      console.log('Delete successful, removing from UI');

      // Atualiza a lista de skins removendo a skin deletada
      setSkins((prev) => prev.filter((skin) => skin.id !== currentSkin.id));

      // Fecha o modal e mostra mensagem de sucesso
      setIsDeleteModalOpen(false);

      toast.success('Skin removida com sucesso!', {
        description: `${currentSkin.name} foi removida da coleção.`,
      });
    } catch (err) {
      console.error('Error deleting skin:', err);

      toast.error('Erro ao remover skin', {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para obter a cor baseada na raridade
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Restricted':
        return '#0073ff';
      case 'Classified':
        return '#d940ff';
      case 'Covert':
        return '#eb4b4b';
      case 'Contraband':
        return '#ffae39';
      default:
        return '#0073ff';
    }
  };

  // Adicione esta função dentro do seu componente SkinsPage,
  // antes do return statement
  const handleExportJSON = () => {
    try {
      // Verifica se há skins para exportar
      if (!filteredSkins || filteredSkins.length === 0) {
        toast.error('Não há skins para exportar');
        return;
      }

      // Prepara os dados para exportação
      const dataToExport = JSON.stringify(filteredSkins, null, 2);

      // Cria um blob e um link para download
      const blob = new Blob([dataToExport], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Cria um link de download temporário
      const link = document.createElement('a');
      link.href = url;
      link.download = `cswatch-skins-export-${new Date().toISOString().slice(0, 10)}.json`;

      // Adiciona o link ao documento, clica nele e remove-o
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpa o URL object
      URL.revokeObjectURL(url);

      toast.success('JSON exportado com sucesso!', {
        description: `${filteredSkins.length} skins foram exportadas.`,
      });
    } catch (error) {
      console.error('Erro ao exportar JSON:', error);
      toast.error('Erro ao exportar JSON', {
        description: error.message,
      });
    }
  };

  return (
    <>
      <main className="flex-1 overflow-auto p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">CS2 Skins</h1>
            <div className="flex space-x-2">
              <Button
                onClick={handleExportJSON}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" 
                  />
                </svg>
                Exportar JSON
              </Button>
              <Button
                onClick={openCreateModal}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Plus className="mr-1 h-5 w-5" /> Adicionar Skin
              </Button>
            </div>
          </div>
          <Separator className="my-4" />
          {/*Secção de filtros */}
          <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Procura skins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={selectedRarity} onValueChange={handleRarityChange}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Raridade" />
              </SelectTrigger>
              <SelectContent>
                {rarityOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Secção de loading */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <Card key={`skeleton-${index}`}>
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {/* Secção de skins */}
          {!loading && !error && filteredSkins.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredSkins.map((skin, index) => (
                <Card
                  key={skin.id || `skin-${index}`}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48 bg-accent">
                    {skin.image && isValidImageURL(skin.image) ? (
                      <Image
                        src={skin.image}
                        alt={skin.name || 'Skin sem nome'}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        onError={() => {
                          console.log(`Erro ao carregar imagem: ${skin.image}`);
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-muted-foreground text-sm">Sem imagem disponível</div>
                      </div>
                    )}

                    {/* Botões de ação CRUD */}
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 bg-white/80 hover:bg-white"
                        onClick={() => openEditModal(skin)}
                      >
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 bg-white/80 hover:bg-white"
                        onClick={() => openDeleteModal(skin)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-medium text-lg mb-2 line-clamp-2">
                      {skin.name || 'Skin sem nome'}
                    </h3>

                    <div className="flex items-center justify-between mt-2">
                      {skin.rarity && skin.rarity.name && (
                        <Badge
                          variant="outline"
                          style={{
                            backgroundColor: skin.rarity.color
                              ? `${skin.rarity.color}15`
                              : undefined,
                            color: skin.rarity.color || undefined,
                            borderColor: skin.rarity.color || undefined,
                          }}
                        >
                          {skin.rarity.name}
                        </Badge>
                      )}

                      {typeof skin.price === 'number' && (
                        <span className="text-sm text-muted-foreground">
                          €{skin.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {filteredSkins.length === 0 && !loading && !error && (
            <div className="text-center py-10">
              <p className="text-muted-foreground text-lg">
                Nenhuma skin encontrada com essa pesquisa.
              </p>
            </div>
          )}
        </div>

        {/* Modal para criar nova skin */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Skin</DialogTitle>
              <DialogDescription>
                Complete os campos abaixo para adicionar uma nova skin à coleção.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="AK-47 | Asiimov"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Uma breve descrição da skin..."
                  className="col-span-3"
                />
              </div>
              {/* <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">
                  URL da Imagem
                </Label>
                <Input
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://exemplo.com/imagem.png"
                  className="col-span-3"
                />
              </div> */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Preço (€)
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Categoria
                </Label>
                <Select
                  name="category"
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.slice(1).map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rarity" className="text-right">
                  Raridade
                </Label>
                <Select
                  name="rarity"
                  value={formData.rarity}
                  onValueChange={(value) => handleSelectChange('rarity', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione a raridade" />
                  </SelectTrigger>
                  <SelectContent>
                    {rarityOptions.slice(1).map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreateSkin}
                className="bg-green-500 hover:bg-green-600"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal para editar uma skin */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Skin</DialogTitle>
              <DialogDescription>Atualize as informações da skin selecionada.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Descrição
                </Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-image" className="text-right">
                  URL da Imagem
                </Label>
                <Input
                  id="edit-image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">
                  Preço (€)
                </Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Categoria
                </Label>
                <Select
                  name="category"
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.slice(1).map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-rarity" className="text-right">
                  Raridade
                </Label>
                <Select
                  name="rarity"
                  value={formData.rarity}
                  onValueChange={(value) => handleSelectChange('rarity', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione a raridade" />
                  </SelectTrigger>
                  <SelectContent>
                    {rarityOptions.slice(1).map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleEditSkin}
                className="bg-blue-500 hover:bg-blue-600"
                disabled={loading}
              >
                {loading ? 'Atualizando...' : 'Atualizar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de confirmação para deletar uma skin */}
        <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente a skin{' '}
                <span className="font-semibold">{currentSkin?.name}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteSkin} className="bg-red-500 hover:bg-red-600">
                {loading ? 'Excluindo...' : 'Sim, excluir'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
      <Toaster />
    </>
  );
}
