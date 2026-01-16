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

// Smartflo services
export { smartfloService } from './smartfloService';

// Client services
export {
  clientService,
  type ClientData,
} from './clientService';

// Client Profile services
export {
  clientProfileService,
  type ClientProfileData,
  type MutualFund,
  type Stock,
  type Goal,
  type SIP,
  type MutualFundDetail,
  type PortfolioDetail,
  type Transaction,
  type StockOrder,
} from './clientProfileService';

// Client Document services
export {
  clientDocumentService,
  type EmailReportRequest,
  type EmailReportResponse,
} from './clientDocumentService';

// AUM Trend services
export {
  getAumTrendData,
  type AumTrendDataPoint,
  type AumTrendResponse,
} from './aumTrendService';

// XIRR services
export {
  xirrService,
  XIRRService,
  type XIRRData,
  type XIRRTableData,
} from './xirrService';

// SIP services
export {
  getLatestSips,
  type LatestSipOrder,
  type LatestSipGroup,
  type LatestSipsResponse,
} from './sipService';

// SIP MF Transaction services
export {
  getSipMfTransactions,
  type SipMfTransaction,
  type SipOrder,
  type UserInfo,
  type ReferredUserInfo,
  type SipMfTransactionParams,
  type SipMfTransactionResponse,
} from './sipMfTransactionService';
