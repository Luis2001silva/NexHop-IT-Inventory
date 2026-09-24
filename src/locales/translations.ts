
export interface Translation {
  [key: string]: string;
}

export interface TranslationDictionary {
  [language: string]: Translation;
}

export const translations: TranslationDictionary = {
  "pt": {
    // General
    "appTitle": "nexthop — Operações de TI",
    "darkMode": "Modo Escuro",
    "lightMode": "Modo Claro",
    "loading": "Carregando...",
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "edit": "Editar",
    "add": "Adicionar",
    "search": "Pesquisar",
    "filter": "Filtrar",
    "logout": "Terminar Sessão",
    "login": "Iniciar Sessão",
    "email": "Email",
    "password": "Palavra-passe",
    
    // Navigation
    "dashboard": "Painel Principal",
    "equipment": "Equipamentos",
    "invoices": "Faturas",
    "settings": "Definições",
    "users": "Utilizadores",
    "hierarchy": "Hierarquia",
    "warranties": "Garantias",
    "reservations": "Reservas",
    "documents": "Documentos",
    "alerts": "Alertas",
    "reports": "Relatórios",
    "logs": "Logs",
    "profile": "Perfil",
    "support": "Suporte",

    // Equipment
    "equipmentList": "Lista de Equipamentos",
    "addEquipment": "Adicionar Equipamento",
    "editEquipment": "Editar Equipamento",
    "brand": "Marca",
    "model": "Modelo",
    "serialNumber": "Número de Série",
    "assignedUser": "Utilizador Atribuído",
    "status": "Estado",
    "location": "Localização",
    "acquisitionDate": "Data de Aquisição",
    "equipmentDetails": "Detalhes do Equipamento",
    "assignmentDetails": "Detalhes de Atribuição",
    
    // Status options
    "statusActive": "Ativo",
    "statusInactive": "Inativo",
    "statusMaintenance": "Em Manutenção",
    "statusDecommissioned": "Descontinuado",
    
    // Invoices
    "invoiceList": "Lista de Faturas",
    "addInvoice": "Adicionar Fatura",
    "editInvoice": "Editar Fatura",
    "invoiceNumber": "Número da Fatura",
    "invoiceDate": "Data da Fatura",
    "supplier": "Fornecedor",
    "totalAmount": "Valor Total",
    "uploadInvoice": "Carregar Fatura",
    "viewInvoice": "Ver Fatura",
    "downloadInvoice": "Descarregar Fatura",
    "invoiceDetails": "Detalhes da Fatura",
    
    // Login/Auth
    "loginTitle": "Iniciar Sessão",
    "loginSubtitle": "Entre na sua conta para continuar",
    "forgotPassword": "Esqueceu a palavra-passe?",
    "rememberMe": "Lembrar-me",
    "invalidCredentials": "Credenciais inválidas",
    
    // User types
    "admin": "Administrador",
    "viewer": "Visualizador",
    
    // Messages
    "welcomeMessage": "Bem-vindo ao sistema de gestão de equipamentos",
    "noEquipmentFound": "Nenhum equipamento encontrado",
    "noInvoicesFound": "Nenhuma fatura encontrada",
    "equipmentSaved": "Equipamento guardado com sucesso",
    "equipmentDeleted": "Equipamento eliminado com sucesso",
    "invoiceSaved": "Fatura guardada com sucesso",
    "invoiceDeleted": "Fatura eliminada com sucesso",
    "confirmDelete": "Tem certeza que deseja eliminar?",
    "accessDenied": "Acesso negado. Não tem permissões suficientes.",
    
    // Settings
    "language": "Idioma",
    "theme": "Tema",
    "portuguese": "Português",
    "english": "Inglês",
  },
  "en": {
    // General
    "appTitle": "nexthop — IT Operations",
    "darkMode": "Dark Mode",
    "lightMode": "Light Mode",
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "add": "Add",
    "search": "Search",
    "filter": "Filter",
    "logout": "Log Out",
    "login": "Log In",
    "email": "Email",
    "password": "Password",
    
    // Navigation
    "dashboard": "Dashboard",
    "equipment": "Equipment",
    "invoices": "Invoices",
    "settings": "Settings",
    "users": "Users",
    "hierarchy": "Hierarchy",
    "warranties": "Warranties",
    "reservations": "Reservations",
    "documents": "Documents",
    "alerts": "Alerts",
    "reports": "Reports",
    "logs": "Logs",
    "profile": "Profile",
    "support": "Support",

    // Equipment
    "equipmentList": "Equipment List",
    "addEquipment": "Add Equipment",
    "editEquipment": "Edit Equipment",
    "brand": "Brand",
    "model": "Model",
    "serialNumber": "Serial Number",
    "assignedUser": "Assigned User",
    "status": "Status",
    "location": "Location",
    "acquisitionDate": "Acquisition Date",
    "equipmentDetails": "Equipment Details",
    "assignmentDetails": "Assignment Details",
    
    // Status options
    "statusActive": "Active",
    "statusInactive": "Inactive",
    "statusMaintenance": "Under Maintenance",
    "statusDecommissioned": "Decommissioned",
    
    // Invoices
    "invoiceList": "Invoice List",
    "addInvoice": "Add Invoice",
    "editInvoice": "Edit Invoice",
    "invoiceNumber": "Invoice Number",
    "invoiceDate": "Invoice Date",
    "supplier": "Supplier",
    "totalAmount": "Total Amount",
    "uploadInvoice": "Upload Invoice",
    "viewInvoice": "View Invoice",
    "downloadInvoice": "Download Invoice",
    "invoiceDetails": "Invoice Details",
    
    // Login/Auth
    "loginTitle": "Login",
    "loginSubtitle": "Sign in to your account to continue",
    "forgotPassword": "Forgot password?",
    "rememberMe": "Remember me",
    "invalidCredentials": "Invalid credentials",
    
    // User types
    "admin": "Administrator",
    "viewer": "Viewer",
    
    // Messages
    "welcomeMessage": "Welcome to the nexthop — IT Operations System",
    "noEquipmentFound": "No equipment found",
    "noInvoicesFound": "No invoices found",
    "equipmentSaved": "Equipment saved successfully",
    "equipmentDeleted": "Equipment deleted successfully",
    "invoiceSaved": "Invoice saved successfully",
    "invoiceDeleted": "Invoice deleted successfully",
    "confirmDelete": "Are you sure you want to delete?",
    "accessDenied": "Access denied. You don't have sufficient permissions.",
    
    // Settings
    "language": "Language",
    "theme": "Theme",
    "portuguese": "Portuguese",
    "english": "English",
  }
};
