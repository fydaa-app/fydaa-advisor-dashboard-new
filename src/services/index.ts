// Auth services
export {
  login,
  forgotPassword,
  resetPasswordWithToken,
  validateResetToken,
  type LoginResponse,
  type ApiResponse as AuthApiResponse,
} from './authService';

// Dashboard services
export {
  getAdvisorCardsData,
  getCardsData,
  getCardsDataMf,
  type AdvisorCardsDataResponse,
  type CardData,
  type TodaySalesData,
} from './dashboardService';

// Transaction services
export {
  getTransactions,
  clearTransactionsCache,
  type Transaction,
  type FetchTransactionsParams,
  type FetchTransactionsResponse,
} from './transactionService';

// Portfolio services
export {
  getPortfolios,
  clearPortfoliosCache,
  type Portfolio,
  type FetchPortfoliosParams,
  type FetchPortfoliosResponse,
} from './portfolioService';

// Admin services
export {
  getDesignations,
  getEmployees,
  resetPassword,
  type DesignationItem,
  type EmployeeItem,
  type DesignationOption,
  type EmployeeOption,
  type ApiResponse as AdminApiResponse,
} from './adminService';

// Advisor services
export {
  advisorService,
  type AdvisorData,
  type ApiResponse as AdvisorApiResponse,
} from './advisorService';

// Client services
export {
  clientService,
  type ClientData,
} from './clientService';

// Client Profile services
export {
  clientProfileService,
  type ClientProfileData,
} from './clientProfileService';

// Client Document services
export {
  clientDocumentService,
  type EmailReportRequest,
  type EmailReportResponse,
} from './clientDocumentService'