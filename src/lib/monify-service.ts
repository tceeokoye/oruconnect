import axios from "axios";

const MONIFY_API_BASE = process.env.NEXT_PUBLIC_MONIFY_API_URL || "https://api.monify.com.ng/v1";
const MONIFY_SECRET_KEY = process.env.MONIFY_SECRET_KEY;
const MONIFY_PUBLIC_KEY = process.env.NEXT_PUBLIC_MONIFY_PUBLIC_KEY;

export const monifyClient = axios.create({
  baseURL: MONIFY_API_BASE,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${MONIFY_SECRET_KEY}`,
  },
});

export interface InitializePaymentParams {
  amount: number;
  email: string;
  firstName: string;
  lastName: string;
  reference?: string;
  metadata?: Record<string, any>;
  channels?: string[];
  plan?: string;
  subaccount?: string;
}

export interface VerifyPaymentParams {
  reference: string;
}

export interface TransferParams {
  source: "balance" | "authorization";
  reason: string;
  amount: number;
  recipient: string;
  reference: string;
  currency?: string;
}

export const MonifyService = {
  /**
   * Initialize payment on Monify
   */
  async initializePayment(params: InitializePaymentParams) {
    try {
      const response = await monifyClient.post("/transaction/initialize", {
        amount: params.amount * 100, // Convert to kobo
        email: params.email,
        first_name: params.firstName,
        last_name: params.lastName,
        reference: params.reference || `REF_${Date.now()}`,
        metadata: {
          custom_fields: params.metadata,
        },
        channels: params.channels || ["card", "bank", "ussd", "qr"],
      });

      return {
        success: true,
        data: response.data.data,
        accessCode: response.data.data.access_code,
        authorizationUrl: response.data.data.authorization_url,
      };
    } catch (error: any) {
      console.error("Monify initialization error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || "Payment initialization failed",
      };
    }
  },

  /**
   * Verify payment on Monify
   */
  async verifyPayment(reference: string) {
    try {
      const response = await monifyClient.get(
        `/transaction/verify/${reference}`
      );

      const data = response.data.data;
      return {
        success: data.status === "success",
        data: {
          reference: data.reference,
          amount: data.amount / 100, // Convert from kobo to naira
          status: data.status,
          paidAt: data.paid_at,
          customer: data.customer,
          authorization: data.authorization,
        },
      };
    } catch (error: any) {
      console.error("Monify verification error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || "Payment verification failed",
      };
    }
  },

  /**
   * Initiate transfer to recipient
   */
  async initiateTransfer(params: TransferParams) {
    try {
      const response = await monifyClient.post("/transfer", {
        source: params.source,
        reason: params.reason,
        amount: params.amount * 100, // Convert to kobo
        recipient: params.recipient,
        reference: params.reference,
        currency: params.currency || "NGN",
      });

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error("Monify transfer error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || "Transfer failed",
      };
    }
  },

  /**
   * Create subaccount for provider payouts
   */
  async createSubaccount(providerData: {
    businessName: string;
    businessEmail: string;
    accountNumber: string;
    accountName: string;
    bankCode: string;
  }) {
    try {
      const response = await monifyClient.post("/subaccount", {
        business_name: providerData.businessName,
        settlement_bank: providerData.bankCode,
        account_number: providerData.accountNumber,
        business_email: providerData.businessEmail,
        settlement_schedule: "auto",
      });

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error("Monify subaccount error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || "Subaccount creation failed",
      };
    }
  },

  /**
   * List banks for transfer
   */
  async getBanks() {
    try {
      const response = await monifyClient.get("/bank");
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error("Get banks error:", error.response?.data || error.message);
      return {
        success: false,
        error: "Failed to fetch banks",
      };
    }
  },

  /**
   * Resolve account name
   */
  async resolveAccount(accountNumber: string, bankCode: string) {
    try {
      const response = await monifyClient.get(
        `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`
      );

      return {
        success: true,
        accountName: response.data.data.account_name,
      };
    } catch (error: any) {
      console.error("Account resolution error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || "Account resolution failed",
      };
    }
  },

  /**
   * Get transaction status
   */
  async getTransactionStatus(reference: string) {
    try {
      const response = await monifyClient.get(
        `/transaction/verify/${reference}`
      );

      return {
        success: true,
        status: response.data.data.status,
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: "Failed to fetch transaction status",
      };
    }
  },
};

export default MonifyService;
